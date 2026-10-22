"""Registering a start trigger on a day when no zone needs water.

``register_start_event`` bailed out whenever the total duration of the enabled
zones was 0, before it even looked at the trigger. A trigger configured with
``account_for_duration: false`` fires at a fixed offset from sunrise/sunset and
does not need the duration for anything, yet it was silently left unscheduled on
every day where nothing happened to need water. Follow-up on #800/#802.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator(total_duration, trigger):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator._track_sunrise_event_unsub = None
    coordinator._track_irrigation_triggers_unsub = []
    coordinator.get_total_duration_all_enabled_zones = AsyncMock(
        return_value=total_duration
    )
    coordinator._register_trigger = AsyncMock()
    coordinator._register_legacy_sunrise_trigger = AsyncMock()
    # A run whose start has gone by while its moment is still ahead is caught
    # up at once. That is not what these tests are about, and it made the last
    # one fail for the few minutes of each day when it applies.
    coordinator._catch_up_missed_start = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.async_get_config = AsyncMock(
        return_value={
            const.CONF_IRRIGATION_START_TRIGGERS: [trigger],
            const.CONF_ACTIVE_START_TRIGGER: trigger[const.TRIGGER_CONF_NAME],
        }
    )
    return coordinator


def _trigger(account_for_duration):
    return {
        const.TRIGGER_CONF_NAME: "Sunrise plus 30",
        const.TRIGGER_CONF_TYPE: const.TRIGGER_TYPE_SUNRISE,
        const.TRIGGER_CONF_ENABLED: True,
        const.TRIGGER_CONF_OFFSET_MINUTES: 30,
        const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: account_for_duration,
    }


@pytest.mark.asyncio
async def test_fixed_offset_trigger_is_registered_without_duration():
    """It fires at a fixed offset, so a zero duration is no reason to skip it."""
    coordinator = _coordinator(0, _trigger(account_for_duration=False))

    await coordinator.register_start_event()

    coordinator._register_trigger.assert_awaited_once()


@pytest.mark.asyncio
async def test_duration_aware_trigger_still_needs_a_duration():
    """Without a duration there is no start time to work back to."""
    coordinator = _coordinator(0, _trigger(account_for_duration=True))

    await coordinator.register_start_event()

    coordinator._register_trigger.assert_not_awaited()


@pytest.mark.asyncio
async def test_duration_aware_trigger_is_registered_when_there_is_water_to_give():
    coordinator = _coordinator(600, _trigger(account_for_duration=True))

    await coordinator.register_start_event()

    coordinator._register_trigger.assert_awaited_once()
