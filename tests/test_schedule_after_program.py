"""A schedule that starts its program after another program (type "after").

The rules: when the other program really watered and finished (by its
schedule or by hand), it starts after its end plus the offset. When a scheduled
run of the other program was held back (the weather, a suspension, nothing to
water), it starts all the same, at that run's planned moment plus the offset.
When the other program was stopped by hand, or its run failed, it does not
start. Its own days and weather still apply; loops and deleting a program
another one waits for are refused at save; the planning places it after the
other program's planned end, or at its planned moment when that one will not
water.
"""

import asyncio
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch
from zoneinfo import ZoneInfo

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import (
    SmartIrrigationCoordinator,
    const,
    llm_config_tools,
)
from custom_components.smart_irrigation.planning_sequence import sequence_planning
from custom_components.smart_irrigation.program_runner import ProgramRun
from custom_components.smart_irrigation.program_scheduler import ProgramSchedulerMixin
from custom_components.smart_irrigation.programs import (
    LastProgramError,
    ProgramChainError,
    ProgramsRefused,
    chain_loop,
    check_program_chains,
    dependents_of,
    normalize_programs,
)
from custom_components.smart_irrigation.schedules import (
    chained_start,
    next_fire,
    normalize_schedules,
)
from custom_components.smart_irrigation.triggers import TriggersMixin
from tests.runner_doubles import Coordinator, make_hass, make_store, zone

PARIS = ZoneInfo("Europe/Paris")


def _utc(day, hour, minute=0):
    return datetime(2026, 6, day, hour, minute, tzinfo=PARIS).astimezone(UTC)


def _after(program_id, **overrides):
    data = {"type": "after", "after_program": program_id, "weather": False}
    data.update(overrides)
    return data


def _program(program_id, schedules, zones=(0,), **overrides):
    data = {
        "id": program_id,
        "name": program_id.capitalize(),
        "steps": [{"zones": list(zones)}],
        "schedules": schedules,
    }
    data.update(overrides)
    return data


@pytest.fixture(autouse=True)
def _paris_clock(freezer, monkeypatch):
    previous = dt_util.DEFAULT_TIME_ZONE
    dt_util.set_default_time_zone(PARIS)
    freezer.move_to("2026-06-01 03:00:00+00:00")  # Monday 05:00 in Paris
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )
    yield
    dt_util.set_default_time_zone(previous)


# --- what is stored ----------------------------------------------------------


def test_an_after_schedule_is_stored_starting_never_before_the_end():
    [stored] = normalize_schedules(
        [
            {
                "type": "after",
                "after_program": " morning ",
                "offset_minutes": -30,
                "anchor": "end",
                "hard_deadline": True,
                "fallback_time": "06:00",
            }
        ]
    )

    assert stored["type"] == "after"
    assert stored["after_program"] == "morning"
    assert stored["offset_minutes"] == 0
    assert stored["anchor"] == "start"
    assert "hard_deadline" not in stored
    assert "fallback_time" not in stored


def test_an_after_schedule_keeps_its_offset_and_days():
    [stored] = normalize_schedules(
        [
            {
                "type": "after",
                "after_program": "a",
                "offset_minutes": 2000,
                "weekdays": [2],
            }
        ]
    )

    assert stored["offset_minutes"] == 12 * 60
    assert stored["weekdays"] == [2]


def test_an_after_schedule_without_a_program_waits_for_none():
    [stored] = normalize_schedules([{"type": "after"}])

    assert stored["after_program"] is None


def test_an_after_schedule_has_no_moment_of_its_own():
    [stored] = normalize_schedules([_after("a")])

    assert next_fire(stored, dt_util.utcnow(), 600, None, Mock(), PARIS) is None


def test_the_chained_start_is_the_end_plus_the_offset():
    [stored] = normalize_schedules([_after("a", offset_minutes=15)])

    assert chained_start(stored, _utc(1, 6), PARIS) == _utc(1, 6, 15)


def test_the_days_are_judged_on_the_day_the_chained_start_falls_on():
    # Monday 23:50 plus 20 minutes is Tuesday (weekday 1).
    [tuesday] = normalize_schedules([_after("a", offset_minutes=20, weekdays=[1])])
    [monday] = normalize_schedules([_after("a", offset_minutes=20, weekdays=[0])])

    assert chained_start(tuesday, _utc(1, 23, 50), PARIS) == _utc(2, 0, 10)
    assert chained_start(monday, _utc(1, 23, 50), PARIS) is None


