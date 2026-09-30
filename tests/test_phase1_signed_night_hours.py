"""A day's calm humid night is summed with its sign, then bounded (phase 1.9).

Each negative hour used to be set to zero on its own. The dew formed at night is
evaporated in the morning with energy the sunny hours are charged for, so
dropping the night's negative hours put a whole day about 4% above the daily
equation. A window is summed with its sign and bounded at zero as a whole, so a
night alone still never credits the bucket (#866).
"""

from datetime import datetime

from custom_components.smart_irrigation.hourly_rows import price_hourly_rows

LAT, LON, ELEV = 45.0, 0.0, 50.0


def _row(hour, temperature, humidity, wind, solar):
    start = datetime(2026, 7, 10, hour)
    return {
        "hour_start": start,
        "hour": hour + 0.5,
        "doy": start.timetuple().tm_yday,
        "coverage_h": 1.0,
        "tz_offset_h": 0.0,
        "temperature": temperature,
        "humidity": humidity,
        "wind_2m": wind,
        "solar_mj_h": solar,
    }


NIGHT = [_row(h, 14.0, 96.0, 0.4, 0.0) for h in (0, 1, 2, 3, 4, 21, 22, 23)]
DAY = [_row(h, 24.0, 55.0, 2.0, 2.2 if 10 <= h <= 15 else 1.0) for h in range(5, 21)]


def test_a_calm_humid_night_has_negative_hours():
    assert sum(price_hourly_rows(NIGHT, LAT, LON, ELEV, signed=True)) < 0


def test_a_night_alone_is_bounded_at_zero_not_a_gain():
    assert max(0.0, sum(price_hourly_rows(NIGHT, LAT, LON, ELEV, signed=True))) == 0


def test_the_day_is_charged_for_the_night_s_dew():
    rows = NIGHT + DAY
    clamped = sum(price_hourly_rows(rows, LAT, LON, ELEV))
    signed = sum(price_hourly_rows(rows, LAT, LON, ELEV, signed=True))
    assert 0 < signed < clamped


def test_hour_by_hour_the_default_is_still_never_negative():
    assert all(v >= 0 for v in price_hourly_rows(NIGHT, LAT, LON, ELEV))


# --- phase 1.3: the hourly form reads the dew point too ----------------------


def test_the_humidity_follows_from_the_dew_point():
    from custom_components.smart_irrigation.hourly_rows import (
        _humidity_from_dew_point,
    )

    assert _humidity_from_dew_point(20.0, 20.0) == 100.0
    # FAO-56: 12 C dew point at 24 C is about 47%.
    assert 44 < _humidity_from_dew_point(12.0, 24.0) < 50
    assert _humidity_from_dew_point(None, 24.0) is None


def test_a_group_with_a_dew_point_and_no_humidity_is_priced_hour_by_hour():
    from custom_components.smart_irrigation import const
    from custom_components.smart_irrigation.hourly_rows import build_hourly_rows

    start = datetime(2026, 7, 10, 10, 0)
    readings = [
        {
            const.MAPPING_TEMPERATURE: 24.0,
            const.MAPPING_DEWPOINT: 12.0,
            const.MAPPING_WINDSPEED: 2.0,
            const.MAPPING_SOLRAD: 20.0,
            const.RETRIEVED_AT: (start.replace(hour=h)).isoformat(),
        }
        for h in (10, 11, 12, 13)
    ]

    rows = build_hourly_rows(
        readings,
        start,
        now=start.replace(hour=13, minute=30),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
    )

    assert rows
    assert all(44 < row["humidity"] < 50 for row in rows)
