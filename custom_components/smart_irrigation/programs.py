"""Programs of the full controller.

A program is what Irrigation Unlimited calls a sequence: an ordered list of
steps (a zone, or several zones at once), watered when its schedules say so.
Everything here is plain data and pure functions, so it can be tested without
Home Assistant; the coordinator stores the list in the configuration
(``const.CONF_PROGRAMS``) and the runner executes it.

Smart Irrigation's difference is that a step takes the duration its water
balance calculated unless told otherwise (``DURATION_CALCULATED``), which is
what Irrigation Unlimited users did with two automations and its
``adjust_time`` service.

The main program is the one the full controller creates when it is switched on,
from the settings that already run the watering (the start trigger, the
sequencing, the pause between zones, the passes). It carries no copy of them:
until the user adds a second program, nothing runs differently from before.
"""

from __future__ import annotations

from . import const

MAIN_PROGRAM_ID = "main"
MAIN_PROGRAM_NAME = "Main program"

# How a step decides how long to water.
DURATION_CALCULATED = "calculated"  # the zone's calculated duration
DURATION_PERCENT = "percent"  # the calculated duration times a percentage
DURATION_FIXED = "fixed"  # a number of seconds
DURATION_MODES = (DURATION_CALCULATED, DURATION_PERCENT, DURATION_FIXED)


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
