"""What a calculation writes back (audit 0.5 and 0.8).

- 0.5: the calculation awaits network fetches, and a watering credited to the
  bucket meanwhile was overwritten by its result, an absolute bucket. The zone
  then watered the same deficit again.
- 0.8: the watermark was set to "now" after those awaits, so a reading
  recorded during the calculation was neither in the window nor after the
  mark, and its increment was lost.
"""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator(buckets, results):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    zones = iter(
        [
            {const.ZONE_ID: 1, const.ZONE_BUCKET: b, const.ZONE_MAPPING: 0}
            for b in buckets
        ]
    )
    last = {}

    def get_zone(_zone_id):
        last["zone"] = next(zones, last.get("zone"))
        return dict(last["zone"])

    coordinator.store = MagicMock()
    coordinator.store.get_zone = MagicMock(side_effect=get_zone)
    coordinator.store.async_update_zone = AsyncMock()
    coordinator.calculate_module = AsyncMock(side_effect=[dict(r) for r in results])
    coordinator.seasonal_adjustment_manager = MagicMock()
    coordinator.seasonal_adjustment_manager.apply_seasonal_adjustments = AsyncMock(
        side_effect=lambda data, _zone_id: data
    )
    coordinator._async_write_calc_record = AsyncMock()
    coordinator.prune_consumed_readings = AsyncMock()
    return coordinator


async def _calculate(coordinator, weatherdata=None):
    with patch("custom_components.smart_irrigation.calculation.async_dispatcher_send"):
        return await coordinator.async_calculate_zone(
            1, weatherdata or {}, delete_weather_data=True
        )


@pytest.mark.asyncio
async def test_a_watering_credited_during_the_calculation_is_kept():
    # Read at -10, a valve credits +8 during the fetches: -2 by the end.
    coordinator = _coordinator(
        buckets=[-10.0, -2.0, -2.0],
        results=[{const.ZONE_BUCKET: -13.0}, {const.ZONE_BUCKET: -5.0}],
    )

    await _calculate(coordinator)

    assert coordinator.calculate_module.await_count == 2
    second_zone = coordinator.calculate_module.await_args_list[1].args[0]
    assert second_zone[const.ZONE_BUCKET] == -2.0
    written = coordinator.store.async_update_zone.await_args.args[1]
    assert written[const.ZONE_BUCKET] == -5.0


@pytest.mark.asyncio
async def test_an_unchanged_bucket_calculates_once():
    coordinator = _coordinator(
        buckets=[-10.0, -10.0], results=[{const.ZONE_BUCKET: -13.0}]
    )

    await _calculate(coordinator)

    assert coordinator.calculate_module.await_count == 1


@pytest.mark.asyncio
async def test_the_watermark_is_where_the_window_ended():
    coordinator = _coordinator(
        buckets=[-10.0, -10.0], results=[{const.ZONE_BUCKET: -13.0}]
    )
    window_end = datetime(2026, 9, 30, 23, 0, 0)

    await _calculate(coordinator, {const.MAPPING_DATA_WINDOW_END: window_end})

    written = coordinator.store.async_update_zone.await_args.args[1]
    assert written[const.ZONE_LAST_CONSUMED_AT] == window_end


@pytest.mark.asyncio
async def test_the_aggregate_says_where_its_window_ends():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    before = datetime.now()
    mapping = {
        const.MAPPING_ID: 0,
        const.MAPPING_MAPPINGS: {},
        const.MAPPING_DATA: [
            {const.MAPPING_TEMPERATURE: 20.0, const.RETRIEVED_AT: before.isoformat()}
        ],
    }
    coordinator.store = MagicMock()
    coordinator.store.get_config = MagicMock(return_value={})

    result = await coordinator.apply_aggregates_to_mapping_data(mapping, persist=False)

    assert before <= result[const.MAPPING_DATA_WINDOW_END] <= datetime.now()
