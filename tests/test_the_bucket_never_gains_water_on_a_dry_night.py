"""A dry night cannot add water to the bucket (#866).

On a calm humid night the hourly Penman-Monteith equation returns a small
negative value: the surface loses more heat than it receives, and there is not
enough wind or dryness to offset it. That is condensation, and it is real -- dew
on the leaves, which evaporates in the morning. It is not water in the root
zone, and summing those hours credited the water balance with rain that never
fell. A zone at -1.57 mm read -1.53 mm by dawn.

FAO-56's own worked example prints 0.00 mm for exactly such an hour.

The lesson this file carries is about the test that did not catch it. There was
one, on that same worked example, and it asserted the night hour came out at
0.00 within five thousandths -- which a value of -0.003 satisfies. It checked a
magnitude where the thing that mattered was a sign, so these tests assert the
invariant instead: **without rain, a bucket never rises.**
"""

import datetime

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.hourly_et import eto_hourly
from custom_components.smart_irrigation.hourly_rows import (
    build_hourly_rows,
    price_hourly_rows,
    summed_hourly_eto,
)

# The night reported, from the diagnostics: a still, humid, overcast September
# night in the Netherlands.
LAT, LON, ELEV = 51.5324836, 5.4810053, 20.0
NIGHT = [
    (23, 14.7, 90),
    (0, 14.5, 89),
    (1, 14.1, 87),
    (2, 13.8, 88),
    (3, 13.6, 88),
    (4, 13.6, 89),
]
OFFSET = 2.0


class _FixedOffset(datetime.tzinfo):
    def utcoffset(self, _dt):
        return datetime.timedelta(hours=OFFSET)

    def dst(self, _dt):
        return datetime.timedelta(0)


def _readings():
    """His window: hourly readings from 23:00, no sun, barely any wind."""
    start = datetime.datetime(2026, 9, 27, 23, 0)
    readings = []
    for index, (_hour, temperature, humidity) in enumerate(NIGHT):
        stamp = start + datetime.timedelta(hours=index, minutes=29)
        readings.append(
            {
                const.RETRIEVED_AT: stamp.isoformat(),
                const.MAPPING_TEMPERATURE: temperature,
                const.MAPPING_HUMIDITY: humidity,
                const.MAPPING_WINDSPEED: 0.75,
                const.MAPPING_PRESSURE: 1016.4,
                const.MAPPING_SOLRAD: 0.0,
            }
        )
    return readings, start, start + datetime.timedelta(hours=len(NIGHT))


@pytest.mark.parametrize(("hour", "temperature", "humidity"), NIGHT)
def test_no_hour_of_a_dry_night_evaporates_a_negative_amount(
    hour, temperature, humidity
):
    """Each hour on its own: nothing, never below zero."""
    eto = eto_hourly(
        t_c=temperature,
        rh_pct=humidity,
        wind_2m=0.75,
        solar_rad_hr=0.0,
        latitude_deg=LAT,
        longitude_deg=LON,
        doy=271,
        hour_mid=hour + 0.5,
        tz_offset_h=OFFSET,
        elevation_m=ELEV,
    )

    # A hair above zero is the aerodynamic term of a night whose sky was read
    # off its humidity; below zero is the bug.
    assert 0.0 <= eto < 0.001


def test_the_whole_night_sums_to_nothing_rather_than_to_rain():
    readings, start, now = _readings()

    total, hours = summed_hourly_eto(
        readings,
        start,
        now=now,
        last_entry={},
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=_FixedOffset(),
    )

    assert hours == pytest.approx(len(NIGHT), abs=0.01)
    assert total == 0.0


def test_the_bucket_does_not_rise_over_that_night():
    """The invariant, stated as the reporter stated it: the bucket was at
    -1.5687 mm at the calculation and no rain fell."""
    readings, start, now = _readings()
    bucket = -1.5687

    total, _hours = summed_hourly_eto(
        readings,
        start,
        now=now,
        last_entry={},
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=_FixedOffset(),
    )
    estimate = bucket - total

    assert estimate <= bucket
    assert estimate == pytest.approx(bucket)


def test_a_day_still_evaporates():
    """The clamp must not flatten the thing it is protecting: an hour with sun
    is unaffected."""
    eto = eto_hourly(
        t_c=28.0,
        rh_pct=45.0,
        wind_2m=2.0,
        solar_rad_hr=2.4,
        latitude_deg=LAT,
        longitude_deg=LON,
        doy=180,
        hour_mid=13.5,
        tz_offset_h=OFFSET,
        elevation_m=ELEV,
    )

    assert eto > 0.3


def test_every_hour_of_a_window_is_zero_or_more():
    """Whatever the window, no row is priced negative: a later hour cannot give
    back what an earlier one took."""
    readings, start, now = _readings()
    rows = build_hourly_rows(
        readings,
        start,
        now=now,
        last_entry={},
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=_FixedOffset(),
    )

    assert all(value >= 0.0 for value in price_hourly_rows(rows, LAT, LON, ELEV))
