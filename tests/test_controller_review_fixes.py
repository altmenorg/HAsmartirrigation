"""What the review of the full controller found, each as a test that failed before.

- a pause or a stop that lands while a finished pass is closing made the pass
  count as cut short: watered again after the resume, or reported as not run;
- a stop of everything did not reach a cycle waiting for its turn, nor a manual
  run behind a cycle of the plain mode, which ran on top of it;
- another valve of a zone that failed to open aborted the whole zone;
- the main program switched off still let the start trigger water;
- a program reset the days-since counters of zones it did not water.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.triggers import TriggersMixin
from tests.runner_doubles import (
    REAL_SLEEP,
    Coordinator,
    Sleeps,
    make_hass,
    make_store,
    opens,
    problems,
    zone,
)


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


class GatedSleeps(Sleeps):
    """The pause's own lift timer (an hour) waits for the test; the rest returns."""

    def __init__(self):
        super().__init__()
        self.gate = asyncio.Event()

    async def __call__(self, seconds, *args, **kwargs):
        if float(seconds) == 3600.0:
            await self.gate.wait()
            return
        await super().__call__(seconds, *args, **kwargs)


@pytest.fixture
def sleeps(monkeypatch):
    recorder = GatedSleeps()
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", recorder
    )
    return recorder


def _setup(zone_ids=(0,), *, full=True, **store_kwargs):
    hass = make_hass()
    store = make_store([zone(i) for i in zone_ids], **store_kwargs)
    store.config.full_controller = full
    store.config.supplies = []
    store.config.programs = []
    store.config.active_cycle = None
    store.config.active_program_run = None
    store.config.suspensions = None
    return hass, Coordinator(hass, store)


def _on_close(hass, action):
    """Run ``action`` the first time a valve is closed."""
    real = hass.services.async_call.side_effect
    done = {"once": False}

    async def _call(domain, service, data, **kwargs):
        result = await real(domain, service, data, **kwargs)
        if service in ("turn_off", "close_valve") and not done["once"]:
            done["once"] = True
            await action()
        return result

    hass.services.async_call.side_effect = _call


def _history(coord):
    return coord.store.async_add_irrigation_history.await_count


async def test_a_pause_while_a_finished_pass_closes_does_not_water_it_again(sleeps):
    hass, coord = _setup()
    _on_close(hass, coord.async_pause_watering)

    task = asyncio.ensure_future(coord.async_run_direct_valves())
    for _ in range(30):
        await REAL_SLEEP(0)
    await coord.async_resume_watering()
    await asyncio.wait_for(task, 5)

    assert opens(hass) == ["switch.zone_0"]
    assert _history(coord) == 1


async def test_a_stop_while_a_finished_pass_closes_still_reports_the_water(sleeps):
    hass, coord = _setup()
    _on_close(hass, coord.async_stop_watering)

    await coord.async_run_direct_valves()

    finished = [
        call.args[1]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0].endswith(const.EVENT_IRRIGATE_FINISHED)
    ][-1]
    assert [z["zone_id"] for z in finished["zones"]] == [0]
    assert finished["zones"][0]["seconds"] == 300


async def test_a_stop_reaches_a_cycle_waiting_for_its_turn(sleeps):
    hass, coord = _setup(zone_ids=(0, 1))
    lock = coord._executor_lock()
    await lock.acquire()

    waiting = asyncio.ensure_future(coord.async_run_direct_valves([1]))
    for _ in range(10):
        await REAL_SLEEP(0)
    await coord.async_stop_watering()
    lock.release()
    await asyncio.wait_for(waiting, 5)

    assert opens(hass) == []


async def test_a_stop_reaches_a_manual_run_waiting_for_its_turn(sleeps):
    hass, coord = _setup(zone_ids=(0, 1))
    lock = coord._executor_lock()
    await lock.acquire()

    waiting = asyncio.ensure_future(coord.async_water_zone_now(1, seconds=60))
    for _ in range(10):
        await REAL_SLEEP(0)
    await coord.async_stop_watering()
    lock.release()

    assert await asyncio.wait_for(waiting, 5) is False
    assert opens(hass) == []


async def test_a_manual_run_waits_for_a_cycle_of_the_plain_mode(sleeps):
    hass, coord = _setup(zone_ids=(0, 1), full=False)
    started = asyncio.Event()

    async def _mark():
        started.set()
        for _ in range(10):
            await REAL_SLEEP(0)

    sleeps.on(300, _mark)

    cycle = asyncio.ensure_future(coord.async_run_direct_valves([0]))
    await started.wait()
    manual = asyncio.ensure_future(coord.async_water_zone_now(1, seconds=60))
    await asyncio.wait_for(asyncio.gather(cycle, manual), 5)

    calls = [entity for _, entity in hass.calls]
    # Zone 0 was closed before zone 1 was opened.
    assert calls.index("switch.zone_0", 1) < calls.index("switch.zone_1")


async def test_another_valve_that_fails_to_open_does_not_abort_the_zone(sleeps):
    hass = make_hass()
    store = make_store([zone(0, **{const.ZONE_EXTRA_ENTITIES: ["switch.second"]})])
    store.config.full_controller = True
    store.config.supplies = []
    coord = Coordinator(hass, store)
    real = hass.services.async_call.side_effect

    async def _flaky(domain, service, data, **kwargs):
        if data["entity_id"] == "switch.second" and service == "turn_on":
            raise RuntimeError("unreachable")
        return await real(domain, service, data, **kwargs)

    hass.services.async_call.side_effect = _flaky

    await coord.async_run_direct_valves()

    assert 300 in sleeps.waited  # the zone was held for its time
    assert problems(hass) == ["valve_did_not_open"]  # once, naming the other valve
    on = [
        call.args[1]["entity_id"]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0].endswith(const.EVENT_VALVE_ON)
    ]
    assert on == ["switch.zone_0"]


class Triggers(TriggersMixin):
    def __init__(self, programs, *, full=True, suspended=False):
        self.store = MagicMock()
        self.store.config = SimpleNamespace(full_controller=full, programs=programs)
        self.is_suspended = lambda kind, ident: suspended


def test_the_main_program_switched_off_holds_the_start_trigger():
    main = {const.PROGRAM_ID: "main", const.PROGRAM_MAIN: True}

    assert Triggers([main])._main_program_held() is None
    assert (
        Triggers([{**main, const.PROGRAM_ENABLED: False}])._main_program_held()
        == "disabled"
    )
    assert Triggers([main], suspended=True)._main_program_held() == "suspended"
    # Outside the full controller there is no main program to hold anything.
    assert (
        Triggers(
            [{**main, const.PROGRAM_ENABLED: False}], full=False
        )._main_program_held()
        is None
    )


async def test_a_program_resets_the_counters_of_its_zones_only():
    triggers = Triggers([])
    triggers._start_event_fired_today = True
    zones = [
        {const.ZONE_ID: 0, const.ZONE_DURATION: 300},
        {const.ZONE_ID: 1, const.ZONE_DURATION: 300},
    ]
    triggers.store.async_get_zones = AsyncMock(return_value=zones)
    triggers.store.async_update_zone = AsyncMock()
    triggers.store.async_update_config = AsyncMock()
    triggers._reset_days_since_irrigation = AsyncMock()

    assert await triggers._note_watering_day("evening", zone_ids={1}) is True

    triggers.store.async_update_zone.assert_awaited_once_with(
        1, {const.ZONE_DAYS_SINCE_IRRIGATION: 0}
    )
