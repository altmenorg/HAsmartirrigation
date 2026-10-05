"""Running the programs of the full controller.

A program is a plan: tours of steps, a step being the zones watered together
with the seconds each gets (programs.py works that out from the zones as they
are when the program starts its turn). This module walks the plan.

One program, or one cycle of the main program, runs at a time: a second one
takes its turn behind the first, which is what keeps the pressure of a home
network and what a manual run asked for during a program is owed. The plan is
worked out after the turn comes, not when the run was asked for, since the
zones may well have been watered or changed meanwhile.

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
    plan_program,
    plan_wall_seconds,
    restrict_plan,
)

_LOGGER = logging.getLogger(__name__)


class ProgramRun:
    """A run of a program, from the moment it is asked for to its end."""

    def __init__(self, program_id: str, name: str, manual: bool) -> None:
        self.program_id = program_id
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


class ProgramRunnerMixin:
    """Run the programs of the full controller."""

    def _executor_lock(self) -> asyncio.Lock:
        """The one turn at the valves, shared by programs and cycles."""
        lock = getattr(self, "_executor_turn", None)
        if lock is None:
            lock = self._executor_turn = asyncio.Lock()
        return lock

    def _program_registry(self) -> dict:
        """The programs waiting for their turn or running, by id."""
        registry = getattr(self, "_program_runs_by_id", None)
        if registry is None:
            registry = self._program_runs_by_id = {}
        return registry

    # --- asking for a run ----------------------------------------------------

    async def async_run_program(
        self, program_id, manual: bool = True, only_zones=None
    ) -> bool:
        """Run a program now, or as soon as it is its turn. False if not started.

        ``only_zones`` keeps the run to those zones (the ones the rain cannot reach).
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
        if program.get(const.PROGRAM_MAIN):
            await self.async_run_direct_valves()
            return True
        registry = self._program_registry()
        if program_id in registry:
            _LOGGER.info("Program %s is already running or waiting", program_id)
            return False
        run = ProgramRun(
            program_id, program.get(const.PROGRAM_NAME) or program_id, manual
        )

        async def _plan():
            fresh = find_program(
                getattr(self.store.config, const.CONF_PROGRAMS, None), program_id
            )
            if fresh is None or fresh.get(const.PROGRAM_ENABLED) is False:
                return None, 0, 0
            zones = await self.store.async_get_zones()
            plan = plan_program(fresh, zones)
            if only_zones is not None:
                plan = restrict_plan(plan, only_zones)
            return plan, 0, 0

        await self._drive_program(run, _plan, resumed=False)
        return True

    async def _drive_program(self, run: ProgramRun, make_plan, resumed: bool) -> None:
        """Wait for the turn, walk the plan, say how it went."""
        registry = self._program_registry()
        registry[run.program_id] = run
        cancelled = False
        try:
            async with self._executor_lock():
                if run.stop.is_set():
                    return
                run.started = run.started or dt_util.utcnow().isoformat()
                plan, tour, step = await make_plan()
                if not plan:
                    _LOGGER.info("Program %s has nothing to water", run.program_id)
                    return
                self._announce_program(run, plan, resumed)
                self._notify_programs()
                run.total_seconds = plan_wall_seconds(
                    plan, self._soak_seconds() if hasattr(self, "_soak_seconds") else 0
                )
                run.running_since = self.hass.loop.time()
                await self._execute_plan(run, plan, tour, step)
                self._report_program_finished(run)
        except asyncio.CancelledError:
            # A restart or a reload: the record stays, for the next start.
            cancelled = True
            raise
        finally:
            registry.pop(run.program_id, None)
            self._notify_programs()
            if not cancelled:
                await self.store.async_update_config(
                    {const.CONF_ACTIVE_PROGRAM_RUN: None}
                )

    # --- walking the plan ----------------------------------------------------

    async def _execute_plan(self, run: ProgramRun, plan: list, tour0: int, step0: int):
        for tour in range(tour0, len(plan)):
            steps = plan[tour]
            for index in range(step0 if tour == tour0 else 0, len(steps)):
                if run.stop.is_set():
                    return
                if not await self._wait_run_resume(run):
                    return
                await self._persist_program_run(run, plan, tour, index)
                step = steps[index]
                run.current_zones = [int(m["zone_id"]) for m in step["zones"]]
                run.tour, run.step = tour, index
                self._notify_programs()
                run.tours, run.steps = len(plan), len(steps)
                try:
                    run.results.extend(await self._run_step(run, step))
                finally:
                    run.current_zones = []
                last = tour == len(plan) - 1 and index == len(steps) - 1
                delay = float(step.get("delay") or 0.0)
                if delay > 0 and not last:
                    if await self._sleep_or_stop(run.stop, delay):
                        return

    async def _run_step(self, run: ProgramRun, step: dict) -> list:
        """Water the zones of a step together, each as it is now."""
        jobs = []
        for member in step["zones"]:
            zone_id = int(member["zone_id"])
            zone = self.store.get_zone(zone_id)
            if (
                zone is None
                or not zone.get(const.ZONE_LINKED_ENTITY)
                or zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED
            ):
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
            jobs.append(
                self._run_program_zone(
                    run,
                    zone,
                    int(member["passes"]),
                    float(member.get("max_litres") or 0.0),
                )
            )
        if not jobs:
            return []
        return [r for r in await asyncio.gather(*jobs) if r]

    async def _run_program_zone(
        self, run: ProgramRun, zone: dict, passes: int, max_litres: float = 0.0
    ):
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
                    "started": run.started or dt_util.utcnow().isoformat(),
                }
            }
        )

    async def _resume_program(self, record: dict, resumed: list) -> None:
        """Go on with the steps a restart interrupted, after the open run's end."""
        await self.store.async_update_config({const.CONF_ACTIVE_PROGRAM_RUN: None})
        started = dt_util.parse_datetime((record or {}).get("started") or "")
        if started is None or (dt_util.utcnow() - started) > timedelta(
            seconds=const.CYCLE_RESUME_MAX_AGE_SECONDS
        ):
            _LOGGER.info("The interrupted program run is too old, dropped")
            return
        if resumed:
            await asyncio.gather(*resumed, return_exceptions=True)
        plan = record.get("plan") or []
        program_id = record.get("program_id")
        if not plan or not program_id or program_id in self._program_registry():
            return
        run = ProgramRun(
            program_id, record.get("name") or program_id, bool(record.get("manual"))
        )
        run.started = record.get("started")

        async def _remaining():
            # The step that was open has been finished by its own record.
            return plan, int(record.get("tour") or 0), int(record.get("step") or 0) + 1

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
            },
        )