def test_a_switched_off_after_schedule_starts_nothing():
    [stored] = normalize_schedules([_after("a", enabled=False)])

    assert chained_start(stored, _utc(1, 6), PARIS) is None


# --- loops and deletions, refused at save ---------------------------------------


def _programs(*programs):
    return normalize_programs(list(programs))


def test_a_loop_of_programs_is_found():
    programs = _programs(
        _program("a", [_after("b")]), _program("b", [_after("a")]), _program("c", [])
    )

    assert chain_loop(programs) == ["a", "b", "a"]


def test_a_program_after_itself_is_a_loop():
    assert chain_loop(_programs(_program("a", [_after("a")]))) == ["a", "a"]


def test_a_loop_is_refused_with_the_programs_named():
    old = _programs(_program("a", [{"time": "06:00"}]), _program("b", [_after("a")]))
    new = _programs(_program("a", [_after("b")]), _program("b", [_after("a")]))

    with pytest.raises(ProgramChainError) as refused:
        check_program_chains(new, old)

    assert '"A" -> "B" -> "A"' in str(refused.value)


def test_a_loop_through_a_switched_off_schedule_is_refused_too():
    new = _programs(
        _program("a", [_after("b", enabled=False)]), _program("b", [_after("a")])
    )

    with pytest.raises(ProgramChainError):
        check_program_chains(new, [])


def test_a_chain_without_a_loop_is_saved():
    new = _programs(
        _program("a", [{"time": "06:00"}]),
        _program("b", [_after("a")]),
        _program("c", [_after("b"), _after("a")]),
    )

    check_program_chains(new, [])


def test_deleting_a_program_another_starts_after_is_refused():
    old = _programs(
        _program("a", [{"time": "06:00"}]),
        _program("b", [_after("a", enabled=False)]),
    )
    new = [p for p in old if p["id"] != "a"]

    with pytest.raises(ProgramChainError) as refused:
        check_program_chains(new, old)

    assert '"A" cannot be deleted' in str(refused.value)
    assert '"B" starts after it' in str(refused.value)
    assert dependents_of(old, "a") == ["B"]


def test_deleting_both_programs_of_a_chain_is_saved():
    old = _programs(_program("a", []), _program("b", [_after("a")]), _program("c", []))

    check_program_chains([old[2]], old)


def test_a_new_schedule_after_an_unknown_program_is_refused():
    old = _programs(_program("a", []))
    new = _programs(_program("a", [_after("ghost")]))

    with pytest.raises(ProgramChainError) as refused:
        check_program_chains(new, old)

    assert "does not exist" in str(refused.value)


def test_what_was_already_wrong_in_the_store_does_not_stop_another_save():
    # A schedule left waiting for a program long gone, and an old loop.
    old = _programs(
        _program("a", [_after("ghost")]),
        _program("b", [_after("c")]),
        _program("c", [_after("b")]),
    )
    new = [*old, *_programs(_program("d", []))]

    check_program_chains(new, old)


def test_the_refusals_are_the_ones_the_config_view_answers():
    assert issubclass(ProgramChainError, ProgramsRefused)
    assert issubclass(LastProgramError, ProgramsRefused)


def _saving(old_programs):
    """The coordinator's save of the programs, on a store of its own."""
    return SimpleNamespace(
        store=SimpleNamespace(
            config=SimpleNamespace(
                programs=old_programs,
                program_last_runs=None,
                program_last_started=None,
                program_adjustments=None,
                suspensions=None,
            )
        )
    )


def test_the_save_of_the_programs_refuses_a_loop():
    old = _programs(_program("a", []), _program("b", [_after("a")]))
    saving = _saving(old)

    with pytest.raises(ProgramChainError):
        SmartIrrigationCoordinator._programs_changes(
            saving,
            {
                const.CONF_PROGRAMS: [
                    _program("a", [_after("b")]),
                    _program("b", [_after("a")]),
                ]
            },
        )


def test_the_save_of_the_programs_refuses_deleting_a_predecessor():
    old = _programs(_program("a", []), _program("b", [_after("a")]))

    with pytest.raises(ProgramChainError):
        SmartIrrigationCoordinator._programs_changes(
            _saving(old), {const.CONF_PROGRAMS: [old[1]]}
        )


