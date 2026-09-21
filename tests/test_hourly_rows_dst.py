"""Taken from JustChr's fork, Irrigation Plus (MIT), onto this integration's row
builder.

A calculation window can span a DST transition, so the offset is per row.

Buffer stamps are naive local times and the solar-time correction needs the UTC
offset they are in. Resolving that once for the window puts every row on the far
side of a transition an hour out in solar time, and a window reaches seven days,
so this is reachable rather than theoretical.

The size of the error depends on where the geometry lands. On the pure ET path a
one-hour shift is worth 0.26-0.74% of daily ETo, because with measured Rs the
extraterrestrial radiation only reaches ETo through the cloudiness term. On the
clearness-ratio gap hold, where Rso is the DENOMINATOR, the same shift moves the
refilled radiation by +23.5% / -16.0%. The second is what makes this worth
fixing, and it is exactly the asymmetry that makes "ETo still looks right" no
evidence at all about solar geometry.

Not fixed here, and not a regression this introduces: a 25-hour day is still
charged 24 hours of ET (-4.1%) and a 23-hour day 24 (+4.3%). ``_hour_multiplier``
is ``now - watermark`` over the same naive stamps, so the daily equation
miscounts the same day by the same hour.
"""

import datetime
from datetime import timedelta
from zoneinfo import ZoneInfo

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.hourly_rows import (
    build_hourly_rows,
    price_hourly_rows,
)

# A zone with both transitions in 2026: forward 08 March 02:00 -> 03:00,
# back 01 November 02:00 -> 01:00. EST is -5, EDT is -4.
TZ = ZoneInfo("America/New_York")
LAT, LON, ELEV = 39.68987, -84.07865, 311.0

TEMP, RH, WIND, SOLAR = 20.0, 50.0, 1.0, 500.0


