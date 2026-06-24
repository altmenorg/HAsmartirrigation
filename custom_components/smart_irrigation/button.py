"""Button platform for Smart Irrigation: per-zone actions.

Per zone (on the zone device):
- Reset bucket: set the zone's bucket to 0 ("I just watered, start from zero").
- Calculate: recalculate this zone now (same as the panel's Calculate).
- Irrigate now (only when direct valve control is enabled): run this zone's
  valve for its calculated duration. The run credits the bucket, so the water
  delivered is accounted for and the next (evening) calculation irrigates less.

Per-zone and hub action entities inspired by JustChr's Smart Irrigation fork
(https://github.com/JustChr/HAsmartirrigation), MIT.
"""

import logging

from homeassistant.components.button import DOMAIN as BUTTON_PLATFORM
from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import slugify

from . import const
from .entity import hub_device_info, zone_device_info

_LOGGER = logging.getLogger(__name__)


def _coordinator(hass: HomeAssistant):
    """Return the coordinator, or None when not (yet) set up."""
    try:
        return hass.data[const.DOMAIN]["coordinator"]
    except (KeyError, AttributeError):
        return None


def _direct_valve_control_enabled(hass: HomeAssistant) -> bool:
    """True if direct valve control is enabled (so Irrigate now can act)."""
    coordinator = _coordinator(hass)
    config = getattr(getattr(coordinator, "store", None), "config", None)
    return bool(
        config
        and getattr(config, const.CONF_DIRECT_VALVE_CONTROL_ENABLED, False) is True
    )


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_devices: AddEntitiesCallback,
) -> None:
    """Set up the per-zone action buttons."""

    @callback
    def async_add_button_entity(config: dict) -> None:
        """Add the action buttons for one zone (once)."""
        if const.DOMAIN not in hass.data:
            return
        registered = hass.data[const.DOMAIN].setdefault("zone_buttons", {})
        if config["id"] in registered:
            return
        base = const.DOMAIN + "_" + slugify(config["name"])
        zid = config[const.ZONE_ID]
        zname = config[const.ZONE_NAME]
        entities = [
            SmartIrrigationZoneCalculateButton(
                hass, f"{BUTTON_PLATFORM}.{base}_calculate", zid, zname
            ),
            SmartIrrigationZoneResetBucketButton(
                hass, f"{BUTTON_PLATFORM}.{base}_reset_bucket", zid, zname
            ),
            SmartIrrigationZoneResetUsageButton(
                hass, f"{BUTTON_PLATFORM}.{base}_reset_usage", zid, zname
            ),
        ]
        # Irrigate-now only makes sense when SI itself drives the valves.
        if _direct_valve_control_enabled(hass):
            entities.append(
                SmartIrrigationZoneIrrigateNowButton(
                    hass, f"{BUTTON_PLATFORM}.{base}_irrigate_now", zid, zname
                )
            )
        registered[config["id"]] = entities
        async_add_devices(entities)

    config_entry.async_on_unload(
        async_dispatcher_connect(
            hass, const.DOMAIN + "_register_entity", async_add_button_entity
        )
    )

    # Global (hub-device) action buttons, created once.
    hub_buttons = [
        SmartIrrigationCalculateAllButton(hass),
        SmartIrrigationUpdateWeatherButton(hass),
    ]
    if _direct_valve_control_enabled(hass):
        hub_buttons.append(SmartIrrigationIrrigateAllButton(hass))
    async_add_devices(hub_buttons)


class SmartIrrigationZoneButton(ButtonEntity):
    """Base for per-zone action buttons, grouped under the zone device.

    ``suffix`` is the unique_id / entity_id suffix and the translation key.
    """

    _attr_has_entity_name = True
    _attr_should_poll = False
    suffix = ""

    def __init__(
        self, hass: HomeAssistant, entity_id: str, zone_id: int, zone_name: str
    ) -> None:
        """Initialize a per-zone button."""
        self._hass = hass
        self.entity_id = entity_id
        self._zone_id = zone_id
        self._zone_name = zone_name
        self._attr_translation_key = self.suffix

        async_dispatcher_connect(
            hass, const.DOMAIN + "_config_updated", self._async_zone_updated
        )

    @callback
    def _async_zone_updated(self, zone_id=None):
        """Track zone renames so the friendly name stays current."""
        if self._zone_id != zone_id or not (self.hass and self.hass.data):
            return
        coordinator = _coordinator(self.hass)
        zone = coordinator.store.get_zone(self._zone_id) if coordinator else None
        if zone:
            self._zone_name = zone.get(const.ZONE_NAME, self._zone_name)
            self.async_schedule_update_ha_state()

    @property
    def unique_id(self) -> str:
        """Return a stable per-zone unique ID."""
        return f"{const.DOMAIN}_{self._zone_id}_{self.suffix}"

    @property
    def should_poll(self) -> bool:
        """No polling."""
        return False

    @property
    def device_info(self) -> dict:
        """Group under the per-zone device."""
        return zone_device_info(self._hass, self._zone_id, self._zone_name)

    @property
    def extra_state_attributes(self) -> dict:
        """Return zone identification attributes."""
        return {"zone_id": self._zone_id}


