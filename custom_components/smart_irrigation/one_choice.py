"""One choice says what Smart Irrigation does (the simplification of 2026.11).

The master list (Calculate and water / Calculate only / Stop everything)
replaces four settings that each stopped or started the watering on their own:
the full controller switch, direct valve control, the start trigger of the main
program and the main program's own "Program on". Here:

- "Calculate and water" is the full controller, and with it the valves. The
  programs are started by their own schedules only; the start trigger is for
  "Calculate only", where it fires the start event an automation listens to.
- ``migration_changes`` moves an installation over once, so that it keeps
  watering exactly as before: direct valve control alone becomes the full
  controller, the active start trigger becomes a schedule of the main program
  (the other defined triggers become schedules switched off, so none is lost),
  and a main program switched off becomes one whose schedules are off. The
  main program it works on is then converted into an ordinary program
  (program_migration.py), so this part only matters to an old store.
- ``first_program`` gives "Calculate and water" a program when there is none,
  so that choosing it never leaves the zones watered by nothing.
"""

from __future__ import annotations

from typing import Any

from . import const
from .programs import (
    MAIN_PROGRAM_ID,
    MAIN_PROGRAM_NAME,
    find_program,
    normalize_programs,
    watering_name,
    zone_steps,
    zones_with_valve,
)

# The repair that tells, once, that direct valve control became "Calculate and
# water": a notice only, confirmed to go away.
ISSUE_MOVED = "moved_to_calculate_and_water"


def moved_the_valves(changes: dict) -> bool:
    """Whether the move turned direct valve control into the controller."""
    return changes.get(const.CONF_FULL_CONTROLLER) is True


# The one choice, as the panel's list and an assistant name it.
MODE_WATER = "water"
MODE_CALCULATE = "calculate"
MODE_OFF = "off"
MODES = (MODE_WATER, MODE_CALCULATE, MODE_OFF)

# The settings the one choice stands for: read and written through ``mode``
# only, so that nothing sets them apart again (an assistant, say).
MODE_KEYS = (
    const.CONF_IRRIGATION_ENABLED,
    const.CONF_WATERING_ENABLED,
    const.CONF_FULL_CONTROLLER,
    const.CONF_DIRECT_VALVE_CONTROL_ENABLED,
    const.CONF_DIRECT_VALVE_BEFORE_FULL_CONTROLLER,
    const.CONF_ONE_CHOICE_MIGRATED,
)


def _value(config: Any, key: str, default=None):
    if isinstance(config, dict):
        return config.get(key, default)
    return getattr(config, key, default)


def current_mode(config: Any) -> str:
    """What Smart Irrigation does: water, calculate only, or nothing."""
    if _value(config, const.CONF_IRRIGATION_ENABLED, True) is False:
        return MODE_OFF
    if _value(config, const.CONF_FULL_CONTROLLER, False) is True:
        return MODE_WATER
    return MODE_CALCULATE


def mode_changes(mode: str, config: Any) -> dict:
    """The settings a choice of the list writes, as the panel writes them."""
    if mode == MODE_OFF:
        return {const.CONF_IRRIGATION_ENABLED: False}
    if mode == MODE_WATER:
        changes: dict = {
            const.CONF_IRRIGATION_ENABLED: True,
            const.CONF_WATERING_ENABLED: True,
            const.CONF_FULL_CONTROLLER: True,
        }
        if current_mode(config) != MODE_WATER:
            # What is watered outside the programs counts too.
            changes[const.CONF_OBSERVED_WATERING_ENABLED] = True
        return changes
    if mode == MODE_CALCULATE:
        return {
            const.CONF_IRRIGATION_ENABLED: True,
            const.CONF_WATERING_ENABLED: True,
            const.CONF_FULL_CONTROLLER: False,
            const.CONF_DIRECT_VALVE_CONTROL_ENABLED: False,
        }
    raise ValueError(f"mode must be one of {', '.join(MODES)}")


def _defined_triggers(config: Any) -> list:
    return [
        t
        for t in _value(config, const.CONF_IRRIGATION_START_TRIGGERS, []) or []
        if isinstance(t, dict)
    ]


