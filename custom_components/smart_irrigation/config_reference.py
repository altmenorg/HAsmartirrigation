"""Every field an assistant can write, in one place (GetConfigReference).

A program is written in the shape of the program YAML the panel's YAML editor
edits. The panel's standard form leaves out the options few need: they are
fields of its advanced mode (``advanced``). Two technical ones have no field
in any mode and exist only in YAML (``yaml_only``). An assistant learns a key
from what it reads
only when that key is set somewhere, so this reference lists them all: for a
program, its steps, its schedules and its notifications, and for a zone, the
fields SaveZone takes. Each with its type, its allowed values or range, its
default and what it does.

The bounds are the ones the save applies (programs.py, schedules.py, the zone
schema of websockets.py), read from their constants. Tests check that every
key a save keeps is listed here and that nothing listed is unknown to it, so
an option added later cannot be forgotten for the assistant.
"""

from __future__ import annotations

from typing import Any

from . import const, presets
from . import programs as p
from . import schedules as s
from .engine_binding import ENGINE_BY_METHOD


def _field(
    kind: str,
    meaning: str,
    *,
    default: Any = None,
    values: Any = None,
    low: Any = None,
    high: Any = None,
    unit: str | None = None,
    advanced: bool = False,
    yaml_only: bool = False,
    types: tuple | None = None,
) -> dict:
    """One field, its empty parts left out to keep the reference short."""
    entry: dict[str, Any] = {"type": kind}
    if values is not None:
        entry["values"] = list(values)
    if low is not None:
        entry["min"] = low
    if high is not None:
        entry["max"] = high
    if unit is not None:
        entry["unit"] = unit
    if default is not None:
        entry["default"] = default
    if types is not None:
        # The schedule types the field means something for.
        entry["schedule_types"] = list(types)
    if advanced:
        # A field of the panel's advanced mode only.
        entry["advanced"] = True
    if yaml_only:
        # No field in the panel, in any mode.
        entry["yaml_only"] = True
    entry["meaning"] = meaning
    return entry


_SUN = (s.SCHEDULE_TYPE_SUN,)
_MOMENT = (s.SCHEDULE_TYPE_TIME, s.SCHEDULE_TYPE_SUN)

PROGRAM_FIELDS: dict[str, dict] = {
    const.PROGRAM_ID: _field(
        "string",
        "Lower case letters, digits and _. Give it to replace that program; "
        "leave it out to add one (made from the name).",
    ),
    const.PROGRAM_NAME: _field("string", "The name shown to the user."),
    const.PROGRAM_STEPS: _field(
        "list of step", "The steps, watered in this order (see `step`)."
    ),
    const.PROGRAM_SCHEDULES: _field(
        "list of schedule",
        "When it starts (see `schedule`). All off or none: it starts only when "
        "run by hand.",
        default=[],
    ),
    const.PROGRAM_TOURS: _field(
        "integer",
        "How many times the whole list of steps is gone through in one run.",
        default=1,
        low=1,
        high=p.MAX_TOURS,
        advanced=True,
    ),
    const.PROGRAM_NOTIFY: _field(
        "notify",
        "Who is told about its runs, and when (see `notify`). Absent: nobody.",
    ),
    const.PROGRAM_DELAY: _field(
        "number",
        "Old program-wide wait between steps: given to each step without a "
        "delay of its own, then stored as 0. Set a step's `delay` instead.",
        default=0,
        low=-p.MAX_OVERLAP_SECONDS,
        high=p.MAX_DELAY_SECONDS,
        unit="s",
    ),
}

