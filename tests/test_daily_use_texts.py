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
