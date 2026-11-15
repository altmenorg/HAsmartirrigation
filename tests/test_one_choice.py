"""Moving an installation to the one choice of what Smart Irrigation does."""

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.one_choice import (
    migration_changes,
    schedule_from_trigger,
    seed_main_schedules,
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


def test_a_main_program_without_schedules_is_seeded_once():
    seeded = seed_main_schedules({}, [_main()])
    assert len(seeded[0]["schedules"]) == 1
    again = seed_main_schedules({}, seeded)
    assert again == seeded


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
