"""Programs of the full controller.

A program is what Irrigation Unlimited calls a sequence: an ordered list of
steps (a zone, or several zones at once), watered when its schedules say so.
Everything here is plain data and pure functions, so it can be tested without
Home Assistant; the coordinator stores the list in the configuration
(``const.CONF_PROGRAMS``) and the runner (program_runner.py) executes it.

Smart Irrigation's difference is that a step takes the duration its water
balance calculated unless told otherwise (``DURATION_CALCULATED``), which is
what Irrigation Unlimited users did with two automations and its
``adjust_time`` service.

The main program is the one the full controller creates when it is switched on,
from the settings that already run the watering (the start trigger, the
sequencing, the pause between zones, the passes). It carries no steps of its
own: until the user adds a second program, nothing runs differently from before.
"""

from __future__ import annotations

import math
import re

import homeassistant.util.dt as dt_util

from . import const
from .schedules import normalize_schedules

MAIN_PROGRAM_ID = "main"
MAIN_PROGRAM_NAME = "Main program"

# How a step decides how long to water.
DURATION_CALCULATED = "calculated"  # the zone's calculated duration
DURATION_PERCENT = "percent"  # the calculated water times a percentage
DURATION_FIXED = "fixed"  # a number of seconds of water
DURATION_MODES = (DURATION_CALCULATED, DURATION_PERCENT, DURATION_FIXED)

MAX_PERCENT = 1000.0
MAX_PASSES = 6
MAX_STEP_SECONDS = 24 * 3600.0
MAX_ADJUST_SECONDS = 6 * 3600.0
# The most a step can ask of a zone's water deficit, in mm.
MAX_MIN_DEFICIT_MM = 100.0
MAX_TOURS = 6
MAX_DELAY_SECONDS = 6 * 3600
# A negative delay overlaps two steps: the next starts this long before the
# current one ends (never more than the current one has to run, see
# overlap_seconds).
MAX_OVERLAP_SECONDS = 3600

_ID_UNSAFE = re.compile(r"[^a-z0-9_]+")


def default_main_program() -> dict:
    """The program the full controller starts with."""
    return {
        const.PROGRAM_ID: MAIN_PROGRAM_ID,
        const.PROGRAM_NAME: MAIN_PROGRAM_NAME,
        const.PROGRAM_ENABLED: True,
        const.PROGRAM_MAIN: True,
    }


def ensure_main_program(programs) -> list:
    """The programs, with the main one first, created if it is missing.

    Never changes a program that is there: a main program the user renamed or
    disabled stays as it was, and the others keep their order.
    """
    programs = [dict(p) for p in (programs or []) if isinstance(p, dict)]
    if any(p.get(const.PROGRAM_ID) == MAIN_PROGRAM_ID for p in programs):
        return programs
    return [default_main_program(), *programs]


def find_program(programs, program_id) -> dict | None:
    """One program by id, or None."""
    for program in programs or []:
        if isinstance(program, dict) and program.get(const.PROGRAM_ID) == program_id:
            return program
    return None


def main_has_enabled_schedules(programs) -> bool:
    """Whether the main program has at least one schedule that is switched on.

    When it does, those schedules start the main program and the historical
    start trigger stays unarmed. The program being disabled or suspended is a
    different matter (it holds the schedules back, it does not hand the start
    back to the trigger).
    """
    main = find_program(programs, MAIN_PROGRAM_ID)
    if main is None:
        return False
    return any(
        isinstance(s, dict) and s.get(const.SCHEDULE_ENABLED) is not False
        for s in main.get(const.PROGRAM_SCHEDULES) or []
    )


# --- what is stored ----------------------------------------------------------


def _number(value, default: float, low: float, high: float) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    if math.isnan(number):
        return default
    return max(low, min(high, number))


def _count(value, default: int, high: int) -> int:
    return int(_number(value, default, 1, high))


def _unique_id(wanted, fallback: str, used: set) -> str:
    base = _ID_UNSAFE.sub("_", str(wanted or fallback).strip().lower()).strip("_")
    base = base or fallback
    unique, n = base, 2
    while unique in used:
        unique, n = f"{base}_{n}", n + 1
    used.add(unique)
    return unique


