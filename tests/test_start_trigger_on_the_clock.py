"""A start trigger fires when the clock reaches it, in a real Home Assistant.

The trigger tests elsewhere replace `async_track_time_change` and check the
arguments it was given, which proves what was registered and not that
registering it makes anything happen. These put the tracker in a real `hass`,
move its clock with `async_fire_time_changed`, and watch the event the
automations listen for, along with the bookkeeping that follows it.
"""

from datetime import timedelta

import pytest
from homeassistant.util import dt as dt_util
from homeassistant.util.unit_system import METRIC_SYSTEM
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.store import (
    STORAGE_KEY,
    STORAGE_VERSION,
    SmartIrrigationStorage,
)

_COORDINATORS = []


@pytest.fixture(autouse=True)
def _cancel_the_trackers():
    """A tracker left registered is a lingering timer, which fails the test."""
    yield
    for coordinator in _COORDINATORS:
        for unsub in coordinator._track_irrigation_triggers_unsub:
            unsub()
    _COORDINATORS.clear()


START_EVENT = f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
SKIPPED_EVENT = f"{const.DOMAIN}_{const.EVENT_IRRIGATE_SKIPPED}"


def _zone(zone_id, duration):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"zone {zone_id}",
        const.ZONE_STATE: "automatic",
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MAPPING: None,
        const.ZONE_MODULE: None,
        const.ZONE_DELTA: 0.0,
        const.ZONE_BUCKET: -1.0,
        const.ZONE_DURATION: duration,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_LEAD_TIME: 0,
    }


async def _coordinator(hass, hass_storage, *, zones, config=None):
    hass.config.units = METRIC_SYSTEM
    hass_storage[STORAGE_KEY] = {
        "version": STORAGE_VERSION,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": {
            "config": dict(config or {}),
            "zones": list(zones),
            "modules": [],
            "mappings": [],
        },
    }
    store = SmartIrrigationStorage(hass)
    await store.async_load()

    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = hass
    coordinator.store = store
    coordinator._track_irrigation_triggers_unsub = []
    coordinator._fired_triggers_today = set()
    coordinator._watering_decision_today = None
    coordinator._start_event_fired_today = False
    coordinator._last_skip_evaluation = None
    _COORDINATORS.append(coordinator)
    return coordinator


def _next_occurrence(hours, minutes):
    now = dt_util.now()
    at = now.replace(hour=hours, minute=minutes, second=0, microsecond=0)
    return at if at > now else at + timedelta(days=1)


async def _reach(hass, hours, minutes):
    async_fire_time_changed(hass, _next_occurrence(hours, minutes))
    await hass.async_block_till_done()


async def test_the_start_event_fires_when_the_clock_reaches_the_time(
    hass, hass_storage
):
    coordinator = await _coordinator(hass, hass_storage, zones=[_zone(0, 600)])
    fired = []
    hass.bus.async_listen(START_EVENT, lambda event: fired.append(event.data))
    await coordinator._register_time_trigger(
        "06:30", "Early", 0, False, {const.TRIGGER_CONF_NAME: "Early"}
    )

    await _reach(hass, 6, 30)

    assert len(fired) == 1
    assert fired[0]["trigger_name"] == "Early"


async def test_nothing_fires_before_the_time(hass, hass_storage):
    coordinator = await _coordinator(hass, hass_storage, zones=[_zone(0, 600)])
    fired = []
    hass.bus.async_listen(START_EVENT, lambda event: fired.append(event.data))
    await coordinator._register_time_trigger(
        "06:30", "Early", 0, False, {const.TRIGGER_CONF_NAME: "Early"}
    )

    # An hour before the time: the tracker has not reached it yet.
    async_fire_time_changed(hass, _next_occurrence(6, 30) - timedelta(hours=1))
    await hass.async_block_till_done()

    assert fired == []


async def test_a_run_that_waters_restarts_the_days_between_counter(hass, hass_storage):
    coordinator = await _coordinator(
        hass,
        hass_storage,
        zones=[_zone(0, 600)],
        config={
            const.CONF_DAYS_BETWEEN_IRRIGATION: 2,
            const.CONF_DAYS_SINCE_LAST_IRRIGATION: 5,
        },
    )
    await coordinator._register_time_trigger(
        "06:30", "Early", 0, False, {const.TRIGGER_CONF_NAME: "Early"}
    )

    await _reach(hass, 6, 30)

    config = await coordinator.store.async_get_config()
    assert config[const.CONF_DAYS_SINCE_LAST_IRRIGATION] == 0
    assert coordinator.store.get_zone(0)[const.ZONE_DAYS_SINCE_IRRIGATION] == 0


async def test_a_day_within_the_days_between_fires_a_skipped_event_and_no_start(
    hass, hass_storage
):
    coordinator = await _coordinator(
        hass,
        hass_storage,
        zones=[_zone(0, 600)],
        config={
            const.CONF_DAYS_BETWEEN_IRRIGATION: 3,
            const.CONF_DAYS_SINCE_LAST_IRRIGATION: 1,
        },
    )
    started, skipped = [], []
    hass.bus.async_listen(START_EVENT, lambda event: started.append(event.data))
    hass.bus.async_listen(SKIPPED_EVENT, lambda event: skipped.append(event.data))
    await coordinator._register_time_trigger(
        "06:30", "Early", 0, False, {const.TRIGGER_CONF_NAME: "Early"}
    )

    await _reach(hass, 6, 30)

    assert started == []
    assert len(skipped) == 1
    assert skipped[0]["reason"] == "days_between"


async def test_the_trigger_fires_once_a_day(hass, hass_storage):
    coordinator = await _coordinator(hass, hass_storage, zones=[_zone(0, 600)])
    fired = []
    hass.bus.async_listen(START_EVENT, lambda event: fired.append(event.data))
    await coordinator._register_time_trigger(
        "06:30", "Early", 0, False, {const.TRIGGER_CONF_NAME: "Early"}
    )

    await _reach(hass, 6, 30)
    await _reach(hass, 6, 30)

    assert len(fired) == 1


@pytest.mark.parametrize("duration", [0, None])
async def test_a_start_with_nothing_to_water_leaves_the_counters_counting(
    hass, hass_storage, duration
):
    coordinator = await _coordinator(
        hass,
        hass_storage,
        zones=[_zone(0, duration)],
        config={const.CONF_DAYS_SINCE_LAST_IRRIGATION: 4},
    )
    await coordinator._register_time_trigger(
        "06:30", "Early", 0, False, {const.TRIGGER_CONF_NAME: "Early"}
    )

    await _reach(hass, 6, 30)

    config = await coordinator.store.async_get_config()
    assert config[const.CONF_DAYS_SINCE_LAST_IRRIGATION] == 4
