"""Binary sensor platform for Smart Irrigation: per-zone status.

Per zone (on the zone device):
- irrigation_needed: the zone's bucket is in deficit (< 0).
- watering_now: the zone's linked valve/switch is currently on/open.
- problem: a valve problem was reported for the zone (e.g. it never opened);
  latches on the ``..._zone_problem`` event and clears on the next successful
  run (the ``..._zone_irrigated`` dispatch sent when the bucket is credited).
  Also on while an automatic zone cannot be calculated (calc_problem.py), for
  as long as that lasts; the reason is then the problem's code.

For the whole install (on the hub device), one entity to automate or show
instead of one per zone:
- any_zone_needs_water: on while a zone's irrigation_needed is on.
- any_problem: on while a zone's problem is on.

Per-zone status entities inspired by JustChr's Smart Irrigation fork (MIT).
"""

import logging

from homeassistant.components.binary_sensor import DOMAIN as BINARY_PLATFORM
from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import slugify

from . import const
from .entity import hub_device_info, zone_device_info

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
    async_add_devices(
        [
            SmartIrrigationAnyZoneBinarySensor(
                hass, "any_zone_needs_water", "irrigation_needed", "mdi:water-alert"
            ),
            SmartIrrigationAnyZoneBinarySensor(
                hass, "any_problem", "problem", "mdi:alert-circle-outline"
            ),
        ]
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


class SmartIrrigationAnyZoneBinarySensor(BinarySensorEntity):
    """On while any zone's sensor of one kind is on, on the hub device.

    Reads the per-zone entities themselves, so it says exactly what they say
    (the threshold of each zone, a valve or a calculation problem), and lists
    the zones that are on.
    """

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, hass: HomeAssistant, key: str, suffix: str, icon: str):
        """Initialize, for the per-zone sensors ending in ``suffix``."""
        self._hass = hass
        self._key = key
        self._suffix = suffix
        self.entity_id = f"{BINARY_PLATFORM}.{const.DOMAIN}_{key}"
        self._attr_translation_key = key
        self._attr_icon = icon
        if key == "any_problem":
            self._attr_device_class = BinarySensorDeviceClass.PROBLEM
        self._attr_is_on = False
        self._zones: list = []
        # The entity ids of the per-zone sensors, as they are now: a zone
        # added or an entity renamed changes them.
        self._watched: set = set()

    @property
    def unique_id(self) -> str:
        """Return a stable unique ID."""
        return f"{const.DOMAIN}_{self._key}"

    @property
    def device_info(self) -> dict:
        """On the hub device."""
        return hub_device_info(self._hass)

    @property
    def extra_state_attributes(self) -> dict:
        """The zones whose sensor is on."""
        return {"zones": self._zones}

    def _members(self) -> list:
        registered = (self._hass.data.get(const.DOMAIN) or {}).get(
            "zone_binary_sensors"
        ) or {}
        return [
            entity
            for entities in registered.values()
            for entity in entities
            if getattr(entity, "suffix", None) == self._suffix
            and entity.hass is not None
        ]

    @callback
    def _recompute(self) -> None:
        members = self._members()
        self._watched = {entity.entity_id for entity in members}
        on = [entity for entity in members if entity.is_on]
        self._zones = [entity._zone_name for entity in on]  # noqa: SLF001
        self._attr_is_on = bool(on)

    async def async_added_to_hass(self) -> None:
        """Follow the per-zone sensors: every state they write, the first
        included, and the zones added since."""
        await super().async_added_to_hass()
        self._recompute()

        # A zone just added is not among the members yet when its sensors
        # write their first state: their default entity id says whose they are.
        prefix = f"{BINARY_PLATFORM}.{const.DOMAIN}_"
        ending = f"_{self._suffix}"

        @callback
        def _ours(event_data) -> bool:
            entity_id = event_data.get("entity_id") or ""
            return entity_id in self._watched or (
                entity_id.startswith(prefix) and entity_id.endswith(ending)
            )

        self.async_on_remove(
            self._hass.bus.async_listen(
                EVENT_STATE_CHANGED, self._async_member_changed, event_filter=_ours
            )
        )
        for signal in ("_register_entity", "_config_updated"):
            self.async_on_remove(
                async_dispatcher_connect(
                    self._hass, const.DOMAIN + signal, self._async_member_changed
                )
            )

    @callback
    def _async_member_changed(self, *_args) -> None:
        before = (self._attr_is_on, list(self._zones))
        self._recompute()
        if (self._attr_is_on, self._zones) != before:
            self.async_write_ha_state()


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
        self._attr_is_on = bucket is not None and self._needs_water(zone, bucket)
        if zone:
            self._zone_name = zone.get(const.ZONE_NAME, self._zone_name)

    def _needs_water(self, zone: dict, bucket: float) -> bool:
        """Whether the deficit has reached the point the zone waters at.

        By the same rule as the duration: a zone with an irrigation threshold
        lets the deficit build up to it before watering (#815), and this read
        any deficit as a need, so it said water was needed on days the zone
        would not water and was not meant to.
        """
        if bucket >= 0:
            return False
        # A deficit of a hair, as the first calculation can leave, rounds to a
        # duration of 0 s: nothing waters, so nothing is needed. It said "on"
        # next to "Duration: 0 s".
        duration = zone.get(const.ZONE_DURATION)
        if duration is not None and duration <= 0:
            return False
        try:
            coordinator = self._hass.data[const.DOMAIN]["coordinator"]
            threshold_mm = coordinator.irrigation_threshold_mm(zone)
        except (KeyError, AttributeError, TypeError):
            return True
        if not threshold_mm:
            return True
        # Both in mm, as the zone stores them (units.py).
        return abs(bucket) >= threshold_mm


