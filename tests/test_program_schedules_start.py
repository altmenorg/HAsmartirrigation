# ruff: noqa: F811
"""Who starts the watering: the programs' schedules, or the start trigger.

With the full controller ("Calculate and water") the programs' own schedules
start them and the historical start trigger stays unarmed; with "Calculate
only" the trigger fires the start event an automation listens to. The old
main program is an ordinary program now (id ``main``, steps of its own): its
schedules still fire the start event it always fired, for the automations that
listen to it.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.exceptions import ServiceValidationError

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.deprecated_actions import async_notice
from custom_components.smart_irrigation.program_adjust import ProgramAdjustMixin
from custom_components.smart_irrigation.programs import (
    MAIN_PROGRAM_ID,
    has_schedule_on,
    normalize_programs,
)
from custom_components.smart_irrigation.service_handlers import ServiceHandlersMixin
from custom_components.smart_irrigation.triggers import TriggersMixin
from tests.runner_doubles import Coordinator, make_hass, make_store, zone
from tests.test_program_scheduler import (  # noqa: F401
    Scheduler,
    _paris_clock,
    _program,
    _utc,
    armed,
)
from tests.test_start_trigger_armed import _Coordinator as TriggerCoordinator


def _main(schedules=None, **overrides):
    """The old main program as the conversion left it: steps of its own."""
    data = {
        "id": MAIN_PROGRAM_ID,
        "name": "Watering",
        "steps": [{"zones": [0]}, {"zones": [1]}],
    }
    if schedules is not None:
        data["schedules"] = schedules
    data.update(overrides)
    return data


def test_the_old_main_program_is_cleaned_like_any_other():
    [main] = normalize_programs(
        [
            _main(
                [
                    {
                        "time": "06:05",
                        "weekdays": [0, 9],
                        "anchor": "end",
                        "hard_deadline": True,
                        "skip_conditions": ["wind", "junk"],
                    },
                    "junk",
                ]
            )
        ]
    )

    [schedule] = main[const.PROGRAM_SCHEDULES]
    assert schedule[const.SCHEDULE_WEEKDAYS] == [0]
    assert schedule[const.SCHEDULE_SKIP_CONDITIONS] == ["wind"]
    # A hard deadline is kept now: the program can be cut like any other.
    assert schedule[const.SCHEDULE_HARD_DEADLINE] is True
    assert [s[const.STEP_ZONES] for s in main[const.PROGRAM_STEPS]] == [[0], [1]]
    assert const.PROGRAM_MAIN not in main


def test_a_new_schedule_never_takes_a_retired_id():
    [main] = normalize_programs(
        [_main([{"time": "06:00"}])],
        {MAIN_PROGRAM_ID: {"schedule_1"}},
    )
    assert main[const.PROGRAM_SCHEDULES][0][const.SCHEDULE_ID] != "schedule_1"


# --- the historical trigger ----------------------------------------------------------


def _trigger_coordinator(programs, *, full=True, total=1800):
    coordinator = TriggerCoordinator({}, total)
    coordinator.store.config = SimpleNamespace(
        full_controller=full, programs=normalize_programs(programs)
    )
    return coordinator


@pytest.mark.asyncio
async def test_with_the_controller_the_trigger_is_never_armed():
    # The programs are started by their schedules only (one_choice.py), with
    # or without any switched on; the trigger is for "Calculate only".
    for programs in ([_main()], [_main([{"time": "06:00", "enabled": False}])], []):
        coordinator = _trigger_coordinator(programs, full=True)
        assert coordinator.schedules_start_watering() is True
        with patch(
            "custom_components.smart_irrigation.triggers.async_track_sunrise"
        ) as track:
            await coordinator.register_start_event()
        assert coordinator.start_trigger_armed is False
        track.assert_not_called()

    # The controller off: the trigger arms as it always did.
    coordinator = _trigger_coordinator([_main([{"time": "06:00"}])], full=False)
    assert coordinator.schedules_start_watering() is False
    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise"
    ) as track:
        track.return_value = lambda: None
        await coordinator.register_start_event()
    assert coordinator.start_trigger_armed is True
    track.assert_called_once()


@pytest.mark.asyncio
async def test_a_plain_installation_without_the_controller_is_untouched():
    coordinator = TriggerCoordinator({}, 1800)  # store.config is a MagicMock
    assert coordinator.schedules_start_watering() is False
    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise"
    ) as track:
        track.return_value = lambda: None
        await coordinator.register_start_event()
    assert coordinator.start_trigger_armed is True


@pytest.mark.asyncio
async def test_the_trigger_fires_the_start_event_as_it_always_did():
    coordinator = _trigger_coordinator([], full=False)
    # An old setup that still has direct valve control on: the valves too.
    coordinator.store.config.direct_valve_control_enabled = True
    coordinator.is_suspended = lambda kind, ident: False
    coordinator._prepare_watering_for_today = AsyncMock(return_value=(True, set()))
    coordinator._note_watering_day = AsyncMock()
    coordinator.async_run_direct_valves = AsyncMock()
    coordinator._spawn_valve_run = lambda coro: coordinator.hass.async_create_task(coro)
    tasks = []
    coordinator.hass.async_create_task = lambda coro: tasks.append(coro) or coro

    coordinator._fire_start_event({const.TRIGGER_CONF_NAME: "Morning"})
    await tasks.pop(0)
    for coro in tasks:
        await coro

    coordinator._prepare_watering_for_today.assert_awaited_once()
    coordinator.hass.bus.fire.assert_called_once()
    event, data = coordinator.hass.bus.fire.call_args.args
    assert event == f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
    assert data["trigger_name"] == "Morning"
    coordinator.async_run_direct_valves.assert_awaited_once()
    coordinator._note_watering_day.assert_awaited_once_with("Morning")


@pytest.mark.asyncio
async def test_with_the_controller_a_stale_trigger_is_dropped():
    coordinator = _trigger_coordinator([_main([{"time": "06:00"}])])
    stale = MagicMock()
    coordinator._track_irrigation_triggers_unsub.append(stale)
    coordinator.start_trigger_armed = True

    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise"
    ) as track:
        await coordinator.register_start_event()

    assert coordinator.start_trigger_armed is False
    track.assert_not_called()
    stale.assert_called_once()
    assert coordinator._track_irrigation_triggers_unsub == []
    coordinator.get_total_duration_all_enabled_zones.assert_not_awaited()


@pytest.mark.asyncio
async def test_with_the_controller_no_trigger_type_is_armed_either():
    coordinator = _trigger_coordinator([_main([{"time": "06:00"}])])
    coordinator.store.async_get_config = AsyncMock(
        return_value={
            const.CONF_ACTIVE_START_TRIGGER: "Clock",
            const.CONF_IRRIGATION_START_TRIGGERS: [
                {
                    const.TRIGGER_CONF_NAME: "Clock",
                    const.TRIGGER_CONF_TYPE: const.TRIGGER_TYPE_TIME,
                    const.TRIGGER_CONF_AT: "06:00",
                    const.TRIGGER_CONF_ENABLED: True,
                    const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: False,
                }
            ],
        }
    )
    with patch.object(
        TriggersMixin, "_register_trigger", new=AsyncMock()
    ) as register_trigger:
        await coordinator.register_start_event()
    register_trigger.assert_not_awaited()
    assert coordinator.start_trigger_armed is False


# --- re-arming on a change -------------------------------------------------------------


def _config_coordinator(programs):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    from homeassistant.util.unit_system import METRIC_SYSTEM

    coordinator.hass.config.units = METRIC_SYSTEM
    coordinator.store = MagicMock()
    coordinator.store.config = SimpleNamespace(
        full_controller=True,
        programs=normalize_programs(programs),
        program_last_runs=None,
    )

    async def _write(data):
        for key, value in data.items():
            setattr(coordinator.store.config, key, value)

    coordinator.store.async_update_config = AsyncMock(side_effect=_write)
    coordinator.use_weather_service = False
    coordinator.update_subscriptions = AsyncMock()
    coordinator.async_setup_observed_watering = AsyncMock()
    coordinator.async_setup_zone_unwatered_watch = AsyncMock()
    coordinator.async_check_zone_unwatered = AsyncMock()
    coordinator.register_start_event = AsyncMock()
    coordinator.register_program_schedules = AsyncMock()
    coordinator._valve_run_tasks = set()
    coordinator.async_align_valves = AsyncMock()
    coordinator.set_up_auto_calc_time = AsyncMock()
    coordinator.set_up_auto_update_time = AsyncMock()
    coordinator.set_up_auto_clear_time = AsyncMock()
    return coordinator


async def _save(coordinator, changes):
    with (
        patch("custom_components.smart_irrigation.async_track_time_change"),
        patch("custom_components.smart_irrigation.async_call_later"),
        patch("custom_components.smart_irrigation.async_dispatcher_send"),
    ):
        await coordinator.async_update_config(changes)


@pytest.mark.asyncio
async def test_editing_the_schedules_changes_nothing_about_who_starts():
    for before, after in (
        ([_main([{"time": "06:00"}])], [_main([])]),
        ([_main()], [_main([{"time": "06:00"}])]),
        ([_main([{"time": "06:00"}])], [_main([{"time": "06:00", "enabled": False}])]),
        (
            [_main([{"time": "06:00"}])],
            [_main([{"time": "07:00"}]), _program([{"time": "06:00"}])],
        ),
    ):
        coordinator = _config_coordinator(before)

        await _save(coordinator, {const.CONF_PROGRAMS: after})

        coordinator.register_start_event.assert_not_awaited()
        coordinator.register_program_schedules.assert_awaited()
        assert coordinator.schedules_start_watering() is True


@pytest.mark.asyncio
async def test_switching_the_controller_off_hands_the_start_back_to_the_trigger():
    coordinator = _config_coordinator([_main([{"time": "06:00"}])])

    await _save(coordinator, {const.CONF_FULL_CONTROLLER: False})

    coordinator.register_start_event.assert_awaited_once()
    assert coordinator.schedules_start_watering() is False


# --- arming and firing the old main program's schedules ----------------------------------


class MainScheduler(Scheduler, TriggersMixin):
    """The scheduler with the trigger code it shares the preparation with."""

    def __init__(self, programs, **kwargs):
        super().__init__(programs, **kwargs)
        self.store.config.direct_valve_control_enabled = True
        self._prepare_calls = []

        async def _prepare(name, data, **kwargs):
            self._prepare_calls.append((name, data, kwargs))
            return self.go, self.sheltered

        self._prepare_watering_for_today = AsyncMock(side_effect=_prepare)
        self._recalculate_before_start = AsyncMock()
        self.async_run_direct_valves = AsyncMock()
        self.hass.bus = MagicMock()

    async def drain(self):
        while self._valve_run_tasks:
            await asyncio.gather(*list(self._valve_run_tasks))


def _schedule_id(scheduler, index=0):
    return scheduler.store.config.programs[index][const.PROGRAM_SCHEDULES][0][
        const.SCHEDULE_ID
    ]


async def _fire(scheduler, program_id=MAIN_PROGRAM_ID, index=0, target=None):
    await scheduler._fire_program_schedule(
        program_id, _schedule_id(scheduler, index), target or _utc(1, 6)
    )
    await scheduler.drain()


def _start_events(scheduler):
    return [
        c.args
        for c in scheduler.hass.bus.async_fire.call_args_list
        if c.args[0] == f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
    ]


async def test_the_old_main_program_is_armed_like_any_other(armed):
    scheduler = MainScheduler(
        [_main([{"time": "06:00"}]), _program([{"time": "20:00"}])]
    )

    await scheduler.register_program_schedules()

    assert sorted(armed.times) == [_utc(1, 6), _utc(1, 20)]


async def test_its_done_by_start_is_placed_for_its_steps(armed):
    # Two steps of 600 s, one after the other.
    scheduler = MainScheduler([_main([{"time": "07:00", "anchor": "end"}])])

    await scheduler.register_program_schedules()

    assert armed.times == [_utc(1, 6, 40)]


async def test_a_due_schedule_of_main_runs_it_and_fires_the_old_start_event(armed):
    scheduler = MainScheduler([_main([{"time": "06:00"}])])

    await _fire(scheduler)

    # A program of steps, not the classic cycle.
    scheduler.async_run_direct_valves.assert_not_awaited()
    scheduler.async_run_program.assert_awaited_once()
    assert scheduler.async_run_program.call_args.args == (MAIN_PROGRAM_ID,)
    # The start event of the old main program, with the payload it had.
    [(event, data)] = _start_events(scheduler)
    assert data == {
        "trigger_name": "Watering",
        "trigger_type": "program",
        "program_id": MAIN_PROGRAM_ID,
        "schedule_id": _schedule_id(scheduler),
    }
    # The day's shared weather decision was asked for.
    assert len(scheduler._prepare_calls) == 1


async def test_another_program_fires_no_start_event(armed):
    scheduler = MainScheduler([_program([{"time": "06:00"}])])

    await _fire(scheduler, program_id="evening")

    scheduler.async_run_program.assert_awaited_once()
    assert _start_events(scheduler) == []


async def test_a_skip_day_or_a_failing_decision_fires_nothing(armed):
    skipped = MainScheduler([_main([{"time": "06:00"}])])
    skipped.go = False
    await _fire(skipped)
    skipped.async_run_program.assert_not_awaited()
    assert _start_events(skipped) == []

    failing = MainScheduler([_main([{"time": "06:00"}])])
    failing._prepare_watering_for_today = AsyncMock(side_effect=RuntimeError("x"))
    await _fire(failing)
    failing.async_run_program.assert_not_awaited()
    assert _start_events(failing) == []


async def test_a_schedule_that_ignores_the_weather_still_fires_the_event(armed):
    scheduler = MainScheduler([_main([{"time": "06:00", "weather": False}])])
    scheduler.go = False  # would skip, if it were asked

    await _fire(scheduler)

    scheduler._prepare_watering_for_today.assert_not_awaited()
    scheduler._recalculate_before_start.assert_awaited_once()
    scheduler.async_run_program.assert_awaited_once()
    assert len(_start_events(scheduler)) == 1


async def test_a_suspended_program_or_the_controller_off_fires_nothing(armed):
    suspended = MainScheduler([_main([{"time": "06:00"}])])
    suspended.suspended = True
    await _fire(suspended)
    suspended.async_run_program.assert_not_awaited()
    assert _start_events(suspended) == []
    # The occurrence still counts as having passed.
    assert suspended.store.config.program_last_runs

    controller_off = MainScheduler([_main([{"time": "06:00"}])])
    controller_off.store.config.full_controller = False
    await _fire(controller_off)
    controller_off.async_run_program.assert_not_awaited()


async def test_the_schedules_own_conditions_reach_the_preparation(armed):
    with_wind = MainScheduler([_main([{"time": "06:00", "skip_conditions": ["wind"]}])])

    await _fire(with_wind)

    # The list goes to the preparation, which judges them for this start.
    [(_, _, kwargs)] = with_wind._prepare_calls
    assert kwargs == {"conditions": ["wind"]}
    with_wind.async_run_program.assert_awaited_once()

    every = MainScheduler([_main([{"time": "06:00"}])])
    await _fire(every)
    [(_, _, kwargs)] = every._prepare_calls
    assert kwargs == {}


# --- the moist soil hold per schedule ----------------------------------------------------


class Preparing(TriggersMixin):
    """The preparation of a day, with each hold replaced by a recorder."""

    def __init__(self):
        self._watering_decision_today = True
        self._watering_prepared_today = False
        self._fired_triggers_today = set()
        self._start_event_fired_today = False
        self.held = []
        for name in (
            "_hold_back_zones_held_by_days_between",
            "_hold_back_zones_with_moist_soil",
            "_apply_rain_since_calculation",
            "_apply_forecast_rain_credit",
            "_apply_rain_history_suppression",
        ):
            setattr(self, name, AsyncMock())
        self._zones_held_by_days_between = set()
        self.hass = MagicMock()
        self.hass.async_create_task = lambda coro: coro.close()
        self._increment_days_since_irrigation = AsyncMock()
        # The readings of the moment, judged at each start: nothing vetoes.
        self.async_evaluate_skip_conditions = AsyncMock(
            return_value={"should_skip": False, "reason": None, "checks": []}
        )


async def test_the_moist_soil_hold_is_applied_by_default():
    day = Preparing()
    await day._prepare_watering_for_today("t", {})
    day._hold_back_zones_with_moist_soil.assert_awaited_once()
    day._apply_rain_since_calculation.assert_awaited_once()
    # And only once for the day, as before.
    await day._prepare_watering_for_today("t", {})
    day._hold_back_zones_with_moist_soil.assert_awaited_once()


async def test_a_schedule_without_that_condition_leaves_the_soil_hold_out():
    day = Preparing()

    go, _ = await day._prepare_watering_for_today("t", {}, soil_moisture=False)

    assert go is True
    day._hold_back_zones_with_moist_soil.assert_not_awaited()
    # The other holds of the day were made.
    day._hold_back_zones_held_by_days_between.assert_awaited_once()
    day._apply_rain_since_calculation.assert_awaited_once()
    day._apply_forecast_rain_credit.assert_awaited_once()
    assert day._watering_prepared_today is True


async def test_a_later_schedule_that_has_the_condition_still_gets_the_hold():
    day = Preparing()
    await day._prepare_watering_for_today("t", {}, soil_moisture=False)

    await day._prepare_watering_for_today("t", {}, soil_moisture=True)
    await day._prepare_watering_for_today("t", {}, soil_moisture=True)

    day._hold_back_zones_with_moist_soil.assert_awaited_once()
    # The rest of the preparation is not made twice.
    day._apply_rain_since_calculation.assert_awaited_once()


async def test_a_new_day_or_a_new_calculation_owes_the_hold_again():
    day = Preparing()
    await day._prepare_watering_for_today("t", {})
    day._reset_event_fired_today()
    day._watering_decision_today = True  # the day's decision, not under test
    await day._prepare_watering_for_today("t", {})
    assert day._hold_back_zones_with_moist_soil.await_count == 2


async def test_through_the_scheduler_a_condition_list_decides_the_soil_hold():
    class Both(Preparing, MainScheduler):
        def __init__(self):
            MainScheduler.__init__(self, [_main([{"time": "06:00"}])])
            Preparing.__init__(self)

    both = Both()
    both._prepare_watering_for_today = (
        TriggersMixin._prepare_watering_for_today.__get__(both)
    )
    both.async_evaluate_skip_conditions = AsyncMock(
        return_value={"should_skip": False, "reason": None, "checks": []}
    )
    both.async_zones_held_by_days_between = AsyncMock(return_value=set())
    both._count_precipitation_skip = AsyncMock()
    both._last_skip_evaluation = None

    await both._prepare_program_watering("t", {}, ["wind"])
    both._hold_back_zones_with_moist_soil.assert_not_awaited()

    await both._prepare_program_watering("t", {}, ["wind", "soil_moisture"])
    both._hold_back_zones_with_moist_soil.assert_awaited_once()

    # The day's shared decision is back as it was.
    assert both._watering_decision_today is True


# --- what the panel and the sensors see ------------------------------------------------------


def _status_with(programs, **kwargs):
    from tests.test_program_status import _status

    return _status(programs, **kwargs)


async def test_the_planning_lists_the_steps_of_the_old_main_program():
    hass, coord = _status_with([_main([{"time": "06:00"}])])

    planned = await coord.async_planning(2)

    assert [p["start"] for p in planned] == [
        _utc(1, 6).isoformat(),
        _utc(2, 6).isoformat(),
    ]
    first = planned[0]
    assert first["program_id"] == MAIN_PROGRAM_ID
    assert first["expected_seconds"] == 600
    assert first["end"] == _utc(1, 6, 10).isoformat()
    assert [
        [(z["zone_id"], z["seconds"], z["expected_seconds"]) for z in s["zones"]]
        for s in first["steps"]
    ] == [[(0, 300, 300)], [(1, 300, 300)]]


async def test_one_step_of_two_zones_waters_them_together():
    hass, coord = _status_with([_main([{"time": "06:00"}], steps=[{"zones": [0, 1]}])])

    [first, *_] = await coord.async_planning(1)

    assert len(first["steps"]) == 1
    assert [z["zone_id"] for z in first["steps"][0]["zones"]] == [0, 1]
    assert first["expected_seconds"] == 300


async def test_a_start_with_nothing_to_water_is_listed_and_says_so():
    """The start still happens and finds nothing: leaving it out read as "no
    program is planned" under a schedule that was (#912)."""
    hass, coord = _status_with([_main([{"time": "06:00"}])])
    coord.store.by_id[1][const.ZONE_DURATION] = 0
    coord.store.by_id[0][const.ZONE_LINKED_ENTITY] = None

    [planned] = await coord.async_planning(1)

    assert planned["nothing_to_water"] is True
    assert planned["steps"] == []
    assert planned["start"] == _utc(1, 6).isoformat()
    # The zone of its steps that has no valve is named.
    assert [z["zone_id"] for z in planned["zones_without_valve"]] == [0]


