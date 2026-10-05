"""Pause, resume, next step, suspension and a manual run, while the watering runs."""

import asyncio
from datetime import timedelta
from unittest.mock import AsyncMock

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.programs import normalize_programs
from tests.runner_doubles import (
    REAL_SLEEP,
    Coordinator,
    make_hass,
    make_store,
    zone,
)

PAUSE_TIMER = 3600.0  # the wait of the lift-by-itself timer, 60 minutes


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


class LoggedSleeps:
    """asyncio.sleep in the runner: logs the wait among the service calls.

    The wait of the pause's own timer is held until the test lets it go.
    """

    def __init__(self, hass):
        self.hass = hass
        self.hooks = {}
        self.timer_gate = asyncio.Event()

    def on(self, seconds, hook):
        self.hooks[float(seconds)] = hook

    async def __call__(self, seconds, *args, **kwargs):
        if float(seconds) == PAUSE_TIMER:
            await self.timer_gate.wait()
            return
        self.hass.calls.append(("sleep", seconds))
        hook = self.hooks.pop(float(seconds), None)
        if hook is not None:
            await hook()


def _setup(monkeypatch, programs=None, zone_ids=(0, 1), **store_kwargs):
    hass = make_hass()
    store = make_store([zone(i) for i in zone_ids], **store_kwargs)
    store.config.full_controller = True
    store.config.programs = normalize_programs(programs or [])
    store.config.active_cycle = None
    store.config.active_program_run = None
    store.config.suspensions = None

    async def _update(changes):
        for key, value in changes.items():
            setattr(store.config, key, value)

    store.async_update_config = AsyncMock(side_effect=_update)
    coord = Coordinator(hass, store)
    sleeps = LoggedSleeps(hass)
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", sleeps
    )
    return hass, coord, sleeps


def _log(hass):
    short = []
    for service, entity in hass.calls:
        if service == "sleep":
            short.append(f"wait {entity:g}")
        else:
            name = entity.split(".")[1]
            state = "on" if service in ("turn_on", "open_valve") else "off"
            short.append(f"{name} {state}")
    return short


async def _settle():
    for _ in range(30):
        await REAL_SLEEP(0)


async def test_a_pause_closes_the_valve_and_the_rest_waits_for_the_resume(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch)

    async def _pause():
        await coord.async_pause_watering()

    sleeps.on(300, _pause)
    task = asyncio.ensure_future(coord.async_run_direct_valves())
    await _settle()

    # Closed, and nothing else opened while it is paused.
    assert _log(hass) == ["zone_0 on", "wait 300", "zone_0 off"]
    assert not task.done()

    await coord.async_resume_watering()
    await task

    log = _log(hass)
    # The pass that was cut is watered again for what was owed, then the next zone.
    assert log.count("zone_0 on") == 2
    assert log.index("zone_1 on") > log.index("zone_0 off")
    assert "zone_1 off" in log


async def test_a_zone_that_starts_during_a_pause_waits_for_it(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch)
    await coord.async_pause_watering()

    task = asyncio.ensure_future(coord.async_run_direct_valves())
    await _settle()

    assert _log(hass) == []

    await coord.async_resume_watering()
    await task

    assert _log(hass).count("zone_0 on") == 1
    assert _log(hass).count("zone_1 on") == 1


async def test_a_stop_during_a_pause_ends_the_run_with_the_valve_closed(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch)

    async def _pause():
        await coord.async_pause_watering()

    sleeps.on(300, _pause)
    task = asyncio.ensure_future(coord.async_run_direct_valves())
    await _settle()

    await coord.async_stop_watering()
    await asyncio.wait_for(task, 5)

    assert _log(hass)[-1] == "zone_0 off"
    assert "zone_1 on" not in _log(hass)


async def test_a_pause_that_is_not_lifted_lifts_itself(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch)

    async def _pause():
        await coord.async_pause_watering()

    sleeps.on(300, _pause)
    task = asyncio.ensure_future(coord.async_run_direct_valves())
    await _settle()
    assert not task.done()

    sleeps.timer_gate.set()  # an hour goes by
    await asyncio.wait_for(task, 5)

    assert _log(hass).count("zone_1 on") == 1
    assert not coord.watering_paused()


async def test_a_resume_cancels_the_timer_of_the_pause(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch)

    await coord.async_pause_watering()
    timer = coord._pause_timer
    await coord.async_resume_watering()
    await _settle()

    assert timer.cancelled()
    assert not coord.watering_paused()


