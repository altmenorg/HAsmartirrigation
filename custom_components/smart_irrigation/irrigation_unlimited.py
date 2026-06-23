"""Irrigation Unlimited integration for Smart Irrigation."""

import datetime
import logging
from typing import Any

import homeassistant.helpers.entity_registry as er
from homeassistant.const import STATE_ON
from homeassistant.core import HomeAssistant

from . import const

_LOGGER = logging.getLogger(__name__)


class IrrigationUnlimitedIntegration:
    """Manages integration with Irrigation Unlimited."""

    def __init__(self, hass: HomeAssistant, coordinator) -> None:
        """Initialize the Irrigation Unlimited integration."""
        self.hass = hass
        self.coordinator = coordinator
        self._iu_entities = {}
        self._sync_enabled = False
        self._entity_prefix = const.CONF_DEFAULT_IU_ENTITY_PREFIX

    async def async_initialize(self) -> None:
        """Initialize the integration."""
        config = await self.coordinator.store.async_get_config()
        self._sync_enabled = config.get(
            const.CONF_IRRIGATION_UNLIMITED_INTEGRATION, False
        )
        self._entity_prefix = config.get(
            const.CONF_IU_ENTITY_PREFIX, const.CONF_DEFAULT_IU_ENTITY_PREFIX
        )

        if self._sync_enabled:
            await self._discover_iu_entities()
            _LOGGER.info(
                "Irrigation Unlimited integration enabled with %d entities",
                len(self._iu_entities),
            )

    async def _discover_iu_entities(self) -> None:
        """Discover Irrigation Unlimited entities."""
        entity_registry = er.async_get(self.hass)

        # Find all entities that match the IU pattern
        self._iu_entities.clear()

        for entity_id in entity_registry.entities:
            if entity_id.startswith(self._entity_prefix):
                # Get additional info about the entity
                state = self.hass.states.get(entity_id)
                if state:
                    self._iu_entities[entity_id] = {
                        "entity_id": entity_id,
                        "friendly_name": state.attributes.get(
                            "friendly_name", entity_id
                        ),
                        "state": state.state,
                        "attributes": dict(state.attributes),
                    }

        _LOGGER.debug("Discovered IU entities: %s", list(self._iu_entities.keys()))

    async def async_sync_zones_to_iu(
        self, zone_ids: list[int] | None = None
    ) -> dict[str, Any]:
        """Sync Smart Irrigation zones to Irrigation Unlimited."""
        if not self._sync_enabled:
            raise ValueError("Irrigation Unlimited integration is not enabled")

        zones = await self.coordinator.store.async_get_zones()
        if zone_ids:
            zones = [z for z in zones if z.get(const.ZONE_ID) in zone_ids]

        sync_results = {"synchronized": [], "skipped": [], "errors": []}

        for zone in zones:
            zone_id = zone.get(const.ZONE_ID)
            zone_name = zone.get(const.ZONE_NAME)
            zone_duration = zone.get(const.ZONE_DURATION, 0)
            zone_state = zone.get(const.ZONE_STATE)

            try:
                # Skip disabled zones
                if zone_state == const.ZONE_STATE_DISABLED:
                    sync_results["skipped"].append(
                        {
                            "zone_id": zone_id,
                            "zone_name": zone_name,
                            "reason": "Zone is disabled",
                        }
                    )
                    continue

                # Find corresponding IU entity
                iu_entity = await self._find_matching_iu_entity(zone)
                if not iu_entity:
                    sync_results["skipped"].append(
                        {
                            "zone_id": zone_id,
                            "zone_name": zone_name,
                            "reason": "No matching Irrigation Unlimited entity found",
                        }
                    )
                    continue

                # Sync zone data
                await self._sync_zone_to_iu_entity(zone, iu_entity)

                sync_results["synchronized"].append(
                    {
                        "zone_id": zone_id,
                        "zone_name": zone_name,
                        "iu_entity": iu_entity["entity_id"],
                        "duration": zone_duration,
                    }
                )

            except Exception as e:
                sync_results["errors"].append(
                    {"zone_id": zone_id, "zone_name": zone_name, "error": str(e)}
                )
                _LOGGER.error("Error syncing zone %s to IU: %s", zone_name, e)

        # Fire sync completed event
        self.hass.bus.fire(
            f"{const.DOMAIN}_{const.EVENT_IU_SYNC_COMPLETED}",
            {
                "synchronized_count": len(sync_results["synchronized"]),
                "skipped_count": len(sync_results["skipped"]),
                "error_count": len(sync_results["errors"]),
                "results": sync_results,
                "timestamp": datetime.datetime.now().isoformat(),
            },
        )

        _LOGGER.info(
            "IU sync completed: %d synced, %d skipped, %d errors",
            len(sync_results["synchronized"]),
            len(sync_results["skipped"]),
            len(sync_results["errors"]),
        )

        return sync_results

    async def _find_matching_iu_entity(
        self, zone: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Find the matching Irrigation Unlimited entity for a zone."""
        zone_name = zone.get(const.ZONE_NAME, "").lower()
        zone_id = zone.get(const.ZONE_ID)

        # Try different matching strategies
        for entity_id, entity_info in self._iu_entities.items():
            entity_name = entity_info.get("friendly_name", "").lower()

            # Strategy 1: Direct name match
            if zone_name in entity_name or entity_name in zone_name:
                return entity_info

            # Strategy 2: Zone ID match in entity name
            if str(zone_id) in entity_name:
                return entity_info

            # Strategy 3: Extract zone number from entity ID
            # e.g., switch.irrigation_unlimited_c1_z2 -> zone 2
            parts = entity_id.split("_")
            for part in parts:
                if part.startswith("z") and part[1:].isdigit():
                    if int(part[1:]) == zone_id:
                        return entity_info

        return None

    async def _sync_zone_to_iu_entity(
        self, zone: dict[str, Any], iu_entity: dict[str, Any]
    ) -> None:
        """Sync a Smart Irrigation zone to an Irrigation Unlimited entity."""
        zone_duration = zone.get(const.ZONE_DURATION, 0)
        iu_entity_id = iu_entity["entity_id"]

        # If zone has duration > 0, trigger IU entity
        if zone_duration > 0:
            await self._trigger_iu_entity(iu_entity_id, zone_duration)
        else:
            # Ensure IU entity is off if no irrigation needed
            await self._ensure_iu_entity_off(iu_entity_id)

    async def _trigger_iu_entity(self, entity_id: str, duration: int) -> None:
        """Trigger an Irrigation Unlimited entity with specific duration."""
        # Check if IU supports duration setting
        # This might vary based on IU version and configuration

        # Method 1: Use IU's manual run service if available
        try:
            await self.hass.services.async_call(
                "irrigation_unlimited",
                "manual_run",
                {
                    "entity_id": entity_id,
                    "time": f"00:{duration // 60:02d}:{duration % 60:02d}",
                },
                blocking=True,
            )
            _LOGGER.debug(
                "Triggered IU entity %s for %d seconds using manual_run",
                entity_id,
                duration,
            )
            return
        except Exception as e:
            _LOGGER.debug("manual_run service not available or failed: %s", e)

        # Method 2: Use standard switch.turn_on
        try:
            await self.hass.services.async_call(
                "switch", "turn_on", {"entity_id": entity_id}, blocking=False
            )
            _LOGGER.debug("Triggered IU entity %s using switch.turn_on", entity_id)
        except Exception as e:
            _LOGGER.error("Failed to trigger IU entity %s: %s", entity_id, e)

    async def _ensure_iu_entity_off(self, entity_id: str) -> None:
        """Ensure an Irrigation Unlimited entity is turned off."""
        try:
            state = self.hass.states.get(entity_id)
            if state and state.state == STATE_ON:
                await self.hass.services.async_call(
                    "switch", "turn_off", {"entity_id": entity_id}, blocking=False
                )
                _LOGGER.debug("Turned off IU entity %s", entity_id)
        except Exception as e:
            _LOGGER.error("Failed to turn off IU entity %s: %s", entity_id, e)

    async def async_get_iu_status(self) -> dict[str, Any]:
        """Get status of Irrigation Unlimited entities."""
        if not self._sync_enabled:
            return {"enabled": False, "entities": []}

        await self._discover_iu_entities()  # Refresh entity list

        status = {
            "enabled": True,
            "entity_prefix": self._entity_prefix,
            "total_entities": len(self._iu_entities),
            "entities": [],
        }

        for entity_id, entity_info in self._iu_entities.items():
            # Get current state
            state = self.hass.states.get(entity_id)
            entity_status = {
                "entity_id": entity_id,
                "friendly_name": entity_info.get("friendly_name"),
                "current_state": state.state if state else "unknown",
                "last_updated": state.last_updated.isoformat() if state else None,
            }

            # Add IU-specific attributes if available
            if state and state.attributes:
                iu_attrs = {}
                for attr in ["remaining", "next_start", "next_duration", "zone_name"]:
                    if attr in state.attributes:
                        iu_attrs[attr] = state.attributes[attr]
                entity_status["iu_attributes"] = iu_attrs

            status["entities"].append(entity_status)

        return status

    async def async_send_zone_data_to_iu(
        self, zone_id: int, data: dict[str, Any]
    ) -> bool:
        """Send zone data to corresponding Irrigation Unlimited entity."""
        if not self._sync_enabled:
            return False

        zone = self.coordinator.store.get_zone(zone_id)
        if not zone:
            raise ValueError(f"Zone {zone_id} not found")

        iu_entity = await self._find_matching_iu_entity(zone)
        if not iu_entity:
            _LOGGER.warning(
                "No matching IU entity found for zone %s", zone.get(const.ZONE_NAME)
            )
            return False

        try:
            # Send specific data types to IU
            if "duration" in data:
                await self._trigger_iu_entity(iu_entity["entity_id"], data["duration"])

            if "state" in data and data["state"] == "off":
                await self._ensure_iu_entity_off(iu_entity["entity_id"])

            _LOGGER.info("Sent zone data to IU entity %s", iu_entity["entity_id"])
            return True

        except Exception as e:
            _LOGGER.error("Failed to send zone data to IU: %s", e)
            return False

    async def async_create_iu_schedule_from_smart_irrigation(
        self, zone_ids: list[int] | None = None
    ) -> dict[str, Any]:
        """Create IU schedules based on Smart Irrigation triggers and schedules."""
        if not self._sync_enabled:
            raise ValueError("Irrigation Unlimited integration is not enabled")

        # Get Smart Irrigation triggers and schedules
        config = await self.coordinator.store.async_get_config()
        triggers = config.get(const.CONF_IRRIGATION_START_TRIGGERS, [])
        recurring_schedules = config.get(const.CONF_RECURRING_SCHEDULES, [])

        schedule_data = {"created_schedules": [], "warnings": []}

        # Process triggers
        for trigger in triggers:
            if not trigger.get(const.TRIGGER_CONF_ENABLED, True):
                continue

            try:
                iu_schedule = await self._convert_trigger_to_iu_schedule(trigger)
                if iu_schedule:
                    schedule_data["created_schedules"].append(
                        {
                            "type": "trigger",
                            "source": trigger,
                            "iu_schedule": iu_schedule,
                        }
                    )
            except Exception as e:
                schedule_data["warnings"].append(
                    {
                        "type": "trigger",
                        "source": trigger.get(const.TRIGGER_CONF_NAME, "Unknown"),
                        "error": str(e),
                    }
                )

        # Process recurring schedules
        for schedule in recurring_schedules:
            if not schedule.get(const.SCHEDULE_CONF_ENABLED, True):
                continue

            try:
                iu_schedule = await self._convert_recurring_schedule_to_iu_schedule(
                    schedule
                )
                if iu_schedule:
                    schedule_data["created_schedules"].append(
                        {
                            "type": "recurring_schedule",
                            "source": schedule,
                            "iu_schedule": iu_schedule,
                        }
                    )
            except Exception as e:
                schedule_data["warnings"].append(
                    {
                        "type": "recurring_schedule",
                        "source": schedule.get(const.SCHEDULE_CONF_NAME, "Unknown"),
                        "error": str(e),
                    }
                )

        return schedule_data

    async def _convert_trigger_to_iu_schedule(
        self, trigger: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Convert a Smart Irrigation trigger to an IU schedule format."""
        trigger_type = trigger.get(const.TRIGGER_CONF_TYPE)
        trigger_name = trigger.get(const.TRIGGER_CONF_NAME, "Smart Irrigation Trigger")

        iu_schedule = {
            "name": trigger_name,
            "enabled": True,
            "source": "smart_irrigation",
        }

        if trigger_type == const.TRIGGER_TYPE_SUNRISE:
            offset_minutes = trigger.get(const.TRIGGER_CONF_OFFSET_MINUTES, 0)
            iu_schedule.update(
                {
                    "schedule_type": "sunrise",
                    "offset": (
                        f"{offset_minutes:+d} minutes" if offset_minutes != 0 else "0"
                    ),
                }
            )
        elif trigger_type == const.TRIGGER_TYPE_SUNSET:
            offset_minutes = trigger.get(const.TRIGGER_CONF_OFFSET_MINUTES, 0)
            iu_schedule.update(
                {
                    "schedule_type": "sunset",
                    "offset": (
                        f"{offset_minutes:+d} minutes" if offset_minutes != 0 else "0"
                    ),
                }
            )
        elif trigger_type == const.TRIGGER_TYPE_SOLAR_AZIMUTH:
            azimuth = trigger.get(const.TRIGGER_CONF_AZIMUTH_ANGLE, 0)
            offset_minutes = trigger.get(const.TRIGGER_CONF_OFFSET_MINUTES, 0)
            iu_schedule.update(
                {
                    "schedule_type": "fixed_time",  # IU might not support azimuth directly
                    "time": "06:00",  # Placeholder - would need calculation
                    "notes": f"Originally azimuth {azimuth}° with {offset_minutes} min offset",
                }
            )
        else:
            return None

        return iu_schedule

    async def _convert_recurring_schedule_to_iu_schedule(
        self, schedule: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Convert a Smart Irrigation recurring schedule to an IU schedule format."""
        schedule_type = schedule.get(const.SCHEDULE_CONF_TYPE)
        schedule_name = schedule.get(
            const.SCHEDULE_CONF_NAME, "Smart Irrigation Schedule"
        )
        schedule_time = schedule.get(const.SCHEDULE_CONF_TIME, "06:00")

        iu_schedule = {
            "name": schedule_name,
            "enabled": True,
            "time": schedule_time,
            "source": "smart_irrigation",
        }

        if schedule_type == const.SCHEDULE_TYPE_DAILY:
            iu_schedule["schedule_type"] = "daily"
        elif schedule_type == const.SCHEDULE_TYPE_WEEKLY:
            days = schedule.get(const.SCHEDULE_CONF_DAYS_OF_WEEK, [])
            iu_schedule.update({"schedule_type": "weekly", "weekdays": days})
        elif schedule_type == const.SCHEDULE_TYPE_MONTHLY:
            day_of_month = schedule.get(const.SCHEDULE_CONF_DAY_OF_MONTH, 1)
            iu_schedule.update({"schedule_type": "monthly", "day": day_of_month})
        elif schedule_type == const.SCHEDULE_TYPE_INTERVAL:
            interval_hours = schedule.get(const.SCHEDULE_CONF_INTERVAL_HOURS, 24)
            iu_schedule.update(
                {"schedule_type": "interval", "interval": f"{interval_hours} hours"}
            )
        else:
            return None

        return iu_schedule

    def is_enabled(self) -> bool:
        """Check if Irrigation Unlimited integration is enabled."""
        return self._sync_enabled

    async def async_update_configuration(self, config_data: dict[str, Any]) -> None:
        """Update the integration configuration."""
        old_sync_enabled = self._sync_enabled

        self._sync_enabled = config_data.get(
            const.CONF_IRRIGATION_UNLIMITED_INTEGRATION, False
        )
        self._entity_prefix = config_data.get(
            const.CONF_IU_ENTITY_PREFIX, const.CONF_DEFAULT_IU_ENTITY_PREFIX
        )

        # If integration was just enabled, initialize
        if not old_sync_enabled and self._sync_enabled:
            await self._discover_iu_entities()
            _LOGGER.info("Irrigation Unlimited integration enabled")
        elif old_sync_enabled and not self._sync_enabled:
            self._iu_entities.clear()
            _LOGGER.info("Irrigation Unlimited integration disabled")

    def get_iu_entities(self) -> dict[str, Any]:
        """Get discovered Irrigation Unlimited entities."""
        return self._iu_entities.copy()
