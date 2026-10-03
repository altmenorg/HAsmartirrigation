"""Without rain, the bucket never rises as a window grows (#866).

The estimate of where a zone stands is the committed bucket less the
evapotranspiration of the window since the calculation. The window total can
only be allowed to grow with the window: an hour that evaporates nothing is
worth zero, and a calm humid night, which prices a hair below zero, is no
exception. Summing those hours with their sign made the total fall through the
evening once the day's sunny hours were in the window, and the live bucket
climbed back by a few hundredths of a millimetre each night: an invariant
promised in public and broken by a change meant to bring the hourly form closer
to the daily one.

The readings are those of an autumn day at 51.5 N, from a clear afternoon into
a calm humid night, taken at half past each hour as a weather service is polled.
"""

import datetime

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.hourly_rows import summed_hourly_eto

LAT, LON, ELEV, TZ = 51.5, 5.5, 13.0, 2.0
START = datetime.datetime(2026, 10, 2, 12, 0, 0)

# (hour, temperature, humidity, wind m/s at 2 m, solar W/m2)
DAY = [
    (12, 17.0, 78, 1.2, 380.0),
    (13, 18.0, 72, 1.4, 430.0),
    (14, 18.5, 68, 1.4, 400.0),
    (15, 19.0, 63, 1.5, 450.0),
    (16, 19.5, 55, 0.8, 300.0),
    (17, 19.8, 51, 0.4, 170.0),
    (18, 19.4, 56, 0.4, 60.0),
    (19, 17.8, 64, 0.8, 8.0),
    (20, 15.8, 70, 0.7, 0.0),
    (21, 14.0, 75, 0.5, 0.0),
    (22, 12.2, 82, 0.6, 0.0),
    (23, 11.6, 85, 0.7, 0.0),
    (24, 11.4, 90, 0.4, 0.0),
    (25, 11.2, 93, 0.3, 0.0),
    (26, 10.8, 95, 0.3, 0.0),
    (27, 10.5, 96, 0.4, 0.0),
    (28, 10.2, 97, 0.3, 0.0),
]


def _readings(until_hour):
    out = []
    for hour, temperature, humidity, wind, solar in DAY:
        if hour > until_hour:
            break
        stamp = START.replace(hour=0) + datetime.timedelta(hours=hour, minutes=32)
        out.append(
            {
                const.RETRIEVED_AT: stamp.isoformat(),
                const.MAPPING_TEMPERATURE: temperature,
                const.MAPPING_HUMIDITY: float(humidity),
                const.MAPPING_WINDSPEED: wind,
                # W/m2 as the weather services give it, held as MJ/m2/day.
                const.MAPPING_SOLRAD: solar * 0.0864,
            }
        )
    return out


def _total(now_hour):
    now = START.replace(hour=0) + datetime.timedelta(hours=now_hour, minutes=45)
    result = summed_hourly_eto(
        _readings(now_hour),
        START,
        now=now,
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz_offset_h=TZ,
    )
    return None if result is None else result[0]


def test_the_total_of_a_growing_window_never_falls():
    totals = [_total(hour) for hour in range(13, 29)]
    totals = [t for t in totals if t is not None]

    assert len(totals) >= 10
    for earlier, later in zip(totals, totals[1:], strict=False):
        assert later >= earlier - 1e-12, totals


def test_the_evening_adds_something_and_the_night_adds_nothing():
    """The day's hours count, a calm humid night is worth zero."""
    after_dusk = _total(21)
    deep_night = _total(28)

    assert after_dusk is not None and after_dusk > 0.5
    assert deep_night == pytest.approx(after_dusk, abs=0.05)


def test_a_window_of_nothing_but_night_is_worth_nothing():
    night_only = datetime.datetime(2026, 10, 2, 23, 0, 0)
    readings = [
        r
        for r in _readings(28)
        if r[const.RETRIEVED_AT] >= datetime.datetime(2026, 10, 2, 23, 0).isoformat()
    ]

    result = summed_hourly_eto(
        readings,
        night_only,
        now=datetime.datetime(2026, 10, 3, 4, 45, 0),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz_offset_h=TZ,
    )

    assert result is not None
    assert result[0] == 0.0
