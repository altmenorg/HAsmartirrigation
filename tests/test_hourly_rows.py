"""The daily bucket's ET sourced from summed hourly FAO-56 ETo.

Taken from JustChr's fork, Irrigation Plus (MIT), onto this integration's
row builder. The precipitation and sub-step cases are not carried over: here
rain is handled apart from the hourly ET.


Running the daily FAO-56 equation on window-mean weather is biased by cloudiness:
fed one identical hourly series over 362 days it comes out 1.144x a reference
implementation on overcast days and 0.925x on clear ones, while the same series
summed hour by hour sits flat at 1.02-1.04 across every sky band (mean absolute
daily error 0.099 mm against 0.254 mm). The equation itself is already pinned
against FAO-56 Example 19 in test_et_hourly.py, so everything that can still go
wrong lives in the inputs handed to it -- which is what these cover:

* the MJ/day/m2 -> MJ/m2/h conversion, hand-computed, because omitting it hands
  the equation about 12x the solar constant;
* the two buffer shapes, since the continuous-update path writes one field per
  event and a builder that assumes dense rows drops most of that buffer;
* carry-forward for hours with no readings, and partial-hour coverage;
* that ``hour_multiplier`` is NOT applied on top of a summed-hourly total, which
  would scale the same window twice;
* that every path which cannot support hourly rows falls back to the daily form
  rather than to a fabricated series.
"""

import datetime
from datetime import timedelta

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.hourly_et import eto_hourly
from custom_components.smart_irrigation.hourly_rows import (
    build_hourly_rows,
    price_hourly_rows,
)

T0 = datetime.datetime(2026, 5, 22, 0, 0, 0)
LAT, LON, ELEV = 39.68987, -84.07865, 311.0

# 1 W/m2 = 0.0864 MJ/day/m2, which is what the buffer stores.
W_TO_MJ_DAY = 0.0864


def _row(stamp, fields):
    return {const.RETRIEVED_AT: stamp, **fields}


def _local_tz_offset_h():
    """The offset the calculation derives, so expectations track the code."""
    offset = dt_util.now().utcoffset()
    return offset.total_seconds() / 3600.0 if offset else 0.0


def _bell(peak=800.0):
    """Daylight solar in W/m2, flat within each hour so hourly means are exact."""

    def f(hour):
        if not 6 <= hour < 20:
            return 0.0
        return peak * (1 - abs(hour + 0.5 - 13) / 7)

    return f


def _dense(solar_w, *, hours=24, temp=20.0, rh=60.0, wind=1.0, pressure=None, step=10):
    """A dense buffer: every mapped field on every row, as the poll path writes."""
    readings = []
    for hour in range(hours):
        for minute in range(0, 60, step):
            fields = {
                const.MAPPING_TEMPERATURE: temp,
                const.MAPPING_HUMIDITY: rh,
                const.MAPPING_WINDSPEED: wind,
                const.MAPPING_SOLRAD: solar_w(hour) * W_TO_MJ_DAY,
            }
            if pressure is not None:
                fields[const.MAPPING_PRESSURE] = pressure
            readings.append(_row(T0 + timedelta(hours=hour, minutes=minute), fields))
    return readings


def _sparse(solar_w, *, hours=24, temp=20.0, rh=60.0, wind=1.0, step=10):
    """A sparse buffer: one field per row, as the continuous-update path writes.

    Only solar moves here, so the other fields appear once -- exactly the shape a
    dense-row assumption drops most of. They sit just inside the window because
    ``select_window`` keeps a single boundary row: a sparse field whose last
    reading predates the watermark reaches the calculation through the mapping's
    carry-forward instead, which is a different path.
    """
    readings = [
        _row(T0 + timedelta(minutes=1), {const.MAPPING_TEMPERATURE: temp}),
        _row(T0 + timedelta(minutes=1), {const.MAPPING_HUMIDITY: rh}),
        _row(T0 + timedelta(minutes=1), {const.MAPPING_WINDSPEED: wind}),
    ]
    for hour in range(hours):
        for minute in range(0, 60, step):
            readings.append(
                _row(
                    T0 + timedelta(hours=hour, minutes=minute),
                    {const.MAPPING_SOLRAD: solar_w(hour) * W_TO_MJ_DAY},
                )
            )
    return readings


