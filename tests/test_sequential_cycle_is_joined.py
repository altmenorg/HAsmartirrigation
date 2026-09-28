"""A second dispatch joins the sequential cycle instead of racing it.

One zone at a time is the whole promise of sequential watering, and it was
broken by the most ordinary thing there is: the nightly run watering zone 1 with
2 and 3 waiting, somebody pressing "irrigate now" on zone 4, and two valves open
at once -- because each dispatch ran a cycle of its own and neither knew about
the other.

Guarding a zone against being watered twice, which came first, does not cover
this: the zones are different ones. What covers it is there being one cycle.

The case was reported against another fork of this integration, by Eifel-Joe,
and the same hole was open here. None of that code is used.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.valve_runner import ValveRunnerMixin


class _Coordinator(ValveRunnerMixin):
    def __init__(self, hass, store):
        self.hass = hass
        self.store = store
        self._si_driven_until = {}
        self._active_valve_runs = {}
        self._direct_run_finished = {}
        self._sequential_cycle = None
        self._valve_run_tasks = set()


def _make_hass():
    hass = MagicMock()
    hass.config.units = METRIC_SYSTEM
    clock = {"t": 1000.0}
    hass.loop.time = lambda: clock["t"]
    hass.services.async_call = AsyncMock()
    hass.async_create_task = lambda coro, *a, **k: asyncio.ensure_future(coro)
    hass.states.get = lambda entity_id: SimpleNamespace(state="on")
    hass.bus.async_fire = MagicMock()
    return hass


def _zone(zone_id, duration=300):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_BUCKET: -3.0,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_DURATION: duration,
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_LINKED_ENTITY: f"switch.zone_{zone_id}",
    }


def _make_store(zones, sequencing="sequential"):
    store = MagicMock()
    store.config = SimpleNamespace(
        direct_valve_control_enabled=True,
        zone_sequencing=sequencing,
        active_valve_runs=[],
        watering_passes=1,
        soak_minutes=0,
        pause_between_zones=0,
    )
    store.async_get_zones = AsyncMock(return_value=zones)
    store.async_update_config = AsyncMock()
    store.get_zone = MagicMock(
        side_effect=lambda zid: next(
            (z for z in zones if int(z[const.ZONE_ID]) == int(zid)), None
        )
    )
    return store


def _runner(zones, sequencing="sequential"):
    """A coordinator whose zone runs are recorded rather than performed."""
    hass = _make_hass()
    coordinator = _Coordinator(hass, _make_store(zones, sequencing))
    order = []
    open_now = []

    async def _run_one(zone):
        zone_id = int(zone[const.ZONE_ID])
        order.append(zone_id)
        open_now.append(zone_id)
        # While this zone is open, the runner records it, which is what the join
        # reads to know a zone is not in the queue any more.
        coordinator._active_valve_runs[zone_id] = {"entity": "switch.x"}
        await asyncio.sleep(0)
        del coordinator._active_valve_runs[zone_id]
        open_now.remove(zone_id)
        coordinator._direct_run_finished[zone_id] = hass.loop.time()
        return {
            "zone_id": zone_id,
            "zone": f"Zone {zone_id}",
            "seconds": 300,
            "ran": True,
            "problem": None,
        }

    coordinator._run_one_valve = _run_one
    return coordinator, order, open_now


def _started_events(coordinator):
    return [
        call.args[1]
        for call in coordinator.hass.bus.async_fire.call_args_list
        if call.args[0].endswith(const.EVENT_IRRIGATE_STARTED)
    ]


def _finished_events(coordinator):
    return [
        call.args[1]
        for call in coordinator.hass.bus.async_fire.call_args_list
        if call.args[0].endswith(const.EVENT_IRRIGATE_FINISHED)
    ]


async def test_a_second_dispatch_joins_the_cycle():
    """The reported case: a cycle is running and one more zone is asked for."""
    zones = [_zone(1), _zone(2), _zone(3), _zone(4)]
    coordinator, order, _open_now = _runner(zones)

    async def _join_while_running():
        # Once zone 1 is open, ask for zone 4 the way the button does.
        while not coordinator._active_valve_runs:
            await asyncio.sleep(0)
        await coordinator.async_run_direct_valves([4])

    await asyncio.gather(
        coordinator.async_run_direct_valves([1, 2, 3]), _join_while_running()
    )

    assert order == [1, 2, 3, 4], "the joined zone waters last, in one cycle"


async def test_never_two_valves_at_once():
    """The promise of the setting, asserted directly."""
    zones = [_zone(1), _zone(2), _zone(3)]
    coordinator, _order, open_now = _runner(zones)
    seen = []

    original = coordinator._run_one_valve

    async def _watch(zone):
        seen.append(len(open_now) + 1)
        return await original(zone)

    coordinator._run_one_valve = _watch

    async def _join_while_running():
        while not coordinator._active_valve_runs:
            await asyncio.sleep(0)
        await coordinator.async_run_direct_valves([3])

    await asyncio.gather(
        coordinator.async_run_direct_valves([1, 2]), _join_while_running()
    )

    assert max(seen) == 1


async def test_a_zone_already_waiting_is_not_queued_twice():
    zones = [_zone(1), _zone(2)]
    coordinator, order, _open = _runner(zones)

    async def _ask_again():
        while not coordinator._active_valve_runs:
            await asyncio.sleep(0)
        # Zone 2 is already in the queue.
        await coordinator.async_run_direct_valves([2])

    await asyncio.gather(coordinator.async_run_direct_valves([1, 2]), _ask_again())

    assert order == [1, 2]


async def test_the_zone_whose_valve_is_open_is_not_queued_behind_itself():
    """It is no longer in the queue, having been taken out of it to be watered,
    so only the in-flight record can say it is running."""
    zones = [_zone(1), _zone(2)]
    coordinator, order, _open = _runner(zones)

    async def _ask_for_the_open_one():
        while not coordinator._active_valve_runs:
            await asyncio.sleep(0)
        await coordinator.async_run_direct_valves([1])

    await asyncio.gather(
        coordinator.async_run_direct_valves([1, 2]), _ask_for_the_open_one()
    )

    assert order == [1, 2]


async def test_a_dispatch_that_adds_nothing_announces_nothing():
    zones = [_zone(1), _zone(2)]
    coordinator, _order, _open = _runner(zones)

    async def _ask_again():
        while not coordinator._active_valve_runs:
            await asyncio.sleep(0)
        await coordinator.async_run_direct_valves([2])

    await asyncio.gather(coordinator.async_run_direct_valves([1, 2]), _ask_again())

    assert len(_started_events(coordinator)) == 1


async def test_the_joined_zones_are_announced_on_their_own():
    """They were not part of what the running cycle said it would water."""
    zones = [_zone(1), _zone(2), _zone(3)]
    coordinator, _order, _open = _runner(zones)

    async def _join():
        while not coordinator._active_valve_runs:
            await asyncio.sleep(0)
        await coordinator.async_run_direct_valves([3])

    await asyncio.gather(coordinator.async_run_direct_valves([1, 2]), _join())

    events = _started_events(coordinator)
    assert len(events) == 2
    assert [z["zone_id"] for z in events[1]["zones"]] == [3]


async def test_one_summary_for_the_whole_cycle():
    zones = [_zone(1), _zone(2), _zone(3)]
    coordinator, _order, _open = _runner(zones)

    async def _join():
        while not coordinator._active_valve_runs:
            await asyncio.sleep(0)
        await coordinator.async_run_direct_valves([3])

    await asyncio.gather(coordinator.async_run_direct_valves([1, 2]), _join())

    finished = _finished_events(coordinator)
    assert len(finished) == 1
    assert sorted(z["zone_id"] for z in finished[0]["zones"]) == [1, 2, 3]


async def test_a_zone_that_fails_does_not_abandon_the_queue():
    zones = [_zone(1), _zone(2), _zone(3)]
    coordinator, order, _open = _runner(zones)
    original = coordinator._run_one_valve

    async def _run(zone):
        if int(zone[const.ZONE_ID]) == 2:
            raise RuntimeError("the valve service blew up")
        return await original(zone)

    coordinator._run_one_valve = _run

    await coordinator.async_run_direct_valves([1, 2, 3])

    assert order == [1, 3]


async def test_the_cycle_is_over_when_it_is_over():
    """A later dispatch starts a fresh one rather than joining a ghost."""
    zones = [_zone(1)]
    coordinator, order, _open = _runner(zones)

    await coordinator.async_run_direct_valves([1])
    assert coordinator._sequential_cycle is None
    await coordinator.async_run_direct_valves([1])

    assert order == [1, 1]
    assert len(_finished_events(coordinator)) == 2


async def test_parallel_is_untouched():
    """Every zone at once is what that setting asks for, so two dispatches
    overlapping is not a contradiction and there is no queue to join."""
    zones = [_zone(1), _zone(2)]
    coordinator, order, _open = _runner(zones, sequencing="parallel")

    await coordinator.async_run_direct_valves()

    assert sorted(order) == [1, 2]
    assert coordinator._sequential_cycle is None


async def test_a_cycle_that_raises_still_ends():
    """Otherwise every later dispatch would join a cycle nobody is running."""
    zones = [_zone(1)]
    coordinator, _order, _open = _runner(zones)
    coordinator._report_finished = MagicMock(side_effect=RuntimeError("boom"))

    with pytest.raises(RuntimeError):
        await coordinator.async_run_direct_valves([1])

    assert coordinator._sequential_cycle is None
