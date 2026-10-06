"""The hard deadline of a run (C4), and the pause and the queue across a restart (A3)."""

import asyncio
from datetime import timedelta

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_runner import order_driest_first
from custom_components.smart_irrigation.schedules import normalize_schedule
from tests.runner_doubles import REAL_SLEEP
from tests.test_manual_runs import _hold
from tests.test_program_runner import _events, _log, _program
from tests.test_watering_control import (
    _settle,
    _silence_dispatcher,  # noqa: F401
)
from tests.test_watering_control import _setup as _base_setup


def _setup(monkeypatch, programs, zone_ids=(0, 1, 2)):
    hass, coord, sleeps = _base_setup(monkeypatch, programs, zone_ids=zone_ids)
    # The records a restart reads.
    coord.store.config.pause_until = None
    coord.store.config.queued_manual_runs = None
    return hass, coord, sleeps


def _two_steps():
    return _program(steps=[{"zones": [0]}, {"zones": [1]}])


# --- C4: the schedule flag ------------------------------------------------------------


def test_the_flag_is_kept_only_on_a_schedule_that_must_be_done_by_its_moment():
    kept = normalize_schedule({"anchor": "end", "hard_deadline": True}, set())
    assert kept[const.SCHEDULE_HARD_DEADLINE] is True
    # A start-anchored schedule has no end to hold: the flag is dropped.
    assert const.SCHEDULE_HARD_DEADLINE not in normalize_schedule(
        {"anchor": "start", "hard_deadline": True}, set()
    )
    # Off, or truthy but not true: not stored, so the schedule is what it was.
    assert const.SCHEDULE_HARD_DEADLINE not in normalize_schedule(
        {"anchor": "end"}, set()
    )
    assert const.SCHEDULE_HARD_DEADLINE not in normalize_schedule(
        {"anchor": "end", "hard_deadline": "yes"}, set()
    )


# --- C4: the order of the zones ---------------------------------------------------------


def test_the_zones_of_a_step_are_ordered_driest_first_and_steps_keep_theirs():
    member = lambda z: {"zone_id": z, "seconds": 60, "passes": 1}  # noqa: E731
    plan = [
        [
            {"id": "a", "zones": [member(0), member(1), member(2)]},
            {"id": "b", "zones": [member(0)]},
        ]
    ]
    zones = [
        {const.ZONE_ID: 0, const.ZONE_BUCKET: -1.0},
        {const.ZONE_ID: 1, const.ZONE_BUCKET: -9.0},
        {const.ZONE_ID: 2, const.ZONE_BUCKET: -4.0},
    ]

    ordered = order_driest_first(plan, zones)

    assert [s["id"] for s in ordered[0]] == ["a", "b"]
    assert [m["zone_id"] for m in ordered[0][0]["zones"]] == [1, 2, 0]
    # The plan it was given is left alone.
    assert [m["zone_id"] for m in plan[0][0]["zones"]] == [0, 1, 2]


async def test_a_run_with_a_deadline_opens_the_driest_zone_of_a_step_first(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program(steps=[{"zones": [0, 1, 2]}])])
    coord.store.by_id[0][const.ZONE_BUCKET] = -1.0
    coord.store.by_id[1][const.ZONE_BUCKET] = -9.0
    coord.store.by_id[2][const.ZONE_BUCKET] = -4.0

    await coord.async_run_program(
        "evening", deadline=dt_util.utcnow() + timedelta(hours=2)
    )

    opened = [i for i in _log(hass) if i.endswith(" on")]
    assert opened == ["zone_1 on", "zone_2 on", "zone_0 on"]


async def test_a_run_without_a_deadline_keeps_the_order_of_the_step(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program(steps=[{"zones": [0, 1, 2]}])])
    coord.store.by_id[1][const.ZONE_BUCKET] = -9.0

    await coord.async_run_program("evening")

    opened = [i for i in _log(hass) if i.endswith(" on")]
    assert opened == ["zone_0 on", "zone_1 on", "zone_2 on"]


# --- C4: the cut -------------------------------------------------------------------------


async def test_a_run_that_ends_before_its_deadline_is_not_cut(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_two_steps()])

    await coord.async_run_program(
        "evening", deadline=dt_util.utcnow() + timedelta(hours=2)
    )

    [finished] = _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert "cut" not in finished and "reason" not in finished
    assert finished["stopped"] is False
    assert [z["zone_id"] for z in finished["zones"]] == [0, 1]
    assert coord._program_registry() == {}


async def test_the_deadline_cuts_the_open_zone_and_starts_no_other(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, [_two_steps()])
    gate = _hold(sleeps, 300)
    run = asyncio.ensure_future(
        coord.async_run_program(
            "evening", deadline=dt_util.utcnow() + timedelta(hours=2)
        )
    )
    await _settle()

    await coord._cut_at_deadline(coord._program_registry()["evening"])
    gate.set()
    await asyncio.wait_for(run, 5)

    log = _log(hass)
    assert "zone_0 off" in log
    assert "zone_1 on" not in log
    [finished] = _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert finished["cut"] is True
    assert finished["reason"] == const.CUT_REASON_DEADLINE
    assert finished["stopped"] is True
    # What the zone delivered is credited, as for any stop.
    assert [z["zone_id"] for z in finished["zones"]] == [0]
    assert coord._program_registry() == {}


