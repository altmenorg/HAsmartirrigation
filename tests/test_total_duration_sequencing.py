"""The run length a start trigger works back from depends on the sequencing (#552).

A trigger that has to finish at sunrise subtracts the length of the whole run
from it. Zones watered one after another take the sum of their durations; zones
watered at once are done when the longest one is. Summing in the parallel case
started the run hours before it needed to, in the middle of the night for
anybody with several large zones.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator(sequencing, *durations, state=None):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.store = MagicMock()
    coordinator.store.async_get_zones = AsyncMock(
        return_value=[
            {
                const.ZONE_ID: i,
                const.ZONE_STATE: state or const.ZONE_STATE_AUTOMATIC,
                const.ZONE_DURATION: duration,
            }
            for i, duration in enumerate(durations)
        ]
    )
    coordinator.store.async_get_config = AsyncMock(
        return_value={const.CONF_ZONE_SEQUENCING: sequencing}
    )
    return coordinator


@pytest.mark.asyncio
async def test_sequential_zones_take_the_sum():
    coordinator = _coordinator(const.CONF_ZONE_SEQUENCING_SEQUENTIAL, 3600, 3600, 1200)

    assert await coordinator.get_total_duration_all_enabled_zones() == 8400


@pytest.mark.asyncio
async def test_parallel_zones_are_done_with_the_longest():
    """Two one-hour zones at once finish in an hour, not two."""
    coordinator = _coordinator(const.CONF_ZONE_SEQUENCING_PARALLEL, 3600, 3600, 1200)

    assert await coordinator.get_total_duration_all_enabled_zones() == 3600


@pytest.mark.asyncio
async def test_the_default_is_still_the_sum():
    """Sequencing is sequential unless it was changed, so nothing moves for anyone."""
    coordinator = _coordinator(None, 3600, 1200)
    coordinator.store.async_get_config = AsyncMock(return_value={})

    assert await coordinator.get_total_duration_all_enabled_zones() == 4800


@pytest.mark.asyncio
async def test_disabled_zones_do_not_count():
    coordinator = _coordinator(
        const.CONF_ZONE_SEQUENCING_PARALLEL, 3600, state=const.ZONE_STATE_DISABLED
    )

    assert await coordinator.get_total_duration_all_enabled_zones() == 0


@pytest.mark.asyncio
async def test_no_zones_at_all():
    coordinator = _coordinator(const.CONF_ZONE_SEQUENCING_PARALLEL)

    assert await coordinator.get_total_duration_all_enabled_zones() == 0


# --- cycle and soak, and the pause between zones ----------------------------
#
# Both occupy the run without watering in it, so a trigger that has to finish
# at sunrise has to know about them. They only exist when Smart Irrigation
# opens the valves itself.


def _driving(config, *durations):
    coordinator = _coordinator(const.CONF_ZONE_SEQUENCING_SEQUENTIAL, *durations)
    coordinator.store.async_get_config = AsyncMock(
        return_value={
            const.CONF_ZONE_SEQUENCING: const.CONF_ZONE_SEQUENCING_SEQUENTIAL,
            const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True,
            **config,
        }
    )
    return coordinator


@pytest.mark.asyncio
async def test_soaking_lengthens_the_run():
    """Two zones of 30 min in 3 passes, soaking 10 min: 30 + 20 each."""
    coordinator = _driving(
        {const.CONF_WATERING_PASSES: 3, const.CONF_SOAK_MINUTES: 10}, 1800, 1800
    )

    assert await coordinator.get_total_duration_all_enabled_zones() == 2 * (1800 + 1200)


@pytest.mark.asyncio
async def test_the_pause_between_zones_lengthens_it_too():
    coordinator = _driving({const.CONF_PAUSE_BETWEEN_ZONES: 120}, 600, 600, 600)

    # Three zones, two pauses.
    assert await coordinator.get_total_duration_all_enabled_zones() == 1800 + 240


@pytest.mark.asyncio
async def test_one_zone_is_never_paused_after():
    coordinator = _driving({const.CONF_PAUSE_BETWEEN_ZONES: 120}, 600)

    assert await coordinator.get_total_duration_all_enabled_zones() == 600


@pytest.mark.asyncio
async def test_zones_at_once_take_the_longest_soaking_and_all():
    coordinator = _driving(
        {
            const.CONF_WATERING_PASSES: 2,
            const.CONF_SOAK_MINUTES: 5,
            const.CONF_PAUSE_BETWEEN_ZONES: 120,
            const.CONF_ZONE_SEQUENCING: const.CONF_ZONE_SEQUENCING_PARALLEL,
        },
        1800,
        600,
    )

    # The longest zone, its own soak included; no pause, nothing waits.
    assert await coordinator.get_total_duration_all_enabled_zones() == 1800 + 300


@pytest.mark.asyncio
async def test_an_executor_of_your_own_keeps_its_own_timing():
    """Our passes do not exist when somebody else opens the valves."""
    coordinator = _coordinator(const.CONF_ZONE_SEQUENCING_SEQUENTIAL, 1800, 1800)
    coordinator.store.async_get_config = AsyncMock(
        return_value={
            const.CONF_ZONE_SEQUENCING: const.CONF_ZONE_SEQUENCING_SEQUENTIAL,
            const.CONF_DIRECT_VALVE_CONTROL_ENABLED: False,
            const.CONF_WATERING_PASSES: 3,
            const.CONF_SOAK_MINUTES: 10,
            const.CONF_PAUSE_BETWEEN_ZONES: 120,
        }
    )

    assert await coordinator.get_total_duration_all_enabled_zones() == 3600


@pytest.mark.asyncio
async def test_a_run_too_short_to_split_soaks_not_at_all():
    coordinator = _driving(
        {const.CONF_WATERING_PASSES: 4, const.CONF_SOAK_MINUTES: 10}, 45
    )

    assert await coordinator.get_total_duration_all_enabled_zones() == 45
