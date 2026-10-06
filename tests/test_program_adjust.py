"""Step bounds and offsets, and the adjust_program runtime adjustment."""

from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import homeassistant.util.dt as dt_util
import pytest
import voluptuous as vol
from homeassistant.exceptions import ServiceValidationError

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.program_adjust import (
    ADJUST_PROGRAM_SCHEMA,
    ProgramAdjustMixin,
)
from custom_components.smart_irrigation.programs import (
    DURATION_FIXED,
    DURATION_PERCENT,
    active_adjustment,
    normalize_programs,
    plan_program,
    step_seconds,
)


def _zone(duration=600, lead=60, zone_id=1):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_DURATION: duration,
        const.ZONE_LEAD_TIME: lead,
        const.ZONE_LINKED_ENTITY: "switch.v",
        const.ZONE_STATE: "automatic",
    }


def _step(**kw):
    program = normalize_programs([{"id": "p", "steps": [{"zones": [1], **kw}]}])[0]
    return program["steps"][0]


def test_new_fields_are_normalised_and_bounded():
    step = _step(min_seconds=-5, max_seconds=999999, adjust_seconds=-999999)
    assert step[const.STEP_MIN_SECONDS] == 0
    assert step[const.STEP_MAX_SECONDS] == 86400
    assert step[const.STEP_ADJUST_SECONDS] == -6 * 3600
    assert _step(adjust_seconds=999999)[const.STEP_ADJUST_SECONDS] == 6 * 3600
    plain = _step()
    assert plain[const.STEP_MIN_SECONDS] == 0
    assert plain[const.STEP_ADJUST_SECONDS] == 0
    assert _step(min_seconds="abc")[const.STEP_MIN_SECONDS] == 0


def test_no_bounds_changes_nothing():
    assert step_seconds(_step(), _zone()) == 600


def test_offset_min_and_max():
    zone = _zone()  # 540 s of water + 60 s of lead
    assert step_seconds(_step(adjust_seconds=60), zone) == 660
    assert step_seconds(_step(adjust_seconds=-100), zone) == 500
    assert step_seconds(_step(min_seconds=900), zone) == 960
    assert step_seconds(_step(max_seconds=300), zone) == 360
    # The offset comes before the bounds.
    assert step_seconds(_step(adjust_seconds=1000, max_seconds=700), zone) == 760
    # An offset that takes everything off leaves no water.
    assert step_seconds(_step(adjust_seconds=-5000), zone) == 0


def test_percent_then_offset_then_bounds():
    step = _step(mode=DURATION_PERCENT, percent=50, adjust_seconds=30, min_seconds=400)
    # 540 * 0.5 = 270, + 30 = 300, raised to 400, + 60 of lead
    assert step_seconds(step, _zone()) == 460


def test_min_never_turns_nothing_into_water():
    idle = _zone(duration=0)
    assert step_seconds(_step(min_seconds=300), idle) == 0
    assert step_seconds(_step(adjust_seconds=100, min_seconds=300), idle) == 0
    assert step_seconds(_step(), idle, adjustment={"seconds": 100}) == 0
    # A fixed step still waters, and takes the bounds.
    fixed = _step(mode=DURATION_FIXED, seconds=100, min_seconds=200)
    assert step_seconds(fixed, _zone()) == 260


def test_runtime_adjustment_is_applied_on_top():
    zone = _zone()
    step = _step(mode=DURATION_PERCENT, percent=50)  # 270 s of water
    assert step_seconds(step, zone, adjustment={"percent": 200}) == 600
    assert step_seconds(step, zone, adjustment={"seconds": 30}) == 360
    both = {"percent": 200, "seconds": -40}
    assert step_seconds(step, zone, adjustment=both) == 560
    capped = _step(max_seconds=400)
    assert step_seconds(capped, zone, adjustment={"percent": 500}) == 460
    assert step_seconds(step, zone, adjustment={"percent": 0}) == 0


def test_tours_divide_the_adjusted_water():
    assert step_seconds(_step(), _zone(), tours=2, adjustment={"percent": 200}) == (
        540 * 2 / 2 + 60
    )


