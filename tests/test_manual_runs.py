"""Manual runs of the full controller: a total for a program, queue or replace,
stopping one program, and switching programs, steps and schedules by service.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
import voluptuous as vol
from homeassistant.exceptions import ServiceValidationError

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_runner import scale_plan_to_total
from custom_components.smart_irrigation.programs import normalize_programs
from custom_components.smart_irrigation.service_handlers import ServiceHandlersMixin
from custom_components.smart_irrigation.watering_control import (
    RUN_PROGRAM_SCHEMA,
    SET_PROGRAM_ENABLED_SCHEMA,
    SET_SCHEDULE_ENABLED_SCHEMA,
    SET_STEP_ENABLED_SCHEMA,
    STOP_PROGRAM_SCHEMA,
    WATER_ZONE_SCHEMA,
)
from tests.runner_doubles import Coordinator, set_state
from tests.test_program_runner import _events, _log, _program
from tests.test_watering_control import (
    _settle,
    _silence_dispatcher,  # noqa: F401
)
from tests.test_watering_control import _setup as _base_setup


def _setup(monkeypatch, programs, zone_ids=(0, 1)):
    return _base_setup(monkeypatch, programs, zone_ids=zone_ids)


def _hold(sleeps, seconds):
    """Hold the wait of ``seconds`` until the returned gate is set."""
    gate = asyncio.Event()

    async def _wait():
        await gate.wait()

    sleeps.on(seconds, _wait)
    return gate


def _two_programs():
    return [
        _program(steps=[{"zones": [0]}, {"zones": [1]}]),
        _program(id="night", name="Night", steps=[{"zones": [1]}]),
    ]


# --- the total of a program ---------------------------------------------------------


def test_a_total_is_shared_in_proportion_to_the_planned_durations():
    plan = [
        [
            {"id": "a", "zones": [{"zone_id": 0, "seconds": 300, "passes": 1}]},
            {
                "id": "b",
                "zones": [
                    {"zone_id": 1, "seconds": 600, "passes": 1, "lead": 30},
                    {"zone_id": 2, "seconds": 300, "passes": 1},
                ],
            },
        ]
    ]

    scaled = scale_plan_to_total(plan, 450)

    first, second = scaled[0]
    assert first["zones"][0]["seconds"] == pytest.approx(150)
    assert second["zones"][0]["seconds"] == pytest.approx(300)
    assert second["zones"][1]["seconds"] == pytest.approx(150)
    assert second["zones"][0]["lead"] == pytest.approx(15)
    # The plan it was given is left alone.
    assert plan[0][0]["zones"][0]["seconds"] == 300


def test_an_empty_plan_is_returned_as_it_is():
    assert scale_plan_to_total([], 600) == []


async def test_a_program_run_for_a_total_waters_each_step_its_share(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, _two_programs())
    coord.store.by_id[1][const.ZONE_DURATION] = 600

    assert await coord.async_run_program("evening", seconds=450) is True

    waits = [i for i in _log(hass) if i.startswith("wait")]
    assert waits == ["wait 150", "wait 300"]


async def test_a_program_run_without_a_total_keeps_its_planned_durations(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, _two_programs())

    await coord.async_run_program("evening")

    assert [i for i in _log(hass) if i.startswith("wait")] == ["wait 300", "wait 300"]


# --- queue and replace ----------------------------------------------------------------


async def test_a_manual_run_during_a_program_is_queued_by_default(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, _two_programs())
    gate = _hold(sleeps, 300)
    run = asyncio.ensure_future(coord.async_run_program("night"))
    await _settle()

    manual = asyncio.ensure_future(coord.async_water_zone_now(0, 60))
    await _settle()
    assert _log(hass) == ["zone_1 on", "wait 300"]

    gate.set()
    await asyncio.wait_for(asyncio.gather(run, manual), 5)

    log = _log(hass)
    assert log.index("zone_0 on") > log.index("zone_1 off")


async def test_a_zone_replaces_what_is_running_when_asked(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, _two_programs())
    _hold(sleeps, 300)
    run = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()

    assert await asyncio.wait_for(coord.async_water_zone_now(1, 60, mode="replace"), 5)
    await asyncio.wait_for(run, 5)

    log = _log(hass)
    # The program is cut short, cleanly, and its second step never starts.
    assert log == [
        "zone_0 on",
        "wait 300",
        "zone_0 off",
        "zone_1 on",
        "wait 60",
        "zone_1 off",
    ]
    [finished] = _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert finished["stopped"] is True


async def test_a_program_replaces_what_is_running_when_asked(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, _two_programs())
    _hold(sleeps, 300)
    first = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()

    assert await asyncio.wait_for(coord.async_run_program("night", mode="replace"), 5)
    await asyncio.wait_for(first, 5)

    log = _log(hass)
    assert log.index("zone_1 on") > log.index("zone_0 off")
    assert log.count("zone_0 on") == 1
    finished = _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert [f["program_id"] for f in finished] == ["evening", "night"]
    assert [f["stopped"] for f in finished] == [True, False]


async def test_a_program_can_replace_its_own_run(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, _two_programs())
    _hold(sleeps, 300)
    first = asyncio.ensure_future(coord.async_run_program("night"))
    await _settle()

    again = await asyncio.wait_for(coord.async_run_program("night", mode="replace"), 5)
    await asyncio.wait_for(first, 5)

    assert again is True
    assert _log(hass).count("zone_1 on") == 2


async def test_the_same_program_asked_again_is_refused_when_queued(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, _two_programs())
    gate = _hold(sleeps, 300)
    first = asyncio.ensure_future(coord.async_run_program("night"))
    await _settle()

    assert await coord.async_run_program("night") is False

    gate.set()
    await first


async def test_nothing_is_stopped_when_the_controller_is_off(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, _two_programs())
    coord.async_stop_watering = AsyncMock()
    coord.store.config.full_controller = False

    assert await coord.async_run_program("night", mode="replace") is False
    coord.store.config.direct_valve_control_enabled = False
    assert await coord.async_water_zone_now(0, 60, mode="replace") is False

    coord.async_stop_watering.assert_not_awaited()
    assert hass.calls == []


async def test_nothing_is_stopped_for_a_program_that_does_not_exist(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, _two_programs())
    coord.async_stop_watering = AsyncMock()

    assert await coord.async_run_program("nope", mode="replace") is False

    coord.async_stop_watering.assert_not_awaited()


# --- stopping one program ----------------------------------------------------------


async def test_a_running_program_is_stopped_and_credited(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, _two_programs())
    _hold(sleeps, 300)
    run = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()

    assert await coord.async_stop_program("evening") == "stopped"
    await asyncio.wait_for(run, 5)

    assert _log(hass) == ["zone_0 on", "wait 300", "zone_0 off"]
    [finished] = _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert finished["stopped"] is True
    assert [z["zone_id"] for z in finished["zones"]] == [0]
    assert coord._program_registry() == {}


async def test_a_waiting_program_is_taken_out_of_the_queue(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, _two_programs())
    gate = _hold(sleeps, 300)
    first = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    second = asyncio.ensure_future(coord.async_run_program("night"))
    await _settle()
    assert set(coord._program_registry()) == {"evening", "night"}

    assert await coord.async_stop_program("night") == "dequeued"
    assert set(coord._program_registry()) == {"evening"}

    gate.set()
    await asyncio.wait_for(asyncio.gather(first, second), 5)

    # Zone 1 is only the second step of the first program: night never ran.
    assert [e["program_id"] for e in _events(hass, const.EVENT_PROGRAM_STARTED)] == [
        "evening"
    ]
    # And it can be asked for again.
    assert await coord.async_run_program("night") is True


async def test_stopping_an_unknown_program_does_nothing(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, _two_programs())

    assert await coord.async_stop_program("nope") is None
    assert hass.calls == []


# --- the services --------------------------------------------------------------------


class Handlers(ServiceHandlersMixin, Coordinator):
    """The handlers on the runner's test coordinator, with a configuration update."""

    rearmed = 0

    async def async_update_config(self, data):
        # What the panel's save does: the programs are cleaned, stored, armed again.
        data = {
            **data,
            const.CONF_PROGRAMS: normalize_programs(data[const.CONF_PROGRAMS]),
        }
        for key, value in data.items():
            setattr(self.store.config, key, value)
        self.rearmed += 1


