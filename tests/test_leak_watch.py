"""Water counted with every valve closed (leak_watch.py)."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const, leak_watch


class _Coordinator(leak_watch.LeakWatchMixin):
    def __init__(self, limit=5.0):
        self.hass = MagicMock()
        self.clock = 1000.0
        self.hass.loop.time = lambda: self.clock
        self.states = {}
        self.hass.states.get = lambda entity_id: self.states.get(entity_id)
        zones = [
            {
                const.ZONE_ID: 0,
                const.ZONE_NAME: "Lawn",
                const.ZONE_LINKED_ENTITY: "valve.lawn",
                const.ZONE_FLOW_SENSOR: "sensor.meter",
            },
            {const.ZONE_ID: 1, const.ZONE_NAME: "Pots"},
        ]
        self.store = SimpleNamespace(
            config=SimpleNamespace(leak_alert_litres=limit),
            async_get_zones=AsyncMock(return_value=zones),
            get_zone=lambda zone_id: next(
                (z for z in zones if z[const.ZONE_ID] == zone_id), None
            ),
        )
        self._active_valve_runs = {}

    async def async_setup_observed_watering(self) -> None:  # not under test
        await self.async_setup_leak_watch()

    def _run_in_flight(self, zone_id):
        return False

    def meter(self, litres):
        self.states["sensor.meter"] = SimpleNamespace(
            state=str(litres), attributes={"unit_of_measurement": "L"}
        )

    def valve(self, state):
        self.states["valve.lawn"] = SimpleNamespace(state=state, attributes={})


@pytest.fixture(autouse=True)
def _quiet(monkeypatch):
    monkeypatch.setattr(leak_watch, "async_dispatcher_send", MagicMock())
    monkeypatch.setattr(leak_watch.ir, "async_create_issue", MagicMock())
    monkeypatch.setattr(leak_watch.ir, "async_delete_issue", MagicMock())
    monkeypatch.setattr(leak_watch, "async_call_later", MagicMock())
    monkeypatch.setattr(
        leak_watch,
        "async_track_state_change_event",
        MagicMock(return_value=MagicMock()),
    )


async def _watching(limit=5.0):
    c = _Coordinator(limit)
    c.meter(100)
    c.valve("closed")
    await c.async_setup_leak_watch()
    return c


def _changed(c, entity_id, state=None):
    c._leak_state_changed(
        SimpleNamespace(
            data={
                "entity_id": entity_id,
                "new_state": SimpleNamespace(state=state) if state else None,
            }
        )
    )


async def test_water_with_every_valve_closed_is_a_leak():
    c = await _watching()
    entities = leak_watch.async_track_state_change_event.call_args.args[1]
    assert set(entities) == {"sensor.meter", "valve.lawn"}

    c.meter(103)
    _changed(c, "sensor.meter")
    assert c.leaking_meters() == {}

    c.meter(106)
    _changed(c, "sensor.meter")

    assert c.leaking_meters() == {"sensor.meter": 6.0}
    fired = c.hass.bus.async_fire.call_args.args
    assert fired[0] == f"{const.DOMAIN}_{const.EVENT_LEAK}"
    assert fired[1]["zones"] == ["Lawn"]
    leak_watch.ir.async_create_issue.assert_called_once()


async def test_water_while_watering_or_just_after_is_not_a_leak():
    c = await _watching()

    c.valve("open")
    c.meter(150)
    _changed(c, "sensor.meter")
    assert c.leaking_meters() == {}

    _changed(c, "valve.lawn", "closed")
    c.valve("closed")
    c.clock += 60  # the pipe drains, the meter reports late
    c.meter(152)
    _changed(c, "sensor.meter")
    assert c.leaking_meters() == {}

    c.clock += leak_watch.SETTLE_SECONDS
    c.meter(158)
    _changed(c, "sensor.meter")
    assert c.leaking_meters() == {"sensor.meter": 6.0}


async def test_not_watched_at_zero_and_a_reset_meter_starts_again():
    off = await _watching(limit=0)
    leak_watch.async_track_state_change_event.assert_not_called()
    assert off.leaking_meters() == {}

    c = await _watching()
    c.meter(2)  # replaced or reset
    _changed(c, "sensor.meter")
    c.meter(4)
    _changed(c, "sensor.meter")
    assert c.leaking_meters() == {}


async def test_it_clears_once_the_meter_stands_still():
    c = await _watching()
    c.meter(110)
    _changed(c, "sensor.meter")
    assert c.leaking_meters()

    quiet = leak_watch.async_call_later.call_args.args[2]
    quiet(None)

    assert c.leaking_meters() == {}
    leak_watch.ir.async_delete_issue.assert_called_once()
