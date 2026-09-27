"""A window that straddles the start or the end of summer time.

The buffer stores naive local timestamps. A radiation series is keyed by unix
timestamps. Converting between the two needs the offset in force *at that
hour*, and twice a year a week-long window contains hours on both sides of a
change.

Reading one offset for the whole window is the bug this file exists to prevent:
every hour on the far side of the change is then placed an hour away from where
it was, which moves the sun an hour across the sky. It sums to something
plausible -- a day still has a day's worth of sun in it -- so nothing looks
wrong until a zone waters at the wrong time of year.

The zone here is written out rather than taken from the machine, because the
failure this guards against is precisely a timezone failure and a test that
read the machine's would pass in Paris and mean nothing on a UTC runner.
"""

import datetime

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.hourly_rows import (
    _hour_start_timestamp,
    build_hourly_rows,
    summed_hourly_eto,
)

LAT, LON, ELEV = 43.6, 1.44, 150.0

WINTER = datetime.timedelta(hours=1)
SUMMER = datetime.timedelta(hours=2)

# Central European time in 2026: summer time from 29 March to 25 October, and
# the switch happens at 02:00 local in spring and 03:00 local in autumn.
SPRING_FORWARD = datetime.datetime(2026, 3, 29, 2, 0)
FALL_BACK = datetime.datetime(2026, 10, 25, 3, 0)


class _CentralEurope(datetime.tzinfo):
    """Summer time as the calendar has it, for naive local moments."""

    def utcoffset(self, dt):
        if dt is None:
            return WINTER
        naive = dt.replace(tzinfo=None)
        return SUMMER if SPRING_FORWARD <= naive < FALL_BACK else WINTER

    def dst(self, dt):
        return self.utcoffset(dt) - WINTER

    def tzname(self, dt):
        return "CEST" if self.dst(dt) else "CET"


TZ = _CentralEurope()


def _readings(start, hours, step_min=30, **fields):
    """Steady weather across the window, so only the clock is under test."""
    out = []
    for step in range(int(hours * 60 / step_min) + 1):
        stamp = start + datetime.timedelta(minutes=step * step_min)
        out.append(
            {
                const.RETRIEVED_AT: stamp.isoformat(),
                const.MAPPING_TEMPERATURE: 14.0,
                const.MAPPING_HUMIDITY: 60.0,
                const.MAPPING_WINDSPEED: 2.0,
                const.MAPPING_SOLRAD: 24.0,  # MJ/m2/day, so 1 per hour
                **fields,
            }
        )
    return out


def _rows(start, hours, **kwargs):
    end = start + datetime.timedelta(hours=hours)
    return build_hourly_rows(
        _readings(start, hours),
        start,
        now=end,
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
        **kwargs,
    )


# --- the offsets a window carries -------------------------------------------


def test_each_row_carries_the_offset_of_its_own_hour_in_spring():
    """Naive local 00:00 to 06:00 on the morning the clocks go forward."""
    start = SPRING_FORWARD - datetime.timedelta(hours=2)
    rows = _rows(start, 6)

    offsets = {row["hour_start"].hour: row["tz_offset_h"] for row in rows}

    assert offsets[0] == 1.0
    assert offsets[1] == 1.0
    # 02:00 local does not exist on that morning, but the grid is naive local
    # and walks through it; what matters is that everything from the change on
    # is in summer time.
    assert offsets[2] == 2.0
    assert offsets[5] == 2.0


def test_each_row_carries_the_offset_of_its_own_hour_in_autumn():
    start = FALL_BACK - datetime.timedelta(hours=2)
    rows = _rows(start, 5)

    offsets = {row["hour_start"].hour: row["tz_offset_h"] for row in rows}

    assert offsets[1] == 2.0
    assert offsets[2] == 2.0
    assert offsets[3] == 1.0
    assert offsets[5] == 1.0


def test_a_window_with_no_change_in_it_carries_one_offset():
    rows = _rows(datetime.datetime(2026, 6, 15, 10, 0), 4)

    assert {row["tz_offset_h"] for row in rows} == {2.0}


# --- what the offsets are for -----------------------------------------------


