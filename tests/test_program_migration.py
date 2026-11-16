"""The main program converted, once, into an ordinary program (program_migration).

The main program had no steps and watered every zone with a valve through a
cycle of its own. Converted, it keeps its id and waters exactly as the cycle
did: the same zones, in the same order, for the same durations, with the same
pause between zones and the same passes. The runs below are made both ways on
the same zones and compared second by second.
"""

import asyncio

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.one_choice import migration_changes
from custom_components.smart_irrigation.program_migration import (
    classic_cycle_steps,
    conversion_changes,
)
from custom_components.smart_irrigation.programs import normalize_programs
from tests.runner_doubles import Coordinator, make_hass, make_store, zone
from tests.test_program_overlap import Clock

DONE_BY_SUNRISE = {
    "id": "schedule_1",
    "type": "sun",
    "event": "sunrise",
    "anchor": "end",
    "offset_minutes": 0,
    "weather": True,
}


def _main(**overrides):
    data = {
        "id": "main",
        "name": "Main program",
        "enabled": True,
        "main": True,
        "schedules": [DONE_BY_SUNRISE],
    }
    data.update(overrides)
    return data


def _zones():
    return [
        zone(2, **{const.ZONE_DURATION: 240, const.ZONE_LEAD_TIME: 20}),
        zone(0, **{const.ZONE_DURATION: 600}),
        # No valve: the cycle never watered it, nor does the program.
        zone(5, **{const.ZONE_LINKED_ENTITY: None}),
        zone(1, **{const.ZONE_DURATION: 360, const.ZONE_LEAD_TIME: 10}),
    ]


def _config(**settings):
    return {
        const.CONF_ZONE_SEQUENCING: "sequential",
        const.CONF_WATERING_PASSES: 1,
        const.CONF_PAUSE_BETWEEN_ZONES: 0,
        const.CONF_PROGRAMS: [_main()],
        **settings,
    }


# --- the rule -------------------------------------------------------------------------


def test_sequential_is_one_step_per_zone_in_the_cycles_order():
    changes = conversion_changes(
        _config(**{const.CONF_PAUSE_BETWEEN_ZONES: 45, const.CONF_WATERING_PASSES: 3}),
        _zones(),
        "en",
    )

    [program] = changes[const.CONF_PROGRAMS]
    assert program["id"] == "main"
    assert "main" not in program and "enabled" not in program
    steps = program["steps"]
    # The order the cycle took (the stored order), the zone without a valve out.
    assert [s["zones"] for s in steps] == [[2], [0], [1]]
    # The pause between zones after each, none after the last.
    assert [s["delay"] for s in steps] == [45.0, 45.0, None]
    assert {s["passes"] for s in steps} == {3}
    assert {s["mode"] for s in steps} == {"calculated"}
    assert program["tours"] == 1
    assert changes[const.CONF_MAIN_PROGRAM_CONVERTED] is True


def test_parallel_is_one_step_with_every_zone():
    changes = conversion_changes(
        _config(**{const.CONF_ZONE_SEQUENCING: "parallel"}), _zones(), "en"
    )

    [program] = changes[const.CONF_PROGRAMS]
    [step] = program["steps"]
    assert step["zones"] == [2, 0, 1]
    assert step["delay"] is None


def test_its_schedules_notifications_and_marks_are_kept():
    notify = {"targets": ["notify.phone"], "when": "finish"}
    changes = conversion_changes(
        _config(**{const.CONF_PROGRAMS: [_main(notify=notify), {"id": "evening"}]}),
        _zones(),
        "en",
    )

    main, evening = changes[const.CONF_PROGRAMS]
    assert main["schedules"][0]["id"] == "schedule_1"
    assert main["schedules"][0]["anchor"] == "end"
    assert main["notify"]["targets"] == ["notify.phone"]
    # The other programs are kept as they were, in their order.
    assert evening["id"] == "evening"


@pytest.mark.parametrize(
    ("stored", "language", "name"),
    [
        ("Main program", "fr", "Arrosage"),
        ("Main program", "de", "Bewässerung"),
        ("Main program", None, "Watering"),
        ("", "en", "Watering"),
        ("My garden", "fr", "My garden"),
    ],
)
def test_the_default_name_becomes_a_neutral_one_and_a_chosen_one_stays(
    stored, language, name
):
    changes = conversion_changes(
        _config(**{const.CONF_PROGRAMS: [_main(name=stored)]}), _zones(), language
    )
    assert changes[const.CONF_PROGRAMS][0]["name"] == name


