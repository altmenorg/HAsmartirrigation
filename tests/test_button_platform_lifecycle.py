"""Enabling valve control and reloading must not require a Core restart."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation import button as button_platform
from custom_components.smart_irrigation import number as number_platform

ZONE = {"id": 1, "name": "Roses"}


@pytest.fixture
def platform():
    """Collect actual entities and dispatch callbacks without opening valves."""
    hass = MagicMock()
    hass.states.get.return_value = None
    config = SimpleNamespace(direct_valve_control_enabled=False)
    store = MagicMock(config=config)
    store.get_zone.side_effect = lambda zid: ZONE if zid == ZONE["id"] else None
    coordinator = MagicMock(store=store)
    hass.data = {const.DOMAIN: {"zones": {}, "coordinator": coordinator}}
    return SimpleNamespace(hass=hass, config=config, entities=[], listeners={})


def _connect(platform, monkeypatch, module):
    def connect(hass, signal, callback):
        platform.listeners.setdefault(signal, []).append(callback)
        return lambda: platform.listeners[signal].remove(callback)

    monkeypatch.setattr(module, "async_dispatcher_connect", connect)


def _send(platform, signal, *args):
    for callback in list(platform.listeners.get(const.DOMAIN + signal, [])):
        callback(*args)


def _watering(platform):
    return [entity for entity in platform.entities if "irrigate" in entity.unique_id]


@pytest.mark.asyncio
async def test_enabling_control_adds_existing_and_future_zone_buttons_once(
    platform, monkeypatch
):
    _connect(platform, monkeypatch, button_platform)
    entry = MagicMock()
    await button_platform.async_setup_entry(
        platform.hass, entry, platform.entities.extend
    )
    _send(platform, "_register_entity", ZONE)
    assert not _watering(platform)

    platform.config.direct_valve_control_enabled = True
    _send(platform, "_config_updated")
    assert {entity.unique_id for entity in _watering(platform)} == {
        "smart_irrigation_irrigate_all",
        "smart_irrigation_1_irrigate_now",
    }
    _send(platform, "_config_updated")
    _send(platform, "_config_updated", ZONE["id"])
    _send(platform, "_register_entity", ZONE)
    assert len(_watering(platform)) == 2

    _send(platform, "_register_entity", {"id": 2, "name": "Lawn"})
    assert len(_watering(platform)) == 3
    platform.hass.services.async_call.assert_not_called()
    platform.hass.async_create_task.assert_not_called()


@pytest.mark.asyncio
async def test_watering_availability_follows_toggle_without_replacing_entities(
    platform, monkeypatch
):
    _connect(platform, monkeypatch, button_platform)
    platform.config.direct_valve_control_enabled = True
    await button_platform.async_setup_entry(
        platform.hass, MagicMock(), platform.entities.extend
    )
    _send(platform, "_register_entity", ZONE)
    buttons = _watering(platform)
    assert len(buttons) == 2
    remove_callbacks = []
    for entity in buttons:
        entity.hass = platform.hass
        entity.async_schedule_update_ha_state = MagicMock()
        entity.async_on_remove = remove_callbacks.append
        await entity.async_added_to_hass()
        assert entity.available

    for enabled in (False, True, False, True):
        platform.config.direct_valve_control_enabled = enabled
        _send(platform, "_config_updated")
        assert _watering(platform) == buttons
        assert all(entity.available is enabled for entity in buttons)
    for entity in buttons:
        assert entity.async_schedule_update_ha_state.call_count == 4
    for unsubscribe in remove_callbacks:
        unsubscribe()
    assert len(platform.listeners[const.DOMAIN + "_config_updated"]) == 1
    platform.hass.services.async_call.assert_not_called()


@pytest.mark.asyncio
@pytest.mark.parametrize("module", [button_platform, number_platform])
async def test_reload_recreates_all_zone_entities(platform, monkeypatch, module):
    _connect(platform, monkeypatch, module)
    platform.config.direct_valve_control_enabled = True
    entry = MagicMock()
    unload_callbacks = []
    entry.async_on_unload.side_effect = unload_callbacks.append
    await module.async_setup_entry(platform.hass, entry, platform.entities.extend)
    _send(platform, "_register_entity", ZONE)
    expected_ids = [entity.unique_id for entity in platform.entities]
    assert any("_1_" in unique_id for unique_id in expected_ids)

    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = platform.hass
    coordinator._subscriptions = []
    coordinator._track_irrigation_triggers_unsub = []
    coordinator._debounced_update_cancel = {}
    for name in (
        "async_teardown_observed_watering",
        "async_teardown_weather_liveness",
        "async_teardown_zone_unwatered_watch",
        "async_teardown_valve_runs",
        "async_teardown_program_schedules",
    ):
        setattr(coordinator, name, MagicMock())
    coordinator.async_wait_valve_runs = AsyncMock()

    for _ in range(2):
        for unsubscribe in unload_callbacks:
            unsubscribe()
        unload_callbacks.clear()
        await coordinator.async_unload()
        platform.entities.clear()
        await module.async_setup_entry(platform.hass, entry, platform.entities.extend)
        _send(platform, "_register_entity", ZONE)
        _send(platform, "_register_entity", ZONE)
        assert [entity.unique_id for entity in platform.entities] == expected_ids
    platform.hass.services.async_call.assert_not_called()
