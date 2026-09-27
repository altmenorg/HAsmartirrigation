"""The row builder: a buffer of sparse readings reduced to clock hours.

``hourly_et`` prices an hour that arrives complete. Nothing in the integration
stores anything of the sort -- the buffer holds one reading per sensor update,
each carrying only the fields of the sensor that triggered it -- so this is
where the two meet, and it is the part that is a design rather than a paper.

What is pinned down here is the contract the rest of the integration relies on:
what a row carries, how a field with no reading in an hour is valued, which
windows are refused outright so that the caller keeps the daily equation, and
the unit conversions that a rewrite gets wrong silently.

Every test fixes its own timezone. Reading the machine's put a generated sun
beside a differently placed clear sky, which passed on the maintainer's UTC+2
and failed on a UTC runner.
"""

import datetime

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.hourly_rows import (
    HOURLY_ROWS_MAX_HOURS,
    REQUIRED_FIELDS,
    SystemLocalTime,
    _effective_series,
    _group_by_sensor,
    _hour_start_timestamp,
    _mean_over,
    build_hourly_rows,
    price_hourly_rows,
    summed_hourly_eto,
)

LAT, LON, ELEV = 43.6, 1.44, 150.0
OFFSET = 2.0
NOON = datetime.datetime(2026, 6, 15, 12, 0)


class _FixedOffset(datetime.tzinfo):
    """A zone of our own, so no test here is about the machine's."""

    def utcoffset(self, _dt):
        return datetime.timedelta(hours=OFFSET)

    def dst(self, _dt):
        return datetime.timedelta(0)


TZ = _FixedOffset()


def _reading(stamp, **fields):
    return {const.RETRIEVED_AT: stamp.isoformat(), **fields}


def _full(stamp, temperature=22.0, humidity=50.0, wind=2.0, **extra):
    return _reading(
        stamp,
        **{
            const.MAPPING_TEMPERATURE: temperature,
            const.MAPPING_HUMIDITY: humidity,
            const.MAPPING_WINDSPEED: wind,
            **extra,
        },
    )


def _hourly_readings(start, hours, **fields):
    return [
        _full(start + datetime.timedelta(hours=hour), **fields)
        for hour in range(hours + 1)
    ]


class _SunEverywhere(dict):
    """A radiation series that answers for any hour.

    Most of what is tested here is not about where the sun came from, and a
    window with no radiation source at all is refused outright -- correctly, but
    it would make every one of those tests about radiation. The tests that *are*
    about it pass a real dict, or ``solar_series=None`` to say there is none.
    """

    def __bool__(self):
        return True

    def get(self, _key, _default=None):
        return 1.5


def _rows(readings, start, end, **kwargs):
    kwargs.setdefault("tz", TZ)
    kwargs.setdefault("solar_series", _SunEverywhere())
    return build_hourly_rows(
        readings,
        start,
        now=end,
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        **kwargs,
    )


# --- the window -------------------------------------------------------------


def test_one_row_per_clock_hour_the_window_touches():
    start = NOON
    rows = _rows(_hourly_readings(start, 3), start, start + datetime.timedelta(hours=3))

    assert [row["hour_start"].hour for row in rows] == [12, 13, 14]
    assert [row["hour"] for row in rows] == [12.5, 13.5, 14.5]
    assert all(row["coverage_h"] == 1.0 for row in rows)


def test_a_window_that_starts_mid_hour_still_touches_that_hour():
    """A calculation at 12:40 over the last twenty minutes is twenty minutes of
    the 12:00 hour, not a whole one and not none of it."""
    start = NOON + datetime.timedelta(minutes=20)
    end = NOON + datetime.timedelta(minutes=40)
    readings = [
        _full(NOON),
        _full(NOON + datetime.timedelta(minutes=30)),
        _full(NOON + datetime.timedelta(hours=1)),
    ]
    rows = _rows(readings, start, end)

    assert len(rows) == 1
    assert rows[0]["hour_start"] == NOON
    assert rows[0]["coverage_h"] == pytest.approx(20 / 60)


def test_a_window_with_no_reading_of_its_own_is_refused():
    """Twenty minutes between two readings of a slow sensor. Nothing was
    observed in that window, so nothing about it is known hour by hour, and the
    caller keeps the daily equation rather than price a held value as if it had
    been measured."""
    start = NOON + datetime.timedelta(minutes=20)
    end = NOON + datetime.timedelta(minutes=40)

    assert _rows(_hourly_readings(NOON, 2), start, end) is None


