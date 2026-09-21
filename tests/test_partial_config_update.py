"""A caller may send only the setting it changed.

The switch and number entities do, and the REST schema for the configuration
marks every key optional. The schedulers underneath indexed the fields they
needed directly, and the calculation scheduler cancelled its tracker before
reading them. So a one-key update raised a KeyError with the nightly
calculation already unregistered, nothing re-registered it, and the automatic
calculation stopped until Home Assistant restarted (#844).

The update scheduler had a quieter version of the same thing: with only the
changed field, it saw continuous updates as unset and dropped every sensor
subscription.

These call the real async_update_config. The entity tests replace it with a
mock and assert the one-key payload they send, which states the contract
without ever running the code that broke it.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const

STORED = {
    const.CONF_AUTO_CALC_ENABLED: True,
    const.CONF_CALC_TIME: "23:00",
    const.CONF_AUTO_UPDATE_ENABLED: True,
    const.CONF_AUTO_UPDATE_SCHEDULE: "hour",
    const.CONF_AUTO_UPDATE_INTERVAL: 1,
    const.CONF_CONTINUOUS_UPDATES: True,
    const.CONF_AUTO_CLEAR_ENABLED: False,
    const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: False,
    const.CONF_PRECIPITATION_THRESHOLD_MM: 2.0,
}


def _coordinator():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    coordinator.store = MagicMock()
    coordinator.store.get_config = MagicMock(return_value=dict(STORED))
    coordinator.store.async_update_config = AsyncMock()
    coordinator.use_weather_service = False
    coordinator._track_auto_calc_time_unsub = MagicMock()
    coordinator._track_auto_update_time_unsub = None
    coordinator._track_auto_update_delay_unsub = None
    coordinator._track_auto_clear_time_unsub = None
    coordinator.update_subscriptions = AsyncMock()
    coordinator.async_setup_observed_watering = AsyncMock()
    coordinator.register_start_event = AsyncMock()
    return coordinator


async def _update(coordinator, changes):
    with (
        patch(
            "custom_components.smart_irrigation.async_track_time_change",
            return_value=MagicMock(name="calc_tracker"),
        ) as track,
        patch("custom_components.smart_irrigation.async_call_later"),
        patch("custom_components.smart_irrigation.async_dispatcher_send"),
    ):
        await coordinator.async_update_config(changes)
    return track


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "changes",
    [
        {const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: True},
        {const.CONF_PRECIPITATION_THRESHOLD_MM: 5.0},
        {const.CONF_CALC_TIME: "03:00"},
    ],
    ids=["skip switch", "threshold number", "REST calctime"],
)
async def test_a_one_key_update_keeps_the_nightly_calculation(changes):
    """The bug, stated as a test, for each caller that sends a partial payload."""
    coordinator = _coordinator()

    track = await _update(coordinator, dict(changes))

    # Rescheduled, not left cancelled.
    assert track.called
    assert coordinator._track_auto_calc_time_unsub is not None


@pytest.mark.asyncio
async def test_the_calculation_follows_the_new_time():
    coordinator = _coordinator()

    track = await _update(coordinator, {const.CONF_CALC_TIME: "03:00"})

    kwargs = track.call_args.kwargs
    assert (kwargs["hour"], kwargs["minute"]) == ("03", "00")


@pytest.mark.asyncio
async def test_only_the_change_is_written():
    """Reading the whole configuration must not mean writing it back.

    Other writers own fields of their own, such as the valve runs recorded
    while a run is under way, and a snapshot written over them would revert
    them.
    """
    coordinator = _coordinator()
    changes = {const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: True}

    await _update(coordinator, dict(changes))

    for call in coordinator.store.async_update_config.await_args_list:
        assert set(call.args[0]) <= set(changes), call.args[0]


@pytest.mark.asyncio
async def test_a_partial_update_keeps_the_sensor_subscriptions():
    """The quieter half: continuous updates read as unset dropped them all."""
    coordinator = _coordinator()

    await _update(coordinator, {const.CONF_PRECIPITATION_THRESHOLD_MM: 5.0})

    seen = coordinator.update_subscriptions.await_args.args[0]
    assert seen[const.CONF_CONTINUOUS_UPDATES] is True
