"""Where each planned run will really water: behind the one before it.

Programs never run at the same time: one that comes due while another waters
waits its turn (program_runner). The planning listed every run at the moment
its schedule fires, so two programs set for the same morning stood side by
side at the same time, both "done by sunrise", while the second one in fact
waited and finished well after sunrise. And when both water the same zones,
those zones get their water twice that morning, which nothing said (UX walk of
13 Nov., Q1).

This places each run after the ones still watering when it comes due, and
names the zones it waters again right after them. It only reads the planning:
what the runner does is unchanged.
"""

from datetime import datetime, timedelta

import homeassistant.util.dt as dt_util


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


def sequence_planning(planned: list) -> list:
    """The planning in the order the runs will water, each where it will.

    Every item gains:

    - ``waits_for``: the program it waits behind, ``{"program_id", "program"}``,
      or None;
    - ``expected_start`` and ``expected_end``: when it waters, after the wait;
    - ``watered_twice``: the zones it waters that the run it waits behind
      waters too, as ``{"zone_id", "zone", "by"}`` (``by`` as ``waits_for``).

    A run that waters nothing, or that the forecast is expected to hold back,
    neither waits nor holds another back.
    """

    def soonest(item: dict) -> float:
        moment = _moment(item.get("start"))
        return moment.timestamp() if moment is not None else float("inf")

    items = sorted(planned, key=soonest)
    # The runs placed so far: (program, its zones, when it ends).
    ahead: list = []
    for item in items:
        start = _moment(item.get("start"))
        end = _moment(item.get("end"))
        item["waits_for"] = None
        item["expected_start"] = item.get("start")
        item["expected_end"] = item.get("end")
        item["watered_twice"] = []
        if start is None or end is None:
            continue
        if item.get("nothing_to_water") or item.get("skipped_reason"):
            continue
        busy = [run for run in ahead if run[2] > start]
        if busy:
            program, _zones_before, until = max(busy, key=lambda run: run[2])
            length = max(timedelta(0), end - start)
            start, end = until, until + length
            item["waits_for"] = program
            item["expected_start"] = start.isoformat()
            item["expected_end"] = end.isoformat()
            zones = _zones(item)
            twice: list[dict] = []
            for by, before, _until in busy:
                for zone_id in sorted(set(zones) & set(before)):
                    if all(entry["zone_id"] != zone_id for entry in twice):
                        twice.append(
                            {"zone_id": zone_id, "zone": zones[zone_id], "by": by}
                        )
            item["watered_twice"] = twice
        program = {"program_id": item.get("program_id"), "program": item.get("program")}
        ahead.append((program, _zones(item), end))
    return items
