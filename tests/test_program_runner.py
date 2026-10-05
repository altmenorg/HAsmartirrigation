"""Running a program: its steps in order, their zones together, one turn at a time.

The log holds every service call and wait of the runner in the order they
happened, as in test_supply_runner.py.
"""

import asyncio

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


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


class LoggedSleeps:
    def __init__(self, hass):
        self.hass = hass
        self.hooks = {}

    def on(self, seconds, hook):
        self.hooks[float(seconds)] = hook

    async def __call__(self, seconds, *args, **kwargs):
        self.hass.calls.append(("sleep", seconds))
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


def _setup(monkeypatch, programs, zone_ids=(0, 1, 2), **store_kwargs):
    hass = make_hass()
    store = make_store([zone(i) for i in zone_ids], **store_kwargs)
    store.config.full_controller = True
    store.config.programs = normalize_programs(programs)
    store.config.active_cycle = None
    store.config.active_program_run = None
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


def _events(hass, name):
    return [
        call.args[1]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0].endswith(name)
    ]


async def test_steps_run_in_order_with_their_zones_together(monkeypatch):
    program = _program(
        steps=[{"zones": [0]}, {"zones": [1, 2]}],
        delay=10,
    )
    hass, coord, _ = _setup(monkeypatch, [program])

    assert await coord.async_run_program("evening") is True

    log = _log(hass)
    assert log[:4] == ["zone_0 on", "wait 300", "zone_0 off", "wait 10"]
    # Zones 1 and 2 are open together: both open before either closes.
    tail = log[4:]
    assert set(tail[:2]) == {"zone_1 on", "zone_2 on"}
    assert set(tail[-2:]) == {"zone_1 off", "zone_2 off"}


async def test_the_program_says_when_it_starts_and_ends(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program()])

    await coord.async_run_program("evening")

    [started] = _events(hass, const.EVENT_PROGRAM_STARTED)
    [finished] = _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert started["program_id"] == "evening"
    assert started["manual"] is True
    assert started["zones"][0]["zone_id"] == 0
    assert finished["zones"][0]["seconds"] == 300
    assert finished["problems"] == []
    assert finished["stopped"] is False


async def test_a_percent_step_waters_a_share_of_the_calculated_water(monkeypatch):
    program = _program(steps=[{"zones": [0], "mode": "percent", "percent": 50}])
    hass, coord, _ = _setup(monkeypatch, [program])

    await coord.async_run_program("evening")

    assert "wait 150" in _log(hass)


async def test_a_fixed_step_waters_for_the_seconds_it_sets(monkeypatch):
    program = _program(steps=[{"zones": [0], "mode": "fixed", "seconds": 90}])
    hass, coord, _ = _setup(monkeypatch, [program])

    await coord.async_run_program("evening")

    assert "wait 90" in _log(hass)


async def test_a_step_in_passes_soaks_between_them(monkeypatch):
    program = _program(steps=[{"zones": [0], "passes": 2}])
    hass, coord, _ = _setup(monkeypatch, [program], soak=5)

    await coord.async_run_program("evening")

    log = _log(hass)
    assert log.count("zone_0 on") == 2
    assert log.count("wait 150") == 2
    assert "wait 300" in log  # the soak, five minutes


async def test_tours_water_the_whole_list_again_with_a_share_each(monkeypatch):
    program = _program(steps=[{"zones": [0]}, {"zones": [1]}], tours=2)
    hass, coord, _ = _setup(monkeypatch, [program])

    await coord.async_run_program("evening")

    opened = [i for i in _log(hass) if i.endswith(" on")]
    assert opened == ["zone_0 on", "zone_1 on", "zone_0 on", "zone_1 on"]
    assert _log(hass).count("wait 150") == 4


