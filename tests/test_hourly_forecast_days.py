"""A zone that looks ahead stays on the hourly equation.

With forecast days set, PyETO waters on the mean of today and the days to
come, so a hot tomorrow raises today's run. That average used to force the
daily equation: the hourly sum covers a window, a forecast day is a day, and
averaging the two would have been nonsense.

The hours of the coming days are read from the weather service instead, each
day priced as its own 24 hours, and the measured window enters the same
average as the rate per day it implies. Every term is then hourly, which is
the point: averaging an hourly sum with a daily one would put back the
cloudiness bias the hourly form removes.
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, Mock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.hourly_rows import (
    forecast_eto_by_day,
    forecast_rows_by_day,
)

LAT, LON = 47.0, -1.5
TODAY = datetime.date(2026, 6, 21)
# The coordinator reads the clock to know which days are still to come, so the
# tests that go through it build their forecast around the real today.
NOW = datetime.date.today()


def _hours(day, count=24, **overrides):
    """A whole day of hourly forecast entries, as a client returns them."""
    midnight = datetime.datetime.combine(day, datetime.time())
    out = []
    for hour in range(count):
        stamp = midnight + datetime.timedelta(hours=hour)
        entry = {
            "ts": stamp.timestamp(),
            "temperature": 24.0,
            "humidity": 45.0,
            "wind": 2.0,
            # Sun between 6 and 20, nothing at night.
            "solar_mj_h": 2.0 if 6 <= hour < 20 else 0.0,
            "pressure_hpa": 1013.0,
        }
        entry.update(overrides)
        out.append(entry)
    return out


def test_only_whole_days_after_today_are_forecast_days():
    """Today's remaining hours belong to today's own balance, not to a
    forecast day, and a day the series only half covers is not a day."""
    series = (
        _hours(TODAY)
        + _hours(TODAY + datetime.timedelta(days=1))
        + _hours(TODAY + datetime.timedelta(days=2), count=5)
    )

    by_day = forecast_rows_by_day(series, today=TODAY)

    assert list(by_day) == [TODAY + datetime.timedelta(days=1)]
    assert len(by_day[TODAY + datetime.timedelta(days=1)]) == 24


def test_a_row_carries_what_the_equation_prices():
    series = _hours(TODAY + datetime.timedelta(days=1))

    rows = forecast_rows_by_day(series, today=TODAY)[TODAY + datetime.timedelta(days=1)]
    noon = rows[12]

    assert noon["temperature"] == 24.0
    assert noon["humidity"] == 45.0
    assert noon["wind_2m"] == 2.0
    assert noon["solar_mj_h"] == 2.0
    assert noon["pressure_kpa"] == pytest.approx(101.3)
    assert noon["hour"] == 12.5
    assert noon["coverage_h"] == 1.0


def test_a_malformed_series_is_no_days_rather_than_a_wrong_one():
    series = _hours(TODAY + datetime.timedelta(days=1))
    series[3] = {"ts": "not a time"}

    assert forecast_rows_by_day(series, today=TODAY) == {}


def test_an_empty_series_is_no_days():
    assert forecast_rows_by_day([], today=TODAY) == {}
    assert forecast_rows_by_day(None, today=TODAY) == {}


def test_each_day_is_priced_as_its_own_twenty_four_hours():
    tomorrow = TODAY + datetime.timedelta(days=1)
    series = _hours(tomorrow)

    by_day = forecast_eto_by_day(series, LAT, LON, today=TODAY)

    assert list(by_day) == [tomorrow]
    # A summer day of that sun and heat evaporates a few mm, and the night
    # hours contribute a little, not nothing.
    assert 1.0 < by_day[tomorrow] < 12.0


def test_a_sunnier_day_evaporates_more():
    tomorrow = TODAY + datetime.timedelta(days=1)
    dull = forecast_eto_by_day(_hours(tomorrow, solar_mj_h=0.5), LAT, LON, today=TODAY)
    bright = forecast_eto_by_day(
        _hours(tomorrow, solar_mj_h=3.0), LAT, LON, today=TODAY
    )

    assert bright[tomorrow] > dull[tomorrow]


def _coordinator(series=None, forecast_days=2):
    class _Coordinator(CalculationMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.hass.async_add_executor_job = AsyncMock(
        side_effect=lambda func, *args: func(*args)
    )
    coordinator.use_weather_service = True
    coordinator.weather_service = const.CONF_WEATHER_SERVICE_OM
    coordinator._WeatherServiceClient = Mock()
    coordinator._WeatherServiceClient.get_hourly_forecast = Mock(return_value=series)
    coordinator._effective_latitude = LAT
    coordinator._effective_longitude = LON
    coordinator._effective_elevation = 10.0
    return coordinator


async def test_the_window_is_averaged_with_the_days_to_come():
    """The arithmetic the daily equation does, with hourly terms."""
    days = [NOW + datetime.timedelta(days=n) for n in (1, 2)]
    series = _hours(days[0]) + _hours(days[1])
    coordinator = _coordinator(series)
    # 3 mm measured over 12 hours is 6 mm a day.
    measured = (3.0, 12.0)

    with_forecast = await coordinator._hourly_with_forecast(
        {const.ZONE_ID: 1}, {}, measured, 2
    )

    by_day = forecast_eto_by_day(series, LAT, LON, 10.0, today=NOW)
    expected_per_day = (6.0 + sum(by_day.values())) / 3
    assert with_forecast[0] == pytest.approx(expected_per_day * 12.0 / 24.0)
    assert with_forecast[1] == 12.0


async def test_a_hotter_forecast_raises_what_the_zone_is_told_to_water():
    days = [NOW + datetime.timedelta(days=n) for n in (1, 2)]
    measured = (3.0, 12.0)
    mild = _hours(days[0], temperature=18.0) + _hours(days[1], temperature=18.0)
    hot = _hours(days[0], temperature=34.0) + _hours(days[1], temperature=34.0)

    mild_result = await _coordinator(mild)._hourly_with_forecast(
        {const.ZONE_ID: 1}, {}, measured, 2
    )
    hot_result = await _coordinator(hot)._hourly_with_forecast(
        {const.ZONE_ID: 1}, {}, measured, 2
    )

    assert hot_result[0] > mild_result[0]


async def test_fewer_days_than_asked_for_keeps_the_daily_equation():
    """Averaging two days where three were asked would be a different model."""
    series = _hours(NOW + datetime.timedelta(days=1))
    coordinator = _coordinator(series)

    assert (
        await coordinator._hourly_with_forecast({const.ZONE_ID: 1}, {}, (3.0, 12.0), 3)
        is None
    )


async def test_no_forecast_at_all_keeps_the_daily_equation():
    coordinator = _coordinator(None)

    assert (
        await coordinator._hourly_with_forecast({const.ZONE_ID: 1}, {}, (3.0, 12.0), 2)
        is None
    )


async def test_an_empty_window_is_not_turned_into_a_rate():
    """Dividing by no hours would be a rate per day of nothing at all."""
    coordinator = _coordinator(_hours(NOW + datetime.timedelta(days=1)))

    assert (
        await coordinator._hourly_with_forecast({const.ZONE_ID: 1}, {}, (0.0, 0.0), 1)
        is None
    )


async def test_a_greenhouse_is_not_given_a_sky_forecast():
    coordinator = _coordinator(_hours(NOW + datetime.timedelta(days=1)))

    series = await coordinator._hourly_forecast_series(
        {const.MAPPING_GREENHOUSE: True}, 1
    )

    assert series is None
    coordinator._WeatherServiceClient.get_hourly_forecast.assert_not_called()


async def test_a_service_without_an_hourly_forecast_keeps_the_daily_equation():
    coordinator = _coordinator()
    coordinator._WeatherServiceClient = Mock(spec=[])

    assert await coordinator._hourly_forecast_series({}, 2) is None
