"""Importing an Irrigation Unlimited configuration: the rules, one by one."""

from datetime import date, datetime, time, timedelta

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.iu_import import (
    APPROXIMATED,
    CARRIED,
    NO_EFFECT,
    NOT_CARRIED,
    UNKNOWN,
    Link,
    Report,
    Schedule,
    classify,
    convert_schedule,
    cron_schedules,
    month_day,
    plan_import,
    seconds_of,
    time_of_day,
)
from custom_components.smart_irrigation.programs import (
    DURATION_CALCULATED,
    DURATION_FIXED,
    normalize_programs,
)
from custom_components.smart_irrigation.schedules import occurs_on
from custom_components.smart_irrigation.supplies import normalize_supplies


def _items(plan, outcome=None):
    return [
        i for i in plan["report"]["items"] if outcome is None or i["outcome"] == outcome
    ]


def _program(plan, name):
    return next(p for p in plan["programs"] if p["name"] == name)


def _schedule(raw, lead=0.0):
    report = Report()
    made = convert_schedule(
        Schedule(where="s", raw=raw, duration=seconds_of(raw.get("duration"))),
        report,
        lead,
    )
    return made, report


# --- reading IU's values ---------------------------------------------------------


@pytest.mark.parametrize(
    ("value", "seconds"),
    [
        ("00:10", 600),
        ("0:10:00", 600),
        ("01:41", 6060),
        ("-0:01:00", -60),
        ("0:00:10", 10),
        ({"minutes": 10}, 600),
        ({"hours": 1, "seconds": 5}, 3605),
        (timedelta(minutes=3), 180),
        (90, 90),
        ("90", 90),
    ],
)
def test_a_duration_is_read_as_iu_writes_it(value, seconds):
    assert seconds_of(value) == seconds


@pytest.mark.parametrize("value", [None, True, "soon", {"weeks": "x"}])
def test_what_is_no_duration_is_none(value):
    assert seconds_of(value) is None


def test_times_and_days_of_the_year():
    assert time_of_day("7:05") == time(7, 5)
    assert time_of_day("06:05:30") == time(6, 5, 30)
    assert time_of_day("25:00") is None
    assert month_day("16 Sep") == "09-16"
    assert month_day(date(2026, 1, 2)) == "01-02"
    assert month_day("31 Feb") is None


# --- the rules ---------------------------------------------------------------------


def test_every_option_path_finds_its_rule():
    assert classify("controllers.sequences.zones.delay")[1] == CARRIED
    assert classify("controllers.zones.threshold")[1] == NOT_CARRIED
    assert classify("controllers.sequences.zones.repeat")[1] == APPROXIMATED
    # The free attributes fall under the rule of ``user``.
    assert classify("controllers.zones.user.area") == (
        "controllers.zones.user",
        NO_EFFECT,
        "free attributes",
    )
    assert classify("controllers.zones.colour")[1] == UNKNOWN


def test_an_option_no_rule_knows_is_reported():
    plan = plan_import({"controllers": {"zones": {"name": "A"}, "flavour": "x"}})
    assert [i["path"] for i in _items(plan, UNKNOWN)] == ["controllers.flavour"]


# --- schedules ---------------------------------------------------------------------


def test_cron_becomes_time_schedules_when_it_can():
    made, why = cron_schedules("25 6-9 * * *")
    assert [s[const.SCHEDULE_TIME] for s in made] == [
        "06:25",
        "07:25",
        "08:25",
        "09:25",
    ]
    made, _ = cron_schedules("0 6 * * 1-5")
    assert made[0][const.SCHEDULE_WEEKDAYS] == [0, 1, 2, 3, 4]
    made, _ = cron_schedules("*/20 2-4 * * *")
    assert len(made) == 9
    for text in ("* * * * *", "0 6 1 * 1", "60 * * * *", "6 * *"):
        assert cron_schedules(text) == ([], cron_schedules(text)[1])
        assert cron_schedules(text)[1]


