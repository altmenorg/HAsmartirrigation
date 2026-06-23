"""Tests for the observed-watering closed-loop bucket crediting."""

import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import homeassistant.util.dt as dt_util
import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.observed_watering import ObservedWateringMixin


class _Coordinator(ObservedWateringMixin):
    """Minimal host exposing the mixin's collaborators (store, hass)."""

    def __init__(self, hass, store):
        self.hass = hass
        self.store = store
        self._observed_unsub = None
        self._observed_entities = frozenset()
        self._observed_on_since = {}
        self._observed_flow_start = {}
        self._observed_zone_by_entity = {}


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    """Neutralise the real HA dispatcher so the credit path needs no live hass."""
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


def _make_hass(metric=True):
    """A hass double whose async_create_task captures the scheduled coroutine."""
    hass = Mock()
    hass.config = Mock()
    hass.config.units = METRIC_SYSTEM if metric else Mock()
    created = []
    hass.async_create_task = lambda coro: created.append(coro) or coro
    hass.created_tasks = created
    return hass


def _zone(**overrides):
    zone = {
        const.ZONE_ID: 0,
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_BUCKET: -3.0,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
        const.ZONE_LINKED_ENTITY: "switch.valve",
    }
    zone.update(overrides)
    return zone


def _make_store(zone, *, enabled=True):
    store = Mock()
    store.config = SimpleNamespace(observed_watering_enabled=enabled)
    store.get_zone = Mock(return_value=zone)
    store.async_update_zone = AsyncMock()
    store.async_get_zones = AsyncMock(return_value=[zone] if zone else [])
    return store


def _sensor_state(value, unit):
    return SimpleNamespace(
        state=value, attributes={"unit_of_measurement": unit}
    )


def _open_event(entity="switch.valve"):
    e = Mock()
    e.data = {
        "entity_id": entity,
        "old_state": SimpleNamespace(state="off"),
        "new_state": SimpleNamespace(state="on"),
    }
    return e


def _close_event(entity="switch.valve"):
    e = Mock()
    e.data = {
        "entity_id": entity,
        "old_state": SimpleNamespace(state="on"),
        "new_state": SimpleNamespace(state="off"),
    }
    return e


async def test_credit_metric_math():
    """5 min at 10 L/min over 50 m2 == 1.0 mm; bucket -3 -> -2."""
    zone = _zone()
    coord = _Coordinator(_make_hass(), _make_store(zone))

    await coord._credit_observed_watering(0, 300)

    coord.store.async_update_zone.assert_awaited_once()
    args = coord.store.async_update_zone.await_args.args
    assert args[0] == 0
    assert args[1][const.ZONE_BUCKET] == pytest.approx(-2.0)


async def test_credit_clamps_to_maximum_bucket():
    """A run that would overshoot the surplus ceiling is clamped."""
    zone = _zone(bucket=23.5)
    coord = _Coordinator(_make_hass(), _make_store(zone))

    # 300 s -> +1.0 mm would land at 24.5, above the 24.0 ceiling.
    await coord._credit_observed_watering(0, 300)

    args = coord.store.async_update_zone.await_args.args
    assert args[1][const.ZONE_BUCKET] == pytest.approx(24.0)


async def test_no_credit_without_throughput():
    """A zone with no throughput cannot be credited (no depth estimate)."""
    zone = _zone(throughput=0.0)
    coord = _Coordinator(_make_hass(), _make_store(zone))

    await coord._credit_observed_watering(0, 300)

    coord.store.async_update_zone.assert_not_awaited()


async def test_no_credit_for_zero_seconds():
    """A zero-length run is a no-op."""
    zone = _zone()
    coord = _Coordinator(_make_hass(), _make_store(zone))

    await coord._credit_observed_watering(0, 0)

    coord.store.async_update_zone.assert_not_awaited()


async def test_open_then_close_credits_the_run():
    """A valve opening then closing schedules a bucket credit."""
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store(zone))
    coord._observed_zone_by_entity = {"switch.valve": 0}

    # Valve opens (off -> on): the run start is recorded.
    open_event = Mock()
    open_event.data = {
        "entity_id": "switch.valve",
        "old_state": SimpleNamespace(state="off"),
        "new_state": SimpleNamespace(state="on"),
    }
    coord._observed_state_changed(open_event)
    assert 0 in coord._observed_on_since

    # Pretend the valve has been open for 5 minutes.
    coord._observed_on_since[0] = dt_util.utcnow() - datetime.timedelta(seconds=300)

    # Valve closes (on -> off): a credit coroutine is scheduled and run.
    close_event = Mock()
    close_event.data = {
        "entity_id": "switch.valve",
        "old_state": SimpleNamespace(state="on"),
        "new_state": SimpleNamespace(state="off"),
    }
    coord._observed_state_changed(close_event)
    assert 0 not in coord._observed_on_since
    assert hass.created_tasks, "a credit task should have been scheduled"

    await hass.created_tasks[0]
    coord.store.async_update_zone.assert_awaited_once()
    args = coord.store.async_update_zone.await_args.args
    # ~1 mm applied over 5 min -> bucket -3 rises toward -2.
    assert args[1][const.ZONE_BUCKET] == pytest.approx(-2.0, abs=0.05)


async def test_unrelated_entity_is_ignored():
    """State changes for entities no zone links to are dropped."""
    coord = _Coordinator(_make_hass(), _make_store(_zone()))
    coord._observed_zone_by_entity = {"switch.valve": 0}

    event = Mock()
    event.data = {
        "entity_id": "switch.other",
        "old_state": SimpleNamespace(state="off"),
        "new_state": SimpleNamespace(state="on"),
    }
    coord._observed_state_changed(event)

    assert coord._observed_on_since == {}


