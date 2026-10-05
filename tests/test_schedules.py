"""Schedules: which days, which moment, and what comes next.

The sun and the clock are handed in, so every case is a plain date in a named
zone, including the days the clock changes.
"""

from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.schedules import (
    next_fire,
    normalize_schedules,
    occurs_on,
    target_on,
)

PARIS = ZoneInfo("Europe/Paris")
UTC = timezone.utc


def _sun(event, day):
    """Sunrise 07:30 and sunset 19:30, local, every day."""
    at = time(7, 30) if event == "sunrise" else time(19, 30)
    return datetime.combine(day, at, tzinfo=PARIS)


def _schedule(**overrides):
    [schedule] = normalize_schedules([overrides])
    return schedule


def _local(year, month, day, hour=0, minute=0):
    return datetime(year, month, day, hour, minute, tzinfo=PARIS).astimezone(UTC)


# --- what is stored -----------------------------------------------------------


def test_a_schedule_is_stored_well_formed():
    schedule = _schedule()

    assert schedule[const.SCHEDULE_TYPE] == "time"
    assert schedule[const.SCHEDULE_TIME] == "06:00"
    assert schedule[const.SCHEDULE_ANCHOR] == "start"
    assert schedule[const.SCHEDULE_WEEKDAYS] == []
    assert schedule[const.SCHEDULE_EVERY_N_DAYS] == 1
    assert schedule[const.SCHEDULE_PARITY] == "any"
    assert schedule[const.SCHEDULE_WEATHER] is True
    assert schedule[const.SCHEDULE_ENABLED] is True


def test_what_is_nonsense_is_cleaned():
    schedule = _schedule(
        type="moon",
        time="25:99",
        event="noon",
        offset_minutes="99999",
        anchor="middle",
        weekdays=[1, "3", 9, "x"],
        every_n_days=0,
        every_offset=7,
        parity="prime",
        months=[0, 5, 13],
        from_date="13-45",
        until_date="3-5",
    )

    assert schedule[const.SCHEDULE_TYPE] == "time"
    assert schedule[const.SCHEDULE_TIME] == "06:00"
    assert schedule[const.SCHEDULE_EVENT] == "sunrise"
    assert schedule[const.SCHEDULE_OFFSET_MINUTES] == 12 * 60
    assert schedule[const.SCHEDULE_ANCHOR] == "start"
    assert schedule[const.SCHEDULE_WEEKDAYS] == [1, 3]
    assert schedule[const.SCHEDULE_EVERY_N_DAYS] == 1
    assert schedule[const.SCHEDULE_EVERY_OFFSET] == 0
    assert schedule[const.SCHEDULE_PARITY] == "any"
    assert schedule[const.SCHEDULE_MONTHS] == [5]
    assert schedule[const.SCHEDULE_FROM] is None
    assert schedule[const.SCHEDULE_UNTIL] == "03-05"


def test_ids_are_unique():
    schedules = normalize_schedules([{}, {}, {"id": "schedule_1"}])

    assert len({s[const.SCHEDULE_ID] for s in schedules}) == 3


# --- which days -----------------------------------------------------------------


def test_every_day_by_default():
    schedule = _schedule()

    assert all(
        occurs_on(schedule, date(2026, 6, 1) + timedelta(days=n)) for n in range(40)
    )


def test_days_of_the_week():
    schedule = _schedule(weekdays=[0, 2, 4])  # Monday, Wednesday, Friday

    days = [date(2026, 6, 1) + timedelta(days=n) for n in range(7)]  # a Monday on
    assert [occurs_on(schedule, d) for d in days] == [
        True,
        False,
        True,
        False,
        True,
        False,
        False,
    ]


def test_even_and_odd_days_of_the_month():
    even = _schedule(parity="even")
    odd = _schedule(parity="odd")

    assert occurs_on(even, date(2026, 6, 2)) and not occurs_on(even, date(2026, 6, 3))
    assert occurs_on(odd, date(2026, 6, 3)) and not occurs_on(odd, date(2026, 6, 2))


def test_every_n_days_turns_groups():
    """Three groups, A, B and C, each one day in three and never the same day."""
    groups = [_schedule(every_n_days=3, every_offset=n) for n in range(3)]
    days = [date(2026, 6, 1) + timedelta(days=n) for n in range(30)]

    for day in days:
        assert sum(occurs_on(g, day) for g in groups) == 1
    for group in groups:
        mine = [d for d in days if occurs_on(group, d)]
        assert all((b - a).days == 3 for a, b in zip(mine, mine[1:], strict=False))


