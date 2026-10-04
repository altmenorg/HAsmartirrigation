"""The rain-forecast skip reads the hours ahead of the run it decides.

It summed the first two days of the daily forecast, read by position: today,
hours already past included, and tomorrow. A 06:00 run looked about 42 hours
ahead and a 21:00 run about 27, and rain that fell overnight before a morning
run still counted as rain to come. The panel's preview was read as of now
rather than at the next start, so opened at 22:00 it showed today and
tomorrow while the 06:00 run would check tomorrow and the day after.

Where the service forecasts hour by hour, the skip now sums the 48 hours from
the run's start. Without that, it reads the daily forecast as before, from the
day of the run.
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util import dt as dt_util

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.skip_conditions import SkipConditionsMixin
from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    OpenMeteoClient,
)
from custom_components.smart_irrigation.websockets import _preview_run_start

UTC = datetime.UTC
# Midnight UTC on the day of the run.
DAY0 = datetime.datetime(2026, 10, 5, 0, 0, tzinfo=UTC)


def _at(hours):
    return DAY0 + datetime.timedelta(hours=hours)


def _open_meteo(rain_by_hour_end):
    """An Open-Meteo client holding an hourly forecast of four days from DAY0."""
    client = OpenMeteoClient(latitude=48.8, longitude=2.3, elevation=35)
    client._rain_ahead_series = [
        (_at(hour).timestamp(), float(rain_by_hour_end.get(hour, 0.0)))
        for hour in range(1, 97)
    ]
    client._rain_ahead_fetched_at = datetime.datetime.now()
    return client


class _Coordinator(SkipConditionsMixin):
    def __init__(self, client, zones=None):
        self.hass = MagicMock()

        async def run(fn, *args):
            return fn(*args)

        self.hass.async_add_executor_job = run
        self._WeatherServiceClient = client
        self.store = MagicMock()
        self.store.async_get_config = AsyncMock(
            return_value={
                const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: True,
                const.CONF_USE_WEATHER_SERVICE: True,
                const.CONF_WEATHER_SERVICE: "Open-Meteo",
                const.CONF_PRECIPITATION_THRESHOLD_MM: 2.0,
            }
        )
        self.store.async_get_zones = AsyncMock(
            return_value=zones
            or [
                {
                    const.ZONE_BUCKET: -6.0,
                    const.ZONE_DURATION: 600,
                    const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
                }
            ]
        )


def _day(mm, date=None):
    day = {const.MAPPING_PRECIPITATION: mm}
    if date is not None:
        day["date"] = date
    return day


@pytest.mark.asyncio
async def test_rain_that_fell_before_a_morning_run_does_not_hold_it_back():
    """Rain from 01:00 to 04:00, a dry 48 hours from the 06:00 run: it waters."""
    client = _open_meteo({2: 3.0, 3: 3.0, 4: 3.0})
    # The daily forecast counts that rain as today's, which used to skip.
    client.get_forecast_data = MagicMock(return_value=[_day(9.0), _day(0.0)])

    result = await _Coordinator(client)._evaluate_precipitation_forecast(
        run_start=_at(6)
    )

    assert result["available"] is True
    assert result["window_hours"] == 48
    assert result["expected_mm"] == pytest.approx(0.0)
    assert result["skip"] is False
    client.get_forecast_data.assert_not_called()


@pytest.mark.asyncio
async def test_the_window_is_48_hours_from_the_run():
    """Rain 47 hours after the start counts, rain 49 hours after does not."""
    client = _open_meteo({6 + 47: 4.0, 6 + 49: 50.0})

    result = await _Coordinator(client)._evaluate_precipitation_forecast(
        run_start=_at(6)
    )

    assert result["expected_mm"] == pytest.approx(4.0)
    assert result["skip"] is True


@pytest.mark.asyncio
async def test_the_decision_reads_the_window_from_now():
    client = _open_meteo({8: 5.0})

    with patch.object(dt_util, "now", return_value=_at(6)):
        result = await _Coordinator(client)._evaluate_precipitation_forecast()

    assert result["expected_mm"] == pytest.approx(5.0)
    assert result["skip"] is True


@pytest.mark.asyncio
async def test_a_preview_at_22_00_reads_the_hours_of_the_next_06_00_run():
    """Rain at 23:00 the day after tomorrow is beyond 48 hours from 22:00, but
    within 48 hours of the 06:00 run the panel previews."""
    client = _open_meteo({24 + 24 + 23: 6.0})
    preview_at = _at(22)
    next_run = _at(24 + 6)

    with patch.object(dt_util, "now", return_value=preview_at):
        as_of_now = await _Coordinator(client)._evaluate_precipitation_forecast()
        kwargs = _preview_run_start(next_run)
        at_the_run = await _Coordinator(client).async_evaluate_skip_conditions(**kwargs)

    assert as_of_now["skip"] is False
    precipitation = next(c for c in at_the_run["checks"] if c["id"] == "precipitation")
    assert precipitation["expected_mm"] == pytest.approx(6.0)
    assert precipitation["skip"] is True
    assert at_the_run["reason"] == "precipitation"


@pytest.mark.asyncio
async def test_a_forecast_too_short_for_the_window_falls_back_to_the_days():
    client = _open_meteo({})
    client._rain_ahead_series = client._rain_ahead_series[:30]
    client.get_forecast_data = MagicMock(return_value=[_day(1.0), _day(4.0)])

    with patch.object(dt_util, "now", return_value=_at(6)):
        result = await _Coordinator(client)._evaluate_precipitation_forecast(
            run_start=_at(6)
        )

    assert "window_hours" not in result
    assert result["forecast_mm"] == pytest.approx(5.0)


# --- without an hourly forecast ---------------------------------------------


def _daily_only(days):
    client = MagicMock(spec=["get_forecast_data"])
    client.get_forecast_data = MagicMock(return_value=days)
    return client


@pytest.mark.asyncio
async def test_without_an_hourly_forecast_today_and_tomorrow_as_before():
    client = _daily_only([_day(1.5), _day(2.0), _day(30.0)])

    result = await _Coordinator(client)._evaluate_precipitation_forecast()

    assert "window_hours" not in result
    assert result["forecast_mm"] == pytest.approx(3.5)
    assert result["skip"] is True
    client.get_forecast_data.assert_called_once_with(True)


@pytest.mark.asyncio
async def test_a_preview_of_tomorrows_run_reads_tomorrow_and_the_next_day():
    dated = [
        _day(0.0, "2026-10-05"),
        _day(0.0, "2026-10-06"),
        _day(8.0, "2026-10-07"),
    ]
    tomorrow_six = datetime.datetime(
        2026, 10, 6, 6, 0, tzinfo=dt_util.DEFAULT_TIME_ZONE
    )

    with patch.object(
        dt_util,
        "now",
        return_value=datetime.datetime(
            2026, 10, 5, 22, 0, tzinfo=dt_util.DEFAULT_TIME_ZONE
        ),
    ):
        now = await _Coordinator(_daily_only(dated))._evaluate_precipitation_forecast()
        preview = await _Coordinator(
            _daily_only(dated)
        )._evaluate_precipitation_forecast(run_start=tomorrow_six)
        undated = await _Coordinator(
            _daily_only([_day(0.0), _day(0.0), _day(8.0)])
        )._evaluate_precipitation_forecast(run_start=tomorrow_six)

    assert now["forecast_mm"] == pytest.approx(0.0)
    assert preview["forecast_mm"] == pytest.approx(8.0)
    assert undated["forecast_mm"] == pytest.approx(8.0)


# --- which start the preview passes -----------------------------------------


def test_the_preview_passes_only_an_aware_start_still_to_come():
    now = dt_util.now()

    assert _preview_run_start(now + datetime.timedelta(hours=8)) == {
        "run_start": now + datetime.timedelta(hours=8)
    }
    assert _preview_run_start(now - datetime.timedelta(minutes=1)) == {}
    assert (
        _preview_run_start(datetime.datetime.now() + datetime.timedelta(hours=8)) == {}
    )
    assert _preview_run_start(None) == {}
