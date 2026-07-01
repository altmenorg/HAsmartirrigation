"""Switch platform for Smart Irrigation: the global weather-based skip toggle.

Exposes the panel's "Weather-based Irrigation Skip" setting as a switch on
the hub device, so it can be controlled from automations and dashboards, not
just the panel. Writes go through the coordinator's regular config path
(``coordinator.async_update_config``), so the panel and any other listening
entities (e.g. a future skip-reason sensor) pick up the change immediately,
and vice versa: toggling it in the panel refreshes this switch too.
"""

import logging

from homeassistant.components.switch import DOMAIN as SWITCH_PLATFORM
from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import const
from .entity import hub_device_info

_LOGGER = logging.getLogger(__name__)


def _coordinator(hass: HomeAssistant):
    """Return the coordinator, or None when not (yet) set up."""
    try:
        return hass.data[const.DOMAIN]["coordinator"]
    except (KeyError, AttributeError):
        return None


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_devices: AddEntitiesCallback,
) -> None:
    """Set up the global weather-based skip switch (created once, on the hub)."""
    async_add_devices([SmartIrrigationSkipOnPrecipitationSwitch(hass)])


class SmartIrrigationSkipOnPrecipitationSwitch(SwitchEntity):
    """Toggle the panel's "Weather-based Irrigation Skip" setting."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = "skip_on_precipitation"
    _attr_icon = "mdi:weather-pouring"

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the switch."""
        self._hass = hass
        self.entity_id = f"{SWITCH_PLATFORM}.{const.DOMAIN}_skip_on_precipitation"

    @property
    def unique_id(self) -> str:
        """Return a stable unique ID."""
        return f"{const.DOMAIN}_skip_irrigation_on_precipitation"

    @property
    def device_info(self) -> dict:
        """Group under the hub device."""
        return hub_device_info(self._hass)

    async def async_added_to_hass(self) -> None:
        """Subscribe to config updates and read the initial state."""
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self._hass, const.DOMAIN + "_config_updated", self._async_refresh
            )
        )
        self._recompute()

    @callback
    def _async_refresh(self, zone_id=None) -> None:
        """Refresh when the global config changes (e.g. edited from the panel).

        ``_config_updated`` is also sent (with a zone_id) for per-zone changes,
        which don't affect this global setting; skip those.
        """
        if zone_id is not None:
            return
        self._recompute()
        self.async_write_ha_state()

    @callback
    def _recompute(self) -> None:
        """Read the current value from the store."""
        coordinator = _coordinator(self._hass)
        config = coordinator.store.get_config() if coordinator else {}
        self._attr_is_on = config.get(
            const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
            const.CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION,
        )

    async def async_turn_on(self, **kwargs) -> None:
        """Enable the weather-based skip."""
        await self._async_set(True)

    async def async_turn_off(self, **kwargs) -> None:
        """Disable the weather-based skip."""
        await self._async_set(False)

    async def _async_set(self, value: bool) -> None:
        """Persist the toggle and notify entities and any open panel."""
        coordinator = _coordinator(self._hass)
        if coordinator is None:
            return
        await coordinator.async_update_config(
            {const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: value}
        )
        self._attr_is_on = value
        self.async_write_ha_state()
        # coordinator.async_update_config() already sent "_config_updated" for
        # other entities; the panel listens for "_update_frontend" instead
        # (see websockets.py's SmartIrrigationConfigView.post for the same
        # pairing), so send that too to keep an open panel in sync.
        async_dispatcher_send(self._hass, const.DOMAIN + "_update_frontend")
