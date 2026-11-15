"""A program can be switched on and off from a dashboard or an automation.

"Program on" was only in the panel and behind the ``set_program_enabled``
action: a dashboard could not show it, nor an automation switch a program off
for the holidays with a plain ``switch.turn_off``. Each program now has a
switch beside its sensor; the main program has none, as it has no "Program on"
since "Calculate and water".
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from pytest_homeassistant_custom_component.common import MockEntityPlatform

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_switch import (
    SmartIrrigationProgramSwitch,
    async_setup_program_switches,
)


def _overview(program_id, name, state="idle", main=False):
    return {"program_id": program_id, "name": name, "main": main, "state": state}


class _Switch(SmartIrrigationProgramSwitch):
    device_info = None


async def _set_up(overviews):
    """Set the switches up against overviews handed out one by one."""
    answers = list(overviews)
    coordinator = MagicMock()
    coordinator.async_program_overview = AsyncMock(side_effect=lambda: answers.pop(0))
    coordinator.async_set_enabled = AsyncMock(return_value=True)
    hass = MagicMock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    tasks = []
    hass.async_create_task = lambda coro: tasks.append(asyncio.ensure_future(coro))
    added = []
    with patch(
        "custom_components.smart_irrigation.program_sensor.async_dispatcher_connect"
    ) as connect:
        await async_setup_program_switches(hass, MagicMock(), added.extend)
    changed = connect.call_args.args[2]

    async def _change():
        changed()
        await tasks[-1]

    return hass, coordinator, added, _change


async def test_every_program_but_the_main_one_has_a_switch():
    hass, _coordinator, added, _change = await _set_up(
        [
            [
                _overview("main", "Main program", main=True),
                _overview("evening", "Evening"),
                _overview("beds", "Beds", state="disabled"),
            ]
        ]
    )

    assert [s.entity_id for s in added] == [
        "switch.smart_irrigation_program_evening",
        "switch.smart_irrigation_program_beds",
    ]
    assert [s.is_on for s in added] == [True, False]


async def test_a_new_program_gets_its_switch_and_a_deleted_one_loses_it():
    first = [_overview("evening", "Evening")]
    second = [_overview("beds", "Beds")]
    hass, _coordinator, added, change = await _set_up([first, second])
    registry = MagicMock()
    registry.async_get.return_value = True

    with patch(
        "custom_components.smart_irrigation.program_sensor.er.async_get",
        return_value=registry,
    ):
        for switch in added:
            switch.hass = None  # not written to a state machine here
        await change()

    assert [s.entity_id for s in added] == [
        "switch.smart_irrigation_program_evening",
        "switch.smart_irrigation_program_beds",
    ]
    registry.async_remove.assert_called_once_with(
        "switch.smart_irrigation_program_evening"
    )
    assert set(hass.data[const.DOMAIN]["program_switches"]) == {"beds"}


async def test_the_switch_follows_the_panel():
    hass, _coordinator, added, change = await _set_up(
        [
            [_overview("evening", "Evening")],
            [_overview("evening", "Evening", "disabled")],
        ]
    )
    [switch] = added
    switch.hass = None

    await change()

    assert switch.is_on is False
    assert switch.icon == "mdi:calendar-blank"


@pytest.mark.parametrize(("turn", "enabled"), [("off", False), ("on", True)])
async def test_switching_saves_it_as_the_panel_does(turn, enabled):
    hass, coordinator, added, _change = await _set_up(
        [[_overview("evening", "Evening")]]
    )
    [switch] = added

    await getattr(switch, f"async_turn_{turn}")()

    coordinator.async_set_enabled.assert_awaited_once_with("evening", enabled)


async def test_no_switches_without_the_full_controller():
    # The overview is empty then, as for the program sensors.
    _hass, _coordinator, added, _change = await _set_up([[]])

    assert added == []


@pytest.mark.parametrize(
    ("language", "name"),
    [("en", "Program Evening on"), ("de", "Programm Evening an")],
)
async def test_the_name_is_translated_and_the_id_stays(hass, language, name):
    hass.config.language = language
    platform = MockEntityPlatform(hass, domain="switch", platform_name=const.DOMAIN)
    await platform.platform_data.async_load_translations()
    switch = _Switch(hass, _overview("evening", "Evening"))

    await platform.async_add_entities([switch])

    state = hass.states.get("switch.smart_irrigation_program_evening")
    assert state.attributes["friendly_name"] == name
    assert state.state == "on"
    assert state.attributes["program_id"] == "evening"


async def test_a_renamed_program_renames_its_switch(hass):
    platform = MockEntityPlatform(hass, domain="switch", platform_name=const.DOMAIN)
    await platform.platform_data.async_load_translations()
    switch = _Switch(hass, _overview("evening", "Evening"))
    await platform.async_add_entities([switch])

    switch.set_overview(_overview("evening", "Night"))
    await hass.async_block_till_done()

    state = hass.states.get("switch.smart_irrigation_program_evening")
    assert state.attributes["friendly_name"] == "Program Night on"
