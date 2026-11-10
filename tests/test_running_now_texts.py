"""The texts that say what is watering now, in English and German.

While a run was going, Start, the zones and the card said nothing of it; only
Watering › Planning showed it. Each now has a line for it, with the time left.
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


def _texts(language: str) -> dict:
    return json.loads((LANGUAGES / f"{language}.json").read_text("utf-8"))


@pytest.mark.parametrize("language", ["en", "de"])
def test_start_has_a_card_for_the_running_watering(language):
    running = _texts(language)["panels"]["info"]["cards"]["running"]
    assert set(running) == {
        "headline",
        "headline-paused",
        "paused-until",
        "left",
        "program",
        "step",
        "program-left",
    }
    assert "{time}" in running["left"] and "{percent}" in running["left"]
    assert "{step}" in running["step"] and "{steps}" in running["step"]
    assert "{time}" in running["program-left"]
    assert "{when}" in running["paused-until"]


@pytest.mark.parametrize("language", ["en", "de"])
def test_a_zone_says_it_is_watering(language):
    status = _texts(language)["panels"]["zones"]["status"]
    for key in ("running", "running-paused"):
        assert "{time}" in status[key], key


@pytest.mark.parametrize("language", ["en", "de"])
def test_the_card_says_it_is_watering(language):
    card = _texts(language)["card"]
    for key in ("watering_left", "paused_left"):
        assert "{time}" in card[key], key


def test_german_reads_german():
    de = _texts("de")
    assert de["panels"]["info"]["cards"]["running"]["headline"] == "Bewässert gerade"
    assert (
        de["panels"]["zones"]["status"]["running"] == "Bewässert gerade, noch {time}."
    )
    assert de["card"]["watering_left"] == "bewässert, noch {time}"
