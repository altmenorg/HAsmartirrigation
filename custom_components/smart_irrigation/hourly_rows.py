"""Reduce a calculation window to hourly FAO-56 rows, and price them.

The daily Penman-Monteith equation takes a day's weather: its maximum and
minimum temperature, its mean wind, its total radiation. Fed a shorter window,
or a window whose readings are spread unevenly through the day, it prices a day
that did not happen and the interval scaling then shares that out. The hourly
form (FAO-56 Eq. 53, see ``hourly_et``) prices each hour from that hour's own
weather, so summing it over the window measures the window.

This turns the buffered readings of one zone's window into one row per clock
hour, then prices each row. It is used only when the hourly calculation is
switched on, and it returns None whenever the window will not support hourly
rows, so the caller keeps the daily equation rather than summing a fabricated
series.

Adapted from JustChr's fork, Irrigation Plus
(https://github.com/JustChr/HAsmartirrigation, ``weather_aggregate.py`` and
``et_estimate.py``), MIT licensed like this integration. The window selection
is rewritten onto this integration's own buffer; the reduction to hourly rows
and the clearness-ratio solar hold follow his, including the measurements they
were chosen on.
"""

import bisect
import datetime

from . import const
from .hourly_et import (
    atm_pressure,
    clear_sky_radiation_hourly_eq36,
    eto_hourly,
    extraterrestrial_radiation_hourly,
    solar_elevation_sin,
    svp_from_t,
)

# Longest window reduced to hourly rows. Readings are capped at a week, so
# beyond it most of the window would be carried forward from one stale sample,
# and summing a fabricated series is worse than the daily form.
HOURLY_ROWS_MAX_HOURS = 24 * 7

# Fields an hourly row cannot be built without. Pressure is optional: the
# equation derives it from elevation when there is no barometer.
HOURLY_ROW_REQUIRED = (
    const.MAPPING_TEMPERATURE,
    const.MAPPING_HUMIDITY,
    const.MAPPING_WINDSPEED,
    const.MAPPING_SOLRAD,
)

# Buffered solar radiation is MJ/m2/day; the hourly equation wants MJ/m2/h.
# 1 W/m2 = 0.0864 MJ/m2/day = 0.0036 MJ/m2/h, so the ratio is exactly 24.
# Omitting it hands the equation 24 times the sun, and the window's ET with it.
MJ_DAY_TO_MJ_HOUR = 1.0 / 24.0

# Buffered pressure is absolute hPa; FAO-56 takes kPa.
HPA_TO_KPA = 1.0 / 10.0

# Smallest clear-sky radiation [MJ/m2/h] a clearness ratio may be divided by:
# near sunrise Rso is nearly zero and sensor noise would become a huge ratio.
RSO_RATIO_FLOOR = 0.02

# Ceiling on a held clearness ratio. Broken-cloud edges can briefly push a
# pyranometer above clear sky, so there is headroom, but a physically
# impossible reading must not be projected across a whole gap.
SOLAR_CLEAR_SKY_TOLERANCE = 1.3


class SystemLocalTime(datetime.tzinfo):
    """The zone the buffer's naive stamps were written in: the system's own.

    Readings are stamped with ``datetime.now()``, which is the operating
    system's local time, not Home Assistant's. The two agree on Home Assistant
    OS and can disagree in a container started without a timezone, where the
    system runs on UTC while Home Assistant is set to the site. The daily
    equation never noticed, because it does not place the sun. The hourly one
    does, and reading a UTC stamp in the site's zone would put the sun one or
    two hours off. So each stamp is read in the zone that wrote it, one stamp at
    a time, daylight saving included. An ambiguous autumn hour resolves to its
    first occurrence, as a naive stamp cannot say which one it was.
    """

    def utcoffset(self, dt):
        if dt is None:
            return None
        naive = dt.replace(tzinfo=None)
        utc = datetime.datetime.fromtimestamp(naive.timestamp(), datetime.UTC)
        return datetime.timedelta(
            seconds=round((naive - utc.replace(tzinfo=None)).total_seconds())
        )

    def dst(self, dt):
        return None

    def tzname(self, dt):
        return None


