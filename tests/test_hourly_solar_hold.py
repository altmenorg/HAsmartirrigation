"""Taken from JustChr's fork, Irrigation Plus (MIT), onto this integration's row
builder. His calculation-level case is replaced by our own.

Hours with no solar reading are refilled from a held CLEARNESS RATIO.

``build_hourly_rows`` emits a row for every clock hour the window touches and
fills a silent hour by zero-order hold. For solar radiation that is right for a
**deadband gap** -- the sensor sits pinned at 0 all night and emits no rows, so
holding 0 is the true answer -- and a fabrication for an **outage gap**, where
the value moved and nobody looked. Nothing in the row distinguishes the two:
``coverage_h`` is the hour's overlap with the calculation window, so a six-hour
hole in the middle of the day still produces six rows at ``coverage_h = 1.0``,
each charged a full hour of ET from a stale value.

Holding ``Rs/Rso`` instead of ``Rs`` separates the two by construction, because
Rso is zero at night and follows the sun's real height by day. Measured on nine
recorded days across six gap shapes, flat hold sits 77.4% from dense truth and
the ratio hold 15.7%.

The fixtures here generate solar as an exact multiple of clear sky, so the ratio
a gap hour should reproduce is known to the last decimal rather than eyeballed.
"""

import datetime
from datetime import timedelta

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.hourly_et import (
    atm_pressure,
    clear_sky_radiation_hourly_eq36,
    extraterrestrial_radiation_hourly,
    solar_elevation_sin,
    svp_from_t,
)
from custom_components.smart_irrigation.hourly_rows import (
    SOLAR_CLEAR_SKY_TOLERANCE,
    build_hourly_rows,
)

T0 = datetime.datetime(2026, 5, 22, 0, 0, 0)
LAT, LON, ELEV = 39.68987, -84.07865, 311.0
# Fixed rather than read from the clock: the solar-time correction is what these
# tests are about, so a test whose sun moved with the runner's timezone would be
# measuring the runner.
TZ = -4.0

TEMP, RH, WIND = 20.0, 50.0, 1.0
# The sky state every fixture day is generated at. Any value below the 1.3
# tolerance works; 0.8 is a plausible lightly-hazy clear day.
RATIO = 0.8

# 1 W/m2 = 0.0864 MJ/day/m2, which is what the buffer stores; FAO-56 hourly
# wants MJ/m2/h, and the two differ by 24.
MJ_DAY_PER_MJ_HOUR = 24.0


def rso(hour, doy=None):
    """Clear-sky radiation [MJ/m2/h] at local clock ``hour`` (FAO-56 Eq. 36).

    The model the fixtures are generated from and the expectations checked
    against, built from the public helpers rather than from the hold's own code
    so a bug in the hold cannot cancel itself out.
    """
    doy = T0.timetuple().tm_yday if doy is None else doy
    ra = extraterrestrial_radiation_hourly(LAT, LON, doy, hour, TZ)
    if ra <= 0:
        return 0.0
    return clear_sky_radiation_hourly_eq36(
        ra,
        solar_elevation_sin(LAT, LON, doy, hour, TZ),
        atm_pressure(ELEV),
        svp_from_t(TEMP) * RH / 100.0,
    )


def _readings(*, keep=None, ratio=RATIO, step=10, hours=24, spike=None):
    """A dense buffer whose solar is exactly ``ratio`` x clear sky.

    ``keep`` drops rows to carve a gap. Every mapped field lives on every row,
    so a dropped row is a total outage rather than one field going quiet.
    """
    readings = []
    for hour in range(hours):
        for minute in range(0, 60, step):
            stamp = T0 + timedelta(hours=hour, minutes=minute)
            if keep is not None and not keep(stamp):
                continue
            clock = hour + minute / 60
            value = ratio * rso(clock)
            if spike is not None and spike(stamp):
                value = spike(stamp) * rso(clock)
            readings.append(
                {
                    const.RETRIEVED_AT: stamp,
                    const.MAPPING_TEMPERATURE: TEMP,
                    const.MAPPING_HUMIDITY: RH,
                    const.MAPPING_WINDSPEED: WIND,
                    const.MAPPING_SOLRAD: value * MJ_DAY_PER_MJ_HOUR,
                }
            )
    return readings


def _rows(readings, *, watermark=T0, now=None, coords=True):
    now = T0 + timedelta(hours=24) if now is None else now
    extra = (
        {"latitude": LAT, "longitude": LON, "elevation": ELEV, "tz_offset_h": TZ}
        if coords
        else {}
    )
    return build_hourly_rows(readings, watermark, now=now, **extra)


def _solar(rows):
    return {r["hour_start"].hour: r["solar_mj_h"] for r in rows}


