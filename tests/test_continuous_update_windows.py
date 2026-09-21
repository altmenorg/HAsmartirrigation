"""A continuous update reads each zone's own window, as a calculation does.

It aggregated the group's buffer once, calculated every zone without advancing
its mark, then emptied the buffer only when every zone of the group had been
calculated. A manual or disabled zone sharing the group kept it from ever
being emptied, so each sensor change counted the whole buffer again for the
others: the same rain credited at every update.
"""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const

GROUP = 5
MARK = datetime(2026, 9, 21, 12, 0)


def _coordinator(zones):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator._debounced_update_cancel = {}
    coordinator.store = MagicMock()
    coordinator.store.get_mapping = MagicMock(
        return_value={const.MAPPING_ID: GROUP, const.MAPPING_DATA: [{"x": 1}]}
    )
    coordinator.store.get_zone = MagicMock(
        side_effect=lambda zid: next(z for z in zones if z[const.ZONE_ID] == zid)
    )
    coordinator.store.get_module = MagicMock(return_value={const.MODULE_NAME: "Static"})
    coordinator.store.async_update_mapping = AsyncMock()
    coordinator.check_mapping_sources = MagicMock(return_value=(False, True, False))
    coordinator._get_zones_that_use_this_mapping = AsyncMock(
        return_value=[z[const.ZONE_ID] for z in zones]
    )
    coordinator.module_id_for_zone = MagicMock(return_value=1)
    coordinator.apply_aggregates_to_mapping_data = AsyncMock(
        return_value={const.MAPPING_DATA_MULTIPLIER: 0.01}
    )
    coordinator.async_calculate_zone = AsyncMock()
    coordinator.prune_consumed_readings = AsyncMock()
    return coordinator


ZONES = [
    {
        const.ZONE_ID: 1,
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_LAST_CONSUMED_AT: MARK.isoformat(),
    },
    # A manual zone on the same group: it used to keep the buffer from ever
    # being emptied, and then everything was counted again at each update.
    {const.ZONE_ID: 2, const.ZONE_STATE: const.ZONE_STATE_MANUAL},
]


@pytest.mark.asyncio
async def test_each_zone_reads_from_its_own_mark_and_advances_it():
    coordinator = _coordinator(ZONES)

    await coordinator.async_continuous_update_for_mapping(GROUP)

    coordinator.apply_aggregates_to_mapping_data.assert_awaited_once()
    assert (
        coordinator.apply_aggregates_to_mapping_data.await_args.kwargs["since"] == MARK
    )
    coordinator.async_calculate_zone.assert_awaited_once()
    call = coordinator.async_calculate_zone.await_args
    assert call.args[0] == 1
    assert call.kwargs["delete_weather_data"] is True


@pytest.mark.asyncio
async def test_the_buffer_is_pruned_not_emptied():
    coordinator = _coordinator(ZONES)

    await coordinator.async_continuous_update_for_mapping(GROUP)

    coordinator.prune_consumed_readings.assert_awaited_once_with(GROUP)
    for call in coordinator.store.async_update_mapping.await_args_list:
        assert (
            call.kwargs.get("changes", call.args[1] if len(call.args) > 1 else {}).get(
                const.MAPPING_DATA
            )
            != []
        )


@pytest.mark.asyncio
async def test_a_zone_with_nothing_new_is_not_calculated():
    coordinator = _coordinator(ZONES)
    coordinator.apply_aggregates_to_mapping_data = AsyncMock(return_value=None)

    await coordinator.async_continuous_update_for_mapping(GROUP)

    coordinator.async_calculate_zone.assert_not_awaited()