def normalize_step(step, used: set, position: int = 0) -> dict | None:
    """One step as it is stored, or None if it is not one."""
    if not isinstance(step, dict):
        return None
    zones = []
    for zone_id in step.get(const.STEP_ZONES) or []:
        try:
            zone_id = int(zone_id)
        except (TypeError, ValueError):
            continue
        if zone_id not in zones:
            zones.append(zone_id)
    mode = step.get(const.STEP_MODE)
    if mode not in DURATION_MODES:
        mode = DURATION_CALCULATED
    delay = step.get(const.STEP_DELAY)
    normalized = {
        const.STEP_ID: _unique_id(
            step.get(const.STEP_ID), f"step_{position + 1}", used
        ),
        const.STEP_ZONES: zones,
        const.STEP_MODE: mode,
        const.STEP_PERCENT: _number(
            step.get(const.STEP_PERCENT), 100.0, 0.0, MAX_PERCENT
        ),
        const.STEP_SECONDS: _number(
            step.get(const.STEP_SECONDS), 0.0, 0.0, 24 * 3600.0
        ),
        const.STEP_PASSES: _count(step.get(const.STEP_PASSES), 1, MAX_PASSES),
        # None follows the program's delay.
        const.STEP_DELAY: (
            None
            if delay in (None, "")
            else _number(
                delay, 0.0, -float(MAX_OVERLAP_SECONDS), float(MAX_DELAY_SECONDS)
            )
        ),
        const.STEP_MAX_LITRES: _number(
            step.get(const.STEP_MAX_LITRES), 0.0, 0.0, 100000.0
        ),
        const.STEP_ENABLED: step.get(const.STEP_ENABLED) is not False,
        # Bounds of the water of the step (0: none) and a signed offset.
        const.STEP_MIN_SECONDS: _number(
            step.get(const.STEP_MIN_SECONDS), 0.0, 0.0, MAX_STEP_SECONDS
        ),
        const.STEP_MAX_SECONDS: _number(
            step.get(const.STEP_MAX_SECONDS), 0.0, 0.0, MAX_STEP_SECONDS
        ),
        const.STEP_ADJUST_SECONDS: _number(
            step.get(const.STEP_ADJUST_SECONDS),
            0.0,
            -MAX_ADJUST_SECONDS,
            MAX_ADJUST_SECONDS,
        ),
    }
    # A zone below this water deficit (mm) sits the step out. Stored only when
    # set, so that a step without a threshold stays as it was.
    deficit = _number(step.get(const.STEP_MIN_DEFICIT_MM), 0.0, 0.0, MAX_MIN_DEFICIT_MM)
    if deficit > 0:
        normalized[const.STEP_MIN_DEFICIT_MM] = deficit
    return normalized