# --- the runner: did it really run ---------------------------------------------


def _run(results, stopped=False, cut=False):
    run = ProgramRun("a", "A", manual=True)
    run.results = results
    if stopped:
        run.stop.set()
    run.cut = cut
    return run


def test_a_run_that_watered_to_its_end_really_ran():
    assert _run([{"ran": True}]).really_ran() is True


def test_a_run_that_watered_nothing_did_not_really_run():
    assert _run([]).really_ran() is False
    assert _run([{"ran": False, "problem": "unavailable"}]).really_ran() is False


def test_a_run_stopped_by_hand_did_not_really_run():
    assert _run([{"ran": True}], stopped=True).really_ran() is False


def test_a_run_cut_at_its_deadline_really_ran_if_it_watered():
    assert _run([{"ran": True}], stopped=True, cut=True).really_ran() is True
    assert _run([], stopped=True, cut=True).really_ran() is False


# --- firing, end to end ------------------------------------------------------------


class Chain(ProgramSchedulerMixin, TriggersMixin, Coordinator):
    def _sun_moment(self, event, day):
        hour = 7 if event == "sunrise" else 20
        return datetime(day.year, day.month, day.day, hour, 30, tzinfo=PARIS)


class Armed:
    """What async_track_point_in_utc_time was asked for."""

    def __init__(self):
        self.calls = []
        self.unsubs = []

    def __call__(self, hass, callback, when):
        unsub = Mock()
        self.calls.append((callback, when))
        self.unsubs.append(unsub)
        return unsub


@pytest.fixture
def armed():
    recorder = Armed()
    with patch(
        "custom_components.smart_irrigation.program_scheduler.async_track_point_in_utc_time",
        recorder,
    ):
        yield recorder


def _chain(monkeypatch, programs, sleep=None):
    hass = make_hass()
    store = make_store([zone(0), zone(1), zone(2)])
    store.config.full_controller = True
    store.config.programs = normalize_programs(programs)
    store.config.program_last_runs = None
    store.config.suspensions = None
    store.config.active_cycle = None
    store.config.active_program_run = None

    async def _update(changes):
        for key, value in changes.items():
            setattr(store.config, key, value)

    store.async_update_config = AsyncMock(side_effect=_update)
    coord = Chain(hass, store)
    coord._notify_programs = lambda: None
    coord._note_watering_day = AsyncMock()
    coord._recalculate_before_start = AsyncMock()

    async def _no_wait(seconds, *args, **kwargs):
        if sleep is not None:
            await sleep(seconds)

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _no_wait
    )
    return hass, coord


def _started(hass):
    return [
        call.args[1]["program_id"]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0].endswith(const.EVENT_PROGRAM_STARTED)
    ]


async def _settle(coord):
    for _ in range(50):
        tasks = [t for t in coord._valve_run_tasks if not t.done()]
        if not tasks:
            await asyncio.sleep(0)
            if not [t for t in coord._valve_run_tasks if not t.done()]:
                return
            continue
        await asyncio.gather(*tasks, return_exceptions=True)


async def test_a_manual_run_starts_the_program_after_it(monkeypatch, armed):
    hass, coord = _chain(
        monkeypatch,
        [_program("a", [], zones=(0,)), _program("b", [_after("a")], zones=(1,))],
    )

    await coord.async_run_program("a")
    await _settle(coord)

    assert _started(hass) == ["a", "b"]
    # Started by its schedule, not by hand, and remembered as such.
    assert "b:schedule_1" in coord.store.config.program_last_runs
    assert not coord.store.config.pending_chained_starts


async def test_a_chain_of_chains_runs_one_after_the_other(monkeypatch, armed):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [], zones=(0,)),
            _program("b", [_after("a")], zones=(1,)),
            _program("c", [_after("b")], zones=(2,)),
        ],
    )

    await coord.async_run_program("a")
    await _settle(coord)

    assert _started(hass) == ["a", "b", "c"]


async def test_a_program_stopped_by_hand_starts_nothing_after_it(monkeypatch, armed):
    holder = {}

    async def _stop_it(seconds):
        await holder["coord"].async_stop_program("a")

    hass, coord = _chain(
        monkeypatch,
        [_program("a", [], zones=(0,)), _program("b", [_after("a")], zones=(1,))],
        sleep=_stop_it,
    )
    holder["coord"] = coord

    await coord.async_run_program("a")
    await _settle(coord)

    assert _started(hass) == ["a"]