def test_a_sun_schedule_keeps_its_offset_in_minutes():
    made, report = _schedule({"time": {"sun": "sunrise", "before": "00:20"}})
    assert made == [
        {
            const.SCHEDULE_ENABLED: True,
            const.SCHEDULE_ANCHOR: "start",
            const.SCHEDULE_TYPE: "sun",
            const.SCHEDULE_EVENT: "sunrise",
            const.SCHEDULE_OFFSET_MINUTES: -20,
        }
    ]
    made, report = _schedule({"time": {"sun": "sunset", "after": "00:19:37"}})
    assert made[0][const.SCHEDULE_OFFSET_MINUTES] == 20
    assert report.items[0]["outcome"] == APPROXIMATED


def test_the_supplys_lead_moves_the_start_earlier():
    """IU opens the zone at the moment and the master before it; the full
    controller switches the supply on at the moment and opens after its lead."""
    made, _ = _schedule({"time": "06:05"}, lead=120)
    assert made[0][const.SCHEDULE_TIME] == "06:03"
    made, _ = _schedule({"time": {"sun": "sunrise"}}, lead=120)
    assert made[0][const.SCHEDULE_OFFSET_MINUTES] == -2
    # Not across midnight: that would be another day.
    made, report = _schedule({"time": "00:01"}, lead=120)
    assert made[0][const.SCHEDULE_TIME] == "00:01"
    assert report.items


def test_the_days_of_a_schedule():
    made, _ = _schedule(
        {
            "time": "06:05",
            "anchor": "finish",
            "weekday": ["mon", "wed"],
            "month": ["jan", "sep"],
            "day": [4, 5, 6],
            "from": "16 Sep",
            "until": "2 Jan",
            "enabled": False,
            "schedule_id": "morning",
        }
    )
    schedule = made[0]
    assert schedule[const.SCHEDULE_ANCHOR] == "end"
    assert schedule[const.SCHEDULE_WEEKDAYS] == [0, 2]
    assert schedule[const.SCHEDULE_MONTHS] == [1, 9]
    assert schedule[const.SCHEDULE_DAYS_OF_MONTH] == [4, 5, 6]
    assert schedule[const.SCHEDULE_FROM] == "09-16"
    assert schedule[const.SCHEDULE_UNTIL] == "01-02"
    assert schedule[const.SCHEDULE_ENABLED] is False
    assert schedule[const.SCHEDULE_ID] == "morning"
    assert (
        _schedule({"time": "06:05", "day": "odd"})[0][0][const.SCHEDULE_PARITY] == "odd"
    )


def test_every_n_days_counts_from_the_same_day_as_iu():
    made, _ = _schedule(
        {"time": "19:15", "day": {"every_n_days": 3, "start_n_days": date(2022, 1, 2)}}
    )
    schedule = made[0]
    start = date(2022, 1, 2)
    days = [start + timedelta(days=n) for n in range(7)]
    assert [occurs_on(schedule, d) for d in days] == [
        True,
        False,
        False,
        True,
        False,
        False,
        True,
    ]


# --- what is created ---------------------------------------------------------------

CONFIG = {
    "controllers": [
        {
            "name": "Garden",
            "entity_id": "switch.pump",
            "preamble": "00:02",
            "postamble": "00:01",
            "all_zones_config": {"minimum": "00:02", "maximum": "00:30"},
            "zones": [
                {"name": "Lawn", "entity_id": "valve.lawn", "zone_id": "lawn"},
                {"name": "Hedge", "entity_id": "valve.hedge,valve.hedge_back"},
                {
                    "name": "Beds",
                    "entity_id": "valve.beds",
                    "maximum": "00:45",
                    "check_back": {"delay": 30, "retries": 3, "toggle": True},
                    "volume": {"entity_id": "sensor.beds_water"},
                },
            ],
            "sequences": [
                {
                    "name": "Morning",
                    "delay": "00:01",
                    "repeat": 2,
                    "schedules": [
                        {"time": "06:05", "duration": "01:01"},
                        {"time": "18:05"},
                    ],
                    "zones": [
                        {"zone_id": "lawn", "duration": "00:10"},
                        {"zone_id": [2, 3], "duration": "00:20"},
                    ],
                }
            ],
        }
    ]
}