async def test_next_step_ends_the_zones_of_the_step_and_the_program_goes_on(
    monkeypatch,
):
    program = {
        "id": "evening",
        "name": "Evening",
        "steps": [{"zones": [0]}, {"zones": [1]}],
    }
    hass, coord, sleeps = _setup(monkeypatch, [program])

    async def _next():
        assert await coord.async_skip_step() == [0]

    sleeps.on(300, _next)

    await coord.async_run_program("evening")

    log = _log(hass)
    assert log.index("zone_0 off") < log.index("zone_1 on")
    assert "zone_1 off" in log
    finished = [
        call.args[1]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0].endswith(const.EVENT_PROGRAM_FINISHED)
    ][0]
    # The program was not stopped, one of its steps was cut short.
    assert finished["stopped"] is False


async def test_a_suspended_zone_is_left_out_of_a_cycle(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch)
    await coord.async_suspend(const.SUSPEND_ZONE, 1, hours=24)

    await coord.async_run_direct_valves()

    assert _log(hass).count("zone_0 on") == 1
    assert "zone_1 on" not in _log(hass)


async def test_a_suspension_is_lifted_with_zero_hours_or_by_time(monkeypatch, freezer):
    hass, coord, _ = _setup(monkeypatch)
    await coord.async_suspend(const.SUSPEND_ZONE, 1, hours=24)
    assert coord.is_suspended(const.SUSPEND_ZONE, 1)

    freezer.tick(timedelta(hours=25))
    assert not coord.is_suspended(const.SUSPEND_ZONE, 1)

    await coord.async_suspend(const.SUSPEND_ZONE, 1, hours=24)
    await coord.async_suspend(const.SUSPEND_ZONE, 1, hours=0)
    assert not coord.is_suspended(const.SUSPEND_ZONE, 1)


async def test_a_suspension_until_a_date(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    until = (dt_util.utcnow() + timedelta(days=3)).isoformat()

    end = await coord.async_suspend(const.SUSPEND_PROGRAM, "evening", until=until)

    assert end is not None
    assert coord.is_suspended(const.SUSPEND_PROGRAM, "evening")


async def test_a_suspended_program_is_not_run(monkeypatch):
    program = {"id": "evening", "name": "Evening", "steps": [{"zones": [0]}]}
    hass, coord, _ = _setup(monkeypatch, [program])
    await coord.async_suspend(const.SUSPEND_PROGRAM, "evening", hours=24)

    assert await coord.async_run_program("evening") is False
    assert _log(hass) == []

    await coord.async_suspend(const.SUSPEND_PROGRAM, "evening", hours=0)
    assert await coord.async_run_program("evening") is True


async def test_a_suspended_zone_is_left_out_of_a_program(monkeypatch):
    program = {"id": "evening", "name": "Evening", "steps": [{"zones": [0, 1]}]}
    hass, coord, _ = _setup(monkeypatch, [program])
    await coord.async_suspend(const.SUSPEND_ZONE, 0, hours=24)

    await coord.async_run_program("evening")

    assert "zone_0 on" not in _log(hass)
    assert "zone_1 on" in _log(hass)


async def test_water_a_zone_for_the_seconds_asked(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    coord.store.config.direct_valve_control_enabled = True

    assert await coord.async_water_zone_now(1, seconds=120) is True

    assert _log(hass) == ["zone_1 on", "wait 120", "zone_1 off"]


async def test_water_a_zone_without_a_duration_uses_the_calculated_one(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    coord.store.config.direct_valve_control_enabled = True

    await coord.async_water_zone_now(0)

    assert "wait 300" in _log(hass)


async def test_a_manual_run_during_a_program_takes_its_turn(monkeypatch):
    program = {"id": "evening", "name": "Evening", "steps": [{"zones": [0]}]}
    hass, coord, _ = _setup(monkeypatch, [program])
    coord.store.config.direct_valve_control_enabled = True

    await asyncio.gather(
        coord.async_run_program("evening"), coord.async_water_zone_now(1, seconds=60)
    )

    log = _log(hass)
    assert log.index("zone_0 off") < log.index("zone_1 on")


async def test_a_zone_that_cannot_be_watered_is_not(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    coord.store.config.direct_valve_control_enabled = True
    coord.store.by_id[1][const.ZONE_STATE] = const.ZONE_STATE_DISABLED

    assert await coord.async_water_zone_now(1, seconds=60) is False
    assert await coord.async_water_zone_now(9, seconds=60) is False
    assert _log(hass) == []
