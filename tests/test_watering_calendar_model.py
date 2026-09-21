"""The watering calendar's monthly estimate credits the rain, and its climate
model follows the seasons it describes.

- The month's rain was added to the evaporation and subtracted again for the
  need, so the need was the evaporation whatever it rained.
- Humidity, wind and rain were said to be higher in winter and peaked in July;
  only the temperature followed the southern hemisphere's seasons.
- A static module's daily deficit was taken as the month's evaporation, and
  being negative it always made the need zero.
"""

from unittest.mock import MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.calcmodules.pyeto import PyETO


def _coordinator(latitude=47.0):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    coordinator._latitude = latitude
    coordinator._elevation = 10
    return coordinator


def _pyeto(latitude=47.0):
    hass = MagicMock()
    hass.config.as_dict.return_value = {"latitude": latitude, "elevation": 10}
    return PyETO(hass, "", {})


ZONE = {const.ZONE_SIZE: 1.0, const.ZONE_MULTIPLIER: 1.0}


def test_the_rain_reduces_the_need():
    coordinator = _coordinator()
    module = _pyeto()
    july = coordinator._generate_monthly_climate_data()[6]

    et = coordinator._calculate_monthly_et_pyeto(july, module, 7)
    need = coordinator._calculate_monthly_watering_volume(ZONE, et, july)

    assert need == pytest.approx(max(0.0, et - july["precipitation"]))
    assert need < et


def test_the_evaporation_is_the_engines_alone():
    coordinator = _coordinator()
    module = _pyeto()
    july = coordinator._generate_monthly_climate_data()[6]

    et = coordinator._calculate_monthly_et_pyeto(july, module, 7)

    import datetime

    daily = -module.calculate_et_for_day(
        {
            const.MAPPING_MIN_TEMP: july["min_temp"],
            const.MAPPING_MAX_TEMP: july["max_temp"],
            const.MAPPING_DEWPOINT: july["dewpoint"],
            const.MAPPING_WINDSPEED: july["wind_speed"],
            const.MAPPING_PRESSURE: july["pressure"],
        },
        datetime.date(datetime.date.today().year, 7, 15),
    )
    assert et == pytest.approx(daily * 31)


@pytest.mark.parametrize(
    ("latitude", "winter", "summer"), [(47.0, 1, 7), (-40.0, 7, 1)]
)
def test_winter_is_wetter_and_more_humid_than_summer(latitude, winter, summer):
    data = _coordinator(latitude)._generate_monthly_climate_data()

    assert data[winter - 1]["precipitation"] > data[summer - 1]["precipitation"]
    assert data[winter - 1]["humidity"] > data[summer - 1]["humidity"]
    assert data[winter - 1]["wind_speed"] > data[summer - 1]["wind_speed"]
    assert data[summer - 1]["avg_temp"] > data[winter - 1]["avg_temp"]
