"""Diagnostics support for Smart Irrigation."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from . import const

_LOGGER = logging.getLogger(__name__)


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    # Build a separate dict for the diagnostics output. Never mutate
    # hass.data[DOMAIN] in place: popping the coordinator (or redacting the API
    # key on the live dict) would break the running integration until a reload
    # (#758 - tabs stop loading after downloading diagnostics).
    data = hass.data[const.DOMAIN]
    coordinator = data.get("coordinator")
    diagnostics: dict[str, Any] = {
        key: value for key, value in data.items() if key not in ("coordinator", "zones")
    }
    if coordinator is not None:
        store = coordinator.store
        if store is not None:
            diagnostics["store"] = {
                "config": await store.async_get_config(),
                "mappings": store.get_mappings(),
                "modules": store.get_modules(),
                "zones": store.get_zones(),
            }
        else:
            _LOGGER.warning("Store is not available")
    else:
        _LOGGER.warning("Coordinator is not available")
    if const.CONF_WEATHER_SERVICE_API_KEY in diagnostics:
        diagnostics[const.CONF_WEATHER_SERVICE_API_KEY] = "[redacted]"
    return diagnostics
