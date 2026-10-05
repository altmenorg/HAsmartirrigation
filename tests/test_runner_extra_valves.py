"""A zone with several valves, a valve that is slow to open, and the valve events."""

import pytest

from custom_components.smart_irrigation import const
from tests.runner_doubles import (
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


def _setup(extras=("switch.second",), *, full=True):
    hass = make_hass()
    store = make_store([zone(0, **{const.ZONE_EXTRA_ENTITIES: list(extras)})])
    store.config.full_controller = full
    store.config.supplies = []
    return hass, Coordinator(hass, store)


def _events(hass, name):
    return [
        call.args[1]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0].endswith(name)
    ]


async def test_every_valve_of_the_zone_opens_and_closes_with_it(sleeps):
    hass, coord = _setup(extras=("switch.second", "valve.third"))

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_0", "switch.second", "valve.third"]
    assert closes(hass) == ["switch.zone_0", "switch.second", "valve.third"]


async def test_the_other_valves_are_ignored_outside_the_full_controller(sleeps):
    hass, coord = _setup(full=False)

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_0"]
    assert closes(hass) == ["switch.zone_0"]


async def test_a_valve_that_fails_to_open_does_not_stop_the_others(sleeps):
    hass, coord = _setup(extras=("switch.second", "switch.third"))
    real = hass.services.async_call.side_effect

    async def _flaky(domain, service, data, **kwargs):
        if data["entity_id"] == "switch.second" and service == "turn_on":
            raise RuntimeError("unreachable")
        return await real(domain, service, data, **kwargs)

    hass.services.async_call.side_effect = _flaky

    await coord.async_run_direct_valves()

    assert "switch.third" in opens(hass)
    assert "valve_did_not_open" in problems(hass)
    # The zone still watered, and every valve was shut at the end.
    assert set(closes(hass)) == {"switch.zone_0", "switch.second", "switch.third"}


async def test_the_other_valves_of_a_zone_are_aligned_at_startup():
    hass, coord = _setup()
    set_state(hass, "switch.second", "on")

    await coord.async_align_valves()

    assert closes(hass) == ["switch.second"]


async def test_each_switch_is_announced_in_the_full_controller(sleeps):
    hass, coord = _setup()

    await coord.async_run_direct_valves()

    on = _events(hass, const.EVENT_VALVE_ON)
    off = _events(hass, const.EVENT_VALVE_OFF)
    assert [e["entity_id"] for e in on] == ["switch.zone_0", "switch.second"]
    assert [e["entity_id"] for e in off] == ["switch.zone_0", "switch.second"]
    assert on[0]["kind"] == "zone" and on[0]["zone_id"] == 0


async def test_nothing_is_announced_outside_the_full_controller(sleeps):
    hass, coord = _setup(full=False)

    await coord.async_run_direct_valves()

    assert _events(hass, const.EVENT_VALVE_ON) == []


async def test_a_supply_is_announced_too(sleeps):
    hass, coord = _setup(extras=())
    coord.store.config.supplies = [
        {
            const.SUPPLY_ID: "pump",
            const.SUPPLY_NAME: "Pump",
            const.SUPPLY_ENTITIES: ["switch.pump"],
            const.SUPPLY_DELAY_BEFORE: 0,
            const.SUPPLY_DELAY_AFTER: 0,
            const.SUPPLY_ENABLED: True,
        }
    ]
    coord.store.by_id[0][const.ZONE_SUPPLY_ID] = "pump"

    await coord.async_run_direct_valves()

    kinds = [(e["entity_id"], e["kind"]) for e in _events(hass, const.EVENT_VALVE_ON)]
    assert ("switch.pump", "supply") in kinds
    assert ("switch.zone_0", "zone") in kinds


def _deaf_valve(hass, entity_id):
    """A valve that hears the open and does not move."""
    real = hass.services.async_call.side_effect

    async def _call(domain, service, data, **kwargs):
        if data["entity_id"] == entity_id and service == "turn_on":
            hass.calls.append((service, entity_id))
            return
        return await real(domain, service, data, **kwargs)

    hass.services.async_call.side_effect = _call
    set_state(hass, entity_id, "off")


async def test_a_valve_that_never_opens_is_asked_again_in_the_full_controller(sleeps):
    hass, coord = _setup(extras=())
    _deaf_valve(hass, "switch.zone_0")

    await coord.async_run_direct_valves()

    # The open, and two more asks on the way, before it is given up on.
    assert opens(hass).count("switch.zone_0") == 3
    assert "valve_did_not_open" in problems(hass)
    assert closes(hass)  # and it was shut


async def test_the_plain_mode_asks_once_and_gives_up_sooner(sleeps):
    hass, coord = _setup(extras=(), full=False)
    _deaf_valve(hass, "switch.zone_0")

    await coord.async_run_direct_valves()

    assert opens(hass).count("switch.zone_0") == 1
    assert "valve_did_not_open" in problems(hass)


async def test_a_slow_valve_that_opens_in_time_is_not_a_failure(sleeps):
    """It opens at the second ask: the run goes ahead and nothing is reported."""
    hass, coord = _setup(extras=())
    real = hass.services.async_call.side_effect
    asks = {"n": 0}

    async def _call(domain, service, data, **kwargs):
        if data["entity_id"] == "switch.zone_0" and service == "turn_on":
            asks["n"] += 1
            hass.calls.append((service, "switch.zone_0"))
            if asks["n"] >= 2:
                set_state(hass, "switch.zone_0", "on")
            return
        return await real(domain, service, data, **kwargs)

    hass.services.async_call.side_effect = _call
    set_state(hass, "switch.zone_0", "off")

    await coord.async_run_direct_valves()

    assert problems(hass) == []
    assert opens(hass).count("switch.zone_0") == 2
