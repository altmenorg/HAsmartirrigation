"""The program sensor reads what the program does, in the user's language.

On rc2 the main program's sensor read "idle" through a whole run, while the
card said "running": the run of the main program is a cycle of zones, and the
sensor was not told when a cycle began or ended. A cycle of all zones at once
had no record at all, so the main program was idle even by the overview.

Its name, in German, was "Smart Irrigation Program Main program", and its
states were English. Both come from the translations now.
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
# The main program and one other, as the store keeps them.
PROGRAMS = [{"id": "main", "name": "Main program", "main": True}, _program([])]
STATES = {"idle", "waiting", "running", "paused", "suspended", "disabled"}


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


def _main_state(overview):
    return next(p["state"] for p in overview if p["main"])


# --- the state during a run of the main program ----------------------------------


@pytest.mark.parametrize("sequencing", ["sequential", "parallel"])
async def test_the_sensors_are_told_when_the_main_cycle_begins_and_ends(
    sleeps, sequencing
):
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
async def test_the_main_program_is_running_while_its_cycle_lasts(sleeps, sequencing):
    hass, coord = _status(PROGRAMS, sequencing=sequencing)
    coord.store.config.direct_valve_control_enabled = True
    seen = []

    async def _look():
        seen.append(_main_state(await coord.async_program_overview()))

    # Halfway through the first zone's run.
    sleeps.on(300, _look)

    await coord._run_direct_valves()

    assert seen == ["running"]
    assert _main_state(await coord.async_program_overview()) == "idle"


# --- the name and the states ------------------------------------------------------


class _Sensor(SmartIrrigationProgramSensor):
    device_info = None


def _overview(program_id, name, main):
    return {"program_id": program_id, "name": name, "main": main, "state": "running"}


@pytest.mark.parametrize(
    ("language", "main", "evening"),
    [
        ("en", "Main program", "Program Evening"),
        ("de", "Hauptprogramm", "Programm Evening"),
    ],
)
async def test_the_names_are_translated_and_the_ids_stay(hass, language, main, evening):
    hass.config.language = language
    platform = MockEntityPlatform(hass, domain="sensor", platform_name=const.DOMAIN)
    await platform.platform_data.async_load_translations()
    sensors = [
        _Sensor(hass, _overview("main", "Main program", True)),
        _Sensor(hass, _overview("evening", "Evening", False)),
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
    sensor = _Sensor(hass, _overview("evening", "Evening", False))
    await platform.async_add_entities([sensor])

    sensor.set_overview(_overview("evening", "Night", False))
    await hass.async_block_till_done()

    state = hass.states.get("sensor.smart_irrigation_program_evening")
    assert state.attributes["friendly_name"] == "Program Night"


@pytest.mark.parametrize("language", ["en", "de"])
def test_every_state_has_a_word(language):
    sensor = json.loads((TRANSLATIONS / f"{language}.json").read_text("utf-8"))[
        "entity"
    ]["sensor"]
    for key in ("program", "program_main"):
        assert set(sensor[key]["state"]) == STATES, key
        assert all(sensor[key]["state"].values()), key
    assert "{name}" in sensor["program"]["name"]


def test_german_does_not_say_inactive_for_a_program_that_waits_its_turn():
    sensor = json.loads((TRANSLATIONS / "de.json").read_text("utf-8"))["entity"][
        "sensor"
    ]
    assert sensor["program_main"]["state"]["idle"] == "Bereit"
