"""Panel registration for the Smart Irrigation integration."""

import logging
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import (
    CUSTOM_COMPONENTS,
    DOMAIN,
    INTEGRATION_FOLDER,
    PANEL_FILENAME,
    PANEL_FOLDER,
    PANEL_ICON,
    PANEL_NAME,
    PANEL_TITLE,
    PANEL_URL,
    VERSION,
)

_LOGGER = logging.getLogger(__name__)


def _bundle_stamp(path: Path) -> int | None:
    """The bundle's modification time, or None when it cannot be read.

    None means the URL falls back to the version alone, which is what it was
    before: a panel that loads from a slightly stale cache beats one that does
    not load at all.
    """
    try:
        return int(path.stat().st_mtime)
    except OSError:  # pragma: no cover - defensive
        return None


async def async_register_panel(hass: HomeAssistant):
    """Register the custom panel for the Smart Irrigation integration."""
    root_dir = Path(hass.config.path(CUSTOM_COMPONENTS)) / INTEGRATION_FOLDER
    panel_dir = root_dir / PANEL_FOLDER
    view_url = panel_dir / PANEL_FILENAME

    await hass.http.async_register_static_paths(
        [StaticPathConfig(PANEL_URL, str(view_url), cache_headers=False)]
    )
    # hass.http.register_static_path(PANEL_URL, str(view_url), False)

    # The bundle is served from a fixed path, so a browser that already has it
    # cached has no way to tell a new one apart from the one it holds --
    # cache_headers=False stops Home Assistant adding long-lived cache headers,
    # but not the frontend's service worker, which is why a desktop browser can
    # keep showing the previous panel after an update. Versioning the module URL
    # changes the URL, so the fetch misses the cache by itself.
    #
    # The version alone is not enough: it only moves at a release, so a bundle
    # replaced without one, a hotfix or a development deploy, keeps the same URL
    # and the browser keeps what it has. The file's own timestamp moves whenever
    # the bundle does, which is the thing the cache actually needs to follow.
    stamp = await hass.async_add_executor_job(_bundle_stamp, view_url)
    module_url = f"{PANEL_URL}?v={VERSION}"
    if stamp is not None:
        module_url = f"{module_url}.{stamp}"

    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_NAME,
        frontend_url_path=DOMAIN,
        module_url=module_url,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=True,
        config={},
    )


def remove_panel(hass: HomeAssistant):
    """Unregister the custom panel for the Smart Irrigation integration."""
    frontend.async_remove_panel(hass, DOMAIN)
    _LOGGER.debug("Removing panel")