def test_the_partial_hours_at_both_ends_are_charged_their_share():
    start = NOON + datetime.timedelta(minutes=30)
    end = NOON + datetime.timedelta(hours=2, minutes=15)
    rows = _rows(_hourly_readings(NOON, 3), start, end)

    assert [row["coverage_h"] for row in rows] == pytest.approx([0.5, 1.0, 0.25])
    assert sum(row["coverage_h"] for row in rows) == pytest.approx(1.75)


def test_the_hours_are_what_the_sum_reports():
    """The caller turns the sum into a rate per day with these hours, so a row
    charged more than it covers would inflate a forecast average."""
    start = NOON + datetime.timedelta(minutes=30)
    end = NOON + datetime.timedelta(hours=2, minutes=15)
    total, hours = summed_hourly_eto(
        _hourly_readings(NOON, 3),
        start,
        now=end,
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
        solar_series=_series(NOON, 3),
    )

    assert hours == pytest.approx(1.75)
    assert total > 0


def test_a_zone_that_has_never_consumed_takes_the_whole_buffer():
    """``since`` is None on the first calculation after an upgrade, and the
    window is then the buffer itself."""
    start = NOON
    rows = _rows(_hourly_readings(start, 4), None, start + datetime.timedelta(hours=4))

    assert len(rows) == 4
    assert rows[0]["hour_start"] == start


def test_a_window_longer_than_the_cap_is_refused():
    """A zone that has not calculated for months is a bug elsewhere, not a
    reason to sum ten thousand hours to decide one irrigation run."""
    end = NOON
    start = end - datetime.timedelta(hours=HOURLY_ROWS_MAX_HOURS + 1)

    assert _rows([_full(start), _full(end)], start, end) is None


def test_a_window_just_inside_the_cap_is_not_refused():
    end = NOON
    start = end - datetime.timedelta(hours=HOURLY_ROWS_MAX_HOURS)
    rows = _rows([_full(start), _full(end)], start, end)

    assert rows is not None
    assert len(rows) == HOURLY_ROWS_MAX_HOURS


@pytest.mark.parametrize(
    ("start", "end"),
    [
        (NOON, NOON),  # empty
        (NOON + datetime.timedelta(hours=1), NOON),  # backwards
    ],
)
def test_an_empty_or_backwards_window_has_no_rows(start, end):
    assert _rows(_hourly_readings(NOON, 3), start, end) is None


def test_no_readings_at_all_is_no_rows():
    assert _rows([], NOON, NOON + datetime.timedelta(hours=1)) is None
    assert _rows(None, NOON, NOON + datetime.timedelta(hours=1)) is None


def test_readings_entirely_outside_the_window_are_no_readings():
    old = _hourly_readings(NOON - datetime.timedelta(days=2), 3)

    assert _rows(old, NOON, NOON + datetime.timedelta(hours=2)) is None


def test_without_coordinates_the_sun_cannot_be_placed():
    readings = _hourly_readings(NOON, 2)
    end = NOON + datetime.timedelta(hours=2)

    assert (
        build_hourly_rows(readings, NOON, now=end, latitude=None, longitude=LON) is None
    )
    assert (
        build_hourly_rows(readings, NOON, now=end, latitude=LAT, longitude=None) is None
    )


# --- what a row carries -----------------------------------------------------


def _series(start, hours, mj_per_hour=1.5):
    """A radiation series, keyed the way the row builder will look it up."""
    return {
        _hour_start_timestamp(
            start.replace(minute=0, second=0, microsecond=0)
            + datetime.timedelta(hours=hour),
            OFFSET,
        ): mj_per_hour
        for hour in range(-1, hours + 2)
    }


def test_a_row_carries_everything_the_equation_prices():
    start = NOON
    rows = _rows(
        _hourly_readings(start, 1, **{const.MAPPING_PRESSURE: 1013.0}),
        start,
        start + datetime.timedelta(hours=1),
    )
    row = rows[0]

    assert row["temperature"] == pytest.approx(22.0)
    assert row["humidity"] == pytest.approx(50.0)
    assert row["wind_2m"] == pytest.approx(2.0)
    assert row["doy"] == start.timetuple().tm_yday
    assert row["tz_offset_h"] == OFFSET
    assert "solar_mj_h" in row


