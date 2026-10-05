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
import logging
import math
from datetime import datetime, timedelta

import homeassistant.util.dt as dt_util
import voluptuous as vol
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from . import const

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
RUN_PROGRAM_SCHEMA = vol.Schema(
    {vol.Required(const.ATTR_PROGRAM_ID): cv.string}, extra=vol.ALLOW_EXTRA
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
        )
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

    # --- water a zone now ---------------------------------------------------------------

    async def async_water_zone_now(self, zone_id, seconds=None) -> bool:
        """Water one zone now, or as soon as it is its turn.

        ``seconds`` is seconds of water; without it the zone's own calculated
        duration. A zone with no linked valve, or disabled, is not watered.
        """
        zone = self.store.get_zone(zone_id)
        config = self.store.config
        if (
            zone is None
            or getattr(config, const.CONF_DIRECT_VALVE_CONTROL_ENABLED, False)
            is not True
        ):
            return False
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
