"""The assistant's tools to read and change Smart Irrigation's configuration.

Both are offered with the API (llm_api.py).
Every write goes through the path the panel saves with (the same schemas and
the same helpers in websockets.py), so an assistant gets the same checks as
the panel. None of them runs a watering or opens a valve.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant
from homeassistant.helpers import llm

from . import const
from .llm_api import (
    _ANNOTATIONS,
    _TOOL_RESULT,
    _coordinator,
    _parameters,
    _ReadOnlyTool,
    _result,
    _timeline_summary,
)
from .programs import LAST_PROGRAM_MESSAGE, ProgramsRefused, dependents_of

_LOGGER = logging.getLogger(__name__)


def _error(message: str) -> Any:
    """A tool's refusal, said so the assistant can correct its call."""
    payload = {"success": False, "error": message}
    if _TOOL_RESULT is not None:
        return _TOOL_RESULT(data=payload, error=True)
    return payload


class _WriteTool(llm.Tool):
    """A tool of Smart Irrigation's that changes its configuration."""

    integration = const.DOMAIN
    if _ANNOTATIONS is not None:
        annotations = _ANNOTATIONS(
            read_only=False, destructive=False, idempotent=True, open_world=False
        )


class _DeleteTool(_WriteTool):
    """A tool that deletes part of the configuration."""

    if _ANNOTATIONS is not None:
        annotations = _ANNOTATIONS(
            read_only=False, destructive=True, idempotent=True, open_world=False
        )


# --- reading the configuration ---------------------------------------------------


class GetZoneSettingsTool(_ReadOnlyTool):
    """Every setting of one zone, as SaveZone takes them."""

    name = "GetZoneSettings"
    description = (
        "Every stored setting of one zone (metric: m2, l/min, mm, seconds): "
        "the fields SaveZone takes."
    )
    parameters = _parameters({vol.Required("zone_id"): int})

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        zone = _coordinator(hass).store.get_zone(int(tool_input.tool_args["zone_id"]))
        if zone is None:
            return _error("No such zone")
        return _result(dict(zone))


# What a sensor group records of its readings: long, and not configuration.
_GROUP_READINGS = (
    const.MAPPING_DATA,
    const.MAPPING_DATA_LAST_ENTRY,
    const.MAPPING_DATA_LAST_CALCULATION,
)


class GetSensorGroupsTool(_ReadOnlyTool):
    """The sensor groups and the calculation modules."""

    name = "GetSensorGroups"
    description = (
        "The sensor groups (where each weather input comes from: the weather "
        "service, a sensor, a fixed value or none) and the calculation modules "
        "zones can use, by id."
    )

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        store = _coordinator(hass).store
        groups = [
            {k: v for k, v in group.items() if k not in _GROUP_READINGS}
            for group in await store.async_get_mappings()
        ]
        return _result(
            {"sensor_groups": groups, "modules": await store.async_get_modules()}
        )


class GetSettingsTool(_ReadOnlyTool):
    """The general settings, as SaveSettings takes them."""

    name = "GetSettings"
    description = (
        "Smart Irrigation's general settings, in the unit system of Home "
        "Assistant: the fields SaveSettings takes. `mode` is what it does: "
        "`water` (calculate and open the valves, with programs), `calculate` "
        "(calculate only; an automation of the user's waters, started by the "
        "start triggers) or `off`. Then calculation and update times, skip "
        "conditions, sequencing, passes and soak, supplies..."
    )

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        from .one_choice import MODE_KEYS, current_mode
        from .websockets import async_config_for_display

        config = dict(await async_config_for_display(hass))
        mode = current_mode(config)
        for key in MODE_KEYS:
            config.pop(key, None)
        return _result({"mode": mode, **config})


def _make(device) -> str | None:
    """The make of a device; a child device of 2026.10 has none of its own."""
    return getattr(device, "manufacturer", None)


def _model(device) -> str | None:
    return getattr(device, "model", None)


# The domains an irrigation setup is made of, searched by default.
ENTITY_DOMAINS = ("valve", "switch", "sensor", "binary_sensor", "weather", "number")


