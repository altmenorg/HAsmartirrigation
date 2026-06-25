"""Direct valve control (optional executor).

When enabled, Smart Irrigation drives each zone's linked valve itself: it opens
the valve, waits the calculated duration, then closes it -- no automation to
write. The legacy start event still fires, so external executors keep working;
direct control is purely additive.

Crediting: the runner credits the zone's bucket from the delivered depth
(throughput x run time / size), divided by the zone multiplier so a full run
lands the bucket on target for any multiplier. Because the runner credits its
own runs, the observed-watering observer is told to ignore them (the per-zone
``_si_driven_until`` marker) so the bucket is never accounted twice.

Reboot resilience: each in-flight run is persisted (zone, entity, start time,
duration). On restart, ``async_resume_valve_runs`` recomputes the elapsed time
from the stored start (wall clock, so it correctly includes any downtime during
which the valve physically kept running) and either closes overdue runs or
finishes the remaining time, then credits. A run that overran the
``maximum_duration`` safety cap during a long downtime is closed immediately and
the credit is clamped.

This is adapted, in a much simplified form, from JustChr's Smart Irrigation
fork (https://github.com/JustChr/HAsmartirrigation), MIT.

The methods live on a mixin the SmartIrrigationCoordinator inherits.
"""

import asyncio
import logging

import homeassistant.util.dt as dt_util
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .helpers import convert_between

_LOGGER = logging.getLogger(__name__)

# Grace (seconds) added to a run's own length for the observer-suppression
# window, covering valve-confirm lag and the final close event.
SI_VALVE_SUPPRESS_MARGIN = 30

# How long to wait for a freshly-opened valve to report an on-state before
# treating the run as a failure, and how often to poll.
VALVE_CONFIRM_TIMEOUT = 8.0
VALVE_CONFIRM_POLL = 1.0

# Entity states that count as "the valve actually opened".
_VALVE_ON_STATES = ("on", "open", "opening")
# States that mean "no usable reading" (a write-only valve we cannot verify).
_VALVE_UNUSABLE = (None, "", "unknown", "unavailable")