async def test_a_program_without_schedules_is_not_planned():
    hass, coord = _status_with(
        [_main(), _program([{"time": "20:00"}], steps=[{"zones": [0]}])]
    )

    planned = await coord.async_planning(1)

    assert {p["program_id"] for p in planned} == {"evening"}


async def test_the_overview_gives_the_next_start_of_its_schedules():
    hass, coord = _status_with([_main([{"time": "06:00"}])])

    [overview] = await coord.async_program_overview()

    assert "main" not in overview
    assert overview["next_start"] == _utc(1, 6).isoformat()
    assert overview["can_run"] is True


async def test_no_schedule_on_is_no_next_start_but_it_can_still_run():
    for programs in (
        [_main()],
        [_main([{"time": "06:00", "enabled": False}])],
        # A program that was off: its schedules came in switched off.
        [_main([{"time": "06:00"}], enabled=False)],
    ):
        hass, coord = _status_with(programs)
        [overview] = await coord.async_program_overview()
        assert overview["next_start"] is None
        assert overview["state"] == "idle"
        assert overview["can_run"] is True


async def test_the_overview_remembers_the_last_scheduled_run():
    hass, coord = _status_with([_main([{"time": "06:00"}])])
    sid = coord.store.config.programs[0][const.PROGRAM_SCHEDULES][0][const.SCHEDULE_ID]
    coord.store.config.program_last_runs = {
        f"{MAIN_PROGRAM_ID}:{sid}": _utc(1, 6).isoformat()
    }

    [overview] = await coord.async_program_overview()

    assert overview["last_run"] == _utc(1, 6).isoformat()
    assert overview["next_start"] == _utc(2, 6).isoformat()