def test_plan_program_uses_the_adjustment():
    program = normalize_programs([{"id": "p", "steps": [{"zones": [1]}]}])[0]
    base = plan_program(program, [_zone()])[0][0]["zones"][0]["seconds"]
    more = plan_program(program, [_zone()], {"percent": 200})[0][0]["zones"][0][
        "seconds"
    ]
    assert (base, more) == (600, 1140)


def test_active_adjustment_expires():
    now = dt_util.utcnow()
    stored = {
        "a": {"percent": 120, "seconds": None, "until": None},
        "b": {"percent": 120, "until": (now + timedelta(hours=1)).isoformat()},
        "c": {"percent": 120, "until": (now - timedelta(hours=1)).isoformat()},
        "d": {"percent": 120, "until": "garbage"},
        "e": {"percent": None, "seconds": None},
    }
    assert active_adjustment(stored, "a", now)["percent"] == 120
    assert active_adjustment(stored, "b", now) is not None
    for gone in ("c", "d", "e", "missing"):
        assert active_adjustment(stored, gone, now) is None
    assert active_adjustment(None, "a", now) is None


# --- the service ---------------------------------------------------------------


def _coordinator(full=True):
    program = normalize_programs([{"id": "evening", "steps": [{"zones": [1]}]}])
    programs = [{"id": "main", "main": True}, *program]
    config = SimpleNamespace(
        **{
            const.CONF_FULL_CONTROLLER: full,
            const.CONF_PROGRAMS: programs,
            const.CONF_PROGRAM_ADJUSTMENTS: None,
        }
    )
    store = MagicMock()
    store.config = config

    async def _update(data):
        for key, value in data.items():
            setattr(config, key, value)

    store.async_update_config = AsyncMock(side_effect=_update)
    coord = type("C", (ProgramAdjustMixin,), {})()
    coord.store = store
    coord._notify_programs = MagicMock()
    return coord


def _call(**data):
    return SimpleNamespace(
        data=ADJUST_PROGRAM_SCHEMA({"program_id": "evening", **data})
    )


async def test_service_sets_replaces_and_resets():
    coord = _coordinator()
    await coord.handle_adjust_program(_call(percent=120, hours=2))
    stored = coord.store.config.program_adjustments["evening"]
    assert stored["percent"] == 120
    assert stored["seconds"] is None
    assert dt_util.parse_datetime(stored["until"]) > dt_util.utcnow()
    # Absolute: the second call replaces the first.
    await coord.handle_adjust_program(_call(seconds=-30))
    stored = coord.store.config.program_adjustments["evening"]
    assert (stored["percent"], stored["seconds"], stored["until"]) == (None, -30, None)
    await coord.handle_adjust_program(_call(reset=True))
    assert coord.store.config.program_adjustments == {}
    coord._notify_programs.assert_called()


async def test_service_drops_expired_ones_when_it_writes():
    coord = _coordinator()
    past = (dt_util.utcnow() - timedelta(hours=1)).isoformat()
    coord.store.config.program_adjustments = {
        "old": {"percent": 150, "seconds": None, "until": past}
    }
    await coord.handle_adjust_program(_call(percent=110))
    assert set(coord.store.config.program_adjustments) == {"evening"}


async def test_service_refuses_politely():
    with pytest.raises(ServiceValidationError):
        await _coordinator(full=False).handle_adjust_program(_call(percent=120))
    coord = _coordinator()
    with pytest.raises(ServiceValidationError):
        await coord.handle_adjust_program(_call())  # nothing to apply
    with pytest.raises(ServiceValidationError):
        await coord.handle_adjust_program(
            SimpleNamespace(data={"program_id": "nope", "percent": 120})
        )
    with pytest.raises(ServiceValidationError):
        await coord.handle_adjust_program(
            SimpleNamespace(data={"program_id": "main", "percent": 120})
        )
    coord.store.async_update_config.assert_not_called()


def test_schema_bounds():
    for bad in (
        {"percent": -1},
        {"percent": 1001},
        {"percent": float("nan")},
        {"seconds": 30000},
        {"hours": 0},
        {"hours": 9000},
        {"percent": True},
    ):
        with pytest.raises(vol.Invalid):
            ADJUST_PROGRAM_SCHEMA({"program_id": "p", **bad})
    ok = ADJUST_PROGRAM_SCHEMA(
        {"program_id": "p", "percent": 1000, "seconds": -21600, "hours": 8760}
    )
    assert ok["hours"] == 8760
