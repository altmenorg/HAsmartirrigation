# ruff: noqa: F811
"""Fixes from the review of the full controller: restarts, edits, input, ids.

Every case here used to go wrong quietly: a counter reset for a run that never
started, a program lost to a second crash, a deleted program still watering, a
typo that lifted a suspension, a new schedule that inherited an old one's run.
"""

import asyncio
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from zoneinfo import ZoneInfo

import homeassistant.util.dt as dt_util
import pytest
import voluptuous as vol
from homeassistant.exceptions import ServiceValidationError
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.programs import (
    MAIN_PROGRAM_ID,
    normalize_programs,
)
from custom_components.smart_irrigation.schedules import (
    next_fire,
    normalize_schedules,
)
from custom_components.smart_irrigation.service_handlers import ServiceHandlersMixin
from custom_components.smart_irrigation.store import Config, SmartIrrigationStorage
from custom_components.smart_irrigation.watering_control import (
    PAUSE_WATERING_SCHEMA,
    SUSPEND_SCHEMA,
    WATER_ZONE_SCHEMA,
)
from tests.runner_doubles import Coordinator
from tests.test_program_runner import (  # noqa: F401
    LoggedSleeps,
    _events,
    _log,
    _program,
    _setup,
    _silence_dispatcher,
)
from tests.test_program_scheduler import (  # noqa: F401
    Armed,
    Scheduler,
    _paris_clock,
    _utc,
    armed,
)
from tests.test_program_scheduler import _program as _scheduled_program

PARIS = ZoneInfo("Europe/Paris")
UTC = timezone.utc


def _record(plan, tour=0, step=0, started=()):
    return {
        "program_id": "evening",
        "name": "Evening",
        "manual": False,
        "plan": plan,
        "tour": tour,
        "step": step,
        "started_zones": list(started),
        "started": dt_util.utcnow().isoformat(),
    }


def _member(zone_id):
    return {"zone_id": zone_id, "seconds": 300, "passes": 1}


def _one_step_plan(*zone_ids):
    return [[{"id": "a", "zones": [_member(z) for z in zone_ids], "delay": 0}]]


def _config_writes(coord):
    """Every value written for the active program run, in order."""
    return [
        call.args[0][const.CONF_ACTIVE_PROGRAM_RUN]
        for call in coord.store.async_update_config.await_args_list
        if const.CONF_ACTIVE_PROGRAM_RUN in call.args[0]
    ]


# --- 2: the day is counted when something starts ------------------------------


async def test_a_second_schedule_while_the_program_runs_counts_nothing(armed):
    scheduler = Scheduler([_scheduled_program([{"time": "06:00"}])])
    scheduler._program_registry = lambda: {"evening": object()}

    await scheduler._fire_program_schedule("evening", "schedule_1", _utc(1, 6))

    scheduler.async_run_program.assert_not_awaited()
    scheduler._prepare_watering_for_today.assert_not_awaited()
    scheduler._note_watering_day.assert_not_awaited()
    # The occurrence itself is still spent.
    assert scheduler.store.config.program_last_runs["evening:schedule_1"]


async def test_the_run_counts_the_day_only_for_the_zones_that_start(monkeypatch):
    hass, coord, _ = _setup(
        monkeypatch, [_program(steps=[{"zones": [0]}, {"zones": [1]}])]
    )
    coord.store.config.suspensions = {
        "zone:0": (dt_util.utcnow() + timedelta(hours=5)).isoformat()
    }
    noted = []

    async def _note(zone_ids):
        noted.append(zone_ids)

    assert await coord.async_run_program("evening", manual=False, note_day=_note)

    # Zone 0 is suspended and never opens, so it is not marked as watered.
    assert noted == [{1}]
    assert [i for i in _log(hass) if i.endswith(" on")] == ["zone_1 on"]


async def test_a_program_asked_twice_counts_the_day_once(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program()])
    noted = []

    async def _note(zone_ids):
        noted.append(zone_ids)

    first, second = await asyncio.gather(
        coord.async_run_program("evening", manual=False, note_day=_note),
        coord.async_run_program("evening", manual=False, note_day=_note),
    )

    assert (first, second) == (True, False)
    assert noted == [{0}]


