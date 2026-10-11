"""The window's water balance is replayed hour by hour when it rained (#783).

A calculation used to add all the window's rain to the bucket and drain the
result over the whole window. Rain that had just fallen was drained as if it
had been in the soil since the window opened: 2 mm at 4 PM, seen at 5:40 PM
after a calculation at 11 PM the night before, raised the live bucket of
Megalos' lawn by about 0.4 mm where it should have raised it by about 1.7.

Now each hour gets its share of the evapotranspiration, the rain that fell in
it, then that hour's drainage. The totals booked do not change.
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calcmodules.passthrough import Passthrough
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.water_balance import (
    drainage_over,
    hour_slots,
    rain_profile,
    replay,
)

# Megalos' lawn, from the diagnostics in #783.
MAXIMUM = 14.0
RATE = 50.8
START = 1.884
WINDOW = 18.65  # 11 PM to 5:39 PM
RAIN_HOUR = 17  # 4 PM is the 18th hour of the window


def _single_step(bucket, rain, hours):
    """What one step did: all the rain first, then drain the whole window."""
    bucket = min(bucket + rain, MAXIMUM)
    return bucket - drainage_over(bucket, hours, RATE, MAXIMUM)


def _integrated(bucket, hours, steps=100_000):
    """The drainage law integrated numerically, independent of the closed form."""
    dt = hours / steps
    for _ in range(steps):
        bucket -= RATE * (bucket / MAXIMUM) ** 4 * dt
    return bucket


# --- the pure replay --------------------------------------------------------


def test_the_reported_case():
    without_rain = _single_step(START, 0.0, WINDOW)
    profile = [0.0] * 19
    profile[RAIN_HOUR] = 1.0

    old = _single_step(START, 2.0, WINDOW)
    new, drained, _ = replay(START, 0.0, 2.0, WINDOW, profile, MAXIMUM, RATE)

    assert old - without_rain == pytest.approx(0.58, abs=0.02)
    assert new - without_rain == pytest.approx(1.69, abs=0.02)
    assert drained == pytest.approx(START + 2.0 - new)


def test_rain_at_the_start_drains_as_one_step_did():
    """When the rain really fell first, the single step was right, and the
    replay must agree with the drainage law over the whole window."""
    profile = [1.0] + [0.0] * 23

    new, _, _ = replay(START, 0.0, 6.0, 24.0, profile, MAXIMUM, RATE)

    assert new == pytest.approx(_integrated(START + 6.0, 24.0), rel=1e-3)
    assert new == pytest.approx(_single_step(START, 6.0, 24.0), rel=1e-9)


def test_later_rain_leaves_more_in_the_soil():
    early = [1.0] + [0.0] * 23
    late = [0.0] * 23 + [1.0]

    after_early, _, _ = replay(0.0, 0.0, 5.0, 24.0, early, MAXIMUM, RATE)
    after_late, _, _ = replay(0.0, 0.0, 5.0, 24.0, late, MAXIMUM, RATE)

    assert after_late > after_early


def test_without_timing_the_rain_is_spread_evenly():
    even = [1 / 24] * 24

    unknown = replay(START, -2.4, 4.8, 24.0, None, MAXIMUM, RATE)
    spread = replay(START, -2.4, 4.8, 24.0, even, MAXIMUM, RATE)

    assert unknown == pytest.approx(spread)


def test_a_rain_on_a_dry_soil_only_fills_the_deficit():
    """Nothing drains while the soil is below field capacity."""
    new, drained, _ = replay(-10.0, -2.0, 5.0, 24.0, None, MAXIMUM, RATE)

    assert drained == 0
    assert new == pytest.approx(-10.0 - 2.0 + 5.0)


def test_each_hour_is_capped_at_the_maximum_bucket():
    """A downpour above the maximum runs off in the hour it falls."""
    profile = [0.0] * 23 + [1.0]

    new, _, peak = replay(MAXIMUM - 1.0, 0.0, 30.0, 24.0, profile, MAXIMUM, RATE)

    assert peak == pytest.approx(MAXIMUM)
    assert new <= MAXIMUM


def test_each_hour_is_floored_at_the_available_water():
    """A soil already at its driest takes the rain that comes after.

    It reaches -20 mm within two hours and stays there; the last hour adds its
    0.5 mm of evapotranspiration and the 4 mm of rain. One step booked the
    whole window at once and stopped at the floor, losing the rain.
    """
    profile = [0.0] * 23 + [1.0]

    new, _, _ = replay(-19.0, -12.0, 4.0, 24.0, profile, MAXIMUM, RATE, 20.0)

    assert new == pytest.approx(-16.5)


def test_the_constant_rate_without_a_maximum_bucket():
    profile = [0.0] * 23 + [1.0]

    new, drained, _ = replay(0.0, 0.0, 5.0, 24.0, profile, None, 0.5)

    assert drained == pytest.approx(0.5)
    assert new == pytest.approx(4.5)


# --- when it rained ---------------------------------------------------------


def test_hour_slots():
    assert hour_slots(3.0) == [1.0, 1.0, 1.0]
    assert hour_slots(2.5) == [1.0, 1.0, 0.5]
    assert hour_slots(0.25) == [0.25]
    assert hour_slots(0.0) == []


def test_rain_profile_places_readings_in_their_hour():
    end = datetime(2026, 10, 10, 17, 39)
    start = end - timedelta(hours=WINDOW)
    timing = [
        [(start + timedelta(hours=17, minutes=5)).isoformat(), 1.5],
        [(start + timedelta(hours=17, minutes=40)).isoformat(), 0.5],
    ]

    profile = rain_profile(timing, end, WINDOW)

    assert len(profile) == 19
    assert profile[RAIN_HOUR] == pytest.approx(1.0)
    assert sum(profile) == pytest.approx(1.0)


def test_rain_profile_leaves_out_the_previous_window_and_keeps_a_late_clock():
    end = datetime(2026, 10, 10, 12, 0)
    timing = [
        [(end - timedelta(hours=30)).isoformat(), 5.0],  # previous window
        [(end + timedelta(minutes=2)).isoformat(), 1.0],  # a clock that moved
        [(end - timedelta(hours=5, minutes=30)).isoformat(), 1.0],
    ]

    profile = rain_profile(timing, end, 10.0)

    assert profile[-1] == pytest.approx(0.5)
    assert profile[4] == pytest.approx(0.5)


def test_rain_profile_says_nothing_without_rain_readings():
    end = datetime(2026, 10, 10, 12, 0)

    assert rain_profile(None, end, 10.0) is None
    assert rain_profile([], end, 10.0) is None
    assert rain_profile([[end.isoformat(), 0.0]], end, 10.0) is None


def test_a_cumulative_gauge_says_when_each_millimetre_was_seen():
    stamps = ["2026-10-10T08:00:00", "2026-10-10T16:10:00", "2026-10-10T16:40:00"]
    increments = []

    total = CalculationMixin._cumulative_change(
        [3.0, 4.5, 5.0], stamps, start=3.0, increments=increments
    )

    assert total == pytest.approx(2.0)
    assert increments == [
        ["2026-10-10T16:10:00", pytest.approx(1.5)],
        ["2026-10-10T16:40:00", pytest.approx(0.5)],
    ]


def test_a_reset_counts_as_rain_seen_at_the_reset():
    stamps = ["2026-10-09T23:50:00", "2026-10-10T00:10:00"]
    increments = []

    CalculationMixin._cumulative_change(
        [6.0, 0.4], stamps, start=5.0, increments=increments
    )

    assert increments == [
        ["2026-10-09T23:50:00", pytest.approx(1.0)],
        ["2026-10-10T00:10:00", pytest.approx(0.4)],
    ]


# --- through the calculation --------------------------------------------------


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.hass.config.language = "en"
        self.store = MagicMock()
        self.store.get_mapping = MagicMock(return_value={})
        self.store.get_config = MagicMock(return_value={})
        self.store.get_module = MagicMock(
            return_value={const.MODULE_NAME: "Passthrough", "config": {}}
        )

    async def getModuleInstanceByID(self, module_id):
        return Passthrough(None, description="test", config={})


def _zone():
    return {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
        const.ZONE_MODULE: 1,
        const.ZONE_BUCKET: START,
        const.ZONE_MAXIMUM_BUCKET: MAXIMUM,
        const.ZONE_DRAINAGE_RATE: RATE,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_SIZE: 50.0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_MAXIMUM_DURATION: 3600.0,
        const.ZONE_LEAD_TIME: 0.0,
    }


async def _calculate(weatherdata):
    with patch(
        "custom_components.smart_irrigation.calculation.localize",
        new=AsyncMock(return_value=""),
    ):
        return await _Coordinator().calculate_module(_zone(), weatherdata, None)


@pytest.mark.asyncio
async def test_the_calculation_drains_the_rain_from_the_hour_it_fell():
    end = datetime(2026, 10, 10, 17, 39)
    rain_at = (end - timedelta(minutes=99)).isoformat()
    weather = {
        const.MAPPING_EVAPOTRANSPIRATION: 0.0,
        const.MAPPING_PRECIPITATION: 2.0,
        const.MAPPING_DATA_MULTIPLIER: WINDOW / 24,
        const.MAPPING_DATA_WINDOW_END: end,
    }
    timed = {
        **weather,
        const.MAPPING_DATA_RAIN_TIMING: {const.MAPPING_PRECIPITATION: [[rain_at, 2.0]]},
    }

    with_timing = await _calculate(timed)
    without_timing = await _calculate(weather)

    no_rain = _single_step(START, 0.0, WINDOW)
    assert with_timing[const.ZONE_BUCKET] - no_rain == pytest.approx(1.69, abs=0.03)
    # Not knowing when, the rain is spread over the window: between the two.
    assert (
        _single_step(START, 2.0, WINDOW)
        < without_timing[const.ZONE_BUCKET]
        < with_timing[const.ZONE_BUCKET]
    )
    assert with_timing[const.ZONE_DELTA] == pytest.approx(2.0)


@pytest.mark.asyncio
async def test_a_rate_sensor_times_a_depth_that_cannot():
    end = datetime(2026, 10, 10, 17, 39)
    weather = {
        const.MAPPING_EVAPOTRANSPIRATION: 0.0,
        const.MAPPING_PRECIPITATION: 2.0,
        const.MAPPING_DATA_MULTIPLIER: WINDOW / 24,
        const.MAPPING_DATA_WINDOW_END: end,
        const.MAPPING_DATA_RAIN_TIMING: {
            const.MAPPING_CURRENT_PRECIPITATION: [
                [(end - timedelta(minutes=99)).isoformat(), 2.0]
            ]
        },
    }

    data = await _calculate(weather)

    assert data[const.ZONE_BUCKET] - _single_step(START, 0.0, WINDOW) == (
        pytest.approx(1.69, abs=0.03)
    )


@pytest.mark.asyncio
async def test_a_window_without_rain_keeps_the_single_step():
    weather = {
        const.MAPPING_EVAPOTRANSPIRATION: 0.0,
        const.MAPPING_DATA_MULTIPLIER: WINDOW / 24,
    }

    data = await _calculate(weather)

    assert data[const.ZONE_BUCKET] == pytest.approx(_single_step(START, 0.0, WINDOW))
