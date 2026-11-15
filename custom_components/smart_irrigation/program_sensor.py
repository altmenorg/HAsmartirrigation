"""One sensor per program: its state, and when it runs next.

Only in full controller mode, and kept in step with the programs: a program
that is added gets its sensor, one that is deleted loses it. Each sensor reads
what the coordinator publishes (program_status.py) when something changes, so it
is never polled.

The state is one of idle, waiting, running, paused or suspended. The
next start, the last run, the length of the suspension and, while it runs, the
step it is on and how far along it is, are attributes.

The name and the states come from the translations: in German a program's
sensor is "Smart Irrigation Programm <name>", reading "Bereit". The entity ID
stays the one it was given, the old main program's included.
"""

import logging
from collections.abc import Callable
from typing import Any

from homeassistant.components.sensor import DOMAIN as PLATFORM
from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import slugify

from . import const
from .entity import hub_device_info

_LOGGER = logging.getLogger(__name__)

_ICONS = {
    "idle": "mdi:calendar-clock",
    "waiting": "mdi:timer-sand",
    "running": "mdi:sprinkler-variant",
    "paused": "mdi:pause-circle",
    "suspended": "mdi:calendar-remove",
}


class SmartIrrigationProgramSensor(SensorEntity):
    """The state of one program of the full controller."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, hass: HomeAssistant, overview: dict) -> None:
        self._hass = hass
        self._program_id = overview["program_id"]
        self._overview = overview
        self.entity_id = (
            f"{PLATFORM}.{const.DOMAIN}_program_{slugify(self._program_id)}"
        )
        # "Program <its name>", whichever program it is.
        self._attr_translation_key = "program"
        self._attr_translation_placeholders = self._placeholders(overview)

    def _placeholders(self, overview: dict) -> dict[str, str]:
        return {"name": str(overview.get("name") or self._program_id)}

    @property
    def unique_id(self) -> str:
        return f"{const.DOMAIN}_program_{self._program_id}"

    @property
    def native_value(self) -> str:
        return self._overview.get("state")

    @property
    def icon(self) -> str:
        return _ICONS.get(self._overview.get("state"), "mdi:calendar-clock")

    @property
    def device_info(self) -> dict:
        return hub_device_info(self._hass)

    @property
    def extra_state_attributes(self) -> dict:
        overview = self._overview
        attributes = {
            "program_id": self._program_id,
            "next_start": overview.get("next_start"),
            "last_run": overview.get("last_run"),
            "suspended_until": overview.get("suspended_until"),
            "adjustment": overview.get("adjustment"),
        }
        live = overview.get("live")
        if live:
            attributes.update(
                {
                    "tour": live.get("tour"),
                    "tours": live.get("tours"),
                    "step": live.get("step"),
                    "steps": live.get("steps"),
                    "percent": live.get("percent"),
                    "remaining_seconds": live.get("remaining_seconds"),
                    "manual": live.get("manual"),
                }
            )
        return attributes

    @callback
    def set_overview(self, overview: dict) -> None:
        """Take what the coordinator published and show it, if it changed."""
        if overview == self._overview:
            return
        if overview.get("name") != self._overview.get("name"):
            self._attr_translation_placeholders = self._placeholders(overview)
            # Home Assistant keeps the name it worked out from the translation
            # and its placeholders: a renamed program kept its old one.
            self.__dict__.pop("name", None)
        self._overview = overview
        if self.hass is not None:
            self.async_write_ha_state()


async def async_follow_programs(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_devices: AddEntitiesCallback,
    registered_key: str,
    create: Callable[[HomeAssistant, dict], Any],
    wanted: Callable[[dict], bool] = lambda item: True,
) -> None:
    """Keep one entity per program, following the programs as they change.

    ``create`` makes the entity of a program from its overview; an entity it
    made is handed every later overview through ``set_overview``. ``wanted``
    says which programs get one. A program that goes, or stops being wanted,
    loses its entity.
    """

    # Refreshes overlap (a save asks for several), and one that began earlier
    # can end later: it would put back what was true before. Only a refresh
    # newer than the last one shown is shown.
    order = {"asked": 0, "shown": 0}

    async def _sync() -> None:
        coordinator = hass.data.get(const.DOMAIN, {}).get("coordinator")
        if coordinator is None:
            return
        order["asked"] += 1
        mine = order["asked"]
        try:
            overview = await coordinator.async_program_overview()
        except Exception as e:  # noqa: BLE001 - a display must not break setup
            _LOGGER.debug("Program overview unavailable: %s", e)
            return
        if mine < order["shown"]:
            return
        order["shown"] = mine
        registered = hass.data[const.DOMAIN].setdefault(registered_key, {})
        kept = {item["program_id"]: item for item in overview if wanted(item)}
        added = []
        for program_id, item in kept.items():
            entity = registered.get(program_id)
            if entity is None:
                entity = registered[program_id] = create(hass, item)
                added.append(entity)
            else:
                entity.set_overview(item)
        if added:
            async_add_devices(added)
        for program_id in [p for p in registered if p not in kept]:
            entity = registered.pop(program_id)
            registry = er.async_get(hass)
            if entity.entity_id and registry.async_get(entity.entity_id):
                registry.async_remove(entity.entity_id)

    # A reload sets the platform up again: the entities of the entry that was
    # unloaded are gone with it and must be added again, not updated.
    hass.data.setdefault(const.DOMAIN, {})[registered_key] = {}

    @callback
    def _changed() -> None:
        hass.async_create_task(_sync())

    config_entry.async_on_unload(
        async_dispatcher_connect(hass, const.DOMAIN + "_programs_updated", _changed)
    )
    await _sync()


async def async_setup_program_sensors(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_devices: AddEntitiesCallback,
) -> None:
    """Keep one sensor per program, following the programs as they change."""
    await async_follow_programs(
        hass,
        config_entry,
        async_add_devices,
        "program_sensors",
        SmartIrrigationProgramSensor,
    )
