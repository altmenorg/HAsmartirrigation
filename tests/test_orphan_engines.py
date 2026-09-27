"""Calculation engines nothing points at are removed on load.

Nobody creates an engine by hand any more: a zone says how it is calculated and
the instance behind that answer is created, reused or replaced underneath.
Replacing one leaves the old instance behind, and the migration that gave every
zone its own engine left the shared ones behind, so an installation accumulates
engines its owner cannot see. Megalos's diagnostics had four engines for two
zones, one of them holding its forecast days as the string "2".

They are not harmless: an engine is picked up by name when a caller has no zone
to go on, which is what the setup assistant does, so a leftover carrying a stale
setting can be adopted by the next zone created.
"""

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import (
    STORAGE_KEY,
    STORAGE_VERSION,
    SmartIrrigationStorage,
)

ZONE = {
    const.ZONE_ID: 0,
    const.ZONE_NAME: "Lawn",
    const.ZONE_STATE: "automatic",
    const.ZONE_SIZE: 50.0,
    const.ZONE_THROUGHPUT: 10.0,
    const.ZONE_BUCKET: 0.0,
    const.ZONE_DELTA: 0.0,
    const.ZONE_DURATION: 0,
    const.ZONE_LEAD_TIME: 0,
    const.ZONE_MULTIPLIER: 1.0,
    const.ZONE_MODULE: 0,
    const.ZONE_MAPPING: 0,
}


def _module(module_id, name="PyETO", config=None):
    return {
        const.MODULE_ID: module_id,
        const.MODULE_NAME: name,
        const.MODULE_DESCRIPTION: name,
        const.MODULE_CONFIG: config or {},
        const.MODULE_SCHEMA: {},
    }


def _mapping(mapping_id=0, module=0):
    return {
        const.MAPPING_ID: mapping_id,
        const.MAPPING_NAME: "Default sensor group",
        const.MAPPING_MAPPINGS: {},
        const.MAPPING_MODULE: module,
        const.MAPPING_DATA: [],
    }


async def _load(hass, hass_storage, *, zones, modules, mappings, config=None):
    hass_storage[STORAGE_KEY] = {
        "version": STORAGE_VERSION,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": {
            "config": dict(config or {const.CONF_UI_MODE: const.CONF_UI_MODE_ADVANCED}),
            "zones": zones,
            "modules": modules,
            "mappings": mappings,
        },
    }
    store = SmartIrrigationStorage(hass)
    await store.async_load()
    return store


@pytest.mark.asyncio
async def test_the_engine_a_zone_uses_is_kept(hass, hass_storage):
    store = await _load(
        hass,
        hass_storage,
        zones=[dict(ZONE)],
        modules=[_module(0)],
        mappings=[_mapping()],
    )

    assert set(store.modules) == {0}


@pytest.mark.asyncio
async def test_the_leftovers_go(hass, hass_storage):
    """His four engines for two zones: the two nothing points at are dropped."""
    zones = [
        dict(ZONE),
        {
            **ZONE,
            const.ZONE_ID: 1,
            const.ZONE_NAME: "Test",
            const.ZONE_MODULE: 3,
            const.ZONE_MAPPING: 1,
        },
    ]
    modules = [
        _module(0, config={"forecast_days": 5}),
        _module(1, name="Static"),
        _module(2, config={"forecast_days": "2"}),
        _module(3, name="Passthrough"),
    ]
    mappings = [_mapping(0, module=0), _mapping(1, module=3)]

    store = await _load(
        hass, hass_storage, zones=zones, modules=modules, mappings=mappings
    )

    assert set(store.modules) == {0, 3}


@pytest.mark.asyncio
async def test_an_engine_a_sensor_group_names_is_kept(hass, hass_storage):
    """A group records the kind of engine it feeds, so it counts as a user."""
    store = await _load(
        hass,
        hass_storage,
        zones=[{**ZONE, const.ZONE_MODULE: None}],
        modules=[_module(0)],
        mappings=[_mapping(0, module=0)],
    )

    assert set(store.modules) == {0}


@pytest.mark.asyncio
async def test_engine_zero_is_an_engine(hass, hass_storage):
    """The id a fresh installation creates, and the class of bug that has
    already broken every default install once (#846)."""
    store = await _load(
        hass,
        hass_storage,
        zones=[dict(ZONE)],
        modules=[_module(0), _module(7)],
        mappings=[_mapping(0, module=None)],
    )

    assert set(store.modules) == {0}


@pytest.mark.asyncio
async def test_an_installation_with_nothing_to_drop_is_left_alone(hass, hass_storage):
    store = await _load(
        hass,
        hass_storage,
        zones=[dict(ZONE)],
        modules=[_module(0)],
        mappings=[_mapping(0, module=0)],
    )

    assert set(store.modules) == {0}


@pytest.mark.asyncio
async def test_a_zone_that_lost_its_engine_does_not_take_the_others_with_it(
    hass, hass_storage
):
    store = await _load(
        hass,
        hass_storage,
        zones=[{**ZONE, const.ZONE_MODULE: None}],
        modules=[_module(0)],
        mappings=[_mapping(0, module=None)],
    )

    assert store.modules == {}
    assert store.zones[0].module is None