async def test_a_late_run_is_cut_between_steps_when_the_time_has_gone(
    monkeypatch, freezer
):
    hass, coord, sleeps = _setup(monkeypatch, [_two_steps()])
    deadline = dt_util.utcnow() + timedelta(seconds=400)

    async def _time_passes():
        freezer.tick(timedelta(seconds=500))

    sleeps.on(300, _time_passes)

    await coord.async_run_program("evening", deadline=deadline)

    assert "zone_0 off" in _log(hass)
    assert "zone_1 on" not in _log(hass)
    [finished] = _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert finished["cut"] is True and finished["reason"] == "deadline"


async def test_a_run_whose_deadline_has_passed_before_its_turn_opens_nothing(
    monkeypatch,
):
    hass, coord, _ = _setup(monkeypatch, [_two_steps()])

    await coord.async_run_program(
        "evening", deadline=dt_util.utcnow() - timedelta(seconds=1)
    )

    assert _log(hass) == []
    [finished] = _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert finished["cut"] is True and finished["reason"] == "deadline"
    assert finished["zones"] == []
    assert _events(hass, const.EVENT_PROGRAM_STARTED) == []


async def test_the_deadline_is_kept_in_the_record_of_the_run(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, [_two_steps()])
    deadline = dt_util.utcnow() + timedelta(hours=2)
    seen = {}

    async def _look():
        seen["record"] = coord.store.config.active_program_run

    sleeps.on(300, _look)

    await coord.async_run_program("evening", deadline=deadline)

    assert dt_util.parse_datetime(seen["record"]["deadline"]) == deadline


async def test_a_run_without_a_deadline_has_none_in_its_record(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, [_two_steps()])
    seen = {}

    async def _look():
        seen["record"] = coord.store.config.active_program_run

    sleeps.on(300, _look)

    await coord.async_run_program("evening")

    assert "deadline" not in seen["record"]


# --- A3: the pause --------------------------------------------------------------------------


async def test_a_pause_is_recorded_with_its_end_and_forgotten_at_the_resume(
    monkeypatch, freezer
):
    hass, coord, sleeps = _setup(monkeypatch, [_two_steps()])
    _hold(sleeps, 600)

    await coord.async_pause_watering(10)

    assert (
        coord.store.config.pause_until
        == (dt_util.utcnow() + timedelta(minutes=10)).isoformat()
    )

    await coord.async_resume_watering()

    assert coord.store.config.pause_until is None
    await asyncio.gather(*list(hass.created), return_exceptions=True)


async def test_the_pause_is_not_recorded_when_the_full_controller_is_off(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, [_two_steps()])
    coord.store.config.full_controller = False
    _hold(sleeps, 600)

    await coord.async_pause_watering(10)

    assert coord.store.config.pause_until is None
    await coord.async_resume_watering()
    await asyncio.gather(*list(hass.created), return_exceptions=True)


async def test_a_pause_still_ahead_is_held_again_after_a_restart(monkeypatch, freezer):
    hass, coord, sleeps = _setup(monkeypatch, [_two_steps()])
    gate = _hold(sleeps, 600)
    coord.store.config.pause_until = (
        dt_util.utcnow() + timedelta(minutes=10)
    ).isoformat()

    await coord.async_restore_pause_and_queue()

    assert coord.watering_paused() is True
    # The valves that were open are not reopened by the pause.
    assert hass.calls == []
    # A run asked for now waits for the resume.
    task = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    assert [i for i in _log(hass) if i.endswith(" on")] == []

    await coord.async_resume_watering()
    gate.set()
    await asyncio.wait_for(task, 5)

    assert [i for i in _log(hass) if i.endswith(" on")] == ["zone_0 on", "zone_1 on"]
    assert coord.store.config.pause_until is None
    await asyncio.gather(*list(hass.created), return_exceptions=True)


async def test_a_pause_that_ended_during_the_restart_is_forgotten(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_two_steps()])
    coord.store.config.pause_until = (
        dt_util.utcnow() - timedelta(minutes=1)
    ).isoformat()

    await coord.async_restore_pause_and_queue()

    assert coord.watering_paused() is False
    assert coord.store.config.pause_until is None


async def test_nothing_is_restored_when_the_full_controller_is_off(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_two_steps()])
    coord.store.config.full_controller = False
    coord.store.config.pause_until = (
        dt_util.utcnow() + timedelta(minutes=10)
    ).isoformat()
    coord.store.config.queued_manual_runs = [
        {
            "program_id": "evening",
            "seconds": None,
            "requested": dt_util.utcnow().isoformat(),
        }
    ]

    await coord.async_restore_pause_and_queue()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert coord.watering_paused() is False
    assert hass.calls == []