async def test_a_stop_ends_the_program_after_the_open_zone(monkeypatch):
    program = _program(steps=[{"zones": [0]}, {"zones": [1]}])
    hass, coord, sleeps = _setup(monkeypatch, [program])

    async def _stop():
        await coord.async_stop_watering()

    sleeps.on(300, _stop)

    await coord.async_run_program("evening")

    assert [i for i in _log(hass) if i.endswith(" on")] == ["zone_0 on"]
    [finished] = _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert finished["stopped"] is True
    assert finished["problems"] == []


async def test_a_second_program_waits_for_its_turn(monkeypatch):
    first = _program(id="first", name="First", steps=[{"zones": [0]}])
    second = _program(id="second", name="Second", steps=[{"zones": [1]}])
    hass, coord, _ = _setup(monkeypatch, [first, second])

    await asyncio.gather(
        coord.async_run_program("first"), coord.async_run_program("second")
    )

    log = _log(hass)
    assert log.index("zone_0 off") < log.index("zone_1 on")


async def test_a_cycle_of_the_main_program_takes_its_turn_too(monkeypatch):
    prog = _program(steps=[{"zones": [0]}])
    hass, coord, _ = _setup(monkeypatch, [{"id": "main"}, prog], zone_ids=(0, 1))
    coord.store.config.direct_valve_control_enabled = True

    await asyncio.gather(
        coord.async_run_program("evening"), coord.async_run_direct_valves([1])
    )

    log = _log(hass)
    assert log.index("zone_0 off") < log.index("zone_1 on")


async def test_a_program_asked_twice_runs_once(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program()])

    first, second = await asyncio.gather(
        coord.async_run_program("evening"), coord.async_run_program("evening")
    )

    assert (first, second) == (True, False)
    assert _log(hass).count("zone_0 on") == 1


async def test_a_disabled_program_or_the_controller_off_runs_nothing(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program(enabled=False)])

    assert await coord.async_run_program("evening") is False
    assert await coord.async_run_program("nope") is False

    coord.store.config.programs = normalize_programs([_program()])
    coord.store.config.full_controller = False
    assert await coord.async_run_program("evening") is False
    assert _log(hass) == []


async def test_the_zones_are_read_when_the_turn_comes(monkeypatch):
    """A zone watered while the program waited is not watered again."""
    first = _program(id="first", name="First", steps=[{"zones": [1]}])
    second = _program(id="second", name="Second", steps=[{"zones": [0]}])
    hass, coord, sleeps = _setup(monkeypatch, [first, second], zone_ids=(0, 1))

    async def _spent():
        coord.store.by_id[0][const.ZONE_DURATION] = 0

    sleeps.on(300, _spent)

    await asyncio.gather(
        coord.async_run_program("first"), coord.async_run_program("second")
    )

    assert _log(hass).count("zone_0 on") == 0
    assert _log(hass).count("zone_1 on") == 1


async def test_the_run_is_recorded_at_each_step_and_cleared_at_the_end(monkeypatch):
    program = _program(steps=[{"zones": [0]}, {"zones": [1]}])
    hass, coord, sleeps = _setup(monkeypatch, [program])
    seen = []

    async def _look():
        for call in coord.store.async_update_config.await_args_list:
            record = call.args[0].get(const.CONF_ACTIVE_PROGRAM_RUN)
            if record:
                seen.append((record["tour"], record["step"]))

    sleeps.on(300, _look)

    await coord.async_run_program("evening")

    assert seen[-1] == (0, 0)
    last = [
        call.args[0]
        for call in coord.store.async_update_config.await_args_list
        if const.CONF_ACTIVE_PROGRAM_RUN in call.args[0]
    ][-1]
    assert last[const.CONF_ACTIVE_PROGRAM_RUN] is None


