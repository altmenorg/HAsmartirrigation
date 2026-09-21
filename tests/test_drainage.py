"""Drainage follows the rate law the model says it uses.

Above field capacity the surplus drains at the full rate at saturation, scaled
by (bucket / maximum_bucket)^4: a rate law, dB/dt = -r (B/M)^4, that slows as
the surplus drains. It used to be evaluated once, at the bucket after the
interval's rain, and multiplied by the whole interval. On a curve that steep a
single 24-hour step drains far too much: with the defaults an 8 mm surplus was
emptied completely, where the law itself drains 3.7 mm and leaves 4.3.

Reported, with the arithmetic, by Megalos (discussion #783). Nothing tested the
drainage before this file, which is how a factor of two survived.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin

RATE = 50.8  # mm/h at saturation, the default
MAXIMUM = 24.0  # mm, the default


class _Module:
    name = "Static"

    def __init__(self, gain):
        self._gain = gain

    def calculate(self):
        return self._gain


class _Coordinator(CalculationMixin):
    def __init__(self, gain):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.hass.config.language = "en"
        self.store = MagicMock()
        self.store.get_module = MagicMock(
            return_value={const.MODULE_ID: 1, const.MODULE_NAME: "Static"}
        )
        self.getModuleInstanceByID = AsyncMock(return_value=_Module(gain))
        self._build_calc_record = MagicMock(return_value=None)


async def _drain(surplus, rate=RATE, maximum=MAXIMUM, days=1.0):
    """The bucket left after one interval that starts ``surplus`` mm above 0."""
    zone = {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_MODULE: 1,
        const.ZONE_MAPPING: None,
        const.ZONE_BUCKET: 0.0,
        const.ZONE_MAXIMUM_BUCKET: maximum,
        const.ZONE_DRAINAGE_RATE: rate,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_IRRIGATION_THRESHOLD: 0,
    }
    # The module's figure is per day and gets scaled by the interval, so ask for
    # surplus / days to start every interval from the same surplus.
    data = await _Coordinator(surplus / days).calculate_module(
        zone, {const.MAPPING_DATA_MULTIPLIER: days}, []
    )
    return data[const.ZONE_BUCKET], data[const.ZONE_CURRENT_DRAINAGE]


def _integrated(surplus, rate=RATE, maximum=MAXIMUM, hours=24.0, steps=200_000):
    """The same law, integrated numerically: an answer that does not share the
    closed form's algebra, so the two agreeing means something."""
    bucket, dt = surplus, hours / steps
    for _ in range(steps):
        bucket -= rate * (bucket / maximum) ** 4 * dt
    return bucket


@pytest.mark.asyncio
async def test_the_example_in_the_report():
    """8 mm, the defaults, one day: 3.7 mm drained, 4.3 mm left."""
    left, drained = await _drain(8.0)

    assert left == pytest.approx(4.26, abs=0.01)
    assert drained == pytest.approx(3.74, abs=0.01)


@pytest.mark.asyncio
@pytest.mark.parametrize("surplus", [24.0, 20.0, 10.0, 5.0, 2.0, 0.5])
async def test_it_agrees_with_the_rate_law_integrated_step_by_step(surplus):
    left, _ = await _drain(surplus)

    assert left == pytest.approx(_integrated(surplus), rel=1e-3)


@pytest.mark.asyncio
async def test_no_storm_leaves_more_than_the_law_allows():
    """A property of the n = 4 law: after t hours at most [3 r t / M^4]^(-1/3)
    remains above field capacity, whatever the starting surplus."""
    ceiling = (3 * RATE * 24 / MAXIMUM**4) ** (-1 / 3)

    left, _ = await _drain(MAXIMUM)

    assert left <= ceiling
    assert ceiling == pytest.approx(4.49, abs=0.01)


@pytest.mark.asyncio
async def test_a_small_surplus_barely_moves():
    """Where the curve is nearly flat, which is where one step was close enough."""
    left, _ = await _drain(2.0)

    assert left == pytest.approx(1.94, abs=0.01)


@pytest.mark.asyncio
async def test_a_shorter_interval_drains_less():
    half_day, _ = await _drain(8.0, days=0.5)
    full_day, _ = await _drain(8.0, days=1.0)

    assert full_day < half_day < 8.0


@pytest.mark.asyncio
async def test_a_drainage_rate_of_zero_drains_nothing():
    left, drained = await _drain(8.0, rate=0.0)

    assert left == pytest.approx(8.0)
    assert drained == 0


@pytest.mark.asyncio
async def test_without_a_maximum_bucket_it_drains_at_a_constant_rate():
    """No saturation reference to scale by, as before.

    None, not 0: a maximum bucket of 0 caps the bucket at field capacity, so
    there is never a surplus to drain in the first place.
    """
    left, drained = await _drain(8.0, rate=0.1, maximum=None)

    assert drained == pytest.approx(0.1 * 24)
    assert left == pytest.approx(8.0 - 2.4)
