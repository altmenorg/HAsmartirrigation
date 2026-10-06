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
  month, named days of the month (1, 15, the last one), months, and a period of the year that may wrap over New Year. They
  apply to the day of the schedule's **moment**: for a run that must be done by
  Monday 01:00, "Monday" is the day that counts, although the valves open on
  Sunday evening. The weather is another matter: it is judged when the run
  starts (program_scheduler.py), on the day the water actually flows first.
* **Polar day and night**: a sun schedule has no moment on a day without a
  sunrise or sunset. With a ``fallback_time`` (``"HH:MM"``, or ``"previous"``
  for the time of the last sunrise or sunset that was seen) it falls back to
  that instead of skipping the day. Without one the day is skipped.
* **Late starts**: a start-anchored schedule whose start was missed (Home
  Assistant was down) is caught up when it is at most ``CATCH_UP_GRACE_SECONDS``
  late, and passed over beyond that.
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
# How late a start-anchored occurrence may still be caught up (2 hours).
CATCH_UP_GRACE_SECONDS = 2 * 3600
DAY_LAST = "last"
FALLBACK_PREVIOUS = "previous"
# How far back "previous" looks for a sunrise or sunset that was seen.
MAX_PREVIOUS_LOOKBACK_DAYS = 60
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
    if not math.isfinite(number):
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


def _days_of_month(value) -> list:
    """Days 1 to 31 (sorted) then ``"last"``, from a list or ``"1, 15, last"``."""
    if isinstance(value, str):
        value = [p for p in re.split(r"[,;\s]+", value) if p]
    if not isinstance(value, (list, tuple)):
        return []
    last = any(str(i).strip().lower() == DAY_LAST for i in value)
    days = _int_list([i for i in value if str(i).strip().lower() != DAY_LAST], 1, 31)
    return days + [DAY_LAST] if last else days


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


def _fallback_time(value) -> str | None:
    """``"HH:MM"`` or ``"previous"``, or None."""
    text = str(value or "").strip().lower()
    if text == FALLBACK_PREVIOUS:
        return text
    match = _TIME.match(text)
    return f"{int(match.group(1)):02d}:{match.group(2)}" if match else None


def _clean_id(value) -> str:
    return _ID_UNSAFE.sub("_", str(value or "").lower()).strip("_")


def _auto_id(position: int, taken: set) -> str:
    """``schedule_N`` for the first N from the position on that nobody has."""
    n = position + 1
    while f"schedule_{n}" in taken:
        n += 1
    return f"schedule_{n}"


def normalize_schedule(
    schedule, used: set, position: int = 0, avoid: set | None = None
) -> dict | None:
    """One schedule as it is stored, or None if it is not one.

    A schedule that has no id of its own is given ``schedule_N``, skipping the
    ids in ``used`` and in ``avoid`` (the ones the program has had).
    """
    if not isinstance(schedule, dict):
        return None
    schedule_type = schedule.get(const.SCHEDULE_TYPE)
    if schedule_type not in SCHEDULE_TYPES:
        schedule_type = SCHEDULE_TYPE_TIME
    base = _clean_id(schedule.get(const.SCHEDULE_ID)) or _auto_id(
        position, used | (avoid or set())
    )
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
    stored = {
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
    # Stored only when set, so that a schedule that uses neither stays as it was.
    days_of_month = _days_of_month(schedule.get(const.SCHEDULE_DAYS_OF_MONTH))
    if days_of_month:
        stored[const.SCHEDULE_DAYS_OF_MONTH] = days_of_month
    fallback = _fallback_time(schedule.get(const.SCHEDULE_FALLBACK_TIME))
    if fallback:
        stored[const.SCHEDULE_FALLBACK_TIME] = fallback
    return stored


def normalize_schedules(schedules, reserved_ids=None) -> list:
    """The schedules of a program as they are stored.

    The ids that were given are kept first, so that a schedule without one
    never takes the id of another that comes later in the list. A new id is
    never one of ``reserved_ids``, which a deleted schedule may have left marks
    under (its last run), and the new schedule would otherwise inherit them.
    """
    reserved = {str(i) for i in (reserved_ids or ())}
    given = {
        _clean_id(s.get(const.SCHEDULE_ID))
        for s in (schedules or [])
        if isinstance(s, dict) and _clean_id(s.get(const.SCHEDULE_ID))
    }
    used: set = set()
    cleaned = []
    for position, raw in enumerate(schedules or []):
        schedule = normalize_schedule(raw, used, position, reserved | given)
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
    days_of_month = schedule.get(const.SCHEDULE_DAYS_OF_MONTH) or []
    if days_of_month:
        # A month shorter than the day asked has no such day: it is skipped
        # (31 in April), except for "last", which is every month's own.
        is_last = (day + timedelta(days=1)).day == 1
        if day.day not in days_of_month and not (DAY_LAST in days_of_month and is_last):
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
        event = schedule.get(const.SCHEDULE_EVENT) or "sunrise"
        moment = sun(event, day)
        if moment is None:
            return _polar_target(schedule, event, day, sun, tz)
        offset = timedelta(
            minutes=int(schedule.get(const.SCHEDULE_OFFSET_MINUTES) or 0)
        )
        return (moment + offset).astimezone(timezone.utc)
    match = _TIME.match(str(schedule.get(const.SCHEDULE_TIME) or DEFAULT_TIME))
    at = time(int(match.group(1)), int(match.group(2))) if match else time(6, 0)
    return datetime.combine(day, at, tzinfo=tz).astimezone(timezone.utc)


def _polar_target(schedule: dict, event: str, day: date, sun, tz) -> datetime | None:
    """The moment on a day without a sunrise or sunset, or None (skip the day)."""
    fallback = schedule.get(const.SCHEDULE_FALLBACK_TIME)
    if not fallback:
        return None
    if fallback != FALLBACK_PREVIOUS:
        match = _TIME.match(str(fallback))
        if not match:
            return None
        at = time(int(match.group(1)), int(match.group(2)))
        return datetime.combine(day, at, tzinfo=tz).astimezone(timezone.utc)
    offset = timedelta(minutes=int(schedule.get(const.SCHEDULE_OFFSET_MINUTES) or 0))
    for back in range(1, MAX_PREVIOUS_LOOKBACK_DAYS + 1):
        earlier = sun(event, day - timedelta(days=back))
        if earlier is not None:
            seen = (earlier + offset).astimezone(tz).time().replace(tzinfo=None)
            return datetime.combine(day, seen, tzinfo=tz).astimezone(timezone.utc)
    return None


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
    An occurrence missed altogether is passed over. A start-anchored occurrence
    that is at most ``CATCH_UP_GRACE_SECONDS`` late (Home Assistant was down at
    its moment) is caught up the same way, and later than that it is passed over.
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
        if not end_anchored and target <= now < target + timedelta(
            seconds=CATCH_UP_GRACE_SECONDS
        ):
            return {"fire": now, "target": target, "catch_up": True}
    return None


def upcoming(
    schedule: dict,
    now: datetime,
    total_seconds: float,
    last_target: datetime | None,
    sun,
    tz,
    until: datetime,
) -> list:
    """Every start of the schedule from ``now`` up to ``until``, in order.

    The same occurrences ``next_fire`` would give one after the other, each
    handed the target of the one before, which is how the planning page shows
    what the next days hold.
    """
    found = []
    last = last_target
    while True:
        result = next_fire(schedule, now, total_seconds, last, sun, tz)
        if result is None or result["fire"] > until:
            return found
        found.append(result)
        last = result["target"]
        if len(found) > 200:  # a schedule that fires every day for months
            return found
