"""When each zone is watered next, for the per-zone "next irrigation" sensor.

The answer is the one the panel gives, worked out by the same code: the
Info page's next start (build_irrigation_info) when the start trigger runs the
watering, and the planning (async_planning) in full controller mode, where
programs other than the main one can water a zone sooner. A zone is watered
by a run when it has something to water in it.

It is worked out for every zone at once, since the estimates behind it are
shared, every few minutes and shortly after something changes; the sensors
only read the result. A failure leaves the previous answer in place.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.util import dt as dt_util

from . import const

_LOGGER = logging.getLogger(__name__)

SIGNAL_OUTLOOK_UPDATED = const.DOMAIN + "_zone_outlook_updated"
# Often enough for a start placed on the weather, which moves with it.
REFRESH_INTERVAL = timedelta(minutes=10)
# Something changed: wait for the burst of updates around it to settle.
DEBOUNCE_SECONDS = 30
# The first answer waits for the setup to finish: the coordinator is still
# arming its triggers when the sensor platform is set up.
FIRST_REFRESH_SECONDS = 60
# How far the planning is read for a zone's next run.
PLANNING_DAYS = 7


def _parse(stamp) -> datetime | None:
    if isinstance(stamp, datetime):
        return stamp
    if not stamp:
        return None
    try:
        return dt_util.parse_datetime(stamp)
    except (TypeError, ValueError):
        return None


async def async_zone_next_runs(hass: HomeAssistant, coordinator) -> dict:
    """``{zone_id: {"start": datetime, "seconds": int, "skip": bool} | None}``."""
    from .websockets import (  # noqa: PLC0415 - cycle
        _armed_trigger_start,
        build_irrigation_info,
    )

    zones = await coordinator.store.async_get_zones()
    result = {int(z[const.ZONE_ID]): None for z in zones}
    info = await build_irrigation_info(hass, coordinator)
    if info.get("error"):
        raise RuntimeError(info["error"])
    if info.get("irrigation_enabled") is False:
        # Switched off: no zone has a next run.
        return result
    by_schedules = (
        getattr(coordinator, "main_program_uses_schedules", lambda: False)() is True
    )
    # Not under the "none" trigger, nor while no trigger is armed: the time is
    # then arithmetic, and nothing will start at it (#969).
    trigger_start = None if by_schedules else _parse(_armed_trigger_start(info))
    skip_preview = info.get("skip_preview") or {}
    trigger_skips = bool(skip_preview.get("should_skip"))

    config = coordinator.store.config
    if getattr(config, const.CONF_FULL_CONTROLLER, False) is True:
        planning = await coordinator.async_planning(
            PLANNING_DAYS, trigger_start=trigger_start
        )
        for run in planning:
            start = _parse(run.get("start"))
            if start is None:
                continue
            by_trigger = run.get("schedule_id") is None
            sheltered = set(run.get("sheltered_zone_ids") or [])
            skipped = trigger_skips if by_trigger else bool(run.get("skipped_reason"))
            for step in run.get("steps") or []:
                for member in step.get("zones") or []:
                    zone_id = member.get("zone_id")
                    seconds = int(member.get("seconds") or 0)
                    if zone_id not in result or result[zone_id] is not None:
                        continue
                    if seconds <= 0:
                        continue
                    result[zone_id] = {
                        "start": start,
                        "seconds": seconds,
                        "skip": skipped and zone_id not in sheltered,
                    }
        return result

    if trigger_start is None:
        return result
    estimates = info.get("zone_estimates") or {}
    for zone in zones:
        zone_id = int(zone[const.ZONE_ID])
        if zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED:
            continue
        estimate = estimates.get(str(zone_id))
        seconds = (
            estimate.get("duration")
            if isinstance(estimate, dict)
            and estimate.get("duration") is not None
            and info.get("durations_estimated")
            else zone.get(const.ZONE_DURATION)
        )
        if not isinstance(seconds, (int, float)) or seconds <= 0:
            continue
        result[zone_id] = {
            "start": trigger_start,
            "seconds": int(seconds),
            "skip": trigger_skips,
        }
    return result


class ZoneOutlook:
    """Keeps the zones' next runs, refreshed on a timer and after changes."""

    def __init__(self, hass: HomeAssistant, coordinator) -> None:
        self.hass = hass
        self.coordinator = coordinator
        self.runs: dict = {}
        self._debouncer = Debouncer(
            hass,
            _LOGGER,
            cooldown=DEBOUNCE_SECONDS,
            immediate=False,
            function=self.async_refresh,
        )
        self._unsubs = []

    @callback
    def async_start(self) -> None:
        """Refresh now, then on the timer and after changes."""
        self._unsubs.append(
            async_track_time_interval(self.hass, self._async_tick, REFRESH_INTERVAL)
        )
        for signal in ("_update_frontend", "_config_updated"):
            self._unsubs.append(
                async_dispatcher_connect(
                    self.hass, const.DOMAIN + signal, self._async_changed
                )
            )
        self._unsubs.append(
            async_call_later(self.hass, FIRST_REFRESH_SECONDS, self._async_tick)
        )

    @callback
    def async_stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        self._debouncer.async_cancel()

    async def _async_tick(self, _now=None) -> None:
        await self.async_refresh()

    @callback
    def _async_changed(self, *_args) -> None:
        self.hass.async_create_task(self._debouncer.async_call())

    async def async_refresh(self) -> None:
        try:
            self.runs = await async_zone_next_runs(self.hass, self.coordinator)
        except Exception as e:  # noqa: BLE001 - keep the last answer
            _LOGGER.debug("Could not work out the zones' next runs: %s", e)
            return
        async_dispatcher_send(self.hass, SIGNAL_OUTLOOK_UPDATED)
