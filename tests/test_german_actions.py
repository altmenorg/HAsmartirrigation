"""Every action has its German texts.

The 21 actions of the full controller had none: they came into en.json with
#994 and into every other language with the next translation round, but German
is written alongside English in each pull request, and these did not come from
one. Home Assistant showed them in English in a German installation. Some of the
older actions were half translated, with English names and fields.
"""

import json
from pathlib import Path

import pytest
import yaml

ROOT = Path(__file__).parent.parent / "custom_components" / "smart_irrigation"


def _texts(language: str) -> dict:
    return json.loads((ROOT / "translations" / f"{language}.json").read_text("utf-8"))[
        "services"
    ]


ACTIONS = sorted(yaml.safe_load((ROOT / "services.yaml").read_text("utf-8")))
ENGLISH = _texts("en")
GERMAN = _texts("de")


def _strings(tree: dict, prefix: str):
    for key, value in tree.items():
        if isinstance(value, dict):
            yield from _strings(value, f"{prefix}.{key}")
        else:
            yield f"{prefix}.{key}", value


@pytest.mark.parametrize("action", ACTIONS)
def test_every_action_has_its_german_texts(action):
    assert action in GERMAN, f"{action} has no German texts"
    english = dict(_strings(ENGLISH[action], action))
    german = dict(_strings(GERMAN[action], action))
    assert sorted(english) == sorted(german)


@pytest.mark.parametrize("action", ACTIONS)
def test_no_german_text_is_still_the_english_one(action):
    english = dict(_strings(ENGLISH[action], action))
    # "Name" is the same word in both.
    same = [
        key
        for key, text in _strings(GERMAN[action], action)
        if text == english.get(key) and text != "Name"
    ]
    assert same == []


def test_the_crop_factor_is_called_so():
    """The glossary: Pflanzenfaktor, never Multiplikator for it."""
    wrong = [
        key
        for action in ACTIONS
        for key, text in _strings(GERMAN[action], action)
        if "Multiplikator" in text and "Pflanzenfaktor" not in text
    ]
    assert wrong == []
