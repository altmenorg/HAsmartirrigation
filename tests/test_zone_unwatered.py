"""A dry zone that no program will water is reported, once, and clears itself."""

import asyncio
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.alerts import (
    ZoneUnwateredMixin,
    covered_zones,
    dry_threshold_mm,
    dry_zones,
    track_dry,
    unwatered,
)

NOW = datetime(2026, 10, 6, 12, 0, tzinfo=timezone.utc)


def _zone(zone_id=0, bucket=-20.0, **kw):
    data = {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_BUCKET: bucket,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
    }
    data.update(kw)
    return data


def _program(pid="p", zones=(0,), **kw):
    data = {
        const.PROGRAM_ID: pid,
        const.PROGRAM_STEPS: [{const.STEP_ZONES: list(zones)}],
        const.PROGRAM_SCHEDULES: [{"time": "06:00"}],
    }
    data.update(kw)
    return data


def _covered(programs, suspended=()):
    return covered_zones(programs, [0, 1], lambda pid: pid in suspended)


# --- the pure core -----------------------------------------------------------


def test_a_program_covers_its_zones_only_while_it_can_water():
    assert _covered([_program(zones=(0,))]) == {0}
    assert _covered([_program(enabled=False)]) == set()
    assert _covered([_program()], suspended={"p"}) == set()
    assert _covered([_program(schedules=[])]) == set()
    assert _covered([_program(schedules=[{"enabled": False}])]) == set()
    off_step = _program(steps=[{const.STEP_ZONES: [0], const.STEP_ENABLED: False}])
    assert _covered([off_step]) == set()


def test_the_main_program_covers_every_zone_while_it_is_on():
    main = {const.PROGRAM_ID: "main", const.PROGRAM_MAIN: True}
    assert _covered([main]) == {0, 1}
    assert _covered([{**main, const.PROGRAM_ENABLED: False}]) == set()
    assert _covered([main], suspended={"main"}) == set()


def test_dry_is_half_the_maximum_bucket_or_the_threshold_if_larger():
    assert dry_threshold_mm(_zone()) == 12.0
    assert dry_threshold_mm(_zone(**{const.ZONE_IRRIGATION_THRESHOLD: 15.0})) == 15.0
    assert dry_threshold_mm({}) == const.DRY_ZONE_MIN_DEFICIT_MM
    assert dry_zones([_zone(0, -11.9), _zone(1, -12.0)]) == {1: 12.0}


def test_only_automatic_zones_with_a_bucket_can_be_dry():
    zones = [
        _zone(0, -20, **{const.ZONE_STATE: const.ZONE_STATE_MANUAL}),
        _zone(1, None),
        _zone(2, 5.0),
        _zone(3, -20),
    ]
    assert set(dry_zones(zones)) == {3}


def test_the_count_keeps_the_first_moment_and_drops_zones_that_recover():
    earlier = NOW - timedelta(days=2)
    since = track_dry({0: earlier, 5: earlier}, {0, 1}, NOW)
    assert since == {0: earlier, 1: NOW}


def test_a_zone_is_unwatered_after_more_than_three_days():
    since = {
        0: NOW - timedelta(days=3),
        1: NOW - timedelta(days=3, hours=1),
        2: NOW - timedelta(days=5),
    }
    assert unwatered(since, NOW) == {1: 3, 2: 5}


# --- the coordinator side ----------------------------------------------------


def _coordinator(zones, programs, full=True, suspended=()):
    class _C(ZoneUnwateredMixin):
        pass

    c = _C()
    c.hass = MagicMock()
    c.store = MagicMock()
    c.store.config = SimpleNamespace(full_controller=full, programs=programs)
    c.store.async_get_zones = AsyncMock(return_value=zones)
    c.suspended = set(suspended)
    c.is_suspended = lambda kind, ident: (kind, ident) in c.suspended
    return c


def _check(c, now=NOW):
    with patch(
        "custom_components.smart_irrigation.alerts.dt_util.utcnow", return_value=now
    ), patch("custom_components.smart_irrigation.alerts.ir") as ir:
        asyncio.run(c.async_check_zone_unwatered())
    return ir


def _fired(c):
    return [call.args for call in c.hass.bus.async_fire.call_args_list]