def test_a_disabled_zone_with_a_valve_stays_in_its_place():
    zones = [
        zone(0),
        zone(1, **{const.ZONE_STATE: const.ZONE_STATE_DISABLED}),
        zone(2),
    ]
    steps = classic_cycle_steps({}, zones)

    # Left out of the run while it is disabled, as the cycle did; watered again
    # once it is enabled, as the cycle would have.
    assert [s["zones"] for s in steps] == [[0], [1], [2]]


def test_any_program_that_was_off_has_its_schedules_switched_off():
    evening = {
        "id": "evening",
        "enabled": False,
        "steps": [{"zones": [0]}],
        "schedules": [{"type": "time", "time": "20:00"}],
    }
    changes = conversion_changes(
        _config(**{const.CONF_PROGRAMS: [_main(enabled=False), evening]}),
        _zones(),
        "en",
    )

    for program in changes[const.CONF_PROGRAMS]:
        assert "enabled" not in program
        assert [s["enabled"] for s in program["schedules"]] == [False]


def test_it_is_made_once_and_a_new_installation_only_gets_the_mark():
    assert conversion_changes({}, [], "en") == {const.CONF_MAIN_PROGRAM_CONVERTED: True}
    assert conversion_changes({const.CONF_MAIN_PROGRAM_CONVERTED: True}, [], "en") == {}
    converted = conversion_changes(_config(), _zones(), "en")
    again = conversion_changes(
        {**_config(), **converted, const.CONF_MAIN_PROGRAM_CONVERTED: True},
        _zones(),
        "en",
    )
    assert again == {}


def test_calculate_only_is_converted_too_so_the_data_has_one_shape():
    changes = conversion_changes(
        _config(**{const.CONF_FULL_CONTROLLER: False}), _zones(), "en"
    )
    assert changes[const.CONF_PROGRAMS][0]["steps"]


def test_a_main_program_stored_before_its_mark_is_known_by_its_id():
    # An old store: the id, no "main" flag, no steps.
    old = {"id": "main", "name": "Main program", "schedules": [DONE_BY_SUNRISE]}
    changes = conversion_changes(
        _config(**{const.CONF_PROGRAMS: [old]}), _zones(), "en"
    )
    assert [s["zones"] for s in changes[const.CONF_PROGRAMS][0]["steps"]] == [
        [2],
        [0],
        [1],
    ]
    # An ordinary program called "main" with steps of its own is left alone.
    mine = {"id": "main", "name": "Mine", "steps": [{"zones": [1]}]}
    changes = conversion_changes(
        _config(**{const.CONF_PROGRAMS: [mine]}), _zones(), "en"
    )
    assert changes[const.CONF_PROGRAMS][0]["steps"][0]["zones"] == [1]
    assert changes[const.CONF_PROGRAMS][0]["name"] == "Mine"


def test_after_the_older_move_the_trigger_schedule_ends_up_in_the_program():
    """Direct valve control alone, from before 2026.11: both moves, in order."""
    old = {
        const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True,
        const.CONF_ZONE_SEQUENCING: "sequential",
        const.CONF_PAUSE_BETWEEN_ZONES: 10,
    }
    moved = {**old, **migration_changes(old)}
    converted = conversion_changes(moved, _zones(), "en")

    [program] = converted[const.CONF_PROGRAMS]
    assert program["id"] == "main"
    assert program["name"] == "Watering"
    [schedule] = program["schedules"]
    assert (schedule["event"], schedule["anchor"]) == ("sunrise", "end")
    assert [s["zones"] for s in program["steps"]] == [[2], [0], [1]]


def test_an_inactive_trigger_ends_up_as_a_schedule_switched_off():
    """Both moves: the inactive trigger is found again, off, and never fires."""
    old = {
        const.CONF_FULL_CONTROLLER: True,
        const.CONF_ZONE_SEQUENCING: "sequential",
        const.CONF_ACTIVE_START_TRIGGER: "dawn",
        const.CONF_IRRIGATION_START_TRIGGERS: [
            {"name": "dawn", "type": "sunrise", "enabled": True},
            {"name": "late", "type": "time", "at": "22:00", "enabled": True},
        ],
    }
    moved = {**old, **migration_changes(old)}
    converted = conversion_changes(moved, _zones(), "en")

    [program] = converted[const.CONF_PROGRAMS]
    dawn, late = program["schedules"]
    assert (dawn["event"], dawn["enabled"]) == ("sunrise", True)
    assert (late["type"], late["time"], late["enabled"]) == ("time", "22:00", False)