async def test_a_done_by_start_is_placed_on_the_planned_durations():
    # The zones were watered this morning: nothing stored, but the run is
    # planned on the live estimate when the zones are calculated again before
    # the start, and the start is placed for it (#912).
    hass, coord = _status_with([_main([{"time": "07:00", "anchor": "end"}])])
    for stored in coord.store.by_id.values():
        stored[const.ZONE_DURATION] = 0
    coord.store.config.recalculate_before_start = True
    coord._planned_durations = AsyncMock(return_value={0: 450, 1: 450})

    [planned] = await coord.async_planning(1)
    [overview] = await coord.async_program_overview()

    assert planned["start"] == _utc(1, 6, 45).isoformat()
    assert overview["next_start"] == _utc(1, 6, 45).isoformat()


async def test_the_overview_of_a_start_anchored_program_skips_the_estimate():
    # Worked out twice per refresh, the live estimate held the sensor back by
    # 20 s on a real installation; a schedule that starts at its time needs none.
    hass, coord = _status_with([_main([{"time": "03:30"}])])
    coord.store.config.recalculate_before_start = True
    coord.async_estimate_all_zones_now = AsyncMock(return_value={})
    coord._planned_durations = AsyncMock(return_value={})

    [overview] = await coord.async_program_overview()

    assert overview["next_start"] == _utc(2, 3, 30).isoformat()
    coord._planned_durations.assert_not_awaited()
    coord.async_estimate_all_zones_now.assert_not_awaited()