class FindEntitiesTool(_ReadOnlyTool):
    """The entities of Home Assistant a zone or a sensor group can use."""

    name = "FindEntities"
    description = (
        "Search the entities of Home Assistant a setup can use: valves and "
        "switches for zones and pumps, sensors for weather inputs, flow meters "
        "and soil moisture, weather entities. Each with its name, state, unit, "
        "device class, and the make and model of its device. Filter by words "
        "(all must match) and by domains (default: valve, switch, sensor, "
        "binary_sensor, weather, number). Smart Irrigation's own entities are "
        "left out."
    )
    parameters = _parameters(
        {
            vol.Optional("search", default=""): str,
            vol.Optional("domains"): [str],
            vol.Optional("limit", default=50): vol.All(int, vol.Range(min=1, max=200)),
        }
    )

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        from homeassistant.helpers import device_registry as dr
        from homeassistant.helpers import entity_registry as er

        args = tool_input.tool_args
        words = str(args.get("search") or "").casefold().split()
        domains = list(args.get("domains") or ENTITY_DOMAINS)
        limit = int(args.get("limit", 50))
        entities = er.async_get(hass)
        devices = dr.async_get(hass)
        found: list[Any] = []
        for state in hass.states.async_all(domains):
            entry = entities.async_get(state.entity_id)
            if entry is not None and entry.platform == const.DOMAIN:
                continue
            name = state.attributes.get("friendly_name") or state.entity_id
            device = (
                devices.async_get(entry.device_id)
                if entry is not None and entry.device_id
                else None
            )
            text = f"{state.entity_id} {name}"
            if device is not None:
                text += f" {_make(device) or ''} {_model(device) or ''}"
            if not all(word in text.casefold() for word in words):
                continue
            found.append(
                {
                    "entity_id": state.entity_id,
                    "name": name,
                    "state": state.state,
                    "unit": state.attributes.get("unit_of_measurement"),
                    "device_class": state.attributes.get("device_class"),
                    "manufacturer": _make(device),
                    "model": _model(device),
                    "integration": entry.platform if entry is not None else None,
                }
            )
            if len(found) >= limit:
                break
        return _result(found)


# --- changing it -------------------------------------------------------------------


def _not_saved(e: vol.Invalid) -> str:
    return f"Not saved: {e}"


# What a zone save may not carry from an assistant: the one-off actions the
# panel sends with a save (deleting is DeleteZone's).
_ZONE_ACTIONS = (
    const.ATTR_REMOVE,
    const.ATTR_CALCULATE,
    const.ATTR_CALCULATE_ALL,
    const.ATTR_DRY_RUN,
    const.ATTR_UPDATE,
    const.ATTR_UPDATE_ALL,
    const.ATTR_RESET_ALL_BUCKETS,
    const.ATTR_OVERRIDE_CACHE,
    const.ATTR_CLEAR_ALL_WEATHERDATA,
)


class SaveZoneTool(_WriteTool):
    """Create a zone, or change the settings of one."""

    name = "SaveZone"
    description = (
        "Create a zone (no id) or change one (its id and only the fields that "
        "change), with the fields GetZoneSettings returns: name, size (m2), "
        "throughput (l/min), state (automatic, manual, disabled), "
        "linked_entity (the valve or switch that waters it), mapping (sensor "
        "group id), module (calculation module id), lead_time (s), "
        "maximum_duration (s), multiplier, soil and plant settings, "
        "supply_id... Metric figures. GetConfigReference lists every field. "
        "Returns the zone as saved."
    )
    parameters = _parameters({vol.Required("zone"): dict})

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        from .websockets import ZONE_SAVE_SCHEMA, async_save_zone

        raw = dict(tool_input.tool_args["zone"])
        for action in _ZONE_ACTIONS:
            raw.pop(action, None)
        try:
            data = ZONE_SAVE_SCHEMA(raw)
        except vol.Invalid as e:
            return _error(_not_saved(e))
        if const.ZONE_ID in data and (
            _coordinator(hass).store.get_zone(int(data[const.ZONE_ID])) is None
        ):
            return _error("Not saved: no such zone (leave the id out to create one)")
        zone_id, error = await async_save_zone(hass, data, from_display=False)
        if error is not None:
            return _error(error)
        _LOGGER.info("An assistant saved zone %s", zone_id)
        zone = (
            _coordinator(hass).store.get_zone(int(zone_id))
            if zone_id is not None
            else None
        )
        return _result(dict(zone) if zone else {"id": zone_id})


