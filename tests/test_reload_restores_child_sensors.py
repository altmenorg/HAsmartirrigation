"""A reload has to bring every zone entity back, not most of them.

The per-zone child sensors (bucket, ET value, deficiency, drainage, last
irrigation, water used) are created once per zone behind an "already created"
guard, keyed by zone id in hass.data. The unload cleared the zone registry
beside it but never this one, so after a reload the guard still saw every
zone as done and returned early. The duration sensor came back and its six
children stayed unavailable until Home Assistant restarted (#845).

Restoring a backup reloads the entry itself, so it did the same. The report
behind this measured 52 of 58 entities gone after a restore, with a clean log.
"""

from unittest.mock import MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.sensor import _add_zone_child_sensors

ZONE = {"id": 1, "name": "Lawn"}


def _hass():
    hass = MagicMock()
    hass.data = {const.DOMAIN: {"zones": {}}}
    return hass


def _unloadable(hass):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = hass
    coordinator._subscriptions = []
    coordinator._track_irrigation_triggers_unsub = []
    coordinator._debounced_update_cancel = {}
    coordinator.async_teardown_observed_watering = MagicMock()
    coordinator.async_teardown_valve_runs = MagicMock()
    return coordinator


def _created(add_devices):
    return sum(len(call.args[0]) for call in add_devices.call_args_list)


@pytest.mark.asyncio
async def test_the_child_sensors_come_back_after_a_reload():
    """The bug, stated as a test: same count before and after a reload."""
    hass = _hass()
    first = MagicMock()
    _add_zone_child_sensors(hass, first, ZONE)
    created_at_setup = _created(first)
    assert created_at_setup, "the zone should have child sensors to lose"

    await _unloadable(hass).async_unload()

    again = MagicMock()
    _add_zone_child_sensors(hass, again, ZONE)

    assert _created(again) == created_at_setup


def test_within_one_setup_a_zone_still_gets_them_once():
    """The guard exists for a reason: without it a zone got them twice."""
    hass = _hass()
    add_devices = MagicMock()

    _add_zone_child_sensors(hass, add_devices, ZONE)
    _add_zone_child_sensors(hass, add_devices, ZONE)

    assert add_devices.call_count == 1
