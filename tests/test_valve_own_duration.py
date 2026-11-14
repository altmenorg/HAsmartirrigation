"""A valve that closes by itself after its own duration (Gardena).

Opened by Smart Irrigation, a Gardena valve is sent "open for N seconds", N
being its "watering duration" number: 1 min unless changed. A 40 min pass then
watered for one minute while the run went on counting it as open. The zone can
name that number; the pass's length plus the safety margin is written to it
before each open.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import SmartIrrigationStorage
from custom_components.smart_irrigation.valve_runner import ValveRunnerMixin

GARDENA = "number.garden_hedges_watering_duration"


def _runner(attributes=None, exists=True):
    class _Runner(ValveRunnerMixin):
        pass

    runner = _Runner()
    runner.hass = MagicMock()
    runner.hass.services.async_call = AsyncMock()
    runner.hass.states.get.return_value = (
        SimpleNamespace(
            state="1",
            attributes=(
                attributes
                if attributes is not None
                else {"unit_of_measurement": "min", "min": 1, "max": 1440, "step": 1}
            ),
        )
        if exists
        else None
    )
    return runner


def _written(runner):
    call = runner.hass.services.async_call.await_args
    domain, service, data = call.args[:3]
    return domain, service, data["entity_id"], data["value"]


@pytest.mark.asyncio
async def test_the_pass_and_its_margin_are_written_in_minutes_before_the_open():
    runner = _runner()

    await runner._set_valve_duration({const.ZONE_SAFETY_OFF_ENTITY: GARDENA}, 2400)

    # 2400 s + 30 s is 40.5 min: rounded up to the number's step.
    assert _written(runner) == ("number", "set_value", GARDENA, 41)


@pytest.mark.asyncio
async def test_a_number_in_seconds_gets_seconds():
    runner = _runner({"unit_of_measurement": "s", "min": 0, "max": 86400, "step": 1})

    await runner._set_valve_duration(
        {const.ZONE_SAFETY_OFF_ENTITY: "input_number.valve_seconds"}, 90.2
    )

    assert _written(runner) == (
        "input_number",
        "set_value",
        "input_number.valve_seconds",
        121,
    )


@pytest.mark.asyncio
async def test_a_pass_longer_than_the_valve_allows_gets_its_maximum(caplog):
    runner = _runner({"unit_of_measurement": "min", "min": 1, "max": 60, "step": 1})

    await runner._set_valve_duration({const.ZONE_SAFETY_OFF_ENTITY: GARDENA}, 7200)

    assert _written(runner)[3] == 60
    assert "will close before the pass ends" in caplog.text


@pytest.mark.asyncio
async def test_without_the_setting_nothing_is_written():
    runner = _runner()

    await runner._set_valve_duration({}, 600)

    runner.hass.services.async_call.assert_not_awaited()


@pytest.mark.asyncio
async def test_switched_off_safety_writes_nothing():
    runner = _runner()

    await runner._set_valve_duration(
        {
            const.ZONE_SAFETY_OFF_ENTITY: GARDENA,
            const.ZONE_SAFETY_OFF_MODE: const.SAFETY_OFF_MODE_OFF,
        },
        600,
    )

    runner.hass.services.async_call.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_missing_or_unitless_entity_never_stops_the_open(caplog):
    missing = _runner(exists=False)
    await missing._set_valve_duration({const.ZONE_SAFETY_OFF_ENTITY: GARDENA}, 600)
    missing.hass.services.async_call.assert_not_awaited()

    litres = _runner({"unit_of_measurement": "L"})
    await litres._set_valve_duration({const.ZONE_SAFETY_OFF_ENTITY: GARDENA}, 600)
    litres.hass.services.async_call.assert_not_awaited()
    assert "is not a duration" in caplog.text


@pytest.mark.asyncio
async def test_a_failed_write_never_stops_the_open():
    runner = _runner()
    runner.hass.services.async_call.side_effect = RuntimeError("cloud down")

    # No exception: the valve opens with its preset duration.
    await runner._set_valve_duration({const.ZONE_SAFETY_OFF_ENTITY: GARDENA}, 600)


@pytest.mark.asyncio
async def test_the_open_writes_the_duration_first():
    runner = _runner()
    order = []
    runner._set_valve_duration = AsyncMock(
        side_effect=lambda *a: order.append("duration")
    )
    runner._open_with_timer = AsyncMock(return_value=False)
    runner._async_call_valve_service = AsyncMock(
        side_effect=lambda *a: order.append("open")
    )
    runner._valve_services = lambda entity_id: ("valve", "open_valve", "close_valve")
    runner._zone_entities = lambda zone, primary: [primary]
    runner.store = SimpleNamespace(config=SimpleNamespace(full_controller=False))

    await runner._open_zone_valves(
        {const.ZONE_ID: 1}, "valve.hedges", None, timer_seconds=600
    )

    assert order == ["duration", "open"]
    runner._set_valve_duration.assert_awaited_once_with({const.ZONE_ID: 1}, 600)


@pytest.mark.asyncio
async def test_the_setting_survives_a_restart():
    storage = SmartIrrigationStorage.__new__(SmartIrrigationStorage)
    storage.hass = MagicMock()
    storage.hass.config.units = METRIC_SYSTEM
    zone = {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Hedges",
        const.ZONE_SIZE: 27.0,
        const.ZONE_THROUGHPUT: 1.4,
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_DELTA: 0.0,
        const.ZONE_BUCKET: 0.0,
        const.ZONE_DURATION: 0,
        const.ZONE_MODULE: 1,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_MAPPING: 1,
        const.ZONE_LEAD_TIME: 0.0,
        const.ZONE_SAFETY_OFF_ENTITY: GARDENA,
    }
    await storage._populate_from_data(
        {"config": {}, "zones": [zone], "modules": [], "mappings": []}
    )

    assert storage.zones[1].safety_off_entity == GARDENA
