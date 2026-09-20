"""Calculating a zone that has never consumed weather data.

The panel's "calculate" button and the service both route through
``async_update_zone_config``, which reads the zone's watermark to know where its
unread window starts. It parsed the stored value itself instead of going through
``zone_window_start``, the accessor written for exactly this: a zone that has
never calculated has no watermark, which logged a warning on every first
calculation, and a value that cannot be read raised outright. Either way the
answer is to take everything, which is what emptying the buffer used to leave
behind.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator(zone):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.get_zone = MagicMock(return_value=zone)
    coordinator.store.get_mapping = MagicMock(
        return_value={const.MAPPING_ID: 1, const.MAPPING_DATA: [{"x": 1}]}
    )
    coordinator.apply_aggregates_to_mapping_data = AsyncMock(
        return_value={"Temperature": 20.0}
    )
    coordinator.getModuleInstanceByID = AsyncMock(return_value=None)
    coordinator.module_id_for_zone = MagicMock(return_value=1)
    coordinator.async_calculate_zone = AsyncMock(return_value={})
    coordinator.register_start_event = AsyncMock()
    coordinator.async_setup_observed_watering = AsyncMock()
    return coordinator


def _zone(watermark):
    return {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
        const.ZONE_MAPPING: 1,
        const.ZONE_LAST_CONSUMED_AT: watermark,
    }


async def _calculate(coordinator):
    with patch("custom_components.smart_irrigation.async_dispatcher_send"):
        await coordinator.async_update_zone_config(1, {const.ATTR_CALCULATE: True})


@pytest.mark.asyncio
async def test_a_zone_with_no_watermark_takes_everything():
    coordinator = _coordinator(_zone(None))

    await _calculate(coordinator)

    assert (
        coordinator.apply_aggregates_to_mapping_data.await_args.kwargs["since"] is None
    )


@pytest.mark.asyncio
async def test_a_zone_with_a_watermark_reads_from_it():
    coordinator = _coordinator(_zone("2026-09-20T08:00:00"))

    await _calculate(coordinator)

    since = coordinator.apply_aggregates_to_mapping_data.await_args.kwargs["since"]
    assert since is not None
    assert since.hour == 8


@pytest.mark.asyncio
async def test_an_unreadable_watermark_does_not_take_the_calculation_down():
    coordinator = _coordinator(_zone("not a timestamp"))

    await _calculate(coordinator)

    assert (
        coordinator.apply_aggregates_to_mapping_data.await_args.kwargs["since"] is None
    )
