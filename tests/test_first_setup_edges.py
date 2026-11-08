"""The edges of a first setup, in the words the panel and the entities use.

The panel's logic for these is tested with vitest; what is checked here is
that the German says it too (vitest only has English compiled in) and that
the entities read like the panel.
"""

import json
from pathlib import Path

import pytest

ROOT = Path(__file__).parent.parent / "custom_components" / "smart_irrigation"
PANEL = ROOT / "frontend" / "localize" / "languages"
ENTITIES = ROOT / "translations"

NEW_PANEL_KEYS = [
    "panels.setup.steps.review.no-sensor",
    "panels.setup.calc-now",
    "panels.setup.calc-duration",
    "panels.setup.calc-nothing",
    "panels.setup.calc-failed",
    "panels.mappings.cards.mapping.sources.none_estimated",
    "panels.zones.labels.valve-off",
    "panels.zones.labels.valve-off-link",
    "panels.info.gaps.no_valve_path.action",
    "weather_skip.forecast_set_up_service",
]


def _get(tree: dict, path: str):
    for part in path.split("."):
        tree = tree[part]
    return tree


def _load(folder: Path, lang: str) -> dict:
    return json.loads((folder / f"{lang}.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("lang", ["en", "de"])
@pytest.mark.parametrize("key", NEW_PANEL_KEYS)
def test_the_panel_says_it_in_en_and_de(lang, key):
    assert _get(_load(PANEL, lang), key).strip()


@pytest.mark.parametrize("lang", ["en", "de"])
def test_the_valve_hint_says_to_turn_control_on_first(lang):
    """Linking a valve is only offered once control is on: the order matters."""
    body = _get(_load(PANEL, lang), "panels.info.gaps.no_valve_path.body")
    control = {"en": "direct valve control", "de": "Ventilsteuerung"}[lang]
    link = {"en": "link a valve", "de": "verknüpfe"}[lang]
    assert body.index(control) < body.index(link)


@pytest.mark.parametrize(
    ("lang", "on", "off"), [("en", "Yes", "No"), ("de", "Ja", "Nein")]
)
def test_watering_now_reads_yes_or_no(lang, on, off):
    """Not "Running"/"Not running": "Watering now: Not running" read as broken."""
    state = _load(ENTITIES, lang)["entity"]["binary_sensor"]["watering_now"]["state"]
    assert state == {"on": on, "off": off}


@pytest.mark.parametrize("lang", ["en", "de"])
def test_the_master_switch_has_the_panels_name(lang):
    entity = _load(ENTITIES, lang)["entity"]["switch"]["irrigation_enabled"]["name"]
    panel = _get(_load(PANEL, lang), "panels.general.cards.master-switch.label")
    assert entity == panel
