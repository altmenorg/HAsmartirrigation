"""Datetime platform for Smart Irrigation: until when the watering is postponed.

One entity on the hub device. It shows the end of the postponement in force,
or nothing, and setting it postpones the watering until that moment (a moment
already past lifts it), so a dashboard or a "holidays" automation can hold the
watering back without calling a service.
"""

from datetime import datetime, timedelta

from homeassistant.components.datetime import DateTimeEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from . import const
from .entity import hub_device_info

SCAN_INTERVAL = timedelta(minutes=1)


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
    """Set up the postponement entity."""
    async_add_devices([SmartIrrigationPostponedUntil(hass)])


class SmartIrrigationPostponedUntil(DateTimeEntity):
    """The end of the postponement in force, or nothing."""

    _attr_has_entity_name = True
    # Polled as well, so a postponement that ends by itself shows as ended.
    _attr_should_poll = True
    _attr_translation_key = "postponed_until"
    _attr_icon = "mdi:timer-pause-outline"

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the entity."""
        self._hass = hass
        self.entity_id = f"datetime.{const.DOMAIN}_postponed_until"

    @property
    def unique_id(self) -> str:
        """Return a stable unique ID."""
        return f"{const.DOMAIN}_postponed_until"

    @property
    def device_info(self) -> dict:
        """Group under the hub device."""
        return hub_device_info(self._hass)

    async def async_added_to_hass(self) -> None:
        """Follow the postponements made by the service and the buttons."""
        self.async_on_remove(
            async_dispatcher_connect(
                self._hass, const.DOMAIN + "_config_updated", self._async_updated
            )
        )

    @callback
    def _async_updated(self, *_args) -> None:
        self.async_write_ha_state()

    @property
    def native_value(self) -> datetime | None:
        """The end of the postponement, while it is still ahead."""
        coordinator = _coordinator(self._hass)
        config = coordinator.store.get_config() if coordinator else None
        raw = (config or {}).get(const.CONF_POSTPONE_UNTIL)
        until = dt_util.parse_datetime(raw) if isinstance(raw, str) else None
        if until is None:
            return None
        if until.tzinfo is None:
            until = until.replace(tzinfo=dt_util.UTC)
        return until if until > dt_util.utcnow() else None

    async def async_set_value(self, value: datetime) -> None:
        """Postpone until ``value``; a moment already past lifts it."""
        coordinator = _coordinator(self._hass)
        if coordinator is not None:
            await coordinator.async_postpone_until(value)
