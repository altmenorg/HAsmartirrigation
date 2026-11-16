"""Where each planned run will really water: behind the one before it.

Programs that share a supply never run at the same time: one that comes due
while another waters waits its turn (turns.py). Zones without a supply share
the mains. The planning listed every run at the moment its schedule fires, so two programs set for the same morning stood side by
side at the same time, both "done by sunrise", while the second one in fact
waited and finished well after sunrise. And when both water the same zones,
those zones get their water twice that morning, which nothing said (UX walk of
13 Nov., Q1).

This places each run after the ones still watering when it comes due, and
names the zones it waters again right after them. It only reads the planning:
what the runner does is unchanged.

A run that starts after another program (``after_run`` names the planned run it
follows, ``after`` the program and the offset) is placed once that run is: at
the moment it really ends plus the offset, its ``start`` and ``end`` moved with
it, since that is the only moment it has.
"""

import heapq
from collections.abc import Callable
from datetime import datetime, timedelta

import homeassistant.util.dt as dt_util

from .turns import Keys, clash


def _moment(value) -> datetime | None:
    moment = (
        value
        if isinstance(value, datetime)
        else dt_util.parse_datetime(str(value or ""))
    )
    if moment is not None and moment.tzinfo is None:
        moment = moment.replace(tzinfo=dt_util.get_default_time_zone())
    return moment


def _zones(item: dict) -> dict:
    """The zones a planned run waters: {zone id: name}."""
    return {
        int(zone["zone_id"]): zone.get("zone")
        for step in item.get("steps") or []
        for zone in step.get("zones") or []
    }


def sequence_planning(
    planned: list, keys: Callable[[dict], Keys] | None = None
) -> list:
    """The planning in the order the runs will water, each where it will.

    Every item gains:

    - ``waits_for``: the program it waits behind, ``{"program_id", "program"}``,
      or None;
    - ``expected_start`` and ``expected_end``: when it waters, after the wait;
    - ``watered_twice``: the zones it waters that the run it waits behind
      waters too, as ``{"zone_id", "zone", "by"}`` (``by`` as ``waits_for``).

    A run that waters nothing, or that the forecast is expected to hold back,
    neither waits nor holds another back. ``keys`` gives the supplies of a
    planned run, as the runner takes its turn on them: a run only waits behind
    one that shares one. Without it, every run waits behind every other.
    """

    def soonest(item: dict) -> float:
        moment = _moment(item.get("start"))
        return moment.timestamp() if moment is not None else float("inf")

    keys_known = {item.get("run_key") for item in planned if item.get("run_key")}
    # The runs that follow another one wait for it to be placed.
    following: dict = {}
    first = []
    for item in planned:
        if item.get("after_run") and item["after_run"] in keys_known:
            following.setdefault(item["after_run"], []).append(item)
        else:
            first.append(item)
    order = 0
    heap: list = []
    for item in first:
        heap.append((soonest(item), order, item))
        order += 1
    heapq.heapify(heap)
    items: list = []
    # The runs placed so far: (program, its zones, when it ends, its supplies).
    ahead: list = []
    while heap:
        _soonest, _order, item = heapq.heappop(heap)
        items.append(item)
        _place(item, ahead, keys)
        end = _moment(item.get("expected_end"))
        for child in following.pop(item.get("run_key"), []):
            if end is not None:
                _follow(child, end)
            heapq.heappush(heap, (soonest(child), order, child))
            order += 1
    # A run whose predecessor was never placed (it cannot be, but a list
    # handed in by hand may say so) keeps its own moment.
    for children in following.values():
        for child in children:
            items.append(child)
            _place(child, ahead, keys)
    return items


def _follow(item: dict, end: datetime) -> None:
    """Move a run that starts after another to that one's end plus its offset."""
    start = _moment(item.get("start"))
    finish = _moment(item.get("end"))
    length = (
        max(timedelta(0), finish - start)
        if start is not None and finish is not None
        else timedelta(0)
    )
    offset = int((item.get("after") or {}).get("offset_minutes") or 0)
    moved = end + timedelta(minutes=max(0, offset))
    item["start"] = moved.isoformat()
    item["target"] = moved.isoformat()
    item["end"] = (moved + length).isoformat()


def _place(item: dict, ahead: list, keys) -> None:
    """Where one run waters, behind the runs placed before it on its supplies."""
    start = _moment(item.get("start"))
    end = _moment(item.get("end"))
    item["waits_for"] = None
    item["expected_start"] = item.get("start")
    item["expected_end"] = item.get("end")
    item["watered_twice"] = []
    if start is None or end is None:
        return
    if item.get("nothing_to_water") or item.get("skipped_reason"):
        return
    supplies = keys(item) if keys is not None else None
    busy = [run for run in ahead if run[2] > start and clash(supplies, run[3])]
    if busy:
        program, _zones_before, until, _supplies = max(busy, key=lambda run: run[2])
        length = max(timedelta(0), end - start)
        start, end = until, until + length
        item["waits_for"] = program
        item["expected_start"] = start.isoformat()
        item["expected_end"] = end.isoformat()
        zones = _zones(item)
        twice: list[dict] = []
        for by, before, _until, _supplies in busy:
            for zone_id in sorted(set(zones) & set(before)):
                if all(entry["zone_id"] != zone_id for entry in twice):
                    twice.append({"zone_id": zone_id, "zone": zones[zone_id], "by": by})
        item["watered_twice"] = twice
    program = {"program_id": item.get("program_id"), "program": item.get("program")}
    ahead.append((program, _zones(item), end, supplies))
