"""A weather sensor that stops reporting is reported, once, and clears itself."""

import asyncio
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import homeassistant.util.dt as dt_util

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.liveness import (
    FieldReport,
    SilentField,
    WeatherLivenessMixin,
    diff_silent,
    silent_fields,
)

NOW = datetime(2026, 10, 6, 12, 0, tzinfo=timezone.utc)


def _report(field="Temperature", hours_ago=1.0, **kw):
    return FieldReport(field, "sensor.t", NOW - timedelta(hours=hours_ago), **kw)


# --- the pure core -----------------------------------------------------------


def test_a_recent_report_is_alive_and_an_old_one_is_silent():
    assert silent_fields([_report(hours_ago=5.9)], NOW) == []
    result = silent_fields([_report(hours_ago=6.5)], NOW)
    assert [s.field for s in result] == ["Temperature"]
    assert result[0].since == NOW - timedelta(hours=6.5)


def test_the_threshold_can_differ_per_field():
    reports = [_report("Temperature", 3), _report("Humidity", 3)]
    result = silent_fields(reports, NOW, {"Humidity": timedelta(hours=2)})
    assert [s.field for s in result] == ["Humidity"]


def test_a_source_that_never_reported_is_counted_from_its_floor():
    never = FieldReport("Humidity", "sensor.h", None, NOW - timedelta(hours=7))
    assert [s.field for s in silent_fields([never], NOW)] == ["Humidity"]
    fresh_floor = FieldReport("Humidity", "sensor.h", None, NOW - timedelta(hours=1))
    assert silent_fields([fresh_floor], NOW) == []
    nothing = FieldReport("Humidity", "sensor.h", None, None)
    assert silent_fields([nothing], NOW) == []


def test_a_floor_newer_than_the_last_report_wins():
    after_downtime = _report(hours_ago=30, not_before=NOW - timedelta(hours=1))
    assert silent_fields([after_downtime], NOW) == []


def test_events_are_for_changes_only():
    silent = [SilentField("Temperature", "s", NOW)]
    newly, recovered = diff_silent(set(), silent)
    assert [s.field for s in newly] == ["Temperature"] and recovered == []
    newly, recovered = diff_silent({"Temperature"}, silent)
    assert newly == [] and recovered == []
    newly, recovered = diff_silent({"Temperature"}, [])
    assert newly == [] and recovered == ["Temperature"]


# --- the coordinator side ----------------------------------------------------


def _state(hours_ago):
    stamp = NOW - timedelta(hours=hours_ago)
    return MagicMock(last_reported=stamp, last_updated=stamp)


def _mapping(**sources):
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_NAME: "Garden",
        const.MAPPING_MAPPINGS: {
            key: (
                {const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_NONE}
                if entity is None
                else {
                    const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
                    const.MAPPING_CONF_SENSOR: entity,
                }
            )
            for key, entity in sources.items()
        },
    }


def _coordinator(mapping, states, zones=None):
    class _C(WeatherLivenessMixin):
        pass

    c = _C()
    c.hass = MagicMock()
    c.hass.states.get = lambda entity_id: states.get(entity_id)
    c.use_weather_service = False
    c.store = MagicMock()
    c.store.async_get_zones = AsyncMock(
        return_value=zones
        or [
            {
                const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
                const.ZONE_MAPPING: 1,
            }
        ]
    )
    c.store.get_mapping = lambda _id: mapping
    return c


def _check(c):
    with patch(
        "custom_components.smart_irrigation.liveness.dt_util.utcnow", return_value=NOW
    ), patch("custom_components.smart_irrigation.liveness.ir") as ir:
        asyncio.run(c.async_check_weather_liveness())
    return ir


def _fired(c):
    return [call.args for call in c.hass.bus.async_fire.call_args_list]


def test_a_silent_sensor_raises_one_notice_and_one_event():
    mapping = _mapping(Temperature="sensor.t", Humidity="sensor.h")
    states = {"sensor.t": _state(8), "sensor.h": _state(1)}
    c = _coordinator(mapping, states)

    ir = _check(c)

    ir.async_create_issue.assert_called_once()
    assert ir.async_create_issue.call_args[0][2] == "weather_silent_1"
    placeholders = ir.async_create_issue.call_args.kwargs["translation_placeholders"]
    assert "Temperature (sensor.t)" in placeholders["sensors"]
    assert "Humidity" not in placeholders["sensors"]
    events = _fired(c)
    assert len(events) == 1
    assert events[0][0] == "smart_irrigation_weather_stale"
    assert events[0][1]["fields"] == ["Temperature"]
    assert events[0][1]["mapping_id"] == 1

    # Still silent at the next check: the notice is kept, no second event.
    c.hass.bus.async_fire.reset_mock()
    _check(c)
    assert c.hass.bus.async_fire.call_count == 0


