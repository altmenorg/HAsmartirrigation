"""Running the programs of the full controller.

A program is a plan: tours of steps, a step being the zones watered together
with the seconds each gets (programs.py works that out from the zones as they
are when the program starts its turn). This module walks the plan.

One program, or one cycle of the main program, runs at a time: a second one
takes its turn behind the first, which is what keeps the pressure of a home
network and what a manual run asked for during a program is owed. The plan is
worked out after the turn comes, not when the run was asked for, since the
zones may well have been watered or changed meanwhile.

A negative delay after a step overlaps it with the next: the next step starts
that many seconds before the current one ends (never more than it has to run),
as a task alongside it. Each zone holds its own supply, so a pump stays on until
the last step using it is done. Stop and pause act on every open zone; the run
record is the later step's, the earlier one being finished by its own valve
record after a restart.

The plan and where it has got to are recorded at every step, and a restart goes
on with the steps still to do (the run that was open is finished by its own
record first, as for any run).
"""

import asyncio
import logging
from datetime import timedelta

import homeassistant.util.dt as dt_util

from . import const
from .programs import (
    find_program,
    overlap_seconds,
    plan_program,
    plan_wall_seconds,
    restrict_plan,
    step_wall_seconds,
)

_LOGGER = logging.getLogger(__name__)


class ProgramRun:
    """A run of a program, from the moment it is asked for to its end."""

    def __init__(self, program_id: str, name: str, manual: bool, note_day=None) -> None:
        self.program_id = program_id
        # Called with the zones about to be watered, when a step really starts
        # (the scheduler counts the day then, and not when the run was asked for).
        self.note_day = note_day
        self.name = name
        self.manual = manual
        self.stop = asyncio.Event()
        self.results: list = []
        # When the run began (kept in its record, so a restart knows its age).
        self.started: str | None = None
        # The zones of the step under way, for the next-step control.
        self.current_zones: list = []
        # Where the run is, for the live state: the tour and step, and the totals.
        self.tour = 0
        self.step = 0
        self.tours = 0
        self.steps = 0
        self.total_seconds = 0.0
        self.running_since: float | None = None
        # The pauses that had been taken when the run began.
        self.paused_at_start = 0.0
        # Zones stopped by name: not watered by the later steps either.
        self.excluded: set = set()
        # The zones of the current step that have started, for the resume.
        self.started_zones: set = set()
        self.plan: list = []
        # Set when the run is over (or taken out of the queue), for a replacing run.
        self.finished = asyncio.Event()
        # Whether the run has taken its turn at the valves.
        self.turn_taken = False
        # A hard limit: the moment the run is cut if it is still going (a
        # datetime), or None. ``cut`` is set when that happened.
        self.deadline = None
        self.cut = False
        # The seconds asked for, and when: kept for a manual run waiting for its
        # turn, so a restart can ask for it again. ``queued`` says it is recorded.
        self.seconds = None
        self.requested: str | None = None
        self.queued = False


def order_driest_first(plan: list, zones) -> list:
    """The plan with the zones of every step ordered driest first.

    Only the order of the zones inside a step changes (the driest is the one
    with the lowest bucket, the largest water deficit; ties keep their order).
    Steps stay in their order and no zone is added or removed. The zones of a
    step open together, so this decides which opens first, and in a program
    whose steps hold one zone each it changes nothing.
    """
    bucket = {
        int(z[const.ZONE_ID]): float(z.get(const.ZONE_BUCKET) or 0.0)
        for z in zones
        if const.ZONE_ID in z
    }
    return [
        [
            {
                **step,
                "zones": sorted(
                    step["zones"], key=lambda m: bucket.get(int(m["zone_id"]), 0.0)
                ),
            }
            for step in steps
        ]
        for steps in plan
    ]


def scale_plan_to_total(plan: list, total_seconds) -> list:
    """The plan with every duration scaled so the program lasts ``total_seconds``.

    The seconds of a step are its longest zone (the zones of a step water
    together); the program's planned duration is the sum of its steps over its
    tours, waits left out. Every zone keeps its share of the total in proportion
    to what was planned, as Irrigation Unlimited shares a run time. A plan with
    nothing planned is returned as it is.
    """
    planned = sum(
        max((float(m["seconds"]) for m in step["zones"]), default=0.0)
        for steps in plan
        for step in steps
    )
    if planned <= 0 or total_seconds is None:
        return plan
    factor = float(total_seconds) / planned
    return [
        [
            {
                **step,
                "zones": [
                    {
                        **member,
                        "seconds": float(member["seconds"]) * factor,
                        **(
                            {"lead": float(member["lead"]) * factor}
                            if "lead" in member
                            else {}
                        ),
                    }
                    for member in step["zones"]
                ],
            }
            for step in steps
        ]
        for steps in plan
    ]


