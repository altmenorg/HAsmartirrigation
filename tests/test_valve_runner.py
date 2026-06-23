"""Tests for direct valve control (the optional executor)."""

import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import homeassistant.util.dt as dt_util
import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.observed_watering import ObservedWateringMixin
from custom_components.smart_irrigation.valve_runner import ValveRunnerMixin


class _Coordinator(ObservedWateringMixin, ValveRunnerMixin):
    """Minimal host exposing the runner's collaborators."""

    def __init__(self, hass, store):
        self.hass = hass
        self.store = store
        self._si_driven_until = {}
        self._active_valve_runs = {}
        self._valve_run_tasks = set()


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


@pytest.fixture(autouse=True)
def _no_sleep(monkeypatch):
    """Make asyncio.sleep in the runner a no-op so timed runs return instantly."""
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep",
        AsyncMock(),
    )


def _make_hass(metric=True):
    hass = Mock()
    hass.config = Mock()
    hass.config.units = METRIC_SYSTEM if metric else Mock()
    hass.loop = Mock()
    hass.loop.time = lambda: 1000.0
    hass.services = Mock()
    hass.services.async_call = AsyncMock()
    return hass


def _zone(**overrides):
    zone = {
        const.ZONE_ID: 0,
        const.ZONE_NAME: "Zone",
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_BUCKET: -3.0,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_DURATION: 300,
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_LINKED_ENTITY: "switch.valve",
    }
    zone.update(overrides)
    return zone


def _make_store(zone, *, enabled=True, sequencing="sequential", zones=None):
    store = Mock()
    store.config = SimpleNamespace(
        direct_valve_control_enabled=enabled,
        zone_sequencing=sequencing,
        active_valve_runs=[],
    )
    store.get_zone = Mock(return_value=zone)
    store.async_update_zone = AsyncMock()
    store.async_update_config = AsyncMock()
    store.async_get_zones = AsyncMock(
        return_value=zones if zones is not None else ([zone] if zone else [])
    )
    return store


def test_valve_services_by_domain():
    coord = _Coordinator(_make_hass(), _make_store(_zone()))
    assert coord._valve_services("switch.x") == ("switch", "turn_on", "turn_off")
    assert coord._valve_services("input_boolean.x") == (
        "input_boolean",
        "turn_on",
        "turn_off",
    )
    assert coord._valve_services("valve.x") == ("valve", "open_valve", "close_valve")


async def test_credit_divides_out_multiplier():
    """5 min at 10 L/min over 50 m2 == 1 mm; multiplier 2 halves the credit."""
    coord = _Coordinator(_make_hass(), _make_store(_zone(multiplier=1.0)))
    await coord._credit_direct_run(0, 300)
    args = coord.store.async_update_zone.await_args.args
    assert args[1][const.ZONE_BUCKET] == pytest.approx(-2.0)

    coord2 = _Coordinator(_make_hass(), _make_store(_zone(multiplier=2.0)))
    await coord2._credit_direct_run(0, 300)
    args2 = coord2.store.async_update_zone.await_args.args
    assert args2[1][const.ZONE_BUCKET] == pytest.approx(-2.5)


async def test_credit_clamps_seconds_to_max_duration():
    """A long overrun is clamped to maximum_duration before crediting."""
    coord = _Coordinator(_make_hass(), _make_store(_zone(maximum_duration=300)))
    # 600 s would credit 2 mm, but the cap is 300 s -> 1 mm -> bucket -3 -> -2.
    await coord._credit_direct_run(0, 600)
    args = coord.store.async_update_zone.await_args.args
    assert args[1][const.ZONE_BUCKET] == pytest.approx(-2.0)


def test_eligible_zones_filtering():
    coord = _Coordinator(_make_hass(), _make_store(_zone()))
    zones = [
        _zone(id=0),  # eligible
        _zone(id=1, linked_entity=None),  # no valve
        _zone(id=2, duration=0),  # nothing to run
        _zone(id=3, state=const.ZONE_STATE_DISABLED),  # disabled
    ]
    ids = {int(z[const.ZONE_ID]) for z in coord._eligible_direct_zones(zones, None)}
    assert ids == {0}
    # Restricting to a target set.
    ids2 = {
        int(z[const.ZONE_ID]) for z in coord._eligible_direct_zones(zones, [0, 2])
    }
    assert ids2 == {0}


async def test_run_one_valve_opens_waits_closes_credits():
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store(zone))

    await coord._run_one_valve(zone)

    calls = [c.args for c in hass.services.async_call.await_args_list]
    assert ("switch", "turn_on", {"entity_id": "switch.valve"}) in calls
    assert ("switch", "turn_off", {"entity_id": "switch.valve"}) in calls
    # turn_on before turn_off
    assert calls.index(("switch", "turn_on", {"entity_id": "switch.valve"})) < calls.index(
        ("switch", "turn_off", {"entity_id": "switch.valve"})
    )
    # observer-suppression marker set into the future
    assert coord._si_driven_until[0] > hass.loop.time()
    # run persisted then cleared
    assert coord._active_valve_runs == {}
    # bucket credited for the full 300 s run (1 mm) -> -3 -> -2
    args = coord.store.async_update_zone.await_args.args
    assert args[1][const.ZONE_BUCKET] == pytest.approx(-2.0)


async def test_run_disabled_is_noop():
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store(zone, enabled=False))
    await coord.async_run_direct_valves()
    hass.services.async_call.assert_not_awaited()


async def test_run_parallel_opens_all():
    z0 = _zone(id=0, linked_entity="switch.a")
    z1 = _zone(id=1, linked_entity="switch.b")
    hass = _make_hass()
    coord = _Coordinator(
        hass, _make_store(z0, sequencing="parallel", zones=[z0, z1])
    )
    # get_zone must resolve both for crediting
    coord.store.get_zone = Mock(side_effect=lambda zid: z0 if int(zid) == 0 else z1)

    await coord.async_run_direct_valves()

    opened = {
        c.args[2]["entity_id"]
        for c in hass.services.async_call.await_args_list
        if c.args[1] == "turn_on"
    }
    assert opened == {"switch.a", "switch.b"}


async def test_resume_overdue_run_closes_and_credits():
    """A run whose elapsed already exceeds its duration is closed on resume."""
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store(zone))
    started = (dt_util.utcnow() - datetime.timedelta(seconds=400)).isoformat()
    run = {
        const.RUN_ZONE_ID: 0,
        const.RUN_ENTITY_ID: "switch.valve",
        const.RUN_STARTED: started,
        const.RUN_DURATION: 300.0,
    }

    await coord._resume_one(run)

    # Closed immediately, no re-open needed.
    offs = [
        c.args
        for c in hass.services.async_call.await_args_list
        if c.args[1] == "turn_off"
    ]
    assert offs
    coord.store.async_update_zone.assert_awaited()  # credited


async def test_resume_partial_run_finishes_remaining():
    """A run still within its duration is re-opened and finished."""
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store(zone))
    started = (dt_util.utcnow() - datetime.timedelta(seconds=100)).isoformat()
    run = {
        const.RUN_ZONE_ID: 0,
        const.RUN_ENTITY_ID: "switch.valve",
        const.RUN_STARTED: started,
        const.RUN_DURATION: 300.0,
    }

    await coord._resume_one(run)

    names = [c.args[1] for c in hass.services.async_call.await_args_list]
    assert "turn_on" in names and "turn_off" in names  # re-opened then closed
    coord.store.async_update_zone.assert_awaited()  # credited the full duration
