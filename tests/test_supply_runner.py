"""A supply is on while a zone it feeds is being watered, in the order its delays say.

The log below holds every service call and every wait of the runner in the order
they happened, which is what a pump cares about: it must be on before the valve
opens (or after, when the delay is negative), and off after the valve closes
(or before).
"""

import asyncio

import pytest

from custom_components.smart_irrigation import const
from tests.runner_doubles import (
    REAL_SLEEP,
    Coordinator,
    make_hass,
    make_store,
    set_state,
    zone,
)

PUMP = "switch.pump"


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


class LoggedSleeps:
    """asyncio.sleep in the runner: logs the wait among the service calls."""

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


def _supply(**overrides):
    data = {
        const.SUPPLY_ID: "pump",
        const.SUPPLY_NAME: "Pump",
        const.SUPPLY_ENTITIES: [PUMP],
        const.SUPPLY_DELAY_BEFORE: 0,
        const.SUPPLY_DELAY_AFTER: 0,
        const.SUPPLY_ENABLED: True,
    }
    data.update(overrides)
    return data


def _setup(monkeypatch, zone_ids=(0,), *, supply=None, full=True, **store_kwargs):
    hass = make_hass()
    zones = [zone(i, **{const.ZONE_SUPPLY_ID: "pump"}) for i in zone_ids]
    store = make_store(zones, **store_kwargs)
    store.config.full_controller = full
    store.config.supplies = [supply or _supply()]
    coord = Coordinator(hass, store)
    sleeps = LoggedSleeps(hass)
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", sleeps
    )
    return hass, coord, sleeps


def _log(hass):
    """The calls and waits, as short strings, in order."""
    short = []
    for service, entity in hass.calls:
        if service == "sleep":
            short.append(f"wait {entity:g}")
        else:
            name = entity.split(".")[1]
            state = "on" if service in ("turn_on", "open_valve") else "off"
            short.append(f"{name} {state}")
    return short


async def _finish(hass):
    # A timer cancelled by the next zone taking a hold is among them.
    await asyncio.gather(*list(hass.created), return_exceptions=True)


async def test_a_supply_is_on_around_the_valve(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)

    await coord.async_run_direct_valves()

    assert _log(hass) == ["pump on", "zone_0 on", "wait 300", "zone_0 off", "pump off"]