def _upto(readings, end):
    """Trim to readings at or before ``end``.

    The window end is ``max(now, last reading)``, so a fixture holding readings
    from the future would silently stretch the window past the ``now`` under test.
    """
    return [r for r in readings if r[const.RETRIEVED_AT] <= end]


class TestRowBuilder:
    """The row-builder is the new code; the equation behind it is already pinned."""

    def test_solar_is_divided_by_24(self):
        """Hand-computed: 800 W/m2 -> 69.12 MJ/day/m2 stored -> 2.88 MJ/m2/h.

        The buffer holds a DAILY rate and FAO-56 hourly wants an HOURLY one. Skip
        the divide and the equation is handed 16.3 kW/m2, about 12x the solar
        constant, and the day's ET goes with it.
        """
        readings = _dense(lambda h: 800.0)
        assert readings[0][const.MAPPING_SOLRAD] == pytest.approx(69.12)
        rows = build_hourly_rows(readings, T0, now=T0 + timedelta(hours=24))
        assert rows is not None
        assert all(r["solar_mj_h"] == pytest.approx(2.88) for r in rows)

    def test_one_row_per_clock_hour_with_the_hour_midpoint(self):
        rows = build_hourly_rows(_dense(_bell()), T0, now=T0 + timedelta(hours=24))
        assert len(rows) == 24
        assert [r["hour"] for r in rows] == [h + 0.5 for h in range(24)]
        assert {r["doy"] for r in rows} == {T0.timetuple().tm_yday}
        assert all(r["coverage_h"] == pytest.approx(1.0) for r in rows)
        assert rows[0]["hour_start"] == T0

    def test_partial_hours_at_both_ends_are_charged_their_real_share(self):
        """A window that starts and ends mid-hour must not book two whole hours."""
        start = T0 + timedelta(hours=6, minutes=30)
        end = T0 + timedelta(hours=9, minutes=15)
        rows = build_hourly_rows(_upto(_dense(_bell()), end), start, now=end)
        assert [r["coverage_h"] for r in rows] == pytest.approx([0.5, 1.0, 1.0, 0.25])

    def test_sparse_and_dense_buffers_agree(self):
        """The continuous-update buffer is the shape this install actually writes."""
        now = T0 + timedelta(hours=24)
        dense = build_hourly_rows(_dense(_bell()), T0, now=now)
        sparse = build_hourly_rows(_sparse(_bell()), T0, now=now)
        assert sparse is not None
        assert len(sparse) == len(dense) == 24
        for a, b in zip(dense, sparse, strict=True):
            for key in ("temperature", "humidity", "wind_2m", "solar_mj_h"):
                assert a[key] == pytest.approx(b[key])

    def test_an_hour_with_no_readings_carries_the_last_value_forward(self):
        """Missing-hour policy. Solar emits no rows overnight, so this is the norm."""
        base = {
            const.MAPPING_HUMIDITY: 50.0,
            const.MAPPING_WINDSPEED: 1.0,
            const.MAPPING_SOLRAD: 0.0,
        }
        readings = [
            _row(T0 + timedelta(hours=1), {**base, const.MAPPING_TEMPERATURE: 10.0}),
            _row(T0 + timedelta(hours=5), {**base, const.MAPPING_TEMPERATURE: 20.0}),
        ]
        rows = build_hourly_rows(readings, T0, now=T0 + timedelta(hours=6))
        assert len(rows) == 6
        # Held backwards to the window start, forwards over the silent hours 2-4,
        # and forwards again past the last reading.
        assert [r["temperature"] for r in rows] == pytest.approx(
            [10.0, 10.0, 10.0, 10.0, 10.0, 20.0]
        )

    def test_the_measured_barometer_is_passed_through_in_kpa(self):
        rows = build_hourly_rows(
            _dense(_bell(), pressure=983.0), T0, now=T0 + timedelta(hours=24)
        )
        assert all(r["pressure_kpa"] == pytest.approx(98.3) for r in rows)

    def test_no_barometer_means_no_key_so_the_helper_derives_it(self):
        rows = build_hourly_rows(_dense(_bell()), T0, now=T0 + timedelta(hours=24))
        assert all("pressure_kpa" not in r for r in rows)

    def test_a_missing_required_field_falls_back(self):
        """No radiation anywhere means no hourly ETo; the daily form still runs."""
        readings = [
            _row(
                T0 + timedelta(hours=1),
                {
                    const.MAPPING_TEMPERATURE: 20.0,
                    const.MAPPING_HUMIDITY: 50.0,
                    const.MAPPING_WINDSPEED: 1.0,
                },
            )
        ]
        assert build_hourly_rows(readings, T0, now=T0 + timedelta(hours=6)) is None

    def test_a_field_only_in_the_carry_forward_is_still_usable(self):
        """A sparse buffer can hold no row at all for a slow-moving field."""
        readings = [
            _row(
                T0 + timedelta(hours=1),
                {
                    const.MAPPING_TEMPERATURE: 20.0,
                    const.MAPPING_WINDSPEED: 1.0,
                    const.MAPPING_SOLRAD: 0.0,
                },
            )
        ]
        now = T0 + timedelta(hours=6)
        assert build_hourly_rows(readings, T0, now=now) is None
        rows = build_hourly_rows(
            readings, T0, now=now, last_entry={const.MAPPING_HUMIDITY: 55.0}
        )
        assert all(r["humidity"] == pytest.approx(55.0) for r in rows)

    def test_an_absurdly_long_window_falls_back(self):
        """Past the buffer retention every extra hour is pure carry-forward."""
        readings = _dense(_bell(), step=30)
        assert build_hourly_rows(readings, T0, now=T0 + timedelta(days=8)) is None


