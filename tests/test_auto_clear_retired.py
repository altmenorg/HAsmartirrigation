"""The scheduled clearing of weather data is retired (kept off, deliberately).

It ran at a fixed time while the calculation time is the user's to choose, so
anyone who moved their calculation earlier lost every reading collected between
the two, every night, and their next calculation was short by that much
evaporation. The buffer no longer needs it: each zone records how far it has
read, the group is pruned to the slowest reader after every calculation, and
readings are capped at a week regardless.

The setting is still accepted so no stored configuration breaks, and the manual
clear-all action still works. It simply schedules nothing any more.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.async_update_config = AsyncMock()
    coordinator._track_auto_clear_time_unsub = None
    return coordinator


@pytest.mark.parametrize("enabled", [True, False])
async def test_it_never_registers_a_timer(enabled):
    coordinator = _coordinator()

    with patch(
        "custom_components.smart_irrigation.async_track_time_change"
    ) as track_time_change:
        await coordinator.set_up_auto_clear_time(
            {
                const.CONF_AUTO_CLEAR_ENABLED: enabled,
                const.CONF_CLEAR_TIME: "23:59",
            }
        )

    track_time_change.assert_not_called()
    assert coordinator._track_auto_clear_time_unsub is None


async def test_it_cancels_a_timer_left_over_from_an_earlier_setup():
    coordinator = _coordinator()
    unsub = MagicMock()
    coordinator._track_auto_clear_time_unsub = unsub

    await coordinator.set_up_auto_clear_time({const.CONF_AUTO_CLEAR_ENABLED: True})

    unsub.assert_called_once_with()
    assert coordinator._track_auto_clear_time_unsub is None


async def test_the_stored_configuration_is_still_saved():
    """This is on the save path: dropping the write would lose every setting."""
    coordinator = _coordinator()
    data = {const.CONF_AUTO_CLEAR_ENABLED: False, const.CONF_CALC_TIME: "18:55"}

    await coordinator.set_up_auto_clear_time(data)

    coordinator.store.async_update_config.assert_awaited_once_with(data)


async def test_an_invalid_clear_time_is_no_longer_fatal():
    """It used to raise, which took the whole config save down with it."""
    coordinator = _coordinator()

    await coordinator.set_up_auto_clear_time(
        {const.CONF_AUTO_CLEAR_ENABLED: True, const.CONF_CLEAR_TIME: "not a time"}
    )

    assert coordinator.store.async_update_config.await_count == 1