def _parse(value):
    """A stored timestamp as a naive datetime, or None when it cannot be read."""
    if isinstance(value, datetime.datetime):
        return value.replace(tzinfo=None) if value.tzinfo else value
    if isinstance(value, str):
        try:
            parsed = datetime.datetime.fromisoformat(value)
        except ValueError:
            return None
        return parsed.replace(tzinfo=None) if parsed.tzinfo else parsed
    return None


def _effective_series(readings, since, now):
    """``(rows, start, end)`` for a zone's window, or ``(None, None, None)``.

    The window is what arrived after the zone's own mark, as everywhere else in
    the calculation. Each field's last value at or before the mark is carried in
    as one row stamped at the mark, per field rather than as the single newest
    row, because a sensor writes one field per state change and the newest row
    only holds whichever field moved last.

    Start is the mark; a zone that has never consumed starts at its earliest
    reading. End is ``now``, not the last reading: solar radiation that produced
    no rows overnight has not stopped existing, it is dark.
    """
    boundary = {}
    boundary_seen = False
    window = []
    for record in readings or []:
        if not isinstance(record, dict):
            continue
        stamp = _parse(record.get(const.RETRIEVED_AT))
        if since is not None and stamp is not None and stamp <= since:
            boundary_seen = True
            for key, value in record.items():
                if key == const.RETRIEVED_AT or value is None:
                    continue
                known = boundary.get(key)
                if known is None or stamp >= known[0]:
                    boundary[key] = (stamp, value)
        else:
            window.append(record)

    effective = []
    if boundary_seen and boundary:
        effective.append(
            {
                **{key: value for key, (_, value) in boundary.items()},
                const.RETRIEVED_AT: since,
            }
        )
    effective.extend(window)
    if not effective:
        return None, None, None

    stamps = [t for r in effective if (t := _parse(r.get(const.RETRIEVED_AT)))]
    start = since if since is not None else (min(stamps) if stamps else None)
    end = max([now, *stamps]) if stamps else now
    if start is None or end <= start:
        return None, None, None
    return effective, start, end


def _group_by_sensor(readings):
    """``{field: [(stamp, value), ...]}``, each value with its OWN stamp.

    A shared list of stamps does not line up with sparse rows, and the hold
    below needs to know when each value was read.
    """
    by_sensor = {}
    for record in readings:
        stamp = _parse(record.get(const.RETRIEVED_AT))
        for key, value in record.items():
            if value is None or key == const.RETRIEVED_AT:
                continue
            by_sensor.setdefault(key, []).append((stamp, value))
    return by_sensor


def _clamped_samples(samples, start, end):
    """Samples clamped into the window, or None if any has no stamp.

    A value with no time cannot be placed on a timeline, which is the signal to
    keep the daily equation.
    """
    out = []
    for stamp, value in samples:
        if stamp is None:
            return None
        try:
            out.append((min(max(stamp, start), end), float(value)))
        except (TypeError, ValueError):
            return None
    return out


def _hold_integral_table(samples, start, end):
    """Cumulative zero-order-hold integral of a level field over the window.

    The first sample is held back to the window start and the last forward to
    the end, so a field with no reading in an hour still reads its last value.
    Kept as a cumulative table so any sub-interval is two lookups.
    """
    points = [start]
    values = []
    previous = samples[0][1]
    for stamp, value in samples:
        if stamp > points[-1]:
            points.append(stamp)
            values.append(previous)
        previous = value
    if end > points[-1]:
        points.append(end)
        values.append(previous)
    cumulative = [0.0]
    for i, value in enumerate(values):
        cumulative.append(
            cumulative[-1] + value * (points[i + 1] - points[i]).total_seconds()
        )
    return points, values, cumulative


def _hold_integral_upto(points, values, cumulative, moment):
    """Integral of the held step function from the window start to ``moment``."""
    if moment <= points[0]:
        return 0.0
    if moment >= points[-1]:
        return cumulative[-1]
    i = bisect.bisect_right(points, moment) - 1
    return cumulative[i] + values[i] * (moment - points[i]).total_seconds()


def _hourly_mean(table, a, b):
    """Mean of a held field over ``[a, b]``, or None for an empty span."""
    span = (b - a).total_seconds()
    if span <= 0:
        return None
    return (_hold_integral_upto(*table, b) - _hold_integral_upto(*table, a)) / span


