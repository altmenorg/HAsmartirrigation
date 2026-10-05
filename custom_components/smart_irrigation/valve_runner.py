"""Direct valve control (optional executor).

When enabled, Smart Irrigation drives each zone's linked valve itself: it opens
the valve, waits the calculated duration, then closes it -- no automation to
write. The legacy start event still fires, so external executors keep working;
direct control is purely additive.

Crediting: the runner credits the zone's bucket with the depth its water
applied (precipitation rate x run time), the lead time excluded since it only
fills the pipe. Because the runner credits its own runs, the observed-watering observer is told to ignore them (the per-zone
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
import json
import logging
import math
from collections import deque
from datetime import datetime, timedelta
from functools import partial

import homeassistant.util.dt as dt_util

from . import const
from .observed_watering import NO_FLOW_GRACE
from .program_runner import ProgramRunnerMixin
from .supply_runner import SupplyRunnerMixin

_LOGGER = logging.getLogger(__name__)

# Grace (seconds) added to a run's own length for the observer-suppression
# window, covering valve-confirm lag and the final close event.
SI_VALVE_SUPPRESS_MARGIN = 30

# How long to wait for a freshly-opened valve to report an on-state before
# treating the run as a failure, and how often to poll.
VALVE_CONFIRM_TIMEOUT = 8.0
VALVE_CONFIRM_POLL = 1.0

# How long a run waits for a linked valve service to return. Generous, since the
# point of waiting is to let a template or proxy finish its own safety steps.
VALVE_SERVICE_TIMEOUT = 30.0

# How long a closed valve is given to report it closed, how often it is read,
# and how long to wait before the second close after a failed one.
VALVE_CLOSE_TIMEOUT = 5.0
VALVE_CLOSE_POLL = 1.0
VALVE_CLOSE_RETRY_DELAY = 3.0

# Entity states that count as "the valve actually opened".
_VALVE_ON_STATES = ("on", "open", "opening")
# States that mean "no usable reading" (a write-only valve we cannot verify).
_VALVE_UNUSABLE = (None, "", "unknown", "unavailable")

# Reasons carried by the zone_problem event and the end-of-watering summary.
PROBLEM_DID_NOT_OPEN = "valve_did_not_open"
PROBLEM_DID_NOT_CLOSE = "valve_did_not_close"
PROBLEM_NO_FLOW = "no_flow"
# Not a fault: the zone's run was stopped before it delivered anything.
PROBLEM_STOPPED = "stopped"


class RunControl:
    """What can be asked of a zone's run while it is under way.

    One per zone, from the moment the zone is claimed to the last close. A stop
    is conserved here rather than acted on at once, because a run that is
    between two awaits (opening, confirming, soaking) only sees it when it next
    waits, and a stop asked for while it was not waiting must not be lost.
    """

    def __init__(self) -> None:
        self.stop = asyncio.Event()
        # Seconds the valve had been open when the run was stopped.
        self.delivered: float | None = None


def setting(config, key: str, default: float) -> float:
    """A positive number from the configuration, or the default if it is not one.

    ``config`` is the stored object here and a plain dict where it comes back
    from ``async_get_config``, and both call sites matter: the runner splits a
    run into passes, and the start trigger has to work back from the same
    wall clock.
    """
    raw = (
        config.get(key, default)
        if isinstance(config, dict)
        else getattr(config, key, default)
    )
    try:
        return max(0.0, float(raw))
    except (TypeError, ValueError):
        return float(default)


def pass_plan(config, duration: float) -> list:
    """The passes a run of ``duration`` seconds is watered in.

    Cycle and soak: the same water, in shorter passes with a pause between
    them, so heavy soil takes it in instead of letting it run off the surface.
    The number of passes comes down until each one is worth opening a valve
    for, so a four-minute run is never cut into six forty-second ones.
    """
    passes = int(
        setting(config, const.CONF_WATERING_PASSES, const.CONF_DEFAULT_WATERING_PASSES)
    )
    return split_into_passes(passes, duration)


def split_into_passes(passes: int, duration: float) -> list:
    """``duration`` seconds of water in ``passes`` equal passes, never too short."""
    passes = max(1, min(int(passes), const.CONF_MAX_WATERING_PASSES))
    while passes > 1 and duration / passes < const.MIN_PASS_SECONDS:
        passes -= 1
    return [duration / passes] * passes


def soak_seconds(config) -> float:
    """How long a zone soaks between two passes, in seconds."""
    return (
        setting(config, const.CONF_SOAK_MINUTES, const.CONF_DEFAULT_SOAK_MINUTES) * 60.0
    )


def wall_clock_seconds(config, duration: float, lead: float = 0.0) -> float:
    """How long a zone's run takes end to end, soaking included.

    The watering is the same either way; the soaking is time the run occupies
    without watering, which is exactly what a trigger that must finish at
    sunrise has to know about.

    ``lead`` is the zone's lead time. The duration holds it once, but the
    runner fills the pipe again on every pass, so each extra pass adds it once
    more. The passes are planned on the water alone, as the runner does.
    """
    if duration <= 0:
        return 0.0
    try:
        lead = min(max(0.0, float(lead or 0.0)), duration)
    except (TypeError, ValueError):
        lead = 0.0
    extra = len(pass_plan(config, duration - lead)) - 1
    return duration + (soak_seconds(config) + lead) * extra


class ValveRunnerMixin(SupplyRunnerMixin, ProgramRunnerMixin):
    """Open/close linked valves directly and credit the bucket for the run."""

    def _run_controls(self) -> dict:
        """The controls of the zones being watered, by zone id."""
        controls = getattr(self, "_zone_run_controls", None)
        if controls is None:
            controls = self._zone_run_controls = {}
        return controls

    async def _wait_or_stop(self, zone_id, seconds: float) -> bool:
        """Wait ``seconds``, or less if the zone's run is stopped. True if stopped.

        The wait is the runner's own ``asyncio.sleep``, raced against the stop,
        so a run that nobody stops waits exactly as it always did.
        """
        control = self._run_controls().get(int(zone_id))
        if control is None:
            await asyncio.sleep(seconds)
            return False
        return await self._sleep_or_stop(control.stop, seconds)

    @staticmethod
    async def _sleep_or_stop(stop: asyncio.Event, seconds: float) -> bool:
        """Wait ``seconds`` or until ``stop`` is set. True if it was set."""
        if stop.is_set():
            return True
        sleeper = asyncio.ensure_future(asyncio.sleep(seconds))
        stopper = asyncio.ensure_future(stop.wait())
        try:
            await asyncio.wait({sleeper, stopper}, return_when=asyncio.FIRST_COMPLETED)
        finally:
            # A cancellation (a reload) must not leave either one running.
            for task in (sleeper, stopper):
                if not task.done():
                    task.cancel()
        return stop.is_set()

    async def async_stop_watering(self, zone_ids=None) -> list:
        """Stop the zones being watered or waiting their turn. Returns their ids.

        A zone being watered has its valve closed and is credited for the water
        it delivered; one still in the queue of a sequential cycle is taken out
        of it. ``zone_ids`` None, or "all", stops everything.
        """
        want_all = zone_ids is None or zone_ids == "all"
        target = None if want_all else {int(z) for z in zone_ids}
        stopped = []
        cycle = self._sequential_cycle
        if cycle is not None:
            keep = deque()
            for queued in cycle["queue"]:
                zone_id = int(queued.get(const.ZONE_ID))
                if target is None or zone_id in target:
                    cycle["queued"].discard(zone_id)
                    stopped.append(zone_id)
                else:
                    keep.append(queued)
            cycle["queue"] = keep
            await self._persist_cycle()
        if target is None:
            # Everything: the programs waiting or running end after the zone.
            for run in self._program_registry().values():
                run.stop.set()
        for zone_id, control in self._run_controls().items():
            if target is None or zone_id in target:
                control.stop.set()
                if zone_id not in stopped:
                    stopped.append(zone_id)
        if stopped:
            _LOGGER.info(
                "Direct valve control: watering stopped for zone(s) %s",
                ", ".join(str(z) for z in stopped),
            )
        return stopped

    @staticmethod
    def _valve_services(entity_id: str):
        """Return (domain, on_service, off_service) for a controllable entity.

        ``valve`` entities use open_valve/close_valve; switch/input_boolean/light
        and friends use turn_on/turn_off.
        """
        domain = entity_id.split(".", 1)[0]
        if domain == "valve":
            return domain, "open_valve", "close_valve"
        if domain == "cover":
            return domain, "open_cover", "close_cover"
        return domain, "turn_on", "turn_off"

    def _log_late_valve_service(self, entity_id: str, task) -> None:
        """Report how a valve service that outlived its wait ended up."""
        if task.cancelled():
            return
        if exc := task.exception():
            _LOGGER.error("Valve service for %s failed: %s", entity_id, exc)
        else:
            _LOGGER.info("Valve service for %s finished after the wait", entity_id)

    async def _async_call_valve_service(
        self, domain: str, service: str, entity_id: str
    ) -> None:
        """Run a valve service to completion before evaluating its state.

        A linked entity may itself be a template or proxy whose action performs
        several safety checks. Waiting for the service prevents the confirmation
        window from racing those checks or the close from racing run crediting.

        The wait is bounded: a linked script that blocks forever would otherwise
        stall the run, leaving the water uncredited, the persisted run dangling
        and, in sequential mode, every later zone waiting behind it. Giving up on
        the wait leaves the service running in Home Assistant (asyncio.wait does
        not cancel it); it only stops the run from hanging on it.
        """
        task = self.hass.async_create_task(
            self.hass.services.async_call(
                domain, service, {"entity_id": entity_id}, blocking=True
            )
        )
        done, _ = await asyncio.wait({task}, timeout=VALVE_SERVICE_TIMEOUT)
        if task in done:
            # Surface a service that actually failed, as a plain await would.
            task.result()
            return
        _LOGGER.warning(
            "Valve service %s.%s for %s did not complete within %ss; "
            "continuing without waiting for it",
            domain,
            service,
            entity_id,
            VALVE_SERVICE_TIMEOUT,
        )
        task.add_done_callback(partial(self._log_late_valve_service, entity_id))

    async def _arm_safety_off(self, zone: dict, held: float) -> None:
        """Arm a hardware dead-man on the zone's valve, if one is configured.

        Publishes an "on with timed off" to the zone's MQTT set-topic so the
        device shuts its own valve off after ``held`` + a margin, should Home
        Assistant die mid-run and never send the close. This is purely a safety
        net alongside the normal close in ``_run_one_pass``'s finally block: the
        run is still driven by Home Assistant, the on_time only bounds it.

        A missing topic, an MQTT stack that is not set up, or any publish error
        must never break the run (the close still happens the usual way), so the
        whole thing is best-effort and swallows its failures with a warning.
        """
        topic = zone.get(const.ZONE_SAFETY_OFF_TOPIC)
        if not topic:
            return
        key = (
            zone.get(const.ZONE_SAFETY_OFF_STATE_KEY)
            or const.CONF_DEFAULT_SAFETY_OFF_STATE_KEY
        )
        on_time = int(math.ceil(max(0.0, held))) + const.SAFETY_OFF_TIME_MARGIN
        payload = json.dumps({key: "ON", "on_time": on_time})
        try:
            # Imported lazily: mqtt is an after_dependency, so the integration
            # loads without it; we only reach here when a topic is configured.
            from homeassistant.components import mqtt

            await mqtt.async_publish(self.hass, topic, payload, qos=0, retain=False)
            _LOGGER.debug(
                "Direct valve control: armed safety off_time %ss on %s", on_time, topic
            )
        except Exception as e:  # noqa: BLE001 - safety must never break a run
            _LOGGER.warning(
                "Direct valve control: could not arm safety off_time on %s "
                "(MQTT unavailable?): %s",
                topic,
                e,
            )

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

    def _reads_open_since(self, entity_id: str, moment) -> bool:
        """Whether the valve still reads open, in a state older than ``moment``.

        Only a state that has not changed since the close was asked for says the
        valve ignored it: one that changed after it is somebody opening the
        valve again. A reading that carries no time cannot tell the two apart,
        and like a write-only valve it is not held against the close.
        """
        state = self.hass.states.get(entity_id)
        if state is None or state.state not in _VALVE_ON_STATES:
            return False
        changed = getattr(state, "last_changed", None)
        if not isinstance(changed, datetime):
            return False
        return changed <= moment

    async def _still_open_after_close(self, entity_id: str, asked) -> bool:
        """Give a closed valve a few seconds to report it, and say if it did not."""
        deadline = self.hass.loop.time() + VALVE_CLOSE_TIMEOUT
        while self._reads_open_since(entity_id, asked):
            if self.hass.loop.time() >= deadline:
                return True
            await asyncio.sleep(VALVE_CLOSE_POLL)
        return False

    async def _close_valve(self, zone: dict, entity_id: str) -> bool:
        """Close the valve, check that it closed, and say so when it did not.

        The close used to be a bare service call. One that raised (a renamed
        entity, a failing script) skipped everything after it: the run stayed
        recorded as in flight, so the zone was "already running" at every start
        until a restart, and nothing said the valve might still be open.

        Never raises, except for a cancellation. Tries twice, then fires the
        zone_problem event with ``valve_did_not_close``. Returns whether the
        valve is closed, or at least not known to be open.
        """
        domain, _on_svc, off_svc = self._valve_services(entity_id)
        for attempt in range(2):
            asked = dt_util.utcnow()
            failed = False
            try:
                await self._async_call_valve_service(domain, off_svc, entity_id)
            except Exception as e:  # noqa: BLE001 - the run must be cleared
                failed = True
                _LOGGER.error(
                    "Direct valve control: closing %s failed: %s", entity_id, e
                )
            if not failed and not await self._still_open_after_close(entity_id, asked):
                return True
            if attempt == 0:
                _LOGGER.warning(
                    "Direct valve control: %s did not close, trying again", entity_id
                )
                if failed:
                    await asyncio.sleep(VALVE_CLOSE_RETRY_DELAY)
        self._report_valve_problem(zone, entity_id, PROBLEM_DID_NOT_CLOSE)
        return False

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
        # Only ever extended: a pass renewing it must not cut short the window
        # already set for the rest of the cycle.
        until = self.hass.loop.time() + window
        zone_id = int(zone_id)
        self._si_driven_until[zone_id] = max(
            until, self._si_driven_until.get(zone_id, until)
        )
        # The runner owns the valve from here. A run the observer had started
        # tracking would otherwise be credited on close, the whole window of
        # it, on top of the runner's own credit for the same water.
        for name in ("_observed_on_since", "_observed_flow_start"):
            markers = getattr(self, name, None)
            if isinstance(markers, dict):
                markers.pop(zone_id, None)

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

    async def _persist_cycle(self) -> None:
        """Record the zones the sequential cycle still has to water.

        The zone being watered stays in the record until it has finished: after
        a restart it is either resumed from its own run record, or already
        credited (its duration spent), and the cycle skips it either way. One
        taken out of the record at the moment it opened could be lost in the gap
        before its run record is written.
        """
        cycle = self._sequential_cycle
        if cycle is None:
            value = None
        else:
            ids = list(cycle.get("current") or [])
            ids += [int(z.get(const.ZONE_ID)) for z in cycle["queue"]]
            value = {
                "zones": ids,
                "sequencing": const.CONF_ZONE_SEQUENCING_SEQUENTIAL,
                "started": cycle.get("started"),
            }
        await self.store.async_update_config({const.CONF_ACTIVE_CYCLE: value})

    # --- running ------------------------------------------------------------

    def _claimed_zone_ids(self) -> set:
        """The zones a run of ours has taken, from its first open to its last close.

        The in-flight record only covers a pass from its confirmed open to its
        close. Between two passes (the soak) and while a valve is being
        confirmed open, the zone was not recorded, so a second dispatch could
        open the same valve and both runs credited the bucket. In memory only:
        a restart resumes from the persisted record.
        """
        claimed = getattr(self, "_claimed_zones", None)
        if claimed is None:
            claimed = self._claimed_zones = set()
        return claimed

    def _run_in_flight(self, zone_id) -> bool:
        """Whether a run of ours has this zone's valve, soaking included."""
        zone_id = int(zone_id)
        return zone_id in self._active_valve_runs or zone_id in self._claimed_zone_ids()

    def _watered_from_outside(self, zone_id) -> bool:
        """Whether something other than Smart Irrigation has this zone's valve
        open right now, as the observed-watering tracker saw it open.

        Running such a zone would hold its valve for our duration, close it
        under the other run, and credit the overlap twice: once for our run,
        once when the tracker credits the external run on close.
        """
        return int(zone_id) in getattr(self, "_observed_on_since", {})

    def _busy(self, zone_id) -> bool:
        """Whether this zone's valve is open, by us or from outside."""
        return self._run_in_flight(zone_id) or self._watered_from_outside(zone_id)

    def _watered_since(self, zone_id, moment: float) -> bool:
        """Whether our own runner already finished a run on this zone since
        ``moment`` (the loop clock)."""
        return self._direct_run_finished.get(int(zone_id), 0.0) > moment

    def _eligible_direct_zones(self, zones, zone_ids):
        """Zones with a linked valve, a positive duration, and not disabled.

        A zone whose valve is already open is left out, whether we hold it or
        something else opened it: asking to water it again while it runs would
        open the valve a second time and credit the bucket twice for water
        delivered once.
        """
        want_all = zone_ids is None or zone_ids == "all"
        target = None if want_all else {int(z) for z in zone_ids}
        eligible = []
        for z in zones:
            if not z.get(const.ZONE_LINKED_ENTITY):
                continue
            if self._run_in_flight(z.get(const.ZONE_ID)):
                _LOGGER.info(
                    "Direct valve control: zone %s is already running, skipped",
                    z.get(const.ZONE_ID),
                )
                continue
            if self._watered_from_outside(z.get(const.ZONE_ID)):
                _LOGGER.info(
                    "Direct valve control: zone %s is being watered outside "
                    "Smart Irrigation, skipped",
                    z.get(const.ZONE_ID),
                )
                continue
            if (z.get(const.ZONE_DURATION) or 0) <= 0:
                continue
            if z.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED:
                continue
            if target is not None and int(z.get(const.ZONE_ID)) not in target:
                continue
            eligible.append(z)
        return eligible

    def _positive_setting(self, key: str, default: float) -> float:
        return setting(self.store.config, key, default)

    def _pass_plan(self, duration: float) -> list:
        return pass_plan(self.store.config, duration)

    def _soak_seconds(self) -> float:
        return soak_seconds(self.store.config)

    def _announce_start(self, sequencing, zones) -> None:
        """Say which zones are about to be watered, so an automation can too."""
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
                    for z in zones
                ],
            },
        )

    def _join_sequential_cycle(self, eligible) -> list:
        """Add zones to the sequential cycle already under way, and say which.

        One zone at a time is the promise of sequential watering, and a second
        dispatch used to break it: the nightly run watering zone 1 with 2 and 3
        waiting, then "irrigate now" on zone 4, opened two valves at once,
        because each dispatch ran a cycle of its own. A dispatch now joins the
        cycle that is running instead of racing it.

        Two zones are not queued: one already waiting in the cycle, and the one
        whose valve is open right now. The second is not in the queue any more,
        having been taken out of it to be watered, so the in-flight record is
        what identifies it.
        """
        cycle = self._sequential_cycle
        added = []
        for zone in eligible:
            zone_id = int(zone.get(const.ZONE_ID))
            if zone_id in cycle["queued"] or self._busy(zone_id):
                continue
            cycle["queued"].add(zone_id)
            cycle["queue"].append(zone)
            added.append(zone)
        return added

    async def async_run_direct_valves(self, zone_ids=None) -> None:
        """Open/run/close every eligible zone, sequentially or in parallel.

        In full controller mode a cycle takes its turn behind a program that is
        running (and the other way round): one at a time, whatever starts them.
        """
        cfg = self.store.config
        if getattr(cfg, const.CONF_DIRECT_VALVE_CONTROL_ENABLED, False) is not True:
            return
        if getattr(cfg, const.CONF_FULL_CONTROLLER, False) is True:
            async with self._executor_lock():
                await self._run_direct_valves(zone_ids)
            return
        await self._run_direct_valves(zone_ids)

    async def _run_direct_valves(self, zone_ids=None) -> None:
        cfg = self.store.config
        # The moment this cycle starts, on the loop clock. A zone watered by
        # another cycle while this one waits its turn is not watered again:
        # pressing "irrigate now" on a zone queued behind others used to run it
        # twice, once on request and once when the queue reached it.
        cycle_start = self.hass.loop.time()
        zones = await self.store.async_get_zones()
        eligible = self._eligible_direct_zones(zones, zone_ids)
        if not eligible:
            _LOGGER.debug("Direct valve control: no eligible zones to run")
            return
        sequencing = getattr(
            cfg, const.CONF_ZONE_SEQUENCING, const.CONF_DEFAULT_ZONE_SEQUENCING
        )

        if sequencing == const.CONF_ZONE_SEQUENCING_PARALLEL:
            # Every zone at once is what this setting asks for, so two
            # dispatches overlapping is not a contradiction, and there is no
            # queue for one to join.
            _LOGGER.info(
                "Direct valve control: running %d zone(s) (parallel)", len(eligible)
            )
            self._announce_start(sequencing, eligible)
            results = await asyncio.gather(*(self._run_one_valve(z) for z in eligible))
            self._report_finished(results)
            return

        if self._sequential_cycle is not None:
            added = self._join_sequential_cycle(eligible)
            if not added:
                _LOGGER.info(
                    "Direct valve control: every zone asked for is already "
                    "running or waiting in the cycle under way"
                )
                return
            _LOGGER.info(
                "Direct valve control: %d zone(s) joined the cycle under way: %s",
                len(added),
                ", ".join(str(z.get(const.ZONE_ID)) for z in added),
            )
            # Announced on their own, because they were not part of what the
            # running cycle said it would water.
            self._announce_start(sequencing, added)
            await self._persist_cycle()
            return

        _LOGGER.info(
            "Direct valve control: running %d zone(s) (sequential)", len(eligible)
        )
        self._announce_start(sequencing, eligible)
        self._sequential_cycle = {
            "queue": deque(eligible),
            "queued": {int(z.get(const.ZONE_ID)) for z in eligible},
            "results": [],
            "current": [],
            "started": dt_util.utcnow().isoformat(),
        }
        cycle = self._sequential_cycle
        cancelled = False
        await self._persist_cycle()
        # Whether the pause between zones was already taken since the last
        # valve closed: a zone skipped after it must not cost a second one.
        rested = False
        try:
            while cycle["queue"]:
                queued = cycle["queue"].popleft()
                zone_id = queued.get(const.ZONE_ID)
                cycle["queued"].discard(int(zone_id))
                cycle["current"] = [int(zone_id)]
                # Re-checked here rather than only up front: a sequential cycle
                # dispatches each zone minutes or hours after it was listed.
                zone = self._zone_at_its_turn(queued, cycle_start)
                if zone is None:
                    continue
                if cycle["results"] and not rested:
                    # Time for the line pressure to recover, or for a slow
                    # valve to finish closing before the next one opens.
                    pause = self._positive_setting(
                        const.CONF_PAUSE_BETWEEN_ZONES,
                        const.CONF_DEFAULT_PAUSE_BETWEEN_ZONES,
                    )
                    if pause:
                        await asyncio.sleep(pause)
                        rested = True
                        # The valve may have been opened by hand meanwhile.
                        zone = self._zone_at_its_turn(queued, cycle_start)
                        if zone is None:
                            continue
                rested = False
                try:
                    cycle["results"].append(await self._run_one_valve(zone))
                except Exception as e:  # noqa: BLE001 - one zone is one zone
                    # The zones still waiting are owed their water whatever
                    # happened to this one.
                    _LOGGER.error(
                        "Direct valve control: zone %s failed: %s", zone_id, e
                    )
                cycle["current"] = []
                await self._persist_cycle()
            results = cycle["results"]
        except asyncio.CancelledError:
            # A restart or a reload: the record stays, for the next start to
            # go on with the zones that were waiting.
            cancelled = True
            raise
        finally:
            self._sequential_cycle = None
            if not cancelled:
                await self._persist_cycle()

        self._report_finished(results)

    def _zone_at_its_turn(self, queued: dict, cycle_start: float):
        """The zone to water now that the queue has reached it, or None.

        The queue holds the zone as it was when the cycle started. Since then
        it may have been watered by hand (the observer credited it and set its
        duration to 0), disabled, unlinked or edited: what is watered is the
        zone as it is now, with the duration it has now.
        """
        zone_id = int(queued.get(const.ZONE_ID))
        if self._busy(zone_id) or self._watered_since(zone_id, cycle_start):
            _LOGGER.info(
                "Direct valve control: zone %s was watered while it "
                "waited its turn, skipped",
                zone_id,
            )
            return None
        fresh = self.store.get_zone(zone_id)
        if fresh is None:
            _LOGGER.info(
                "Direct valve control: zone %s was removed while it waited "
                "its turn, skipped",
                zone_id,
            )
            return None
        if not isinstance(fresh, dict) or int(fresh.get(const.ZONE_ID, -1)) != zone_id:
            # Not a copy of this zone: keep the one the cycle was given.
            fresh = queued
        if not self._eligible_direct_zones([fresh], [zone_id]):
            _LOGGER.info(
                "Direct valve control: zone %s no longer needs watering or was "
                "disabled while it waited its turn, skipped",
                zone_id,
            )
            return None
        return fresh

    def _report_finished(self, results) -> None:
        """One end-of-watering summary for the whole cycle, joined zones and all."""
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
                    if not r["ran"] and not r.get("stopped")
                ],
                "stopped": [r["zone_id"] for r in results if r.get("stopped")],
            },
        )

    async def _run_one_valve(self, zone: dict, passes: int | None = None):
        """Water one zone for its duration, in one pass or several, and credit.

        ``passes`` overrides the general setting (a step of a program sets its own).

        Returns a result dict ``{zone_id, zone, seconds, ran, problem}`` used to
        build the end-of-watering summary, or None when there was nothing to do.
        """
        zone_id = int(zone.get(const.ZONE_ID))
        entity_id = zone.get(const.ZONE_LINKED_ENTITY)
        duration = float(zone.get(const.ZONE_DURATION) or 0)
        if not entity_id or duration <= 0:
            return None
        # Taken before the first await and held until the last pass has closed,
        # soaks included: a second dispatch in between must find it running.
        claimed = self._claimed_zone_ids()
        if zone_id in claimed:
            _LOGGER.info(
                "Direct valve control: zone %s is already running, skipped", zone_id
            )
            return None
        claimed.add(zone_id)
        self._run_controls()[zone_id] = RunControl()
        try:
            return await self._run_claimed_valve(zone, entity_id, duration, passes)
        finally:
            claimed.discard(zone_id)
            self._run_controls().pop(zone_id, None)

    async def _run_claimed_valve(
        self, zone: dict, entity_id: str, duration: float, passes: int | None = None
    ):
        """The body of ``_run_one_valve``, once the zone is claimed."""
        zone_id = int(zone.get(const.ZONE_ID))
        zone_name = zone.get(const.ZONE_NAME)
        # The duration is the water plus one lead time (calculation.py). The
        # lead time fills the pipe and delivers nothing, and every pass has to
        # fill it again: split the water, add the lead to each pass, and credit
        # only the water. Crediting the lead as water left a phantom surplus
        # after every run.
        lead = self._lead_seconds(zone, duration)
        plan = (
            split_into_passes(passes, duration - lead)
            if passes
            else self._pass_plan(duration - lead)
        )
        soak = self._soak_seconds() if len(plan) > 1 else 0.0
        # Suppress the observer from the moment we send the first open command
        # until the last pass has closed, soaking time included. Each pass
        # renews it as it opens: a slow valve can outlast this estimate.
        self._note_si_valve(
            zone_id,
            duration
            + (lead + soak) * (len(plan) - 1)
            + VALVE_CONFIRM_TIMEOUT * len(plan),
        )
        if len(plan) > 1:
            _LOGGER.info(
                "Direct valve control: zone %s in %d passes of %.0fs, "
                "soaking %.0fs between them",
                zone_id,
                len(plan),
                plan[0],
                soak,
            )

        watered = 0.0
        problem = None
        stopped = False
        control = self._run_controls().get(zone_id)
        for index, seconds in enumerate(plan):
            if index and soak and await self._wait_or_stop(zone_id, soak):
                stopped = True
                break
            problem = await self._run_one_pass(zone, entity_id, seconds, lead)
            if control is not None and control.stop.is_set():
                # Stopped during the pass: what was delivered is what it was
                # credited for, and nothing after it is watered.
                stopped = True
                if problem in (None, PROBLEM_DID_NOT_CLOSE):
                    watered += control.delivered or 0.0
                break
            if problem in (None, PROBLEM_DID_NOT_CLOSE):
                # A valve that would not close still watered its pass, and was
                # credited for it; the passes after it are not attempted.
                watered += seconds + lead
            if problem:
                break

        if (problem and not watered) or (stopped and not watered):
            return {
                "zone_id": zone_id,
                "zone": zone_name,
                "seconds": 0,
                "ran": False,
                "stopped": stopped,
                "problem": problem or PROBLEM_STOPPED,
            }
        zone_after = self.store.get_zone(zone_id) or {}
        return {
            "zone_id": zone_id,
            "zone": zone_name,
            "seconds": int(watered),
            "volume_l": round(self._gross_volume_litres(zone, watered), 1),
            "bucket": round(float(zone_after.get(const.ZONE_BUCKET) or 0.0), 1),
            "ran": True,
            "stopped": stopped,
            # A pass that failed after water was already delivered is reported
            # here too, and has fired its own zone_problem event.
            "problem": problem,
        }

    async def _run_one_pass(
        self, zone: dict, entity_id: str, seconds: float, lead: float = 0.0
    ):
        """Open the valve, hold it for ``lead`` + ``seconds``, close it, credit.

        Only ``seconds`` is credited: the lead time fills the pipe.

        Returns None when the pass ran, or the reason it did not. Each pass is
        persisted and credited on its own, so a reboot in the middle of a run
        resumes the pass that was open and never credits water twice.
        """
        zone_id = int(zone.get(const.ZONE_ID))
        domain, on_svc, _off_svc = self._valve_services(entity_id)
        held = seconds + lead
        # Renew the observer's suppression for this pass: the window set for
        # the whole run could run out before the last pass of a slow valve,
        # and the observer then credited that pass a second time.
        self._note_si_valve(zone_id, held + VALVE_CONFIRM_TIMEOUT)
        _LOGGER.info(
            "Direct valve control: opening %s for zone %s (%.0fs)",
            entity_id,
            zone_id,
            held,
        )
        # The try starts with the open. A cancellation during the confirm
        # window (a restart, a reload) used to leave the valve open, with no
        # persisted run yet for the resume path to find and close.
        closed = False
        recorded = False
        cancelled = False
        close_ok = True
        flow_sensor = zone.get(const.ZONE_FLOW_SENSOR)
        meter_start = None
        stopped = False
        supply = self._supply_for_zone(zone)
        token = object()
        acquired = False
        lag = 0.0
        try:
            if supply is not None:
                # Taken before the first await, given back in the finally below.
                acquired = True
                lag = await self._supply_before_open(supply, token, zone_id)
                if lag is None:
                    # Stopped while the supply was coming up: nothing was opened.
                    closed = True
                    control = self._run_controls().get(zone_id)
                    if control is not None:
                        control.stop.set()
                        control.delivered = 0.0
                    return None
            await self._async_call_valve_service(domain, on_svc, entity_id)

            # Confirm the valve actually opened before counting/crediting: a
            # valve that never opens would otherwise clear the deficit while
            # running dry (and the missed water silently rolls over to the next
            # day). Only an explicit "still off" aborts; an unverifiable
            # (write-only) valve runs.
            if await self._confirm_valve_running(entity_id) is False:
                closed = True
                await self._close_valve(zone, entity_id)
                self._report_valve_problem(zone, entity_id, PROBLEM_DID_NOT_OPEN)
                return PROBLEM_DID_NOT_OPEN

            # Start counting only once the valve is confirmed open.
            started = dt_util.utcnow()
            if flow_sensor:
                meter_start = self._read_volume_litres(flow_sensor)
            # Set before the await: the record is in memory as soon as the
            # call starts, and has to be cleared whatever happens after.
            recorded = True
            await self._add_active_run(zone_id, entity_id, started, held)
            # Hardware dead-man: tell the device to shut itself off after the
            # pass, in case Home Assistant never sends the close below.
            await self._arm_safety_off(zone, held)
            stopped = await self._hold_valve(zone_id, held, supply, token, lag)
            if stopped:
                # Counted now, before the close takes its own seconds: the water
                # is what flowed until the stop, not until the valve was shut.
                delivered = min(
                    held, max(0.0, (dt_util.utcnow() - started).total_seconds())
                )
                control = self._run_controls().get(zone_id)
                if control is not None:
                    control.delivered = delivered
                seconds = max(0.0, delivered - lead)
                held = delivered
        except asyncio.CancelledError:
            # A restart or a reload: the persisted run stays, for the resume
            # path to finish and credit.
            cancelled = True
            raise
        finally:
            if not closed:
                close_ok = await self._close_valve(zone, entity_id)
            # Cleared even when something above raised: a run left recorded
            # made the zone "already running" at every start until a restart.
            # Cleared before crediting: a crash in this window then loses at
            # most one credit rather than double-crediting on resume.
            if recorded and not cancelled:
                await self._remove_active_run(zone_id)
            if acquired:
                # After the valve is shut, in the same finally that took it. A
                # cancellation (a reload) puts the supply off at once rather than
                # leave a timer behind: the run resumes from its record.
                try:
                    await self._supply_release(supply, token, immediate=cancelled)
                except Exception as e:  # noqa: BLE001 - never hide how the pass ended
                    _LOGGER.error("Supply release failed: %s", e)
        self._direct_run_finished[zone_id] = self.hass.loop.time()
        if flow_sensor and self._meter_saw_no_flow(
            flow_sensor, meter_start, started + timedelta(seconds=lead + NO_FLOW_GRACE)
        ):
            # The valve said it was open, but the meter, which did report
            # while the water should have been flowing, did not move: a closed
            # main tap or a pump that did not start. Nothing to credit.
            self._report_valve_problem(zone, entity_id, PROBLEM_NO_FLOW)
            return PROBLEM_NO_FLOW
        # The valve was held for ``held``; credit the water, not the lead (a
        # cancelled pass never reaches here, so its credit comes from the
        # reboot-resume path instead).
        await self._credit_direct_run(zone_id, seconds, started, held=held)
        return None if close_ok else PROBLEM_DID_NOT_CLOSE

    def _meter_saw_no_flow(self, flow_sensor: str, meter_start, witness_from) -> bool:
        """Whether the zone's flow meter witnessed a pass that delivered nothing.

        Only a meter that reported at or after ``witness_from``, when the water
        should have been flowing for a while, counts as a witness. One that did
        not report (it reports every few minutes, or it is unavailable) proves
        nothing, and the pass keeps its credit by time, as it always had.
        """
        if meter_start is None:
            return False
        meter_end = self._read_volume_litres(flow_sensor)
        if meter_end is None or meter_end != meter_start:
            # Water flowed, or the meter was reset: either way not a dry run.
            return False
        return self._meter_reported_since(flow_sensor, witness_from)

    @staticmethod
    def _lead_seconds(zone: dict, duration: float | None = None) -> float:
        """The zone's lead time: the time the pipe takes to fill, no water yet.

        Never more than the run itself, so a run shorter than its lead time
        (edited by hand) still counts for what it is.
        """
        try:
            lead = max(0.0, float(zone.get(const.ZONE_LEAD_TIME) or 0.0))
        except (TypeError, ValueError):
            lead = 0.0
        if duration is not None:
            lead = min(lead, max(0.0, duration))
        return lead

    def _gross_volume_litres(self, zone: dict, seconds: float) -> float:
        """Litres actually delivered (throughput x time), for the report."""
        throughput = zone.get(const.ZONE_THROUGHPUT) or 0.0
        if throughput <= 0 or seconds <= 0:
            return 0.0
        # Stored in L/min (units.py).
        return throughput * seconds / 60.0

    async def _credit_direct_run(
        self, zone_id: int, elapsed: float, started=None, held: float | None = None
    ) -> None:
        """Credit the bucket for ``elapsed`` seconds of water from a direct run.

        ``held`` is how long the valve was open, lead time included, when that
        differs: it is what the tap ran for, so it is what the history and the
        water-used total record. ``started`` is passed through to the irrigation
        history so the History tab shows when the run began rather than when it
        was credited.
        """
        if held is None:
            held = elapsed
        if elapsed <= 0:
            return
        zone = self.store.get_zone(zone_id)
        if zone is None:
            return
        # Clamp the credited time to the safety cap (a long downtime overrun must
        # not credit unbounded water). A negative maximum means there is none:
        # read as a cap, -1 turned every run into a credit of -1 second, so a
        # zone set to no maximum never had its bucket refilled and was watered
        # again at every start.
        max_duration = zone.get(const.ZONE_MAXIMUM_DURATION)
        credit_seconds = elapsed
        if (
            max_duration is not None
            and max_duration >= 0
            and credit_seconds > max_duration
        ):
            credit_seconds = float(max_duration)
        applied_mm = self._applied_depth_mm(zone, credit_seconds)
        if applied_mm is None:
            _LOGGER.warning(
                "Direct valve control: zone %s has no precipitation rate, "
                "bucket not credited",
                zone_id,
            )
            return
        # Stored in L/min (units.py).
        tput_lpm = zone.get(const.ZONE_THROUGHPUT) or 0.0
        # The crop factor is applied to the evapotranspiration now, not to the
        # duration (#779), so the run is no longer inflated by it and there is
        # nothing to divide back out. Credit the water that actually flowed,
        # which is also what the flow-sensor path credits.
        volume_l = tput_lpm * (credit_seconds / 60.0)
        await self._apply_volume_credit(
            zone,
            volume_l,
            source=f"direct run {held:.0f}s",
            seconds=held,
            started=started,
            applied_mm=applied_mm,
            # The bucket is credited for the water that reached the zone, but
            # the tap ran for the whole time the valve was held, lead time
            # included: that is what the History tab and the water-used total
            # are about.
            water_l=tput_lpm * (held / 60.0),
        )

    # --- startup alignment --------------------------------------------------

    async def async_align_valves(self, *_args) -> None:
        """Close every zone valve that is open while nothing of ours runs it.

        Only in full controller mode, which answers for the state of its valves:
        after a crash or a restart a valve left open by a run nobody resumes
        would water until someone noticed. A run resumed from its record owns
        its valve and is left alone, and a reading that says nothing
        (unavailable, unknown, no entity yet) is never taken for an open valve.
        """
        if getattr(self.store.config, const.CONF_FULL_CONTROLLER, False) is not True:
            return
        for zone in await self.store.async_get_zones():
            entity_id = zone.get(const.ZONE_LINKED_ENTITY)
            if not entity_id:
                continue
            zone_id = int(zone.get(const.ZONE_ID))
            if self._run_in_flight(zone_id):
                continue
            state = self.hass.states.get(entity_id)
            if state is None or state.state not in _VALVE_ON_STATES:
                continue
            _LOGGER.warning(
                "Full controller: %s (zone %s) is open and no run of ours has it, "
                "closing it",
                entity_id,
                zone_id,
            )
            # Our close is not an external watering to credit.
            self._note_si_valve(zone_id)
            await self._close_valve(zone, entity_id)
        await self._align_supplies()

    # --- reboot resume ------------------------------------------------------

    async def async_resume_valve_runs(self) -> None:
        """Resume or close direct runs that were in flight before a restart."""
        runs = list(getattr(self.store.config, const.CONF_ACTIVE_VALVE_RUNS, []) or [])
        cycle = getattr(self.store.config, const.CONF_ACTIVE_CYCLE, None)
        program_run = getattr(self.store.config, const.CONF_ACTIVE_PROGRAM_RUN, None)
        if not runs and not cycle and not program_run:
            return
        if runs:
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
        resumed = [self._spawn_valve_run(self._resume_one(run)) for run in runs]
        if cycle:
            self._spawn_valve_run(self._resume_cycle(cycle, resumed))
        if program_run:
            self._spawn_valve_run(self._resume_program(program_run, resumed))

    async def _resume_cycle(self, cycle: dict, resumed: list) -> None:
        """Go on with the zones a restart interrupted the cycle before.

        The run that was open is finished first, by its own record, and only
        then do the others follow: one zone at a time is what the cycle
        promised. A cycle too old to be the same watering is dropped, and so is
        one the user can no longer have wanted (direct control switched off).
        """
        await self.store.async_update_config({const.CONF_ACTIVE_CYCLE: None})
        started = dt_util.parse_datetime((cycle or {}).get("started") or "")
        age = (
            (dt_util.utcnow() - started).total_seconds()
            if started is not None
            else None
        )
        if age is None or age > const.CYCLE_RESUME_MAX_AGE_SECONDS:
            _LOGGER.info(
                "Direct valve control: the interrupted cycle is too old, dropped"
            )
            return
        if resumed:
            await asyncio.gather(*resumed, return_exceptions=True)
        zone_ids = []
        for zone_id in cycle.get("zones") or []:
            try:
                zone_ids.append(int(zone_id))
            except (TypeError, ValueError):
                continue
        if not zone_ids:
            return
        _LOGGER.info(
            "Direct valve control: going on with the interrupted cycle, zone(s) %s",
            ", ".join(str(z) for z in zone_ids),
        )
        await self.async_run_direct_valves(zone_ids)

    async def _resume_one(self, run: dict) -> None:
        """Finish or close one run found in flight at startup, and credit it.

        The zone is claimed for the time it takes, as a run started now would
        be, so a dispatch meanwhile does not open the same valve.
        """
        zone_id = int(run.get(const.RUN_ZONE_ID))
        claimed = self._claimed_zone_ids()
        claimed.add(zone_id)
        self._run_controls()[zone_id] = RunControl()
        try:
            await self._resume_claimed(run, zone_id)
        finally:
            claimed.discard(zone_id)
            self._run_controls().pop(zone_id, None)

    def _zone_or_stub(self, zone_id: int) -> dict:
        """The stored zone, or enough of it to name it in a problem report."""
        return self.store.get_zone(zone_id) or {const.ZONE_ID: zone_id}

    async def _resume_claimed(self, run: dict, zone_id: int) -> None:
        entity_id = run.get(const.RUN_ENTITY_ID)
        duration = float(run.get(const.RUN_DURATION) or 0)
        started = dt_util.parse_datetime(run.get(const.RUN_STARTED) or "")
        if started is None or not entity_id:
            await self._remove_active_run(zone_id)
            return
        elapsed = (dt_util.utcnow() - started).total_seconds()
        domain, on_svc, _off_svc = self._valve_services(entity_id)

        if elapsed >= duration:
            # The runner owns this valve, and its close is not an external run.
            self._note_si_valve(zone_id)
            if elapsed > duration + 5:
                _LOGGER.warning(
                    "Direct valve control: zone %s overran during downtime "
                    "(%.0fs >= %.0fs); closing now",
                    zone_id,
                    elapsed,
                    duration,
                )
            # The overrun is water only if the valve is still open: one that a
            # safety timer or a power cut closed delivered its planned pass and
            # nothing more. Crediting the whole downtime could skip days.
            state = self.hass.states.get(entity_id)
            still_open = state is not None and state.state in _VALVE_ON_STATES
            held = elapsed if still_open else duration
            # The close never raises (a failed one is reported), so the run is
            # always cleared; only a cancellation leaves it for the next start.
            await self._close_valve(self._zone_or_stub(zone_id), entity_id)
            await self._remove_active_run(zone_id)
            self._direct_run_finished[zone_id] = self.hass.loop.time()
            zone = self.store.get_zone(zone_id) or {}
            water = held - self._lead_seconds(zone, held)
            await self._credit_direct_run(zone_id, water, started, held=held)
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
        # power cut may have reset it. Confirm before finishing/crediting. The
        # try starts with the open, as in _run_one_pass.
        closed = False
        cancelled = False
        held_override = None
        supply = self._supply_for_zone(self._zone_or_stub(zone_id))
        token = object()
        acquired = False
        try:
            if supply is not None:
                # The valve is open mid-run, so the supply is up with it: no lead.
                acquired = True
                await self._supply_before_open(supply, token, zone_id)
                await self._supply_ensure_on(supply)
            await self._async_call_valve_service(domain, on_svc, entity_id)
            if await self._confirm_valve_running(entity_id) is False:
                closed = True
                await self._close_valve(self._zone_or_stub(zone_id), entity_id)
                self._report_valve_problem(
                    self._zone_or_stub(zone_id), entity_id, PROBLEM_DID_NOT_OPEN
                )
                return
            # The open and its confirmation take time of their own: what is
            # left is counted from the start again, so the run is not held
            # longer than planned.
            remaining = max(
                0.0, duration - (dt_util.utcnow() - started).total_seconds()
            )
            # Re-arm the hardware dead-man for the remaining time after a restart.
            await self._arm_safety_off(self.store.get_zone(zone_id) or {}, remaining)
            if await self._wait_or_stop(zone_id, remaining):
                # Stopped: credit what the valve delivered until now.
                delivered = min(
                    duration, max(0.0, (dt_util.utcnow() - started).total_seconds())
                )
                held_override = delivered
        except asyncio.CancelledError:
            # Shutting down again: the persisted run stays for the next start.
            cancelled = True
            raise
        finally:
            if not closed:
                await self._close_valve(self._zone_or_stub(zone_id), entity_id)
            if not cancelled:
                await self._remove_active_run(zone_id)
            if acquired:
                try:
                    await self._supply_release(supply, token, immediate=cancelled)
                except Exception as e:  # noqa: BLE001 - never hide how the run ended
                    _LOGGER.error("Supply release failed: %s", e)
        self._direct_run_finished[zone_id] = self.hass.loop.time()
        zone = self.store.get_zone(zone_id) or {}
        if held_override is not None:
            water = max(0.0, held_override - self._lead_seconds(zone, held_override))
            await self._credit_direct_run(zone_id, water, started, held=held_override)
            return
        water = duration - self._lead_seconds(zone, duration)
        await self._credit_direct_run(zone_id, water, started, held=duration)
