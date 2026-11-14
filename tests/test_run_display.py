"""What a run shows while it waters in passes, soaks, starts its pump, or waits.

UX walk of 13 Nov.:
- Q6: between two passes Start said "watering" with no zone; the card showed the
  zone at rest.
- Q7: a zone of 2 min in two passes said "58 s left (3 %)" with a soak and a
  pass still to come.
- Q9, Q24: the planning said "Hecken 2 min" over an expected 19 min 45 s, and
  nothing of a 3 L limit.
- Q16: the history did not say which program watered.
- Q18: while the pump came up, "watering" with no zone.
"""

import asyncio
import json
from pathlib import Path

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_status import (
    water_percent,
    zone_progress,
)
from custom_components.smart_irrigation.valve_runner import RunControl
from tests.runner_doubles import REAL_SLEEP
from tests.test_hard_deadline_and_persistence import _setup as _base_setup
from tests.test_program_runner import _program
from tests.test_watering_control import _silence_dispatcher  # noqa: F401

FRONTEND = (
    Path(__file__).parent.parent / "custom_components" / "smart_irrigation" / "frontend"
)
LANGUAGES = FRONTEND / "localize" / "languages"


def _control(plan, lead=0.0, soak=60.0, index=0, watered=0.0, max_litres=None):
    control = RunControl(asyncio.Event(), asyncio.Event())
    control.plan = list(plan)
    control.lead = lead
    control.soak = soak
    control.pass_index = index
    control.watered = watered
    control.max_litres = max_litres
    return control


def test_a_zone_in_passes_counts_its_whole_run():
    # 2 min in two passes of 60 s, a soak of 60 s between them; 2 s into the first.
    progress = zone_progress(_control([60, 60]), elapsed=2, held=60)

    assert progress["remaining_seconds"] == 58 + 60 + 60
    assert progress["percent"] == 1
    assert (progress["pass"], progress["passes"]) == (1, 2)


def test_the_second_pass_has_only_itself_left():
    progress = zone_progress(
        _control([60, 60], index=1, watered=60), elapsed=14, held=60
    )

    assert progress["remaining_seconds"] == 46
    assert progress["percent"] == 61


def test_one_pass_says_no_pass_and_a_limit_is_carried():
    progress = zone_progress(_control([120], max_litres=3.0), elapsed=30, held=120)

    assert "pass" not in progress
    assert progress["max_litres"] == 3.0
    assert progress["remaining_seconds"] == 90


def test_the_lead_time_counts_as_part_of_the_run():
    # 10 s lead before each pass of 50 s: 120 s in all, 60 s between.
    control = _control([50, 50], lead=10, soak=60)
    assert water_percent(control, 30) == 25
    assert zone_progress(control, elapsed=30, held=60)["remaining_seconds"] == (
        30 + 50 + 10 + 60
    )


class Sleeps:
    """Every wait is instant but the soak of 60 s, which lasts until cancelled."""

    def __init__(self, hass):
        self.hass = hass

    async def __call__(self, seconds, *args, **kwargs):
        self.hass.calls.append(("sleep", seconds))
        if float(seconds) == 60.0:
            await asyncio.Event().wait()


async def _settle():
    for _ in range(60):
        await REAL_SLEEP(0)


async def test_a_soaking_zone_is_in_the_live_state(monkeypatch):
    hass, coord, _ = _base_setup(
        monkeypatch,
        [
            _program(
                steps=[{"zones": [0], "mode": "fixed", "seconds": 600, "passes": 2}]
            )
        ],
    )
    coord.store.config.soak_minutes = 1
    coord.store.config.pause_until = None
    coord.store.config.queued_manual_runs = None
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", Sleeps(hass)
    )
    program = asyncio.ensure_future(coord.async_run_program("evening"))
    await _settle()

    live = coord.async_live_state()

    assert live["valves"] == []
    [soaking] = live["soaking"]
    assert soaking["zone_id"] == 0
    assert (soaking["next_pass"], soaking["passes"]) == (2, 2)
    # The soak and the second pass of 300 s are left; half the water is in.
    assert 355 <= soaking["remaining_seconds"] <= 360
    assert soaking["percent"] == 50
    tasks = coord.async_teardown_valve_runs()
    program.cancel()
    await asyncio.gather(program, *tasks, return_exceptions=True)


def test_the_history_keeps_what_started_a_run():
    from custom_components.smart_irrigation.store import IrrigationHistoryEntry

    entry = IrrigationHistoryEntry(
        start="2026-11-13T18:00:00+00:00",
        zone_id=1,
        zone_name="Hecken",
        duration=60.0,
        water_used=6.0,
        program_id="program_x",
    )
    assert entry.program_id == "program_x"
    # Stored before it was kept: none.
    assert IrrigationHistoryEntry(zone_id=1).program_id is None


