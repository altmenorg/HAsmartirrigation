"""What the programs are doing, and what they will do: for the panel and the sensors.

Three views of the same things, each cheap to build:

* the **live state**: which programs are running or waiting their turn, where each
  one is (tour, step), which valves are open and for how much longer;
* the **overview**: each program's state and its next start, the one-line answer a
  sensor holds;
* the **planning**: every start of every schedule over the next days, with the
  zones each would water and for how long. The weather is not known days ahead,
  so a planned run is a run that would go ahead if nothing held it back.
"""

import asyncio
import logging
from datetime import timedelta

import homeassistant.util.dt as dt_util
from homeassistant.helpers.dispatcher import async_dispatcher_send

from . import const
from .programs import active_adjustment, plan_program, plan_wall_seconds
from .schedules import ANCHOR_END, next_fire, upcoming

_LOGGER = logging.getLogger(__name__)

STATE_IDLE = "idle"
STATE_WAITING = "waiting"
STATE_RUNNING = "running"
STATE_PAUSED = "paused"
STATE_SUSPENDED = "suspended"
STATE_DISABLED = "disabled"

# How far ahead of now a planned start still has a rain forecast to read: the
# hourly window of the skip check. Beyond it no reason is given.
PLANNING_FORECAST_HOURS = 48


