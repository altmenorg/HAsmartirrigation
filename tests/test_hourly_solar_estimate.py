"""The sun of each hour estimated from the day's temperature range.

The hourly equation needs the radiation of each hour. A pyranometer, a lux
sensor or the weather service's hourly history can give it; an installation
with none of the three used to fall back to the daily equation, which was the
last thing keeping the hourly calculation from working everywhere.

FAO-56 Eq. 50 turns the day's temperature range into the day's radiation, and
the sun's own path says which hours of that day received it. The properties
worth pinning down are the two the design rests on: the daily total is exactly
what the daily equation would have used, and the distribution is the sky's.
"""

import datetime
import math

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.hourly_et import (
    extraterrestrial_radiation_hourly,
)
from custom_components.smart_irrigation.hourly_solar_estimate import (
    KRS_COASTAL,
    KRS_INTERIOR,
    estimated_solar_series,
    solar_radiation_from_temperature_range,
)

LAT, LON, ELEV = 43.6, 1.44, 150.0
# A naive-local day, as the reading buffer stores them.
DAY = datetime.datetime(2026, 6, 15, 0, 0)
OFFSET = 2.0


class _FixedOffset(datetime.tzinfo):
    """A timezone that does not change, so a test is not about summer time."""

    def utcoffset(self, _dt):
        return datetime.timedelta(hours=OFFSET)

    def dst(self, _dt):
        return datetime.timedelta(0)


TZ = _FixedOffset()


def _readings(hours=24, tmin=12.0, tmax=28.0, start=DAY, step_min=30):
    """A day of temperature, humidity and wind, with no radiation at all."""
    rows = []
    steps = int(hours * 60 / step_min)
    for i in range(steps + 1):
        stamp = start + datetime.timedelta(minutes=step_min * i)
        # Coolest before dawn, warmest mid-afternoon.
        phase = math.cos(2 * math.pi * (stamp.hour + stamp.minute / 60 - 15) / 24)
        rows.append(
            {
                const.RETRIEVED_AT: stamp.isoformat(),
                const.MAPPING_TEMPERATURE: (tmin + tmax) / 2
                + (tmax - tmin) / 2 * phase,
                const.MAPPING_HUMIDITY: 60.0,
                const.MAPPING_WINDSPEED: 2.0,
            }
        )
    return rows


def _series(readings=None, since=None, now=None, **kwargs):
    readings = readings if readings is not None else _readings()
    return estimated_solar_series(
        readings,
        since if since is not None else DAY - datetime.timedelta(minutes=1),
        now=now or (DAY + datetime.timedelta(hours=24)),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
        **kwargs,
    )


def _ra_day(date):
    """The extraterrestrial radiation of a whole local day, MJ/m2."""
    doy = date.timetuple().tm_yday
    return sum(
        max(
            0.0,
            extraterrestrial_radiation_hourly(LAT, LON, doy, hour + 0.5, OFFSET),
        )
        for hour in range(24)
    )


# --- the equation -----------------------------------------------------------


def test_the_equation_is_fao_56_eq_50():
    ra = 40.0

    value = solar_radiation_from_temperature_range(ra, 12.0, 28.0)

    assert value == pytest.approx(KRS_INTERIOR * math.sqrt(16.0) * ra)


def test_the_coast_gets_its_own_coefficient():
    """A sea breeze narrows the range for the same sun, so the same range means
    more sun there. The engine already asks whether the site is coastal."""
    ra = 40.0

    inland = solar_radiation_from_temperature_range(ra, 12.0, 20.0)
    coastal = solar_radiation_from_temperature_range(ra, 12.0, 20.0, coastal=True)

    assert coastal / inland == pytest.approx(KRS_COASTAL / KRS_INTERIOR)


def test_no_day_beats_a_clear_sky():
    """A huge range (a desert, or a sensor fault) cannot produce more than the
    clear-sky radiation of the site."""
    ra = 40.0

    value = solar_radiation_from_temperature_range(ra, -10.0, 45.0, elevation_m=150.0)

    assert value == pytest.approx((0.75 + 2e-5 * 150.0) * ra)


def test_a_flat_day_receives_nothing():
    """Zero range is the degenerate case, and it is what the daily equation
    does with it too, so the two stay consistent."""
    assert solar_radiation_from_temperature_range(40.0, 15.0, 15.0) == 0.0
    assert solar_radiation_from_temperature_range(0.0, 12.0, 28.0) == 0.0


