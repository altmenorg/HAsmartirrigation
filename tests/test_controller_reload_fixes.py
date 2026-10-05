"""What a real-instance test of the full controller found after a reload.

A resumed program reads as running, a resumed pass does not count the downtime
as water, the last run of a program is kept for every kind of run, the program
sensor hangs off the hub device, and the panel's pages get a clean answer while
the integration reloads.
"""

import asyncio
from datetime import timedelta
from unittest.mock import AsyncMock, MagicMock

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const, websockets
from custom_components.smart_irrigation.program_sensor import (
    SmartIrrigationProgramSensor,
)
from custom_components.smart_irrigation.programs import normalize_programs
from tests.runner_doubles import REAL_SLEEP, Coordinator, make_hass, make_store, zone
from tests.test_full_controller_review import _coordinator, _stored, _update


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


class Sleeps:
    def __init__(self):
        self.waited = []
        self.hooks = {}

    def on(self, seconds, hook):
        self.hooks[float(seconds)] = hook

    async def __call__(self, seconds, *args, **kwargs):
        self.waited.append(seconds)
        hook = self.hooks.pop(float(seconds), None)
        if hook is not None:
            await hook()


def _program(**overrides):
    data = {
        const.PROGRAM_ID: "evening",
        const.PROGRAM_NAME: "Evening",
        const.PROGRAM_STEPS: [{"zones": [0]}],
    }
    data.update(overrides)
    return data


def _setup(monkeypatch, programs, zone_ids=(0, 1)):
    hass = make_hass()
    store = make_store([zone(i) for i in zone_ids])
    store.config.full_controller = True
    store.config.programs = normalize_programs(programs)
    store.config.active_cycle = None
    store.config.active_program_run = None
    store.config.program_last_runs = None
    store.config.program_last_started = None
    store.config.suspensions = None

    async def _update_config(changes):
        for key, value in changes.items():
            setattr(store.config, key, value)

    store.async_update_config = AsyncMock(side_effect=_update_config)
    coord = Coordinator(hass, store)
    sleeps = Sleeps()
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", sleeps
    )
    return hass, coord, sleeps


def _open_record(started_ago, duration=20, **extra):
    started = dt_util.utcnow() - timedelta(seconds=started_ago)
    return {
        const.RUN_ZONE_ID: 0,
        const.RUN_ENTITY_ID: "switch.zone_0",
        const.RUN_STARTED: started.isoformat(),
        const.RUN_DURATION: duration,
        **extra,
    }


# --- A8: a resumed program reads as running -------------------------------------


async def test_a_program_reads_running_while_its_interrupted_pass_is_finished(
    monkeypatch, freezer
):
    hass, coord, sleeps = _setup(monkeypatch, [_program()])
    plan = [
        [{"id": "a", "zones": [{"zone_id": 0, "seconds": 20, "passes": 1}], "delay": 0}]
    ]
    coord.store.config.active_valve_runs = [_open_record(5)]
    coord.store.config.active_program_run = {
        "program_id": "evening",
        "name": "Evening",
        "manual": False,
        "plan": plan,
        "tour": 0,
        "step": 0,
        "started_zones": [0],
        "started": dt_util.utcnow().isoformat(),
    }
    seen = {}

    async def _look():
        seen["live"] = coord.async_live_state()["programs"]
        seen["overview"] = await coord.async_program_overview()

    sleeps.on(15, _look)

    await coord.async_resume_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    [live] = seen["live"]
    assert live["program_id"] == "evening" and live["state"] == "running"
    assert [p["state"] for p in seen["overview"] if p["program_id"] == "evening"] == [
        "running"
    ]
    # And once over, nothing is left saying it runs.
    assert coord.async_live_state()["programs"] == []


# --- A9: the downtime of a reload is not water ----------------------------------


async def test_a_resumed_pass_is_owed_the_time_the_valve_was_shut(monkeypatch, freezer):
    hass, coord, sleeps = _setup(monkeypatch, [_program()])
    coord._credit_direct_run = AsyncMock()
    # Opened 100 s ago, shut by the reload after 5 s of its 20 s.
    coord.store.config.active_valve_runs = [_open_record(100, delivered=5.0)]

    await coord.async_resume_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert 15.0 in sleeps.waited
    assert coord._credit_direct_run.await_args.kwargs["held"] == 20


async def test_without_a_record_of_the_interruption_the_clock_is_all_there_is(
    monkeypatch, freezer
):
    hass, coord, sleeps = _setup(monkeypatch, [_program()])
    coord._credit_direct_run = AsyncMock()
    coord.store.config.active_valve_runs = [_open_record(5)]

    await coord.async_resume_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert 15.0 in sleeps.waited


async def test_a_very_old_interrupted_pass_is_closed_with_what_it_delivered(
    monkeypatch, freezer
):
    hass, coord, sleeps = _setup(monkeypatch, [_program()])
    coord._credit_direct_run = AsyncMock()
    age = const.CYCLE_RESUME_MAX_AGE_SECONDS + 60
    coord.store.config.active_valve_runs = [_open_record(age, delivered=5.0)]

    await coord.async_resume_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert sleeps.waited == []
    assert coord._credit_direct_run.await_args.kwargs["held"] == 5.0


