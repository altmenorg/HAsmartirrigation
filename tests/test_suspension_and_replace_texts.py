"""The panel says when a program is suspended and what "replace" stops.

UX walk of 13 Nov.: a suspended program showed on the card only; the Programs
page neither said so nor could lift it, and the planning listed its runs (Q3).
Starting with "Replace what is running" asked only whether to open the valves,
then said the program was queued, while it had replaced the run (Q21).
"""

import json
from pathlib import Path

import pytest

FRONTEND = (
    Path(__file__).parent.parent / "custom_components" / "smart_irrigation" / "frontend"
)
LANGUAGES = FRONTEND / "localize" / "languages"
VIEW = FRONTEND / "src" / "views" / "general" / "view-general.ts"

TEXTS = {
    ("planning", "expected_skipped_suspended"): {"{when}"},
    ("programs", "confirm_run_replace"): {"{name}"},
    ("programs", "run_replacing"): {"{name}"},
    ("programs", "suspended_until"): {"{when}"},
    ("programs", "suspended"): set(),
    ("programs", "lift_suspension"): set(),
}


@pytest.mark.parametrize("lang", ["en", "de"])
@pytest.mark.parametrize(("key", "placeholders"), TEXTS.items())
def test_each_text_is_there_with_its_placeholders(lang, key, placeholders):
    texts = json.loads((LANGUAGES / f"{lang}.json").read_text(encoding="utf-8"))
    text = texts[key[0]][key[1]]
    assert text
    for placeholder in placeholders:
        assert placeholder in text


def test_the_panel_uses_them():
    source = VIEW.read_text(encoding="utf-8")
    for _, key in TEXTS:
        assert f't("{key}")' in source, key
    # The lift goes through the suspend action with no hours.
    assert '"suspend"' in source and "hours: 0" in source
