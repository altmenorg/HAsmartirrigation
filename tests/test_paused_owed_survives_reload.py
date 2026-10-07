"""The water a pause owes a zone survives a reload or a restart.

A real-instance test: a pause closed the valves of a step, the config entry was
reloaded, and after the resume only the next step ran: what the interrupted step
still owed its zones was lost with the memory of the run.
"""

import asyncio
from unittest.mock import AsyncMock

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from tests.runner_doubles import REAL_SLEEP, Coordinator, closes, opens
from tests.test_hard_deadline_and_persistence import _setup as _base_setup
from tests.test_program_runner import _events, _log, _program
from tests.test_watering_control import _silence_dispatcher  # noqa: F401


class Sleeps:
    """The runner's sleep: a pass of 20 s and the pause's timer never end by
    themselves (the test decides when), every other wait is instant."""

    def __init__(self, hass):
        self.hass = hass

    async def __call__(self, seconds, *args, **kwargs):
        self.hass.calls.append(("sleep", seconds))
        if float(seconds) == 20.0 or float(seconds) >= 100.0:
            await asyncio.Event().wait()


def _sandbox():
    return _program(
        steps=[
            {"zones": [0, 1], "mode": "fixed", "seconds": 20},
            {"zones": [2], "mode": "fixed", "seconds": 15},
        ]
    )


def _setup(monkeypatch):
    hass, coord, _ = _base_setup(monkeypatch, [_sandbox()])
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", Sleeps(hass)
    )
    coord._credit_direct_run = AsyncMock()
    return hass, coord


async def _settle():
    for _ in range(40):
        await REAL_SLEEP(0)


async def _drain(hass):
    pending = [t for t in hass.created if not t.done()]
    await asyncio.wait_for(asyncio.gather(*pending, return_exceptions=True), 5)


async def _pause_then_reload(hass, coord, freezer, minutes=3):
    """Run the program, pause it 9 s into the step, then reload (a new coordinator)."""
    program = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    assert opens(hass) == ["switch.zone_0", "switch.zone_1"]
    freezer.tick(9)
    await coord.async_pause_watering(minutes)
    await _settle()
    assert sorted(closes(hass)) == ["switch.zone_0", "switch.zone_1"]
    assert coord.store.config.pause_until is not None

    tasks = coord.async_teardown_valve_runs()
    program.cancel()
    await asyncio.gather(program, *tasks, return_exceptions=True)
    await _settle()
    reloaded = Coordinator(hass, coord.store)
    reloaded._credit_direct_run = AsyncMock()
    return reloaded


def _credits(coord):
    return sorted(
        (call.args[0], call.kwargs["held"])
        for call in coord._credit_direct_run.await_args_list
    )


async def test_a_pause_keeps_what_it_owes_each_zone(monkeypatch, freezer):
    hass, coord = _setup(monkeypatch)
    program = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    freezer.tick(9)

    await coord.async_pause_watering(3)
    await _settle()

    owed = {r["zone_id"]: r for r in coord.store.config.paused_owed}
    assert sorted(owed) == [0, 1]
    for record in owed.values():
        assert record["pending"] == pytest.approx([11.0])
        assert record["credited"] == pytest.approx(9.0)
    # What was delivered before the pause is credited now, once.
    assert _credits(coord) == [(0, 9.0), (1, 9.0)]

    tasks = coord.async_teardown_valve_runs()
    program.cancel()
    await asyncio.gather(program, *tasks, return_exceptions=True)


async def test_the_owed_water_is_watered_after_a_reload_and_the_resume(
    monkeypatch, freezer
):
    hass, coord = _setup(monkeypatch)
    reloaded = await _pause_then_reload(hass, coord, freezer)

    await reloaded.async_restore_pause_and_queue()
    await reloaded.async_resume_valve_runs()
    await _settle()
    # The pause came back with the reload: nothing opens under it.
    assert reloaded.watering_paused() is True
    assert opens(hass) == ["switch.zone_0", "switch.zone_1"]

    await reloaded.async_resume_watering()
    await _drain(hass)
    await _settle()

    log = _log(hass)
    # A and B water their owed 11 s, then step 2 (zone C) runs its 15 s.
    assert log.count("wait 11") == 2
    assert opens(hass).count("switch.zone_0") == 2
    assert opens(hass).count("switch.zone_1") == 2
    assert opens(hass).count("switch.zone_2") == 1
    assert max(i for i, e in enumerate(log) if e == "wait 11") < log.index("wait 15")
    # 9 s before the pause + 11 s after: the credit is not doubled.
    assert _credits(coord) == [(0, 9.0), (1, 9.0)]
    assert _credits(reloaded) == [(0, 11.0), (1, 11.0), (2, 15.0)]
    assert coord.store.config.paused_owed is None
    assert coord.store.config.active_program_run is None
    [finished] = _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert sorted(z["zone_id"] for z in finished["zones"]) == [0, 1, 2]


async def test_a_pause_that_ended_during_the_downtime_waters_the_owed_at_once(
    monkeypatch, freezer
):
    hass, coord = _setup(monkeypatch)
    reloaded = await _pause_then_reload(hass, coord, freezer)
    # The pause timed out while Home Assistant was down.
    coord.store.config.pause_until = (dt_util.utcnow()).isoformat()
    freezer.tick(400)

    await reloaded.async_restore_pause_and_queue()
    await reloaded.async_resume_valve_runs()
    await _drain(hass)
    await _settle()

    assert reloaded.watering_paused() is False
    log = _log(hass)
    assert log.count("wait 11") == 2
    assert opens(hass).count("switch.zone_2") == 1
    assert _credits(reloaded) == [(0, 11.0), (1, 11.0), (2, 15.0)]
    assert coord.store.config.paused_owed is None


async def test_owed_water_too_old_is_dropped(monkeypatch, freezer):
    hass, coord = _setup(monkeypatch)
    reloaded = await _pause_then_reload(hass, coord, freezer)
    coord.store.config.pause_until = None
    freezer.tick(const.OWED_RESUME_MAX_AGE_SECONDS + 60)

    await reloaded.async_resume_valve_runs()
    await _settle()

    assert "wait 11" not in _log(hass)
    assert coord.store.config.paused_owed is None


async def test_a_stop_during_the_pause_forgets_what_was_owed(monkeypatch, freezer):
    hass, coord = _setup(monkeypatch)
    program = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    freezer.tick(9)
    await coord.async_pause_watering(3)
    await _settle()
    assert coord.store.config.paused_owed

    await coord.async_stop_watering()
    await asyncio.wait_for(program, 5)
    await _settle()

    assert not coord.store.config.paused_owed
    assert opens(hass) == ["switch.zone_0", "switch.zone_1"]


async def test_nothing_is_recorded_with_the_full_controller_off(monkeypatch, freezer):
    hass, coord = _setup(monkeypatch)
    coord.store.config.full_controller = False
    await coord._persist_owed(0, "switch.zone_0", [11.0], 0.0, 9.0)

    assert not getattr(coord.store.config, "paused_owed", None)