def test_the_controller_becomes_a_supply():
    plan = plan_import(CONFIG)
    assert plan["supplies"] == [
        {
            "id": "iu_c1_supply",
            "name": "Garden",
            "entities": ["switch.pump"],
            "delay_before": 120.0,
            "delay_after": 60.0,
            "enabled": True,
        }
    ]
    assert normalize_supplies(plan["supplies"]) == plan["supplies"]


def test_the_zones_take_their_valves_supply_and_confirmation():
    zones = {z["name"]: z for z in plan_import(CONFIG)["zones"]}
    assert zones["Hedge"]["zone"][const.ZONE_LINKED_ENTITY] == "valve.hedge"
    assert zones["Hedge"]["zone"][const.ZONE_EXTRA_ENTITIES] == ["valve.hedge_back"]
    assert zones["Lawn"]["zone"][const.ZONE_SUPPLY_ID] == "iu_c1_supply"
    beds = zones["Beds"]["zone"]
    # IU checks after 30 s, and again after each of 3 resends.
    assert beds[const.ZONE_CONFIRM_TIMEOUT] == 120
    assert beds[const.ZONE_OPEN_RESENDS] == 3
    assert beds[const.ZONE_FLOW_SENSOR] == "sensor.beds_water"
    assert zones["Lawn"]["key"] == "c1_z1"


def test_a_sequence_becomes_a_program_per_schedule_duration():
    plan = plan_import(CONFIG)
    plain = _program(plan, "Morning")
    scaled = _program(plan, "Morning (61 min)")
    # Without a schedule duration: the steps' own, within the zones' bounds,
    # twice, as the program runs through twice and shares the water.
    assert [s["seconds"] for s in plain["steps"]] == [1200.0, 2400.0]
    assert plain["tours"] == 2
    assert plain["delay"] == 60.0
    assert plain["schedules"][0]["time"] == "18:03"  # the pump leads by 2 min
    # 61 minutes in all: 3 waits of a minute off, 58 shared 10 : 20 over two
    # runs through, rounded to IU's minute.
    assert [s["seconds"] for s in scaled["steps"]] == [
        round(58 * 60 * 10 / 60 / 60) * 60 * 2,
        round(58 * 60 * 20 / 60 / 60) * 60 * 2,
    ]
    assert scaled["steps"][1]["zones"] == ["c1_z2", "c1_z3"]
    assert all(s["mode"] == DURATION_FIXED for s in scaled["steps"])
    assert scaled["schedules"][0]["weather"] is False


def test_the_programs_are_what_the_store_keeps():
    plan = plan_import(CONFIG)
    ids = {z["key"]: n for n, z in enumerate(plan["zones"], start=1)}
    raw = [
        {
            **p,
            "steps": [{**s, "zones": [ids[k] for k in s["zones"]]} for s in p["steps"]],
        }
        for p in plan["programs"]
    ]
    stored = normalize_programs(raw)
    for given, kept in zip(raw, stored, strict=True):
        assert kept["id"] == given["id"]
        assert [s["seconds"] for s in kept["steps"]] == [
            s.get("seconds", 0.0) for s in given["steps"]
        ]
        assert [s["mode"] for s in kept["steps"]] == [s["mode"] for s in given["steps"]]
        assert kept["tours"] == given["tours"]
        assert [s["time"] for s in kept["schedules"]] == [
            s["time"] for s in given["schedules"]
        ]


