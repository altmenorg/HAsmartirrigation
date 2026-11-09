"""Removing the integration removes its data.

The store is loaded once and kept in hass.data under a key of its own. Removing
the entry deleted the file but left that copy in memory, so adding the
integration again took up the old zones, groups and settings and wrote them
back: "remove all traces" brought everything back.
"""

from unittest.mock import patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.smart_irrigation import async_remove_entry, const
from custom_components.smart_irrigation.store import (
    DATA_REGISTRY,
    STORAGE_KEY,
    STORAGE_VERSION,
    async_get_registry,
)

ZONE = {
    const.ZONE_ID: 0,
    const.ZONE_NAME: "Old lawn",
    const.ZONE_STATE: "automatic",
    const.ZONE_SIZE: 50.0,
    const.ZONE_THROUGHPUT: 10.0,
    const.ZONE_MAPPING: None,
    const.ZONE_MODULE: None,
    const.ZONE_DELTA: 0.0,
    const.ZONE_BUCKET: -3.0,
    const.ZONE_DURATION: 0,
    const.ZONE_MULTIPLIER: 1.0,
    const.ZONE_LEAD_TIME: 0,
}


def _stored(hass_storage):
    hass_storage[STORAGE_KEY] = {
        "version": STORAGE_VERSION,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": {"config": {}, "zones": [ZONE], "modules": [], "mappings": []},
    }


def _names(store):
    return [zone.name for zone in store.zones.values()]


@pytest.fixture(autouse=True)
def _no_panel():
    with patch("custom_components.smart_irrigation.remove_panel"):
        yield


@pytest.mark.asyncio
async def test_adding_it_again_starts_from_nothing(hass, hass_storage):
    hass.config.units = METRIC_SYSTEM
    _stored(hass_storage)
    store = await async_get_registry(hass)
    assert _names(store) == ["Old lawn"]

    await async_remove_entry(hass, MockConfigEntry(domain=const.DOMAIN))

    assert DATA_REGISTRY not in hass.data
    assert const.DOMAIN not in hass.data
    assert STORAGE_KEY not in hass_storage
    # What the next setup gets.
    assert "Old lawn" not in _names(await async_get_registry(hass))


@pytest.mark.asyncio
async def test_an_entry_that_never_loaded_removes_its_file_too(hass, hass_storage):
    """Removed while it failed to set up: nothing was loaded, the file is there."""
    hass.config.units = METRIC_SYSTEM
    _stored(hass_storage)

    await async_remove_entry(hass, MockConfigEntry(domain=const.DOMAIN))

    assert STORAGE_KEY not in hass_storage
    assert DATA_REGISTRY not in hass.data