# --- the series -------------------------------------------------------------


def test_the_day_adds_up_to_what_the_daily_equation_would_use():
    """The property the whole design rests on: switching a zone to hourly does
    not change how much sun it is credited with over a day, only when."""
    series = _series()

    expected = solar_radiation_from_temperature_range(
        _ra_day(DAY.date()), 12.0, 28.0, ELEV
    )

    assert sum(series.values()) == pytest.approx(expected, rel=1e-6)


def test_the_night_gets_none_of_it():
    series = _series()
    by_hour = {
        datetime.datetime.fromtimestamp(
            ts, datetime.timezone(datetime.timedelta(hours=OFFSET))
        ).hour: value
        for ts, value in series.items()
    }

    assert by_hour[0] == 0.0
    assert by_hour[2] == 0.0
    assert by_hour[23] == 0.0
    # And the middle of the day gets the most of it.
    assert by_hour[13] == max(by_hour.values())


def test_the_shape_is_the_sky_s_own():
    """Each hour takes the share of the day's extraterrestrial radiation it
    receives, which is the sun's path and nothing else."""
    series = _series()
    total = sum(series.values())
    ra_day = _ra_day(DAY.date())

    for ts, value in series.items():
        hour = datetime.datetime.fromtimestamp(
            ts, datetime.timezone(datetime.timedelta(hours=OFFSET))
        )
        ra_hour = max(
            0.0,
            extraterrestrial_radiation_hourly(
                LAT, LON, hour.timetuple().tm_yday, hour.hour + 0.5, OFFSET
            ),
        )
        assert value == pytest.approx(total * ra_hour / ra_day, abs=1e-9)


def test_a_wider_range_means_more_sun():
    clear = _series(_readings(tmin=10.0, tmax=30.0))
    overcast = _series(_readings(tmin=16.0, tmax=19.0))

    assert sum(clear.values()) > sum(overcast.values())


def test_each_day_of_a_longer_window_is_priced_from_its_own_range():
    """Two days, the second one overcast: its hours must not inherit the
    first's sunshine."""
    first = _readings(hours=24, tmin=10.0, tmax=30.0, start=DAY)
    second = _readings(
        hours=24, tmin=16.0, tmax=19.0, start=DAY + datetime.timedelta(days=1)
    )
    series = _series(
        first + second,
        since=DAY - datetime.timedelta(minutes=1),
        now=DAY + datetime.timedelta(hours=48),
    )

    zone = datetime.timezone(datetime.timedelta(hours=OFFSET))
    by_day = {}
    for ts, value in series.items():
        day = datetime.datetime.fromtimestamp(ts, zone).date()
        by_day[day] = by_day.get(day, 0.0) + value

    assert by_day[DAY.date()] > by_day[(DAY + datetime.timedelta(days=1)).date()]


def test_without_temperature_there_is_nothing_to_estimate_from():
    rows = [
        {
            const.RETRIEVED_AT: (DAY + datetime.timedelta(hours=i)).isoformat(),
            const.MAPPING_HUMIDITY: 60.0,
        }
        for i in range(24)
    ]

    assert _series(rows) is None


def test_without_coordinates_there_is_no_sun_to_place():
    assert (
        estimated_solar_series(
            _readings(),
            DAY,
            now=DAY + datetime.timedelta(hours=24),
            latitude=None,
            longitude=None,
        )
        is None
    )


def test_an_empty_window_estimates_nothing():
    assert _series([]) is None


def test_a_partial_window_covers_the_hours_it_touches():
    """A calculation at midday over the hours since dawn: the estimate covers
    that window, and reads the range of that window, exactly as the daily
    equation reads the same aggregate."""
    start = DAY + datetime.timedelta(hours=6)
    rows = _readings(hours=6, start=start)

    series = _series(
        rows,
        since=start - datetime.timedelta(minutes=1),
        now=start + datetime.timedelta(hours=6),
    )

    # Seven clock hours, not six: the window starts a minute before 06:00, so
    # it touches the 05:00 hour as well, and the row builder charges each one
    # the share of it the window covers.
    assert len(series) == 7
    assert sum(series.values()) > 0
