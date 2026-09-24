"""Shared device-registry helpers for Smart Irrigation entities.

Every zone entity groups under a per-zone device, and the per-zone devices hang
off the single Smart Irrigation hub device. These helpers
return plain dicts, which Home Assistant accepts for ``device_info``.

The per-zone device layout is adapted from JustChr's Smart Irrigation fork
(https://github.com/JustChr/HAsmartirrigation), MIT.
"""

import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from . import const

_LOGGER = logging.getLogger(__name__)


def _via_device_id_supported() -> bool:
    """Whether this Home Assistant takes the parent as a device id.

    ``via_device`` (the parent's identifiers) is deprecated and stops working
    in Home Assistant 2027.8, replaced by ``via_device_id`` (the parent's id in
    the device registry). We support Home Assistant 2025.5 and up, which spans
    both, and passing both at once is an error, so ask this version which one
    it knows (#833).
    """
    return "via_device_id" in getattr(dr.DeviceInfo, "__annotations__", {})


def _config_entry_id(hass: HomeAssistant) -> str | None:
    """Our config entry's id, which the new device lookup asks for."""
    try:
        coordinator = hass.data[const.DOMAIN].get("coordinator")
    except (KeyError, AttributeError, TypeError):
        return None
    return getattr(getattr(coordinator, "entry", None), "entry_id", None)


def _hub_device(hass: HomeAssistant, hub: tuple[str, str]):
    """The hub device, looked up the way this Home Assistant asks for.

    ``async_get_device`` is deprecated too, and goes at the same time as
    ``via_device``: identifiers are no longer unique across config entries, so
    the lookup is now ``async_get_device_by_identifier``, which takes the
    config entry to look within. Older versions only have the first, so take
    whichever is there, by keyword, and fall back rather than raise if a
    version shapes it differently again.
    """
    registry = dr.async_get(hass)
    by_identifier = getattr(registry, "async_get_device_by_identifier", None)
    entry_id = _config_entry_id(hass)
    if by_identifier is not None and entry_id is not None:
        try:
            return by_identifier(identifier=hub, config_entry_id=entry_id)
        except TypeError:  # pragma: no cover - a third shape of the same call
            _LOGGER.debug("async_get_device_by_identifier has an unexpected signature")
    return registry.async_get_device(identifiers={hub})


def _parent_of(hass: HomeAssistant, hub: tuple[str, str]) -> dict:
    """The "hangs off the hub device" part of a per-zone device's info."""
    if _via_device_id_supported():
        # The hub device is created in async_setup_entry, before any platform,
        # so it is there to be found. If it somehow is not, the deprecated form
        # still links the device on every version that has not removed it.
        device = _hub_device(hass, hub)
        if device is not None:
            return {"via_device_id": device.id}
    return {"via_device": hub}


def coordinator_id(hass: HomeAssistant) -> str:
    """Best-effort stable coordinator id used as the hub device identifier."""
    try:
        coordinator = hass.data[const.DOMAIN].get("coordinator")
        if coordinator and getattr(coordinator, "id", None):
            return coordinator.id
    except (KeyError, AttributeError, RuntimeError):
        pass
    return const.DOMAIN


def hub_device_info(hass: HomeAssistant) -> dict:
    """The top-level Smart Irrigation (hub) device."""
    return {
        "identifiers": {(const.DOMAIN, coordinator_id(hass))},
        "name": const.NAME,
        "model": const.NAME,
        "manufacturer": const.MANUFACTURER,
        "sw_version": const.VERSION,
    }


def zone_device_info(hass: HomeAssistant, zone_id, zone_name: str) -> dict:
    """A per-zone device, parented to the hub device.

    The device is named after the zone alone (e.g. "Front lawn"); with
    ``has_entity_name`` the entities compose as "<zone> <descriptor>". The hub
    device ("Smart Irrigation") supplies the integration-level grouping.
    """
    cid = coordinator_id(hass)
    return {
        "identifiers": {(const.DOMAIN, f"{cid}_zone_{zone_id}")},
        "name": zone_name,
        "model": "Irrigation zone",
        "manufacturer": const.MANUFACTURER,
        **_parent_of(hass, (const.DOMAIN, cid)),
    }
