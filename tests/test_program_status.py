"""The live state, the overview and the planning of the programs."""

import asyncio
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock
from zoneinfo import ZoneInfo

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_scheduler import ProgramSchedulerMixin
from custom_components.smart_irrigation.programs import normalize_programs
from tests.runner_doubles import Coordinator, make_hass, make_store, zone

PARIS = ZoneInfo("Europe/Paris")
UTC = timezone.utc


class Status(ProgramSchedulerMixin, Coordinator):
    def _sun_moment(self, event, day):
        hour = 7 if event == "sunrise" else 20
        return datetime(day.year, day.month, day.day, hour, 30, tzinfo=PARIS)


def _utc(day, hour, minute=0):
    return datetime(2026, 6, day, hour, minute, tzinfo=PARIS).astimezone(UTC)


def _program(schedules, **overrides):
    data = {
        "id": "evening",
        "name": "Evening",
        "steps": [{"zones": [0]}, {"zones": [1]}],
        "schedules": schedules,
    }
    data.update(overrides)
    return data


@pytest.fixture(autouse=True)
def _paris_clock(freezer, monkeypatch):
    previous = dt_util.DEFAULT_TIME_ZONE
    dt_util.set_default_time_zone(PARIS)
    freezer.move_to("2026-06-01 03:00:00+00:00")  # 05:00 in Paris
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )
    yield
    dt_util.set_default_time_zone(previous)


def _status(programs, **kwargs):
    hass = make_hass()
    store = make_store([zone(0), zone(1)], **kwargs)
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
    coord = Status(hass, store)
    coord._notify_programs = lambda: None
    return hass, coord


async def test_the_planning_lists_every_start_over_the_next_days():
    hass, coord = _status(
        [_program([{"time": "06:00"}, {"time": "20:00", "weekdays": [0]}])]
    )

    planned = await coord.async_planning(3)

    assert [p["start"] for p in planned] == [
        _utc(1, 6).isoformat(),
        _utc(1, 20).isoformat(),
        _utc(2, 6).isoformat(),
        _utc(3, 6).isoformat(),
    ]
    first = planned[0]
    assert first["program_id"] == "evening"
    assert first["steps"][0]["zones"] == [
        {"zone_id": 0, "zone": "Zone 0", "seconds": 300, "expected_seconds": 300}
    ]
    # Two steps of five minutes, one after the other.
    assert first["end"] == (_utc(1, 6) + timedelta(seconds=600)).isoformat()


async def test_a_run_to_be_done_by_a_moment_is_planned_from_its_start():
    hass, coord = _status([_program([{"time": "07:00", "anchor": "end"}])])

    [first, *_] = await coord.async_planning(3)

    assert first["start"] == _utc(1, 6, 50).isoformat()
    assert first["target"] == _utc(1, 7).isoformat()
    assert first["anchor"] == "end"


async def test_the_planning_leaves_out_the_main_program_and_disabled_ones():
    hass, coord = _status(
        [
            {"id": "main"},
            _program([{"time": "06:00"}], enabled=False),
        ]
    )

    assert await coord.async_planning(3) == []


async def test_the_planning_is_empty_when_the_controller_is_off():
    hass, coord = _status([_program([{"time": "06:00"}])])
    coord.store.config.full_controller = False

    assert await coord.async_planning(3) == []
    assert await coord.async_program_overview() == []


async def test_the_overview_gives_each_programs_state_and_next_start():
    hass, coord = _status(
        [
            {"id": "main"},
            _program([{"time": "06:00"}]),
            _program([{"time": "06:00"}], id="off", name="Off", enabled=False),
            _program([{"time": "06:00"}], id="away", name="Away"),
        ]
    )
    await coord.async_suspend(const.SUSPEND_PROGRAM, "away", hours=48)

    overview = {p["program_id"]: p for p in await coord.async_program_overview()}

    assert overview["main"]["state"] == "idle"
    assert overview["evening"]["state"] == "idle"
    assert overview["evening"]["next_start"] == _utc(1, 6).isoformat()
    assert overview["off"]["state"] == "disabled"
    assert overview["away"]["state"] == "suspended"
    assert overview["away"]["suspended_until"] is not None


async def test_the_overview_remembers_the_last_run():
    hass, coord = _status([_program([{"time": "06:00"}])])
    coord.store.config.program_last_runs = {
        "evening:schedule_1": _utc(1, 6).isoformat()
    }

    [_, overview] = [None, *await coord.async_program_overview()]

    assert overview["last_run"] == _utc(1, 6).isoformat()
    # The one that ran is not the next one.
    assert overview["next_start"] == _utc(2, 6).isoformat()


async def test_the_live_state_says_where_a_running_program_is(monkeypatch):
    hass, coord = _status([_program([])])
    seen = {}

    async def _look(seconds, *args, **kwargs):
        if "state" not in seen:
            seen["state"] = coord.async_live_state()
            seen["overview"] = await coord.async_program_overview()

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _look
    )

    await coord.async_run_program("evening")

    live = seen["state"]["programs"][0]
    assert (live["program_id"], live["state"]) == ("evening", "running")
    assert (live["step"], live["steps"]) == (1, 2)
    assert (live["tour"], live["tours"]) == (1, 1)
    assert [v["zone_id"] for v in seen["state"]["valves"]] == [0]
    assert seen["overview"][0]["state"] == "running"
    # And nothing is left once it is over.
    assert coord.async_live_state()["programs"] == []


async def test_a_program_waiting_for_its_turn_is_waiting(monkeypatch):
    first = _program([], id="first", name="First", steps=[{"zones": [0]}])
    second = _program([], id="second", name="Second", steps=[{"zones": [1]}])
    hass, coord = _status([first, second])
    seen = {}

    async def _look(seconds, *args, **kwargs):
        if "states" not in seen:
            seen["states"] = {
                p["program_id"]: p["state"]
                for p in coord.async_live_state()["programs"]
            }

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _look
    )

    await asyncio.gather(
        coord.async_run_program("first"), coord.async_run_program("second")
    )

    assert seen["states"] == {"first": "running", "second": "waiting"}


async def test_a_pause_shows_in_the_live_state(monkeypatch):
    hass, coord = _status([_program([])])

    await coord.async_pause_watering()

    assert coord.async_live_state()["paused"] is True
    await coord.async_resume_watering()
    assert coord.async_live_state()["paused"] is False
