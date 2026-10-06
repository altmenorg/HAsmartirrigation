"""Gaps the reviews of the full controller listed.

The planning and live state pages, lights and covers as supplies and extra
valves, two supplies at once, and a stop or a suspension that reaches a program
while it waits for its turn.
"""

import asyncio
from unittest.mock import MagicMock

import pytest

from custom_components.smart_irrigation import const, websockets
from custom_components.smart_irrigation.programs import normalize_programs
from tests.runner_doubles import REAL_SLEEP, Coordinator, make_hass, make_store, zone
from tests.test_program_status import _program as _status_program
from tests.test_program_status import _status


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


# --- the pages of the panel ---------------------------------------------------


async def _call(hass, handler, msg=None):
    """Run an async_response handler to its end, with a mocked connection."""
    tasks = []

    def _background(coro, *args, **kwargs):
        task = asyncio.ensure_future(coro)
        tasks.append(task)
        return task

    hass.async_create_background_task = _background
    hass.async_create_task = _background
    connection = MagicMock()
    handler(hass, connection, msg or {"id": 1, "type": "x"})
    await asyncio.gather(*tasks)
    return connection


_SCHEDULES = [{"time": "06:00"}]


async def test_the_planning_page_sends_the_starts_of_the_schedules():
    hass, coord = _status([_status_program(_SCHEDULES)])
    hass.data = {const.DOMAIN: {"coordinator": coord}}

    connection = await _call(
        hass, websockets.websocket_get_planning, {"id": 7, "type": "x", "days": 2}
    )

    connection.send_error.assert_not_called()
    [(msg_id, planned)] = [c.args for c in connection.send_result.call_args_list]
    assert msg_id == 7
    assert planned and {p["program_id"] for p in planned} == {"evening"}


async def test_the_planning_page_is_empty_with_the_full_controller_off():
    hass, coord = _status([_status_program(_SCHEDULES)])
    coord.store.config.full_controller = False
    hass.data = {const.DOMAIN: {"coordinator": coord}}

    connection = await _call(hass, websockets.websocket_get_planning)

    connection.send_result.assert_called_once_with(1, [])


async def test_the_state_page_sends_the_programs_and_what_is_live():
    hass, coord = _status([_status_program(_SCHEDULES)])
    hass.data = {const.DOMAIN: {"coordinator": coord}}

    connection = await _call(hass, websockets.websocket_get_programs_state)

    connection.send_error.assert_not_called()
    result = connection.send_result.call_args.args[1]
    assert [p["program_id"] for p in result["programs"]] == ["evening"]
    assert result["live"]["programs"] == []
    assert result["live"]["paused"] is False


async def test_the_state_page_is_empty_with_the_full_controller_off():
    hass, coord = _status([_status_program(_SCHEDULES)])
    coord.store.config.full_controller = False
    hass.data = {const.DOMAIN: {"coordinator": coord}}

    connection = await _call(hass, websockets.websocket_get_programs_state)

    result = connection.send_result.call_args.args[1]
    assert result["programs"] == []


# --- lights and covers --------------------------------------------------------

_STATE_AFTER = {
    "turn_on": "on",
    "turn_off": "off",
    "open_cover": "open",
    "close_cover": "closed",
    "open_valve": "open",
    "close_valve": "closed",
}


def _domain_aware(hass):
    """A hass whose entities take the state their domain's service gives."""
    from tests.runner_doubles import set_state

    async def _call_service(domain, service, data, **kwargs):
        entity_id = data["entity_id"]
        hass.calls.append((service, entity_id))
        assert entity_id.split(".")[0] == domain
        set_state(hass, entity_id, _STATE_AFTER[service])

    hass.services.async_call.side_effect = _call_service


def _supply(supply_id, entity, **overrides):
    data = {
        const.SUPPLY_ID: supply_id,
        const.SUPPLY_NAME: supply_id,
        const.SUPPLY_ENTITIES: [entity],
        const.SUPPLY_DELAY_BEFORE: 0,
        const.SUPPLY_DELAY_AFTER: 0,
        const.SUPPLY_ENABLED: True,
    }
    data.update(overrides)
    return data


def _setup(monkeypatch, zones, supplies, **store_kwargs):
    hass = make_hass()
    _domain_aware(hass)
    store = make_store(zones, **store_kwargs)
    store.config.full_controller = True
    store.config.supplies = supplies
    coord = Coordinator(hass, store)

    async def _sleep(seconds, *args, **kwargs):
        hass.calls.append(("sleep", seconds))
        await REAL_SLEEP(0)

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _sleep
    )
    return hass, coord


def _order(hass):
    return [c for c in hass.calls if c[0] != "sleep"]


def _problem_events(hass):
    return [
        c.args[1]
        for c in hass.bus.async_fire.call_args_list
        if c.args[0].endswith(const.EVENT_SUPPLY_PROBLEM)
        or c.args[0].endswith(const.EVENT_ZONE_PROBLEM)
    ]


@pytest.mark.parametrize(
    ("entity", "on", "off", "state_on", "state_off"),
    [
        ("light.pump", "turn_on", "turn_off", "on", "off"),
        ("cover.pump", "open_cover", "close_cover", "open", "closed"),
    ],
)
async def test_a_light_or_a_cover_can_be_the_supply(
    monkeypatch, entity, on, off, state_on, state_off
):
    hass, coord = _setup(
        monkeypatch,
        [zone(0, **{const.ZONE_SUPPLY_ID: "pump"})],
        [_supply("pump", entity)],
    )

    await coord.async_run_direct_valves()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert _order(hass) == [
        (on, entity),
        ("turn_on", "switch.zone_0"),
        ("turn_off", "switch.zone_0"),
        (off, entity),
    ]
    assert hass.states_by_id[entity].state == state_off
    assert _problem_events(hass) == []