async def test_stop_watering_starts_nothing_after_it(monkeypatch, armed):
    holder = {}

    async def _stop_all(seconds):
        await holder["coord"].async_stop_watering()

    hass, coord = _chain(
        monkeypatch,
        [_program("a", [], zones=(0,)), _program("b", [_after("a")], zones=(1,))],
        sleep=_stop_all,
    )
    holder["coord"] = coord

    await coord.async_run_program("a")
    await _settle(coord)

    assert _started(hass) == ["a"]


async def test_a_program_with_nothing_to_water_starts_nothing_after_it(
    monkeypatch, armed
):
    hass, coord = _chain(
        monkeypatch,
        [_program("a", [], zones=(0,)), _program("b", [_after("a")], zones=(1,))],
    )
    coord.store.by_id[0][const.ZONE_DURATION] = 0

    await coord.async_run_program("a")
    await _settle(coord)

    assert "b" not in _started(hass)


async def _due_chained_start(coord, armed):
    """Fire the one start after a program that waits for its moment."""
    [(callback, when)] = armed.calls[-1:]
    callback(when)
    await _settle(coord)
    return when


async def test_a_program_held_back_by_the_frost_still_starts_the_one_after_it(
    monkeypatch, armed
):
    # The lawn at 06:00 is held back by a frost; the greenhouse drip, weather
    # off, chained ten minutes after it, waters all the same.
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00"}], zones=(0,)),
            _program("b", [_after("a", offset_minutes=10)], zones=(1,)),
        ],
    )
    coord._prepare_program_watering = AsyncMock(return_value=(False, set()))

    await coord._fire_program_schedule("a", "schedule_1", _utc(1, 6))
    await _settle(coord)

    # From the planned moment of the run held back, plus the offset.
    [pending] = coord.store.config.pending_chained_starts
    assert pending["program_id"] == "b"
    assert dt_util.parse_datetime(pending["due"]) == _utc(1, 6, 10)
    when = await _due_chained_start(coord, armed)
    assert when == _utc(1, 6, 10)
    assert _started(hass) == ["b"]
    # Only A's weather was judged: B ignores it.
    coord._prepare_program_watering.assert_awaited_once()
    assert coord._prepare_program_watering.await_args.args[1]["program_id"] == "a"


async def test_a_chained_program_that_takes_the_weather_is_held_back_itself(
    monkeypatch, armed
):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00"}], zones=(0,)),
            _program("b", [_after("a", weather=True)], zones=(1,)),
        ],
    )
    coord._prepare_program_watering = AsyncMock(return_value=(False, set()))

    await coord._fire_program_schedule("a", "schedule_1", _utc(1, 6))
    await _settle(coord)
    await _due_chained_start(coord, armed)

    assert _started(hass) == []
    # B's start came, and its own weather setting held it back.
    judged = [
        c.args[1]["program_id"] for c in coord._prepare_program_watering.await_args_list
    ]
    assert judged == ["a", "b"]


async def test_a_suspended_program_still_starts_the_one_after_it(monkeypatch, armed):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00", "weather": False}], zones=(0,)),
            _program("b", [_after("a")], zones=(1,)),
        ],
    )
    await coord.async_suspend(const.SUSPEND_PROGRAM, "a", hours=24)

    await coord._fire_program_schedule("a", "schedule_1", _utc(1, 6))
    await _settle(coord)
    await _due_chained_start(coord, armed)

    assert _started(hass) == ["b"]


async def test_a_scheduled_run_with_nothing_to_water_starts_the_one_after_it(
    monkeypatch, armed
):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00", "weather": False}], zones=(0,)),
            _program("b", [_after("a", offset_minutes=5)], zones=(1,)),
        ],
    )
    coord.store.by_id[0][const.ZONE_DURATION] = 0

    await coord._fire_program_schedule("a", "schedule_1", _utc(1, 6))
    await _settle(coord)
    when = await _due_chained_start(coord, armed)

    assert when == _utc(1, 6, 5)
    assert _started(hass) == ["b"]


