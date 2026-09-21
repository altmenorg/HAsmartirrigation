"""The live estimate is a projection, not a calculation that happens to run.

The property that matters is that nothing is written. If an estimate persisted
its aggregation, the real calculation would afterwards see an empty window and
lose a day of readings, and a display refresh would silently change how much
water a zone gets.
"""

from unittest.mock import AsyncMock, Mock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.live_estimate import LiveEstimateMixin


class _Coordinator(LiveEstimateMixin, CalculationMixin):
    """Both mixins, as the coordinator has: the estimate reads a zone's window,
    and the window helper lives on the calculation side."""

    def __init__(self, store):
        self.store = store
        self.apply_aggregates_to_mapping_data = AsyncMock(
            return_value={"evapotranspiration": 3.0}
        )
        self.calculate_module = AsyncMock(
            return_value={
                const.ZONE_BUCKET: -4.5,
                const.ZONE_DELTA: -1.5,
                const.ZONE_DURATION: 900,
            }
        )


def _zone(**overrides):
    zone = {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_MAPPING: 7,
        const.ZONE_LAST_CALCULATED: None,
    }
    zone.update(overrides)
    return zone


def _store(mapping_data=None, zones=None):
    store = Mock()
    store.get_mapping = Mock(
        return_value=(
            {const.MAPPING_ID: 7, const.MAPPING_DATA: mapping_data}
            if mapping_data is not None
            else None
        )
    )
    store.async_get_zones = AsyncMock(return_value=zones or [])
    store.async_update_zone = AsyncMock()
    store.async_update_mapping = AsyncMock()
    store.async_update_config = AsyncMock()
    return store


async def test_it_reports_where_the_zone_stands_now():
    coord = _Coordinator(_store(mapping_data=[{"evapotranspiration": 3.0}]))

    estimate = await coord.async_estimate_zone_now(_zone())

    assert estimate["bucket"] == -4.5
    assert estimate["delta"] == -1.5
    assert estimate["duration"] == 900
    assert estimate["as_of"]


async def test_it_writes_absolutely_nothing():
    """The guarantee. A display refresh must not move any stored value."""
    store = _store(mapping_data=[{"evapotranspiration": 3.0}])
    coord = _Coordinator(store)

    await coord.async_estimate_zone_now(_zone())

    store.async_update_zone.assert_not_awaited()
    store.async_update_mapping.assert_not_awaited()
    store.async_update_config.assert_not_awaited()


async def test_the_aggregation_is_not_recorded_as_a_calculation():
    """persist=True here would make the next real calculation see no readings."""
    coord = _Coordinator(_store(mapping_data=[{"evapotranspiration": 3.0}]))

    await coord.async_estimate_zone_now(_zone())

    assert coord.apply_aggregates_to_mapping_data.await_args.kwargs["persist"] is False


async def test_no_forecast_is_fetched():
    """A weather-service call on every panel refresh is not acceptable."""
    coord = _Coordinator(_store(mapping_data=[{"evapotranspiration": 3.0}]))

    await coord.async_estimate_zone_now(_zone())

    assert coord.calculate_module.await_args.args[2] is None


@pytest.mark.parametrize(
    ("zone", "mapping_data"),
    [
        (_zone(**{const.ZONE_MAPPING: None}), [{"x": 1}]),
        (_zone(), None),
        (_zone(), []),
    ],
    ids=["no-sensor-group", "group-missing", "no-readings-yet"],
)
async def test_nothing_to_go_on_gives_no_estimate(zone, mapping_data):
    coord = _Coordinator(_store(mapping_data=mapping_data))

    assert await coord.async_estimate_zone_now(zone) is None


async def test_a_failing_module_gives_no_estimate_rather_than_an_error():
    coord = _Coordinator(_store(mapping_data=[{"evapotranspiration": 3.0}]))
    coord.calculate_module = AsyncMock(side_effect=ValueError("module exploded"))

    assert await coord.async_estimate_zone_now(_zone()) is None


async def test_disabled_zones_are_left_out():
    zones = [
        _zone(**{const.ZONE_ID: 1}),
        _zone(**{const.ZONE_ID: 2, const.ZONE_STATE: const.ZONE_STATE_DISABLED}),
    ]
    coord = _Coordinator(_store(mapping_data=[{"e": 1.0}], zones=zones))

    estimates = await coord.async_estimate_all_zones_now()

    assert set(estimates) == {"1"}


async def test_an_estimate_leaves_a_pending_calculation_record_alone():
    """The record a real calculation is about to write must not become the
    estimate's, which the calculation log would then record as the run."""
    from unittest.mock import AsyncMock, MagicMock

    from custom_components.smart_irrigation import SmartIrrigationCoordinator

    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.store = MagicMock()
    coordinator.store.get_mapping = MagicMock(
        return_value={const.MAPPING_DATA: [{"x": 1}]}
    )
    coordinator.apply_aggregates_to_mapping_data = AsyncMock(
        return_value={const.MAPPING_DATA_MULTIPLIER: 1.0}
    )

    async def estimate_calc(zone, weatherdata, forecast):
        coordinator._pending_calc_record = {"estimate": True}
        return {const.ZONE_BUCKET: -1.0}

    coordinator.calculate_module = estimate_calc
    coordinator._pending_calc_record = {"real": True}

    await coordinator.async_estimate_zone_now({const.ZONE_MAPPING: 1})

    assert coordinator._pending_calc_record == {"real": True}
