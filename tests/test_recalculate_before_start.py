"""Calculate again just before the first start of the day (opt-in)."""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.triggers import TriggersMixin


def _coordinator(*, enabled=True, calculated=None, hourly=False):
    class _Coordinator(TriggersMixin):
        pass

    coordinator = _Coordinator()
    coordinator.store = MagicMock()
    coordinator.store.get_config.return_value = {
        const.CONF_RECALCULATE_BEFORE_START: enabled,
        const.CONF_HOURLY_CALCULATION: hourly,
    }
    zone = {const.ZONE_ID: 0, const.ZONE_NAME: "Lawn"}
    if calculated is not None:
        zone[const.ZONE_LAST_CALCULATED] = calculated
    coordinator.store.async_get_zones = AsyncMock(return_value=[zone])
    coordinator._async_calculate_all = AsyncMock()
    return coordinator


async def test_it_is_off_by_default():
    coordinator = _coordinator(enabled=False)

    await coordinator._recalculate_before_start()

    coordinator._async_calculate_all.assert_not_awaited()


async def test_hour_by_hour_does_not_decide_who_starts_the_watering():
    """Something else may run the watering and read the durations when it likes:
    the recalculation stays a choice, whatever the form of the equation."""
    coordinator = _coordinator(enabled=False, hourly=True)

    await coordinator._recalculate_before_start()

    coordinator._async_calculate_all.assert_not_awaited()


async def test_a_night_old_calculation_is_done_again():
    coordinator = _coordinator(calculated=datetime.now() - timedelta(hours=19))

    await coordinator._recalculate_before_start()

    coordinator._async_calculate_all.assert_awaited_once()


async def test_a_zone_never_calculated_is_calculated():
    coordinator = _coordinator()

    await coordinator._recalculate_before_start()

    coordinator._async_calculate_all.assert_awaited_once()


async def test_nothing_is_fresher_than_a_calculation_of_the_last_hour():
    coordinator = _coordinator(calculated=datetime.now() - timedelta(minutes=20))

    await coordinator._recalculate_before_start()

    coordinator._async_calculate_all.assert_not_awaited()


async def test_a_calculation_time_stored_as_text_is_read():
    stamp = (datetime.now() - timedelta(minutes=20)).isoformat()
    coordinator = _coordinator(calculated=stamp)

    await coordinator._recalculate_before_start()

    coordinator._async_calculate_all.assert_not_awaited()


async def test_a_failing_calculation_leaves_the_run_to_go_ahead():
    coordinator = _coordinator(calculated=datetime.now() - timedelta(hours=19))
    coordinator._async_calculate_all = AsyncMock(side_effect=RuntimeError("down"))

    await coordinator._recalculate_before_start()
