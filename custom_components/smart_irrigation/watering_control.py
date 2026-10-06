"""Driving the watering while it runs: pause, next step, suspend, water now.

What a person standing at the garden tap does and the controller did not let
them: stop the water for a moment (a neighbour at the door, a hose to move),
skip the zone it is on, put a zone or a program aside for a few days, or water
one zone for ten minutes whatever the plan says.

* **Pause** closes the open valves and holds everything, the zones waiting
  included. The clock stops: what was delivered is credited, and after the
  resume the part of the pass still owed is watered, so no water is lost and
  none is counted twice. A pause that is never lifted would keep every program
  from running, so it lifts itself after a while.
* **Next step** ends the zones of the step a program is on and lets it go on.
* **Suspend** keeps a zone or a program from watering until a date. It is kept
  in its own configuration key, not in the zone or the program, which the panel
  sends back whole.
* **Water a zone now** takes its turn like everything else: a manual run asked
  for during a program is added behind it, not run on top.
"""

import asyncio
import copy
import logging
import math
from datetime import datetime, timedelta

import homeassistant.util.dt as dt_util
import voluptuous as vol
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from . import const
from .programs import find_program

_LOGGER = logging.getLogger(__name__)

# A pause lifts itself after this long, unless asked for another length.
DEFAULT_PAUSE_MINUTES = 60
MAX_PAUSE_MINUTES = 24 * 60

SUSPEND_ZONE = "zone"
SUSPEND_PROGRAM = "program"

MAX_SUSPEND_HOURS = 8760
MAX_WATER_ZONE_SECONDS = 86400


def finite_number(value, low: float, high: float, what: str = "value") -> float:
    """A finite number within bounds, or ``ValueError`` saying what is wrong.

    Strings are accepted when they read as a number; NaN, infinity, booleans and
    anything out of range are not (``float("1e999")`` is infinity, and an
    infinite number of hours cannot become a date).
    """
    if isinstance(value, bool):
        raise ValueError(f"{what} must be a number")
    try:
        number = float(value)
    except (TypeError, ValueError, OverflowError):
        raise ValueError(f"{what} must be a number, not {value!r}") from None
    if not math.isfinite(number) or not low <= number <= high:
        raise ValueError(f"{what} must be between {low:g} and {high:g}")
    return number


def _number_validator(low: float, high: float, what: str):
    def _validate(value):
        try:
            return finite_number(value, low, high, what)
        except ValueError as e:
            raise vol.Invalid(str(e)) from None

    return _validate


def parse_suspend_until(value) -> datetime:
    """A moment, from a datetime or an ISO string; ``ValueError`` if it is none."""
    if isinstance(value, datetime):
        moment = value
    else:
        moment = dt_util.parse_datetime(str(value).strip()) if value else None
    if moment is None:
        raise ValueError(f"until must be a date and time, not {value!r}")
    return moment


def _until_validator(value):
    try:
        parse_suspend_until(value)
    except ValueError as e:
        raise vol.Invalid(str(e)) from None
    return value


# The shapes of the services below. Extra keys pass: the target selector adds
# device and area ids next to the entity ids.
_RUN_MODE = vol.In((const.RUN_MODE_QUEUE, const.RUN_MODE_REPLACE))
RUN_PROGRAM_SCHEMA = vol.Schema(
    {
        vol.Required(const.ATTR_PROGRAM_ID): cv.string,
        vol.Optional(const.ATTR_SECONDS): vol.Any(
            None, _number_validator(1, MAX_WATER_ZONE_SECONDS, "seconds")
        ),
        vol.Optional(const.ATTR_MODE): vol.Any(None, _RUN_MODE),
    },
    extra=vol.ALLOW_EXTRA,
)
STOP_PROGRAM_SCHEMA = vol.Schema(
    {vol.Required(const.ATTR_PROGRAM_ID): cv.string}, extra=vol.ALLOW_EXTRA
)
SET_PROGRAM_ENABLED_SCHEMA = vol.Schema(
    {
        vol.Required(const.ATTR_PROGRAM_ID): cv.string,
        vol.Required(const.ATTR_ENABLED): cv.boolean,
    },
    extra=vol.ALLOW_EXTRA,
)
SET_STEP_ENABLED_SCHEMA = vol.Schema(
    {
        vol.Required(const.ATTR_PROGRAM_ID): cv.string,
        vol.Required(const.ATTR_STEP_ID): cv.string,
        vol.Required(const.ATTR_ENABLED): cv.boolean,
    },
    extra=vol.ALLOW_EXTRA,
)
SET_SCHEDULE_ENABLED_SCHEMA = vol.Schema(
    {
        vol.Required(const.ATTR_PROGRAM_ID): cv.string,
        vol.Required(const.ATTR_SCHEDULE_ID): cv.string,
        vol.Required(const.ATTR_ENABLED): cv.boolean,
    },
    extra=vol.ALLOW_EXTRA,
)
PAUSE_WATERING_SCHEMA = vol.Schema(
    {
        vol.Optional("minutes"): vol.Any(
            None, _number_validator(1, MAX_PAUSE_MINUTES, "minutes")
        )
    },
    extra=vol.ALLOW_EXTRA,
)
SUSPEND_SCHEMA = vol.Schema(
    {
        vol.Optional(const.ATTR_PROGRAM_ID): vol.Any(None, cv.string),
        vol.Optional("hours"): vol.Any(
            None, _number_validator(0, MAX_SUSPEND_HOURS, "hours")
        ),
        vol.Optional("until"): vol.Any(None, _until_validator),
    },
    extra=vol.ALLOW_EXTRA,
)
WATER_ZONE_SCHEMA = vol.Schema(
    {
        vol.Optional(const.ATTR_SECONDS): vol.Any(
            None, _number_validator(1, MAX_WATER_ZONE_SECONDS, "seconds")
        ),
        vol.Optional(const.ATTR_MODE): vol.Any(None, _RUN_MODE),
    },
    extra=vol.ALLOW_EXTRA,
)