async def test_the_next_start_is_the_soonest_of_every_program():
    hass, coord = _status_with(
        [
            _main([{"time": "03:30"}]),
            _program([{"time": "22:00"}], steps=[{"zones": [0]}]),
        ]
    )
    assert await coord.async_next_program_start() == _utc(1, 22)

    hass, coord = _status_with([_main()])
    assert await coord.async_next_program_start() is None

    hass, coord = _status_with([_main([{"time": "03:30"}])])
    coord.store.config.full_controller = False
    assert await coord.async_next_program_start() is None


async def test_the_state_page_never_gives_a_program_the_triggers_time():
    from custom_components.smart_irrigation import websockets
    from tests.test_controller_gaps import _call

    # Done by 07:00 with nothing to water: no start, and not the trigger's.
    hass, coord = _status_with([_main([{"time": "07:00", "anchor": "end"}])])
    for stored in coord.store.by_id.values():
        stored[const.ZONE_DURATION] = 0
    hass.data = {const.DOMAIN: {"coordinator": coord}}
    with patch.object(
        websockets,
        "build_irrigation_info",
        AsyncMock(return_value={"next_irrigation_start": "trigger"}),
    ) as info:
        connection = await _call(hass, websockets.websocket_get_programs_state)

    [main] = connection.send_result.call_args.args[1]["programs"]
    assert main["next_start"] is None
    info.assert_not_awaited()


