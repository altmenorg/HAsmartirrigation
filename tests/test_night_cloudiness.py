"""What the sky was like, for the hours that cannot see it (FAO-56 Eq. 39).

The net long-wave loss of an hour depends on cloud: a clear night radiates heat
away, an overcast one holds it. The cloudiness comes from Rs/Rso, the measured
sun against the clear-sky sun, and after dark there is no sun to take that
ratio of.

The hourly form used the lower bound of the cloudiness function, 0.05, for
every hour of every night. FAO-56's own worked example (Example 19) publishes a
long-wave loss of 0.100 MJ/m2 for a night hour where that gives 0.007: fourteen
times too little. Too little loss is too much net radiation, which is water
evaporated at night that was not. On a clear day it costs a few per cent; in
December, where the night is fifteen hours long and the day evaporates little,
it was around a seventh of the whole figure.

So the daylight of the window says what the sky was like, sum against sum, and
the night borrows it. A window with no daylight in it at all falls back to a
clear-sky assumption, which is the end of the range that loses the most: an
assumption that under-counts the loss is the one that waters a garden it should
not have.
"""

import datetime
import math

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation import hourly_rows as rows_module
from custom_components.smart_irrigation.hourly_et import (
    NIGHT_CLOUDINESS_FALLBACK,
    clear_sky_radiation_hourly,
    cloudiness_factor,
    extraterrestrial_radiation_hourly,
    net_radiation_hourly,
    svp_from_t,
)
from custom_components.smart_irrigation.hourly_rows import (
    build_hourly_rows,
    price_hourly_rows,
)

LAT, LON, ELEV = 43.6, 1.44, 150.0
OFFSET = 2.0


class _FixedOffset(datetime.tzinfo):
    """A timezone of our own, so the machine's is not part of the test.

    The readings' radiation is generated against ``OFFSET``; the row builder has
    to place the hours in the same offset or the measured sun lands beside the
    clear-sky sun it is compared with. Reading the machine's zone instead made
    this pass here (UTC+2) and fail on CI (UTC).
    """

    def utcoffset(self, _dt):
        return datetime.timedelta(hours=OFFSET)

    def dst(self, _dt):
        return datetime.timedelta(0)


TZ = _FixedOffset()


def _day(date, *, clearness=0.75, tmin=12.0, tmax=28.0):
    """A day of readings whose sun is ``clearness`` of the clear-sky sun."""
    end = datetime.datetime.combine(date, datetime.time(23, 0))
    start = end - datetime.timedelta(hours=24)
    readings = []
    for i in range(49):
        stamp = start + datetime.timedelta(minutes=30 * i)
        clock = stamp.hour + stamp.minute / 60
        phase = math.cos(2 * math.pi * (clock - 15) / 24)
        ra = max(
            0.0,
            extraterrestrial_radiation_hourly(
                LAT, LON, stamp.timetuple().tm_yday, clock, OFFSET
            ),
        )
        rso = clear_sky_radiation_hourly(ra, ELEV)
        readings.append(
            {
                const.RETRIEVED_AT: stamp.isoformat(),
                const.MAPPING_TEMPERATURE: (tmin + tmax) / 2 + (tmax - tmin) / 2 * phase,
                const.MAPPING_HUMIDITY: 60.0 - 20.0 * phase,
                const.MAPPING_WINDSPEED: 2.0,
                const.MAPPING_PRESSURE: 1013.0,
                # The buffer stores radiation as MJ/m2/day; the row builder
                # divides by 24 to price the hour.
                const.MAPPING_SOLRAD: clearness * rso * 24,
            }
        )
    return readings, start, end


def _rows(date, **kwargs):
    readings, start, end = _day(date, **kwargs)
    return build_hourly_rows(
        readings,
        start,
        now=end,
        last_entry={},
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
    )


def _carried(rows):
    return rows_module._night_cloudiness(rows, LAT, LON, ELEV, OFFSET)


