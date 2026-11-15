"""Water flowing while every valve is closed (opt-in).

A zone's cumulative volume meter (observed watering) is watched between the
runs too. When it counts more than "Alert when this many litres flow with
every valve closed" while none of the zones it measures has a valve open, nor
had one open a moment ago, a leak is told:

- the event ``smart_irrigation_leak`` (meter, litres, zones), for an
  automation that closes a main valve;
- the hub's Leak binary sensor;
- a repair in Home Assistant;
- the programs' notifications, at once.

It clears by itself once the meter has stood still for a while. The meter must
measure the garden only: a house meter counts the taps and the washing machine.
"""

from __future__ import annotations

import logging
from collections.abc import Callable

from homeassistant.core import Event, EventStateChangedData, callback
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
)

from . import const
from .observed_watering import ObservedWateringMixin

_LOGGER = logging.getLogger(__name__)

_ON_STATES = ("on", "open", "opening", "closing")
# After a valve closes, the pipe drains and a meter reports late: not a leak.
SETTLE_SECONDS = 180.0
# The meter standing still this long ends the leak.
QUIET_SECONDS = 1800.0
ISSUE_PREFIX = "leak_"
SIGNAL_LEAK = const.DOMAIN + "_leak_changed"


def issue_id(meter: str) -> str:
    return ISSUE_PREFIX + meter.replace(".", "_")


