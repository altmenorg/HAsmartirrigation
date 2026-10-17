"""What a program will water, the same everywhere, and said when it is nothing (#912).

Reported on the alpha: a program with a calculated step and a schedule at 20:25
was missing from the planning, which said "no program is planned", while the
zone's bucket had been set by hand to -9 mm, past its 7 mm threshold. Three
things lined up:

- setting the bucket by hand left the duration the last calculation had
  stored, 0, and the step waters that duration;
- the planning left out a program with nothing to water, so the schedule
  looked missing rather than empty;
- the steps of the programs read the stored durations even with the
  recalculation before the start on, where the main program reads the estimate
  of what that calculation will find, and a schedule that ignores the weather
  did not recalculate at all.
"""

from unittest.mock import AsyncMock, MagicMock

from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from tests.runner_doubles import zone
from tests.test_program_scheduler import Scheduler, armed  # noqa: F401
from tests.test_program_scheduler import _program as _sched_program
from tests.test_program_status import (
    _paris_clock,  # noqa: F401
    _program,
    _status,
    _utc,
)


async def test_a_schedule_with_nothing_to_water_is_in_the_planning():
    hass, coord = _status([_program([{"time": "20:25"}])])
    for stored in coord.store.by_id.values():
        stored[const.ZONE_DURATION] = 0

    planned = await coord.async_planning(1)

    assert [p["start"] for p in planned] == [_utc(1, 20, 25).isoformat()]
    assert planned[0]["nothing_to_water"] is True
    assert planned[0]["steps"] == []


async def test_a_schedule_with_water_says_it_has_some():
    hass, coord = _status([_program([{"time": "20:25"}])])

    [planned] = await coord.async_planning(1)

    assert planned["nothing_to_water"] is False
    assert planned["steps"]


async def test_the_programs_plan_on_the_estimate_when_the_start_recalculates():
    hass, coord = _status([_program([{"time": "20:25"}], steps=[{"zones": [0]}])])
    coord.store.config.recalculate_before_start = True
    coord.store.async_get_config = AsyncMock(
        return_value={const.CONF_RECALCULATE_BEFORE_START: True}
    )
    coord.async_estimate_all_zones_now = AsyncMock(
        return_value={"0": {"duration": 900}, "1": {"duration": 0}}
    )

    [planned] = await coord.async_planning(1)

    assert planned["steps"][0]["zones"][0]["seconds"] == 900


async def test_the_planning_shows_the_run_the_start_is_placed_for():
    """Forecast rain credited, as the start is: the page said 28 min, the
    planning's total 26, and its zones added up to 29."""
    hass, coord = _status([_program([{"time": "20:25"}], steps=[{"zones": [0]}])])
    coord.store.config.recalculate_before_start = True
    coord.store.async_get_config = AsyncMock(
        return_value={const.CONF_RECALCULATE_BEFORE_START: True}
    )
    coord.async_estimate_all_zones_now = AsyncMock(
        return_value={"0": {"duration": 900, "bucket": -3.0}}
    )
    coord._planned_forecast_credit = AsyncMock(return_value=(1.0, set()))
    coord._duration_with_forecast_rain = lambda zone, bucket_mm, mm: 600

    [planned] = await coord.async_planning(1)

    assert planned["steps"][0]["zones"][0]["seconds"] == 600


async def test_without_the_recalculation_the_stored_durations_stand():
    hass, coord = _status([_program([{"time": "20:25"}], steps=[{"zones": [0]}])])
    coord.store.config.recalculate_before_start = False
    coord.async_estimate_all_zones_now = AsyncMock(
        return_value={"0": {"duration": 900}}
    )

    [planned] = await coord.async_planning(1)

    assert planned["steps"][0]["zones"][0]["seconds"] == 300
    coord.async_estimate_all_zones_now.assert_not_awaited()


async def test_a_schedule_that_ignores_the_weather_still_recalculates(
    armed,  # noqa: F811
):
    scheduler = Scheduler([_sched_program([{"time": "06:00", "weather": False}])])
    scheduler._recalculate_before_start = AsyncMock()

    await scheduler._fire_program_schedule("evening", "schedule_1", _utc(1, 6))

    scheduler._recalculate_before_start.assert_awaited_once()
    scheduler.async_run_program.assert_awaited_once()


def _coordinator(zones):
    coord = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coord.hass = MagicMock()
    coord.hass.config.units = METRIC_SYSTEM
    coord.store = MagicMock()
    by_id = {z[const.ZONE_ID]: z for z in zones}
    coord.store.get_zone = lambda zone_id: by_id.get(int(zone_id))
    return coord


def test_a_bucket_set_by_hand_brings_the_duration_with_it():
    # 12 mm/h: 9 mm of deficit is 2700 s, past the 7 mm threshold.
    coord = _coordinator(
        [zone(0, **{const.ZONE_DURATION: 0, const.ZONE_IRRIGATION_THRESHOLD: 7})]
    )

    for key in (const.ATTR_NEW_BUCKET_VALUE, const.ZONE_BUCKET):
        changes = coord._with_duration_of_bucket(0, {key: -9.0})
        assert changes[const.ZONE_DURATION] == 2700


def test_a_bucket_short_of_the_threshold_or_full_needs_nothing():
    coord = _coordinator(
        [zone(0, **{const.ZONE_DURATION: 600, const.ZONE_IRRIGATION_THRESHOLD: 7})]
    )

    assert (
        coord._with_duration_of_bucket(0, {const.ZONE_BUCKET: -5.0})[
            const.ZONE_DURATION
        ]
        == 0
    )
    assert (
        coord._with_duration_of_bucket(0, {const.ZONE_BUCKET: 2.0})[const.ZONE_DURATION]
        == 0
    )


def test_a_manual_zone_or_a_duration_given_alongside_is_left_alone():
    coord = _coordinator(
        [zone(0, **{const.ZONE_STATE: const.ZONE_STATE_MANUAL}), zone(1)]
    )

    assert const.ZONE_DURATION not in coord._with_duration_of_bucket(
        0, {const.ZONE_BUCKET: -9.0}
    )
    assert (
        coord._with_duration_of_bucket(
            1, {const.ZONE_BUCKET: -9.0, const.ZONE_DURATION: 42}
        )[const.ZONE_DURATION]
        == 42
    )


def test_a_change_without_a_bucket_does_not_touch_the_duration():
    coord = _coordinator([zone(0)])

    assert coord._with_duration_of_bucket(0, {const.ZONE_NAME: "Lawn"}) == {
        const.ZONE_NAME: "Lawn"
    }


_MAIN = {"id": "main", "name": "Main program", "main": True, "enabled": True}


async def test_the_main_program_started_by_the_trigger_is_in_the_planning():
    """A garden watered every morning by the start trigger was "not planned".

    Without schedules of its own, the main program is started by the trigger,
    whose time the Info page works out and hands over here.
    """
    hass, coord = _status([_MAIN])
    coord._planned_run_seconds = AsyncMock(return_value=600)

    [planned] = await coord.async_planning(1, trigger_start=_utc(1, 8))

    assert planned["program_id"] == "main"
    assert planned["start"] == _utc(1, 8).isoformat()
    assert planned["schedule_id"] is None
    assert planned["steps"]


async def test_without_a_trigger_time_the_main_program_is_not_invented():
    hass, coord = _status([_MAIN])
    coord._planned_run_seconds = AsyncMock(return_value=600)

    assert await coord.async_planning(1) == []
    # Beyond the days asked for, it is not listed either.
    assert await coord.async_planning(1, trigger_start=_utc(5, 8)) == []
