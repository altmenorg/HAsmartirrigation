"""Tests for direct valve control (the optional executor)."""

import asyncio
import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import homeassistant.util.dt as dt_util
import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.observed_watering import ObservedWateringMixin
from custom_components.smart_irrigation.valve_runner import ValveRunnerMixin

# Captured before the _no_sleep fixture replaces asyncio.sleep, for the few
# tests that need to actually yield to the event loop.
_REAL_SLEEP = asyncio.sleep


class _Coordinator(ObservedWateringMixin, ValveRunnerMixin, CalculationMixin):
    """Minimal host exposing the runner's collaborators.

    Includes ``CalculationMixin`` so the shared credit path can recompute the
    duration from the bucket (#772), as the real coordinator does.
    """

    def __init__(self, hass, store):
        self.hass = hass
        self.store = store
        self._si_driven_until = {}
        self._active_valve_runs = {}
        self._direct_run_finished = {}
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


def _make_hass(metric=True, valve_state="on"):
    """A hass double. ``valve_state`` is what the linked valve reports back:
    "on" (opened), "off" (failed to open), or None (write-only, unverifiable).
    """
    hass = Mock()
    hass.config = Mock()
    hass.config.units = METRIC_SYSTEM if metric else Mock()
    # A clock that advances on every read, so the confirm poll can time out.
    clock = {"t": 1000.0}

    def _now():
        clock["t"] += 1.0
        return clock["t"]

    hass.loop = Mock()
    hass.loop.time = _now
    hass.services = Mock()
    hass.services.async_call = AsyncMock()
    # The runner wraps each service call in a task so it can bound its wait, so
    # this has to produce a real awaitable task rather than a Mock.
    hass.async_create_task = lambda coro, *args, **kwargs: asyncio.ensure_future(coro)
    hass.bus = Mock()
    hass.bus.async_fire = Mock()

    def _get(entity_id):
        return None if valve_state is None else SimpleNamespace(state=valve_state)

    hass.states = Mock()
    hass.states.get = _get
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
        const.ZONE_LEAD_TIME: 0,
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


async def test_credit_is_the_water_that_actually_flowed():
    """5 min at 10 L/min over 50 m2 is 1 mm, whatever the crop factor.

    The credit used to divide the crop factor back out, because the duration had
    been inflated by it. The crop factor is applied to the evapotranspiration now
    (#779), so the run is not inflated and the water that flowed is the water
    credited, which is also what the flow-sensor path does.
    """
    coord = _Coordinator(_make_hass(), _make_store(_zone(multiplier=1.0)))
    await coord._credit_direct_run(0, 300)
    args = coord.store.async_update_zone.await_args.args
    assert args[1][const.ZONE_BUCKET] == pytest.approx(-2.0)

    coord2 = _Coordinator(_make_hass(), _make_store(_zone(multiplier=2.0)))
    await coord2._credit_direct_run(0, 300)
    args2 = coord2.store.async_update_zone.await_args.args
    assert args2[1][const.ZONE_BUCKET] == pytest.approx(-2.0)


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
    ids2 = {int(z[const.ZONE_ID]) for z in coord._eligible_direct_zones(zones, [0, 2])}
    assert ids2 == {0}


async def test_run_one_valve_opens_waits_closes_credits():
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store(zone))

    await coord._run_one_valve(zone)

    calls = [c.args for c in hass.services.async_call.await_args_list]
    assert ("switch", "turn_on", {"entity_id": "switch.valve"}) in calls
    assert ("switch", "turn_off", {"entity_id": "switch.valve"}) in calls
    assert all(
        call.kwargs.get("blocking") is True
        for call in hass.services.async_call.await_args_list
    )
    # turn_on before turn_off
    assert calls.index(
        ("switch", "turn_on", {"entity_id": "switch.valve"})
    ) < calls.index(("switch", "turn_off", {"entity_id": "switch.valve"}))
    # observer-suppression marker set into the future
    assert coord._si_driven_until[0] > hass.loop.time()
    # run persisted then cleared
    assert coord._active_valve_runs == {}
    # bucket credited for the full 300 s run (1 mm) -> -3 -> -2
    args = coord.store.async_update_zone.await_args.args
    assert args[1][const.ZONE_BUCKET] == pytest.approx(-2.0)


async def test_confirm_valve_running_states():
    """on -> True, off -> False, unreadable -> None."""
    coord_on = _Coordinator(_make_hass(valve_state="on"), _make_store(_zone()))
    assert await coord_on._confirm_valve_running("switch.valve") is True

    coord_off = _Coordinator(_make_hass(valve_state="off"), _make_store(_zone()))
    assert await coord_off._confirm_valve_running("switch.valve") is False

    coord_unv = _Coordinator(_make_hass(valve_state=None), _make_store(_zone()))
    assert await coord_unv._confirm_valve_running("switch.valve") is None


async def test_run_aborts_and_reports_when_valve_stays_off():
    """A valve that never opens is not credited, and a problem is broadcast."""
    zone = _zone()
    hass = _make_hass(valve_state="off")
    coord = _Coordinator(hass, _make_store(zone))

    await coord._run_one_valve(zone)

    # Opened then closed, but never counted/credited.
    coord.store.async_update_zone.assert_not_awaited()
    assert coord._active_valve_runs == {}
    # A zone_problem event was fired.
    fired = [c.args[0] for c in hass.bus.async_fire.call_args_list]
    assert any("zone_problem" in name for name in fired)


