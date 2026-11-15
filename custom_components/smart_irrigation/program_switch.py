"""One switch per program: "Program on", from a dashboard or an automation.

The panel's "Program on" of a program, and the ``set_program_enabled`` action,
as an entity: switched off, the program's schedules do not start it and it
cannot be run. Only in full controller mode, and only for the programs that
have the setting: the main program has none since "Calculate and water",
where its schedules say when it waters and the hub's switch whether anything
does.

A program that is added gets its switch, one that is deleted loses it, exactly
as its sensor (program_sensor.py). The state is read from what the coordinator
publishes, so a change in the panel shows here at once, and a switch here is a
save the panel shows.
"""

import logging
from typing import cast

from homeassistant.components.switch import DOMAIN as PLATFORM
from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import slugify

from . import const
from .entity import hub_device_info
from .program_sensor import async_follow_programs

_LOGGER = logging.getLogger(__name__)


class SmartIrrigationProgramSwitch(SwitchEntity):
    """Whether one program of the full controller is on."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = "program_on"
    # A setting of the program, as "Skip on precipitation" is one of the hub.
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, hass: HomeAssistant, overview: dict) -> None:
        self._hass = hass
        self._program_id = overview["program_id"]
        self._overview = overview
        self.entity_id = (
            f"{PLATFORM}.{const.DOMAIN}_program_{slugify(self._program_id)}"
        )
        self._attr_translation_placeholders = self._placeholders(overview)

    def _placeholders(self, overview: dict) -> dict[str, str]:
        return {"name": str(overview.get("name") or self._program_id)}

    @property
    def unique_id(self) -> str:
        return f"{const.DOMAIN}_program_{self._program_id}_enabled"

    @property
    def is_on(self) -> bool:
        return self._overview.get("state") != "disabled"

    @property
    def icon(self) -> str:
        return "mdi:calendar-check" if self.is_on else "mdi:calendar-blank"

    @property
    def device_info(self) -> DeviceInfo:
        return cast(DeviceInfo, hub_device_info(self._hass))

    @property
    def extra_state_attributes(self) -> dict:
        return {"program_id": self._program_id}

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

    async def async_turn_on(self, **kwargs) -> None:
        await self._async_set(True)

    async def async_turn_off(self, **kwargs) -> None:
        await self._async_set(False)

    async def _async_set(self, enabled: bool) -> None:
        """Save it as the panel does; the overview that follows sets the state."""
        coordinator = self._hass.data.get(const.DOMAIN, {}).get("coordinator")
        if coordinator is None:
            return
        await coordinator.async_set_enabled(self._program_id, enabled)


async def async_setup_program_switches(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_devices: AddEntitiesCallback,
) -> None:
    """Keep one switch per program that has "Program on"."""
    await async_follow_programs(
        hass,
        config_entry,
        async_add_devices,
        "program_switches",
        SmartIrrigationProgramSwitch,
        wanted=lambda item: not item.get("main"),
    )
