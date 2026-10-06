"""Arming the schedules of the programs.

Every schedule of every enabled program has one timer: the next time it must
start its program (schedules.py works that out, with the sun and the clock handed
in). When a timer fires, the occurrence it fired for is recorded before anything
else, the schedules are armed again (they now move on to the next occurrence), and
only then does the program take its turn.

What the learning from the fork this was modelled on says is done here:

* the occurrence that has just fired is remembered by its target, so re-arming
  never computes a start in the past and fires again;
* the memory lives in its own configuration key, not in the programs, which the
  panel sends back whole and would overwrite it;
* every timer is cancelled when the coordinator is torn down, so a reload cannot
  leave a second one behind (N reloads, N+1 runs);
* a schedule is read again from the configuration when its timer fires, so an
  edit made meanwhile is the one that counts;
* an occurrence whose start has gone by while its moment has not (it "catches
  up": starts now, late but in time) is only started after a startup or a
  reload, or when its timer was armed and missed. A schedule that starts at
  its moment is caught up the same way when it is at most two hours late
  (CATCH_UP_GRACE_SECONDS in schedules.py). Arming again because a
  program was edited or a calculation changed the run's length never starts one:
  an edit at 05:50 of a "done by 06:00" schedule must not water at once;
* what fires is checked against the record at the moment it fires, so two
  arming passes cannot start the same occurrence twice.

The weather gate is the one the start trigger uses: the same decision, made once
a day, and the same holds on the zones the run is about to water.
"""

import logging
from functools import partial

import homeassistant.util.dt as dt_util
from homeassistant.core import callback
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.helpers.sun import get_astral_event_date

from . import const
from .programs import find_program, plan_program, plan_wall_seconds
from .schedules import next_fire

_LOGGER = logging.getLogger(__name__)