class ProgramStatusMixin:
    """The live state, overview and planning of the programs."""

    def _notify_programs(self) -> None:
        """Tell the program sensors and the panel that something changed."""
        try:
            async_dispatcher_send(self.hass, const.DOMAIN + "_programs_updated")
        except Exception as e:  # noqa: BLE001 - a display must never stop a run
            _LOGGER.debug("Could not announce a program change: %s", e)

    async def _note_program_started(self, program_id) -> None:
        """Record that this program really started watering now."""
        try:
            started = dict(
                getattr(self.store.config, const.CONF_PROGRAM_LAST_STARTED, None) or {}
            )
            started[program_id] = dt_util.utcnow().isoformat()
            await self.store.async_update_config(
                {const.CONF_PROGRAM_LAST_STARTED: started}
            )
        except asyncio.CancelledError:
            raise
        except Exception as e:  # noqa: BLE001 - a display must never stop a run
            _LOGGER.warning("Could not record the start of %s: %s", program_id, e)

    async def _note_main_program_started(self) -> None:
        """The main program is the cycle the start triggers run."""
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return
        for program in getattr(config, const.CONF_PROGRAMS, None) or []:
            if program.get(const.PROGRAM_MAIN):
                await self._note_program_started(program.get(const.PROGRAM_ID))
                return

    # --- live -------------------------------------------------------------------

    def _open_valves(self) -> list:
        """The valves open under a run of ours: zone, seconds left, share done."""
        now = dt_util.utcnow()
        valves = []
        for zone_id, record in (self._active_valve_runs or {}).items():
            started = dt_util.parse_datetime(record.get("started") or "")
            duration = float(record.get("duration") or 0.0)
            if started is None or duration <= 0:
                continue
            elapsed = max(0.0, (now - started).total_seconds())
            zone = self.store.get_zone(zone_id) or {}
            valves.append(
                {
                    "zone_id": int(zone_id),
                    "zone": zone.get(const.ZONE_NAME),
                    "remaining_seconds": int(max(0.0, duration - elapsed)),
                    "percent": int(min(100.0, 100.0 * elapsed / duration)),
                }
            )
        return sorted(valves, key=lambda v: v["zone_id"])

    def async_live_state(self) -> dict:
        """What is being watered right now, in memory only."""
        programs = []
        for run in self._program_registry().values():
            running = run.running_since is not None
            # The time paused is not progress.
            elapsed = (
                max(
                    0.0,
                    self.hass.loop.time()
                    - run.running_since
                    - (self.paused_seconds_total() - run.paused_at_start),
                )
                if running
                else 0.0
            )
            total = run.total_seconds or 0.0
            programs.append(
                {
                    "program_id": run.program_id,
                    "name": run.name,
                    "state": STATE_RUNNING if running else STATE_WAITING,
                    "manual": run.manual,
                    "tour": run.tour + 1 if running else 0,
                    "tours": run.tours,
                    "step": run.step + 1 if running else 0,
                    "steps": run.steps,
                    "percent": (
                        int(min(100.0, 100.0 * elapsed / total))
                        if running and total > 0
                        else 0
                    ),
                    "remaining_seconds": (
                        int(max(0.0, total - elapsed)) if running else None
                    ),
                }
            )
        # A program whose interrupted pass is being finished after a restart is
        # running, though it has not taken its turn yet.
        for program_id, info in (
            getattr(self, "_programs_resuming_state", None) or {}
        ).items():
            if program_id in self._program_registry():
                continue
            programs.append(
                {
                    "program_id": program_id,
                    "name": info.get("name"),
                    "state": STATE_RUNNING,
                    "manual": info.get("manual"),
                    "tour": 1,
                    "tours": 1,
                    "step": 1,
                    "steps": 1,
                    "percent": 0,
                    "remaining_seconds": None,
                }
            )
        return {
            "paused": self.watering_paused(),
            "programs": programs,
            "valves": self._open_valves(),
            "cycle": self._sequential_cycle is not None,
        }

    # --- overview ---------------------------------------------------------------------

    def program_adjustment(self, program_id) -> dict | None:
        """The runtime adjustment in force for a program, or None."""
        return active_adjustment(
            getattr(self.store.config, const.CONF_PROGRAM_ADJUSTMENTS, None),
            program_id,
            dt_util.utcnow(),
        )

    def _program_totals(self, program: dict, zones) -> tuple:
        plan = plan_program(
            program, zones, self.program_adjustment(program.get(const.PROGRAM_ID))
        )
        soak = float(getattr(self.store.config, const.CONF_SOAK_MINUTES, 0) or 0) * 60.0
        return plan, plan_wall_seconds(plan, soak)

    async def _main_program_plan(self, zones) -> tuple:
        """``(plan, total)`` of the classic cycle the main program runs.

        The main program has no steps: it waters every eligible zone for its
        duration, one after the other or all at once as the sequencing setting
        says. The plan has the shape of any program's, so the planning shows it
        the same way. With the recalculation before the start on, the durations
        are the live estimates (what the zones will be when it starts), and the
        total is the one the schedules are placed with.
        """
        config = self.store.config
        durations = {}
        if getattr(config, const.CONF_RECALCULATE_BEFORE_START, False):
            try:
                estimates = await self.async_estimate_all_zones_now() or {}
            except Exception as e:  # noqa: BLE001 - a display must not fail
                _LOGGER.debug("No live estimate for the main program: %s", e)
                estimates = {}
            for zone in zones:
                estimate = estimates.get(str(zone.get(const.ZONE_ID)))
                if (
                    zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC
                    and isinstance(estimate, dict)
                    and estimate.get("duration") is not None
                ):
                    durations[zone.get(const.ZONE_ID)] = estimate["duration"]
        members = []
        for zone in zones:
            seconds = durations.get(
                zone.get(const.ZONE_ID), zone.get(const.ZONE_DURATION)
            )
            if (
                not zone.get(const.ZONE_LINKED_ENTITY)
                or zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED
                or not isinstance(seconds, (int, float))
                or seconds <= 0
            ):
                continue
            members.append(
                {
                    "zone_id": int(zone.get(const.ZONE_ID)),
                    "seconds": float(seconds),
                    "passes": 1,
                    "max_litres": 0.0,
                    "lead": 0.0,
                }
            )
        if not members:
            return [], 0.0
        sequencing = getattr(
            config, const.CONF_ZONE_SEQUENCING, const.CONF_DEFAULT_ZONE_SEQUENCING
        )
        if sequencing == const.CONF_ZONE_SEQUENCING_PARALLEL:
            steps = [{"id": "main", "zones": members, "delay": 0.0}]
        else:
            steps = [
                {"id": f"zone_{m['zone_id']}", "zones": [m], "delay": 0.0}
                for m in members
            ]
        total = await self._planned_run_seconds()
        return [steps], float(total)

    async def _main_program_total(self, program: dict) -> float:
        """The length the main program's "done by" starts are placed for.

        The figure the scheduler arms them with (``_planned_run_seconds``), so
        what is shown is what is armed, whatever the zones have stored: after a
        morning watering they have nothing, while the run is planned on the
        estimate. Only a schedule anchored at its end needs it, and the
        estimate is slow, so it is not worked out for the others.
        """
        if not any(
            schedule.get(const.SCHEDULE_ENABLED) is not False
            and schedule.get(const.SCHEDULE_ANCHOR) == ANCHOR_END
            for schedule in program.get(const.PROGRAM_SCHEDULES) or []
        ):
            return 0.0
        return float(await self._planned_run_seconds() or 0)

    def _schedules_next_start(self, program: dict, total, last_runs, now, tz):
        """The soonest start of the program's enabled schedules, or None."""
        program_id = program.get(const.PROGRAM_ID)
        next_start = None
        for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
            if schedule.get(const.SCHEDULE_ENABLED) is False:
                continue
            last = dt_util.parse_datetime(
                last_runs.get(f"{program_id}:{schedule.get(const.SCHEDULE_ID)}") or ""
            )
            found = next_fire(schedule, now, total, last, self._sun_moment, tz)
            # A start inside the catch-up window is "now" for next_fire, but
            # nothing fires it outside a startup or a reload: show the next
            # occurrence that really will.
            for _ in range(3):
                if not (found and found.get("catch_up")):
                    break
                found = next_fire(
                    schedule, now, total, found["target"], self._sun_moment, tz
                )
            if found and not found.get("catch_up"):
                fire = found["fire"]
                if next_start is None or fire < next_start:
                    next_start = fire
        return next_start

    async def async_main_program_next_start(self):
        """When the main program's own schedules start it next, or None.

        None when they do not start it (the start trigger does), when it is
        disabled, or when no occurrence is to come.
        """
        if not self.main_program_uses_schedules():
            return None
        config = self.store.config
        for program in getattr(config, const.CONF_PROGRAMS, None) or []:
            if not program.get(const.PROGRAM_MAIN):
                continue
            if program.get(const.PROGRAM_ENABLED) is False:
                return None
            return self._schedules_next_start(
                program,
                await self._main_program_total(program),
                dict(getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {}),
                dt_util.utcnow(),
                dt_util.get_default_time_zone(),
            )
        return None

    async def async_program_overview(self) -> list:
        """Each program's state and next start."""
        config = self.store.config
        programs = getattr(config, const.CONF_PROGRAMS, None) or []
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return []
        zones = await self.store.async_get_zones()
        last_runs = dict(getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {})
        started_at = dict(getattr(config, const.CONF_PROGRAM_LAST_STARTED, None) or {})
        live = self.async_live_state()
        running = {p["program_id"]: p for p in live["programs"]}
        now = dt_util.utcnow()
        tz = dt_util.get_default_time_zone()
        overview = []
        for program in programs:
            program_id = program.get(const.PROGRAM_ID)
            main = bool(program.get(const.PROGRAM_MAIN))
            suspended = self.suspended_until(const.SUSPEND_PROGRAM, program_id)
            if program.get(const.PROGRAM_ENABLED) is False:
                state = STATE_DISABLED
            elif suspended is not None:
                state = STATE_SUSPENDED
            elif program_id in running:
                state = (
                    STATE_PAUSED
                    if live["paused"] and running[program_id]["state"] == STATE_RUNNING
                    else running[program_id]["state"]
                )
            elif main and live["cycle"]:
                state = STATE_PAUSED if live["paused"] else STATE_RUNNING
            else:
                state = STATE_IDLE
            next_start = None
            # The main program has a next start only when schedules of its own
            # start it; otherwise it is the start trigger's. It does not depend
            # on there being anything to water: a run with nothing to water
            # still starts (and finds nothing), the planning lists nothing.
            if state != STATE_DISABLED and (
                not main or self.main_program_uses_schedules()
            ):
                if main:
                    total = await self._main_program_total(program)
                else:
                    _plan, total = self._program_totals(program, zones)
                next_start = self._schedules_next_start(
                    program, total, last_runs, now, tz
                )
            stamps = [
                dt_util.parse_datetime(v or "")
                for k, v in last_runs.items()
                if k.startswith(f"{program_id}:")
            ]
            stamps = [s for s in stamps if s is not None]
            # A manual or main run leaves no mark among the schedules'.
            started = dt_util.parse_datetime(started_at.get(program_id) or "")
            if started is not None:
                stamps.append(started)
            overview.append(
                {
                    "program_id": program_id,
                    "name": program.get(const.PROGRAM_NAME) or program_id,
                    "main": main,
                    "state": state,
                    "next_start": next_start.isoformat() if next_start else None,
                    "last_run": max(stamps).isoformat() if stamps else None,
                    "suspended_until": suspended.isoformat() if suspended else None,
                    "live": running.get(program_id),
                    # The runtime adjustment in force, or None.
                    "adjustment": self.program_adjustment(program_id),
                }
            )
        return overview

    # --- planning ---------------------------------------------------------------------

    async def async_planning(self, days: int = 3) -> list:
        """Every start of every schedule over the next days, soonest first."""
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return []
        zones = await self.store.async_get_zones()
        names = {int(z[const.ZONE_ID]): z.get(const.ZONE_NAME) for z in zones}
        last_runs = dict(getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {})
        now = dt_util.utcnow()
        until = now + timedelta(days=max(1, min(int(days), 14)))
        tz = dt_util.get_default_time_zone()
        planned = []
        forecasts: dict = {}
        sheltered = await self._planning_sheltered_zones()
        for program in getattr(config, const.CONF_PROGRAMS, None) or []:
            main = bool(program.get(const.PROGRAM_MAIN))
            if program.get(const.PROGRAM_ENABLED) is False or (
                main and not self.main_program_uses_schedules()
            ):
                continue
            program_id = program.get(const.PROGRAM_ID)
            if main:
                plan, total = await self._main_program_plan(zones)
            else:
                plan, total = self._program_totals(program, zones)
            if not plan:
                continue
            steps = [
                {
                    "zones": [
                        {
                            "zone_id": m["zone_id"],
                            "zone": names.get(m["zone_id"]),
                            "seconds": int(m["seconds"]),
                            # What the zone is expected to water for, the
                            # same number under the name the panel shows.
                            "expected_seconds": int(m["seconds"]),
                        }
                        for m in step["zones"]
                    ]
                }
                for step in plan[0]
            ]
            for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
                if schedule.get(const.SCHEDULE_ENABLED) is False:
                    continue
                schedule_id = schedule.get(const.SCHEDULE_ID)
                last = dt_util.parse_datetime(
                    last_runs.get(f"{program_id}:{schedule_id}") or ""
                )
                for result in upcoming(
                    schedule, now, total, last, self._sun_moment, tz, until
                ):
                    start = result["fire"]
                    prediction = await self._planning_prediction(
                        schedule, start, now, plan, sheltered, forecasts
                    )
                    planned.append(
                        {
                            "program_id": program_id,
                            "program": program.get(const.PROGRAM_NAME) or program_id,
                            "schedule_id": schedule_id,
                            "start": start.isoformat(),
                            "end": (start + timedelta(seconds=total)).isoformat(),
                            "target": result["target"].isoformat(),
                            "anchor": schedule.get(const.SCHEDULE_ANCHOR),
                            "weather": schedule.get(const.SCHEDULE_WEATHER)
                            is not False,
                            "tours": len(plan),
                            "expected_seconds": int(total),
                            "steps": steps,
                            **prediction,
                        }
                    )
        planned.sort(key=lambda item: item["start"])
        return planned

    async def _planning_sheltered_zones(self) -> set:
        """Zones the rain forecast cannot reach (under glass), or none."""
        fetch = getattr(self, "async_zones_sheltered_from_rain", None)
        if fetch is None:
            return set()
        try:
            return {int(z) for z in await fetch()}
        except Exception as e:  # noqa: BLE001 - a display must not fail
            _LOGGER.debug("Could not read the sheltered zones: %s", e)
            return set()

    async def _planning_prediction(
        self, schedule, start, now, plan, sheltered, cache
    ) -> dict:
        """What the forecast says about a planned run: will it be held back?

        ``skipped_reason`` is the id of the condition that would hold the run
        back (``precipitation``) and ``forecast`` the numbers behind it; both are
        None when the run would go ahead, when the schedule ignores the weather,
        or when the start lies beyond what the forecast covers
        (``PLANNING_FORECAST_HOURS``). Only forecast conditions are predicted:
        a sensor reading now says nothing about the day after tomorrow.
        """
        none = {
            "skipped_reason": None,
            "forecast": None,
            "forecast_known": False,
            "sheltered_zone_ids": [],
        }
        if schedule.get(const.SCHEDULE_WEATHER) is False:
            return none
        if start - now > timedelta(hours=PLANNING_FORECAST_HOURS):
            return none
        evaluate = getattr(self, "_evaluate_precipitation_forecast", None)
        if evaluate is None:
            return none
        key = start.isoformat()
        if key not in cache:
            try:
                cache[key] = await evaluate(run_start=dt_util.as_local(start))
            except Exception as e:  # noqa: BLE001 - a display must not fail
                _LOGGER.debug("No forecast for the planning of %s: %s", key, e)
                cache[key] = None
        check = cache[key]
        if not check or not check.get("enabled") or not check.get("available"):
            return none
        zone_ids = {m["zone_id"] for step in plan[0] for m in step["zones"]}
        held = bool(check.get("skip")) and not zone_ids <= sheltered
        return {
            "skipped_reason": check.get("id") if held else None,
            "forecast": {
                name: check.get(name)
                for name in ("forecast_mm", "expected_mm", "threshold_mm")
            },
            "forecast_known": True,
            # The zones the rain does not reach water anyway.
            "sheltered_zone_ids": sorted(zone_ids & sheltered) if held else [],
        }