async def test_run_proceeds_when_valve_is_write_only():
    """An unverifiable (write-only) valve is given the benefit of the doubt."""
    zone = _zone()
    hass = _make_hass(valve_state=None)
    coord = _Coordinator(hass, _make_store(zone))

    await coord._run_one_valve(zone)

    # Credited (we cannot prove it failed, so we proceed).
    coord.store.async_update_zone.assert_awaited()
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
    coord = _Coordinator(hass, _make_store(z0, sequencing="parallel", zones=[z0, z1]))
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


async def test_valve_service_is_awaited_before_the_run_continues():
    """The confirmation window must not race a still-running linked action."""
    hass = _make_hass()
    order = []

    async def _slow_open(*args, **kwargs):
        await asyncio.sleep(0)
        order.append("service returned")

    hass.services.async_call = _slow_open
    coord = _Coordinator(hass, _make_store(_zone()))
    original = coord._confirm_valve_running

    async def _confirm(entity_id):
        order.append("confirm started")
        return await original(entity_id)

    coord._confirm_valve_running = _confirm

    await coord._run_one_valve(_zone())

    assert order[:2] == ["service returned", "confirm started"]


async def test_a_hanging_valve_service_does_not_stall_the_run(monkeypatch, caplog):
    """A linked script that never returns must not hold the run hostage.

    Otherwise the water is never credited, the persisted run dangles and, in
    sequential mode, every later zone waits behind it.
    """
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.VALVE_SERVICE_TIMEOUT", 0.01
    )
    hass = _make_hass()
    never_returns = asyncio.Event()

    async def _hang(*args, **kwargs):
        await never_returns.wait()

    hass.services.async_call = _hang
    zone = _zone()
    coord = _Coordinator(hass, _make_store(zone))

    await coord._run_one_valve(zone)

    # The run went through: persisted run cleared and the bucket credited.
    assert coord._active_valve_runs == {}
    args = coord.store.async_update_zone.await_args.args
    assert args[1][const.ZONE_BUCKET] == pytest.approx(-2.0)
    assert "did not complete within" in caplog.text

    # Giving up on the wait must not cancel the service itself: it is still
    # pending, and it completes once the linked action finally returns.
    never_returns.set()
    await _REAL_SLEEP(0)


async def test_a_late_valve_service_failure_is_logged(monkeypatch, caplog):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.VALVE_SERVICE_TIMEOUT", 0.01
    )
    hass = _make_hass()
    release = asyncio.Event()

    async def _fail_late(*args, **kwargs):
        await release.wait()
        raise RuntimeError("valve proxy exploded")

    hass.services.async_call = _fail_late
    coord = _Coordinator(hass, _make_store(_zone()))

    await coord._run_one_valve(_zone())
    release.set()
    # One turn for the service task to raise, one for its done callback.
    await _REAL_SLEEP(0)
    await _REAL_SLEEP(0)

    assert "valve proxy exploded" in caplog.text


# --- a zone is watered once per cycle --------------------------------------


async def test_a_zone_whose_valve_we_hold_is_not_opened_again():
    """Two presses of "irrigate now" used to open the same valve twice and
    credit the bucket twice for water that was delivered once."""
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store(zone))
    coord._active_valve_runs[0] = {
        "entity": "switch.valve",
        "started": dt_util.utcnow().isoformat(),
        "duration": 300.0,
    }

    await coord.async_run_direct_valves([0])

    hass.services.async_call.assert_not_awaited()
    coord.store.async_update_zone.assert_not_awaited()


async def test_a_zone_watered_while_it_waited_its_turn_is_skipped():
    """A sequential cycle dispatches a zone long after it listed it: if that
    zone was watered in the meantime, watering it again would double the water
    and the credit."""
    z0 = _zone(id=0, linked_entity="switch.a")
    z1 = _zone(id=1, linked_entity="switch.b")
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store(z0, zones=[z0, z1]))
    ran = []

    async def _fake_run(zone):
        zone_id = int(zone[const.ZONE_ID])
        ran.append(zone_id)
        if zone_id == 0:
            # The user waters zone 1 on the spot while zone 0 is still open.
            coord._direct_run_finished[1] = hass.loop.time()
        return {"zone_id": zone_id, "zone": "z", "seconds": 300, "ran": True}

    coord._run_one_valve = _fake_run
    await coord.async_run_direct_valves()

    assert ran == [0]


async def test_a_sequential_cycle_still_waters_every_zone():
    """The guard must not skip a zone that simply comes second."""
    z0 = _zone(id=0, linked_entity="switch.a")
    z1 = _zone(id=1, linked_entity="switch.b")
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store(z0, zones=[z0, z1]))
    ran = []

    async def _fake_run(zone):
        ran.append(int(zone[const.ZONE_ID]))
        return {
            "zone_id": int(zone[const.ZONE_ID]),
            "zone": "z",
            "seconds": 300,
            "ran": True,
        }

    coord._run_one_valve = _fake_run
    await coord.async_run_direct_valves()

    assert ran == [0, 1]


async def test_a_finished_run_is_remembered():
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store(zone))

    await coord._run_one_valve(zone)

    assert coord._direct_run_finished[0] > 0
