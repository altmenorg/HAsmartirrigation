"""A negative delay between steps overlaps them: the next starts before the end.

The waits run on a virtual clock, so a test reads when each valve and pump
switched, in seconds from the start of the run.
"""

import asyncio
import heapq

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.programs import (
    MAX_OVERLAP_SECONDS,
    normalize_programs,
    overlap_seconds,
    plan_program,
    plan_wall_seconds,
)
from tests.runner_doubles import REAL_SLEEP, Coordinator, make_hass, make_store, zone

PUMP = "switch.pump"


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


class Clock:
    """asyncio.sleep on virtual time: advances to the next wake once all is idle."""

    def __init__(self):
        self.now = 0.0
        self.pending: list = []
        self.seq = 0

    async def sleep(self, seconds, *args, **kwargs):
        if float(seconds) <= 0:
            # A bare yield (the test loop's own) must not wait for the clock.
            await REAL_SLEEP(0)
            return
        future = asyncio.get_running_loop().create_future()
        self.seq += 1
        heapq.heappush(self.pending, (self.now + float(seconds), self.seq, future))
        await future

    async def drive(self, main: asyncio.Future) -> None:
        while not main.done():
            for _ in range(40):
                await REAL_SLEEP(0)
                if main.done():
                    return
            while self.pending and self.pending[0][2].done():
                heapq.heappop(self.pending)
            if not self.pending:
                return
            wake, _, future = heapq.heappop(self.pending)
            self.now = max(self.now, wake)
            future.set_result(None)


def _setup(monkeypatch, programs, zone_ids=(0, 1, 2), pump=False):
    hass = make_hass()
    zones = [
        zone(i, **({const.ZONE_SUPPLY_ID: "pump"} if pump else {})) for i in zone_ids
    ]
    store = make_store(zones)
    store.config.full_controller = True
    store.config.programs = normalize_programs(programs)
    store.config.active_cycle = None
    store.config.active_program_run = None
    if pump:
        store.config.supplies = [
            {
                const.SUPPLY_ID: "pump",
                const.SUPPLY_NAME: "Pump",
                const.SUPPLY_ENTITIES: [PUMP],
                const.SUPPLY_DELAY_BEFORE: 0,
                const.SUPPLY_DELAY_AFTER: 0,
                const.SUPPLY_ENABLED: True,
            }
        ]
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


def _program(**overrides):
    data = {
        const.PROGRAM_ID: "evening",
        const.PROGRAM_NAME: "Evening",
        const.PROGRAM_STEPS: [{"zones": [0]}, {"zones": [1]}],
    }
    data.update(overrides)
    return data


async def _run(coord, clock, *, during=None):
    main = asyncio.ensure_future(coord.async_run_program("evening"))
    helper = asyncio.ensure_future(during()) if during else None
    await asyncio.wait_for(clock.drive(main), 10)
    assert main.done()
    await main
    if helper:
        helper.cancel()


def _at(timeline, event):
    return [t for t, e in timeline if e == event]


async def test_the_next_step_starts_before_the_end_of_the_current_one(monkeypatch):
    hass, coord, clock, timeline = _setup(monkeypatch, [_program(delay=-60)])

    await _run(coord, clock)

    assert _at(timeline, "zone_0 on") == [0.0]
    assert _at(timeline, "zone_1 on") == [240.0]
    assert _at(timeline, "zone_0 off") == [300.0]
    assert _at(timeline, "zone_1 off") == [540.0]
    [finished] = [
        c.args[1]
        for c in hass.bus.async_fire.call_args_list
        if c.args[0].endswith(const.EVENT_PROGRAM_FINISHED)
    ]
    assert sorted(z["zone_id"] for z in finished["zones"]) == [0, 1]
    assert finished["stopped"] is False


async def test_a_step_delay_overrides_the_program_delay(monkeypatch):
    program = _program(delay=0, steps=[{"zones": [0], "delay": -100}, {"zones": [1]}])
    _, coord, clock, timeline = _setup(monkeypatch, [program])

    await _run(coord, clock)

    assert _at(timeline, "zone_1 on") == [200.0]


async def test_the_overlap_never_exceeds_what_the_step_runs(monkeypatch):
    program = _program(delay=-1000)
    _, coord, clock, timeline = _setup(monkeypatch, [program])

    await _run(coord, clock)

    # 1000 s asked, the step only lasts 300 s: both start together.
    assert _at(timeline, "zone_0 on") == [0.0]
    assert _at(timeline, "zone_1 on") == [0.0]
    assert _at(timeline, "zone_1 off") == [300.0]


async def test_three_steps_overlap_in_a_chain(monkeypatch):
    program = _program(
        steps=[{"zones": [0]}, {"zones": [1]}, {"zones": [2]}], delay=-60
    )
    _, coord, clock, timeline = _setup(monkeypatch, [program])

    await _run(coord, clock)

    assert _at(timeline, "zone_1 on") == [240.0]
    assert _at(timeline, "zone_2 on") == [480.0]
    assert _at(timeline, "zone_2 off") == [780.0]