async def test_a_chain_held_back_twice_passes_the_moment_on(monkeypatch, armed):
    # A and B both held back by the weather: C, weather off, starts at A's
    # moment plus both offsets.
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00"}], zones=(0,)),
            _program("b", [_after("a", weather=True, offset_minutes=5)], zones=(1,)),
            _program("c", [_after("b", offset_minutes=5)], zones=(2,)),
        ],
    )
    coord._prepare_program_watering = AsyncMock(return_value=(False, set()))

    await coord._fire_program_schedule("a", "schedule_1", _utc(1, 6))
    await _settle(coord)
    await _due_chained_start(coord, armed)
    when = await _due_chained_start(coord, armed)

    assert when == _utc(1, 6, 10)
    assert _started(hass) == ["c"]


async def test_a_scheduled_run_starts_the_program_after_it(monkeypatch, armed):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00", "weather": False}], zones=(0,)),
            _program("b", [_after("a")], zones=(1,)),
        ],
    )

    await coord._fire_program_schedule("a", "schedule_1", _utc(1, 6))
    await _settle(coord)

    assert _started(hass) == ["a", "b"]


async def test_the_chained_schedule_judges_its_own_weather(monkeypatch, armed):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [], zones=(0,)),
            _program("b", [_after("a", weather=True)], zones=(1,)),
        ],
    )
    coord._prepare_program_watering = AsyncMock(return_value=(False, set()))

    await coord.async_run_program("a")
    await _settle(coord)

    assert _started(hass) == ["a"]
    coord._prepare_program_watering.assert_awaited_once()
    assert coord._prepare_program_watering.await_args.args[1]["program_id"] == "b"


async def test_the_chained_schedule_keeps_its_days(monkeypatch, armed):
    # Monday: a schedule for Tuesdays only does not start.
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [], zones=(0,)),
            _program("b", [_after("a", weekdays=[1])], zones=(1,)),
        ],
    )

    await coord.async_run_program("a")
    await _settle(coord)

    assert _started(hass) == ["a"]
    assert not getattr(coord.store.config, "pending_chained_starts", None)


async def test_an_offset_waits_and_is_recorded(monkeypatch, armed):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [], zones=(0,)),
            _program("b", [_after("a", offset_minutes=10)], zones=(1,)),
        ],
    )

    await coord.async_run_program("a")
    await _settle(coord)

    assert _started(hass) == ["a"]
    [(callback, when)] = armed.calls
    assert when == dt_util.utcnow() + timedelta(minutes=10)
    [pending] = coord.store.config.pending_chained_starts
    assert pending["program_id"] == "b"
    assert pending["after_program"] == "a"

    callback(when)
    await _settle(coord)

    assert _started(hass) == ["a", "b"]
    assert not coord.store.config.pending_chained_starts


async def test_a_waiting_start_survives_a_teardown_and_is_armed_again(
    monkeypatch, armed
):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [], zones=(0,)),
            _program("b", [_after("a", offset_minutes=10)], zones=(1,)),
        ],
    )
    await coord.async_run_program("a")
    await _settle(coord)
    record = list(coord.store.config.pending_chained_starts)

    coord.async_teardown_chained_starts()

    armed.unsubs[0].assert_called_once()
    assert coord.store.config.pending_chained_starts == record
    # The next start of the integration (a fresh coordinator) arms it again.
    _hass2, fresh = _chain(monkeypatch, [])
    fresh.store.config.programs = coord.store.config.programs
    fresh.store.config.pending_chained_starts = record
    await fresh.register_program_schedules()

    assert armed.calls[-1][1] == dt_util.parse_datetime(record[0]["due"])


async def test_a_start_missed_during_a_restart_is_caught_up_or_dropped(
    monkeypatch, armed
):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [], zones=(0,)),
            _program("b", [_after("a")], zones=(1,)),
            _program("c", [_after("a")], zones=(2,)),
        ],
    )
    now = dt_util.utcnow()
    coord.store.config.pending_chained_starts = [
        {
            "program_id": "b",
            "schedule_id": "schedule_1",
            "after_program": "a",
            "due": (now - timedelta(hours=1)).isoformat(),
        },
        {
            "program_id": "c",
            "schedule_id": "schedule_1",
            "after_program": "a",
            "due": (now - timedelta(hours=3)).isoformat(),
        },
    ]

    await coord.register_program_schedules()
    await _settle(coord)

    assert _started(hass) == ["b"]
    assert not coord.store.config.pending_chained_starts


