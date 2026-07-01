"""Number platform for Smart Irrigation: multiplier and precipitation threshold.

Per zone (on the zone device):
- multiplier: editable irrigation multiplier, mirroring the panel's field.
  Setting it writes straight to the zone store (used by the next calculation).

Global (on the hub device):
- precipitation_threshold: the panel's "Precipitation Threshold (mm)" setting,
  paired with the "skip_on_precipitation" switch (see switch.py). Writes go
  through ``coordinator.async_update_config``, same as the panel.

Per-zone entity approach inspired by JustChr's Smart Irrigation fork (MIT).
"""

import contextlib
import logging

from homeassistant.components.number import DOMAIN as NUMBER_PLATFORM
from homeassistant.components.number import (
    NumberDeviceClass,
    NumberEntity,
    NumberMode,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import slugify
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .entity import hub_device_info, zone_device_info
from .helpers import convert_between

_LOGGER = logging.getLogger(__name__)


def _coordinator(hass: HomeAssistant):
    """Return the coordinator, or None when not (yet) set up."""
    try:
        return hass.data[const.DOMAIN]["coordinator"]
    except (KeyError, AttributeError):
        return None


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_devices: AddEntitiesCallback,
) -> None:
    """Set up the per-zone multiplier number entities."""

    @callback
    def async_add_number_entity(config: dict) -> None:
        """Add the multiplier number for one zone (once)."""
        if const.DOMAIN not in hass.data:
            return
        registered = hass.data[const.DOMAIN].setdefault("multiplier_numbers", {})
        if config["id"] in registered:
            return
        entity_id = "{}.{}_multiplier".format(
            NUMBER_PLATFORM, const.DOMAIN + "_" + slugify(config["name"])
        )
        number_entity = SmartIrrigationZoneMultiplierEntity(
            hass=hass,
            entity_id=entity_id,
            zone_id=config[const.ZONE_ID],
            zone_name=config[const.ZONE_NAME],
            multiplier=config.get(const.ZONE_MULTIPLIER, 1.0),
        )
        registered[config["id"]] = number_entity
        async_add_devices([number_entity])

    # Subscribe before __init__ replays existing zones via "_platform_loaded".
    config_entry.async_on_unload(
        async_dispatcher_connect(
            hass, const.DOMAIN + "_register_entity", async_add_number_entity
        )
    )

    # Global (hub-device) precipitation threshold, created once.
    async_add_devices([SmartIrrigationPrecipitationThresholdNumber(hass)])


class SmartIrrigationZoneMultiplierEntity(NumberEntity, RestoreEntity):
    """Editable per-zone irrigation multiplier, grouped under the zone device."""

    _attr_has_entity_name = True
    _attr_translation_key = "multiplier"
    _attr_native_min_value = 0.0
    _attr_native_max_value = 10.0
    _attr_native_step = 0.1
    _attr_mode = NumberMode.BOX
    _attr_icon = "mdi:multiplication"

    def __init__(
        self,
        hass: HomeAssistant,
        entity_id: str,
        zone_id: int,
        zone_name: str,
        multiplier: float,
    ) -> None:
        """Initialize the multiplier number entity."""
        self._hass = hass
        self.entity_id = entity_id
        self._zone_id = zone_id
        self._zone_name = zone_name
        self._multiplier = multiplier

        async_dispatcher_connect(
            hass, const.DOMAIN + "_config_updated", self._async_update_multiplier
        )

    @callback
    def _async_update_multiplier(self, zone_id=None) -> None:
        """Refresh when the zone config changes (e.g. edited from the panel)."""
        if self._zone_id == zone_id and self.hass and self.hass.data:
            zone = self.hass.data[const.DOMAIN]["coordinator"].store.get_zone(
                self._zone_id
            )
            if zone:
                self._multiplier = zone.get(const.ZONE_MULTIPLIER, self._multiplier)
                self._zone_name = zone.get(const.ZONE_NAME, self._zone_name)
                self.async_schedule_update_ha_state()

    @property
    def unique_id(self) -> str:
        """Return a stable per-zone unique ID."""
        return f"{const.DOMAIN}_{self._zone_id}_multiplier"

    @property
    def should_poll(self) -> bool:
        """No polling; updated via dispatcher."""
        return False

    @property
    def native_value(self) -> float:
        """Return the current multiplier."""
        return round(self._multiplier, 2)

    async def async_set_native_value(self, value: float) -> None:
        """Persist a new multiplier to the zone store and notify."""
        value = round(value, 2)
        await self.hass.data[const.DOMAIN]["coordinator"].store.async_update_zone(
            self._zone_id, {const.ZONE_MULTIPLIER: value}
        )
        self._multiplier = value
        self.async_write_ha_state()
        async_dispatcher_send(
            self.hass, const.DOMAIN + "_config_updated", self._zone_id
        )

    @property
    def device_info(self) -> dict:
        """Group under the per-zone device (same as the zone sensors)."""
        return zone_device_info(self._hass, self._zone_id, self._zone_name)

    @property
    def extra_state_attributes(self) -> dict:
        """Return zone identification attributes."""
        return {"zone_id": self._zone_id}

    async def async_added_to_hass(self) -> None:
        """Restore the previous value if available."""
        await super().async_added_to_hass()
        last_state = await self.async_get_last_state()
        if last_state is not None and last_state.state not in (
            "unknown",
            "unavailable",
        ):
            with contextlib.suppress(ValueError, TypeError):
                self._multiplier = float(last_state.state)
        self.async_schedule_update_ha_state(force_refresh=True)


