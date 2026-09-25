"""Every zone has its own engine instance, so its settings are its own.

An engine carries settings a zone owns: how many days it looks ahead, the
fixed amount it uses. Zones used to share one instance, so changing one of
those on a zone changed it on every zone calculated the same way, silently.

The split happens once, at load. The engine each zone uses is first resolved
the way the calculation used to resolve it, the group's when it had adopted
one and the zone's otherwise, so nothing changes about what any zone computes.
"""

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import (
    STORAGE_KEY,
    STORAGE_VERSION,
    SmartIrrigationStorage,
)


def _module(module_id, name="PyETO", **config):
    return {
        const.MODULE_ID: module_id,
        const.MODULE_NAME: name,
        const.MODULE_DESCRIPTION: "d",
        const.MODULE_CONFIG: {"forecast_days": 0, **config},
        const.MODULE_SCHEMA: {},
    }


def _zone(zone_id, mapping=None, module=None):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"zone {zone_id}",
        const.ZONE_STATE: "automatic",
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MAPPING: mapping,
        const.ZONE_MODULE: module,
        const.ZONE_DELTA: 0.0,
        const.ZONE_BUCKET: 0.0,
        const.ZONE_DURATION: 0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_LEAD_TIME: 0,
    }


def _mapping(mapping_id, module=None):
    return {
        const.MAPPING_ID: mapping_id,
        const.MAPPING_NAME: f"group {mapping_id}",
        const.MAPPING_MAPPINGS: {},
        const.MAPPING_MODULE: module,
    }


async def _load(hass, hass_storage, *, zones, modules, mappings=(), config=None):
    hass.config.units = METRIC_SYSTEM
    hass_storage[STORAGE_KEY] = {
        "version": STORAGE_VERSION,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": {
            "config": dict(config or {}),
            "zones": list(zones),
            "modules": list(modules),
            "mappings": list(mappings),
        },
    }
    store = SmartIrrigationStorage(hass)
    await store.async_load()
    return store


@pytest.mark.asyncio
async def test_zones_sharing_an_engine_each_get_their_own(hass, hass_storage):
    store = await _load(
        hass,
        hass_storage,
        zones=[_zone(0, module=1), _zone(1, module=1)],
        modules=[_module(1, forecast_days=2)],
    )

    first = store.get_zone(0)[const.ZONE_MODULE]
    second = store.get_zone(1)[const.ZONE_MODULE]

    assert first != second
    modules = {m[const.MODULE_ID]: m for m in await store.async_get_modules()}
    # The copy is the same engine, with the settings it had.
    assert modules[second][const.MODULE_NAME] == "PyETO"
    assert modules[second][const.MODULE_CONFIG]["forecast_days"] == 2


@pytest.mark.asyncio
async def test_a_zone_that_is_alone_keeps_the_instance_it_had(hass, hass_storage):
    """Nothing is copied for nothing."""
    store = await _load(
        hass, hass_storage, zones=[_zone(0, module=1)], modules=[_module(1)]
    )

    assert store.get_zone(0)[const.ZONE_MODULE] == 1
    assert len(await store.async_get_modules()) == 1


@pytest.mark.asyncio
async def test_the_engine_a_group_had_adopted_is_the_one_each_zone_keeps(
    hass, hass_storage
):
    """The old rule: the group's engine won over the zone's own.

    Resolving it that way first is what makes the split change nothing about
    what any zone computes.
    """
    store = await _load(
        hass,
        hass_storage,
        zones=[_zone(0, mapping=5, module=99), _zone(1, mapping=5)],
        modules=[_module(1, forecast_days=3), _module(99, forecast_days=0)],
        mappings=[_mapping(5, module=1)],
    )

    modules = {m[const.MODULE_ID]: m for m in await store.async_get_modules()}
    for zone_id in (0, 1):
        module_id = store.get_zone(zone_id)[const.ZONE_MODULE]
        assert modules[module_id][const.MODULE_CONFIG]["forecast_days"] == 3


@pytest.mark.asyncio
async def test_a_zone_without_an_engine_is_left_alone(hass, hass_storage):
    store = await _load(hass, hass_storage, zones=[_zone(0)], modules=[_module(1)])

    assert store.get_zone(0)[const.ZONE_MODULE] is None


@pytest.mark.asyncio
async def test_an_engine_that_is_not_there_any_more_is_not_copied(hass, hass_storage):
    store = await _load(hass, hass_storage, zones=[_zone(0, module=42)], modules=[])

    assert store.get_zone(0)[const.ZONE_MODULE] == 42
    assert await store.async_get_modules() == []


@pytest.mark.asyncio
async def test_it_happens_once(hass, hass_storage):
    """A second load must not copy the copies."""
    store = await _load(
        hass,
        hass_storage,
        zones=[_zone(0, module=1), _zone(1, module=1)],
        modules=[_module(1)],
    )
    await store.async_save()
    count = len(await store.async_get_modules())

    again = SmartIrrigationStorage(hass)
    await again.async_load()

    assert len(await again.async_get_modules()) == count
    assert again.config.zone_engines_split is True


@pytest.mark.asyncio
async def test_a_fresh_install_has_nothing_to_split(hass, hass_storage):
    store = await _load(hass, hass_storage, zones=[], modules=[])

    assert store.config.zone_engines_split is True
    assert await store.async_get_modules() == []