async def test_a_program_with_nothing_to_water_counts_no_day(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program()], zone_ids=(0,))
    coord.store.by_id[0][const.ZONE_DURATION] = 0
    noted = []

    async def _note(zone_ids):
        noted.append(zone_ids)

    await coord.async_run_program("evening", manual=False, note_day=_note)

    assert noted == []


# --- 3, 4: the resume ----------------------------------------------------------


async def test_the_record_stays_until_the_first_step_writes_it_again(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program(steps=[{"zones": [0]}])])
    coord.store.config.active_program_run = _record(_one_step_plan(0, 1), step=0)

    await coord.async_resume_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    writes = _config_writes(coord)
    # Never emptied before the step re-saved it; emptied at the very end.
    assert writes[0] is not None
    assert writes[-1] is None


@pytest.mark.parametrize("case", ["deleted", "disabled", "suspended", "controller_off"])
async def test_a_program_that_may_no_longer_run_is_not_resumed(monkeypatch, case):
    hass, coord, _ = _setup(monkeypatch, [_program()])
    config = coord.store.config
    if case == "deleted":
        config.programs = normalize_programs([])
    elif case == "disabled":
        config.programs = normalize_programs([_program(enabled=False)])
    elif case == "suspended":
        config.suspensions = {
            "program:evening": (dt_util.utcnow() + timedelta(hours=2)).isoformat()
        }
    else:
        config.full_controller = False
    config.active_program_run = _record(_one_step_plan(0, 1))

    await coord.async_resume_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert _log(hass) == []
    assert _events(hass, const.EVENT_PROGRAM_STARTED) == []
    assert _events(hass, const.EVENT_PROGRAM_FINISHED) == []
    assert _config_writes(coord)[-1] is None


async def test_nothing_is_announced_when_the_last_step_was_the_interrupted_one(
    monkeypatch,
):
    hass, coord, _ = _setup(monkeypatch, [_program()])
    coord.store.config.active_program_run = _record(
        _one_step_plan(0), step=0, started=[0]
    )

    await coord.async_resume_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert _log(hass) == []
    assert _events(hass, const.EVENT_PROGRAM_STARTED) == []
    assert _events(hass, const.EVENT_PROGRAM_FINISHED) == []
    assert _config_writes(coord)[-1] is None


async def test_the_last_step_of_a_tour_goes_on_with_the_next_tour(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program(tours=2)])
    plan = [_one_step_plan(0)[0], _one_step_plan(1)[0]]
    coord.store.config.active_program_run = _record(plan, tour=0, step=0, started=[0])

    await coord.async_resume_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert [i for i in _log(hass) if i.endswith(" on")] == ["zone_1 on"]


# --- 5: a running program stops when it may no longer run ----------------------


@pytest.mark.parametrize("case", ["deleted", "disabled", "suspended"])
async def test_a_running_program_stops_before_its_next_step(monkeypatch, case):
    program = _program(steps=[{"zones": [0]}, {"zones": [1]}])
    hass, coord, sleeps = _setup(monkeypatch, [program])

    async def _change():
        config = coord.store.config
        if case == "deleted":
            config.programs = normalize_programs([])
        elif case == "disabled":
            config.programs = normalize_programs([_program(enabled=False)])
        else:
            config.suspensions = {
                "program:evening": (dt_util.utcnow() + timedelta(hours=2)).isoformat()
            }

    sleeps.on(300, _change)

    await coord.async_run_program("evening")

    assert [i for i in _log(hass) if i.endswith(" on")] == ["zone_0 on"]
    [finished] = _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert finished["stopped"] is True


# --- 6: input ------------------------------------------------------------------


class Handlers(ServiceHandlersMixin, Coordinator):
    """The service handlers on top of the runner's test coordinator."""


def _handlers(monkeypatch, programs=()):
    hass, coord, _ = _setup(monkeypatch, list(programs))
    handlers = Handlers(hass, coord.store)
    return hass, handlers


def _call(**data):
    return SimpleNamespace(data=data)


