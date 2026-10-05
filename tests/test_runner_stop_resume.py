"""Stopping a cycle, and going on with one a restart interrupted.

The wait of a run used to be a bare sleep: nothing could end it early, so a
cycle could not be stopped and a restart lost every zone still queued. These
cover the stop (the valve closes, what flowed is credited, the queue is
emptied or trimmed), the record of the cycle that survives a restart, and the
alignment of the valves at startup.
"""

import asyncio
from datetime import timedelta

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from tests.runner_doubles import (
    REAL_SLEEP,
    Coordinator,
    Sleeps,
    closes,
    make_hass,
    make_store,
    opens,
    problems,
    set_state,
    zone,
)


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


@pytest.fixture
def sleeps(monkeypatch):
    recorder = Sleeps()
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", recorder
    )
    return recorder


def _cycle(zone_ids, *, full=True, **store_kwargs):
    hass = make_hass()
    coord = Coordinator(hass, make_store([zone(i) for i in zone_ids], **store_kwargs))
    # The record of a cycle is kept in full controller mode.
    coord.store.config.full_controller = full
    coord.store.config.active_cycle = None
    return hass, coord


def _recorded_cycles(coord):
    """Every value written to the cycle record, oldest first."""
    return [
        call.args[0][const.CONF_ACTIVE_CYCLE]
        for call in coord.store.async_update_config.await_args_list
        if const.CONF_ACTIVE_CYCLE in call.args[0]
    ]


def _finished(hass):
    for call in reversed(hass.bus.async_fire.call_args_list):
        if call.args[0].endswith(const.EVENT_IRRIGATE_FINISHED):
            return call.args[1]
    return None


async def test_a_stop_closes_the_open_valve_and_empties_the_queue(sleeps):
    hass, coord = _cycle([0, 1, 2])

    async def _stop():
        await coord.async_stop_watering()

    sleeps.on(300, _stop)

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_0"]
    assert closes(hass) == ["switch.zone_0"]
    summary = _finished(hass)
    assert summary["stopped"] == [0]
    # A stop is not a fault.
    assert summary["problems"] == []
    assert problems(hass) == []


async def test_a_stop_names_every_zone_it_stopped(sleeps):
    hass, coord = _cycle([0, 1, 2])
    stopped = []

    async def _stop():
        stopped.extend(await coord.async_stop_watering())

    sleeps.on(300, _stop)

    await coord.async_run_direct_valves()

    assert sorted(stopped) == [0, 1, 2]


async def test_a_stop_of_one_queued_zone_leaves_the_others(sleeps):
    hass, coord = _cycle([0, 1, 2])

    async def _stop_zone_1():
        assert await coord.async_stop_watering([1]) == [1]

    sleeps.on(300, _stop_zone_1)

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_0", "switch.zone_2"]


async def test_a_stop_during_the_soak_waters_no_more_passes(sleeps):
    hass, coord = _cycle([0], passes=3, soak=5)

    async def _stop():
        await coord.async_stop_watering()

    sleeps.on(300.0, _stop)  # the soak, in seconds

    await coord.async_run_direct_valves()

    # One pass of the three, then the soak was cut short.
    assert opens(hass) == ["switch.zone_0"]


async def test_the_cycle_is_recorded_while_it_runs_and_cleared_after(sleeps):
    hass, coord = _cycle([0, 1, 2])
    seen = []

    async def _look():
        seen.extend(_recorded_cycles(coord))

    sleeps.on(300, _look)

    await coord.async_run_direct_valves()

    # While zone 0 was open, the record held it and the two waiting.
    assert seen[-1]["zones"] == [0, 1, 2]
    assert _recorded_cycles(coord)[-1] is None


async def test_a_cancelled_cycle_keeps_its_record_for_the_next_start(monkeypatch):
    hass, coord = _cycle([0, 1, 2])
    gate = asyncio.Event()

    async def _blocked(seconds, *args, **kwargs):
        await gate.wait()

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _blocked
    )
    task = asyncio.ensure_future(coord.async_run_direct_valves())
    for _ in range(20):
        await REAL_SLEEP(0)

    task.cancel()
    # The close that follows a cancellation waits too: let it through.
    gate.set()
    with pytest.raises(asyncio.CancelledError):
        await task

    last = _recorded_cycles(coord)[-1]
    assert last is not None and last["zones"] == [0, 1, 2]


async def test_a_restart_goes_on_with_the_zones_that_were_waiting(sleeps):
    hass, coord = _cycle([0, 1, 2])
    coord.store.config.active_cycle = {
        "zones": [1, 2],
        "started": dt_util.utcnow().isoformat(),
    }

    await coord.async_resume_valve_runs()
    for task in list(hass.created):
        await task

    assert opens(hass) == ["switch.zone_1", "switch.zone_2"]


async def test_a_cycle_from_another_day_is_not_resumed(sleeps):
    hass, coord = _cycle([0, 1])
    coord.store.config.active_cycle = {
        "zones": [0, 1],
        "started": (dt_util.utcnow() - timedelta(hours=10)).isoformat(),
    }

    await coord.async_resume_valve_runs()
    for task in list(hass.created):
        await task

    assert opens(hass) == []
    # And the record is not left to be tried again at the next start.
    assert _recorded_cycles(coord)[-1] is None


async def test_the_open_valve_is_aligned_only_in_full_controller_mode():
    hass, coord = _cycle([0, 1, 2], full=False)
    set_state(hass, "switch.zone_0", "off")
    set_state(hass, "switch.zone_1", "on")
    set_state(hass, "switch.zone_2", "unavailable")

    await coord.async_align_valves()
    assert closes(hass) == []  # switched off: nothing is touched

    coord.store.config.full_controller = True
    await coord.async_align_valves()

    # Only the one that reads open: an unreadable valve is not an open one.
    assert closes(hass) == ["switch.zone_1"]


async def test_a_valve_a_run_of_ours_holds_is_not_aligned():
    hass, coord = _cycle([0, 1])
    coord.store.config.full_controller = True
    set_state(hass, "switch.zone_0", "on")
    coord._claimed_zone_ids().add(0)

    await coord.async_align_valves()

    assert closes(hass) == []


async def test_the_plain_mode_keeps_no_cycle_record(sleeps):
    hass, coord = _cycle([0, 1], full=False)

    await coord.async_run_direct_valves()

    assert _recorded_cycles(coord) == []


async def test_a_stop_during_the_pause_between_zones_reaches_the_next_zone(sleeps):
    hass, coord = _cycle([0, 1], pause=7)

    async def _stop():
        await coord.async_stop_watering()

    sleeps.on(7, _stop)

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_0"]
