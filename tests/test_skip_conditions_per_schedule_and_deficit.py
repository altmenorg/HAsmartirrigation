"""A schedule's own skip conditions, and a step's threshold on the water deficit."""

from unittest.mock import AsyncMock, MagicMock

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_runner import (
    ProgramRun,
    ProgramRunnerMixin,
)
from custom_components.smart_irrigation.program_scheduler import ProgramSchedulerMixin
from custom_components.smart_irrigation.programs import (
    below_deficit,
    normalize_step,
    plan_program,
)
from custom_components.smart_irrigation.schedules import (
    normalize_schedules,
    schedule_skip_conditions,
)
from custom_components.smart_irrigation.skip_conditions import SkipConditionsMixin

# --- F1: the list on the schedule ---------------------------------------------


def _stored(extra):
    return normalize_schedules([{"time": "06:00", **extra}])[0]


def test_no_list_is_stored_when_none_is_given():
    stored = _stored({})
    assert const.SCHEDULE_SKIP_CONDITIONS not in stored
    assert schedule_skip_conditions(stored) is None


def test_the_list_keeps_known_names_only_in_the_usual_order():
    stored = _stored({"skip_conditions": ["wind", "bogus", "freeze", "wind"]})
    assert stored[const.SCHEDULE_SKIP_CONDITIONS] == ["freeze", "wind"]


def test_an_empty_list_is_kept_and_a_non_list_means_all():
    assert _stored({"skip_conditions": []})[const.SCHEDULE_SKIP_CONDITIONS] == []
    assert const.SCHEDULE_SKIP_CONDITIONS not in _stored({"skip_conditions": "wind"})


def test_the_names_the_panel_may_offer_are_the_ones_the_checks_report():
    assert set(const.SKIP_CONDITION_IDS) == {
        "postponed",
        "rain_sensor",
        "freeze",
        "wind",
        "precipitation",
        "days_between",
        "soil_moisture",
    }


class Checks(SkipConditionsMixin):
    """The decision with every check replaced by one that says what it is told."""

    def __init__(self, vetoing=()):
        self.asked = []
        for check_id in const.SKIP_CONDITION_IDS:
            setattr(self, self._method(check_id), self._check(check_id, vetoing))

    @staticmethod
    def _method(check_id):
        return {
            "postponed": "_evaluate_postponed",
            "rain_sensor": "_evaluate_rain_sensor",
            "freeze": "_evaluate_freeze",
            "wind": "_evaluate_wind",
            "precipitation": "_evaluate_precipitation_forecast",
            "days_between": "_evaluate_days_between_irrigation",
            "soil_moisture": "_evaluate_soil_moisture",
        }[check_id]

    def _check(self, check_id, vetoing):
        async def evaluate(*_args, **_kwargs):
            self.asked.append(check_id)
            return {"id": check_id, "skip": check_id in vetoing}

        return evaluate


async def test_without_a_list_every_condition_is_judged():
    checks = Checks(vetoing={"wind"})
    result = await checks.async_evaluate_skip_conditions()
    assert checks.asked == list(const.SKIP_CONDITION_IDS)
    assert result["should_skip"] and result["reason"] == "wind"


async def test_a_subset_judges_only_those_conditions():
    checks = Checks(vetoing={"wind", "freeze"})
    result = await checks.async_evaluate_skip_conditions(only=["freeze"])
    assert checks.asked == ["postponed", "freeze"]
    assert result["reason"] == "freeze"
    # A condition left out cannot veto, even if it would have.
    checks = Checks(vetoing={"wind"})
    result = await checks.async_evaluate_skip_conditions(only=["freeze"])
    assert not result["should_skip"]


async def test_the_users_postponement_applies_even_with_an_empty_list():
    checks = Checks(vetoing={"postponed", "wind"})
    result = await checks.async_evaluate_skip_conditions(only=[])
    assert checks.asked == ["postponed"]
    assert result["reason"] == "postponed"


class Scheduler(ProgramSchedulerMixin):
    def __init__(self, should_skip, reason=None):
        self._watering_decision_today = None
        self._last_skip_evaluation = None
        self._zones_held_by_days_between = {9}
        self.async_evaluate_skip_conditions = AsyncMock(
            return_value={"should_skip": should_skip, "reason": reason, "checks": []}
        )
        self.async_zones_held_by_days_between = AsyncMock(return_value={1})
        self._count_precipitation_skip = AsyncMock()
        self.seen = []

        async def prepare(name, data, soil_moisture=True):
            self.seen.append(
                (
                    self._watering_decision_today,
                    set(self._zones_held_by_days_between),
                )
            )
            return self._watering_decision_today, set()

        self._prepare_watering_for_today = AsyncMock(side_effect=prepare)


async def test_a_schedule_without_a_list_uses_the_days_shared_decision():
    scheduler = Scheduler(should_skip=True)
    await scheduler._prepare_program_watering("p", {}, None)
    scheduler.async_evaluate_skip_conditions.assert_not_awaited()
    scheduler._prepare_watering_for_today.assert_awaited_once()


