"""The options a form does not show are kept by the store.

The standard form has no field for the advanced-mode options, and no form for
the YAML-only ones (as in Home Assistant's own visual editors): it sends the
program back with every key it was given, and the store
must keep them through ``normalize_programs``, saved again and again.
"""

from custom_components.smart_irrigation.programs import normalize_programs

PROGRAM = {
    "id": "morning",
    "name": "Morning",
    "tours": 2,
    "steps": [
        {"zones": [1], "adjust_seconds": 30, "min_deficit_mm": 4},
    ],
    "schedules": [
        {
            "type": "sun",
            "event": "sunrise",
            "every_n_days": 3,
            "every_offset": 1,
            "parity": "odd",
            "days_of_month": [1, 15, "last"],
            "months": [5, 6, 7, 8, 9],
            "fallback_time": "05:30",
            "weather": True,
            "skip_conditions": ["wind", "freeze"],
        },
    ],
}


def _check(program):
    assert program["tours"] == 2
    step = program["steps"][0]
    assert step["adjust_seconds"] == 30
    assert step["min_deficit_mm"] == 4
    schedule = program["schedules"][0]
    assert schedule["every_offset"] == 1
    assert schedule["parity"] == "odd"
    assert schedule["days_of_month"] == [1, 15, "last"]
    assert schedule["months"] == [5, 6, 7, 8, 9]
    assert schedule["fallback_time"] == "05:30"
    assert set(schedule["skip_conditions"]) == {"wind", "freeze"}
    assert schedule["weather"] is True


def test_the_yaml_only_options_are_stored():
    _check(normalize_programs([PROGRAM])[0])


def test_a_form_edit_of_another_field_keeps_them():
    # What the panel does: the stored program, one field changed, sent back.
    stored = normalize_programs([PROGRAM])[0]
    edited = {**stored, "name": "Dawn"}
    edited["steps"] = [{**stored["steps"][0], "zones": [1, 2]}]
    edited["schedules"] = [{**stored["schedules"][0], "offset_minutes": 10}]
    again = normalize_programs([edited])[0]
    assert again["name"] == "Dawn"
    assert again["steps"][0]["zones"] == [1, 2]
    assert again["schedules"][0]["offset_minutes"] == 10
    _check(again)
    # And saved once more as it is, nothing moves.
    assert normalize_programs([again])[0] == again