async def test_the_pump_stays_on_across_the_overlap(monkeypatch):
    _, coord, clock, timeline = _setup(monkeypatch, [_program(delay=-60)], pump=True)

    await _run(coord, clock)
    await asyncio.gather(*list(coord.hass.created), return_exceptions=True)

    assert _at(timeline, "pump on") == [0.0]
    # Closing step 1 at 300 does not put the pump off: step 2 still holds it.
    assert _at(timeline, "zone_0 off") == [300.0]
    assert _at(timeline, "pump off") == [540.0]
    assert _at(timeline, "zone_1 off") == [540.0]


async def test_a_stop_during_the_overlap_closes_both(monkeypatch):
    _, coord, clock, timeline = _setup(monkeypatch, [_program(delay=-60)])

    async def _stop():
        await clock.sleep(270)
        await coord.async_stop_watering()

    await _run(coord, clock, during=_stop)

    assert _at(timeline, "zone_0 on") == [0.0]
    assert _at(timeline, "zone_1 on") == [240.0]
    assert _at(timeline, "zone_0 off") == [270.0]
    assert _at(timeline, "zone_1 off") == [270.0]
    [finished] = [
        c.args[1]
        for c in coord.hass.bus.async_fire.call_args_list
        if c.args[0].endswith(const.EVENT_PROGRAM_FINISHED)
    ]
    assert finished["stopped"] is True


async def test_a_stop_before_the_overlap_starts_no_next_step(monkeypatch):
    _, coord, clock, timeline = _setup(monkeypatch, [_program(delay=-60)])

    async def _stop():
        await clock.sleep(100)
        await coord.async_stop_watering()

    await _run(coord, clock, during=_stop)

    assert _at(timeline, "zone_1 on") == []
    assert _at(timeline, "zone_0 off") == [100.0]


async def test_next_step_ends_the_steps_that_are_open(monkeypatch):
    _, coord, clock, timeline = _setup(
        monkeypatch,
        [_program(steps=[{"zones": [0]}, {"zones": [1]}, {"zones": [2]}], delay=-60)],
    )

    async def _skip():
        await clock.sleep(250)
        assert sorted(await coord.async_skip_step()) == [0, 1]

    await _run(coord, clock, during=_skip)

    assert _at(timeline, "zone_0 off") == [250.0]
    assert _at(timeline, "zone_1 off") == [250.0]
    # The third step still follows.
    assert _at(timeline, "zone_2 on") == [250.0]


async def test_a_pause_holds_the_count_of_the_overlap(monkeypatch):
    _, coord, clock, timeline = _setup(monkeypatch, [_program(delay=-60)])

    async def _pause():
        await clock.sleep(100)
        await coord.async_pause_watering()
        await clock.sleep(50)
        await coord.async_resume_watering()

    await _run(coord, clock, during=_pause)

    # Step 2 is never started while paused, and still follows after the resume.
    starts = _at(timeline, "zone_1 on")
    assert starts and all(t >= 150.0 for t in starts)


async def test_positive_delays_stay_serial(monkeypatch):
    _, coord, clock, timeline = _setup(monkeypatch, [_program(delay=10)])

    await _run(coord, clock)

    assert _at(timeline, "zone_0 off") == [300.0]
    assert _at(timeline, "zone_1 on") == [310.0]


async def test_a_negative_delay_after_the_last_step_waits_for_nothing(monkeypatch):
    program = _program(steps=[{"zones": [0], "delay": -60}])
    _, coord, clock, timeline = _setup(monkeypatch, [program])

    await _run(coord, clock)

    assert _at(timeline, "zone_0 off") == [300.0]


def test_normalisation_keeps_a_negative_delay_within_bounds():
    [program] = normalize_programs(
        [
            _program(
                delay=-99999,
                steps=[
                    {"zones": [0], "delay": -30},
                    {"zones": [1], "delay": -(MAX_OVERLAP_SECONDS + 1)},
                    {"zones": [2], "delay": 999999},
                    {"zones": [3]},
                ],
            )
        ]
    )
    assert program["delay"] == -MAX_OVERLAP_SECONDS
    delays = [s["delay"] for s in program["steps"]]
    assert delays == [-30.0, -float(MAX_OVERLAP_SECONDS), 6 * 3600.0, None]


def test_overlap_seconds():
    assert overlap_seconds(-60, 300) == 60
    assert overlap_seconds(-1000, 300) == 300
    assert overlap_seconds(-99999, 99999) == MAX_OVERLAP_SECONDS
    assert overlap_seconds(10, 300) == 0
    assert overlap_seconds(0, 300) == 0


def test_the_plan_length_counts_the_overlap():
    zones = [zone(0), zone(1)]
    [program] = normalize_programs([_program(delay=-60)])
    plan = plan_program(program, zones)
    assert plan_wall_seconds(plan) == 300 + 300 - 60
    [program] = normalize_programs([_program(delay=-1000)])
    assert plan_wall_seconds(plan_program(program, zones)) == 300
    [program] = normalize_programs([_program(delay=20)])
    assert plan_wall_seconds(plan_program(program, zones)) == 620
