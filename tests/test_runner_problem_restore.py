"""A zone's problem lamp survives a restart.

It is latched until the next successful run, and a restart is not one: a valve
that did not close last night used to show no problem after a restart this
morning.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

from homeassistant.core import State

from custom_components.smart_irrigation import binary_sensor as bs_mod
from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.binary_sensor import (
    SmartIrrigationZoneProblemBinarySensor,
)


def _sensor(monkeypatch, last_state):
    monkeypatch.setattr(
        bs_mod, "async_dispatcher_connect", lambda *args, **kwargs: Mock()
    )
    hass = Mock()
    hass.data = {
        const.DOMAIN: {"coordinator": SimpleNamespace(store=Mock())},
    }
    hass.bus.async_listen = Mock(return_value=Mock())
    sensor = SmartIrrigationZoneProblemBinarySensor(
        hass, "binary_sensor.zone_problem", 1, "Zone"
    )
    sensor.async_get_last_state = AsyncMock(return_value=last_state)
    sensor.async_write_ha_state = Mock()
    return sensor


async def test_a_problem_on_before_the_restart_is_on_after_it(monkeypatch):
    sensor = _sensor(
        monkeypatch,
        State("binary_sensor.zone_problem", "on", {"reason": "valve_did_not_close"}),
    )

    await sensor.async_added_to_hass()

    assert sensor.is_on is True
    assert sensor.extra_state_attributes["reason"] == "valve_did_not_close"


async def test_no_problem_before_the_restart_is_none_after_it(monkeypatch):
    sensor = _sensor(monkeypatch, State("binary_sensor.zone_problem", "off"))

    await sensor.async_added_to_hass()

    assert sensor.is_on is False
    assert sensor.extra_state_attributes["reason"] is None


async def test_a_first_start_has_no_problem(monkeypatch):
    sensor = _sensor(monkeypatch, None)

    await sensor.async_added_to_hass()

    assert sensor.is_on is False


async def test_a_restored_problem_still_clears_on_the_next_good_run(monkeypatch):
    sensor = _sensor(
        monkeypatch, State("binary_sensor.zone_problem", "on", {"reason": "no_flow"})
    )
    await sensor.async_added_to_hass()

    sensor._async_run_ok(1)

    assert sensor.is_on is False
    assert sensor.extra_state_attributes["reason"] is None
