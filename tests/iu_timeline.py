"""What the full controller would switch for an imported IU configuration.

A test helper: it plays an import plan through the controller's own planning
(``plan_program``, ``upcoming``) and through the switching rules of the runners
(one program at a time; passes split a zone's water with the default soak
between them; a supply that leads comes on and waits before the valve opens,
and goes off its delay after the last valve closes unless a zone takes it
again), and lists the on and off events in IU's form, ``(time, controller,
zone, on)``, zone 0 being the controller's master. That is what IU's test
configurations give their expected results in.
"""

from __future__ import annotations

import datetime as dt
from zoneinfo import ZoneInfo

import yaml
from astral import LocationInfo
from astral.location import Location

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.iu_import import plan_import
from custom_components.smart_irrigation.programs import (
    normalize_programs,
    overlap_seconds,
    plan_program,
    plan_wall_seconds,
)
from custom_components.smart_irrigation.schedules import upcoming
from custom_components.smart_irrigation.valve_runner import split_into_passes

UTC = dt.UTC


class _Loader(yaml.SafeLoader):
    """YAML with Home Assistant's tags read as plain values."""


def _any_tag(loader, suffix, node):
    if isinstance(node, yaml.ScalarNode):
        return f"<{suffix} {loader.construct_scalar(node)}>"
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    return loader.construct_mapping(node)


_Loader.add_multi_constructor("!", _any_tag)


def load(path) -> dict:
    """A configuration file of IU's tests."""
    with open(path, encoding="utf-8") as handle:
        return yaml.load(handle, Loader=_Loader) or {}


def location(homeassistant: dict):
    """The time zone and a sun function for the ``homeassistant`` section."""
    name = homeassistant.get("time_zone") or "UTC"
    place = Location(
        LocationInfo(
            "",
            "",
            name,
            float(homeassistant.get("latitude", 0) or 0),
            float(homeassistant.get("longitude", 0) or 0),
        )
    )
    elevation = float(homeassistant.get("elevation", 0) or 0)

    def sun(event, day):
        try:
            return getattr(place, event)(day, local=False, observer_elevation=elevation)
        except ValueError:  # no sunrise or sunset that day
            return None

    return ZoneInfo(name), sun


class Timeline:
    """The events of one test window, and whether a run had to wait its turn."""

    def __init__(self, events, queued):
        self.events = events
        self.queued = queued