# --- the services ----------------------------------------------------------------------------


class Handlers(ServiceHandlersMixin, Coordinator):
    rearmed = 0

    async def async_update_config(self, data):
        data = {
            **data,
            const.CONF_PROGRAMS: normalize_programs(data[const.CONF_PROGRAMS]),
        }
        for key, value in data.items():
            setattr(self.store.config, key, value)
        self.rearmed += 1


def _handlers(programs):
    store = make_store([zone(0)])
    store.config.full_controller = True
    store.config.programs = normalize_programs(programs)
    return Handlers(make_hass(), store)


def _call(**data):
    return SimpleNamespace(data=data)


async def test_set_schedule_enabled_switches_one_schedule():
    handlers = _handlers([_main([{"time": "06:00"}])])
    sid = handlers.store.config.programs[0][const.PROGRAM_SCHEDULES][0][
        const.SCHEDULE_ID
    ]

    await handlers.handle_set_schedule_enabled(
        _call(program_id="main", schedule_id=sid, enabled=False)
    )

    [main] = handlers.store.config.programs
    assert main[const.PROGRAM_SCHEDULES][0][const.SCHEDULE_ENABLED] is False
    assert has_schedule_on(main) is False
    assert handlers.rearmed == 1

    await handlers.handle_set_schedule_enabled(
        _call(program_id="main", schedule_id=sid, enabled=True)
    )
    assert has_schedule_on(handlers.store.config.programs[0]) is True


