"""The reference of every writable field an assistant gets (config_reference.py).

These tests are the guard that an option added later is never forgotten for
the assistant: every key a program save keeps, and every field a zone save
takes, must be in the reference, and nothing in it may be unknown to them.
"""

from homeassistant.helpers import llm

from custom_components.smart_irrigation import config_reference as ref
from custom_components.smart_irrigation import const, llm_api
from custom_components.smart_irrigation.llm_config_tools import _ZONE_ACTIONS
from custom_components.smart_irrigation.programs import normalize_programs
from custom_components.smart_irrigation.websockets import (
    SERVER_OWNED_ZONE_FIELDS,
    ZONE_SAVE_SCHEMA,
)

# What a zone save takes but no one sets by hand: the calculation's results.
# Everything else ZONE_SAVE_SCHEMA takes, bar the one-off actions and the
# fields the server owns, must be in the reference.
ZONE_READ_ONLY = {const.ZONE_BUCKET, const.ZONE_DURATION}

YAML_ONLY = {
    "program": set(),
    "step": set(),
    "schedule": {const.SCHEDULE_FALLBACK_TIME},
    "notify": set(),
    "zone": {const.ZONE_SAFETY_OFF_STATE_KEY},
}

# The options the panel's form shows in its advanced mode only.
ADVANCED = {
    "program": {const.PROGRAM_TOURS},
    "step": {const.STEP_ADJUST_SECONDS, const.STEP_MIN_DEFICIT_MM},
    "schedule": {
        const.SCHEDULE_EVERY_OFFSET,
        const.SCHEDULE_PARITY,
        const.SCHEDULE_DAYS_OF_MONTH,
        const.SCHEDULE_MONTHS,
        const.SCHEDULE_SKIP_CONDITIONS,
    },
    "notify": set(),
    "zone": {const.ZONE_OPEN_RESENDS},
}


def _every_option_set() -> list:
    """Two programs with every option there is set, in every schedule type."""
    return [
        {
            "id": "first",
            "name": "First",
            "delay": 30,
            "tours": 2,
            "notify": {
                "targets": ["notify.phone"],
                "when": "problems",
                "start": True,
            },
            "steps": [
                {
                    "id": "s1",
                    "zones": [1, 2],
                    "mode": "percent",
                    "percent": 80,
                    "seconds": 60,
                    "passes": 2,
                    "delay": 10,
                    "max_litres": 50,
                    "enabled": True,
                    "min_seconds": 60,
                    "max_seconds": 900,
                    "adjust_seconds": -30,
                    "min_deficit_mm": 2,
                }
            ],
            "schedules": [
                {
                    "id": "sun",
                    "enabled": True,
                    "type": "sun",
                    "time": "05:00",
                    "event": "azimuth",
                    "azimuth": 90,
                    "offset_minutes": -15,
                    "anchor": "end",
                    "hard_deadline": True,
                    "weekdays": [0, 2],
                    "every_n_days": 3,
                    "every_offset": 1,
                    "parity": "even",
                    "days_of_month": [1, "last"],
                    "months": [5, 6],
                    "from_date": "04-01",
                    "until_date": "10-31",
                    "fallback_time": "previous",
                    "weather": True,
                    "skip_conditions": ["rain_sensor", "freeze"],
                },
            ],
        },
        {
            "id": "second",
            "name": "Second",
            "steps": [{"zones": [3]}],
            "schedules": [
                {"type": "after", "after_program": "first", "offset_minutes": 5},
                {"type": "time", "time": "06:30"},
            ],
        },
    ]


def _kept_keys() -> dict:
    """The keys normalize_programs keeps, per section."""
    kept: dict = {"program": set(), "step": set(), "schedule": set(), "notify": set()}
    for program in normalize_programs(_every_option_set()):
        kept["program"] |= set(program)
        kept["notify"] |= set(program.get(const.PROGRAM_NOTIFY) or {})
        for step in program[const.PROGRAM_STEPS]:
            kept["step"] |= set(step)
        for schedule in program[const.PROGRAM_SCHEDULES]:
            kept["schedule"] |= set(schedule)
    return kept


def test_every_key_a_program_save_keeps_is_in_the_reference():
    kept = _kept_keys()
    for section, keys in kept.items():
        listed = set(ref.SECTIONS[section][0])
        assert keys - listed == set(), f"{section}: missing from the reference"
        assert listed - keys == set(), f"{section}: not kept by a save"


def test_every_writable_zone_field_is_in_the_reference():
    schema = {getattr(k, "schema", k) for k in ZONE_SAVE_SCHEMA.schema}
    writable = (
        schema - set(SERVER_OWNED_ZONE_FIELDS) - set(_ZONE_ACTIONS) - ZONE_READ_ONLY
    )
    listed = set(ref.ZONE_FIELDS)
    assert writable - listed == set(), "missing from the zone reference"
    assert listed - writable == set(), "not taken by a zone save"


def test_the_yaml_only_options_are_flagged():
    for section, (fields, _about) in ref.SECTIONS.items():
        flagged = {k for k, f in fields.items() if f.get("yaml_only")}
        assert flagged == YAML_ONLY[section], section


def test_the_advanced_mode_options_are_flagged():
    for section, (fields, _about) in ref.SECTIONS.items():
        flagged = {k for k, f in fields.items() if f.get("advanced")}
        assert flagged == ADVANCED[section], section
        # Never both: a YAML-only option has no field in any mode.
        assert not flagged & YAML_ONLY[section], section


def test_every_field_is_described():
    for fields, _about in ref.SECTIONS.values():
        for key, field in fields.items():
            assert field["type"] and field["meaning"], key
            if "min" in field and "max" in field:
                assert field["min"] <= field["max"], key


async def test_the_tool_returns_the_sections():
    tool = llm_api.GetConfigReferenceTool()

    def call(**args):
        return llm.ToolInput(tool_name="GetConfigReference", tool_args=args)

    async def answer(**args):
        result = await tool.async_call(None, call(**args), None)
        return getattr(result, "data", result)["result"]

    everything = await answer()
    assert set(everything) == {"note", *ref.SECTIONS}
    assert everything["step"]["fields"]["adjust_seconds"]["advanced"] is True
    assert "yaml_only" not in everything["step"]["fields"]["adjust_seconds"]
    assert everything["schedule"]["fields"]["fallback_time"]["yaml_only"] is True
    assert everything["step"]["fields"]["adjust_seconds"]["min"] == -6 * 3600

    program = await answer(section="program")
    assert set(program) == {"note", "program", "step", "schedule", "notify"}
    assert program["program"]["fields"]["tours"]["max"] == 6
    assert program["schedule"]["fields"]["type"]["values"] == ["time", "sun", "after"]

    zone = await answer(section="zone")
    assert set(zone) == {"note", "zone"}
    assert "bucket" not in zone["zone"]["fields"]
    assert zone["zone"]["fields"]["state"]["values"] == const.ZONE_STATES

    assert set(await answer(section="all")) == set(everything)
