"""Service-call handlers for the Smart Irrigation integration.

Extracted from __init__.py: the ``handle_*`` methods registered as Home
Assistant services (calculate / update / reset / set zones and buckets and
multipliers, clear weather data, the watering-calendar service, the recurring
schedule and seasonal adjustment services, and the Irrigation Unlimited
services), plus the ``_async_set_all_*`` helpers they call. The methods live on
a mixin the coordinator inherits; their bodies are unchanged and still use
``self`` to reach coordinator state.
"""

import logging
import re
from datetime import datetime

from homeassistant.helpers.dispatcher import async_dispatcher_send

from . import const
from .exceptions import SmartIrrigationError

_LOGGER = logging.getLogger(__name__)


class ServiceHandlersMixin:
    """Service-call handlers for ``SmartIrrigationCoordinator``.

    Mixed into the coordinator; methods use ``self`` to reach coordinator state
    (store, hass, the schedule/adjustment managers, the IU integration, and the
    zone-config / calculation helpers).
    """

    async def _async_set_all_buckets(self, val=0):
        """Set all buckets to val."""
        zones = await self.store.async_get_zones()
        data = {}
        data[const.ATTR_SET_BUCKET] = {}
        data[const.ATTR_NEW_BUCKET_VALUE] = val

        for zone in zones:
            await self.async_update_zone_config(
                zone_id=zone.get(const.ZONE_ID), data=data
            )

    async def _async_set_all_multipliers(self, val=0):
        """Set all multipliers to val."""
        zones = await self.store.async_get_zones()
        data = {}
        data[const.ATTR_SET_MULTIPLIER] = {}
        data[const.ATTR_NEW_MULTIPLIER_VALUE] = val

        for zone in zones:
            await self.async_update_zone_config(
                zone_id=zone.get(const.ZONE_ID), data=data
            )

    async def handle_calculate_all_zones(self, call):
        """Calculate all zones."""
        _LOGGER.info("Calculate all zones service called")
        await self._async_calculate_all(
            call.data.get(const.ATTR_DELETE_WEATHER_DATA, True)
        )

    async def handle_calculate_zone(self, call):
        """Calculate specific zone."""
        if const.SERVICE_ENTITY_ID in call.data:
            for entity in call.data[const.SERVICE_ENTITY_ID]:
                _LOGGER.info("Calculate zone service called for zone %s", entity)
                # find entity zone id and call calculate on the zone
                state = self.hass.states.get(entity)
                if state:
                    # find zone_id for zone with name
                    zone_id = state.attributes.get(const.ZONE_ID)
                    if zone_id is not None:
                        data = {}
                        data[const.ATTR_CALCULATE] = const.ATTR_CALCULATE
                        data[const.ATTR_DELETE_WEATHER_DATA] = call.data.get(
                            const.ATTR_DELETE_WEATHER_DATA, True
                        )
                        await self.async_update_zone_config(zone_id=zone_id, data=data)

    async def handle_update_all_zones(self, call):
        """Update all zones."""
        _LOGGER.info("Update all zones service called")
        await self._async_update_all()

    async def handle_update_zone(self, call):
        """Update specific zone."""
        if const.SERVICE_ENTITY_ID in call.data:
            for entity in call.data[const.SERVICE_ENTITY_ID]:
                _LOGGER.info("Update zone service called for zone %s", entity)
                # find entity zone id and call update on the zone
                state = self.hass.states.get(entity)
                if state:
                    # find zone_id for zone with name
                    zone_id = state.attributes.get(const.ZONE_ID)
                    if zone_id is not None:
                        data = {}
                        data[const.ATTR_UPDATE] = const.ATTR_UPDATE
                        await self.async_update_zone_config(zone_id=zone_id, data=data)

    async def handle_reset_bucket(self, call):
        """Reset a specific zone bucket to 0."""
        if const.SERVICE_ENTITY_ID in call.data:
            eid = call.data[const.SERVICE_ENTITY_ID]
            if not isinstance(eid, list):
                eid = [call.data[const.SERVICE_ENTITY_ID]]
            for entity in eid:
                _LOGGER.info("Reset bucket service called for zone %s", entity)
                # find entity zone id and call calculate on the zone
                state = self.hass.states.get(entity)
                if state:
                    # find zone_id for zone with name
                    zone_id = state.attributes.get(const.ZONE_ID)
                    if zone_id is not None:
                        data = {}
                        data[const.ATTR_SET_BUCKET] = {}
                        data[const.ATTR_NEW_BUCKET_VALUE] = 0
                        await self.async_update_zone_config(zone_id=zone_id, data=data)

    async def handle_reset_all_buckets(self, call):
        """Reset all buckets to 0."""
        _LOGGER.info("Reset all buckets service called")
        await self._async_set_all_buckets(0)

    async def handle_set_all_buckets(self, call):
        """Reset all buckets to new value."""
        if const.ATTR_NEW_BUCKET_VALUE in call.data:
            new_value = call.data[const.ATTR_NEW_BUCKET_VALUE]
            _LOGGER.info("Set all buckets service called, new value: %s", new_value)
            await self._async_set_all_buckets(new_value)

    async def handle_set_zone(self, call):
        """Reset a specific zone state to new value."""
        if const.SERVICE_ENTITY_ID not in call.data:
            return

        eid = call.data[const.SERVICE_ENTITY_ID]
        if not isinstance(eid, list):
            eid = [call.data[const.SERVICE_ENTITY_ID]]

        data = call.data.copy()
        data.pop(const.SERVICE_ENTITY_ID)

        for entity in eid:
            _LOGGER.info("Set zone data service called with zone %s", entity)

            # find entity zone id and call calculate on the zone
            state = self.hass.states.get(entity)
            if not state:
                raise SmartIrrigationError(f"No state found for entity {entity}")

            # find zone_id for zone with name
            zone_id = state.attributes.get(const.ZONE_ID)
            if zone_id is None:
                raise SmartIrrigationError("No zone_id found in state attributes.")

            zone = self.store.get_zone(zone_id)
            zone_data = {}
            count = 0
            for v in data:
                if (
                    v not in const.LIST_SET_ZONE_ALLOWED_ARGS
                    and v != const.SERVICE_ENTITY_ID
                ):
                    raise SmartIrrigationError(f"Argument ({v}) is not allowed")

                if (
                    v == const.ATTR_NEW_DURATION_VALUE
                    and zone.get(const.ZONE_STATE) != const.ZONE_STATE_MANUAL
                ):
                    raise SmartIrrigationError(
                        "Can only set duration if zone state is set to manual."
                    )
                if v == const.ATTR_NEW_BUCKET_VALUE and data[v] > zone.get(
                    const.ZONE_MAXIMUM_BUCKET
                ):
                    raise SmartIrrigationError(
                        "Bucket size is above maximmum bucket allowed value."
                    )
                if v == const.ATTR_NEW_STATE_VALUE and data[v] in const.ZONE_STATE:
                    raise SmartIrrigationError(
                        f"Invalid value ({data[v]}) for zone state."
                    )

                m = re.match("^new_(.+)_value$", v)
                if m:
                    zone_data[m.group(1)] = data[v]
                    _LOGGER.info("Setting value for %s", m.group(1))
                    count += 1

            if count == 0:
                raise SmartIrrigationError("No valid parameter provided")

            if count > 0:
                await self.store.async_update_zone(zone_id, zone_data)
                async_dispatcher_send(
                    self.hass,
                    const.DOMAIN + "_config_updated",
                    zone_id,
                )

    async def handle_set_all_multipliers(self, call):
        """Reset all multipliers to new value."""
        if const.ATTR_NEW_MULTIPLIER_VALUE in call.data:
            new_value = call.data[const.ATTR_NEW_MULTIPLIER_VALUE]
            _LOGGER.info("Set all multipliers service called, new value: %s", new_value)
            await self._async_set_all_multipliers(new_value)

    async def handle_clear_weatherdata(self, call):
        """Clear all collected weatherdata."""
        await self._async_clear_all_weatherdata()

    async def handle_generate_watering_calendar(self, call):
        """Generate watering calendar service handler."""
        zone_id = call.data.get("zone_id")

        if zone_id is not None:
            zone_id = int(zone_id)

        _LOGGER.info("Generate watering calendar service called for zone %s", zone_id)

        try:
            calendar_data = await self.async_generate_watering_calendar(zone_id)

            # Store the result in hass.data for retrieval by automation
            if "watering_calendars" not in self.hass.data[const.DOMAIN]:
                self.hass.data[const.DOMAIN]["watering_calendars"] = {}

            self.hass.data[const.DOMAIN]["watering_calendars"][
                "last_generated"
            ] = calendar_data

            # Fire an event with the calendar data
            self.hass.bus.fire(
                f"{const.DOMAIN}_watering_calendar_generated",
                {
                    "zone_id": zone_id,
                    "calendar_data": calendar_data,
                    "generated_at": datetime.now().isoformat(),
                },
            )

            _LOGGER.info(
                "Watering calendar generated successfully for %s zones",
                len(calendar_data),
            )

        except Exception as e:
            _LOGGER.error("Failed to generate watering calendar: %s", e)
            self.hass.bus.fire(
                f"{const.DOMAIN}_watering_calendar_error",
                {
                    "zone_id": zone_id,
                    "error": str(e),
                    "generated_at": datetime.now().isoformat(),
                },
            )

    # Enhanced Scheduling Service Handlers
    async def handle_create_recurring_schedule(self, call):
        """Create recurring schedule service handler."""
        schedule_data = dict(call.data)
        _LOGGER.info(
            "Create recurring schedule service called: %s",
            schedule_data.get("name", "Unnamed"),
        )

        try:
            await self.recurring_schedule_manager.async_create_schedule(schedule_data)
            _LOGGER.info("Successfully created recurring schedule")
        except Exception as e:
            _LOGGER.error("Failed to create recurring schedule: %s", e)
            raise

    async def handle_update_recurring_schedule(self, call):
        """Update recurring schedule service handler."""
        schedule_id = call.data.get("schedule_id")
        schedule_data = dict(call.data)
        schedule_data.pop("schedule_id", None)

        _LOGGER.info("Update recurring schedule service called for ID: %s", schedule_id)

        try:
            await self.recurring_schedule_manager.async_update_schedule(
                schedule_id, schedule_data
            )
            _LOGGER.info("Successfully updated recurring schedule")
        except Exception as e:
            _LOGGER.error("Failed to update recurring schedule: %s", e)
            raise

    async def handle_delete_recurring_schedule(self, call):
        """Delete recurring schedule service handler."""
        schedule_id = call.data.get("schedule_id")

        _LOGGER.info("Delete recurring schedule service called for ID: %s", schedule_id)

        try:
            await self.recurring_schedule_manager.async_delete_schedule(schedule_id)
            _LOGGER.info("Successfully deleted recurring schedule")
        except Exception as e:
            _LOGGER.error("Failed to delete recurring schedule: %s", e)
            raise

    async def handle_create_seasonal_adjustment(self, call):
        """Create seasonal adjustment service handler."""
        adjustment_data = dict(call.data)
        _LOGGER.info(
            "Create seasonal adjustment service called: %s",
            adjustment_data.get("name", "Unnamed"),
        )

        try:
            await self.seasonal_adjustment_manager.async_create_adjustment(
                adjustment_data
            )
            _LOGGER.info("Successfully created seasonal adjustment")
        except Exception as e:
            _LOGGER.error("Failed to create seasonal adjustment: %s", e)
            raise

    async def handle_update_seasonal_adjustment(self, call):
        """Update seasonal adjustment service handler."""
        adjustment_id = call.data.get("adjustment_id")
        adjustment_data = dict(call.data)
        adjustment_data.pop("adjustment_id", None)

        _LOGGER.info(
            "Update seasonal adjustment service called for ID: %s", adjustment_id
        )

        try:
            await self.seasonal_adjustment_manager.async_update_adjustment(
                adjustment_id, adjustment_data
            )
            _LOGGER.info("Successfully updated seasonal adjustment")
        except Exception as e:
            _LOGGER.error("Failed to update seasonal adjustment: %s", e)
            raise

    async def handle_delete_seasonal_adjustment(self, call):
        """Delete seasonal adjustment service handler."""
        adjustment_id = call.data.get("adjustment_id")

        _LOGGER.info(
            "Delete seasonal adjustment service called for ID: %s", adjustment_id
        )

        try:
            await self.seasonal_adjustment_manager.async_delete_adjustment(
                adjustment_id
            )
            _LOGGER.info("Successfully deleted seasonal adjustment")
        except Exception as e:
            _LOGGER.error("Failed to delete seasonal adjustment: %s", e)
            raise

    # Irrigation Unlimited Integration Service Handlers
    async def handle_sync_with_irrigation_unlimited(self, call):
        """Sync with Irrigation Unlimited service handler."""
        zone_ids = call.data.get("zone_ids")

        _LOGGER.info(
            "Sync with Irrigation Unlimited service called for zones: %s", zone_ids
        )

        try:
            result = await self.irrigation_unlimited_integration.async_sync_zones_to_iu(
                zone_ids
            )

            # Fire event with results
            self.hass.bus.fire(
                f"{const.DOMAIN}_iu_sync_result",
                {
                    "success": True,
                    "result": result,
                    "timestamp": datetime.now().isoformat(),
                },
            )

            _LOGGER.info("Successfully synced with Irrigation Unlimited")
        except Exception as e:
            _LOGGER.error("Failed to sync with Irrigation Unlimited: %s", e)

            # Fire error event
            self.hass.bus.fire(
                f"{const.DOMAIN}_iu_sync_result",
                {
                    "success": False,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat(),
                },
            )
            raise

    async def handle_send_zone_data_to_iu(self, call):
        """Send zone data to Irrigation Unlimited service handler."""
        zone_id = call.data.get("zone_id")
        zone_data = call.data.get("data", {})

        _LOGGER.info("Send zone data to IU service called for zone: %s", zone_id)

        try:
            success = (
                await self.irrigation_unlimited_integration.async_send_zone_data_to_iu(
                    zone_id, zone_data
                )
            )

            if success:
                _LOGGER.info("Successfully sent zone data to Irrigation Unlimited")
            else:
                _LOGGER.warning("Failed to send zone data to Irrigation Unlimited")

        except Exception as e:
            _LOGGER.error("Error sending zone data to Irrigation Unlimited: %s", e)
            raise

    async def handle_get_iu_schedule_status(self, call):
        """Get Irrigation Unlimited schedule status service handler."""
        _LOGGER.info("Get IU schedule status service called")

        try:
            status = await self.irrigation_unlimited_integration.async_get_iu_status()

            # Store status in hass.data for retrieval
            if "iu_status" not in self.hass.data[const.DOMAIN]:
                self.hass.data[const.DOMAIN]["iu_status"] = {}

            self.hass.data[const.DOMAIN]["iu_status"]["last_status"] = status

            # Fire event with status
            self.hass.bus.fire(
                f"{const.DOMAIN}_iu_status",
                {
                    "status": status,
                    "timestamp": datetime.now().isoformat(),
                },
            )

            _LOGGER.info("Successfully retrieved IU schedule status")

        except Exception as e:
            _LOGGER.error("Failed to get IU schedule status: %s", e)
            raise