def test_the_pressure_is_converted_from_the_hectopascals_the_store_keeps():
    start = NOON
    rows = _rows(
        _hourly_readings(start, 1, **{const.MAPPING_PRESSURE: 1013.0}),
        start,
        start + datetime.timedelta(hours=1),
    )

    assert rows[0]["pressure_kpa"] == pytest.approx(101.3)


def test_a_group_with_no_barometer_carries_no_pressure():
    start = NOON
    rows = _rows(_hourly_readings(start, 1), start, start + datetime.timedelta(hours=1))

    assert "pressure_kpa" not in rows[0]


def test_the_radiation_is_converted_from_the_day_the_store_keeps():
    """The buffer holds MJ/m2 per day; a row needs MJ/m2 per hour. A factor of
    24 here is the single most expensive slip in this module."""
    start = NOON
    rows = _rows(
        _hourly_readings(start, 2, **{const.MAPPING_SOLRAD: 48.0}),
        start,
        start + datetime.timedelta(hours=2),
    )

    assert all(row["solar_mj_h"] == pytest.approx(2.0) for row in rows)


# --- sparse readings --------------------------------------------------------


def test_an_hours_value_is_the_time_weighted_mean_of_its_own_readings():
    """Half an hour at 10 degrees and half at 20 is 15, whatever the other
    sensors were doing."""
    start = NOON
    readings = [
        _full(start, temperature=10.0),
        _full(start + datetime.timedelta(minutes=30), temperature=20.0),
        _full(start + datetime.timedelta(hours=1), temperature=20.0),
    ]
    rows = _rows(readings, start, start + datetime.timedelta(hours=1))

    assert rows[0]["temperature"] == pytest.approx(15.0)


def test_a_reading_is_held_until_the_next_one_replaces_it():
    """Forty-five minutes at 10 and fifteen at 30 is 15, not 20: the mean is of
    the staircase, not of the samples, so a sensor that reports more often does
    not weigh more."""
    start = NOON
    readings = [
        _full(start, temperature=10.0),
        _full(start + datetime.timedelta(minutes=45), temperature=30.0),
    ]
    rows = _rows(readings, start, start + datetime.timedelta(hours=1))

    assert rows[0]["temperature"] == pytest.approx(15.0)


def test_each_field_has_its_own_timeline():
    """A sensor writes one field at a time, so a reading that carries only a
    wind speed must not reset the temperature to nothing."""
    start = NOON
    readings = [
        _full(start, temperature=10.0, wind=1.0),
        _reading(
            start + datetime.timedelta(minutes=30), **{const.MAPPING_WINDSPEED: 5.0}
        ),
    ]
    rows = _rows(readings, start, start + datetime.timedelta(hours=1))

    assert rows[0]["temperature"] == pytest.approx(10.0)
    assert rows[0]["wind_2m"] == pytest.approx(3.0)


def test_a_field_with_no_reading_in_the_window_is_held_from_the_last_entry():
    """A sensor that reports twice a day still has to be worth something in the
    hours between, and the group's last known value is what it is worth."""
    start = NOON
    readings = [
        _reading(
            start + datetime.timedelta(minutes=minutes),
            **{const.MAPPING_TEMPERATURE: 24.0, const.MAPPING_HUMIDITY: 40.0},
        )
        for minutes in (0, 30, 60)
    ]
    rows = _rows(
        readings,
        start,
        start + datetime.timedelta(hours=1),
        last_entry={const.MAPPING_WINDSPEED: 3.5},
        solar_series=_series(start, 1),
    )

    assert rows[0]["wind_2m"] == pytest.approx(3.5)


def test_the_last_entry_only_fills_the_hours_before_the_first_reading():
    """Once the sensor speaks it is the sensor that is believed."""
    start = NOON
    readings = [
        _full(start + datetime.timedelta(minutes=30), temperature=30.0),
    ]
    rows = _rows(
        readings,
        start,
        start + datetime.timedelta(hours=1),
        last_entry={const.MAPPING_TEMPERATURE: 10.0},
        solar_series=_series(start, 1),
    )

    assert rows[0]["temperature"] == pytest.approx(20.0)


def test_the_first_reading_is_held_backwards_when_nothing_else_is_known():
    """Better than inventing a value: the field was presumably already there."""
    start = NOON
    readings = [_full(start + datetime.timedelta(minutes=30), temperature=30.0)]
    rows = _rows(
        readings,
        start,
        start + datetime.timedelta(hours=1),
        solar_series=_series(start, 1),
    )

    assert rows[0]["temperature"] == pytest.approx(30.0)