def simulate(
    iu: dict, homeassistant: dict, start: dt.datetime, end: dt.datetime
) -> Timeline:
    """The events between ``start`` and ``end`` (aware), in UTC."""
    tz, sun = location(homeassistant)
    plan = plan_import(iu)
    ids, zones = {}, []
    for number, planned in enumerate(plan["zones"], start=1):
        ids[planned["key"]] = number
        fields = planned["zone"]
        zones.append(
            {
                const.ZONE_ID: number,
                # IU's test zones have no valve; any entity stands for one.
                const.ZONE_LINKED_ENTITY: fields.get(const.ZONE_LINKED_ENTITY)
                or f"switch.{planned['key']}",
                const.ZONE_STATE: fields.get(const.ZONE_STATE),
                const.ZONE_LEAD_TIME: 0,
                const.ZONE_DURATION: 0,
                "supply": fields.get(const.ZONE_SUPPLY_ID),
                "key": planned["key"],
            }
        )
    by_id = {zone[const.ZONE_ID]: zone for zone in zones}
    supplies = {s[const.SUPPLY_ID]: s for s in plan["supplies"]}
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
    runs = []
    for program in programs:
        if not program.get(const.PROGRAM_ENABLED):
            continue
        tours = plan_program(program, zones)
        total = plan_wall_seconds(tours, const.CONF_DEFAULT_SOAK_MINUTES * 60.0)
        for schedule in program[const.PROGRAM_SCHEDULES]:
            for occurrence in upcoming(
                schedule, since, total, None, sun, tz, window_end
            ):
                runs.append((occurrence["fire"], program[const.PROGRAM_ID], tours))
    runs.sort(key=lambda run: (run[0], run[1]))

    events: list = []
    queued = False
    busy_until = None
    supply_off: dict = {}

    def drop_off(controller, moment):
        events[:] = [
            e for e in events if not (e[1:] == (controller, 0, 0) and e[0] == moment)
        ]

    soak = const.CONF_DEFAULT_SOAK_MINUTES * 60.0
    for fire, _program_id, tours in runs:
        begin = fire if busy_until is None or fire >= busy_until else busy_until
        if begin > fire and window_start <= begin <= window_end:
            queued = True
        moment = begin
        last_close = None
        for tour_index, steps in enumerate(tours):
            for step_index, step in enumerate(steps):
                step_end = moment
                # A zone that finds its supply being brought up waits for it,
                # behind the supply's lock, as the first one does.
                led: dict = {}
                for member in step["zones"]:
                    zone = by_id[member["zone_id"]]
                    controller, number = (int(x) for x in zone["key"][1:].split("_z"))
                    opens = moment
                    supply_id = zone["supply"]
                    if supply_id:
                        before = supplies[supply_id][const.SUPPLY_DELAY_BEFORE]
                        off_at = supply_off.get(supply_id)
                        if supply_id in led:
                            opens = led[supply_id]
                        elif off_at is not None and off_at >= moment:
                            drop_off(controller, off_at)  # taken again in time
                        elif before >= 0:
                            events.append((moment, controller, 0, 1))
                            opens = moment + dt.timedelta(seconds=before)
                            led[supply_id] = opens
                        else:
                            events.append(
                                (
                                    moment + dt.timedelta(seconds=-before),
                                    controller,
                                    0,
                                    1,
                                )
                            )
                    closes = opens
                    for n, length in enumerate(
                        split_into_passes(member.get("passes") or 1, member["seconds"])
                    ):
                        if n:
                            opens = closes + dt.timedelta(seconds=soak)
                        closes = opens + dt.timedelta(seconds=length)
                        events.append((opens, controller, number, 1))
                        events.append((closes, controller, number, 0))
                    if supply_id:
                        after = supplies[supply_id][const.SUPPLY_DELAY_AFTER]
                        off = closes + dt.timedelta(seconds=after)
                        previous = supply_off.get(supply_id)
                        if previous is not None and previous >= moment:
                            drop_off(controller, previous)
                            off = max(off, previous)
                        events.append((off, controller, 0, 0))
                        supply_off[supply_id] = off
                    step_end = max(step_end, closes)
                    last_close = (
                        closes if last_close is None else max(last_close, closes)
                    )
                wall = (step_end - moment).total_seconds()
                last = tour_index == len(tours) - 1 and step_index == len(steps) - 1
                delay = 0.0 if last else float(step.get("delay") or 0.0)
                wall += delay if delay >= 0 else -overlap_seconds(delay, wall)
                moment += dt.timedelta(seconds=wall)
        if last_close is not None:
            busy_until = max(last_close, busy_until or last_close)

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
    return Timeline(sorted(inside, key=lambda e: (e[0], e[1], e[2], e[3])), queued)


def expected(iu: dict, window: dict, tz) -> list:
    """IU's expected events of a test window, as ``simulate`` lists them.

    IU reports its controller (zone 0) whether or not it has a master; only a
    controller with one switches anything, so only those are kept.
    """
    controllers = iu.get("controllers")
    controllers = controllers if isinstance(controllers, list) else [controllers]
    with_master = {
        n
        for n, c in enumerate(controllers, start=1)
        if isinstance(c, dict) and c.get("entity_id")
    }
    wanted = []
    for result in window.get("results") or []:
        controller, zone = int(result["c"]), int(result["z"])
        if zone == 0 and controller not in with_master:
            continue
        wanted.append((moment_of(result["t"], tz), controller, zone, int(result["s"])))
    return wanted


def moment_of(text, tz) -> dt.datetime:
    """A time of IU's tests, local, as an aware time."""
    text = str(text)
    form = "%Y-%m-%d %H:%M:%S" if text.count(":") == 2 else "%Y-%m-%d %H:%M"
    return dt.datetime.strptime(text, form).replace(tzinfo=tz)


def same(got: list, wanted: list, tolerance: float) -> bool:
    """The same events, each within ``tolerance`` seconds (IU's time step)."""
    if len(got) != len(wanted):
        return False
    used: set = set()
    for want in wanted:
        hit = next(
            (
                i
                for i, event in enumerate(got)
                if i not in used
                and event[1:] == want[1:]
                and abs((event[0] - want[0]).total_seconds()) <= tolerance
            ),
            None,
        )
        if hit is None:
            return False
        used.add(hit)
    return True
