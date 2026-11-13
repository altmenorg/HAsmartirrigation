"""The planning in the order the runs will water (UX walk of 13 Nov.).

- Q1: the main program (start trigger) and "Morgens" (its own schedule), both
  "done by sunrise", stood side by side at 07:18-07:22. Programs never run at
  once: the second waits and finishes after sunrise, and the zones both water
  get their water twice that morning. Nothing said so.
- Q10: the trigger starts the main program every day; the planning listed it
  once under a heading of three days.
"""

import json
from datetime import UTC, datetime, timedelta
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import const, websockets
from custom_components.smart_irrigation.planning_sequence import sequence_planning
from tests.test_program_status import (
    _paris_clock,  # noqa: F401
    _status,
    _utc,
)

LANGUAGES = (
    Path(__file__).parent.parent
    / "custom_components"
    / "smart_irrigation"
    / "frontend"
    / "localize"
    / "languages"
)


def _run(program, start, seconds, zones, **extra):
    begin = datetime.fromisoformat(start)
    return {
        "program_id": program.lower(),
        "program": program,
        "start": begin.isoformat(),
        "end": (begin + timedelta(seconds=seconds)).isoformat(),
        "steps": [
            {"zones": [{"zone_id": zone_id, "zone": name} for zone_id, name in zones]}
        ],
        "nothing_to_water": False,
        "skipped_reason": None,
        **extra,
    }


LAWN, HEDGES, BALCONY = (0, "Lawn"), (1, "Hedges"), (2, "Balcony")


def test_a_run_due_while_another_waters_waits_and_says_what_it_waters_twice():
    main = _run("Main", "2026-11-14T06:18:00+00:00", 240, [LAWN, HEDGES, BALCONY])
    morning = _run("Morgens", "2026-11-14T06:18:00+00:00", 240, [HEDGES, BALCONY])

    first, second = sequence_planning([morning, main])

    assert first["waits_for"] is None
    assert second["waits_for"]["program"] == first["program"]
    assert second["expected_start"] == "2026-11-14T06:22:00+00:00"
    assert second["expected_end"] == "2026-11-14T06:26:00+00:00"
    twice = {entry["zone"] for entry in second["watered_twice"]}
    assert twice == {"Hedges", "Balcony"}


def test_runs_that_do_not_meet_are_left_where_they_are():
    morning = _run("Morgens", "2026-11-14T05:00:00+00:00", 300, [HEDGES])
    evening = _run("Abend", "2026-11-14T19:30:00+00:00", 300, [HEDGES])

    for item in sequence_planning([evening, morning]):
        assert item["waits_for"] is None
        assert item["expected_start"] == item["start"]
        assert item["watered_twice"] == []


def test_a_wait_behind_other_zones_waters_nothing_twice():
    a = _run("A", "2026-11-14T05:00:00+00:00", 600, [LAWN])
    b = _run("B", "2026-11-14T05:05:00+00:00", 300, [HEDGES])

    _, second = sequence_planning([a, b])

    assert second["waits_for"]["program"] == "A"
    assert second["expected_start"] == "2026-11-14T05:10:00+00:00"
    assert second["watered_twice"] == []


def test_waits_add_up_along_a_morning():
    a = _run("A", "2026-11-14T05:00:00+00:00", 600, [LAWN])
    b = _run("B", "2026-11-14T05:00:00+00:00", 600, [HEDGES])
    c = _run("C", "2026-11-14T05:05:00+00:00", 600, [LAWN])

    _, second, third = sequence_planning([a, b, c])

    assert second["expected_start"] == "2026-11-14T05:10:00+00:00"
    assert third["waits_for"]["program"] == "B"
    assert third["expected_start"] == "2026-11-14T05:20:00+00:00"
    # Lawn was watered by A, which is still among the runs ahead of C.
    assert [entry["zone"] for entry in third["watered_twice"]] == ["Lawn"]


def test_a_run_held_back_or_with_nothing_to_water_holds_nothing_back():
    rained_off = _run(
        "A", "2026-11-14T05:00:00+00:00", 600, [LAWN], skipped_reason="precipitation"
    )
    empty = _run("B", "2026-11-14T05:00:00+00:00", 0, [], nothing_to_water=True)
    after = _run("C", "2026-11-14T05:01:00+00:00", 600, [LAWN])

    *_, last = sequence_planning([rained_off, empty, after])

    assert last["program"] == "C"
    assert last["waits_for"] is None