@pytest.mark.parametrize("minutes", ["abc", "1e999", float("nan"), float("inf"), True])
async def test_a_pause_with_a_bad_length_is_refused(monkeypatch, minutes):
    hass, handlers = _handlers(monkeypatch)

    with pytest.raises(ServiceValidationError):
        await handlers.handle_pause_watering(_call(minutes=minutes))
    with pytest.raises(vol.Invalid):
        PAUSE_WATERING_SCHEMA({"minutes": minutes})

    assert not handlers.watering_paused()


@pytest.mark.parametrize("hours", ["abc", "1e9", 1e9, float("inf"), float("nan"), -5])
async def test_a_suspension_with_bad_hours_is_refused_and_lifts_nothing(
    monkeypatch, hours
):
    hass, handlers = _handlers(monkeypatch, [_program()])
    until = (dt_util.utcnow() + timedelta(hours=5)).isoformat()
    handlers.store.config.suspensions = {"program:evening": until}

    with pytest.raises(ServiceValidationError):
        await handlers.handle_suspend(_call(program_id="evening", hours=hours))
    with pytest.raises(vol.Invalid):
        SUSPEND_SCHEMA({"program_id": "evening", "hours": hours})

    handlers.store.async_update_config.assert_not_awaited()
    assert handlers.store.config.suspensions == {"program:evening": until}


async def test_an_unparsable_until_never_lifts_a_suspension(monkeypatch):
    hass, handlers = _handlers(monkeypatch, [_program()])
    until = (dt_util.utcnow() + timedelta(hours=5)).isoformat()
    handlers.store.config.suspensions = {"program:evening": until}

    with pytest.raises(ServiceValidationError):
        await handlers.handle_suspend(_call(program_id="evening", until="tomorrow"))
    with pytest.raises(ServiceValidationError):
        await handlers.async_suspend("program", "evening", until="nonsense")
    with pytest.raises(vol.Invalid):
        SUSPEND_SCHEMA({"until": "nonsense"})

    handlers.store.async_update_config.assert_not_awaited()


async def test_a_suspension_for_a_program_that_does_not_exist_is_ignored(monkeypatch):
    hass, handlers = _handlers(monkeypatch, [_program()])

    await handlers.handle_suspend(_call(program_id="eveninng", hours=24))

    handlers.store.async_update_config.assert_not_awaited()


async def test_a_good_suspension_is_still_recorded_and_lifted(monkeypatch):
    hass, handlers = _handlers(monkeypatch, [_program()])

    await handlers.handle_suspend(_call(program_id="evening", hours="48"))
    written = handlers.store.async_update_config.await_args.args[0]
    assert "program:evening" in written[const.CONF_SUSPENSIONS]

    handlers.store.config.suspensions = written[const.CONF_SUSPENSIONS]
    await handlers.handle_suspend(_call(program_id="evening", hours=0))
    written = handlers.store.async_update_config.await_args.args[0]
    assert written[const.CONF_SUSPENSIONS] == {}


@pytest.mark.parametrize("seconds", ["abc", "1e999", 0, -3, 10**9, float("nan")])
async def test_water_zone_with_bad_seconds_is_refused_before_a_task_exists(
    monkeypatch, seconds
):
    hass, handlers = _handlers(monkeypatch, [_program()])
    from tests.runner_doubles import set_state

    set_state(hass, "sensor.zone_0", "1", attributes={const.ZONE_ID: 0})

    with pytest.raises(ServiceValidationError):
        await handlers.handle_water_zone(
            _call(entity_id=["sensor.zone_0"], seconds=seconds)
        )
    with pytest.raises(vol.Invalid):
        WATER_ZONE_SCHEMA({"seconds": seconds})

    assert hass.created == []


def test_the_schemas_accept_what_the_ui_sends():
    assert PAUSE_WATERING_SCHEMA({"minutes": 30}) == {"minutes": 30.0}
    assert PAUSE_WATERING_SCHEMA({}) == {}
    assert SUSPEND_SCHEMA({"program_id": "a", "hours": 48})["hours"] == 48.0
    assert SUSPEND_SCHEMA({"until": "2030-01-01T10:00:00+00:00"})
    assert WATER_ZONE_SCHEMA({"seconds": 600, "entity_id": ["sensor.a"]})


