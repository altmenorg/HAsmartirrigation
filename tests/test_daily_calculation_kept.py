"""'Just before each start' keeps the daily calculation too.

Alone, the calculation before a start left the buffer waiting for the next
start: a weekly schedule, or a program only ever started by hand, outlasts the
week the buffer keeps, and the zones' water balance stood still between two
starts. The daily calculation now runs as well, at the calculation time, and
the one before a start is skipped when it ran within the hour.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.delivery import (
    GAP_AUTO_CALC_OFF,
    daily_calculation_on,
    delivery_gap,
)


@pytest.mark.parametrize(
    ("auto_calc", "before_start", "expected"),
    [
        (True, False, True),  # at a fixed time
        (False, True, True),  # just before each start: the daily one stays
        (True, True, True),
        (False, False, False),  # only when I ask
    ],
)
def test_the_daily_calculation_follows_the_choice(auto_calc, before_start, expected):
    config = {
        const.CONF_AUTO_CALC_ENABLED: auto_calc,
        const.CONF_RECALCULATE_BEFORE_START: before_start,
    }

    assert daily_calculation_on(config) is expected


def test_only_when_i_ask_is_still_reported():
    config = {
        const.CONF_AUTO_CALC_ENABLED: False,
        const.CONF_RECALCULATE_BEFORE_START: False,
    }

    assert (
        delivery_gap(config, [{const.ZONE_ID: 1, const.ZONE_STATE: "automatic"}])
        == GAP_AUTO_CALC_OFF
    )


def _coordinator(config):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.get_config = MagicMock(return_value=config)
    coordinator.store.async_update_config = AsyncMock()
    coordinator._track_auto_calc_time_unsub = None
    coordinator._WeatherServiceClient = None
    return coordinator


@pytest.mark.parametrize(
    ("auto_calc", "before_start", "armed"),
    [(False, True, True), (True, False, True), (False, False, False)],
)
async def test_the_timer_is_armed_with_just_before_each_start(
    auto_calc, before_start, armed
):
    config = {
        const.CONF_AUTO_CALC_ENABLED: auto_calc,
        const.CONF_RECALCULATE_BEFORE_START: before_start,
        const.CONF_CALC_TIME: "23:00",
    }
    coordinator = _coordinator(config)

    with patch(
        "custom_components.smart_irrigation.async_track_time_change"
    ) as track_time_change:
        await coordinator.set_up_auto_calc_time(config, save=False)

    assert track_time_change.called is armed
    if armed:
        assert track_time_change.call_args.kwargs["hour"] == "23"