async def test_set_schedule_enabled_refuses_an_unknown_schedule():
    handlers = _handlers([_main()])
    with pytest.raises(ServiceValidationError):
        await handlers.handle_set_schedule_enabled(
            _call(program_id="main", schedule_id="nope", enabled=False)
        )


async def test_set_program_enabled_switches_every_schedule_of_the_program():
    handlers = _handlers(
        [
            _main([{"time": "06:00"}, {"time": "20:00"}]),
            _program([{"time": "07:00"}]),
        ]
    )

    await handlers.handle_set_program_enabled(_call(program_id="main", enabled=False))

    main, evening = handlers.store.config.programs
    assert const.PROGRAM_ENABLED not in main
    assert [s[const.SCHEDULE_ENABLED] for s in main[const.PROGRAM_SCHEDULES]] == [
        False,
        False,
    ]
    # The other program is not touched.
    assert has_schedule_on(evening) is True
    assert handlers.rearmed == 1

    # Nothing to change: nothing is written.
    await handlers.handle_set_program_enabled(_call(program_id="main", enabled=False))
    assert handlers.rearmed == 1

    await handlers.handle_set_program_enabled(_call(program_id="main", enabled=True))
    assert all(
        s[const.SCHEDULE_ENABLED] is True
        for s in handlers.store.config.programs[0][const.PROGRAM_SCHEDULES]
    )


