"""Tests for the Riemann sum aggregation in CalculationMixin (#784).

Values reaching _aggregate_sensor_data are already converted to per-day rates
(e.g. Solar Radiation W/m2 -> MJ/day/m2), so the trapezoidal integration must
use dt expressed in days. Using seconds inflated the result by ~86400x the
day-fraction (e.g. ~900x for a 15-minute sample interval).
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.store = MagicMock()
        self.store.async_update_mapping = AsyncMock()


def _mapping_with_riemann(key):
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_MAPPINGS: {
            key: {const.MAPPING_CONF_AGGREGATE: const.MAPPING_CONF_AGGREGATE_RIEMANNSUM}
        },
    }


async def test_riemann_sum_constant_rate_over_one_day():
    """A constant 20 MJ/day/m2 rate integrated over 24h must yield ~20, not ~20*86400."""
    coordinator = _Coordinator()
    start = datetime(2026, 7, 25, 0, 0, 0)
    samples = 5  # every 6 hours across one day
    data_by_sensor = {
        const.MAPPING_SOLRAD: [20.0] * samples,
        const.RETRIEVED_AT: [start + timedelta(hours=6 * i) for i in range(samples)],
    }
    resultdata = {}
    await coordinator._aggregate_sensor_data(
        data_by_sensor, _mapping_with_riemann(const.MAPPING_SOLRAD), resultdata
    )
    assert resultdata[const.MAPPING_SOLRAD] == pytest.approx(20.0)


async def test_riemann_sum_15_minute_interval():
    """15-minute samples must integrate with dt in days (#784 reported ~900x blow-up)."""
    coordinator = _Coordinator()
    start = datetime(2026, 7, 25, 12, 0, 0)
    data_by_sensor = {
        const.MAPPING_SOLRAD: [10.0, 20.0, 30.0],
        const.RETRIEVED_AT: [start + timedelta(minutes=15 * i) for i in range(3)],
    }
    resultdata = {}
    await coordinator._aggregate_sensor_data(
        data_by_sensor, _mapping_with_riemann(const.MAPPING_SOLRAD), resultdata
    )
    # trapezoids: ((10+20)/2 + (20+30)/2) * (900 / 86400), over a span of
    # 1800 / 86400 days: the time-weighted mean rate, 20 MJ/day/m2. Not the
    # integral, which PyETO would read as a day with almost no sun.
    assert resultdata[const.MAPPING_SOLRAD] == pytest.approx(
        (40.0 * 900.0 / 86400.0) / (1800.0 / 86400.0)
    )


async def test_a_constant_sun_is_the_same_by_riemann_sum_or_average():
    """The engine takes the solar radiation as the day's rate, and scales its
    result by the interval itself. A Riemann sum handing it the energy of a
    short window instead gave 40% less evaporation over half an hour than the
    Average aggregate did for the same constant sun."""
    start = datetime(2026, 7, 25, 12, 0, 0)
    values = {}
    for aggregate in (
        const.MAPPING_CONF_AGGREGATE_AVERAGE,
        const.MAPPING_CONF_AGGREGATE_RIEMANNSUM,
    ):
        resultdata = {const.MAPPING_DATA_MULTIPLIER: 0.5 / 24}
        await _Coordinator()._aggregate_sensor_data(
            {
                const.MAPPING_SOLRAD: [20.0] * 3,
                const.RETRIEVED_AT: [
                    start + timedelta(minutes=15 * i) for i in range(3)
                ],
            },
            {
                const.MAPPING_ID: 1,
                const.MAPPING_MAPPINGS: {
                    const.MAPPING_SOLRAD: {const.MAPPING_CONF_AGGREGATE: aggregate}
                },
            },
            resultdata,
        )
        values[aggregate] = resultdata[const.MAPPING_SOLRAD]

    assert values[const.MAPPING_CONF_AGGREGATE_RIEMANNSUM] == pytest.approx(20.0)
    assert values[const.MAPPING_CONF_AGGREGATE_AVERAGE] == pytest.approx(20.0)


async def test_the_precipitation_rate_is_still_integrated_into_a_depth():
    """2 mm/h for half an hour is 1 mm: that one is a depth, not a rate."""
    start = datetime(2026, 7, 25, 12, 0, 0)
    resultdata = {}
    await _Coordinator()._aggregate_sensor_data(
        {
            const.MAPPING_CURRENT_PRECIPITATION: [2.0] * 3,
            const.RETRIEVED_AT: [start + timedelta(minutes=15 * i) for i in range(3)],
        },
        _mapping_with_riemann(const.MAPPING_CURRENT_PRECIPITATION),
        resultdata,
    )

    assert resultdata[const.MAPPING_CURRENT_PRECIPITATION] == pytest.approx(1.0)


def _mapping_with_data(key, data):
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_MAPPINGS: {
            key: {const.MAPPING_CONF_AGGREGATE: const.MAPPING_CONF_AGGREGATE_RIEMANNSUM}
        },
        const.MAPPING_DATA: data,
        const.MAPPING_DATA_LAST_CALCULATION: {},
    }


