"""The sensor of a program shows what the coordinator published, and only that."""

from unittest.mock import MagicMock

from custom_components.smart_irrigation.program_sensor import (
    SmartIrrigationProgramSensor,
)


def _overview(**overrides):
    data = {
        "program_id": "evening",
        "name": "Evening",
        "main": False,
        "state": "idle",
        "next_start": "2026-06-01T04:00:00+00:00",
        "last_run": None,
        "suspended_until": None,
        "live": None,
    }
    data.update(overrides)
    return data


def _sensor(overview):
    return SmartIrrigationProgramSensor(MagicMock(), overview)


def test_it_is_named_and_identified_by_the_program():
    sensor = _sensor(_overview())

    assert sensor.name == "Program Evening"
    assert sensor.unique_id == "smart_irrigation_program_evening"
    assert sensor.entity_id == "sensor.smart_irrigation_program_evening"


def test_the_state_and_the_next_start():
    sensor = _sensor(_overview())

    assert sensor.native_value == "idle"
    assert sensor.extra_state_attributes["next_start"] == "2026-06-01T04:00:00+00:00"
    assert "step" not in sensor.extra_state_attributes


def test_a_running_program_shows_where_it_is():
    sensor = _sensor(
        _overview(
            state="running",
            live={
                "tour": 1,
                "tours": 2,
                "step": 2,
                "steps": 3,
                "percent": 40,
                "remaining_seconds": 300,
                "manual": False,
            },
        )
    )

    attributes = sensor.extra_state_attributes
    assert sensor.native_value == "running"
    assert (attributes["step"], attributes["steps"], attributes["percent"]) == (
        2,
        3,
        40,
    )
    assert attributes["remaining_seconds"] == 300


def test_it_writes_its_state_only_when_something_changed():
    sensor = _sensor(_overview())
    sensor.hass = MagicMock()
    sensor.async_write_ha_state = MagicMock()

    sensor.set_overview(_overview())
    sensor.async_write_ha_state.assert_not_called()

    sensor.set_overview(_overview(state="running"))
    sensor.async_write_ha_state.assert_called_once()
    assert sensor.native_value == "running"