def normalize_programs(programs, reserved_schedule_ids=None) -> list:
    """The programs as they are stored: well formed, ids unique, main kept.

    What the panel sends is cleaned rather than refused. The main program keeps
    its id and carries no steps; any other program gets one if it has none. The
    id ``main`` belongs to the main program alone: a program named "Main" that
    comes without an id gets another one, and the real main is never displaced.

    ``reserved_schedule_ids`` maps a program id to the schedule ids it has had
    (stored, or with a mark of its last run): a new schedule is never given one
    of them, so it cannot inherit what was recorded for a schedule long gone.
    """
    cleaned = []
    used = {MAIN_PROGRAM_ID}
    main_seen = False
    reserved_schedule_ids = reserved_schedule_ids or {}
    for position, program in enumerate(programs or []):
        if not isinstance(program, dict):
            continue
        is_main = (
            program.get(const.PROGRAM_ID) == MAIN_PROGRAM_ID
            or program.get(const.PROGRAM_MAIN) is True
        )
        name = str(program.get(const.PROGRAM_NAME) or "").strip()
        if is_main:
            if main_seen:
                continue
            main_seen = True
            main = {
                const.PROGRAM_ID: MAIN_PROGRAM_ID,
                const.PROGRAM_NAME: name or MAIN_PROGRAM_NAME,
                const.PROGRAM_ENABLED: program.get(const.PROGRAM_ENABLED) is not False,
                const.PROGRAM_MAIN: True,
            }
            # Optional schedules of its own, stored only when there are some, so
            # that a main program without any stays exactly as it was.
            schedules = normalize_schedules(
                program.get(const.PROGRAM_SCHEDULES),
                reserved_schedule_ids.get(MAIN_PROGRAM_ID),
            )
            for schedule in schedules:
                # The classic cycle has no deadline to cut it at.
                schedule.pop(const.SCHEDULE_HARD_DEADLINE, None)
            if schedules:
                main[const.PROGRAM_SCHEDULES] = schedules
            cleaned.append(main)
            continue
        program_id = _unique_id(
            program.get(const.PROGRAM_ID) or name, f"program_{position + 1}", used
        )
        step_ids: set = set()
        steps = [
            s
            for s in (
                normalize_step(raw, step_ids, n)
                for n, raw in enumerate(program.get(const.PROGRAM_STEPS) or [])
            )
            if s is not None
        ]
        cleaned.append(
            {
                const.PROGRAM_ID: program_id,
                const.PROGRAM_NAME: name or f"Program {position + 1}",
                const.PROGRAM_ENABLED: program.get(const.PROGRAM_ENABLED) is not False,
                const.PROGRAM_MAIN: False,
                const.PROGRAM_STEPS: steps,
                const.PROGRAM_DELAY: _number(
                    program.get(const.PROGRAM_DELAY),
                    0.0,
                    -float(MAX_OVERLAP_SECONDS),
                    float(MAX_DELAY_SECONDS),
                ),
                const.PROGRAM_TOURS: _count(
                    program.get(const.PROGRAM_TOURS), 1, MAX_TOURS
                ),
                const.PROGRAM_SCHEDULES: normalize_schedules(
                    program.get(const.PROGRAM_SCHEDULES),
                    reserved_schedule_ids.get(program_id),
                ),
            }
        )
    # The main program, when there is one, always comes first.
    cleaned.sort(key=lambda p: 0 if p.get(const.PROGRAM_MAIN) else 1)
    return cleaned


# --- turning a program into what to water ------------------------------------


def step_seconds(
    step: dict, zone: dict, tours: int = 1, adjustment: dict | None = None
) -> float:
    """How long a zone's valve is held for one pass of one tour of a step.

    The zone's duration holds the water and one lead time (what fills the pipe),
    and the runner puts the lead back on every pass. So the water is what
    percent and tours work on, and a fixed number is seconds of water:

    * calculated: the zone's own duration, lead time and all;
    * percent: the calculated water times the percentage, plus the lead time;
    * fixed: that many seconds of water, plus the lead time.

    A zone that needs no water gets none in the first two modes. A fixed step
    waters regardless, which is the point of fixing it. Tours divide the water
    between them; the lead time is paid once per tour.
    """
    try:
        lead = max(0.0, float(zone.get(const.ZONE_LEAD_TIME) or 0.0))
        duration = max(0.0, float(zone.get(const.ZONE_DURATION) or 0.0))
    except (TypeError, ValueError):
        return 0.0
    mode = step.get(const.STEP_MODE, DURATION_CALCULATED)
    lead = min(lead, duration) if duration else lead
    if mode == DURATION_FIXED:
        water = max(0.0, float(step.get(const.STEP_SECONDS) or 0.0))
    else:
        water = max(0.0, duration - lead)
        if mode == DURATION_PERCENT:
            water *= max(0.0, float(step.get(const.STEP_PERCENT) or 0.0)) / 100.0
    if water <= 0:
        # Nothing to water stays nothing: no offset or minimum turns it into water.
        return 0.0
    water = adjusted_water(water, step, adjustment)
    if water <= 0:
        return 0.0
    return water / max(1, int(tours)) + lead


