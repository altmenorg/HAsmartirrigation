"""A valve entity per zone (finding 22 of #982)."""

import inspect
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.components.valve import ValveDeviceClass, ValveEntityFeature
from homeassistant.exceptions import ServiceValidationError
from pytest_homeassistant_custom_component.common import MockEntityPlatform

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.valve import SmartIrrigationZoneValve

LINKED = "switch.lawn_valve"


def _coordinator(zone=None, direct=True):
    coordinator = MagicMock()
    coordinator.store.get_zone = MagicMock(
        return_value=(
            {
                const.ZONE_ID: 1,
                const.ZONE_NAME: "Lawn",
                const.ZONE_LINKED_ENTITY: LINKED,
                const.ZONE_DURATION: 600,
                const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            }
            if zone is None
            else zone
        )
    )
    setattr(coordinator.store.config, const.CONF_DIRECT_VALVE_CONTROL_ENABLED, direct)
    coordinator.async_water_zone_now = MagicMock(return_value="the run")
    coordinator._spawn_valve_run = MagicMock()
    coordinator.async_stop_watering = AsyncMock(return_value=[1])
    coordinator._close_valve = AsyncMock(return_value=True)
    return coordinator


async def _valve(hass, coordinator, linked_state="off"):
    hass.data[const.DOMAIN] = {"coordinator": coordinator}
    if linked_state is not None:
        hass.states.async_set(LINKED, linked_state)
    platform = MockEntityPlatform(hass, domain="valve", platform_name=const.DOMAIN)
    valve = SmartIrrigationZoneValve(hass, "valve.smart_irrigation_lawn", 1, "Lawn")
    valve._attr_device_info = None
    type(valve).device_info = property(lambda self: None)
    await platform.async_add_entities([valve])
    return valve


@pytest.fixture(autouse=True)
def _restore_device_info():
    original = SmartIrrigationZoneValve.device_info
    yield
    SmartIrrigationZoneValve.device_info = original


def test_it_is_a_water_valve_that_opens_and_closes():
    valve = SmartIrrigationZoneValve(MagicMock(), "valve.x", 1, "Lawn")
    assert valve.device_class == ValveDeviceClass.WATER
    assert valve.supported_features == (
        ValveEntityFeature.OPEN | ValveEntityFeature.CLOSE
    )
    assert valve.reports_position is False
    assert valve.unique_id == f"{const.DOMAIN}_1_valve"


async def test_it_shows_the_linked_valve(hass):
    valve = await _valve(hass, _coordinator())
    assert hass.states.get(valve.entity_id).state == "closed"

    hass.states.async_set(LINKED, "on")
    await hass.async_block_till_done()

    state = hass.states.get(valve.entity_id)
    assert state.state == "open"
    assert state.attributes["zone_id"] == 1
    assert state.attributes["linked_entity"] == LINKED


async def test_it_is_unavailable_without_direct_valve_control(hass):
    valve = await _valve(hass, _coordinator(direct=False))
    assert hass.states.get(valve.entity_id).state == "unavailable"


async def test_it_is_unavailable_without_a_linked_valve(hass):
    zone = {const.ZONE_ID: 1, const.ZONE_NAME: "Lawn", const.ZONE_DURATION: 600}
    valve = await _valve(hass, _coordinator(zone=zone), linked_state=None)
    assert hass.states.get(valve.entity_id).state == "unavailable"


async def test_open_waters_the_zone_for_its_duration(hass):
    coordinator = _coordinator()
    valve = await _valve(hass, coordinator)

    await valve.async_open_valve()

    coordinator.async_water_zone_now.assert_called_once_with(1)
    coordinator._spawn_valve_run.assert_called_once_with("the run")


@pytest.mark.parametrize(
    ("change", "words"),
    [
        ({const.ZONE_DURATION: 0}, "nothing to water"),
        ({const.ZONE_STATE: const.ZONE_STATE_DISABLED}, "disabled"),
    ],
)
async def test_open_says_why_it_cannot(hass, change, words):
    coordinator = _coordinator()
    valve = await _valve(hass, coordinator)
    zone = dict(coordinator.store.get_zone.return_value, **change)
    coordinator.store.get_zone.return_value = zone

    with pytest.raises(ServiceValidationError, match=words):
        await valve.async_open_valve()
    coordinator._spawn_valve_run.assert_not_called()


async def test_close_stops_the_zones_run(hass):
    coordinator = _coordinator()
    valve = await _valve(hass, coordinator, linked_state="on")

    await valve.async_close_valve()

    coordinator.async_stop_watering.assert_awaited_once_with([1])
    coordinator._close_valve.assert_not_awaited()


async def test_close_closes_a_valve_opened_from_outside(hass):
    """No run of ours to stop, the valve open by hand: close closes it."""
    coordinator = _coordinator()
    coordinator.async_stop_watering = AsyncMock(return_value=[])
    valve = await _valve(hass, coordinator, linked_state="on")

    await valve.async_close_valve()

    coordinator._close_valve.assert_awaited_once()
    assert coordinator._close_valve.await_args.args[1] == LINKED


async def test_close_leaves_a_closed_valve_alone(hass):
    coordinator = _coordinator()
    coordinator.async_stop_watering = AsyncMock(return_value=[])
    valve = await _valve(hass, coordinator, linked_state="off")

    await valve.async_close_valve()

    coordinator._close_valve.assert_not_awaited()


def test_the_platform_is_set_up_and_unloaded():
    from custom_components.smart_irrigation import async_setup_entry, async_unload_entry

    assert '"valve"' in inspect.getsource(async_setup_entry)
    assert '"valve"' in inspect.getsource(async_unload_entry)