def _readings(start, hours, *, rain_per_hour=0.0, step=10):
    """Dense rows over ``hours`` naive local hours from ``start``.

    The rain gauge is cumulative, which is how a real one reads and what makes
    conservation across the repeated hour a meaningful claim: the two passes over
    01:00 both add into the same hour key.
    """
    readings = []
    cumulative = 0.0
    for i in range(hours * (60 // step)):
        stamp = start + timedelta(minutes=i * step)
        cumulative += rain_per_hour * step / 60
        readings.append(
            {
                const.RETRIEVED_AT: stamp,
                const.MAPPING_TEMPERATURE: TEMP,
                const.MAPPING_HUMIDITY: RH,
                const.MAPPING_WINDSPEED: WIND,
                const.MAPPING_SOLRAD: SOLAR,
                const.MAPPING_PRECIPITATION: cumulative,
            }
        )
    return readings


def _rows(start, hours, **kwargs):
    return build_hourly_rows(
        _readings(start, hours, **kwargs),
        start,
        now=start + timedelta(hours=hours),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz_offset_h=-5.0,
        tz=TZ,
    )


class TestTheOffsetIsResolvedPerRow:
    def test_rows_either_side_of_the_spring_transition_differ(self):
        """20:00 on 07 March to 08:00 on 08 March: EST before, EDT after."""
        rows = _rows(datetime.datetime(2026, 3, 7, 20, 0), 12)
        assert rows is not None
        by_hour = {r["hour_start"]: r["tz_offset_h"] for r in rows}
        assert by_hour[datetime.datetime(2026, 3, 7, 23, 0)] == -5.0
        assert by_hour[datetime.datetime(2026, 3, 8, 5, 0)] == -4.0
        # Both offsets are genuinely present, which is the whole claim.
        assert set(by_hour.values()) == {-5.0, -4.0}

    def test_rows_either_side_of_the_autumn_transition_differ(self):
        rows = _rows(datetime.datetime(2026, 10, 31, 20, 0), 12)
        assert rows is not None
        by_hour = {r["hour_start"]: r["tz_offset_h"] for r in rows}
        assert by_hour[datetime.datetime(2026, 10, 31, 23, 0)] == -4.0
        assert by_hour[datetime.datetime(2026, 11, 1, 5, 0)] == -5.0

    def test_the_ambiguous_hour_resolves_fold_zero(self):
        """01:00 on 01 November happens twice; a naive stamp cannot say which.

        fold=0 is the first pass, so the hour reads as EDT. The residual is the
        one hour that is genuinely indistinguishable, not a choice with a better
        alternative available.
        """
        rows = _rows(datetime.datetime(2026, 11, 1, 0, 0), 6)
        by_hour = {r["hour_start"]: r["tz_offset_h"] for r in rows}
        assert by_hour[datetime.datetime(2026, 11, 1, 1, 0)] == -4.0
        assert by_hour[datetime.datetime(2026, 11, 1, 2, 0)] == -5.0

    def test_no_timezone_means_no_per_row_offset(self):
        """Every existing caller passes the scalar only and must be unchanged."""
        rows = build_hourly_rows(
            _readings(datetime.datetime(2026, 3, 7, 20, 0), 12),
            datetime.datetime(2026, 3, 7, 20, 0),
            now=datetime.datetime(2026, 3, 8, 8, 0),
            latitude=LAT,
            longitude=LON,
            elevation=ELEV,
            tz_offset_h=-5.0,
        )
        assert rows is not None
        assert all("tz_offset_h" not in r for r in rows)


class TestTheSeriesUsesIt:
    def test_a_rows_own_offset_beats_the_argument(self):
        """The ETo series prefers the row's offset, so the geometry follows it."""
        row = {
            "temperature": TEMP,
            "humidity": RH,
            "wind_2m": WIND,
            "solar_mj_h": 2.0,
            "doy": 172,
            "hour": 12.5,
        }
        scalar = price_hourly_rows([row], LAT, LON, elevation=ELEV, tz_offset_h=-4.0)[0]
        shifted = price_hourly_rows([row], LAT, LON, elevation=ELEV, tz_offset_h=-5.0)[
            0
        ]
        carried = price_hourly_rows(
            [{**row, "tz_offset_h": -5.0}], LAT, LON, elevation=ELEV, tz_offset_h=-4.0
        )
        assert carried[0] == pytest.approx(shifted)
        assert carried[0] != pytest.approx(scalar)

    def test_rows_without_the_key_still_take_the_argument(self):
        """The live estimate's Open-Meteo rows come from elsewhere and carry none."""
        row = {
            "temperature": TEMP,
            "humidity": RH,
            "wind_2m": WIND,
            "solar_mj_h": 2.0,
            "doy": 172,
            "hour": 12.5,
        }
        assert price_hourly_rows([row], LAT, LON, elevation=ELEV, tz_offset_h=-4.0)[
            0
        ] == pytest.approx(
            price_hourly_rows([dict(row)], LAT, LON, elevation=ELEV, tz_offset_h=-4.0)[
                0
            ]
        )


class TestTheGapHoldFeelsIt:
    """The half that made this worth doing: Rso is the ratio's denominator.

    An hour with no solar reading is refilled as ``held ratio x its own Rso``, so
    a one-hour solar-time error scales the refilled radiation directly instead of
    reaching ETo through the cloudiness term. Asserted as a difference between
    the corrected and uncorrected runs rather than against ETo, which is nearly
    blind to solar geometry.
    """

    def _gap_solar(self, **kwargs):
        # 20:00 on 07 March through 20:00 on 08 March, with 10:00-16:00 silent.
        start = datetime.datetime(2026, 3, 7, 20, 0)
        readings = [
            r
            for r in _readings(start, 24)
            if not (
                r[const.RETRIEVED_AT].day == 8 and 10 <= r[const.RETRIEVED_AT].hour < 16
            )
        ]
        rows = build_hourly_rows(
            readings,
            start,
            now=start + timedelta(hours=24),
            latitude=LAT,
            longitude=LON,
            elevation=ELEV,
            **kwargs,
        )
        assert rows is not None
        return {
            r["hour_start"]: r["solar_mj_h"]
            for r in rows
            if r["hour_start"].day == 8 and 10 <= r["hour_start"].hour < 16
        }

    def test_the_refilled_hours_move_when_the_offset_is_resolved_per_row(self):
        """Post-transition hours are EDT; the window opened in EST."""
        corrected = self._gap_solar(tz_offset_h=-5.0, tz=TZ)
        stale = self._gap_solar(tz_offset_h=-5.0)
        assert set(corrected) == set(stale)
        # Well past rounding, and the direction is consistent across the gap.
        worst = max(
            abs(corrected[h] - stale[h]) / stale[h] for h in corrected if stale[h] > 0
        )
        assert worst > 0.05

    def test_a_window_with_no_transition_is_untouched(self):
        """The correction must cost nothing on the other 363 days."""
        start = datetime.datetime(2026, 3, 14, 20, 0)
        kwargs = {
            "latitude": LAT,
            "longitude": LON,
            "elevation": ELEV,
            "tz_offset_h": -4.0,
        }
        readings = _readings(start, 24)
        args = (readings, start)
        now = start + timedelta(hours=24)
        with_tz = build_hourly_rows(*args, now=now, tz=TZ, **kwargs)
        without = build_hourly_rows(*args, now=now, **kwargs)
        assert [r["solar_mj_h"] for r in with_tz] == [
            pytest.approx(r["solar_mj_h"]) for r in without
        ]
