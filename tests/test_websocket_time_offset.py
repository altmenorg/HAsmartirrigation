"""Times sent to the panel carry their offset (#1071)."""

import datetime

from custom_components.smart_irrigation.websockets import _with_offset


def test_naive_datetime_gets_the_local_offset():
    naive = datetime.datetime(2026, 11, 26, 3, 25)
    out = _with_offset({"zones": [{"last_calculated": naive}]})
    stamp = out["zones"][0]["last_calculated"]
    assert stamp.tzinfo is not None
    assert stamp.replace(tzinfo=None) == naive


def test_naive_iso_string_gets_the_local_offset():
    out = _with_offset({"retrieved": "2026-11-26T03:25:00.123456"})
    parsed = datetime.datetime.fromisoformat(out["retrieved"])
    assert parsed.tzinfo is not None
    assert parsed.replace(tzinfo=None) == datetime.datetime(
        2026, 11, 26, 3, 25, 0, 123456
    )


def test_aware_values_dates_and_text_are_left_alone():
    aware = datetime.datetime(2026, 11, 26, 3, 25, tzinfo=datetime.UTC)
    payload = {
        "a": aware,
        "b": "2026-11-26T03:25:00+00:00",
        "c": "2026-11-26",
        "d": "Lawn",
        "e": 3,
        "f": None,
    }
    assert _with_offset(payload) == payload


def test_none_result_stays_none():
    assert _with_offset(None) is None