class WateringControlMixin:
    """Pause, resume, next step, suspension and manual runs."""

    # --- pause -----------------------------------------------------------------

    def _pause_events(self):
        """The two events every run shares: one set while paused, one while not."""
        events = getattr(self, "_pause_state", None)
        if events is None:
            pause, resume = asyncio.Event(), asyncio.Event()
            resume.set()
            events = self._pause_state = (pause, resume)
        return events

    def watering_paused(self) -> bool:
        return self._pause_events()[0].is_set()

    def paused_seconds_total(self) -> float:
        """Every second spent paused since startup, on the loop clock.

        A run's progress is its time less the pauses that fell inside it.
        """
        total = getattr(self, "_paused_total", 0.0)
        since = getattr(self, "_paused_since", None)
        if since is not None:
            total += max(0.0, self.hass.loop.time() - since)
        return total

    async def async_pause_watering(self, minutes: float | None = None) -> None:
        """Close the open valves and hold everything until resumed."""
        pause, resume = self._pause_events()
        if minutes is None:
            minutes = float(DEFAULT_PAUSE_MINUTES)
        else:
            try:
                minutes = finite_number(minutes, 1, MAX_PAUSE_MINUTES, "minutes")
            except ValueError as e:
                raise ServiceValidationError(str(e)) from None
        if not pause.is_set():
            self._paused_since = self.hass.loop.time()
        resume.clear()
        pause.set()
        timer = getattr(self, "_pause_timer", None)
        if timer is not None and not timer.done():
            timer.cancel()
        self._pause_timer = self._spawn_valve_run(self._lift_pause_later(minutes * 60))
        _LOGGER.info("Watering paused for at most %.0f minutes", minutes)
        self._notify_programs()
        await self._persist_pause(
            (dt_util.utcnow() + timedelta(minutes=minutes)).isoformat()
        )

    async def _persist_pause(self, until) -> None:
        """Keep the end of the pause (or None) for a restart; full controller only."""
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return
        if getattr(config, const.CONF_PAUSE_UNTIL, None) == until:
            return
        try:
            await self.store.async_update_config({const.CONF_PAUSE_UNTIL: until})
        except asyncio.CancelledError:
            raise
        except Exception as e:  # noqa: BLE001 - the record must not undo the pause
            _LOGGER.warning("Could not record the pause: %s", e)

    async def _restore_pause(self, until: datetime) -> None:
        """Hold the watering again after a restart, until ``until``.

        The valves that were open stay closed; programs and zones waiting go on
        from the resume as they do after any pause.
        """
        pause, resume = self._pause_events()
        if not pause.is_set():
            self._paused_since = self.hass.loop.time()
        resume.clear()
        pause.set()
        timer = getattr(self, "_pause_timer", None)
        if timer is not None and not timer.done():
            timer.cancel()
        seconds = max(1.0, (until - dt_util.utcnow()).total_seconds())
        self._pause_timer = self._spawn_valve_run(self._lift_pause_later(seconds))
        _LOGGER.info("The pause goes on after the restart, for %.0f seconds", seconds)
        self._notify_programs()

    async def _lift_pause_later(self, seconds: float) -> None:
        await asyncio.sleep(seconds)
        _LOGGER.warning("The pause was not lifted in time, watering resumes")
        await self.async_resume_watering()

    async def async_resume_watering(self) -> None:
        """Go on from where the pause stopped."""
        pause, resume = self._pause_events()
        timer = getattr(self, "_pause_timer", None)
        current = asyncio.current_task()
        if timer is not None and not timer.done() and timer is not current:
            timer.cancel()
        self._pause_timer = None
        await self._persist_pause(None)
        if not pause.is_set():
            return
        since = getattr(self, "_paused_since", None)
        if since is not None:
            self._paused_total = getattr(self, "_paused_total", 0.0) + max(
                0.0, self.hass.loop.time() - since
            )
            self._paused_since = None
        pause.clear()
        resume.set()
        _LOGGER.info("Watering resumed")
        self._notify_programs()

    async def _wait_resume(self, control) -> bool:
        """Wait for the resume. False if the run was stopped while it waited."""
        pause, resume = self._pause_events()
        if not pause.is_set():
            return not control.stop.is_set()
        waiter = asyncio.ensure_future(resume.wait())
        stopper = asyncio.ensure_future(control.stop.wait())
        try:
            await asyncio.wait({waiter, stopper}, return_when=asyncio.FIRST_COMPLETED)
        finally:
            for task in (waiter, stopper):
                if not task.done():
                    task.cancel()
        return not control.stop.is_set()

    async def _wait_run_resume(self, run) -> bool:
        """The same for a program run between its steps. False if it was stopped."""
        pause, resume = self._pause_events()
        if not pause.is_set():
            return not run.stop.is_set()
        waiter = asyncio.ensure_future(resume.wait())
        stopper = asyncio.ensure_future(run.stop.wait())
        try:
            await asyncio.wait({waiter, stopper}, return_when=asyncio.FIRST_COMPLETED)
        finally:
            for task in (waiter, stopper):
                if not task.done():
                    task.cancel()
        return not run.stop.is_set()

    # --- next step -----------------------------------------------------------------

    async def async_skip_step(self) -> list:
        """End the zones of the step a program is on, and let it go on.

        Returns the ids of the zones that were ended.
        """
        skipped = []
        for run in self._program_registry().values():
            for zone_id in list(getattr(run, "current_zones", ()) or ()):
                control = self._run_controls().get(int(zone_id))
                if control is not None:
                    control.stop.set()
                    skipped.append(int(zone_id))
        if skipped:
            _LOGGER.info(
                "Next step: zone(s) %s ended", ", ".join(str(z) for z in skipped)
            )
        return skipped

    # --- suspension --------------------------------------------------------------------

    def _suspensions(self) -> dict:
        return dict(getattr(self.store.config, const.CONF_SUSPENSIONS, None) or {})

    def suspended_until(self, kind: str, ident) -> object:
        """When the zone or program is suspended until, if it still is."""
        stamp = self._suspensions().get(f"{kind}:{ident}")
        until = dt_util.parse_datetime(stamp or "")
        if until is None or until <= dt_util.utcnow():
            return None
        return until

    def is_suspended(self, kind: str, ident) -> bool:
        return self.suspended_until(kind, ident) is not None

    async def async_suspend(self, kind: str, ident, hours=None, until=None) -> object:
        """Keep a zone or a program from watering. Returns the end, or None if lifted.

        ``hours`` of 0, or neither ``hours`` nor ``until``, lifts it. Input that
        cannot be understood (hours that are not a number or are too many, an
        ``until`` that is no date) is refused with ``ServiceValidationError`` and
        changes nothing: a typo must never lift a suspension.
        """
        suspensions = self._suspensions()
        key = f"{kind}:{ident}"
        end = None
        try:
            if until is not None:
                end = parse_suspend_until(until)
            elif hours is not None and hours != "":
                number = finite_number(hours, 0, MAX_SUSPEND_HOURS, "hours")
                if number:
                    end = dt_util.utcnow() + timedelta(hours=number)
            if end is not None and end.tzinfo is None:
                end = end.replace(tzinfo=dt_util.get_default_time_zone())
            if end is not None and end > dt_util.utcnow() + timedelta(
                hours=MAX_SUSPEND_HOURS
            ):
                raise ValueError(
                    f"until must be within {MAX_SUSPEND_HOURS} hours from now"
                )
        except (ValueError, OverflowError) as e:
            raise ServiceValidationError(str(e)) from None
        if end is None or end <= dt_util.utcnow():
            suspensions.pop(key, None)
            end = None
        else:
            suspensions[key] = end.astimezone(dt_util.UTC).isoformat()
        # Dropped when over, so the record does not grow.
        now = dt_util.utcnow()
        suspensions = {
            k: v
            for k, v in suspensions.items()
            if (dt_util.parse_datetime(v or "") or now) > now
        }
        await self.store.async_update_config({const.CONF_SUSPENSIONS: suspensions})
        self._notify_programs()
        _LOGGER.info(
            "%s %s %s",
            kind.capitalize(),
            ident,
            f"suspended until {end.isoformat()}" if end else "no longer suspended",
        )
        return end

    # --- switching a program, a step or a schedule on or off ------------------------------

    async def async_set_enabled(
        self, program_id, enabled: bool, step_id=None, schedule_id=None
    ) -> bool:
        """Change the ``enabled`` flag of a program, one of its steps or schedules.

        The change goes through the coordinator's configuration update, as a save
        from the panel does: the programs are normalized, stored, the schedules
        armed again and the panel told. Returns True when a flag was changed;
        False when the full controller is off or the id is unknown (nothing is
        written then).
        """
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            _LOGGER.warning("Nothing changed: the full controller is off")
            return False
        programs = copy.deepcopy(getattr(config, const.CONF_PROGRAMS, None) or [])
        program = find_program(programs, program_id)
        if program is None:
            _LOGGER.warning("Program %s does not exist", program_id)
            return False
        target, key, kind, ident = program, const.PROGRAM_ENABLED, "Program", program_id
        if step_id is not None:
            kind, key, ident = "Step", const.STEP_ENABLED, step_id
            items, id_key = program.get(const.PROGRAM_STEPS), const.STEP_ID
        elif schedule_id is not None:
            kind, key, ident = "Schedule", const.SCHEDULE_ENABLED, schedule_id
            items, id_key = program.get(const.PROGRAM_SCHEDULES), const.SCHEDULE_ID
        if kind != "Program":
            target = next(
                (
                    i
                    for i in items or []
                    if isinstance(i, dict) and i.get(id_key) == ident
                ),
                None,
            )
            if target is None:
                _LOGGER.warning(
                    "%s %s does not exist in program %s", kind, ident, program_id
                )
                return False
        enabled = bool(enabled)
        if (target.get(key) is not False) == enabled:
            return False
        target[key] = enabled
        await self.async_update_config({const.CONF_PROGRAMS: programs})
        _LOGGER.info(
            "%s %s %s",
            kind,
            program_id if kind == "Program" else f"{program_id}/{ident}",
            "enabled" if enabled else "disabled",
        )
        return True

    # --- water a zone now ---------------------------------------------------------------

    async def async_water_zone_now(
        self, zone_id, seconds=None, mode=const.RUN_MODE_QUEUE
    ) -> bool:
        """Water one zone now, or as soon as it is its turn.

        ``seconds`` is seconds of water; without it the zone's own calculated
        duration. A zone with no linked valve, or disabled, is not watered.

        ``mode`` is what to do when something is already watering: ``queue``
        (the default) takes the turn behind it, ``replace`` stops what is
        running and waiting first (cleanly: the valves close and what was
        delivered is credited), then waters this zone.
        """
        zone = self.store.get_zone(zone_id)
        config = self.store.config
        if (
            zone is None
            or getattr(config, const.CONF_DIRECT_VALVE_CONTROL_ENABLED, False)
            is not True
        ):
            return False
        if mode == const.RUN_MODE_REPLACE:
            await self.async_stop_watering()
        generation = getattr(self, "_stop_generation", 0)
        # A cycle of the plain mode does not take the turn: wait for it to end,
        # so the manual run is not watered on top of it.
        cycle = self._sequential_cycle
        while cycle is not None:
            await cycle["done"].wait()
            cycle = self._sequential_cycle
        async with self._executor_lock():
            if getattr(self, "_stop_generation", 0) != generation:
                return False
            zone = self.store.get_zone(zone_id)
            if (
                zone is None
                or not zone.get(const.ZONE_LINKED_ENTITY)
                or zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED
                or self._busy(zone_id)
            ):
                return False
            zone = dict(zone)
            lead = self._lead_seconds(zone)
            if seconds is None:
                duration = float(zone.get(const.ZONE_DURATION) or 0.0)
            else:
                try:
                    seconds = finite_number(
                        seconds, 0, MAX_WATER_ZONE_SECONDS, "seconds"
                    )
                except ValueError as e:
                    _LOGGER.warning("Zone %s not watered: %s", zone_id, e)
                    return False
                duration = seconds + lead
            if duration <= 0:
                return False
            zone[const.ZONE_DURATION] = duration
            self._announce_start("manual", [zone])
            result = await self._run_one_valve(zone)
            self._report_finished([result])
        return True