def test_an_infinite_number_in_a_schedule_falls_back_to_the_default():
    [schedule] = normalize_schedules(
        [{"offset_minutes": "1e999", "every_n_days": "Infinity"}]
    )

    assert schedule[const.SCHEDULE_OFFSET_MINUTES] == 0
    assert schedule[const.SCHEDULE_EVERY_N_DAYS] == 1


# --- 7: end-anchored schedules --------------------------------------------------


def _schedule(**overrides):
    [schedule] = normalize_schedules([{"anchor": "end", **overrides}])
    return schedule


def _sun(event, day):
    return datetime(day.year, day.month, day.day, 7, 30, tzinfo=PARIS)


def _local(year, month, day, hour=0, minute=0):
    return datetime(year, month, day, hour, minute, tzinfo=PARIS).astimezone(UTC)


def test_the_days_of_an_end_anchored_schedule_are_the_days_it_ends_on():
    """Done by Monday 01:00: it starts on Sunday evening, and Monday is the day."""
    schedule = _schedule(time="01:00", weekdays=[0])  # Monday
    now = _local(2026, 6, 3, 12)  # Wednesday

    found = next_fire(schedule, now, 2 * 3600, None, _sun, PARIS)

    assert found["target"] == _local(2026, 6, 8, 1)  # Monday 8 June
    assert found["fire"] == _local(2026, 6, 7, 23)  # Sunday evening
    assert found["catch_up"] is False


def test_a_sunday_only_end_anchored_schedule_does_not_start_on_saturday():
    schedule = _schedule(time="01:00", weekdays=[6])  # Sunday
    now = _local(2026, 6, 3, 12)

    found = next_fire(schedule, now, 2 * 3600, None, _sun, PARIS)

    # Sunday 7 June at 01:00, so it starts on Saturday night: the day filter
    # looks at where the run ends.
    assert found["target"] == _local(2026, 6, 7, 1)
    assert found["fire"] == _local(2026, 6, 6, 23)


def test_a_run_that_crosses_midnight_is_found_on_the_evening_before():
    schedule = _schedule(time="00:30")
    now = _local(2026, 6, 3, 23, 40)

    found = next_fire(schedule, now, 3600, None, _sun, PARIS)

    # Due by 00:30 tomorrow, started at 23:30 today: it has begun, in time.
    assert found["target"] == _local(2026, 6, 4, 0, 30)
    assert found["catch_up"] is True


def test_the_day_the_clock_goes_forward_still_ends_on_time():
    """Spring forward, 29 March 2026: 02:00 becomes 03:00 in Paris."""
    schedule = _schedule(time="06:00")
    now = _local(2026, 3, 28, 12)

    found = next_fire(schedule, now, 2 * 3600, None, _sun, PARIS)

    assert found["target"] == _local(2026, 3, 29, 6)
    # Two hours of water before 06:00 summer time, however long the night was.
    assert found["target"] - found["fire"] == timedelta(hours=2)


async def test_the_weather_is_judged_when_the_run_starts(armed, freezer):
    """A Monday 01:00 run started on Sunday evening asks the gate at that moment."""
    freezer.move_to("2026-06-07 21:00:00+00:00")  # Sunday 23:00 in Paris
    scheduler = Scheduler(
        [_scheduled_program([{"time": "01:00", "anchor": "end", "weekdays": [0]}])]
    )
    seen = []

    async def _gate(name, data):
        seen.append(dt_util.now().date())
        return True, set()

    scheduler._prepare_watering_for_today = _gate

    await scheduler._fire_program_schedule("evening", "schedule_1", _utc(8, 1))

    assert seen == [datetime(2026, 6, 7).date()]
    scheduler.async_run_program.assert_awaited_once()


# --- 8: catching up -------------------------------------------------------------


