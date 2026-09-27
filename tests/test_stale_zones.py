"""A zone that has stopped being calculated says so (#847).

Megalos had one zone frozen for five days. Everything looked right: the panel
worked, the other zone updated every night, the zone was set to automatic and
showed a bucket. The only trace was one line in the log, and a water need five
days old is calculated from five-day-old weather.

The cause there was a sensor group with id 0 read as no group (#846), fixed.
This is the part that does not depend on the cause: a zone whose last
calculation is far behind the others, or an installation whose newest
calculation is a day and a half old, is reported on the page that answers what
is about to happen.
"""

import datetime

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.delivery import (
    BEHIND_BY_HOURS,
    STALE_AFTER_HOURS,
    stale_zones,
)

NOW = datetime.datetime(2026, 9, 26, 20, 15)


def _zone(zone_id, name, hours_ago, state=const.ZONE_STATE_AUTOMATIC):
    """A zone last calculated ``hours_ago``, or never when that is None."""
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: name,
        const.ZONE_STATE: state,
        const.ZONE_LAST_CALCULATED: (
            None
            if hours_ago is None
            else (NOW - datetime.timedelta(hours=hours_ago)).isoformat()
        ),
    }


def _stale(zones, config=None):
    return stale_zones(config or {}, zones, now=NOW)


def test_the_case_that_was_reported():
    """His two zones, from the diagnostics: one frozen on the 21st, the other
    calculated last night."""
    lawn = _zone(0, "Lawn", 5 * 24 - 3)
    test = _zone(1, "Test", 21)

    stale = _stale([lawn, test])

    assert [entry["zone"] for entry in stale] == ["Lawn"]
    assert stale[0]["zone_id"] == 0
    assert stale[0]["last_calculated"].startswith("2026-09-21")


def test_zones_calculated_in_the_same_run_are_all_current():
    """A nightly run puts them minutes apart, and none of that is a fault."""
    zones = [_zone(0, "Lawn", 21), _zone(1, "Beds", 21.01), _zone(2, "Pots", 21.02)]

    assert _stale(zones) == []


def test_a_zone_a_few_hours_behind_is_not_worth_saying():
    """One zone calculated on demand shortly after a run puts the others
    'behind', and none of it means anything."""
    zones = [_zone(0, "Lawn", 1), _zone(1, "Beds", BEHIND_BY_HOURS - 1)]

    assert _stale(zones) == []


def test_a_whole_installation_that_has_stopped_is_reported():
    """Nothing is behind anything here: everything is simply old."""
    zones = [_zone(0, "Lawn", STALE_AFTER_HOURS + 5), _zone(1, "Beds", 40)]

    assert {entry["zone"] for entry in _stale(zones)} == {"Lawn", "Beds"}


def test_a_zone_never_calculated_while_others_are_is_reported():
    zones = [_zone(0, "Lawn", 21), _zone(1, "New bed", None)]

    stale = _stale(zones)

    assert [entry["zone"] for entry in stale] == ["New bed"]
    assert stale[0]["last_calculated"] is None


def test_a_fresh_installation_is_not_a_fault():
    """Before the first nightly run nothing has calculated, and that is fine."""
    zones = [_zone(0, "Lawn", None), _zone(1, "Beds", None)]

    assert _stale(zones) == []


@pytest.mark.parametrize("state", [const.ZONE_STATE_DISABLED, const.ZONE_STATE_MANUAL])
def test_only_the_zones_a_run_calculates_are_judged(state):
    """A run calculates automatic zones, so nothing else can be behind."""
    zones = [_zone(0, "Lawn", 21), _zone(1, "Old", 5 * 24, state=state)]

    assert _stale(zones) == []


def test_nothing_is_said_when_nothing_is_calculated_on_purpose():
    """Automatic calculation switched off is reported on its own, and every
    zone would otherwise be listed as frozen for as long as it stays off."""
    zones = [_zone(0, "Lawn", 5 * 24), _zone(1, "Beds", 21)]

    assert _stale(zones, {const.CONF_AUTO_CALC_ENABLED: False}) == []


def test_an_unreadable_date_counts_as_never():
    zones = [_zone(0, "Lawn", 21)]
    zones.append(
        {
            const.ZONE_ID: 1,
            const.ZONE_NAME: "Odd",
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            const.ZONE_LAST_CALCULATED: "the other day",
        }
    )

    assert [entry["zone"] for entry in _stale(zones)] == ["Odd"]


def test_a_stored_datetime_is_read_as_well_as_a_string():
    """The store keeps datetimes; the API hands over strings."""
    zones = [
        {
            const.ZONE_ID: 0,
            const.ZONE_NAME: "Lawn",
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            const.ZONE_LAST_CALCULATED: NOW - datetime.timedelta(hours=21),
        },
        {
            const.ZONE_ID: 1,
            const.ZONE_NAME: "Frozen",
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            const.ZONE_LAST_CALCULATED: NOW - datetime.timedelta(days=5),
        },
    ]

    assert [entry["zone"] for entry in _stale(zones)] == ["Frozen"]


def test_an_aware_timestamp_does_not_raise():
    """Installations exist with both forms on disk, and comparing them would
    otherwise fail with a TypeError and take the whole page down."""
    zones = [
        {
            const.ZONE_ID: 0,
            const.ZONE_NAME: "Lawn",
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            const.ZONE_LAST_CALCULATED: "2026-09-26T21:00:00+02:00",
        },
        _zone(1, "Frozen", 5 * 24),
    ]

    assert [entry["zone"] for entry in _stale(zones)] == ["Frozen"]


def test_no_zones_at_all():
    assert _stale([]) == []
    assert stale_zones({}, None) == []
