"""A sensor's reading is converted from the unit it really reports in.

A sensor group field left without a unit, as the setup wizard creates them,
took the unit system's default: a wind sensor in km/h was read as m/s, 3.6
times too strong, and a thermometer in F as C. The sensor's own unit is used
then, when the conversions know it. The continuous update converted readings on
its own and did not turn a light sensor's lux into radiation at all.
"""

from unittest.mock import MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


class _State:
    def __init__(self, value, unit):
        self.state = str(value)
        self.attributes = {"unit_of_measurement": unit} if unit else {}


def _coordinator():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    return coordinator


def _read(key, value, sensor_unit, group_unit=""):
    the_map = {
        const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
        const.MAPPING_CONF_UNIT: group_unit,
    }
    return _coordinator()._sensor_reading_to_metric(
        key, the_map, value, _State(value, sensor_unit)
    )


@pytest.mark.parametrize(
    ("key", "value", "unit", "expected"),
    [
        (const.MAPPING_WINDSPEED, 36, "km/h", 10.0),
        (const.MAPPING_WINDSPEED, 10, "m/s", 10.0),
        (const.MAPPING_WINDSPEED, 10, "mph", 4.47),
        (const.MAPPING_WINDSPEED, 10, "kn", 5.14),
        (const.MAPPING_TEMPERATURE, 68, "°F", 20.0),
        (const.MAPPING_TEMPERATURE, 20, "°C", 20.0),
        (const.MAPPING_PRESSURE, 29.92, "inHg", 1013.2),
        (const.MAPPING_PRESSURE, 1013, "mbar", 1013.0),
        (const.MAPPING_PRESSURE, 1013, "hPa", 1013.0),
        (const.MAPPING_SOLRAD, 100, "W/m²", 8.64),
        (const.MAPPING_CURRENT_PRECIPITATION, 1, "in/h", 25.4),
        (const.MAPPING_PRECIPITATION, 1, "in", 25.4),
    ],
)
def test_a_group_without_a_unit_reads_the_sensors_own(key, value, unit, expected):
    assert _read(key, value, unit) == pytest.approx(expected, abs=0.05)


def test_the_groups_unit_still_wins_when_it_has_one():
    """36 labelled m/s by the user stays 36 m/s, whatever the sensor says."""
    assert _read(const.MAPPING_WINDSPEED, 36, "km/h", const.UNIT_MS) == 36.0


def test_an_unknown_sensor_unit_falls_back_as_before():
    assert _read(const.MAPPING_WINDSPEED, 10, "furlong/fortnight") == 10.0


def test_a_light_sensor_is_turned_into_radiation():
    """What the continuous update did not do."""
    coordinator = _coordinator()
    coordinator.radiation_from_illuminance = MagicMock(return_value=100.0)
    the_map = {
        const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_ILLUMINANCE,
        const.MAPPING_CONF_UNIT: "lx",
    }

    value = coordinator._sensor_reading_to_metric(
        const.MAPPING_SOLRAD, the_map, 12000, _State(12000, "lx")
    )

    # 100 W/m2 is 8.64 MJ/day/m2.
    assert value == pytest.approx(8.64)
