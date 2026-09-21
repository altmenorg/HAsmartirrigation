"""A zone can let a deficit build up before watering (#815).

Irrigation used to start the moment the bucket went below 0, which is a
management allowed depletion of zero: refill the instant anything is missing.
That suits a lawn and not a tree or a hedge, which want the soil to dry down and
then a deep soak.

A threshold changes *when*, and leaves *how much* alone: once it is reached the
run still delivers the whole deficit. That also means a zone never waters less
than its threshold, so the very short runs a minimum-duration setting was meant
to avoid cannot happen either.
"""

from unittest.mock import MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Coordinator(CalculationMixin):
    def __init__(self, metric=True):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM if metric else US_CUSTOMARY_SYSTEM
        self.store = MagicMock()


def _zone(threshold=0.0):
    return {
        const.ZONE_ID: 0,
        const.ZONE_NAME: "Tree",
        # 100 m2 at 10 l/min is 6 mm/h.
        const.ZONE_SIZE: 100.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_LEAD_TIME: 0.0,
        const.ZONE_MAXIMUM_DURATION: -1,
        const.ZONE_IRRIGATION_THRESHOLD: threshold,
    }


def test_no_threshold_keeps_watering_as_soon_as_anything_is_missing():
    """The default of 0 must not change a single existing setup."""
    coordinator = _Coordinator()

    assert coordinator.duration_from_bucket(_zone(), -1.0) == pytest.approx(600)


def test_a_deficit_below_the_threshold_waters_nothing():
    coordinator = _Coordinator()

    assert coordinator.duration_from_bucket(_zone(threshold=25.0), -24.9) == 0


def test_reaching_the_threshold_delivers_the_whole_deficit():
    """The threshold decides when, not how much."""
    coordinator = _Coordinator()

    # 25 mm at 6 mm/h is 15000 s.
    assert coordinator.duration_from_bucket(
        _zone(threshold=25.0), -25.0
    ) == pytest.approx(15000)


def test_past_the_threshold_the_run_keeps_growing_with_the_deficit():
    coordinator = _Coordinator()

    assert coordinator.duration_from_bucket(
        _zone(threshold=25.0), -30.0
    ) == pytest.approx(18000)


def test_a_zone_never_waters_less_than_its_threshold():
    """Which is the minimum run size, as a consequence rather than a setting."""
    coordinator = _Coordinator()
    zone = _zone(threshold=25.0)

    durations = [
        coordinator.duration_from_bucket(zone, -deficit) for deficit in (1, 10, 24.9)
    ]

    assert durations == [0, 0, 0]


def test_the_threshold_is_stored_in_mm_on_any_system():
    """Zone values are stored in metric whatever the unit system (units.py)."""
    metric = _Coordinator()
    imperial = _Coordinator(metric=False)

    assert metric.irrigation_threshold_mm(_zone(threshold=25.4)) == pytest.approx(25.4)
    assert imperial.irrigation_threshold_mm(_zone(threshold=25.4)) == pytest.approx(
        25.4
    )


def test_a_missing_or_negative_threshold_is_treated_as_none():
    coordinator = _Coordinator()

    assert coordinator.irrigation_threshold_mm({}) == 0.0
    assert coordinator.irrigation_threshold_mm(_zone(threshold=None)) == 0.0
    assert coordinator.irrigation_threshold_mm(_zone(threshold=-5.0)) == 0.0
