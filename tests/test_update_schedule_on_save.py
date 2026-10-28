"""Saving the configuration does not take a weather reading (#955).

Every save of the configuration set the update schedule up again: a program
edited in the panel, a switch flipped, anything. Setting it up took a reading
of every sensor group at once and restarted the interval, so somebody editing
for three minutes got 25 identical readings, less than a second apart, in each
group, and the hourly readings moved to whenever the last edit was.

The schedule is now set up again only when it changes.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const

HOURLY = {
    const.CONF_AUTO_UPDATE_ENABLED: True,
    const.CONF_AUTO_UPDATE_SCHEDULE: const.CONF_AUTO_UPDATE_HOURLY,
    const.CONF_AUTO_UPDATE_INTERVAL: "1",
    const.CONF_AUTO_UPDATE_DELAY: "0",
}


def _coordinator(config=None):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.get_config = MagicMock(return_value={**HOURLY, **(config or {})})
    coordinator.store.async_update_config = AsyncMock()
    coordinator.update_subscriptions = AsyncMock()
    coordinator._warn_if_update_interval_undersamples_rain = MagicMock()
    coordinator._track_auto_update_time_unsub = None
    coordinator._track_auto_update_delay_unsub = None
    coordinator._auto_update_schedule = None
    return coordinator


async def _save(coordinator, changes, later):
    with patch("custom_components.smart_irrigation.async_call_later", later):
        await coordinator.set_up_auto_update_time(changes)


def _armed():
    """async_call_later as a mock that returns a cancel handle."""
    return MagicMock(side_effect=lambda *a, **k: MagicMock())


@pytest.mark.asyncio
async def test_saves_that_do_not_touch_the_schedule_take_no_reading():
    coordinator = _coordinator()
    later = _armed()

    await _save(coordinator, {}, later)  # setup
    for _ in range(25):
        await _save(coordinator, {const.CONF_PROGRAMS: []}, later)

    assert later.call_count == 1


@pytest.mark.asyncio
async def test_a_change_of_interval_sets_the_schedule_up_again():
    coordinator = _coordinator()
    later = _armed()

    await _save(coordinator, {}, later)
    await _save(coordinator, {const.CONF_AUTO_UPDATE_INTERVAL: "2"}, later)

    assert later.call_count == 2


@pytest.mark.asyncio
async def test_a_change_of_schedule_or_delay_sets_it_up_again():
    coordinator = _coordinator()
    later = _armed()

    await _save(coordinator, {}, later)
    await _save(
        coordinator,
        {const.CONF_AUTO_UPDATE_SCHEDULE: const.CONF_AUTO_UPDATE_MINUTELY},
        later,
    )
    await _save(coordinator, {const.CONF_AUTO_UPDATE_DELAY: "30"}, later)

    assert later.call_count == 3


@pytest.mark.asyncio
async def test_nothing_armed_yet_is_set_up_whatever_the_schedule():
    """At startup, or after the updates were switched off and on again."""
    coordinator = _coordinator()
    coordinator._auto_update_schedule = ("hours", "1", "0")
    later = _armed()

    await _save(coordinator, {}, later)

    assert later.call_count == 1


@pytest.mark.asyncio
async def test_the_subscriptions_are_still_refreshed_on_every_save():
    """They follow the sensor groups and continuous updates, not the timer."""
    coordinator = _coordinator()
    later = _armed()

    await _save(coordinator, {}, later)
    await _save(coordinator, {const.CONF_PROGRAMS: []}, later)

    assert coordinator.update_subscriptions.await_count == 2