class DeleteZoneTool(_DeleteTool):
    """Delete a zone."""

    name = "DeleteZone"
    description = (
        "Delete a zone and its history. It cannot be undone: confirm with the "
        "user first."
    )
    parameters = _parameters({vol.Required("zone_id"): int})

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        from .websockets import async_save_zone

        zone_id = int(tool_input.tool_args["zone_id"])
        if _coordinator(hass).store.get_zone(zone_id) is None:
            return _error("No such zone")
        _id, error = await async_save_zone(
            hass, {const.ZONE_ID: zone_id, const.ATTR_REMOVE: True}, from_display=False
        )
        if error is not None:
            return _error(error)
        _LOGGER.info("An assistant deleted zone %s", zone_id)
        return _result({"deleted": zone_id})


class SaveSensorGroupTool(_WriteTool):
    """Create a sensor group, or change one."""

    name = "SaveSensorGroup"
    description = (
        "Create a sensor group (no id) or change one (its id): name, mappings "
        "(per weather input, where it comes from: the weather service, a "
        "sensor with its entity and unit, a static value, or none), "
        "greenhouse, module. Read GetSensorGroups first for the exact shape."
    )
    parameters = _parameters({vol.Required("group"): dict})

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        from .websockets import MAPPING_SAVE_SCHEMA, async_save_mapping

        raw = dict(tool_input.tool_args["group"])
        raw.pop(const.ATTR_REMOVE, None)
        try:
            data = MAPPING_SAVE_SCHEMA(raw)
        except vol.Invalid as e:
            return _error(_not_saved(e))
        await async_save_mapping(hass, data)
        _LOGGER.info("An assistant saved a sensor group")
        groups = await _coordinator(hass).store.async_get_mappings()
        return _result(
            [
                {k: v for k, v in group.items() if k not in _GROUP_READINGS}
                for group in groups
            ]
        )


class DeleteSensorGroupTool(_DeleteTool):
    """Delete a sensor group."""

    name = "DeleteSensorGroup"
    description = (
        "Delete a sensor group. The zones that read it are left without one: "
        "confirm with the user first."
    )
    parameters = _parameters({vol.Required("group_id"): int})

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        from .websockets import async_save_mapping

        group_id = int(tool_input.tool_args["group_id"])
        groups = await _coordinator(hass).store.async_get_mappings()
        if not any(int(g.get(const.MAPPING_ID, -1)) == group_id for g in groups):
            return _error("No such sensor group")
        await async_save_mapping(
            hass, {const.MAPPING_ID: group_id, const.ATTR_REMOVE: True}
        )
        _LOGGER.info("An assistant deleted sensor group %s", group_id)
        return _result({"deleted": group_id})


class SaveSettingsTool(_WriteTool):
    """Change general settings."""

    name = "SaveSettings"
    description = (
        "Change Smart Irrigation's general settings: only the fields that "
        "change, as GetSettings returns them (unit system of Home Assistant). "
        "`mode` (`water`, `calculate` or `off`) is what Smart Irrigation does. "
        "Programs are better changed with SaveProgram."
    )
    parameters = _parameters({vol.Required("settings"): dict})

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        from .one_choice import MODE_KEYS, mode_changes
        from .websockets import CONFIG_SAVE_SCHEMA

        raw = dict(tool_input.tool_args["settings"])
        # The switches the one choice replaced are not set one by one.
        legacy = [key for key in MODE_KEYS if key in raw]
        if legacy:
            return _error(
                f"Not saved: {', '.join(legacy)} is set with mode "
                "(water, calculate or off)"
            )
        if "mode" in raw:
            try:
                raw.update(
                    mode_changes(raw.pop("mode"), _coordinator(hass).store.config)
                )
            except ValueError as e:
                return _error(f"Not saved: {e}")
        try:
            data = CONFIG_SAVE_SCHEMA(raw)
        except vol.Invalid as e:
            return _error(_not_saved(e))
        if not data:
            return _error("Not saved: nothing to change")
        await _coordinator(hass).async_update_config(data)
        _LOGGER.info("An assistant changed the settings: %s", ", ".join(data))
        return _result({"saved": sorted(data)})


