"""The programs of the full controller: plain data, no Home Assistant."""

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.programs import (
    DURATION_CALCULATED,
    DURATION_FIXED,
    DURATION_PERCENT,
    MAIN_PROGRAM_ID,
    find_program,
    has_schedule_on,
    normalize_programs,
    plan_program,
    set_schedules_enabled,
    step_seconds,
    unique_id,
    watering_name,
    zone_steps,
    zones_with_valve,
)


def test_find_program():
    programs = normalize_programs([{"id": "evening"}, {"id": MAIN_PROGRAM_ID}])
    assert find_program(programs, MAIN_PROGRAM_ID) is programs[1]
    assert find_program(programs, "nope") is None
    assert find_program(None, MAIN_PROGRAM_ID) is None


def test_a_new_name_is_transliterated_into_its_id():
    assert unique_id("Démo potager", "program_1", set()) == "demo_potager"
    assert unique_id("Øst bed", "program_1", set()) == "ost_bed"
    assert unique_id("!!!", "program_1", set()) == "program_1"
    assert unique_id("", "program_1", set()) == "program_1"


def test_a_stored_id_never_changes():
    # Stored before the ids were transliterated, or simply an id: as it is.
    for stored in ("d_mo_potager", "main", "a__b", "program_2", "step_1"):
        assert unique_id(stored, "x", set()) == stored
    [program] = normalize_programs([{"id": "d_mo_potager", "name": "Démo potager"}])
    assert program[const.PROGRAM_ID] == "d_mo_potager"


def test_a_taken_id_is_numbered():
    used = {"evening"}
    assert unique_id("Evening", "x", used) == "evening_2"
    assert unique_id("Evening", "x", used) == "evening_3"


def test_the_neutral_name_follows_the_language():
    assert watering_name("fr") == "Arrosage"
    assert watering_name("de") == "Bewässerung"
    assert watering_name("pt-BR") == "Irrigação"
    assert watering_name("pt") == "Rega"
    assert watering_name("en-GB") == "Watering"
    assert watering_name("nb") == "Vanning"
    assert watering_name("xx") == "Watering"
    assert watering_name(None) == "Watering"


def test_zone_steps_water_one_after_the_other_with_the_pause():
    steps = zone_steps([3, 1, 2], "sequential", 2, 30)
    assert [s[const.STEP_ZONES] for s in steps] == [[3], [1], [2]]
    # The pause after each zone but the last, which waits for nothing.
    assert [s[const.STEP_DELAY] for s in steps] == [30.0, 30.0, None]
    assert all(s[const.STEP_PASSES] == 2 for s in steps)
    assert all(s[const.STEP_MODE] == DURATION_CALCULATED for s in steps)


def test_zone_steps_water_all_at_once_in_parallel():
    [step] = zone_steps([3, 1, 2], "parallel", 3, 30)
    assert step[const.STEP_ZONES] == [3, 1, 2]
    assert step[const.STEP_DELAY] is None
    assert step[const.STEP_PASSES] == 3
    assert zone_steps([], "sequential", 1, 0) == []


def test_zones_with_valve_keep_their_order():
    zones = [
        {const.ZONE_ID: 2, const.ZONE_LINKED_ENTITY: "switch.b"},
        {const.ZONE_ID: 0},
        {
            const.ZONE_ID: 1,
            const.ZONE_LINKED_ENTITY: "switch.a",
            const.ZONE_STATE: const.ZONE_STATE_DISABLED,
        },
    ]
    assert zones_with_valve(zones) == [2]
    assert zones_with_valve(zones, include_disabled=True) == [2, 1]


def test_the_schedules_switch_together():
    program = {"schedules": [{"id": "a"}, {"id": "b", "enabled": False}]}
    assert has_schedule_on(program)
    off = set_schedules_enabled(program, False)
    assert not has_schedule_on(off)
    assert has_schedule_on(set_schedules_enabled(off, True))
    assert not has_schedule_on({})


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
    # No on/off of its own, and nothing that sets one program apart.
    assert const.PROGRAM_ENABLED not in program
    assert const.PROGRAM_MAIN not in program


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


def test_every_program_is_stored_alike_main_included():
    programs = normalize_programs(
        [_program(), {"id": "main", "name": "Mine", "steps": [{"zones": [1]}]}]
    )

    # The order the user gave, and the old main program's id kept with its steps.
    assert [p[const.PROGRAM_ID] for p in programs] == ["evening", "main"]
    assert programs[1][const.PROGRAM_STEPS][0][const.STEP_ZONES] == [1]
    assert programs[1][const.PROGRAM_NAME] == "Mine"


def test_a_program_that_was_off_has_its_schedules_switched_off():
    [program] = normalize_programs(
        [_program(enabled=False, schedules=[{"type": "time", "time": "06:00"}])]
    )
    assert const.PROGRAM_ENABLED not in program
    assert [s[const.SCHEDULE_ENABLED] for s in program[const.PROGRAM_SCHEDULES]] == [
        False
    ]


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
