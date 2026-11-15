"""The program sensor reads what the program does, in the user's language.

On rc2 a sensor read "idle" through a whole cycle of zones, while the card
said "running": nothing was told when a cycle began or ended. The cycle is now
the one-off run of every zone ("irrigate all zones now"), which is no program,
and the live state still says when it runs.

The names and the states come from the translations, in the user's language.
"""

import json
from pathlib import Path

import pytest
from pytest_homeassistant_custom_component.common import MockEntityPlatform

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_sensor import (
    SmartIrrigationProgramSensor,
)
from tests.runner_doubles import Sleeps
from tests.test_program_status import _program, _status

TRANSLATIONS = (
    Path(__file__).parent.parent
    / "custom_components"
    / "smart_irrigation"
    / "translations"
)
# The old main program, converted, and one other, as the store keeps them.
PROGRAMS = [{"id": "main", "name": "Watering", "steps": []}, _program([])]
STATES = {"idle", "waiting", "running", "paused", "suspended"}


@pytest.fixture(autouse=True)
def _quiet(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


@pytest.fixture
def sleeps(monkeypatch):
    recorder = Sleeps()
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", recorder
    )
    return recorder


def _state(overview, program_id):
    return next(p["state"] for p in overview if p["program_id"] == program_id)


# --- the state during a run of every zone ----------------------------------------


@pytest.mark.parametrize("sequencing", ["sequential", "parallel"])
async def test_the_sensors_are_told_when_the_cycle_begins_and_ends(sleeps, sequencing):
    hass, coord = _status(PROGRAMS, sequencing=sequencing)
    coord.store.config.direct_valve_control_enabled = True
    told = []
    coord._notify_programs = lambda: told.append(coord.async_live_state()["cycle"])

    await coord._run_direct_valves()

    # Told once with the cycle under way, and once after it.
    assert told[0] is True
    assert told[-1] is False
    assert coord.async_live_state()["cycle"] is False


@pytest.mark.parametrize("sequencing", ["sequential", "parallel"])
async def test_a_run_of_every_zone_is_no_program(sleeps, sequencing):
    hass, coord = _status(PROGRAMS, sequencing=sequencing)
    coord.store.config.direct_valve_control_enabled = True
    seen = []

    async def _look():
        seen.append(
            (
                _state(await coord.async_program_overview(), "main"),
                coord.async_live_state()["cycle"],
            )
        )

    # Halfway through the first zone's run.
    sleeps.on(300, _look)

    await coord._run_direct_valves()

    # The live state says a cycle runs; the program "main" is not it.
    assert seen == [("idle", True)]
    assert _state(await coord.async_program_overview(), "main") == "idle"


# --- the name and the states ------------------------------------------------------


class _Sensor(SmartIrrigationProgramSensor):
    device_info = None


def _overview(program_id, name):
    return {"program_id": program_id, "name": name, "state": "running"}


@pytest.mark.parametrize(
    ("language", "main", "evening"),
    [
        ("en", "Program Watering", "Program Evening"),
        ("de", "Programm Watering", "Programm Evening"),
    ],
)
async def test_the_names_are_translated_and_the_ids_stay(hass, language, main, evening):
    hass.config.language = language
    platform = MockEntityPlatform(hass, domain="sensor", platform_name=const.DOMAIN)
    await platform.platform_data.async_load_translations()
    sensors = [
        _Sensor(hass, _overview("main", "Watering")),
        _Sensor(hass, _overview("evening", "Evening")),
    ]

    await platform.async_add_entities(sensors)

    names = {
        entity_id: hass.states.get(entity_id).attributes["friendly_name"]
        for entity_id in (
            "sensor.smart_irrigation_program_main",
            "sensor.smart_irrigation_program_evening",
        )
    }
    assert names == {
        "sensor.smart_irrigation_program_main": main,
        "sensor.smart_irrigation_program_evening": evening,
    }
    # The state stays the key; Home Assistant shows its translation.
    assert hass.states.get("sensor.smart_irrigation_program_main").state == "running"


async def test_a_renamed_program_is_renamed(hass):
    platform = MockEntityPlatform(hass, domain="sensor", platform_name=const.DOMAIN)
    await platform.platform_data.async_load_translations()
    sensor = _Sensor(hass, _overview("evening", "Evening"))
    await platform.async_add_entities([sensor])

    sensor.set_overview(_overview("evening", "Night"))
    await hass.async_block_till_done()

    state = hass.states.get("sensor.smart_irrigation_program_evening")
    assert state.attributes["friendly_name"] == "Program Night"


@pytest.mark.parametrize("language", ["en", "de"])
def test_every_state_has_a_word(language):
    sensor = json.loads((TRANSLATIONS / f"{language}.json").read_text("utf-8"))[
        "entity"
    ]["sensor"]
    assert set(sensor["program"]["state"]) == STATES
    assert all(sensor["program"]["state"].values())
    assert "{name}" in sensor["program"]["name"]
    # Every program is named alike: no main program has a name of its own.
    assert "program_main" not in sensor


def test_german_does_not_say_inactive_for_a_program_that_waits_its_turn():
    sensor = json.loads((TRANSLATIONS / "de.json").read_text("utf-8"))["entity"][
        "sensor"
    ]
    assert sensor["program"]["state"]["idle"] == "Bereit"
