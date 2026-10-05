"""When a program waters: its schedules.

A schedule says on which days a program runs and at what moment. Everything
that can be asked of it is here as plain functions, with the sun and the clock
handed in, so that it is tested without Home Assistant and day by day in local
time (a day is a local date, not 24 hours: the clock changes twice a year).

* **The moment** is a clock time, or sunrise or sunset with an offset in
  minutes (negative: before). The **anchor** says whether that moment is when
  the program starts or when it must have finished, which is the one thing a
  schedule fed with calculated durations needs: the run is as long as the
  water balance says, and "done by sunrise" is placed from the end.
* **The days** are filters, all of which have to hold: days of the week, every
  N days (with an offset, to turn groups A, B and C), even or odd days of the
  month, months, and a period of the year that may wrap over New Year.
* **Weather**: whether the skip conditions (rain, frost, wind, a moist soil)
  apply to the run. They do by default, since that is what Smart Irrigation is
  for; a greenhouse drip line can turn them off.

What fired last is not kept here: ``next_fire`` is handed the target of the
last occurrence that ran and moves on to the next one. A schedule that is
re-armed with the target it has just fired used to compute a start in the past
and fire again every few seconds for the whole window, in the fork this was
learnt from.
"""

from __future__ import annotations

import math
import re
from datetime import date, datetime, time, timedelta, timezone

from . import const

SCHEDULE_TYPE_TIME = "time"
SCHEDULE_TYPE_SUN = "sun"
SCHEDULE_TYPES = (SCHEDULE_TYPE_TIME, SCHEDULE_TYPE_SUN)
ANCHOR_START = "start"
ANCHOR_END = "end"
ANCHORS = (ANCHOR_START, ANCHOR_END)
PARITY_ANY = "any"
PARITY_EVEN = "even"
PARITY_ODD = "odd"
PARITIES = (PARITY_ANY, PARITY_EVEN, PARITY_ODD)
SUN_EVENTS = ("sunrise", "sunset")

MAX_OFFSET_MINUTES = 12 * 60
MAX_EVERY_N_DAYS = 60
DEFAULT_TIME = "06:00"

_TIME = re.compile(r"^([01]?\d|2[0-3]):([0-5]\d)$")
_MONTH_DAY = re.compile(r"^(\d{1,2})-(\d{1,2})$")
_ID_UNSAFE = re.compile(r"[^a-z0-9_]+")


# --- what is stored ----------------------------------------------------------


def _int(value, default: int, low: int, high: int) -> int:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    if math.isnan(number):
        return default
    return max(low, min(high, int(number)))


def _int_list(value, low: int, high: int) -> list:
    if not isinstance(value, (list, tuple)):
        return []
    found = set()
    for item in value:
        try:
            number = int(item)
        except (TypeError, ValueError):
            continue
        if low <= number <= high:
            found.add(number)
    return sorted(found)


def _month_day(value) -> str | None:
    """``"MM-DD"`` if it is a real day of the year (29 February included)."""
    match = _MONTH_DAY.match(str(value or "").strip())
    if not match:
        return None
    month, day = int(match.group(1)), int(match.group(2))
    try:
        date(2024, month, day)
    except ValueError:
        return None
    return f"{month:02d}-{day:02d}"


def normalize_schedule(schedule, used: set, position: int = 0) -> dict | None:
    """One schedule as it is stored, or None if it is not one."""
    if not isinstance(schedule, dict):
        return None
    schedule_type = schedule.get(const.SCHEDULE_TYPE)
    if schedule_type not in SCHEDULE_TYPES:
        schedule_type = SCHEDULE_TYPE_TIME
    wanted = _ID_UNSAFE.sub(
        "_", str(schedule.get(const.SCHEDULE_ID) or f"schedule_{position + 1}").lower()
    ).strip("_")
    base = wanted or f"schedule_{position + 1}"
    schedule_id, n = base, 2
    while schedule_id in used:
        schedule_id, n = f"{base}_{n}", n + 1
    used.add(schedule_id)
    at = str(schedule.get(const.SCHEDULE_TIME) or "").strip()
    match = _TIME.match(at)
    at = f"{int(match.group(1)):02d}:{match.group(2)}" if match else DEFAULT_TIME
    event = schedule.get(const.SCHEDULE_EVENT)
    every = _int(schedule.get(const.SCHEDULE_EVERY_N_DAYS), 1, 1, MAX_EVERY_N_DAYS)
    parity = schedule.get(const.SCHEDULE_PARITY)
    anchor = schedule.get(const.SCHEDULE_ANCHOR)
    return {
        const.SCHEDULE_ID: schedule_id,
        const.SCHEDULE_ENABLED: schedule.get(const.SCHEDULE_ENABLED) is not False,
        const.SCHEDULE_TYPE: schedule_type,
        const.SCHEDULE_TIME: at,
        const.SCHEDULE_EVENT: event if event in SUN_EVENTS else "sunrise",
        const.SCHEDULE_OFFSET_MINUTES: _int(
            schedule.get(const.SCHEDULE_OFFSET_MINUTES),
            0,
            -MAX_OFFSET_MINUTES,
            MAX_OFFSET_MINUTES,
        ),
        const.SCHEDULE_ANCHOR: anchor if anchor in ANCHORS else ANCHOR_START,
        const.SCHEDULE_WEEKDAYS: _int_list(schedule.get(const.SCHEDULE_WEEKDAYS), 0, 6),
        const.SCHEDULE_EVERY_N_DAYS: every,
        const.SCHEDULE_EVERY_OFFSET: _int(
            schedule.get(const.SCHEDULE_EVERY_OFFSET), 0, 0, every - 1
        ),
        const.SCHEDULE_PARITY: parity if parity in PARITIES else PARITY_ANY,
        const.SCHEDULE_MONTHS: _int_list(schedule.get(const.SCHEDULE_MONTHS), 1, 12),
        const.SCHEDULE_FROM: _month_day(schedule.get(const.SCHEDULE_FROM)),
        const.SCHEDULE_UNTIL: _month_day(schedule.get(const.SCHEDULE_UNTIL)),
        const.SCHEDULE_WEATHER: schedule.get(const.SCHEDULE_WEATHER) is not False,
    }


