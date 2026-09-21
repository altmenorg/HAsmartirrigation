"""Tests for the direct "precipitation rate" zone input method.

A zone's precipitation rate can either be derived from throughput + size
(the default, existing behavior) or entered directly in mm/h (or in/h for
imperial systems), e.g. from a bucket test. Both should produce the same
duration for an equivalent rate.
"""

from unittest.mock import Mock

from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Coordinator(CalculationMixin):
    def __init__(self, hass):
        self.hass = hass


def _make_hass(metric=True):
    hass = Mock()
    hass.config = Mock()
    hass.config.units = METRIC_SYSTEM if metric else US_CUSTOMARY_SYSTEM
    return hass


def _throughput_zone(**overrides):
    zone = {
        const.ZONE_THROUGHPUT: 10.0,  # L/min
        const.ZONE_SIZE: 60.0,  # m2 -> (10*60)/60 = 10 mm/h
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_MAXIMUM_DURATION: None,
        const.ZONE_LEAD_TIME: 0,
    }
    zone.update(overrides)
    return zone


def _rate_zone(rate, **overrides):
    zone = {
        const.ZONE_INPUT_METHOD: const.ZONE_INPUT_METHOD_PRECIPITATION_RATE,
        const.ZONE_PRECIPITATION_RATE: rate,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_MAXIMUM_DURATION: None,
        const.ZONE_LEAD_TIME: 0,
    }
    zone.update(overrides)
    return zone


def test_precipitation_rate_matches_equivalent_throughput_zone():
    """A direct 10 mm/h rate should behave like throughput=10 L/min, size=60 m2."""
    coordinator = _Coordinator(_make_hass(metric=True))

    throughput_duration = coordinator.duration_from_bucket(
        _throughput_zone(), bucket_native=-2.0
    )
    rate_duration = coordinator.duration_from_bucket(
        _rate_zone(10.0), bucket_native=-2.0
    )

    assert rate_duration == throughput_duration
    assert rate_duration > 0


def test_precipitation_rate_defaults_to_throughput_mode():
    """Zones without an explicit input_method behave as before (throughput mode)."""
    coordinator = _Coordinator(_make_hass(metric=True))
    zone = _throughput_zone()
    assert zone.get(const.ZONE_INPUT_METHOD) is None

    duration = coordinator.duration_from_bucket(zone, bucket_native=-2.0)
    assert duration > 0


def test_the_unit_system_does_not_change_the_duration():
    """The rate and the bucket are stored in mm/h and mm on any system
    (units.py); only what is shown differs."""
    metric_duration = _Coordinator(_make_hass(metric=True)).duration_from_bucket(
        _rate_zone(25.4), bucket_native=-2.0
    )
    imperial_duration = _Coordinator(_make_hass(metric=False)).duration_from_bucket(
        _rate_zone(25.4), bucket_native=-2.0
    )

    assert imperial_duration == metric_duration


def test_precipitation_rate_missing_value_returns_zero_duration():
    """Rate mode with no value entered yet should not crash and yield 0 duration."""
    coordinator = _Coordinator(_make_hass(metric=True))
    zone = _rate_zone(None)

    assert coordinator.duration_from_bucket(zone, bucket_native=-2.0) == 0
