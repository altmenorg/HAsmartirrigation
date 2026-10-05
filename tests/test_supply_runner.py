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


async def test_a_failing_pump_does_not_stop_the_watering(monkeypatch):
    hass, coord, _ = _setup(monkeypatch)
    real = hass.services.async_call.side_effect

    async def _flaky(domain, service, data, **kwargs):
        if data["entity_id"] == PUMP:
            hass.calls.append((service, PUMP))
            raise RuntimeError("pump unreachable")
        return await real(domain, service, data, **kwargs)

    hass.services.async_call.side_effect = _flaky

    await coord.async_run_direct_valves()

    log = _log(hass)
    assert "zone_0 on" in log and "zone_0 off" in log
    reasons = [
        call.args[1]["reason"]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0].endswith(const.EVENT_SUPPLY_PROBLEM)
    ]
    assert "supply_did_not_turn_on" in reasons
    # The off is tried twice before it is reported.
    assert log.count("pump off") == 2
    assert "supply_did_not_turn_off" in reasons


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