def test_the_sun_is_placed_by_the_offset_of_the_hour_and_not_of_the_window():
    """The same physical moment, on either side of the change, has the same sun.

    03:00 summer time on the morning of the change is 02:00 standard time, and
    an hour of the previous morning at 02:00 standard time sees the sun in the
    same place. A row builder that read one offset for the whole window would
    put them an hour apart.
    """
    from custom_components.smart_irrigation.hourly_et import solar_elevation_sin

    after = _rows(SPRING_FORWARD, 2)[1]  # naive 03:00, summer time
    doy = after["doy"]

    assert after["tz_offset_h"] == 2.0
    # Not bit-for-bit: Eq. 31 writes 1/15 as 0.06667, so the two descriptions
    # of the same moment differ in the fifth decimal of an hour. An offset read
    # for the whole window instead would differ by a whole hour.
    assert solar_elevation_sin(
        LAT, LON, doy, after["hour"], after["tz_offset_h"]
    ) == pytest.approx(solar_elevation_sin(LAT, LON, doy, 2.5, 1.0), abs=1e-4)
    assert solar_elevation_sin(
        LAT, LON, doy, after["hour"], after["tz_offset_h"]
    ) != pytest.approx(solar_elevation_sin(LAT, LON, doy, 3.5, 1.0), abs=1e-4)


def test_the_series_key_of_an_hour_follows_its_own_offset():
    """A series is keyed by the instant. Two naive local hours an hour apart on
    the clock are two hours apart in the world when a change falls between
    them, and the keys have to say so."""
    before = _hour_start_timestamp(SPRING_FORWARD - datetime.timedelta(hours=1), 1.0)
    after = _hour_start_timestamp(SPRING_FORWARD, 2.0)

    # 01:00 CET and 02:00 CEST are the same instant: the hour that never
    # happened. Keying both by a single offset would make them an hour apart
    # and leave a hole in the series that the builder would refuse.
    assert after == before
    # Whereas the next hour really is an hour later.
    assert (
        _hour_start_timestamp(SPRING_FORWARD + datetime.timedelta(hours=1), 2.0)
        == after + 3600
    )


def test_a_series_built_hour_by_hour_covers_a_window_that_straddles_a_change():
    """The end-to-end shape of it: the keys the builder computes are the keys a
    caller computes with the same rule, on both sides of the change."""
    start = FALL_BACK - datetime.timedelta(hours=3)
    rows = _rows(start, 6)
    series = {
        _hour_start_timestamp(row["hour_start"], row["tz_offset_h"]): 1.0
        for row in rows
    }

    built = build_hourly_rows(
        _readings(start, 6, **{const.MAPPING_SOLRAD: None}),
        start,
        now=start + datetime.timedelta(hours=6),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
        solar_series=series,
    )

    assert built is not None
    assert all(row["solar_mj_h"] == 1.0 for row in built)


# --- the window still adds up -----------------------------------------------


@pytest.mark.parametrize("change", [SPRING_FORWARD, FALL_BACK])
def test_the_hours_of_a_window_are_the_hours_of_its_clock(change):
    """The grid is naive local, so six hours on the clock are six rows, spring
    and autumn alike. The offsets move the sun, not the accounting."""
    start = change - datetime.timedelta(hours=3)
    result = summed_hourly_eto(
        _readings(start, 6),
        start,
        now=start + datetime.timedelta(hours=6),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
    )

    assert result is not None
    assert result[1] == pytest.approx(6.0)


def test_a_week_across_the_change_is_still_priced():
    """The cap is a week, and a week is exactly long enough to contain one."""
    start = SPRING_FORWARD - datetime.timedelta(days=3)
    result = summed_hourly_eto(
        _readings(start, 24 * 6, step_min=60),
        start,
        now=start + datetime.timedelta(hours=24 * 6),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
    )

    assert result is not None
    assert result[1] == pytest.approx(24 * 6)
    assert result[0] > 0


def test_without_a_zone_the_flat_offset_is_used_for_every_hour():
    """A caller that has no tzinfo hands a number instead, and then every row
    gets it. Correct for a site that does not observe summer time, and the
    reason the argument is still there."""
    start = SPRING_FORWARD - datetime.timedelta(hours=2)
    rows = build_hourly_rows(
        _readings(start, 6),
        start,
        now=start + datetime.timedelta(hours=6),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz_offset_h=1.0,
    )

    assert {row["tz_offset_h"] for row in rows} == {1.0}