STEP_FIELDS: dict[str, dict] = {
    const.STEP_ID: _field(
        "string", "Unique in the program; made (step_N) when left out."
    ),
    const.STEP_ZONES: _field(
        "list of zone id or name",
        "The zones of the step, watered together. Names are matched to ids.",
    ),
    const.STEP_MODE: _field(
        "string",
        "How long it waters: the duration Smart Irrigation calculated, a "
        "percent of it, or a fixed number of seconds.",
        values=p.DURATION_MODES,
        default=p.DURATION_CALCULATED,
    ),
    const.STEP_PERCENT: _field(
        "number",
        "With mode percent: the share of the calculated water.",
        default=100,
        low=0,
        high=p.MAX_PERCENT,
        unit="%",
    ),
    const.STEP_SECONDS: _field(
        "number",
        "With mode fixed: the seconds of water.",
        default=0,
        low=0,
        high=p.MAX_STEP_SECONDS,
        unit="s",
    ),
    const.STEP_PASSES: _field(
        "integer",
        "Cycle and soak: the water split in this many passes, with the soak "
        "of the settings between them.",
        default=1,
        low=1,
        high=p.MAX_PASSES,
    ),
    const.STEP_DELAY: _field(
        "number or null",
        "Wait after this step before the next one; negative: the next one "
        "starts that long before this one ends (overlap).",
        low=-p.MAX_OVERLAP_SECONDS,
        high=p.MAX_DELAY_SECONDS,
        unit="s",
    ),
    const.STEP_MAX_LITRES: _field(
        "number",
        "A zone stops once this many litres went through its flow meter (0: "
        "no limit).",
        default=0,
        low=0,
        high=100000,
        unit="L",
    ),
    const.STEP_ENABLED: _field(
        "boolean", "false: the step is left out of the runs.", default=True
    ),
    const.STEP_MIN_SECONDS: _field(
        "number",
        "Least water of a zone in the step (0: no bound).",
        default=0,
        low=0,
        high=p.MAX_STEP_SECONDS,
        unit="s",
    ),
    const.STEP_MAX_SECONDS: _field(
        "number",
        "Most water of a zone in the step (0: no bound).",
        default=0,
        low=0,
        high=p.MAX_STEP_SECONDS,
        unit="s",
    ),
    const.STEP_ADJUST_SECONDS: _field(
        "number",
        "Seconds added to (or, negative, taken from) the water, after the "
        "percent and before the bounds.",
        default=0,
        low=-p.MAX_ADJUST_SECONDS,
        high=p.MAX_ADJUST_SECONDS,
        unit="s",
        advanced=True,
    ),
    const.STEP_MIN_DEFICIT_MM: _field(
        "number",
        "A zone whose water deficit is below this sits the step out (0: the "
        "zone's own threshold). Not for mode fixed.",
        default=0,
        low=0,
        high=p.MAX_MIN_DEFICIT_MM,
        unit="mm",
        advanced=True,
    ),
}

