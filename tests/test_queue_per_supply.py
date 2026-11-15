"""One queue per supply: runs that share no water water side by side.

Until now everything took one turn: a program on the well pump waited for one on
the mains to finish. Runs now take their turn on the supplies of their zones;
zones without a supply share the mains, so an installation without supplies
runs one program at a time as before.

The waits run on the virtual clock of test_program_overlap: each line of the
timeline is the second a valve or pump switched.
"""

import asyncio

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.planning_sequence import sequence_planning
from custom_components.smart_irrigation.program_runner import program_run_records
from custom_components.smart_irrigation.programs import normalize_programs
from custom_components.smart_irrigation.turns import NO_SUPPLY, Turns, clash
from tests.runner_doubles import REAL_SLEEP, Coordinator, make_hass, make_store, zone
from tests.test_program_overlap import Clock

WELL = "switch.well"


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


# --- the turns ------------------------------------------------------------------------


async def _settle():
    for _ in range(10):
        await REAL_SLEEP(0)


def _holder(turns, keys, log, name, release):
    async def _run():
        async with turns.turn(lambda: keys):
            log.append(f"{name} in")
            await release.wait()
            log.append(f"{name} out")

    return asyncio.ensure_future(_run())


async def test_runs_on_different_supplies_go_together():
    turns, log, release = Turns(), [], asyncio.Event()
    tasks = [
        _holder(turns, frozenset({"well"}), log, "well", release),
        _holder(turns, frozenset({NO_SUPPLY}), log, "mains", release),
    ]
    await _settle()

    assert log == ["well in", "mains in"]
    release.set()
    await asyncio.gather(*tasks)


async def test_runs_on_the_same_supply_take_turns():
    turns, log = Turns(), []
    first, second = asyncio.Event(), asyncio.Event()
    tasks = [
        _holder(turns, frozenset({"well"}), log, "a", first),
        _holder(turns, frozenset({"well", NO_SUPPLY}), log, "b", second),
    ]
    await _settle()
    assert log == ["a in"]

    first.set()
    await _settle()
    assert log == ["a in", "a out", "b in"]
    second.set()
    await asyncio.gather(*tasks)


async def test_a_run_on_every_supply_waits_for_all_and_holds_all_back():
    turns, log = Turns(), []
    gates = [asyncio.Event() for _ in range(3)]
    tasks = [
        _holder(turns, frozenset({"well"}), log, "well", gates[0]),
        _holder(turns, None, log, "main", gates[1]),
        _holder(turns, frozenset({NO_SUPPLY}), log, "mains", gates[2]),
    ]
    await _settle()
    # The mains is free, but the main program asked first and needs it too.
    assert log == ["well in"]

    gates[0].set()
    await _settle()
    assert log[-1] == "main in"
    gates[1].set()
    await _settle()
    assert log[-1] == "mains in"
    gates[2].set()
    await asyncio.gather(*tasks)


async def test_a_run_that_needs_two_supplies_is_not_overtaken():
    turns, log = Turns(), []
    gates = [asyncio.Event() for _ in range(3)]
    tasks = [
        _holder(turns, frozenset({"well"}), log, "well", gates[0]),
        _holder(turns, frozenset({"well", NO_SUPPLY}), log, "both", gates[1]),
        _holder(turns, frozenset({NO_SUPPLY}), log, "mains", gates[2]),
    ]
    await _settle()

    assert log == ["well in"]
    gates[0].set()
    await _settle()
    assert log[-1] == "both in"
    gates[1].set()
    await _settle()
    assert log[-1] == "mains in"
    gates[2].set()
    await asyncio.gather(*tasks)