class LeakWatchMixin(ObservedWateringMixin):
    """Watch the zones' meters between the runs."""

    _leak_unsub: Callable[[], None] | None
    _leak_baseline: dict[str, float]
    _leak_closed_at: dict[str, float]
    _leaks: dict[str, float]
    _leak_quiet: dict[str, Callable[[], None]]
    _leak_meters: dict[str, list[int]]
    _leak_valves: dict[str, str]

    # --- reading ----------------------------------------------------------

    def _leak_limit(self) -> float:
        try:
            return max(
                0.0, float(getattr(self.store.config, const.CONF_LEAK_ALERT_LITRES, 0))
            )
        except (TypeError, ValueError):
            return 0.0

    def leaking_meters(self) -> dict[str, float]:
        """The meters counting with every valve closed, and how many litres."""
        return dict(getattr(self, "_leaks", None) or {})

    def _valves_of(self, zone: dict) -> list[str]:
        valves = [zone.get(const.ZONE_LINKED_ENTITY)]
        valves += list(zone.get(const.ZONE_EXTRA_ENTITIES) or [])
        return [v for v in valves if v]

    def _meter_busy(self, meter: str) -> bool:
        """Whether a zone of this meter waters, or did a moment ago."""
        now = self.hass.loop.time()
        if now - self._leak_closed_at.get(meter, -1e9) < SETTLE_SECONDS:
            return True
        in_flight = getattr(self, "_run_in_flight", None)
        for zone_id in self._leak_meters.get(meter, []):
            if callable(in_flight) and in_flight(zone_id):
                return True
            zone = self.store.get_zone(zone_id) or {}
            for valve in self._valves_of(zone):
                state = self.hass.states.get(valve)
                if state is not None and state.state in _ON_STATES:
                    return True
        return False

    # --- following the meters -----------------------------------------------

    async def async_setup_observed_watering(self) -> None:
        """The valves and the meters are watched again together: whenever a
        zone or the settings change, which is when the observer is."""
        await super().async_setup_observed_watering()
        await self.async_setup_leak_watch()

    async def async_setup_leak_watch(self) -> None:
        """(Re)watch the meters of the zones; nothing while the option is 0."""
        self.async_teardown_leak_watch()
        self._leak_baseline = {}
        self._leak_closed_at = {}
        self._leaks = getattr(self, "_leaks", None) or {}
        self._leak_quiet = {}
        self._leak_meters = {}
        self._leak_valves = {}
        if self._leak_limit() <= 0:
            for meter in list(self._leaks):
                self._leak_over(meter)
            return
        for zone in await self.store.async_get_zones():
            meter = zone.get(const.ZONE_FLOW_SENSOR)
            if not meter:
                continue
            self._leak_meters.setdefault(meter, []).append(int(zone[const.ZONE_ID]))
            for valve in self._valves_of(zone):
                self._leak_valves[valve] = meter
        if not self._leak_meters:
            return
        for meter in self._leak_meters:
            reading = self._read_volume_litres(meter)
            if reading is not None:
                self._leak_baseline[meter] = reading
        self._leak_unsub = async_track_state_change_event(
            self.hass,
            [*self._leak_meters, *self._leak_valves],
            self._leak_state_changed,
        )

    @callback
    def async_teardown_leak_watch(self) -> None:
        unsub = getattr(self, "_leak_unsub", None)
        if unsub is not None:
            unsub()
        self._leak_unsub = None
        for cancel in (getattr(self, "_leak_quiet", None) or {}).values():
            cancel()
        self._leak_quiet = {}

    @callback
    def _leak_state_changed(self, event: Event[EventStateChangedData]) -> None:
        entity_id = event.data.get("entity_id")
        if entity_id in self._leak_valves:
            new = event.data.get("new_state")
            if new is not None and new.state not in _ON_STATES:
                meter = self._leak_valves[entity_id]
                self._leak_closed_at[meter] = self.hass.loop.time()
            return
        if entity_id in self._leak_meters:
            self._leak_meter_moved(entity_id)

    @callback
    def _leak_meter_moved(self, meter: str) -> None:
        reading = self._read_volume_litres(meter)
        if reading is None:
            return
        baseline = self._leak_baseline.get(meter)
        if baseline is None or reading < baseline or self._meter_busy(meter):
            # Watering, just watered, or a meter that was reset: start again.
            self._leak_baseline[meter] = reading
            return
        litres = reading - baseline
        if litres <= 0:
            return
        self._leak_quiet_later(meter)
        if litres >= self._leak_limit() and meter not in self._leaks:
            self._leak_found(meter, litres)
        elif meter in self._leaks:
            self._leaks[meter] = litres

    @callback
    def _leak_quiet_later(self, meter: str) -> None:
        cancel = self._leak_quiet.pop(meter, None)
        if cancel is not None:
            cancel()

        @callback
        def _quiet(_now) -> None:
            self._leak_quiet.pop(meter, None)
            reading = self._read_volume_litres(meter)
            if reading is not None:
                self._leak_baseline[meter] = reading
            if meter in self._leaks:
                self._leak_over(meter)

        self._leak_quiet[meter] = async_call_later(self.hass, QUIET_SECONDS, _quiet)

    @callback
    def _leak_found(self, meter: str, litres: float) -> None:
        self._leaks[meter] = litres
        zone_ids = self._leak_meters.get(meter, [])
        names = [
            (self.store.get_zone(z) or {}).get(const.ZONE_NAME) or str(z)
            for z in zone_ids
        ]
        _LOGGER.warning(
            "Leak: meter %s counted %.1f L with every valve of %s closed",
            meter,
            litres,
            ", ".join(names),
        )
        ir.async_create_issue(
            self.hass,
            const.DOMAIN,
            issue_id(meter),
            is_fixable=False,
            is_persistent=False,
            severity=ir.IssueSeverity.ERROR,
            translation_key="leak",
            translation_placeholders={
                "meter": meter,
                "litres": f"{litres:.1f}",
                "zones": ", ".join(names),
            },
        )
        self.hass.bus.async_fire(
            f"{const.DOMAIN}_{const.EVENT_LEAK}",
            {
                "flow_sensor": meter,
                "litres": round(litres, 1),
                "zone_ids": zone_ids,
                "zones": names,
            },
        )
        async_dispatcher_send(self.hass, SIGNAL_LEAK)

    @callback
    def _leak_over(self, meter: str) -> None:
        self._leaks.pop(meter, None)
        ir.async_delete_issue(self.hass, const.DOMAIN, issue_id(meter))
        _LOGGER.info("Leak: meter %s stands still again", meter)
        async_dispatcher_send(self.hass, SIGNAL_LEAK)