def test_set_program_enabled_says_it_is_going_and_what_replaces_it():
    hass = MagicMock()
    with patch(
        "custom_components.smart_irrigation.deprecated_actions.ir.async_create_issue"
    ) as create:
        async_notice(hass, const.SERVICE_SET_PROGRAM_ENABLED)

    kwargs = create.call_args.kwargs
    assert kwargs["translation_key"] == "deprecated_program_enabled"
    placeholders = kwargs["translation_placeholders"]
    assert placeholders["replacement"] == (
        f"{const.DOMAIN}.{const.SERVICE_SET_SCHEDULE_ENABLED}"
    )
    assert placeholders["version"] == "2027.11"


class Adjuster(ProgramAdjustMixin, Coordinator):
    pass


@pytest.mark.parametrize("program_id", ["evening", MAIN_PROGRAM_ID])
async def test_setting_an_adjustment_arms_the_schedules_again(program_id):
    store = make_store([zone(0)])
    store.config.full_controller = True
    store.config.programs = normalize_programs(
        [_program([{"time": "07:00"}]), _main([{"time": "06:00"}])]
    )
    store.config.program_adjustments = None
    store.async_update_config = AsyncMock()
    adjuster = Adjuster(make_hass(), store)
    adjuster._notify_programs = lambda: None
    adjuster.register_program_schedules = AsyncMock()

    # The old main program has steps now: it is adjusted like any other.
    await adjuster.handle_adjust_program(
        _call(program_id=program_id, percent=150, reset=False)
    )

    adjuster.register_program_schedules.assert_awaited_once()
    written = store.async_update_config.call_args.args[0]
    assert program_id in written[const.CONF_PROGRAM_ADJUSTMENTS]


# --- the info websocket -------------------------------------------------------------------------


async def test_the_info_says_what_starts_the_watering():
    from custom_components.smart_irrigation import websockets

    for uses, expected in ((False, "trigger"), (True, "schedules")):
        coordinator = MagicMock()
        coordinator.schedules_start_watering = lambda uses=uses: uses
        coordinator.async_next_program_start = AsyncMock(return_value=None)
        coordinator.store.async_get_zones = AsyncMock(return_value=[])
        coordinator.store.async_get_config = AsyncMock(return_value={})
        coordinator.store.config = SimpleNamespace(full_controller=uses, programs=[])
        coordinator.get_total_duration_all_enabled_zones = AsyncMock(return_value=0)
        coordinator._planned_durations = AsyncMock(return_value=None)
        coordinator.async_evaluate_skip_conditions = AsyncMock(
            return_value={"should_skip": False, "reason": None, "checks": []}
        )
        hass = MagicMock()
        hass.states.get.return_value = None

        info = await websockets.build_irrigation_info(hass, coordinator)

        assert info["start_source"] == expected


async def test_the_info_gives_the_next_schedule_start():
    from custom_components.smart_irrigation import websockets

    hass, coord = _status_with([_main([{"time": "03:30"}])])
    coord.store.async_get_config = AsyncMock(return_value={})
    coord.get_total_duration_all_enabled_zones = AsyncMock(return_value=1705)
    coord.async_estimate_all_zones_now = AsyncMock(return_value={})
    coord.async_evaluate_skip_conditions = AsyncMock(
        return_value={"should_skip": False, "reason": None, "checks": []}
    )
    ha = MagicMock()
    ha.states.get.return_value = None

    with patch.object(websockets, "_forecast_days", AsyncMock(return_value=[])):
        info = await websockets.build_irrigation_info(ha, coord)

    assert info.get("error") is None
    assert info["start_source"] == "schedules"
    assert info["next_irrigation_start"] == _utc(2, 3, 30).isoformat()
    assert info["next_irrigation_duration"] == 1705
    # The skip preview is read for that start.
    run_start = coord.async_evaluate_skip_conditions.call_args.kwargs["run_start"]
    assert run_start == _utc(2, 3, 30)


