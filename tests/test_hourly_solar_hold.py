"""A radiation reading held across hours must not shine through the night.

Every other field in the buffer is a state: a temperature read at eight is a
fair description of half past eight, and holding it until the next reading is
the right thing to do. Radiation is not. It is a rate, it swings from zero to
its peak and back inside a single day, and the one thing that is certainly
false about it is that it was constant.

Hold it anyway and a sensor that reports once, at noon, has the sun shining at
the same rate at three in the morning. That is not a small error in one hour,
it is a different sky over the whole window: the night gains energy it never
received, and a night that gains energy evaporates water a garden did not lose.

What *does* persist across a few hours is the condition of the sky -- overcast,
hazy, clear -- and that is what an unsampled hour borrows: the clearness Rs/Rso
of the nearest hour that measured a lit sky, applied to its own clear sky. Two
consequences are the point of the design:

* **an hour that has a sample of its own is never touched.** Reshaping a whole
  day because one hour of it went unreported would give a cloudy afternoon the
  shape of a clear one, and it would fire in the most ordinary case there is: a
  sensor polled once an hour, and a window that opens a second past the hour;
* **darkness receives nothing** without a rule saying so, because any clearness
  times a clear sky of zero is zero.

The zone is fixed rather than the machine's: the clear-sky curve is placed from
an offset, and reading the machine's would put the sun in one place here and
another on a UTC runner.
"""

import datetime

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.hourly_et import (
    clear_sky_radiation_hourly,
    extraterrestrial_radiation_hourly,
)
from custom_components.smart_irrigation.hourly_rows import (
    _hour_start_timestamp,
    build_hourly_rows,
)

LAT, LON, ELEV = 43.6, 1.44, 150.0
OFFSET = 2.0
MIDNIGHT = datetime.datetime(2026, 6, 15, 0, 0)


class _FixedOffset(datetime.tzinfo):
    def utcoffset(self, _dt):
        return datetime.timedelta(hours=OFFSET)

    def dst(self, _dt):
        return datetime.timedelta(0)


TZ = _FixedOffset()


def _reading(stamp, solar=None):
    row = {
        const.RETRIEVED_AT: stamp.isoformat(),
        const.MAPPING_TEMPERATURE: 20.0,
        const.MAPPING_HUMIDITY: 55.0,
        const.MAPPING_WINDSPEED: 2.0,
    }
    if solar is not None:
        row[const.MAPPING_SOLRAD] = solar
    return row


def _rows(readings, start, hours, **kwargs):
    return build_hourly_rows(
        readings,
        start,
        now=start + datetime.timedelta(hours=hours),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
        **kwargs,
    )


def _by_hour(rows):
    return {row["hour_start"].hour: row for row in rows}


def _rso(row):
    ra = max(
        0.0,
        extraterrestrial_radiation_hourly(
            LAT, LON, row["doy"], row["hour"], row["tz_offset_h"]
        ),
    )
    return clear_sky_radiation_hourly(ra, ELEV)


def _sparse_day(solar_mj_day=20.0, at_hour=12):
    """A whole day whose only radiation sample falls at one hour."""
    readings = []
    for hour in range(25):
        stamp = MIDNIGHT + datetime.timedelta(hours=hour)
        readings.append(
            _reading(stamp, solar=solar_mj_day if hour == at_hour else None)
        )
    return readings


# --- a measurement is never overwritten -------------------------------------


def test_an_hour_with_a_sample_keeps_exactly_what_it_implies():
    """The rule everything else here is subordinate to.

    Two hours, the first with a reading and the second without. Whatever the
    second is filled with, the first reads what its sensor said: 36 MJ/m2 over
    a day is 1.5 over an hour, to rounding and not approximately.
    """
    start = MIDNIGHT + datetime.timedelta(hours=10)
    readings = [
        _reading(start, solar=36.0),
        _reading(start + datetime.timedelta(hours=2)),
    ]

    rows = _rows(readings, start, 2)

    assert rows[0]["solar_mj_h"] == pytest.approx(36.0 / 24.0, rel=1e-12)
    # And the hour that measured nothing was filled from somewhere.
    assert rows[1]["solar_mj_h"] > 0


def test_one_unreported_hour_does_not_reshape_the_rest_of_the_day():
    """The regression this replaced.

    An installation polled once an hour, and a window opening a second past the
    hour: the first hour's own sample falls a second outside its covered
    interval, so that hour has none of its own. Every *other* hour has one, and
    every other hour has to come out exactly as its sensor read it -- 24 MJ/m2
    over a day is 1 over an hour. Reshaping the window from the clear sky
    because of that one hour is what gave a cloudy afternoon the shape of a
    clear one.
    """
    start = MIDNIGHT + datetime.timedelta(hours=8, seconds=1)
    readings = [
        _reading(MIDNIGHT + datetime.timedelta(hours=hour), solar=24.0)
        for hour in range(25)
    ]

    rows = _rows(readings, start, 12)

    # The 08:00 hour is covered from 08:00:01, so its sample fell a second
    # outside it and it is the one modelled.
    assert rows[0]["hour_start"].hour == 8
    assert rows[0]["solar_mj_h"] > 0
    # Every other hour measured, and every other hour is left alone.
    for row in rows[1:]:
        assert row["solar_mj_h"] == pytest.approx(1.0, rel=1e-12)