async def test_a_cancelled_program_keeps_its_record(monkeypatch):
    program = _program(steps=[{"zones": [0]}, {"zones": [1]}])
    hass, coord, _ = _setup(monkeypatch, [program])
    gate = asyncio.Event()

    async def _blocked(seconds, *args, **kwargs):
        await gate.wait()

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _blocked
    )
    task = asyncio.ensure_future(coord.async_run_program("evening"))
    for _ in range(30):
        await REAL_SLEEP(0)

    task.cancel()
    gate.set()
    with pytest.raises(asyncio.CancelledError):
        await task

    records = [
        call.args[0][const.CONF_ACTIVE_PROGRAM_RUN]
        for call in coord.store.async_update_config.await_args_list
        if const.CONF_ACTIVE_PROGRAM_RUN in call.args[0]
    ]
    assert records[-1] is not None
    assert records[-1]["step"] == 0


async def test_a_restart_goes_on_with_the_steps_still_to_do(monkeypatch):
    program = _program(steps=[{"zones": [0]}, {"zones": [1]}, {"zones": [2]}])
    hass, coord, _ = _setup(monkeypatch, [program])
    plan = [
        [
            {
                "id": "a",
                "zones": [{"zone_id": 0, "seconds": 300, "passes": 1}],
                "delay": 0,
            },
            {
                "id": "b",
                "zones": [{"zone_id": 1, "seconds": 300, "passes": 1}],
                "delay": 0,
            },
            {
                "id": "c",
                "zones": [{"zone_id": 2, "seconds": 300, "passes": 1}],
                "delay": 0,
            },
        ]
    ]
    coord.store.config.active_program_run = {
        "program_id": "evening",
        "name": "Evening",
        "manual": False,
        "plan": plan,
        "tour": 0,
        "step": 0,  # zone 0 was the open one: its own record finishes it
        "started_zones": [0],
        "started": dt_util.utcnow().isoformat(),
    }

    await coord.async_resume_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert [i for i in _log(hass) if i.endswith(" on")] == ["zone_1 on", "zone_2 on"]
    [started] = _events(hass, const.EVENT_PROGRAM_STARTED)
    assert started["resumed"] is True


async def test_a_program_run_from_another_day_is_not_resumed(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, [_program()])
    coord.store.config.active_program_run = {
        "program_id": "evening",
        "plan": [
            [
                {
                    "id": "a",
                    "zones": [{"zone_id": 0, "seconds": 300, "passes": 1}],
                    "delay": 0,
                }
            ]
        ],
        "tour": 0,
        "step": -1,
        "started": "2020-01-01T00:00:00+00:00",
    }

    await coord.async_resume_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert _log(hass) == []


async def test_a_restart_waters_the_zones_of_the_step_that_had_not_started(monkeypatch):
    program = _program(steps=[{"zones": [0, 1]}, {"zones": [2]}])
    hass, coord, _ = _setup(monkeypatch, [program])
    member = lambda z: {"zone_id": z, "seconds": 300, "passes": 1}  # noqa: E731
    coord.store.config.active_program_run = {
        "program_id": "evening",
        "name": "Evening",
        "manual": False,
        "plan": [
            [
                {"id": "a", "zones": [member(0), member(1)], "delay": 0},
                {"id": "b", "zones": [member(2)], "delay": 0},
            ]
        ],
        "tour": 0,
        "step": 0,
        "started_zones": [0],
        "started": dt_util.utcnow().isoformat(),
    }

    await coord.async_resume_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert [i for i in _log(hass) if i.endswith(" on")] == ["zone_1 on", "zone_2 on"]


async def test_a_stop_by_zone_keeps_it_out_of_the_later_steps(monkeypatch):
    program = _program(steps=[{"zones": [0]}, {"zones": [1]}, {"zones": [1, 2]}])
    hass, coord, sleeps = _setup(monkeypatch, [program])

    async def _stop_zone_1():
        await coord.async_stop_watering([1])

    sleeps.on(300, _stop_zone_1)

    await coord.async_run_program("evening")

    opened = [i for i in _log(hass) if i.endswith(" on")]
    assert "zone_1 on" not in opened
    assert "zone_2 on" in opened