async def test_an_edit_does_not_turn_an_end_anchored_run_into_a_catch_up(
    armed, freezer
):
    scheduler = Scheduler(
        [
            _scheduled_program(
                [{"time": "06:00", "anchor": "end"}], steps=[{"zones": [0]}]
            )
        ]
    )
    await scheduler.register_program_schedules()  # 05:00: armed for 05:50
    assert armed.times == [_utc(1, 5, 50)]

    freezer.move_to("2026-06-01 03:45:00+00:00")  # 05:45 in Paris
    scheduler.store.config.programs = normalize_programs(
        [
            _scheduled_program(
                [{"time": "06:00", "anchor": "end"}],
                steps=[{"zones": [0]}, {"zones": [1]}],
            )
        ]
    )
    await scheduler.register_program_schedules()  # now 20 minutes: 05:40 has gone
    for _ in range(30):
        await asyncio.sleep(0)

    scheduler.async_run_program.assert_not_awaited()
    assert armed.times[-1] == _utc(2, 5, 40)


async def test_a_start_the_timer_missed_is_still_caught_up(armed, freezer):
    scheduler = Scheduler(
        [
            _scheduled_program(
                [{"time": "06:00", "anchor": "end"}], steps=[{"zones": [0]}]
            )
        ]
    )
    await scheduler.register_program_schedules()  # armed for 05:50

    freezer.move_to("2026-06-01 03:55:00+00:00")  # 05:55, the timer never ran
    await scheduler.register_program_schedules()
    for _ in range(30):
        await asyncio.sleep(0)

    scheduler.async_run_program.assert_awaited_once()


async def test_a_startup_after_downtime_catches_up(armed, freezer):
    freezer.move_to("2026-06-01 03:55:00+00:00")
    scheduler = Scheduler(
        [
            _scheduled_program(
                [{"time": "06:00", "anchor": "end"}], steps=[{"zones": [0]}]
            )
        ]
    )

    await scheduler.register_program_schedules()
    for _ in range(30):
        await asyncio.sleep(0)

    scheduler.async_run_program.assert_awaited_once()


async def test_arming_twice_before_the_catch_up_runs_starts_one_run(armed, freezer):
    freezer.move_to("2026-06-01 03:55:00+00:00")
    scheduler = Scheduler(
        [
            _scheduled_program(
                [{"time": "06:00", "anchor": "end"}], steps=[{"zones": [0]}]
            )
        ]
    )

    await scheduler.register_program_schedules()
    await scheduler.register_program_schedules()
    for _ in range(60):
        await asyncio.sleep(0)

    scheduler.async_run_program.assert_awaited_once()


async def test_an_occurrence_already_recorded_is_not_fired_again(armed):
    scheduler = Scheduler([_scheduled_program([{"time": "06:00"}])])

    await scheduler._fire_program_schedule("evening", "schedule_1", _utc(1, 6))
    await scheduler._fire_program_schedule("evening", "schedule_1", _utc(1, 6))

    scheduler.async_run_program.assert_awaited_once()


# --- 9, 10: ids and the marks kept apart ---------------------------------------


def _coordinator(programs=None, last_runs=None, suspensions=None):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    coordinator.store = MagicMock()
    coordinator.store.config = SimpleNamespace(
        programs=programs or [],
        program_last_runs=last_runs,
        suspensions=suspensions,
        full_controller=False,
        direct_valve_control_enabled=False,
        direct_valve_control_before_full_controller=None,
    )
    coordinator.store.get_config = MagicMock(return_value={})
    coordinator.store.async_update_config = AsyncMock()
    coordinator.use_weather_service = False
    coordinator.update_subscriptions = AsyncMock()
    coordinator.async_setup_observed_watering = AsyncMock()
    coordinator.register_start_event = AsyncMock()
    coordinator.register_program_schedules = AsyncMock()
    coordinator.set_up_auto_calc_time = AsyncMock()
    coordinator.set_up_auto_update_time = AsyncMock()
    coordinator.set_up_auto_clear_time = AsyncMock()
    return coordinator


async def _update(coordinator, changes):
    with (
        patch("custom_components.smart_irrigation.async_track_time_change"),
        patch("custom_components.smart_irrigation.async_call_later"),
        patch("custom_components.smart_irrigation.async_dispatcher_send"),
    ):
        await coordinator.async_update_config(changes)
    return coordinator.store.async_update_config.await_args.args[0]


