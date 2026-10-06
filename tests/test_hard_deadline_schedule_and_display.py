# ruff: noqa: F811
"""The scheduler hands the deadline to the runner (C4); the overview shows the next
start that will really fire (a missed start inside the catch-up window is not it)."""

from unittest.mock import ANY

from tests.test_program_scheduler import Scheduler, armed  # noqa: F401
from tests.test_program_scheduler import _program as _sched_program
from tests.test_program_status import (
    _paris_clock,  # noqa: F401
    _program,
    _status,
    _utc,
)


async def _fire(scheduler, target):
    await scheduler.register_program_schedules()
    await scheduler._fire_program_schedule("evening", "schedule_1", target)


async def test_a_hard_deadline_schedule_hands_its_end_to_the_runner(
    armed,
):  # noqa: F811
    scheduler = Scheduler(
        [_sched_program([{"time": "07:00", "anchor": "end", "hard_deadline": True}])]
    )

    await _fire(scheduler, _utc(1, 7))

    scheduler.async_run_program.assert_awaited_once_with(
        "evening", manual=False, only_zones=None, note_day=ANY, deadline=_utc(1, 7)
    )


async def test_an_end_schedule_without_the_flag_has_no_deadline(armed):  # noqa: F811
    scheduler = Scheduler([_sched_program([{"time": "07:00", "anchor": "end"}])])

    await _fire(scheduler, _utc(1, 7))

    scheduler.async_run_program.assert_awaited_once_with(
        "evening", manual=False, only_zones=None, note_day=ANY
    )


async def test_a_start_schedule_ignores_the_flag(armed):  # noqa: F811
    scheduler = Scheduler(
        [_sched_program([{"time": "06:00", "anchor": "start", "hard_deadline": True}])]
    )

    await _fire(scheduler, _utc(1, 6))

    scheduler.async_run_program.assert_awaited_once_with(
        "evening", manual=False, only_zones=None, note_day=ANY
    )


async def test_the_overview_skips_a_missed_start_inside_the_catch_up_window():
    # 05:00 in Paris; the 04:00 start was missed by an hour, within the 2 hour grace.
    hass, coord = _status([_program([{"time": "04:00"}])])

    [overview] = await coord.async_program_overview()

    # Nothing fires it now (only a startup or a reload would): tomorrow's is shown.
    assert overview["next_start"] == _utc(2, 4).isoformat()


async def test_the_overview_still_shows_a_start_that_is_ahead():
    hass, coord = _status([_program([{"time": "06:00"}, {"time": "04:00"}])])

    [overview] = await coord.async_program_overview()

    assert overview["next_start"] == _utc(1, 6).isoformat()


async def test_a_run_to_be_done_by_a_moment_that_has_no_time_left_shows_the_next_day():
    # Two steps of five minutes to be done by 05:05: the start is already late.
    hass, coord = _status([_program([{"time": "05:05", "anchor": "end"}])])

    [overview] = await coord.async_program_overview()

    assert overview["next_start"] == _utc(2, 4, 55).isoformat()