@pytest.mark.parametrize("missing", REQUIRED_FIELDS)
def test_a_required_field_missing_everywhere_refuses_the_window(missing):
    """Not a zero and not a guess: None, and the caller keeps the daily
    equation, which reads the group's own aggregate."""
    start = NOON
    readings = [
        {k: v for k, v in reading.items() if k != missing}
        for reading in _hourly_readings(start, 2)
    ]

    assert _rows(readings, start, start + datetime.timedelta(hours=2)) is None


def test_a_field_whose_source_was_removed_is_not_carried_in():
    """The caller passes only the fields that still have a source; a last entry
    the builder is not given cannot rescue the window."""
    start = NOON
    readings = [
        {k: v for k, v in reading.items() if k != const.MAPPING_WINDSPEED}
        for reading in _hourly_readings(start, 2)
    ]

    assert _rows(readings, start, start + datetime.timedelta(hours=2)) is None
    assert (
        _rows(
            readings,
            start,
            start + datetime.timedelta(hours=2),
            last_entry={const.MAPPING_WINDSPEED: 2.0},
            solar_series=_series(start, 2),
        )
        is not None
    )


def test_a_reading_that_is_not_a_number_is_skipped_rather_than_fatal():
    """Sensors publish "unknown" and "unavailable", and a single one of those
    used to take a whole calculation down."""
    start = NOON
    readings = [
        _full(start, temperature=20.0),
        _full(start + datetime.timedelta(minutes=30), temperature="unavailable"),
        _full(start + datetime.timedelta(hours=1), temperature=20.0),
    ]
    rows = _rows(
        readings,
        start,
        start + datetime.timedelta(hours=1),
        solar_series=_series(start, 1),
    )

    assert rows[0]["temperature"] == pytest.approx(20.0)


def test_a_reading_with_an_unreadable_timestamp_is_skipped():
    start = NOON
    readings = _hourly_readings(start, 2)
    readings.insert(
        1, {const.RETRIEVED_AT: "the other day", const.MAPPING_TEMPERATURE: 9.0}
    )

    rows = _rows(
        readings,
        start,
        start + datetime.timedelta(hours=2),
        solar_series=_series(start, 2),
    )

    assert rows is not None
    assert all(row["temperature"] == pytest.approx(22.0) for row in rows)


# --- where the sun comes from -----------------------------------------------


def test_nothing_reports_the_sun_and_nothing_can_be_asked():
    """The one case the caller must see as None: an hour cannot be priced
    without knowing whether it was daylight."""
    start = NOON

    assert (
        _rows(
            _hourly_readings(start, 2),
            start,
            start + datetime.timedelta(hours=2),
            solar_series=None,
        )
        is None
    )


def test_a_series_fills_the_hours_a_sensor_does_not():
    start = NOON
    rows = _rows(
        _hourly_readings(start, 2),
        start,
        start + datetime.timedelta(hours=2),
        solar_series=_series(start, 2, mj_per_hour=2.25),
    )

    assert [row["solar_mj_h"] for row in rows] == [2.25, 2.25]


def test_a_gap_in_the_series_refuses_the_window():
    """An hour the history does not cover is not invented."""
    start = NOON
    series = _series(start, 2)
    del series[_hour_start_timestamp(start + datetime.timedelta(hours=1), OFFSET)]

    assert (
        _rows(
            _hourly_readings(start, 2),
            start,
            start + datetime.timedelta(hours=2),
            solar_series=series,
        )
        is None
    )


def test_the_groups_own_pyranometer_wins_over_a_series():
    start = NOON
    rows = _rows(
        _hourly_readings(start, 2, **{const.MAPPING_SOLRAD: 24.0}),
        start,
        start + datetime.timedelta(hours=2),
        solar_series=_series(start, 2, mj_per_hour=99.0),
    )

    assert all(row["solar_mj_h"] == pytest.approx(1.0) for row in rows)


# --- the helpers the solar estimate shares ----------------------------------


def test_the_effective_series_is_the_window_and_its_bounds():
    start = NOON
    readings = _hourly_readings(start - datetime.timedelta(hours=2), 6)

    effective, window_start, window_end = _effective_series(
        readings, start, start + datetime.timedelta(hours=2)
    )

    assert window_start == start
    assert window_end == start + datetime.timedelta(hours=2)
    assert [stamp for stamp, _reading in effective] == [
        start + datetime.timedelta(hours=hour) for hour in range(3)
    ]