class ValveRunnerMixin:
    """Open/close linked valves directly and credit the bucket for the run."""

    @staticmethod
    def _valve_services(entity_id: str):
        """Return (domain, on_service, off_service) for a controllable entity.

        ``valve`` entities use open_valve/close_valve; switch/input_boolean/light
        and friends use turn_on/turn_off.
        """
        domain = entity_id.split(".", 1)[0]
        if domain == "valve":
            return domain, "open_valve", "close_valve"
        return domain, "turn_on", "turn_off"

    async def _confirm_valve_running(self, entity_id: str):
        """Wait briefly for a freshly-opened valve to report an on-state.

        Returns True if it reaches an on-state, False if it stays explicitly off
        (a real failure: the run must not be credited), or None when the entity
        is unreadable (a write-only valve we cannot verify, so do not penalise
        it -- proceed as usual).
        """
        deadline = self.hass.loop.time() + VALVE_CONFIRM_TIMEOUT
        while self.hass.loop.time() < deadline:
            state = self.hass.states.get(entity_id)
            if state is not None and state.state in _VALVE_ON_STATES:
                return True
            await asyncio.sleep(VALVE_CONFIRM_POLL)
        state = self.hass.states.get(entity_id)
        if state is None or state.state in _VALVE_UNUSABLE:
            return None
        return state.state in _VALVE_ON_STATES

    def _report_valve_problem(self, zone: dict, entity_id: str, reason: str) -> None:
        """Log and broadcast a per-zone valve problem (e.g. it never opened)."""
        zone_id = int(zone.get(const.ZONE_ID))
        _LOGGER.warning(
            "Direct valve control: zone %s problem (%s) on valve %s",
            zone_id,
            reason,
            entity_id,
        )
        # Fire an event so users can wire a notification automation.
        self.hass.bus.async_fire(
            f"{const.DOMAIN}_{const.EVENT_ZONE_PROBLEM}",
            {
                "zone_id": zone_id,
                "zone": zone.get(const.ZONE_NAME),
                "entity_id": entity_id,
                "reason": reason,
            },
        )

    def _note_si_valve(self, zone_id, seconds: float = 0.0) -> None:
        """Flag that Smart Irrigation itself is driving this zone's valve.

        The observed-watering observer checks this so it does not also credit a
        run the runner already accounts for. The window spans the whole run plus
        a small grace.
        """
        window = (seconds or 0.0) + SI_VALVE_SUPPRESS_MARGIN
        self._si_driven_until[int(zone_id)] = self.hass.loop.time() + window

    def _spawn_valve_run(self, coro):
        """Run a valve coroutine as a tracked background task (cancelled on unload)."""
        task = self.hass.async_create_task(coro)
        self._valve_run_tasks.add(task)
        task.add_done_callback(self._valve_run_tasks.discard)
        return task

    def async_teardown_valve_runs(self) -> None:
        """Cancel any in-flight run tasks (called on unload)."""
        for task in list(self._valve_run_tasks):
            task.cancel()
        self._valve_run_tasks.clear()

    # --- persistence of in-flight runs --------------------------------------

    async def _persist_active_runs(self) -> None:
        runs = [
            {
                const.RUN_ZONE_ID: zid,
                const.RUN_ENTITY_ID: rec["entity"],
                const.RUN_STARTED: rec["started"],
                const.RUN_DURATION: rec["duration"],
            }
            for zid, rec in self._active_valve_runs.items()
        ]
        await self.store.async_update_config({const.CONF_ACTIVE_VALVE_RUNS: runs})

    async def _add_active_run(self, zone_id, entity_id, started, duration) -> None:
        self._active_valve_runs[int(zone_id)] = {
            "entity": entity_id,
            "started": started.isoformat(),
            "duration": float(duration),
        }
        await self._persist_active_runs()

    async def _remove_active_run(self, zone_id) -> None:
        self._active_valve_runs.pop(int(zone_id), None)
        await self._persist_active_runs()

    # --- running ------------------------------------------------------------

    def _eligible_direct_zones(self, zones, zone_ids):
        """Zones with a linked valve, a positive duration, and not disabled."""
        want_all = zone_ids is None or zone_ids == "all"
        target = None if want_all else {int(z) for z in zone_ids}
        eligible = []
        for z in zones:
            if not z.get(const.ZONE_LINKED_ENTITY):
                continue
            if (z.get(const.ZONE_DURATION) or 0) <= 0:
                continue
            if z.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED:
                continue
            if target is not None and int(z.get(const.ZONE_ID)) not in target:
                continue
            eligible.append(z)
        return eligible

    async def async_run_direct_valves(self, zone_ids=None) -> None:
        """Open/run/close every eligible zone, sequentially or in parallel."""
        cfg = self.store.config
        if getattr(cfg, const.CONF_DIRECT_VALVE_CONTROL_ENABLED, False) is not True:
            return
        zones = await self.store.async_get_zones()
        eligible = self._eligible_direct_zones(zones, zone_ids)
        if not eligible:
            _LOGGER.debug("Direct valve control: no eligible zones to run")
            return
        sequencing = getattr(
            cfg, const.CONF_ZONE_SEQUENCING, const.CONF_DEFAULT_ZONE_SEQUENCING
        )
        _LOGGER.info(
            "Direct valve control: running %d zone(s) (%s)",
            len(eligible),
            sequencing,
        )

        # Announce the start, with the zones about to be watered, so an
        # automation can send a "watering started" notification.
        self.hass.bus.async_fire(
            f"{const.DOMAIN}_{const.EVENT_IRRIGATE_STARTED}",
            {
                "sequencing": sequencing,
                "zones": [
                    {
                        "zone_id": int(z.get(const.ZONE_ID)),
                        "zone": z.get(const.ZONE_NAME),
                        "seconds": int(z.get(const.ZONE_DURATION) or 0),
                    }
                    for z in eligible
                ],
            },
        )

        if sequencing == const.CONF_ZONE_SEQUENCING_PARALLEL:
            results = await asyncio.gather(*(self._run_one_valve(z) for z in eligible))
        else:
            results = [await self._run_one_valve(zone) for zone in eligible]

        # Fire a single end-of-watering summary so one automation can report.
        results = [r for r in results if r]
        self.hass.bus.async_fire(
            f"{const.DOMAIN}_{const.EVENT_IRRIGATE_FINISHED}",
            {
                "zones": [
                    {
                        "zone_id": r["zone_id"],
                        "zone": r["zone"],
                        "seconds": r["seconds"],
                        "volume_l": r.get("volume_l", 0),
                        "bucket": r.get("bucket", 0),
                    }
                    for r in results
                    if r["ran"]
                ],
                "problems": [
                    {
                        "zone_id": r["zone_id"],
                        "zone": r["zone"],
                        "reason": r["problem"],
                    }
                    for r in results
                    if not r["ran"]
                ],
            },
        )

    async def _run_one_valve(self, zone: dict):
        """Open one zone's valve, hold it for its duration, close it, credit.

        Returns a result dict ``{zone_id, zone, seconds, ran, problem}`` used to
        build the end-of-watering summary, or None when there was nothing to do.
        """
        zone_id = int(zone.get(const.ZONE_ID))
        zone_name = zone.get(const.ZONE_NAME)
        entity_id = zone.get(const.ZONE_LINKED_ENTITY)
        duration = float(zone.get(const.ZONE_DURATION) or 0)
        if not entity_id or duration <= 0:
            return None
        domain, on_svc, off_svc = self._valve_services(entity_id)
        # Suppress the observer from the moment we send the open command (it must
        # cover the confirm poll and the whole run).
        self._note_si_valve(zone_id, duration + VALVE_CONFIRM_TIMEOUT)
        _LOGGER.info(
            "Direct valve control: opening %s for zone %s (%.0fs)",
            entity_id,
            zone_id,
            duration,
        )
        await self.hass.services.async_call(domain, on_svc, {"entity_id": entity_id})

        # Confirm the valve actually opened before counting/crediting: a valve
        # that never opens would otherwise clear the deficit while running dry
        # (and the missed water silently rolls over to the next day). Only an
        # explicit "still off" aborts; an unverifiable (write-only) valve runs.
        if await self._confirm_valve_running(entity_id) is False:
            await self.hass.services.async_call(
                domain, off_svc, {"entity_id": entity_id}
            )
            self._report_valve_problem(zone, entity_id, "valve_did_not_open")
            return {
                "zone_id": zone_id,
                "zone": zone_name,
                "seconds": 0,
                "ran": False,
                "problem": "valve_did_not_open",
            }

        # Start counting only once the valve is confirmed open.
        started = dt_util.utcnow()
        await self._add_active_run(zone_id, entity_id, started, duration)
        try:
            await asyncio.sleep(duration)
        finally:
            await self.hass.services.async_call(
                domain, off_svc, {"entity_id": entity_id}
            )
        # Clear the persisted run before crediting: a crash in this window then
        # loses at most one credit rather than double-crediting on resume.
        await self._remove_active_run(zone_id)
        # The valve was held for ``duration``; credit that (a cancelled run never
        # reaches here, so its credit comes from the reboot-resume path instead).
        await self._credit_direct_run(zone_id, duration)
        zone_after = self.store.get_zone(zone_id) or {}
        return {
            "zone_id": zone_id,
            "zone": zone_name,
            "seconds": int(duration),
            "volume_l": round(self._gross_volume_litres(zone, duration), 1),
            "bucket": round(float(zone_after.get(const.ZONE_BUCKET) or 0.0), 1),
            "ran": True,
            "problem": None,
        }

    def _gross_volume_litres(self, zone: dict, seconds: float) -> float:
        """Litres actually delivered (throughput x time), for the report."""
        throughput = zone.get(const.ZONE_THROUGHPUT) or 0.0
        if throughput <= 0 or seconds <= 0:
            return 0.0
        ha_metric = self.hass.config.units is METRIC_SYSTEM
        tput_lpm = (
            throughput
            if ha_metric
            else convert_between(const.UNIT_GPM, const.UNIT_LPM, throughput)
        )
        return tput_lpm * seconds / 60.0

    async def _credit_direct_run(self, zone_id: int, elapsed: float) -> None:
        """Credit the bucket for a completed direct run of ``elapsed`` seconds."""
        if elapsed <= 0:
            return
        zone = self.store.get_zone(zone_id)
        if zone is None:
            return
        throughput = zone.get(const.ZONE_THROUGHPUT) or 0.0
        size = zone.get(const.ZONE_SIZE) or 0.0
        if throughput <= 0 or size <= 0:
            _LOGGER.warning(
                "Direct valve control: zone %s has no size/throughput, "
                "bucket not credited",
                zone_id,
            )
            return
        multiplier = zone.get(const.ZONE_MULTIPLIER) or 1.0
        if multiplier <= 0:
            multiplier = 1.0
        # Clamp the credited time to the safety cap (a long downtime overrun must
        # not credit unbounded water).
        max_duration = zone.get(const.ZONE_MAXIMUM_DURATION)
        credit_seconds = elapsed
        if max_duration and credit_seconds > max_duration:
            credit_seconds = float(max_duration)

        ha_metric = self.hass.config.units is METRIC_SYSTEM
        tput_lpm = (
            throughput
            if ha_metric
            else convert_between(const.UNIT_GPM, const.UNIT_LPM, throughput)
        )
        # Divide the multiplier back out: the duration inflated the run as part
        # of the "need", so a full run lands the bucket on target.
        volume_l = tput_lpm * (credit_seconds / 60.0) / multiplier
        await self._apply_volume_credit(
            zone, volume_l, source=f"direct run {elapsed:.0f}s"
        )

    # --- reboot resume ------------------------------------------------------

    async def async_resume_valve_runs(self) -> None:
        """Resume or close direct runs that were in flight before a restart."""
        runs = list(getattr(self.store.config, const.CONF_ACTIVE_VALVE_RUNS, []) or [])
        if not runs:
            return
        _LOGGER.info(
            "Direct valve control: resuming %d in-flight run(s) after restart",
            len(runs),
        )
        for run in runs:
            try:
                zid = int(run.get(const.RUN_ZONE_ID))
            except (TypeError, ValueError):
                continue
            self._active_valve_runs[zid] = {
                "entity": run.get(const.RUN_ENTITY_ID),
                "started": run.get(const.RUN_STARTED),
                "duration": float(run.get(const.RUN_DURATION) or 0),
            }
        for run in runs:
            self._spawn_valve_run(self._resume_one(run))

    async def _resume_one(self, run: dict) -> None:
        zone_id = int(run.get(const.RUN_ZONE_ID))
        entity_id = run.get(const.RUN_ENTITY_ID)
        duration = float(run.get(const.RUN_DURATION) or 0)
        started = dt_util.parse_datetime(run.get(const.RUN_STARTED) or "")
        if started is None or not entity_id:
            await self._remove_active_run(zone_id)
            return
        elapsed = (dt_util.utcnow() - started).total_seconds()
        domain, on_svc, off_svc = self._valve_services(entity_id)

        if elapsed >= duration:
            if elapsed > duration + 5:
                _LOGGER.warning(
                    "Direct valve control: zone %s overran during downtime "
                    "(%.0fs >= %.0fs); closing now",
                    zone_id,
                    elapsed,
                    duration,
                )
            await self.hass.services.async_call(
                domain, off_svc, {"entity_id": entity_id}
            )
            await self._remove_active_run(zone_id)
            await self._credit_direct_run(zone_id, elapsed)
            return

        remaining = duration - elapsed
        self._note_si_valve(zone_id, remaining + VALVE_CONFIRM_TIMEOUT)
        _LOGGER.info(
            "Direct valve control: zone %s resuming, %.0fs of %.0fs remaining",
            zone_id,
            remaining,
            duration,
        )
        # Re-assert open: the valve should still be on after an HA reboot, but a
        # power cut may have reset it. Confirm before finishing/crediting.
        await self.hass.services.async_call(domain, on_svc, {"entity_id": entity_id})
        if await self._confirm_valve_running(entity_id) is False:
            await self.hass.services.async_call(
                domain, off_svc, {"entity_id": entity_id}
            )
            await self._remove_active_run(zone_id)
            self._report_valve_problem(
                self.store.get_zone(zone_id) or {const.ZONE_ID: zone_id},
                entity_id,
                "valve_did_not_open",
            )
            return
        try:
            await asyncio.sleep(remaining)
        finally:
            await self.hass.services.async_call(
                domain, off_svc, {"entity_id": entity_id}
            )
        await self._remove_active_run(zone_id)
        await self._credit_direct_run(zone_id, duration)
