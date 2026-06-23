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
)

_LOGGER = logging.getLogger(__name__)


async def async_register_panel(hass: HomeAssistant):
    """Register the custom panel for the Smart Irrigation integration."""
    root_dir = Path(hass.config.path(CUSTOM_COMPONENTS)) / INTEGRATION_FOLDER
    panel_dir = root_dir / PANEL_FOLDER
    view_url = panel_dir / PANEL_FILENAME

    await hass.http.async_register_static_paths(
        [StaticPathConfig(PANEL_URL, str(view_url), cache_headers=False)]
    )
    # hass.http.register_static_path(PANEL_URL, str(view_url), False)

    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_NAME,
        frontend_url_path=DOMAIN,
        module_url=PANEL_URL,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=True,
        config={},
    )


def remove_panel(hass: HomeAssistant):
    """Unregister the custom panel for the Smart Irrigation integration."""
    frontend.async_remove_panel(hass, DOMAIN)
    _LOGGER.debug("Removing panel")
