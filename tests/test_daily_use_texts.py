"""The texts of daily use, in en and de (UX walk of 9 Nov.).

- A manual zone said it "waters only when you ask", while every start waters
  it for the duration entered.
- "{count} zone(s)" read badly; one zone and several are two texts now.
- The pump page explained its delays as "signed", which the delay fields
  explain better each.
- The German observed watering card carried an English "(Closed Loop)".
"""

import json
import re
from pathlib import Path

import pytest

PANEL = (
    Path(__file__).parent.parent
    / "custom_components"
    / "smart_irrigation"
    / "frontend"
    / "localize"
    / "languages"
)


def _get(lang, key):
    node = json.loads((PANEL / f"{lang}.json").read_text("utf-8"))
    for part in key.split("."):
        node = node[part]
    return node


@pytest.mark.parametrize("lang", ["en", "de"])
def test_a_manual_zone_says_it_waters_at_every_start(lang):
    for key in ("panels.zones.status.manual", "panels.zones.labels.state-hint"):
        text = _get(lang, key)
        assert not re.search(r"only when you ask|nur, wenn du es verlangst", text)
    start = {"en": "every start", "de": "jedem Start"}[lang]
    assert start in _get(lang, "panels.zones.status.manual")


@pytest.mark.parametrize("lang", ["en", "de"])
@pytest.mark.parametrize(
    "key",
    [
        "panels.info.cards.next-run.sub-watering",
        "panels.info.cards.next-run.sub-watering-one",
        "programs.cond_soil",
        "programs.cond_soil_one",
        "panels.mappings.cards.mapping.et_ignored",
        "panels.mappings.cards.mapping.et_missing",
    ],
)
def test_no_zone_s(lang, key):
    assert not re.search(r"\((s|n)\)", _get(lang, key))


@pytest.mark.parametrize("lang", ["en", "de"])
def test_the_pump_page_has_no_signed_delays(lang):
    text = _get(lang, "supplies.description")
    assert "signed" not in text and "vorzeichen" not in text


def test_the_german_observed_watering_is_german():
    assert "Closed Loop" not in _get("de", "observed_watering.title")


# --- the evening walk of 9 Nov. ----------------------------------------------------


@pytest.mark.parametrize("lang", ["en", "de"])
def test_the_card_says_a_manual_zone_waters_at_every_start(lang):
    """It said "no watering needed" for a zone the next start waters."""
    runs = _get(lang, "card.manual_runs")
    assert "{duration}" in runs
    assert {"en": "every start", "de": "jedem Start"}[lang] in runs
    assert _get(lang, "card.manual_no_duration")


@pytest.mark.parametrize("lang", ["en", "de"])
def test_planning_says_the_time_left_like_start(lang):
    assert (
        _get(lang, "planning.left") == {"en": "{time} left", "de": "noch {time}"}[lang]
    )


@pytest.mark.parametrize("lang", ["en", "de"])
def test_a_program_heads_its_steps_and_schedules_without_brackets(lang):
    for key in (
        "steps_none",
        "steps_one",
        "steps_many",
        "schedules_none",
        "schedules_one",
        "schedules_many",
    ):
        text = _get(lang, f"programs.{key}")
        assert not re.search(r"\(|/", text), key
    assert "{n}" in _get(lang, "programs.steps_many")
    assert "{n}" in _get(lang, "programs.schedules_many")


def test_the_old_bracket_texts_are_gone_everywhere():
    for path in PANEL.glob("*.json"):
        programs = json.loads(path.read_text("utf-8")).get("programs", {})
        assert "steps_count" not in programs, path.name
        assert "schedules_count" not in programs, path.name
        assert "remaining" not in json.loads(path.read_text("utf-8")).get(
            "planning", {}
        ), path.name
