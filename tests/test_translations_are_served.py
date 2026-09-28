"""The translations are files now, so something has to serve them.

They used to be compiled into the bundle, which meant a corrected translation
reached nobody until the bundle was rebuilt and committed. They are served
instead, and the panel fetches the one language it needs. That only works if the
integration registers the directory, and if the panel's idea of which languages
exist matches the files that are actually there: a language missing from that
list is never fetched, and shows English while its file sits on disk.
"""

import json
import re
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import const

LANGUAGES_DIR = (
    Path(__file__).parent.parent
    / "custom_components"
    / "smart_irrigation"
    / "frontend"
    / "localize"
    / "languages"
)
LOCALIZE_TS = LANGUAGES_DIR.parent / "localize.ts"


def _hass(tmp_path):
    hass = MagicMock()
    hass.config.path = MagicMock(return_value=str(tmp_path))
    hass.http.async_register_static_paths = AsyncMock()

    async def run(func, *args):
        return func(*args)

    hass.async_add_executor_job = AsyncMock(side_effect=run)
    return hass


async def _registered_paths(tmp_path):
    bundle = (
        tmp_path / const.INTEGRATION_FOLDER / const.PANEL_FOLDER / const.PANEL_FILENAME
    )
    bundle.parent.mkdir(parents=True, exist_ok=True)
    bundle.write_text("// bundle", encoding="utf-8")
    hass = _hass(tmp_path)
    with patch(
        "custom_components.smart_irrigation.panel.panel_custom.async_register_panel",
        new=AsyncMock(),
    ):
        from custom_components.smart_irrigation.panel import async_register_panel

        await async_register_panel(hass)
    configs = []
    for call in hass.http.async_register_static_paths.await_args_list:
        configs.extend(call.args[0])
    return {c.url_path: c for c in configs}


@pytest.mark.asyncio
async def test_the_languages_directory_is_served(tmp_path):
    paths = await _registered_paths(tmp_path)

    assert const.LANGUAGES_URL in paths
    served = Path(paths[const.LANGUAGES_URL].path)
    assert served.name == "languages"
    assert served.parent.name == "localize"


@pytest.mark.asyncio
async def test_the_bundle_is_still_served(tmp_path):
    """Adding one static path must not have taken the other away."""
    paths = await _registered_paths(tmp_path)

    assert const.PANEL_URL in paths


@pytest.mark.asyncio
async def test_the_translations_are_not_cached_by_home_assistant(tmp_path):
    """A corrected file has to reach a browser that already asked once."""
    paths = await _registered_paths(tmp_path)

    assert paths[const.LANGUAGES_URL].cache_headers is False


def _fetchable_languages() -> list[str]:
    source = LOCALIZE_TS.read_text(encoding="utf-8")
    block = re.search(
        r"export const FETCHABLE_LANGUAGES = \[(.*?)\];", source, re.DOTALL
    )
    assert block, "the panel no longer declares which languages it can fetch"
    return re.findall(r'"([^"]+)"', block.group(1))


def test_every_language_file_is_one_the_panel_will_fetch():
    """The bug this catches: a language file added and not listed.

    It happened while this was being written. German was on disk, complete, and
    absent from the list, so every German user would have read English.
    """
    on_disk = {p.stem for p in LANGUAGES_DIR.glob("*.json")} - {"en"}

    assert set(_fetchable_languages()) == on_disk


def test_english_is_not_fetched():
    """It is compiled in, because it is the fallback when a fetch fails."""
    assert "en" not in _fetchable_languages()
    assert 'import * as en from "./languages/en.json"' in LOCALIZE_TS.read_text(
        encoding="utf-8"
    )


def test_no_other_language_is_compiled_in():
    """Otherwise the bundle would have to be rebuilt for that one."""
    source = LOCALIZE_TS.read_text(encoding="utf-8")
    imported = set(
        re.findall(r'import \* as \w+ from "\./languages/([\w-]+)\.json"', source)
    )

    assert imported == {"en"}


def test_every_served_file_is_valid_json():
    """A broken file would leave that language in English, quietly."""
    for path in sorted(LANGUAGES_DIR.glob("*.json")):
        json.loads(path.read_text(encoding="utf-8"))
