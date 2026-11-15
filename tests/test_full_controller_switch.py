"""Switching the full controller on, and what it carries with it."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.programs import MAIN_PROGRAM_ID


def _coordinator(programs=None):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    coordinator.store = MagicMock()
    coordinator.store.config = MagicMock()
    coordinator.store.config.programs = programs or []
    coordinator.store.get_config = MagicMock(return_value={})
    coordinator.store.async_update_config = AsyncMock()
    coordinator.store.async_get_zones = AsyncMock(
        return_value=[
            {const.ZONE_ID: 0, const.ZONE_LINKED_ENTITY: "switch.a"},
            # No valve: not watered by Smart Irrigation, not in a program.
            {const.ZONE_ID: 1},
            {const.ZONE_ID: 2, const.ZONE_LINKED_ENTITY: "switch.c"},
        ]
    )
    coordinator.hass.config.language = "fr"
    coordinator.use_weather_service = False
    coordinator._track_auto_calc_time_unsub = None
    coordinator._track_auto_update_time_unsub = None
    coordinator._track_auto_update_delay_unsub = None
    coordinator._track_auto_clear_time_unsub = None
    coordinator.update_subscriptions = AsyncMock()
    coordinator.async_setup_observed_watering = AsyncMock()
    coordinator.register_start_event = AsyncMock()
    coordinator._valve_run_tasks = set()
    coordinator.async_align_valves = AsyncMock()
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
async def test_switching_it_on_drives_the_valves_and_makes_a_first_program():
    coordinator = _coordinator()
    coordinator.store.config.zone_sequencing = const.CONF_ZONE_SEQUENCING_SEQUENTIAL
    coordinator.store.config.watering_passes = 2
    coordinator.store.config.pause_between_zones = 30

    written = await _update(coordinator, {const.CONF_FULL_CONTROLLER: True})

    assert written[const.CONF_DIRECT_VALVE_CONTROL_ENABLED] is True
    [first] = written[const.CONF_PROGRAMS]
    # An ordinary program, named in the language of Home Assistant, that waters
    # the zones with a valve as the general settings order them: nothing is
    # left watering nothing.
    assert first[const.PROGRAM_NAME] == "Arrosage"
    assert "main" not in first and "enabled" not in first
    assert [s["zones"] for s in first["steps"]] == [[0], [2]]
    assert [s["delay"] for s in first["steps"]] == [30.0, None]
    assert [s["passes"] for s in first["steps"]] == [2, 2]
    # Started by its schedules: it gets the start trigger's moment, done by
    # sunrise by default (one_choice.py).
    [schedule] = first["schedules"]
    assert (schedule["type"], schedule["event"], schedule["anchor"]) == (
        "sun",
        "sunrise",
        "end",
    )


@pytest.mark.asyncio
async def test_switching_it_on_keeps_the_programs_already_stored():
    stored = [
        {const.PROGRAM_ID: MAIN_PROGRAM_ID, const.PROGRAM_NAME: "Mine"},
        {const.PROGRAM_ID: "evening"},
    ]

    written = await _update(_coordinator(stored), {const.CONF_FULL_CONTROLLER: True})

    # Left as they are stored: no first program is added beside them.
    assert const.CONF_PROGRAMS not in written


@pytest.mark.asyncio
async def test_switching_it_off_changes_nothing_else():
    written = await _update(_coordinator(), {const.CONF_FULL_CONTROLLER: False})

    assert written == {const.CONF_FULL_CONTROLLER: False}


@pytest.mark.asyncio
async def test_another_setting_does_not_touch_the_controller():
    written = await _update(_coordinator(), {const.CONF_SKIP_ON_WIND: True})

    assert const.CONF_PROGRAMS not in written
    assert const.CONF_DIRECT_VALVE_CONTROL_ENABLED not in written


@pytest.mark.asyncio
async def test_supplies_are_cleaned_before_they_are_stored():
    written = await _update(
        _coordinator(),
        {
            const.CONF_SUPPLIES: [
                {"name": "Pump", "entities": "switch.pump", "delay_before": "3"},
                "junk",
            ]
        },
    )

    [supply] = written[const.CONF_SUPPLIES]
    assert supply[const.SUPPLY_ID] == "pump"
    assert supply[const.SUPPLY_ENTITIES] == ["switch.pump"]
    assert supply[const.SUPPLY_DELAY_BEFORE] == 3.0


@pytest.mark.asyncio
async def test_valve_control_cannot_be_switched_off_under_the_full_controller():
    coordinator = _coordinator()
    coordinator.store.config.full_controller = True

    written = await _update(
        coordinator, {const.CONF_DIRECT_VALVE_CONTROL_ENABLED: False}
    )

    assert written[const.CONF_DIRECT_VALVE_CONTROL_ENABLED] is True


@pytest.mark.asyncio
async def test_both_can_be_switched_off_together():
    coordinator = _coordinator()
    coordinator.store.config.full_controller = True

    written = await _update(
        coordinator,
        {
            const.CONF_FULL_CONTROLLER: False,
            const.CONF_DIRECT_VALVE_CONTROL_ENABLED: False,
        },
    )

    assert written[const.CONF_DIRECT_VALVE_CONTROL_ENABLED] is False
