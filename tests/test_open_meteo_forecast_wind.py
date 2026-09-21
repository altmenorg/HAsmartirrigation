"""A forecast day's wind is the day's mean, not its windiest hour.

Open-Meteo has no daily mean wind, and the daily ``wind_speed_10m_max`` was
fed to the evaporation as the day's wind. On a calm day with one gusty hour
that is the gust, and the forecast evaporation of every forecast day came out
too high. The day's mean is taken from the hourly series, as the humidity, the
pressure and the dew point already are.
"""

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    WIND_10M_TO_2M,
    OpenMeteoClient,
)

DAYS = ["2026-09-21", "2026-09-22"]


def _doc(hourly_wind=True):
    hours = [f"{day}T{hour:02d}:00" for day in DAYS for hour in range(24)]
    # 2 m/s all day, one hour at 10 m/s on each day: a mean of 2.33.
    wind = [10.0 if hour == 15 else 2.0 for _ in DAYS for hour in range(24)]
    hourly = {
        "time": hours,
        "relative_humidity_2m": [60.0] * len(hours),
        "surface_pressure": [1013.0] * len(hours),
        "dew_point_2m": [10.0] * len(hours),
    }
    if hourly_wind:
        hourly["wind_speed_10m"] = wind
    return {
        "daily": {
            "time": DAYS,
            "temperature_2m_max": [22.0, 23.0],
            "temperature_2m_min": [10.0, 11.0],
            "temperature_2m_mean": [16.0, 17.0],
            "wind_speed_10m_max": [10.0, 10.0],
            "precipitation_sum": [0.0, 0.0],
            "shortwave_radiation_sum": [15.0, 16.0],
            "et0_fao_evapotranspiration": [3.0, 3.2],
        },
        "hourly": hourly,
    }


def _forecast(doc):
    client = OpenMeteoClient(latitude=47.0, longitude=-1.7, elevation=4)
    client._get_doc = lambda: doc
    return client.get_forecast_data(include_today=True)


def test_the_forecast_wind_is_the_days_mean():
    forecast = _forecast(_doc())

    for day in forecast:
        assert day[const.MAPPING_WINDSPEED] == pytest.approx(
            (2.0 * 23 + 10.0) / 24 * WIND_10M_TO_2M
        )


def test_without_an_hourly_wind_the_daily_maximum_is_still_used():
    """Nothing better to go on, which is how it has always been."""
    forecast = _forecast(_doc(hourly_wind=False))

    for day in forecast:
        assert day[const.MAPPING_WINDSPEED] == pytest.approx(10.0 * WIND_10M_TO_2M)
