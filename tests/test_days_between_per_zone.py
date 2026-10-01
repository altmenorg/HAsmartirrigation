"""Days between irrigation for one zone alone (#875).

A zone with a value of its own replaces the general setting and counts the days
since it was last watered itself. A zone without one follows the general
setting, exactly as before.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.skip_conditions import SkipConditionsMixin
from custom_components.smart_irrigation.triggers import TriggersMixin


def _zone(zone_id, *, between=None, since=None, state=const.ZONE_STATE_AUTOMATIC):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_STATE: state,
        const.ZONE_DURATION: 600,
        const.ZONE_DAYS_BETWEEN_IRRIGATION: between,
        const.ZONE_DAYS_SINCE_IRRIGATION: since,
    }


def _coordinator(zones, *, general=3, general_since=0):
    class _Coordinator(SkipConditionsMixin, TriggersMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.async_get_config = AsyncMock(
        return_value={
            const.CONF_DAYS_BETWEEN_IRRIGATION: general,
            const.CONF_DAYS_SINCE_LAST_IRRIGATION: general_since,
        }
    )
    coordinator.store.async_get_zones = AsyncMock(return_value=zones)
    coordinator.store.async_update_zone = AsyncMock()
    coordinator.store.async_update_config = AsyncMock()
    return coordinator


async def test_without_a_value_of_its_own_a_zone_follows_the_general_setting():
    coordinator = _coordinator([_zone(0), _zone(1)], general=3, general_since=1)

    assert await coordinator.async_zones_held_by_days_between() == {0, 1}


async def test_a_zone_with_a_value_of_its_own_ignores_the_general_setting():
    """The flowers every day, the lawn every three days."""
    coordinator = _coordinator(
        [_zone(0), _zone(1, between=1, since=1)], general=3, general_since=1
    )

    assert await coordinator.async_zones_held_by_days_between() == {0}


async def test_zero_means_no_restriction_for_that_zone():
    coordinator = _coordinator(
        [_zone(0), _zone(1, between=0, since=0)], general=3, general_since=0
    )

    assert await coordinator.async_zones_held_by_days_between() == {0}


async def test_a_zone_that_counts_its_own_days_waits_for_them():
    coordinator = _coordinator([_zone(0, between=4, since=2)], general=0)

    assert await coordinator.async_zones_held_by_days_between() == {0}

    coordinator = _coordinator([_zone(0, between=4, since=4)], general=0)

    assert await coordinator.async_zones_held_by_days_between() == set()


async def test_a_zone_with_nothing_recorded_is_never_held_back():
    coordinator = _coordinator([_zone(0, between=7, since=None)], general=0)

    assert await coordinator.async_zones_held_by_days_between() == set()


async def test_a_disabled_zone_is_not_counted():
    coordinator = _coordinator(
        [_zone(0, state=const.ZONE_STATE_DISABLED)], general=3, general_since=0
    )

    assert await coordinator.async_zones_held_by_days_between() == set()


async def test_the_day_is_skipped_only_when_every_zone_is_held():
    held_all = _coordinator([_zone(0), _zone(1)], general=3, general_since=1)
    some_free = _coordinator(
        [_zone(0), _zone(1, between=1, since=1)], general=3, general_since=1
    )

    all_held = await held_all._evaluate_days_between_irrigation()
    one_free = await some_free._evaluate_days_between_irrigation()

    assert all_held["skip"] is True
    assert one_free["skip"] is False
    assert one_free["zones_held"] == [0]
    assert one_free["zones_with_own_setting"] == [1]


async def test_a_zone_asking_for_days_turns_the_check_on_even_with_a_general_zero():
    coordinator = _coordinator([_zone(0, between=5, since=1)], general=0)

    result = await coordinator._evaluate_days_between_irrigation()

    assert result["enabled"] is True
    assert result["skip"] is True


async def test_nothing_is_enabled_without_any_value_anywhere():
    coordinator = _coordinator([_zone(0), _zone(1, between=0, since=0)], general=0)

    result = await coordinator._evaluate_days_between_irrigation()

    assert result["enabled"] is False
    assert result["skip"] is False


async def test_the_zones_held_get_a_duration_of_zero_for_the_run():
    coordinator = _coordinator([_zone(0), _zone(1, between=1, since=1)])
    coordinator.hass.bus = MagicMock()

    await coordinator._hold_back_zones_held_by_days_between({0})

    coordinator.store.async_update_zone.assert_awaited_once_with(
        0, {const.ZONE_DURATION: 0}
    )


async def test_the_midnight_count_moves_every_zone_that_counts():
    coordinator = _coordinator(
        [_zone(0, between=2, since=1), _zone(1, between=2, since=None)]
    )

    await coordinator._increment_days_since_irrigation()

    coordinator.store.async_update_zone.assert_awaited_once_with(
        0, {const.ZONE_DAYS_SINCE_IRRIGATION: 2}
    )


async def test_a_run_restarts_the_count_of_the_zones_it_watered_only():
    zones = [_zone(0), _zone(1)]
    zones[1][const.ZONE_DURATION] = 0
    coordinator = _coordinator(zones)

    await coordinator._reset_zone_days_since_irrigation()

    coordinator.store.async_update_zone.assert_awaited_once_with(
        0, {const.ZONE_DAYS_SINCE_IRRIGATION: 0}
    )


async def test_a_zone_with_days_of_its_own_does_not_restart_the_general_count():
    """Else the flowers, watered daily, would keep the lawn from ever being due."""
    only_own = _coordinator([_zone(0, between=1, since=1)])
    mixed = _coordinator([_zone(0, between=1, since=1), _zone(1)])

    assert await only_own._any_zone_to_water(general_setting_only=True) is False
    assert await mixed._any_zone_to_water(general_setting_only=True) is True
    assert await only_own._any_zone_to_water() is True


@pytest.mark.parametrize("own", [None, 0, 3])
def test_the_value_of_the_zone_is_what_the_helper_reports(own):
    required, since = SkipConditionsMixin.zone_days_between(
        _zone(0, between=own, since=1),
        {
            const.CONF_DAYS_BETWEEN_IRRIGATION: 5,
            const.CONF_DAYS_SINCE_LAST_IRRIGATION: 2,
        },
    )

    assert (required, since) == ((5, 2) if own is None else (own, 1))


def test_the_next_start_waits_for_the_first_zone_that_is_due():
    config = {
        const.CONF_DAYS_BETWEEN_IRRIGATION: 5,
        const.CONF_DAYS_SINCE_LAST_IRRIGATION: 1,
    }
    followers = [_zone(0)]
    with_flowers = [_zone(0), _zone(1, between=1, since=0)]
    due_now = [_zone(0), _zone(1, between=0, since=0)]

    assert SkipConditionsMixin.days_until_a_zone_is_due(followers, config) == 4
    assert SkipConditionsMixin.days_until_a_zone_is_due(with_flowers, config) == 1
    assert SkipConditionsMixin.days_until_a_zone_is_due(due_now, config) == 0
    assert SkipConditionsMixin.days_until_a_zone_is_due([], config) == 4
