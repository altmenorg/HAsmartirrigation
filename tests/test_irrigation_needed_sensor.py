"""The "irrigation needed" sensor follows the zone's irrigation threshold.

It read any deficit as a need, while the duration waits for the threshold
(#815): with a 10 mm threshold and a 3 mm deficit it said water was needed on a
day the zone would not water, and was not meant to.
"""

from unittest.mock import MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.binary_sensor import (
    SmartIrrigationZoneIrrigationNeededBinarySensor,
)
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Coordinator(CalculationMixin):
    def __init__(self, hass, zone):
        self.hass = hass
        self.store = MagicMock()
        self.store.get_zone = MagicMock(return_value=zone)
        self.seasonal_adjustment_manager = None


def _sensor(zone, units=METRIC_SYSTEM):
    hass = MagicMock()
    hass.config.units = units
    hass.data = {const.DOMAIN: {"coordinator": _Coordinator(hass, zone)}}
    sensor = SmartIrrigationZoneIrrigationNeededBinarySensor(
        hass, "binary_sensor.lawn_irrigation_needed", 1, "Lawn"
    )
    sensor._recompute()
    return sensor.is_on


def _zone(bucket, threshold=0.0):
    return {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
        const.ZONE_BUCKET: bucket,
        const.ZONE_IRRIGATION_THRESHOLD: threshold,
    }


@pytest.mark.parametrize(
    ("bucket", "threshold", "needed"),
    [
        (-3.0, 0.0, True),
        (0.0, 0.0, False),
        (2.0, 0.0, False),
        (-3.0, 10.0, False),
        (-10.0, 10.0, True),
        (-12.0, 10.0, True),
    ],
)
def test_it_follows_the_threshold(bucket, threshold, needed):
    assert _sensor(_zone(bucket, threshold)) is needed


def test_the_unit_system_does_not_change_the_answer():
    """Bucket and threshold are both stored in mm on any system (units.py)."""
    assert _sensor(_zone(-12.7, 10.2), US_CUSTOMARY_SYSTEM) is True
    assert _sensor(_zone(-7.6, 10.2), US_CUSTOMARY_SYSTEM) is False
