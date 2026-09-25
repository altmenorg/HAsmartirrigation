"""A zone says how it is calculated; the engine behind it is nobody's problem.

Setting a zone up used to mean creating a calculation engine first, choosing
it by the name of the algorithm behind it, and only then pointing a sensor
group and a zone at it. Nobody outside this repository knows what PyETO is.

A zone now asks for a method in plain terms, and the instance that implements
it is created or reused underneath. The engine still lives on the sensor
group, because what sources a group must provide depends on it, and that is
the part these tests pin down: the binding, and what happens when a group is
shared by zones calculated differently.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.engine_binding import (
    ENGINE_BY_METHOD,
    METHOD_FIXED,
    METHOD_FROM_WEATHER,
    METHOD_PROVIDED,
    EngineBindingMixin,
    method_of_engine,
)

TEMPLATES = [
    {"name": "PyETO", "description": "d", "config": {"coastal": False}, "schema": {}},
    {"name": "Passthrough", "description": "d", "config": {}, "schema": {}},
    {"name": "Static", "description": "d", "config": {"delta": 3.0}, "schema": {}},
]


def _coordinator(modules=None, zones=None):
    class _Coordinator(EngineBindingMixin):
        pass

    coordinator = _Coordinator()
    coordinator.store = MagicMock()
    coordinator.store.async_get_modules = AsyncMock(return_value=list(modules or []))
    coordinator.store.async_get_zones = AsyncMock(return_value=list(zones or []))
    coordinator.store.async_create_module = AsyncMock(
        side_effect=lambda data: {**data, const.MODULE_ID: 7}
    )
    coordinator.store.async_update_module = AsyncMock()
    coordinator.store.async_update_zone = AsyncMock()
    coordinator.store.async_update_mapping = AsyncMock()
    coordinator.async_get_all_modules = AsyncMock(return_value=TEMPLATES)
    return coordinator


def test_the_three_methods_name_no_algorithm():
    """The words on the left are ours; the ones on the right never show."""
    assert set(ENGINE_BY_METHOD) == {METHOD_FROM_WEATHER, METHOD_PROVIDED, METHOD_FIXED}
    assert ENGINE_BY_METHOD[METHOD_FROM_WEATHER] == "PyETO"
    assert method_of_engine("Static") == METHOD_FIXED
    assert method_of_engine("SomethingElse") is None


async def test_asking_for_a_method_creates_the_engine_it_needs():
    coordinator = _coordinator()

    module_id = await coordinator.async_module_for_method(METHOD_FROM_WEATHER)

    assert module_id == 7
    created = coordinator.store.async_create_module.call_args[0][0]
    assert created[const.MODULE_NAME] == "PyETO"


async def test_an_engine_that_is_already_there_is_reused():
    """Two identical engines are two places to change the same setting."""
    existing = {const.MODULE_ID: 2, const.MODULE_NAME: "PyETO", const.MODULE_CONFIG: {}}
    coordinator = _coordinator(modules=[existing])

    assert await coordinator.async_module_for_method(METHOD_FROM_WEATHER) == 2
    coordinator.store.async_create_module.assert_not_awaited()


async def test_the_method_s_own_options_reach_the_engine():
    coordinator = _coordinator()

    await coordinator.async_module_for_method(METHOD_FIXED, {"delta": 4.5})

    created = coordinator.store.async_create_module.call_args[0][0]
    assert created[const.MODULE_CONFIG]["delta"] == 4.5


async def test_options_update_the_engine_that_is_already_there():
    existing = {
        const.MODULE_ID: 2,
        const.MODULE_NAME: "Static",
        const.MODULE_CONFIG: {"delta": 3.0},
    }
    coordinator = _coordinator(modules=[existing])

    await coordinator.async_module_for_method(METHOD_FIXED, {"delta": 5.0})

    module_id, changes = coordinator.store.async_update_module.call_args[0]
    assert module_id == 2
    assert changes[const.MODULE_CONFIG]["delta"] == 5.0


async def test_an_unknown_method_changes_nothing():
    coordinator = _coordinator()

    assert await coordinator.async_module_for_method("teleportation") is None
    coordinator.store.async_create_module.assert_not_awaited()


async def test_an_engine_that_is_not_installed_changes_nothing():
    coordinator = _coordinator()
    coordinator.async_get_all_modules = AsyncMock(return_value=[])

    assert await coordinator.async_module_for_method(METHOD_PROVIDED) is None


def _zone(zone_id, mapping=1, module=None):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_MAPPING: mapping,
        const.ZONE_MODULE: module,
    }


async def test_the_zone_s_group_adopts_the_engine():
    """That is the model the calculation reads, and what lets the group's
    editor show the sources this engine needs."""
    coordinator = _coordinator(zones=[_zone(1)])
    coordinator.store.get_zone = MagicMock(return_value=_zone(1))

    await coordinator.async_set_zone_method(1, METHOD_FROM_WEATHER)

    coordinator.store.async_update_zone.assert_awaited_once_with(
        1, {const.ZONE_MODULE: 7}
    )
    mapping_id, changes = coordinator.store.async_update_mapping.call_args[0]
    assert mapping_id == 1
    assert changes[const.MAPPING_MODULE] == 7


async def test_a_group_shared_by_zones_calculated_alike_still_adopts_it():
    coordinator = _coordinator(zones=[_zone(1), _zone(2, module=7)])
    coordinator.store.get_zone = MagicMock(return_value=_zone(1))

    await coordinator.async_set_zone_method(1, METHOD_FROM_WEATHER)

    _mapping_id, changes = coordinator.store.async_update_mapping.call_args[0]
    assert changes[const.MAPPING_MODULE] == 7


async def test_a_group_shared_by_zones_calculated_differently_stays_undecided():
    """Its sources would be ambiguous, so each zone keeps its own engine, which
    is the fallback the calculation already has."""
    coordinator = _coordinator(zones=[_zone(1), _zone(2, module=99)])
    coordinator.store.get_zone = MagicMock(return_value=_zone(1))

    await coordinator.async_set_zone_method(1, METHOD_FROM_WEATHER)

    _mapping_id, changes = coordinator.store.async_update_mapping.call_args[0]
    assert changes[const.MAPPING_MODULE] is None
    # The zone itself still points at the engine it asked for.
    coordinator.store.async_update_zone.assert_awaited_once_with(
        1, {const.ZONE_MODULE: 7}
    )


async def test_a_zone_without_a_sensor_group_keeps_its_own_engine():
    coordinator = _coordinator(zones=[])
    coordinator.store.get_zone = MagicMock(return_value=_zone(1, mapping=None))

    assert await coordinator.async_set_zone_method(1, METHOD_PROVIDED) == 7
    coordinator.store.async_update_mapping.assert_not_awaited()


async def test_a_zone_that_does_not_exist_binds_nothing():
    coordinator = _coordinator()
    coordinator.store.get_zone = MagicMock(return_value=None)

    assert await coordinator.async_set_zone_method(9, METHOD_FIXED) is None
    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.parametrize(
    ("method", "engine"),
    [
        (METHOD_FROM_WEATHER, "PyETO"),
        (METHOD_PROVIDED, "Passthrough"),
        (METHOD_FIXED, "Static"),
    ],
)
async def test_each_method_binds_its_own_engine(method, engine):
    coordinator = _coordinator()
    coordinator.store.get_zone = MagicMock(return_value=_zone(1, mapping=None))

    await coordinator.async_set_zone_method(1, method)

    created = coordinator.store.async_create_module.call_args[0][0]
    assert created[const.MODULE_NAME] == engine


# --- one engine per zone ----------------------------------------------------


async def test_a_zone_keeps_its_own_engine_when_the_method_does_not_change():
    """Its options are its own, so they are updated in place."""
    own = {
        const.MODULE_ID: 4,
        const.MODULE_NAME: "PyETO",
        const.MODULE_CONFIG: {"forecast_days": 0},
    }
    coordinator = _coordinator(modules=[own])
    coordinator.store.get_zone = MagicMock(
        return_value={**_zone(1), const.ZONE_MODULE: 4}
    )
    coordinator.store.get_module = MagicMock(return_value=own)

    module_id = await coordinator.async_module_for_method(
        METHOD_FROM_WEATHER, {"forecast_days": 2}, zone_id=1
    )

    assert module_id == 4
    _id, changes = coordinator.store.async_update_module.call_args[0]
    assert changes[const.MODULE_CONFIG]["forecast_days"] == 2
    coordinator.store.async_create_module.assert_not_awaited()


async def test_another_zone_on_the_same_kind_of_engine_gets_its_own():
    """Otherwise a setting changed on one zone changes on the other."""
    other = {
        const.MODULE_ID: 4,
        const.MODULE_NAME: "PyETO",
        const.MODULE_CONFIG: {"forecast_days": 2},
    }
    coordinator = _coordinator(modules=[other])
    # Zone 2 has no engine of its own yet.
    coordinator.store.get_zone = MagicMock(return_value=_zone(2))
    coordinator.store.get_module = MagicMock(return_value=None)

    module_id = await coordinator.async_module_for_method(
        METHOD_FROM_WEATHER, None, zone_id=2
    )

    assert module_id == 7
    coordinator.store.async_create_module.assert_awaited_once()


async def test_changing_the_method_gives_the_zone_the_other_engine():
    own = {
        const.MODULE_ID: 4,
        const.MODULE_NAME: "PyETO",
        const.MODULE_CONFIG: {},
    }
    coordinator = _coordinator(modules=[own])
    coordinator.store.get_zone = MagicMock(
        return_value={**_zone(1), const.ZONE_MODULE: 4}
    )
    coordinator.store.get_module = MagicMock(return_value=own)

    module_id = await coordinator.async_module_for_method(
        METHOD_FIXED, {"delta": 2.0}, zone_id=1
    )

    assert module_id == 7
    created = coordinator.store.async_create_module.call_args[0][0]
    assert created[const.MODULE_NAME] == "Static"
    assert created[const.MODULE_CONFIG]["delta"] == 2.0
