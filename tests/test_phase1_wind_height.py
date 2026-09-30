"""A wind sensor mounted above 2 m is brought down to 2 m (phase 1.4).

The equations want the wind at 2 m. A weather station usually stands at 5 to
10 m, where it blows about a third harder, and its reading was taken as it
came: about 8% too much evapotranspiration on a dry day.
"""

from unittest.mock import MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import (
    SmartIrrigationCoordinator,
    const,
    wind_at_two_metres,
)


def test_ten_metres_is_about_three_quarters_at_two():
    assert wind_at_two_metres(4.0, 10) == pytest.approx(4.0 * 0.748, abs=0.01)


@pytest.mark.parametrize("height", [None, "", "high", 2, 0])
def test_no_usable_height_leaves_the_reading_as_it_was(height):
    assert wind_at_two_metres(4.0, height) == 4.0


def test_the_sensor_reading_is_brought_to_two_metres():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    the_map = {
        const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
        const.MAPPING_CONF_SENSOR: "sensor.wind",
        const.MAPPING_CONF_UNIT: const.UNIT_MS,
        const.MAPPING_CONF_WIND_HEIGHT: 10,
    }
    value = coordinator._sensor_reading_to_metric(const.MAPPING_WINDSPEED, the_map, "4")
    assert value == pytest.approx(2.99, abs=0.01)