def test_a_clear_day_hands_the_night_a_clear_sky():
    """fcd = 1.35 Rs/Rso - 0.35, with the ratio of the whole daylight."""
    carried = _carried(_rows(datetime.date(2026, 6, 15), clearness=0.75))

    assert carried == pytest.approx(1.35 * 0.75 - 0.35, abs=0.01)


def test_an_overcast_day_hands_it_less():
    clear = _carried(_rows(datetime.date(2026, 6, 15), clearness=0.75))
    overcast = _carried(_rows(datetime.date(2026, 6, 15), clearness=0.25))

    assert overcast < clear
    assert overcast == pytest.approx(max(0.05, 1.35 * 0.25 - 0.35), abs=0.01)


def test_the_ratio_is_the_one_the_daily_equation_uses():
    """Sum against sum over the daylight, which is what the daily form does for
    its own long-wave term: the two cannot disagree about the same sky."""
    rows = _rows(datetime.date(2026, 6, 15), clearness=0.6)
    measured = clear_sky = 0.0
    for row in rows:
        ra = max(
            0.0,
            extraterrestrial_radiation_hourly(
                LAT, LON, row["doy"], row["hour"], row.get("tz_offset_h", OFFSET)
            ),
        )
        rso = clear_sky_radiation_hourly(ra, ELEV)
        if rso > 0:
            clear_sky += rso
            measured += row["solar_mj_h"]

    assert _carried(rows) == pytest.approx(cloudiness_factor(measured, clear_sky))


def test_a_window_with_no_daylight_has_nothing_to_hand_over():
    """Four hours of a winter night, on their own."""
    end = datetime.datetime(2026, 12, 10, 4, 0)
    readings, _start, _end = _day(datetime.date(2026, 12, 10))
    night = [
        reading
        for reading in readings
        if datetime.datetime.fromisoformat(reading[const.RETRIEVED_AT]) >= end
        - datetime.timedelta(hours=4)
        and datetime.datetime.fromisoformat(reading[const.RETRIEVED_AT]) <= end
    ]
    rows = build_hourly_rows(
        night,
        end - datetime.timedelta(hours=4),
        now=end,
        last_entry={},
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
    )

    assert _carried(rows) is None


def test_with_nothing_handed_over_the_clear_sky_end_is_assumed():
    """Because assuming an overcast night loses the least, and under-counting
    the loss is what waters a garden it should not have."""
    temperature, humidity = 8.0, 85.0
    avp = svp_from_t(temperature) * humidity / 100.0

    assumed = net_radiation_hourly(0.0, 0.0, temperature, avp, ELEV)
    explicit = net_radiation_hourly(
        0.0, 0.0, temperature, avp, ELEV, cloudiness=NIGHT_CLOUDINESS_FALLBACK
    )

    assert assumed == pytest.approx(explicit)
    # And it is a real loss, not the old near-zero one.
    assert assumed < -0.05


def test_a_long_winter_night_is_what_this_was_costing():
    """The regression this prevents, as a number: fourteen hours of night
    against a day that evaporates little."""
    rows = _rows(datetime.date(2026, 12, 10), tmin=1.0, tmax=9.0)

    corrected = sum(price_hourly_rows(rows, LAT, LON, ELEV))
    # The old behaviour, reproduced by handing the night the clamped minimum
    # the code used to use.
    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(rows_module, "_night_cloudiness", lambda *args, **kwargs: 0.05)
        before = sum(price_hourly_rows(rows, LAT, LON, ELEV))

    assert corrected < before
    assert (before - corrected) / corrected > 0.05


def test_a_summer_day_moves_much_less():
    """Short nights, and a day that dominates the total."""
    rows = _rows(datetime.date(2026, 6, 15))

    corrected = sum(price_hourly_rows(rows, LAT, LON, ELEV))
    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(rows_module, "_night_cloudiness", lambda *args, **kwargs: 0.05)
        before = sum(price_hourly_rows(rows, LAT, LON, ELEV))

    assert 0 < (before - corrected) / corrected < 0.05
