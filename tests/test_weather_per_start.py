"""The weather is judged at each start for what is measured, once a day for the day.

With programs of their own (a lawn at 06:00, the beds at 18:00), a frost at
06:00 must not hold back the 18:00 run on a mild evening: the readings of the
moment (postponement, rain sensor, frost, wind) are judged at each start. The
conditions about the day (rain forecast, days between irrigation) are decided
at the day's first start and kept for the day: the morning run resets the days
since the last irrigation, and must not hold the evening run back for it.
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock
from zoneinfo import ZoneInfo

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_scheduler import ProgramSchedulerMixin
from custom_components.smart_irrigation.skip_conditions import SkipConditionsMixin
from custom_components.smart_irrigation.triggers import TriggersMixin

PARIS = ZoneInfo("Europe/Paris")

_METHODS = {
    "postponed": "_evaluate_postponed",
    "rain_sensor": "_evaluate_rain_sensor",
    "freeze": "_evaluate_freeze",
    "wind": "_evaluate_wind",
    "precipitation": "_evaluate_precipitation_forecast",
    "days_between": "_evaluate_days_between_irrigation",
    "soil_moisture": "_evaluate_soil_moisture",
}


@pytest.fixture(autouse=True)
def _paris_clock(freezer):
    previous = dt_util.DEFAULT_TIME_ZONE
    dt_util.set_default_time_zone(PARIS)
    freezer.move_to("2026-06-01 04:00:00+00:00")  # Monday 06:00 in Paris
    yield
    dt_util.set_default_time_zone(previous)


class Day(ProgramSchedulerMixin, TriggersMixin, SkipConditionsMixin):
    """A day of starts: each check says what ``vetoing`` holds at the time."""

    def __init__(self):
        self.vetoing: set = set()
        self.asked: list = []
        for check_id, method in _METHODS.items():
            setattr(self, method, self._check(check_id))
        self._watering_decision_today = None
        self._day_checks = None
        self._last_skip_evaluation = None
        self._zones_held_by_days_between = set()
        self._watering_prepared_today = False
        self._soil_moisture_hold_applied = False
        self._start_event_fired_today = False
        self._fired_triggers_today = set()
        for hold in (
            "_hold_back_zones_held_by_days_between",
            "_hold_back_zones_with_moist_soil",
            "_hold_back_zones_exposed_to_rain",
            "_apply_rain_since_calculation",
            "_apply_forecast_rain_credit",
            "_apply_rain_history_suppression",
            "_recalculate_before_start",
            "_count_precipitation_skip",
            "_increment_days_since_irrigation",
        ):
            setattr(self, hold, AsyncMock())
        self.async_zones_held_by_days_between = AsyncMock(return_value=set())
        self.async_zones_sheltered_from_rain = AsyncMock(return_value=set())
        self.hass = MagicMock()
        self.hass.async_create_task = lambda coro: coro.close()

    def _check(self, check_id):
        async def evaluate(*_args, **_kwargs):
            self.asked.append(check_id)
            return {
                "id": check_id,
                "enabled": True,
                "available": True,
                "skip": check_id in self.vetoing,
            }

        return evaluate

    def skipped_events(self):
        return [
            call.args[1]
            for call in self.hass.bus.fire.call_args_list
            if call.args[0].endswith(const.EVENT_IRRIGATE_SKIPPED)
        ]

    async def start(self, name, conditions=None):
        go, _ = await self._prepare_program_watering(
            name, {"trigger_name": name, "program_id": name}, conditions
        )
        return go


async def test_a_frost_at_06_00_does_not_hold_back_the_18_00_run(freezer):
    day = Day()
    day.vetoing = {"freeze"}

    assert await day.start("lawn") is False

    freezer.move_to("2026-06-01 16:00:00+00:00")  # 18:00, 15 C
    day.vetoing = set()
    assert await day.start("beds") is True

    # The frost was read again at 18:00.
    assert day.asked.count("freeze") == 2
    # The 06:00 skip said which condition held which start back.
    [event] = day.skipped_events()
    assert event["program_id"] == "lawn"
    assert event["reason"] == "freeze"
    # And the last decision the panel shows is the 18:00 one.
    assert day._last_skip_evaluation["should_skip"] is False


async def test_a_frost_at_18_00_holds_back_the_evening_run_after_a_mild_morning(
    freezer,
):
    day = Day()
    assert await day.start("lawn") is True

    freezer.move_to("2026-06-01 16:00:00+00:00")
    day.vetoing = {"wind"}
    assert await day.start("beds") is False
    assert day.skipped_events()[0]["reason"] == "wind"


async def test_a_rain_forecast_holds_the_whole_day(freezer):
    day = Day()
    day.vetoing = {"precipitation"}
    assert await day.start("lawn") is False

    # The forecast has changed by the evening: the day was decided.
    freezer.move_to("2026-06-01 16:00:00+00:00")
    day.vetoing = set()
    assert await day.start("beds") is False

    assert day.asked.count("precipitation") == 1
    assert [e["reason"] for e in day.skipped_events()] == [
        "precipitation",
        "precipitation",
    ]
    # One day held back by the forecast, whatever the number of starts.
    day._count_precipitation_skip.assert_awaited_once()


async def test_the_days_between_decided_in_the_morning_let_the_evening_run_go(
    freezer,
):
    day = Day()
    assert await day.start("lawn") is True

    # The morning run reset the counters: read now, it would hold back.
    freezer.move_to("2026-06-01 16:00:00+00:00")
    day.vetoing = {"days_between"}
    assert await day.start("beds") is True
    assert day.asked.count("days_between") == 1
    [days] = [
        c for c in day._last_skip_evaluation["checks"] if c["id"] == "days_between"
    ]
    assert days["decided_for_the_day"] is True


async def test_a_postponement_is_judged_at_each_start(freezer):
    # Asked for at noon, after the morning run: the evening run is held back.
    day = Day()
    assert await day.start("lawn") is True

    freezer.move_to("2026-06-01 16:00:00+00:00")
    day.vetoing = {"postponed"}
    assert await day.start("beds") is False
    assert day.skipped_events()[0]["reason"] == "postponed"


async def test_a_new_day_decides_the_day_again(freezer):
    day = Day()
    day.vetoing = {"precipitation"}
    assert await day.start("lawn") is False

    freezer.move_to("2026-06-02 04:00:00+00:00")
    day._reset_event_fired_today()
    day.vetoing = set()
    assert await day.start("lawn") is True


async def test_a_schedules_own_list_still_applies(freezer):
    day = Day()
    day.vetoing = {"freeze", "precipitation"}

    # Only the wind: neither the frost nor the forecast holds it back.
    assert await day.start("drip", ["wind"]) is True
    # Without a list, both apply: the frost is the first to say so.
    assert await day.start("lawn") is False
    assert day.skipped_events()[0]["reason"] == "freeze"
    # The day was decided at the first start, whatever its list.
    assert day.asked.count("precipitation") == 1


async def test_a_list_without_the_forecast_waters_on_a_day_it_holds_back():
    day = Day()
    day.vetoing = {"precipitation"}

    assert await day.start("lawn") is False
    assert await day.start("drip", ["freeze", "wind"]) is True


async def test_after_a_restart_on_a_day_that_had_its_start_the_day_holds_nothing():
    day = Day()
    # As __init__ sets it when today's start had fired before the restart.
    day._watering_decision_today = True
    day.vetoing = {"days_between"}

    assert await day.start("beds") is True
    assert "days_between" not in day.asked


async def test_the_preview_of_a_start_later_today_keeps_the_days_decision(freezer):
    day = Day()
    assert await day.start("lawn") is True
    day.vetoing = {"days_between", "wind"}
    live = await day.async_evaluate_skip_conditions()

    evening = datetime(2026, 6, 1, 18, 0, tzinfo=PARIS)
    shown = day.with_the_days_decision(live, evening)

    by_id = {c["id"]: c for c in shown["checks"]}
    # The day's decision for the days between, the wind as it reads now.
    assert by_id["days_between"]["skip"] is False
    assert by_id["wind"]["skip"] is True
    assert shown["reason"] == "wind"

    # Tomorrow is not decided yet: shown as evaluated.
    tomorrow = datetime(2026, 6, 2, 6, 0, tzinfo=PARIS).astimezone(UTC)
    assert day.with_the_days_decision(live, tomorrow) is live
