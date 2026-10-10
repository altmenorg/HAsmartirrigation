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


def test_the_month_takes_its_own_crop_factor_and_the_seasonal_multiplier():
    coordinator = _coordinator()
    coordinator.seasonal_adjustment_manager = MagicMock()
    coordinator.seasonal_adjustment_manager.seasonal_factors.side_effect = (
        lambda zone_id, month: ((2.0, 0.0) if month == 7 else (1.0, 0.0))
    )
    table = [1.0] * 12
    table[6] = 0.5
    zone = {**ZONE, const.ZONE_ID: 1, const.ZONE_CROP_FACTOR_BY_MONTH: table}
    dry = {"precipitation": 0.0}

    # July: 0.5 from the table, times 2 from the season.
    assert coordinator._calculate_monthly_watering_volume(
        zone, 100.0, dry, 7
    ) == pytest.approx(100.0)
    # June: the table's 1.0 and no season.
    assert coordinator._calculate_monthly_watering_volume(
        zone, 100.0, dry, 6
    ) == pytest.approx(100.0)
    table[5] = 0.8
    assert coordinator._calculate_monthly_watering_volume(
        zone, 100.0, dry, 6
    ) == pytest.approx(80.0)


def test_rain_is_not_credited_where_the_calculation_books_none():
    coordinator = _coordinator()
    wet = {"precipitation": 40.0}

    assert coordinator._calculate_monthly_watering_volume(
        ZONE, 100.0, wet, 7
    ) == pytest.approx(60.0)
    assert coordinator._calculate_monthly_watering_volume(
        ZONE, 100.0, wet, 7, counts_rain=False
    ) == pytest.approx(100.0)


@pytest.mark.asyncio
async def test_a_passthrough_month_has_its_own_number_of_days():
    coordinator = _coordinator()
    coordinator.module_id_for_zone = lambda zone: 1
    module = MagicMock()
    module.name = "Passthrough"

    async def _module(_id):
        return module

    coordinator.getModuleInstanceByID = _module
    zone = {**ZONE, const.ZONE_ID: 1, const.ZONE_MAPPING: 1}

    months = await coordinator._calculate_monthly_watering_for_zone(zone)
    data = coordinator._generate_monthly_climate_data()

    assert months[1]["estimated_et_mm"] == pytest.approx(
        round(data[1]["average_daily_et"] * 29, 2)
    )
    assert months[6]["estimated_et_mm"] == pytest.approx(
        round(data[6]["average_daily_et"] * 31, 2)
    )


@pytest.mark.asyncio
async def test_a_static_month_credits_no_rain():
    coordinator = _coordinator()
    coordinator.module_id_for_zone = lambda zone: 1
    module = MagicMock()
    module.name = "Static"
    module.calculate.return_value = -2.0

    async def _module(_id):
        return module

    coordinator.getModuleInstanceByID = _module
    zone = {**ZONE, const.ZONE_ID: 1, const.ZONE_MAPPING: 1}

    months = await coordinator._calculate_monthly_watering_for_zone(zone)

    assert months[0]["estimated_watering_volume_liters"] == pytest.approx(62.0)


@pytest.mark.parametrize(
    ("latitude", "winter", "summer"), [(47.0, 1, 7), (-40.0, 7, 1)]
)
def test_winter_is_wetter_and_more_humid_than_summer(latitude, winter, summer):
    data = _coordinator(latitude)._generate_monthly_climate_data()

    assert data[winter - 1]["precipitation"] > data[summer - 1]["precipitation"]
    assert data[winter - 1]["humidity"] > data[summer - 1]["humidity"]
    assert data[winter - 1]["wind_speed"] > data[summer - 1]["wind_speed"]
    assert data[summer - 1]["avg_temp"] > data[winter - 1]["avg_temp"]