class SmartIrrigationZoneResetBucketButton(SmartIrrigationZoneButton):
    """Set this zone's bucket to 0 (mirrors the panel's Reset bucket)."""

    suffix = "reset_bucket"
    _attr_icon = "mdi:bucket-outline"

    async def async_press(self) -> None:
        """Reset the zone's bucket and notify the other entities."""
        coordinator = _coordinator(self._hass)
        if coordinator is None:
            return
        await coordinator.store.async_update_zone(self._zone_id, {const.ZONE_BUCKET: 0})
        async_dispatcher_send(
            self._hass, const.DOMAIN + "_config_updated", self._zone_id
        )


class SmartIrrigationZoneResetUsageButton(SmartIrrigationZoneButton):
    """Reset this zone's cumulative water-usage counter to 0."""

    suffix = "reset_usage"
    _attr_icon = "mdi:restart"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    async def async_press(self) -> None:
        """Zero the water-used total and notify the other entities."""
        coordinator = _coordinator(self._hass)
        if coordinator is None:
            return
        await coordinator.store.async_update_zone(
            self._zone_id, {const.ZONE_WATER_USED: 0.0}
        )
        async_dispatcher_send(
            self._hass, const.DOMAIN + "_config_updated", self._zone_id
        )


class SmartIrrigationZoneCalculateButton(SmartIrrigationZoneButton):
    """Recalculate this zone now (mirrors the panel's Calculate)."""

    suffix = "calculate"
    _attr_icon = "mdi:calculator"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    async def async_press(self) -> None:
        """Run the calculation for this zone."""
        coordinator = _coordinator(self._hass)
        if coordinator is None:
            return
        await coordinator.async_update_zone_config(
            zone_id=self._zone_id, data={const.ATTR_CALCULATE: const.ATTR_CALCULATE}
        )


class SmartIrrigationZoneIrrigateNowButton(SmartIrrigationZoneButton):
    """Run this zone's valve now for its calculated duration (credits the bucket)."""

    suffix = "irrigate_now"
    _attr_icon = "mdi:sprinkler"

    async def async_press(self) -> None:
        """Start a direct valve run for this zone (non-blocking)."""
        coordinator = _coordinator(self._hass)
        if coordinator is None:
            return
        # Detached: the run holds the valve for the whole duration; don't block
        # the button press. async_run_direct_valves is a no-op if DVC is off.
        self._hass.async_create_task(
            coordinator.async_run_direct_valves([self._zone_id])
        )


class SmartIrrigationHubButton(ButtonEntity):
    """Base for global action buttons on the Smart Irrigation hub device."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    suffix = ""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize a hub-level button."""
        self._hass = hass
        self.entity_id = f"{BUTTON_PLATFORM}.{const.DOMAIN}_{self.suffix}"
        self._attr_translation_key = self.suffix

    @property
    def unique_id(self) -> str:
        """Return a stable unique ID."""
        return f"{const.DOMAIN}_{self.suffix}"

    @property
    def device_info(self) -> dict:
        """Group under the hub device."""
        return hub_device_info(self._hass)


class SmartIrrigationCalculateAllButton(SmartIrrigationHubButton):
    """Recalculate every automatic zone now."""

    suffix = "calculate_all"
    _attr_icon = "mdi:calculator-variant"

    async def async_press(self) -> None:
        """Run the calculation for all zones."""
        coordinator = _coordinator(self._hass)
        if coordinator is not None:
            await coordinator._async_calculate_all(True)  # noqa: SLF001


class SmartIrrigationUpdateWeatherButton(SmartIrrigationHubButton):
    """Collect fresh weather/sensor data for all zones."""

    suffix = "update_weather"
    _attr_icon = "mdi:weather-cloudy-arrow-right"

    async def async_press(self) -> None:
        """Refresh weather data for all zones."""
        coordinator = _coordinator(self._hass)
        if coordinator is not None:
            await coordinator._async_update_all()  # noqa: SLF001


class SmartIrrigationIrrigateAllButton(SmartIrrigationHubButton):
    """Run every eligible zone's valve now (direct valve control)."""

    suffix = "irrigate_all"
    _attr_icon = "mdi:sprinkler-variant"

    async def async_press(self) -> None:
        """Start a direct valve run for all zones (non-blocking)."""
        coordinator = _coordinator(self._hass)
        if coordinator is not None:
            self._hass.async_create_task(coordinator.async_run_direct_valves())