def _row_rso_eq36(row, hour, doy, latitude, longitude, elevation, tz_offset_h):
    """Clear-sky radiation [MJ/m2/h] for ``hour``, from this row's own air state.

    Rso is the denominator of the clearness ratio, so the row's own UTC offset
    wins over the window-wide one: an hour of solar-time error here moves the
    refilled radiation by +23.5% / -16.0%.
    """
    tz_offset_h = row.get("tz_offset_h", tz_offset_h)
    ra = extraterrestrial_radiation_hourly(latitude, longitude, doy, hour, tz_offset_h)
    if ra <= 0:
        return 0.0
    sin_beta = solar_elevation_sin(latitude, longitude, doy, hour, tz_offset_h)
    pressure_kpa = row.get("pressure_kpa")
    if pressure_kpa is None:
        pressure_kpa = atm_pressure(elevation)
    avp = svp_from_t(row["temperature"]) * max(0.0, min(100.0, row["humidity"])) / 100.0
    return clear_sky_radiation_hourly_eq36(ra, sin_beta, pressure_kpa, avp)


def _ratio_hold_solar(rows, solar_samples, latitude, longitude, elevation, tz_offset_h):
    """Refill the solar of hours that saw no reading from a held clearness ratio.

    Holding the last absolute value is right across a night, when radiation sits
    at zero and emits nothing, and wrong across an outage, where the sun moved
    and nobody looked: a flat hold charges every silent hour of a midday outage
    full noon sun. JustChr measured it on nine recorded days across six gap
    shapes: a flat hold lands 77.4% from the dense truth on average, a held
    clearness ratio 15.7%.

    So carry ``Rs / Rso`` and let each gap hour supply its own Rso: the sky
    condition persists, the solar geometry does not. A midday ratio carried into
    the night lands at zero because Rso is zero there, so the night needs no
    special case. Hours that have a reading are left exactly as they are.
    """
    if latitude is None or longitude is None:
        return
    newest = {}
    for stamp, value in solar_samples:
        hour_start = stamp.replace(minute=0, second=0, microsecond=0)
        current = newest.get(hour_start)
        if current is None or stamp >= current[0]:
            newest[hour_start] = (stamp, float(value))

    measured = {}
    for row in rows:
        sample = newest.get(row["hour_start"])
        if sample is None:
            continue
        stamp, value = sample
        rso = _row_rso_eq36(
            row,
            stamp.hour + stamp.minute / 60 + stamp.second / 3600,
            stamp.timetuple().tm_yday,
            latitude,
            longitude,
            elevation,
            tz_offset_h,
        )
        if rso > RSO_RATIO_FLOOR:
            measured[row["hour_start"]] = min(
                max(0.0, value * MJ_DAY_TO_MJ_HOUR / rso),
                SOLAR_CLEAR_SKY_TOLERANCE,
            )

    if not measured:
        # Nothing bright enough to measure a ratio from: leave the flat hold.
        return

    held = []
    current = None
    for row in rows:
        if row["hour_start"] in measured:
            current = measured[row["hour_start"]]
        held.append(current)
    first = next(ratio for ratio in held if ratio is not None)

    for row, ratio in zip(rows, held, strict=True):
        if row["hour_start"] in newest:
            continue
        row["solar_mj_h"] = (first if ratio is None else ratio) * _row_rso_eq36(
            row,
            row["hour"],
            row["doy"],
            latitude,
            longitude,
            elevation,
            tz_offset_h,
        )


def _hour_start_timestamp(hour_start, offset_h):
    """A row's local hour start as a unix timestamp.

    The buffer's stamps are naive local time and a solar series is stamped in
    UTC, so the two only meet through the offset that hour was written in,
    daylight saving included.
    """
    zone = datetime.timezone(datetime.timedelta(hours=offset_h))
    return hour_start.replace(tzinfo=zone).timestamp()