SCHEDULE_FIELDS: dict[str, dict] = {
    const.SCHEDULE_ID: _field(
        "string", "Unique in the program; made (schedule_N) when left out."
    ),
    const.SCHEDULE_ENABLED: _field(
        "boolean", "false: this schedule starts nothing.", default=True
    ),
    const.SCHEDULE_TYPE: _field(
        "string",
        "time: at a clock time; sun: at a sun event with an offset; after: "
        "when another program has really watered and finished, or at its "
        "planned moment when it did not water (held back, suspended, nothing "
        "to water); not when it was stopped by hand or failed.",
        values=s.SCHEDULE_TYPES,
        default=s.SCHEDULE_TYPE_TIME,
    ),
    const.SCHEDULE_TIME: _field(
        "string HH:MM",
        "The clock time.",
        default=s.DEFAULT_TIME,
        types=(s.SCHEDULE_TYPE_TIME,),
    ),
    const.SCHEDULE_EVENT: _field(
        "string",
        "The sun event; azimuth: when the sun reaches `azimuth`.",
        values=s.SUN_EVENTS,
        default="sunrise",
        types=_SUN,
    ),
    const.SCHEDULE_AZIMUTH: _field(
        "number",
        "With event azimuth: the sun's bearing, in degrees from north.",
        default=s.DEFAULT_AZIMUTH,
        low=0,
        high=360,
        unit="deg",
        types=_SUN,
    ),
    const.SCHEDULE_OFFSET_MINUTES: _field(
        "integer",
        "sun: minutes after the event (negative: before). after: minutes "
        "after the other program finished, or after its planned moment when it "
        "did not water (0 or more).",
        default=0,
        low=-s.MAX_OFFSET_MINUTES,
        high=s.MAX_OFFSET_MINUTES,
        unit="min",
        types=(s.SCHEDULE_TYPE_SUN, s.SCHEDULE_TYPE_AFTER),
    ),
    const.SCHEDULE_ANCHOR: _field(
        "string",
        "start: the moment is when it starts; end: when it must be done "
        "(placed back from the calculated run).",
        values=s.ANCHORS,
        default=s.ANCHOR_START,
        types=_MOMENT,
    ),
    const.SCHEDULE_HARD_DEADLINE: _field(
        "boolean",
        "With anchor end: the end is a limit, the run is cut there.",
        default=False,
        types=_MOMENT,
    ),
    const.SCHEDULE_AFTER_PROGRAM: _field(
        "string",
        "The id (or name) of the program it starts after. No loops.",
        types=(s.SCHEDULE_TYPE_AFTER,),
    ),
    const.SCHEDULE_WEEKDAYS: _field(
        "list of integer",
        "Days of the week it runs on, 0 Monday to 6 Sunday (empty: every day).",
        default=[],
        low=0,
        high=6,
    ),
    const.SCHEDULE_EVERY_N_DAYS: _field(
        "integer",
        "Every N days (1: every day).",
        default=1,
        low=1,
        high=s.MAX_EVERY_N_DAYS,
    ),
    const.SCHEDULE_EVERY_OFFSET: _field(
        "integer",
        "Shifts the every-N-days cycle by that many days, to take turns "
        "(groups A, B, C).",
        default=0,
        low=0,
        high=s.MAX_EVERY_N_DAYS - 1,
        unit="days",
        advanced=True,
    ),
    const.SCHEDULE_PARITY: _field(
        "string",
        "Even or odd days of the month only.",
        values=s.PARITIES,
        default=s.PARITY_ANY,
        advanced=True,
    ),
    const.SCHEDULE_DAYS_OF_MONTH: _field(
        "list of integer or 'last'",
        "Named days of the month, 1 to 31 or last (empty: any).",
        default=[],
        low=1,
        high=31,
        advanced=True,
    ),
    const.SCHEDULE_MONTHS: _field(
        "list of integer",
        "Months it runs in, 1 January to 12 December (empty: all).",
        default=[],
        low=1,
        high=12,
        advanced=True,
    ),
    const.SCHEDULE_FROM: _field(
        "string MM-DD or null",
        "Start of the period of the year it runs in (may wrap over New Year).",
    ),
    const.SCHEDULE_UNTIL: _field(
        "string MM-DD or null", "End of that period, included."
    ),
    const.SCHEDULE_FALLBACK_TIME: _field(
        "string HH:MM or 'previous'",
        "Polar day or night, no sun event: start at this time, or at the last "
        "one seen (previous). Absent: the day is skipped.",
        types=_SUN,
        yaml_only=True,
    ),
    const.SCHEDULE_WEATHER: _field(
        "boolean",
        "Whether the skip conditions (rain, frost, wind, moist soil...) can "
        "hold the run back. Frost, wind, the rain sensor and a postponement "
        "are read at each start; the rain forecast and the days between "
        "waterings are decided once a day, at its first start.",
        default=True,
    ),
    const.SCHEDULE_SKIP_CONDITIONS: _field(
        "list of string",
        "With weather on: only these skip conditions apply (absent: all; "
        "postponed always applies).",
        values=const.SKIP_CONDITION_IDS,
        advanced=True,
    ),
}

NOTIFY_FIELDS: dict[str, dict] = {
    const.NOTIFY_TARGETS: _field(
        "list of string",
        "notify.<entity or action> (a phone app...) or persistent_notification. "
        "None: nothing is stored, nobody is told.",
    ),
    const.NOTIFY_WHEN: _field(
        "string",
        "finish: after every run; problems: only when something went wrong.",
        values=const.NOTIFY_WHEN_CHOICES,
        default=const.NOTIFY_WHEN_FINISH,
    ),
    const.NOTIFY_START: _field(
        "boolean", "Also tell when a run starts.", default=False
    ),
}

