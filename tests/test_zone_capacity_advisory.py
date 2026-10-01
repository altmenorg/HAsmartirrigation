"""A zone whose longest run cannot water what it loses is worth a word (#9).

Advisory only: the cap may be on purpose. It is raised as a repair issue, and
cleared as soon as the zone can keep up.
"""

from unittest.mock import MagicMock, patch

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.flow_calibration import (
    FlowCalibrationMixin,
)

ZONE = {
    const.ZONE_ID: 3,
    const.ZONE_NAME: "Drip",
    const.ZONE_MAXIMUM_DURATION: 600,  # ten minutes
}


def _mixin():
    class _M(FlowCalibrationMixin):
        pass

    mixin = _M()
    mixin.hass = MagicMock()
    return mixin


def test_a_run_that_cannot_make_up_a_days_loss_raises_the_advisory():
    # 6 mm/h for ten minutes is 1 mm; the zone loses 4 mm a day.
    with patch("custom_components.smart_irrigation.flow_calibration.ir") as ir:
        _mixin()._review_zone_capacity(ZONE, 4.0, 6.0, 1)

    ir.async_create_issue.assert_called_once()
    assert ir.async_create_issue.call_args[0][2] == "undersized_zone_3"
    placeholders = ir.async_create_issue.call_args.kwargs["translation_placeholders"]
    assert placeholders["capacity"] == "1.0"
    assert placeholders["need"] == "4.0"


def test_days_between_waterings_raise_the_need():
    # 12 mm/h for ten minutes is 2 mm: enough for a day at 2 mm, not for three.
    with patch("custom_components.smart_irrigation.flow_calibration.ir") as ir:
        _mixin()._review_zone_capacity(ZONE, 2.0, 12.0, 1)
        ir.async_create_issue.assert_not_called()
        _mixin()._review_zone_capacity(ZONE, 2.0, 12.0, 3)
        ir.async_create_issue.assert_called_once()


def test_a_zone_that_keeps_up_clears_the_advisory():
    with patch("custom_components.smart_irrigation.flow_calibration.ir") as ir:
        _mixin()._review_zone_capacity(ZONE, 1.0, 60.0, 1)

    ir.async_delete_issue.assert_called_once()
    ir.async_create_issue.assert_not_called()


def test_a_little_under_the_need_is_within_what_a_forecast_can_swing():
    # 4.2 mm of capacity against a 5 mm need is 84%.
    with patch("custom_components.smart_irrigation.flow_calibration.ir") as ir:
        _mixin()._review_zone_capacity(ZONE, 5.0, 25.2, 1)

    ir.async_create_issue.assert_not_called()


def test_without_a_cap_or_a_rate_nothing_can_be_said():
    with patch("custom_components.smart_irrigation.flow_calibration.ir") as ir:
        _mixin()._review_zone_capacity({const.ZONE_ID: 1}, 4.0, 6.0, 1)
        _mixin()._review_zone_capacity(ZONE, 4.0, None, 1)
        _mixin()._review_zone_capacity(ZONE, 0.0, 6.0, 1)

    ir.async_create_issue.assert_not_called()
    ir.async_delete_issue.assert_not_called()


def test_a_zone_that_goes_away_takes_its_advisories_with_it():
    with patch("custom_components.smart_irrigation.flow_calibration.ir") as ir:
        _mixin().async_clear_throughput_issue(3)

    ids = [call.args[2] for call in ir.async_delete_issue.call_args_list]
    assert ids == ["throughput_mismatch_3", "undersized_zone_3"]
