"""The import report's notes have a code the panel says in the user's language.

The backend writes each note in English and gives it a code and its values;
the panel looks the code up under ``panels.iu_import.notes`` and fills in the
values (ICU MessageFormat). These tests hold the two sides together: every
code the importer can give has a text in English and German, every text is
used, and a note's values are exactly the ones its text asks for.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

from custom_components.smart_irrigation import iu_import, iu_import_ha
from custom_components.smart_irrigation.iu_import import (
    CRON_WHY_CODES,
    RULE_CODES,
    plan_import,
)

from .iu_corpus import load

ROOT = Path(__file__).parent.parent
LANGUAGES = ROOT / "custom_components/smart_irrigation/frontend/localize/languages"
FIXTURES = Path(__file__).parent / "fixtures" / "irrigation_unlimited"
SOURCES = (Path(iu_import.__file__), Path(iu_import_ha.__file__))


def _notes(language: str) -> dict:
    data = json.loads((LANGUAGES / f"{language}.json").read_text(encoding="utf-8"))
    return data["panels"]["iu_import"]["notes"]


def _placeholders(text: str) -> set:
    """The values a text asks for: ``{name}`` and ``{count, plural, …}``."""
    return set(re.findall(r"\{(\w+)[,}]", text))


def _codes_in_the_sources() -> set:
    codes = set(RULE_CODES.values()) | set(CRON_WHY_CODES.values())
    for source in SOURCES:
        text = source.read_text(encoding="utf-8")
        codes |= set(re.findall(r'code="(\w+)"', text))
        codes |= set(re.findall(r'code="\w+" if \w+ else "(\w+)"', text))
        codes |= set(re.findall(r'CRON_WHY_CODES\.get\(why, "(\w+)"\)', text))
    return codes


def test_every_code_has_a_text_and_every_text_a_code():
    # A rule the mapping reports itself is counted, never listed by its rule:
    # a code for it would be a text nobody sees.
    assert not set(RULE_CODES) & iu_import._REPORTED_BY_THE_MAPPING
    english = _notes("en")
    assert _codes_in_the_sources() == set(english)
    assert set(_notes("de")) == set(english)


@pytest.mark.parametrize("language", ["en", "de"])
def test_both_languages_ask_for_the_same_values(language):
    english = _notes("en")
    for code, text in _notes(language).items():
        assert _placeholders(text) == _placeholders(english[code]), code


# A configuration with something odd almost everywhere: most notes come out.
ODD = {
    "unknown_top": 1,
    "controllers": [
        {
            "name": "Garden",
            "entity_id": "switch.pump",
            "postamble": -20,
            "preamble": 7200,
            "check_back": "often",
            "zones": [
                {
                    "name": "Lawn",
                    "entity_id": "valve.lawn",
                    "threshold": 30,
                    "entity_states": "on",
                    "check_back": {"states": "none", "delay": 10, "retries": 2},
                    "schedules": [{"time": "06:00"}],
                },
                {"name": "No valve"},
            ],
            "sequences": [
                {
                    "name": "Morning",
                    "repeat": 9,
                    "delay": 99999,
                    "schedules": [
                        {"name": "early", "time": "06:05:30", "duration": "00:10"},
                        {"time": "07:00", "duration": "00:20"},
                        {"time": {"sun": "noon"}},
                        {"time": {"sun": "sunrise", "before": 9999}},
                        {"time": {"cron": "0 6 1 * 1"}},
                        {"time": {"cron": "25 6-9 * * *"}},
                        {"time": "08:00", "weekday": ["funday"]},
                        {"time": "08:00", "day": {"every_n_days": "x"}},
                        {"time": "08:00", "day": {"every_n_days": 500}},
                        {"time": "08:00", "from": "1 Mar"},
                    ],
                    "zones": [
                        {"zone_id": [1, 2], "duration": "00:05", "repeat": 9},
                        {"zone_id": 7, "duration": "00:05"},
                        {"zone_id": 1, "volume": "lots"},
                    ],
                }
            ],
        },
        {"name": "Second", "zones": [{"name": "Beds", "entity_id": "valve.beds"}]},
    ],
}


def _items():
    found = list(plan_import(ODD)["report"]["items"])
    for path in sorted(FIXTURES.glob("*.yaml")):
        config = load(path)
        if isinstance(config, dict):
            found += plan_import(config)["report"]["items"]
    return found


def test_every_listed_note_has_a_code_and_the_values_its_text_asks_for():
    english = _notes("en")
    items = _items()
    seen = set()
    for item in items:
        assert item["code"], item
        assert item["code"] in english, item
        assert set(item["params"]) == _placeholders(english[item["code"]]), item
        seen.add(item["code"])
    # The configurations above reach most of the notes, not a handful.
    assert len(seen) >= 25, sorted(seen)


def test_a_note_made_on_the_home_assistant_side_has_a_code_too():
    config, notes = iu_import_ha.parse_pasted(
        "controllers:\n  - name: !secret garden\n    zones:\n      - entity_id: valve.a\n"
    )
    assert config["controllers"][0]["name"] == "!secret garden"
    [note] = notes
    assert note["code"] == "tags_not_followed"
    assert set(note["params"]) == _placeholders(_notes("en")["tags_not_followed"])


def test_a_duration_too_big_for_a_number_is_no_duration():
    """1e300 seconds or .inf: reported, not a crash."""
    assert iu_import.seconds_of(1e300) is None
    assert iu_import.seconds_of(float("inf")) is None
    plan = plan_import(
        {"controllers": [{"name": "G", "entity_id": "switch.p", "preamble": 1e300}]}
    )
    assert plan["supplies"]