def test_a_zone_fed_by_an_adjust_time_blueprint_is_calculated():
    plan = plan_import(
        CONFIG,
        links=[Link(si_zone_id=7, iu_sequence="c1_s1", position=1)],
    )
    morning = _program(plan, "Morning")
    assert morning["steps"][0]["mode"] == DURATION_CALCULATED
    assert morning["steps"][1]["mode"] == DURATION_FIXED
    # The zones' bounds stay, on the whole water of the step.
    assert morning["steps"][0][const.STEP_MIN_SECONDS] == 2 * 120
    assert morning["schedules"][0]["weather"] is True
    # Calculated, the durations of the schedules no longer matter: one program.
    assert [p["name"] for p in plan["programs"]] == ["Morning"]


def test_an_existing_zone_is_found_by_valve_blueprint_or_name():
    existing = [
        {"id": 3, "name": "Something", "linked_entity": "valve.lawn"},
        {"id": 4, "name": "hedge", "linked_entity": None},
    ]
    zones = {
        z["name"]: z
        for z in plan_import(CONFIG, existing, [Link(si_zone_id=9, iu_zone="c1_z3")])[
            "zones"
        ]
    }
    assert (zones["Lawn"]["match"], zones["Lawn"]["match_reason"]) == (3, "valve")
    assert (zones["Beds"]["match"], zones["Beds"]["match_reason"]) == (9, "blueprint")
    assert (zones["Hedge"]["match"], zones["Hedge"]["match_reason"]) == (4, "name")


def test_a_zones_own_schedules_become_one_step_programs():
    plan = plan_import(
        {
            "controllers": {
                "zones": [
                    {
                        "name": "Pots",
                        "maximum": "00:15",
                        "schedules": [
                            {"time": "06:00", "duration": "00:10"},
                            {"time": "18:00", "duration": "00:20"},
                        ],
                    }
                ]
            }
        }
    )
    assert [(p["name"], p["steps"][0]["seconds"]) for p in plan["programs"]] == [
        ("Pots", 600.0),
        ("Pots (20 min)", 900.0),  # held to the zone's maximum
    ]


def test_steps_of_one_zone_back_to_back_are_one_run():
    plan = plan_import(
        {
            "controllers": {
                "zones": [{"name": "A"}],
                "sequences": {
                    "schedules": {"time": "06:00"},
                    "zones": [
                        {"zone_id": 1, "duration": "00:06"},
                        {"zone_id": 1, "duration": "00:12"},
                    ],
                },
            }
        }
    )
    steps = plan["programs"][0]["steps"]
    assert [s["seconds"] for s in steps] == [1080.0]


def test_a_repeated_step_becomes_passes():
    plan = plan_import(
        {
            "controllers": {
                "zones": [{"name": "A"}],
                "sequences": {
                    "schedules": {"time": "06:00"},
                    "zones": [{"zone_id": 1, "duration": "00:05", "repeat": 3}],
                },
            }
        }
    )
    step = plan["programs"][0]["steps"][0]
    assert (step["passes"], step["seconds"]) == (3, 900.0)


def test_what_cannot_come_along_is_said():
    plan = plan_import(
        {
            "controllers": [
                {
                    "entity_states": "on",
                    "zones": [{"name": "A", "threshold": "00:05"}],
                    "sequences": {
                        "schedules": {"time": {"cron": "* * * * *"}},
                        "zones": {"zone_id": 1},
                    },
                },
                {
                    "zones": [
                        {"name": "B", "schedules": {"time": "06:00", "duration": 60}}
                    ]
                },
            ]
        }
    )
    notes = " | ".join(i["note"] for i in _items(plan))
    assert "always sends on and off" in notes
    assert "minimum deficit" in notes
    assert "more than 24 times a day" in notes
    assert "2 controllers" in notes
    assert "no valve" in notes


