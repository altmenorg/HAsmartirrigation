"""We have to be able to read back every timestamp we write.

Stored timestamps come from datetime.isoformat(), which drops the fractional
part when microsecond is 0. A parser that requires it rejects roughly one
written value in a million, and the calculation consuming that value raises.
"""

from datetime import UTC, datetime

import pytest

from custom_components.smart_irrigation.helpers import parse_datetime


@pytest.mark.parametrize(
    "moment",
    [
        datetime(2026, 9, 4, 11, 48, 43, 123456),
        # The one that used to fail: isoformat() writes no ".000000" here.
        datetime(2026, 9, 4, 11, 48, 43, 0),
        datetime(2026, 1, 1, 0, 0, 0, 0),
    ],
    ids=["with-microseconds", "on-the-second", "midnight"],
)
def test_every_timestamp_we_write_reads_back(moment):
    """Round-trip through the exact serialisation the store uses."""
    assert parse_datetime(moment.isoformat()) == moment


def test_a_datetime_passes_straight_through():
    moment = datetime(2026, 9, 4, 11, 48, 43)
    assert parse_datetime(moment) is moment


def test_an_offset_aware_timestamp_is_read_rather_than_rejected():
    moment = datetime(2026, 9, 4, 11, 48, 43, tzinfo=UTC)
    assert parse_datetime(moment.isoformat()) == moment


def test_a_non_timestamp_is_reported_as_none():
    assert parse_datetime(42) is None
