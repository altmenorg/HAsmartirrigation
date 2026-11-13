"""A restore removes the zones the backup leaves out, entities and all.

UX walk of 13 Nov. (Q4): a backup of three zones was restored over four. The
fourth zone's device and entities stayed, "unavailable", and the restore set
the id counter back to the backup's. The next zone added took the fourth one's
id again and with it its entities: a new zone "Beet" came with
``sensor.smart_irrigation_zweite_probe``, the entity id of a zone two names
before it.
"""

from unittest.mock import AsyncMock, Mock

import pytest

from custom_components.smart_irrigation import const, websockets
from custom_components.smart_irrigation.store import SmartIrrigationStorage

pytestmark = pytest.mark.filterwarnings(
    "ignore:coroutine .* was never awaited:RuntimeWarning"
)


async def _store_with(hass, count):
    store = SmartIrrigationStorage(hass)
    await store.async_load()
    for n in range(count):
        await store.async_create_zone({const.ZONE_NAME: f"Zone {n}"})
    return store


async def test_a_restore_never_hands_out_an_id_again(hass, hass_storage):
    store = await _store_with(hass, 3)
    backup = await store.async_export()
    await store.async_create_zone({const.ZONE_NAME: "Wegwerf"})
    assert store.config.last_zone_id == 3

    await store.async_import(backup)

    assert sorted(store.zones) == [0, 1, 2]
    assert store.config.last_zone_id == 3
    created = await store.async_create_zone({const.ZONE_NAME: "Beet"})
    assert created[const.ZONE_ID] == 4


async def test_a_backup_with_higher_ids_keeps_them(hass, hass_storage):
    other = await _store_with(hass, 6)
    backup = await other.async_export()
    hass_storage.clear()
    store = await _store_with(hass, 1)

    await store.async_import(backup)

    assert store.config.last_zone_id == 5


def _request(backup):
    hass = Mock()

    async def body():
        return backup

    request = type(
        "_Request",
        (dict,),
        {"app": {"hass": hass}, "json": staticmethod(body), "query": {}},
    )({"hass_user": Mock(is_admin=True)})
    return request, hass


async def test_the_restore_removes_the_entities_of_the_zones_it_drops():
    coordinator = Mock()
    coordinator.store = Mock()
    coordinator.store.zones = {0: object(), 1: object(), 3: object()}

    async def restore(data):
        coordinator.store.zones = {z[const.ZONE_ID]: object() for z in data["zones"]}

    coordinator.store.async_import = AsyncMock(side_effect=restore)
    coordinator.async_remove_entity = AsyncMock()
    backup = {
        "config": {},
        "zones": [{const.ZONE_ID: 0}, {const.ZONE_ID: 1}],
        "modules": [],
        "mappings": [],
    }
    request, hass = _request(backup)
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    view = object.__new__(websockets.SmartIrrigationRestoreView)

    await view.post(request)

    coordinator.async_remove_entity.assert_awaited_once_with(3)
    hass.config_entries.async_reload.assert_called_once()
