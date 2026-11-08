"""Valve platform for Smart Irrigation: one valve per zone (finding 22 of #982).

The zone as Home Assistant's irrigation entities expect it: a ``valve`` that a
dashboard, a voice assistant or ``valve.open_valve`` can open and close.

- Open waters the zone for its calculated duration, the way the zone's
  Irrigate now button and the ``water_zone`` action do: the linked valve is
  opened, closed after the duration, and the zone is credited for the water.
  Behind a run in progress it takes its turn.
- Close stops the zone's watering, as ``stop_watering`` for this zone does: the
  valve closes and what was delivered is credited.
- Open or closed is the linked valve's own state, as for Watering now.

It is there only to act through Smart Irrigation, so it is available while
direct valve control is on and the zone has a linked valve.
"""

from __future__ import annotations

import logging
from collections.abc import Callable
from typing import cast

from homeassistant.components.valve import (
    ValveDeviceClass,
    ValveEntity,
    ValveEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.util import slugify

from . import const
from .entity import zone_device_info

_LOGGER = logging.getLogger(__name__)

VALVE_PLATFORM = "valve"
_VALVE_ON_STATES = ("on", "open", "opening")


def _coordinator(hass: HomeAssistant):
    """The coordinator, or None when not (yet) set up."""
    try:
        return hass.data[const.DOMAIN]["coordinator"]
    except (KeyError, AttributeError, TypeError):
        return None


def _direct_valve_control_enabled(hass: HomeAssistant) -> bool:
    """True while Smart Irrigation opens and closes the valves itself."""
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
    """Set up one valve per zone."""

    @callback
    def async_add_valve_entity(config: dict) -> None:
        """Add the valve of one zone (once)."""
        if const.DOMAIN not in hass.data:
            return
        registered = hass.data[const.DOMAIN].setdefault("zone_valves", {})
        if config["id"] in registered:
            return
        entity = SmartIrrigationZoneValve(
            hass,
            f"{VALVE_PLATFORM}.{const.DOMAIN}_{slugify(config[const.ZONE_NAME])}",
            config[const.ZONE_ID],
            config[const.ZONE_NAME],
        )
        registered[config["id"]] = entity
        async_add_devices([entity])

    # Subscribe before __init__ replays existing zones via "_platform_loaded".
    config_entry.async_on_unload(
        async_dispatcher_connect(
            hass, const.DOMAIN + "_register_entity", async_add_valve_entity
        )
    )


class SmartIrrigationZoneValve(ValveEntity):
    """Water a zone the way Smart Irrigation does, as a valve."""

    _attr_has_entity_name = True
    # The zone's own valve: it takes the zone device's name.
    _attr_name = None
    _attr_should_poll = False
    _attr_device_class = ValveDeviceClass.WATER
    _attr_supported_features = ValveEntityFeature.OPEN | ValveEntityFeature.CLOSE
    _attr_reports_position = False

    def __init__(
        self, hass: HomeAssistant, entity_id: str, zone_id: int, zone_name: str
    ) -> None:
        """Initialize the valve of a zone."""
        self._hass = hass
        self.entity_id = entity_id
        self._zone_id = zone_id
        self._zone_name = zone_name
        self._linked: str | None = None
        self._unsub_valve: Callable[[], None] | None = None
        self._attr_is_closed = True

    def _zone(self) -> dict | None:
        coordinator = _coordinator(self._hass)
        try:
            return coordinator.store.get_zone(self._zone_id) if coordinator else None
        except (AttributeError, TypeError):
            return None

    @property
    def unique_id(self) -> str:
        """A stable per-zone unique id."""
        return f"{const.DOMAIN}_{self._zone_id}_valve"

    @property
    def device_info(self) -> DeviceInfo:
        """On the zone's device."""
        return cast(
            DeviceInfo, zone_device_info(self._hass, self._zone_id, self._zone_name)
        )

    @property
    def available(self) -> bool:
        """Only when Smart Irrigation drives the valves and the zone has one."""
        return bool(self._linked) and _direct_valve_control_enabled(self._hass)

    @property
    def extra_state_attributes(self) -> dict:
        """The zone, as the actions find it, and the valve behind it."""
        return {"zone_id": self._zone_id, "linked_entity": self._linked}

    async def async_added_to_hass(self) -> None:
        """Follow the linked valve, and the zone's changes."""
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self._hass, const.DOMAIN + "_config_updated", self._async_zone_updated
            )
        )
        self.async_on_remove(self._unsubscribe_valve)
        self._resubscribe()

    @callback
    def _async_zone_updated(self, zone_id=None) -> None:
        if zone_id is not None and zone_id != self._zone_id:
            return
        self._resubscribe()
        self.async_write_ha_state()

    @callback
    def _unsubscribe_valve(self) -> None:
        if self._unsub_valve is not None:
            self._unsub_valve()
            self._unsub_valve = None

    @callback
    def _resubscribe(self) -> None:
        """Bind to the zone's linked valve as it is now."""
        zone = self._zone()
        if zone:
            self._zone_name = zone.get(const.ZONE_NAME, self._zone_name)
        linked = zone.get(const.ZONE_LINKED_ENTITY) if zone else None
        if linked != self._linked:
            self._unsubscribe_valve()
            self._linked = linked
            if linked:
                self._unsub_valve = async_track_state_change_event(
                    self._hass, [linked], self._async_valve_changed
                )
        self._recompute()

    @callback
    def _async_valve_changed(self, event) -> None:
        self._recompute()
        self.async_write_ha_state()

    @callback
    def _recompute(self) -> None:
        state = self._hass.states.get(self._linked) if self._linked else None
        self._attr_is_closed = not (state and state.state in _VALVE_ON_STATES)

    async def async_open_valve(self) -> None:
        """Water the zone for its calculated duration."""
        coordinator = _coordinator(self._hass)
        zone = self._zone()
        if coordinator is None or zone is None:
            raise ServiceValidationError(f"Zone {self._zone_id} is not set up")
        if not self.available:
            raise ServiceValidationError(
                f"{self._zone_name}: Smart Irrigation can only open it with direct "
                "valve control on and a valve linked to the zone"
            )
        if zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED:
            raise ServiceValidationError(f"{self._zone_name} is disabled")
        if (zone.get(const.ZONE_DURATION) or 0) <= 0:
            raise ServiceValidationError(
                f"{self._zone_name} has nothing to water: its duration is 0"
            )
        # The run lasts as long as the watering: tracked, not awaited, so it is
        # cancelled cleanly on unload, as the water_zone action's runs are.
        coordinator._spawn_valve_run(coordinator.async_water_zone_now(self._zone_id))

    async def async_close_valve(self) -> None:
        """Stop the zone's watering; what was delivered is credited."""
        coordinator = _coordinator(self._hass)
        zone = self._zone()
        if coordinator is None or zone is None:
            raise ServiceValidationError(f"Zone {self._zone_id} is not set up")
        stopped = await coordinator.async_stop_watering([self._zone_id])
        # A valve opened from outside (by hand, by an automation) is no run of
        # ours, so stopping leaves it open. The valve shows open, so close
        # means close: observed watering credits that run when it does.
        if self._zone_id not in (stopped or []) and not self._attr_is_closed:
            await coordinator._close_valve(dict(zone), self._linked)