class TestOutageGap:
    """The case the change exists for: the value moved and nobody looked."""

    def test_a_midday_outage_follows_the_clear_sky_curve(self):
        """Six silent daylight hours, refilled from the 08:50 sky state.

        Flat hold charges every one of them the 08:50 radiation, which is barely
        a third of solar noon here; the ratio hold rebuilds the noon peak from
        the sun's own geometry and only carries the sky condition across.
        """
        readings = _readings(keep=lambda s: not (9 <= s.hour < 15))
        held = _solar(_rows(readings))
        flat = _solar(_rows(readings, coords=False))

        for hour in range(9, 15):
            assert held[hour] == pytest.approx(RATIO * rso(hour + 0.5), rel=1e-9)
        # The last reading before the outage, held flat, is what it replaces.
        assert flat[13] == pytest.approx(flat[9])
        assert held[13] > 2 * flat[13]

    def test_the_hours_that_did_see_a_reading_are_untouched(self):
        """Only silent hours are refilled, so a healthy buffer cannot move."""
        readings = _readings(keep=lambda s: not (9 <= s.hour < 15))
        held = _solar(_rows(readings))
        flat = _solar(_rows(readings, coords=False))
        for hour in [*range(0, 9), *range(15, 24)]:
            assert held[hour] == pytest.approx(flat[hour])

    def test_a_dense_buffer_is_byte_identical(self):
        """Every hour has a reading, so there is nothing to hold."""
        readings = _readings()
        assert _solar(_rows(readings)) == _solar(_rows(readings, coords=False))

    def test_without_coordinates_the_flat_hold_stands(self):
        """No site geometry means no Rso, so today's behaviour is what is left."""
        readings = _readings(keep=lambda s: not (9 <= s.hour < 15))
        no_lat = build_hourly_rows(
            readings,
            T0,
            now=T0 + timedelta(hours=24),
            longitude=LON,
            elevation=ELEV,
        )
        assert _solar(no_lat) == _solar(_rows(readings, coords=False))


class TestNightGap:
    """A deadband gap is not an outage gap, and must not be 'fixed'."""

    def test_a_sensor_that_dies_in_daylight_still_reads_zero_at_night(self):
        """The failure flat hold cannot survive: noon sun carried into the dark.

        A pyranometer stuck at a daytime level through the night is a recorded
        failure at this site (19 hours at 722 W/m2). Rso is zero after sunset, so
        a held ratio lands at zero there however bright the last reading was.
        """
        readings = _readings(keep=lambda s: s.hour < 15)
        held = _solar(_rows(readings))
        flat = _solar(_rows(readings, coords=False))
        for hour in range(21, 24):
            assert held[hour] == 0.0
            assert flat[hour] > 1.0

    def test_a_deadband_night_stays_at_zero(self):
        """Solar pinned at 0 emits no rows overnight; holding 0 is the truth.

        The trap this guards: treating every silent hour as suspect would
        fabricate radiation for a night that really was dark.
        """
        # Rows only while the sun is up, exactly as the deadband produces them.
        readings = _readings(keep=lambda s: rso(s.hour + s.minute / 60) > 0)
        held = _solar(_rows(readings))
        assert held is not None
        for hour, value in held.items():
            if rso(hour + 0.5) == 0.0:
                assert value == 0.0
        # And the daylight hours it does have are still real radiation.
        assert max(held.values()) > 1.0

    def test_a_night_only_window_is_left_alone(self):
        """No hour is bright enough to measure a ratio from; nothing to hold."""
        readings = _readings(keep=lambda s: s.hour < 2, hours=4)
        now = T0 + timedelta(hours=4)
        assert _solar(_rows(readings, now=now)) == _solar(
            _rows(readings, now=now, coords=False)
        )


class TestPartialHourWindow:
    """Coverage and the ratio hold are independent; neither may eat the other."""

    def test_partial_end_hours_keep_their_coverage_and_the_gap_is_refilled(self):
        start = T0 + timedelta(hours=8, minutes=30)
        end = T0 + timedelta(hours=12, minutes=15)
        readings = [
            r
            for r in _readings(keep=lambda s: not (10 <= s.hour < 12))
            if r[const.RETRIEVED_AT] <= end
        ]
        rows = _rows(readings, watermark=start, now=end)

        assert [r["coverage_h"] for r in rows] == pytest.approx(
            [0.5, 1.0, 1.0, 1.0, 0.25]
        )
        held = _solar(rows)
        for hour in (10, 11):
            assert held[hour] == pytest.approx(RATIO * rso(hour + 0.5), rel=1e-9)
        # coverage_h is applied by the ETo series, not baked into the row, so the
        # partial hours carry a whole hour's radiation exactly as they always did.
        assert held[8] == pytest.approx(
            _solar(_rows(readings, watermark=start, now=end, coords=False))[8]
        )


class TestRatioBounds:
    """What may be projected across a gap, and from where."""

    def test_an_impossible_reading_cannot_be_projected_across_the_gap(self):
        """Capped at the same tolerance the ingest clamp uses.

        The ingest clamp guards readings and stays; this guards the hours the
        hold fabricates from them. A reading that slipped past ingest (a
        different mapping's units, a stuck sensor) must not be carried forward at
        five times clear sky for the rest of the day.
        """
        readings = _readings(
            keep=lambda s: not (9 <= s.hour < 15),
            spike=lambda s: 5.0 if s.hour == 8 else None,
        )
        held = _solar(_rows(readings))
        for hour in range(9, 15):
            assert held[hour] == pytest.approx(
                SOLAR_CLEAR_SKY_TOLERANCE * rso(hour + 0.5), rel=1e-9
            )

    def test_a_gap_before_the_first_reading_uses_the_first_measured_ratio(self):
        """Back-fill, matching the rule every other field already follows.

        ``_hold_integral_table`` holds a field's first sample BACKWARDS to the
        window start, and the ratio hold does the same in ratio space. The
        alternative -- leaving the leading gap at zero -- would silently delete a
        whole morning's ET on the shape that produces it, an outage that runs
        from the window start into the middle of the day.
        """
        readings = _readings(keep=lambda s: s.hour >= 12)
        held = _solar(_rows(readings))
        for hour in range(6, 12):
            assert held[hour] == pytest.approx(RATIO * rso(hour + 0.5), rel=1e-9)
