"""The texts of the program editor after the UX walk of 13 Nov.

- Q5: a step in passes pointed to "the main program's settings" for its soak,
  where the field only showed when the main program itself watered in passes.
- Q12: the sequencing help began with a sentence about who opens the valves.
- Q14: the adjustment read "In force: 50 % and 0 s per step, until …".
- Q15: the step head said nothing of passes or an overlap.
- Q25: a minimum above the maximum was taken without a word.
- Q26: the planning said the weather was not known, over a run marked with the
  rain forecast.
"""

import json
from pathlib import Path

import pytest

LANGUAGES = (
    Path(__file__).parent.parent
    / "custom_components"
    / "smart_irrigation"
    / "frontend"
    / "localize"
    / "languages"
)

TEXTS = {
    "adjust_per_step": {"{time}"},
    "adjust_short": {"{what}", "{when}"},
    "adjust_short_open": {"{what}"},
    "adjust_in_force": {"{what}"},
    "adjust_set": set(),
    "adjust_change": set(),
    "passes_short": {"{n}"},
    "overlap_short": {"{time}"},
    "wait_short": {"{time}"},
    "soak_shared_help": set(),
    "min_over_max": {"{max}"},
}


def _texts(lang):
    return json.loads((LANGUAGES / f"{lang}.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("lang", ["en", "de"])
@pytest.mark.parametrize(("key", "placeholders"), TEXTS.items())
def test_each_text_is_there_with_its_placeholders(lang, key, placeholders):
    text = _texts(lang)["programs"][key]
    assert text
    for placeholder in placeholders:
        assert placeholder in text


@pytest.mark.parametrize("lang", ["en", "de"])
def test_the_step_no_longer_sends_the_soak_to_the_main_program(lang):
    help_text = _texts(lang)["programs"]["passes_help"]
    assert "main program" not in help_text
    assert "Hauptprogramm" not in help_text


def test_the_sequencing_help_says_what_the_setting_does():
    assert not _texts("en")["observed_watering"]["sequencing_description"].startswith(
        "How your zones are watered"
    )
    assert not _texts("de")["observed_watering"]["sequencing_description"].startswith(
        "Wie deine Zonen"
    )


def test_the_planning_no_longer_says_the_weather_is_unknown():
    assert "not known" not in _texts("en")["planning"]["description"]
    assert "nicht bekannt" not in _texts("de")["planning"]["description"]
    assert "Vorhersage" in _texts("de")["planning"]["description"]


@pytest.mark.parametrize("lang", ["en", "de"])
def test_the_old_adjustment_sentence_is_gone(lang):
    programs = _texts(lang)["programs"]
    assert "adjust_active" not in programs
    assert "adjust_until_reset" not in programs