class SmartIrrigationPrecipitationThresholdNumber(NumberEntity):
    """Editable "Precipitation Threshold (mm)" setting, on the hub device.

    Paired with the "skip_on_precipitation" switch (switch.py): irrigation is
    skipped when forecast precipitation meets or exceeds this threshold.

    The store always keeps this value in mm, but ``coordinator.async_update_config``
    interprets an incoming value as inches when HA is configured for imperial units
    (mirroring what the panel sends -- a raw number in the user's current unit
    system). So this entity's native unit tracks ``hass.config.units`` and passes
    the raw displayed value straight through, rather than always converting to mm.
    """

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = "precipitation_threshold"
    _attr_device_class = NumberDeviceClass.PRECIPITATION
    _attr_mode = NumberMode.BOX
    _attr_icon = "mdi:weather-pouring"
    _attr_native_min_value = 0.0

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the precipitation threshold number."""
        self._hass = hass
        self.entity_id = f"{NUMBER_PLATFORM}.{const.DOMAIN}_precipitation_threshold"
        self._threshold_mm = const.CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM

    def _is_metric(self) -> bool:
        """Return whether HA is configured for the metric system."""
        return self._hass.config.units is METRIC_SYSTEM

    @property
    def unique_id(self) -> str:
        """Return a stable unique ID."""
        return f"{const.DOMAIN}_precipitation_threshold"

    @property
    def device_info(self) -> dict:
        """Group under the hub device."""
        return hub_device_info(self._hass)

    @property
    def should_poll(self) -> bool:
        """No polling; updated via dispatcher."""
        return False

    @property
    def native_unit_of_measurement(self) -> str:
        """Match HA's current unit system (mm or inches)."""
        return const.UNIT_MM if self._is_metric() else const.UNIT_INCH

    @property
    def native_max_value(self) -> float:
        """Return the upper bound, in the current display unit (~50 mm)."""
        return 50.0 if self._is_metric() else 2.0

    @property
    def native_step(self) -> float:
        """Return the step size, in the current display unit (~0.5 mm)."""
        return 0.5 if self._is_metric() else 0.05

    @property
    def native_value(self) -> float:
        """Return the threshold, converted to the current display unit."""
        if self._is_metric():
            return round(self._threshold_mm, 2)
        return round(
            convert_between(const.UNIT_MM, const.UNIT_INCH, self._threshold_mm), 3
        )

    async def async_set_native_value(self, value: float) -> None:
        """Persist a new threshold and notify entities and any open panel."""
        coordinator = _coordinator(self._hass)
        if coordinator is None:
            return
        # Mirrors the panel: send the raw value in the current display unit;
        # the coordinator itself converts inches -> mm when HA is not metric.
        await coordinator.async_update_config(
            {const.CONF_PRECIPITATION_THRESHOLD_MM: value}
        )
        self._recompute()
        self.async_write_ha_state()
        async_dispatcher_send(self._hass, const.DOMAIN + "_update_frontend")

    async def async_added_to_hass(self) -> None:
        """Subscribe to config updates and read the initial state."""
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self._hass, const.DOMAIN + "_config_updated", self._async_refresh
            )
        )
        self._recompute()

    @callback
    def _async_refresh(self, zone_id=None) -> None:
        """Refresh when the global config changes (e.g. edited from the panel).

        ``_config_updated`` is also sent (with a zone_id) for per-zone changes,
        which don't affect this global setting; skip those.
        """
        if zone_id is not None:
            return
        self._recompute()
        self.async_write_ha_state()

    @callback
    def _recompute(self) -> None:
        """Read the current mm value from the store."""
        coordinator = _coordinator(self._hass)
        config = coordinator.store.get_config() if coordinator else {}
        self._threshold_mm = config.get(
            const.CONF_PRECIPITATION_THRESHOLD_MM,
            const.CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM,
        )