class SmartIrrigationZoneWateringNowBinarySensor(SmartIrrigationZoneBinarySensor):
    """On while the zone's linked valve/switch is open/on."""

    suffix = "watering_now"
    _attr_device_class = BinarySensorDeviceClass.RUNNING
    _attr_icon = "mdi:sprinkler-variant"

    def __init__(self, hass, entity_id, zone_id, zone_name) -> None:
        """Initialize, with no linked valve tracked yet."""
        super().__init__(hass, entity_id, zone_id, zone_name)
        self._linked = None
        self._unsub_valve = None

    async def async_added_to_hass(self) -> None:
        """Track the linked valve, and rebind it when the zone config changes.

        The linked entity is usually set (or changed) after the zone entity
        already exists, so binding only once at add time missed it entirely and
        the sensor stayed "Not Running" (#768). Re-resolve it on every zone
        config update.
        """
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self._hass,
                const.DOMAIN + "_config_updated",
                self._async_config_updated,
            )
        )
        self.async_on_remove(self._unsubscribe_valve)
        self._resubscribe()

    @callback
    def _async_config_updated(self, zone_id=None) -> None:
        if zone_id is None or zone_id == self._zone_id:
            self._resubscribe()
            self.async_write_ha_state()

    @callback
    def _unsubscribe_valve(self) -> None:
        if self._unsub_valve is not None:
            self._unsub_valve()
            self._unsub_valve = None

    @callback
    def _resubscribe(self) -> None:
        """(Re)bind the state tracker to the zone's current linked valve."""
        zone = self._zone()
        if zone:
            self._zone_name = zone.get(const.ZONE_NAME, self._zone_name)
        linked = zone.get(const.ZONE_LINKED_ENTITY) if zone else None
        if linked != self._linked:
            self._unsubscribe_valve()
            self._linked = linked
            if self._linked:
                self._unsub_valve = async_track_state_change_event(
                    self._hass, [self._linked], self._async_valve_changed
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


class SmartIrrigationZoneProblemBinarySensor(
    SmartIrrigationZoneBinarySensor, RestoreEntity
):
    """On when a valve problem was reported (until the next successful run), or
    while the zone cannot be calculated (until it can)."""

    suffix = "problem"
    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _attr_icon = "mdi:alert-circle-outline"

    def __init__(self, hass, entity_id, zone_id, zone_name) -> None:
        """Initialize, with no reason yet."""
        super().__init__(hass, entity_id, zone_id, zone_name)
        # The valve problem latched by the event; the calculation problem is
        # read from the zone, where it is kept.
        self._valve_on = False
        self._reason = None
        self._calculation = None

    def _calculation_problem(self) -> dict | None:
        zone = self._zone()
        if not zone or zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
            return None
        problem = zone.get(const.ZONE_CALCULATION_PROBLEM)
        return problem if isinstance(problem, dict) else None

    @callback
    def _update_state(self) -> None:
        self._calculation = self._calculation_problem()
        self._attr_is_on = self._valve_on or self._calculation is not None

    async def async_added_to_hass(self) -> None:
        """Listen for the zone-problem event and the zone-irrigated reset.

        The problem is latched until the next successful run, and a restart is
        not one: the state it had before is restored, or a valve that did not
        close last night would show no problem after a restart this morning.
        """
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if (
            last is not None
            and last.state == "on"
            # ``valve_reason`` is None unless a valve problem was latched, also
            # while a calculation problem is on; before it existed, ``reason``
            # was the valve's.
            and last.attributes.get("valve_reason", last.attributes.get("reason"))
        ):
            self._valve_on = True
            self._reason = last.attributes.get(
                "valve_reason", last.attributes.get("reason")
            )
        self._update_state()
        self.async_on_remove(
            async_dispatcher_connect(
                self._hass, const.DOMAIN + "_config_updated", self._async_zone_changed
            )
        )
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
            self._valve_on = True
            self._reason = event.data.get("reason")
            self._update_state()
            self.async_write_ha_state()

    @callback
    def _async_run_ok(self, zone_id=None) -> None:
        if zone_id == self._zone_id and self._valve_on:
            self._valve_on = False
            self._reason = None
            self._update_state()
            self.async_write_ha_state()

    @callback
    def _async_zone_changed(self, zone_id=None) -> None:
        if zone_id is not None and zone_id != self._zone_id:
            return
        before = (self._attr_is_on, self._calculation)
        self._update_state()
        if (self._attr_is_on, self._calculation) != before:
            self.async_write_ha_state()

    @property
    def extra_state_attributes(self) -> dict:
        """Return zone id and the reason: the valve's, else the calculation's."""
        calculation = self._calculation
        return {
            "zone_id": self._zone_id,
            "reason": (
                self._reason if self._valve_on else (calculation or {}).get("code")
            ),
            "valve_reason": self._reason if self._valve_on else None,
            "calculation": calculation,
        }
