"""Shared device-registry helpers for Smart Irrigation entities.

Every zone entity groups under a per-zone device, and the per-zone devices hang
off the single Smart Irrigation hub device. These helpers
return plain dicts, which Home Assistant accepts for ``device_info``.

The per-zone device layout is adapted from JustChr's Smart Irrigation fork
(https://github.com/JustChr/HAsmartirrigation), MIT.
"""

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from . import const


def _via_device_id_supported() -> bool:
    """Whether this Home Assistant takes the parent as a device id.

    ``via_device`` (the parent's identifiers) is deprecated and stops working
    in Home Assistant 2027.8, replaced by ``via_device_id`` (the parent's id in
    the device registry). We support Home Assistant 2025.5 and up, which spans
    both, and passing both at once is an error, so ask this version which one
    it knows (#833).
    """
    return "via_device_id" in getattr(dr.DeviceInfo, "__annotations__", {})


def _parent_of(hass: HomeAssistant, hub: tuple[str, str]) -> dict:
    """The "hangs off the hub device" part of a per-zone device's info."""
    if _via_device_id_supported():
        # The hub device is created in async_setup_entry, before any platform,
        # so it is there to be found. If it somehow is not, the deprecated form
        # still links the device on every version that has not removed it.
        device = dr.async_get(hass).async_get_device(identifiers={hub})
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