def _stored(*schedule_ids, program_id="evening"):
    return normalize_programs(
        [
            {
                "id": program_id,
                "steps": [{"zones": [0]}],
                "schedules": [{"id": s} for s in schedule_ids],
            }
        ]
    )


async def test_saving_the_programs_drops_the_marks_of_what_is_gone():
    stored = _stored("a", "b")
    marks = {
        "evening:a": "2026-06-01T04:00:00+00:00",
        "evening:b": "2026-06-01T05:00:00+00:00",
        "gone:x": "2026-06-01T05:00:00+00:00",
    }
    suspensions = {
        "program:evening": "2999-01-01T00:00:00+00:00",
        "program:gone": "2999-01-01T00:00:00+00:00",
        "zone:3": "2999-01-01T00:00:00+00:00",
    }
    coordinator = _coordinator(stored, marks, suspensions)

    written = await _update(
        coordinator, {const.CONF_PROGRAMS: _stored("a")}  # b and 'gone' are deleted
    )

    assert written[const.CONF_PROGRAM_LAST_RUNS] == {
        "evening:a": "2026-06-01T04:00:00+00:00"
    }
    assert written[const.CONF_SUSPENSIONS] == {
        "program:evening": "2999-01-01T00:00:00+00:00",
        "zone:3": "2999-01-01T00:00:00+00:00",
    }


async def test_saving_unchanged_programs_writes_no_marks():
    stored = _stored("a")
    coordinator = _coordinator(stored, {"evening:a": "2026-06-01T04:00:00+00:00"})

    written = await _update(coordinator, {const.CONF_PROGRAMS: _stored("a")})

    assert const.CONF_PROGRAM_LAST_RUNS not in written


async def test_a_new_schedule_never_takes_the_id_of_one_that_was_deleted():
    # schedule_2 was deleted in the same save the new schedule is added in.
    stored = _stored("schedule_1", "schedule_2")
    marks = {"evening:schedule_2": "2026-06-01T05:00:00+00:00"}
    coordinator = _coordinator(stored, marks)
    sent = [
        {
            "id": "evening",
            "steps": [{"zones": [0]}],
            "schedules": [{"id": "schedule_1"}, {"time": "20:00"}],
        }
    ]

    written = await _update(coordinator, {const.CONF_PROGRAMS: sent})

    ids = [s["id"] for s in written[const.CONF_PROGRAMS][0]["schedules"]]
    assert ids[0] == "schedule_1"
    assert ids[1] not in ("schedule_1", "schedule_2")
    assert "evening:schedule_2" not in written[const.CONF_PROGRAM_LAST_RUNS]


def test_an_auto_id_does_not_steal_the_id_a_later_schedule_carries():
    schedules = normalize_schedules([{"time": "06:00"}, {"id": "schedule_1"}])

    assert [s["id"] for s in schedules] == ["schedule_2", "schedule_1"]


def test_a_program_named_main_does_not_displace_the_real_main():
    programs = normalize_programs(
        [
            {"name": "Main", "steps": [{"zones": [0]}]},
            {"id": MAIN_PROGRAM_ID, "main": True, "name": "The main"},
        ]
    )

    ids = [p["id"] for p in programs]
    assert ids[0] == MAIN_PROGRAM_ID
    assert programs[0]["main"] is True
    assert programs[0]["name"] == "The main"
    assert ids.count(MAIN_PROGRAM_ID) == 1
    other = programs[1]
    assert other["id"] != MAIN_PROGRAM_ID
    assert other["main"] is False
    assert other["steps"]
    # And it stays what it is when the list is saved again.
    again = normalize_programs(programs)
    assert [p["id"] for p in again] == ids
    assert again[1]["steps"]


async def test_a_program_named_main_without_a_main_in_the_payload_keeps_its_steps():
    written = await _update(
        _coordinator(),
        {
            const.CONF_FULL_CONTROLLER: True,
            const.CONF_PROGRAMS: [{"name": "Main", "steps": [{"zones": [0]}]}],
        },
    )

    programs = written[const.CONF_PROGRAMS]
    assert programs[0]["main"] is True
    [mine] = [p for p in programs if not p["main"]]
    assert mine["steps"]