TEXTS = {
    ("panels", "info", "cards", "running", "headline-soaking"): set(),
    ("panels", "info", "cards", "running", "headline-starting"): set(),
    ("panels", "info", "cards", "running", "pass"): {"{pass}", "{passes}"},
    ("panels", "info", "cards", "running", "at-most"): {"{volume}"},
    ("panels", "info", "cards", "running", "soaking"): {
        "{when}",
        "{pass}",
        "{passes}",
    },
    ("panels", "info", "cards", "running", "starting"): {"{supply}"},
    ("panels", "info", "cards", "running", "then"): {"{names}"},
    ("planning", "pass_of"): {"{pass}", "{passes}"},
    ("planning", "soaking"): {"{when}", "{pass}", "{passes}"},
    ("planning", "starting"): {"{supply}"},
    ("planning", "in_passes"): {"{passes}"},
    ("planning", "at_most"): {"{volume}"},
    ("planning", "soak_between"): {"{time}"},
    ("planning", "tours_each"): {"{n}"},
    ("card", "soaking"): {"{when}", "{pass}", "{passes}"},
    ("card", "pass_of"): {"{pass}", "{passes}"},
    ("card", "programs", "after"): {"{name}"},
    ("card", "programs", "next_in_line"): set(),
    ("panels", "history", "table", "by_hand"): set(),
}


@pytest.mark.parametrize("lang", ["en", "de"])
@pytest.mark.parametrize(("key", "placeholders"), TEXTS.items())
def test_each_text_is_there_with_its_placeholders(lang, key, placeholders):
    node = json.loads((LANGUAGES / f"{lang}.json").read_text(encoding="utf-8"))
    for part in key:
        node = node[part]
    assert node
    for placeholder in placeholders:
        assert placeholder in node


def test_the_german_planning_calls_rounds_rounds():
    """Q23: "2 Durchgänge" stood under a program of two rounds."""
    texts = json.loads((LANGUAGES / "de.json").read_text(encoding="utf-8"))
    assert texts["planning"]["tour"] == "Runde"
    assert texts["planning"]["tours"] == "Runden"
    assert texts["programs"]["tours"] == "Runden"
    assert const.HISTORY_PROGRAM_ID == "program_id"


async def test_a_zone_behind_the_priming_pump_is_shown_starting(monkeypatch):
    """Q18: of two zones opening on one pump, only the first said it was waiting."""
    from tests.test_supply_runner import _setup as _supply_setup
    from tests.test_supply_runner import _supply

    hass, coord, sleeps = _supply_setup(
        monkeypatch,
        zone_ids=(0, 1),
        supply=_supply(delay_before=5),
        sequencing="parallel",
    )
    seen = {}

    async def during_the_lead():
        for _ in range(20):
            await REAL_SLEEP(0)
        seen.update({k: dict(v) for k, v in coord._supply_priming().items()})

    sleeps.on(5, during_the_lead)
    await coord.async_run_direct_valves()

    assert set(seen) == {0, 1}
    priming = [v for v in seen.values() if v["until"]]
    assert len(priming) == 1
    assert all(v["supply"] == "Pump" for v in seen.values())
    assert coord._supply_priming() == {}


def test_the_waiting_zone_takes_the_time_of_the_one_priming():
    from datetime import timedelta

    from homeassistant.util import dt as dt_util

    from custom_components.smart_irrigation.program_status import (
        ProgramStatusMixin,
    )

    class Status:
        _starting = ProgramStatusMixin._starting

        def _zone_record(self, zone_id):
            return {const.ZONE_NAME: f"Zone {zone_id}"}

    status = Status()
    until = (dt_util.utcnow() + timedelta(seconds=30)).isoformat()
    status._supply_priming_zones = {
        0: {"supply": "Pumpe", "until": until},
        1: {"supply": "Pumpe", "until": None},
        # Behind a pump that is not priming (its lock held for another reason).
        2: {"supply": "Brunnen", "until": None},
    }

    starting = status._starting()

    assert [s["zone_id"] for s in starting] == [0, 1]
    assert {s["supply"] for s in starting} == {"Pumpe"}
    assert all(28 <= s["remaining_seconds"] <= 30 for s in starting)


def test_the_planning_is_in_the_order_of_the_moments():
    """The main program at 05:54 local came after a schedule at 06:00 local."""
    from custom_components.smart_irrigation.program_status import _moment

    starts = ["2026-11-14T05:00:00+00:00", "2026-11-14T05:54:30+01:00"]
    assert sorted(starts, key=_moment) == [starts[1], starts[0]]
    assert _moment(None) == float("inf")