def _handlers(monkeypatch, programs):
    hass, coord, _ = _setup(monkeypatch, programs)
    return hass, Handlers(hass, coord.store)


def _call(**data):
    return SimpleNamespace(data=data)


@pytest.mark.parametrize("seconds", ["abc", 0, -3, 10**9, float("nan"), "1e999"])
def test_run_program_bounds_its_seconds_like_water_zone(seconds):
    with pytest.raises(vol.Invalid):
        RUN_PROGRAM_SCHEMA({"program_id": "a", "seconds": seconds})
    with pytest.raises(vol.Invalid):
        WATER_ZONE_SCHEMA({"seconds": seconds})


def test_the_schemas_take_a_mode_and_the_new_services_their_fields():
    assert RUN_PROGRAM_SCHEMA({"program_id": "a", "seconds": 600, "mode": "replace"})
    assert RUN_PROGRAM_SCHEMA({"program_id": "a"})
    assert WATER_ZONE_SCHEMA({"mode": "queue"})
    with pytest.raises(vol.Invalid):
        RUN_PROGRAM_SCHEMA({"program_id": "a", "mode": "later"})
    with pytest.raises(vol.Invalid):
        WATER_ZONE_SCHEMA({"mode": "later"})
    assert STOP_PROGRAM_SCHEMA({"program_id": "a"})
    assert (
        SET_PROGRAM_ENABLED_SCHEMA({"program_id": "a", "enabled": "off"})["enabled"]
        is False
    )
    assert SET_STEP_ENABLED_SCHEMA({"program_id": "a", "step_id": "s", "enabled": True})
    assert SET_SCHEDULE_ENABLED_SCHEMA(
        {"program_id": "a", "schedule_id": "s", "enabled": False}
    )
    with pytest.raises(vol.Invalid):
        SET_STEP_ENABLED_SCHEMA({"program_id": "a", "enabled": True})
    with pytest.raises(vol.Invalid):
        SET_PROGRAM_ENABLED_SCHEMA({"program_id": "a", "enabled": "maybe"})


