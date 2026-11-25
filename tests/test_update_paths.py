"""Updating a real installation: the whole setup on what an older version stored.

The bugs of #1046 were found by hand, updating a 10.10 install inside its
watering window: the move to the one choice was undone at the first start, the
10.10 start trigger was armed, and a run begun during the start held Home
Assistant's start up. Each part had its tests; what was missing was the setup
as a whole on a store that an older version wrote.

The fixtures are such stores, from one test install:

- ``storage_v2026_10_10.json``: 10.10, four zones (one manual, one disabled),
  valves switched by Smart Irrigation, "done by sunrise" as the active start
  trigger and a second time trigger defined but not active, "clear weather
  data" on (its default then), and engines left from deleted zones;
- ``storage_v2026_11_1.json``: the same after 11.1 had loaded it;
- ``entity_unique_ids_v2026_11_1.json``: the entities 11.1 made of it.

The integration is set up on each, while Home Assistant is still starting, as
at a real boot, and once more, as at the next restart.
"""

import asyncio
import copy
import json
import logging
from pathlib import Path
from unittest.mock import patch

import pytest
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.deprecated_actions import (
    ISSUE_STORED_RECURRING,
)
from custom_components.smart_irrigation.store import STORAGE_KEY

FIXTURES = Path(__file__).parent / "fixtures"


