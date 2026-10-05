"""Arming the schedules of the programs, and what happens when one is due."""

import asyncio
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, Mock, patch
from zoneinfo import ZoneInfo

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_scheduler import ProgramSchedulerMixin
from custom_components.smart_irrigation.programs import normalize_programs

PARIS = ZoneInfo("Europe/Paris")
UTC = timezone.utc


def _utc(day, hour, minute=0):
    return datetime(2026, 6, day, hour, minute, tzinfo=PARIS).astimezone(UTC)


class Scheduler(ProgramSchedulerMixin):
    """Just the scheduler, with its collaborators replaced."""

    def __init__(self, programs, *, zones=None, last_runs=None, full=True):
        self.hass = Mock()
        self.hass.async_create_task = lambda coro: asyncio.ensure_future(coro)
        self.store = MagicMock()
        self.store.config = SimpleNamespace(
            full_controller=full,
            programs=normalize_programs(programs),
            soak_minutes=0,
            program_last_runs=last_runs,
        )
        self.store.async_get_zones = AsyncMock(
            return_value=(
                zones
                if zones is not None
                else [
                    {
                        const.ZONE_ID: 0,
                        const.ZONE_DURATION: 600,
                        const.ZONE_LEAD_TIME: 0,
                        const.ZONE_LINKED_ENTITY: "switch.z0",
                        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
                    },
                    {
                        const.ZONE_ID: 1,
                        const.ZONE_DURATION: 600,
                        const.ZONE_LEAD_TIME: 0,
                        const.ZONE_LINKED_ENTITY: "switch.z1",
                        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
                    },
                ]
            )
        )

        async def _update(changes):
            for key, value in changes.items():
                setattr(self.store.config, key, value)

        self.store.async_update_config = AsyncMock(side_effect=_update)
        self.go = True
        self.sheltered = set()
        self._prepare_watering_for_today = AsyncMock(
            side_effect=lambda name, data: (self.go, self.sheltered)
        )
        self._note_watering_day = AsyncMock()
        self.async_run_program = AsyncMock(return_value=True)
        self.suspended = False
        self.is_suspended = lambda kind, ident: self.suspended

    def _sun_moment(self, event, day):
        hour = 7 if event == "sunrise" else 20
        return datetime(day.year, day.month, day.day, hour, 30, tzinfo=PARIS)


def _program(schedules, **overrides):
    data = {
        "id": "evening",
        "name": "Evening",
        "steps": [{"zones": [0]}, {"zones": [1]}],
        "schedules": schedules,
    }
    data.update(overrides)
    return data


@pytest.fixture(autouse=True)
def _paris_clock(freezer):
    previous = dt_util.DEFAULT_TIME_ZONE
    dt_util.set_default_time_zone(PARIS)
    freezer.move_to("2026-06-01 03:00:00+00:00")  # 05:00 in Paris
    yield
    dt_util.set_default_time_zone(previous)


class Armed:
    """What async_track_point_in_utc_time was asked for."""

    def __init__(self):
        self.calls = []
        self.unsubs = []

    def __call__(self, hass, callback, when):
        unsub = Mock()
        self.calls.append((callback, when))
        self.unsubs.append(unsub)
        return unsub

    @property
    def times(self):
        return [when for _, when in self.calls]


@pytest.fixture
def armed():
    recorder = Armed()
    with patch(
        "custom_components.smart_irrigation.program_scheduler.async_track_point_in_utc_time",
        recorder,
    ):
        yield recorder


async def test_each_enabled_schedule_is_armed_at_its_next_start(armed):
    scheduler = Scheduler(
        [_program([{"time": "06:00"}, {"time": "20:00", "weekdays": [0]}])]
    )

    await scheduler.register_program_schedules()

    assert sorted(armed.times) == [_utc(1, 6), _utc(1, 20)]


async def test_a_disabled_program_schedule_or_the_main_program_is_not_armed(armed):
    scheduler = Scheduler(
        [
            {"id": "main"},
            _program([{"time": "06:00"}], enabled=False),
            _program([{"time": "06:00", "enabled": False}], id="other", name="Other"),
        ]
    )

    await scheduler.register_program_schedules()

    assert armed.calls == []


async def test_nothing_is_armed_when_the_full_controller_is_off(armed):
    scheduler = Scheduler([_program([{"time": "06:00"}])], full=False)

    await scheduler.register_program_schedules()

    assert armed.calls == []


async def test_a_run_to_be_done_by_a_moment_starts_that_long_before(armed):
    """Two zones of ten minutes, one after the other, to be done by 07:00."""
    scheduler = Scheduler([_program([{"time": "07:00", "anchor": "end"}])])

    await scheduler.register_program_schedules()

    assert armed.times == [_utc(1, 6, 40)]


