"""The per-zone "next irrigation" sensor and the install-wide binary sensors.

The next run of a zone is the one the panel shows (the Info page's start, or
the planning in full controller mode), for the zones that have something to
water in it. The install-wide binary sensors read the per-zone ones.
"""

from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.binary_sensor import (
    SmartIrrigationAnyZoneBinarySensor,
)
from custom_components.smart_irrigation.zone_outlook import async_zone_next_runs

START = datetime(2026, 11, 3, 6, 0, tzinfo=UTC)


def _zone(zone_id, duration, state=const.ZONE_STATE_AUTOMATIC):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_DURATION: duration,
        const.ZONE_STATE: state,
    }


def _coordinator(zones, *, full=False, planning=None):
    coordinator = MagicMock()
    coordinator.store.async_get_zones = AsyncMock(return_value=zones)
    coordinator.store.config = SimpleNamespace(full_controller=full)
    coordinator.main_program_uses_schedules = lambda: False
    coordinator.async_planning = AsyncMock(return_value=planning or [])
    return coordinator


def _info(**extra):
    return {
        "next_irrigation_start": START.isoformat(),
        "zone_estimates": {},
        "durations_estimated": False,
        "skip_preview": {"should_skip": False},
        **extra,
    }


async def _runs(coordinator, info):
    with patch(
        "custom_components.smart_irrigation.websockets.build_irrigation_info",
        AsyncMock(return_value=info),
    ):
        return await async_zone_next_runs(MagicMock(), coordinator)


async def test_the_start_trigger_waters_the_zones_with_something_to_water():
    zones = [
        _zone(0, 600),
        _zone(1, 0),
        _zone(2, 300, const.ZONE_STATE_DISABLED),
    ]

    runs = await _runs(_coordinator(zones), _info())

    assert runs[0] == {"start": START, "seconds": 600, "skip": False}
    assert runs[1] is None
    assert runs[2] is None


async def test_the_estimate_is_the_run_when_the_zones_are_calculated_at_the_start():
    runs = await _runs(
        _coordinator([_zone(0, 0)]),
        _info(
            durations_estimated=True,
            zone_estimates={"0": {"duration": 420}},
            skip_preview={"should_skip": True},
        ),
    )

    assert runs[0] == {"start": START, "seconds": 420, "skip": True}


async def test_in_full_controller_mode_the_soonest_planned_run_with_the_zone():
    later = START.replace(hour=20)
    planning = [
        {
            "start": START.isoformat(),
            "schedule_id": "s1",
            "skipped_reason": None,
            "steps": [{"zones": [{"zone_id": 0, "seconds": 0}]}],
        },
        {
            "start": later.isoformat(),
            "schedule_id": "s2",
            "skipped_reason": "precipitation",
            "sheltered_zone_ids": [1],
            "steps": [
                {"zones": [{"zone_id": 0, "seconds": 300}]},
                {"zones": [{"zone_id": 1, "seconds": 200}]},
            ],
        },
    ]

    runs = await _runs(
        _coordinator([_zone(0, 0), _zone(1, 0)], full=True, planning=planning),
        _info(),
    )

    assert runs[0] == {"start": later, "seconds": 300, "skip": True}
    # Under glass: the rain forecast does not hold it back.
    assert runs[1] == {"start": later, "seconds": 200, "skip": False}


def _member(suffix, name, on, entity_id):
    return SimpleNamespace(
        suffix=suffix, _zone_name=name, is_on=on, hass=object(), entity_id=entity_id
    )


def test_a_zone_that_needs_water_turns_the_install_wide_sensor_on():
    hass = MagicMock()
    hass.data = {
        const.DOMAIN: {
            "zone_binary_sensors": {
                0: [
                    _member("irrigation_needed", "Lawn", True, "binary_sensor.a"),
                    _member("problem", "Lawn", False, "binary_sensor.b"),
                ],
                1: [_member("irrigation_needed", "Hedge", False, "binary_sensor.c")],
            }
        }
    }
    needs = SmartIrrigationAnyZoneBinarySensor(
        hass, "any_zone_needs_water", "irrigation_needed", "mdi:water-alert"
    )
    problem = SmartIrrigationAnyZoneBinarySensor(
        hass, "any_problem", "problem", "mdi:alert-circle-outline"
    )

    needs._recompute()
    problem._recompute()

    assert needs.is_on is True
    assert needs.extra_state_attributes == {"zones": ["Lawn"]}
    assert problem.is_on is False
    assert needs.unique_id == f"{const.DOMAIN}_any_zone_needs_water"


def test_a_removed_zone_entity_is_not_read():
    hass = MagicMock()
    gone = _member("problem", "Old", True, "binary_sensor.x")
    gone.hass = None
    hass.data = {const.DOMAIN: {"zone_binary_sensors": {0: [gone]}}}
    problem = SmartIrrigationAnyZoneBinarySensor(
        hass, "any_problem", "problem", "mdi:alert-circle-outline"
    )

    problem._recompute()

    assert problem.is_on is False
