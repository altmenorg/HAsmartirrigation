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

Every program is equal: its steps name its zones, its schedules start it. A
zone is watered by the programs whose steps name it, and by nothing else (the
dry zone alert says when no program does). There used to be a "main program"
without steps that watered every zone through a cycle of its own; it was
converted once into an ordinary program (program_migration.py).
"""

from __future__ import annotations

import math
import re

import homeassistant.util.dt as dt_util
from homeassistant.util import slugify

from . import const
from .schedules import ANCHOR_END, after_program_of, normalize_schedules

# The id and default name the old main program kept when it was converted into
# an ordinary program: its sensor, its last runs and its notifications are
# keyed on the id, and the panel and the sensor still translate that name.
MAIN_PROGRAM_ID = "main"
MAIN_PROGRAM_NAME = "Main program"

# A neutral name for a program made for the user (the first one, or the old
# main program kept under its default name), in Home Assistant's language: the
# panel's name of its Watering tab.
WATERING_NAMES = {
    "cs": "Zavlažování",
    "da": "Vanding",
    "de": "Bewässerung",
    "en": "Watering",
    "es": "Riego",
    "fi": "Kastelu",
    "fr": "Arrosage",
    "hu": "Öntözés",
    "it": "Irrigazione",
    "nl": "Bewatering",
    "no": "Vanning",
    "nb": "Vanning",
    "nn": "Vanning",
    "pl": "Podlewanie",
    "pt-br": "Irrigação",
    "pt": "Rega",
    "ru": "Полив",
    "sk": "Zavlažovanie",
    "sl": "Zalivanje",
    "sv": "Bevattning",
    "uk": "Полив",
    "zh-hans": "浇水",
    "zh-hant": "澆水",
    "zh": "浇水",
}


def watering_name(language) -> str:
    """The neutral program name in ``language`` (``fr``, ``pt-BR``...), else English."""
    code = str(language or "").strip().lower().replace("_", "-")
    while code:
        if code in WATERING_NAMES:
            return WATERING_NAMES[code]
        code = code.rpartition("-")[0]
    return WATERING_NAMES["en"]


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
# The run a zone's bucket implies without its own threshold, handed to the
# planner with the zone (never stored): a step with a minimum deficit of its
# own waters on that, not on the zone's threshold (#912).
DURATION_IGNORING_THRESHOLD = "_duration_ignoring_threshold"
MAX_TOURS = 6
MAX_DELAY_SECONDS = 6 * 3600
# A negative delay overlaps two steps: the next starts this long before the
# current one ends (never more than the current one has to run, see
# overlap_seconds).
MAX_OVERLAP_SECONDS = 3600

_ID_SAFE = re.compile(r"[a-z0-9_]+")


class ProgramsRefused(ValueError):
    """A save of the programs that is refused, with the reason the panel shows."""


class LastProgramError(ProgramsRefused):
    """A save that would delete the last program, which is refused.

    With no program at all nothing waters, silently: one is always kept.
    """

    def __init__(self) -> None:
        super().__init__(LAST_PROGRAM_MESSAGE)


LAST_PROGRAM_MESSAGE = (
    "The last program cannot be deleted: without a program nothing is watered. "
    "Switch its schedules off instead"
)


class ProgramChainError(ProgramsRefused):
    """A save that would break what starts after what, which is refused.

    Either the programs would start each other in a loop (A after B after A,
    or A after itself), or a program that another one starts after is deleted,
    or a schedule waits for a program that does not exist.
    """


def _program_names(programs) -> dict:
    return {
        p.get(const.PROGRAM_ID): p.get(const.PROGRAM_NAME) or p.get(const.PROGRAM_ID)
        for p in programs or []
        if isinstance(p, dict)
    }


def program_predecessors(programs) -> dict:
    """{program id: the ids of the programs its "after" schedules wait for}.

    Every schedule counts, switched on or not: one switched on later must not
    close a loop that nothing checked.
    """
    found: dict = {}
    for program in programs or []:
        if not isinstance(program, dict):
            continue
        for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
            after = after_program_of(schedule)
            if after:
                found.setdefault(program.get(const.PROGRAM_ID), set()).add(after)
    return found


def chain_loop(programs) -> list | None:
    """A loop of programs that start each other, as ids, or None.

    ``[a, b, a]``: a starts after b, which starts after a. ``[a, a]``: a
    starts after itself. Only the first loop found is given.
    """
    edges = program_predecessors(programs)
    done: set = set()

    def visit(node, path):
        if node in path:
            return path[path.index(node) :] + [node]
        if node in done:
            return None
        for nxt in sorted(edges.get(node) or ()):
            loop = visit(nxt, path + [node])
            if loop:
                return loop
        done.add(node)
        return None

    for start in sorted(edges, key=str):
        loop = visit(start, [])
        if loop:
            return loop
    return None


def dependents_of(programs, program_id) -> list:
    """The programs one of whose schedules starts after ``program_id``, by name."""
    return [
        p.get(const.PROGRAM_NAME) or p.get(const.PROGRAM_ID)
        for p in programs or []
        if isinstance(p, dict)
        and program_id in (program_predecessors([p]).get(p.get(const.PROGRAM_ID)) or ())
    ]


def check_program_chains(programs, old_programs=None) -> None:
    """Refuse (ProgramChainError) a save that breaks what starts after what.

    ``programs`` is the list as it would be stored, ``old_programs`` as it is.
    What was already wrong in the store (a loop, or a schedule waiting for a
    program long gone, both from before the check existed) does not stop the
    save of something else: only what this save makes wrong is refused.
    """
    old_programs = [p for p in old_programs or [] if isinstance(p, dict)]
    names = _program_names(programs)
    old_names = _program_names(old_programs)
    loop = chain_loop(programs)
    if loop and chain_loop(old_programs) != loop:
        said = " -> ".join(f'"{names.get(i, i)}"' for i in loop)
        raise ProgramChainError(
            "Programs cannot start after each other in a loop: "
            f"{said}. Change one of these schedules"
        )
    old_waits = program_predecessors(old_programs)
    for program_id, waits in program_predecessors(programs).items():
        for after in sorted(waits):
            if after in names:
                continue
            if after in old_names:
                raise ProgramChainError(
                    f'"{old_names[after]}" cannot be deleted: '
                    f'"{names.get(program_id, program_id)}" starts after it. '
                    "Change that schedule first"
                )
            if after not in (old_waits.get(program_id) or ()):
                raise ProgramChainError(
                    f'"{names.get(program_id, program_id)}" starts after a '
                    f'program that does not exist ("{after}")'
                )


def find_program(programs, program_id) -> dict | None:
    """One program by id, or None."""
    for program in programs or []:
        if isinstance(program, dict) and program.get(const.PROGRAM_ID) == program_id:
            return program
    return None


def has_schedule_on(program: dict) -> bool:
    """Whether a program has a schedule that is switched on (it starts on its own)."""
    return any(
        isinstance(s, dict) and s.get(const.SCHEDULE_ENABLED) is not False
        for s in (program or {}).get(const.PROGRAM_SCHEDULES) or []
    )


def set_schedules_enabled(program: dict, enabled: bool) -> dict:
    """The program with every one of its schedules switched on or off."""
    return {
        **program,
        const.PROGRAM_SCHEDULES: [
            {**s, const.SCHEDULE_ENABLED: bool(enabled)}
            for s in program.get(const.PROGRAM_SCHEDULES) or []
            if isinstance(s, dict)
        ],
    }


def zone_steps(zone_ids, sequencing: str, passes, pause_seconds) -> list:
    """Steps that water ``zone_ids`` as the old classic cycle did.

    Sequential: one step per zone, in that order, each followed by the pause
    between zones (none after the last, which has nothing to wait for).
    Parallel: one step with every zone. Each step takes the calculated
    duration in ``passes`` passes, with the general soak between them, which
    is what the cycle did with the general settings.
    """
    zone_ids = [int(z) for z in zone_ids]
    try:
        passes = max(1, min(MAX_PASSES, int(passes or 1)))
    except (TypeError, ValueError):
        passes = 1
    try:
        pause = max(0.0, min(float(MAX_DELAY_SECONDS), float(pause_seconds or 0.0)))
    except (TypeError, ValueError):
        pause = 0.0
    if not zone_ids:
        return []

    def step(number: int, zones: list, delay) -> dict:
        return {
            const.STEP_ID: f"step_{number}",
            const.STEP_ZONES: zones,
            const.STEP_MODE: DURATION_CALCULATED,
            const.STEP_PASSES: passes,
            const.STEP_DELAY: delay,
        }

    if sequencing == const.CONF_ZONE_SEQUENCING_PARALLEL:
        return [step(1, zone_ids, None)]
    last = len(zone_ids) - 1
    return [
        step(n + 1, [zone_id], pause if pause and n < last else None)
        for n, zone_id in enumerate(zone_ids)
    ]


def zones_with_valve(zones, include_disabled: bool = False) -> list:
    """The ids of the zones with a linked valve, in their stored order.

    ``include_disabled`` keeps a disabled zone that has a valve: it is not
    watered while it is disabled (the plan leaves it out), and is again once
    it is enabled, as the old classic cycle did.
    """
    ids = []
    for zone in zones or []:
        if not isinstance(zone, dict) or const.ZONE_ID not in zone:
            continue
        if not zone.get(const.ZONE_LINKED_ENTITY):
            continue
        if (
            not include_disabled
            and zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED
        ):
            continue
        ids.append(int(zone[const.ZONE_ID]))
    return ids


def needs_run_length(programs) -> bool:
    """Whether a program has a "done by" schedule.

    Only such a schedule is placed from the length of its run, so only then
    are the planned durations worth working out for the programs' starts: the
    live estimate behind them is slow.
    """
    return any(
        isinstance(p, dict)
        and any(
            isinstance(s, dict)
            and s.get(const.SCHEDULE_ENABLED) is not False
            and s.get(const.SCHEDULE_ANCHOR) == ANCHOR_END
            for s in p.get(const.PROGRAM_SCHEDULES) or []
        )
        for p in programs or []
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


def unique_id(wanted, fallback: str, used: set) -> str:
    """``wanted`` as an id (lower case, letters, digits and ``_``), made unique
    against ``used`` with a number; ``fallback`` when nothing is left of it.

    A name is transliterated ("Démo potager" is ``demo_potager``, not
    ``d_mo_potager``). Something that is an id already is kept exactly as it
    is, since stored ids are passed through here on every save and must never
    change (an old ``d_mo_potager`` stays, ``a__b`` keeps its two ``_``).
    """
    text = str(wanted or fallback).strip()
    if _ID_SAFE.fullmatch(text):
        base = text.strip("_")
    else:
        base = slugify(text.lower())
        if base == "unknown" and text.lower() != "unknown":
            # What slugify answers when nothing is left of the text.
            base = ""
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
        const.STEP_ID: unique_id(step.get(const.STEP_ID), f"step_{position + 1}", used),
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


# A notify entity or action, or a persistent notification.
NOTIFY_TARGET_PATTERN = re.compile(r"notify\.[a-z0-9_]+|persistent_notification")


def normalize_notify(raw) -> dict | None:
    """A program's notification settings as stored, or None for none.

    Targets are notify entity ids, ``notify.<action>`` names (the phone apps)
    or ``persistent_notification``; anything else is dropped. Without a target
    nothing is stored, so a program that does not notify stays as it was.
    """
    if not isinstance(raw, dict):
        return None
    targets: list[str] = []
    for target in raw.get(const.NOTIFY_TARGETS) or []:
        if not isinstance(target, str):
            continue
        target = target.strip()
        if NOTIFY_TARGET_PATTERN.fullmatch(target) and target not in targets:
            targets.append(target)
    if not targets:
        return None
    when = raw.get(const.NOTIFY_WHEN)
    return {
        const.NOTIFY_TARGETS: targets,
        const.NOTIFY_WHEN: (
            when if when in const.NOTIFY_WHEN_CHOICES else const.NOTIFY_WHEN_FINISH
        ),
        const.NOTIFY_START: raw.get(const.NOTIFY_START) is True,
    }


def normalize_programs(programs, reserved_schedule_ids=None) -> list:
    """The programs as they are stored: well formed, ids unique.

    What the panel sends is cleaned rather than refused, and every program is
    cleaned the same way. A program starts on its own through its schedules
    alone: there is no program-level on/off.

    ``reserved_schedule_ids`` maps a program id to the schedule ids it has had
    (stored, or with a mark of its last run): a new schedule is never given one
    of them, so it cannot inherit what was recorded for a schedule long gone.
    """
    cleaned = []
    reserved_schedule_ids = reserved_schedule_ids or {}
    programs = list(programs or [])
    # The ids a program comes with are given first, and a program that comes
    # without one is named after them: a new "Main" placed before the old main
    # program must not take its id, and with it its sensor and its marks.
    used: set = set()
    ids: dict = {}
    for position, program in enumerate(programs):
        if isinstance(program, dict) and program.get(const.PROGRAM_ID):
            ids[position] = unique_id(
                program.get(const.PROGRAM_ID), f"program_{position + 1}", used
            )
    for position, program in enumerate(programs):
        if isinstance(program, dict) and position not in ids:
            ids[position] = unique_id(
                str(program.get(const.PROGRAM_NAME) or "").strip(),
                f"program_{position + 1}",
                used,
            )
    for position, program in enumerate(programs):
        if not isinstance(program, dict):
            continue
        name = str(program.get(const.PROGRAM_NAME) or "").strip()
        program_id = ids[position]
        step_ids: set = set()
        steps = [
            s
            for s in (
                normalize_step(raw, step_ids, n)
                for n, raw in enumerate(program.get(const.PROGRAM_STEPS) or [])
            )
            if s is not None
        ]
        delay = _number(
            program.get(const.PROGRAM_DELAY),
            0.0,
            -float(MAX_OVERLAP_SECONDS),
            float(MAX_DELAY_SECONDS),
        )
        if delay:
            # The wait between steps is a step's own (one setting rather than a
            # program's default and a step's override): a delay given for the
            # program goes to each step without one, which plans the same run.
            steps = [
                (
                    {**step, const.STEP_DELAY: delay}
                    if step.get(const.STEP_DELAY) is None
                    else step
                )
                for step in steps
            ]
        schedules = normalize_schedules(
            program.get(const.PROGRAM_SCHEDULES),
            reserved_schedule_ids.get(program_id),
        )
        if program.get(const.PROGRAM_ENABLED) is False:
            # A program switched off by the old "Program on" started on its
            # own no more: its schedules switched off say the same, and it can
            # still be run by hand. deprecated: remove in 2027.11
            schedules = [{**s, const.SCHEDULE_ENABLED: False} for s in schedules]
        cleaned_program = {
            const.PROGRAM_ID: program_id,
            const.PROGRAM_NAME: name or f"Program {position + 1}",
            const.PROGRAM_STEPS: steps,
            const.PROGRAM_DELAY: 0.0,
            const.PROGRAM_TOURS: _count(program.get(const.PROGRAM_TOURS), 1, MAX_TOURS),
            const.PROGRAM_SCHEDULES: schedules,
        }
        notify = normalize_notify(program.get(const.PROGRAM_NOTIFY))
        if notify:
            cleaned_program[const.PROGRAM_NOTIFY] = notify
        cleaned.append(cleaned_program)
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
        if not duration and deficit_threshold(step) > 0:
            # The step's own minimum deficit decides, not the zone's threshold:
            # a zone held back by its threshold still has the run its bucket
            # implies, and below_deficit judges it against the step's (#912).
            duration = max(0.0, float(zone.get(DURATION_IGNORING_THRESHOLD) or 0.0))
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


def pass_count(passes, water: float) -> int:
    """How many passes ``water`` seconds are actually watered in.

    The runner (valve_runner.split_into_passes) brings the number down until
    each pass is worth opening a valve for: six passes asked of a four-minute
    run water in four.
    """
    try:
        passes = int(passes or 1)
    except (TypeError, ValueError):
        passes = 1
    passes = max(1, min(passes, const.CONF_MAX_WATERING_PASSES))
    while passes > 1 and water / passes < const.MIN_PASS_SECONDS:
        passes -= 1
    return passes


def _member_passes(member: dict) -> tuple:
    """``(passes, lead, water)`` of a zone of a step, as the runner waters it."""
    seconds = max(0.0, float(member.get("seconds") or 0.0))
    lead = min(max(0.0, float(member.get("lead") or 0.0)), seconds)
    water = seconds - lead
    return pass_count(member.get("passes"), water), lead, water


def step_wall_seconds(step: dict, soak_seconds: float = 0.0) -> float:
    """How long a step lasts: its slowest zone, extra passes and soaks included."""
    longest = 0.0
    for member in step["zones"]:
        passes, lead, _water = _member_passes(member)
        longest = max(
            longest,
            float(member["seconds"]) + (passes - 1) * (lead + soak_seconds),
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


# What a segment of the timeline is.
SEGMENT_FILL = "fill"  # the lead time: the valve open, the pipe filling
SEGMENT_WATER = "water"  # water reaching the zone
SEGMENT_SOAK = "soak"  # the valve shut between two passes, the soil taking it in


def plan_timeline(plan: list, soak_seconds: float = 0.0) -> dict:
    """What a plan does second by second, for the panel to draw it.

    Walks the plan as the runner does (``_walk_plan``): the steps one after the
    other, a zone in its passes with the lead time paid again on every pass and
    a soak between them, the delay after a step waited (or, negative, the next
    step started before it ends), and every tour after the last. The supply's
    own lead is left out, as in ``plan_wall_seconds``, whose total this ends on.

    Returns ``{"total", "segments"}``: each segment is a dict with the zone id,
    the tour, the step and the pass it belongs to (counted from 0), its kind
    (``SEGMENT_*``) and its start and end in seconds from the run's start.
    """
    segments: list[dict] = []
    clock = 0.0
    end = 0.0
    for tour_index, steps in enumerate(plan):
        for step_index, step in enumerate(steps):
            start = clock
            for member in step["zones"]:
                passes, lead, water = _member_passes(member)
                at = start
                for number in range(passes):
                    base = {
                        "zone_id": int(member["zone_id"]),
                        "tour": tour_index,
                        "step": step_index,
                        "pass": number,
                    }
                    if lead > 0:
                        segments.append(
                            {
                                **base,
                                "kind": SEGMENT_FILL,
                                "start": at,
                                "end": at + lead,
                            }
                        )
                        at += lead
                    segments.append(
                        {
                            **base,
                            "kind": SEGMENT_WATER,
                            "start": at,
                            "end": at + water / passes,
                        }
                    )
                    at += water / passes
                    if number < passes - 1 and soak_seconds > 0:
                        segments.append(
                            {
                                **base,
                                "kind": SEGMENT_SOAK,
                                "start": at,
                                "end": at + soak_seconds,
                            }
                        )
                        at += soak_seconds
            longest = step_wall_seconds(step, soak_seconds)
            end = max(end, start + longest)
            clock = start + longest
            last = tour_index == len(plan) - 1 and step_index == len(steps) - 1
            if not last:
                delay = float(step.get("delay") or 0.0)
                clock += delay if delay >= 0 else -overlap_seconds(delay, longest)
    return {"total": end, "segments": segments}


def drop_below_deficit(plan: list, zones) -> list:
    """The plan without the zones their step will skip for a deficit under its own.

    The run decides at each step, on the bucket of the moment (below_deficit);
    the planning and the schedules ask beforehand, on the bucket of now, so
    they do not show or place a run the step will not make (#971).
    """
    by_id = {int(z[const.ZONE_ID]): z for z in zones if const.ZONE_ID in z}
    kept_plan = []
    for steps in plan:
        kept = []
        for step in steps:
            members = [
                m
                for m in step["zones"]
                if not below_deficit(m, by_id.get(int(m["zone_id"])) or {})
            ]
            if members:
                kept.append({**step, "zones": members})
        if kept:
            kept_plan.append(kept)
    return kept_plan


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