def test_recovery_clears_the_notice_and_fires_once():
    mapping = _mapping(Temperature="sensor.t")
    states = {"sensor.t": _state(8)}
    c = _coordinator(mapping, states)
    _check(c)
    c.hass.bus.async_fire.reset_mock()

    states["sensor.t"] = _state(0.1)
    ir = _check(c)

    ir.async_delete_issue.assert_called_with(c.hass, const.DOMAIN, "weather_silent_1")
    ir.async_create_issue.assert_not_called()
    events = _fired(c)
    assert [e[0] for e in events] == ["smart_irrigation_weather_recovered"]
    assert events[0][1]["fields"] == ["Temperature"]


def test_fields_the_group_does_not_use_never_alert():
    mapping = _mapping(Temperature="sensor.t", Humidity=None, Dewpoint=None)
    mapping[const.MAPPING_MAPPINGS]["Pressure"] = {
        const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
        const.MAPPING_CONF_SENSOR: "sensor.p",
    }
    states = {"sensor.t": _state(1), "sensor.p": _state(48)}
    c = _coordinator(mapping, states)

    ir = _check(c)

    ir.async_create_issue.assert_not_called()
    assert _fired(c) == []


def test_a_group_no_automatic_zone_uses_is_not_watched():
    mapping = _mapping(Temperature="sensor.t")
    zones = [{const.ZONE_STATE: const.ZONE_STATE_MANUAL, const.ZONE_MAPPING: 1}]
    c = _coordinator(mapping, {"sensor.t": _state(9)}, zones)

    ir = _check(c)

    ir.async_create_issue.assert_not_called()


def test_a_missing_entity_is_counted_from_when_watching_began():
    mapping = _mapping(Temperature="sensor.gone")
    c = _coordinator(mapping, {})
    c._weather_liveness_started = NOW - timedelta(hours=2)
    _check(c)
    assert _fired(c) == []

    c._weather_liveness_started = NOW - timedelta(hours=7)
    _check(c)
    assert [e[0] for e in _fired(c)] == ["smart_irrigation_weather_stale"]


def test_the_weather_service_counts_from_its_last_successful_fetch():
    mapping = {
        const.MAPPING_ID: 1,
        const.MAPPING_NAME: "Garden",
        # Stored as the naive local time the integration stamps with.
        const.MAPPING_DATA_LAST_UPDATED: dt_util.as_local(
            NOW - timedelta(hours=9)
        ).replace(tzinfo=None),
        const.MAPPING_MAPPINGS: {
            "Temperature": {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
            }
        },
    }
    c = _coordinator(mapping, {})
    c.use_weather_service = True
    c._weather_liveness_started = NOW - timedelta(hours=8)
    _check(c)
    assert [e[0] for e in _fired(c)] == ["smart_irrigation_weather_stale"]


# --- the timer ---------------------------------------------------------------


def test_setup_starts_one_timer_and_teardown_cancels_it_and_the_notices():
    mapping = _mapping(Temperature="sensor.t")
    c = _coordinator(mapping, {"sensor.t": _state(8)})
    unsub = MagicMock()
    with patch(
        "custom_components.smart_irrigation.liveness.async_track_time_interval",
        return_value=unsub,
    ) as track, patch(
        "custom_components.smart_irrigation.liveness.dt_util.utcnow",
        return_value=NOW,
    ), patch(
        "custom_components.smart_irrigation.liveness.ir"
    ) as ir:
        asyncio.run(c.async_setup_weather_liveness())
        track.assert_called_once()
        assert track.call_args[0][2] == timedelta(minutes=15)
        ir.async_create_issue.assert_called_once()

        # Setting up again replaces the timer instead of stacking another.
        asyncio.run(c.async_setup_weather_liveness())
        assert unsub.call_count == 1

        c.async_teardown_weather_liveness()
        assert unsub.call_count == 2
        ir.async_delete_issue.assert_called_with(
            c.hass, const.DOMAIN, "weather_silent_1"
        )
    assert c._weather_silent == {}
    assert c._weather_liveness_unsub is None
