"""The evening calculation off, the zones calculated again just before the start.

That is a way of working, not a fault: the calculation that counts is the one the
start runs. The Info page must not say "nothing is calculated", and the run it
announces must be the one the start will make, from the live estimate, not from
the durations the last calculation left behind.
"""

from unittest.mock import AsyncMock, MagicMock

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.delivery import (
    GAP_AUTO_CALC_OFF,
    delivery_gap,
)
from custom_components.smart_irrigation.skip_conditions import SkipConditionsMixin

ZONES = [
    {
        const.ZONE_ID: 0,
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_DURATION: 0,
    },
    {
        const.ZONE_ID: 1,
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_DURATION: 300,
    },
]


def test_no_evening_calculation_alone_is_still_reported():
    config = {const.CONF_AUTO_CALC_ENABLED: False}

    assert delivery_gap(config, ZONES) == GAP_AUTO_CALC_OFF


def test_no_evening_calculation_is_not_a_gap_when_the_start_calculates():
    config = {
        const.CONF_AUTO_CALC_ENABLED: False,
        const.CONF_RECALCULATE_BEFORE_START: True,
        const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True,
    }

    assert delivery_gap(config, ZONES) is None


class _Coordinator(SkipConditionsMixin):
    pass


def _coordinator():
    coordinator = _Coordinator()
    coordinator.store = MagicMock()
    coordinator.store.async_get_zones = AsyncMock(return_value=ZONES)
    coordinator.store.async_get_config = AsyncMock(return_value={})
    return coordinator


async def test_the_run_is_worked_out_from_the_stored_durations_by_default():
    assert await _coordinator().get_total_duration_all_enabled_zones() == 300


async def test_the_run_can_be_worked_out_from_other_durations():
    """The zone the estimate names takes the estimate's duration, the others
    keep what is stored."""
    total = await _coordinator().get_total_duration_all_enabled_zones({0: 600})

    assert total == 600 + 300


# The start is placed for the length of the run. Calculated again just before it,
# that length is the live estimate: the durations left by the last calculation are
# none after a watering, and a start that waits for a duration to be placed never
# comes to calculate it.
from custom_components.smart_irrigation.triggers import TriggersMixin  # noqa: E402


class _Armed(TriggersMixin, SkipConditionsMixin):
    pass


def _armed(config, estimates):
    coordinator = _Armed()
    zones = [
        {
            const.ZONE_ID: 0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            const.ZONE_DURATION: 0,
        }
    ]
    coordinator.store = MagicMock()
    coordinator.store.async_get_zones = AsyncMock(return_value=zones)
    coordinator.store.async_get_config = AsyncMock(return_value=config)
    coordinator.async_estimate_all_zones_now = AsyncMock(return_value=estimates)
    return coordinator


async def test_the_start_is_placed_for_the_estimate_when_it_calculates_first():
    coordinator = _armed(
        {const.CONF_RECALCULATE_BEFORE_START: True}, {"0": {"duration": 840}}
    )

    assert await coordinator._planned_run_seconds() == 840


async def test_the_start_is_placed_for_the_stored_durations_otherwise():
    coordinator = _armed({}, {"0": {"duration": 840}})

    assert await coordinator._planned_run_seconds() == 0


async def test_an_estimate_that_fails_leaves_the_stored_durations():
    coordinator = _armed({const.CONF_RECALCULATE_BEFORE_START: True}, {})
    coordinator.async_estimate_all_zones_now = AsyncMock(side_effect=RuntimeError)

    assert await coordinator._planned_run_seconds() == 0
