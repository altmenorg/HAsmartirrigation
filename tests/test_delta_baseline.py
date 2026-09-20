"""A cumulative sensor is measured from where the reading window opened.

A rain gauge that counts up reports a total, so the rain that fell during a
window is the last total minus the total the window started from. That starting
total used to be taken from the sensor group's last calculation, which is one
value for the whole group. Since each zone reads its own window, a group read by
two zones on different schedules handed the second zone a baseline belonging to
the first, and the rain between its window's start and its first sample went
uncounted, with a "value decreased" warning as the only trace.
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin

NOW = datetime(2026, 9, 6, 12, 0, 0)


def _rain(minutes_ago, total):
    return {
        const.MAPPING_PRECIPITATION: total,
        const.RETRIEVED_AT: (NOW - timedelta(minutes=minutes_ago)).isoformat(),
    }


# A gauge counting up all afternoon: 8 mm of rain between the oldest and the
# newest reading.
READINGS = [_rain(180, 10.0), _rain(120, 12.0), _rain(60, 15.0), _rain(10, 18.0)]


def _mapping(last_calculation=None):
    mapping = {
        const.MAPPING_ID: 1,
        const.MAPPING_NAME: "Garden sensors",
        const.MAPPING_MAPPINGS: {},
        const.MAPPING_DATA: list(READINGS),
    }
    if last_calculation is not None:
        mapping[const.MAPPING_DATA_LAST_CALCULATION] = last_calculation
    return mapping


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.hass = MagicMock()
        self.store = MagicMock()
        self.store.async_update_mapping = AsyncMock()


@pytest.mark.asyncio
async def test_a_zone_measures_the_rain_from_its_own_window():
    """The bug, stated as a test.

    Zone A calculated an hour ago and left its total behind. Zone B has not
    calculated for three hours, so it is owed all 8 mm, not the 3 mm that fell
    since zone A read the group.
    """
    coord = _Coordinator()
    mapping = _mapping(
        last_calculation={
            const.MAPPING_PRECIPITATION: 15.0,
            const.MAPPING_TIMESTAMP: NOW - timedelta(minutes=60),
        }
    )

    result = await coord.apply_aggregates_to_mapping_data(
        mapping, persist=False, since=NOW - timedelta(minutes=180)
    )

    assert result[const.MAPPING_PRECIPITATION] == pytest.approx(8.0)


@pytest.mark.asyncio
async def test_a_zone_reading_the_whole_buffer_still_uses_the_last_calculation():
    """With no reading before the window there is nothing better to measure from."""
    coord = _Coordinator()
    mapping = _mapping(
        last_calculation={
            const.MAPPING_PRECIPITATION: 9.0,
            const.MAPPING_TIMESTAMP: NOW - timedelta(minutes=240),
        }
    )

    result = await coord.apply_aggregates_to_mapping_data(
        mapping, persist=False, since=None
    )

    # 18.0 against the 9.0 the group last calculated from.
    assert result[const.MAPPING_PRECIPITATION] == pytest.approx(9.0)


@pytest.mark.asyncio
async def test_with_no_baseline_at_all_the_window_measures_itself():
    coord = _Coordinator()

    result = await coord.apply_aggregates_to_mapping_data(
        _mapping(), persist=False, since=None
    )

    # 18.0 - 10.0, losing only what fell before the first reading, which is
    # all that can be said without a starting total.
    assert result[const.MAPPING_PRECIPITATION] == pytest.approx(8.0)


@pytest.mark.asyncio
async def test_the_gauge_resetting_to_zero_is_not_counted_as_rain():
    """Many gauges reset at midnight. That drop is not negative rainfall."""
    coord = _Coordinator()
    mapping = _mapping()
    mapping[const.MAPPING_DATA] = [
        _rain(180, 10.0),
        _rain(120, 12.0),
        _rain(60, 0.0),
        _rain(10, 3.0),
    ]

    result = await coord.apply_aggregates_to_mapping_data(
        mapping, persist=False, since=NOW - timedelta(minutes=150)
    )

    # 12 -> 10 measured from the pre-window baseline, then the reset, then 3.
    assert result[const.MAPPING_PRECIPITATION] == pytest.approx(5.0)


class TestTheBaselineItself:
    def test_it_is_the_newest_reading_before_the_window(self):
        latest = CalculationMixin._latest_before(READINGS, NOW - timedelta(minutes=90))

        assert latest[const.MAPPING_PRECIPITATION][1] == READINGS[1]

    def test_each_field_gets_its_own(self):
        readings = [
            {
                const.MAPPING_PRECIPITATION: 4.0,
                const.RETRIEVED_AT: READINGS[0][const.RETRIEVED_AT],
            },
            {
                const.MAPPING_TEMPERATURE: 21.0,
                const.RETRIEVED_AT: READINGS[1][const.RETRIEVED_AT],
            },
        ]

        latest = CalculationMixin._latest_before(readings, NOW - timedelta(minutes=90))

        assert set(latest) == {const.MAPPING_PRECIPITATION, const.MAPPING_TEMPERATURE}

    def test_a_window_that_starts_from_nothing_has_no_baseline(self):
        assert CalculationMixin._latest_before(READINGS, None) == {}

    def test_an_unreadable_timestamp_is_not_a_baseline(self):
        """Those readings are left in the window instead, and one cannot be both."""
        readings = [{const.MAPPING_PRECIPITATION: 4.0}, *READINGS]

        latest = CalculationMixin._latest_before(readings, NOW - timedelta(minutes=200))

        assert latest == {}