async def test_the_handlers_refuse_a_bad_mode_or_seconds_before_a_task_exists(
    monkeypatch,
):
    hass, handlers = _handlers(monkeypatch, _two_programs())
    set_state(hass, "sensor.zone_0", "1", attributes={const.ZONE_ID: 0})

    with pytest.raises(ServiceValidationError):
        await handlers.handle_run_program(_call(program_id="night", mode="later"))
    with pytest.raises(ServiceValidationError):
        await handlers.handle_run_program(_call(program_id="night", seconds=0))
    with pytest.raises(ServiceValidationError):
        await handlers.handle_water_zone(
            _call(entity_id=["sensor.zone_0"], mode="later")
        )

    assert hass.created == []


async def test_only_the_first_zone_of_a_call_replaces(monkeypatch):
    hass, handlers = _handlers(monkeypatch, _two_programs())
    set_state(hass, "sensor.zone_0", "1", attributes={const.ZONE_ID: 0})
    set_state(hass, "sensor.zone_1", "1", attributes={const.ZONE_ID: 1})
    handlers.async_water_zone_now = AsyncMock()

    await handlers.handle_water_zone(
        _call(entity_id=["sensor.zone_0", "sensor.zone_1"], seconds=60, mode="replace")
    )
    await asyncio.gather(*hass.created)

    assert [c.args for c in handlers.async_water_zone_now.await_args_list] == [
        (0, 60.0, "replace"),
        (1, 60.0),
    ]


