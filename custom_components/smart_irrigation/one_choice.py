"""One choice says what Smart Irrigation does (the simplification of 2026.11).

The master list (Calculate and water / Calculate only / Stop everything)
replaces four settings that each stopped or started the watering on their own:
the full controller switch, direct valve control, the start trigger of the main
program and the main program's own "Program on". Here:

- "Calculate and water" is the full controller, and with it the valves. The
  main program is started by its own schedules only; the start trigger is for
  "Calculate only", where it fires the start event an automation listens to.
- ``migration_changes`` moves an installation over once, so that it keeps
  watering exactly as before: direct valve control alone becomes the full
  controller, the active start trigger becomes a schedule of the main program,
  and a main program switched off becomes one whose schedules are off.
"""

from __future__ import annotations

from typing import Any

from . import const
from .programs import (
    MAIN_PROGRAM_ID,
    ensure_main_program,
    find_program,
    normalize_programs,
)

# The repair that tells, once, that direct valve control became "Calculate and
# water": a notice only, confirmed to go away.
ISSUE_MOVED = "moved_to_calculate_and_water"


def moved_the_valves(changes: dict) -> bool:
    """Whether the move turned direct valve control into the controller."""
    return changes.get(const.CONF_FULL_CONTROLLER) is True


def _value(config: Any, key: str, default=None):
    if isinstance(config, dict):
        return config.get(key, default)
    return getattr(config, key, default)


def schedule_from_trigger(config: Any) -> dict | None:
    """The main program's schedule that starts it as the active trigger did.

    None for "none" (nothing started it). A trigger that accounts for the
    watering's length ends at its moment ("done by"); one that does not starts
    at it. The default trigger is "done by sunrise".
    """
    active = _value(
        config, const.CONF_ACTIVE_START_TRIGGER, const.CONF_DEFAULT_ACTIVE_START_TRIGGER
    )
    if active == const.START_TRIGGER_NONE:
        return None
    trigger = None
    if active and active != const.START_TRIGGER_DEFAULT:
        trigger = next(
            (
                t
                for t in _value(config, const.CONF_IRRIGATION_START_TRIGGERS, []) or []
                if isinstance(t, dict) and t.get(const.TRIGGER_CONF_NAME) == active
            ),
            None,
        )
    schedule: dict = {
        const.SCHEDULE_ENABLED: True,
        const.SCHEDULE_TYPE: "sun",
        const.SCHEDULE_EVENT: "sunrise",
        const.SCHEDULE_OFFSET_MINUTES: 0,
        const.SCHEDULE_ANCHOR: "end",
        const.SCHEDULE_WEATHER: True,
    }
    if trigger is None:
        return schedule
    kind = trigger.get(const.TRIGGER_CONF_TYPE)
    schedule[const.SCHEDULE_ENABLED] = trigger.get(const.TRIGGER_CONF_ENABLED, True)
    try:
        offset = int(trigger.get(const.TRIGGER_CONF_OFFSET_MINUTES) or 0)
    except (TypeError, ValueError):
        offset = 0
    done_by = trigger.get(const.TRIGGER_CONF_ACCOUNT_FOR_DURATION, True) is not False
    if kind == const.TRIGGER_TYPE_TIME:
        schedule[const.SCHEDULE_TYPE] = "time"
        schedule[const.SCHEDULE_TIME] = (
            trigger.get(const.TRIGGER_CONF_AT) or const.TRIGGER_CONF_DEFAULT_AT
        )
        # A clock time is the moment itself: the offset moves it.
        hours, _, minutes = schedule[const.SCHEDULE_TIME].partition(":")
        try:
            total = (int(hours) * 60 + int(minutes) + offset) % (24 * 60)
            schedule[const.SCHEDULE_TIME] = f"{total // 60:02d}:{total % 60:02d}"
        except ValueError:
            pass
    elif kind == const.TRIGGER_TYPE_SOLAR_AZIMUTH:
        schedule[const.SCHEDULE_EVENT] = "azimuth"
        schedule[const.SCHEDULE_AZIMUTH] = trigger.get(
            const.TRIGGER_CONF_AZIMUTH_ANGLE, 90
        )
        schedule[const.SCHEDULE_OFFSET_MINUTES] = offset
        # The azimuth trigger never placed a run to end at its moment.
        done_by = False
    else:
        schedule[const.SCHEDULE_EVENT] = (
            "sunset" if kind == const.TRIGGER_TYPE_SUNSET else "sunrise"
        )
        schedule[const.SCHEDULE_OFFSET_MINUTES] = offset
    schedule[const.SCHEDULE_ANCHOR] = "end" if done_by else "start"
    return schedule


