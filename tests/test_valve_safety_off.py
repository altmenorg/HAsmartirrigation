"""The MQTT dead-man of direct valve control (#877).

The topic and the state key are per-zone settings, so they have to survive a
restart: zones are rebuilt from the stored file field by field, and a field
missing from that list silently disables the safety after the first reboot.
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import SmartIrrigationStorage
from custom_components.smart_irrigation.valve_runner import ValveRunnerMixin

STORED = {
    const.ZONE_ID: 1,
    const.ZONE_NAME: "Lawn",
    const.ZONE_SIZE: 50.0,
    const.ZONE_THROUGHPUT: 10.0,
    const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
    const.ZONE_DELTA: -2.0,
    const.ZONE_BUCKET: -2.0,
    const.ZONE_DURATION: 600,
    const.ZONE_MODULE: 1,
    const.ZONE_MULTIPLIER: 1.0,
    const.ZONE_MAPPING: 1,
    const.ZONE_LEAD_TIME: 0.0,
}


async def _reload(stored_zone):
    storage = SmartIrrigationStorage.__new__(SmartIrrigationStorage)
    storage.hass = MagicMock()
    storage.hass.config.units = METRIC_SYSTEM
    await storage._populate_from_data(
        {"config": {}, "zones": [stored_zone], "modules": [], "mappings": []}
    )
    return storage.zones[1]


@pytest.mark.asyncio
async def test_the_topic_and_the_state_key_survive_a_restart():
    zone = await _reload(
        {
            **STORED,
            const.ZONE_SAFETY_OFF_TOPIC: "zigbee2mqtt/valve/set",
            const.ZONE_SAFETY_OFF_STATE_KEY: "state_l2",
        }
    )

    assert zone.safety_off_topic == "zigbee2mqtt/valve/set"
    assert zone.safety_off_state_key == "state_l2"


@pytest.mark.asyncio
async def test_a_zone_stored_before_the_setting_still_loads():
    zone = await _reload(STORED)

    assert zone.safety_off_topic is None
    assert zone.safety_off_state_key is None


def _runner():
    class _Runner(ValveRunnerMixin):
        pass

    runner = _Runner()
    runner.hass = MagicMock()
    return runner


@pytest.mark.asyncio
async def test_the_device_is_told_to_switch_itself_off_after_the_pass():
    publish = AsyncMock()
    with patch("homeassistant.components.mqtt.async_publish", publish):
        await _runner()._arm_safety_off(
            {const.ZONE_SAFETY_OFF_TOPIC: "z2m/valve/set"}, 600.2
        )

    _hass, topic, payload = publish.call_args[0][:3]
    assert topic == "z2m/valve/set"
    # The pass rounded up, plus the margin that lands the device's own
    # auto-off just after Home Assistant's close.
    assert json.loads(payload) == {"state": "ON", "on_time": 601 + 30}


@pytest.mark.asyncio
async def test_a_multi_channel_device_gets_its_own_state_key():
    publish = AsyncMock()
    with patch("homeassistant.components.mqtt.async_publish", publish):
        await _runner()._arm_safety_off(
            {
                const.ZONE_SAFETY_OFF_TOPIC: "z2m/valve/set",
                const.ZONE_SAFETY_OFF_STATE_KEY: "state_l2",
            },
            60,
        )

    assert json.loads(publish.call_args[0][2]) == {"state_l2": "ON", "on_time": 90}


@pytest.mark.asyncio
async def test_without_a_topic_nothing_is_published():
    publish = AsyncMock()
    with patch("homeassistant.components.mqtt.async_publish", publish):
        await _runner()._arm_safety_off({}, 60)

    publish.assert_not_called()


@pytest.mark.asyncio
async def test_a_failing_publish_never_breaks_the_run():
    publish = AsyncMock(side_effect=RuntimeError("mqtt is not set up"))
    with patch("homeassistant.components.mqtt.async_publish", publish):
        await _runner()._arm_safety_off({const.ZONE_SAFETY_OFF_TOPIC: "t"}, 60)