async def test_run_program_service_passes_its_total_and_mode(monkeypatch):
    hass, handlers = _handlers(monkeypatch, _two_programs())
    handlers.async_run_program = AsyncMock()

    await handlers.handle_run_program(_call(program_id="night"))
    await handlers.handle_run_program(
        _call(program_id="night", seconds="900", mode="replace")
    )
    await asyncio.gather(*hass.created)

    first, second = handlers.async_run_program.await_args_list
    assert first.args == ("night",) and first.kwargs == {}
    assert second.args == ("night",)
    assert second.kwargs == {"seconds": 900.0, "mode": "replace"}


async def test_the_stop_program_service_ignores_an_unknown_id(monkeypatch):
    hass, handlers = _handlers(monkeypatch, _two_programs())

    await handlers.handle_stop_program(_call(program_id="nope"))
    await handlers.handle_stop_program(_call(program_id=""))

    assert hass.calls == []


async def test_a_program_is_switched_off_and_on_by_service(monkeypatch):
    hass, handlers = _handlers(monkeypatch, _two_programs())

    await handlers.handle_set_program_enabled(_call(program_id="night", enabled=False))
    stored = {p["id"]: p for p in handlers.store.config.programs}
    assert stored["night"][const.PROGRAM_ENABLED] is False
    assert stored["evening"][const.PROGRAM_ENABLED] is True
    assert handlers.rearmed == 1

    # Already as asked: nothing is written.
    await handlers.handle_set_program_enabled(_call(program_id="night", enabled=False))
    assert handlers.rearmed == 1

    await handlers.handle_set_program_enabled(_call(program_id="night", enabled=True))
    stored = {p["id"]: p for p in handlers.store.config.programs}
    assert stored["night"][const.PROGRAM_ENABLED] is True
    assert handlers.rearmed == 2


async def test_a_step_and_a_schedule_are_switched_by_service(monkeypatch):
    program = _program(
        steps=[{"id": "s1", "zones": [0]}, {"id": "s2", "zones": [1]}],
        schedules=[{"time": "06:00"}],
    )
    hass, handlers = _handlers(monkeypatch, [program])
    schedule_id = handlers.store.config.programs[0][const.PROGRAM_SCHEDULES][0]["id"]

    await handlers.handle_set_step_enabled(
        _call(program_id="evening", step_id="s2", enabled=False)
    )
    await handlers.handle_set_schedule_enabled(
        _call(program_id="evening", schedule_id=schedule_id, enabled=False)
    )

    [stored] = handlers.store.config.programs
    assert [s["enabled"] for s in stored[const.PROGRAM_STEPS]] == [True, False]
    assert stored[const.PROGRAM_SCHEDULES][0]["enabled"] is False
    assert stored[const.PROGRAM_ENABLED] is True
    assert handlers.rearmed == 2


async def test_unknown_ids_and_a_controller_that_is_off_change_nothing(monkeypatch):
    program = _program(steps=[{"id": "s1", "zones": [0]}])
    hass, handlers = _handlers(monkeypatch, [program])

    await handlers.handle_set_program_enabled(_call(program_id="nope", enabled=False))
    await handlers.handle_set_step_enabled(
        _call(program_id="evening", step_id="nope", enabled=False)
    )
    await handlers.handle_set_step_enabled(
        _call(program_id="nope", step_id="s1", enabled=False)
    )
    await handlers.handle_set_schedule_enabled(
        _call(program_id="evening", schedule_id="nope", enabled=False)
    )
    handlers.store.config.full_controller = False
    await handlers.handle_set_program_enabled(
        _call(program_id="evening", enabled=False)
    )

    assert handlers.rearmed == 0
    assert handlers.store.config.programs[0][const.PROGRAM_ENABLED] is True