# A zone, as SaveZone takes it: metric figures. What the calculation and the
# runs write (bucket, duration, explanation...) is not set by hand.
ZONE_FIELDS: dict[str, dict] = {
    const.ZONE_ID: _field("integer", "The zone to change; leave it out to create one."),
    const.ZONE_NAME: _field("string", "The name shown to the user."),
    const.ZONE_STATE: _field(
        "string",
        "automatic: calculated and watered; manual: calculated, watered only "
        "by hand; disabled: neither.",
        values=const.ZONE_STATES,
        default=const.ZONE_STATE_AUTOMATIC,
    ),
    const.ZONE_SIZE: _field("number", "Area watered.", low=0, unit="m2"),
    const.ZONE_THROUGHPUT: _field(
        "number", "Water the zone's emitters deliver.", low=0, unit="l/min"
    ),
    const.ZONE_INPUT_METHOD: _field(
        "string",
        "throughput: the precipitation rate is throughput / size; direct: "
        "precipitation_rate is given.",
        values=const.ZONE_INPUT_METHODS,
        default=const.CONF_DEFAULT_ZONE_INPUT_METHOD,
    ),
    const.ZONE_PRECIPITATION_RATE: _field(
        "number or null", "With input_method direct.", low=0, unit="mm/h"
    ),
    const.ZONE_DISTRIBUTION_EFFICIENCY: _field(
        "number or null",
        "Share of the water that reaches the plants (null: 100).",
        low=0,
        high=100,
        unit="%",
    ),
    const.ZONE_LINKED_ENTITY: _field(
        "entity id or null",
        "The valve or switch that waters the zone (FindEntities). Not one of "
        "Smart Irrigation's own.",
    ),
    const.ZONE_EXTRA_ENTITIES: _field(
        "list of entity id or null",
        "Other valves opened and closed with the linked one.",
    ),
    const.ZONE_SUPPLY_ID: _field(
        "string or null",
        "The supply (pump or main valve) feeding it, an id of the settings' "
        "supplies.",
    ),
    const.ZONE_MAPPING: _field(
        "integer or null", "The sensor group it reads the weather from (id)."
    ),
    const.ZONE_MODULE: _field(
        "integer or null", "The calculation module (id, GetSensorGroups)."
    ),
    const.ZONE_CALCULATION_METHOD: _field(
        "string",
        "How it is calculated: from the weather, from a provided ET value, or "
        "a fixed amount. Binds the module behind it.",
        values=ENGINE_BY_METHOD,
    ),
    const.ZONE_METHOD_CONFIG: _field(
        "object",
        "The options of that module (as the module's config in "
        "GetSensorGroups, e.g. a fixed amount).",
    ),
    const.ZONE_SOIL_TYPE: _field(
        "string or null",
        "The soil, in words: sets drainage_rate unless that is given.",
        values=[*presets.SOIL_TYPES, presets.CUSTOM, presets.NOT_CHOSEN],
    ),
    const.ZONE_DRAINAGE_RATE: _field(
        "number or null",
        "How fast the soil drains.",
        default=const.CONF_DEFAULT_DRAINAGE_RATE,
        low=0,
        unit="mm/h",
    ),
    const.ZONE_PLANT_TYPE: _field(
        "string or null",
        "The planting, in words: sets multiplier unless that is given.",
        values=[*presets.PLANT_TYPES, presets.CUSTOM, presets.NOT_CHOSEN],
    ),
    const.ZONE_MULTIPLIER: _field(
        "number", "The crop coefficient (Kc) applied to the ET.", default=1.0
    ),
    const.ZONE_CROP_FACTOR_BY_MONTH: _field(
        "list of 12 number-or-null, or null",
        "A crop coefficient per month, January first; an empty month uses "
        "multiplier.",
    ),
    const.ZONE_MAXIMUM_DURATION: _field(
        "number",
        "Longest watering of the zone.",
        default=const.CONF_DEFAULT_MAXIMUM_DURATION,
        unit="s",
    ),
    const.ZONE_MAXIMUM_BUCKET: _field(
        "number or null",
        "Most water the balance may hold above zero.",
        default=const.CONF_DEFAULT_MAXIMUM_BUCKET,
        unit="mm",
    ),
    const.ZONE_LEAD_TIME: _field(
        "number",
        "Added to a watering that is not zero: time to fill the pipe, start a "
        "pump, build pressure.",
        unit="s",
    ),
    const.ZONE_IRRIGATION_THRESHOLD: _field(
        "number or null",
        "Deficit to let build up before watering (0: water as soon as "
        "anything is missing).",
        default=const.CONF_DEFAULT_IRRIGATION_THRESHOLD,
        low=0,
        unit="mm",
    ),
    const.ZONE_DAYS_BETWEEN_IRRIGATION: _field(
        "integer or null",
        "Days between irrigation for this zone (null: the general setting; "
        "0: no restriction).",
        low=0,
        high=365,
        unit="days",
    ),
    const.ZONE_AVAILABLE_WATER: _field(
        "number or null",
        "What the soil holds for the plants (TAW); null: no floor to the " "deficit.",
        low=0,
        unit="mm",
    ),
    const.ZONE_ALLOWED_DEPLETION: _field(
        "number or null",
        "Share of available_water the plants may use up before they suffer.",
        default=const.CONF_DEFAULT_ALLOWED_DEPLETION,
        low=0,
        high=100,
        unit="%",
    ),
    const.ZONE_FLOW_SENSOR: _field(
        "entity id or null",
        "A volume or flow meter: credits the balance by measured volume.",
    ),
    const.ZONE_OBSERVED_IGNORE_SECONDS: _field(
        "number or null",
        "A watering seen on the valve this short or shorter is not credited.",
        low=0,
        high=const.OBSERVED_IGNORE_SECONDS_MAX,
        unit="s",
    ),
    const.ZONE_SOIL_MOISTURE_SENSOR: _field(
        "entity id or null", "A soil moisture sensor, in %."
    ),
    const.ZONE_SOIL_MOISTURE_THRESHOLD: _field(
        "number or null",
        "At or above this moisture the zone sits a run out.",
        default=const.CONF_DEFAULT_SOIL_MOISTURE_THRESHOLD,
        low=0,
        high=100,
        unit="%",
    ),
    const.ZONE_SAFETY_OFF_MODE: _field(
        "string or null",
        "The valve's own shut-off timer: auto (MQTT topic, else verified ZHA "
        "valves), off, or zha (any ZHA valve).",
        values=const.SAFETY_OFF_MODES,
        default=const.SAFETY_OFF_MODE_AUTO,
    ),
    const.ZONE_SAFETY_OFF_TOPIC: _field(
        "string or null",
        "MQTT set topic sent an on with timed off (zigbee2mqtt...).",
    ),
    const.ZONE_SAFETY_OFF_STATE_KEY: _field(
        "string or null",
        "The state property of that payload (state, state_l1...).",
        default=const.CONF_DEFAULT_SAFETY_OFF_STATE_KEY,
        yaml_only=True,
    ),
    const.ZONE_SAFETY_OFF_ENTITY: _field(
        "number entity id or null",
        "A number entity holding how long the valve stays open by itself; "
        "set before each open.",
    ),
    const.ZONE_SAFETY_OFF_REQUIRED: _field(
        "boolean or null",
        "true: skip the watering rather than open the valve without its own "
        "timer set.",
        default=False,
    ),
    const.ZONE_CONFIRM_TIMEOUT: _field(
        "number or null",
        "Time the valves are given to confirm they opened or closed (null: "
        "the runner's default).",
        low=const.CONFIRM_TIMEOUT_MIN,
        high=const.CONFIRM_TIMEOUT_MAX,
        unit="s",
    ),
    const.ZONE_OPEN_RESENDS: _field(
        "integer or null",
        "How often the open is sent again in that time (null: default).",
        low=0,
        high=const.OPEN_RESENDS_MAX,
        advanced=True,
    ),
}