def test_every_n_days_crosses_a_month_and_a_year_without_slipping():
    schedule = _schedule(every_n_days=4)
    mine = [
        date(2026, 12, 1) + timedelta(days=n)
        for n in range(60)
        if occurs_on(schedule, date(2026, 12, 1) + timedelta(days=n))
    ]

    assert all((b - a).days == 4 for a, b in zip(mine, mine[1:], strict=False))


def test_months():
    schedule = _schedule(months=[6, 7, 8])

    assert occurs_on(schedule, date(2026, 7, 1))
    assert not occurs_on(schedule, date(2026, 9, 1))


def test_a_period():
    schedule = _schedule(from_date="04-15", until_date="09-30")

    assert not occurs_on(schedule, date(2026, 4, 14))
    assert occurs_on(schedule, date(2026, 4, 15))
    assert occurs_on(schedule, date(2026, 9, 30))
    assert not occurs_on(schedule, date(2026, 10, 1))


def test_a_period_may_wrap_over_new_year():
    schedule = _schedule(from_date="11-01", until_date="03-01")

    assert occurs_on(schedule, date(2026, 12, 25))
    assert occurs_on(schedule, date(2027, 2, 28))
    assert not occurs_on(schedule, date(2026, 7, 1))


def test_filters_all_have_to_hold():
    schedule = _schedule(weekdays=[0], parity="odd", months=[6])

    assert occurs_on(schedule, date(2026, 6, 15))  # a Monday, the 15th
    assert not occurs_on(schedule, date(2026, 6, 8))  # a Monday, but the 8th
    assert not occurs_on(schedule, date(2026, 6, 16))  # the 16th: even, a Tuesday


def test_a_disabled_schedule_never_occurs():
    assert not occurs_on(_schedule(enabled=False), date(2026, 6, 1))


# --- which moment -----------------------------------------------------------------


def test_a_clock_time_is_local_time():
    schedule = _schedule(time="06:30")

    assert target_on(schedule, date(2026, 7, 1), _sun, PARIS) == _local(
        2026, 7, 1, 6, 30
    )
    # In winter the same wall clock time is another UTC time.
    assert target_on(schedule, date(2026, 1, 1), _sun, PARIS) == _local(
        2026, 1, 1, 6, 30
    )
    assert _local(2026, 7, 1, 6, 30).hour == 4 and _local(2026, 1, 1, 6, 30).hour == 5


@pytest.mark.parametrize("event", ["sunrise", "sunset"])
@pytest.mark.parametrize("offset", [0, -45, 45])
def test_a_sun_moment_carries_its_offset(event, offset):
    schedule = _schedule(type="sun", event=event, offset_minutes=offset)

    target = target_on(schedule, date(2026, 6, 1), _sun, PARIS)

    assert target == _sun(event, date(2026, 6, 1)).astimezone(UTC) + timedelta(
        minutes=offset
    )


def test_a_day_without_a_sun_has_no_moment():
    schedule = _schedule(type="sun")

    assert target_on(schedule, date(2026, 6, 1), lambda e, d: None, PARIS) is None


# --- what comes next -----------------------------------------------------------------


def _next(schedule, now, total=0, last=None):
    return next_fire(schedule, now, total, last, _sun, PARIS)


def test_the_next_start_is_today_if_it_has_not_come():
    now = _local(2026, 6, 1, 5, 0)

    result = _next(_schedule(time="06:00"), now)

    assert result["fire"] == _local(2026, 6, 1, 6, 0)
    assert result["catch_up"] is False


def test_the_next_start_is_tomorrow_once_today_has_passed():
    now = _local(2026, 6, 1, 6, 30)

    assert _next(_schedule(time="06:00"), now)["fire"] == _local(2026, 6, 2, 6, 0)


def test_only_the_days_that_match_count():
    now = _local(2026, 6, 1, 12, 0)  # a Monday

    result = _next(_schedule(time="06:00", weekdays=[3]), now)  # Thursdays

    assert result["fire"] == _local(2026, 6, 4, 6, 0)


