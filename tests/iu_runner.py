"""What the full controller switches for an imported IU configuration.

A test helper: it imports an IU configuration, works out when each program's
schedules fire in a test window (``upcoming``, as the scheduler does), and
then runs those programs through the controller's own runners
(``async_run_program`` and the valve and supply runners under it) on a virtual
clock. Every valve and supply the runners switch is recorded in IU's form,
``(time, controller, zone, on)``, zone 0 being the controller's master, which
is how IU's test configurations give their expected results.

Nothing here decides how a program runs: the passes, the soak between them,
a supply's lead and its delay after, one program after the other, the waits
and overlaps between steps are the runners' own.
"""

from __future__ import annotations

import asyncio
import datetime as dt
import heapq
from unittest.mock import patch

import homeassistant.util.dt as dt_util

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.iu_import import plan_import
from custom_components.smart_irrigation.programs import (
    normalize_programs,
    plan_program,
    plan_wall_seconds,
)
from custom_components.smart_irrigation.schedules import upcoming
from custom_components.smart_irrigation.supplies import normalize_supplies

from .iu_corpus import location
from .runner_doubles import REAL_SLEEP, Coordinator, make_hass, make_store, zone

UTC = dt.UTC
_ON = ("turn_on", "open_valve")
_OFF = ("turn_off", "close_valve")


class VirtualClock:
    """Stands in for ``asyncio.sleep`` and the clocks: time moves only when
    every task is waiting, and then straight to the earliest wake-up."""

    def __init__(self, base: dt.datetime) -> None:
        self.base = base
        self.now = 0.0
        self._heap: list = []
        self._seq = 0

    def utcnow(self) -> dt.datetime:
        return self.base + dt.timedelta(seconds=self.now)

    async def sleep(self, seconds, result=None, *args, **kwargs):
        seconds = float(seconds or 0)
        if seconds <= 0:
            await REAL_SLEEP(0)
            return result
        future = asyncio.get_running_loop().create_future()
        heapq.heappush(self._heap, (self.now + seconds, self._seq, future))
        self._seq += 1
        await future
        return result

    async def until(self, moment: dt.datetime) -> None:
        await self.sleep((moment - self.utcnow()).total_seconds())

    async def run(self, tasks: list) -> None:
        """Run the tasks to the end, moving the clock between their waits."""
        pending = [asyncio.ensure_future(t) for t in tasks]
        while not all(t.done() for t in pending):
            for _ in range(200):
                await REAL_SLEEP(0)
            if all(t.done() for t in pending):
                break
            while self._heap and self._heap[0][2].done():
                heapq.heappop(self._heap)
            if not self._heap:
                raise RuntimeError("the runners wait for something that never comes")
            moment, _, future = heapq.heappop(self._heap)
            self.now = max(self.now, moment)
            future.set_result(None)
        for task in pending:
            task.result()


def simulate(
    iu: dict, homeassistant: dict, start: dt.datetime, end: dt.datetime
) -> list:
    """The events between ``start`` and ``end`` (aware), in UTC."""
    return asyncio.run(_simulate(iu, homeassistant, start, end))


async def _simulate(iu, homeassistant, start, end) -> list:
    tz, sun = location(homeassistant)
    plan = plan_import(iu)
    ids: dict = {}
    entity_of: dict = {}
    zones = []
    for number, planned in enumerate(plan["zones"], start=1):
        ids[planned["key"]] = number
        controller, zone_number = (int(x) for x in planned["key"][1:].split("_z"))
        fields = planned["zone"]
        # IU's test zones have no valve: one entity each stands for it.
        valve = f"switch.{planned['key']}"
        entity_of[valve] = (controller, zone_number)
        zones.append(
            zone(
                number,
                **{
                    const.ZONE_NAME: planned["name"],
                    const.ZONE_LINKED_ENTITY: valve,
                    const.ZONE_STATE: fields.get(const.ZONE_STATE),
                    const.ZONE_SUPPLY_ID: fields.get(const.ZONE_SUPPLY_ID),
                    const.ZONE_DURATION: 0,
                    const.ZONE_LEAD_TIME: 0,
                },
            )
        )
    supplies = normalize_supplies(plan["supplies"])
    for supply in supplies:
        controller = int(supply[const.SUPPLY_ID].split("_")[1][1:])
        entities = [f"switch.iu_c{controller}_master"]
        supply[const.SUPPLY_ENTITIES] = entities
        for entity in entities:
            entity_of[entity] = (controller, 0)
    programs = normalize_programs(
        [
            {
                **program,
                const.PROGRAM_STEPS: [
                    {**step, const.STEP_ZONES: [ids[k] for k in step[const.STEP_ZONES]]}
                    for step in program[const.PROGRAM_STEPS]
                ],
            }
            for program in plan["programs"]
        ]
    )

    window_start, window_end = start.astimezone(UTC), end.astimezone(UTC)
    since = window_start - dt.timedelta(days=1)
    soak = const.CONF_DEFAULT_SOAK_MINUTES * 60.0
    fires = []
    for program in programs:
        if not program.get(const.PROGRAM_ENABLED):
            continue
        total = plan_wall_seconds(plan_program(program, zones), soak)
        for schedule in program[const.PROGRAM_SCHEDULES]:
            for occurrence in upcoming(
                schedule, since, total, None, sun, tz, window_end
            ):
                fires.append((occurrence["fire"], program[const.PROGRAM_ID]))
    fires.sort()

    clock = VirtualClock(since)
    hass = make_hass()
    hass.loop.time = lambda: clock.now
    store = make_store(zones, soak=const.CONF_DEFAULT_SOAK_MINUTES)
    store.config.full_controller = True
    store.config.programs = programs
    store.config.supplies = supplies
    store.config.active_cycle = None
    store.config.active_program_run = None
    coordinator = Coordinator(hass, store)

    events: list = []
    switch = hass.services.async_call.side_effect

    async def recorded(domain, service, data, **kwargs):
        entity_id = data["entity_id"]
        if entity_id in entity_of and (service in _ON or service in _OFF):
            controller, number = entity_of[entity_id]
            events.append((clock.utcnow(), controller, number, int(service in _ON)))
        return await switch(domain, service, data, **kwargs)

    hass.services.async_call.side_effect = recorded

    async def fire(moment, program_id):
        await clock.until(moment)
        await coordinator.async_run_program(program_id, manual=False)

    with (
        patch("asyncio.sleep", clock.sleep),
        patch.object(dt_util, "utcnow", clock.utcnow),
        patch(
            "custom_components.smart_irrigation.observed_watering."
            "async_dispatcher_send",
            lambda *args, **kwargs: None,
        ),
    ):
        await clock.run([fire(moment, pid) for moment, pid in fires])

    events = _without_repeats(events)
    # IU reports what is already on when a test starts, at the start.
    running, opened = [], {}
    for event in sorted(events, key=lambda e: (e[0], e[3])):
        key = event[1:3]
        if event[3]:
            opened[key] = event[0]
        elif key in opened:
            if opened.pop(key) < window_start < event[0]:
                running.append((window_start, key[0], key[1], 1))
    inside = [e for e in events if window_start <= e[0] <= window_end] + running
    return sorted(inside, key=lambda e: (e[0], e[1], e[2], e[3]))


def _without_repeats(events: list) -> list:
    """A switch sent again while it already is so (a resend, a second close)
    switches nothing: only changes are events, as IU lists them."""
    state: dict = {}
    kept = []
    for event in sorted(events, key=lambda e: e[0]):
        key = event[1:3]
        if state.get(key) == event[3]:
            continue
        state[key] = event[3]
        kept.append(event)
    return kept
