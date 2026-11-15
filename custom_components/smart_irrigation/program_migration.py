"""The conversion, once, of the main program into an ordinary program.

The main program had no steps: it watered every zone with a valve through a
cycle of its own (the "classic cycle"), ordered by the general sequencing, in
the general passes, with the general pause between zones. Every program is
now equal, with steps of its own, so it is converted into one that waters
exactly as the cycle did:

- it keeps its id ``main`` (its sensor, its last runs, its notifications and
  the marks of its schedules are keyed on it), its schedules and its
  notifications, and its name unless it is still the default "Main program",
  which becomes the neutral "Watering" in Home Assistant's language: nothing
  is the main one any more;
- its steps are the zones the cycle watered, in the cycle's order: the zones
  with a linked valve, a disabled one included (the run leaves it out while it
  is disabled, as the cycle did, and waters it again once it is enabled);
- sequential: one step per zone, the pause between zones as each step's delay
  (none after the last); parallel: one step with every zone. Each step takes
  the calculated duration in the general number of passes, and the soak
  between passes is the general one, which every program's steps use.

The program-level "Program on" goes with it: a program that was off had its
schedules switched off, which says the same (it starts on its own no more,
and can still be run by hand).

The conversion is made whatever the installation does (with "Calculate only"
the programs do not run, but the data has one shape), and marked so it is
never made twice. deprecated: remove in 2027.11
"""

from __future__ import annotations

from typing import Any

from . import const
from .programs import (
    MAIN_PROGRAM_ID,
    MAIN_PROGRAM_NAME,
    normalize_programs,
    watering_name,
    zone_steps,
    zones_with_valve,
)


def _value(config: Any, key: str, default=None):
    if isinstance(config, dict):
        return config.get(key, default)
    return getattr(config, key, default)


def classic_cycle_steps(config: Any, zones) -> list:
    """The steps that water the zones as the classic cycle did, in its order."""
    return zone_steps(
        zones_with_valve(zones, include_disabled=True),
        _value(config, const.CONF_ZONE_SEQUENCING, const.CONF_DEFAULT_ZONE_SEQUENCING),
        _value(config, const.CONF_WATERING_PASSES, const.CONF_DEFAULT_WATERING_PASSES),
        _value(
            config,
            const.CONF_PAUSE_BETWEEN_ZONES,
            const.CONF_DEFAULT_PAUSE_BETWEEN_ZONES,
        ),
    )


def _is_main(program: dict) -> bool:
    # Marked so; or, from a store older than the mark, the id with no steps.
    return program.get(const.PROGRAM_MAIN) is True or (
        program.get(const.PROGRAM_ID) == MAIN_PROGRAM_ID
        and not program.get(const.PROGRAM_STEPS)
    )


def conversion_changes(config: Any, zones, language=None) -> dict:
    """What to store, once, to convert the main program and "Program on".

    ``language`` is Home Assistant's, for the name of a main program that kept
    its default one.
    """
    if _value(config, const.CONF_MAIN_PROGRAM_CONVERTED, False) is True:
        return {}
    changes: dict = {const.CONF_MAIN_PROGRAM_CONVERTED: True}
    programs = [
        p
        for p in _value(config, const.CONF_PROGRAMS, None) or []
        if isinstance(p, dict)
    ]
    if not programs:
        return changes
    converted = []
    for program in programs:
        program = dict(program)
        if _is_main(program):
            program.pop(const.PROGRAM_MAIN, None)
            program[const.PROGRAM_ID] = MAIN_PROGRAM_ID
            program[const.PROGRAM_STEPS] = classic_cycle_steps(config, zones)
            program[const.PROGRAM_TOURS] = 1
            program[const.PROGRAM_DELAY] = 0.0
            name = str(program.get(const.PROGRAM_NAME) or "").strip()
            if not name or name == MAIN_PROGRAM_NAME:
                program[const.PROGRAM_NAME] = watering_name(language)
        # "Program on" switched off becomes its schedules switched off: done by
        # normalize_programs, which reads the old key for that alone.
        converted.append(program)
    changes[const.CONF_PROGRAMS] = normalize_programs(converted)
    return changes
