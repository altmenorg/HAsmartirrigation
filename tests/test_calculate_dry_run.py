"""Tests for the dry-run mode of the calculate services.

A dry run must leave every piece of persisted state alone. The critical one is
``MAPPING_DATA_LAST_CALCULATION``: advancing it shrinks the next real
calculation's ``hour_multiplier`` and re-baselines the ``delta`` aggregates,
which double-counts precipitation.
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, Mock, patch

from custom_components.smart_irrigation import (
    SmartIrrigationCoordinator,
    calculation,
    const,
)
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.service_handlers import _summarize_calculations


class _Aggregator(CalculationMixin):
    """Minimal host exposing just the aggregation helpers under test."""

    def __init__(self):
        self.store = Mock()
        self.store.async_update_mapping = AsyncMock()


def _mapping(last_calculation=None):
    """Build a mapping with two temperature samples an hour apart."""
    now = datetime.now()
    earlier = now - timedelta(hours=1)
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_MAPPINGS: {},
        const.MAPPING_DATA: [
            {
                const.MAPPING_TEMPERATURE: 10.0,
                const.RETRIEVED_AT: earlier.isoformat(),
            },
            {
                const.MAPPING_TEMPERATURE: 20.0,
                const.RETRIEVED_AT: now.isoformat(),
            },
        ],
        const.MAPPING_DATA_LAST_CALCULATION: last_calculation,
    }


async def test_dry_run_does_not_persist_last_calculation():
    """A dry run must not write the last-calculation marker."""
    agg = _Aggregator()
    mapping = _mapping()

    result = await agg.apply_aggregates_to_mapping_data(mapping, persist=False)

    assert result is not None
    agg.store.async_update_mapping.assert_not_called()


async def test_real_run_persists_last_calculation():
    """A normal run still writes the last-calculation marker."""
    agg = _Aggregator()
    mapping = _mapping()

    await agg.apply_aggregates_to_mapping_data(mapping, persist=True)

    agg.store.async_update_mapping.assert_called_once()
    _, changes = agg.store.async_update_mapping.call_args[0]
    assert const.MAPPING_DATA_LAST_CALCULATION in changes


async def test_dry_run_leaves_stored_last_calculation_untouched():
    """The dry run must not mutate the mapping dict it was handed either."""
    previous_run = datetime.now() - timedelta(hours=9)
    stored = {const.MAPPING_TIMESTAMP: previous_run}
    mapping = _mapping(last_calculation=stored)
    agg = _Aggregator()

    await agg.apply_aggregates_to_mapping_data(mapping, persist=False)

    # Same object, same content: no in-place timestamp bump, no new sensor keys.
    assert mapping[const.MAPPING_DATA_LAST_CALCULATION] is stored
    assert stored == {const.MAPPING_TIMESTAMP: previous_run}


async def test_dry_run_still_aggregates_min_and_max_temperature():
    """Skipping the write must not skip the aggregation itself."""
    agg = _Aggregator()

    result = await agg.apply_aggregates_to_mapping_data(_mapping(), persist=False)

    assert result[const.MAPPING_MAX_TEMP] == 20.0
    assert result[const.MAPPING_MIN_TEMP] == 10.0
    assert const.MAPPING_DATA_MULTIPLIER in result


def _zone_calculator():
    """Host for async_calculate_zone with the module maths stubbed out."""
    calc = _Aggregator()
    calc.hass = Mock()
    calc.store.get_zone = Mock(return_value={const.ZONE_ID: 1, const.ZONE_MAPPING: 1})
    calc.store.async_update_zone = AsyncMock()
    calc.calculate_module = AsyncMock(
        return_value={const.ZONE_BUCKET: -7.5, const.ZONE_DURATION: 900}
    )
    calc.seasonal_adjustment_manager = Mock()
    calc.seasonal_adjustment_manager.apply_seasonal_adjustments = AsyncMock(
        side_effect=lambda data, _zone_id: data
    )
    return calc


async def test_dry_run_zone_writes_nothing():
    """A dry run must not touch the bucket, the zone or the collected data."""
    calc = _zone_calculator()

    with patch.object(calculation, "async_dispatcher_send"):
        result = await calc.async_calculate_zone(
            1, {}, None, delete_weather_data=True, dry_run=True
        )

    calc.store.async_update_zone.assert_not_called()
    calc.store.async_update_mapping.assert_not_called()
    # The caller still gets the numbers back, since nothing was stored to read.
    assert result[const.ZONE_BUCKET] == -7.5


async def test_real_run_zone_writes_and_consumes_its_window():
    """A normal run commits the zone and records how far it has read.

    It no longer empties the sensor group: the buffer is shared, so a real run
    marks its own watermark and the group is pruned to the slowest reader.
    """
    calc = _zone_calculator()
    calc.prune_consumed_readings = AsyncMock()

    with patch.object(calculation, "async_dispatcher_send"):
        await calc.async_calculate_zone(
            1, {}, None, delete_weather_data=True, dry_run=False
        )

    calc.store.async_update_zone.assert_called_once()
    written = calc.store.async_update_zone.call_args[0][1]
    assert written[const.ZONE_LAST_CONSUMED_AT] is not None
    calc.prune_consumed_readings.assert_awaited_once()


def test_summarize_calculations_is_json_serializable():
    """The service response carries the numbers a dry run would otherwise hide."""
    summary = _summarize_calculations(
        {
            1: {
                const.ZONE_DELTA: -2.5,
                const.ZONE_BUCKET: -7.5,
                const.ZONE_DURATION: 900,
                const.ZONE_LAST_CALCULATED: datetime.now(),
            }
        }
    )

    # The documented keys are always present, null when the module produced
    # nothing, so a template can index the response without guarding. Keys that
    # are not part of the documented response (last_calculated) stay out of it.
    assert summary == [
        {
            const.ZONE_ID: 1,
            const.ZONE_DELTA: -2.5,
            const.ZONE_BUCKET: -7.5,
            const.ZONE_DURATION: 900.0,
            const.ZONE_CURRENT_DRAINAGE: None,
            const.ZONE_ET_DEFICIENCY: None,
        }
    ]


def test_summarize_calculations_skips_empty_results():
    """Zones that produced nothing are left out rather than reported as zero."""
    assert _summarize_calculations({1: None, 2: {}}) == []


def _coordinator():
    """A coordinator with only what ``async_update_zone_config`` touches.

    Built with ``object.__new__`` so the real method body runs without needing a
    full Home Assistant setup.
    """
    coord = object.__new__(SmartIrrigationCoordinator)
    coord.hass = Mock()
    coord.use_weather_service = False
    coord.store = Mock()
    coord.store.get_zone = Mock(
        return_value={
            const.ZONE_ID: 1,
            const.ZONE_MAPPING: 1,
            const.ZONE_NAME: "zone",
            const.ZONE_MODULE: 1,
        }
    )
    coord.store.get_mapping = Mock(return_value={const.MAPPING_DATA: [{}]})
    coord.apply_aggregates_to_mapping_data = AsyncMock(return_value={})
    coord.getModuleInstanceByID = AsyncMock(return_value=None)
    coord.async_calculate_zone = AsyncMock(
        return_value={const.ZONE_BUCKET: -7.5, const.ZONE_DURATION: 900}
    )
    coord._async_calculate_all = AsyncMock(return_value={})
    coord.register_start_event = AsyncMock()
    coord.async_setup_observed_watering = AsyncMock()
    return coord


async def test_real_zone_calculation_still_registers_the_start_event():
    """A normal calculate must not skip the post-calculation bookkeeping.

    Regression test: returning the calculation result directly from the
    ``ATTR_CALCULATE`` branch skipped ``register_start_event`` for every real
    calculation, so a freshly calculated duration never reached the schedule.
    """
    coord = _coordinator()

    result = await coord.async_update_zone_config(
        zone_id=1, data={const.ATTR_CALCULATE: const.ATTR_CALCULATE}
    )

    coord.register_start_event.assert_awaited_once()
    coord.async_setup_observed_watering.assert_awaited_once()
    # The caller still gets the numbers back.
    assert result[const.ZONE_BUCKET] == -7.5


async def test_dry_run_zone_calculation_skips_the_start_event():
    """A dry run wrote nothing, so there is nothing to re-register."""
    coord = _coordinator()

    result = await coord.async_update_zone_config(
        zone_id=1,
        data={const.ATTR_CALCULATE: const.ATTR_CALCULATE, const.ATTR_DRY_RUN: True},
    )

    coord.register_start_event.assert_not_awaited()
    coord.async_setup_observed_watering.assert_not_awaited()
    assert result[const.ZONE_BUCKET] == -7.5
    # dry_run must reach async_calculate_zone, which is the single place that
    # enforces a dry run does not consume the collected data (covered by
    # test_dry_run_zone_writes_nothing).
    # By name. This used to check the fifth positional argument, which was
    # dry_run until `prune` was inserted before it: the test kept passing while
    # the dry run landed in `prune` and one zone's "simulation" wrote its
    # result for real (found on a real install).
    call = coord.async_calculate_zone.call_args
    assert call.kwargs.get("dry_run") is True, "dry_run must reach async_calculate_zone"


async def test_calculate_all_honours_dry_run():
    """``calculate_all`` must forward dry_run instead of doing a real run.

    Regression test: this branch hardcoded ``delete_weather_data=True`` and
    dropped ``dry_run``, so a caller asking for a preview got a committed
    calculation plus a wipe of all collected sensor data.
    """
    coord = _coordinator()

    await coord.async_update_zone_config(
        data={const.ATTR_CALCULATE_ALL: True, const.ATTR_DRY_RUN: True}
    )

    _, kwargs = coord._async_calculate_all.call_args
    assert kwargs["dry_run"] is True
    coord.register_start_event.assert_not_awaited()


async def test_calculate_all_without_dry_run_is_unchanged():
    """The normal calculate_all path still commits and clears."""
    coord = _coordinator()

    await coord.async_update_zone_config(data={const.ATTR_CALCULATE_ALL: True})

    _, kwargs = coord._async_calculate_all.call_args
    assert kwargs["dry_run"] is False
    assert kwargs["delete_weather_data"] is True
    coord.register_start_event.assert_awaited_once()


def _all_zones_calculator():
    """Host for _async_calculate_all with one automatic zone on one mapping."""
    calc = _Aggregator()
    calc.hass = Mock()
    calc.use_weather_service = False
    calc.store.async_get_zones = AsyncMock(
        return_value=[
            {
                const.ZONE_ID: 1,
                const.ZONE_NAME: "zone",
                const.ZONE_MAPPING: 1,
                const.ZONE_MODULE: 1,
                const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            }
        ]
    )
    calc.store.async_get_config = AsyncMock(return_value={})
    calc.store.get_mapping = Mock(return_value={const.MAPPING_DATA: [{}]})
    calc._get_unique_mappings_for_automatic_zones = AsyncMock(return_value=[1])
    calc.apply_aggregates_to_mapping_data = AsyncMock(return_value={"aggregated": 1})
    calc.getModuleInstanceByID = AsyncMock(return_value=None)
    calc.async_calculate_zone = AsyncMock(
        return_value={const.ZONE_BUCKET: -7.5, const.ZONE_DURATION: 900}
    )
    calc.register_start_event = AsyncMock()
    return calc


async def test_calculate_all_dry_run_does_not_clear_the_weather_data():
    """The bulk clear is the one place the dry-run rule is enforced here."""
    calc = _all_zones_calculator()

    results = await calc._async_calculate_all(delete_weather_data=True, dry_run=True)

    calc.store.async_update_mapping.assert_not_called()
    calc.register_start_event.assert_not_awaited()
    assert results[1][const.ZONE_BUCKET] == -7.5


async def test_calculate_all_real_run_prunes_and_registers_the_start_event():
    """A normal run prunes what every zone has read, and re-registers the event.

    Pruning replaced the wipe this used to assert: a group can be shared with a
    zone that did not calculate in this pass, and its history is still owed.
    """
    calc = _all_zones_calculator()
    calc.prune_consumed_readings = AsyncMock()

    await calc._async_calculate_all(delete_weather_data=True, dry_run=False)

    calc.prune_consumed_readings.assert_awaited()
    calc.register_start_event.assert_awaited_once()


async def test_calculate_all_respects_delete_weather_data_false():
    """An explicit delete_weather_data=False is still honoured on a real run."""
    calc = _all_zones_calculator()

    await calc._async_calculate_all(delete_weather_data=False, dry_run=False)

    calc.store.async_update_mapping.assert_not_called()
    calc.register_start_event.assert_awaited_once()
