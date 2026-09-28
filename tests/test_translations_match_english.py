"""What a translation is allowed to be, in both sets of them.

There are two: the panel's own strings, in frontend/localize/languages, and the
strings Home Assistant renders itself, in translations -- entity names, service
fields, the config flow, the repair issues. Both are translated by people now,
through pull requests and through Weblate, which means broken ones will arrive
and should be caught here rather than in somebody's panel.

Three things can go wrong quietly:

- a placeholder dropped or renamed, so the string renders with a hole in it, or
  the formatter throws and the user reads "Translation Error";
- a key that does not exist in English, which is dead weight nobody will ever
  see and usually the sign of a rename that went half way;
- a string left empty, which shows as nothing at all rather than falling back to
  English, because an empty string is a translation as far as the code knows.

A missing key is fine and deliberately allowed: an unfinished language falls back
to English string by string, which is the whole point of the fallback.
"""

import json
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).parent.parent / "custom_components" / "smart_irrigation"
PANEL_DIR = ROOT / "frontend" / "localize" / "languages"
BACKEND_DIR = ROOT / "translations"

PLACEHOLDER = re.compile(r"\{[a-zA-Z0-9_]+\}")


def _flat(tree: dict, prefix: str = "") -> dict:
    flat = {}
    for key, value in tree.items():
        dotted = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            flat.update(_flat(value, dotted))
        else:
            flat[dotted] = value
    return flat


def _load(directory: Path, name: str) -> dict:
    return _flat(json.loads((directory / f"{name}.json").read_text("utf-8")))


def _languages(directory: Path) -> list[str]:
    return sorted(p.stem for p in directory.glob("*.json") if p.stem != "en")


# (directory, language) for every translation file there is, English aside.
CASES = [(d, lang) for d in (PANEL_DIR, BACKEND_DIR) for lang in _languages(d)]
IDS = [f"{d.name}/{lang}" for d, lang in CASES]


def test_there_are_files_to_check():
    """A glob that matched nothing would make every test below pass."""
    assert len(_languages(PANEL_DIR)) > 10
    assert len(_languages(BACKEND_DIR)) > 10
    assert len(_languages(PANEL_DIR)) == len(_languages(BACKEND_DIR))


def test_both_sets_cover_the_same_languages():
    """A language translated in one and not the other is half an interface."""
    assert _languages(PANEL_DIR) == _languages(BACKEND_DIR)


@pytest.mark.parametrize(("directory", "language"), CASES, ids=IDS)
def test_no_key_that_english_does_not_have(directory, language):
    extra = sorted(set(_load(directory, language)) - set(_load(directory, "en")))

    assert (
        extra == []
    ), f"{directory.name}/{language}.json has keys that no longer exist in English"


@pytest.mark.parametrize(("directory", "language"), CASES, ids=IDS)
def test_the_placeholders_are_the_ones_english_uses(directory, language):
    english = _load(directory, "en")
    wrong = []
    for key, value in _load(directory, language).items():
        if key not in english or not isinstance(value, str):
            continue
        expected = set(PLACEHOLDER.findall(english[key]))
        found = set(PLACEHOLDER.findall(value))
        if expected != found:
            wrong.append(f"{key}: expected {sorted(expected)}, found {sorted(found)}")

    assert wrong == [], f"{directory.name}/{language}.json: " + "; ".join(wrong)


@pytest.mark.parametrize(("directory", "language"), CASES, ids=IDS)
def test_nothing_is_translated_as_nothing(directory, language):
    empty = sorted(
        key
        for key, value in _load(directory, language).items()
        if not str(value).strip()
    )

    assert (
        empty == []
    ), f"{directory.name}/{language}.json has empty strings, which show as nothing"


@pytest.mark.parametrize(
    ("directory", "language"),
    CASES + [(PANEL_DIR, "en"), (BACKEND_DIR, "en")],
    ids=IDS + ["languages/en", "translations/en"],
)
def test_every_value_is_a_string(directory, language):
    """A list or a number here means the file was edited into a shape the code
    cannot render."""
    wrong = sorted(
        key
        for key, value in _load(directory, language).items()
        if not isinstance(value, str)
    )

    assert (
        wrong == []
    ), f"{directory.name}/{language}.json has values that are not strings"