# The sections, and what each one is about.
SECTIONS: dict[str, tuple] = {
    "program": (
        PROGRAM_FIELDS,
        "A program, as PreviewProgram and SaveProgram take it.",
    ),
    "step": (STEP_FIELDS, "One item of a program's `steps`."),
    "schedule": (
        SCHEDULE_FIELDS,
        "One item of a program's `schedules`. A field with schedule_types "
        "means something only for those types; the day filters apply to all "
        "and must all hold.",
    ),
    "notify": (NOTIFY_FIELDS, "A program's `notify`."),
    "zone": (
        ZONE_FIELDS,
        "A zone, as SaveZone takes it (metric). Computed fields (bucket, "
        "duration, explanation...) are not set by hand.",
    ),
}

# What a request for a section returns: a program is written with its steps,
# schedules and notifications.
GROUPS: dict[str, tuple] = {
    "program": ("program", "step", "schedule", "notify"),
    "zone": ("zone",),
}

NOTE = (
    "Every field that can be written, including the ones the panel shows in "
    "its advanced mode only (advanced: true) and the ones set only in YAML "
    "(yaml_only: true, no field in the panel). Send only the fields you "
    "change; a value out of range is brought within it on save."
)


def config_reference(section: str | None = None) -> dict:
    """The reference, all of it or one group (``program`` or ``zone``)."""
    names = GROUPS.get(section or "", tuple(SECTIONS))
    return {
        "note": NOTE,
        **{
            name: {"about": SECTIONS[name][1], "fields": SECTIONS[name][0]}
            for name in names
        },
    }
