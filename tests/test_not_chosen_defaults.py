"""The panel's "not chosen yet" shows the value the backend resets to (#1011)."""

import re
from pathlib import Path

from custom_components.smart_irrigation import const, presets

CONST_TS = (
    Path(__file__).resolve().parents[1]
    / "custom_components/smart_irrigation/frontend/src/const.ts"
)


def _ts_number(name: str) -> float:
    match = re.search(rf"export const {name} = ([0-9.]+);", CONST_TS.read_text())
    assert match, name
    return float(match.group(1))


def test_the_panel_knows_the_default_drainage_rate():
    assert _ts_number("DEFAULT_DRAINAGE_RATE_MM_H") == const.CONF_DEFAULT_DRAINAGE_RATE


def test_the_panel_knows_the_default_crop_factor():
    assert _ts_number("DEFAULT_CROP_FACTOR") == presets.DEFAULT_MULTIPLIER


def test_not_chosen_resets_to_those_values():
    changes = presets.apply_preset({"soil_type": "default", "plant_type": "default"})
    assert changes[const.ZONE_DRAINAGE_RATE] == const.CONF_DEFAULT_DRAINAGE_RATE
    assert changes[const.ZONE_MULTIPLIER] == presets.DEFAULT_MULTIPLIER


def test_the_panel_shows_the_rate_each_soil_sets():
    """The soil names carry their rate in the panel (#1009): the same table."""
    view = CONST_TS.parent / "views/zones/view-zones.ts"
    block = re.search(
        r"SOIL_DRAINAGE_MM_H: Record<string, number> = \{(.*?)\};",
        view.read_text(encoding="utf-8"),
        re.S,
    )
    assert block
    shown = {
        name: float(value)
        for name, value in re.findall(r"(\w+): ([0-9.]+),", block.group(1))
    }
    assert shown == presets.SOIL_TYPES