async def test_what_a_zone_would_water_is_the_planned_run():
    """The Info card said 10 min where the planning said 9: the forecast rain."""
    from custom_components.smart_irrigation import websockets

    coordinator = MagicMock()
    coordinator.schedules_start_watering = lambda: False
    coordinator.async_next_program_start = AsyncMock(return_value=None)
    coordinator.store.async_get_zones = AsyncMock(
        return_value=[
            {
                const.ZONE_ID: 1,
                const.ZONE_NAME: "Potager",
                const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            }
        ]
    )
    coordinator.store.async_get_config = AsyncMock(return_value={})
    coordinator.store.config = SimpleNamespace(full_controller=False, programs=[])
    coordinator.get_total_duration_all_enabled_zones = AsyncMock(return_value=540)
    estimate = {"duration": 600, "bucket": -2.0}
    coordinator.async_estimate_all_zones_now = AsyncMock(return_value={"1": estimate})
    coordinator._planned_durations = AsyncMock(return_value={1: 540})
    coordinator.async_evaluate_skip_conditions = AsyncMock(
        return_value={"should_skip": False, "reason": None, "checks": []}
    )
    hass = MagicMock()
    hass.states.get.return_value = None

    info = await websockets.build_irrigation_info(hass, coordinator)

    assert info["zone_estimates"]["1"]["duration"] == 540
    # The shared estimate itself is left as it was.
    assert estimate["duration"] == 600


# --- found by the dry test on a real Home Assistant -------------------------------------
#
# The trigger was armed again 10 s after the schedules took over: a registration
# started before the save (an update of the weather, which places the start again
# when the zones are calculated before it) was still waiting on the live estimate
# when the save let the trigger go, and armed it afterwards. Both would have run.


@pytest.mark.asyncio
async def test_an_armed_trigger_is_cancelled_when_the_controller_goes_on():
    coordinator = _trigger_coordinator([_main()], full=False)
    unsubs = []

    def _track(*args, **kwargs):
        unsubs.append(MagicMock())
        return unsubs[-1]

    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise",
        side_effect=_track,
    ):
        await coordinator.register_start_event()
        assert coordinator.start_trigger_armed is True
        assert coordinator._track_sunrise_event_unsub is unsubs[0]

        coordinator.store.config.full_controller = True
        await coordinator.register_start_event()

    # The listener that was armed is cancelled, not merely left alone.
    unsubs[0].assert_called_once()
    assert coordinator._track_sunrise_event_unsub is None
    assert coordinator.start_trigger_armed is False
    assert len(unsubs) == 1


@pytest.mark.asyncio
async def test_a_registration_begun_before_the_schedules_cannot_arm_after_them():
    # Begun while the trigger starts the watering: the controller off.
    coordinator = _trigger_coordinator([_main()], full=False)
    estimate_running = asyncio.Event()
    estimate_done = asyncio.Event()
    calls = {"n": 0}

    async def _slow_total(*args):
        calls["n"] += 1
        if calls["n"] == 1:
            # The live estimate of the first registration takes its time.
            estimate_running.set()
            await estimate_done.wait()
        return 1800

    coordinator.get_total_duration_all_enabled_zones = AsyncMock(
        side_effect=_slow_total
    )
    unsubs = []

    def _track(*args, **kwargs):
        unsubs.append(MagicMock())
        return unsubs[-1]

    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise",
        side_effect=_track,
    ):
        before = asyncio.ensure_future(coordinator.register_start_event())
        await estimate_running.wait()
        # The save: the controller on, the schedules take over, and the start
        # is registered again.
        coordinator.store.config.full_controller = True
        coordinator.store.config.programs = normalize_programs(
            [_main([{"time": "03:30"}])]
        )
        after = asyncio.ensure_future(coordinator.register_start_event())
        await asyncio.sleep(0)
        estimate_done.set()
        await asyncio.gather(before, after)

    assert coordinator.start_trigger_armed is False
    assert coordinator._track_sunrise_event_unsub is None
    assert all(unsub.call_count == 1 for unsub in unsubs)
