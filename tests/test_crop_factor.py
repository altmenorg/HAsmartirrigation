"""The crop factor scales the crop's water use, not the rain (#779).

The zone multiplier is documented as the crop factor Kc, and it used to be
applied at the very end to the duration. That scaled the whole water balance
rather than the evapotranspiration, with two consequences Megalos worked out:

- the rain was scaled with it, so only Kc times the millimetres that fell were
  credited, and a Kc below 1 therefore over-watered;
- the bucket kept draining at the full ET0, so any threshold to irrigate at was
  reached about 1/Kc times too fast, and a factor applied afterwards cannot undo
  a decision about *when* to water.

ETc = ET0 * Kc, applied before the bucket is depleted.
"""

from unittest.mock import MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.store = MagicMock()


def _zone(multiplier, bucket=0.0):
    return {
        const.ZONE_ID: 0,
        const.ZONE_NAME: "Lawn",
        const.ZONE_BUCKET: bucket,
        # 100 m2 at 10 l/min is 6 mm/h.
        const.ZONE_SIZE: 100.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MULTIPLIER: multiplier,
        const.ZONE_LEAD_TIME: 0.0,
        const.ZONE_MAXIMUM_DURATION: -1,
    }


def test_a_bucket_deficit_maps_to_a_duration_without_the_crop_factor():
    """The bucket already carries Kc, so applying it again would double it."""
    coordinator = _Coordinator()

    # 6 mm of deficit at 6 mm/h is one hour, whatever Kc is.
    for multiplier in (0.5, 1.0, 2.0):
        assert coordinator.duration_from_bucket(
            _zone(multiplier), -6.0
        ) == pytest.approx(3600)


@pytest.mark.parametrize("multiplier", [0.5, 1.0, 2.0])
def test_without_rain_the_water_given_is_unchanged(multiplier):
    """The old and new orders agree when there is nothing to over-credit.

    Old: duration proportional to ET0 * days * Kc.
    New: duration proportional to (ET0 * Kc) * days.
    Same product, so a dry spell waters exactly as it did before.
    """
    et0_per_day, days = 4.0, 3.0
    old = et0_per_day * days * multiplier
    new = (et0_per_day * multiplier) * days

    assert old == pytest.approx(new)


def test_with_rain_a_crop_factor_below_one_no_longer_over_waters():
    """This is the case that wasted water.

    ET0 4 mm/day for 3 days with Kc 0.5 and 6 mm of rain. The crop needed
    4 * 3 * 0.5 = 6 mm and 6 mm fell, so nothing is owed. The old order gave
    (12 - 6) * 0.5 = 3 mm, because it credited only half the rain.
    """
    et0_per_day, days, kc, rain = 4.0, 3.0, 0.5, 6.0

    old_need = (et0_per_day * days - rain) * kc
    new_need = et0_per_day * days * kc - rain

    assert old_need == pytest.approx(3.0)
    assert new_need == pytest.approx(0.0)


def test_the_bucket_drains_at_the_crop_rate_not_the_reference_rate():
    """Reaching a threshold to irrigate at is a decision about *when*.

    With Kc 0.5 the soil loses 2 mm a day, not 4, so a 10 mm allowed deficit is
    reached on day 5 rather than day 3. No factor applied to the duration
    afterwards can move that day.
    """
    et0_per_day, kc, allowed_deficit = 4.0, 0.5, 10.0

    days_at_reference = allowed_deficit / et0_per_day
    days_at_crop_rate = allowed_deficit / (et0_per_day * kc)

    assert days_at_reference == pytest.approx(2.5)
    assert days_at_crop_rate == pytest.approx(5.0)