def adjusted_water(water: float, step: dict, adjustment: dict | None = None) -> float:
    """The water of a step once its percentage, offsets and bounds are applied.

    Order: the runtime adjustment's percentage, then the step's offset and the
    runtime adjustment's seconds, then the step's minimum and maximum. The
    bounds are on the water, not on the lead time the runner adds. The caller
    only passes water above zero; a result at or below zero is 0.
    """
    adjustment = adjustment or {}
    percent = adjustment.get(const.ADJUST_PERCENT)
    if percent is not None:
        water *= max(0.0, float(percent)) / 100.0
    water += float(step.get(const.STEP_ADJUST_SECONDS) or 0.0)
    water += float(adjustment.get(const.ADJUST_SECONDS) or 0.0)
    lowest = float(step.get(const.STEP_MIN_SECONDS) or 0.0)
    highest = float(step.get(const.STEP_MAX_SECONDS) or 0.0)
    if water <= 0:
        return 0.0
    if lowest > 0:
        water = max(water, lowest)
    if highest > 0:
        water = min(water, highest)
    return min(water, MAX_STEP_SECONDS)


def normalize_adjustment(raw) -> dict | None:
    """One stored runtime adjustment, cleaned, or None if it adjusts nothing."""
    if not isinstance(raw, dict):
        return None
    percent = raw.get(const.ADJUST_PERCENT)
    seconds = raw.get(const.ADJUST_SECONDS)
    cleaned = {
        const.ADJUST_PERCENT: (
            None if percent is None else _number(percent, 100.0, 0.0, MAX_PERCENT)
        ),
        const.ADJUST_SECONDS: (
            None
            if seconds is None
            else _number(seconds, 0.0, -MAX_ADJUST_SECONDS, MAX_ADJUST_SECONDS)
        ),
        const.ADJUST_UNTIL: raw.get(const.ADJUST_UNTIL) or None,
    }
    if cleaned[const.ADJUST_PERCENT] is None and cleaned[const.ADJUST_SECONDS] is None:
        return None
    return cleaned


def active_adjustment(adjustments, program_id, now) -> dict | None:
    """The runtime adjustment of a program that is in force at ``now``, or None.

    One that has a validity and is past it is not in force (it is dropped from
    the stored record the next time one is set). An unreadable validity counts
    as expired rather than as forever.
    """
    if not isinstance(adjustments, dict):
        return None
    adjustment = normalize_adjustment(adjustments.get(program_id))
    if adjustment is None:
        return None
    until = adjustment.get(const.ADJUST_UNTIL)
    if until:
        moment = dt_util.parse_datetime(str(until))
        if moment is None or moment <= now:
            return None
    return adjustment


def deficit_threshold(step: dict) -> float:
    """The water deficit (mm) a zone needs for the step to water it; 0 for none.

    Only calculated and percent steps have one: a fixed step is watered whatever
    the zone's deficit, which is the point of fixing it.
    """
    if step.get(const.STEP_MODE, DURATION_CALCULATED) == DURATION_FIXED:
        return 0.0
    try:
        return max(0.0, float(step.get(const.STEP_MIN_DEFICIT_MM) or 0.0))
    except (TypeError, ValueError):
        return 0.0


def below_deficit(member: dict, zone: dict) -> bool:
    """Whether a zone is under the deficit its step asks for (so it is skipped).

    The deficit is the bucket below zero, in mm: a zone at or above field
    capacity (bucket 0 or more) has none.
    """
    threshold = float(member.get("min_deficit_mm") or 0.0)
    if threshold <= 0:
        return False
    try:
        bucket = float(zone.get(const.ZONE_BUCKET) or 0.0)
    except (TypeError, ValueError):
        bucket = 0.0
    return max(0.0, -bucket) < threshold


