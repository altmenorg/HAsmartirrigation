"""A short window reads the weather of its day (phases 1.1 and 1.2).

The daily equation prices a day. Handed the extremes and the sun of a few
hours, it priced a day that was not one: continuous updates came out about 60%
low, two calculations a day each missed part of the range.
"""

from datetime import datetime, timedelta
from unittest.mock import MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.hass = MagicMock()
        self.store = MagicMock()
        self.store.get_config = MagicMock(return_value={})


NOW = datetime.now().replace(microsecond=0)


def _day_of_readings():
    """Hourly readings over the last day: 10 C at dawn, 28 C mid-afternoon,
    sun only in daytime."""
    readings = []
    for hours_ago in range(24, -1, -1):
        stamp = NOW - timedelta(hours=hours_ago)
        hour = stamp.hour
        warmth = max(0.0, 1 - abs(hour - 15) / 9)
        readings.append(
            {
                const.MAPPING_TEMPERATURE: 10 + 18 * warmth,
                const.MAPPING_SOLRAD: 40.0 * warmth,
                const.MAPPING_WINDSPEED: 2.0,
                const.RETRIEVED_AT: stamp.isoformat(),
            }
        )
    return readings


def _mapping(readings, **aggregates):
    return {
        const.MAPPING_ID: 0,
        const.MAPPING_DATA: readings,
        const.MAPPING_MAPPINGS: {
            key: {const.MAPPING_CONF_AGGREGATE: value}
            for key, value in aggregates.items()
        },
    }


@pytest.mark.asyncio
async def test_a_short_window_reads_the_day_s_range_and_sun():
    readings = _day_of_readings()
    whole_day = await _Coordinator().apply_aggregates_to_mapping_data(
        _mapping(readings), persist=False, since=NOW - timedelta(hours=25)
    )
    short = await _Coordinator().apply_aggregates_to_mapping_data(
        _mapping(readings), persist=False, since=NOW - timedelta(hours=4)
    )

    assert short[const.MAPPING_MIN_TEMP] == pytest.approx(
        whole_day[const.MAPPING_MIN_TEMP]
    )
    assert short[const.MAPPING_MAX_TEMP] == pytest.approx(
        whole_day[const.MAPPING_MAX_TEMP]
    )
    assert short[const.MAPPING_SOLRAD] == pytest.approx(
        whole_day[const.MAPPING_SOLRAD], rel=0.1
    )
    # Still a short window: the rate is scaled to four hours, not a day.
    assert short[const.MAPPING_DATA_MULTIPLIER] == pytest.approx(4 / 24, rel=0.05)


@pytest.mark.asyncio
async def test_a_field_aggregated_otherwise_is_left_to_its_owner():
    readings = _day_of_readings()
    short = await _Coordinator().apply_aggregates_to_mapping_data(
        _mapping(
            readings,
            **{const.MAPPING_WINDSPEED: const.MAPPING_CONF_AGGREGATE_MAXIMUM},
        ),
        persist=False,
        since=NOW - timedelta(hours=4),
    )
    assert short[const.MAPPING_WINDSPEED] == pytest.approx(2.0)


# --- long windows are priced one day at a time -------------------------------


def _three_days():
    """Three days of hourly readings: 10/25, 14/30 and 12/28 C."""
    ranges = [(10, 25), (14, 30), (12, 28)]
    readings = []
    for day, (low, high) in enumerate(ranges):
        for hour in range(24):
            hours_ago = 72 - (day * 24 + hour) - 0.5
            stamp = NOW - timedelta(hours=hours_ago)
            warmth = max(0.0, 1 - abs(hour - 15) / 9)
            readings.append(
                {
                    const.MAPPING_TEMPERATURE: low + (high - low) * warmth,
                    const.MAPPING_DEWPOINT: 9.0,
                    const.MAPPING_WINDSPEED: 2.0,
                    const.MAPPING_PRESSURE: 1013.0,
                    const.RETRIEVED_AT: stamp.isoformat(),
                }
            )
    return readings


@pytest.mark.asyncio
async def test_a_long_window_is_split_into_its_days():
    result = await _Coordinator().apply_aggregates_to_mapping_data(
        _mapping(_three_days()), persist=False, since=NOW - timedelta(hours=72)
    )
    days = result[const.MAPPING_DATA_DAYS]
    assert len(days) == 3
    ranges = sorted(
        (round(w[const.MAPPING_MIN_TEMP]), round(w[const.MAPPING_MAX_TEMP]))
        for _hours, w in days
    )
    assert ranges == [(10, 25), (12, 28), (14, 30)]


@pytest.mark.asyncio
async def test_the_days_price_lower_than_one_day_of_all_their_extremes():
    from custom_components.smart_irrigation.calcmodules.pyeto import PyETO

    hass = MagicMock()
    hass.config.as_dict.return_value = {"latitude": 45.0, "elevation": 50.0}
    module = PyETO(hass, "", {})
    result = await _Coordinator().apply_aggregates_to_mapping_data(
        _mapping(_three_days()), persist=False, since=NOW - timedelta(hours=72)
    )
    days = result[const.MAPPING_DATA_DAYS]
    per_day = sum(
        hours * module.calculate({**result, **weather}, None) for hours, weather in days
    ) / sum(hours for hours, _ in days)
    as_one_day = module.calculate(result, None)
    # Both negative: the days together evaporate less than one 10/30 day.
    assert as_one_day < per_day < 0
