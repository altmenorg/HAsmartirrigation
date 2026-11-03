"""The master switch: off, the readings go on and nothing else does (#960).

Off, Smart Irrigation keeps taking its weather readings and keeps its sensors,
but calculates nothing, leaves every bucket as it is, opens no valve, by direct
valve control or by hand, and runs no program of the full controller. Switched
on again, what the weather did meanwhile is not counted.
"""

import asyncio
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.master_switch import irrigation_off
from custom_components.smart_irrigation.store import Config
from custom_components.smart_irrigation.switch import SmartIrrigationEnabledSwitch
from custom_components.smart_irrigation.triggers import TriggersMixin
from tests.runner_doubles import REAL_SLEEP, Coordinator, make_hass, make_store, zone
from tests.test_manual_runs import _setup, _two_programs
from tests.test_program_status import (
    _paris_clock,  # noqa: F401
    _program,
    _status,
)


async def _settle():
    for _ in range(30):
        await REAL_SLEEP(0)


def _switched_off(store):
    store.config.irrigation_enabled = False
    return store


# --- the setting ----------------------------------------------------------------


def test_it_is_on_unless_it_says_it_is_off():
    assert irrigation_off({const.CONF_IRRIGATION_ENABLED: False})
    assert not irrigation_off({const.CONF_IRRIGATION_ENABLED: True})
    assert not irrigation_off({})
    assert not irrigation_off(None)
    assert not irrigation_off(SimpleNamespace())
    assert irrigation_off(SimpleNamespace(irrigation_enabled=False))


def test_it_reads_the_config_through_the_store():
    store = SimpleNamespace(config=SimpleNamespace(irrigation_enabled=False))

    assert irrigation_off(store)


def test_a_new_installation_and_an_existing_one_are_on():
    assert Config().irrigation_enabled is True


# --- nothing is calculated --------------------------------------------------------


async def test_off_calculates_no_zone():
    hass = make_hass()
    store = _switched_off(make_store([zone(0)]))
    coord = Coordinator(hass, store)

    assert await coord._async_calculate_all() == {}
    assert await coord.async_calculate_zone(0, {}) is None

    store.async_get_zones.assert_not_awaited()
    store.async_update_zone.assert_not_awaited()
    assert store.by_id[0][const.ZONE_BUCKET] == -3.0


# --- no valve opens -----------------------------------------------------------------


async def test_off_the_start_opens_no_valve():
    hass = make_hass()
    coord = Coordinator(hass, _switched_off(make_store([zone(0), zone(1)])))

    await coord.async_run_direct_valves()

    assert hass.calls == []


async def test_off_a_zone_is_not_watered_by_hand(monkeypatch):
    hass, coord, _sleeps = _setup(monkeypatch, _two_programs())
    _switched_off(coord.store)

    assert await coord.async_water_zone_now(0, 60) is False
    await _settle()

    assert hass.calls == []


async def test_off_no_program_runs(monkeypatch):
    hass, coord, _sleeps = _setup(monkeypatch, _two_programs())
    _switched_off(coord.store)

    assert await coord.async_run_program("night") is False
    await _settle()

    assert hass.calls == []


async def test_off_the_start_trigger_fires_the_skip_and_not_the_start():
    coord = SimpleNamespace(
        store=SimpleNamespace(config=SimpleNamespace(irrigation_enabled=False)),
        hass=SimpleNamespace(bus=Mock(), async_create_task=asyncio.ensure_future),
        _fired_triggers_today=set(),
        _prepare_watering_for_today=AsyncMock(),
    )

    TriggersMixin._fire_start_event(coord, {const.TRIGGER_CONF_NAME: "Sunrise"})
    await _settle()

    [call] = coord.hass.bus.fire.call_args_list
    assert call.args[0] == f"{const.DOMAIN}_{const.EVENT_IRRIGATE_SKIPPED}"
    assert call.args[1]["reason"] == "irrigation_off"
    coord._prepare_watering_for_today.assert_not_awaited()


async def test_off_a_restart_closes_what_it_interrupted_rather_than_resume_it():
    hass = make_hass()
    store = _switched_off(make_store([zone(0)]))
    store.config.active_valve_runs = [
        {
            const.RUN_ZONE_ID: 0,
            const.RUN_ENTITY_ID: "switch.zone_0",
            const.RUN_STARTED: datetime.now().isoformat(),
            const.RUN_DURATION: 300,
        }
    ]
    store.config.active_cycle = None
    store.config.active_program_run = None
    coord = Coordinator(hass, store)

    await coord.async_resume_valve_runs()
    await _settle()

    assert hass.calls == [("turn_off", "switch.zone_0")]
    [changes] = [c.args[0] for c in store.async_update_config.await_args_list]
    assert changes[const.CONF_ACTIVE_VALVE_RUNS] == []
    assert changes[const.CONF_ACTIVE_CYCLE] is None
    assert changes[const.CONF_ACTIVE_PROGRAM_RUN] is None


# --- what the panel shows -------------------------------------------------------------


async def test_off_the_planning_lists_nothing():
    _hass, coord = _status([_program([{"time": "06:00"}])])
    coord.store.config.irrigation_enabled = False

    assert await coord.async_planning(3) == []


# --- switching it ---------------------------------------------------------------------


async def test_switched_on_the_weather_of_the_time_off_is_not_counted():
    store = make_store([zone(0), zone(1)])
    coord = SimpleNamespace(store=store)

    await SmartIrrigationCoordinator._start_windows_now(coord)

    for stored in store.by_id.values():
        assert isinstance(stored[const.ZONE_LAST_CONSUMED_AT], datetime)
        assert stored[const.ZONE_PRECIPITATION_SUPERSEDED] == 0.0


async def test_the_switch_entity_reads_and_writes_the_setting():
    hass = Mock()
    coordinator = Mock()
    coordinator.store.get_config = lambda: {const.CONF_IRRIGATION_ENABLED: False}
    coordinator.async_update_config = AsyncMock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    switch = SmartIrrigationEnabledSwitch(hass)
    switch.async_write_ha_state = Mock()

    switch._recompute()
    assert switch.is_on is False
    assert switch.entity_id == "switch.smart_irrigation_irrigation_enabled"

    await switch.async_turn_on()

    coordinator.async_update_config.assert_awaited_once_with(
        {const.CONF_IRRIGATION_ENABLED: True}
    )
