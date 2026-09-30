"""The live estimate as an entity of its own (#853).

The stored bucket is the one the last calculation committed, so by the
afternoon it describes last night. The panel and the card already show a live
estimate, recomputed over the readings collected since; Megalos asked for it as
an entity, to plot it and to compare configurations against each other.

The design question was never the entity, it was when to recompute. It happens
when the zone's readings change, which is where the information changes, and no
more often than every thirty seconds, so a sensor group fed by fast sensors
cannot make it spin. When there is nothing to estimate from -- right after a
calculation, the window being empty -- the entity is the committed bucket and
says so, rather than going unavailable.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.sensor import (
    SmartIrrigationZoneLiveBucketSensor,
)

ZONE = {
    const.ZONE_ID: 1,
    const.ZONE_NAME: "Lawn",
    const.ZONE_BUCKET: -6.0,
}


def _sensor(estimate=None, units=METRIC_SYSTEM, zone=None):
    """A live-bucket sensor over a coordinator that answers ``estimate``."""
    hass = MagicMock()
    hass.config.units = units
    clock = {"t": 1000.0}
    hass.loop.time = lambda: clock["t"]
    coordinator = MagicMock()
    coordinator.store.get_zone = MagicMock(return_value=dict(zone or ZONE))
    coordinator.async_estimate_zone_now = AsyncMock(return_value=estimate)
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    tasks = []
    hass.async_create_task = lambda coro: tasks.append(coro)

    with patch(
        "custom_components.smart_irrigation.sensor.async_dispatcher_connect"
    ) as connect:
        sensor = SmartIrrigationZoneLiveBucketSensor(
            hass, "sensor.lawn_live_bucket", 1, "Lawn", "live_bucket", const.ZONE_BUCKET
        )
    sensor.hass = hass
    sensor.async_schedule_update_ha_state = MagicMock()
    return sensor, coordinator, tasks, clock, connect


def _close(tasks):
    """Drop coroutines a test never awaited, so nothing warns about them."""
    for coro in tasks:
        coro.close()
    tasks.clear()


async def _run(tasks):
    for coro in list(tasks):
        await coro
    tasks.clear()


ESTIMATE = {
    "bucket": -7.5,
    "delta": -1.5,
    "duration": 900,
    "since": "2026-09-27T23:00:00",
    "as_of": "2026-09-28T15:30:00",
}


@pytest.mark.asyncio
async def test_it_shows_the_estimate_when_there_is_one():
    sensor, _coordinator, tasks, _clock, _connect = _sensor(ESTIMATE)

    sensor._async_zone_updated(1)
    await _run(tasks)

    assert sensor.native_value == pytest.approx(-7.5)
    assert sensor.extra_state_attributes["live"] is True
    assert sensor.extra_state_attributes["since"] == ESTIMATE["since"]
    assert sensor.extra_state_attributes["duration"] == 900


@pytest.mark.asyncio
async def test_with_nothing_to_estimate_from_it_is_the_committed_bucket():
    """Right after a calculation the window is empty, and the honest answer is
    the value that was committed -- not unavailable, and not a stale estimate."""
    sensor, _coordinator, tasks, _clock, _connect = _sensor(None)

    sensor._async_zone_updated(1)
    await _run(tasks)

    assert sensor.native_value == pytest.approx(-6.0)
    assert sensor.extra_state_attributes["live"] is False
    assert sensor.extra_state_attributes["since"] is None


@pytest.mark.asyncio
async def test_it_starts_from_the_committed_bucket_before_anything_is_estimated():
    sensor, _coordinator, _tasks, _clock, _connect = _sensor(ESTIMATE)

    assert sensor.native_value == pytest.approx(-6.0)
    assert sensor.extra_state_attributes["live"] is False


@pytest.mark.asyncio
async def test_a_failing_estimate_does_not_take_the_entity_down():
    sensor, coordinator, tasks, _clock, _connect = _sensor(ESTIMATE)
    coordinator.async_estimate_zone_now = AsyncMock(side_effect=RuntimeError("boom"))

    sensor._async_zone_updated(1)
    await _run(tasks)

    assert sensor.native_value == pytest.approx(-6.0)
    assert sensor.extra_state_attributes["live"] is False


@pytest.mark.asyncio
async def test_another_zone_s_readings_are_not_ours():
    sensor, coordinator, tasks, _clock, _connect = _sensor(ESTIMATE)

    sensor._async_zone_updated(2)

    assert tasks == []
    coordinator.async_estimate_zone_now.assert_not_awaited()
    _close(tasks)


@pytest.mark.asyncio
async def test_fast_sensors_cannot_make_it_spin():
    """Continuous updates can land a reading every few seconds on every zone,
    and each estimate re-aggregates the whole window."""
    sensor, _coordinator, tasks, clock, _connect = _sensor(ESTIMATE)

    sensor._async_zone_updated(1)
    assert len(tasks) == 1
    clock["t"] += 5
    sensor._async_zone_updated(1)
    clock["t"] += 5
    sensor._async_zone_updated(1)
    assert len(tasks) == 1, "the two within thirty seconds were dropped"

    clock["t"] += 31
    sensor._async_zone_updated(1)
    assert len(tasks) == 2
    _close(tasks)


@pytest.mark.asyncio
async def test_the_estimate_arrives_in_the_unit_shown():
    """The estimate converts already (live_estimate.py), so the sensor must not
    convert again -- which is exactly the bug the dashboard card had."""
    sensor, _coordinator, tasks, _clock, _connect = _sensor(
        {**ESTIMATE, "bucket": -0.295}, units=US_CUSTOMARY_SYSTEM
    )

    sensor._async_zone_updated(1)
    await _run(tasks)

    # -0.295 in, shown as it came, rounded to the two decimals an inch needs.
    assert sensor.native_value == pytest.approx(-0.29, abs=0.001)


@pytest.mark.asyncio
async def test_the_committed_fallback_is_converted():
    """It comes from the store, which is metric: -6 mm is -0.24 in."""
    sensor, _coordinator, _tasks, _clock, _connect = _sensor(
        None, units=US_CUSTOMARY_SYSTEM
    )

    assert sensor.native_value == pytest.approx(-0.24, abs=0.01)


@pytest.mark.asyncio
async def test_it_listens_to_the_signal_that_carries_new_readings():
    _sensor_obj, _coordinator, _tasks, _clock, connect = _sensor(ESTIMATE)

    signals = [call.args[1] for call in connect.call_args_list]
    assert const.DOMAIN + "_config_updated" in signals


@pytest.mark.asyncio
async def test_it_is_unique_per_zone():
    sensor, _coordinator, _tasks, _clock, _connect = _sensor(ESTIMATE)

    assert sensor.unique_id == f"{const.DOMAIN}_1_live_bucket"


# --- #869: the entity dropped to last night's bucket for a few minutes ---

CALCULATED = {
    **ZONE,
    const.ZONE_LAST_CALCULATED: "2026-09-27T23:00:00",
    const.ZONE_LAST_CONSUMED_AT: "2026-09-27T23:00:00",
}


@pytest.mark.asyncio
async def test_one_failed_estimate_keeps_the_last_one():
    """Megalos's graph: live at -3.62, then -2.95 (committed) for seven
    minutes, then live again. Nothing had moved the window in between, so there
    was still something to estimate from: that attempt failed, and the last
    estimate was the better answer."""
    sensor, coordinator, tasks, clock, _connect = _sensor(ESTIMATE, zone=CALCULATED)
    sensor._async_zone_updated(1)
    await _run(tasks)

    coordinator.async_estimate_zone_now = AsyncMock(side_effect=RuntimeError("boom"))
    clock["t"] += 60
    sensor._async_zone_updated(1)
    await _run(tasks)

    assert sensor.native_value == pytest.approx(-7.5)
    assert sensor.extra_state_attributes["live"] is True


@pytest.mark.asyncio
async def test_a_calculation_still_brings_it_back_to_the_committed_bucket():
    """The window moved: the committed bucket is what the zone stands at."""
    sensor, coordinator, tasks, clock, _connect = _sensor(ESTIMATE, zone=CALCULATED)
    sensor._async_zone_updated(1)
    await _run(tasks)

    coordinator.store.get_zone = MagicMock(
        return_value={
            **CALCULATED,
            const.ZONE_BUCKET: -7.4,
            const.ZONE_LAST_CALCULATED: "2026-09-28T23:00:00",
            const.ZONE_LAST_CONSUMED_AT: "2026-09-28T23:00:00",
        }
    )
    coordinator.async_estimate_zone_now = AsyncMock(return_value=None)
    clock["t"] += 60
    sensor._async_zone_updated(1)
    await _run(tasks)

    assert sensor.native_value == pytest.approx(-7.4)
    assert sensor.extra_state_attributes["live"] is False


@pytest.mark.asyncio
async def test_a_bucket_reset_also_moves_the_window():
    sensor, coordinator, tasks, clock, _connect = _sensor(ESTIMATE, zone=CALCULATED)
    sensor._async_zone_updated(1)
    await _run(tasks)

    coordinator.store.get_zone = MagicMock(
        return_value={**CALCULATED, const.ZONE_BUCKET: 0.0}
    )
    coordinator.async_estimate_zone_now = AsyncMock(return_value=None)
    clock["t"] += 60
    sensor._async_zone_updated(1)
    await _run(tasks)

    assert sensor.native_value == pytest.approx(0.0)
    assert sensor.extra_state_attributes["live"] is False


def _last_state(value, **attributes):
    state = MagicMock()
    state.state = str(value)
    state.attributes = {"unit_of_measurement": const.UNIT_MM, **attributes}
    return state


@pytest.mark.asyncio
async def test_a_restart_comes_back_with_the_estimate_it_had():
    sensor, _coordinator, _tasks, _clock, _connect = _sensor(None, zone=CALCULATED)
    sensor.async_get_last_state = AsyncMock(
        return_value=_last_state(-7.5, live=True, since="2026-09-27T23:00:00")
    )

    await sensor._async_restore_estimate()

    assert sensor.native_value == pytest.approx(-7.5)
    assert sensor.extra_state_attributes["live"] is True


@pytest.mark.asyncio
async def test_a_restart_after_a_calculation_does_not_bring_back_the_old_one():
    sensor, _coordinator, _tasks, _clock, _connect = _sensor(None, zone=CALCULATED)
    sensor.async_get_last_state = AsyncMock(
        return_value=_last_state(-7.5, live=True, since="2026-09-26T23:00:00")
    )

    await sensor._async_restore_estimate()

    assert sensor.native_value == pytest.approx(-6.0)
    assert sensor.extra_state_attributes["live"] is False


@pytest.mark.asyncio
async def test_a_restart_in_another_unit_does_not_bring_it_back():
    sensor, _coordinator, _tasks, _clock, _connect = _sensor(
        None, units=US_CUSTOMARY_SYSTEM, zone=CALCULATED
    )
    sensor.async_get_last_state = AsyncMock(
        return_value=_last_state(-7.5, live=True, since="2026-09-27T23:00:00")
    )

    await sensor._async_restore_estimate()

    assert sensor.extra_state_attributes["live"] is False