async def test_a_start_whose_schedule_changed_while_it_waited_does_not_run(
    monkeypatch, armed
):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [], zones=(0,)),
            _program("x", [], zones=(2,)),
            _program("b", [_after("a", offset_minutes=10)], zones=(1,)),
        ],
    )
    await coord.async_run_program("a")
    await _settle(coord)
    [(callback, when)] = [c for c in armed.calls]
    coord.store.config.programs = normalize_programs(
        [
            _program("a", [], zones=(0,)),
            _program("x", [], zones=(2,)),
            _program("b", [_after("x", offset_minutes=10)], zones=(1,)),
        ]
    )

    callback(when)
    await _settle(coord)

    assert _started(hass) == ["a"]


async def test_a_loop_left_in_an_old_store_never_waters_round_and_round(
    monkeypatch, armed
):
    hass, coord = _chain(monkeypatch, [])
    coord.store.config.programs = normalize_programs(
        [_program("a", [_after("b")], zones=(0,)), _program("b", [_after("a")])]
    )

    await coord.async_run_program("a")
    await _settle(coord)

    assert _started(hass) == ["a"]


async def test_after_schedules_get_no_timer_of_their_own(monkeypatch, armed):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00"}], zones=(0,)),
            _program("b", [_after("a")], zones=(1,)),
        ],
    )

    await coord.register_program_schedules()

    assert [when for _, when in armed.calls] == [_utc(1, 6)]


# --- planning ------------------------------------------------------------------------


async def test_the_chained_run_is_planned_right_after_the_other_ends(monkeypatch):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00"}], zones=(0,)),
            _program("b", [_after("a", offset_minutes=10)], zones=(1,)),
            _program("c", [_after("b")], zones=(2,)),
        ],
    )

    planned = await coord.async_planning(1)

    first_day = [p for p in planned if p["start"] < _utc(2, 0).isoformat()]
    by_program = {p["program_id"]: p for p in first_day}
    # A waters five minutes from 06:00, B starts ten minutes after its end,
    # C right after B.
    assert by_program["a"]["start"] == _utc(1, 6).isoformat()
    assert by_program["b"]["start"] == _utc(1, 6, 15).isoformat()
    assert by_program["b"]["after"] == {
        "program_id": "a",
        "program": "A",
        "offset_minutes": 10,
        "held_back": False,
    }
    assert by_program["b"]["after_run"] == by_program["a"]["run_key"]
    assert by_program["c"]["start"] == _utc(1, 6, 20).isoformat()


async def test_a_chained_program_is_not_planned_without_its_predecessor(monkeypatch):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00", "enabled": False}], zones=(0,)),
            _program("b", [_after("a")], zones=(1,)),
        ],
    )

    assert await coord.async_planning(3) == []


async def test_a_run_that_will_not_water_still_has_the_next_one_planned(monkeypatch):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00"}], zones=(0,)),
            _program("b", [_after("a", offset_minutes=10)], zones=(1,)),
        ],
    )
    await coord.async_suspend(const.SUSPEND_PROGRAM, "a", hours=24)

    planned = await coord.async_planning(1)

    assert [p["program_id"] for p in planned] == ["a", "b"]
    assert planned[0]["skipped_reason"] == "suspended"
    # At A's planned moment plus the offset, not behind a run that never waters.
    assert planned[1]["start"] == _utc(1, 6, 10).isoformat()
    assert planned[1]["after"]["held_back"] is True
    assert "after_run" not in planned[1]
    assert sequence_planning(planned)[1]["start"] == _utc(1, 6, 10).isoformat()


async def test_the_planning_keeps_the_days_of_the_chained_schedule(monkeypatch):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00"}], zones=(0,)),
            _program("b", [_after("a", weekdays=[1])], zones=(1,)),
        ],
    )

    planned = await coord.async_planning(3)

    chained = [p for p in planned if p["program_id"] == "b"]
    # Only Tuesday 2 June.
    assert [p["start"][:10] for p in chained] == ["2026-06-02"]


async def test_the_overview_gives_the_chained_programs_next_start(monkeypatch):
    hass, coord = _chain(
        monkeypatch,
        [
            _program("a", [{"time": "06:00"}], zones=(0,)),
            _program("b", [_after("a", offset_minutes=10)], zones=(1,)),
        ],
    )

    overview = {p["program_id"]: p for p in await coord.async_program_overview()}

    assert overview["b"]["next_start"] == _utc(1, 6, 15).isoformat()