async def test_records_carrying_one_key_each_still_integrate_correctly():
    """Continuous updates append one record per sensor state change (#363).

    Each record then carries a single key, so the flat list of record timestamps
    never lines up with a key's values. The length check that guarded it fell
    back to one day per sample, inflating the result by roughly the number of
    samples: with solar radiation aggregated by Riemann sum, which is what the
    docs recommend for continuous updates, a day of samples came out about a
    hundred times too large.
    """
    coordinator = _Coordinator()
    start = datetime(2026, 8, 31, 0, 0, 0)
    # A steady 20 MJ/day/m2 over 24h is 20, whatever else is interleaved.
    data = []
    for i in range(5):
        stamp = start + timedelta(hours=6 * i)
        data.append({const.MAPPING_WINDSPEED: 1.0, const.RETRIEVED_AT: stamp})
        data.append({const.MAPPING_SOLRAD: 20.0, const.RETRIEVED_AT: stamp})

    result = await coordinator.apply_aggregates_to_mapping_data(
        _mapping_with_data(const.MAPPING_SOLRAD, data)
    )

    assert result[const.MAPPING_SOLRAD] == pytest.approx(20.0)


async def test_uneven_sampling_uses_each_interval():
    """One average spacing misrepresents samples that are not evenly spaced."""
    coordinator = _Coordinator()
    start = datetime(2026, 8, 31, 0, 0, 0)
    # 12 MJ/day/m2 held for 18 hours, then 0 for the last 6.
    data = [
        {const.MAPPING_SOLRAD: 12.0, const.RETRIEVED_AT: start},
        {const.MAPPING_SOLRAD: 12.0, const.RETRIEVED_AT: start + timedelta(hours=18)},
        {const.MAPPING_SOLRAD: 0.0, const.RETRIEVED_AT: start + timedelta(hours=24)},
    ]

    result = await coordinator.apply_aggregates_to_mapping_data(
        _mapping_with_data(const.MAPPING_SOLRAD, data)
    )

    # 12 * 0.75 day + (12+0)/2 * 0.25 day
    assert result[const.MAPPING_SOLRAD] == pytest.approx(10.5)


async def test_missing_timestamps_are_spread_over_the_interval_and_warned(caplog):
    """Never silently assume a day per sample."""
    coordinator = _Coordinator()
    data = [{const.MAPPING_SOLRAD: 20.0}, {const.MAPPING_SOLRAD: 20.0}]

    result = await coordinator.apply_aggregates_to_mapping_data(
        _mapping_with_data(const.MAPPING_SOLRAD, data)
    )

    assert "no usable timestamps" in caplog.text
    assert result[const.MAPPING_SOLRAD] < 20.0