async def test_a_reload_records_how_long_the_valve_was_open(monkeypatch, freezer):
    hass, coord, _ = _setup(monkeypatch, [_program()])
    gate = asyncio.Event()

    async def _blocked(seconds, *args, **kwargs):
        await gate.wait()

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _blocked
    )
    task = asyncio.ensure_future(coord._run_one_valve(coord.store.get_zone(0)))
    for _ in range(30):
        await REAL_SLEEP(0)
    freezer.tick(7)

    task.cancel()
    gate.set()
    with pytest.raises(asyncio.CancelledError):
        await task

    runs = [
        call.args[0][const.CONF_ACTIVE_VALVE_RUNS]
        for call in coord.store.async_update_config.await_args_list
        if call.args[0].get(const.CONF_ACTIVE_VALVE_RUNS)
    ]
    assert runs[-1][0][const.RUN_DELIVERED] == pytest.approx(7.0)


# --- A10: the last run of a program ---------------------------------------------


async def test_a_manual_program_run_is_recorded_as_the_last_run(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program()])

    await coord.async_run_program("evening", manual=True)

    started = coord.store.config.program_last_started
    assert dt_util.parse_datetime(started["evening"]) is not None
    [overview] = [
        p for p in await coord.async_program_overview() if p["program_id"] == "evening"
    ]
    assert overview["last_run"] == started["evening"]


async def test_a_main_program_run_is_recorded_as_the_last_run(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [{"id": "main"}, _program()])
    main = [p for p in coord.store.config.programs if p.get(const.PROGRAM_MAIN)][0]
    coord.store.config.direct_valve_control_enabled = True

    await coord.async_run_direct_valves([0])

    assert main[const.PROGRAM_ID] in coord.store.config.program_last_started


async def test_the_last_run_is_dropped_with_its_program():
    coordinator = _coordinator(_stored("a"))
    coordinator.store.config.program_last_started = {
        "evening": "2026-06-01T04:00:00+00:00",
        "gone": "2026-06-01T04:00:00+00:00",
    }

    written = await _update(coordinator, {const.CONF_PROGRAMS: _stored("a")})

    assert written[const.CONF_PROGRAM_LAST_STARTED] == {
        "evening": "2026-06-01T04:00:00+00:00"
    }


async def test_the_main_program_shows_the_next_start_of_the_active_trigger(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program()])
    coord.async_program_overview = AsyncMock(
        return_value=[
            {"program_id": "main", "main": True, "state": "idle", "next_start": None}
        ]
    )
    coord.async_live_state = MagicMock(return_value={})
    monkeypatch.setattr(
        websockets,
        "build_irrigation_info",
        AsyncMock(return_value={"next_irrigation_start": "2026-06-02T04:00:00+00:00"}),
    )
    hass.data = {const.DOMAIN: {"coordinator": coord}}
    connection = MagicMock()

    await _call(hass, websockets.websocket_get_programs_state, connection)

    result = connection.send_result.call_args.args[1]
    assert result["programs"][0]["next_start"] == "2026-06-02T04:00:00+00:00"


# --- A11: the sensor hangs off the hub device -----------------------------------


def test_the_program_sensor_is_on_the_hub_device_under_its_own_name():
    hass = MagicMock()
    hass.data = {const.DOMAIN: {}}
    sensor = SmartIrrigationProgramSensor(
        hass, {"program_id": "sandbox", "name": "Sandbox", "state": "idle"}
    )

    info = sensor.device_info

    assert info["identifiers"] == {(const.DOMAIN, const.DOMAIN)}
    assert "via_device" not in info and "via_device_id" not in info
    assert sensor.name == "Program Sandbox"
    assert sensor.entity_id == "sensor.smart_irrigation_program_sandbox"


# --- A12: the panel's pages while the integration reloads -----------------------


async def _call(hass, handler, connection, msg=None):
    """Run an async_response handler to its end."""
    tasks = []

    def _background(coro, *args, **kwargs):
        task = asyncio.ensure_future(coro)
        tasks.append(task)
        return task

    hass.async_create_background_task = _background
    hass.async_create_task = _background
    handler(hass, connection, msg or {"id": 1, "type": "x"})
    await asyncio.gather(*tasks)


@pytest.mark.parametrize(
    "handler",
    [
        websockets.websocket_get_irrigation_info,
        websockets.websocket_get_planning,
        websockets.websocket_get_programs_state,
    ],
)
async def test_the_pages_get_a_clean_not_ready_while_the_integration_reloads(handler):
    hass = MagicMock()
    hass.data = {}  # the entry is unloaded: its data is gone
    connection = MagicMock()

    await _call(hass, handler, connection)

    connection.send_error.assert_called_once()
    assert connection.send_error.call_args.args[:2] == (1, "not_ready")
    connection.send_result.assert_not_called()