async def test_the_delays_between_steps_count_in_the_length(armed):
    scheduler = Scheduler([_program([{"time": "07:00", "anchor": "end"}], delay=120)])

    await scheduler.register_program_schedules()

    # 600 + 120 + 600 seconds: 22 minutes.
    assert armed.times == [_utc(1, 6, 38)]


async def test_the_occurrence_that_ran_last_is_not_armed_again(armed):
    last = {"evening:schedule_1": _utc(1, 6).isoformat()}
    scheduler = Scheduler([_program([{"time": "06:00"}])], last_runs=last)

    await scheduler.register_program_schedules()

    assert armed.times == [_utc(2, 6)]


async def test_arming_again_replaces_the_timers_instead_of_adding_to_them(armed):
    scheduler = Scheduler([_program([{"time": "06:00"}])])

    await scheduler.register_program_schedules()
    await scheduler.register_program_schedules()

    assert len(armed.calls) == 2
    armed.unsubs[0].assert_called_once()
    armed.unsubs[1].assert_not_called()


async def test_the_teardown_cancels_every_timer_without_firing_any(armed):
    scheduler = Scheduler([_program([{"time": "06:00"}, {"time": "07:00"}])])
    await scheduler.register_program_schedules()

    scheduler.async_teardown_program_schedules()

    for unsub in armed.unsubs:
        unsub.assert_called_once()
    scheduler.async_run_program.assert_not_awaited()


async def test_a_due_schedule_is_recorded_armed_again_then_run(armed):
    scheduler = Scheduler([_program([{"time": "06:00"}])])
    await scheduler.register_program_schedules()
    callback, when = armed.calls[0]

    callback(when)
    for _ in range(30):
        await asyncio.sleep(0)

    # Recorded first: the occurrence has run whatever happens next.
    assert scheduler.store.config.program_last_runs == {
        "evening:schedule_1": _utc(1, 6).isoformat()
    }
    # Armed again for the next day, not for the occurrence that just fired.
    assert armed.times[-1] == _utc(2, 6)
    scheduler._note_watering_day.assert_awaited_once()
    scheduler.async_run_program.assert_awaited_once_with(
        "evening", manual=False, only_zones=None
    )


async def test_a_skip_day_runs_nothing(armed):
    scheduler = Scheduler([_program([{"time": "06:00"}])])
    scheduler.go = False
    await scheduler.register_program_schedules()

    await scheduler._fire_program_schedule("evening", "schedule_1", _utc(1, 6))

    scheduler.async_run_program.assert_not_awaited()
    # But the occurrence is still counted as having come.
    assert scheduler.store.config.program_last_runs["evening:schedule_1"]


async def test_a_day_of_rain_runs_only_the_sheltered_zones(armed):
    scheduler = Scheduler([_program([{"time": "06:00"}])])
    scheduler.sheltered = {1}

    await scheduler._fire_program_schedule("evening", "schedule_1", _utc(1, 6))

    scheduler.async_run_program.assert_awaited_once_with(
        "evening", manual=False, only_zones={1}
    )


async def test_a_schedule_without_the_weather_does_not_ask_for_it(armed):
    scheduler = Scheduler([_program([{"time": "06:00", "weather": False}])])
    scheduler.go = False  # would veto it, if it were asked

    await scheduler._fire_program_schedule("evening", "schedule_1", _utc(1, 6))

    scheduler._prepare_watering_for_today.assert_not_awaited()
    scheduler.async_run_program.assert_awaited_once()


async def test_a_gate_that_fails_does_not_water(armed):
    scheduler = Scheduler([_program([{"time": "06:00"}])])
    scheduler._prepare_watering_for_today = AsyncMock(side_effect=RuntimeError("boom"))

    await scheduler._fire_program_schedule("evening", "schedule_1", _utc(1, 6))

    scheduler.async_run_program.assert_not_awaited()


async def test_a_schedule_deleted_while_it_waited_does_not_run(armed):
    scheduler = Scheduler([_program([{"time": "06:00"}])])
    await scheduler.register_program_schedules()
    scheduler.store.config.programs = normalize_programs([_program([])])

    await scheduler._fire_program_schedule("evening", "schedule_1", _utc(1, 6))

    scheduler.async_run_program.assert_not_awaited()
    assert getattr(scheduler.store.config, "program_last_runs", None) is None


async def test_a_start_that_has_gone_by_in_time_starts_at_once(armed, freezer):
    # 06:50: the 20-minute run due by 07:00 should have started at 06:40.
    freezer.move_to("2026-06-01 04:50:00+00:00")
    scheduler = Scheduler([_program([{"time": "07:00", "anchor": "end"}])])

    await scheduler.register_program_schedules()
    for _ in range(30):
        await asyncio.sleep(0)

    scheduler.async_run_program.assert_awaited_once()
    # It is armed for tomorrow, not for the run that is under way.
    assert _utc(2, 6, 40) in armed.times
    assert not [t for t in armed.times if t < _utc(2, 0)]