def test_a_cloudy_afternoon_keeps_its_own_shape():
    """A day whose sun really did collapse after noon, with one hour of the
    morning unreported. The afternoon must stay dark."""
    readings = []
    for hour in range(25):
        if hour == 8:  # the sensor missed an hour
            continue
        # Bright until noon, a tenth of that afterwards.
        daily = 48.0 if hour < 12 else 4.8
        readings.append(
            _reading(MIDNIGHT + datetime.timedelta(hours=hour), solar=daily)
        )

    rows = _by_hour(_rows(readings, MIDNIGHT, 24))

    assert rows[11]["solar_mj_h"] == pytest.approx(2.0, rel=1e-12)
    assert rows[15]["solar_mj_h"] == pytest.approx(0.2, rel=1e-12)
    assert rows[15]["solar_mj_h"] < rows[11]["solar_mj_h"] / 5


def test_a_measured_night_stays_measured_even_when_it_reports_sun():
    """A lux sensor under a street lamp, or a pyranometer badly sited. That is
    a sensor problem and the row builder does not silently correct it: it would
    be correcting a measurement with a model."""
    readings = [
        _reading(MIDNIGHT + datetime.timedelta(hours=hour), solar=2.4)
        for hour in range(25)
    ]

    rows = _rows(readings, MIDNIGHT, 24)
    dark = [row for row in rows if _rso(row) <= 0]

    assert dark
    assert all(row["solar_mj_h"] == pytest.approx(0.1) for row in dark)


def test_an_hour_with_a_sample_of_its_own_keeps_it():
    """A pyranometer that reports every hour measured each hour, and nothing
    here knows better than a measurement."""
    readings = [
        _reading(MIDNIGHT + datetime.timedelta(hours=hour), solar=24.0)
        for hour in range(25)
    ]

    rows = _rows(readings, MIDNIGHT, 24)

    assert all(row["solar_mj_h"] == pytest.approx(1.0) for row in rows)


# --- what a gap hour borrows ------------------------------------------------


def test_a_gap_hour_borrows_the_sky_and_supplies_its_own_sun():
    """Clearness carried, irradiance recomputed: the gap hour is its measured
    neighbour's Rs/Rso applied to its own clear sky."""
    rows = _by_hour(_rows(_sparse_day(), MIDNIGHT, 24))
    measured = rows[12]
    clearness = measured["solar_mj_h"] / _rso(measured)

    for hour in (10, 13, 16):
        assert rows[hour]["solar_mj_h"] == pytest.approx(clearness * _rso(rows[hour]))


def test_a_midday_ratio_carried_into_the_small_hours_charges_them_nothing():
    """The whole reason the ratio is what travels rather than the irradiance.
    Noon's sky, applied to three in the morning, is three in the morning."""
    rows = _by_hour(_rows(_sparse_day(), MIDNIGHT, 24))

    assert rows[12]["solar_mj_h"] > 0
    for hour in (0, 1, 2, 3, 23):
        assert _rso(rows[hour]) == 0
        assert rows[hour]["solar_mj_h"] == 0.0


def test_a_single_daytime_sample_leaves_the_night_dark():
    rows = _rows(_sparse_day(), MIDNIGHT, 24)
    # The sampled hour is at midday, so every dark hour here is a gap hour.
    dark = [row for row in rows if _rso(row) <= 0]

    assert dark, "a June day in Toulouse still has night hours"
    assert all(row["solar_mj_h"] == 0.0 for row in dark)


def test_the_daylight_hours_all_get_some_of_it():
    rows = _rows(_sparse_day(), MIDNIGHT, 24)
    lit = [row for row in rows if _rso(row) > 0]

    assert all(row["solar_mj_h"] > 0 for row in lit)
    assert len(lit) < len(rows)


def test_noon_gets_more_than_the_hour_after_dawn():
    rows = _by_hour(_rows(_sparse_day(), MIDNIGHT, 24))

    assert rows[13]["solar_mj_h"] > rows[7]["solar_mj_h"] > 0


def test_a_gap_hour_is_not_charged_beyond_its_own_clear_sky():
    """An overexposed reading, or a sensor in kilojoules by mistake. The hour
    that measured it keeps it, but no other hour inherits a sky twice as bright
    as a clear one."""
    rows = _by_hour(_rows(_sparse_day(solar_mj_day=2000.0), MIDNIGHT, 24))

    assert rows[12]["solar_mj_h"] == pytest.approx(2000.0 / 24.0)
    for hour, row in rows.items():
        if hour == 12:
            continue
        assert row["solar_mj_h"] <= 1.1 * _rso(row) + 1e-12


