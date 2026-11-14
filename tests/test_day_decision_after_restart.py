"""A day is decided afresh when Home Assistant was off at midnight.

UX walk of 13 Nov. (Q19): a schedule at 19:41 watered with 4.8 mm of rain
forecast and a 2 mm threshold, while the planning said it would be skipped.
"A start has fired today" was stored as a bare yes and cleared only by the
midnight callback. The test instance had been off over midnight since the 10th,
so every start read the flag as today's: the day counted as decided ("water")
and no skip condition was judged.
"""

from datetime import date, timedelta
from unittest.mock import AsyncMock, Mock

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.helpers import fired_today
from custom_components.smart_irrigation.store import SmartIrrigationStorage

TODAY = date(2026, 11, 13)


@pytest.mark.parametrize(
    ("flag", "fired_on", "expected"),
    [
        (False, None, False),
        (False, "2026-11-13", False),
        (True, "2026-11-13", True),
        # Left from a day that ended while Home Assistant was off.
        (True, "2026-11-10", False),
        # Stored before the day was kept: taken as it always was.
        (True, None, True),
    ],
)
def test_the_flag_holds_only_for_its_own_day(flag, fired_on, expected):
    assert fired_today(flag, fired_on, TODAY) is expected


def _store(flag, fired_on):
    store = Mock()
    store.config.manual_coordinates_enabled = False
    config = {
        const.CONF_USE_WEATHER_SERVICE: False,
        const.CONF_WEATHER_SERVICE: None,
        const.CONF_AUTO_UPDATE_ENABLED: False,
        const.CONF_AUTO_CALC_ENABLED: False,
        const.CONF_AUTO_CLEAR_ENABLED: False,
        const.START_EVENT_FIRED_TODAY: flag,
        const.START_EVENT_FIRED_ON: fired_on,
    }
    store.get_config.return_value = config
    store.async_get_config = AsyncMock(return_value=config)
    store.async_get_zones = AsyncMock(return_value=[])
    store.async_update_config = AsyncMock()
    return store


async def _coordinator(hass, store):
    hass.data[const.DOMAIN] = {
        const.CONF_USE_WEATHER_SERVICE: False,
        const.CONF_WEATHER_SERVICE: None,
    }
    entry = Mock()
    entry.unique_id = "test_entry"
    entry.data = {}
    entry.options = {}
    coord = SmartIrrigationCoordinator(hass, None, entry, store)
    await hass.async_block_till_done()
    if coord._track_midnight_time_unsub:
        coord._track_midnight_time_unsub()
    return coord


async def test_a_flag_from_an_earlier_day_leaves_today_undecided(hass):
    earlier = (dt_util.now().date() - timedelta(days=3)).isoformat()
    store = _store(True, earlier)

    coord = await _coordinator(hass, store)

    assert coord._start_event_fired_today is False
    assert coord._watering_decision_today is None
    store.async_update_config.assert_any_await(
        {const.START_EVENT_FIRED_TODAY: False, const.START_EVENT_FIRED_ON: None}
    )


async def test_todays_flag_still_holds_after_a_restart(hass):
    store = _store(True, dt_util.now().date().isoformat())

    coord = await _coordinator(hass, store)

    assert coord._start_event_fired_today is True
    assert coord._watering_decision_today is True
    store.async_update_config.assert_not_awaited()


async def test_a_start_keeps_its_day(hass):
    store = _store(False, None)
    coord = await _coordinator(hass, store)

    await coord._mark_start_event_fired()

    assert coord._start_event_fired_today is True
    store.async_update_config.assert_awaited_with(
        {
            const.START_EVENT_FIRED_TODAY: True,
            const.START_EVENT_FIRED_ON: dt_util.now().date().isoformat(),
        }
    )


async def test_midnight_clears_the_day_too(hass):
    store = _store(True, dt_util.now().date().isoformat())
    coord = await _coordinator(hass, store)

    coord._reset_event_fired_today()
    await hass.async_block_till_done()

    store.async_update_config.assert_any_await(
        {const.START_EVENT_FIRED_TODAY: False, const.START_EVENT_FIRED_ON: None}
    )


# The update timer the coordinator arms at start is not this test's business.
@pytest.mark.parametrize("expected_lingering_timers", [True])
async def test_the_stored_flag_is_cleared_and_stays_cleared(
    hass, hass_storage, expected_lingering_timers
):
    """The timers set up at start write the configuration back whole.

    They were handed a copy taken before the flag was cleared, and put the old
    flag back a moment later: the next restart found it again.
    """
    store = SmartIrrigationStorage(hass)
    await store.async_load()
    await store.async_update_config(
        {const.START_EVENT_FIRED_TODAY: True, const.START_EVENT_FIRED_ON: "2026-01-01"}
    )
    assert store.config.autocalcenabled and store.config.autoupdateenabled

    coord = await _coordinator(hass, store)
    assert coord._start_event_fired_today is False
    await hass.async_block_till_done()

    assert store.config.starteventfiredtoday is False
    assert store.config.starteventfiredon is None