def test_a_disabled_controller_imports_its_programs_disabled():
    plan = plan_import(
        {
            "controllers": {
                "enabled": False,
                "zones": [{"name": "A"}],
                "sequences": {"schedules": {"time": "06:00"}, "zones": {"zone_id": 1}},
            }
        }
    )
    assert plan["programs"][0]["enabled"] is False


def test_nothing_to_import_is_no_error():
    plan = plan_import(None)
    assert plan["programs"] == []
    assert _items(plan, NOT_CARRIED)


def test_iu_ui_entries_have_the_same_shape():
    """What IU's own dialogs store (newer than 2025.12) reads as YAML does."""
    entry = {
        "controllers": [
            {
                "name": "Garden",
                "zones": [{"name": "A", "entity_id": "switch.a"}],
                "sequences": [
                    {
                        "name": "S",
                        "zones": [{"zone_id": ["1"], "duration": "00:05:00"}],
                        "schedules": [
                            {
                                "time": "06:00",
                                "weekday": ["mon"],
                                "duration": "00:05:00",
                            }
                        ],
                    }
                ],
            }
        ]
    }
    program = plan_import(entry)["programs"][0]
    assert program["steps"][0]["seconds"] == 300.0
    assert program["schedules"][0]["weekdays"] == [0]


def test_a_reported_moment_stays_a_plain_datetime():
    # The report travels to the panel as JSON: only plain values in it.
    plan = plan_import(CONFIG)
    for item in plan["report"]["items"]:
        assert all(isinstance(v, str) for v in item.values())
    assert not any(isinstance(v, datetime) for v in plan["report"]["counts"].values())


# --- IU's own reading, case by case ---------------------------------------------


def _one_sequence(zones, steps, **sequence):
    return {
        "controllers": {
            "zones": zones,
            "sequences": {
                "schedules": sequence.pop("schedules", {"time": "06:00"}),
                "zones": steps,
                **sequence,
            },
        }
    }


def test_a_sequence_refers_to_a_zone_by_its_zone_id_only():
    plan = plan_import(
        _one_sequence(
            [{"name": "Lawn", "zone_id": "lawn"}, {"name": "Hedge"}],
            [{"zone_id": 1, "duration": "00:05"}, {"zone_id": "lawn"}, {"zone_id": 2}],
        )
    )
    steps = plan["programs"][0]["steps"]
    # 1 is not Lawn's id; Hedge has none, so its number is its id.
    assert [s["zones"] for s in steps] == [["c1_z1"], ["c1_z2"]]
    assert "no zone with zone_id 1" in " ".join(i["note"] for i in _items(plan))


def test_global_zone_ids_do_not_reach_into_another_controller():
    plan = plan_import(
        {
            "global_zone_ids": True,
            "controllers": [
                {"zones": [{"name": "A", "zone_id": "a"}]},
                {
                    "zones": [{"name": "B", "zone_id": "b"}],
                    "sequences": {
                        "schedules": {"time": "06:00"},
                        "zones": [{"zone_id": "a"}, {"zone_id": "b"}],
                    },
                },
            ],
        }
    )
    assert [s["zones"] for s in plan["programs"][0]["steps"]] == [["c2_z1"]]


def test_a_step_of_disabled_zones_does_not_share_a_schedules_duration():
    plan = plan_import(
        _one_sequence(
            [{"name": "A", "enabled": False}, {"name": "B"}],
            [{"zone_id": 1, "duration": "00:10"}, {"zone_id": 2, "duration": "00:10"}],
            schedules={"time": "06:00", "duration": "00:10"},
        )
    )
    assert plan["programs"][0]["steps"][1]["seconds"] == 600.0


