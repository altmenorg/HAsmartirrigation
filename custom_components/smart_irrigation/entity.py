"""Shared device-registry helpers for Smart Irrigation entities.

Every zone entity groups under a per-zone device, and the per-zone devices hang
off the single Smart Irrigation hub device (via ``via_device``). These helpers
return plain dicts, which Home Assistant accepts for ``device_info``.

The per-zone device layout is adapted from JustChr's Smart Irrigation fork
(https://github.com/JustChr/HAsmartirrigation), MIT.
"""

from homeassistant.core import HomeAssistant

from . import const


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
    """A per-zone device, parented to the hub via ``via_device``.

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
        "via_device": (const.DOMAIN, cid),
    }
