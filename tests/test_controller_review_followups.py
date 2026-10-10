"""Follow-ups of the independent review of the full controller.

The queue of manual runs follows a stop at once, a restored pause opens nothing
and a pause during the pump's lead loses no water, a pass too long for the ZHA
timer arms none, a queued program waits for every resumed run, the storage
failures of the safety records are loud, and two schedules do not share a
decision.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import homeassistant.util.dt as dt_util

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_scheduler import (
    ProgramSchedulerMixin,
)
from tests.runner_doubles import (
    REAL_SLEEP,
    Coordinator,
    make_hass,
    make_store,
    opens,
    zone,
)
from tests.test_controller_gaps import _domain_aware, _supply
from tests.test_controller_reload_fixes import _open_record
from tests.test_controller_reload_fixes import _program as _plain_program
from tests.test_controller_reload_fixes import _setup as _reload_setup
from tests.test_hard_deadline_and_persistence import _night, _two_steps
from tests.test_hard_deadline_and_persistence import _setup as _queue_setup
from tests.test_manual_runs import _hold
from tests.test_program_runner import _log
from tests.test_watering_control import (
    _settle,
    _silence_dispatcher,  # noqa: F401
)


async def _drain(hass):
    await asyncio.gather(*list(hass.created), return_exceptions=True)


# --- 1. the queue record follows a stop ----------------------------------------------


async def test_a_dequeued_run_leaves_the_stored_queue_at_once(monkeypatch):
    hass, coord, sleeps = _queue_setup(monkeypatch, [_two_steps(), _night()])
    gate = _hold(sleeps, 300)
    first = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    second = asyncio.ensure_future(coord.async_run_program("night"))
    await _settle()
    assert coord.store.config.queued_manual_runs

    assert await coord.async_stop_program("night") == "dequeued"

    # A restart now, before the stopped run's turn: nothing is asked again.
    assert coord.store.config.queued_manual_runs == []
    gate.set()
    await asyncio.wait_for(asyncio.gather(first, second), 5)


async def test_stopping_everything_empties_the_stored_queue_at_once(monkeypatch):
    hass, coord, sleeps = _queue_setup(monkeypatch, [_two_steps(), _night()])
    gate = _hold(sleeps, 300)
    first = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()
    second = asyncio.ensure_future(coord.async_run_program("night"))
    await _settle()
    assert coord.store.config.queued_manual_runs

    await coord.async_stop_watering()

    assert coord.store.config.queued_manual_runs == []
    gate.set()
    await asyncio.wait_for(asyncio.gather(first, second), 5)


# --- 2. a restored pause opens nothing -------------------------------------------------


def _pause_now(coord):
    pause, resume = coord._pause_events()
    resume.clear()
    pause.set()


async def test_a_restored_pause_holds_a_resumed_run_without_opening(
    monkeypatch, freezer
):
    hass, coord, sleeps = _reload_setup(monkeypatch, [_plain_program()])
    coord.store.config.pause_until = None
    coord._credit_direct_run = AsyncMock()
    coord.store.config.active_valve_runs = [_open_record(100, delivered=5.0)]
    _pause_now(coord)

    await coord.async_resume_valve_runs()
    await _settle()

    # Nothing was opened under the pause, and the record is kept.
    assert opens(hass) == []
    assert coord.store.config.active_valve_runs
    coord._credit_direct_run.assert_not_awaited()

    await coord.async_resume_watering()
    await _drain(hass)

    # The rest of the pass is watered after the pause, and credited once.
    assert opens(hass) == ["switch.zone_0"]
    assert 15.0 in sleeps.waited
    coord._credit_direct_run.assert_awaited_once()
    assert coord._credit_direct_run.await_args.kwargs["held"] == 20


async def test_a_stop_during_the_held_resume_credits_what_was_delivered_once(
    monkeypatch, freezer
):
    hass, coord, _ = _reload_setup(monkeypatch, [_plain_program()])
    coord.store.config.pause_until = None
    coord._credit_direct_run = AsyncMock()
    coord.store.config.active_valve_runs = [_open_record(100, delivered=5.0)]
    _pause_now(coord)

    await coord.async_resume_valve_runs()
    await _settle()
    await coord.async_stop_watering()
    await _drain(hass)

    assert opens(hass) == []
    coord._credit_direct_run.assert_awaited_once()
    assert coord._credit_direct_run.await_args.kwargs["held"] == 5.0
    assert not coord.store.config.active_valve_runs


async def test_a_pause_during_the_pumps_lead_credits_the_water_and_goes_on(
    monkeypatch, freezer
):
    hass = make_hass()
    _domain_aware(hass)
    store = make_store([zone(0, **{const.ZONE_SUPPLY_ID: "pump"})])
    store.config.full_controller = True
    store.config.supplies = [
        _supply("pump", "switch.pump", **{const.SUPPLY_DELAY_BEFORE: 5})
    ]
    store.config.pause_until = None
    store.config.active_cycle = None
    store.config.active_program_run = None
    store.config.active_valve_runs = [_open_record(100, delivered=5.0)]

    async def _update(changes):
        for key, value in changes.items():
            setattr(store.config, key, value)

    store.async_update_config = AsyncMock(side_effect=_update)
    coord = Coordinator(hass, store)
    coord._credit_direct_run = AsyncMock()
    paused_once = []

    async def _sleep(seconds, *args, **kwargs):
        hass.calls.append(("sleep", seconds))
        if float(seconds) == 5.0 and not paused_once:
            # The pause comes while the pump leads the valve.
            paused_once.append(True)
            _pause_now(coord)
        await REAL_SLEEP(0)

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _sleep
    )

    await coord.async_resume_valve_runs()
    await _settle()

    # What the valve delivered before the restart is not lost.
    first = coord._credit_direct_run.await_args_list[0]
    assert first.kwargs["held"] == 5.0
    assert "switch.zone_0" not in opens(hass)

    await coord.async_resume_watering()
    await _drain(hass)

    assert opens(hass).count("switch.zone_0") == 1


# --- 4. a queued program waits for a resumed valve run -----------------------------------


async def test_the_queue_waits_for_a_resumed_plain_valve_run(monkeypatch, freezer):
    hass, coord, sleeps = _queue_setup(monkeypatch, [_two_steps(), _night()])
    gate = _hold(sleeps, 15)

    # The one-second poll of the queue must give the loop back, as a real sleep does.
    async def _sleep(seconds, *args, **kwargs):
        if seconds == 1:
            await REAL_SLEEP(0)
            return
        await sleeps(seconds, *args, **kwargs)

    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", _sleep
    )
    coord.store.config.active_valve_runs = [_open_record(5)]
    coord.store.config.queued_manual_runs = [
        {
            "program_id": "night",
            "seconds": None,
            "requested": dt_util.utcnow().isoformat(),
        }
    ]

    await coord.async_restore_pause_and_queue()
    await coord.async_resume_valve_runs()
    await _settle()

    # The resumed run still holds zone 0: the queued program has not opened.
    assert opens(hass) == ["switch.zone_0"]

    gate.set()
    await asyncio.wait_for(_drain(hass), 5)

    log = _log(hass)
    assert log.index("zone_2 on") > log.index("zone_0 off")


# --- 5. the storage failures of the safety records are loud ------------------------------


async def test_a_failing_record_of_the_pause_the_queue_or_a_start_warns(
    monkeypatch, caplog
):
    hass, coord, _ = _queue_setup(monkeypatch, [_two_steps(), _night()])
    coord.store.async_update_config = AsyncMock(side_effect=RuntimeError("disk full"))
    coord._program_registry()["night"] = SimpleNamespace(
        program_id="night",
        seconds=None,
        requested="2026-01-01T00:00:00+00:00",
        queued=True,
        turn_taken=False,
        stop=asyncio.Event(),
    )

    with caplog.at_level("DEBUG"):
        await coord._persist_pause("2026-01-01T00:00:00+00:00")
        await coord._persist_manual_queue()
        await coord._note_program_started("night")

    warned = [r.message for r in caplog.records if r.levelname == "WARNING"]
    assert any("record the pause" in m for m in warned)
    assert any("record the queued runs" in m for m in warned)
    assert any("record the start" in m for m in warned)


# --- 7. two schedules firing together do not see each other's decision --------------------


class _Scheduler(ProgramSchedulerMixin):
    def __init__(self):
        self._watering_decision_today = None
        self._last_skip_evaluation = None
        self._zones_held_by_days_between = set()
        self.seen = {}

    async def async_evaluate_skip_conditions(self, only=None):
        await REAL_SLEEP(0)
        return {"should_skip": only == ["a"], "reason": None, "checks": []}

    async def async_zones_held_by_days_between(self):
        return set()

    async def _count_precipitation_skip(self):
        return None

    async def _prepare_watering_for_today(self, name, event_data, soil_moisture=True):
        await REAL_SLEEP(0)
        await REAL_SLEEP(0)
        self.seen[name] = self._watering_decision_today
        return self._watering_decision_today, set()


async def test_two_preparations_at_once_each_keep_their_own_decision():
    scheduler = _Scheduler()

    (go_a, _), (go_b, _) = await asyncio.gather(
        scheduler._prepare_program_watering("a", {}, ["a"]),
        scheduler._prepare_program_watering("b", {}, ["b"]),
    )

    assert go_a is False and go_b is True
    assert scheduler.seen == {"a": False, "b": True}
    assert scheduler._watering_decision_today is None
