"""A zone with no valve, under full control, is not promised a run (#969).

The main program opens a zone's linked valve and leaves a zone with none out
of its run. The zone, the Info page, the card and the planning said it would
water all the same, from its duration alone, and the planning gave the wrong
reason for its empty run. Such a zone is a setup that isn't finished: the Info
page and the planning name it, and the run they announce leaves it out. The
start is still placed, and its event still fires, as before.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from custom_components.smart_irrigation import const, websockets
from custom_components.smart_irrigation.delivery import zones_without_valve
from tests.test_main_program_schedules import _main, _status_with
from tests.test_program_status import _paris_clock  # noqa: F401

LAWN = {
    const.ZONE_ID: 0,
    const.ZONE_NAME: "Lawn",
    const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
    const.ZONE_DURATION: 3081,
}
HEDGE = {
    const.ZONE_ID: 1,
    const.ZONE_NAME: "Hedge",
    const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
    const.ZONE_DURATION: 300,
    const.ZONE_LINKED_ENTITY: "switch.hedge",
}

# --- which zones ---------------------------------------------------------------


def test_a_zone_owed_a_run_with_no_valve_is_named():
    assert zones_without_valve([LAWN, HEDGE]) == [{"id": 0, "name": "Lawn"}]


def test_a_zone_with_nothing_to_water_or_turned_off_is_not():
    dry = {**LAWN, const.ZONE_DURATION: 0}
    off = {**LAWN, const.ZONE_STATE: const.ZONE_STATE_DISABLED}

    assert zones_without_valve([dry, off]) == []


def test_a_manual_zone_counts_as_the_main_program_waters_it():
    manual = {**LAWN, const.ZONE_STATE: const.ZONE_STATE_MANUAL}

    assert zones_without_valve([manual]) == [{"id": 0, "name": "Lawn"}]


def test_the_durations_of_the_next_run_replace_the_stored_ones():
    assert zones_without_valve([LAWN], {0: 0}) == []
    assert zones_without_valve([{**LAWN, const.ZONE_DURATION: 0}], {0: 600}) == [
        {"id": 0, "name": "Lawn"}
    ]


# --- the Info page --------------------------------------------------------------


def _info_coordinator(full_controller):
    coordinator = MagicMock()
    coordinator.main_program_uses_schedules = lambda: False
    coordinator.async_main_program_next_start = AsyncMock(return_value=None)
    coordinator.store.async_get_zones = AsyncMock(return_value=[LAWN, HEDGE])
    coordinator.store.async_get_config = AsyncMock(return_value={})
    coordinator.store.config = SimpleNamespace(
        full_controller=full_controller, programs=[]
    )

    async def _total(durations=None):
        durations = durations or {}
        return sum(
            durations.get(z[const.ZONE_ID], z[const.ZONE_DURATION])
            for z in (LAWN, HEDGE)
        )

    coordinator.get_total_duration_all_enabled_zones = AsyncMock(side_effect=_total)
    coordinator.async_estimate_all_zones_now = AsyncMock(return_value={})
    coordinator._planned_durations = AsyncMock(return_value={})
    coordinator.async_evaluate_skip_conditions = AsyncMock(
        return_value={"should_skip": False, "reason": None, "checks": []}
    )
    return coordinator


async def _info(full_controller):
    hass = MagicMock()
    hass.states.get.return_value = None
    coordinator = _info_coordinator(full_controller)
    info = await websockets.build_irrigation_info(hass, coordinator)
    assert info.get("error") is None
    return info


async def test_under_full_control_the_next_run_leaves_the_zone_out():
    info = await _info(True)

    assert info["next_irrigation_zones"] == ["Hedge"]
    assert info["next_irrigation_duration"] == 300
    assert info["zones_without_valve"] == [{"id": 0, "name": "Lawn"}]


async def test_the_start_is_still_placed_for_the_whole_run():
    """The event still fires for it: where the start lands does not change."""
    with_valve = await _info(True)
    without = await _info(False)

    assert with_valve["next_irrigation_start"] == without["next_irrigation_start"]


async def test_without_full_control_a_zone_with_no_valve_is_watered_by_you():
    """An automation on the event, or Irrigation Unlimited, waters it."""
    info = await _info(False)

    assert info["next_irrigation_zones"] == ["Lawn", "Hedge"]
    assert info["next_irrigation_duration"] == 3381
    assert info["zones_without_valve"] == []


# --- the planning ---------------------------------------------------------------


async def test_the_planning_names_the_zone_the_main_program_leaves_out():
    hass, coord = _status_with([_main([{"time": "06:00"}])])
    coord.store.by_id[0][const.ZONE_LINKED_ENTITY] = None
    coord.store.by_id[0][const.ZONE_NAME] = "Lawn"

    [first, *_] = await coord.async_planning(1)

    assert [z["zone_id"] for s in first["steps"] for z in s["zones"]] == [1]
    assert first["zones_without_valve"] == [{"zone_id": 0, "zone": "Lawn"}]


async def test_an_empty_run_says_why_when_no_zone_has_a_valve():
    hass, coord = _status_with([_main([{"time": "06:00"}])])
    for stored in coord.store.by_id.values():
        stored[const.ZONE_LINKED_ENTITY] = None

    [first, *_] = await coord.async_planning(1)

    assert first["nothing_to_water"] is True
    assert first["zones_without_valve"] == [
        {"zone_id": 0, "zone": "Zone 0"},
        {"zone_id": 1, "zone": "Zone 1"},
    ]


async def test_other_programs_carry_no_such_list():
    """Their steps name their zones; plan_program leaves a zone with no valve
    out of them, and it is not theirs to report."""
    from tests.test_program_status import _program

    hass, coord = _status_with([_program([{"time": "06:00"}])])
    coord.store.by_id[0][const.ZONE_LINKED_ENTITY] = None

    [first, *_] = await coord.async_planning(1)

    assert first["zones_without_valve"] == []
