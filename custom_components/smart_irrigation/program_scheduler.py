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
  edit made meanwhile is the one that counts.

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
                if upcoming is None:
                    continue
                if upcoming["catch_up"]:
                    _LOGGER.warning(
                        "Program %s: its start has gone by and the run can still "
                        "finish by %s, so it starts now",
                        program_id,
                        dt_util.as_local(upcoming["target"]).strftime("%H:%M"),
                    )
                    self.hass.async_create_task(
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
        self.hass.async_create_task(
            self._fire_program_schedule(program_id, schedule_id, target)
        )

    async def _fire_program_schedule(self, program_id, schedule_id, target) -> None:
        """A schedule is due: remember it, arm the next one, then run the program."""
        config = self.store.config
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
        # Before anything else: whatever happens next, this occurrence has run.
        last_runs = dict(getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {})
        last_runs[f"{program_id}:{schedule_id}"] = target.isoformat()
        await self.store.async_update_config({const.CONF_PROGRAM_LAST_RUNS: last_runs})
        await self.register_program_schedules()

        name = program.get(const.PROGRAM_NAME) or program_id
        only_zones = None
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
        # Counted now, while the durations are still the ones the run will use.
        await self._note_watering_day(name)
        await self.async_run_program(program_id, manual=False, only_zones=only_zones)