def _stored(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


@pytest.fixture(autouse=True)
def _no_panel(hass: HomeAssistant):
    """The panel needs the frontend; what is tested here is the setup.

    ``panel_custom``, a dependency, sets the frontend up, which needs the
    ``hass_frontend`` package: not installed in CI. Counted as set up, it is
    skipped, and the panel is not registered.
    """
    hass.config.components.add("panel_custom")
    with (
        patch("custom_components.smart_irrigation.async_register_panel"),
        patch("custom_components.smart_irrigation.remove_panel"),
    ):
        yield


async def _set_up(hass: HomeAssistant, hass_storage, document=None):
    """Set Smart Irrigation up on ``document``, while Home Assistant starts."""
    if document is not None:
        hass_storage[STORAGE_KEY] = copy.deepcopy(document)
    entries = hass.config_entries.async_entries(const.DOMAIN)
    if entries:
        entry = entries[0]
    else:
        entry = MockConfigEntry(
            domain=const.DOMAIN,
            data={
                const.CONF_INSTANCE_NAME: "Smart Irrigation",
                "use_weather_service": False,
            },
            unique_id="Smart Irrigation",
            title="Smart Irrigation",
        )
        entry.add_to_hass(hass)
    hass.set_state(CoreState.not_running)
    assert await hass.config_entries.async_setup(entry.entry_id)
    # What the start waits for (bootstrap): nothing of ours may hold it up.
    await asyncio.wait_for(hass.async_block_till_done(), 30)
    hass.set_state(CoreState.running)
    return entry, hass.data[const.DOMAIN]["coordinator"]


async def _unload(hass: HomeAssistant, entry) -> None:
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()


@pytest.mark.parametrize(
    "fixture", ["storage_v2026_10_10.json", "storage_v2026_11_1.json"]
)
async def test_an_install_that_watered_moves_over_once_and_keeps_its_moment(
    hass: HomeAssistant, hass_storage, fixture, caplog
):
    caplog.set_level(logging.INFO, logger="custom_components.smart_irrigation")
    entry, coordinator = await _set_up(hass, hass_storage, _stored(fixture))
    config = coordinator.store.config

    # The move sticks, in memory: nothing written back undoes it (#1046).
    assert getattr(config, const.CONF_FULL_CONTROLLER) is True
    assert coordinator.schedules_start_watering() is True
    assert not coordinator.start_trigger_armed
    # One program, the zones in their order, watering at the same moment.
    [program] = config.programs
    assert [step["zones"] for step in program["steps"]] == [[0], [1], [2], [3]]
    sun, evening = program["schedules"]
    assert (sun["type"], sun["event"], sun["anchor"], sun["enabled"]) == (
        "sun",
        "sunrise",
        "end",
        True,
    )
    # The trigger that was defined but not active comes along, switched off.
    assert (evening["type"], evening["time"], evening["enabled"]) == (
        "time",
        "20:30",
        False,
    )
    assert any(
        key.startswith(f"{program['id']}:") for key in coordinator._program_timers()
    )

    # The next restart finds it moved, and does not move it again.
    await _unload(hass, entry)
    caplog.clear()
    entry, coordinator = await _set_up(hass, hass_storage)
    assert "Moved to the single setting" not in caplog.text
    assert len(coordinator.store.config.programs) == 1
    assert coordinator.schedules_start_watering() is True
    await _unload(hass, entry)


async def test_an_install_that_only_calculated_still_fires_its_event(
    hass: HomeAssistant, hass_storage, freezer
):
    """Most installs let Smart Irrigation calculate and switch the valves with
    an automation of their own, on the start event: that goes on unchanged."""
    document = _stored("storage_v2026_11_1.json")
    config = document["data"]["config"]
    config["direct_valve_control_enabled"] = False
    for trigger in config["irrigation_start_triggers"]:
        if trigger["name"] == "Abends":
            trigger["at"] = "21:26"
    config["active_start_trigger"] = "Abends"
    await hass.config.async_set_time_zone("Europe/Berlin")
    freezer.move_to("2026-11-23 20:20:00+00:00")  # 21:20 in Berlin
    events = []
    hass.bus.async_listen(
        "smart_irrigation_start_irrigation_all_zones",
        lambda event: events.append(event),
    )

    entry, coordinator = await _set_up(hass, hass_storage, document)

    assert getattr(coordinator.store.config, const.CONF_FULL_CONTROLLER) is False
    assert coordinator.store.config.programs in (None, [])
    assert coordinator.start_trigger_armed
    freezer.move_to("2026-11-23 20:26:01+00:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert [event.data["trigger_name"] for event in events] == ["Abends"]
    await _unload(hass, entry)


async def test_the_entities_of_11_1_are_all_still_there(
    hass: HomeAssistant, hass_storage
):
    """Automations and dashboards name entities: none of 11.1's may go."""
    entry, _coordinator = await _set_up(
        hass, hass_storage, _stored("storage_v2026_11_1.json")
    )
    registry = er.async_get(hass)
    now = {
        entity.unique_id
        for entity in er.async_entries_for_config_entry(registry, entry.entry_id)
    }

    assert set(_stored("entity_unique_ids_v2026_11_1.json")) <= now
    await _unload(hass, entry)


async def test_after_a_reload_a_recurring_schedule_runs_once(
    hass: HomeAssistant, hass_storage, freezer
):
    """The 11.1 install has a daily calculation at 22:00. Reloading the entry
    (a change in the options does) left the old timers running beside the new
    ones: it ran once more per reload."""
    await hass.config.async_set_time_zone("Europe/Berlin")
    freezer.move_to("2026-11-23 20:50:00+00:00")  # 21:50 in Berlin
    events = []
    hass.bus.async_listen(
        f"{const.DOMAIN}_{const.EVENT_RECURRING_SCHEDULE_TRIGGERED}",
        lambda event: events.append(event.data["schedule_name"]),
    )
    entry, _coordinator = await _set_up(
        hass, hass_storage, _stored("storage_v2026_11_1.json")
    )
    await _unload(hass, entry)
    entry, _coordinator = await _set_up(hass, hass_storage)

    freezer.move_to("2026-11-23 21:00:00+00:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert events == ["Tägliche Berechnung"]
    await _unload(hass, entry)


@pytest.mark.parametrize(
    "fixture", ["storage_v2026_10_10.json", "storage_v2026_11_1.json"]
)
async def test_a_recurring_schedule_that_watered_every_zone_still_waters(
    hass: HomeAssistant, hass_storage, fixture, freezer
):
    """Before the move, with the valves switched by Smart Irrigation, a
    recurring schedule irrigating every zone opened them through the start
    trigger's path. After it, that path only fires the event: such a schedule
    watered nothing any more, and nothing said so."""
    document = _stored(fixture)
    for recurring in document["data"]["config"]["recurring_schedules"]:
        if recurring["name"] == "Gemüse Mo/Mi/Fr":
            recurring["zones"] = "all"
    await hass.config.async_set_time_zone("Europe/Berlin")
    freezer.move_to("2026-11-23 06:00:00+00:00")  # Monday, 07:00 in Berlin

    entry, coordinator = await _set_up(hass, hass_storage, document)
    fired = []

    async def fire(program_id, schedule_id, target):
        fired.append(dt_util.as_local(target).strftime("%a %H:%M"))

    coordinator._fire_program_schedule = fire

    [program] = coordinator.store.config.programs
    *_, weekly = program["schedules"]
    assert (weekly["type"], weekly["time"], weekly["weekdays"]) == (
        "time",
        "07:30",
        [0, 2, 4],
    )
    assert weekly["enabled"] is True
    # Monday 07:30: the program starts, as the recurring schedule did.
    freezer.move_to("2026-11-23 06:30:01+00:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert fired == ["Mon 07:30"]
    stored = {
        r["name"]: r.get("enabled", True)
        for r in coordinator.store.config.recurring_schedules
    }
    assert stored == {"Gemüse Mo/Mi/Fr": False, "Tägliche Berechnung": True}
    # The one still running is named on the Repairs page.
    issue = ir.async_get(hass).async_get_issue(const.DOMAIN, ISSUE_STORED_RECURRING)
    assert issue.translation_placeholders["schedules"] == "- Tägliche Berechnung"
    await _unload(hass, entry)


async def test_the_recurring_schedules_that_still_run_are_named_until_none_is_left(
    hass: HomeAssistant, hass_storage
):
    """They are shown nowhere in the panel: a notice names them, and goes
    with the last one."""
    entry, coordinator = await _set_up(
        hass, hass_storage, _stored("storage_v2026_11_1.json")
    )
    issues = ir.async_get(hass)
    issue = issues.async_get_issue(const.DOMAIN, ISSUE_STORED_RECURRING)
    assert issue.translation_placeholders["schedules"] == (
        "- Gemüse Mo/Mi/Fr\n- Tägliche Berechnung"
    )

    manager = coordinator.recurring_schedule_manager
    await manager.async_delete_schedule("schedule_18c62af5")
    issue = issues.async_get_issue(const.DOMAIN, ISSUE_STORED_RECURRING)
    assert issue.translation_placeholders["schedules"] == "- Tägliche Berechnung"
    await manager.async_update_schedule("schedule_b4dbe601", {"enabled": False})
    assert issues.async_get_issue(const.DOMAIN, ISSUE_STORED_RECURRING) is None
    await _unload(hass, entry)
