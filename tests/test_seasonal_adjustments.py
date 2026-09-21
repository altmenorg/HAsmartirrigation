"""Seasonal adjustments act where the calculation reads them, once.

- The threshold adjustment was added to the calculated bucket, which is then
  stored, so every calculation added it again: -5 mm one day was -10 mm the
  next, and the zone was watered more and more.
- The multiplier adjustment scaled a crop factor the calculation's result does
  not carry, so it never applied.

The multiplier scales the crop factor for the months it covers, and the
threshold adjustment moves the irrigation threshold, both in the calculation.
"""

from unittest.mock import MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.scheduler import SeasonalAdjustmentManager


def _manager(*adjustments):
    manager = SeasonalAdjustmentManager.__new__(SeasonalAdjustmentManager)
    manager.hass = MagicMock()
    manager._adjustments = list(adjustments)
    return manager


def _adjustment(**values):
    return {
        const.SEASONAL_CONF_NAME: "Summer",
        const.SEASONAL_CONF_ENABLED: True,
        const.SEASONAL_CONF_MONTH_START: 6,
        const.SEASONAL_CONF_MONTH_END: 8,
        const.SEASONAL_CONF_ZONES: "all",
        **values,
    }


class _Coordinator(CalculationMixin):
    def __init__(self, manager):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.store = MagicMock()
        self.seasonal_adjustment_manager = manager


def test_factors_combine_the_active_adjustments():
    manager = _manager(
        _adjustment(
            **{
                const.SEASONAL_CONF_MULTIPLIER_ADJUSTMENT: 1.5,
                const.SEASONAL_CONF_THRESHOLD_ADJUSTMENT: -2.0,
            }
        ),
        _adjustment(**{const.SEASONAL_CONF_MULTIPLIER_ADJUSTMENT: 1.2}),
    )

    assert manager.seasonal_factors(1, month=7) == pytest.approx((1.8, -2.0))


def test_out_of_season_nothing_applies():
    manager = _manager(_adjustment(**{const.SEASONAL_CONF_MULTIPLIER_ADJUSTMENT: 2.0}))

    assert manager.seasonal_factors(1, month=1) == (1.0, 0.0)


def test_a_season_across_the_new_year():
    manager = _manager(
        _adjustment(
            **{
                const.SEASONAL_CONF_MONTH_START: 11,
                const.SEASONAL_CONF_MONTH_END: 2,
                const.SEASONAL_CONF_MULTIPLIER_ADJUSTMENT: 0.5,
            }
        )
    )

    assert manager.seasonal_factors(1, month=1)[0] == 0.5
    assert manager.seasonal_factors(1, month=6)[0] == 1.0


def test_an_adjustment_for_other_zones_does_not_apply():
    manager = _manager(
        _adjustment(
            **{
                const.SEASONAL_CONF_ZONES: [2],
                const.SEASONAL_CONF_MULTIPLIER_ADJUSTMENT: 2.0,
            }
        )
    )

    assert manager.seasonal_factors(1, month=7)[0] == 1.0
    assert manager.seasonal_factors(2, month=7)[0] == 2.0


@pytest.mark.asyncio
async def test_the_result_is_not_touched_any_more():
    """Adding the threshold to the stored bucket compounded every day."""
    manager = _manager(
        _adjustment(
            **{
                const.SEASONAL_CONF_MONTH_START: 1,
                const.SEASONAL_CONF_MONTH_END: 12,
                const.SEASONAL_CONF_THRESHOLD_ADJUSTMENT: -5.0,
            }
        )
    )
    calculated = {const.ZONE_BUCKET: -3.0, const.ZONE_DURATION: 300}

    first = await manager.apply_seasonal_adjustments(dict(calculated), 1)
    second = await manager.apply_seasonal_adjustments(dict(first), 1)

    assert second == calculated


@pytest.mark.parametrize(
    ("threshold", "offset", "expected"),
    [(10.0, -5.0, 5.0), (10.0, 3.0, 13.0), (2.0, -5.0, 0.0), (0.0, 4.0, 4.0)],
)
def test_the_threshold_adjustment_moves_the_irrigation_threshold(
    threshold, offset, expected
):
    manager = _manager(
        _adjustment(
            **{
                const.SEASONAL_CONF_MONTH_START: 1,
                const.SEASONAL_CONF_MONTH_END: 12,
                const.SEASONAL_CONF_THRESHOLD_ADJUSTMENT: offset,
            }
        )
    )
    zone = {const.ZONE_ID: 1, const.ZONE_IRRIGATION_THRESHOLD: threshold}

    assert _Coordinator(manager).irrigation_threshold_mm(zone) == pytest.approx(
        expected
    )


def test_without_a_manager_the_season_is_neutral():
    zone = {const.ZONE_ID: 1, const.ZONE_IRRIGATION_THRESHOLD: 10.0}

    assert _Coordinator(None).irrigation_threshold_mm(zone) == 10.0
    assert _Coordinator(None)._seasonal_factors(zone) == (1.0, 0.0)