def test_a_ratio_is_not_taken_from_a_sun_barely_over_the_horizon():
    """Rs/Rso of two numbers near zero says more about the model than about the
    sky: a reading taken against a modelled clear sky of 0.016 would set the
    whole day's clearness from almost nothing.

    21:00 in June here is such an hour. The sample is kept where it was taken
    and no other hour inherits a ratio from it: with nothing usable to borrow,
    the gap hours are shaped from the clear sky alone.
    """
    rows = _by_hour(_rows(_sparse_day(solar_mj_day=24.0, at_hour=21), MIDNIGHT, 24))

    assert 0 < _rso(rows[21]) < 0.1, "21:00 in June here is a very low sun"
    assert rows[21]["solar_mj_h"] == pytest.approx(1.0)
    # A clearness of 1/0.016 would have made midday some sixty times its clear
    # sky. It is not taken, so midday stays under its own.
    assert 0 < rows[13]["solar_mj_h"] < _rso(rows[13])
    assert all(
        row["solar_mj_h"] == 0.0
        for hour, row in rows.items()
        if _rso(row) <= 0 and hour != 21
    )


def test_the_nearest_measured_hour_is_the_one_borrowed_from():
    """A morning that was clear and an afternoon that was not, with one hour
    missing from each half: each gap takes the sky next to it."""
    readings = []
    for hour in range(25):
        if hour in (9, 16):
            continue
        daily = 48.0 if hour < 13 else 4.8
        readings.append(
            _reading(MIDNIGHT + datetime.timedelta(hours=hour), solar=daily)
        )

    rows = _by_hour(_rows(readings, MIDNIGHT, 24))

    morning_clearness = rows[9]["solar_mj_h"] / _rso(rows[9])
    afternoon_clearness = rows[16]["solar_mj_h"] / _rso(rows[16])

    assert morning_clearness > 4 * afternoon_clearness


# --- no measured sky at all -------------------------------------------------


def test_a_sample_taken_at_night_lights_nothing():
    """A service polled at three in the morning reports whatever the sky was
    doing then, which is nothing. There is no sky to borrow, so the day is
    shaped from what the hold implied and that is zero."""
    rows = _rows(_sparse_day(solar_mj_day=0.0, at_hour=3), MIDNIGHT, 24)

    assert all(row["solar_mj_h"] == 0.0 for row in rows)


def test_a_window_that_is_night_from_end_to_end_receives_nothing():
    """Four hours of a December night with one held reading: the hour that read
    it keeps it, and there is no clear sky anywhere to share the rest along."""
    start = datetime.datetime(2026, 12, 10, 0, 0)
    readings = [
        _reading(start, solar=24.0),
        _reading(start + datetime.timedelta(hours=4)),
    ]

    rows = _rows(readings, start, 4)

    assert rows is not None
    assert rows[0]["solar_mj_h"] == pytest.approx(1.0)
    assert all(row["solar_mj_h"] == 0.0 for row in rows[1:])


def test_the_last_known_value_is_shaped_by_the_clear_sky():
    """A group whose radiation sensor reported nothing in this window at all
    still has a last known value, and it is a day's worth, not an hour's. With
    no measurement anywhere there is no sky to carry, so the energy it implies
    is laid along the sun's own curve."""
    readings = [
        _reading(MIDNIGHT + datetime.timedelta(hours=hour)) for hour in range(25)
    ]

    rows = _rows(readings, MIDNIGHT, 24, last_entry={const.MAPPING_SOLRAD: 24.0})

    assert rows is not None
    assert sum(row["solar_mj_h"] * row["coverage_h"] for row in rows) == pytest.approx(
        24.0
    )
    assert all(row["solar_mj_h"] == 0.0 for row in rows if _rso(row) <= 0)


def test_the_shape_of_a_held_value_is_the_clear_sky_of_each_hour():
    """Not a flat share across the daylight: the hours around noon receive far
    more than the hour after dawn, because that is what the sky delivers."""
    readings = [
        _reading(MIDNIGHT + datetime.timedelta(hours=hour)) for hour in range(25)
    ]
    rows = _rows(readings, MIDNIGHT, 24, last_entry={const.MAPPING_SOLRAD: 24.0})

    total = sum(row["solar_mj_h"] * row["coverage_h"] for row in rows)
    available = sum(_rso(row) * row["coverage_h"] for row in rows)

    for row in rows:
        assert row["solar_mj_h"] == pytest.approx(total * _rso(row) / available)


# --- the series path is untouched by any of this ----------------------------


def test_a_series_is_never_reshaped():
    """An hourly history from the weather service is already one value per
    hour, measured for that hour."""
    readings = [
        _reading(MIDNIGHT + datetime.timedelta(hours=hour)) for hour in range(25)
    ]
    series = {
        _hour_start_timestamp(MIDNIGHT + datetime.timedelta(hours=hour), OFFSET): 0.5
        for hour in range(24)
    }

    rows = _rows(readings, MIDNIGHT, 24, solar_series=series)

    assert all(row["solar_mj_h"] == 0.5 for row in rows)
