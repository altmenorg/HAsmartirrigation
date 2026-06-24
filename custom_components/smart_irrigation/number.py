"""Number platform for Smart Irrigation: the per-zone irrigation multiplier.

Exposes each zone's multiplier as an editable number under the zone device.
Setting it writes straight to the zone store (used by the next calculation),
mirroring the panel's multiplier field.
"""

import contextlib
import logging

from homeassistant.components.number import DOMAIN as NUMBER_PLATFORM
from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import slugify

from . import const
from .entity import zone_device_info

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_devices: AddEntitiesCallback,
) -> None:
    """Set up the per-zone multiplier number entities."""

    @callback
    def async_add_number_entity(config: dict) -> None:
        """Add the multiplier number for one zone (once)."""
        if const.DOMAIN not in hass.data:
            return
        registered = hass.data[const.DOMAIN].setdefault("multiplier_numbers", {})
        if config["id"] in registered:
            return
        entity_id = "{}.{}_multiplier".format(
            NUMBER_PLATFORM, const.DOMAIN + "_" + slugify(config["name"])
        )
        number_entity = SmartIrrigationZoneMultiplierEntity(
            hass=hass,
            entity_id=entity_id,
            zone_id=config[const.ZONE_ID],
            zone_name=config[const.ZONE_NAME],
            multiplier=config.get(const.ZONE_MULTIPLIER, 1.0),
        )
        registered[config["id"]] = number_entity
        async_add_devices([number_entity])

    # Subscribe before __init__ replays existing zones via "_platform_loaded".
    config_entry.async_on_unload(
        async_dispatcher_connect(
            hass, const.DOMAIN + "_register_entity", async_add_number_entity
        )
    )


class SmartIrrigationZoneMultiplierEntity(NumberEntity, RestoreEntity):
    """Editable per-zone irrigation multiplier, grouped under the zone device."""

    _attr_has_entity_name = True
    _attr_translation_key = "multiplier"
    _attr_native_min_value = 0.0
    _attr_native_max_value = 10.0
    _attr_native_step = 0.1
    _attr_mode = NumberMode.BOX
    _attr_icon = "mdi:multiplication"

    def __init__(
        self,
        hass: HomeAssistant,
        entity_id: str,
        zone_id: int,
        zone_name: str,
        multiplier: float,
    ) -> None:
        """Initialize the multiplier number entity."""
        self._hass = hass
        self.entity_id = entity_id
        self._zone_id = zone_id
        self._zone_name = zone_name
        self._multiplier = multiplier

        async_dispatcher_connect(
            hass, const.DOMAIN + "_config_updated", self._async_update_multiplier
        )

    @callback
    def _async_update_multiplier(self, zone_id=None) -> None:
        """Refresh when the zone config changes (e.g. edited from the panel)."""
        if self._zone_id == zone_id and self.hass and self.hass.data:
            zone = self.hass.data[const.DOMAIN]["coordinator"].store.get_zone(
                self._zone_id
            )
            if zone:
                self._multiplier = zone.get(const.ZONE_MULTIPLIER, self._multiplier)
                self._zone_name = zone.get(const.ZONE_NAME, self._zone_name)
                self.async_schedule_update_ha_state()

    @property
    def unique_id(self) -> str:
        """Return a stable per-zone unique ID."""
        return f"{const.DOMAIN}_{self._zone_id}_multiplier"

    @property
    def should_poll(self) -> bool:
        """No polling; updated via dispatcher."""
        return False

    @property
    def native_value(self) -> float:
        """Return the current multiplier."""
        return round(self._multiplier, 2)

    async def async_set_native_value(self, value: float) -> None:
        """Persist a new multiplier to the zone store and notify."""
        value = round(value, 2)
        await self.hass.data[const.DOMAIN]["coordinator"].store.async_update_zone(
            self._zone_id, {const.ZONE_MULTIPLIER: value}
        )
        self._multiplier = value
        self.async_write_ha_state()
        async_dispatcher_send(
            self.hass, const.DOMAIN + "_config_updated", self._zone_id
        )

    @property
    def device_info(self) -> dict:
        """Group under the per-zone device (same as the zone sensors)."""
        return zone_device_info(self._hass, self._zone_id, self._zone_name)

    @property
    def extra_state_attributes(self) -> dict:
        """Return zone identification attributes."""
        return {"zone_id": self._zone_id}

    async def async_added_to_hass(self) -> None:
        """Restore the previous value if available."""
        await super().async_added_to_hass()
        last_state = await self.async_get_last_state()
        if last_state is not None and last_state.state not in (
            "unknown",
            "unavailable",
        ):
            with contextlib.suppress(ValueError, TypeError):
                self._multiplier = float(last_state.state)
        self.async_schedule_update_ha_state(force_refresh=True)
