"""The general days between irrigation move to the zones on load.

They were set twice: in general, and on each zone, the zone's own number
replacing the general one (Megalos, #1059). The panel now sets them on the zone
only. A general number goes to every zone without one of its own, so each
waters as it did; a zone with its own number keeps it.
"""

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import (
    STORAGE_KEY,
    STORAGE_VERSION,
    SmartIrrigationStorage,
)


def _zone(zone_id, name, days=None):
    zone = {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: name,
        const.ZONE_STATE: "automatic",
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_BUCKET: 0.0,
        const.ZONE_DELTA: 0.0,
        const.ZONE_DURATION: 0,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_MODULE: None,
        const.ZONE_MAPPING: None,
    }
    if days is not None:
        zone[const.ZONE_DAYS_BETWEEN_IRRIGATION] = days
    return zone


async def _load(hass, hass_storage, general, zones, since=None):
    hass_storage[STORAGE_KEY] = {
        "version": STORAGE_VERSION,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": {
            "config": {
                const.CONF_UI_MODE: const.CONF_UI_MODE_ADVANCED,
                const.CONF_DAYS_BETWEEN_IRRIGATION: general,
                **(
                    {}
                    if since is None
                    else {const.CONF_DAYS_SINCE_LAST_IRRIGATION: since}
                ),
            },
            "zones": zones,
            "modules": [],
            "mappings": [],
        },
    }
    store = SmartIrrigationStorage(hass)
    await store.async_load()
    return store


def _days(store):
    return {z.name: z.days_between_irrigation for z in store.zones.values()}


@pytest.mark.asyncio
async def test_the_general_days_go_to_the_zones_without_their_own(hass, hass_storage):
    store = await _load(
        hass,
        hass_storage,
        3,
        [_zone(0, "Lawn"), _zone(1, "Beds", days=1), _zone(2, "Hedge", days=0)],
    )
    # Lawn followed the general 3; Beds and Hedge had their own, 0 included.
    assert _days(store) == {"Lawn": 3, "Beds": 1, "Hedge": 0}
    assert store.config.days_between_irrigation == 0


@pytest.mark.asyncio
async def test_a_moved_zone_takes_the_general_count_along(hass, hass_storage):
    """It counted with the general counter: its next watering day stays."""
    store = await _load(
        hass,
        hass_storage,
        3,
        [_zone(0, "Lawn"), _zone(1, "Beds", days=1)],
        since=2,
    )
    by_name = {z.name: z for z in store.zones.values()}
    assert by_name["Lawn"].days_since_irrigation == 2
    # A zone with its own number counted on its own, and keeps its count.
    assert by_name["Beds"].days_since_irrigation is None


@pytest.mark.asyncio
async def test_without_general_days_nothing_moves(hass, hass_storage):
    store = await _load(hass, hass_storage, 0, [_zone(0, "Lawn"), _zone(1, "Beds", 2)])
    assert _days(store) == {"Lawn": None, "Beds": 2}
    assert store.config.days_between_irrigation == 0


@pytest.mark.asyncio
async def test_the_move_is_saved_and_happens_once(hass, hass_storage):
    store = await _load(hass, hass_storage, 4, [_zone(0, "Lawn")])
    await store.async_save()
    saved = hass_storage[STORAGE_KEY]["data"]
    assert saved["config"][const.CONF_DAYS_BETWEEN_IRRIGATION] == 0
    assert saved["zones"][0][const.ZONE_DAYS_BETWEEN_IRRIGATION] == 4

    again = SmartIrrigationStorage(hass)
    await again.async_load()
    assert _days(again) == {"Lawn": 4}
