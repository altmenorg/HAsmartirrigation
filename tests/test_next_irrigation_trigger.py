"""The Info "next irrigation" start time honours the active trigger (#763).

Covers _trigger_start_base_and_offset, which mirrors the sunrise/sunset offset
logic of TriggersMixin so the displayed start matches when irrigation actually
begins, rather than always assuming "finish at sunrise".
"""

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.websockets import (
    _trigger_start_base_and_offset,
)

_TD = 600  # total_duration seconds


def _trig(ttype, offset=0, account=True):
    return {
        const.TRIGGER_CONF_TYPE: ttype,
        const.TRIGGER_CONF_OFFSET_MINUTES: offset,
        const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: account,
    }


def test_default_trigger_finishes_at_sunrise():
    assert _trigger_start_base_and_offset(None, _TD) == ("sunrise", -_TD)


def test_sunrise_offset_accounting_for_duration():
    # The reporter's "before sunrise -2h" trigger, accounting for duration.
    trig = _trig(const.TRIGGER_TYPE_SUNRISE, offset=-120, account=True)
    assert _trigger_start_base_and_offset(trig, _TD) == ("sunrise", -120 * 60 - _TD)


def test_sunrise_zero_offset_finishes_at_sunrise():
    trig = _trig(const.TRIGGER_TYPE_SUNRISE, offset=0, account=True)
    assert _trigger_start_base_and_offset(trig, _TD) == ("sunrise", -_TD)


def test_sunrise_starts_exactly_at_offset_without_duration():
    trig = _trig(const.TRIGGER_TYPE_SUNRISE, offset=30, account=False)
    assert _trigger_start_base_and_offset(trig, _TD) == ("sunrise", 30 * 60)


def test_sunset_accounting_for_duration():
    trig = _trig(const.TRIGGER_TYPE_SUNSET, offset=0, account=True)
    assert _trigger_start_base_and_offset(trig, _TD) == ("sunset", -_TD)


def test_sunset_starts_exactly_at_offset_without_duration():
    trig = _trig(const.TRIGGER_TYPE_SUNSET, offset=15, account=False)
    assert _trigger_start_base_and_offset(trig, _TD) == ("sunset", 15 * 60)


def test_solar_azimuth_falls_back_to_sunrise_minus_duration():
    trig = _trig(const.TRIGGER_TYPE_SOLAR_AZIMUTH, offset=45, account=True)
    assert _trigger_start_base_and_offset(trig, _TD) == ("sunrise", -_TD)


# --- clock-time and solar azimuth triggers ------------------------------------

import datetime as _dt  # noqa: E402

from custom_components.smart_irrigation.websockets import (  # noqa: E402
    _next_azimuth_trigger_start,
    _next_clock_trigger_start,
)

_TZ = _dt.timezone(_dt.timedelta(hours=2))


def _clock(at, account=True):
    return {
        const.TRIGGER_CONF_TYPE: const.TRIGGER_TYPE_TIME,
        const.TRIGGER_CONF_AT: at,
        const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: account,
    }


def test_a_clock_trigger_finishing_at_six_starts_before_it():
    """The preview used "finish at sunrise" for these, whatever the time set."""
    now = _dt.datetime(2026, 9, 21, 20, 0, tzinfo=_TZ)

    start = _next_clock_trigger_start(_clock("06:00"), 1800, now)

    assert start == _dt.datetime(2026, 9, 22, 5, 30, tzinfo=_TZ)


def test_a_clock_trigger_starting_at_a_time_starts_then():
    now = _dt.datetime(2026, 9, 21, 20, 0, tzinfo=_TZ)

    start = _next_clock_trigger_start(_clock("06:00", account=False), 1800, now)

    assert start == _dt.datetime(2026, 9, 22, 6, 0, tzinfo=_TZ)


def test_a_clock_trigger_still_to_come_today_is_today():
    now = _dt.datetime(2026, 9, 21, 4, 0, tzinfo=_TZ)

    start = _next_clock_trigger_start(_clock("06:00"), 1800, now)

    assert start == _dt.datetime(2026, 9, 21, 5, 30, tzinfo=_TZ)


def test_a_long_run_before_an_early_finish_starts_the_evening_before():
    """Finishing at 00:30 after two hours starts at 22:30."""
    now = _dt.datetime(2026, 9, 21, 20, 0, tzinfo=_TZ)

    start = _next_clock_trigger_start(_clock("00:30"), 7200, now)

    assert start == _dt.datetime(2026, 9, 21, 22, 30, tzinfo=_TZ)


def test_a_clock_trigger_without_a_valid_time_has_no_start():
    now = _dt.datetime(2026, 9, 21, 20, 0, tzinfo=_TZ)

    assert _next_clock_trigger_start(_clock("25:00"), 0, now) is None
    assert _next_clock_trigger_start(_clock("soon"), 0, now) is None


def test_an_azimuth_trigger_is_placed_where_the_sun_is():
    """Due south in Nantes near 12:09 UTC on 21 June, minus the run."""
    trigger = {
        const.TRIGGER_CONF_TYPE: const.TRIGGER_TYPE_SOLAR_AZIMUTH,
        const.TRIGGER_CONF_AZIMUTH_ANGLE: 180,
        const.TRIGGER_CONF_OFFSET_MINUTES: 0,
        const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: True,
    }
    now = _dt.datetime(2026, 6, 21, 6, 0, tzinfo=_dt.UTC)

    start = _next_azimuth_trigger_start(trigger, 600, 47.05, -1.73, now)

    expected = _dt.datetime(2026, 6, 21, 12, 9, tzinfo=_dt.UTC) - _dt.timedelta(
        seconds=600
    )
    assert abs((start - expected).total_seconds()) < 3 * 60


def test_an_azimuth_trigger_without_coordinates_has_no_start():
    trigger = {const.TRIGGER_CONF_AZIMUTH_ANGLE: 180}
    now = _dt.datetime(2026, 6, 21, 6, 0, tzinfo=_dt.UTC)

    assert _next_azimuth_trigger_start(trigger, 0, None, None, now) is None


# --- one offset for the trigger and its preview ---------------------------------

from custom_components.smart_irrigation.triggers import (  # noqa: E402
    sun_trigger_offset_seconds,
)


@pytest.mark.parametrize(
    ("offset_minutes", "account", "expected"),
    [
        (0, True, -1800),
        (30, True, 0),
        (-30, True, -3600),
        (30, False, 1800),
        (0, False, 0),
    ],
)
def test_the_sun_trigger_offset(offset_minutes, account, expected):
    assert sun_trigger_offset_seconds(offset_minutes, 1800, account) == expected


@pytest.mark.parametrize(
    "ttype", [const.TRIGGER_TYPE_SUNRISE, const.TRIGGER_TYPE_SUNSET]
)
@pytest.mark.parametrize("offset_minutes", [-45, 0, 20])
@pytest.mark.parametrize("account", [True, False])
def test_the_preview_uses_the_triggers_own_offset(ttype, offset_minutes, account):
    trigger = {
        const.TRIGGER_CONF_TYPE: ttype,
        const.TRIGGER_CONF_OFFSET_MINUTES: offset_minutes,
        const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: account,
    }

    _base, offset = _trigger_start_base_and_offset(trigger, 1800)

    assert offset == sun_trigger_offset_seconds(offset_minutes, 1800, account)