async def test_a_schedule_with_a_list_decides_on_its_conditions_and_restores_the_day():
    scheduler = Scheduler(should_skip=False)
    go, _ = await scheduler._prepare_program_watering("p", {}, ["wind"])
    scheduler.async_evaluate_skip_conditions.assert_awaited_once_with(only=["wind"])
    assert go is True
    # Days between not chosen: no zone is held by it during the preparation.
    assert scheduler.seen == [(True, set())]
    # The shared state is as it was.
    assert scheduler._watering_decision_today is None
    assert scheduler._last_skip_evaluation is None
    assert scheduler._zones_held_by_days_between == {9}


async def test_a_veto_among_the_chosen_conditions_skips_the_run():
    scheduler = Scheduler(should_skip=True, reason="precipitation")
    go, _ = await scheduler._prepare_program_watering(
        "p", {}, ["precipitation", "days_between"]
    )
    assert go is False
    assert scheduler.seen == [(False, {1})]
    scheduler._count_precipitation_skip.assert_awaited_once()


# --- F3: the threshold on a step -----------------------------------------------


def test_the_threshold_is_bounded_and_stored_only_when_set():
    assert const.STEP_MIN_DEFICIT_MM not in normalize_step({"zones": [0]}, set())
    assert (
        normalize_step({"zones": [0], "min_deficit_mm": 5}, set())[
            const.STEP_MIN_DEFICIT_MM
        ]
        == 5.0
    )
    assert (
        normalize_step({"zones": [0], "min_deficit_mm": 5000}, set())[
            const.STEP_MIN_DEFICIT_MM
        ]
        == 100.0
    )
    assert const.STEP_MIN_DEFICIT_MM not in normalize_step(
        {"zones": [0], "min_deficit_mm": -3}, set()
    )
    assert const.STEP_MIN_DEFICIT_MM not in normalize_step(
        {"zones": [0], "min_deficit_mm": "x"}, set()
    )


def test_below_the_deficit_a_zone_is_under_the_threshold():
    member = {"min_deficit_mm": 4}
    assert below_deficit(member, {const.ZONE_BUCKET: -3.9})
    assert not below_deficit(member, {const.ZONE_BUCKET: -4})
    assert not below_deficit(member, {const.ZONE_BUCKET: -10})
    # A full bucket has no deficit at all.
    assert below_deficit(member, {const.ZONE_BUCKET: 2})
    # No threshold: never below.
    assert not below_deficit({}, {const.ZONE_BUCKET: 5})


def _zone(zone_id, bucket):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_DURATION: 600,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_LINKED_ENTITY: f"switch.z{zone_id}",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_BUCKET: bucket,
    }


def test_a_fixed_step_carries_no_threshold_into_the_plan():
    program = {
        const.PROGRAM_STEPS: [
            {"zones": [0], "mode": "calculated", "min_deficit_mm": 5},
            {"zones": [0], "mode": "percent", "percent": 50, "min_deficit_mm": 5},
            {"zones": [0], "mode": "fixed", "seconds": 60, "min_deficit_mm": 5},
            {"zones": [0]},
        ]
    }
    plan = plan_program(program, [_zone(0, -1)])
    members = [step["zones"][0] for step in plan[0]]
    assert [m.get("min_deficit_mm") for m in members] == [5.0, 5.0, None, None]


class Runner(ProgramRunnerMixin):
    def __init__(self, zones):
        self.store = MagicMock()
        self.store.get_zone = lambda zone_id: zones.get(zone_id)
        self.is_suspended = lambda kind, ident: False
        self._busy = lambda zone_id: False
        self.ran = []

        async def run_zone(run, zone, passes, max_litres=0.0):
            self.ran.append(int(zone[const.ZONE_ID]))
            return {"zone_id": zone[const.ZONE_ID]}

        self._run_program_zone = run_zone


async def _step_of(runner, steps_mode, deficit):
    program = {
        const.PROGRAM_STEPS: [
            {
                "id": "s",
                "zones": [0, 1],
                "mode": steps_mode,
                "seconds": 120,
                "min_deficit_mm": deficit,
            }
        ]
    }
    zones = [runner.store.get_zone(0), runner.store.get_zone(1)]
    plan = plan_program(program, zones)
    run = ProgramRun("p", "P", True)
    await runner._run_step(run, plan[0][0])
    return run


async def test_a_zone_below_the_deficit_sits_the_step_out_and_says_why():
    runner = Runner({0: _zone(0, -8), 1: _zone(1, -1)})
    run = await _step_of(runner, "calculated", 5)
    assert runner.ran == [0]
    assert run.skipped == [
        {"zone_id": 1, "step": "s", "reason": const.STEP_SKIP_BELOW_DEFICIT}
    ]


async def test_a_fixed_step_waters_whatever_the_deficit():
    runner = Runner({0: _zone(0, -8), 1: _zone(1, 3)})
    run = await _step_of(runner, "fixed", 5)
    assert sorted(runner.ran) == [0, 1]
    assert run.skipped == []


async def test_without_a_threshold_nothing_changes():
    runner = Runner({0: _zone(0, 0), 1: _zone(1, 4)})
    run = await _step_of(runner, "calculated", 0)
    assert sorted(runner.ran) == [0, 1]
    assert run.skipped == []
