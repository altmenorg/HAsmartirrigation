"""A skipped day says so, instead of being an event that never arrives.

When a start trigger was reached on a skip day the code simply returned. An
automation cannot listen for the absence of an event, so users could not tell a
deliberate skip from a fault, and one of them ended up polling his zones at 09:00
to find out whether anything had run (#841).
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const

TRIGGER = {
    const.TRIGGER_CONF_NAME: "before sunrise",
    const.TRIGGER_CONF_TYPE: const.TRIGGER_TYPE_SUNRISE,
    const.TRIGGER_CONF_OFFSET_MINUTES: -120,
}


def _coordinator(should_skip, reason, sheltered=None):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.bus.fire = MagicMock()
    coordinator.store = MagicMock()
    coordinator._fired_triggers_today = set()
    coordinator._watering_decision_today = None
    coordinator._last_skip_evaluation = None
    coordinator._start_event_fired_today = False
    coordinator.async_evaluate_skip_conditions = AsyncMock(
        return_value={
            "should_skip": should_skip,
            "reason": reason,
            "checks": [{"id": "precipitation", "skip": should_skip}],
        }
    )
    coordinator.async_zones_sheltered_from_rain = AsyncMock(
        return_value=sheltered or set()
    )
    coordinator._apply_rain_since_calculation = AsyncMock()
    coordinator._hold_back_zones_exposed_to_rain = AsyncMock()
    coordinator._reset_days_since_irrigation = AsyncMock()
    coordinator.store.async_update_config = AsyncMock()
    return coordinator


def _fired(coordinator, suffix):
    return [
        call.args
        for call in coordinator.hass.bus.fire.call_args_list
        if call.args and call.args[0] == f"{const.DOMAIN}_{suffix}"
    ]


async def _reach_the_trigger(coordinator):
    coordinator._fire_start_event(TRIGGER)
    # _fire_start_event schedules the decision as a task.
    task = coordinator.hass.async_create_task.call_args.args[0]
    await task


@pytest.mark.asyncio
async def test_a_skipped_day_fires_an_event_with_its_reason():
    coordinator = _coordinator(should_skip=True, reason="precipitation")

    await _reach_the_trigger(coordinator)

    skipped = _fired(coordinator, const.EVENT_IRRIGATE_SKIPPED)
    assert len(skipped) == 1
    assert skipped[0][1]["reason"] == "precipitation"
    assert skipped[0][1]["trigger_name"] == "before sunrise"
    assert skipped[0][1]["checks"]
    # and the run itself did not start
    assert _fired(coordinator, const.EVENT_IRRIGATE_START) == []


@pytest.mark.asyncio
async def test_a_watering_day_fires_the_start_and_nothing_else():
    coordinator = _coordinator(should_skip=False, reason=None)

    await _reach_the_trigger(coordinator)

    assert len(_fired(coordinator, const.EVENT_IRRIGATE_START)) == 1
    assert _fired(coordinator, const.EVENT_IRRIGATE_SKIPPED) == []