class TestSeries:
    """``price_hourly_rows`` adds coverage scaling and the barometer to the equation."""

    def _r(self, **over):
        base = {
            "temperature": 25.0,
            "humidity": 55.0,
            "wind_2m": 1.2,
            "solar_mj_h": 2.0,
            "hour": 13.5,
            "doy": 142,
        }
        base.update(over)
        return base

    def test_coverage_scales_the_hour(self):
        full = price_hourly_rows(
            [self._r()], LAT, LON, elevation=ELEV, tz_offset_h=-4.0
        )[0]
        half = price_hourly_rows(
            [self._r(coverage_h=0.5)], LAT, LON, elevation=ELEV, tz_offset_h=-4.0
        )[0]
        assert full > 0
        assert half == pytest.approx(full / 2)

    def test_the_barometer_is_used_when_present(self):
        measured = price_hourly_rows(
            [self._r(pressure_kpa=98.3)], LAT, LON, elevation=ELEV, tz_offset_h=-4.0
        )
        assert measured[0] == pytest.approx(
            eto_hourly(
                t_c=25.0,
                rh_pct=55.0,
                wind_2m=1.2,
                solar_rad_hr=2.0,
                latitude_deg=LAT,
                longitude_deg=LON,
                doy=142,
                hour_mid=13.5,
                tz_offset_h=-4.0,
                elevation_m=ELEV,
                pressure_kpa=98.3,
            )
        )
        # And it matters: the psychrometric constant is linear in pressure.
        assert measured[0] != pytest.approx(
            price_hourly_rows([self._r()], LAT, LON, elevation=ELEV, tz_offset_h=-4.0)[
                0
            ]
        )
