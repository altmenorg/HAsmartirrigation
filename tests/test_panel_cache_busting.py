"""The panel's module URL has to change whenever the bundle does.

It is served from one fixed path, so a browser that holds a copy has nothing to
tell a new bundle from the old one. The URL carried the release version, which
only moves at a release: a bundle replaced without one, a hotfix or a
development deploy, kept the same URL and the browser kept what it had. Adding
the file's own timestamp makes the URL follow the file.
"""

from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.panel import (
    _bundle_stamp,
    async_register_panel,
)


def _hass(tmp_path):
    hass = MagicMock()
    hass.config.path = MagicMock(return_value=str(tmp_path))
    hass.http.async_register_static_paths = AsyncMock()

    async def run(func, *args):
        return func(*args)

    hass.async_add_executor_job = AsyncMock(side_effect=run)
    return hass


def _bundle(tmp_path):
    path = (
        tmp_path / const.INTEGRATION_FOLDER / const.PANEL_FOLDER / const.PANEL_FILENAME
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("// bundle", encoding="utf-8")
    return path


async def _register(hass):
    with patch(
        "custom_components.smart_irrigation.panel.panel_custom.async_register_panel",
        new=AsyncMock(),
    ) as register:
        await async_register_panel(hass)
    return register.await_args.kwargs["module_url"]


@pytest.mark.asyncio
async def test_the_url_carries_the_bundle_s_timestamp(tmp_path):
    bundle = _bundle(tmp_path)

    url = await _register(_hass(tmp_path))

    assert url.startswith(f"{const.PANEL_URL}?v={const.VERSION}.")
    assert url.endswith(str(int(bundle.stat().st_mtime)))


@pytest.mark.asyncio
async def test_a_rebuilt_bundle_gets_a_new_url(tmp_path):
    """The bug, stated as a test: same version, new file, new URL."""
    bundle = _bundle(tmp_path)
    import os

    os.utime(bundle, (1_700_000_000, 1_700_000_000))
    before = await _register(_hass(tmp_path))

    os.utime(bundle, (1_700_003_600, 1_700_003_600))
    after = await _register(_hass(tmp_path))

    assert before != after


@pytest.mark.asyncio
async def test_a_missing_bundle_falls_back_to_the_version(tmp_path):
    """A panel loading from a stale cache beats one that does not load."""
    url = await _register(_hass(tmp_path))

    assert url == f"{const.PANEL_URL}?v={const.VERSION}"


def test_an_unreadable_file_has_no_stamp(tmp_path):
    assert _bundle_stamp(Path(tmp_path / "nothing.js")) is None
