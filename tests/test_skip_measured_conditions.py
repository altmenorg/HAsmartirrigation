"""The conditions measured at the start of a run: rain sensor, freeze, wind and
each zone's soil moisture.

Each is off by default and changes nothing until switched on. A sensor that
cannot be read, or a check that fails outright, leaves the run exactly as it
would be without it: the report says the check could not be evaluated, and
watering goes ahead, as it does when the forecast cannot be read.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    WIND_10M_TO_2M,
)


class _State:
    def __init__(self, state, unit=None):
        self.state = state
        self.attributes = {"unit_of_measurement": unit} if unit else {}


def _coordinator(config=None, states=None, zones=None, units=METRIC_SYSTEM, now=None):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = units
    coordinator.hass.states.get = lambda entity_id: (states or {}).get(entity_id)
    coordinator.hass.async_add_executor_job = AsyncMock(
        side_effect=lambda func, *args: func(*args)
    )
    coordinator.store = MagicMock()
    coordinator.store.async_get_config = AsyncMock(return_value=config or {})
    coordinator.store.async_get_zones = AsyncMock(return_value=zones or [])
    coordinator.store.async_update_zone = AsyncMock()
    if now is None:
        coordinator._WeatherServiceClient = None
    else:
        client = MagicMock()
        client.get_data = MagicMock(return_value=now)
        coordinator._WeatherServiceClient = client
    return coordinator


def _check(evaluation, check_id):
    return next(c for c in evaluation["checks"] if c["id"] == check_id)


async def _evaluate(**kwargs):
    return await _coordinator(**kwargs).async_evaluate_skip_conditions()


FREEZE = {const.CONF_SKIP_ON_FREEZE: True, const.CONF_FREEZE_SENSOR: "sensor.t"}
WIND = {const.CONF_SKIP_ON_WIND: True, const.CONF_WIND_SENSOR: "sensor.w"}
RAIN = {const.CONF_SKIP_ON_RAIN_SENSOR: True, const.CONF_RAIN_SENSOR: "binary.r"}


# --- off by default ---------------------------------------------------------


@pytest.mark.asyncio
async def test_off_they_change_nothing_even_with_a_frozen_windy_wet_morning():
    states = {
        "sensor.t": _State("-5", "°C"),
        "sensor.w": _State("80", "km/h"),
        "binary.r": _State("on"),
    }
    config = {
        const.CONF_FREEZE_SENSOR: "sensor.t",
        const.CONF_WIND_SENSOR: "sensor.w",
        const.CONF_RAIN_SENSOR: "binary.r",
    }

    evaluation = await _evaluate(config=config, states=states)

    assert evaluation["should_skip"] is False
    for check_id in ("freeze", "wind", "rain_sensor"):
        assert _check(evaluation, check_id)["enabled"] is False


# --- freeze -----------------------------------------------------------------


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("reading", "skips"), [("1.0", True), ("2.0", True), ("2.1", False)]
)
async def test_freeze_at_or_below_the_default_threshold(reading, skips):
    evaluation = await _evaluate(
        config=FREEZE, states={"sensor.t": _State(reading, "°C")}
    )

    freeze = _check(evaluation, "freeze")
    assert freeze["threshold"] == const.CONF_DEFAULT_FREEZE_THRESHOLD_C
    assert freeze["skip"] is skips
    assert evaluation["reason"] == ("freeze" if skips else None)


@pytest.mark.asyncio
async def test_freeze_converts_a_fahrenheit_sensor_on_a_metric_install():
    """33.8 F is 1 C, below the 2 C default."""
    evaluation = await _evaluate(
        config=FREEZE, states={"sensor.t": _State("33.8", "°F")}
    )

    freeze = _check(evaluation, "freeze")
    assert freeze["value"] == pytest.approx(1.0)
    assert freeze["skip"] is True


@pytest.mark.asyncio
async def test_freeze_uses_fahrenheit_on_an_imperial_install():
    evaluation = await _evaluate(
        config=FREEZE,
        states={"sensor.t": _State("35", "°F")},
        units=US_CUSTOMARY_SYSTEM,
    )

    freeze = _check(evaluation, "freeze")
    assert freeze["threshold"] == const.CONF_DEFAULT_FREEZE_THRESHOLD_F
    assert freeze["unit"] == "°F"
    assert freeze["skip"] is True


@pytest.mark.asyncio
async def test_freeze_honours_a_threshold_of_its_own():
    evaluation = await _evaluate(
        config={**FREEZE, const.CONF_FREEZE_THRESHOLD: 5.0},
        states={"sensor.t": _State("4", "°C")},
    )

    assert _check(evaluation, "freeze")["skip"] is True


@pytest.mark.asyncio
async def test_freeze_without_a_sensor_reads_the_weather_service():
    config = {
        const.CONF_SKIP_ON_FREEZE: True,
        const.CONF_USE_WEATHER_SERVICE: True,
    }

    evaluation = await _evaluate(config=config, now={const.MAPPING_TEMPERATURE: 0.5})

    freeze = _check(evaluation, "freeze")
    assert freeze["source"] == "weather_service"
    assert freeze["skip"] is True


@pytest.mark.asyncio
@pytest.mark.parametrize("state", ["unavailable", "unknown", "not a number"])
async def test_freeze_with_a_sensor_that_cannot_be_read_waters(state):
    evaluation = await _evaluate(config=FREEZE, states={"sensor.t": _State(state)})

    freeze = _check(evaluation, "freeze")
    assert freeze["available"] is False
    assert evaluation["should_skip"] is False


@pytest.mark.asyncio
async def test_freeze_with_no_sensor_and_no_weather_service_waters():
    evaluation = await _evaluate(config={const.CONF_SKIP_ON_FREEZE: True})

    assert _check(evaluation, "freeze")["available"] is False
    assert evaluation["should_skip"] is False


# --- wind -------------------------------------------------------------------


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("reading", "unit", "skips"),
    [
        ("25", "km/h", True),
        ("20", "km/h", True),
        ("15", "km/h", False),
        ("6", "m/s", True),  # 21.6 km/h
        ("5", "m/s", False),  # 18 km/h
    ],
)
async def test_wind_at_or_above_the_default_threshold(reading, unit, skips):
    evaluation = await _evaluate(
        config=WIND, states={"sensor.w": _State(reading, unit)}
    )

    wind = _check(evaluation, "wind")
    assert wind["threshold"] == const.CONF_DEFAULT_WIND_THRESHOLD_KMH
    assert wind["skip"] is skips


@pytest.mark.asyncio
async def test_wind_from_the_weather_service_is_read_at_10_m():
    """The services' wind is stored at 2 m for the evaporation. A wind limit is
    meant against the 10 m wind forecasts quote, so it is taken back up."""
    config = {const.CONF_SKIP_ON_WIND: True, const.CONF_USE_WEATHER_SERVICE: True}
    wind_10m_ms = 6.0  # 21.6 km/h at 10 m

    evaluation = await _evaluate(
        config=config, now={const.MAPPING_WINDSPEED: wind_10m_ms * WIND_10M_TO_2M}
    )

    wind = _check(evaluation, "wind")
    assert wind["value"] == pytest.approx(21.6, abs=0.1)
    assert wind["skip"] is True


@pytest.mark.asyncio
async def test_wind_uses_mph_on_an_imperial_install():
    evaluation = await _evaluate(
        config=WIND,
        states={"sensor.w": _State("20", "km/h")},  # 12.4 mph
        units=US_CUSTOMARY_SYSTEM,
    )

    wind = _check(evaluation, "wind")
    assert wind["threshold"] == const.CONF_DEFAULT_WIND_THRESHOLD_MPH
    assert wind["skip"] is True


# --- rain sensor --------------------------------------------------------------


@pytest.mark.asyncio
@pytest.mark.parametrize(("state", "skips"), [("on", True), ("off", False)])
async def test_the_rain_sensor_vetoes_while_it_is_on(state, skips):
    evaluation = await _evaluate(config=RAIN, states={"binary.r": _State(state)})

    assert _check(evaluation, "rain_sensor")["skip"] is skips
    assert evaluation["reason"] == ("rain_sensor" if skips else None)


@pytest.mark.asyncio
async def test_the_rain_sensor_is_given_as_the_reason_before_the_calendar():
    """It is raining is a better answer than too few days have passed."""
    config = {
        **RAIN,
        const.CONF_DAYS_BETWEEN_IRRIGATION: 5,
        const.CONF_DAYS_SINCE_LAST_IRRIGATION: 1,
    }

    evaluation = await _evaluate(config=config, states={"binary.r": _State("on")})

    assert evaluation["reason"] == "rain_sensor"


@pytest.mark.asyncio
@pytest.mark.parametrize("states", [{}, {"binary.r": _State("unavailable")}])
async def test_a_rain_sensor_that_cannot_be_read_waters(states):
    evaluation = await _evaluate(config=RAIN, states=states)

    assert _check(evaluation, "rain_sensor")["available"] is False
    assert evaluation["should_skip"] is False


# --- a check that breaks ------------------------------------------------------


@pytest.mark.asyncio
async def test_a_check_that_raises_leaves_the_run_as_it_was():
    """An error escaping the evaluation would make the day a skip day through
    the fail-safe. For an optional check it must count as "could not read"."""
    coordinator = _coordinator(config={**FREEZE, **WIND, **RAIN})

    def broken(entity_id):
        raise RuntimeError("state machine gone")

    coordinator.hass.states.get = broken

    evaluation = await coordinator.async_evaluate_skip_conditions()

    assert evaluation["should_skip"] is False
    for check_id in ("freeze", "wind", "rain_sensor"):
        assert _check(evaluation, check_id)["available"] is False


# --- soil moisture ------------------------------------------------------------


def _zone(zone_id, sensor=None, threshold=None, state=const.ZONE_STATE_AUTOMATIC):
    zone = {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_STATE: state,
        const.ZONE_DURATION: 600,
        const.ZONE_BUCKET: -6.0,
        const.ZONE_SOIL_MOISTURE_SENSOR: sensor,
    }
    if threshold is not None:
        zone[const.ZONE_SOIL_MOISTURE_THRESHOLD] = threshold
    return zone


ZONES = [
    _zone(1, "sensor.m1"),  # 62% against the default 50: held
    _zone(2, "sensor.m2"),  # 35%: waters
    _zone(3, "sensor.m3", threshold=70),  # 62% against its own 70: waters
    _zone(4, "sensor.gone"),  # unavailable: waters
    _zone(5),  # no sensor: waters, and is not listed
    _zone(6, "sensor.m1", state=const.ZONE_STATE_MANUAL),  # not automatic
]
MOISTURE = {
    "sensor.m1": _State("62", "%"),
    "sensor.m2": _State("35", "%"),
    "sensor.m3": _State("62", "%"),
    "sensor.gone": _State("unavailable"),
}


@pytest.mark.asyncio
async def test_soil_moisture_holds_only_the_zones_that_are_moist():
    coordinator = _coordinator(zones=ZONES, states=MOISTURE)

    held = await coordinator.async_zones_held_by_soil_moisture()

    assert held == {1}


@pytest.mark.asyncio
async def test_soil_moisture_never_vetoes_the_whole_day():
    evaluation = await _evaluate(zones=ZONES, states=MOISTURE)

    soil = _check(evaluation, "soil_moisture")
    assert soil["enabled"] is True
    assert soil["skip"] is False
    assert evaluation["should_skip"] is False
    assert [z["zone_id"] for z in soil["zones"]] == [1, 2, 3, 4]


@pytest.mark.asyncio
async def test_no_zone_with_a_sensor_is_off():
    evaluation = await _evaluate(zones=[_zone(1), _zone(2)])

    assert _check(evaluation, "soil_moisture")["enabled"] is False


@pytest.mark.asyncio
async def test_a_moist_zone_sits_out_the_run_and_keeps_its_bucket(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.triggers.async_dispatcher_send",
        lambda *args: None,
    )
    coordinator = _coordinator(zones=ZONES, states=MOISTURE)

    await coordinator._hold_back_zones_with_moist_soil()

    coordinator.store.async_update_zone.assert_awaited_once_with(
        1, {const.ZONE_DURATION: 0}
    )


@pytest.mark.asyncio
async def test_no_moist_zone_touches_nothing(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.triggers.async_dispatcher_send",
        lambda *args: None,
    )
    coordinator = _coordinator(zones=ZONES, states={})

    await coordinator._hold_back_zones_with_moist_soil()

    coordinator.store.async_update_zone.assert_not_awaited()