def test_the_sequence_moves_a_chained_run_behind_where_its_predecessor_ends():
    def item(program, start, end, **extra):
        data = {
            "program_id": program,
            "program": program.upper(),
            "schedule_id": "schedule_1",
            "start": start.isoformat(),
            "end": end.isoformat(),
            "steps": [{"zones": [{"zone_id": 0, "zone": "Lawn"}]}],
        }
        data["run_key"] = f"{program}:{data['start']}"
        data.update(extra)
        return data

    # X waters 05:55 to 06:10, A (06:00, five minutes) waits behind it, so
    # B, five minutes after A, starts at 06:20 rather than 06:10.
    x = item("x", _utc(1, 5, 55), _utc(1, 6, 10))
    a = item("a", _utc(1, 6), _utc(1, 6, 5))
    b = item(
        "b",
        _utc(1, 6, 10),
        _utc(1, 6, 15),
        after={"program_id": "a", "program": "A", "offset_minutes": 5},
        after_run=a["run_key"],
    )

    placed = {p["program_id"]: p for p in sequence_planning([b, a, x])}

    assert placed["a"]["expected_start"] == _utc(1, 6, 10).isoformat()
    assert placed["b"]["start"] == _utc(1, 6, 20).isoformat()
    assert placed["b"]["expected_end"] == _utc(1, 6, 25).isoformat()
    assert placed["b"]["waits_for"] is None


# --- the preview (YAML) and the assistant ------------------------------------------


async def test_the_preview_reads_a_program_by_name_and_says_what_is_refused(
    monkeypatch,
):
    hass, coord = _chain(
        monkeypatch,
        [_program("a", [_after("b")], zones=(0,)), _program("b", [], zones=(1,))],
    )

    by_name = await coord.async_program_preview(
        _program("c", [_after("A")], zones=(2,))
    )
    looping = await coord.async_program_preview(
        _program("b", [_after("a")], zones=(1,))
    )
    unknown = await coord.async_program_preview(
        _program("c", [_after("ghost")], zones=(2,))
    )

    assert by_name["program"]["schedules"][0]["after_program"] == "a"
    assert by_name["chain_loop"] is None
    assert by_name["unknown_after_programs"] == []
    assert looping["chain_loop"] == ["A", "B", "A"]
    assert unknown["unknown_after_programs"] == ["ghost"]


def _assistant(programs):
    store = SimpleNamespace(config=SimpleNamespace(programs=programs))
    coordinator = SimpleNamespace(store=store)

    async def update_config(data):
        check_program_chains(data[const.CONF_PROGRAMS], store.config.programs)
        store.config.programs = data[const.CONF_PROGRAMS]

    coordinator.async_update_config = AsyncMock(side_effect=update_config)
    hass = Mock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    return hass, coordinator


def _data(result):
    return getattr(result, "data", result)


async def test_the_assistant_cannot_delete_a_program_another_starts_after():
    from homeassistant.helpers import llm

    hass, coordinator = _assistant(
        _programs(_program("a", []), _program("b", [_after("a")]))
    )

    result = _data(
        await llm_config_tools.DeleteProgramTool().async_call(
            hass,
            llm.ToolInput(tool_name="DeleteProgram", tool_args={"program_id": "a"}),
            None,
        )
    )

    assert result["success"] is False
    assert '"B" starts after it' in result["error"]
    coordinator.async_update_config.assert_not_awaited()


async def test_the_assistant_is_told_when_a_save_would_loop():
    from homeassistant.helpers import llm

    hass, coordinator = _assistant(
        _programs(_program("a", []), _program("b", [_after("a")]))
    )
    looping = _programs(_program("a", [_after("b")]))[0]
    coordinator.async_program_preview = AsyncMock(
        return_value={
            "program": looping,
            "timeline": {"total": 0, "zones": [], "segments": []},
            "unknown_zones": [],
            "unknown_zone_names": [],
            "zones_not_watered": [],
        }
    )

    result = _data(
        await llm_config_tools.SaveProgramTool().async_call(
            hass,
            llm.ToolInput(tool_name="SaveProgram", tool_args={"program": {"id": "a"}}),
            None,
        )
    )

    assert result["success"] is False
    assert "loop" in result["error"]
