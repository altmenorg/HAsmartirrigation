"""A zone's flow meter is a witness: a valve that opened on a dry line is not water.

The direct runner never read the zone's flow meter, so a valve that confirmed
open while no water flowed (the main tap closed, the pump off) was credited the
whole run by time. A meter that reported while the water should have been
flowing, and did not move, now says the run delivered nothing. A meter that did
not report proves nothing either way, and the run keeps its credit by time.

Also: "inf" and "nan" parse as floats, and an infinite meter reading credited
an infinite depth to a zone with no maximum bucket.
"""

import datetime
from types import SimpleNamespace
from unittest.mock import Mock

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.valve_runner import PROBLEM_NO_FLOW
from tests.runner_doubles import (
    Coordinator,
    Sleeps,
    make_hass,
    make_store,
    problems,
    set_state,
    zone,
)

METER = "sensor.meter"


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


@pytest.fixture
def sleeps(monkeypatch):
    recorder = Sleeps()
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", recorder
    )
    return recorder


def _metered(**overrides):
    hass = make_hass()
    coord = Coordinator(
        hass,
        make_store([zone(0, flow_sensor=METER, **overrides)], sequencing="parallel"),
    )
    return hass, coord


def _meter(hass, value, *, reported):
    """The meter reads ``value`` litres, last reported at ``reported``."""
    set_state(
        hass,
        METER,
        str(value),
        attributes={"unit_of_measurement": "L"},
        changed=dt_util.utcnow() - datetime.timedelta(days=1),
        reported=reported,
    )


def _later():
    """A report well after the open, as at the end of a long run."""
    return dt_util.utcnow() + datetime.timedelta(minutes=10)


def _long_ago():
    return dt_util.utcnow() - datetime.timedelta(hours=1)


# --- the direct runner ------------------------------------------------------


async def test_a_meter_that_reports_no_flow_stops_the_credit(sleeps):
    hass, coord = _metered()
    _meter(hass, 100.0, reported=_long_ago())

    async def _meter_reports_unchanged():
        _meter(hass, 100.0, reported=_later())

    sleeps.on(300, _meter_reports_unchanged)

    result = await coord._run_one_valve(coord.store.get_zone(0))

    assert coord.store.by_id[0][const.ZONE_BUCKET] == -3.0, "nothing credited"
    coord.store.async_update_zone.assert_not_awaited()
    assert problems(hass) == [PROBLEM_NO_FLOW]
    assert result["ran"] is False
    assert result["problem"] == PROBLEM_NO_FLOW
    # The valve was still closed, and the run cleared.
    assert hass.states_by_id["switch.zone_0"].state == "off"
    assert coord._active_valve_runs == {}


async def test_a_meter_that_did_not_report_keeps_the_credit_by_time(sleeps):
    hass, coord = _metered()
    _meter(hass, 100.0, reported=_long_ago())

    result = await coord._run_one_valve(coord.store.get_zone(0))

    assert coord.store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-2.0)
    assert problems(hass) == []
    assert result["problem"] is None


async def test_a_meter_that_reported_only_as_the_valve_opened_proves_nothing(
    sleeps,
):
    """Before the pipe has filled, an unchanged reading is expected."""
    hass, coord = _metered()
    _meter(hass, 100.0, reported=dt_util.utcnow())

    await coord._run_one_valve(coord.store.get_zone(0))

    assert coord.store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-2.0)
    assert problems(hass) == []


async def test_an_unavailable_meter_keeps_the_credit_by_time(sleeps):
    hass, coord = _metered()
    set_state(hass, METER, "unavailable")

    await coord._run_one_valve(coord.store.get_zone(0))

    assert coord.store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-2.0)
    assert problems(hass) == []


async def test_a_meter_that_moved_keeps_the_credit_by_time(sleeps):
    hass, coord = _metered()
    _meter(hass, 100.0, reported=_long_ago())

    async def _water_flows():
        _meter(hass, 150.0, reported=_later())

    sleeps.on(300, _water_flows)

    await coord._run_one_valve(coord.store.get_zone(0))

    assert coord.store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-2.0)
    assert problems(hass) == []


async def test_a_zone_without_a_meter_is_unchanged(sleeps):
    hass = make_hass()
    coord = Coordinator(hass, make_store([zone(0)], sequencing="parallel"))

    await coord._run_one_valve(coord.store.get_zone(0))

    assert coord.store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-2.0)


# --- non-finite readings ----------------------------------------------------


@pytest.mark.parametrize("raw", ["inf", "-inf", "nan", "Infinity"])
def test_a_non_finite_reading_is_no_reading(raw):
    hass, coord = _metered()
    set_state(hass, METER, raw, attributes={"unit_of_measurement": "L"})

    assert coord._read_volume_litres(METER) is None


# --- the observer -----------------------------------------------------------


def _valve_event(old, new):
    event = Mock()
    event.data = {
        "entity_id": "switch.zone_0",
        "old_state": SimpleNamespace(state=old),
        "new_state": SimpleNamespace(state=new),
    }
    return event


def _observed(**overrides):
    hass, coord = _metered(**overrides)
    coord._observed_zone_by_entity = {"switch.zone_0": 0}
    return hass, coord


def _open_by_hand(coord, seconds_ago=300):
    coord._observed_state_changed(_valve_event("off", "on"))
    coord._observed_on_since[0] = dt_util.utcnow() - datetime.timedelta(
        seconds=seconds_ago
    )


async def _settle(hass):
    for task in list(hass.created):
        await task


async def test_a_run_by_hand_on_a_dry_line_is_not_credited():
    hass, coord = _observed()
    _meter(hass, 100.0, reported=_long_ago())
    _open_by_hand(coord)

    _meter(hass, 100.0, reported=dt_util.utcnow())
    coord._observed_state_changed(_valve_event("on", "off"))
    await _settle(hass)

    coord.store.async_update_zone.assert_not_awaited()
    assert problems(hass) == [PROBLEM_NO_FLOW]


async def test_a_run_by_hand_the_meter_has_not_reported_is_credited_by_time():
    """It used to be dropped: a zero delta credited nothing, real run or not."""
    hass, coord = _observed()
    _meter(hass, 100.0, reported=_long_ago())
    _open_by_hand(coord)

    coord._observed_state_changed(_valve_event("on", "off"))
    await _settle(hass)

    assert coord.store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-2.0, abs=0.05)
    assert problems(hass) == []


async def test_a_run_by_hand_with_metered_water_is_credited_the_volume():
    hass, coord = _observed()
    _meter(hass, 100.0, reported=_long_ago())
    _open_by_hand(coord)

    _meter(hass, 150.0, reported=dt_util.utcnow())
    coord._observed_state_changed(_valve_event("on", "off"))
    await _settle(hass)

    # 50 L over 50 m2 is 1 mm.
    assert coord.store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-2.0)


async def test_an_infinite_reading_never_credits_an_infinite_depth():
    hass, coord = _observed(maximum_bucket=None)
    _meter(hass, 100.0, reported=_long_ago())
    _open_by_hand(coord)

    set_state(hass, METER, "inf", attributes={"unit_of_measurement": "L"})
    coord._observed_state_changed(_valve_event("on", "off"))
    await _settle(hass)

    bucket = coord.store.by_id[0][const.ZONE_BUCKET]
    # Credited by time instead: 300 s is 1 mm.
    assert bucket == pytest.approx(-2.0, abs=0.05)
