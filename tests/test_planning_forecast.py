"""The planning says when the forecast would hold a planned run back."""

from datetime import datetime
from unittest.mock import AsyncMock
from zoneinfo import ZoneInfo

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation.program_scheduler import ProgramSchedulerMixin
from custom_components.smart_irrigation.programs import normalize_programs
from tests.runner_doubles import Coordinator, make_hass, make_store, zone

PARIS = ZoneInfo("Europe/Paris")


class Status(ProgramSchedulerMixin, Coordinator):
    def _sun_moment(self, event, day):
        return datetime(day.year, day.month, day.day, 7, 30, tzinfo=PARIS)


@pytest.fixture(autouse=True)
def _paris_clock(freezer, monkeypatch):
    previous = dt_util.DEFAULT_TIME_ZONE
    dt_util.set_default_time_zone(PARIS)
    freezer.move_to("2026-06-01 03:00:00+00:00")  # 05:00 in Paris
    yield
    dt_util.set_default_time_zone(previous)


def _planning_coordinator(check, schedule=None, sheltered=()):
    hass = make_hass()
    store = make_store([zone(0), zone(1)])
    store.config.full_controller = True
    store.config.programs = normalize_programs(
        [
            {
                "id": "evening",
                "name": "Evening",
                "steps": [{"zones": [0]}, {"zones": [1]}],
                "schedules": [schedule or {"time": "06:00"}],
            }
        ]
    )
    store.config.program_last_runs = None
    store.config.suspensions = None
    coord = Status(hass, store)
    coord._evaluate_precipitation_forecast = AsyncMock(return_value=check)
    coord.async_zones_sheltered_from_rain = AsyncMock(return_value=set(sheltered))
    return coord


RAINY = {
    "id": "precipitation",
    "enabled": True,
    "available": True,
    "skip": True,
    "forecast_mm": 9.0,
    "expected_mm": 8.0,
    "threshold_mm": 2.0,
}


async def test_a_run_the_forecast_holds_back_carries_the_reason():
    coord = _planning_coordinator(RAINY)

    planned = await coord.async_planning(3)

    first = planned[0]
    assert first["skipped_reason"] == "precipitation"
    assert first["forecast"] == {
        "forecast_mm": 9.0,
        "expected_mm": 8.0,
        "threshold_mm": 2.0,
    }
    assert first["forecast_known"] is True
    assert first["expected_seconds"] == 600
    assert first["steps"][0]["zones"][0]["expected_seconds"] == 300
    # The forecast is asked about the run's own start.
    starts = [
        c.kwargs["run_start"] for c in coord._evaluate_precipitation_forecast.mock_calls
    ]
    assert starts[0] == datetime(2026, 6, 1, 6, tzinfo=PARIS)


async def test_days_beyond_the_forecast_get_no_reason():
    coord = _planning_coordinator(RAINY)

    planned = await coord.async_planning(3)

    # 06:00 on the 1st and 2nd are within 48 hours of 05:00 on the 1st, the 3rd is not.
    assert [p["skipped_reason"] for p in planned] == ["precipitation"] * 2 + [None]
    assert planned[2]["forecast_known"] is False
    assert coord._evaluate_precipitation_forecast.await_count == 2


async def test_a_run_that_goes_ahead_has_no_reason_but_a_known_forecast():
    dry = {**RAINY, "skip": False, "forecast_mm": 0.0, "expected_mm": 0.0}
    coord = _planning_coordinator(dry)

    [first, *_] = await coord.async_planning(1)

    assert first["skipped_reason"] is None
    assert first["forecast_known"] is True


@pytest.mark.parametrize(
    "check",
    [
        {**RAINY, "enabled": False, "skip": False},
        {**RAINY, "available": False, "skip": False},
        None,
    ],
)
async def test_an_unknown_or_disabled_forecast_gives_no_reason(check):
    coord = _planning_coordinator(check)

    [first, *_] = await coord.async_planning(1)

    assert first["skipped_reason"] is None
    assert first["forecast_known"] is False


async def test_a_schedule_that_ignores_the_weather_is_never_predicted_skipped():
    coord = _planning_coordinator(RAINY, {"time": "06:00", "weather": False})

    [first, *_] = await coord.async_planning(1)

    assert first["skipped_reason"] is None
    coord._evaluate_precipitation_forecast.assert_not_awaited()


async def test_a_run_of_sheltered_zones_only_is_not_held_back():
    coord = _planning_coordinator(RAINY, sheltered={0, 1})

    [first, *_] = await coord.async_planning(1)

    assert first["skipped_reason"] is None


async def test_an_error_in_the_forecast_does_not_break_the_planning():
    coord = _planning_coordinator(RAINY)
    coord._evaluate_precipitation_forecast = AsyncMock(side_effect=RuntimeError("x"))

    planned = await coord.async_planning(1)

    assert planned and planned[0]["skipped_reason"] is None


async def test_without_the_skip_logic_the_planning_is_as_before():
    coord = _planning_coordinator(RAINY)
    del coord._evaluate_precipitation_forecast  # an instance attribute only
    del coord.async_zones_sheltered_from_rain

    [first, *_] = await coord.async_planning(1)

    assert first["skipped_reason"] is None
    assert first["forecast_known"] is False
