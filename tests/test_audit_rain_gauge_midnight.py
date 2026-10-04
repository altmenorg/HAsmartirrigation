"""A rain gauge's midnight is Home Assistant's, not the machine's.

A "rain today" sensor restarts at Home Assistant's local midnight. The buffer
stamps its readings with the machine's naive clock, and "crossed midnight" was
decided on that clock. In a container left on UTC, with Home Assistant in
Europe/Paris, the two midnights are two hours apart:

- a revision from 4.3 to 3.0 just after UTC midnight was taken for the daily
  reset, and the 3.0 mm were counted a second time;
- the real reset just after Paris midnight, read 0.3 after a total of 0.5, was
  taken for a revision of that total, and the rain since midnight was lost.
"""

import calendar
import time
from contextlib import contextmanager
from datetime import datetime, timedelta
from unittest.mock import patch
from zoneinfo import ZoneInfo

import pytest
from homeassistant.util import dt as dt_util

from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.live_estimate import _aware_iso

change = CalculationMixin._cumulative_change

# Midnight UTC, 2026-09-20. Paris is UTC+2 (summer time) on that day.
UTC_MIDNIGHT = datetime(2026, 9, 20, 0, 0, 0)


def _at(hours):
    """A naive process-clock stamp ``hours`` after UTC_MIDNIGHT, as buffered."""
    return (UTC_MIDNIGHT + timedelta(hours=hours)).isoformat()


@contextmanager
def _machine_on_utc(home_assistant_zone):
    """The machine's clock on UTC and Home Assistant's in ``home_assistant_zone``.

    Restored here rather than by monkeypatch: the test harness checks the
    default zone when its own fixtures are torn down, which can come first.
    """
    with (
        patch.object(time, "timezone", 0),
        patch.object(time, "altzone", 0),
        patch.object(time, "mktime", lambda t: float(calendar.timegm(t))),
        patch.object(time, "localtime", time.gmtime),
        patch.object(dt_util, "DEFAULT_TIME_ZONE", ZoneInfo(home_assistant_zone)),
    ):
        yield


@pytest.fixture
def container_on_utc_home_assistant_in_paris():
    """The machine's clock on UTC, Home Assistant's on Europe/Paris."""
    with _machine_on_utc("Europe/Paris"):
        yield


@pytest.mark.usefixtures("container_on_utc_home_assistant_in_paris")
def test_a_revision_just_after_utc_midnight_is_not_a_reset():
    """00:10 UTC is 02:10 in Paris, the same day as the 4.3 read before it."""
    assert change(
        [4.3, 3.0], [_at(-0.2), _at(10 / 60)], start=4.3, start_stamp=_at(-0.5)
    ) == pytest.approx(0.0)


@pytest.mark.usefixtures("container_on_utc_home_assistant_in_paris")
def test_the_reset_at_paris_midnight_keeps_its_rain():
    """22:05 UTC is 00:05 the next day in Paris: 0.3 after 0.5 is a reset."""
    assert change(
        [0.5, 0.3],
        [_at(21 + 55 / 60), _at(22 + 5 / 60)],
        start=0.5,
        start_stamp=_at(21),
    ) == pytest.approx(0.3)


@pytest.mark.usefixtures("container_on_utc_home_assistant_in_paris")
def test_aware_stamps_are_read_on_home_assistants_clock():
    utc = ZoneInfo("UTC")
    stamps = [
        datetime(2026, 9, 20, 21, 55, tzinfo=utc),
        datetime(2026, 9, 20, 22, 5, tzinfo=utc),
    ]

    assert change([0.5, 0.3], stamps, start=0.5, start_stamp=stamps[0]) == (
        pytest.approx(0.3)
    )


@pytest.mark.usefixtures("container_on_utc_home_assistant_in_paris")
def test_the_estimate_says_since_when_with_its_offset():
    """Sent naive, a browser read the machine's 22:00 UTC as its own 22:00."""
    stamp = datetime(2026, 9, 20, 22, 0)

    assert _aware_iso(stamp) == "2026-09-21T00:00:00+02:00"
    assert _aware_iso(stamp.isoformat()) == "2026-09-21T00:00:00+02:00"
    assert _aware_iso(None) is None
    assert _aware_iso("not a date") == "not a date"


def test_with_both_clocks_alike_a_drop_across_midnight_is_still_a_reset():
    """Nothing changes where the machine and Home Assistant agree."""
    with _machine_on_utc("UTC"):
        across_midnight = change(
            [4.3, 3.0], [_at(-0.2), _at(10 / 60)], start=4.3, start_stamp=_at(-0.5)
        )
        same_day = change(
            [0.5, 0.3],
            [_at(21 + 55 / 60), _at(22 + 5 / 60)],
            start=0.5,
            start_stamp=_at(21),
        )

    assert across_midnight == pytest.approx(3.0)
    assert same_day == pytest.approx(0.0)
