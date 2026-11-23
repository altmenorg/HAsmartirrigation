"""Moving an installation to the one choice of what Smart Irrigation does."""

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.one_choice import (
    first_program,
    migration_changes,
    schedule_from_trigger,
    schedules_from_recurring,
)


def _main(schedules=None, enabled=True):
    main = {"id": "main", "name": "Main program", "main": True, "enabled": enabled}
    if schedules is not None:
        main["schedules"] = schedules
    return main


def test_a_new_installation_only_gets_the_mark():
    assert migration_changes({}) == {const.CONF_ONE_CHOICE_MIGRATED: True}
    assert migration_changes({const.CONF_ONE_CHOICE_MIGRATED: True}) == {}


def test_direct_valve_control_alone_becomes_the_controller_started_as_before():
    changes = migration_changes(
        {
            const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True,
            const.CONF_ACTIVE_START_TRIGGER: "evening",
            const.CONF_IRRIGATION_START_TRIGGERS: [
                {
                    "name": "evening",
                    "type": "sunset",
                    "offset_minutes": 30,
                    "account_for_duration": False,
                    "enabled": True,
                }
            ],
        }
    )
    assert changes[const.CONF_FULL_CONTROLLER] is True
    [main] = changes[const.CONF_PROGRAMS]
    [schedule] = main["schedules"]
    assert (schedule["type"], schedule["event"], schedule["anchor"]) == (
        "sun",
        "sunset",
        "start",
    )
    assert schedule["offset_minutes"] == 30


def test_the_controller_keeps_the_schedules_it_has():
    own = {"time": "05:00", "enabled": True}
    changes = migration_changes(
        {const.CONF_FULL_CONTROLLER: True, const.CONF_PROGRAMS: [_main([own])]}
    )
    assert const.CONF_PROGRAMS not in changes


def test_a_main_program_switched_off_keeps_starting_nothing_on_its_own():
    changes = migration_changes(
        {const.CONF_FULL_CONTROLLER: True, const.CONF_PROGRAMS: [_main(enabled=False)]}
    )
    [main] = changes[const.CONF_PROGRAMS]
    assert main["enabled"] is True
    assert main["schedules"] and all(s["enabled"] is False for s in main["schedules"])


def test_none_starts_nothing_and_calculate_only_as_it_first_was_is_undone():
    assert (
        schedule_from_trigger(
            {const.CONF_ACTIVE_START_TRIGGER: const.START_TRIGGER_NONE}
        )
        is None
    )
    changes = migration_changes(
        {const.CONF_WATERING_ENABLED: False, const.CONF_FULL_CONTROLLER: True}
    )
    assert changes[const.CONF_FULL_CONTROLLER] is False
    assert changes[const.CONF_DIRECT_VALVE_CONTROL_ENABLED] is False
    assert changes[const.CONF_WATERING_ENABLED] is True


def test_every_kind_of_trigger_has_its_schedule():
    def with_trigger(**trigger):
        return schedule_from_trigger(
            {
                const.CONF_ACTIVE_START_TRIGGER: "t",
                const.CONF_IRRIGATION_START_TRIGGERS: [{"name": "t", **trigger}],
            }
        )

    clock = with_trigger(type="time", at="21:50", offset_minutes=20)
    assert (clock["type"], clock["time"], clock["anchor"]) == ("time", "22:10", "end")
    azimuth = with_trigger(type="solar_azimuth", azimuth_angle=120)
    assert (azimuth["event"], azimuth["azimuth"], azimuth["anchor"]) == (
        "azimuth",
        120,
        "start",
    )
    default = schedule_from_trigger({})
    assert (default["event"], default["anchor"]) == ("sunrise", "end")


def _zones():
    return [
        {const.ZONE_ID: 0, const.ZONE_LINKED_ENTITY: "switch.lawn"},
        {const.ZONE_ID: 1},
        {const.ZONE_ID: 2, const.ZONE_LINKED_ENTITY: "switch.beds"},
    ]


