"""A zone without a calculation engine gets the one its card shows (#907).

A zone added on the zones page was saved without an engine, and a sensor group
created by hand has none to lend it. Nothing could ever calculate such a zone,
while its card said "calculated from the weather", which is what the panel
shows for a zone without one. The nightly run then logged that the zone's
evapotranspiration was "provided" and missing from its group, which sent the
reporter looking for a source they had never configured.

Such a zone is now bound to the method its card showed: when it is created,
and at startup for the zones created before.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.engine_binding import (
    METHOD_FROM_WEATHER,
    EngineBindingMixin,
    zone_has_engine,
)
from custom_components.smart_irrigation.websockets import SmartIrrigationZoneView

PYETO = {const.MODULE_ID: 0, const.MODULE_NAME: "PyETO", const.MODULE_CONFIG: {}}


def _zone(zone_id, mapping=1, module=None):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_MAPPING: mapping,
        const.ZONE_MODULE: module,
    }


def _store(zones, modules=(PYETO,), mappings=None):
    """A store answering for these zones, engines and groups."""
    modules = {m[const.MODULE_ID]: m for m in modules}
    mappings = mappings or {1: {const.MAPPING_ID: 1, const.MAPPING_MODULE: None}}
    store = MagicMock()
    store.async_get_zones = AsyncMock(return_value=list(zones))
    store.get_module = MagicMock(side_effect=modules.get)
    store.get_mapping = MagicMock(side_effect=mappings.get)
    return store


# --- what "has an engine" means ----------------------------------------------


def test_the_reported_setup_has_no_engine():
    """Every zone and the group without one, as in the reporter's diagnostics."""
    assert not zone_has_engine(_store([]), _zone(1))


def test_a_zone_s_own_engine_counts():
    assert zone_has_engine(_store([]), _zone(1, module=0))


def test_an_engine_borrowed_from_the_group_counts():
    """That is how installations set up before every zone had its own are
    calculated, and they must not be rebound."""
    store = _store([], mappings={1: {const.MAPPING_ID: 1, const.MAPPING_MODULE: 0}})

    assert zone_has_engine(store, _zone(1))


def test_an_engine_that_is_not_there_any_more_does_not_count():
    assert not zone_has_engine(_store([]), _zone(1, module=42))


def test_the_first_zone_and_the_first_group_are_not_nothing():
    """Id 0, the case that broke every default installation once (#846)."""
    store = _store([], mappings={0: {const.MAPPING_ID: 0, const.MAPPING_MODULE: 0}})

    assert zone_has_engine(store, _zone(0, mapping=0))


# --- the repair at startup ---------------------------------------------------


def _coordinator(zones, **kwargs):
    class _Coordinator(EngineBindingMixin):
        pass

    coordinator = _Coordinator()
    coordinator.store = _store(zones, **kwargs)
    coordinator.async_set_zone_method = AsyncMock(return_value=7)
    return coordinator


async def test_every_zone_without_an_engine_is_bound_to_the_weather():
    zones = [_zone(i) for i in range(6)]
    coordinator = _coordinator(zones)

    assert await coordinator.async_bind_engineless_zones() == list(range(6))
    for zone_id in range(6):
        coordinator.async_set_zone_method.assert_any_await(zone_id, METHOD_FROM_WEATHER)


async def test_a_zone_that_has_an_engine_is_left_alone():
    coordinator = _coordinator([_zone(0, module=0), _zone(1)])

    assert await coordinator.async_bind_engineless_zones() == [1]
    coordinator.async_set_zone_method.assert_awaited_once_with(1, METHOD_FROM_WEATHER)


async def test_the_zones_to_bind_are_chosen_before_any_is_bound():
    """Binding a zone lets its group adopt that engine. Looking again after
    the first one would find the next zone of the group "has" one, and leave
    it sharing the first zone's engine instead of getting its own."""
    mappings = {1: {const.MAPPING_ID: 1, const.MAPPING_MODULE: None}}
    coordinator = _coordinator([_zone(0), _zone(1)], mappings=mappings)

    async def _bind(zone_id, method):
        mappings[1][const.MAPPING_MODULE] = 0
        return 0

    coordinator.async_set_zone_method = AsyncMock(side_effect=_bind)

    assert await coordinator.async_bind_engineless_zones() == [0, 1]