def seed_main_schedules(config: Any, programs) -> list:
    """The programs, the main program given its trigger's schedule if it has none.

    A main program with schedules of its own keeps them as they are.
    """
    programs = ensure_main_program(programs)
    main = find_program(programs, MAIN_PROGRAM_ID)
    if main is None or main.get(const.PROGRAM_SCHEDULES):
        return programs
    schedule = schedule_from_trigger(config)
    if schedule is None:
        return programs
    seeded = [
        (
            {**p, const.PROGRAM_SCHEDULES: [schedule]}
            if p.get(const.PROGRAM_ID) == MAIN_PROGRAM_ID
            else p
        )
        for p in programs
    ]
    return normalize_programs(seeded)


def migration_changes(config: Any) -> dict:
    """What to store, once, to move an installation to the one choice."""
    if _value(config, const.CONF_ONE_CHOICE_MIGRATED, False) is True:
        return {}
    changes: dict = {const.CONF_ONE_CHOICE_MIGRATED: True}
    full = _value(config, const.CONF_FULL_CONTROLLER, False) is True
    valves = _value(config, const.CONF_DIRECT_VALVE_CONTROL_ENABLED, False) is True
    if _value(config, const.CONF_WATERING_ENABLED, True) is False:
        # "Calculate only" as it first was (never released): the valves held.
        full = valves = False
        changes[const.CONF_WATERING_ENABLED] = True
        changes[const.CONF_FULL_CONTROLLER] = False
        changes[const.CONF_DIRECT_VALVE_CONTROL_ENABLED] = False
    elif valves and not full:
        # Direct valve control alone did what the main program does.
        full = True
        changes[const.CONF_FULL_CONTROLLER] = True
        changes[const.CONF_DIRECT_VALVE_BEFORE_FULL_CONTROLLER] = None
    if not full:
        return changes
    programs = list(_value(config, const.CONF_PROGRAMS, None) or [])
    seeded = programs
    main = find_program(ensure_main_program(programs), MAIN_PROGRAM_ID) or {}
    has_enabled = any(
        isinstance(s, dict) and s.get(const.SCHEDULE_ENABLED) is not False
        for s in main.get(const.PROGRAM_SCHEDULES) or []
    )
    if not has_enabled:
        # The trigger started it: its schedule does now. Disabled schedules
        # it had did not start it, and are kept beside the new one.
        schedule = schedule_from_trigger(config)
        if schedule is not None:
            seeded = [
                (
                    {
                        **p,
                        const.PROGRAM_SCHEDULES: [
                            schedule,
                            *(p.get(const.PROGRAM_SCHEDULES) or []),
                        ],
                    }
                    if p.get(const.PROGRAM_ID) == MAIN_PROGRAM_ID
                    else p
                )
                for p in ensure_main_program(programs)
            ]
    if main.get(const.PROGRAM_ENABLED) is False:
        # "Program on" goes for the main program: off, nothing started it on
        # its own, which its schedules switched off keep so.
        seeded = [
            (
                {
                    **p,
                    const.PROGRAM_ENABLED: True,
                    const.PROGRAM_SCHEDULES: [
                        {**s, const.SCHEDULE_ENABLED: False}
                        for s in p.get(const.PROGRAM_SCHEDULES) or []
                    ],
                }
                if p.get(const.PROGRAM_ID) == MAIN_PROGRAM_ID
                else p
            )
            for p in ensure_main_program(seeded)
        ]
    if seeded is not programs:
        changes[const.CONF_PROGRAMS] = normalize_programs(seeded)
    return changes