def test_the_notice_comes_after_three_days_with_one_event():
    c = _coordinator([_zone()], [_program(enabled=False)])

    ir = _check(c)
    ir.async_create_issue.assert_not_called()

    ir = _check(c, NOW + timedelta(days=3, hours=1))
    ir.async_create_issue.assert_called_once()
    args = ir.async_create_issue.call_args
    assert args[0][2] == "dry_zone_not_watered_0"
    assert args.kwargs["translation_key"] == "dry_zone_not_watered"
    assert args.kwargs["translation_placeholders"] == {"zone": "Zone 0", "days": "3"}
    assert args.kwargs["is_fixable"] is False
    [(name, data)] = _fired(c)
    assert name == "smart_irrigation_zone_unwatered"
    assert data["zone_id"] == 0 and data["days"] == 3 and data["deficit_mm"] == 20.0

    # Still the case the next day: the notice is refreshed, no second event.
    c.hass.bus.async_fire.reset_mock()
    ir = _check(c, NOW + timedelta(days=4, hours=1))
    assert (
        ir.async_create_issue.call_args.kwargs["translation_placeholders"]["days"]
        == "4"
    )
    assert _fired(c) == []


def test_watering_or_a_program_covering_the_zone_clears_the_notice():
    c = _coordinator([_zone()], [_program(enabled=False)])
    _check(c)
    _check(c, NOW + timedelta(days=4))

    c.store.config.programs = [_program()]
    ir = _check(c, NOW + timedelta(days=5))
    ir.async_delete_issue.assert_called_with(
        c.hass, const.DOMAIN, "dry_zone_not_watered_0"
    )
    ir.async_create_issue.assert_not_called()

    # Dry again later, uncovered again: the count starts from zero.
    c.store.config.programs = [_program(enabled=False)]
    ir = _check(c, NOW + timedelta(days=6))
    ir.async_create_issue.assert_not_called()


def test_a_zone_that_was_watered_clears_the_notice():
    c = _coordinator([_zone()], [_program(enabled=False)])
    _check(c)
    _check(c, NOW + timedelta(days=4))

    c.store.async_get_zones = AsyncMock(return_value=[_zone(bucket=-1.0)])
    ir = _check(c, NOW + timedelta(days=5))
    ir.async_delete_issue.assert_called_once()


def test_a_suspended_zone_is_left_alone():
    c = _coordinator(
        [_zone()],
        [_program(enabled=False)],
        suspended={(const.SUSPEND_ZONE, 0)},
    )
    _check(c)
    ir = _check(c, NOW + timedelta(days=9))
    ir.async_create_issue.assert_not_called()


def test_nothing_happens_when_the_full_controller_is_off():
    c = _coordinator([_zone()], [_program(enabled=False)], full=False)
    _check(c)
    ir = _check(c, NOW + timedelta(days=9))
    ir.async_create_issue.assert_not_called()
    assert _fired(c) == []


def test_setup_starts_one_timer_and_teardown_cancels_it_and_clears_notices():
    c = _coordinator([_zone()], [_program(enabled=False)])
    unsub = MagicMock()
    with patch(
        "custom_components.smart_irrigation.alerts.async_track_time_interval",
        return_value=unsub,
    ) as track, patch("custom_components.smart_irrigation.alerts.ir"):
        asyncio.run(c.async_setup_zone_unwatered_watch())
        track.assert_called_once()
        assert track.call_args[0][2] == timedelta(hours=24)
        c._unwatered_issues = {0}
        c._dry_since = {0: NOW}
        with patch("custom_components.smart_irrigation.alerts.ir") as ir:
            c.async_teardown_zone_unwatered_watch()
    unsub.assert_called_once()
    ir.async_delete_issue.assert_called_once_with(
        c.hass, const.DOMAIN, "dry_zone_not_watered_0"
    )
    assert c._dry_since == {} and c._unwatered_issues == set()


def test_setup_does_not_start_a_timer_when_the_controller_is_off():
    c = _coordinator([_zone()], [], full=False)
    with patch(
        "custom_components.smart_irrigation.alerts.async_track_time_interval"
    ) as track, patch("custom_components.smart_irrigation.alerts.ir"):
        asyncio.run(c.async_setup_zone_unwatered_watch())
    track.assert_not_called()
