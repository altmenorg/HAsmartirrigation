"""An assistant configuring Smart Irrigation (llm_config_tools.py).

Every write goes through the path the panel saves with; none runs a
watering.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from homeassistant.helpers import llm

from custom_components.smart_irrigation import const, llm_api, llm_config_tools
from custom_components.smart_irrigation import websockets as ws


def _call(name, **args):
    return llm.ToolInput(tool_name=name, tool_args=args)


def _data(result):
    return getattr(result, "data", result)


def _context():
    return llm.LLMContext(
        platform="test", context=None, language="en", assistant=None, device_id=None
    )


def _coordinator(programs=None):
    zones = {0: {const.ZONE_ID: 0, const.ZONE_NAME: "Lawn"}}
    store = SimpleNamespace(
        config=SimpleNamespace(
            programs=(
                programs
                if programs is not None
                else [{"id": "main", "name": "Main program", "main": True}]
            ),
        ),
        get_zone=lambda zone_id: zones.get(int(zone_id)),
        async_get_zones=AsyncMock(return_value=list(zones.values())),
        async_get_mappings=AsyncMock(
            return_value=[{"id": 1, "name": "Garden", "data": [1, 2, 3]}]
        ),
        async_get_modules=AsyncMock(return_value=[{"id": 1, "name": "PyETO"}]),
    )
    coordinator = SimpleNamespace(store=store)

    async def update_config(data):
        for key, value in data.items():
            setattr(store.config, key, value)

    coordinator.async_update_config = AsyncMock(side_effect=update_config)
    coordinator.async_program_preview = AsyncMock(
        side_effect=lambda program: {
            "program": {"id": "evening", "name": program.get("name"), "steps": []},
            "timeline": {"total": 0, "zones": [], "segments": []},
            "unknown_zones": [],
            "unknown_zone_names": ["Roses"] if "Roses" in str(program) else [],
            "zones_not_watered": [],
        }
    )
    return coordinator


def _hass(coordinator):
    hass = MagicMock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    return hass


# --- offered only when allowed


async def test_the_writing_tools_are_always_offered():
    hass = _hass(_coordinator())
    api = llm_api.SmartIrrigationAPI(hass=hass, id="smart_irrigation", name="SI")

    instance = await api.async_get_api_instance(_context())

    names = {tool.name for tool in instance.tools}
    assert {"SaveZone", "DeleteProgram", "SaveSettings"} <= names
    assert "can also configure" in instance.api_prompt
    # Nothing ever runs a watering.
    assert not any("Run" in name or "Water" in name for name in names)


# --- reading


async def test_sensor_groups_come_without_their_readings():
    hass = _hass(_coordinator())

    result = _data(
        await llm_config_tools.GetSensorGroupsTool().async_call(
            hass, _call("GetSensorGroups"), None
        )
    )

    assert result["result"]["sensor_groups"] == [{"id": 1, "name": "Garden"}]
    assert result["result"]["modules"] == [{"id": 1, "name": "PyETO"}]


# --- zones


async def test_a_zone_is_saved_the_way_the_panel_saves_it(monkeypatch):
    save = AsyncMock(return_value=(0, None))
    monkeypatch.setattr(ws, "async_save_zone", save)
    hass = _hass(_coordinator())

    result = _data(
        await llm_config_tools.SaveZoneTool().async_call(
            hass,
            _call(
                "SaveZone",
                zone={
                    "id": 0,
                    "size": 40,
                    "calculate": True,
                    "reset_all_buckets": True,
                },
            ),
            None,
        )
    )

    data = save.await_args.args[1]
    assert data == {const.ZONE_ID: 0, const.ZONE_SIZE: 40.0}
    # Metric, as the assistant reads it.
    assert save.await_args.kwargs == {"from_display": False}
    assert result["result"][const.ZONE_NAME] == "Lawn"


async def test_a_zone_that_does_not_validate_is_refused(monkeypatch):
    save = AsyncMock()
    monkeypatch.setattr(ws, "async_save_zone", save)
    hass = _hass(_coordinator())

    result = _data(
        await llm_config_tools.SaveZoneTool().async_call(
            hass, _call("SaveZone", zone={"name": "X", "not_a_field": 1}), None
        )
    )

    assert result["success"] is False
    save.assert_not_awaited()


async def test_an_unknown_zone_is_not_created_under_its_id(monkeypatch):
    save = AsyncMock()
    monkeypatch.setattr(ws, "async_save_zone", save)
    hass = _hass(_coordinator())

    result = _data(
        await llm_config_tools.SaveZoneTool().async_call(
            hass, _call("SaveZone", zone={"id": 9, "name": "X"}), None
        )
    )

    assert result["success"] is False
    save.assert_not_awaited()


async def test_the_panel_refusal_is_passed_on(monkeypatch):
    monkeypatch.setattr(
        ws, "async_save_zone", AsyncMock(return_value=(None, "a valve of its own"))
    )
    hass = _hass(_coordinator())

    result = _data(
        await llm_config_tools.SaveZoneTool().async_call(
            hass, _call("SaveZone", zone={"id": 0, "linked_entity": "valve.x"}), None
        )
    )

    assert result == {"success": False, "error": "a valve of its own"}


async def test_deleting_a_zone_removes_it(monkeypatch):
    save = AsyncMock(return_value=(0, None))
    monkeypatch.setattr(ws, "async_save_zone", save)
    hass = _hass(_coordinator())

    await llm_config_tools.DeleteZoneTool().async_call(
        hass, _call("DeleteZone", zone_id=0), None
    )

    assert save.await_args.args[1] == {const.ZONE_ID: 0, const.ATTR_REMOVE: True}


# --- settings


async def test_settings_are_saved_through_the_panel_schema():
    coordinator = _coordinator()
    hass = _hass(coordinator)

    result = _data(
        await llm_config_tools.SaveSettingsTool().async_call(
            hass, _call("SaveSettings", settings={"soak_minutes": "20"}), None
        )
    )

    assert result["result"] == {"saved": ["soak_minutes"]}
    coordinator.async_update_config.assert_awaited_once()

    bad = _data(
        await llm_config_tools.SaveSettingsTool().async_call(
            hass, _call("SaveSettings", settings={"nonsense": 1}), None
        )
    )
    assert bad["success"] is False


async def test_what_smart_irrigation_does_is_one_mode():
    coordinator = _coordinator()
    hass = _hass(coordinator)

    result = _data(
        await llm_config_tools.SaveSettingsTool().async_call(
            hass, _call("SaveSettings", settings={"mode": "calculate"}), None
        )
    )
    assert "full_controller" in result["result"]["saved"]
    saved = coordinator.async_update_config.await_args.args[0]
    assert saved["full_controller"] is False
    assert saved["direct_valve_control_enabled"] is False

    # The switches the mode replaced are not set one by one any more.
    refused = _data(
        await llm_config_tools.SaveSettingsTool().async_call(
            hass, _call("SaveSettings", settings={"full_controller": True}), None
        )
    )
    assert refused["success"] is False
    assert "mode" in refused["error"]


# --- programs


async def test_a_new_program_is_added_and_the_main_one_kept():
    coordinator = _coordinator()
    hass = _hass(coordinator)

    result = _data(
        await llm_config_tools.SaveProgramTool().async_call(
            hass, _call("SaveProgram", program={"name": "Evening"}), None
        )
    )

    programs = coordinator.store.config.programs
    assert [p["id"] for p in programs] == ["main", "evening"]
    assert result["result"]["programs"][1] == {"id": "evening", "name": "Evening"}


async def test_a_program_with_its_id_is_replaced_in_place():
    coordinator = _coordinator(
        programs=[
            {"id": "main", "main": True},
            {"id": "old", "name": "Old"},
            {"id": "other", "name": "Other"},
        ],
    )
    hass = _hass(coordinator)

    await llm_config_tools.SaveProgramTool().async_call(
        hass, _call("SaveProgram", program={"id": "old", "name": "Renamed"}), None
    )

    programs = coordinator.store.config.programs
    assert [p["id"] for p in programs] == ["main", "old", "other"]
    assert programs[1]["name"] == "Renamed"


async def test_a_program_naming_an_unknown_zone_is_refused():
    coordinator = _coordinator()
    hass = _hass(coordinator)

    result = _data(
        await llm_config_tools.SaveProgramTool().async_call(
            hass,
            _call(
                "SaveProgram", program={"name": "P", "steps": [{"zones": ["Roses"]}]}
            ),
            None,
        )
    )

    assert result["success"] is False
    coordinator.async_update_config.assert_not_awaited()


async def test_any_program_is_deleted_but_the_last_one():
    coordinator = _coordinator(programs=[{"id": "main"}, {"id": "p"}])
    hass = _hass(coordinator)

    deleted = _data(
        await llm_config_tools.DeleteProgramTool().async_call(
            hass, _call("DeleteProgram", program_id="main"), None
        )
    )
    refused = _data(
        await llm_config_tools.DeleteProgramTool().async_call(
            hass, _call("DeleteProgram", program_id="p"), None
        )
    )

    # The old main program goes like any other; the last one stays.
    assert deleted["success"] is True
    assert refused["success"] is False
    assert "last program" in refused["error"]
    assert [p["id"] for p in coordinator.store.config.programs] == ["p"]
