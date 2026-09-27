"""Cycle and soak, and a pause between two zones.

Heavy soil cannot take 20 mm in one go: past its infiltration rate the water
runs off the surface or puddles, and the zone is billed for water the roots
never see. The remedy is not less water but the same water in shorter passes,
with time in between for it to soak in.

Two settings, both off by default so nothing changes for anybody who does not
ask: how many passes a run is watered in, and the pause between two zones of a
sequential run (line pressure, or a slow valve still closing).

The plan is fixed when the run starts. Crediting a pass lowers the zone's
duration, since the duration is derived from the bucket, and a later pass that
re-read it would water a fraction of what was decided.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.observed_watering import ObservedWateringMixin
from custom_components.smart_irrigation.valve_runner import ValveRunnerMixin


class _Coordinator(ObservedWateringMixin, ValveRunnerMixin, CalculationMixin):
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


@pytest.fixture
def sleeps(monkeypatch):
    """Record what the runner waits for instead of actually waiting."""
    waited = []

    async def _sleep(seconds):
        waited.append(seconds)

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _sleep
    )
    return waited


def _make_hass():
    hass = Mock()
    hass.config = Mock()
    hass.config.units = METRIC_SYSTEM
    clock = {"t": 1000.0}

    def _now():
        clock["t"] += 1.0
        return clock["t"]

    hass.loop = Mock()
    hass.loop.time = _now
    hass.services = Mock()
    hass.services.async_call = AsyncMock()
    hass.async_create_task = lambda coro, *args, **kwargs: asyncio.ensure_future(coro)
    hass.bus = Mock()
    hass.bus.async_fire = Mock()
    hass.states = Mock()
    hass.states.get = lambda entity_id: SimpleNamespace(state="on")
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


def _make_store(zones, *, passes=1, soak=15, pause=0, sequencing="sequential"):
    """A store whose zone updates actually land, so credits accumulate."""
    by_id = {int(z[const.ZONE_ID]): z for z in zones}
    store = Mock()
    store.config = SimpleNamespace(
        direct_valve_control_enabled=True,
        zone_sequencing=sequencing,
        active_valve_runs=[],
        watering_passes=passes,
        soak_minutes=soak,
        pause_between_zones=pause,
    )
    store.get_zone = Mock(side_effect=lambda zid: by_id.get(int(zid)))

    async def _update(zone_id, changes):
        by_id[int(zone_id)].update(changes)

    store.async_update_zone = AsyncMock(side_effect=_update)
    store.async_update_config = AsyncMock()
    store.async_add_irrigation_history = AsyncMock()
    store.async_get_zones = AsyncMock(return_value=list(zones))
    return store


def _opens(hass):
    return [
        call.args[2]["entity_id"]
        for call in hass.services.async_call.await_args_list
        if call.args[1] == "turn_on"
    ]


# --- cycle and soak ---------------------------------------------------------


async def test_one_pass_is_a_single_run_of_the_whole_duration(sleeps):
    """The default, and what every install did before this."""
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store([zone]))

    result = await coord._run_one_valve(zone)

    assert len(_opens(hass)) == 1
    assert sleeps == [300.0]
    assert result["seconds"] == 300


async def test_three_passes_water_the_same_time_in_three_goes(sleeps):
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store([zone], passes=3, soak=10))

    result = await coord._run_one_valve(zone)

    assert len(_opens(hass)) == 3
    # Three passes of 100 s, with two soaks of ten minutes between them.
    assert sleeps == [100.0, 600.0, 100.0, 600.0, 100.0]
    assert result["seconds"] == 300


async def test_the_water_adds_up_to_what_one_run_would_have_delivered(sleeps):
    """5 min at 10 L/min over 50 m2 is 1 mm, in one pass or in four."""
    one = _zone()
    coord_one = _Coordinator(_make_hass(), _make_store([one]))
    await coord_one._run_one_valve(one)

    four = _zone()
    coord_four = _Coordinator(_make_hass(), _make_store([four], passes=4))
    await coord_four._run_one_valve(four)

    assert four[const.ZONE_BUCKET] == pytest.approx(one[const.ZONE_BUCKET])
    assert four[const.ZONE_BUCKET] == pytest.approx(-2.0)
    assert four[const.ZONE_WATER_USED] == pytest.approx(one[const.ZONE_WATER_USED])


async def test_a_later_pass_keeps_its_planned_time(sleeps):
    """Crediting a pass lowers the zone's stored duration, since the duration is
    derived from the bucket. A pass that re-read it would run short."""
    zone = _zone()
    coord = _Coordinator(_make_hass(), _make_store([zone], passes=3))

    await coord._run_one_valve(zone)

    watering = [seconds for seconds in sleeps if seconds < 500]
    assert watering == [100.0, 100.0, 100.0]
    # The zone's own duration was rewritten while the run was going on, which
    # is exactly what a later pass must not read.
    assert zone[const.ZONE_DURATION] != 300


async def test_passes_come_down_until_each_one_is_worth_opening_a_valve(sleeps):
    """Two minutes in six passes would be six twenty-second bursts."""
    zone = _zone(duration=120)
    coord = _Coordinator(_make_hass(), _make_store([zone], passes=6, soak=5))

    await coord._run_one_valve(zone)

    assert [seconds for seconds in sleeps if seconds < 300] == [60.0, 60.0]


async def test_a_run_too_short_to_split_stays_in_one_pass(sleeps):
    zone = _zone(duration=45)
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store([zone], passes=4))

    await coord._run_one_valve(zone)

    assert len(_opens(hass)) == 1
    assert sleeps == [45.0]


async def test_the_observer_is_held_off_for_the_soaking_too(sleeps):
    """Between two passes the valve is shut, and the observer must not read that
    as a run of its own to credit."""
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store([zone], passes=3, soak=10))

    before = hass.loop.time()
    await coord._run_one_valve(zone)

    # 300 s of watering plus two ten-minute soaks.
    assert coord._si_driven_until[0] >= before + 1500


async def test_nonsense_settings_fall_back_to_one_pass(sleeps):
    zone = _zone()
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store([zone], passes="lots", soak="a while"))

    await coord._run_one_valve(zone)

    assert len(_opens(hass)) == 1


async def test_a_valve_that_stops_opening_halfway_keeps_what_it_delivered(sleeps):
    """The first pass ran, so the water it delivered is credited and reported;
    the failure is still named."""
    zone = _zone()
    hass = _make_hass()
    states = {"n": 0}

    def _get(entity_id):
        states["n"] += 1
        # The confirm poll reads the state; fail from the second pass on.
        return SimpleNamespace(state="on" if states["n"] <= 1 else "off")

    hass.states.get = _get
    coord = _Coordinator(hass, _make_store([zone], passes=3))

    result = await coord._run_one_valve(zone)

    assert result["ran"] is True
    assert result["seconds"] == 100
    assert result["problem"] == "valve_did_not_open"
    fired = [call.args[0] for call in hass.bus.async_fire.call_args_list]
    assert any("zone_problem" in name for name in fired)


async def test_a_valve_that_never_opens_at_all_is_a_failure(sleeps):
    zone = _zone()
    hass = _make_hass()
    hass.states.get = lambda entity_id: SimpleNamespace(state="off")
    coord = _Coordinator(hass, _make_store([zone], passes=3))

    result = await coord._run_one_valve(zone)

    assert result["ran"] is False
    assert result["seconds"] == 0
    assert zone[const.ZONE_BUCKET] == -3.0, "nothing credited"


# --- the pause between two zones -------------------------------------------


async def test_a_sequential_run_pauses_between_zones(sleeps):
    z0 = _zone(id=0, linked_entity="switch.a")
    z1 = _zone(id=1, linked_entity="switch.b")
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store([z0, z1], pause=90))

    await coord.async_run_direct_valves()

    assert _opens(hass) == ["switch.a", "switch.b"]
    # 300 s of watering, 90 s of pause, 300 s of watering. Nothing before the
    # first zone: a pause there would just delay the whole run.
    assert sleeps == [300.0, 90.0, 300.0]


async def test_without_a_pause_nothing_is_waited_for(sleeps):
    z0 = _zone(id=0, linked_entity="switch.a")
    z1 = _zone(id=1, linked_entity="switch.b")
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store([z0, z1]))

    await coord.async_run_direct_valves()

    assert sleeps == [300.0, 300.0]


async def test_zones_watered_at_once_are_not_paused_apart(sleeps):
    z0 = _zone(id=0, linked_entity="switch.a")
    z1 = _zone(id=1, linked_entity="switch.b")
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store([z0, z1], pause=90, sequencing="parallel"))

    await coord.async_run_direct_valves()

    assert 90.0 not in sleeps