async def test_a_zone_without_a_supply_does_not_touch_one(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    coord.store.by_id[0][const.ZONE_SUPPLY_ID] = None

    await coord.async_run_direct_valves()

    assert _log(hass) == ["zone_0 on", "wait 300", "zone_0 off"]


async def test_the_supply_is_ignored_unless_the_full_controller_is_on(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, full=False)

    await coord.async_run_direct_valves()

    assert _log(hass) == ["zone_0 on", "wait 300", "zone_0 off"]


async def test_a_disabled_supply_is_ignored(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, supply=_supply(enabled=False))

    await coord.async_run_direct_valves()

    assert _log(hass) == ["zone_0 on", "wait 300", "zone_0 off"]


async def test_a_pump_that_leads_waits_before_the_valve_and_after_it(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, supply=_supply(delay_before=5, delay_after=7))

    await coord.async_run_direct_valves()
    await _finish(hass)

    assert _log(hass) == [
        "pump on",
        "wait 5",
        "zone_0 on",
        "wait 300",
        "zone_0 off",
        "wait 7",
        "pump off",
    ]


async def test_a_valve_that_leads_opens_before_the_pump(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, supply=_supply(delay_before=-4))

    await coord.async_run_direct_valves()

    assert _log(hass) == [
        "zone_0 on",
        "wait 4",
        "pump on",
        "wait 296",
        "zone_0 off",
        "pump off",
    ]


async def test_a_pump_that_stops_early_goes_off_before_the_valve_closes(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, supply=_supply(delay_after=-6))

    await coord.async_run_direct_valves()

    assert _log(hass) == [
        "pump on",
        "zone_0 on",
        "wait 294",
        "pump off",
        "wait 6",
        "zone_0 off",
    ]


async def test_the_pump_is_never_off_while_a_valve_is_open(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, zone_ids=(0, 1))

    await coord.async_run_direct_valves()

    pump_on = False
    open_valves = set()
    log = _log(hass)
    for item in log:
        if item == "pump on":
            pump_on = True
        elif item == "pump off":
            assert not open_valves, log
            pump_on = False
        elif item.startswith("zone") and item.endswith(" on"):
            assert pump_on, log
            open_valves.add(item)
        elif item.startswith("zone") and item.endswith(" off"):
            open_valves.discard(item.replace(" off", " on"))
    assert not pump_on


async def test_a_delay_after_keeps_the_pump_on_between_two_zones(monkeypatch):
    """The off timer of one zone is cancelled by the next one taking a hold."""
    hass, coord, _ = _setup(
        monkeypatch, zone_ids=(0, 1), supply=_supply(delay_after=30)
    )

    await coord.async_run_direct_valves()
    await _finish(hass)

    log = _log(hass)
    assert log.count("pump on") == 1
    assert log.count("pump off") == 1
    assert log[-1] == "pump off"


async def test_parallel_zones_hold_one_pump_until_the_last_closes(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, zone_ids=(0, 1), sequencing="parallel")

    await coord.async_run_direct_valves()

    log = _log(hass)
    assert log.count("pump on") == 1
    assert log.count("pump off") == 1
    assert log.index("pump off") > max(log.index("zone_0 off"), log.index("zone_1 off"))


async def test_a_stop_during_the_lead_never_opens_the_valve(monkeypatch):
    hass, coord, sleeps = _setup(monkeypatch, supply=_supply(delay_before=5))

    async def _stop():
        await coord.async_stop_watering()

    sleeps.on(5, _stop)

    await coord.async_run_direct_valves()

    assert _log(hass) == ["pump on", "wait 5", "pump off"]


def _break_pump(hass, *, on=False, off=False, off_times=None):
    """Make the pump's service calls raise: every one, or the first ``off_times`` offs."""
    real = hass.services.async_call.side_effect
    state = {"offs": 0}

    async def _flaky(domain, service, data, **kwargs):
        if data["entity_id"] == PUMP:
            hass.calls.append((service, PUMP))
            if service == "turn_on" and on:
                raise RuntimeError("pump unreachable")
            if service == "turn_off" and off:
                state["offs"] += 1
                if off_times is None or state["offs"] <= off_times:
                    raise RuntimeError("pump unreachable")
            return None
        return await real(domain, service, data, **kwargs)

    hass.services.async_call.side_effect = _flaky


def _supply_reasons(hass):
    return [
        call.args[1]["reason"]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0].endswith(const.EVENT_SUPPLY_PROBLEM)
    ]


def _zone_reasons(hass):
    return [
        call.args[1]["reason"]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0].endswith(const.EVENT_ZONE_PROBLEM)
    ]