@pytest.mark.parametrize(
    ("entity", "on", "off"),
    [
        ("light.extra", "turn_on", "turn_off"),
        ("cover.extra", "open_cover", "close_cover"),
        ("valve.extra", "open_valve", "close_valve"),
    ],
)
async def test_a_light_a_cover_or_a_valve_can_be_an_extra_valve(
    monkeypatch, entity, on, off
):
    hass, coord = _setup(
        monkeypatch, [zone(0, **{const.ZONE_EXTRA_ENTITIES: [entity]})], []
    )

    await coord.async_run_direct_valves()

    calls = _order(hass)
    assert (on, entity) in calls and (off, entity) in calls
    assert calls.index((on, entity)) < calls.index((off, entity))
    assert hass.states_by_id[entity].state in ("off", "closed")
    assert _problem_events(hass) == []


# --- two supplies, a supply shared by a parallel step -----------------------------


async def test_two_supplies_run_at_the_same_time_each_around_its_own_zone(monkeypatch):
    zones = [
        zone(0, **{const.ZONE_SUPPLY_ID: "a"}),
        zone(1, **{const.ZONE_SUPPLY_ID: "b"}),
    ]
    hass, coord = _setup(
        monkeypatch,
        zones,
        [_supply("a", "switch.pump_a"), _supply("b", "switch.pump_b")],
        sequencing="parallel",
    )

    await coord.async_run_direct_valves()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    calls = _order(hass)
    for pump, valve in (("switch.pump_a", "zone_0"), ("switch.pump_b", "zone_1")):
        on = calls.index(("turn_on", pump))
        opened = calls.index(("turn_on", f"switch.{valve}"))
        closed = calls.index(("turn_off", f"switch.{valve}"))
        off = calls.index(("turn_off", pump))
        assert on < opened < closed < off
    # Each pump was switched once, not once per zone.
    assert len([c for c in calls if c[0] == "turn_on" and "pump" in c[1]]) == 2
    assert _problem_events(hass) == []


async def test_a_supply_shared_by_a_parallel_step_with_a_leading_valve(monkeypatch):
    zones = [zone(i, **{const.ZONE_SUPPLY_ID: "pump"}) for i in (0, 1)]
    hass, coord = _setup(
        monkeypatch,
        zones,
        [_supply("pump", "switch.pump", **{const.SUPPLY_DELAY_BEFORE: -5})],
        sequencing="parallel",
    )

    await coord.async_run_direct_valves()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    calls = _order(hass)
    assert calls.count(("turn_on", "switch.pump")) == 1
    assert calls.count(("turn_off", "switch.pump")) == 1
    # A negative delay before: the valves lead, and the pump goes off last.
    assert calls.index(("turn_on", "switch.zone_0")) < calls.index(
        ("turn_on", "switch.pump")
    )
    assert calls.index(("turn_off", "switch.pump")) > max(
        calls.index(("turn_off", "switch.zone_0")),
        calls.index(("turn_off", "switch.zone_1")),
    )


# --- a stop or a suspension while a program waits for its turn --------------------


def _programs_setup(monkeypatch):
    hass = make_hass()
    store = make_store([zone(0), zone(1)])
    store.config.full_controller = True
    store.config.supplies = []
    store.config.programs = normalize_programs(
        [
            {"id": "first", "name": "First", "steps": [{"zones": [0]}]},
            {"id": "second", "name": "Second", "steps": [{"zones": [1]}]},
        ]
    )
    store.config.active_cycle = None
    store.config.active_program_run = None
    store.config.suspensions = None

    async def _update(changes):
        for key, value in changes.items():
            setattr(store.config, key, value)

    store.async_update_config.side_effect = _update
    coord = Coordinator(hass, store)
    coord._notify_programs = lambda: None
    hooks = {}

    async def _sleep(seconds, *args, **kwargs):
        hook = hooks.pop(float(seconds), None)
        if hook is not None:
            await hook()
        await REAL_SLEEP(0)

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _sleep
    )
    return hass, coord, hooks


async def test_a_stop_reaches_a_program_still_waiting_for_its_turn(monkeypatch):
    hass, coord, hooks = _programs_setup(monkeypatch)

    async def _stop():
        assert "second" in coord._program_registry()
        await coord.async_stop_watering()

    hooks[300.0] = _stop
    first, second = await asyncio.gather(
        coord.async_run_program("first"), coord.async_run_program("second")
    )

    assert first is True
    assert ("turn_on", "switch.zone_1") not in hass.calls
    assert coord._program_registry() == {}


async def test_a_suspension_reaches_a_program_still_waiting_for_its_turn(monkeypatch):
    hass, coord, hooks = _programs_setup(monkeypatch)

    async def _suspend():
        await coord.async_suspend(const.SUSPEND_PROGRAM, "second", hours=1)

    hooks[300.0] = _suspend
    await asyncio.gather(
        coord.async_run_program("first"), coord.async_run_program("second")
    )

    assert ("turn_on", "switch.zone_0") in hass.calls
    assert ("turn_on", "switch.zone_1") not in hass.calls
    assert coord._program_registry() == {}


async def test_stopping_one_waiting_program_leaves_the_running_one_alone(monkeypatch):
    hass, coord, hooks = _programs_setup(monkeypatch)

    async def _dequeue():
        assert await coord.async_stop_program("second") == "dequeued"

    hooks[300.0] = _dequeue
    await asyncio.gather(
        coord.async_run_program("first"), coord.async_run_program("second")
    )

    assert hass.calls.count(("turn_off", "switch.zone_0")) == 1
    assert ("turn_on", "switch.zone_1") not in hass.calls