def plan_program(program: dict, zones, adjustment: dict | None = None) -> list:
    """What a program waters, as tours of steps of zones with their seconds.

    Returns ``[tour, ...]`` where a tour is ``[step, ...]`` and a step is
    ``{"id", "zones": [{"zone_id", "seconds", "passes"}], "delay"}``. Zones that
    do not exist, are disabled or have no linked entity are left out, and so are
    steps that end up with no zone to water. The delay of a step is the one it
    sets or else the program's, and is what is waited after it, unless it is
    the last of the tour. A negative delay overlaps the next step with this one.
    """
    by_id = {int(z[const.ZONE_ID]): z for z in zones if const.ZONE_ID in z}
    tours = max(1, int(program.get(const.PROGRAM_TOURS) or 1))
    default_delay = float(program.get(const.PROGRAM_DELAY) or 0.0)
    plan = []
    for _tour in range(tours):
        steps = []
        for step in program.get(const.PROGRAM_STEPS) or []:
            if step.get(const.STEP_ENABLED) is False:
                continue
            members = []
            for zone_id in step.get(const.STEP_ZONES) or []:
                zone = by_id.get(int(zone_id))
                if (
                    zone is None
                    or not zone.get(const.ZONE_LINKED_ENTITY)
                    or zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED
                ):
                    continue
                seconds = step_seconds(step, zone, tours, adjustment)
                if seconds > 0:
                    threshold = deficit_threshold(step)
                    members.append(
                        {
                            **({"min_deficit_mm": threshold} if threshold else {}),
                            "zone_id": int(zone_id),
                            "seconds": seconds,
                            "passes": max(1, int(step.get(const.STEP_PASSES) or 1)),
                            "max_litres": float(step.get(const.STEP_MAX_LITRES) or 0.0),
                            # What fills the pipe, paid again on every pass.
                            "lead": min(
                                max(0.0, float(zone.get(const.ZONE_LEAD_TIME) or 0.0)),
                                seconds,
                            ),
                        }
                    )
            if not members:
                continue
            delay = step.get(const.STEP_DELAY)
            steps.append(
                {
                    "id": step.get(const.STEP_ID),
                    "zones": members,
                    "delay": default_delay if delay is None else float(delay),
                }
            )
        if steps:
            plan.append(steps)
    return plan


def step_wall_seconds(step: dict, soak_seconds: float = 0.0) -> float:
    """How long a step lasts: its slowest zone, extra passes and soaks included."""
    longest = 0.0
    for member in step["zones"]:
        extra = max(0, int(member.get("passes") or 1) - 1)
        longest = max(
            longest,
            float(member["seconds"])
            + extra * (float(member.get("lead") or 0.0) + soak_seconds),
        )
    return longest


def overlap_seconds(delay: float, running: float) -> float:
    """How long the next step starts before the current one ends.

    ``delay`` is the wait after the step, negative for an overlap. An overlap is
    never longer than the step has to run (``running``) nor than
    ``MAX_OVERLAP_SECONDS``, so two steps never overlap by more than what is
    actually open. 0 for a delay of zero or more.
    """
    if delay >= 0:
        return 0.0
    return max(0.0, min(-float(delay), float(MAX_OVERLAP_SECONDS), float(running)))


def plan_wall_seconds(plan: list, soak_seconds: float = 0.0) -> float:
    """How long a plan takes from the first valve to the last, waits included.

    A step lasts as long as its slowest zone: the seconds it is held, the lead
    time it pays again on every extra pass, and the soak between passes. The
    delay after a step is waited unless it is the last of the last tour; a
    negative one (an overlap) takes off what overlaps. This is what a schedule
    that must be done by a given moment works back from.
    """
    total = 0.0
    for tour_index, steps in enumerate(plan):
        for step_index, step in enumerate(steps):
            longest = step_wall_seconds(step, soak_seconds)
            total += longest
            last = tour_index == len(plan) - 1 and step_index == len(steps) - 1
            if not last:
                delay = float(step.get("delay") or 0.0)
                total += delay if delay >= 0 else -overlap_seconds(delay, longest)
    return total


def restrict_plan(plan: list, zone_ids) -> list:
    """The plan with only the given zones in it; steps left empty drop out.

    For a day when the forecast holds the run back for every zone the rain can
    reach: the ones that are sheltered still run.
    """
    allowed = {int(z) for z in zone_ids}
    restricted = []
    for steps in plan:
        kept = []
        for step in steps:
            members = [m for m in step["zones"] if int(m["zone_id"]) in allowed]
            if members:
                kept.append({**step, "zones": members})
        if kept:
            restricted.append(kept)
    return restricted
