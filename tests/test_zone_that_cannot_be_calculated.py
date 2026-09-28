"""One zone that cannot be calculated costs one zone, and no more (#847, #867).

A zone whose evapotranspiration is *provided* -- by a sensor or a service --
needs that value in its sensor group. When the group has none, the engine
returns nothing, and the zone calculation then assigned into that nothing and
raised a TypeError. The exception escaped the whole nightly run, so:

* every zone after that one in the loop went uncalculated;
* the readings nobody needs any more were never pruned, which is why a beta
  tester found 32 of them eleven minutes after the calculation;
* the start trigger was never re-armed, which is a run that does not happen.

One broken zone used to break the night. It now costs that zone.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


def _zone(zone_id, name, mapping=0):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: name,
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_MAPPING: mapping,
        const.ZONE_MODULE: zone_id,
    }


def _calculator(zones, failing=None):
    """A coordinator whose calculation fails for the zones in ``failing``."""
    calc = CalculationMixin()
    calc.hass = MagicMock()
    calc.use_weather_service = False
    calc.store = MagicMock()
    calc.store.async_get_zones = AsyncMock(return_value=zones)
    calc.store.async_get_config = AsyncMock(return_value={})
    calc.store.get_mapping = MagicMock(
        return_value={
            const.MAPPING_ID: 0,
            const.MAPPING_DATA: [{const.MAPPING_TEMPERATURE: 20.0}],
        }
    )
    calc.store.get_zone = MagicMock(
        side_effect=lambda zone_id: next(
            (zone for zone in zones if zone[const.ZONE_ID] == zone_id), None
        )
    )
    calc.store.async_update_mapping = AsyncMock()
    calc._get_unique_mappings_for_automatic_zones = AsyncMock(return_value=[0])
    calc.apply_aggregates_to_mapping_data = AsyncMock(return_value={"aggregated": 1})
    calc.getModuleInstanceByID = AsyncMock(return_value=None)
    calc.prune_consumed_readings = AsyncMock()
    calc.register_start_event = AsyncMock()
    calc.zone_window_start = MagicMock(return_value=None)

    failing = set(failing or ())

    async def _calculate(zone_id, *args, **kwargs):
        if zone_id in failing:
            raise TypeError("'NoneType' object does not support item assignment")
        return {const.ZONE_BUCKET: -5.0, const.ZONE_DURATION: 600}

    calc.async_calculate_zone = AsyncMock(side_effect=_calculate)
    return calc


async def test_the_other_zones_are_still_calculated():
    zones = [_zone(0, "Lawn"), _zone(1, "Test"), _zone(2, "Beds")]
    calc = _calculator(zones, failing={1})

    results = await calc._async_calculate_all(delete_weather_data=True)

    assert set(results) == {0, 2}


async def test_the_readings_are_still_pruned():
    """The symptom that was reported: readings piling up after a calculation."""
    calc = _calculator([_zone(0, "Lawn"), _zone(1, "Test")], failing={1})

    await calc._async_calculate_all(delete_weather_data=True)

    calc.prune_consumed_readings.assert_awaited_with(0)


async def test_the_start_trigger_is_still_armed():
    """A run that is owed has to have something scheduled to start it."""
    calc = _calculator([_zone(0, "Lawn"), _zone(1, "Test")], failing={1})

    await calc._async_calculate_all(delete_weather_data=True)

    calc.register_start_event.assert_awaited()


async def test_a_zone_that_fails_first_does_not_take_the_others():
    """The order of the zones decided how much was lost, which is the worst
    kind of bug: a beta tester lost one zone and another lost every one."""
    zones = [_zone(0, "Broken"), _zone(1, "Lawn")]
    calc = _calculator(zones, failing={0})

    results = await calc._async_calculate_all(delete_weather_data=True)

    assert set(results) == {1}
    calc.register_start_event.assert_awaited()


async def test_every_zone_failing_is_still_a_complete_run():
    calc = _calculator([_zone(0, "A"), _zone(1, "B")], failing={0, 1})

    results = await calc._async_calculate_all(delete_weather_data=True)

    assert results == {}
    calc.prune_consumed_readings.assert_awaited()
    calc.register_start_event.assert_awaited()


# --- and the engine that returns nothing, which is where it started ---------


async def test_an_engine_that_returns_nothing_is_not_an_exception():
    """The Passthrough engine does this when its group has no
    evapotranspiration to pass through."""
    calc = CalculationMixin()
    calc.store = MagicMock()
    calc.store.get_zone = MagicMock(
        return_value={const.ZONE_ID: 1, const.ZONE_NAME: "Test"}
    )
    calc.calculate_module = AsyncMock(return_value=None)
    calc.seasonal_adjustment_manager = MagicMock()
    calc.seasonal_adjustment_manager.apply_seasonal_adjustments = AsyncMock(
        return_value=None
    )

    assert await calc.async_calculate_zone(1, {"Temperature": 12.0}) is None


async def test_and_it_says_which_zone_and_why():
    calc = CalculationMixin()
    calc.store = MagicMock()
    calc.store.get_zone = MagicMock(
        return_value={const.ZONE_ID: 1, const.ZONE_NAME: "Potager"}
    )
    calc.calculate_module = AsyncMock(return_value=None)

    with patch.object(
        __import__(
            "custom_components.smart_irrigation.calculation", fromlist=["_LOGGER"]
        ),
        "_LOGGER",
    ) as logger:
        await calc.async_calculate_zone(1, {})

    warning = " ".join(str(call) for call in logger.warning.call_args_list)
    assert "Potager" in warning
    assert "provided" in warning