# --- 1: direct valve control comes back ----------------------------------------


async def test_switching_off_restores_direct_valve_control_as_it_was():
    coordinator = _coordinator()
    on = await _update(coordinator, {const.CONF_FULL_CONTROLLER: True})
    assert on[const.CONF_DIRECT_VALVE_CONTROL_ENABLED] is True
    assert on[const.CONF_DIRECT_VALVE_BEFORE_FULL_CONTROLLER] is False

    for key, value in on.items():
        setattr(coordinator.store.config, key, value)
    off = await _update(coordinator, {const.CONF_FULL_CONTROLLER: False})

    assert off[const.CONF_DIRECT_VALVE_CONTROL_ENABLED] is False
    assert off[const.CONF_DIRECT_VALVE_BEFORE_FULL_CONTROLLER] is None


async def test_switching_off_leaves_direct_control_on_if_it_was_on_before():
    coordinator = _coordinator()
    coordinator.store.config.direct_valve_control_enabled = True
    on = await _update(coordinator, {const.CONF_FULL_CONTROLLER: True})
    assert on[const.CONF_DIRECT_VALVE_BEFORE_FULL_CONTROLLER] is True

    for key, value in on.items():
        setattr(coordinator.store.config, key, value)
    off = await _update(coordinator, {const.CONF_FULL_CONTROLLER: False})

    assert off[const.CONF_DIRECT_VALVE_CONTROL_ENABLED] is True


async def test_a_value_sent_with_the_switch_off_is_the_users_own():
    coordinator = _coordinator()
    coordinator.store.config.full_controller = True
    coordinator.store.config.direct_valve_control_enabled = True
    coordinator.store.config.direct_valve_control_before_full_controller = False

    off = await _update(
        coordinator,
        {
            const.CONF_FULL_CONTROLLER: False,
            const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True,
        },
    )

    assert off[const.CONF_DIRECT_VALVE_CONTROL_ENABLED] is True


async def test_saving_again_while_on_does_not_overwrite_what_was_remembered():
    coordinator = _coordinator()
    coordinator.store.config.full_controller = True
    coordinator.store.config.direct_valve_control_enabled = True
    coordinator.store.config.direct_valve_control_before_full_controller = False

    again = await _update(coordinator, {const.CONF_FULL_CONTROLLER: True})

    assert const.CONF_DIRECT_VALVE_BEFORE_FULL_CONTROLLER not in again


async def test_a_controller_switched_on_before_this_remembers_nothing_to_restore():
    coordinator = _coordinator()
    coordinator.store.config.full_controller = True
    coordinator.store.config.direct_valve_control_enabled = True

    off = await _update(coordinator, {const.CONF_FULL_CONTROLLER: False})

    assert off == {const.CONF_FULL_CONTROLLER: False}


# --- 11: the store ----------------------------------------------------------------


def test_two_configs_do_not_share_their_lists():
    a, b = Config(), Config()

    a.programs.append({"id": "x"})
    a.supplies.append({"id": "y"})
    a.active_valve_runs.append({"zone": 1})

    assert b.programs == [] and b.supplies == [] and b.active_valve_runs == []
    assert a.direct_valve_control_before_full_controller is None


@pytest.mark.asyncio
async def test_a_store_without_the_new_key_loads_unchanged(hass):
    store = SmartIrrigationStorage(hass)
    await store._populate_from_data(
        {"config": {"full_controller": True, "direct_valve_control_enabled": True}}
    )

    assert store.config.full_controller is True
    assert store.config.direct_valve_control_enabled is True
    assert store.config.direct_valve_control_before_full_controller is None
    assert store.config.programs == []


@pytest.mark.asyncio
async def test_the_remembered_value_survives_a_restart(hass):
    store = SmartIrrigationStorage(hass)
    await store._populate_from_data(
        {"config": {const.CONF_DIRECT_VALVE_BEFORE_FULL_CONTROLLER: False}}
    )

    assert store.config.direct_valve_control_before_full_controller is False
