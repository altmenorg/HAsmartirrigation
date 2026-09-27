"""Rain between the calculation and the start of irrigation shortens the run (#810).

The duration is worked out at the calculation time, hours before irrigation
starts. Rain in between was ignored entirely: a bucket of -12 mm followed by
8 mm of rain overnight still watered the full 12 mm.

The bucket is deliberately not credited here. It is a running balance, so the
next calculation adds the whole interval's rain anyway; crediting it at the
start as well would count the same rain twice.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _zone(duration=7200, bucket=-12.0, state=None):
    return {
        const.ZONE_ID: 0,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: state or const.ZONE_STATE_AUTOMATIC,
        const.ZONE_MAPPING: 0,
        const.ZONE_BUCKET: bucket,
        const.ZONE_DURATION: duration,
        const.ZONE_SIZE: 100.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_LEAD_TIME: 0.0,
        const.ZONE_MAXIMUM_DURATION: -1,
    }


def _coordinator(zone, rain_mm):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    coordinator.store = MagicMock()
    coordinator.store.async_get_zones = AsyncMock(return_value=[zone])
    coordinator.store.async_update_zone = AsyncMock()
    coordinator.precipitation_since_last_calculation = AsyncMock(return_value=rain_mm)
    return coordinator


async def _run(coordinator):
    with patch("custom_components.smart_irrigation.triggers.async_dispatcher_send"):
        await coordinator._apply_rain_since_calculation()


@pytest.mark.asyncio
async def test_rain_shortens_the_run():
    """8 mm of rain on a 12 mm deficit leaves 4 mm to give."""
    zone = _zone()
    coordinator = _coordinator(zone, 8.0)
    # 100 m2 at 10 l/min is 6 mm/h, so 4 mm takes 2400 s.
    await _run(coordinator)

    coordinator.store.async_update_zone.assert_awaited_once()
    _args, _kwargs = coordinator.store.async_update_zone.await_args
    assert _args[1][const.ZONE_DURATION] == 2400


@pytest.mark.asyncio
async def test_enough_rain_cancels_the_run():
    zone = _zone()
    coordinator = _coordinator(zone, 15.0)

    await _run(coordinator)

    _args, _kwargs = coordinator.store.async_update_zone.await_args
    assert _args[1][const.ZONE_DURATION] == 0


@pytest.mark.asyncio
async def test_the_bucket_is_left_alone():
    """Crediting it here would double count against the next calculation."""
    zone = _zone()
    coordinator = _coordinator(zone, 8.0)

    await _run(coordinator)

    _args, _kwargs = coordinator.store.async_update_zone.await_args
    assert const.ZONE_BUCKET not in _args[1]


@pytest.mark.asyncio
async def test_a_dry_night_changes_nothing():
    """No rain means the calculated duration is not second-guessed."""
    coordinator = _coordinator(_zone(), 0.0)

    await _run(coordinator)

    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_manual_zone_keeps_its_duration():
    """It carries a duration its owner set, not one derived from the bucket."""
    coordinator = _coordinator(_zone(state=const.ZONE_STATE_MANUAL), 8.0)

    await _run(coordinator)

    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_zone_that_was_not_going_to_water_is_skipped():
    coordinator = _coordinator(_zone(duration=0, bucket=0.0), 8.0)

    await _run(coordinator)

    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_failure_leaves_the_run_alone():
    """Watering the calculated amount is the previous behaviour, so never block."""
    coordinator = _coordinator(_zone(), 8.0)
    coordinator.precipitation_since_last_calculation = AsyncMock(
        side_effect=RuntimeError("boom")
    )

    await _run(coordinator)  # must not raise

    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_run_is_never_lengthened():
    """Rain can only shorten it; anything else means the two formulas drifted."""
    coordinator = _coordinator(_zone(duration=60), 8.0)

    await _run(coordinator)

    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.asyncio
async def test_looking_at_the_window_does_not_consume_it(hass):
    """The next calculation still has to see the same rain.

    The last calculation marks where the next interval starts, so moving it here
    would truncate the window the real calculation works over: it would credit
    the rain to a shorter run and then compute the day's ET over 18 hours of
    samples instead of 24.
    """
    from custom_components.smart_irrigation.calculation import CalculationMixin

    class _Coordinator(CalculationMixin):
        def __init__(self):
            self.hass = hass
            self.store = MagicMock()
            self.store.async_update_mapping = AsyncMock()
            self.store.get_mapping = MagicMock(return_value=self.mapping)

        mapping = {
            const.MAPPING_ID: 0,
            const.MAPPING_MAPPINGS: {const.MAPPING_CURRENT_PRECIPITATION: {}},
            const.MAPPING_DATA: [
                {const.MAPPING_CURRENT_PRECIPITATION: 2.0, const.RETRIEVED_AT: t}
                for t in ("2026-08-30T23:30:00.000000", "2026-08-31T00:30:00.000000")
            ],
            const.MAPPING_DATA_LAST_CALCULATION: {},
        }

    coordinator = _Coordinator()

    await coordinator.precipitation_since_last_calculation(_zone())

    coordinator.store.async_update_mapping.assert_not_awaited()