def test_a_first_program_waters_the_zones_with_a_valve():
    [program] = first_program(
        {const.CONF_PAUSE_BETWEEN_ZONES: 20, const.CONF_WATERING_PASSES: 2},
        _zones(),
        [],
        "fr",
    )
    assert program["name"] == "Arrosage"
    assert [s["zones"] for s in program["steps"]] == [[0], [2]]
    assert [s["delay"] for s in program["steps"]] == [20.0, None]
    assert {s["passes"] for s in program["steps"]} == {2}
    # Started at the moment of the start trigger: done by sunrise by default.
    [schedule] = program["schedules"]
    assert (schedule["event"], schedule["anchor"]) == ("sunrise", "end")
    assert "main" not in program and "enabled" not in program


def test_a_first_program_in_parallel_is_one_step():
    [program] = first_program({const.CONF_ZONE_SEQUENCING: "parallel"}, _zones(), None)
    assert [s["zones"] for s in program["steps"]] == [[0, 2]]
    assert program["name"] == "Watering"


def test_programs_that_are_there_are_kept_and_none_starts_nothing():
    there = [{"id": "evening", "steps": []}]
    assert first_program({}, _zones(), there) == there
    [program] = first_program(
        {const.CONF_ACTIVE_START_TRIGGER: const.START_TRIGGER_NONE}, _zones(), []
    )
    assert program["schedules"] == []


def test_only_the_valves_moved_to_the_controller_are_told():
    from custom_components.smart_irrigation.one_choice import moved_the_valves

    moved = migration_changes({const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True})
    assert moved_the_valves(moved) is True
    assert moved_the_valves(migration_changes({})) is False
    assert (
        moved_the_valves(migration_changes({const.CONF_FULL_CONTROLLER: True})) is False
    )


async def test_the_notice_is_confirmed_away():
    from homeassistant.components.repairs import ConfirmRepairFlow

    from custom_components.smart_irrigation import repairs
    from custom_components.smart_irrigation.one_choice import ISSUE_MOVED

    flow = await repairs.async_create_fix_flow(None, ISSUE_MOVED, None)
    assert isinstance(flow, ConfirmRepairFlow)


def test_the_mode_is_read_and_written_as_the_panel_does():
    from custom_components.smart_irrigation.one_choice import (
        current_mode,
        mode_changes,
    )

    assert current_mode({const.CONF_FULL_CONTROLLER: True}) == "water"
    assert current_mode({}) == "calculate"
    assert current_mode({const.CONF_IRRIGATION_ENABLED: False}) == "off"
    water = mode_changes("water", {})
    assert water[const.CONF_FULL_CONTROLLER] is True
    assert water[const.CONF_OBSERVED_WATERING_ENABLED] is True
    assert mode_changes("calculate", {const.CONF_FULL_CONTROLLER: True}) == {
        const.CONF_IRRIGATION_ENABLED: True,
        const.CONF_WATERING_ENABLED: True,
        const.CONF_FULL_CONTROLLER: False,
        const.CONF_DIRECT_VALVE_CONTROL_ENABLED: False,
    }


def test_a_trigger_defined_but_not_active_becomes_a_schedule_switched_off():
    changes = migration_changes(
        {
            const.CONF_FULL_CONTROLLER: True,
            const.CONF_ACTIVE_START_TRIGGER: "evening",
            const.CONF_IRRIGATION_START_TRIGGERS: [
                {"name": "evening", "type": "sunset", "enabled": True},
                {"name": "morning", "type": "time", "at": "06:15", "enabled": True},
            ],
        }
    )
    [main] = changes[const.CONF_PROGRAMS]
    evening, morning = main["schedules"]
    assert (evening["event"], evening["enabled"]) == ("sunset", True)
    assert (morning["type"], morning["time"], morning["enabled"]) == (
        "time",
        "06:15",
        False,
    )


def test_with_none_active_every_defined_trigger_is_kept_switched_off():
    changes = migration_changes(
        {
            const.CONF_FULL_CONTROLLER: True,
            const.CONF_ACTIVE_START_TRIGGER: const.START_TRIGGER_NONE,
            const.CONF_IRRIGATION_START_TRIGGERS: [
                {"name": "evening", "type": "sunset", "offset_minutes": -20},
            ],
        }
    )
    [main] = changes[const.CONF_PROGRAMS]
    [evening] = main["schedules"]
    assert (evening["event"], evening["offset_minutes"], evening["enabled"]) == (
        "sunset",
        -20,
        False,
    )


