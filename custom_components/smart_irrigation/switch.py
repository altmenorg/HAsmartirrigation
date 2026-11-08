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
from homeassistant.helpers.entity import EntityCategory
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
    """Set up the hub's switches: the master switch and the weather-based skip."""
    async_add_devices(
        [
            SmartIrrigationEnabledSwitch(hass),
            SmartIrrigationSkipOnPrecipitationSwitch(hass),
        ]
    )


class SmartIrrigationSkipOnPrecipitationSwitch(SwitchEntity):
    """Toggle the panel's "Weather-based Irrigation Skip" setting."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = "skip_on_precipitation"
    # A setting of the Skip on weather page: listed under Configuration.
    _attr_entity_category = EntityCategory.CONFIG
    _attr_icon = "mdi:weather-pouring"
    # The setting it stands for, and its value when it was never set.
    _config_key = const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION
    _config_default = const.CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION
    _object_id = "skip_on_precipitation"
    _unique_suffix = "skip_irrigation_on_precipitation"

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the switch."""
        self._hass = hass
        self.entity_id = f"{SWITCH_PLATFORM}.{const.DOMAIN}_{self._object_id}"

    @property
    def unique_id(self) -> str:
        """Return a stable unique ID."""
        return f"{const.DOMAIN}_{self._unique_suffix}"

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
        self._attr_is_on = config.get(self._config_key, self._config_default)

    async def async_turn_on(self, **kwargs) -> None:
        """Switch the setting on."""
        await self._async_set(True)

    async def async_turn_off(self, **kwargs) -> None:
        """Switch the setting off."""
        await self._async_set(False)

    async def _async_set(self, value: bool) -> None:
        """Persist the toggle and notify entities and any open panel."""
        coordinator = _coordinator(self._hass)
        if coordinator is None:
            return
        await coordinator.async_update_config({self._config_key: value})
        self._attr_is_on = value
        self.async_write_ha_state()
        # coordinator.async_update_config() already sent "_config_updated" for
        # other entities; the panel listens for "_update_frontend" instead
        # (see websockets.py's SmartIrrigationConfigView.post for the same
        # pairing), so send that too to keep an open panel in sync.
        async_dispatcher_send(self._hass, const.DOMAIN + "_update_frontend")


class SmartIrrigationEnabledSwitch(SmartIrrigationSkipOnPrecipitationSwitch):
    """The master switch: off, nothing is calculated and nothing is watered.

    The weather readings and the sensors carry on (see master_switch.py).
    """

    _attr_translation_key = "irrigation_enabled"
    _attr_icon = "mdi:sprinkler-variant"
    _config_key = const.CONF_IRRIGATION_ENABLED
    _config_default = const.CONF_DEFAULT_IRRIGATION_ENABLED
    _object_id = "irrigation_enabled"
    _unique_suffix = "irrigation_enabled"
