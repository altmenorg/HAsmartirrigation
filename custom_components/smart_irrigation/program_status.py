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
from .schedules import next_fire, upcoming

_LOGGER = logging.getLogger(__name__)

STATE_IDLE = "idle"
STATE_WAITING = "waiting"
STATE_RUNNING = "running"
STATE_PAUSED = "paused"
STATE_SUSPENDED = "suspended"
STATE_DISABLED = "disabled"


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
            _LOGGER.debug("Could not record the start of %s: %s", program_id, e)

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
            if not main and state != STATE_DISABLED:
                _plan, total = self._program_totals(program, zones)
                for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
                    if schedule.get(const.SCHEDULE_ENABLED) is False:
                        continue
                    last = dt_util.parse_datetime(
                        last_runs.get(f"{program_id}:{schedule.get(const.SCHEDULE_ID)}")
                        or ""
                    )
                    found = next_fire(schedule, now, total, last, self._sun_moment, tz)
                    # A start inside the catch-up window is "now" for next_fire,
                    # but nothing fires it outside a startup or a reload: show
                    # the next occurrence that really will.
                    for _ in range(3):
                        if not (found and found.get("catch_up")):
                            break
                        found = next_fire(
                            schedule,
                            now,
                            total,
                            found["target"],
                            self._sun_moment,
                            tz,
                        )
                    if found and not found.get("catch_up"):
                        fire = found["fire"]
                        if next_start is None or fire < next_start:
                            next_start = fire
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
        for program in getattr(config, const.CONF_PROGRAMS, None) or []:
            if program.get(const.PROGRAM_MAIN) or (
                program.get(const.PROGRAM_ENABLED) is False
            ):
                continue
            program_id = program.get(const.PROGRAM_ID)
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
                            "steps": steps,
                        }
                    )
        planned.sort(key=lambda item: item["start"])
        return planned