async def test_a_run_given_up_while_it_waits_lets_the_next_go():
    turns, log = Turns(), []
    gate, never = asyncio.Event(), asyncio.Event()
    first = _holder(turns, frozenset({"well"}), log, "a", gate)
    second = _holder(turns, frozenset({"well", NO_SUPPLY}), log, "b", never)
    third = _holder(turns, frozenset({NO_SUPPLY}), log, "c", gate)
    await _settle()
    assert log == ["a in"]
    assert turns.would_wait(frozenset({NO_SUPPLY}))

    second.cancel()
    await _settle()

    assert log == ["a in", "c in"]
    gate.set()
    await asyncio.gather(first, third)
    assert not turns.busy()


def test_what_clashes():
    assert clash(frozenset({"a"}), frozenset({"a", "b"}))
    assert not clash(frozenset({"a"}), frozenset({"b"}))
    assert clash(None, frozenset())
    assert not clash(frozenset(), frozenset({"a"}))


# --- programs, the main program and a zone by hand ------------------------------------


def _setup(monkeypatch, programs):
    """Zones 0 and 1 on the well pump, 2 and 3 on the mains (no supply)."""
    hass = make_hass()
    zones = [zone(i, **{const.ZONE_SUPPLY_ID: "well"}) for i in (0, 1)] + [
        zone(i) for i in (2, 3)
    ]
    store = make_store(zones)
    store.config.full_controller = True
    store.config.programs = normalize_programs(programs)
    store.config.active_cycle = None
    store.config.active_program_run = None
    store.config.supplies = [
        {
            const.SUPPLY_ID: "well",
            const.SUPPLY_NAME: "Well",
            const.SUPPLY_ENTITIES: [WELL],
            const.SUPPLY_DELAY_BEFORE: 0,
            const.SUPPLY_DELAY_AFTER: 0,
            const.SUPPLY_ENABLED: True,
        }
    ]

    async def _update(changes):
        for key, value in changes.items():
            setattr(store.config, key, value)

    store.async_update_config.side_effect = _update
    coord = Coordinator(hass, store)
    clock = Clock()
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", clock.sleep
    )
    timeline: list = []
    inner = hass.services.async_call

    async def _timed(domain, service, data, **kwargs):
        name = data["entity_id"].split(".")[1]
        state = "on" if service in ("turn_on", "open_valve") else "off"
        timeline.append((clock.now, f"{name} {state}"))
        return await inner(domain, service, data, **kwargs)

    hass.services.async_call = _timed
    return hass, coord, clock, timeline


def _program(program_id, *steps):
    return {
        const.PROGRAM_ID: program_id,
        const.PROGRAM_NAME: program_id.title(),
        const.PROGRAM_STEPS: [{"zones": list(zones)} for zones in steps],
    }


PROGRAMS = [
    _program("well", [0], [1]),
    _program("mains", [2], [3]),
    _program("garden", [3]),
    _program("both", [0], [2]),
]


async def _drive(clock, *coros):
    main = asyncio.ensure_future(asyncio.gather(*coros))
    await asyncio.wait_for(clock.drive(main), 10)
    return await main


def _on(timeline, name):
    return [t for t, what in timeline if what == f"{name} on"]


async def test_two_programs_on_different_supplies_water_side_by_side(monkeypatch):
    hass, coord, clock, timeline = _setup(monkeypatch, PROGRAMS)

    await _drive(
        clock, coord.async_run_program("well"), coord.async_run_program("mains")
    )

    # Each zone runs 300 s; both programs start at once and end at 600 s.
    assert _on(timeline, "zone_0") == [0.0]
    assert _on(timeline, "zone_2") == [0.0]
    assert _on(timeline, "zone_1") == [300.0]
    assert _on(timeline, "zone_3") == [300.0]
    assert _on(timeline, "well")[0] == 0.0


async def test_two_programs_on_the_mains_still_take_turns(monkeypatch):
    hass, coord, clock, timeline = _setup(monkeypatch, PROGRAMS)

    await _drive(
        clock, coord.async_run_program("mains"), coord.async_run_program("garden")
    )

    # Garden waits for Mains (zone 3 again at 600 s, after Mains' zone 3).
    assert _on(timeline, "zone_3") == [300.0, 600.0]


