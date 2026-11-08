"""A zone added under the id of one just deleted gets all its entities.

A new zone takes the highest id plus one, so deleting the last zone and adding
another reuses the id. Each entity platform skips a zone it has "already
created"; the deletion forgot the child sensors and binary sensors, but not the
buttons or the multiplier, so the new zone had neither until a restart.
"""

import asyncio
from unittest.mock import Mock, patch

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const

KINDS = (
    "zone_child_sensors",
    "zone_binary_sensors",
    "zone_buttons",
    "multiplier_numbers",
)


def test_deleting_a_zone_forgets_every_kind_of_its_entities():
    hass = Mock()
    hass.data = {
        const.DOMAIN: {
            "zones": {},
            **{kind: {3: ["of the deleted zone"], 4: ["kept"]} for kind in KINDS},
        }
    }
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = hass
    coordinator.id = "abc123"

    with (
        patch("custom_components.smart_irrigation.er.async_get"),
        patch("custom_components.smart_irrigation.dr.async_get"),
        patch(
            "custom_components.smart_irrigation.device_by_identifier",
            return_value=None,
        ),
    ):
        asyncio.run(coordinator.async_remove_entity(3))

    for kind in KINDS:
        assert 3 not in hass.data[const.DOMAIN][kind], kind
        assert hass.data[const.DOMAIN][kind][4] == ["kept"], kind


async def test_a_deleted_zones_id_is_not_given_again(hass):
    from custom_components.smart_irrigation.store import SmartIrrigationStorage

    store = SmartIrrigationStorage(hass)
    store.async_schedule_save = Mock()
    first = await store.async_create_zone({const.ZONE_NAME: "Lawn"})
    second = await store.async_create_zone({const.ZONE_NAME: "Hedge"})
    assert (first[const.ZONE_ID], second[const.ZONE_ID]) == (0, 1)

    await store.async_delete_zone(1)
    third = await store.async_create_zone({const.ZONE_NAME: "Bed"})

    assert third[const.ZONE_ID] == 2
    assert store.config.last_zone_id == 2


async def test_the_highest_id_survives_a_restart(hass):
    from custom_components.smart_irrigation.store import SmartIrrigationStorage

    store = SmartIrrigationStorage(hass)
    store.async_schedule_save = Mock()
    await store.async_create_zone({const.ZONE_NAME: "Lawn"})
    await store.async_create_zone({const.ZONE_NAME: "Hedge"})
    await store.async_delete_zone(1)
    saved = store._data_to_save()
    assert saved["config"][const.CONF_LAST_ZONE_ID] == 1

    again = SmartIrrigationStorage(hass)
    again.async_schedule_save = Mock()
    await again.async_import(saved)
    created = await again.async_create_zone({const.ZONE_NAME: "Bed"})

    assert created[const.ZONE_ID] == 2


async def test_an_install_from_before_gives_ids_as_it_did(hass):
    """No highest id stored yet: the highest in use plus one, as before."""
    from custom_components.smart_irrigation.store import SmartIrrigationStorage

    store = SmartIrrigationStorage(hass)
    store.async_schedule_save = Mock()
    await store.async_create_zone({const.ZONE_NAME: "Lawn"})
    store.config = store.config.__class__(
        **{**store._data_to_save()["config"], const.CONF_LAST_ZONE_ID: None}
    )

    created = await store.async_create_zone({const.ZONE_NAME: "Hedge"})

    assert created[const.ZONE_ID] == 1
