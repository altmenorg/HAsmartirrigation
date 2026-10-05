"""Switching the full controller on, and what it carries with it."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.programs import (
    MAIN_PROGRAM_ID,
    default_main_program,
)


def _coordinator(programs=None):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    coordinator.store = MagicMock()
    coordinator.store.config = MagicMock()
    coordinator.store.config.programs = programs or []
    coordinator.store.get_config = MagicMock(return_value={})
    coordinator.store.async_update_config = AsyncMock()
    coordinator.use_weather_service = False
    coordinator._track_auto_calc_time_unsub = None
    coordinator._track_auto_update_time_unsub = None
    coordinator._track_auto_update_delay_unsub = None
    coordinator._track_auto_clear_time_unsub = None
    coordinator.update_subscriptions = AsyncMock()
    coordinator.async_setup_observed_watering = AsyncMock()
    coordinator.register_start_event = AsyncMock()
    # The schedulers are not what is under test.
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


@pytest.mark.asyncio
async def test_switching_it_on_drives_the_valves_and_makes_the_main_program():
    written = await _update(_coordinator(), {const.CONF_FULL_CONTROLLER: True})

    assert written[const.CONF_DIRECT_VALVE_CONTROL_ENABLED] is True
    assert written[const.CONF_PROGRAMS] == [default_main_program()]


@pytest.mark.asyncio
async def test_switching_it_on_keeps_the_programs_already_stored():
    stored = [
        {const.PROGRAM_ID: MAIN_PROGRAM_ID, const.PROGRAM_NAME: "Mine"},
        {const.PROGRAM_ID: "evening"},
    ]

    written = await _update(_coordinator(stored), {const.CONF_FULL_CONTROLLER: True})

    assert written[const.CONF_PROGRAMS] == stored


@pytest.mark.asyncio
async def test_switching_it_off_changes_nothing_else():
    written = await _update(_coordinator(), {const.CONF_FULL_CONTROLLER: False})

    assert written == {const.CONF_FULL_CONTROLLER: False}


@pytest.mark.asyncio
async def test_another_setting_does_not_touch_the_controller():
    written = await _update(_coordinator(), {const.CONF_SKIP_ON_WIND: True})

    assert const.CONF_PROGRAMS not in written
    assert const.CONF_DIRECT_VALVE_CONTROL_ENABLED not in written
