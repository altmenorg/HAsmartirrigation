"""A binary rain sensor is worth more than a veto, and less than millimetres.

Where rain arrives in millimetres, the bucket carries it and how long it keeps
counting falls out of the arithmetic. Where the only rain information is a
binary sensor, all we could do was veto the day it was on: a garden that took
two days of rain watered at full duration on the first dry evening.

So for that case, and only that case, the sensor's own history shortens the run:
how much of each of the last five days it spent reporting rain, weighted so that
yesterday counts for more than four days ago. The bucket is never touched --
this does not know a single millimetre, and a balance in millimetres must not be
credited with a guess.

The idea of weighting rain over rolling days comes from kloggy's package. What
is tested here is ours, including the thing that makes it safe: a zone whose
sensor group has real rain data never reaches it.
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.rain_history import (
    DAY_WEIGHTS,
    MAX_FACTOR,
    MIN_FACTOR,
    _fraction_raining,
    rain_suppression,
)
from custom_components.smart_irrigation.triggers import TriggersMixin

NOW = datetime.datetime(2026, 9, 27, 20, 0, tzinfo=datetime.UTC)


class _State:
    """A recorded state, as the recorder hands them over."""

    def __init__(self, state, last_changed):
        self.state = state
        self.last_changed = last_changed


def _at(hours_ago, state):
    return _State(state, NOW - datetime.timedelta(hours=hours_ago))


# --- the fraction of a window spent raining ---------------------------------


def test_a_window_that_was_dry_throughout():
    start, end = NOW - datetime.timedelta(days=1), NOW

    assert _fraction_raining([_State("off", start)], start, end) == 0.0


def test_a_window_that_was_wet_throughout():
    start, end = NOW - datetime.timedelta(days=1), NOW

    assert _fraction_raining([_State("on", start)], start, end) == 1.0


def test_half_a_window():
    start, end = NOW - datetime.timedelta(days=1), NOW
    states = [_State("off", start), _State("on", start + datetime.timedelta(hours=12))]

    assert _fraction_raining(states, start, end) == pytest.approx(0.5)


def test_a_state_is_held_until_the_next_one():
    """Which is what a recorded state means: nothing is written while nothing
    changes, so two hours of "on" is two hours of rain."""
    start, end = NOW - datetime.timedelta(hours=24), NOW
    states = [
        _State("off", start),
        _State("on", start + datetime.timedelta(hours=2)),
        _State("off", start + datetime.timedelta(hours=8)),
    ]

    assert _fraction_raining(states, start, end) == pytest.approx(6 / 24)


@pytest.mark.parametrize("word", ["on", "ON", "wet", "raining", "rain", "true"])
def test_the_words_a_rain_sensor_uses(word):
    start, end = NOW - datetime.timedelta(days=1), NOW

    assert _fraction_raining([_State(word, start)], start, end) == 1.0


@pytest.mark.parametrize("word", ["off", "dry", "unavailable", "unknown", ""])
def test_and_the_words_that_are_not_rain(word):
    start, end = NOW - datetime.timedelta(days=1), NOW

    assert _fraction_raining([_State(word, start)], start, end) == 0.0


def test_an_empty_window_is_not_a_division_by_zero():
    assert _fraction_raining([_State("on", NOW)], NOW, NOW) == 0.0


# --- the factor -------------------------------------------------------------


def _hass(states):
    hass = MagicMock()
    instance = MagicMock()

    async def _job(func, *args):
        return {"binary_sensor.rain": states}

    instance.async_add_executor_job = AsyncMock(side_effect=_job)
    return hass, instance


async def _suppression(states):
    hass, instance = _hass(states)
    with patch(
        "custom_components.smart_irrigation.rain_history.get_instance",
        return_value=instance,
    ):
        return await rain_suppression(hass, "binary_sensor.rain", now=NOW)


@pytest.mark.asyncio
async def test_a_day_of_rain_today_takes_the_whole_run():
    """Today is worth a run on its own: a sensor that reported rain all day
    suppresses it, which is what the veto did, arrived at from the numbers."""
    result = await _suppression([_State("on", NOW - datetime.timedelta(days=5))])

    assert result["factor"] == 1.0
    assert result["factor"] > MAX_FACTOR


@pytest.mark.asyncio
async def test_a_dry_week_takes_nothing():
    result = await _suppression([_State("off", NOW - datetime.timedelta(days=5))])

    assert result["factor"] == 0.0
    assert result["factor"] < MIN_FACTOR


@pytest.mark.asyncio
async def test_rain_yesterday_counts_for_less_than_rain_today():
    today = await _suppression([_at(24, "off"), _at(23, "on")])
    yesterday = await _suppression([_at(48, "off"), _at(47, "on"), _at(23, "off")])

    assert today["factor"] > yesterday["factor"] > 0


@pytest.mark.asyncio
async def test_four_days_ago_still_counts_a_little():
    result = await _suppression([_at(120, "off"), _at(119, "on"), _at(96, "off")])

    assert 0 < result["factor"] <= DAY_WEIGHTS[-1]


@pytest.mark.asyncio
async def test_a_wet_week_is_capped_at_the_whole_run():
    """The weights add up to more than one on purpose; the factor cannot."""
    assert sum(DAY_WEIGHTS) > 1.0

    result = await _suppression([_State("on", NOW - datetime.timedelta(days=6))])

    assert result["factor"] == 1.0


@pytest.mark.asyncio
async def test_every_window_is_reported_so_the_panel_can_say_why():
    result = await _suppression([_at(30, "on"), _at(25, "off")])

    assert len(result["days"]) == len(DAY_WEIGHTS)
    assert result["source"] == "binary_sensor.rain"
    assert all("fraction" in day and "weight" in day for day in result["days"])


@pytest.mark.asyncio
async def test_no_entity_is_no_answer():
    hass, _instance = _hass([])

    assert await rain_suppression(hass, None, now=NOW) is None
    assert await rain_suppression(hass, "", now=NOW) is None


@pytest.mark.asyncio
async def test_a_sensor_the_recorder_never_saw_is_no_answer():
    assert await _suppression([]) is None


@pytest.mark.asyncio
async def test_without_a_recorder_nothing_changes():
    """An installation can be running without the recorder, and that is not a
    reason to fail a run."""
    hass = MagicMock()
    with patch(
        "custom_components.smart_irrigation.rain_history.get_instance",
        side_effect=RuntimeError("no recorder"),
    ):
        assert await rain_suppression(hass, "binary_sensor.rain", now=NOW) is None


# --- applying it, which is where the degraded rule lives --------------------


def _zone(zone_id=0, duration=600, mapping=0, state=const.ZONE_STATE_AUTOMATIC):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_DURATION: duration,
        const.ZONE_MAPPING: mapping,
        const.ZONE_STATE: state,
    }


def _mapping(*sourced):
    return {
        const.MAPPING_ID: 0,
        const.MAPPING_MAPPINGS: {
            key: {const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR}
            for key in sourced
        },
    }


def _coordinator(zones, mapping, *, enabled=True, factor=0.5):
    class _Coordinator(TriggersMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.async_get_config = AsyncMock(
        return_value={
            const.CONF_RAIN_HISTORY_ENABLED: enabled,
            const.CONF_RAIN_SENSOR: "binary_sensor.rain",
        }
    )
    coordinator.store.async_get_zones = AsyncMock(return_value=zones)
    coordinator.store.async_update_zone = AsyncMock()
    coordinator.store.get_mapping = MagicMock(return_value=mapping)
    coordinator._factor = factor
    return coordinator


async def _apply(coordinator, factor=0.5):
    with (
        patch(
            "custom_components.smart_irrigation.triggers.rain_suppression",
            AsyncMock(
                return_value={
                    "factor": factor,
                    "days": [],
                    "source": "binary_sensor.rain",
                }
            ),
        ),
        patch("custom_components.smart_irrigation.triggers.async_dispatcher_send"),
    ):
        return await coordinator._apply_rain_history_suppression()


@pytest.mark.asyncio
async def test_a_zone_with_no_rain_data_is_shortened():
    zones = [_zone(duration=600)]
    coordinator = _coordinator(zones, _mapping(const.MAPPING_TEMPERATURE))

    await _apply(coordinator, factor=0.5)

    zone_id, changes = coordinator.store.async_update_zone.await_args.args
    assert zone_id == 0
    assert changes[const.ZONE_DURATION] == 300


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "field", [const.MAPPING_PRECIPITATION, const.MAPPING_CURRENT_PRECIPITATION]
)
async def test_a_zone_that_has_rain_in_millimetres_is_left_alone(field):
    """The whole safety of this: where the bucket has the rain, nothing guesses
    at it, in either of the two shapes rain arrives in."""
    coordinator = _coordinator(
        [_zone(duration=600)], _mapping(const.MAPPING_TEMPERATURE, field)
    )

    await _apply(coordinator, factor=0.9)

    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.asyncio
async def test_switched_off_it_does_nothing_at_all():
    coordinator = _coordinator(
        [_zone()], _mapping(const.MAPPING_TEMPERATURE), enabled=False
    )

    assert await _apply(coordinator, factor=0.9) is None
    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_nearly_dry_week_is_not_worth_touching_a_run_for():
    coordinator = _coordinator([_zone()], _mapping(const.MAPPING_TEMPERATURE))

    result = await _apply(coordinator, factor=MIN_FACTOR / 2)

    assert result is not None, "still reported, so the panel can say it looked"
    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_thoroughly_wet_week_holds_the_run_back_entirely():
    coordinator = _coordinator(
        [_zone(duration=600)], _mapping(const.MAPPING_TEMPERATURE)
    )

    await _apply(coordinator, factor=0.99)

    _zone_id, changes = coordinator.store.async_update_zone.await_args.args
    assert changes[const.ZONE_DURATION] == 0


@pytest.mark.asyncio
async def test_a_manual_zone_keeps_the_duration_its_owner_set():
    coordinator = _coordinator(
        [_zone(state=const.ZONE_STATE_MANUAL)], _mapping(const.MAPPING_TEMPERATURE)
    )

    await _apply(coordinator, factor=0.9)

    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_zone_with_nothing_to_water_is_left_alone():
    coordinator = _coordinator([_zone(duration=0)], _mapping(const.MAPPING_TEMPERATURE))

    await _apply(coordinator, factor=0.9)

    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_zone_with_no_sensor_group_is_shortened():
    """It has no rain data by definition, which is the case this is for."""
    coordinator = _coordinator([_zone(mapping=None, duration=600)], None)

    await _apply(coordinator, factor=0.5)

    _zone_id, changes = coordinator.store.async_update_zone.await_args.args
    assert changes[const.ZONE_DURATION] == 300


@pytest.mark.asyncio
async def test_the_rain_it_assumes_is_credited_to_the_bucket():
    """The shortened share of the run is rain the balance never saw: it is
    credited, so the first dry day does not water the whole deficit back
    (phase 1.12)."""
    zone = _zone(duration=600)
    zone[const.ZONE_BUCKET] = -8.0
    coordinator = _coordinator([zone], _mapping(const.MAPPING_TEMPERATURE))

    await _apply(coordinator, factor=0.5)

    _zone_id, changes = coordinator.store.async_update_zone.await_args.args
    assert changes[const.ZONE_DURATION] == 300
    assert changes[const.ZONE_BUCKET] == pytest.approx(-4.0)
