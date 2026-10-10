"""Glitches and dead sensors are left out of the readings (phase 1.6).

One Zigbee reading of 85 C set a whole day's maximum temperature, and a dead
thermometer keeping its last state was recorded every hour, a flat day with
the maximum equal to the minimum.
"""

from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from homeassistant.util import dt as dt_util
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator(states):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    coordinator.hass.states.get = states.get
    return coordinator


def _state(value, hours_ago=0.0):
    stamp = dt_util.utcnow() - timedelta(hours=hours_ago)
    return SimpleNamespace(
        state=str(value),
        attributes={},
        last_reported=stamp,
        last_updated=stamp,
    )


def _sensor(entity):
    return {
        const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
        const.MAPPING_CONF_SENSOR: entity,
        const.MAPPING_CONF_UNIT: None,
    }


MAPPING = {
    const.MAPPING_MAPPINGS: {
        const.MAPPING_TEMPERATURE: _sensor("sensor.temp"),
        const.MAPPING_PRECIPITATION: _sensor("sensor.rain"),
    }
}


def test_a_glitch_is_rejected():
    coordinator = _coordinator({})
    with pytest.raises(ValueError):
        coordinator._sensor_reading_to_metric(
            const.MAPPING_TEMPERATURE, _sensor("sensor.temp"), "85"
        )
    with pytest.raises(ValueError):
        coordinator._sensor_reading_to_metric(
            const.MAPPING_PRECIPITATION, _sensor("sensor.rain"), "-1"
        )


def test_a_bright_noon_reading_in_watts_is_not_a_glitch():
    # 889 W/m2 on a clear day at noon: converted with the factor of a daily
    # mean it is 76.8 MJ/day/m2, which a bound made for daily totals rejected,
    # so no solar data was stored and no zone was ever calculated.
    coordinator = _coordinator({})
    line = {**_sensor("sensor.sun"), const.MAPPING_CONF_UNIT: const.UNIT_W_M2}
    assert coordinator._sensor_reading_to_metric(
        const.MAPPING_SOLRAD, line, "889"
    ) == pytest.approx(889 * const.W_TO_MJ_DAY_FACTOR)


def test_a_solar_reading_beyond_the_sun_is_still_a_glitch():
    coordinator = _coordinator({})
    line = {**_sensor("sensor.sun"), const.MAPPING_CONF_UNIT: const.UNIT_W_M2}
    with pytest.raises(ValueError):
        coordinator._sensor_reading_to_metric(const.MAPPING_SOLRAD, line, "1700")
    # A daily total in MJ is far below the bound, as before.
    daily = {**_sensor("sensor.sun"), const.MAPPING_CONF_UNIT: const.UNIT_MJ_DAY_M2}
    assert coordinator._sensor_reading_to_metric(
        const.MAPPING_SOLRAD, daily, "22"
    ) == pytest.approx(22.0)


def test_a_plausible_reading_passes():
    coordinator = _coordinator({})
    assert coordinator._sensor_reading_to_metric(
        const.MAPPING_TEMPERATURE, _sensor("sensor.temp"), "21.5"
    ) == pytest.approx(21.5)


def test_a_glitch_is_left_out_of_the_hourly_reading():
    coordinator = _coordinator({"sensor.temp": _state(85), "sensor.rain": _state(2)})
    values = coordinator.build_sensor_values_for_mapping(MAPPING)
    assert const.MAPPING_TEMPERATURE not in values
    assert values[const.MAPPING_PRECIPITATION] == pytest.approx(2.0)


def test_a_thermometer_silent_for_hours_is_left_out():
    coordinator = _coordinator(
        {"sensor.temp": _state(18, hours_ago=9), "sensor.rain": _state(2, 72)}
    )
    values = coordinator.build_sensor_values_for_mapping(MAPPING)
    assert const.MAPPING_TEMPERATURE not in values
    # A rain total can hold for days: it is not checked.
    assert values[const.MAPPING_PRECIPITATION] == pytest.approx(2.0)