def test_the_default_active_keeps_the_defined_triggers_switched_off():
    changes = migration_changes(
        {
            const.CONF_FULL_CONTROLLER: True,
            const.CONF_IRRIGATION_START_TRIGGERS: [
                {"name": "noon", "type": "solar_azimuth", "azimuth_angle": 180},
            ],
        }
    )
    [main] = changes[const.CONF_PROGRAMS]
    default, noon = main["schedules"]
    assert (default["event"], default["anchor"], default["enabled"]) == (
        "sunrise",
        "end",
        True,
    )
    assert (noon["event"], noon["azimuth"], noon["enabled"]) == (
        "azimuth",
        180,
        False,
    )


def _recurring(**fields):
    return {
        "id": "schedule_1",
        "name": "Morning",
        "type": "daily",
        "time": "6:15",
        "action": "irrigate",
        "zones": "all",
        **fields,
    }


def test_a_recurring_schedule_that_watered_every_zone_waters_from_the_program():
    """With direct valve control, a recurring schedule irrigating every zone
    opened the valves through the start trigger's path. After the move that
    path only fires the event: it would have watered nothing."""
    weekly = _recurring(
        id="schedule_2",
        type="weekly",
        days_of_week=["Friday", "monday", "someday"],
        time="07:30",
    )
    calculate = _recurring(id="schedule_3", action="calculate")
    changes = migration_changes(
        {
            const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True,
            const.CONF_ACTIVE_START_TRIGGER: "none",
            const.CONF_RECURRING_SCHEDULES: [_recurring(), weekly, calculate],
        }
    )

    [main] = changes[const.CONF_PROGRAMS]
    daily, mon_fri = main["schedules"]
    assert (daily["type"], daily["time"], daily["anchor"], daily["enabled"]) == (
        "time",
        "06:15",
        "start",
        True,
    )
    assert daily["weather"] is True
    assert "weekdays" not in daily
    assert (mon_fri["time"], mon_fri["weekdays"]) == ("07:30", [0, 4])
    # Switched off where they were, as the start trigger is no longer armed;
    # what they did not do stays as it was.
    assert [r["enabled"] for r in changes[const.CONF_RECURRING_SCHEDULES][:2]] == [
        False,
        False,
    ]
    assert changes[const.CONF_RECURRING_SCHEDULES][2] == calculate


def test_recurring_schedules_beside_the_trigger_come_after_its_schedule():
    changes = migration_changes(
        {
            const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True,
            const.CONF_RECURRING_SCHEDULES: [
                _recurring(type="monthly", day_of_month=15)
            ],
        }
    )
    [main] = changes[const.CONF_PROGRAMS]
    sunrise, monthly = main["schedules"]
    assert (sunrise["event"], sunrise["anchor"]) == ("sunrise", "end")
    assert monthly["days_of_month"] == [15]


def test_recurring_schedules_that_did_not_water_every_zone_stay_as_they_are():
    left = [
        _recurring(action="calculate"),
        _recurring(action="update"),
        # A list of zones: the event alone, for an automation of the user's.
        _recurring(zones=[2]),
        _recurring(enabled=False),
        # Every few hours, or between dates: no program schedule says that.
        _recurring(type="interval", interval_hours=6),
        _recurring(start_date="2026-05-01", end_date="2026-09-30"),
        _recurring(type="weekly", days_of_week=[]),
        _recurring(time="late"),
    ]
    assert schedules_from_recurring({const.CONF_RECURRING_SCHEDULES: left}) == (
        [],
        [],
    )


def test_without_valves_a_recurring_schedule_only_fired_its_event():
    """Without direct valve control the start path watered nothing, before the
    move as after it: there is nothing to carry over."""
    for config in (
        {const.CONF_FULL_CONTROLLER: True},
        {},
        {
            const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True,
            const.CONF_WATERING_ENABLED: False,
        },
    ):
        changes = migration_changes(
            {**config, const.CONF_RECURRING_SCHEDULES: [_recurring()]}
        )
        assert const.CONF_RECURRING_SCHEDULES not in changes