def test_the_order_is_by_moment_whatever_the_time_zone():
    utc = _run("Utc", "2026-11-14T05:00:00+00:00", 60, [LAWN])
    local = _run("Local", "2026-11-14T05:54:30+01:00", 60, [HEDGES])

    assert [item["program"] for item in sequence_planning([utc, local])] == [
        "Local",
        "Utc",
    ]


_MAIN = {"id": "main", "name": "Main program", "main": True, "enabled": True}


async def test_the_main_program_is_planned_on_every_day_the_trigger_starts_it():
    hass, coord = _status([_MAIN])
    coord._planned_run_seconds = AsyncMock(return_value=600)
    starts = [_utc(1, 6), _utc(2, 6), _utc(3, 6)]

    planned = await coord.async_planning(3, trigger_starts=starts)

    assert [p["start"] for p in planned] == [s.isoformat() for s in starts]
    assert {p["program_id"] for p in planned} == {"main"}


async def test_a_trigger_start_beyond_the_window_is_left_out():
    hass, coord = _status([_MAIN])
    coord._planned_run_seconds = AsyncMock(return_value=600)

    planned = await coord.async_planning(1, trigger_starts=[_utc(1, 6), _utc(5, 6)])

    assert [p["start"] for p in planned] == [_utc(1, 6).isoformat()]


def test_a_clock_trigger_comes_back_at_the_same_time_of_day():
    start = datetime(2026, 11, 14, 5, 0, tzinfo=UTC)

    following = websockets._following_trigger_start(
        None, None, {}, {"trigger_base": const.TRIGGER_TYPE_TIME}, start
    )

    assert following == start + timedelta(days=1)


def test_without_sun_data_the_next_days_keep_the_time_of_day():
    hass = MagicMock()
    hass.states.get.return_value = None
    start = datetime(2026, 11, 14, 5, 0, tzinfo=UTC)

    following = websockets._following_trigger_start(
        hass, None, {}, {"trigger_base": "sunrise"}, start
    )

    assert following == start + timedelta(days=1)


def test_a_sunrise_start_keeps_its_distance_to_sunrise():
    sunrises = [
        datetime(2026, 11, 14, 6, 30, tzinfo=UTC),
        datetime(2026, 11, 15, 6, 32, tzinfo=UTC),
    ]

    def next_sunrise(hass, event, after):
        assert event == "sunrise"
        return next(s for s in sunrises if s > after)

    start = sunrises[0] - timedelta(minutes=10)  # done by sunrise, 10 min run
    with patch.object(websockets, "get_astral_event_next", side_effect=next_sunrise):
        following = websockets._following_trigger_start(
            MagicMock(), None, {}, {"trigger_base": "sunrise"}, start
        )

    assert following == sunrises[1] - timedelta(minutes=10)


def test_an_unknown_trigger_is_not_guessed():
    start = datetime(2026, 11, 14, 5, 0, tzinfo=UTC)
    assert (
        websockets._following_trigger_start(
            None, None, {}, {"trigger_base": "something else"}, start
        )
        is None
    )


async def test_the_trigger_starts_run_over_the_days_asked_for(freezer):
    freezer.move_to("2026-11-13T20:00:00+00:00")
    first = datetime(2026, 11, 14, 5, 54, tzinfo=UTC)
    coordinator = AsyncMock()
    coordinator.store.async_get_config = AsyncMock(return_value={})

    with patch.object(
        websockets,
        "_trigger_start_and_info",
        AsyncMock(return_value=(first, {"trigger_base": const.TRIGGER_TYPE_TIME})),
    ):
        starts = await websockets._trigger_starts(None, coordinator, 3)

    assert starts == [first + timedelta(days=n) for n in range(3)]


TEXTS = {
    ("planning", "waits_for"): {"{program}", "{start}", "{end}"},
    ("planning", "watered_twice"): {"{zones}", "{program}"},
    ("panels", "info", "cards", "next-run", "next-runs"): set(),
    ("panels", "info", "cards", "next-run", "run-waits"): {
        "{program}",
        "{start}",
        "{end}",
    },
    ("panels", "info", "cards", "next-run", "run-skipped"): set(),
    ("panels", "info", "cards", "next-run", "run-twice"): {"{zones}"},
    ("panels", "info", "cards", "decision", "title-main"): set(),
}


@pytest.mark.parametrize("lang", ["en", "de"])
@pytest.mark.parametrize(("key", "placeholders"), TEXTS.items())
def test_each_text_is_there_with_its_placeholders(lang, key, placeholders):
    node = json.loads((LANGUAGES / f"{lang}.json").read_text(encoding="utf-8"))
    for part in key:
        node = node[part]
    assert node
    for placeholder in placeholders:
        assert placeholder in node
