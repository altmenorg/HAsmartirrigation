"""Binary sensor platform for Smart Irrigation: per-zone status.

Per zone (on the zone device):
- irrigation_needed: the zone's bucket is in deficit (< 0).
- watering_now: the zone's linked valve/switch is currently on/open.
- problem: a valve problem was reported for the zone (e.g. it never opened);
  latches on the ``..._zone_problem`` event and clears on the next successful
  run (the ``..._zone_irrigated`` dispatch sent when the bucket is credited).

Per-zone status entities inspired by JustChr's Smart Irrigation fork (MIT).
"""

import logging

from homeassistant.components.binary_sensor import DOMAIN as BINARY_PLATFORM
from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.util import slugify

from . import const
from .entity import zone_device_info

_LOGGER = logging.getLogger(__name__)

_VALVE_ON_STATES = ("on", "open", "opening")


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_devices: AddEntitiesCallback,
) -> None:
    """Set up the per-zone status binary sensors."""

    @callback
    def async_add_binary_sensor_entity(config: dict) -> None:
        """Add the status binary sensors for one zone (once)."""
        if const.DOMAIN not in hass.data:
            return
        registered = hass.data[const.DOMAIN].setdefault("zone_binary_sensors", {})
        if config["id"] in registered:
            return
        base = const.DOMAIN + "_" + slugify(config["name"])
        zid = config[const.ZONE_ID]
        zname = config[const.ZONE_NAME]
        entities = [
            SmartIrrigationZoneIrrigationNeededBinarySensor(
                hass, f"{BINARY_PLATFORM}.{base}_irrigation_needed", zid, zname
            ),
            SmartIrrigationZoneWateringNowBinarySensor(
                hass, f"{BINARY_PLATFORM}.{base}_watering_now", zid, zname
            ),
            SmartIrrigationZoneProblemBinarySensor(
                hass, f"{BINARY_PLATFORM}.{base}_problem", zid, zname
            ),
        ]
        registered[config["id"]] = entities
        async_add_devices(entities)

    config_entry.async_on_unload(
        async_dispatcher_connect(
            hass, const.DOMAIN + "_register_entity", async_add_binary_sensor_entity
        )
    )


class SmartIrrigationZoneBinarySensor(BinarySensorEntity):
    """Base for per-zone status binary sensors, grouped under the zone device."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    suffix = ""

    def __init__(
        self, hass: HomeAssistant, entity_id: str, zone_id: int, zone_name: str
    ) -> None:
        """Initialize a per-zone binary sensor."""
        self._hass = hass
        self.entity_id = entity_id
        self._zone_id = zone_id
        self._zone_name = zone_name
        self._attr_translation_key = self.suffix
        self._attr_is_on = False

    def _zone(self):
        """Return this zone's stored dict, or None."""
        try:
            return self._hass.data[const.DOMAIN]["coordinator"].store.get_zone(
                self._zone_id
            )
        except (KeyError, AttributeError, TypeError):
            return None

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


class SmartIrrigationZoneIrrigationNeededBinarySensor(SmartIrrigationZoneBinarySensor):
    """On when the zone's bucket is in deficit (needs water)."""

    suffix = "irrigation_needed"
    _attr_icon = "mdi:water-alert"

    async def async_added_to_hass(self) -> None:
        """Subscribe to config updates and compute the initial state."""
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self._hass, const.DOMAIN + "_config_updated", self._async_refresh
            )
        )
        self._recompute()

    @callback
    def _async_refresh(self, zone_id=None) -> None:
        if zone_id is None or zone_id == self._zone_id:
            self._recompute()
            self.async_write_ha_state()

    @callback
    def _recompute(self) -> None:
        zone = self._zone()
        bucket = zone.get(const.ZONE_BUCKET) if zone else None
        self._attr_is_on = bucket is not None and bucket < 0
        if zone:
            self._zone_name = zone.get(const.ZONE_NAME, self._zone_name)


class SmartIrrigationZoneWateringNowBinarySensor(SmartIrrigationZoneBinarySensor):
    """On while the zone's linked valve/switch is open/on."""

    suffix = "watering_now"
    _attr_device_class = BinarySensorDeviceClass.RUNNING
    _attr_icon = "mdi:sprinkler-variant"

    async def async_added_to_hass(self) -> None:
        """Track the linked valve's state (set once at add time)."""
        await super().async_added_to_hass()
        zone = self._zone()
        self._linked = zone.get(const.ZONE_LINKED_ENTITY) if zone else None
        if self._linked:
            self.async_on_remove(
                async_track_state_change_event(
                    self._hass, [self._linked], self._async_valve_changed
                )
            )
        self._recompute()

    @callback
    def _async_valve_changed(self, event) -> None:
        self._recompute()
        self.async_write_ha_state()

    @callback
    def _recompute(self) -> None:
        if not self._linked:
            self._attr_is_on = False
            return
        state = self._hass.states.get(self._linked)
        self._attr_is_on = bool(state and state.state in _VALVE_ON_STATES)


class SmartIrrigationZoneProblemBinarySensor(SmartIrrigationZoneBinarySensor):
    """On when a valve problem was reported; clears on the next successful run."""

    suffix = "problem"
    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _attr_icon = "mdi:alert-circle-outline"

    def __init__(self, hass, entity_id, zone_id, zone_name) -> None:
        """Initialize, with no reason yet."""
        super().__init__(hass, entity_id, zone_id, zone_name)
        self._reason = None

    async def async_added_to_hass(self) -> None:
        """Listen for the zone-problem event and the zone-irrigated reset."""
        await super().async_added_to_hass()
        self.async_on_remove(
            self._hass.bus.async_listen(
                f"{const.DOMAIN}_{const.EVENT_ZONE_PROBLEM}", self._async_problem
            )
        )
        self.async_on_remove(
            async_dispatcher_connect(
                self._hass, const.DOMAIN + "_zone_irrigated", self._async_run_ok
            )
        )

    @callback
    def _async_problem(self, event) -> None:
        if event.data.get("zone_id") == self._zone_id:
            self._attr_is_on = True
            self._reason = event.data.get("reason")
            self.async_write_ha_state()

    @callback
    def _async_run_ok(self, zone_id=None) -> None:
        if zone_id == self._zone_id and self._attr_is_on:
            self._attr_is_on = False
            self._reason = None
            self.async_write_ha_state()

    @property
    def extra_state_attributes(self) -> dict:
        """Return zone id and the last problem reason (if any)."""
        return {"zone_id": self._zone_id, "reason": self._reason}
