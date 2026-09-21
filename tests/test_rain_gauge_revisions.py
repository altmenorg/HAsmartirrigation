"""A cumulative rain gauge whose total is revised down is not credited twice.

A "rain today" sensor fed by a web service restates its total as the service
corrects itself, and sometimes restates it down. The Delta aggregate took any
drop that did not reach 0 as a new starting point, so the climb back to the
total it already had was counted as new rain: 4.3 -> 3.0 -> 5.0 booked 6.3 mm
where 5.0 fell. Over-credited rain leaves a fuller bucket and waters less than
the zone needs.

The opposite case matters as much: a counter that restarts at midnight and is
first read at 0.2 rather than exactly 0 was taken for a spurious drop, and those
0.2 mm were lost.

Reported by Megalos, against another fork of this integration that had the same
aggregate.
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin

change = CalculationMixin._cumulative_change

DAY = datetime(2026, 9, 20, 0, 0, 0)


def _at(hours):
    """A stamp ``hours`` after midnight on DAY, in the buffer's format."""
    return (DAY + timedelta(hours=hours)).isoformat()


# --- revisions -------------------------------------------------------------


def test_the_reported_case():
    """4.3, revised to 3.0, then 5.0: 5.0 mm fell, not 6.3."""
    assert change(
        [4.3, 3.0, 5.0], [_at(10), _at(11), _at(12)], start=0.0, start_stamp=_at(1)
    ) == pytest.approx(5.0)


def test_repeated_dips_through_a_wet_day_count_the_rain_once():
    readings = [1.0, 0.8, 2.0, 1.5, 3.0, 2.9, 4.3]
    stamps = [_at(8 + h) for h in range(len(readings))]

    assert change(readings, stamps, start=0.0, start_stamp=_at(1)) == pytest.approx(4.3)


def test_a_revision_that_never_climbs_back_counts_nothing_after_it():
    assert change(
        [2.0, 1.5, 1.8], [_at(9), _at(10), _at(11)], start=0.0, start_stamp=_at(1)
    ) == pytest.approx(2.0)


def test_a_revision_below_the_window_start_counts_nothing():
    """Measured from a baseline of 6.0: a revision to 5.0 and back is 0 mm."""
    assert change(
        [5.0, 6.0], [_at(10), _at(11)], start=6.0, start_stamp=_at(9)
    ) == pytest.approx(0.0)


# --- resets ----------------------------------------------------------------


def test_a_reset_to_zero_is_not_negative_rain():
    assert change(
        [5.0, 0.0, 2.0], [_at(20), _at(24.5), _at(26)], start=4.0, start_stamp=_at(19)
    ) == pytest.approx(1.0 + 2.0)


def test_a_midnight_reset_first_read_above_zero_keeps_that_rain():
    """Rain from 00:00 to the first reading after midnight is not lost."""
    assert change(
        [5.0, 0.2, 1.0], [_at(23), _at(24.25), _at(25)], start=4.0, start_stamp=_at(22)
    ) == pytest.approx(1.0 + 0.2 + 0.8)


def test_the_baseline_taken_yesterday_makes_the_first_drop_a_reset():
    """The window opens on yesterday's total: this morning's 1.5 is all rain."""
    assert change(
        [1.5, 2.0], [_at(30), _at(31)], start=7.0, start_stamp=_at(23)
    ) == pytest.approx(2.0)


def test_a_drop_across_midnight_after_a_dry_night_counts_what_is_there():
    assert change(
        [3.0, 0.0], [_at(23.9), _at(24.1)], start=3.0, start_stamp=_at(22)
    ) == pytest.approx(0.0)


# --- what did not change ---------------------------------------------------


def test_a_steady_climb_is_last_minus_start():
    assert change(
        [1.0, 2.5, 4.0], [_at(9), _at(10), _at(11)], start=0.5, start_stamp=_at(8)
    ) == pytest.approx(3.5)


def test_without_a_start_the_window_measures_itself():
    assert change([10.0, 12.0, 18.0], [_at(9), _at(10), _at(11)]) == pytest.approx(8.0)


def test_without_timestamps_only_a_drop_to_zero_is_a_reset():
    """Nothing can show midnight, so a drop to 0.2 is read as a revision."""
    assert change([5.0, 0.0, 1.0], None, start=4.0) == pytest.approx(2.0)
    assert change([5.0, 0.2, 1.0], None, start=4.0) == pytest.approx(1.0)


def test_timestamps_can_be_datetimes():
    stamps = [DAY + timedelta(hours=h) for h in (23, 24.25)]

    assert change(
        [5.0, 0.2], stamps, start=4.0, start_stamp=DAY + timedelta(hours=22)
    ) == pytest.approx(1.2)


def test_no_readings_is_no_rain():
    assert change([], [], start=3.0) == 0.0


# --- through the aggregation ------------------------------------------------


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.hass = MagicMock()
        self.store = MagicMock()
        self.store.async_update_mapping = AsyncMock()


def _rain(stamp, total):
    return {const.MAPPING_PRECIPITATION: total, const.RETRIEVED_AT: stamp}


@pytest.mark.asyncio
async def test_the_aggregate_reads_a_revision_as_a_revision():
    now = datetime.now().replace(microsecond=0)
    at = lambda minutes: (now - timedelta(minutes=minutes)).isoformat()  # noqa: E731
    mapping = {
        const.MAPPING_ID: 1,
        const.MAPPING_NAME: "Garden sensors",
        const.MAPPING_MAPPINGS: {},
        const.MAPPING_DATA: [
            _rain(at(40), 4.3),
            _rain(at(30), 3.0),
            _rain(at(20), 5.0),
        ],
    }

    result = await _Coordinator().apply_aggregates_to_mapping_data(
        mapping, persist=False, since=None
    )

    # Measured from the first reading: 4.3 -> 5.0, the revision counting nothing.
    assert result[const.MAPPING_PRECIPITATION] == pytest.approx(0.7)


@pytest.mark.asyncio
async def test_the_aggregate_knows_when_its_baseline_was_read():
    """The pre-window reading carries its time, so a reset after it is seen."""
    # Yesterday, so the readings are never in the future whenever this runs.
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today -= timedelta(days=1)
    yesterday_evening = (today - timedelta(hours=2)).isoformat()
    mapping = {
        const.MAPPING_ID: 1,
        const.MAPPING_NAME: "Garden sensors",
        const.MAPPING_MAPPINGS: {},
        const.MAPPING_DATA: [
            _rain(yesterday_evening, 7.0),
            _rain((today + timedelta(minutes=10)).isoformat(), 0.4),
            _rain((today + timedelta(minutes=20)).isoformat(), 1.0),
        ],
    }

    result = await _Coordinator().apply_aggregates_to_mapping_data(
        mapping, persist=False, since=today - timedelta(hours=1)
    )

    assert result[const.MAPPING_PRECIPITATION] == pytest.approx(1.0)
