"""A zone's options the form does not show survive the panel's form edits.

``safety_off_state_key`` (the MQTT state key, YAML only) and ``open_resends``
(the open sent again, a field of the advanced mode only) are set with Edit in
YAML otherwise. The form sends only what an edit changed, so a save that does not carry them,
or carries them unchanged (the YAML editor applied as it opened), must keep
them as they are.
"""

from types import SimpleNamespace
from unittest.mock import patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation import websockets as ws
from custom_components.smart_irrigation.store import SmartIrrigationStorage

YAML_ONLY = {
    const.ZONE_SAFETY_OFF_STATE_KEY: "state_l2",
    const.ZONE_OPEN_RESENDS: 0,
}


async def _saved_zone(hass):
    store = SmartIrrigationStorage(hass)
    await store.async_load()
    created = await store.async_create_zone(
        {
            const.ZONE_NAME: "Lawn",
            const.ZONE_SIZE: 50.0,
            const.ZONE_THROUGHPUT: 10.0,
            const.ZONE_STATE: const.ZONE_STATE_MANUAL,
            const.ZONE_SAFETY_OFF_TOPIC: "zigbee2mqtt/lawn/set",
            **YAML_ONLY,
        }
    )

    async def update(zone_id, data):
        # What the coordinator does with a plain edit: the store merges it.
        return await store.async_update_zone(zone_id, data)

    coordinator = SimpleNamespace(store=store, async_update_zone_config=update)
    hass.data[const.DOMAIN] = {"coordinator": coordinator}
    hass.config.units = METRIC_SYSTEM
    return store, created[const.ZONE_ID]


async def _save(hass, data):
    with (
        patch.object(ws, "_zone_method", return_value=None),
        patch.object(ws, "async_dispatcher_send"),
    ):
        return await ws.async_save_zone(hass, ws.ZONE_SAVE_SCHEMA(data))


@pytest.mark.asyncio
async def test_a_form_edit_of_another_field_keeps_them(hass):
    store, zone_id = await _saved_zone(hass)

    saved, error = await _save(hass, {const.ZONE_ID: zone_id, const.ZONE_SIZE: 60})

    assert (saved, error) == (zone_id, None)
    zone = store.get_zone(zone_id)
    assert zone[const.ZONE_SIZE] == 60
    for key, value in YAML_ONLY.items():
        assert zone[key] == value


@pytest.mark.asyncio
async def test_a_save_sending_them_unchanged_keeps_them(hass):
    store, zone_id = await _saved_zone(hass)

    await _save(hass, {const.ZONE_ID: zone_id, const.ZONE_NAME: "Lawn", **YAML_ONLY})

    zone = store.get_zone(zone_id)
    for key, value in YAML_ONLY.items():
        assert zone[key] == value


@pytest.mark.asyncio
async def test_the_yaml_editor_can_change_and_clear_them(hass):
    store, zone_id = await _saved_zone(hass)

    await _save(
        hass,
        {
            const.ZONE_ID: zone_id,
            const.ZONE_SAFETY_OFF_STATE_KEY: None,
            const.ZONE_OPEN_RESENDS: 3,
        },
    )

    zone = store.get_zone(zone_id)
    assert zone[const.ZONE_SAFETY_OFF_STATE_KEY] is None
    assert zone[const.ZONE_OPEN_RESENDS] == 3
