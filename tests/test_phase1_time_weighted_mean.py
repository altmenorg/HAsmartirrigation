"""An averaged field counts each reading for the time it stood (phase 1.7).

A sensor reports on change: ten readings in the hour the temperature climbed
and one in the steady afternoon used to weigh that hour ten times.
"""

from datetime import datetime, timedelta

import pytest

from custom_components.smart_irrigation.calculation import CalculationMixin

mean = CalculationMixin._time_weighted_mean
T0 = datetime(2026, 7, 10, 8, 0)


def _at(*hours):
    return [(T0 + timedelta(hours=h)).isoformat() for h in hours]


def test_bunched_readings_do_not_outweigh_the_hours_they_cover():
    # Nine readings climbing from 10 to 18 C within one hour, then 18 C held
    # for ten hours: over the eleven hours the mean is close to 17.6, where the
    # plain mean of the readings says 14.4.
    values = [10 + i for i in range(9)] + [18]
    stamps = _at(*[i / 8 for i in range(9)], 11)
    assert mean(values, stamps) == pytest.approx(17.64, abs=0.01)


def test_evenly_spaced_readings_are_the_trapezoid_mean():
    assert mean([10, 20, 30], _at(0, 1, 2)) == pytest.approx(20.0)


def test_without_usable_timestamps_it_is_the_plain_mean():
    assert mean([10, 20, 60], None) == pytest.approx(30.0)
    assert mean([10, 20, 60], ["x", "y", "z"]) == pytest.approx(30.0)
    assert mean([10, 20, 60], _at(0, 1)) == pytest.approx(30.0)
