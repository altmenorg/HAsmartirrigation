"""A pause says what it holds and when it lifts itself.

UX walk of 9 Nov., evening: Start said only "Watering paused", Planning
"Paused", and the zone its resting state. Nothing said which zone the pause had
interrupted, what it still owed, or that the watering goes on by itself after
an hour.
"""

import asyncio
import json
from datetime import timedelta
from pathlib import Path

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation.watering_control import DEFAULT_PAUSE_MINUTES
from tests.test_paused_owed_survives_reload import (  # noqa: F401
    _pause_then_reload,
    _settle,
    _setup,
)
from tests.test_watering_control import _silence_dispatcher  # noqa: F401

LANGUAGES = (
    Path(__file__).parent.parent
    / "custom_components"
    / "smart_irrigation"
    / "frontend"
    / "localize"
    / "languages"
)


async def _stop(coord, program):
    tasks = coord.async_teardown_valve_runs()
    program.cancel()
    await asyncio.gather(program, *tasks, return_exceptions=True)


async def test_the_live_state_says_what_the_pause_holds(monkeypatch, freezer):
    hass, coord = _setup(monkeypatch)
    program = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    freezer.tick(9)
    live = coord.async_live_state()
    assert live["paused_until"] is None
    assert live["held"] == []

    await coord.async_pause_watering(3)
    await _settle()

    live = coord.async_live_state()
    assert live["paused"] is True
    until = dt_util.parse_datetime(live["paused_until"])
    assert until == pytest.approx(
        dt_util.utcnow() + timedelta(minutes=3), abs=timedelta(seconds=1)
    )
    # Both zones of the step were 9 s into their 20 s: 11 s owed, 45 % done.
    assert [(v["zone_id"], v["remaining_seconds"], v["percent"]) for v in live["held"]] == [
        (0, 11, 45),
        (1, 11, 45),
    ]
    assert all(v["zone"] for v in live["held"])
    # Closed: they are not among the open valves.
    assert live["valves"] == []

    await coord.async_resume_watering()
    await _settle()
    live = coord.async_live_state()
    assert live["paused"] is False
    assert live["paused_until"] is None
    assert live["held"] == []
    await _stop(coord, program)


async def test_a_pause_without_minutes_says_its_hour(monkeypatch, freezer):
    hass, coord = _setup(monkeypatch)
    program = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()

    await coord.async_pause_watering()
    await _settle()

    until = dt_util.parse_datetime(coord.async_live_state()["paused_until"])
    assert until == pytest.approx(
        dt_util.utcnow() + timedelta(minutes=DEFAULT_PAUSE_MINUTES),
        abs=timedelta(seconds=1),
    )
    await _stop(coord, program)


async def test_a_stop_during_the_pause_leaves_nothing_held(monkeypatch, freezer):
    hass, coord = _setup(monkeypatch)
    program = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    freezer.tick(9)
    await coord.async_pause_watering(3)
    await _settle()
    assert coord.async_live_state()["held"]

    await coord.async_stop_watering()
    await _settle()

    live = coord.async_live_state()
    assert live["held"] == []
    assert live["paused_until"] is None
    await _stop(coord, program)


async def test_a_pause_restored_after_a_reload_says_the_same(monkeypatch, freezer):
    hass, coord = _setup(monkeypatch)
    reloaded = await _pause_then_reload(hass, coord, freezer, minutes=3)

    await reloaded.async_restore_pause_and_queue()
    await reloaded.async_resume_valve_runs()
    await _settle()

    live = reloaded.async_live_state()
    assert live["paused"] is True
    until = dt_util.parse_datetime(live["paused_until"])
    assert until == pytest.approx(
        dt_util.utcnow() + timedelta(minutes=3), abs=timedelta(seconds=2)
    )
    # What the pause owed the two zones comes back with it.
    assert [(v["zone_id"], v["remaining_seconds"]) for v in live["held"]] == [
        (0, 11),
        (1, 11),
    ]
    tasks = reloaded.async_teardown_valve_runs()
    await asyncio.gather(*tasks, return_exceptions=True)


@pytest.mark.parametrize("lang", ["en", "de"])
def test_the_texts_say_when_it_goes_on(lang):
    texts = json.loads((LANGUAGES / f"{lang}.json").read_text(encoding="utf-8"))
    for text in (
        texts["planning"]["paused_until"],
        texts["panels"]["info"]["cards"]["running"]["paused-until"],
    ):
        assert "{when}" in text
    assert "{when}" in texts["card"]["programs"]["until"]
