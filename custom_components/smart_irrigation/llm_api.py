"""Smart Irrigation for an assistant: an LLM API of Home Assistant.

Smart Irrigation registers an API with Home Assistant's LLM helper. Nothing
is offered until the user picks it: in the options of Home Assistant's own
Model Context Protocol Server, or of a conversation agent. Home Assistant's own Model
Context Protocol Server integration then offers it to an MCP client (Claude,
ChatGPT...), and a conversation agent of Home Assistant (Assist) can use it as
well: Smart Irrigation runs no server of its own, Home Assistant does the
authentication and the transport.

It reads the zones and where they stand, the next run and why a zone is held
back, the programs and the planning, the settings and sensor groups, the
entities of Home Assistant a setup is made of, and dry-runs a program as
written (the YAML editor's ``program_preview``), and lists every field it can
write, advanced-mode and YAML-only options included (config_reference.py).

It also configures Smart Irrigation: zones, sensor groups, settings and
programs, through the paths the panel saves with (llm_config_tools.py). No
tool runs a watering or opens a valve, and none changes the assistant's own
access.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import llm

from . import const
from .one_choice import current_mode

_LOGGER = logging.getLogger(__name__)

API_ID = const.DOMAIN
API_NAME = "Smart Irrigation"
_UNREGISTER = const.DOMAIN + "_llm_api_unregister"

API_PROMPT = """You can read the Smart Irrigation integration of this Home \
Assistant: it works out how much water each irrigation zone needs from the \
weather, and can run the valves itself. What it does is one setting, `mode`: \
`water` (it calculates and opens the valves, with programs), `calculate` (it \
calculates only, and an automation of the user's waters) or `off`.

How it reasons: each zone has a water balance (its bucket, in mm). Evaporation \
takes water out, rain and watering put it back. Below zero the zone has a \
deficit and is watered for the time that brings it back to zero (its \
duration, in seconds). A zone can be held back by skip conditions (rain \
forecast, frost, wind, a moist soil, days between waterings). What is \
measured (frost, wind, the rain sensor, a postponement) is judged at each \
program start; the rain forecast and the days between waterings are decided \
once a day, at the day's first start.

Programs (mode `water`): a program is an ordered list of steps; a step is \
one zone, or several watered together. A step takes the duration Smart \
Irrigation calculated unless it is a percent of it or a fixed number of \
seconds. Schedules say when a program starts (or must be done); a program \
whose schedules are all off starts only when run by hand. A schedule of the \
type `after` (with `after_program`, the id of another program, and \
`offset_minutes`, 0 or more) starts its program that many minutes after the \
other program has really watered and finished, by hand or scheduled. When a \
scheduled run of the other program does not water (held back by the weather, \
suspended, nothing to water), it still starts, that many minutes after that \
run's planned moment. When the other program was stopped by hand or its run \
failed, it does not start. Its own days and weather setting still apply. Programs cannot start after each \
other in a loop, and a program another one starts after cannot be deleted. \
All programs are equal: a zone is watered only by the programs whose steps \
name it.

Durations are in seconds and depths in mm unless a field says otherwise. \
Weekdays are numbered from 0 (Monday) to 6 (Sunday). No tool here runs a \
watering or opens a valve."""

WRITE_PROMPT = """You can also configure Smart Irrigation: SaveZone, \
DeleteZone, SaveSensorGroup, DeleteSensorGroup, SaveSettings, SaveProgram and \
DeleteProgram. Read before you write (GetZoneSettings, GetSensorGroups, \
GetSettings, GetPrograms) and send only the fields you change, with the id of \
what you change. Use FindEntities to find the user's valves, switches and \
sensors, ask the user what you cannot tell (soil, plants, sprinklers, a \
pump), and say what you are about to change before you change it. \
GetConfigReference lists every field of a program, its steps and schedules, \
and of a zone, with its values, range and default, including the options the \
panel shows in its advanced mode only (advanced: true) and the two set only in \
YAML (yaml_only: no field in the panel); you can set them all. Check a program with PreviewProgram before SaveProgram. Zone figures are metric (m2, \
l/min, mm); settings are in the unit system of Home Assistant, as GetSettings \
returns them."""


def _coordinator(hass: HomeAssistant):
    coordinator = (hass.data.get(const.DOMAIN) or {}).get("coordinator")
    if coordinator is None:
        raise HomeAssistantError("Smart Irrigation is loading")
    return coordinator


# Home Assistant 2026.10 records which integration provides a tool, wraps what
# a tool returns in a ToolResult and lets a tool say it only reads; older ones
# have none of this, and take the plain dict.
_TOOL_RESULT = getattr(llm, "ToolResult", None)
_ANNOTATIONS = getattr(llm, "ToolAnnotations", None)


def _result(data) -> Any:
    """What a tool returns, in the form this Home Assistant expects."""
    payload = {"success": True, "result": data}
    return _TOOL_RESULT(data=payload) if _TOOL_RESULT is not None else payload


class _ReadOnlyTool(llm.Tool):
    """A tool of Smart Irrigation's that only reads."""

    integration = const.DOMAIN
    if _ANNOTATIONS is not None:
        annotations = _ANNOTATIONS(
            read_only=True, destructive=False, idempotent=True, open_world=False
        )


def _parameters(schema: dict) -> Any:
    """A tool's parameters. Home Assistant 2026.10 types them as probatio, the
    successor of voluptuous it moved to; voluptuous schemas still work."""
    return vol.Schema(schema)


def _number(value) -> float | None:
    try:
        return round(float(value), 2)
    except (TypeError, ValueError):
        return None


# --- the tools ------------------------------------------------------------------


class GetZonesTool(_ReadOnlyTool):
    """The zones, and where each one stands."""

    name = "GetZones"
    description = (
        "List the irrigation zones of Smart Irrigation: id, name, state "
        "(automatic, manual or disabled), water balance (bucket, mm, negative "
        "is a deficit), the duration of its next watering (seconds), its valve "
        "entity, size (m2), throughput (l/min), lead time (seconds) and the "
        "sensor group it reads the weather from."
    )

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        coordinator = _coordinator(hass)
        groups = {
            int(m[const.MAPPING_ID]): m.get(const.MAPPING_NAME)
            for m in await coordinator.store.async_get_mappings()
            if const.MAPPING_ID in m
        }
        zones: list[Any] = []
        for zone in await coordinator.store.async_get_zones():
            bucket = _number(zone.get(const.ZONE_BUCKET))
            mapping = zone.get(const.ZONE_MAPPING)
            zones.append(
                {
                    "id": zone.get(const.ZONE_ID),
                    "name": zone.get(const.ZONE_NAME),
                    "state": zone.get(const.ZONE_STATE),
                    "bucket_mm": bucket,
                    "deficit_mm": max(0.0, -bucket) if bucket is not None else None,
                    "maximum_bucket_mm": _number(zone.get(const.ZONE_MAXIMUM_BUCKET)),
                    "duration_seconds": _number(zone.get(const.ZONE_DURATION)),
                    "valve": zone.get(const.ZONE_LINKED_ENTITY),
                    "size_m2": _number(zone.get(const.ZONE_SIZE)),
                    "throughput_l_min": _number(zone.get(const.ZONE_THROUGHPUT)),
                    "lead_time_seconds": _number(zone.get(const.ZONE_LEAD_TIME)),
                    "sensor_group": (
                        groups.get(int(mapping))
                        if isinstance(mapping, int | float)
                        else None
                    ),
                }
            )
        return _result(zones)


class GetIrrigationInfoTool(_ReadOnlyTool):
    """The next run, and why each zone is or is not in it."""

    name = "GetIrrigationInfo"
    description = (
        "When Smart Irrigation waters next, what it will water, and why a zone "
        "is held back or skipped (rain, frost, wind, moist soil, days between "
        "waterings). The same answer as the Info page of the panel."
    )

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        from .websockets import build_irrigation_info

        return _result(await build_irrigation_info(hass, _coordinator(hass)))


def _program_for_reading(program: dict, names: dict) -> dict:
    """A stored program, the zones of its steps named."""
    steps = []
    for step in program.get(const.PROGRAM_STEPS) or []:
        zone_ids = step.get(const.STEP_ZONES) or []
        steps.append(
            {
                **step,
                "zone_names": [names.get(int(z), f"#{z}") for z in zone_ids],
            }
        )
    readable = {**program}
    if steps or const.PROGRAM_STEPS in program:
        readable[const.PROGRAM_STEPS] = steps
    return readable


class GetProgramsTool(_ReadOnlyTool):
    """The watering programs."""

    name = "GetPrograms"
    description = (
        "The watering programs of Smart Irrigation, with their steps (zones "
        "by id, and their names in zone_names) and their schedules, and the "
        "mode (they water only in mode `water`). A program is written for "
        "PreviewProgram and SaveProgram in the shape it is read in; "
        "GetConfigReference lists every field, including those only set in "
        "YAML."
    )

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        coordinator = _coordinator(hass)
        config = coordinator.store.config
        names = {
            int(z[const.ZONE_ID]): z.get(const.ZONE_NAME)
            for z in await coordinator.store.async_get_zones()
        }
        return _result(
            {
                "mode": current_mode(config),
                "programs": [
                    _program_for_reading(p, names)
                    for p in getattr(config, const.CONF_PROGRAMS, None) or []
                ],
            }
        )


def _timeline_summary(timeline: dict) -> list:
    """Per zone: when it starts and ends in the run, and the water it gets."""
    rows: dict = {}
    names = {z["zone_id"]: z.get("zone") for z in timeline.get("zones") or []}
    for segment in timeline.get("segments") or []:
        row = rows.setdefault(
            segment["zone_id"],
            {
                "zone_id": segment["zone_id"],
                "zone": names.get(segment["zone_id"]),
                "starts_after_seconds": segment["start"],
                "ends_after_seconds": segment["end"],
                "water_seconds": 0.0,
                "passes": 0,
            },
        )
        row["starts_after_seconds"] = min(row["starts_after_seconds"], segment["start"])
        row["ends_after_seconds"] = max(row["ends_after_seconds"], segment["end"])
        if segment["kind"] == "water":
            row["water_seconds"] = round(
                row["water_seconds"] + segment["end"] - segment["start"], 1
            )
            row["passes"] += 1
    return list(rows.values())


class GetPlanningTool(_ReadOnlyTool):
    """What the programs will water over the next days."""

    name = "GetPlanning"
    description = (
        "What Smart Irrigation's programs will water over the next days "
        '(with "Calculate and water"): '
        "each run's start and end, its program, the zones "
        "and seconds of each step, and whether the weather or a suspension is "
        "expected to hold it back."
    )
    parameters = _parameters(
        {vol.Optional("days", default=3): vol.All(int, vol.Range(min=1, max=14))}
    )

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        from .planning_sequence import sequence_planning

        coordinator = _coordinator(hass)
        days = int(tool_input.tool_args.get("days", 3))
        planned = sequence_planning(
            await coordinator.async_planning(days),
            keys=lambda item: coordinator.program_turn_keys(item.get("program_id")),
        )
        runs: list[Any] = []
        for item in planned:
            run = {k: v for k, v in item.items() if k != "timeline"}
            run["zones_in_order"] = _timeline_summary(item.get("timeline") or {})
            runs.append(run)
        return _result(runs)


class PreviewProgramTool(_ReadOnlyTool):
    """A program as written, cleaned and dry-run. Nothing is saved."""

    name = "PreviewProgram"
    description = (
        "Check a watering program before the user saves it: it is cleaned the "
        "way a save would clean it and planned on the zones as they are now. "
        "Returns the program as it would be stored, each zone's start, end and "
        "seconds of water in a run, the total, zone names that matched no "
        "zone, and zones the run leaves out (no valve, or disabled). Nothing is "
        "saved and no valve opens. A step names its zones by name or id; an "
        "`after` schedule names the program it follows in after_program, by id "
        "or name. GetConfigReference lists every field a program takes."
    )
    parameters = _parameters({vol.Required("program"): dict})

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        preview = await _coordinator(hass).async_program_preview(
            tool_input.tool_args["program"]
        )
        timeline = preview.pop("timeline")
        preview["total_seconds"] = timeline.get("total")
        preview["zones_in_order"] = _timeline_summary(timeline)
        return _result(preview)


class GetConfigReferenceTool(_ReadOnlyTool):
    """Every field a program, a step, a schedule or a zone can be written with."""

    name = "GetConfigReference"
    description = (
        "Every field that can be written: of a program, its steps, its "
        "schedules (time, sun, after) and its notify, and of a zone. For each: "
        "type, allowed values or min/max, unit, default and meaning; "
        "advanced: true for the options the panel shows in its advanced mode "
        "only, yaml_only: true for the ones it sets only in YAML. You can set "
        "them all. `section`: program or zone (default: all)."
    )
    parameters = _parameters(
        {vol.Optional("section"): vol.In(("program", "zone", "all"))}
    )

    async def async_call(
        self, hass: HomeAssistant, tool_input: llm.ToolInput, llm_context
    ) -> Any:
        from .config_reference import config_reference

        return _result(config_reference(tool_input.tool_args.get("section")))


# --- the API --------------------------------------------------------------------


class SmartIrrigationAPI(llm.API):
    """Smart Irrigation's tools: reading, and configuring when allowed."""

    async def async_get_api_instance(
        self, llm_context: llm.LLMContext
    ) -> llm.APIInstance:
        from .llm_config_tools import reading_tools, writing_tools

        tools: list[llm.Tool] = [
            GetZonesTool(),
            GetIrrigationInfoTool(),
            GetProgramsTool(),
            GetPlanningTool(),
            PreviewProgramTool(),
            GetConfigReferenceTool(),
            *reading_tools(),
        ]
        tools += writing_tools()
        return llm.APIInstance(
            api=self,
            api_prompt=f"{API_PROMPT}\n\n{WRITE_PROMPT}",
            llm_context=llm_context,
            tools=tools,
        )


@callback
def async_sync_llm_api(hass: HomeAssistant, enabled: Any) -> None:
    """Register the API when it is turned on, and take it away when it is not."""
    unregister = hass.data.get(_UNREGISTER)
    if enabled is True and unregister is None:
        try:
            hass.data[_UNREGISTER] = llm.async_register_api(
                hass, SmartIrrigationAPI(hass=hass, id=API_ID, name=API_NAME)
            )
        except HomeAssistantError as e:
            _LOGGER.warning("Could not offer Smart Irrigation to assistants: %s", e)
            return
        _LOGGER.info("Smart Irrigation offered to assistants (LLM API)")
    elif enabled is not True and unregister is not None:
        hass.data.pop(_UNREGISTER)()
        _LOGGER.info("Smart Irrigation no longer offered to assistants")