async def test_a_program_on_two_supplies_waits_for_both_and_is_not_overtaken(
    monkeypatch,
):
    hass, coord, clock, timeline = _setup(monkeypatch, PROGRAMS)

    async def _later(program_id):
        await REAL_SLEEP(0)
        return await coord.async_run_program(program_id)

    await _drive(
        clock,
        coord.async_run_program("well"),
        _later("both"),
        _later("mains"),
    )

    # Both waits for Well (600 s), though the mains is free; and Mains, asked
    # after Both, does not overtake it: it waits until Both is over.
    assert _on(timeline, "zone_0") == [0.0, 600.0]
    both_ends = next(t for t, what in timeline if what == "zone_2 off")
    assert _on(timeline, "zone_2")[0] > 600.0
    assert _on(timeline, "zone_2")[1] == both_ends
    assert _on(timeline, "zone_3")[0] > both_ends


async def test_the_main_program_waits_for_a_program_on_another_supply(monkeypatch):
    hass, coord, clock, timeline = _setup(monkeypatch, PROGRAMS)

    async def _then_main():
        await REAL_SLEEP(0)
        await coord.async_run_direct_valves([2])

    await _drive(clock, coord.async_run_program("well"), _then_main())

    assert _on(timeline, "zone_2") == [600.0]


async def test_a_zone_by_hand_waits_only_for_its_own_supply(monkeypatch):
    hass, coord, clock, timeline = _setup(monkeypatch, PROGRAMS)

    async def _by_hand(zone_id):
        await REAL_SLEEP(0)
        return await coord.async_water_zone_now(zone_id, seconds=60)

    await _drive(clock, coord.async_run_program("well"), _by_hand(2), _by_hand(1))

    assert _on(timeline, "zone_2") == [0.0]
    # Zone 1 is the well's: after the program (which watered it at 300 s).
    assert _on(timeline, "zone_1") == [300.0, 600.0]


async def test_a_manual_run_on_a_free_supply_is_not_recorded_as_queued(monkeypatch):
    hass, coord, clock, timeline = _setup(monkeypatch, PROGRAMS)
    queued = {}

    async def _ask():
        await REAL_SLEEP(0)
        task = asyncio.ensure_future(coord.async_run_program("mains"))
        await REAL_SLEEP(0)
        queued["mains"] = coord._program_registry()["mains"].queued
        task2 = asyncio.ensure_future(coord.async_run_program("both"))
        await REAL_SLEEP(0)
        queued["both"] = coord._program_registry()["both"].queued
        await asyncio.gather(task, task2)

    await _drive(clock, coord.async_run_program("well"), _ask())

    assert queued == {"mains": False, "both": True}


async def test_next_step_can_keep_to_one_program(monkeypatch):
    hass, coord, clock, timeline = _setup(monkeypatch, PROGRAMS)

    async def _skip():
        await clock.sleep(100)
        assert await coord.async_skip_step("mains") == [2]

    await _drive(
        clock,
        coord.async_run_program("well"),
        coord.async_run_program("mains"),
        _skip(),
    )

    # Mains moved on to zone 3 at 100 s; Well kept its 300 s.
    assert _on(timeline, "zone_3") == [100.0]
    assert _on(timeline, "zone_1") == [300.0]


# --- the record that survives a restart -----------------------------------------------


async def test_each_program_watering_has_its_own_record(monkeypatch):
    hass, coord, clock, timeline = _setup(monkeypatch, PROGRAMS)
    seen = {}

    async def _look():
        await clock.sleep(100)
        seen["both"] = dict(coord.store.config.active_program_run)
        await clock.sleep(400)
        seen["one"] = dict(coord.store.config.active_program_run or {})

    async def _short():
        return await coord.async_run_program("garden")

    await _drive(clock, coord.async_run_program("well"), _short(), _look())

    assert set(seen["both"]) == {"well", "garden"}
    # Garden is over at 300 s; Well's record is still there.
    assert set(seen["one"]) == {"well"}
    assert seen["one"]["well"]["step"] == 1
    assert coord.store.config.active_program_run is None