# --- the same run, second by second ---------------------------------------------------


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


def _run_setup(monkeypatch, sequencing, passes, soak, pause):
    hass = make_hass()
    zones = _zones()
    store = make_store(
        zones, sequencing=sequencing, passes=passes, soak=soak, pause=pause
    )
    store.config.full_controller = True
    store.config.active_cycle = None
    store.config.active_program_run = None
    settings = {
        const.CONF_ZONE_SEQUENCING: sequencing,
        const.CONF_WATERING_PASSES: passes,
        const.CONF_PAUSE_BETWEEN_ZONES: pause,
        const.CONF_PROGRAMS: [_main()],
    }
    store.config.programs = normalize_programs(
        conversion_changes(settings, zones, "en")[const.CONF_PROGRAMS]
    )
    coord = Coordinator(hass, store)
    clock = Clock()
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", clock.sleep
    )
    timeline: list = []
    inner = hass.services.async_call

    async def _timed(domain, service, data, **kwargs):
        name = data["entity_id"].split(".")[1]
        state = "on" if service in ("turn_on", "open_valve") else "off"
        timeline.append((round(clock.now), f"{name} {state}"))
        return await inner(domain, service, data, **kwargs)

    hass.services.async_call = _timed
    return hass, coord, clock, timeline


def _events(hass, name):
    return [
        call.args[1]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0] == f"{const.DOMAIN}_{name}"
    ]


async def _classic(monkeypatch, *settings):
    hass, coord, clock, timeline = _run_setup(monkeypatch, *settings)
    await clock.drive(asyncio.ensure_future(coord._run_direct_valves()))
    return hass, coord, timeline


async def _converted(monkeypatch, *settings):
    hass, coord, clock, timeline = _run_setup(monkeypatch, *settings)
    await clock.drive(
        asyncio.ensure_future(coord.async_run_program("main", manual=False))
    )
    return hass, coord, timeline


@pytest.mark.parametrize(
    ("sequencing", "passes", "soak", "pause"),
    [
        ("sequential", 1, 0, 0),
        ("sequential", 1, 0, 30),
        ("sequential", 2, 5, 30),
        ("sequential", 3, 2, 0),
        ("parallel", 1, 0, 30),
        ("parallel", 2, 5, 0),
    ],
)
async def test_the_converted_program_waters_as_the_cycle_did(
    monkeypatch, sequencing, passes, soak, pause
):
    settings = (sequencing, passes, soak, pause)
    classic_hass, classic, classic_timeline = await _classic(monkeypatch, *settings)
    program_hass, program, program_timeline = await _converted(monkeypatch, *settings)

    # The same valves, opened and closed at the same seconds.
    assert program_timeline == classic_timeline
    assert classic_timeline
    # The same water credited to each zone.
    assert {
        zone_id: round(z[const.ZONE_BUCKET], 3)
        for zone_id, z in program.store.by_id.items()
    } == {
        zone_id: round(z[const.ZONE_BUCKET], 3)
        for zone_id, z in classic.store.by_id.items()
    }

    # The cycle's events are still fired for the program "main", alike.
    classic_started = _events(classic_hass, const.EVENT_IRRIGATE_STARTED)
    program_started = _events(program_hass, const.EVENT_IRRIGATE_STARTED)
    assert program_started == classic_started
    classic_finished = _events(classic_hass, const.EVENT_IRRIGATE_FINISHED)
    program_finished = _events(program_hass, const.EVENT_IRRIGATE_FINISHED)
    assert program_finished == classic_finished
    # And the program's own, as for any program.
    assert len(_events(program_hass, const.EVENT_PROGRAM_STARTED)) == 1
    assert len(_events(program_hass, const.EVENT_PROGRAM_FINISHED)) == 1


async def test_another_program_does_not_fire_the_cycles_events(monkeypatch):
    hass, coord, clock, _timeline = _run_setup(monkeypatch, "sequential", 1, 0, 0)
    coord.store.config.programs = normalize_programs(
        [{"id": "evening", "name": "Evening", "steps": [{"zones": [0]}]}]
    )

    await clock.drive(asyncio.ensure_future(coord.async_run_program("evening")))

    assert _events(hass, const.EVENT_PROGRAM_FINISHED)
    assert _events(hass, const.EVENT_IRRIGATE_STARTED) == []
    assert _events(hass, const.EVENT_IRRIGATE_FINISHED) == []
