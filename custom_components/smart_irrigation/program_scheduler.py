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

The weather gate is the one the start trigger used: the readings of the moment
(frost, wind, rain sensor, postponement) judged at each start, the conditions
about the day (rain forecast, days between irrigation) decided once a day, and
the same holds on the zones the run is about to water.

A schedule of the type "after" has no timer: the runner calls
``async_start_programs_after`` when a program has really watered and finished
(ProgramRun.really_ran), and the programs whose schedules wait for it start
then, or their offset later. A scheduled run held back (the weather, a
suspension, nothing to water) starts them too, at its planned moment plus their
offset; one stopped by hand or that failed does not. A start waiting for its offset is recorded
(``CONF_PENDING_CHAINED_STARTS``) so that a restart arms it again; one that
came due while Home Assistant was down is started late within the catch-up
window (CATCH_UP_GRACE_SECONDS), and dropped beyond it.
"""

import asyncio
import datetime
import logging
from functools import partial
from typing import Any

import homeassistant.util.dt as dt_util
from homeassistant.core import callback
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.helpers.sun import get_astral_event_date

from . import const
from .helpers import find_next_solar_azimuth_time
from .master_switch import watering_off
from .programs import (
    MAIN_PROGRAM_ID,
    chain_loop,
    drop_below_deficit,
    find_program,
    needs_run_length,
    plan_program,
    plan_wall_seconds,
)
from .schedules import (
    ANCHOR_END,
    CATCH_UP_GRACE_SECONDS,
    after_program_of,
    chained_start,
    is_after_program,
    next_fire,
    schedule_skip_conditions,
)

_LOGGER = logging.getLogger(__name__)


class ProgramSchedulerMixin:
    """Arm the schedules of the programs and start them when they come due."""

    # Given by the coordinator that inherits this mixin.
    hass: Any
    store: Any

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
        """Sunrise, sunset or a bearing of the sun on a local date, or None.

        ``azimuth:<degrees>``: the moment that day the sun reaches that bearing,
        from the same place the calculation uses.
        """
        if event.startswith("azimuth:"):
            return self._azimuth_moment(float(event.partition(":")[2]), day)
        return get_astral_event_date(self.hass, event, day)

    def _azimuth_moment(self, bearing: float, day):
        tz = dt_util.get_default_time_zone()
        start = datetime.datetime.combine(day, datetime.time(0, 0), tzinfo=tz)
        latitude = getattr(self, "_effective_latitude", None)
        if latitude is None:
            latitude = self.hass.config.latitude
        longitude = getattr(self, "_effective_longitude", None)
        if longitude is None:
            longitude = self.hass.config.longitude
        found = find_next_solar_azimuth_time(
            float(latitude), float(longitude), bearing, start, max_days=1
        )
        if found is None or found.astimezone(tz).date() != day:
            return None
        return found

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
        if first:
            # The starts after another program that a restart interrupted.
            await self._restore_chained_starts()
        # The durations the runs will water, as the planning shows them (#912);
        # only a "done by" start depends on them, and the estimate is slow.
        zones = await self.store.async_get_zones()
        if needs_run_length(programs):
            zones = await self.zones_as_planned(zones)
        soak = float(getattr(config, const.CONF_SOAK_MINUTES, 0) or 0) * 60.0
        last_runs = dict(getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {})
        now = dt_util.utcnow()
        tz = dt_util.get_default_time_zone()
        timers = self._program_timers()
        for program in programs:
            program_id = program.get(const.PROGRAM_ID)
            # The same plan the planning and the sensors use, adjustment in
            # force included, so a "done by" start is placed for the run that
            # will really be made.
            adjust = getattr(self, "program_adjustment", None)
            for_programs = getattr(self, "zones_for_programs", None)
            read = for_programs(zones) if for_programs else zones
            total = plan_wall_seconds(
                drop_below_deficit(
                    plan_program(program, read, adjust(program_id) if adjust else None),
                    read,
                ),
                soak,
            )
            for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
                if schedule.get(const.SCHEDULE_ENABLED) is False:
                    continue
                if is_after_program(schedule):
                    # Started by the other program's finish, not by a timer.
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
                    moment = dt_util.as_local(upcoming["target"]).strftime("%H:%M")
                    if upcoming["target"] > dt_util.utcnow():
                        # Anchored at its end: the target is when it is to be
                        # done, not its start (which gave "its start (07:25)
                        # has gone by" at 06:54).
                        _LOGGER.warning(
                            "Program %s: its start has gone by, and it is to be "
                            "done by %s, so it starts now",
                            program_id,
                            moment,
                        )
                    else:
                        _LOGGER.warning(
                            "Program %s: its start (%s) has gone by but is still "
                            "within the catch-up window, so it starts now",
                            program_id,
                            moment,
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

    async def _prepare_program_watering(self, name, event_data, conditions):
        """``(go, sheltered)`` for a schedule that takes the weather into account.

        ``conditions`` None applies every skip condition; a list is the
        schedule's own choice of them. Either way the readings of the moment
        (frost, wind, rain sensor, postponement) are judged now, for this start,
        and the conditions about the day (rain forecast, days between
        irrigation) come from the day's decision, made at its first start
        (triggers._prepare_watering_for_today).

        One preparation at a time: the day's decision is made across awaits,
        and two schedules firing together must not both make it.
        """
        lock = getattr(self, "_prepare_watering_lock", None)
        if lock is None:
            lock = self._prepare_watering_lock = asyncio.Lock()
        async with lock:
            if conditions is None:
                return await self._prepare_watering_for_today(name, event_data)
            return await self._prepare_watering_for_today(
                name, event_data, conditions=list(conditions)
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

        if watering_off(config):
            _LOGGER.info(
                "Program %s: schedule %s reached but Smart Irrigation is switched "
                "off; not run",
                program_id,
                schedule_id,
            )
            return
        await self._start_scheduled_run(
            program_id, program, schedule, schedule_id, target, suspended
        )

    async def _start_scheduled_run(
        self, program_id, program, schedule, schedule_id, target, suspended
    ) -> None:
        """Run a program a schedule started, its weather judged first.

        The same for a schedule whose moment came and for one that starts after
        another program: suspended, already running, held back by the weather
        or not, and the day counted when a step really waters.

        A run held back here (suspended, the weather) or that finds nothing to
        water still starts the programs that come after it, at ``target`` (its
        planned moment) plus their offset, judged by their own weather setting
        (``async_start_programs_after`` with ``held_back``).
        """
        name = program.get(const.PROGRAM_NAME) or program_id
        if suspended:
            _LOGGER.info("Program %s is suspended, its schedule passes", program_id)
            await self._start_after_held_back(program_id, target)
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
                go, sheltered = await self._prepare_program_watering(
                    name,
                    {
                        "trigger_name": name,
                        "trigger_type": "program",
                        "program_id": program_id,
                        "schedule_id": schedule_id,
                    },
                    schedule_skip_conditions(schedule),
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
                await self._start_after_held_back(program_id, target)
                return
            only_zones = sheltered or None
            self._fire_legacy_start_event(program_id, name, schedule_id)
        else:
            # The weather is not judged, but the durations are still brought up
            # to date when the setting asks for it: the preparation above is what did it, and a schedule that ignores
            # the weather skipped it (#912).
            recalculate = getattr(self, "_recalculate_before_start", None)
            if recalculate is not None:
                await recalculate()
            self._fire_legacy_start_event(program_id, name, schedule_id)

        async def _count_the_day(zone_ids):
            await self._note_watering_day(name, zone_ids=zone_ids)

        extra = {}
        if (
            schedule.get(const.SCHEDULE_HARD_DEADLINE) is True
            and schedule.get(const.SCHEDULE_ANCHOR) == ANCHOR_END
        ):
            # The finish is a limit: the run is cut there.
            extra["deadline"] = target
        # The day is counted when a step really starts, for the zones it waters.
        # A run that finds nothing to water starts what comes after it at its
        # planned moment (the runner reads ``chain_moment``).
        await self.async_run_program(
            program_id,
            manual=False,
            only_zones=only_zones,
            note_day=_count_the_day,
            chain_moment=target,
            **extra,
        )

    async def _start_after_held_back(self, program_id, target) -> None:
        """A run was held back: start what comes after it all the same."""
        try:
            await self.async_start_programs_after(program_id, target, held_back=True)
        except Exception as e:  # noqa: BLE001 - the held back run is over
            _LOGGER.error(
                "Program %s: could not start what comes after it: %s", program_id, e
            )

    # --- after another program -------------------------------------------------

    def _chain_timers(self) -> dict:
        """The timers of the starts waiting for their offset, by "program:schedule".

        Apart from the schedules' timers, which every arming pass cancels: a
        program edited during the wait must not lose the start that is owed.
        """
        timers = getattr(self, "_chained_start_timers", None)
        if timers is None:
            timers = self._chained_start_timers = {}
        return timers

    def async_teardown_chained_starts(self) -> None:
        """Cancel the waiting starts, without firing any (called on unload).

        They stay recorded: the next start of the integration arms them again.
        """
        for unsub in self._chain_timers().values():
            unsub()
        self._chain_timers().clear()

    def _pending_chained(self) -> list:
        stored = getattr(self.store.config, const.CONF_PENDING_CHAINED_STARTS, None)
        return [e for e in stored or [] if isinstance(e, dict)]

    async def _write_pending_chained(self, entries: list) -> None:
        if entries == self._pending_chained():
            return
        await self.store.async_update_config(
            {const.CONF_PENDING_CHAINED_STARTS: entries or None}
        )

    async def async_start_programs_after(
        self, program_id, finished, held_back: bool = False
    ) -> None:
        """A program is done with its turn: start what comes after it.

        Every enabled "after" schedule waiting for ``program_id`` starts its own
        program at ``finished`` plus its offset, if its days hold on the day of
        that start, and its own weather setting judges it then. Called by the
        runner (program_runner.py) when a run really watered and finished, for
        a manual run as for a scheduled one: ``finished`` is its end.

        ``held_back``: a scheduled run of ``program_id`` did not water (the
        weather, a suspension, nothing to water). ``finished`` is then its
        planned moment, and what comes after it starts all the same: a drip
        line in a greenhouse, weather off, chained after a lawn program, waters
        on a frosty morning. A run stopped by hand, or that failed, starts
        nothing after it (the runner does not call this then).
        """
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return
        programs = getattr(config, const.CONF_PROGRAMS, None) or []
        loop = set(chain_loop(programs) or ())
        tz = dt_util.get_default_time_zone()
        pending = self._pending_chained()
        changed = False
        for program in programs:
            chained_id = program.get(const.PROGRAM_ID)
            for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
                if after_program_of(schedule) != program_id:
                    continue
                if schedule.get(const.SCHEDULE_ENABLED) is False:
                    continue
                schedule_id = schedule.get(const.SCHEDULE_ID)
                if chained_id in loop:
                    # Refused at save; a store from before that check could
                    # still hold one, and it would water round and round.
                    _LOGGER.warning(
                        "Program %s: schedule %s is part of a loop of programs "
                        "starting each other, not started",
                        chained_id,
                        schedule_id,
                    )
                    continue
                due = chained_start(schedule, finished, tz)
                if due is None:
                    _LOGGER.info(
                        "Program %s: schedule %s does not run on that day, not "
                        "started after %s",
                        chained_id,
                        schedule_id,
                        program_id,
                    )
                    continue
                entry = {
                    "program_id": chained_id,
                    "schedule_id": schedule_id,
                    "after_program": program_id,
                    "due": due.isoformat(),
                }
                key = f"{chained_id}:{schedule_id}"
                # A newer finish replaces a start still waiting (the first
                # program was run again by hand meanwhile).
                pending = [e for e in pending if _pending_key(e) != key]
                pending.append(entry)
                changed = True
                old = self._chain_timers().pop(key, None)
                if old is not None:
                    old()
                _LOGGER.info(
                    "Program %s starts after %s (schedule %s) at %s%s",
                    chained_id,
                    program_id,
                    schedule_id,
                    dt_util.as_local(due).strftime("%H:%M"),
                    (
                        ", from its planned moment: it did not water"
                        if held_back
                        else ""
                    ),
                )
                self._arm_chained_start(entry, due)
        if changed:
            await self._write_pending_chained(pending)

    def _arm_chained_start(self, entry: dict, due) -> None:
        if due <= dt_util.utcnow():
            # Tracked, so a reload cancels the run with the others.
            self._spawn_valve_run(self._fire_chained_start(entry))
            return
        self._chain_timers()[_pending_key(entry)] = async_track_point_in_utc_time(
            self.hass, partial(self._chained_start_due, entry), due
        )

    @callback
    def _chained_start_due(self, entry, _now) -> None:
        self._chain_timers().pop(_pending_key(entry), None)
        self._spawn_valve_run(self._fire_chained_start(entry))

    async def _restore_chained_starts(self) -> None:
        """Arm again the starts after a program that a restart interrupted.

        One whose moment came during the downtime is started now if it is at
        most CATCH_UP_GRACE_SECONDS late, as a schedule's start would be, and
        dropped beyond that.
        """
        now = dt_util.utcnow()
        keep = []
        for entry in self._pending_chained():
            due = dt_util.parse_datetime(str(entry.get("due") or ""))
            if due is None or not entry.get("program_id"):
                continue
            if due <= now - datetime.timedelta(seconds=CATCH_UP_GRACE_SECONDS):
                _LOGGER.info(
                    "Program %s: its start after %s (%s) is too far behind, " "dropped",
                    entry.get("program_id"),
                    entry.get("after_program"),
                    dt_util.as_local(due).strftime("%H:%M"),
                )
                continue
            keep.append((entry, due))
        await self._write_pending_chained([entry for entry, _ in keep])
        for entry, due in keep:
            if _pending_key(entry) not in self._chain_timers():
                self._arm_chained_start(entry, due)

    async def _fire_chained_start(self, entry: dict) -> None:
        """A start after another program is due: check it still holds, then run."""
        config = self.store.config
        program_id = entry.get("program_id")
        schedule_id = entry.get("schedule_id")
        key = _pending_key(entry)
        due = dt_util.parse_datetime(str(entry.get("due") or ""))
        # Out of the record first: whatever happens next, it has come.
        await self._write_pending_chained(
            [
                e
                for e in self._pending_chained()
                if not (_pending_key(e) == key and e.get("due") == entry.get("due"))
            ]
        )
        if due is None:
            return
        recorded = dt_util.parse_datetime(
            (getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {}).get(key) or ""
        )
        if recorded is not None and due <= recorded:
            _LOGGER.debug("Schedule %s already ran for %s", key, due.isoformat())
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
        # Edited meanwhile: switched off, or waiting for another program now.
        if (
            program is None
            or schedule is None
            or schedule.get(const.SCHEDULE_ENABLED) is False
            or after_program_of(schedule) != entry.get("after_program")
            or getattr(config, const.CONF_FULL_CONTROLLER, False) is not True
        ):
            _LOGGER.info("Schedule %s changed while it waited, not started", key)
            return
        if watering_off(config):
            _LOGGER.info(
                "Program %s: schedule %s reached but Smart Irrigation is switched "
                "off; not run",
                program_id,
                schedule_id,
            )
            return
        suspended = self.is_suspended(const.SUSPEND_PROGRAM, program_id)
        last_runs = dict(getattr(config, const.CONF_PROGRAM_LAST_RUNS, None) or {})
        last_runs[key] = due.isoformat()
        await self.store.async_update_config({const.CONF_PROGRAM_LAST_RUNS: last_runs})
        await self._start_scheduled_run(
            program_id, program, schedule, schedule_id, due, suspended
        )

    def _fire_legacy_start_event(self, program_id, name, schedule_id) -> None:
        """The start event the old main program's schedules fired, for its own.

        The main program became an ordinary program that kept its id: the
        automations that listened to its start event (``start_irrigation_all_
        zones``, an executor of your own beside the valves) still hear it when
        one of its schedules starts it, once the day is judged a watering day,
        with the payload it had. deprecated: remove in 2027.11
        """
        if program_id != MAIN_PROGRAM_ID:
            return
        self.hass.bus.async_fire(
            f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}",
            {
                "trigger_name": name,
                "trigger_type": "program",
                "program_id": program_id,
                "schedule_id": schedule_id,
            },
        )


def _pending_key(entry: dict) -> str:
    """The "program:schedule" a recorded start after a program is for."""
    return f"{entry.get('program_id')}:{entry.get('schedule_id')}"