def test_the_effective_series_says_so_when_there_is_nothing():
    assert _effective_series([], NOON, NOON + datetime.timedelta(hours=1))[0] is None
    assert _effective_series(None, NOON, NOON)[0] is None


def test_grouping_gives_each_field_its_own_ordered_timeline():
    start = NOON
    effective, _start, _end = _effective_series(
        [
            _full(start, temperature=10.0),
            _reading(
                start + datetime.timedelta(minutes=30), **{const.MAPPING_WINDSPEED: 4.0}
            ),
        ],
        start,
        start + datetime.timedelta(hours=1),
    )

    grouped = _group_by_sensor(effective)

    assert [value for _stamp, value in grouped[const.MAPPING_TEMPERATURE]] == [10.0]
    assert [value for _stamp, value in grouped[const.MAPPING_WINDSPEED]] == [2.0, 4.0]
    assert const.RETRIEVED_AT not in grouped


def test_an_hour_start_is_keyed_by_the_offset_it_was_written_in():
    """The two clocks meet here, and only here: a naive local hour and the unix
    timestamp a weather service keys the same hour by."""
    naive = datetime.datetime(2026, 6, 15, 12, 0)

    assert _hour_start_timestamp(naive, 2.0) == pytest.approx(
        _hour_start_timestamp(naive, 1.0) - 3600
    )
    assert _hour_start_timestamp(naive, 0.0) == pytest.approx(
        naive.replace(tzinfo=datetime.timezone.utc).timestamp()
    )


def test_the_mean_of_an_empty_timeline_is_whatever_was_already_known():
    assert _mean_over([], NOON, NOON + datetime.timedelta(hours=1)) is None
    assert _mean_over([], NOON, NOON + datetime.timedelta(hours=1), seed=4.0) == 4.0


# --- the machine's own clock ------------------------------------------------


def test_the_system_zone_answers_for_a_naive_moment():
    zone = SystemLocalTime()
    offset = zone.utcoffset(datetime.datetime(2026, 6, 15, 12, 0))

    assert isinstance(offset, datetime.timedelta)
    assert -datetime.timedelta(hours=14) <= offset <= datetime.timedelta(hours=14)
    assert zone.dst(datetime.datetime(2026, 6, 15, 12, 0)) >= datetime.timedelta(0)
    assert isinstance(zone.tzname(datetime.datetime(2026, 6, 15, 12, 0)), str)


def test_the_system_zone_survives_a_moment_it_cannot_place():
    """``time.mktime`` raises on dates outside the platform's range, and a row
    builder that let that through would take a calculation down."""
    assert SystemLocalTime().utcoffset(None) is not None
    assert SystemLocalTime().utcoffset(datetime.datetime(1, 1, 1, 0, 0)) is not None


# --- the sum ----------------------------------------------------------------


def test_the_sum_is_the_rows_weighted_by_their_coverage():
    start = NOON + datetime.timedelta(minutes=30)
    end = NOON + datetime.timedelta(hours=2)
    readings = _hourly_readings(NOON, 3, **{const.MAPPING_SOLRAD: 48.0})

    rows = _rows(readings, start, end)
    total, hours = summed_hourly_eto(
        readings,
        start,
        now=end,
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
    )

    assert total == pytest.approx(sum(price_hourly_rows(rows, LAT, LON, ELEV)))
    assert hours == pytest.approx(1.5)


def test_a_window_that_cannot_be_reduced_to_rows_has_no_sum():
    assert (
        summed_hourly_eto(
            [],
            NOON,
            now=NOON + datetime.timedelta(hours=1),
            latitude=LAT,
            longitude=LON,
        )
        is None
    )


def test_a_longer_window_of_the_same_weather_evaporates_more():
    readings = _hourly_readings(NOON, 6, **{const.MAPPING_SOLRAD: 48.0})

    short = summed_hourly_eto(
        readings,
        NOON,
        now=NOON + datetime.timedelta(hours=2),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
    )
    long = summed_hourly_eto(
        readings,
        NOON,
        now=NOON + datetime.timedelta(hours=5),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
    )

    assert long[0] > short[0] > 0
    assert long[1] == pytest.approx(5.0)


def test_pricing_no_rows_is_no_millimetres():
    assert price_hourly_rows([], LAT, LON, ELEV) == []
    assert price_hourly_rows(None, LAT, LON, ELEV) == []
