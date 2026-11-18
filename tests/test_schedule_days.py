"""Schedules over weeks: the real scheduler, day after day, on a moving clock.

The rules of a schedule are tested on their own (test_schedules.py). What was
never run is the loop around them over many days: arm, reach the moment, record
it, arm the next one. Here the clock is moved from one armed moment to the next
for weeks, across the end of daylight saving time and across New Year, and each
program the scheduler starts is written down with its local day and time.
The last one chains a program after another over a week with frosty days.
"""

import asyncio
from datetime import date, datetime, timedelta

import homeassistant.util.dt as dt_util
import pytest

from tests.test_program_scheduler import (  # noqa: F401 - the fixture sets Paris
    PARIS,
    Armed,
    Scheduler,
    _paris_clock,
    patch,
)


def _program(program_id, schedules):
    return {
        "id": program_id,
        "name": program_id.title(),
        "steps": [{"zones": [0]}],
        "schedules": schedules,
    }


async def _days(freezer, scheduler, until, armed, run_seconds=None):
    """Run the scheduler up to ``until``: {local date: [(program, "HH:MM")]}.

    ``run_seconds``: each run lasts that long and, as the runner does when a
    run really watered, then starts the programs that come after it.
    """
    started: dict = {}

    async def _run(program_id, *args, **kwargs):
        local = dt_util.now().astimezone(PARIS)
        started.setdefault(local.date(), []).append(
            (program_id, local.strftime("%H:%M"))
        )
        if run_seconds is not None:
            await scheduler.async_start_programs_after(
                program_id, dt_util.utcnow() + timedelta(seconds=run_seconds)
            )
        return True

    scheduler.async_run_program.side_effect = _run
    await scheduler.register_program_schedules()
    for _ in range(400):
        live = [
            (when, cb)
            for (cb, when), unsub in zip(armed.calls, armed.unsubs, strict=True)
            if not unsub.called
        ]
        if not live:
            break
        when, callback = min(live, key=lambda pair: pair[0])
        if when.astimezone(PARIS).date() > until:
            break
        freezer.move_to(when)
        # Only this one fires: it is no longer pending.
        armed.unsubs[armed.calls.index((callback, when))].called = True
        callback(when)
        for _ in range(20):
            await asyncio.sleep(0)
    return started


@pytest.fixture
def armed():
    recorder = Armed()
    with patch(
        "custom_components.smart_irrigation.program_scheduler.async_track_point_in_utc_time",
        recorder,
    ):
        yield recorder


async def test_three_programs_every_third_day_take_turns_across_the_clock_change(
    freezer, armed
):
    """Every 3 days with offsets 0, 1 and 2: one program a day, never two,
    each at 06:00 local before and after daylight saving time ends (25 Oct)."""
    freezer.move_to("2026-10-10 02:00:00+00:00")
    scheduler = Scheduler(
        [
            _program(name, [{"time": "06:00", "every_n_days": 3, "every_offset": k}])
            for k, name in enumerate(["north", "south", "east"])
        ]
    )

    started = await _days(freezer, scheduler, date(2026, 11, 8), armed)

    days = sorted(started)
    assert days[0] == date(2026, 10, 10) and days[-1] == date(2026, 11, 8)
    assert len(days) == 30  # every day, none missed
    assert all(len(runs) == 1 for runs in started.values())  # never two
    assert {at for runs in started.values() for _, at in runs} == {"06:00"}
    for name in ("north", "south", "east"):
        mine = [d for d in days if started[d][0][0] == name]
        assert {(b - a).days for a, b in zip(mine, mine[1:], strict=False)} == {3}


async def test_a_season_over_new_year_waters_only_inside_it(freezer, armed):
    """From 15 November until 15 March, on Mondays: across New Year."""
    freezer.move_to("2026-11-01 02:00:00+00:00")
    scheduler = Scheduler(
        [
            _program(
                "winter",
                [
                    {
                        "time": "07:30",
                        "weekdays": [0],
                        "from_date": "11-15",
                        "until_date": "03-15",
                    }
                ],
            )
        ]
    )

    started = await _days(freezer, scheduler, date(2027, 4, 15), armed)

    days = sorted(started)
    assert days[0] == date(2026, 11, 16)  # the first Monday from 15 Nov
    assert days[-1] == date(2027, 3, 15)  # a Monday, the last day of it
    assert all(d.weekday() == 0 for d in days)
    assert date(2027, 1, 4) in days  # over New Year
    assert len(days) == 18
    assert {at for runs in started.values() for _, at in runs} == {"07:30"}


async def test_done_by_sunrise_keeps_its_end_when_the_clock_changes(freezer, armed):
    """A run to be done by sunrise starts its length earlier, in local time,
    whatever daylight saving time does in between (the sun is at 07:30 here)."""
    freezer.move_to("2026-10-22 02:00:00+00:00")
    scheduler = Scheduler(
        [_program("lawn", [{"type": "sun", "event": "sunrise", "anchor": "end"}])]
    )

    started = await _days(freezer, scheduler, date(2026, 10, 28), armed)

    # One zone of 600 s: started at 07:20 every day, 25 Oct included.
    assert sorted(started) == [date(2026, 10, d) for d in range(22, 29)]
    assert {runs[0][1] for runs in started.values()} == {"07:20"}


async def test_an_occurrence_that_ran_is_not_run_again_after_a_restart(freezer, armed):
    """A restart after 06:00 neither repeats today's run nor loses tomorrow's."""
    freezer.move_to("2026-06-01 03:00:00+00:00")
    scheduler = Scheduler([_program("lawn", [{"time": "06:00"}])])
    started = await _days(freezer, scheduler, date(2026, 6, 1), armed)
    assert list(started) == [date(2026, 6, 1)]

    # A new coordinator, as after a restart, five minutes later.
    freezer.move_to(datetime(2026, 6, 1, 6, 5, tzinfo=PARIS))
    again = Scheduler(
        [_program("lawn", [{"time": "06:00"}])],
        last_runs=scheduler.store.config.program_last_runs,
    )
    armed.calls.clear()
    armed.unsubs.clear()
    started = await _days(freezer, again, date(2026, 6, 2), armed)

    assert list(started) == [date(2026, 6, 2)]


async def test_a_greenhouse_after_the_lawn_waters_every_day_frost_or_not(
    freezer, armed
):
    """The lawn at 06:00 takes the weather into account; the greenhouse drip
    line comes 15 min after it and does not. On the two frosty days the lawn is
    held back, and the greenhouse starts at the lawn's moment plus its 15 min;
    on the others it starts 15 min after the lawn's 10-minute run (#1045)."""
    freezer.move_to("2026-05-04 02:00:00+00:00")
    frost = {date(2026, 5, 6), date(2026, 5, 8)}
    scheduler = Scheduler(
        [
            _program("lawn", [{"time": "06:00"}]),
            _program(
                "greenhouse",
                [
                    {
                        "type": "after",
                        "after_program": "lawn",
                        "offset_minutes": 15,
                        "weather": False,
                    }
                ],
            ),
        ]
    )
    scheduler._prepare_watering_for_today.side_effect = lambda *a, **k: (
        dt_util.now().astimezone(PARIS).date() not in frost,
        set(),
    )

    started = await _days(freezer, scheduler, date(2026, 5, 10), armed, 600)

    assert sorted(started) == [date(2026, 5, d) for d in range(4, 11)]
    for day, runs in started.items():
        if day in frost:
            assert runs == [("greenhouse", "06:15")]
        else:
            assert runs == [("lawn", "06:00"), ("greenhouse", "06:25")]