class ProgramRunnerMixin:
    """Run the programs of the full controller."""

    async def _stop_for_replacement(self, program_id) -> None:
        """Stop what runs and waits so that a run that replaces it can start.

        Everything ends the clean way (valves closed, delivered water credited).
        A run of the same program is waited for, so the new one is not refused
        as "already running".
        """
        old = self._program_registry().get(program_id)
        await self.async_stop_watering()
        if old is not None:
            try:
                await asyncio.wait_for(old.finished.wait(), 120)
            except asyncio.TimeoutError:
                _LOGGER.warning("Program %s did not stop in time", program_id)

    async def async_stop_program(self, program_id) -> str | None:
        """Stop one program: end it if it runs, take it out of the queue if it waits.

        A running program closes its open zones the normal way (each is credited
        for what it delivered) and starts no further step. Returns ``"stopped"``,
        ``"dequeued"``, or None for a program that neither runs nor waits (an
        unknown id included: nothing happens). The main program has no run of its
        own; ``stop_watering`` stops it.
        """
        registry = self._program_registry()
        run = registry.get(program_id)
        if run is None:
            _LOGGER.debug("stop_program: %s is neither running nor waiting", program_id)
            return None
        run.stop.set()
        if not run.turn_taken:
            # Waiting: out of the queue now, it ends the moment its turn comes.
            registry.pop(program_id, None)
            self._notify_programs()
            _LOGGER.info("Program %s taken out of the queue", program_id)
            return "dequeued"
        for zone_id in list(run.current_zones or ()):
            control = self._run_controls().get(int(zone_id))
            if control is not None:
                control.stop.set()
        _LOGGER.info("Program %s stopped", program_id)
        return "stopped"

    def _executor_lock(self) -> asyncio.Lock:
        """The one turn at the valves, shared by programs and cycles."""
        lock = getattr(self, "_executor_turn", None)
        if lock is None:
            lock = self._executor_turn = asyncio.Lock()
        return lock

    def _programs_resuming(self) -> dict:
        """The programs whose interrupted pass is being finished after a restart."""
        resuming = getattr(self, "_programs_resuming_state", None)
        if resuming is None:
            resuming = self._programs_resuming_state = {}
        return resuming

    def _program_registry(self) -> dict:
        """The programs waiting for their turn or running, by id."""
        registry = getattr(self, "_program_runs_by_id", None)
        if registry is None:
            registry = self._program_runs_by_id = {}
        return registry

    # --- asking for a run ----------------------------------------------------

    def _program_allowed(self, program_id) -> bool:
        """Whether the program may water: it is there, enabled, not suspended."""
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return False
        program = find_program(getattr(config, const.CONF_PROGRAMS, None), program_id)
        return (
            program is not None
            and program.get(const.PROGRAM_ENABLED) is not False
            and not self.is_suspended(const.SUSPEND_PROGRAM, program_id)
        )

    async def async_run_program(
        self,
        program_id,
        manual: bool = True,
        only_zones=None,
        note_day=None,
        seconds=None,
        mode=const.RUN_MODE_QUEUE,
        deadline=None,
    ) -> bool:
        """Run a program now, or as soon as it is its turn. False if not started.

        ``deadline`` (a datetime) is a hard limit: a run still going then is cut,
        its open zones closed the normal way, and the zones of each step are
        ordered driest first. None keeps the run as it is.

        ``only_zones`` keeps the run to those zones (the ones the rain cannot reach).
        ``note_day`` is awaited with the zones of each step that is about to water.
        ``seconds`` is a total for the whole program, shared between its steps in
        proportion to their planned durations; without it the planned durations.
        ``mode`` is ``queue`` (take the turn behind what runs) or ``replace``
        (stop what runs and waits, cleanly, then run this one).
        """
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            _LOGGER.warning(
                "Program %s not run: the full controller is off", program_id
            )
            return False
        program = find_program(getattr(config, const.CONF_PROGRAMS, None), program_id)
        if program is None:
            _LOGGER.warning("Program %s does not exist", program_id)
            return False
        if program.get(const.PROGRAM_ENABLED) is False:
            _LOGGER.info("Program %s is disabled, not run", program_id)
            return False
        if self.is_suspended(const.SUSPEND_PROGRAM, program_id):
            _LOGGER.info("Program %s is suspended, not run", program_id)
            return False
        if mode == const.RUN_MODE_REPLACE:
            await self._stop_for_replacement(program_id)
        if program.get(const.PROGRAM_MAIN):
            await self.async_run_direct_valves()
            return True
        registry = self._program_registry()
        if program_id in registry:
            _LOGGER.info("Program %s is already running or waiting", program_id)
            return False
        run = ProgramRun(
            program_id,
            program.get(const.PROGRAM_NAME) or program_id,
            manual,
            note_day,
        )
        run.deadline = deadline
        run.seconds = seconds
        run.requested = dt_util.utcnow().isoformat()
        if manual and self._executor_lock().locked():
            # It will have to wait: recorded, so a restart does not lose it.
            run.queued = True

        async def _plan():
            fresh = find_program(
                getattr(self.store.config, const.CONF_PROGRAMS, None), program_id
            )
            if fresh is None or not self._program_allowed(program_id):
                return None, 0, 0
            zones = await self.store.async_get_zones()
            # The adjustment in force when the run takes its turn.
            plan = plan_program(fresh, zones, self.program_adjustment(program_id))
            if only_zones is not None:
                plan = restrict_plan(plan, only_zones)
            if seconds is not None:
                plan = scale_plan_to_total(plan, seconds)
            if deadline is not None and plan:
                plan = order_driest_first(plan, zones)
            return plan, 0, 0

        await self._drive_program(run, _plan, resumed=False)
        return True

    async def _drive_program(self, run: ProgramRun, make_plan, resumed: bool) -> None:
        """Wait for the turn, walk the plan, say how it went."""
        registry = self._program_registry()
        registry[run.program_id] = run
        cancelled = False
        watcher = None
        try:
            if run.queued:
                await self._persist_manual_queue()
            async with self._executor_lock():
                if run.stop.is_set():
                    return
                run.turn_taken = True
                if run.queued:
                    # Its turn: it is no longer waiting.
                    await self._persist_manual_queue()
                run.started = run.started or dt_util.utcnow().isoformat()
                plan, tour, step = await make_plan()
                if not plan:
                    _LOGGER.info("Program %s has nothing to water", run.program_id)
                    return
                if run.deadline is not None and dt_util.utcnow() >= run.deadline:
                    # No time left at all: nothing opens, and the record says why.
                    _LOGGER.warning(
                        "Program %s: its deadline has passed before its turn, "
                        "not run",
                        run.program_id,
                    )
                    run.cut = True
                    run.stop.set()
                    self._report_program_finished(run)
                    return
                run.plan = plan
                # Known before anything says the run has started.
                run.tours = len(plan)
                run.steps = len(plan[tour]) if tour < len(plan) else 0
                run.tour, run.step = tour, step
                self._announce_program(run, plan[tour:] or plan, resumed)
                self._notify_programs()
                run.total_seconds = plan_wall_seconds(
                    plan, self._soak_seconds() if hasattr(self, "_soak_seconds") else 0
                )
                run.running_since = self.hass.loop.time()
                run.paused_at_start = self.paused_seconds_total()
                if not resumed:
                    await self._note_program_started(run.program_id)
                if run.deadline is not None:
                    watcher = asyncio.ensure_future(self._watch_deadline(run))
                await self._execute_plan(run, plan, tour, step)
                self._report_program_finished(run)
        except asyncio.CancelledError:
            # A restart or a reload: the record stays, for the next start.
            cancelled = True
            raise
        finally:
            if watcher is not None and not watcher.done():
                watcher.cancel()
            # Not a newer run of the same id (this one may have been taken out of
            # the queue, and the program asked for again).
            if registry.get(run.program_id) is run:
                registry.pop(run.program_id, None)
            run.finished.set()
            self._notify_programs()
            if not cancelled:
                await self.store.async_update_config(
                    {const.CONF_ACTIVE_PROGRAM_RUN: None}
                )
                if run.queued:
                    # Stopped or dequeued while it waited: out of the record too.
                    await self._persist_manual_queue()

    # --- the hard deadline ---------------------------------------------------

    async def _watch_deadline(self, run: ProgramRun) -> None:
        """Cut the run when its deadline comes, if it is still going."""
        seconds = (run.deadline - dt_util.utcnow()).total_seconds()
        if seconds > 0:
            try:
                await asyncio.wait_for(run.finished.wait(), timeout=seconds)
                return
            except asyncio.TimeoutError:
                pass
        await self._cut_at_deadline(run)

    async def _cut_at_deadline(self, run: ProgramRun) -> None:
        """End the run now: open zones close the normal way, no step starts."""
        if run.cut or run.finished.is_set() or not run.turn_taken:
            return
        run.cut = True
        _LOGGER.warning(
            "Program %s reached its deadline and is cut: the zones still open are "
            "closed, the steps not started are dropped",
            run.program_id,
        )
        run.stop.set()
        for zone_id in list(run.current_zones or ()):
            control = self._run_controls().get(int(zone_id))
            if control is not None:
                control.stop.set()

    # --- walking the plan ----------------------------------------------------

    async def _execute_plan(self, run: ProgramRun, plan: list, tour0: int, step0: int):
        # Steps started ahead of the end of the one before (a negative delay),
        # still open: (task, zone ids). Empty unless some delay is negative.
        inflight: list = []
        done = False
        try:
            await self._walk_plan(run, plan, tour0, step0, inflight)
            done = True
        finally:
            run.current_zones = []
            if not done:
                # A reload or a restart: nothing is left running behind the run.
                for task, _ in inflight:
                    if not task.done():
                        task.cancel()
            await self._collect_inflight(run, inflight)

    async def _collect_inflight(self, run: ProgramRun, inflight: list) -> None:
        """Wait for the overlapped steps still open and keep what they did."""
        if not inflight:
            return
        outcomes = await asyncio.gather(
            *(task for task, _ in inflight), return_exceptions=True
        )
        for outcome in outcomes:
            if isinstance(outcome, asyncio.CancelledError):
                continue
            if isinstance(outcome, BaseException):
                _LOGGER.error("Program %s: a step failed: %s", run.program_id, outcome)
            else:
                run.results.extend(outcome)
        inflight.clear()

    async def _walk_plan(
        self, run: ProgramRun, plan: list, tour0: int, step0: int, inflight: list
    ):
        def _live() -> list:
            return [z for task, zones in inflight if not task.done() for z in zones]

        for tour in range(tour0, len(plan)):
            steps = plan[tour]
            for index in range(step0 if tour == tour0 else 0, len(steps)):
                if run.stop.is_set():
                    return
                if not await self._wait_run_resume(run):
                    return
                if run.deadline is not None and dt_util.utcnow() >= run.deadline:
                    # A late start, a pause or a longer plan: no time for this step.
                    await self._cut_at_deadline(run)
                    return
                if not self._program_allowed(run.program_id):
                    # Deleted, disabled or suspended while it ran, or the full
                    # controller switched off: no further step opens a valve.
                    _LOGGER.info(
                        "Program %s can no longer run, stopped before its step %s",
                        run.program_id,
                        index + 1,
                    )
                    run.stop.set()
                    return
                if not (tour == tour0 and index == step0 and run.started_zones):
                    run.started_zones = set()
                await self._persist_program_run(run, plan, tour, index)
                step = steps[index]
                zones = [int(m["zone_id"]) for m in step["zones"]]
                # The next-step control ends every step that is open, an overlap
                # included.
                run.current_zones = zones + _live()
                run.tour, run.step = tour, index
                self._notify_programs()
                run.tours, run.steps = len(plan), len(steps)
                last = tour == len(plan) - 1 and index == len(steps) - 1
                delay = float(step.get("delay") or 0.0)
                if delay < 0 and not last:
                    # Overlap: the step runs on its own while the next one starts
                    # `overlap` seconds before it ends. The overlap is worked out
                    # from what the step has to run, so it is never longer.
                    soak = self._soak_seconds() if hasattr(self, "_soak_seconds") else 0
                    wall = step_wall_seconds(step, soak)
                    ahead = overlap_seconds(delay, wall)
                    task = asyncio.ensure_future(self._run_step(run, step))
                    inflight.append((task, zones))
                    if not await self._wait_overlap(run, task, wall - ahead):
                        return
                    continue
                try:
                    run.results.extend(await self._run_step(run, step))
                finally:
                    run.current_zones = _live()
                if delay > 0 and not last:
                    if await self._sleep_or_stop(run.stop, delay):
                        return

    async def _wait_overlap(
        self, run: ProgramRun, task: asyncio.Future, seconds: float
    ) -> bool:
        """Let an overlapped step run for ``seconds``, or less if it ends sooner.

        A pause stops the count (the valves are closed meanwhile) and goes on
        after the resume. Returns False if the run was stopped. The step's own
        task is only watched here, never cancelled.
        """
        remaining = float(seconds)
        pause, _ = self._pause_events()
        while remaining > 0 and not task.done():
            if run.stop.is_set():
                return False
            if pause.is_set():
                if not await self._wait_run_resume(run):
                    return False
                continue
            began = self.hass.loop.time()
            sleeper = asyncio.ensure_future(asyncio.sleep(remaining))
            extras = [
                asyncio.ensure_future(run.stop.wait()),
                asyncio.ensure_future(pause.wait()),
            ]
            try:
                await asyncio.wait(
                    [sleeper, task, *extras], return_when=asyncio.FIRST_COMPLETED
                )
            finally:
                for waiter in (sleeper, *extras):
                    if not waiter.done():
                        waiter.cancel()
            if sleeper.done() and not sleeper.cancelled():
                remaining = 0.0
            else:
                remaining -= max(0.0, self.hass.loop.time() - began)
        return not run.stop.is_set()

    async def _run_step(self, run: ProgramRun, step: dict) -> list:
        """Water the zones of a step together, each as it is now."""
        members = []
        for member in step["zones"]:
            zone_id = int(member["zone_id"])
            zone = self.store.get_zone(zone_id)
            if (
                zone is None
                or not zone.get(const.ZONE_LINKED_ENTITY)
                or zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED
            ):
                continue
            if zone_id in run.excluded:
                continue
            if self.is_suspended(const.SUSPEND_ZONE, zone_id):
                _LOGGER.info(
                    "Program %s: zone %s is suspended, skipped", run.program_id, zone_id
                )
                continue
            if self._busy(zone_id):
                _LOGGER.info(
                    "Program %s: zone %s is already being watered, skipped",
                    run.program_id,
                    zone_id,
                )
                continue
            zone = dict(zone)
            zone[const.ZONE_DURATION] = float(member["seconds"])
            members.append((zone, member))
        if not members:
            return []
        if run.note_day is not None:
            # Only now is it certain these zones water: counted for them alone.
            try:
                await run.note_day({int(z[const.ZONE_ID]) for z, _ in members})
            except asyncio.CancelledError:
                raise
            except Exception as e:  # noqa: BLE001 - the counters are not the run
                _LOGGER.warning("Program %s: could not count the day: %s", run.name, e)
        jobs = [
            self._run_program_zone(
                run,
                zone,
                int(member["passes"]),
                float(member.get("max_litres") or 0.0),
            )
            for zone, member in members
        ]
        return [r for r in await asyncio.gather(*jobs) if r]

    async def _run_program_zone(
        self, run: ProgramRun, zone: dict, passes: int, max_litres: float = 0.0
    ):
        # Recorded before it opens: a restart from here on does not water it again
        # (it is finished from its own run record, or loses its last passes),
        # where watering it again in full could double what it got.
        run.started_zones.add(int(zone.get(const.ZONE_ID)))
        await self._persist_program_run(run, run.plan, run.tour, run.step)
        if run.stop.is_set():
            # Stopped while the record was written: no valve opens for it.
            return None
        try:
            return await self._run_one_valve(
                zone, passes=passes, max_litres=max_litres or None
            )
        except asyncio.CancelledError:
            raise
        except Exception as e:  # noqa: BLE001 - one zone is one zone
            _LOGGER.error(
                "Program %s: zone %s failed: %s",
                run.program_id,
                zone.get(const.ZONE_ID),
                e,
            )
            return None

    # --- the record that survives a restart -----------------------------------

    async def _persist_program_run(
        self, run: ProgramRun, plan: list, tour: int, step: int
    ) -> None:
        await self.store.async_update_config(
            {
                const.CONF_ACTIVE_PROGRAM_RUN: {
                    "program_id": run.program_id,
                    "name": run.name,
                    "manual": run.manual,
                    "plan": plan,
                    "tour": tour,
                    "step": step,
                    "started_zones": sorted(run.started_zones),
                    "started": run.started or dt_util.utcnow().isoformat(),
                    **(
                        {"deadline": run.deadline.isoformat()}
                        if run.deadline is not None
                        else {}
                    ),
                }
            }
        )

    # --- the queue of manual runs and the pause, across a restart ---------------

    async def _persist_manual_queue(self) -> None:
        """Record the manual runs waiting for their turn (only when it changed)."""
        waiting = [
            {
                "program_id": run.program_id,
                "seconds": run.seconds,
                "requested": run.requested,
            }
            for run in self._program_registry().values()
            if run.queued and not run.turn_taken and not run.stop.is_set()
        ]
        stored = list(
            getattr(self.store.config, const.CONF_QUEUED_MANUAL_RUNS, None) or []
        )
        if waiting == stored:
            return
        try:
            await self.store.async_update_config(
                {const.CONF_QUEUED_MANUAL_RUNS: waiting}
            )
        except asyncio.CancelledError:
            raise
        except Exception as e:  # noqa: BLE001 - the record is not the run
            _LOGGER.debug("Could not record the queued runs: %s", e)

    async def async_restore_pause_and_queue(self) -> None:
        """Put back the pause and the queued manual runs a restart interrupted.

        Call it before the runs in flight are resumed, so that they find the
        pause. A pause still ahead is held again until its end (the valves that
        were open are not reopened by it: the program goes on as it does after
        any resume). Queued runs older than six hours, or of a program that is
        gone, disabled or suspended, are dropped; the others take their turn,
        behind a program that is being resumed. Nothing happens with the full
        controller off.
        """
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return
        until = dt_util.parse_datetime(
            getattr(config, const.CONF_PAUSE_UNTIL, None) or ""
        )
        if getattr(config, const.CONF_PAUSE_UNTIL, None):
            if until is not None and until > dt_util.utcnow():
                await self._restore_pause(until)
            else:
                await self.store.async_update_config({const.CONF_PAUSE_UNTIL: None})
        stored = list(getattr(config, const.CONF_QUEUED_MANUAL_RUNS, None) or [])
        if not stored:
            return
        now = dt_util.utcnow()
        keep = []
        for entry in stored:
            if not isinstance(entry, dict):
                continue
            requested = dt_util.parse_datetime(entry.get("requested") or "")
            if requested is None or (now - requested) > timedelta(
                seconds=const.QUEUED_RUN_MAX_AGE_SECONDS
            ):
                continue
            if not self._program_allowed(entry.get("program_id")):
                continue
            keep.append(entry)
        if keep != stored:
            await self.store.async_update_config({const.CONF_QUEUED_MANUAL_RUNS: keep})
        if keep:
            _LOGGER.info("Putting %d queued manual run(s) back in line", len(keep))
            self._spawn_valve_run(self._ask_again(keep))

    async def _ask_again(self, entries: list) -> None:
        """Ask for the queued runs again, in their order, once a resumed run is over."""
        waited = 0
        while (
            getattr(self.store.config, const.CONF_ACTIVE_PROGRAM_RUN, None)
            or self._programs_resuming()
        ) and waited < const.CYCLE_RESUME_MAX_AGE_SECONDS:
            await asyncio.sleep(1)
            waited += 1
        tasks = []
        for entry in entries:
            program_id = entry.get("program_id")
            seconds = entry.get("seconds")
            # Each takes the turn in the order asked: the next is asked for when
            # the previous has registered (it waits on the lock, or runs).
            task = asyncio.ensure_future(
                self.async_run_program(program_id, manual=True, seconds=seconds)
            )
            tasks.append(task)
            for _ in range(20):
                if program_id in self._program_registry() or task.done():
                    break
                await asyncio.sleep(0)
            # The record now says what is still waiting, and nothing more.
            await self._persist_manual_queue()
        try:
            await asyncio.gather(*tasks, return_exceptions=True)
        except asyncio.CancelledError:
            for task in tasks:
                task.cancel()
            raise

    async def _drop_program_record(self) -> None:
        await self.store.async_update_config({const.CONF_ACTIVE_PROGRAM_RUN: None})

    async def _resume_program(self, record: dict, resumed: list) -> None:
        """Go on with the steps a restart interrupted, after the open run's end.

        The record stays where it is until the first step writes it again (or the
        run is dropped on purpose), so that a second crash in between does not
        lose the program.
        """
        started = dt_util.parse_datetime((record or {}).get("started") or "")
        if started is None or (dt_util.utcnow() - started) > timedelta(
            seconds=const.CYCLE_RESUME_MAX_AGE_SECONDS
        ):
            _LOGGER.info("The interrupted program run is too old, dropped")
            await self._drop_program_record()
            return
        plan = record.get("plan") or []
        program_id = record.get("program_id")
        # While the pass that was open finishes by its own record, the program
        # is running, though it has not taken its turn yet: shown as such.
        resuming = self._programs_resuming()
        if program_id:
            resuming[program_id] = {
                "name": record.get("name") or program_id,
                "manual": bool(record.get("manual")),
            }
            self._notify_programs()
        try:
            if resumed:
                await asyncio.gather(*resumed, return_exceptions=True)
        finally:
            resuming.pop(program_id, None)
        if not plan or not program_id or program_id in self._program_registry():
            await self._drop_program_record()
            return
        if not self._program_allowed(program_id):
            _LOGGER.info(
                "Program %s can no longer run (deleted, disabled, suspended or the "
                "full controller is off), its interrupted run is dropped",
                program_id,
            )
            await self._drop_program_record()
            return
        run = ProgramRun(
            program_id, record.get("name") or program_id, bool(record.get("manual"))
        )
        run.started = record.get("started")
        run.deadline = dt_util.parse_datetime(record.get("deadline") or "")

        async def _remaining():
            # The zones of the interrupted step that had started are finished by
            # their own record (or lose their last passes); the others still run.
            tour = int(record.get("tour") or 0)
            step = int(record.get("step") or 0)
            started = {int(z) for z in record.get("started_zones") or []}
            if not (0 <= tour < len(plan) and 0 <= step < len(plan[tour])):
                return None, 0, 0
            current = plan[tour][step]
            left = [m for m in current["zones"] if int(m["zone_id"]) not in started]
            if left:
                plan[tour][step] = {**current, "zones": left}
                return plan, tour, step
            # The step is over: on to the next, which may be in the next tour,
            # or there is none and nothing is left to do.
            step += 1
            if step >= len(plan[tour]):
                tour, step = tour + 1, 0
            if tour >= len(plan):
                return None, 0, 0
            return plan, tour, step

        _LOGGER.info("Going on with program %s after the restart", program_id)
        await self._drive_program(run, _remaining, resumed=True)

    # --- events --------------------------------------------------------------

    def _announce_program(self, run: ProgramRun, plan: list, resumed: bool) -> None:
        payload = {
            "program_id": run.program_id,
            "program": run.name,
            "manual": run.manual,
            "tours": len(plan),
            "zones": [
                {
                    "zone_id": member["zone_id"],
                    "zone": (self.store.get_zone(member["zone_id"]) or {}).get(
                        const.ZONE_NAME
                    ),
                    "seconds": int(member["seconds"]),
                }
                for step in plan[0]
                for member in step["zones"]
            ],
        }
        if resumed:
            payload["resumed"] = True
        self.hass.bus.async_fire(
            f"{const.DOMAIN}_{const.EVENT_PROGRAM_STARTED}", payload
        )

    def _report_program_finished(self, run: ProgramRun) -> None:
        by_zone: dict = {}
        problems = []
        for result in run.results:
            if result.get("ran"):
                entry = by_zone.setdefault(
                    result["zone_id"],
                    {
                        "zone_id": result["zone_id"],
                        "zone": result["zone"],
                        "seconds": 0,
                        "volume_l": 0.0,
                        "bucket": 0,
                    },
                )
                entry["seconds"] += result["seconds"]
                entry["volume_l"] = round(
                    entry["volume_l"] + result.get("volume_l", 0), 1
                )
                entry["bucket"] = result.get("bucket", 0)
            elif not result.get("stopped"):
                problems.append(
                    {
                        "zone_id": result["zone_id"],
                        "zone": result["zone"],
                        "reason": result["problem"],
                    }
                )
        self.hass.bus.async_fire(
            f"{const.DOMAIN}_{const.EVENT_PROGRAM_FINISHED}",
            {
                "program_id": run.program_id,
                "program": run.name,
                "manual": run.manual,
                "zones": list(by_zone.values()),
                "problems": problems,
                "stopped": run.stop.is_set(),
                # Only a cut run says so, the others keep their payload as it was.
                **(
                    {"cut": True, "reason": const.CUT_REASON_DEADLINE}
                    if run.cut
                    else {}
                ),
            },
        )
