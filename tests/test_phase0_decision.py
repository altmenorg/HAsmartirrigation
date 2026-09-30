"""Decision-path faults found by the algorithm audit of 2026-09-30.

- Recurring schedules never ran their action. The trackers were given plain
  lambdas and nested functions, which Home Assistant runs in a worker thread;
  ``_execute_schedule`` then called ``hass.async_create_task`` from that thread,
  which raises. The "triggered" event went out, the action never did.
- A schedule's "irrigate" action fired the start event directly, past the skip
  conditions, the hold-backs and direct valve control.
- A start with nothing to water reset the days since the last irrigation, so
  with days-between set the first day with a real deficit was vetoed.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.core import HassJob, HassJobType

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.scheduler import RecurringScheduleManager


def _schedule(schedule_type, **extra):
    return {
        const.SCHEDULE_CONF_ID: "s1",
        const.SCHEDULE_CONF_NAME: "Nightly",
        const.SCHEDULE_CONF_TYPE: schedule_type,
        const.SCHEDULE_CONF_TIME: "05:30",
        const.SCHEDULE_CONF_ENABLED: True,
        **extra,
    }


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "schedule",
    [
        _schedule(const.SCHEDULE_TYPE_DAILY),
        _schedule(const.SCHEDULE_TYPE_WEEKLY, days_of_week=["monday"]),
        _schedule(const.SCHEDULE_TYPE_MONTHLY, day_of_month=1),
        _schedule(const.SCHEDULE_TYPE_INTERVAL, interval_hours=6),
    ],
)
async def test_every_schedule_tracker_runs_on_the_event_loop(schedule):
    manager = RecurringScheduleManager.__new__(RecurringScheduleManager)
    manager.hass = MagicMock()
    manager._schedule_trackers = {}
    captured = []

    def track(_hass, action, *args, **kwargs):
        captured.append(action)
        return MagicMock()

    with (
        patch(
            "custom_components.smart_irrigation.scheduler.async_track_time_change",
            side_effect=track,
        ),
        patch(
            "custom_components.smart_irrigation.scheduler.async_track_time_interval",
            side_effect=track,
        ),
    ):
        await manager._setup_schedule_tracker(schedule)

    assert len(captured) == 1
    # Anything but a callback is run in a thread, where async_create_task raises.
    assert HassJob(captured[0]).job_type is HassJobType.Callback


@pytest.mark.asyncio
async def test_irrigate_all_zones_goes_through_the_start_path():
    manager = RecurringScheduleManager.__new__(RecurringScheduleManager)
    manager.hass = MagicMock()
    manager.coordinator = MagicMock()

    await manager._perform_schedule_action("irrigate", "all", "Morning")

    manager.coordinator._fire_start_event.assert_called_once()
    info = manager.coordinator._fire_start_event.call_args.args[0]
    assert info[const.TRIGGER_CONF_NAME] == "Schedule: Morning"
    manager.hass.bus.fire.assert_not_called()


def _coordinator(zones):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    tasks = []
    coordinator.hass.async_create_task = lambda coro: tasks.append(coro)
    coordinator._fired_triggers_today = set()
    coordinator._watering_decision_today = True
    coordinator._last_skip_evaluation = None
    coordinator._start_event_fired_today = False
    coordinator.store = MagicMock()
    coordinator.store.config = MagicMock(
        **{const.CONF_DIRECT_VALVE_CONTROL_ENABLED: False}
    )
    coordinator.store.async_get_zones = AsyncMock(return_value=zones)
    coordinator.store.async_update_config = AsyncMock()
    coordinator._hold_back_zones_with_moist_soil = AsyncMock()
    coordinator._apply_rain_since_calculation = AsyncMock()
    coordinator._apply_rain_history_suppression = AsyncMock(return_value=None)
    coordinator._reset_days_since_irrigation = AsyncMock()
    return coordinator, tasks


async def _fire(coordinator, tasks):
    coordinator._fire_start_event({const.TRIGGER_CONF_NAME: "Sunrise"})
    for coro in tasks:
        await coro


def _zone(duration, state=const.ZONE_STATE_AUTOMATIC):
    return {const.ZONE_DURATION: duration, const.ZONE_STATE: state}


@pytest.mark.asyncio
async def test_a_start_with_nothing_to_water_does_not_reset_days_between():
    coordinator, tasks = _coordinator([_zone(0), _zone(600, const.ZONE_STATE_DISABLED)])

    await _fire(coordinator, tasks)

    coordinator._reset_days_since_irrigation.assert_not_awaited()
    # The day is still marked as fired, so the trigger does not go again.
    coordinator.store.async_update_config.assert_awaited_with(
        {const.START_EVENT_FIRED_TODAY: True}
    )


@pytest.mark.asyncio
async def test_a_start_that_waters_resets_days_between():
    coordinator, tasks = _coordinator([_zone(0), _zone(600)])

    await _fire(coordinator, tasks)

    coordinator._reset_days_since_irrigation.assert_awaited_once()