class ProgramSchedulerMixin:
    """Arm the schedules of the programs and start them when they come due."""

    def _program_timers(self) -> dict:
        timers = getattr(self, "_program_schedule_timers", None)
        if timers is None:
            timers = self._program_schedule_timers = {}
        return timers

    def async_teardown_program_schedules(self) -> None:
        """Cancel every timer, without firing any (called on unload)."""
        for unsub in self._program_timers().values():
            unsub()
        self._program_timers().clear()

    def _sun_moment(self, event: str, day):
        """Sunrise or sunset on a local date, or None."""
        return get_astral_event_date(self.hass, event, day)

    async def register_program_schedules(self) -> None:
        """Arm the next occurrence of every schedule, cancelling what was armed."""
        self.async_teardown_program_schedules()
        self._notify_programs()
        # The first arming of this coordinator is a startup or a reload, where
        # an occurrence that came due during the downtime is still caught up.
        first = not getattr(self, "_program_schedules_armed_once", False)
        self._program_schedules_armed_once = True
        previous = getattr(self, "_armed_program_fires", None) or {}
        armed: dict = {}
        self._armed_program_fires = armed
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return
        programs = getattr(config, const.CONF_PROGRAMS, None) or []
        if not programs:
            return
        zones = await self.store.async_get_zones()
        soak = float(getattr(config, const.CONF_SOAK_MINUTES, 0) or 0) * 60.0
        last_runs = dict(getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {})
        now = dt_util.utcnow()
        tz = dt_util.get_default_time_zone()
        timers = self._program_timers()
        for program in programs:
            if program.get(const.PROGRAM_MAIN) or (
                program.get(const.PROGRAM_ENABLED) is False
            ):
                continue
            program_id = program.get(const.PROGRAM_ID)
            total = plan_wall_seconds(plan_program(program, zones), soak)
            for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
                if schedule.get(const.SCHEDULE_ENABLED) is False:
                    continue
                schedule_id = schedule.get(const.SCHEDULE_ID)
                key = f"{program_id}:{schedule_id}"
                last = dt_util.parse_datetime(last_runs.get(key) or "")
                try:
                    upcoming = next_fire(
                        schedule, now, total, last, self._sun_moment, tz
                    )
                except (
                    Exception
                ) as e:  # noqa: BLE001 - one schedule must not stop the rest
                    _LOGGER.warning("Schedule %s could not be placed: %s", key, e)
                    continue
                if upcoming is not None and upcoming["catch_up"]:
                    was = previous.get(key)
                    missed = (
                        was is not None
                        and was[0] == upcoming["target"]
                        and was[1] <= now
                    )
                    if not (first or missed):
                        # Armed again by an edit or a recalculation: the start
                        # is not owed to anyone, so the occurrence is let go.
                        _LOGGER.info(
                            "Program %s: schedule %s no longer has time to run "
                            "before %s, passed over",
                            program_id,
                            schedule_id,
                            dt_util.as_local(upcoming["target"]).strftime("%H:%M"),
                        )
                        try:
                            upcoming = next_fire(
                                schedule,
                                now,
                                total,
                                upcoming["target"],
                                self._sun_moment,
                                tz,
                            )
                        except Exception as e:  # noqa: BLE001
                            _LOGGER.warning(
                                "Schedule %s could not be placed: %s", key, e
                            )
                            continue
                        if upcoming is not None and upcoming["catch_up"]:
                            continue
                if upcoming is None:
                    continue
                armed[key] = (upcoming["target"], upcoming["fire"])
                if upcoming["catch_up"]:
                    _LOGGER.warning(
                        "Program %s: its start (%s) has gone by but is still "
                        "within the catch-up window, so it starts now",
                        program_id,
                        dt_util.as_local(upcoming["target"]).strftime("%H:%M"),
                    )
                    # Tracked, so a reload cancels the run with the others.
                    self._spawn_valve_run(
                        self._fire_program_schedule(
                            program_id, schedule_id, upcoming["target"]
                        )
                    )
                    continue
                timers[key] = async_track_point_in_utc_time(
                    self.hass,
                    partial(
                        self._program_timer_due,
                        program_id,
                        schedule_id,
                        upcoming["target"],
                    ),
                    upcoming["fire"],
                )

    @callback
    def _program_timer_due(self, program_id, schedule_id, target, _now) -> None:
        self._program_timers().pop(f"{program_id}:{schedule_id}", None)
        # Tracked, so a reload cancels the run with the others.
        self._spawn_valve_run(
            self._fire_program_schedule(program_id, schedule_id, target)
        )

    async def _fire_program_schedule(self, program_id, schedule_id, target) -> None:
        """A schedule is due: remember it, arm the next one, then run the program."""
        config = self.store.config
        key = f"{program_id}:{schedule_id}"
        # An occurrence fires once: not if it was recorded already (a catch-up
        # task queued by an arming pass that another has since repeated), nor if
        # it is on its way now.
        recorded = dt_util.parse_datetime(
            (getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {}).get(key) or ""
        )
        fired = getattr(self, "_program_fires_in_flight", None)
        if fired is None:
            fired = self._program_fires_in_flight = {}
        if (recorded is not None and target <= recorded) or (
            key in fired and target <= fired[key]
        ):
            _LOGGER.debug("Schedule %s already ran for %s", key, target.isoformat())
            return
        program = find_program(getattr(config, const.CONF_PROGRAMS, None), program_id)
        schedule = next(
            (
                s
                for s in (program or {}).get(const.PROGRAM_SCHEDULES) or []
                if s.get(const.SCHEDULE_ID) == schedule_id
            ),
            None,
        )
        if (
            program is None
            or schedule is None
            or program.get(const.PROGRAM_ENABLED) is False
            or schedule.get(const.SCHEDULE_ENABLED) is False
            or getattr(config, const.CONF_FULL_CONTROLLER, False) is not True
        ):
            await self.register_program_schedules()
            return
        suspended = self.is_suspended(const.SUSPEND_PROGRAM, program_id)
        # Before anything else: whatever happens next, this occurrence has run.
        fired[key] = target
        last_runs = dict(getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {})
        last_runs[key] = target.isoformat()
        await self.store.async_update_config({const.CONF_PROGRAM_LAST_RUNS: last_runs})
        await self.register_program_schedules()

        name = program.get(const.PROGRAM_NAME) or program_id
        if suspended:
            _LOGGER.info("Program %s is suspended, its schedule passes", program_id)
            return
        registry = (
            self._program_registry() if hasattr(self, "_program_registry") else {}
        )
        if program_id in registry:
            # Nothing starts, so nothing is counted and no weather is judged.
            _LOGGER.info("Program %s is already running or waiting", program_id)
            return
        only_zones = None
        # The weather is judged now, on the day the run starts, and not on the
        # day of the schedule's moment: a "done by Monday 01:00" run that starts
        # on Sunday evening is held back or not by Sunday's skip decision.
        if schedule.get(const.SCHEDULE_WEATHER) is not False:
            try:
                go, sheltered = await self._prepare_watering_for_today(
                    name,
                    {
                        "trigger_name": name,
                        "trigger_type": "program",
                        "program_id": program_id,
                        "schedule_id": schedule_id,
                    },
                )
            except (
                Exception
            ) as e:  # noqa: BLE001 - fail safe, as the start trigger does
                _LOGGER.error(
                    "Program %s: could not evaluate the watering conditions, not run "
                    "(fail-safe): %s",
                    program_id,
                    e,
                )
                return
            if not go:
                return
            only_zones = sheltered or None

        async def _count_the_day(zone_ids):
            await self._note_watering_day(name, zone_ids=zone_ids)

        # The day is counted when a step really starts, for the zones it waters.
        await self.async_run_program(
            program_id,
            manual=False,
            only_zones=only_zones,
            note_day=_count_the_day,
        )