# --- A3: the queue of manual runs -----------------------------------------------------------


def _night():
    return _program(id="night", name="Night", steps=[{"zones": [2]}])


async def test_a_manual_run_waiting_for_its_turn_is_recorded_and_forgotten(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, [_two_steps(), _night()])
    gate = _hold(sleeps, 300)
    first = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    # The run that has its turn is not in the queue.
    assert not coord.store.config.queued_manual_runs

    second = asyncio.ensure_future(coord.async_run_program("night", seconds=120))
    await _settle()

    [queued] = coord.store.config.queued_manual_runs
    assert queued["program_id"] == "night"
    assert queued["seconds"] == 120
    assert dt_util.parse_datetime(queued["requested"]) is not None

    gate.set()
    await asyncio.wait_for(asyncio.gather(first, second), 5)

    assert coord.store.config.queued_manual_runs == []


async def test_a_waiting_run_that_is_stopped_leaves_the_queue_record(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, [_two_steps(), _night()])
    gate = _hold(sleeps, 300)
    first = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    second = asyncio.ensure_future(coord.async_run_program("night"))
    await _settle()
    assert coord.store.config.queued_manual_runs

    assert await coord.async_stop_program("night") == "dequeued"
    gate.set()
    await asyncio.wait_for(asyncio.gather(first, second), 5)

    assert coord.store.config.queued_manual_runs == []


async def test_a_scheduled_run_waiting_is_not_recorded(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, [_two_steps(), _night()])
    gate = _hold(sleeps, 300)
    first = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    second = asyncio.ensure_future(coord.async_run_program("night", manual=False))
    await _settle()

    assert not coord.store.config.queued_manual_runs

    gate.set()
    await asyncio.wait_for(asyncio.gather(first, second), 5)


async def test_a_reload_keeps_the_queue_record(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, [_two_steps(), _night()])
    _hold(sleeps, 300)
    first = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    second = asyncio.ensure_future(coord.async_run_program("night"))
    await _settle()

    # What the teardown does: the tasks are cancelled, not stopped.
    first.cancel()
    second.cancel()
    await asyncio.gather(first, second, return_exceptions=True)

    [queued] = coord.store.config.queued_manual_runs
    assert queued["program_id"] == "night"


async def test_the_queued_runs_are_put_back_in_line_after_a_restart(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_two_steps(), _night()])
    coord.store.config.queued_manual_runs = [
        {
            "program_id": "night",
            "seconds": 90,
            "requested": (dt_util.utcnow() - timedelta(hours=1)).isoformat(),
        }
    ]

    await coord.async_restore_pause_and_queue()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert [i for i in _log(hass) if i.endswith(" on")] == ["zone_2 on"]
    assert "wait 90" in _log(hass)
    [started] = _events(hass, const.EVENT_PROGRAM_STARTED)
    assert started["program_id"] == "night" and started["manual"] is True
    assert coord.store.config.queued_manual_runs == []


async def test_old_queued_runs_and_runs_of_a_gone_program_are_dropped(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_two_steps(), _night()])
    now = dt_util.utcnow()
    coord.store.config.queued_manual_runs = [
        {
            "program_id": "night",
            "seconds": None,
            "requested": (now - timedelta(hours=7)).isoformat(),
        },
        {"program_id": "deleted", "seconds": None, "requested": now.isoformat()},
        {"program_id": "evening", "seconds": None, "requested": "garbage"},
        "not a record",
    ]

    await coord.async_restore_pause_and_queue()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert hass.calls == []
    assert coord.store.config.queued_manual_runs == []


async def test_the_queue_waits_for_the_program_resumed_after_the_restart(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_two_steps(), _night()])
    member = lambda z: {"zone_id": z, "seconds": 300, "passes": 1}  # noqa: E731
    coord.store.config.active_program_run = {
        "program_id": "evening",
        "name": "Evening",
        "manual": False,
        "plan": [[{"id": "a", "zones": [member(0)], "delay": 0}]],
        "tour": 0,
        "step": 0,
        "started_zones": [],
        "started": dt_util.utcnow().isoformat(),
    }
    coord.store.config.queued_manual_runs = [
        {
            "program_id": "night",
            "seconds": None,
            "requested": dt_util.utcnow().isoformat(),
        }
    ]

    await coord.async_restore_pause_and_queue()
    await coord.async_resume_valve_runs()
    for _ in range(200):
        if len(_events(hass, const.EVENT_PROGRAM_FINISHED)) == 2:
            break
        await REAL_SLEEP(0)

    started = [e["program_id"] for e in _events(hass, const.EVENT_PROGRAM_STARTED)]
    assert started == ["evening", "night"]
    await asyncio.gather(*list(hass.created), return_exceptions=True)


@pytest.mark.parametrize("saved", [None, []])
async def test_nothing_queued_means_nothing_started(monkeypatch, saved):
    hass, coord, _ = _setup(monkeypatch, [_two_steps()])
    coord.store.config.queued_manual_runs = saved

    await coord.async_restore_pause_and_queue()

    assert hass.created == []