def _schedule_of(trigger: dict | None) -> dict:
    """The schedule that starts a program as ``trigger`` did (None: the default)."""
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
                for t in _defined_triggers(config)
                if t.get(const.TRIGGER_CONF_NAME) == active
            ),
            None,
        )
    return _schedule_of(trigger)


def schedules_from_triggers(config: Any) -> list:
    """Every start trigger as a schedule: the active one as it started, the others off.

    A trigger that was defined but not the active one never fired; it becomes
    a schedule switched off, so it is not lost and can be switched on again.
    """
    active = _value(
        config, const.CONF_ACTIVE_START_TRIGGER, const.CONF_DEFAULT_ACTIVE_START_TRIGGER
    )
    started = schedule_from_trigger(config)
    schedules = [started] if started is not None else []
    for trigger in _defined_triggers(config):
        if started is not None and trigger.get(const.TRIGGER_CONF_NAME) == active:
            continue
        schedules.append({**_schedule_of(trigger), const.SCHEDULE_ENABLED: False})
    return schedules


def first_program(config: Any, zones, programs, language=None) -> list:
    """The programs, or a first one when there is none.

    "Calculate and water" with no program would water nothing, silently. The
    first program waters the zones with a valve as the general settings order
    them (one after the other with the pause between zones, or all at once,
    in the general passes), and starts at the moment of the active start
    trigger. Programs that are there are kept as they are. It is named in
    ``language``, Home Assistant's.
    """
    programs = [p for p in programs or [] if isinstance(p, dict)]
    if programs:
        return programs
    schedule = schedule_from_trigger(config)
    program = {
        const.PROGRAM_ID: "watering",
        const.PROGRAM_NAME: watering_name(language),
        const.PROGRAM_STEPS: zone_steps(
            zones_with_valve(zones, include_disabled=True),
            _value(
                config, const.CONF_ZONE_SEQUENCING, const.CONF_DEFAULT_ZONE_SEQUENCING
            ),
            _value(
                config, const.CONF_WATERING_PASSES, const.CONF_DEFAULT_WATERING_PASSES
            ),
            _value(
                config,
                const.CONF_PAUSE_BETWEEN_ZONES,
                const.CONF_DEFAULT_PAUSE_BETWEEN_ZONES,
            ),
        ),
        const.PROGRAM_SCHEDULES: [schedule] if schedule is not None else [],
    }
    return normalize_programs([program])


def _with_legacy_main(programs) -> list:
    """The programs with the old main program, created if it is missing.

    The full controller always had one, stored or not: the move below gives it
    the trigger's schedule, and the conversion that follows turns it into an
    ordinary program. deprecated: remove in 2027.11
    """
    programs = [dict(p) for p in (programs or []) if isinstance(p, dict)]
    if any(p.get(const.PROGRAM_ID) == MAIN_PROGRAM_ID for p in programs):
        return programs
    legacy = {
        const.PROGRAM_ID: MAIN_PROGRAM_ID,
        const.PROGRAM_NAME: MAIN_PROGRAM_NAME,
        const.PROGRAM_MAIN: True,
    }
    return [legacy, *programs]


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
    main = find_program(_with_legacy_main(programs), MAIN_PROGRAM_ID) or {}
    has_enabled = any(
        isinstance(s, dict) and s.get(const.SCHEDULE_ENABLED) is not False
        for s in main.get(const.PROGRAM_SCHEDULES) or []
    )
    if not has_enabled:
        # The trigger started it: its schedule does now. The other triggers
        # it could have used come along switched off, and disabled schedules
        # it had did not start it: they are all kept beside the new one.
        schedules = schedules_from_triggers(config)
        if schedules:
            seeded = [
                (
                    {
                        **p,
                        const.PROGRAM_SCHEDULES: [
                            *schedules,
                            *(p.get(const.PROGRAM_SCHEDULES) or []),
                        ],
                    }
                    if p.get(const.PROGRAM_ID) == MAIN_PROGRAM_ID
                    else p
                )
                for p in _with_legacy_main(programs)
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
            for p in _with_legacy_main(seeded)
        ]
    if seeded is not programs:
        # Stored as it was, the main program marked: the conversion of the
        # main program that runs next gives it its steps.
        changes[const.CONF_PROGRAMS] = seeded
    return changes