async def test_setup_subscribes_when_enabled(monkeypatch):
    """Enabling the feature subscribes to each zone's linked valve."""
    captured = {}

    def fake_track(hass, entities, handler):
        captured["entities"] = list(entities)
        return Mock(name="unsub")

    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering."
        "async_track_state_change_event",
        fake_track,
    )

    coord = _Coordinator(_make_hass(), _make_store(_zone(), enabled=True))
    await coord.async_setup_observed_watering()

    assert coord._observed_unsub is not None
    assert captured["entities"] == ["switch.valve"]
    assert coord._observed_zone_by_entity == {"switch.valve": 0}


async def test_metered_volume_credits_measured_delta():
    """A flow meter that advances 50 L over a 50 m2 zone credits 1.0 mm."""
    zone = _zone(flow_sensor="sensor.water")
    hass = _make_hass()
    states = {}
    hass.states.get = lambda eid: states.get(eid)
    coord = _Coordinator(hass, _make_store(zone))
    coord._observed_zone_by_entity = {"switch.valve": 0}

    states["sensor.water"] = _sensor_state("100.0", "L")
    coord._observed_state_changed(_open_event())
    assert coord._observed_flow_start[0] == 100.0

    states["sensor.water"] = _sensor_state("150.0", "L")
    coord._observed_state_changed(_close_event())
    assert hass.created_tasks, "a credit task should have been scheduled"

    await hass.created_tasks[0]
    args = coord.store.async_update_zone.await_args.args
    assert args[1][const.ZONE_BUCKET] == pytest.approx(-2.0)


async def test_metered_volume_in_cubic_metres():
    """A meter in m3 is converted to litres (0.05 m3 == 50 L == 1.0 mm)."""
    zone = _zone(flow_sensor="sensor.water")
    hass = _make_hass()
    states = {}
    hass.states.get = lambda eid: states.get(eid)
    coord = _Coordinator(hass, _make_store(zone))
    coord._observed_zone_by_entity = {"switch.valve": 0}

    states["sensor.water"] = _sensor_state("1.00", "m³")
    coord._observed_state_changed(_open_event())
    states["sensor.water"] = _sensor_state("1.05", "m³")
    coord._observed_state_changed(_close_event())

    await hass.created_tasks[0]
    args = coord.store.async_update_zone.await_args.args
    assert args[1][const.ZONE_BUCKET] == pytest.approx(-2.0)


async def test_meter_reset_falls_back_to_throughput():
    """A meter reading that drops mid-run (reset) is ignored; time is used."""
    zone = _zone(flow_sensor="sensor.water")
    hass = _make_hass()
    states = {}
    hass.states.get = lambda eid: states.get(eid)
    coord = _Coordinator(hass, _make_store(zone))
    coord._observed_zone_by_entity = {"switch.valve": 0}

    states["sensor.water"] = _sensor_state("150.0", "L")
    coord._observed_state_changed(_open_event())
    # Pretend the valve ran for 5 minutes (throughput fallback path).
    coord._observed_on_since[0] = dt_util.utcnow() - datetime.timedelta(seconds=300)
    # Meter has reset to a lower value -> no usable delta.
    states["sensor.water"] = _sensor_state("5.0", "L")
    coord._observed_state_changed(_close_event())

    await hass.created_tasks[0]
    # Fallback still credits ~1 mm from throughput x time.
    args = coord.store.async_update_zone.await_args.args
    assert args[1][const.ZONE_BUCKET] == pytest.approx(-2.0, abs=0.05)


def test_volume_to_litres_units():
    """Volume unit conversion covers the common meter units."""
    coord = _Coordinator(_make_hass(metric=True), _make_store(_zone()))
    assert coord._volume_to_litres(10, "L") == pytest.approx(10.0)
    assert coord._volume_to_litres(2, "m³") == pytest.approx(2000.0)
    assert coord._volume_to_litres(1, "gal") == pytest.approx(3.785411784)
    # No unit in metric -> assume litres.
    assert coord._volume_to_litres(5, None) == pytest.approx(5.0)
    # Unknown unit -> assume native (litres in metric).
    assert coord._volume_to_litres(5, "widgets") == pytest.approx(5.0)


def test_volume_to_litres_imperial_default():
    """With no unit in imperial, a reading is assumed to be gallons."""
    coord = _Coordinator(_make_hass(metric=False), _make_store(_zone()))
    assert coord._volume_to_litres(1, None) == pytest.approx(3.785411784)


def test_read_volume_litres_unavailable_returns_none():
    """An unavailable or non-numeric meter yields no reading."""
    hass = _make_hass()
    states = {"sensor.water": _sensor_state("unavailable", "L")}
    hass.states.get = lambda eid: states.get(eid)
    coord = _Coordinator(hass, _make_store(_zone()))
    assert coord._read_volume_litres("sensor.water") is None
    assert coord._read_volume_litres("sensor.missing") is None


async def test_setup_disabled_tears_down(monkeypatch):
    """A previously-active subscription is removed when the feature is off."""
    unsub = Mock()

    def fake_track(hass, entities, handler):
        return unsub

    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering."
        "async_track_state_change_event",
        fake_track,
    )

    coord = _Coordinator(_make_hass(), _make_store(_zone(), enabled=True))
    await coord.async_setup_observed_watering()
    assert coord._observed_unsub is not None

    # Disable and re-run: the subscription is torn down.
    coord.store.config.observed_watering_enabled = False
    await coord.async_setup_observed_watering()

    unsub.assert_called_once()
    assert coord._observed_unsub is None
    assert coord._observed_entities == frozenset()
