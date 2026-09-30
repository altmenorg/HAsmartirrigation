"""The rain forecast holds a run back only when it is worth it (phase 1.11).

It compared the forecast with a fixed threshold: 3 mm forecast held back a zone
25 mm short, a 30% chance counted as certain, and showers forecast day after
day that kept missing could hold the run back for ever.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.skip_conditions import SkipConditionsMixin


class _Coordinator(SkipConditionsMixin):
    def __init__(self, forecast, zones, skips_in_a_row=0):
        self.hass = MagicMock()

        async def run(fn, *args):
            return fn(*args)

        self.hass.async_add_executor_job = run
        self._WeatherServiceClient = MagicMock()
        self._WeatherServiceClient.get_forecast_data = MagicMock(return_value=forecast)
        self.store = MagicMock()
        self.store.async_get_config = AsyncMock(
            return_value={
                const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: True,
                const.CONF_USE_WEATHER_SERVICE: True,
                const.CONF_WEATHER_SERVICE: "Open-Meteo",
                const.CONF_PRECIPITATION_THRESHOLD_MM: 2.0,
                const.CONF_PRECIPITATION_SKIPS_IN_A_ROW: skips_in_a_row,
            }
        )
        self.store.async_get_zones = AsyncMock(return_value=zones)


def _day(mm, probability=None):
    day = {const.MAPPING_PRECIPITATION: mm}
    if probability is not None:
        day["precipitation_probability"] = probability
    return day


def _zone(bucket, duration=600):
    return {
        const.ZONE_BUCKET: bucket,
        const.ZONE_DURATION: duration,
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
    }


async def _evaluate(forecast, zones, skips=0):
    return await _Coordinator(forecast, zones, skips)._evaluate_precipitation_forecast()


@pytest.mark.asyncio
async def test_enough_rain_for_the_deficit_holds_the_run_back():
    result = await _evaluate([_day(4), _day(3)], [_zone(-8)])
    assert result["skip"] is True


@pytest.mark.asyncio
async def test_too_little_rain_for_a_zone_far_short_does_not():
    result = await _evaluate([_day(3), _day(0)], [_zone(-25)])
    assert result["skip"] is False
    assert result["overridden"] == "deficit"


@pytest.mark.asyncio
async def test_an_unlikely_forecast_counts_for_its_probability():
    # 10 mm at 15% is 1.5 mm to expect, below the 2 mm threshold.
    result = await _evaluate([_day(10, 15), _day(0, 5)], [_zone(-3)])
    assert result["forecast_mm"] == pytest.approx(10.0)
    assert result["expected_mm"] == pytest.approx(1.5)
    assert result["skip"] is False


@pytest.mark.asyncio
async def test_after_two_days_held_back_the_run_goes_ahead():
    result = await _evaluate([_day(8), _day(8)], [_zone(-8)], skips=2)
    assert result["skip"] is False
    assert result["overridden"] == "skips_in_a_row"


@pytest.mark.asyncio
async def test_with_nothing_to_water_the_forecast_still_holds_back():
    result = await _evaluate([_day(4), _day(0)], [_zone(0, duration=0)])
    assert result["skip"] is True