async def test_a_pump_that_will_not_come_on_keeps_the_valve_shut(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    _break_pump(hass, on=True)

    await coord.async_run_direct_valves()
    await _finish(hass)

    log = _log(hass)
    assert "zone_0 on" not in log
    # Asked twice, with a wait between, before it is given up on.
    assert log[:3] == ["pump on", "wait 3", "pump on"]
    assert _supply_reasons(hass) == ["supply_did_not_turn_on"]
    assert _zone_reasons(hass) == ["supply_did_not_turn_on"]
    # Not recorded as on, and no hold left behind.
    runtime = coord._supply_runtime()
    assert runtime["on"] == set()
    assert runtime["holds"].in_use() == set()


async def test_a_pump_that_comes_on_at_the_second_ask_is_used(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    real = hass.services.async_call.side_effect
    state = {"ons": 0}

    async def _once(domain, service, data, **kwargs):
        if data["entity_id"] == PUMP and service == "turn_on":
            state["ons"] += 1
            hass.calls.append((service, PUMP))
            if state["ons"] == 1:
                raise RuntimeError("busy")
            return None
        return await real(domain, service, data, **kwargs)

    hass.services.async_call.side_effect = _once

    await coord.async_run_direct_valves()

    log = _log(hass)
    assert "zone_0 on" in log and log[-1] == "pump off"
    assert _supply_reasons(hass) == []


async def test_a_pump_that_will_not_go_off_is_asked_again(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    # The two asks of the release fail, the first retry goes through.
    _break_pump(hass, off=True, off_times=2)

    await coord.async_run_direct_valves()
    runtime = coord._supply_runtime()
    # Still recorded as on right after the failed release.
    assert "pump" in runtime["on"]
    assert "supply_did_not_turn_off" in _supply_reasons(hass)
    await _finish(hass)

    log = _log(hass)
    assert log.count("pump off") == 3
    assert "wait 15" in log
    assert runtime["on"] == set()


async def test_the_retries_of_a_pump_that_stays_on_are_bounded(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    _break_pump(hass, off=True)

    await coord.async_run_direct_valves()
    await _finish(hass)

    log = _log(hass)
    # 2 asks at the release, then 2 at each of the 3 retries.
    assert log.count("pump off") == 8
    assert "pump" in coord._supply_runtime()["on"]
    # Nothing holds it and it is recorded as on: the next start asks again.
    hass.calls.clear()
    await coord.async_align_valves()
    await _finish(hass)
    assert _log(hass).count("pump off") >= 1


async def test_a_retry_leaves_a_pump_that_a_new_run_holds(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    _break_pump(hass, off=True)
    await coord.async_run_direct_valves()
    runtime = coord._supply_runtime()
    runtime["holds"].acquire("pump", object())
    hass.calls.clear()

    await _finish(hass)

    assert "pump off" not in _log(hass)


async def test_a_store_failure_while_clearing_the_run_still_releases_the_pump(
    monkeypatch,
):
    hass, coord, _ = _setup(monkeypatch)
    calls = {"n": 0}

    async def _update(changes):
        calls["n"] += 1
        # Only the write that clears the run of the zone fails.
        if changes.get(const.CONF_ACTIVE_VALVE_RUNS) == []:
            raise RuntimeError("disk full")

    coord.store.async_update_config.side_effect = _update

    await coord.async_run_direct_valves()
    await _finish(hass)

    log = _log(hass)
    assert log[-1] == "pump off"
    assert coord._supply_runtime()["holds"].in_use() == set()


async def test_a_teardown_switches_off_a_pump_with_a_pending_timer(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, supply=_supply(delay_after=30))
    gate = asyncio.Event()

    async def _timer_blocks(seconds, *args, **kwargs):
        hass.calls.append(("sleep", seconds))
        if seconds == 30:
            await gate.wait()

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _timer_blocks
    )

    await coord.async_run_direct_valves()
    for _ in range(5):
        await REAL_SLEEP(0)
    assert "pump off" not in _log(hass)
    assert "pump" in coord._supply_runtime()["off_tasks"]

    coord.async_teardown_valve_runs()
    await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert _log(hass)[-1] == "pump off"
    assert coord._supply_runtime()["on"] == set()


async def test_a_pump_whose_state_was_unknown_is_looked_at_again(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    set_state(hass, PUMP, "unavailable")

    await coord.async_align_valves()
    assert _log(hass) == []
    # The entity comes up, on, before the recheck.
    set_state(hass, PUMP, "on")
    await _finish(hass)

    assert _log(hass) == ["wait 30", "pump off"]


async def test_the_recheck_of_an_unreadable_pump_is_bounded(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)

    await coord.async_align_valves()
    # Each recheck schedules the next: follow them until there are none.
    seen = 0
    while len(hass.created) != seen:
        seen = len(hass.created)
        await asyncio.gather(*list(hass.created), return_exceptions=True)

    assert _log(hass) == ["wait 30", "wait 90"]


async def test_a_second_zone_waits_for_the_pump_lead_to_be_over(monkeypatch):
    hass, coord, _ = _setup(
        monkeypatch,
        zone_ids=(0, 1),
        supply=_supply(delay_before=5),
        sequencing="parallel",
    )

    await coord.async_run_direct_valves()

    log = _log(hass)
    assert log.count("pump on") == 1
    first_valve = min(log.index("zone_0 on"), log.index("zone_1 on"))
    assert log.index("pump on") < log.index("wait 5") < first_valve


async def test_a_zone_arriving_while_the_pump_goes_off_turns_it_on_after(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    supply = coord._supply_for_zone(coord.store.get_zone(0))
    real = hass.services.async_call.side_effect
    gate = asyncio.Event()

    async def _slow_off(domain, service, data, **kwargs):
        if data["entity_id"] == PUMP:
            hass.calls.append((service, PUMP))
            if service == "turn_off":
                await gate.wait()
            return None
        return await real(domain, service, data, **kwargs)

    hass.services.async_call.side_effect = _slow_off
    runtime = coord._supply_runtime()
    first, second = object(), object()
    runtime["holds"].acquire("pump", first)
    runtime["on"].add("pump")

    release = asyncio.ensure_future(coord._supply_release(supply, first))
    for _ in range(5):
        await REAL_SLEEP(0)
    arrive = asyncio.ensure_future(coord._supply_before_open(supply, second, 1))
    for _ in range(5):
        await REAL_SLEEP(0)
    # The new zone's on-call cannot be sent while the off is in flight.
    assert _log(hass) == ["pump off"]

    gate.set()
    await asyncio.gather(release, arrive)

    assert _log(hass) == ["pump off", "pump on"]
    assert "pump" in runtime["on"]


async def test_an_expired_run_found_at_startup_puts_its_pump_off(monkeypatch):
    import datetime

    import homeassistant.util.dt as dt_util

    hass, coord, _ = _setup(monkeypatch)
    set_state(hass, PUMP, "on")
    started = (dt_util.utcnow() - datetime.timedelta(seconds=400)).isoformat()
    run = {
        const.RUN_ZONE_ID: 0,
        const.RUN_ENTITY_ID: "switch.zone_0",
        const.RUN_STARTED: started,
        const.RUN_DURATION: 300.0,
    }

    await coord._resume_one(run)

    log = _log(hass)
    assert "zone_0 off" in log
    assert log.index("zone_0 off") < log.index("pump off")


async def test_a_zone_with_several_valves_keeps_the_pump_around_all_of_them(
    monkeypatch,
):
    hass, coord, _ = _setup(monkeypatch)
    coord.store.by_id[0][const.ZONE_EXTRA_ENTITIES] = ["switch.extra"]

    await coord.async_run_direct_valves()

    log = _log(hass)
    assert log[0] == "pump on"
    assert log[-1] == "pump off"
    assert max(log.index("zone_0 on"), log.index("extra on")) < log.index("wait 300")
    assert max(log.index("zone_0 off"), log.index("extra off")) < log.index("pump off")
    assert log.count("pump on") == 1 and log.count("pump off") == 1


async def test_a_valve_that_will_not_close_still_releases_the_pump_and_says_so(
    monkeypatch,
):
    hass, coord, _ = _setup(monkeypatch)
    hass.stuck.add("switch.zone_0")

    await coord.async_run_direct_valves()

    log = _log(hass)
    assert log.count("zone_0 off") == 2
    assert log[-1] == "pump off"
    assert _zone_reasons(hass) == ["valve_did_not_close"]
    assert coord._supply_runtime()["holds"].in_use() == set()


async def test_a_reload_while_a_run_is_open_puts_the_supply_off_at_once(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, supply=_supply(delay_after=30))
    gate = asyncio.Event()

    async def _blocked(seconds, *args, **kwargs):
        hass.calls.append(("sleep", seconds))
        await gate.wait()

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _blocked
    )
    task = asyncio.ensure_future(coord.async_run_direct_valves())
    for _ in range(20):
        await REAL_SLEEP(0)

    task.cancel()
    gate.set()
    with pytest.raises(asyncio.CancelledError):
        await task

    # No timer is left behind to fire after the reload.
    assert _log(hass)[-1] == "pump off"
    assert coord._supply_runtime()["off_tasks"] == {}


async def test_a_pump_left_on_with_no_run_is_put_off_at_startup(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    set_state(hass, PUMP, "on")

    await coord.async_align_valves()

    assert _log(hass) == ["pump off"]


async def test_a_pump_whose_state_is_unknown_is_left_alone(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    set_state(hass, PUMP, "unavailable")

    await coord.async_align_valves()

    assert _log(hass) == []


async def test_a_pump_held_by_a_run_is_not_put_off_at_startup(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    set_state(hass, PUMP, "on")
    coord._supply_runtime()["holds"].acquire("pump", object())

    await coord.async_align_valves()

    assert _log(hass) == []