def test_iu_rounds_half_up_and_truncates_what_it_reads():
    plan = plan_import(
        _one_sequence(
            [{"name": "A"}, {"name": "B"}],
            [{"zone_id": 1, "duration": "00:05"}, {"zone_id": 2, "duration": "00:05"}],
            schedules={"time": "06:00", "duration": "00:05"},
        )
    )
    # 150 s each, rounded half up to IU's minute.
    assert [s["seconds"] for s in plan["programs"][0]["steps"]] == [180.0, 180.0]
    pots = plan_import(
        {
            "controllers": {
                "zones": {"name": "P", "schedules": {"time": "06:00", "duration": 90}}
            }
        }
    )
    assert pots["programs"][0]["steps"][0]["seconds"] == 60.0


def test_zones_of_one_step_keep_their_own_bounds():
    plan = plan_import(
        _one_sequence(
            [{"name": "A", "maximum": "00:05"}, {"name": "B", "minimum": "00:20"}],
            [{"zone_id": [1, 2], "duration": "00:10"}],
        )
    )
    steps = plan["programs"][0]["steps"]
    # Two steps that start together: A for its 5 minutes, B for its 20.
    assert [(s["zones"], s["seconds"], s.get("delay")) for s in steps] == [
        (["c1_z1"], 300.0, -300.0),
        (["c1_z2"], 1200.0, None),
    ]


def test_the_supply_leads_again_after_a_long_wait():
    """The full controller brings a supply up again after it went off in a
    wait; IU opens the next zone at its time all the same."""
    config = {
        "controllers": {
            "entity_id": "switch.pump",
            "preamble": "00:02",
            "postamble": "00:01",
            "zones": [{"name": "A"}, {"name": "B"}],
            "sequences": {
                "delay": "00:05",
                "schedules": {"time": "06:00"},
                "zones": [
                    {"zone_id": 1, "duration": "00:10", "delay": "00:01"},
                    {"zone_id": 2, "duration": "00:10"},
                    {"zone_id": 1, "duration": "00:10", "delay": "00:02"},
                    {"zone_id": 2, "duration": "00:10"},
                ],
            },
        }
    }
    plan = plan_import(config)
    program = plan["programs"][0]
    # 5 min: the pump goes off, so 2 min of its lead come off the wait.
    assert program["delay"] == 180.0
    # 1 min: the pump stays on (its delay after is 1 min): the wait is kept.
    assert program["steps"][0]["delay"] == 60.0
    # 2 min: the pump goes off only because of the wait; no wait is exact.
    assert program["steps"][2]["delay"] == 120.0
    assert "up to 120 s later" in " ".join(i["note"] for i in _items(plan))


def test_repeats_iu_accepts():
    plan = plan_import(
        _one_sequence(
            [{"name": "A"}, {"name": "B"}],
            [
                {"zone_id": 1, "duration": "00:05", "repeat": 0},
                {"zone_id": 2, "repeat": "2.0"},
            ],
            repeat=8,
            duration="00:05",
        )
    )
    program = plan["programs"][0]
    assert program["steps"][0]["enabled"] is False
    assert program["steps"][1]["passes"] == 2
    # Held to 6 runs through, but with all eight runs' water.
    assert program["tours"] == 6
    assert program["steps"][1]["seconds"] == 300.0 * 2 * 8


def test_check_back_without_resync_only_checks():
    zones = plan_import(
        {
            "controllers": {
                "zones": [
                    {"name": "A", "check_back": {"delay": 20, "resync": False}},
                    {"name": "B", "check_back": {"states": "none"}},
                ]
            }
        }
    )
    a = zones["zones"][0]["zone"]
    assert (a[const.ZONE_CONFIRM_TIMEOUT], a[const.ZONE_OPEN_RESENDS]) == (80, 0)
    assert "IU does not check this valve" in " ".join(
        i["note"] for i in _items(zones, NOT_CARRIED)
    )


def test_cron_sundays_and_a_day_that_never_comes():
    made, _ = cron_schedules("0 6 * * 5-7")
    assert made[0][const.SCHEDULE_WEEKDAYS] == [4, 5, 6]
    made, _ = _schedule({"time": "06:00", "day": [0]})
    assert made[0][const.SCHEDULE_ENABLED] is False