async def test_nothing_to_repair_binds_nothing():
    coordinator = _coordinator([_zone(0, module=0)])

    assert await coordinator.async_bind_engineless_zones() == []
    coordinator.async_set_zone_method.assert_not_awaited()


# --- the calculation says what is wrong ---------------------------------------


async def test_the_calculation_says_the_zone_has_no_engine():
    calc = CalculationMixin()
    calc.store = _store([])
    calc.store.get_zone = MagicMock(return_value=_zone(1))
    calc.calculate_module = AsyncMock()

    with patch("custom_components.smart_irrigation.calculation._LOGGER") as logger:
        assert await calc.async_calculate_zone(1, {"Temperature": 20.0}) is None

    message = logger.warning.call_args.args[0]
    assert "no calculation engine" in message
    assert "provided" not in message
    calc.calculate_module.assert_not_awaited()


# --- a zone added on the zones page ------------------------------------------


async def _create(new_zone, store, data=None):
    """Post a new zone (no id) the way the zones page does."""
    coordinator = MagicMock()
    coordinator.store = store
    coordinator.store.get_zone = MagicMock(return_value=new_zone)
    coordinator.store.zones = {new_zone[const.ZONE_ID]: new_zone}
    coordinator.async_update_zone_config = AsyncMock(return_value=None)
    coordinator.async_set_zone_method = AsyncMock(return_value=0)
    coordinator.module_id_for_zone = MagicMock(
        side_effect=lambda z: (
            z.get(const.ZONE_MODULE)
            if z.get(const.ZONE_MODULE) is not None
            else (store.get_mapping(z.get(const.ZONE_MAPPING)) or {}).get(
                const.MAPPING_MODULE
            )
        )
    )
    hass = MagicMock()
    hass.config.units = METRIC_SYSTEM
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    request = MagicMock()
    request.app = {"hass": hass}
    request.json = AsyncMock(
        return_value=dict(data or {const.ZONE_NAME: "Top Right", const.ZONE_SIZE: 29})
    )
    view = SmartIrrigationZoneView()
    view.json = MagicMock(return_value={"success": True})
    with patch("custom_components.smart_irrigation.websockets.async_dispatcher_send"):
        await view.post(request)
    return coordinator


@pytest.mark.asyncio
async def test_a_new_zone_is_calculated_from_the_weather():
    coordinator = await _create(_zone(3), _store([]))

    coordinator.async_set_zone_method.assert_awaited_once_with(
        3, METHOD_FROM_WEATHER, None
    )


@pytest.mark.asyncio
async def test_a_new_zone_borrowing_its_group_s_engine_gets_its_own_alike():
    """The kind and the options of the group's engine, so nothing changes
    about what it computes."""
    static = {
        const.MODULE_ID: 2,
        const.MODULE_NAME: "Static",
        const.MODULE_CONFIG: {"delta": 3.0},
    }
    store = _store(
        [],
        modules=(static,),
        mappings={1: {const.MAPPING_ID: 1, const.MAPPING_MODULE: 2}},
    )

    coordinator = await _create(_zone(3), store)

    coordinator.async_set_zone_method.assert_awaited_once_with(
        3, "fixed", {"delta": 3.0}
    )


@pytest.mark.asyncio
async def test_a_new_zone_on_an_engine_we_do_not_know_is_left_alone():
    other = {const.MODULE_ID: 2, const.MODULE_NAME: "SomebodyElses"}
    store = _store(
        [],
        modules=(other,),
        mappings={1: {const.MAPPING_ID: 1, const.MAPPING_MODULE: 2}},
    )

    coordinator = await _create(_zone(3), store)

    coordinator.async_set_zone_method.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_save_of_an_existing_zone_binds_nothing():
    coordinator = await _create(
        _zone(3), _store([]), data={const.ZONE_ID: 3, const.ZONE_NAME: "Renamed"}
    )

    coordinator.async_set_zone_method.assert_not_awaited()
