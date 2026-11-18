"""Smart Irrigation offered to assistants, read only (llm_api.py).

Off by default. Turned on, it registers an LLM API with Home Assistant, which
Home Assistant's MCP server and Assist offer to an assistant. Nothing it does
changes the configuration or opens a valve.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.helpers import llm

from custom_components.smart_irrigation import const, llm_api


def _hass(coordinator=None):
    hass = MagicMock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}} if coordinator else {}
    return hass


def _context():
    return llm.LLMContext(
        platform="test", context=None, language="en", assistant=None, device_id=None
    )


def _call(name, **args):
    return llm.ToolInput(tool_name=name, tool_args=args)


def _data(result):
    """What a tool returned: a ToolResult on Home Assistant 2026.10 and later."""
    return getattr(result, "data", result)


def _coordinator():
    zones = [
        {
            const.ZONE_ID: 0,
            const.ZONE_NAME: "Lawn",
            const.ZONE_STATE: "automatic",
            const.ZONE_BUCKET: -4.25,
            const.ZONE_DURATION: 600,
            const.ZONE_LINKED_ENTITY: "valve.lawn",
            const.ZONE_MAPPING: 1,
        },
        {
            const.ZONE_ID: 1,
            const.ZONE_NAME: "Pots",
            const.ZONE_STATE: "manual",
            const.ZONE_BUCKET: 2.0,
            const.ZONE_MAPPING: None,
        },
    ]
    programs = [
        {"id": "main", "name": "Main program", "main": True, "enabled": True},
        {
            "id": "evening",
            "name": "Evening",
            "main": False,
            "steps": [{"id": "step_1", "zones": [0, 7]}],
            "schedules": [],
        },
    ]
    store = SimpleNamespace(
        config=SimpleNamespace(full_controller=True, programs=programs),
        async_get_zones=AsyncMock(return_value=zones),
        async_get_mappings=AsyncMock(return_value=[{"id": 1, "name": "Garden"}]),
    )
    coordinator = SimpleNamespace(store=store)
    coordinator.async_program_preview = AsyncMock(
        return_value={
            "program": {"id": "p"},
            "timeline": {
                "total": 500.0,
                "zones": [{"zone_id": 0, "zone": "Lawn"}],
                "segments": [
                    {"zone_id": 0, "kind": "fill", "start": 0, "end": 20},
                    {"zone_id": 0, "kind": "water", "start": 20, "end": 120},
                    {"zone_id": 0, "kind": "soak", "start": 120, "end": 400},
                    {"zone_id": 0, "kind": "water", "start": 400, "end": 500},
                ],
            },
            "unknown_zones": [],
            "unknown_zone_names": ["Roses"],
            "zones_not_watered": [],
        }
    )
    return coordinator


# --- turning it on and off


def test_registered_when_on_and_taken_away_when_off(monkeypatch):
    unregister = MagicMock()
    register = MagicMock(return_value=unregister)
    monkeypatch.setattr(llm_api.llm, "async_register_api", register)
    hass = _hass()

    llm_api.async_sync_llm_api(hass, False)
    register.assert_not_called()

    llm_api.async_sync_llm_api(hass, True)
    llm_api.async_sync_llm_api(hass, True)  # once only
    register.assert_called_once()
    api = register.call_args.args[1]
    assert (api.id, api.name) == ("smart_irrigation", "Smart Irrigation")

    llm_api.async_sync_llm_api(hass, False)
    unregister.assert_called_once()
    llm_api.async_sync_llm_api(hass, False)
    unregister.assert_called_once()


def test_a_name_already_taken_is_not_fatal(monkeypatch):
    monkeypatch.setattr(
        llm_api.llm,
        "async_register_api",
        MagicMock(side_effect=llm_api.HomeAssistantError("taken")),
    )
    hass = _hass()

    llm_api.async_sync_llm_api(hass, True)

    assert llm_api._UNREGISTER not in hass.data


# --- the API


async def test_the_tools_are_described():
    api = llm_api.SmartIrrigationAPI(hass=_hass(), id="smart_irrigation", name="SI")
    instance = await api.async_get_api_instance(_context())

    names = [tool.name for tool in instance.tools]
    assert names[:10] == [
        "GetZones",
        "GetIrrigationInfo",
        "GetPrograms",
        "GetPlanning",
        "PreviewProgram",
        "GetConfigReference",
        "GetZoneSettings",
        "GetSensorGroups",
        "GetSettings",
        "FindEntities",
    ]
    assert "No tool here runs a watering" in instance.api_prompt
    assert "GetConfigReference" in instance.api_prompt
    # Installed with Home Assistant's conversation, not always in the tests.
    voluptuous_openapi = pytest.importorskip("voluptuous_openapi")
    for tool in instance.tools:
        assert tool.description
        # Tagged with the integration that provides it (Home Assistant 2026.10).
        assert tool.integration == "smart_irrigation"
        # What an assistant is sent: the parameters as JSON schema.
        voluptuous_openapi.convert(tool.parameters)


async def test_zones_say_where_they_stand():
    hass = _hass(_coordinator())

    result = _data(
        await llm_api.GetZonesTool().async_call(hass, _call("GetZones"), None)
    )

    lawn, pots = result["result"]
    assert lawn["deficit_mm"] == 4.25
    assert lawn["sensor_group"] == "Garden"
    assert lawn["valve"] == "valve.lawn"
    assert pots["deficit_mm"] == 0.0
    assert pots["sensor_group"] is None


async def test_programs_name_their_zones():
    hass = _hass(_coordinator())

    result = _data(
        await llm_api.GetProgramsTool().async_call(hass, _call("GetPrograms"), None)
    )

    assert result["result"]["mode"] == "water"
    evening = result["result"]["programs"][1]
    assert evening["steps"][0]["zone_names"] == ["Lawn", "#7"]
    assert "steps" not in result["result"]["programs"][0]


async def test_a_preview_is_summed_up_per_zone():
    coordinator = _coordinator()
    hass = _hass(coordinator)

    result = _data(
        await llm_api.PreviewProgramTool().async_call(
            hass, _call("PreviewProgram", program={"name": "P"}), None
        )
    )

    coordinator.async_program_preview.assert_awaited_once_with({"name": "P"})
    preview = result["result"]
    assert "timeline" not in preview
    assert preview["total_seconds"] == 500.0
    assert preview["unknown_zone_names"] == ["Roses"]
    assert preview["zones_in_order"] == [
        {
            "zone_id": 0,
            "zone": "Lawn",
            "starts_after_seconds": 0,
            "ends_after_seconds": 500,
            "water_seconds": 200.0,
            "passes": 2,
        }
    ]


async def test_nothing_is_answered_while_loading():
    with pytest.raises(llm_api.HomeAssistantError):
        await llm_api.GetZonesTool().async_call(_hass(), _call("GetZones"), None)
