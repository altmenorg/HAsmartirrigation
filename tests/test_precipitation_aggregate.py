"""The weather services feed the water balance with a rate, not a total (#764).

Precipitation reaches the bucket through ``Current Precipitation``, the measured
rate, which is integrated over the calculation interval. The services used to
also copy that rate (or, for Open-Meteo, today's partly forecast daily total)
into ``Precipitation``, where the "delta" aggregate treated it as an accumulated
depth: it added only the increases, so OpenWeatherMap undercounted the rain and
Open-Meteo kept the highest forecast of the day (#787, #788).
"""

import inspect
from unittest.mock import patch

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    OpenMeteoClient,
)


def test_open_meteo_reports_a_rate_and_not_the_daily_total():
    """The daily total is a forecast for the rest of the day; the rate is measured.

    ``current.precipitation`` is the amount over the last 15 minutes, so 1.2 mm
    of it is a rate of 4.8 mm/h (#835).
    """
    client = OpenMeteoClient(api_key="", api_version="", latitude=51.5, longitude=5.5)
    doc = {
        "current": {
            "interval": 900,
            "temperature_2m": 18.6,
            "relative_humidity_2m": 95,
            "dew_point_2m": 17.7,
            "surface_pressure": 1015.0,
            "wind_speed_10m": 3.6,
            "precipitation": 1.2,
            "shortwave_radiation": 0.0,
        },
        "daily": {"precipitation_sum": [25.1, 0.0]},
    }

    with patch.object(OpenMeteoClient, "_get_doc", return_value=doc):
        parsed = client.get_data()

    assert parsed[const.MAPPING_CURRENT_PRECIPITATION] == pytest.approx(4.8)
    assert const.MAPPING_PRECIPITATION not in parsed


def test_the_daily_total_is_still_available_to_the_forecast():
    """The skip check and PyETO's forecast days do want the forecast total."""
    source = inspect.getsource(OpenMeteoClient.get_forecast_data)
    assert "precipitation_sum" in source


def test_calculate_all_can_be_called_without_arguments():
    """The recurring scheduler calls it with no argument at all.

    ``_async_calculate_all`` used to require ``delete_weather_data``, so a
    recurring schedule with the "calculate all zones" action raised a TypeError
    instead of calculating.
    """
    signature = inspect.signature(SmartIrrigationCoordinator._async_calculate_all)
    assert signature.parameters["delete_weather_data"].default is True


@pytest.mark.parametrize(
    ("schedule", "interval", "expected"),
    [
        (const.CONF_AUTO_UPDATE_HOURLY, "1", False),
        (const.CONF_AUTO_UPDATE_MINUTELY, "15", False),
        (const.CONF_AUTO_UPDATE_HOURLY, "6", True),
        (const.CONF_AUTO_UPDATE_DAILY, "1", True),
    ],
)
def test_warns_when_the_update_interval_cannot_see_all_the_rain(
    caplog, schedule, interval, expected
):
    """The services report the last hour, so collecting less often misses rain."""
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.use_weather_service = True

    coordinator._warn_if_update_interval_undersamples_rain(
        {
            const.CONF_AUTO_UPDATE_ENABLED: True,
            const.CONF_AUTO_UPDATE_SCHEDULE: schedule,
            const.CONF_AUTO_UPDATE_INTERVAL: interval,
        }
    )

    assert ("not counted" in caplog.text) is expected


def test_no_warning_without_a_weather_service(caplog):
    """A user's own rain gauge is not sampled by our schedule."""
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.use_weather_service = False

    coordinator._warn_if_update_interval_undersamples_rain(
        {
            const.CONF_AUTO_UPDATE_ENABLED: True,
            const.CONF_AUTO_UPDATE_SCHEDULE: const.CONF_AUTO_UPDATE_DAILY,
            const.CONF_AUTO_UPDATE_INTERVAL: "1",
        }
    )

    assert "not counted" not in caplog.text