def test_the_record_of_one_program_from_before_is_read():
    old = {"program_id": "evening", "plan": [[]], "tour": 0, "step": 0}

    assert program_run_records(old) == {"evening": old}
    assert program_run_records(None) == {}
    assert program_run_records({"evening": old}) == {"evening": old}
    # Not a record: left out.
    assert program_run_records({"evening": {"program_id": "other"}}) == {}


async def test_a_restart_goes_on_with_every_program_that_was_watering(monkeypatch):
    hass, coord, clock, timeline = _setup(monkeypatch, PROGRAMS)
    member = lambda z: {"zone_id": z, "seconds": 300, "passes": 1}  # noqa: E731

    def _record(program_id, zones):
        return {
            "program_id": program_id,
            "name": program_id.title(),
            "manual": False,
            "plan": [
                [{"id": f"s{z}", "zones": [member(z)], "delay": 0} for z in zones]
            ],
            "tour": 0,
            "step": 0,
            "started_zones": [zones[0]],
            "started": dt_util.utcnow().isoformat(),
        }

    coord.store.config.active_program_run = {
        "well": _record("well", [0, 1]),
        "mains": _record("mains", [2, 3]),
    }

    await coord.async_resume_valve_runs()
    await _drive(clock, *list(hass.created))

    # The zones that had started are finished by their own records (none here);
    # each program goes on with its next step, side by side.
    assert _on(timeline, "zone_1") == [0.0]
    assert _on(timeline, "zone_3") == [0.0]
    assert coord.store.config.active_program_run is None


# --- the planning -----------------------------------------------------------------------


def _planned(program_id, start, minutes, zones):
    begin = dt_util.parse_datetime(start)
    end = begin + __import__("datetime").timedelta(minutes=minutes)
    return {
        "program_id": program_id,
        "program": program_id.title(),
        "start": begin.isoformat(),
        "end": end.isoformat(),
        "steps": [{"zones": [{"zone_id": z, "zone": f"Zone {z}"} for z in zones]}],
    }


def test_the_planning_waits_only_behind_a_run_on_the_same_supply():
    supplies = {
        "well": frozenset({"well"}),
        "mains": frozenset({NO_SUPPLY}),
        "garden": frozenset({NO_SUPPLY}),
        "main": None,
    }
    planned = [
        _planned("well", "2026-06-01T05:00:00+00:00", 30, [0]),
        _planned("mains", "2026-06-01T05:00:00+00:00", 30, [2]),
        _planned("garden", "2026-06-01T05:10:00+00:00", 10, [3]),
    ]

    items = {
        i["program_id"]: i
        for i in sequence_planning(planned, keys=lambda i: supplies[i["program_id"]])
    }

    assert items["mains"]["waits_for"] is None
    assert items["garden"]["waits_for"]["program_id"] == "mains"
    assert items["garden"]["expected_start"] == "2026-06-01T05:30:00+00:00"


def test_without_supplies_the_planning_waits_behind_every_run():
    planned = [
        _planned("well", "2026-06-01T05:00:00+00:00", 30, [0]),
        _planned("mains", "2026-06-01T05:00:00+00:00", 30, [2]),
    ]

    items = sequence_planning(planned)

    assert items[1]["waits_for"]["program_id"] == "well"


def test_the_coordinator_names_the_supplies_of_a_program(monkeypatch):
    hass, coord, clock, timeline = _setup(
        monkeypatch,
        [*PROGRAMS, {"id": "main", "name": "Watering", "steps": [{"zones": [2]}]}],
    )

    assert coord.program_turn_keys("well") == frozenset({"well"})
    assert coord.program_turn_keys("both") == frozenset({"well", NO_SUPPLY})
    # The old main program takes the turn on the supplies of its zones only.
    assert coord.program_turn_keys("main") == frozenset({NO_SUPPLY})
    assert coord.program_turn_keys("gone") == frozenset()
