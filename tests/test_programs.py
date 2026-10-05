"""The programs of the full controller: plain data, no Home Assistant."""

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.programs import (
    DURATION_CALCULATED,
    DURATION_FIXED,
    DURATION_PERCENT,
    MAIN_PROGRAM_ID,
    default_main_program,
    ensure_main_program,
    find_program,
    normalize_programs,
    plan_program,
    step_seconds,
)


def test_the_main_program_is_created_first():
    other = {const.PROGRAM_ID: "evening", const.PROGRAM_NAME: "Evening"}

    programs = ensure_main_program([other])

    assert [p[const.PROGRAM_ID] for p in programs] == [MAIN_PROGRAM_ID, "evening"]
    assert programs[0] == default_main_program()


def test_an_existing_main_program_is_left_alone():
    renamed = {
        const.PROGRAM_ID: MAIN_PROGRAM_ID,
        const.PROGRAM_NAME: "My garden",
        const.PROGRAM_ENABLED: False,
    }

    programs = ensure_main_program([renamed])

    assert programs == [renamed]


def test_nothing_stored_gives_just_the_main_program():
    assert ensure_main_program(None) == [default_main_program()]
    assert ensure_main_program([]) == [default_main_program()]


def test_the_input_list_is_not_modified():
    stored = [{const.PROGRAM_ID: "evening"}]

    ensure_main_program(stored)

    assert stored == [{const.PROGRAM_ID: "evening"}]


def test_a_malformed_entry_is_dropped():
    assert ensure_main_program(["junk", None]) == [default_main_program()]


def test_find_program():
    programs = ensure_main_program(None)
    assert find_program(programs, MAIN_PROGRAM_ID) is programs[0]
    assert find_program(programs, "nope") is None
    assert find_program(None, MAIN_PROGRAM_ID) is None


# --- what is stored ----------------------------------------------------------


def _program(**overrides):
    data = {
        const.PROGRAM_ID: "evening",
        const.PROGRAM_NAME: "Evening",
        const.PROGRAM_STEPS: [{const.STEP_ZONES: [0, 1]}],
    }
    data.update(overrides)
    return data


def test_a_program_is_stored_well_formed():
    [program] = normalize_programs([{"name": "Evening round"}])

    assert program[const.PROGRAM_ID] == "evening_round"
    assert program[const.PROGRAM_STEPS] == []
    assert program[const.PROGRAM_TOURS] == 1
    assert program[const.PROGRAM_DELAY] == 0.0
    assert program[const.PROGRAM_ENABLED] is True
    assert program[const.PROGRAM_MAIN] is False


def test_a_step_is_cleaned():
    [program] = normalize_programs(
        [
            _program(
                steps=[
                    {
                        "zones": ["1", 2, "x", 2],
                        "mode": "nonsense",
                        "percent": 99999,
                        "seconds": -5,
                        "passes": 99,
                        "delay": "",
                    }
                ]
            )
        ]
    )

    [step] = program[const.PROGRAM_STEPS]
    assert step[const.STEP_ZONES] == [1, 2]
    assert step[const.STEP_MODE] == DURATION_CALCULATED
    assert step[const.STEP_PERCENT] == 1000.0
    assert step[const.STEP_SECONDS] == 0.0
    assert step[const.STEP_PASSES] == 6
    assert step[const.STEP_DELAY] is None
    assert step[const.STEP_ENABLED] is True


def test_the_main_program_comes_first_and_carries_no_steps():
    programs = normalize_programs(
        [_program(), {"id": "main", "name": "Mine", "steps": [{"zones": [1]}]}]
    )

    assert [p[const.PROGRAM_ID] for p in programs] == ["main", "evening"]
    assert const.PROGRAM_STEPS not in programs[0]
    assert programs[0][const.PROGRAM_NAME] == "Mine"


def test_program_ids_are_unique():
    programs = normalize_programs([_program(), _program(), _program(id="")])

    ids = [p[const.PROGRAM_ID] for p in programs]
    assert len(set(ids)) == 3


