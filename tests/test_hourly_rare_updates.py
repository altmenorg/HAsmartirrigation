"""What the hourly form does when the readings arrive once a day.

The hourly equation prices each hour from the readings of that hour. An
installation whose weather service is polled once a day has one reading to hold
across twenty-four of them, so the hours differ only by the sun, and the
promise of the form is not met.

This pins down what actually happens, because the answer is not "it is better":

* it still runs, and does not fall back: a held value is a value;
* it does not blow up: the total stays the same order as the daily equation's
  on the same data;
* **which of the two lands closer to the truth depends on when the samples
  fell.** Measured on a synthetic clear day, sampled every half hour for the
  truth and then reduced to two readings a day apart: the hourly form landed
  0.95 mm against a true 2.63 and the daily form 1.54, so the daily one was
  closer there; with the same day cut at 17:00 instead of 23:00 the order
  reversed. Neither is a calculation worth trusting.

The conclusion is in the documentation rather than in the code: the hourly form
is worth switching on when readings arrive through the day, and an update
interval of hours degrades both forms. Nothing here chooses for the user.
"""

import datetime
import math

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.hourly_rows import (
    SystemLocalTime,
    summed_hourly_eto,
)

LAT, LON, ELEV = 43.6, 1.44, 150.0
DAY = datetime.date(2026, 6, 15)
END = datetime.datetime.combine(DAY, datetime.time(23, 0))
START = END - datetime.timedelta(hours=24)


def _readings(step_min, tmin=12.0, tmax=28.0, peak_sun=25.0):
    """A clear summer day: warm afternoons, humid nights, sun at midday."""
    rows = []
    for i in range(int(24 * 60 / step_min) + 1):
        stamp = START + datetime.timedelta(minutes=step_min * i)
        clock = stamp.hour + stamp.minute / 60
        phase = math.cos(2 * math.pi * (clock - 15) / 24)
        sun = max(0.0, math.cos(2 * math.pi * (clock - 13) / 24)) ** 2
        rows.append(
            {
                const.RETRIEVED_AT: stamp.isoformat(),
                const.MAPPING_TEMPERATURE: (tmin + tmax) / 2
                + (tmax - tmin) / 2 * phase,
                const.MAPPING_HUMIDITY: 60.0 - 20.0 * phase,
                const.MAPPING_WINDSPEED: 2.0,
                const.MAPPING_PRESSURE: 1013.0,
                const.MAPPING_SOLRAD: peak_sun * sun,
            }
        )
    return rows


def _hourly(readings):
    return summed_hourly_eto(
        readings,
        START,
        now=END,
        last_entry={},
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=SystemLocalTime(),
    )


def test_a_day_sampled_twice_still_reduces_to_hours():
    """Two readings, twenty-four hours apart: the window is not refused."""
    fine = _readings(30)

    result = _hourly([fine[0], fine[-1]])

    assert result is not None
    total, hours = result
    assert hours == pytest.approx(24.0)
    assert total > 0


def test_one_reading_in_the_window_is_enough():
    """A service polled once a day leaves exactly this."""
    result = _hourly([_readings(30)[0]])

    assert result is not None
    assert result[0] > 0


def test_it_stays_the_same_order_as_a_fully_sampled_day():
    """Held readings cost accuracy, not sanity: no factor-of-ten surprise,
    which is what would make switching the setting on dangerous."""
    fine = _readings(30)

    truth = _hourly(fine)[0]
    sparse = _hourly([fine[0], fine[-1]])[0]

    assert 0.2 * truth < sparse < 2.0 * truth
