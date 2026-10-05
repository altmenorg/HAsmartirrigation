"""One sensor per program: its state, and when it runs next.

Only in full controller mode, and kept in step with the programs: a program
that is added gets its sensor, one that is deleted loses it. Each sensor reads
what the coordinator publishes (program_status.py) when something changes, so it
is never polled.

The state is one of idle, waiting, running, paused, suspended or disabled. The
next start, the last run, the length of the suspension and, while it runs, the
step it is on and how far along it is, are attributes.
"""

import logging

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
    "disabled": "mdi:calendar-blank",
}


class SmartIrrigationProgramSensor(SensorEntity):
    """The state of one program of the full controller."""

    _attr_has_entity_name = False
    _attr_should_poll = False

    def __init__(self, hass: HomeAssistant, overview: dict) -> None:
        self._hass = hass
        self._program_id = overview["program_id"]
        self._overview = overview
        self.entity_id = (
            f"{PLATFORM}.{const.DOMAIN}_program_{slugify(self._program_id)}"
        )

    @property
    def unique_id(self) -> str:
        return f"{const.DOMAIN}_program_{self._program_id}"

    @property
    def name(self) -> str:
        return f"Program {self._overview.get('name') or self._program_id}"

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
            "main": overview.get("main"),
            "next_start": overview.get("next_start"),
            "last_run": overview.get("last_run"),
            "suspended_until": overview.get("suspended_until"),
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
        self._overview = overview
        if self.hass is not None:
            self.async_write_ha_state()


async def async_setup_program_sensors(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_devices: AddEntitiesCallback,
) -> None:
    """Keep one sensor per program, following the programs as they change."""

    async def _sync() -> None:
        coordinator = hass.data.get(const.DOMAIN, {}).get("coordinator")
        if coordinator is None:
            return
        try:
            overview = await coordinator.async_program_overview()
        except Exception as e:  # noqa: BLE001 - a display must not break setup
            _LOGGER.debug("Program overview unavailable: %s", e)
            return
        registered = hass.data[const.DOMAIN].setdefault("program_sensors", {})
        wanted = {item["program_id"]: item for item in overview}
        added = []
        for program_id, item in wanted.items():
            entity = registered.get(program_id)
            if entity is None:
                entity = registered[program_id] = SmartIrrigationProgramSensor(
                    hass, item
                )
                added.append(entity)
            else:
                entity.set_overview(item)
        if added:
            async_add_devices(added)
        for program_id in [p for p in registered if p not in wanted]:
            entity = registered.pop(program_id)
            registry = er.async_get(hass)
            if entity.entity_id and registry.async_get(entity.entity_id):
                registry.async_remove(entity.entity_id)

    # A reload sets the platform up again: the sensors of the entry that was
    # unloaded are gone with it and must be added again, not updated.
    hass.data.setdefault(const.DOMAIN, {})["program_sensors"] = {}

    @callback
    def _changed() -> None:
        hass.async_create_task(_sync())

    config_entry.async_on_unload(
        async_dispatcher_connect(hass, const.DOMAIN + "_programs_updated", _changed)
    )
    await _sync()