def normalize_schedules(schedules) -> list:
    """The schedules of a program as they are stored."""
    used: set = set()
    cleaned = []
    for position, raw in enumerate(schedules or []):
        schedule = normalize_schedule(raw, used, position)
        if schedule is not None:
            cleaned.append(schedule)
    return cleaned


# --- which days ---------------------------------------------------------------


def _in_period(day: date, start: str | None, end: str | None) -> bool:
    """Whether ``day`` is in the period, which may wrap over New Year."""
    if not start and not end:
        return True
    here = (day.month, day.day)
    first = tuple(int(p) for p in start.split("-")) if start else (1, 1)
    last = tuple(int(p) for p in end.split("-")) if end else (12, 31)
    if first <= last:
        return first <= here <= last
    return here >= first or here <= last


def occurs_on(schedule: dict, day: date) -> bool:
    """Whether the schedule runs on this local date. Every filter has to hold."""
    if schedule.get(const.SCHEDULE_ENABLED) is False:
        return False
    months = schedule.get(const.SCHEDULE_MONTHS) or []
    if months and day.month not in months:
        return False
    if not _in_period(
        day, schedule.get(const.SCHEDULE_FROM), schedule.get(const.SCHEDULE_UNTIL)
    ):
        return False
    weekdays = schedule.get(const.SCHEDULE_WEEKDAYS) or []
    if weekdays and day.weekday() not in weekdays:
        return False
    parity = schedule.get(const.SCHEDULE_PARITY)
    if parity == PARITY_EVEN and day.day % 2:
        return False
    if parity == PARITY_ODD and not day.day % 2:
        return False
    every = int(schedule.get(const.SCHEDULE_EVERY_N_DAYS) or 1)
    if every > 1:
        offset = int(schedule.get(const.SCHEDULE_EVERY_OFFSET) or 0) % every
        if (day.toordinal() - offset) % every:
            return False
    return True


# --- which moment --------------------------------------------------------------


def target_on(schedule: dict, day: date, sun, tz) -> datetime | None:
    """The schedule's moment on a local date, in UTC, or None if it has none.

    ``sun(event, day)`` gives the aware time of sunrise or sunset that day, or
    None (polar day and night); ``tz`` is the local time zone.
    """
    if schedule.get(const.SCHEDULE_TYPE) == SCHEDULE_TYPE_SUN:
        moment = sun(schedule.get(const.SCHEDULE_EVENT) or "sunrise", day)
        if moment is None:
            return None
        offset = timedelta(
            minutes=int(schedule.get(const.SCHEDULE_OFFSET_MINUTES) or 0)
        )
        return (moment + offset).astimezone(timezone.utc)
    match = _TIME.match(str(schedule.get(const.SCHEDULE_TIME) or DEFAULT_TIME))
    at = time(int(match.group(1)), int(match.group(2))) if match else time(6, 0)
    return datetime.combine(day, at, tzinfo=tz).astimezone(timezone.utc)


def next_fire(
    schedule: dict,
    now: datetime,
    total_seconds: float,
    last_target: datetime | None,
    sun,
    tz,
    horizon_days: int = 400,
) -> dict | None:
    """The next time the schedule must start its program, or None.

    Returns ``{"fire", "target", "catch_up"}``, all in UTC. ``target`` is the
    schedule's moment, ``fire`` is when to start: the same for a program that
    starts at its moment, ``total_seconds`` before it for one that must be done
    by then. ``last_target`` is the target of the occurrence that ran last, and
    an occurrence at or before it is never returned again.

    An occurrence whose start has passed while its moment has not (the run
    became longer than the time left, or Home Assistant was restarting) is
    ``catch_up``: it starts now, late but in time, rather than losing the day.
    An occurrence missed altogether is passed over.
    """
    now = now.astimezone(timezone.utc)
    if schedule.get(const.SCHEDULE_ENABLED) is False:
        return None
    end_anchored = schedule.get(const.SCHEDULE_ANCHOR) == ANCHOR_END
    if end_anchored and total_seconds <= 0:
        # Nothing to water means nothing to place from the end.
        return None
    first = (now.astimezone(tz)).date() - timedelta(days=1)
    for step in range(horizon_days):
        day = first + timedelta(days=step)
        if not occurs_on(schedule, day):
            continue
        target = target_on(schedule, day, sun, tz)
        if target is None:
            continue
        if last_target is not None and target <= last_target.astimezone(timezone.utc):
            continue
        fire = target - timedelta(seconds=total_seconds) if end_anchored else target
        if fire > now:
            return {"fire": fire, "target": target, "catch_up": False}
        if end_anchored and fire <= now < target:
            return {"fire": now, "target": target, "catch_up": True}
    return None