def _programs(coordinator) -> list:
    return list(getattr(coordinator.store.config, const.CONF_PROGRAMS, None) or [])


class SaveProgramTool(_WriteTool):
    """Create a program, or replace one."""

    name = "SaveProgram"
    description = (
        "Save a watering program, in the shape PreviewProgram takes: with the "
        "id of an existing program it replaces it, without one it is added. "
        "Refused when a zone it names matches none, when its `after` "
        "schedules would make programs start each other in a loop, or name a "
        "program that does not exist. GetConfigReference lists every field, "
        "including those only set in YAML. Returns the program as saved and "
        "its run, as PreviewProgram does."
    )
    parameters = _parameters({vol.Required("program"): dict})

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        coordinator = _coordinator(hass)
        written = tool_input.tool_args["program"] or {}
        preview = await coordinator.async_program_preview(written)
        unknown = [*preview["unknown_zone_names"], *preview["unknown_zones"]]
        if unknown:
            return _error(f"Not saved: no such zone: {unknown}")
        program = preview.pop("program")
        given = written.get(const.PROGRAM_ID) if isinstance(written, dict) else None
        programs = _programs(coordinator)
        index = next(
            (
                n
                for n, p in enumerate(programs)
                if given is not None and p.get(const.PROGRAM_ID) == given
            ),
            None,
        )
        if index is None:
            programs.append(program)
        else:
            # The program it replaces keeps its id, renamed or not.
            programs[index] = {**program, const.PROGRAM_ID: given}
        try:
            await coordinator.async_update_config({const.CONF_PROGRAMS: programs})
        except ProgramsRefused as e:
            return _error(f"Not saved: {e}")
        _LOGGER.info("An assistant saved program %s", program.get(const.PROGRAM_NAME))
        timeline = preview.pop("timeline")
        preview["total_seconds"] = timeline.get("total")
        preview["zones_in_order"] = _timeline_summary(timeline)
        preview["programs"] = [
            {"id": p.get(const.PROGRAM_ID), "name": p.get(const.PROGRAM_NAME)}
            for p in _programs(coordinator)
        ]
        return _result(preview)


class DeleteProgramTool(_DeleteTool):
    """Delete a program."""

    name = "DeleteProgram"
    description = (
        "Delete a watering program and its schedules (not the last one left: "
        "switch its schedules off instead; nor one that another program starts "
        "after: change that schedule first): confirm with the user first."
    )
    parameters = _parameters({vol.Required("program_id"): str})

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        coordinator = _coordinator(hass)
        program_id = tool_input.tool_args["program_id"]
        programs = _programs(coordinator)
        kept = [p for p in programs if p.get(const.PROGRAM_ID) != program_id]
        if len(kept) == len(programs):
            return _error("No such program")
        if not kept:
            return _error(LAST_PROGRAM_MESSAGE)
        if dependents_of(kept, program_id):
            names = ", ".join(f'"{n}"' for n in dependents_of(kept, program_id))
            return _error(
                f"Not deleted: {names} starts after it. Change that schedule first"
            )
        try:
            await coordinator.async_update_config({const.CONF_PROGRAMS: kept})
        except ProgramsRefused as e:
            return _error(f"Not deleted: {e}")
        _LOGGER.info("An assistant deleted program %s", program_id)
        return _result({"deleted": program_id})


def reading_tools() -> list:
    """The configuration tools that only read."""
    return [
        GetZoneSettingsTool(),
        GetSensorGroupsTool(),
        GetSettingsTool(),
        FindEntitiesTool(),
    ]


def writing_tools() -> list:
    """The tools that change the configuration."""
    return [
        SaveZoneTool(),
        DeleteZoneTool(),
        SaveSensorGroupTool(),
        DeleteSensorGroupTool(),
        SaveSettingsTool(),
        SaveProgramTool(),
        DeleteProgramTool(),
    ]