def build_hourly_rows(
    readings,
    since,
    *,
    now,
    last_entry=None,
    latitude=None,
    longitude=None,
    elevation=0.0,
    tz_offset_h=0.0,
    tz=None,
    solar_series=None,
):
    """One FAO-56 row per clock hour the window touches, or None.

    Each row carries ``hour`` (the local clock midpoint), ``doy``,
    ``temperature``, ``humidity``, ``wind_2m``, ``solar_mj_h``, optionally
    ``pressure_kpa``, and ``coverage_h``, the share of the hour the window
    covers, so the partial hours at its ends are charged their share.

    ``tz_offset_h`` is the UTC offset the naive buffer stamps are in, used for
    any row that does not resolve its own from ``tz``.

    ``last_entry`` supplies a field the window has no reading for at all, held
    from the window start. The caller passes only fields that still have a
    source: a value left behind by a removed source must never price an hour.

    Returns None for no readings, an empty or over-long window, or a required
    field missing everywhere; the caller then keeps the daily equation.
    """
    effective, start, end = _effective_series(readings, since, now)
    if effective is None:
        return None
    if (end - start).total_seconds() > HOURLY_ROWS_MAX_HOURS * 3600:
        return None

    by_sensor = _group_by_sensor(effective)
    tables = {}
    solar_samples = None
    for key in (*HOURLY_ROW_REQUIRED, const.MAPPING_PRESSURE):
        samples = by_sensor.get(key)
        if samples:
            samples = _clamped_samples(samples, start, end)
        elif last_entry and last_entry.get(key) is not None:
            try:
                samples = [(start, float(last_entry[key]))]
            except (TypeError, ValueError):
                samples = None
        else:
            samples = None
        if samples is None:
            if key == const.MAPPING_SOLRAD and solar_series:
                # No radiation sensor, but the weather service keeps the sun of
                # every hour: that is a measurement of the hour, not the day's
                # temperatures guessing at it.
                continue
            if key in HOURLY_ROW_REQUIRED:
                return None
            continue
        if key == const.MAPPING_SOLRAD:
            solar_samples = samples
        tables[key] = _hold_integral_table(samples, start, end)

    rows = []
    hour_start = start.replace(minute=0, second=0, microsecond=0)
    step = datetime.timedelta(hours=1)
    while hour_start < end:
        a = max(hour_start, start)
        b = min(hour_start + step, end)
        coverage = (b - a).total_seconds() / 3600
        if coverage <= 0:
            return None
        row = {
            "hour_start": hour_start,
            # The midpoint of the whole clock hour, even for a partial one: the
            # extraterrestrial radiation is integrated over the hour's solar
            # angles, and the partial share is charged through coverage_h.
            "hour": hour_start.hour + 0.5,
            "doy": hour_start.timetuple().tm_yday,
            "coverage_h": coverage,
        }
        if tz is not None:
            # From this row's own stamp: a week-long window can straddle a
            # daylight-saving change, and the hours on either side of it are in
            # different offsets.
            offset = tz.utcoffset(hour_start)
            if offset is not None:
                row["tz_offset_h"] = offset.total_seconds() / 3600.0
        means = {key: _hourly_mean(table, a, b) for key, table in tables.items()}
        if any(value is None for value in means.values()):
            return None
        row["temperature"] = means[const.MAPPING_TEMPERATURE]
        row["humidity"] = means[const.MAPPING_HUMIDITY]
        # Handed to FAO-56 as u2 exactly as the daily path does, so the two
        # forms cannot disagree about the anemometer height.
        row["wind_2m"] = means[const.MAPPING_WINDSPEED]
        if const.MAPPING_SOLRAD in means:
            row["solar_mj_h"] = means[const.MAPPING_SOLRAD] * MJ_DAY_TO_MJ_HOUR
        else:
            sun = solar_series.get(
                _hour_start_timestamp(hour_start, row.get("tz_offset_h", tz_offset_h))
            )
            if sun is None:
                # An hour the series does not cover cannot be priced, and
                # inventing it would be exactly the guess this avoids.
                return None
            row["solar_mj_h"] = sun
        if const.MAPPING_PRESSURE in means:
            row["pressure_kpa"] = means[const.MAPPING_PRESSURE] * HPA_TO_KPA
        rows.append(row)
        hour_start += step

    if not rows:
        return None
    if solar_samples:
        _ratio_hold_solar(
            rows, solar_samples, latitude, longitude, elevation or 0.0, tz_offset_h
        )
    return rows