def test_what_is_not_a_program_is_dropped():
    assert normalize_programs(["junk", None]) == []
    assert normalize_programs(None) == []


# --- how long a step waters ----------------------------------------------------


def _zone(zone_id=0, duration=600, lead=60, **extra):
    data = {
        const.ZONE_ID: zone_id,
        const.ZONE_DURATION: duration,
        const.ZONE_LEAD_TIME: lead,
        const.ZONE_LINKED_ENTITY: f"switch.z{zone_id}",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
    }
    data.update(extra)
    return data


def _step(**overrides):
    data = {const.STEP_ZONES: [0], const.STEP_MODE: DURATION_CALCULATED}
    data.update(overrides)
    return data


def test_a_calculated_step_takes_the_zones_own_duration():
    assert step_seconds(_step(), _zone()) == 600


def test_a_percent_step_scales_the_water_and_keeps_the_lead():
    step = _step(mode=DURATION_PERCENT, percent=50)

    # 540 s of water, half of it, and the 60 s that fill the pipe.
    assert step_seconds(step, _zone()) == 330


def test_a_fixed_step_is_seconds_of_water_plus_the_lead():
    step = _step(mode=DURATION_FIXED, seconds=120)

    assert step_seconds(step, _zone()) == 180


def test_a_zone_that_needs_no_water_gets_none_unless_the_step_is_fixed():
    idle = _zone(duration=0)

    assert step_seconds(_step(), idle) == 0
    assert step_seconds(_step(mode=DURATION_PERCENT, percent=200), idle) == 0
    assert step_seconds(_step(mode=DURATION_FIXED, seconds=120), idle) == 180


def test_tours_share_the_water_and_each_pays_the_lead():
    assert step_seconds(_step(), _zone(), tours=2) == 270 + 60


# --- the plan --------------------------------------------------------------------


def _plan(program, zones):
    return plan_program(normalize_programs([program])[0], zones)


def test_a_plan_lists_each_step_with_its_zones_and_seconds():
    zones = [_zone(0), _zone(1, duration=300, lead=0)]
    program = _program(
        steps=[{"zones": [0]}, {"zones": [1], "mode": "fixed", "seconds": 90}],
        delay=30,
    )

    [tour] = _plan(program, zones)

    assert [[(m["zone_id"], m["seconds"]) for m in s["zones"]] for s in tour] == [
        [(0, 600)],
        [(1, 90)],
    ]
    assert [s["delay"] for s in tour] == [30, 30]


def test_a_step_can_set_its_own_delay():
    zones = [_zone(0)]
    program = _program(steps=[{"zones": [0], "delay": 5}], delay=30)

    [tour] = _plan(program, zones)

    assert tour[0]["delay"] == 5


def test_zones_that_cannot_be_watered_are_left_out():
    disabled = _zone(1, state=const.ZONE_STATE_DISABLED)
    unlinked = _zone(2, linked_entity=None)
    zones = [_zone(0), disabled, unlinked]
    program = _program(steps=[{"zones": [0, 1, 2, 7]}, {"zones": [1]}])

    [tour] = _plan(program, zones)

    assert len(tour) == 1  # the second step has nothing left to water
    assert [m["zone_id"] for m in tour[0]["zones"]] == [0]


def test_a_disabled_step_is_skipped():
    program = _program(steps=[{"zones": [0], "enabled": False}])

    assert _plan(program, [_zone(0)]) == []


def test_tours_repeat_the_list_with_a_share_of_the_water():
    program = _program(steps=[{"zones": [0]}], tours=3)

    plan = _plan(program, [_zone(0)])

    assert len(plan) == 3
    assert all(t[0]["zones"][0]["seconds"] == 180 + 60 for t in plan)


def test_an_empty_program_plans_nothing():
    assert _plan(_program(steps=[]), [_zone(0)]) == []
