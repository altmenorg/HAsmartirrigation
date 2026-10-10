# ruff: noqa: F811
"""The main program of the full controller can have schedules of its own (C6).

Without any switched on, nothing changes: the historical start trigger arms and
fires as it always did. With one on, the trigger stays unarmed and the schedules
start the same cycle, through the same code.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.exceptions import ServiceValidationError

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.program_adjust import ProgramAdjustMixin
from custom_components.smart_irrigation.programs import (
    MAIN_PROGRAM_ID,
    default_main_program,
    main_has_enabled_schedules,
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

# --- what is stored -------------------------------------------------------------


def _main(schedules=None, **overrides):
    data = {"id": MAIN_PROGRAM_ID, "main": True}
    if schedules is not None:
        data["schedules"] = schedules
    data.update(overrides)
    return data


def test_the_main_program_keeps_its_schedules_cleaned_like_any_other():
    [main] = normalize_programs(
        [
            _main(
                [
                    {
                        "time": "06:05",
                        "weekdays": [0, 9],
                        "days_of_month": [1, 15, 40],
                        "anchor": "end",
                        "weather": False,
                        "skip_conditions": ["wind", "junk"],
                        "fallback_time": "05:30",
                    },
                    "junk",
                ],
                steps=[{"zones": [0]}],
            )
        ]
    )

    [schedule] = main[const.PROGRAM_SCHEDULES]
    assert schedule[const.SCHEDULE_TIME] == "06:05"
    assert schedule[const.SCHEDULE_WEEKDAYS] == [0]
    assert schedule[const.SCHEDULE_DAYS_OF_MONTH] == [1, 15]
    assert schedule[const.SCHEDULE_ANCHOR] == "end"
    assert schedule[const.SCHEDULE_WEATHER] is False
    assert schedule[const.SCHEDULE_SKIP_CONDITIONS] == ["wind"]
    assert schedule[const.SCHEDULE_FALLBACK_TIME] == "05:30"
    assert schedule[const.SCHEDULE_ID]
    # Still no steps, nor the other program fields.
    assert const.PROGRAM_STEPS not in main
    assert const.PROGRAM_TOURS not in main


def test_a_main_program_without_schedules_is_stored_exactly_as_before():
    assert normalize_programs([default_main_program()]) == [default_main_program()]
    assert normalize_programs([_main([])]) == [default_main_program()]
    assert normalize_programs([_main(["junk"])]) == [default_main_program()]


def test_a_hard_deadline_is_not_kept_for_the_main_program():
    [main] = normalize_programs(
        [_main([{"time": "06:00", "anchor": "end", "hard_deadline": True}])]
    )
    assert const.SCHEDULE_HARD_DEADLINE not in main[const.PROGRAM_SCHEDULES][0]
    # Other programs keep theirs.
    other = normalize_programs(
        [
            _main(),
            _program([{"time": "06:00", "anchor": "end", "hard_deadline": True}]),
        ]
    )[1]
    assert other[const.PROGRAM_SCHEDULES][0][const.SCHEDULE_HARD_DEADLINE] is True


def test_a_new_schedule_of_the_main_program_never_takes_a_retired_id():
    [main] = normalize_programs(
        [_main([{"time": "06:00"}])],
        {MAIN_PROGRAM_ID: {"schedule_1"}},
    )
    assert main[const.PROGRAM_SCHEDULES][0][const.SCHEDULE_ID] != "schedule_1"


def test_only_an_enabled_schedule_counts():
    def programs(schedules):
        return normalize_programs([_main(schedules)])

    assert main_has_enabled_schedules(programs([{"time": "06:00"}])) is True
    assert (
        main_has_enabled_schedules(programs([{"time": "06:00", "enabled": False}]))
        is False
    )
    assert main_has_enabled_schedules(programs([])) is False
    assert main_has_enabled_schedules([]) is False
    assert main_has_enabled_schedules(None) is False
    # Another program's schedules are not the main's.
    assert (
        main_has_enabled_schedules(
            normalize_programs([_main(), _program([{"time": "06:00"}])])
        )
        is False
    )


# --- the historical trigger ----------------------------------------------------------


def _trigger_coordinator(programs, *, full=True, total=1800):
    coordinator = TriggerCoordinator({}, total)
    coordinator.store.config = SimpleNamespace(
        full_controller=full, programs=normalize_programs(programs)
    )
    return coordinator


@pytest.mark.asyncio
async def test_without_schedules_the_historical_trigger_arms_exactly_as_before():
    for programs, full in (
        ([_main()], True),
        ([_main([{"time": "06:00", "enabled": False}])], True),
        # The controller off: the programs are not looked at at all.
        ([_main([{"time": "06:00"}])], False),
    ):
        coordinator = _trigger_coordinator(programs, full=full)
        assert coordinator.main_program_uses_schedules() is False
        with patch(
            "custom_components.smart_irrigation.triggers.async_track_sunrise"
        ) as track:
            track.return_value = lambda: None
            await coordinator.register_start_event()

        assert coordinator.start_trigger_armed is True
        track.assert_called_once()
        coordinator.get_total_duration_all_enabled_zones.assert_awaited()


@pytest.mark.asyncio
async def test_a_plain_installation_without_the_controller_is_untouched():
    coordinator = TriggerCoordinator({}, 1800)  # store.config is a MagicMock
    assert coordinator.main_program_uses_schedules() is False
    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise"
    ) as track:
        track.return_value = lambda: None
        await coordinator.register_start_event()
    assert coordinator.start_trigger_armed is True


@pytest.mark.asyncio
async def test_the_trigger_fires_the_cycle_as_it_always_did_without_schedules():
    coordinator = _trigger_coordinator([_main()])
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
async def test_with_schedules_the_trigger_is_not_armed_and_a_stale_one_is_dropped():
    coordinator = _trigger_coordinator([_main([{"time": "06:00"}])])
    stale = MagicMock()
    coordinator._track_irrigation_triggers_unsub.append(stale)
    coordinator.start_trigger_armed = True

    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise"
    ) as track:
        await coordinator.register_start_event()

    assert coordinator.main_program_uses_schedules() is True
    assert coordinator.start_trigger_armed is False
    track.assert_not_called()
    stale.assert_called_once()
    assert coordinator._track_irrigation_triggers_unsub == []
    coordinator.get_total_duration_all_enabled_zones.assert_not_awaited()


@pytest.mark.asyncio
async def test_with_schedules_no_trigger_type_is_armed_either():
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


@pytest.mark.asyncio
async def test_the_trigger_comes_back_when_every_schedule_is_gone():
    coordinator = _trigger_coordinator([_main([{"time": "06:00"}])])
    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise"
    ) as track:
        track.return_value = lambda: None
        await coordinator.register_start_event()
        assert coordinator.start_trigger_armed is False

        coordinator.store.config.programs = normalize_programs([_main([])])
        await coordinator.register_start_event()

    assert coordinator.start_trigger_armed is True
    track.assert_called_once()


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
async def test_the_trigger_is_armed_again_when_the_last_schedule_is_removed():
    coordinator = _config_coordinator([_main([{"time": "06:00"}])])

    await _save(coordinator, {const.CONF_PROGRAMS: [_main([])]})

    coordinator.register_start_event.assert_awaited_once()
    assert coordinator.main_program_uses_schedules() is False


@pytest.mark.asyncio
async def test_the_trigger_is_let_go_when_a_schedule_is_added():
    coordinator = _config_coordinator([_main()])

    await _save(coordinator, {const.CONF_PROGRAMS: [_main([{"time": "06:00"}])]})

    coordinator.register_start_event.assert_awaited_once()
    assert coordinator.main_program_uses_schedules() is True


@pytest.mark.asyncio
async def test_the_trigger_is_armed_again_when_the_only_schedule_is_disabled():
    coordinator = _config_coordinator([_main([{"time": "06:00"}])])
    [schedule] = coordinator.store.config.programs[0][const.PROGRAM_SCHEDULES]

    await _save(
        coordinator,
        {const.CONF_PROGRAMS: [_main([{**schedule, "enabled": False}])]},
    )

    coordinator.register_start_event.assert_awaited_once()


@pytest.mark.asyncio
async def test_an_edit_that_changes_nothing_about_who_starts_does_not_re_arm():
    coordinator = _config_coordinator([_main([{"time": "06:00"}])])

    await _save(
        coordinator,
        {
            const.CONF_PROGRAMS: [
                _main([{"time": "07:00"}]),
                _program([{"time": "06:00"}]),
            ]
        },
    )

    coordinator.register_start_event.assert_not_awaited()
    coordinator.register_program_schedules.assert_awaited()


@pytest.mark.asyncio
async def test_switching_the_controller_off_hands_the_start_back_to_the_trigger():
    coordinator = _config_coordinator([_main([{"time": "06:00"}])])

    await _save(coordinator, {const.CONF_FULL_CONTROLLER: False})

    coordinator.register_start_event.assert_awaited_once()
    assert coordinator.main_program_uses_schedules() is False


# --- arming the schedules ---------------------------------------------------------------


class MainScheduler(Scheduler, TriggersMixin):
    """The scheduler with the trigger code it shares the cycle with."""

    def __init__(self, programs, **kwargs):
        super().__init__(programs, **kwargs)
        self.store.config.direct_valve_control_enabled = True
        self._planned_run_seconds = AsyncMock(return_value=900)
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


async def test_a_schedule_of_the_main_program_is_armed(armed):
    scheduler = MainScheduler([_main([{"time": "06:00"}])])

    await scheduler.register_program_schedules()

    assert armed.times == [_utc(1, 6)]


async def test_the_start_is_placed_for_the_planned_run_of_the_cycle(armed):
    scheduler = MainScheduler([_main([{"time": "07:00", "anchor": "end"}])])

    await scheduler.register_program_schedules()

    # 900 s of planned run (the same figure that places the start trigger).
    assert armed.times == [_utc(1, 6, 45)]
    scheduler._planned_run_seconds.assert_awaited()


async def test_nothing_is_armed_for_a_main_program_without_an_enabled_schedule(armed):
    for schedules in (None, [], [{"time": "06:00", "enabled": False}]):
        scheduler = MainScheduler([_main(schedules)])
        await scheduler.register_program_schedules()
        assert armed.times == []
        scheduler._planned_run_seconds.assert_not_awaited()


async def test_a_disabled_main_program_or_a_controller_that_is_off_arms_nothing(armed):
    off = MainScheduler([_main([{"time": "06:00"}], enabled=False)])
    await off.register_program_schedules()
    assert armed.times == []
    controller_off = MainScheduler([_main([{"time": "06:00"}])], full=False)
    await controller_off.register_program_schedules()
    assert armed.times == []


async def test_the_main_program_and_the_others_are_armed_together(armed):
    scheduler = MainScheduler(
        [_main([{"time": "06:00"}]), _program([{"time": "20:00"}])]
    )

    await scheduler.register_program_schedules()

    assert sorted(armed.times) == [_utc(1, 6), _utc(1, 20)]


async def test_a_teardown_cancels_the_timer_of_the_main_program(armed):
    scheduler = MainScheduler([_main([{"time": "06:00"}])])
    await scheduler.register_program_schedules()

    scheduler.async_teardown_program_schedules()

    armed.unsubs[0].assert_called_once()


async def test_a_main_run_whose_start_has_gone_by_is_caught_up_at_startup(armed):
    # 05:00; done by 07:00 with 3 hours to run: the start (04:00) is past.
    scheduler = MainScheduler([_main([{"time": "07:00", "anchor": "end"}])])
    scheduler._planned_run_seconds.return_value = 3 * 3600

    await scheduler.register_program_schedules()
    await scheduler.drain()

    # Only the next day is armed; today's occurrence was started at once.
    assert armed.times == [_utc(2, 4)]
    scheduler.async_run_direct_valves.assert_awaited_once()
    key = f"{MAIN_PROGRAM_ID}:{_schedule_id(scheduler)}"
    assert key in scheduler.store.config.program_last_runs


def _schedule_id(scheduler):
    return scheduler.store.config.programs[0][const.PROGRAM_SCHEDULES][0][
        const.SCHEDULE_ID
    ]


# --- the adjustment (task 2) -------------------------------------------------------------


class AdjustedScheduler(MainScheduler):
    """With the adjustment in force, as the coordinator has it."""

    def program_adjustment(self, program_id):
        return self.adjustments.get(program_id)


async def test_a_done_by_start_counts_the_adjustment_like_the_planning_does(armed):
    program = _program([{"time": "07:00", "anchor": "end"}], steps=[{"zones": [0]}])
    plain = AdjustedScheduler([program])
    plain.adjustments = {}
    await plain.register_program_schedules()
    assert armed.times == [_utc(1, 6, 50)]  # 600 s

    doubled = AdjustedScheduler([program])
    doubled.adjustments = {
        "evening": {const.ADJUST_PERCENT: 200.0, const.ADJUST_SECONDS: None}
    }
    await doubled.register_program_schedules()
    assert armed.times[-1] == _utc(1, 6, 40)  # 1200 s


async def test_the_scheduler_and_the_planning_agree_on_the_length(armed):
    adjustments = {"evening": {const.ADJUST_PERCENT: 50.0, const.ADJUST_SECONDS: 60.0}}
    program = _program(
        [{"time": "07:00", "anchor": "end"}], steps=[{"zones": [0]}, {"zones": [1]}]
    )
    scheduler = AdjustedScheduler([program])
    scheduler.adjustments = adjustments
    await scheduler.register_program_schedules()

    hass, status = _status_with([program])
    status.store.config.program_adjustments = adjustments
    for stored in status.store.by_id.values():
        stored[const.ZONE_DURATION] = 600  # as the scheduler's zones
    [planned] = (await status.async_planning(1))[:1]

    assert planned["start"] == armed.times[0].isoformat()


# --- firing ---------------------------------------------------------------------------


async def _fire(scheduler, target=None):
    await scheduler._fire_program_schedule(
        MAIN_PROGRAM_ID, _schedule_id(scheduler), target or _utc(1, 6)
    )
    await scheduler.drain()


async def test_a_due_schedule_runs_the_classic_cycle_like_the_trigger(armed):
    scheduler = MainScheduler([_main([{"time": "06:00"}])])

    await _fire(scheduler)

    # The cycle, not a program of steps.
    scheduler.async_run_program.assert_not_awaited()
    scheduler.async_run_direct_valves.assert_awaited_once_with()
    scheduler.hass.bus.fire.assert_called_once()
    event, data = scheduler.hass.bus.fire.call_args.args
    assert event == f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
    assert data["trigger_type"] == "program"
    assert data["program_id"] == MAIN_PROGRAM_ID
    assert data["schedule_id"] == _schedule_id(scheduler)
    # The day is counted for the whole install, as the trigger does.
    scheduler._note_watering_day.assert_awaited_once_with("Main program")
    # The day's shared weather decision was asked for.
    assert len(scheduler._prepare_calls) == 1
    assert scheduler._prepare_calls[0][2] == {}


async def test_the_occurrence_is_recorded_and_the_next_one_armed(armed):
    scheduler = MainScheduler([_main([{"time": "06:00"}])])
    await scheduler.register_program_schedules()
    armed.calls.clear()

    await _fire(scheduler)

    key = f"{MAIN_PROGRAM_ID}:{_schedule_id(scheduler)}"
    assert scheduler.store.config.program_last_runs[key] == _utc(1, 6).isoformat()
    assert armed.times == [_utc(2, 6)]


async def test_the_same_occurrence_does_not_run_twice(armed):
    scheduler = MainScheduler([_main([{"time": "06:00"}])])

    await _fire(scheduler)
    await _fire(scheduler)

    scheduler.async_run_direct_valves.assert_awaited_once()


async def test_a_skip_day_runs_nothing(armed):
    scheduler = MainScheduler([_main([{"time": "06:00"}])])
    scheduler.go = False

    await _fire(scheduler)

    scheduler.async_run_direct_valves.assert_not_awaited()
    scheduler.hass.bus.fire.assert_not_called()
    scheduler._note_watering_day.assert_not_awaited()


async def test_a_failing_weather_decision_is_fail_safe(armed):
    scheduler = MainScheduler([_main([{"time": "06:00"}])])
    scheduler._prepare_watering_for_today = AsyncMock(side_effect=RuntimeError("x"))

    await _fire(scheduler)

    scheduler.async_run_direct_valves.assert_not_awaited()
    scheduler.hass.bus.fire.assert_not_called()


async def test_a_schedule_that_ignores_the_weather_waters_without_judging_it(armed):
    scheduler = MainScheduler([_main([{"time": "06:00", "weather": False}])])
    scheduler.go = False  # would skip, if it were asked

    await _fire(scheduler)

    scheduler._prepare_watering_for_today.assert_not_awaited()
    # But the zones are still calculated again first, when the setting asks.
    scheduler._recalculate_before_start.assert_awaited_once()
    scheduler.async_run_direct_valves.assert_awaited_once()
    scheduler._note_watering_day.assert_awaited_once()


async def test_a_suspended_or_disabled_main_program_does_not_run(armed):
    suspended = MainScheduler([_main([{"time": "06:00"}])])
    suspended.suspended = True
    await _fire(suspended)
    suspended.async_run_direct_valves.assert_not_awaited()
    # The occurrence still counts as having passed.
    assert suspended.store.config.program_last_runs

    disabled = MainScheduler([_main([{"time": "06:00"}])])
    sid = _schedule_id(disabled)
    disabled.store.config.programs[0][const.PROGRAM_ENABLED] = False
    await disabled._fire_program_schedule(MAIN_PROGRAM_ID, sid, _utc(1, 6))
    await disabled.drain()
    disabled.async_run_direct_valves.assert_not_awaited()


async def test_a_disabled_schedule_does_not_run(armed):
    scheduler = MainScheduler([_main([{"time": "06:00", "enabled": False}])])
    # A second one keeps the main program in "schedules" mode.
    await _fire(scheduler)
    scheduler.async_run_direct_valves.assert_not_awaited()


async def test_the_controller_off_runs_nothing(armed):
    scheduler = MainScheduler([_main([{"time": "06:00"}])])
    scheduler.store.config.full_controller = False

    await _fire(scheduler)

    scheduler.async_run_direct_valves.assert_not_awaited()


async def test_direct_valve_control_off_fires_only_the_event(armed):
    scheduler = MainScheduler([_main([{"time": "06:00"}])])
    scheduler.store.config.direct_valve_control_enabled = False

    await _fire(scheduler)

    scheduler.hass.bus.fire.assert_called_once()
    scheduler.async_run_direct_valves.assert_not_awaited()


async def test_the_schedules_own_conditions_reach_the_preparation(armed):
    with_wind = MainScheduler([_main([{"time": "06:00", "skip_conditions": ["wind"]}])])
    with_wind.async_evaluate_skip_conditions = AsyncMock(
        return_value={"should_skip": False, "reason": None, "checks": []}
    )
    with_wind.async_zones_held_by_days_between = AsyncMock(return_value=set())
    with_wind._count_precipitation_skip = AsyncMock()
    with_wind._watering_decision_today = None
    with_wind._last_skip_evaluation = None

    await _fire(with_wind)

    with_wind.async_evaluate_skip_conditions.assert_awaited_once_with(only=["wind"])
    # The moist soil is not one of the conditions: no hold for it.
    [(_, _, kwargs)] = with_wind._prepare_calls
    assert kwargs == {"soil_moisture": False}
    with_wind.async_run_direct_valves.assert_awaited_once()

    with_soil = MainScheduler(
        [_main([{"time": "06:00", "skip_conditions": ["wind", "soil_moisture"]}])]
    )
    with_soil.async_evaluate_skip_conditions = with_wind.async_evaluate_skip_conditions
    with_soil.async_zones_held_by_days_between = AsyncMock(return_value=set())
    with_soil._count_precipitation_skip = AsyncMock()
    with_soil._watering_decision_today = None
    with_soil._last_skip_evaluation = None
    await _fire(with_soil)
    [(_, _, kwargs)] = with_soil._prepare_calls
    assert kwargs == {}


async def test_a_veto_among_the_schedules_conditions_keeps_the_cycle_back(armed):
    scheduler = MainScheduler([_main([{"time": "06:00", "skip_conditions": ["wind"]}])])
    scheduler.async_evaluate_skip_conditions = AsyncMock(
        return_value={"should_skip": True, "reason": "wind", "checks": []}
    )
    scheduler.async_zones_held_by_days_between = AsyncMock(return_value=set())
    scheduler._count_precipitation_skip = AsyncMock()
    scheduler._watering_decision_today = None
    scheduler._last_skip_evaluation = None
    scheduler.go = False

    await _fire(scheduler)

    scheduler.async_run_direct_valves.assert_not_awaited()


# --- the moist soil hold per schedule (task 3) ----------------------------------------------


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

    hass, coord = _status(programs, **kwargs)
    coord._planned_run_seconds = AsyncMock(return_value=600)
    return hass, coord


async def test_the_planning_lists_the_main_programs_schedules_with_the_zones():
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
    # Sequential by default: one zone per step, each for its own duration.
    assert [
        [(z["zone_id"], z["seconds"], z["expected_seconds"]) for z in s["zones"]]
        for s in first["steps"]
    ] == [[(0, 300, 300)], [(1, 300, 300)]]


async def test_in_parallel_the_zones_are_one_step():
    hass, coord = _status_with(
        [_main([{"time": "06:00"}])], sequencing=const.CONF_ZONE_SEQUENCING_PARALLEL
    )

    [first, *_] = await coord.async_planning(1)

    assert len(first["steps"]) == 1
    assert [z["zone_id"] for z in first["steps"][0]["zones"]] == [0, 1]


async def test_a_zone_with_nothing_to_water_is_not_in_the_main_plan():
    hass, coord = _status_with([_main([{"time": "06:00"}])])
    coord.store.by_id[1][const.ZONE_DURATION] = 0
    coord.store.by_id[0][const.ZONE_LINKED_ENTITY] = None

    assert await coord.async_planning(1) == []


async def test_the_planning_has_no_main_program_without_schedules():
    hass, coord = _status_with(
        [_main(), _program([{"time": "20:00"}], steps=[{"zones": [0]}])]
    )

    planned = await coord.async_planning(1)

    assert {p["program_id"] for p in planned} == {"evening"}


async def test_the_overview_gives_the_main_program_its_next_start():
    hass, coord = _status_with([_main([{"time": "06:00"}])])

    [overview] = await coord.async_program_overview()

    assert overview["main"] is True
    assert overview["next_start"] == _utc(1, 6).isoformat()


async def test_the_overview_of_the_main_program_has_no_start_without_schedules():
    for programs in (
        [_main()],
        [_main([{"time": "06:00", "enabled": False}])],
        [_main([{"time": "06:00"}], enabled=False)],
    ):
        hass, coord = _status_with(programs)
        [overview] = await coord.async_program_overview()
        assert overview["next_start"] is None


async def test_the_overview_remembers_the_main_programs_last_scheduled_run():
    hass, coord = _status_with([_main([{"time": "06:00"}])])
    sid = coord.store.config.programs[0][const.PROGRAM_SCHEDULES][0][const.SCHEDULE_ID]
    coord.store.config.program_last_runs = {
        f"{MAIN_PROGRAM_ID}:{sid}": _utc(1, 6).isoformat()
    }

    [overview] = await coord.async_program_overview()

    assert overview["last_run"] == _utc(1, 6).isoformat()
    assert overview["next_start"] == _utc(2, 6).isoformat()


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


async def test_set_schedule_enabled_works_for_the_main_program():
    handlers = _handlers([_main([{"time": "06:00"}])])
    sid = handlers.store.config.programs[0][const.PROGRAM_SCHEDULES][0][
        const.SCHEDULE_ID
    ]

    await handlers.handle_set_schedule_enabled(
        _call(program_id="main", schedule_id=sid, enabled=False)
    )

    [main] = handlers.store.config.programs
    assert main[const.PROGRAM_SCHEDULES][0][const.SCHEDULE_ENABLED] is False
    assert main_has_enabled_schedules(handlers.store.config.programs) is False
    assert handlers.rearmed == 1

    await handlers.handle_set_schedule_enabled(
        _call(program_id="main", schedule_id=sid, enabled=True)
    )
    assert main_has_enabled_schedules(handlers.store.config.programs) is True


async def test_set_schedule_enabled_refuses_an_unknown_schedule_of_the_main_program():
    handlers = _handlers([_main()])
    with pytest.raises(ServiceValidationError):
        await handlers.handle_set_schedule_enabled(
            _call(program_id="main", schedule_id="nope", enabled=False)
        )


async def test_set_program_enabled_works_for_the_main_program_and_keeps_its_schedules():
    handlers = _handlers([_main([{"time": "06:00"}])])

    await handlers.handle_set_program_enabled(_call(program_id="main", enabled=False))

    [main] = handlers.store.config.programs
    assert main[const.PROGRAM_ENABLED] is False
    assert len(main[const.PROGRAM_SCHEDULES]) == 1


class Adjuster(ProgramAdjustMixin, Coordinator):
    pass


async def test_adjust_program_is_still_refused_for_the_main_program():
    store = make_store([zone(0)])
    store.config.full_controller = True
    store.config.programs = normalize_programs([_main([{"time": "06:00"}])])
    adjuster = Adjuster(make_hass(), store)

    with pytest.raises(ServiceValidationError):
        await adjuster.handle_adjust_program(
            _call(program_id="main", percent=150, **{"reset": False})
        )


# --- the info websocket -------------------------------------------------------------------------


async def test_the_info_says_what_starts_the_main_program():
    from custom_components.smart_irrigation import websockets

    for uses, expected in ((False, "trigger"), (True, "main_schedules")):
        coordinator = MagicMock()
        coordinator.main_program_uses_schedules = lambda uses=uses: uses
        coordinator.async_main_program_next_start = AsyncMock(return_value=None)
        coordinator.store.async_get_zones = AsyncMock(return_value=[])
        coordinator.store.async_get_config = AsyncMock(return_value={})
        coordinator.store.config = SimpleNamespace(full_controller=uses, programs=[])
        coordinator.get_total_duration_all_enabled_zones = AsyncMock(return_value=0)
        coordinator.async_evaluate_skip_conditions = AsyncMock(
            return_value={"should_skip": False, "reason": None, "checks": []}
        )
        hass = MagicMock()
        hass.states.get.return_value = None

        info = await websockets.build_irrigation_info(hass, coordinator)

        assert info["start_source"] == expected


async def test_setting_an_adjustment_arms_the_schedules_again():
    store = make_store([zone(0)])
    store.config.full_controller = True
    store.config.programs = normalize_programs([_program([{"time": "07:00"}])])
    store.config.program_adjustments = None
    store.async_update_config = AsyncMock()
    adjuster = Adjuster(make_hass(), store)
    adjuster._notify_programs = lambda: None
    adjuster.register_program_schedules = AsyncMock()

    await adjuster.handle_adjust_program(
        _call(program_id="evening", percent=150, reset=False)
    )

    adjuster.register_program_schedules.assert_awaited_once()


# --- found by the dry test on a real Home Assistant -------------------------------------
#
# The trigger was armed again 10 s after the schedules took over: a registration
# started before the save (an update of the weather, which places the start again
# when the zones are calculated before it) was still waiting on the live estimate
# when the save let the trigger go, and armed it afterwards. Both would have run.


@pytest.mark.asyncio
async def test_an_armed_legacy_trigger_is_cancelled_by_the_schedules_and_comes_back(
    caplog,
):
    coordinator = _trigger_coordinator([_main()])
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

        coordinator.store.config.programs = normalize_programs(
            [_main([{"time": "03:30"}])]
        )
        await coordinator.register_start_event()

        # The listener that was armed is cancelled, not merely left alone.
        unsubs[0].assert_called_once()
        assert coordinator._track_sunrise_event_unsub is None
        assert coordinator.start_trigger_armed is False
        assert len(unsubs) == 1

        caplog.clear()
        with caplog.at_level("INFO"):
            coordinator.store.config.programs = normalize_programs([_main([])])
            await coordinator.register_start_event()

    assert len(unsubs) == 2
    assert coordinator._track_sunrise_event_unsub is unsubs[1]
    assert coordinator.start_trigger_armed is True
    assert "Legacy start irrigation event" in caplog.text


@pytest.mark.asyncio
async def test_a_registration_begun_before_the_schedules_cannot_arm_after_them():
    coordinator = _trigger_coordinator([_main()])
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
        # The save: the schedules take over, and the start is registered again.
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


async def test_the_overview_places_a_done_by_start_with_nothing_stored_to_water():
    # The zones were watered this morning: nothing stored, so the planning lists
    # nothing, but the start the scheduler arms is placed for the planned run.
    hass, coord = _status_with([_main([{"time": "07:00", "anchor": "end"}])])
    for stored in coord.store.by_id.values():
        stored[const.ZONE_DURATION] = 0
    coord._planned_run_seconds = AsyncMock(return_value=900)

    assert await coord.async_planning(1) == []
    [overview] = await coord.async_program_overview()

    assert overview["next_start"] == _utc(1, 6, 45).isoformat()


async def test_the_overview_of_a_start_anchored_main_program_skips_the_estimate():
    # Worked out twice per refresh, the live estimate held the sensor back by
    # 20 s on a real installation; a schedule that starts at its time needs none.
    hass, coord = _status_with([_main([{"time": "03:30"}])])
    coord.store.config.recalculate_before_start = True
    coord.async_estimate_all_zones_now = AsyncMock(return_value={})
    for stored in coord.store.by_id.values():
        stored[const.ZONE_DURATION] = 0

    [overview] = await coord.async_program_overview()

    assert overview["next_start"] == _utc(2, 3, 30).isoformat()
    coord._planned_run_seconds.assert_not_awaited()
    coord.async_estimate_all_zones_now.assert_not_awaited()


async def test_the_main_programs_next_start_is_its_schedules_or_none():
    hass, coord = _status_with([_main([{"time": "03:30"}, {"time": "22:00"}])])
    assert await coord.async_main_program_next_start() == _utc(1, 22)

    hass, coord = _status_with([_main()])
    assert await coord.async_main_program_next_start() is None

    hass, coord = _status_with([_main([{"time": "03:30"}], enabled=False)])
    assert await coord.async_main_program_next_start() is None


async def test_the_state_page_never_gives_the_main_program_the_triggers_time():
    from custom_components.smart_irrigation import websockets
    from tests.test_controller_gaps import _call

    # Done by 07:00 with nothing to water: no start, and not the trigger's.
    hass, coord = _status_with([_main([{"time": "07:00", "anchor": "end"}])])
    coord._planned_run_seconds = AsyncMock(return_value=0)
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


async def test_the_info_gives_the_main_programs_next_schedule_start():
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
    assert info["start_source"] == "main_schedules"
    assert info["next_irrigation_start"] == _utc(2, 3, 30).isoformat()
    assert info["next_irrigation_duration"] == 1705
    # The skip preview is read for that start.
    run_start = coord.async_evaluate_skip_conditions.call_args.kwargs["run_start"]
    assert run_start == _utc(2, 3, 30)