def price_hourly_rows(rows, latitude, longitude, elevation=0.0, tz_offset_h=0.0):
    """Hourly FAO-56 ETo [mm] of each row, weighted by the share it covers.

    A row's own ``tz_offset_h`` wins over the argument.
    """
    series = []
    for row in rows:
        eto = eto_hourly(
            t_c=row["temperature"],
            rh_pct=row["humidity"],
            wind_2m=row["wind_2m"],
            solar_rad_hr=row["solar_mj_h"],
            latitude_deg=latitude,
            longitude_deg=longitude,
            doy=row["doy"],
            hour_mid=row["hour"],
            tz_offset_h=row.get("tz_offset_h", tz_offset_h),
            elevation_m=elevation,
            pressure_kpa=row.get("pressure_kpa"),
        )
        # A row that does not say otherwise covers its whole hour.
        series.append(eto * row.get("coverage_h", 1.0))
    return series


def summed_hourly_eto(
    readings,
    since,
    *,
    now,
    last_entry=None,
    latitude=None,
    longitude=None,
    elevation=0.0,
    tz_offset_h=0.0,
    tz=None,
    solar_series=None,
):
    """``(total_mm, hours)`` of reference ET over the window, or None.

    None whenever the window will not reduce to hourly rows, or when the site
    has no coordinates: the hourly equation needs the sun's position.

    ``solar_series`` stands in for a radiation sensor the sensor group does not
    have: the sun of each hour in MJ/m2, keyed by the hour's start as a unix
    timestamp.
    """
    if latitude is None or longitude is None:
        return None
    rows = build_hourly_rows(
        readings,
        since,
        now=now,
        last_entry=last_entry,
        latitude=latitude,
        longitude=longitude,
        elevation=elevation,
        tz_offset_h=tz_offset_h,
        tz=tz,
        solar_series=solar_series,
    )
    if not rows:
        return None
    series = price_hourly_rows(rows, latitude, longitude, elevation, tz_offset_h)
    return sum(series), sum(row.get("coverage_h", 1.0) for row in rows)


def forecast_rows_by_day(series, tz=None, tz_offset_h=0.0, today=None):
    """Hourly FAO-56 rows of each forecast day, keyed by that day's date.

    ``series`` is what a weather client returns for the hours to come: one
    entry per hour carrying ``ts`` (the hour's start, unix time) and the fields
    a row is priced from. Each hour is placed on the site's own clock, so a day
    is the day the site lives, and only whole days after ``today`` are kept: a
    day the forecast starts in the middle of would read as a short day and
    understate its evaporation.
    """
    if not series:
        return {}
    today = today or datetime.datetime.now().date()
    by_day = {}
    for entry in series:
        try:
            hour_start = datetime.datetime.fromtimestamp(float(entry["ts"]))
            row = {
                "hour_start": hour_start,
                "hour": hour_start.hour + 0.5,
                "doy": hour_start.timetuple().tm_yday,
                "coverage_h": 1.0,
                "temperature": float(entry["temperature"]),
                "humidity": float(entry["humidity"]),
                "wind_2m": float(entry["wind"]),
                "solar_mj_h": float(entry["solar_mj_h"]),
            }
        except (KeyError, TypeError, ValueError, OSError, OverflowError):
            return {}
        if entry.get("pressure_hpa") is not None:
            row["pressure_kpa"] = float(entry["pressure_hpa"]) * HPA_TO_KPA
        if tz is not None:
            offset = tz.utcoffset(hour_start)
            if offset is not None:
                row["tz_offset_h"] = offset.total_seconds() / 3600.0
        else:
            row["tz_offset_h"] = tz_offset_h
        day = hour_start.date()
        if day <= today:
            continue
        by_day.setdefault(day, []).append(row)
    # A day the series does not cover from end to end is not a day.
    return {day: rows for day, rows in by_day.items() if len(rows) == 24}


def forecast_eto_by_day(
    series, latitude, longitude, elevation=0.0, tz=None, tz_offset_h=0.0, today=None
):
    """Reference ET of each forecast day in mm, summed hour by hour."""
    rows_by_day = forecast_rows_by_day(
        series, tz=tz, tz_offset_h=tz_offset_h, today=today
    )
    return {
        day: sum(price_hourly_rows(rows, latitude, longitude, elevation, tz_offset_h))
        for day, rows in sorted(rows_by_day.items())
    }