def test_what_ran_last_is_never_returned_again():
    """The schedule fired its 06:00 and is armed again a second later.

    Armed with the target it has just fired it must move on to the next one,
    not compute a start in the past and fire again.
    """
    schedule = _schedule(time="06:00")
    fired = _local(2026, 6, 1, 6, 0)

    result = _next(schedule, fired + timedelta(seconds=1), last=fired)

    assert result["fire"] == _local(2026, 6, 2, 6, 0)


@pytest.mark.parametrize("event", ["sunrise", "sunset"])
@pytest.mark.parametrize("offset", [0, -30, 30])
@pytest.mark.parametrize("anchor", ["start", "end"])
def test_a_fired_sun_schedule_moves_on_whatever_the_offset(event, offset, anchor):
    """The matrix that mattered: every event, every sign of offset, both anchors."""
    schedule = _schedule(type="sun", event=event, offset_minutes=offset, anchor=anchor)
    total = 1800
    now = _local(2026, 6, 1, 0, 0)

    seen = []
    last = None
    for _ in range(4):
        result = _next(schedule, now, total, last)
        seen.append(result["target"])
        # The moment it fires, it is re-armed with what it has just fired.
        now = result["fire"] + timedelta(seconds=1)
        last = result["target"]

    assert seen == sorted(set(seen)), seen  # strictly increasing, never repeated
    assert [(b - a).days for a, b in zip(seen, seen[1:], strict=False)] == [1, 1, 1]


def test_a_run_that_must_be_done_by_a_moment_starts_that_long_before():
    schedule = _schedule(time="07:00", anchor="end")

    result = _next(schedule, _local(2026, 6, 1, 3, 0), total=3600)

    assert result["fire"] == _local(2026, 6, 1, 6, 0)
    assert result["target"] == _local(2026, 6, 1, 7, 0)
    assert result["catch_up"] is False


def test_a_start_that_has_gone_by_with_its_moment_ahead_starts_now():
    schedule = _schedule(time="07:00", anchor="end")
    now = _local(2026, 6, 1, 6, 20)  # the hour-long run should have started at 06:00

    result = _next(schedule, now, total=3600)

    assert result["catch_up"] is True
    assert result["fire"] == now
    assert result["target"] == _local(2026, 6, 1, 7, 0)


def test_a_catch_up_is_not_repeated_once_it_ran():
    schedule = _schedule(time="07:00", anchor="end")
    now = _local(2026, 6, 1, 6, 20)
    first = _next(schedule, now, total=3600)

    again = _next(schedule, now, total=3600, last=first["target"])

    assert again["catch_up"] is False
    assert again["target"] == _local(2026, 6, 2, 7, 0)


def test_an_occurrence_missed_altogether_is_passed_over():
    schedule = _schedule(time="07:00", anchor="end")

    result = _next(schedule, _local(2026, 6, 1, 7, 30), total=3600)

    assert result["target"] == _local(2026, 6, 2, 7, 0)


def test_an_end_anchored_schedule_with_nothing_to_water_has_no_start():
    assert _next(_schedule(anchor="end"), _local(2026, 6, 1), total=0) is None


def test_the_day_the_clock_changes_is_one_local_day():
    """Last Sunday of March 2026: 06:00 local is 04:00 UTC then, not 05:00."""
    schedule = _schedule(time="06:00")
    now = _local(2026, 3, 28, 7, 0)

    saturday = _next(schedule, now)
    sunday = _next(
        schedule, saturday["fire"] + timedelta(seconds=1), last=saturday["target"]
    )

    assert saturday["fire"] == _local(2026, 3, 29, 6, 0)
    assert sunday["fire"] == _local(2026, 3, 30, 6, 0)
    assert saturday["fire"].hour == 4  # summer time began that day
    assert (sunday["fire"] - saturday["fire"]) == timedelta(hours=24)


def test_the_next_start_may_be_months_away():
    schedule = _schedule(time="06:00", months=[7])

    result = _next(schedule, _local(2026, 1, 15, 12, 0))

    assert result["fire"] == _local(2026, 7, 1, 6, 0)


def test_a_schedule_that_never_occurs_has_no_next():
    schedule = _schedule(from_date="02-30")  # not a real day: no period at all

    # An invalid period is dropped, so the schedule still runs; one that cannot
    # match anything (31 April) is what has no next.
    assert _next(schedule, _local(2026, 6, 1)) is not None
    never = _schedule(months=[4], from_date="05-01", until_date="05-02")
    assert _next(never, _local(2026, 6, 1)) is None
