"""A program drawn as a timeline: what each zone does, second by second.

The program editor read as a list of settings, and what a run would actually
do (two zones together, passes with a soak between, a step started before the
one before it ends) had to be worked out by hand. The timeline walks the plan
the way the runner does, and ends on the total the schedules are placed with.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_status import ProgramStatusMixin
from custom_components.smart_irrigation.programs import (
    SEGMENT_FILL,
    SEGMENT_SOAK,
    SEGMENT_WATER,
    pass_count,
    plan_timeline,
    plan_wall_seconds,
)


def _member(zone_id, seconds, passes=1, lead=0.0):
    return {"zone_id": zone_id, "seconds": seconds, "passes": passes, "lead": lead}


def _step(*members, delay=0.0):
    return {"id": "s", "zones": list(members), "delay": delay}


def _kinds(timeline, zone_id):
    return [
        (s["kind"], s["start"], s["end"])
        for s in timeline["segments"]
        if s["zone_id"] == zone_id
    ]


# --- passes


def test_passes_come_down_until_each_is_worth_opening_a_valve():
    assert pass_count(6, 240) == 4
    assert pass_count(3, 600) == 3
    assert pass_count(3, 30) == 1
    assert pass_count(None, 600) == 1
    assert pass_count(99, 6000) == const.CONF_MAX_WATERING_PASSES


# --- the walk


def test_steps_follow_one_another_with_their_wait():
    plan = [[_step(_member(1, 300), delay=60), _step(_member(2, 120))]]

    timeline = plan_timeline(plan)

    assert _kinds(timeline, 1) == [(SEGMENT_WATER, 0, 300)]
    assert _kinds(timeline, 2) == [(SEGMENT_WATER, 360, 480)]
    assert timeline["total"] == 480 == plan_wall_seconds(plan)


def test_zones_of_one_step_water_together():
    plan = [[_step(_member(1, 300), _member(2, 120)), _step(_member(3, 60))]]

    timeline = plan_timeline(plan)

    assert _kinds(timeline, 2) == [(SEGMENT_WATER, 0, 120)]
    # The next step waits for the slowest zone.
    assert _kinds(timeline, 3)[0][1] == 300


def test_passes_fill_the_pipe_again_and_soak_between():
    plan = [[_step(_member(1, 630, passes=3, lead=30))]]

    timeline = plan_timeline(plan, soak_seconds=600)

    assert _kinds(timeline, 1) == [
        (SEGMENT_FILL, 0, 30),
        (SEGMENT_WATER, 30, 230),
        (SEGMENT_SOAK, 230, 830),
        (SEGMENT_FILL, 830, 860),
        (SEGMENT_WATER, 860, 1060),
        (SEGMENT_SOAK, 1060, 1660),
        (SEGMENT_FILL, 1660, 1690),
        (SEGMENT_WATER, 1690, 1890),
    ]
    assert timeline["total"] == pytest.approx(plan_wall_seconds(plan, 600))


def test_a_negative_delay_starts_the_next_step_early():
    plan = [[_step(_member(1, 300), delay=-60), _step(_member(2, 300))]]

    timeline = plan_timeline(plan)

    assert _kinds(timeline, 2) == [(SEGMENT_WATER, 240, 540)]
    assert timeline["total"] == plan_wall_seconds(plan)


def test_a_short_step_overlapped_by_a_shorter_one_still_ends_the_run_last():
    plan = [[_step(_member(1, 300), delay=-200), _step(_member(2, 60))]]

    timeline = plan_timeline(plan)

    assert _kinds(timeline, 2) == [(SEGMENT_WATER, 100, 160)]
    assert timeline["total"] == 300


def test_every_tour_comes_after_the_last():
    plan = [[_step(_member(1, 100))], [_step(_member(1, 100))]]

    timeline = plan_timeline(plan)

    assert [(s["tour"], s["start"]) for s in timeline["segments"]] == [
        (0, 0),
        (1, 100),
    ]


def test_nothing_to_water_draws_nothing():
    assert plan_timeline([]) == {"total": 0.0, "segments": []}


# --- the preview the editor asks for


class _Status(ProgramStatusMixin):
    def __init__(self, zones, **config):
        self.store = SimpleNamespace(
            config=SimpleNamespace(soak_minutes=0, **config),
            async_get_zones=AsyncMock(return_value=zones),
        )

    async def zones_as_planned(self, zones):
        return zones

    def program_adjustment(self, program_id, at=None):
        return None


def _zone(zone_id, name, duration=300, **extra):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: name,
        const.ZONE_DURATION: duration,
        const.ZONE_LINKED_ENTITY: f"switch.v{zone_id}",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        **extra,
    }


async def test_the_preview_cleans_and_draws_an_unsaved_program():
    status = _Status([_zone(1, "Lawn"), _zone(2, "Hedges", duration=120)])

    preview = await status.async_program_preview(
        {
            "name": "Evening",
            "steps": [
                {"zones": [1], "passes": 99},
                {"zones": ["2", 7], "mode": "fixed", "seconds": 60},
            ],
        }
    )

    program = preview["program"]
    assert program[const.PROGRAM_ID] == "evening"
    assert program[const.PROGRAM_STEPS][0][const.STEP_PASSES] == 6
    assert program[const.PROGRAM_STEPS][1][const.STEP_ZONES] == [2, 7]
    assert preview["unknown_zones"] == [7]
    assert preview["timeline"]["zones"] == [
        {"zone_id": 1, "zone": "Lawn"},
        {"zone_id": 2, "zone": "Hedges"},
    ]
    assert preview["timeline"]["total"] == 360


async def test_the_preview_names_the_zones_the_run_leaves_out():
    status = _Status(
        [
            _zone(1, "Lawn"),
            _zone(2, "Pots", **{const.ZONE_LINKED_ENTITY: None}),
            _zone(3, "Beds", **{const.ZONE_STATE: const.ZONE_STATE_DISABLED}),
        ]
    )

    preview = await status.async_program_preview(
        {"name": "P", "steps": [{"zones": [1, 2, 3]}]}
    )

    assert preview["zones_not_watered"] == [
        {"zone_id": 2, "zone": "Pots"},
        {"zone_id": 3, "zone": "Beds"},
    ]
    assert [z["zone_id"] for z in preview["timeline"]["zones"]] == [1]


async def test_the_converted_main_program_is_drawn_as_its_cycle_ran():
    from custom_components.smart_irrigation.program_migration import (
        classic_cycle_steps,
    )

    zones = [_zone(1, "Lawn"), _zone(2, "Hedges", duration=120)]
    status = _Status(zones)
    steps = classic_cycle_steps(
        {"zone_sequencing": "sequential", "pause_between_zones": 30}, zones
    )

    preview = await status.async_program_preview({"id": "main", "steps": steps})

    # One zone after the other, the pause between them: what the cycle did.
    assert const.PROGRAM_MAIN not in preview["program"]
    assert [
        (s["zone_id"], s["start"], s["end"]) for s in preview["timeline"]["segments"]
    ] == [(1, 0, 300), (2, 330, 450)]


async def test_a_step_may_name_its_zones():
    status = _Status([_zone(1, "Lawn"), _zone(2, "Hedges"), _zone(3, "Hedges")])

    preview = await status.async_program_preview(
        {"name": "P", "steps": [{"zones": [" lawn ", "Roses", "Hedges", "2"]}]}
    )

    # "Hedges" names two zones: which one is not guessed.
    assert preview["program"][const.PROGRAM_STEPS][0][const.STEP_ZONES] == [1, 2]
    assert preview["unknown_zone_names"] == ["Roses", "Hedges"]


async def test_a_preview_of_nothing_is_an_empty_program():
    preview = await _Status([]).async_program_preview(None)

    assert preview["timeline"]["segments"] == []


# --- a schedule at a bearing of the sun


def test_an_azimuth_schedule_keeps_its_bearing():
    from custom_components.smart_irrigation.schedules import normalize_schedule

    stored = normalize_schedule(
        {"type": "sun", "event": "azimuth", "azimuth": 450}, set()
    )
    assert stored["event"] == "azimuth"
    assert stored["azimuth"] == 90.0
    plain = normalize_schedule({"type": "sun", "event": "sunrise"}, set())
    assert "azimuth" not in plain


def test_an_azimuth_schedule_asks_the_sun_for_its_bearing():
    from datetime import UTC, date, datetime
    from zoneinfo import ZoneInfo

    from custom_components.smart_irrigation.schedules import target_on

    asked = []

    def sun(event, day):
        asked.append(event)
        return datetime(2026, 6, 1, 10, 0, tzinfo=UTC)

    moment = target_on(
        {"type": "sun", "event": "azimuth", "azimuth": 135.0, "offset_minutes": 5},
        date(2026, 6, 1),
        sun,
        ZoneInfo("Europe/Paris"),
    )
    assert asked == ["azimuth:135.0"]
    assert moment == datetime(2026, 6, 1, 10, 5, tzinfo=UTC)


def test_the_bearing_is_found_on_the_day():
    from datetime import date
    from types import SimpleNamespace

    from custom_components.smart_irrigation.program_scheduler import (
        ProgramSchedulerMixin,
    )

    host = SimpleNamespace(
        _effective_latitude=48.85,
        _effective_longitude=2.35,
        hass=SimpleNamespace(config=SimpleNamespace(latitude=0, longitude=0)),
    )
    found = ProgramSchedulerMixin._azimuth_moment(host, 180.0, date(2026, 6, 21))
    assert found is not None
    # Solar noon in Paris, in UTC: a little before noon.
    from datetime import UTC

    assert 11 <= found.astimezone(UTC).hour <= 12
