"""The planning judges each run as it will be at its own start.

UX walk of 13 Nov.: an adjustment of 50 % "until 21:05 today" still halved the
runs of the next two days in the planning (Q2); a program suspended for 30 hours
was listed for the next morning as any other (Q3); and a schedule that left the
rain forecast out of its conditions was still shown as held back by the rain
(Q20). The scheduler did none of these things.
"""

from datetime import timedelta

import homeassistant.util.dt as dt_util

from custom_components.smart_irrigation import const
from tests.test_planning_forecast import (  # noqa: F401
    RAINY,
    _paris_clock,  # noqa: F401
    _planning_coordinator,
)

DRY = {**RAINY, "skip": False, "forecast_mm": 0.0, "expected_mm": 0.0}


def _seconds(planned):
    return [p["expected_seconds"] for p in planned]


async def test_an_adjustment_counts_only_for_the_runs_before_its_end():
    coord = _planning_coordinator(DRY)
    # 05:00 now; the runs are at 06:00 today, tomorrow and the day after.
    coord.store.config.program_adjustments = {
        "evening": {
            "percent": 50,
            "seconds": None,
            "until": (dt_util.utcnow() + timedelta(hours=3)).isoformat(),
        }
    }

    planned = await coord.async_planning(3)

    assert _seconds(planned) == [300, 600, 600]
    assert planned[0]["steps"][0]["zones"][0]["expected_seconds"] == 150
    assert planned[1]["steps"][0]["zones"][0]["expected_seconds"] == 300


async def test_an_adjustment_without_an_end_counts_for_every_run():
    coord = _planning_coordinator(DRY)
    coord.store.config.program_adjustments = {
        "evening": {"percent": 50, "seconds": None, "until": None}
    }

    planned = await coord.async_planning(3)

    assert _seconds(planned) == [300, 300, 300]


async def test_a_run_before_the_end_of_a_suspension_does_not_take_place():
    coord = _planning_coordinator(RAINY)
    until = dt_util.utcnow() + timedelta(hours=30)
    coord.store.config.suspensions = {
        f"{const.SUSPEND_PROGRAM}:evening": until.isoformat()
    }

    planned = await coord.async_planning(3)

    assert [p["skipped_reason"] for p in planned] == [
        "suspended",
        "suspended",
        None,
    ]
    assert dt_util.parse_datetime(planned[0]["suspended_until"]) == until
    # A suspended run is not asked about the weather.
    assert coord._evaluate_precipitation_forecast.await_count == 0


async def test_a_schedule_without_the_rain_forecast_is_not_held_back_by_it():
    coord = _planning_coordinator(
        RAINY,
        schedule={
            "time": "06:00",
            "skip_conditions": ["postponed", "freeze", "wind"],
        },
    )

    planned = await coord.async_planning(1)

    assert planned[0]["skipped_reason"] is None
    coord._evaluate_precipitation_forecast.assert_not_awaited()


async def test_a_schedule_that_keeps_the_rain_forecast_is_held_back_by_it():
    coord = _planning_coordinator(
        RAINY,
        schedule={"time": "06:00", "skip_conditions": ["precipitation"]},
    )

    planned = await coord.async_planning(1)

    assert planned[0]["skipped_reason"] == "precipitation"
