"""What the programs are doing, and what they will do: for the panel and the sensors.

Three views of the same things, each cheap to build:

* the **live state**: which programs are running or waiting their turn, where each
  one is (tour, step), which valves are open and for how much longer;
* the **overview**: each program's state and its next start, the one-line answer a
  sensor holds;
* the **planning**: every start of every schedule over the next days, with the
  zones each would water and for how long. The weather is not known days ahead,
  so a planned run is a run that would go ahead if nothing held it back.

A schedule that starts its program after another program has no moment of its
own: it is planned after each planned run of that program that is expected to
water (not one with nothing to water, held back by the forecast or suspended),
at its end plus the offset, and not at all when that program is not planned in
the window. planning_sequence.py then moves it behind where that run really
ends.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, cast

import homeassistant.util.dt as dt_util
from homeassistant.helpers.dispatcher import async_dispatcher_send

from . import const
from .delivery import zones_without_valve
from .master_switch import watering_off
from .programs import (
    DURATION_IGNORING_THRESHOLD,
    active_adjustment,
    chain_loop,
    drop_below_deficit,
    needs_run_length,
    plan_program,
    plan_timeline,
    plan_wall_seconds,
)
from .schedules import (
    after_program_of,
    chained_start,
    is_after_program,
    next_fire,
    schedule_skip_conditions,
    upcoming,
)

_LOGGER = logging.getLogger(__name__)

STATE_IDLE = "idle"
STATE_WAITING = "waiting"
STATE_RUNNING = "running"
STATE_PAUSED = "paused"
STATE_SUSPENDED = "suspended"

# How far ahead of now a planned start still has a rain forecast to read: the
# hourly window of the skip check. Beyond it no reason is given.
PLANNING_FORECAST_HOURS = 48


class ProgramStatusMixin:
    """The live state, overview and planning of the programs."""

    # The coordinator this is mixed into has them (declared for the type
    # checker only: no value, so nothing is set on the class).
    hass: Any
    store: Any

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

    # --- live -------------------------------------------------------------------

    def _open_valves(self) -> list:
        """The valves open under a run of ours: zone, seconds left, share done."""
        now = dt_util.utcnow()
        valves = []
        # Held by a restored pause: closed, and listed among what it holds.
        held = getattr(self, "_held_by_pause", None) or {}
        for zone_id, record in (self._active_valve_runs or {}).items():
            if int(zone_id) in held:
                continue
            started = dt_util.parse_datetime(record.get("started") or "")
            duration = float(record.get("duration") or 0.0)
            if started is None or duration <= 0:
                continue
            elapsed = max(0.0, (now - started).total_seconds())
            zone = self.store.get_zone(zone_id) or {}
            entry = {
                "zone_id": int(zone_id),
                "zone": zone.get(const.ZONE_NAME),
                "remaining_seconds": int(max(0.0, duration - elapsed)),
                "percent": int(min(100.0, 100.0 * elapsed / duration)),
            }
            control = self._live_control(zone_id)
            if control is not None:
                entry.update(zone_progress(control, min(elapsed, duration), duration))
            valves.append(entry)
        return sorted(valves, key=lambda v: v["zone_id"])

    def _zone_record(self, zone_id) -> dict:
        # The coordinator's store: cast, as a mixin cannot declare it.
        return cast(Any, self).store.get_zone(zone_id) or {}

    def _live_control(self, zone_id):
        controls = getattr(self, "_run_controls", None)
        if controls is None:
            return None
        return controls().get(int(zone_id))

    def _soaking(self) -> list:
        """The zones soaking between two passes: closed, and not done yet."""
        now = dt_util.utcnow()
        soaking = []
        controls = getattr(self, "_run_controls", None)
        for zone_id, control in (controls() if controls else {}).items():
            until = getattr(control, "soak_until", None)
            if until is None:
                continue
            zone = self._zone_record(zone_id)
            left = max(0.0, (until - now).total_seconds())
            later = control.plan[control.pass_index + 1 :]
            soaking.append(
                {
                    "zone_id": int(zone_id),
                    "zone": zone.get(const.ZONE_NAME),
                    "until": until.isoformat(),
                    "next_pass": control.pass_index + 2,
                    "passes": len(control.plan),
                    # What the zone still takes, soak and passes to come.
                    "remaining_seconds": int(
                        left
                        + sum(later)
                        + control.lead * len(later)
                        + control.soak * max(0, len(later) - 1)
                    ),
                    "percent": water_percent(control, 0.0),
                }
            )
        return sorted(soaking, key=lambda v: v["zone_id"])

    def _starting(self) -> list:
        """The zones waiting for their supply to come up before they open."""
        now = dt_util.utcnow()
        priming = getattr(self, "_supply_priming_zones", None) or {}
        starting = []
        # A zone waiting behind the one priming its supply has no time of its
        # own: it opens when that one does.
        ends = {
            info.get("supply"): info["until"]
            for info in priming.values()
            if info.get("until")
        }
        for zone_id, info in priming.items():
            if info.get("supply") not in ends:
                continue
            zone = self._zone_record(zone_id)
            until = dt_util.parse_datetime(info.get("until") or ends[info["supply"]])
            starting.append(
                {
                    "zone_id": int(zone_id),
                    "zone": zone.get(const.ZONE_NAME),
                    "supply": info.get("supply"),
                    "remaining_seconds": (
                        int(max(0.0, (until - now).total_seconds())) if until else 0
                    ),
                }
            )
        return sorted(starting, key=lambda v: v["zone_id"])

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
            # When the pause lifts itself, and what it holds: the zones it
            # interrupted, which go on with what they are owed.
            **self.pause_live(),
            "programs": programs,
            "valves": self._open_valves(),
            # Between two passes, and while a pump comes up: nothing is open,
            # and the run is not over (UX walk of 13 Nov., Q6, Q18).
            "soaking": self._soaking(),
            "starting": self._starting(),
            # The one-off run of every zone ("irrigate all zones now"): one
            # zone after the other, or all at once (counted while it lasts).
            "cycle": self._sequential_cycle is not None
            or getattr(self, "_parallel_cycles", 0) > 0,
        }

    # --- overview ---------------------------------------------------------------------

    def program_adjustment(self, program_id, at=None) -> dict | None:
        """The runtime adjustment in force for a program, or None.

        ``at`` is the moment asked about, now by default: a run planned after
        the adjustment ends is watered without it.
        """
        return active_adjustment(
            getattr(self.store.config, const.CONF_PROGRAM_ADJUSTMENTS, None),
            program_id,
            at or dt_util.utcnow(),
        )

    def zones_for_programs(self, zones) -> list:
        """The zones as a program's steps read them.

        Each automatic zone also carries the run its bucket implies without its
        own threshold: a step with a minimum deficit of its own decides on that
        instead of the zone's threshold, which used to hold such a step at
        nothing to water while its own minimum was met (#912).
        """
        from_bucket = getattr(self, "duration_from_bucket", None)
        if from_bucket is None:
            return list(zones)
        # A zone held back today by its days between irrigation keeps its
        # deficit for the next run: no step waters it, minimum or not.
        held_on, held = getattr(self, "_days_held_zones", None) or (None, set())
        if held_on != dt_util.now().date():
            held = set()
        result = []
        for zone in zones:
            if (
                zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC
                and zone.get(const.ZONE_ID) not in held
            ):
                try:
                    bucket = float(zone.get(const.ZONE_BUCKET) or 0.0)
                    seconds = from_bucket(zone, bucket, ignore_threshold=True)
                except (TypeError, ValueError):
                    seconds = None
                if seconds:
                    zone = {**zone, DURATION_IGNORING_THRESHOLD: seconds}
            result.append(zone)
        return result

    def _program_totals(self, program: dict, zones, at=None) -> tuple:
        for_programs = self.zones_for_programs(zones)
        plan = drop_below_deficit(
            plan_program(
                program,
                for_programs,
                self.program_adjustment(program.get(const.PROGRAM_ID), at),
            ),
            for_programs,
        )
        soak = float(getattr(self.store.config, const.CONF_SOAK_MINUTES, 0) or 0) * 60.0
        return plan, plan_wall_seconds(plan, soak)

    async def zones_as_planned(self, zones) -> list:
        """The zones with the durations their next run will water.

        The durations the last calculation stored, or, with the recalculation
        before the start on, the live estimate of each automatic zone: what the
        calculation will find when the run starts. One answer for every program,
        and for everything that shows or arms them
        (the planning, the next starts, the schedules), so they cannot disagree:
        the steps of the other programs used to read the stored durations
        whatever the setting said (#912).
        """
        config = self.store.config
        if not getattr(config, const.CONF_RECALCULATE_BEFORE_START, False):
            return zones
        planned_durations = getattr(self, "_planned_durations", None)
        if planned_durations is not None:
            # The durations the start is placed with, forecast rain credited.
            planned = await planned_durations()
            if planned is None:
                return zones
            return [
                (
                    {**zone, const.ZONE_DURATION: planned[zone.get(const.ZONE_ID)]}
                    if zone.get(const.ZONE_ID) in planned
                    else zone
                )
                for zone in zones
            ]
        try:
            estimates = await self.async_estimate_all_zones_now() or {}
        except Exception as e:  # noqa: BLE001 - a display must not fail
            _LOGGER.debug("No live estimate for the planned durations: %s", e)
            return zones
        planned = []
        for zone in zones:
            estimate = estimates.get(str(zone.get(const.ZONE_ID)))
            if (
                zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC
                and isinstance(estimate, dict)
                and estimate.get("duration") is not None
            ):
                zone = {**zone, const.ZONE_DURATION: estimate["duration"]}
            planned.append(zone)
        return planned

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

    def _chained_next_starts(self, programs, zones, ends: dict, tz) -> dict:
        """``ends`` with the programs that start after another one added.

        ``ends`` maps a program id to ``(next start, run seconds)``. A program
        whose "after" schedule waits for one in it starts at that one's end
        plus the offset, the soonest of its schedules, and before its own
        timed schedules only if sooner; after one with nothing to water, at
        that one's start plus the offset (it starts the next all the same).
        Passes repeat for a chain of chains.
        """
        found = dict(ends)
        for _ in range(len(programs)):
            changed = False
            for program in programs:
                program_id = program.get(const.PROGRAM_ID)
                for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
                    after = after_program_of(schedule)
                    if (
                        after is None
                        or after not in found
                        or schedule.get(const.SCHEDULE_ENABLED) is False
                    ):
                        continue
                    start, total = found[after]
                    # A run with nothing to water still starts what comes
                    # after it, from its moment.
                    due = chained_start(
                        schedule, start + timedelta(seconds=max(0, total)), tz
                    )
                    if due is None:
                        continue
                    if program_id not in found or due < found[program_id][0]:
                        _plan, own = self._program_totals(program, zones)
                        found[program_id] = (due, own)
                        changed = True
            if not changed:
                break
        return found

    async def async_next_program_start(self):
        """When a program's schedules start one next, the soonest of all, or None.

        None with the full controller off (the start trigger starts the
        watering then), or when no schedule has an occurrence to come.
        """
        if not self.schedules_start_watering():
            return None
        starts = [
            dt_util.parse_datetime(p["next_start"])
            for p in await self.async_program_overview()
            if p.get("next_start")
        ]
        starts = [s for s in starts if s is not None]
        return min(starts) if starts else None

    async def async_program_overview(self) -> list:
        """Each program's state and next start."""
        config = self.store.config
        programs = getattr(config, const.CONF_PROGRAMS, None) or []
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return []
        zones = await self.store.async_get_zones()
        # The planned durations only move a "done by" start; the estimate is
        # slow, so it is not worked out for schedules that start at their time.
        if needs_run_length(programs):
            zones = await self.zones_as_planned(zones)
        last_runs = dict(getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {})
        started_at = dict(getattr(config, const.CONF_PROGRAM_LAST_STARTED, None) or {})
        live = self.async_live_state()
        running = {p["program_id"]: p for p in live["programs"]}
        now = dt_util.utcnow()
        tz = dt_util.get_default_time_zone()
        overview = []
        # When each program's run ends next, for the ones that start after it.
        ends: dict = {}
        if not watering_off(self.store):
            for program in programs:
                _plan, total = self._program_totals(program, zones)
                start = self._schedules_next_start(program, total, last_runs, now, tz)
                if start is not None:
                    ends[program.get(const.PROGRAM_ID)] = (start, total)
            ends = self._chained_next_starts(programs, zones, ends, tz)
        for program in programs:
            program_id = program.get(const.PROGRAM_ID)
            suspended = self.suspended_until(const.SUSPEND_PROGRAM, program_id)
            if suspended is not None:
                state = STATE_SUSPENDED
            elif program_id in running:
                state = (
                    STATE_PAUSED
                    if live["paused"] and running[program_id]["state"] == STATE_RUNNING
                    else running[program_id]["state"]
                )
            else:
                state = STATE_IDLE
            next_start = None
            # It does not depend on there being anything to water: a run with
            # nothing to water still starts (and finds nothing), the planning
            # lists nothing.
            if program_id in ends:
                next_start = ends[program_id][0]
            stamps = [
                dt_util.parse_datetime(v or "")
                for k, v in last_runs.items()
                if k.startswith(f"{program_id}:")
            ]
            stamps = [s for s in stamps if s is not None]
            # A manual run leaves no mark among the schedules'.
            started = dt_util.parse_datetime(started_at.get(program_id) or "")
            if started is not None:
                stamps.append(started)
            overview.append(
                {
                    "program_id": program_id,
                    "name": program.get(const.PROGRAM_NAME) or program_id,
                    "state": state,
                    "next_start": next_start.isoformat() if next_start else None,
                    "last_run": max(stamps).isoformat() if stamps else None,
                    "suspended_until": suspended.isoformat() if suspended else None,
                    "live": running.get(program_id),
                    # The runtime adjustment in force, or None.
                    "adjustment": self.program_adjustment(program_id),
                    # Whether there is anything to start: the card offered
                    # "start" for a program with no zone in its steps.
                    "can_run": any(
                        step.get(const.STEP_ENABLED, True) is not False
                        and step.get(const.STEP_ZONES)
                        for step in program.get(const.PROGRAM_STEPS) or []
                    ),
                }
            )
        return overview

    # --- planning ---------------------------------------------------------------------

    async def async_planning(self, days: int = 3) -> list:
        """Every start of every schedule over the next days, soonest first."""
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return []
        if watering_off(config):
            # Nothing will start: the panel says Smart Irrigation is off.
            return []
        zones = await self.zones_as_planned(await self.store.async_get_zones())
        names = {int(z[const.ZONE_ID]): z.get(const.ZONE_NAME) for z in zones}
        last_runs = dict(getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {})
        now = dt_util.utcnow()
        until = now + timedelta(days=max(1, min(int(days), 14)))
        tz = dt_util.get_default_time_zone()
        planned: list[dict] = []
        forecasts: dict = {}
        soak_minutes = float(getattr(config, const.CONF_SOAK_MINUTES, 0) or 0)
        sheltered = await self._planning_sheltered_zones()
        # A zone of a program's steps with no valve is left out of its run,
        # and the planning said "no zone of this run is short enough of water"
        # over a zone 10 mm dry (#969). It names them instead.
        without_valve = {
            entry["id"]: {"zone_id": entry["id"], "zone": entry["name"]}
            for entry in zones_without_valve(zones)
        }
        programs = getattr(config, const.CONF_PROGRAMS, None) or []
        # What each program needs to be planned, by id, for the runs started
        # after another program (planned once the others are).
        contexts: dict = {}
        for program in programs:
            program_id = program.get(const.PROGRAM_ID)
            plan, total = self._program_totals(program, zones)
            # A start with nothing to water is still a start: the schedule fires
            # and finds nothing. Leaving it out said "no program is planned"
            # under a schedule that was, and hid the reason (#912). It is listed
            # with nothing in it, where the scheduler places it.
            nothing = not plan
            placed_at_moment = nothing and total <= 0
            named = [
                int(zone_id)
                for step in program.get(const.PROGRAM_STEPS) or []
                if step.get(const.STEP_ENABLED) is not False
                for zone_id in step.get(const.STEP_ZONES) or []
            ]
            no_valve = [
                without_valve[zone_id]
                for zone_id in dict.fromkeys(named)
                if zone_id in without_valve
            ]

            def steps_of(plan):
                return [
                    {
                        "zones": [
                            {
                                "zone_id": m["zone_id"],
                                "zone": names.get(m["zone_id"]),
                                "seconds": int(m["seconds"]),
                                # What the zone is expected to water for, the
                                # same number under the name the panel shows.
                                "expected_seconds": int(m["seconds"]),
                                # In passes with a soak between, and up to a
                                # volume: the planning said "Hecken 2 min" over
                                # an expected 19 min 45 s (UX walk of 13 Nov.).
                                "passes": max(1, int(m.get("passes") or 1)),
                                "max_litres": float(m.get("max_litres") or 0.0) or None,
                            }
                            for m in step["zones"]
                        ]
                    }
                    for step in (plan[0] if plan else [])
                ]

            steps = steps_of(plan)

            def timeline_of(plan):
                return self._timeline(plan, soak_minutes * 60.0, names)

            # A run before the end of a suspension does not take place: the
            # scheduler lets it pass. The planning listed it as any other.
            suspended = self.suspended_until(const.SUSPEND_PROGRAM, program_id)
            adjustment_now = self.program_adjustment(program_id, now)

            async def item_for(
                schedule,
                start,
                target,
                *,
                program=program,
                program_id=program_id,
                plan=plan,
                total=total,
                steps=steps,
                timeline_of=timeline_of,
                suspended=suspended,
                adjustment_now=adjustment_now,
                no_valve=no_valve,
            ):
                # The adjustment of the run's start, not of now: one that
                # ends before the run no longer lengthens or shortens it.
                run_plan, run_total = plan, total
                if self.program_adjustment(program_id, start) != adjustment_now:
                    run_plan, run_total = self._program_totals(program, zones, at=start)
                if suspended is not None and start < suspended:
                    prediction = {
                        "skipped_reason": "suspended",
                        "forecast": None,
                        "forecast_known": False,
                        "sheltered_zone_ids": [],
                    }
                elif run_plan:
                    prediction = await self._planning_prediction(
                        schedule, start, now, run_plan, sheltered, forecasts
                    )
                else:
                    prediction = {
                        "skipped_reason": None,
                        "forecast": None,
                        "forecast_known": False,
                        "sheltered_zone_ids": [],
                    }
                return {
                    "program_id": program_id,
                    "program": program.get(const.PROGRAM_NAME) or program_id,
                    "schedule_id": schedule.get(const.SCHEDULE_ID),
                    "start": start.isoformat(),
                    "end": (start + timedelta(seconds=run_total)).isoformat(),
                    "target": target.isoformat(),
                    "anchor": schedule.get(const.SCHEDULE_ANCHOR),
                    "weather": schedule.get(const.SCHEDULE_WEATHER) is not False,
                    "tours": len(run_plan),
                    "soak_seconds": int(soak_minutes * 60),
                    "expected_seconds": int(run_total),
                    "steps": steps if run_plan is plan else steps_of(run_plan),
                    "timeline": timeline_of(run_plan),
                    "nothing_to_water": not run_plan,
                    "zones_without_valve": no_valve,
                    "suspended_until": (
                        suspended.isoformat() if suspended is not None else None
                    ),
                    **prediction,
                }

            contexts[program_id] = (program, item_for)
            for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
                if schedule.get(const.SCHEDULE_ENABLED) is False:
                    continue
                if is_after_program(schedule):
                    continue
                schedule_id = schedule.get(const.SCHEDULE_ID)
                last = dt_util.parse_datetime(
                    last_runs.get(f"{program_id}:{schedule_id}") or ""
                )
                # next_fire places no "done by" start without a length; a
                # second before the moment lists it at its moment.
                for result in upcoming(
                    schedule,
                    now,
                    1.0 if placed_at_moment else total,
                    last,
                    self._sun_moment,
                    tz,
                    until,
                ):
                    start = result["target"] if placed_at_moment else result["fire"]
                    planned.append(await item_for(schedule, start, result["target"]))
        await self._plan_chained_runs(planned, contexts, until, tz)
        # By the moment, not the text, whatever the time zone each is written
        # in: 05:54+01:00 comes after 05:00+00:00 (06:00 here).
        planned.sort(key=lambda item: _moment(item["start"]))
        return planned

    async def _plan_chained_runs(self, planned: list, contexts: dict, until, tz):
        """Add to ``planned`` the runs started after another planned run.

        Each planned run starts the programs waiting for it, on the days their
        schedules allow, up to ``until``: a run expected to water at its end
        plus their offset, one that will not water (nothing to water, held back
        by the forecast or suspended) at its planned moment plus their offset,
        as the scheduler does. Those runs start the next ones in turn. Every
        item gets a ``run_key``; a chained one names the program it follows in
        ``after`` (with ``held_back`` true when that one does not water), and
        says which run it follows in ``after_run`` when that one waters, so
        planning_sequence.py can move it behind where that run really ends.
        """
        loop = set(chain_loop([c[0] for c in contexts.values()]) or ())
        for item in planned:
            item.setdefault("run_key", _run_key(item))
        queue = list(planned)
        while queue:
            before = queue.pop(0)
            if before.get("program_id") in loop:
                continue
            held_back = bool(
                before.get("nothing_to_water") or before.get("skipped_reason")
            )
            end = dt_util.parse_datetime(
                str(before.get("target" if held_back else "end") or "")
            )
            if end is None:
                continue
            for program, item_for in contexts.values():
                for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
                    if after_program_of(schedule) != before.get("program_id"):
                        continue
                    start = chained_start(schedule, end, tz)
                    if start is None or start > until:
                        continue
                    item = await item_for(schedule, start, start)
                    item["after"] = {
                        "program_id": before.get("program_id"),
                        "program": before.get("program"),
                        "offset_minutes": max(
                            0, int(schedule.get(const.SCHEDULE_OFFSET_MINUTES) or 0)
                        ),
                        "held_back": held_back,
                    }
                    if not held_back:
                        item["after_run"] = before["run_key"]
                    item["run_key"] = _run_key(item)
                    planned.append(item)
                    queue.append(item)
                    if len(planned) > 2000:  # a guard, loops are refused at save
                        return

    @staticmethod
    def _timeline(plan: list, soak_seconds: float, names: dict) -> dict:
        """A plan's timeline, its segments rounded and its zones named."""
        timeline = plan_timeline(plan, soak_seconds)
        return {
            "total": round(timeline["total"], 1),
            "zones": [
                {"zone_id": zone_id, "zone": names.get(zone_id)}
                for zone_id in dict.fromkeys(s["zone_id"] for s in timeline["segments"])
            ],
            "segments": [
                {**s, "start": round(s["start"], 1), "end": round(s["end"], 1)}
                for s in timeline["segments"]
            ],
        }

    async def async_program_preview(self, program: dict) -> dict:
        """What a program as written would water now, for the editor to draw.

        ``program`` is the one being edited, saved or not: it goes through the
        same cleaning as a save (normalize_programs), and is planned on the
        zones as they are now. Returns the program as it would be stored, its
        timeline and what in it does not hold: zones that do not exist, and
        zones without a valve or disabled, which the run leaves out.

        A step may name its zones rather than number them (the YAML editor
        writes names, and so may an assistant): a name is matched to a zone,
        case aside, and one that matches none is listed in
        ``unknown_zone_names`` and left out.

        An "after" schedule may name the program it follows by name too. What
        a save would refuse about it is said here, against the stored
        programs with this one in its place: ``chain_loop``, the names of
        programs that would start each other in a loop (or None), and
        ``unknown_after_programs``, what names no program.
        """
        from .programs import normalize_programs

        if not isinstance(program, dict):
            program = {}

        zones = await self.zones_as_planned(await self.store.async_get_zones())
        program, unknown_names = _zones_by_name(program, zones)
        stored = [
            p
            for p in getattr(self.store.config, const.CONF_PROGRAMS, None) or []
            if isinstance(p, dict)
        ]
        program = _after_programs_by_name(program, stored)
        cleaned = normalize_programs([program])
        normalized = cleaned[0] if cleaned else {}
        others = [
            p
            for p in stored
            if p.get(const.PROGRAM_ID) != normalized.get(const.PROGRAM_ID)
        ]
        together = [*others, normalized] if normalized else others
        names = {p.get(const.PROGRAM_ID): p.get(const.PROGRAM_NAME) for p in together}
        loop = chain_loop(together)
        unknown_after = sorted(
            {
                after
                for s in normalized.get(const.PROGRAM_SCHEDULES) or []
                for after in [after_program_of(s)]
                if after and after not in names
            }
        )
        by_id = {int(z[const.ZONE_ID]): z for z in zones}
        zone_names = {zone_id: z.get(const.ZONE_NAME) for zone_id, z in by_id.items()}
        unknown, not_watered = [], []
        for step in normalized.get(const.PROGRAM_STEPS) or []:
            for zone_id in step.get(const.STEP_ZONES) or []:
                zone = by_id.get(int(zone_id))
                if zone is None:
                    unknown.append(int(zone_id))
                elif not zone.get(const.ZONE_LINKED_ENTITY) or (
                    zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED
                ):
                    not_watered.append(int(zone_id))
        plan, _total = self._program_totals(normalized, zones)
        soak = float(getattr(self.store.config, const.CONF_SOAK_MINUTES, 0) or 0) * 60.0
        return {
            "program": normalized,
            "timeline": self._timeline(plan, soak, zone_names),
            "unknown_zones": sorted(set(unknown)),
            "unknown_zone_names": unknown_names,
            "zones_not_watered": [
                {"zone_id": z, "zone": zone_names.get(z)}
                for z in dict.fromkeys(not_watered)
            ],
            "chain_loop": [names.get(i) or i for i in loop] if loop else None,
            "unknown_after_programs": unknown_after,
        }

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
        conditions = schedule_skip_conditions(schedule)
        if conditions is not None and "precipitation" not in conditions:
            # The schedule left the rain forecast out of its conditions: the
            # scheduler does not hold the run back for it, nor does this.
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


def _after_programs_by_name(program: dict, programs) -> dict:
    """``program`` with the programs its "after" schedules name turned into ids.

    An id is kept as it is; otherwise a name is matched to a program, case and
    spaces aside. What matches nothing stays, and the preview says so.
    """
    ids = {p.get(const.PROGRAM_ID) for p in programs}
    by_name: dict = {}
    for p in programs:
        key = str(p.get(const.PROGRAM_NAME) or "").strip().lower()
        by_name.setdefault(key, []).append(p.get(const.PROGRAM_ID))
    schedules = []
    for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
        if isinstance(schedule, dict) and is_after_program(schedule):
            wanted = schedule.get(const.SCHEDULE_AFTER_PROGRAM)
            found = by_name.get(str(wanted or "").strip().lower()) or []
            if wanted not in ids and len(found) == 1:
                schedule = {**schedule, const.SCHEDULE_AFTER_PROGRAM: found[0]}
        schedules.append(schedule)
    if const.PROGRAM_SCHEDULES not in program:
        return program
    return {**program, const.PROGRAM_SCHEDULES: schedules}


def _run_key(item: dict) -> str:
    """What names a planned run: its program, schedule and start."""
    return f"{item.get('program_id')}:{item.get('schedule_id')}:{item.get('start')}"


def _zones_by_name(program: dict, zones) -> tuple:
    """``program`` with the zones its steps name turned into their ids.

    Returns ``(program, unknown)``: a number (or a string of one) is kept as
    it is; a name is matched to a zone, case and spaces aside; one that matches
    no zone, or more than one, is dropped and listed in ``unknown``.
    """
    by_name: dict = {}
    for zone in zones:
        key = str(zone.get(const.ZONE_NAME) or "").strip().casefold()
        if key:
            by_name.setdefault(key, []).append(int(zone[const.ZONE_ID]))
    unknown: list = []
    steps = []
    for step in program.get(const.PROGRAM_STEPS) or []:
        if not isinstance(step, dict):
            steps.append(step)
            continue
        ids = []
        for entry in step.get(const.STEP_ZONES) or []:
            if isinstance(entry, bool):
                continue
            if isinstance(entry, int | float):
                ids.append(int(entry))
                continue
            text = str(entry).strip()
            if text.lstrip("-").isdigit():
                ids.append(int(text))
                continue
            match = by_name.get(text.casefold(), [])
            if len(match) == 1:
                ids.append(match[0])
            elif text not in unknown:
                unknown.append(text)
        steps.append({**step, const.STEP_ZONES: ids})
    if const.PROGRAM_STEPS in program:
        program = {**program, const.PROGRAM_STEPS: steps}
    return program, unknown


def _moment(value) -> float:
    """A start as a number to sort by, whatever its time zone."""
    moment = (
        value
        if isinstance(value, datetime)
        else dt_util.parse_datetime(str(value or ""))
    )
    if moment is None:
        return float("inf")
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=dt_util.get_default_time_zone())
    return moment.timestamp()


def water_percent(control, current: float) -> int:
    """The share of a zone's water delivered, ``current`` seconds into a pass."""
    plan = getattr(control, "plan", None) or []
    total = sum(plan) + getattr(control, "lead", 0.0) * len(plan)
    if total <= 0:
        return 0
    done = getattr(control, "watered", 0.0) + current
    return int(min(100.0, 100.0 * done / total))


def zone_progress(control, elapsed: float, held: float) -> dict:
    """What a zone in passes has left: its whole run, not the pass under way.

    ``elapsed`` is how long the valve has been open in this pass, ``held`` how
    long the pass holds it. A zone of 2 min in two passes said "58 s left (3 %)"
    with a soak and a pass still to come (UX walk of 13 Nov., Q7).
    """
    plan = getattr(control, "plan", None) or []
    if not plan:
        return {}
    later = plan[control.pass_index + 1 :]
    progress = {
        "remaining_seconds": int(
            max(0.0, held - elapsed)
            + sum(later)
            + (control.lead + control.soak) * len(later)
        ),
        "percent": water_percent(control, elapsed),
    }
    if len(plan) > 1:
        progress["pass"] = control.pass_index + 1
        progress["passes"] = len(plan)
    if getattr(control, "max_litres", None):
        progress["max_litres"] = control.max_litres
    return progress
