"""From a sensor group's buffer of readings to one row per clock hour.

``hourly_et`` prices an hour that is handed to it complete: one temperature,
one humidity, one wind speed, one radiation, a day of the year and a place.
Nothing in the integration stores anything of the sort. What it stores is a
buffer of readings, each written when some sensor happened to change, each
carrying whichever fields that sensor reports and no others. This module is
the distance between the two, and none of it is in the paper.

The problems it has to solve, which are the reason it is a module and not a
loop inside the calculation:

* **Readings are sparse and irregular.** A thermometer writes a temperature, a
  minute later an anemometer writes a wind speed, and neither writes the
  other's field. So every field has its own timeline, and an hour's value for a
  field is the time-weighted mean of its own step function over that hour --
  each reading held until the next one replaces it, and the area under that
  staircase divided by the hour.

* **The window rarely starts or ends on the hour.** A zone's window runs from
  the mark it last consumed to now. Charging a clock hour the window only
  half touches as a whole hour would invent evapotranspiration, so every row
  carries ``coverage_h``, the share of its hour the window covers, and the sum
  weights by it.

* **Two clocks.** The buffer timestamps are naive local time, as the recorder
  writes them. A radiation series from the weather service is keyed by unix
  timestamps. Converting between the two needs the offset in force *at that
  hour*, not the offset in force now, because a week-long window can straddle
  the end of summer time. So every row carries its own ``tz_offset_h``.

* **Radiation is a rate, not a level.** The buffer stores it in MJ m-2 per
  *day*, and an hour needs MJ m-2 per hour. Worse, a value held across hours
  cannot be treated as a constant irradiance: a single reading of 20 MJ/day
  taken at noon, held through the night, would have the sun shining at three in
  the morning. What does persist across a few hours is the *state of the sky*,
  so an hour with no sample of its own borrows the clearness -- Rs/Rso -- of
  the nearest hour that measured one, and applies it to its own clear sky.
  Darkness then receives nothing without needing a rule for it. An hour that
  has a sample keeps what it read, always: a measurement is data.

* **Some windows cannot be priced at all**, and the honest answer is then
  ``None``, so the caller keeps the daily equation. Averaging an hourly sum
  with a daily figure would put back the bias the hourly form exists to
  remove.

Dependency-free apart from the standard library and ``const``: it is the part
that can be tested without Home Assistant, and it should stay that way.
"""

import bisect
import datetime
import logging
import math
import time

from . import const
from .hourly_et import (
    clear_sky_radiation_hourly,
    clear_sky_radiation_hourly_eq36,
    cloudiness_factor,
    eto_hourly,
    extraterrestrial_radiation_hourly,
    precipitable_water,
    solar_elevation_sin,
    svp_from_t,
)

_LOGGER = logging.getLogger(__name__)

# The longest window that will be reduced to rows. The reading buffer itself is
# capped at a week, so a longer window means a zone that has not calculated in
# far too long, and summing thousands of hours to decide one irrigation run is
# neither useful nor cheap.
HOURLY_ROWS_MAX_HOURS = 24 * 7

# The fields an hour cannot be priced without. Radiation is not among them
# because it has three other sources (a series from the weather service, an
# estimate from the temperature range, the group's last known value); the
# builder refuses only when none of them can answer.
REQUIRED_FIELDS = (
    const.MAPPING_TEMPERATURE,
    const.MAPPING_HUMIDITY,
    const.MAPPING_WINDSPEED,
)

_HOUR = datetime.timedelta(hours=1)

# The smallest clear sky an hour may have and still be read as a statement
# about the weather, MJ m-2 h-1. Below it the sun is a degree or two above the
# horizon, Rs/Rso is a ratio of two numbers near zero, and a sensor reading
# 0.02 against a modelled 0.01 would call the sky twice as bright as clear.
_MIN_CLEAR_SKY_FOR_RATIO = 0.1

# How far above a modelled clear sky a measurement is still believed. Cloud
# edges really do reflect extra light onto a pyranometer, and calibrations
# really do run a little generous, so a gap hour may be charged slightly more
# than its own clear sky -- but never a multiple of it.
_MAX_CLEARNESS = 1.1


class SystemLocalTime(datetime.tzinfo):
    """The machine's own local time, summer time included.

    Home Assistant hands this integration naive local datetimes and the
    recorder stores them as such, so placing the sun for one of them needs the
    offset the machine was in *at that moment*. ``datetime.astimezone()`` would
    answer for the offset in force now, which is wrong by an hour for every row
    on the far side of a daylight-saving change, and a window may straddle one.

    ``time.mktime`` is what knows: given the wall-clock fields it returns the
    epoch the system would have written, and ``time.localtime`` of that says
    whether summer time was in force. Deliberately built on ``time`` rather
    than ``zoneinfo`` so that the module keeps working wherever the host has no
    tz database, which is the situation on some HAOS images.
    """

    def _is_dst(self, dt) -> bool:
        if dt is None:
            return False
        try:
            stamp = time.mktime(dt.replace(tzinfo=None).timetuple())
        except (OverflowError, ValueError, OSError):
            return False
        return time.localtime(stamp).tm_isdst > 0

    def utcoffset(self, dt):
        """The offset from UTC of ``dt`` read as a local wall clock."""
        seconds = -(time.altzone if self._is_dst(dt) else time.timezone)
        return datetime.timedelta(seconds=seconds)

    def dst(self, dt):
        if not self._is_dst(dt):
            return datetime.timedelta(0)
        return datetime.timedelta(seconds=time.timezone - time.altzone)

    def tzname(self, dt):
        return time.tzname[1 if self._is_dst(dt) else 0]


def _as_float(value):
    """``value`` as a float, or None when it is not a number.

    A buffered reading can hold anything a sensor published, including the
    strings "unknown" and "unavailable", and a single one of those used to take
    a whole calculation down.
    """
    if value is None or isinstance(value, bool):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(number) or math.isinf(number):
        return None
    return number


def _stamp_of(reading):
    """The naive local datetime a reading was written at, or None."""
    raw = (reading or {}).get(const.RETRIEVED_AT)
    if isinstance(raw, datetime.datetime):
        return raw.replace(tzinfo=None) if raw.tzinfo else raw
    if isinstance(raw, str):
        try:
            parsed = datetime.datetime.fromisoformat(raw)
        except ValueError:
            return None
        return parsed.replace(tzinfo=None) if parsed.tzinfo else parsed
    return None


def _effective_series(readings, since, now):
    """``(readings in the window, window start, window end)``.

    The window runs from ``since`` to ``now``. ``since`` may be None, which is
    what a zone that has never consumed anything leaves behind: the window is
    then the whole buffer, starting at its earliest reading.

    ``start`` is the mark itself and not the first reading after it, because
    the window genuinely begins there: a window opening at 05:59 touches the
    05:00 hour, and that hour is charged the one minute of it the window
    covers. Rounding the start up to the first reading would silently drop it.

    ``(None, None, None)`` when there is nothing to work with, which every
    caller reads as "keep the daily equation".
    """
    if not readings:
        return None, None, None
    parsed = []
    for reading in readings:
        stamp = _stamp_of(reading)
        if stamp is not None:
            parsed.append((stamp, reading))
    if not parsed:
        return None, None, None
    parsed.sort(key=lambda pair: pair[0])

    end = now if now is not None else parsed[-1][0]
    start = since if since is not None else parsed[0][0]
    if start >= end:
        return None, None, None

    effective = [pair for pair in parsed if start <= pair[0] <= end]
    if not effective:
        return None, None, None
    return effective, start, end


def _group_by_sensor(effective):
    """``{field: [(stamp, value), ...]}`` from the window's readings.

    One timeline per field, in time order, because a reading carries only the
    fields of the sensor that triggered it: the buffer is not a table of rows
    with a value in every column, it only looks like one.
    """
    grouped = {}
    for stamp, reading in effective:
        for key, raw in (reading or {}).items():
            if key == const.RETRIEVED_AT:
                continue
            value = _as_float(raw)
            if value is None:
                continue
            grouped.setdefault(key, []).append((stamp, value))
    return grouped


def _hour_start_timestamp(hour_start, tz_offset_h=0.0):
    """The unix timestamp of a naive local hour start, at a given offset.

    The one place the two clocks meet. A radiation series is keyed this way, by
    both the row builder and the temperature-range estimate, so that whichever
    of them produced the series the other can read it.
    """
    zone = datetime.timezone(datetime.timedelta(hours=tz_offset_h or 0.0))
    return hour_start.replace(tzinfo=zone).timestamp()


def _offset_at(hour_start, tz, tz_offset_h):
    """The UTC offset in hours in force at a naive local moment."""
    if tz is not None:
        offset = tz.utcoffset(hour_start)
        if offset is not None:
            return offset.total_seconds() / 3600.0
    return tz_offset_h or 0.0


def _naive_local_from_timestamp(stamp, tz=None, tz_offset_h=0.0):
    """A unix timestamp read back as a naive local datetime and its offset.

    Returns ``(naive_local, offset_hours)``. With no zone given this is the
    machine's own, which is how a forecast series stamped with
    ``datetime.timestamp()`` round-trips exactly wherever the tests run.
    """
    utc = datetime.datetime.fromtimestamp(stamp, datetime.timezone.utc).replace(
        tzinfo=None
    )
    if tz is not None:
        # Two passes: the offset is a function of local time, so read it once
        # against the UTC instant to land in the right day, then again against
        # that local time. Only the hour of a daylight-saving change is
        # ambiguous, and nothing here is decided by an hour there.
        guess = utc + (tz.utcoffset(utc) or datetime.timedelta(0))
        offset = tz.utcoffset(guess) or datetime.timedelta(0)
        return utc + offset, offset.total_seconds() / 3600.0
    if tz_offset_h:
        return utc + datetime.timedelta(hours=tz_offset_h), float(tz_offset_h)
    local = datetime.datetime.fromtimestamp(stamp)
    return local, (local - utc).total_seconds() / 3600.0


def _mean_over(samples, start, end, seed=None):
    """Time-weighted mean of a step function over ``[start, end)``.

    ``samples`` is ``[(stamp, value), ...]`` in time order, each value holding
    until the next one replaces it. The mean is the area under that staircase
    divided by the length of the interval, which is the only reading of "the
    value of this field during that hour" that does not depend on how often the
    sensor happened to report.

    ``seed`` is what was in force before the first sample -- the group's last
    known value. Without one, the first sample is held backwards, which assumes
    the field was already at that value rather than inventing a different one.
    """
    if end <= start:
        return None
    if not samples:
        return seed
    span = (end - start).total_seconds()
    stamps = [stamp for stamp, _value in samples]
    index = bisect.bisect_right(stamps, start)
    if index:
        current = samples[index - 1][1]
    elif seed is not None:
        current = seed
    else:
        current = samples[0][1]

    area = 0.0
    cursor = start
    for stamp, value in samples[index:]:
        if stamp >= end:
            break
        if stamp > cursor:
            area += current * (stamp - cursor).total_seconds()
            cursor = stamp
        current = value
    area += current * (end - cursor).total_seconds()
    return area / span


def _has_own_sample(samples, start, end):
    """Whether the interval contains a sample of its own."""
    if not samples:
        return False
    stamps = [stamp for stamp, _value in samples]
    index = bisect.bisect_left(stamps, start)
    return index < len(stamps) and stamps[index] < end


def _row_clear_sky(row, latitude, longitude, elevation):
    """The clear-sky radiation of a row's hour, MJ m-2 h-1.

    The reference every gap hour is measured against: what that hour could have
    received had the sky been clear, from its own solar geometry.

    Eq. 36 rather than Eq. 37 where the row has a barometer reading and a
    vapour pressure of its own. Eq. 37 assumes the sun about 50 degrees up, so
    near dawn and dusk it credits a low sun with far more than it can have
    received, and a gap hour filled against an inflated clear sky is charged
    for sunshine that could not have reached it.
    """
    offset = row.get("tz_offset_h", 0.0)
    ra_hr = max(
        0.0,
        extraterrestrial_radiation_hourly(
            latitude, longitude, row["doy"], row["hour"], offset
        ),
    )
    if ra_hr <= 0:
        return 0.0
    pressure = row.get("pressure_kpa")
    if pressure:
        sin_beta = solar_elevation_sin(
            latitude, longitude, row["doy"], row["hour"], offset
        )
        avp = svp_from_t(row["temperature"]) * row["humidity"] / 100.0
        return max(
            0.0,
            clear_sky_radiation_hourly_eq36(
                ra_hr, sin_beta, pressure, precipitable_water(avp, pressure)
            ),
        )
    return max(0.0, clear_sky_radiation_hourly(ra_hr, elevation))


def _clearness_references(rows, latitude, longitude, elevation):
    """``[(hour_start, clearness)]`` from the hours that measured a lit sky.

    Clearness is Rs/Rso, the measured radiation against the clear sky of that
    same hour. It is the quantity worth carrying across a gap: what persists
    for a few hours is the *state of the sky* -- overcast, hazy, clear -- while
    the irradiance underneath it changes every hour with the sun's height.

    Two hours are refused as references:

    * one whose clear sky is barely above zero, because Rs/Rso is then a ratio
      of two small numbers and says more about the model than about the sky. A
      sensor reading 0.02 against a modelled 0.01 would hand the whole
      afternoon a clearness of 2;
    * nothing else, but the ratio itself is capped a little above 1. A real sky
      does read over a modelled clear one now and then -- cloud-edge reflection,
      a generously calibrated pyranometer -- and that much is believed; twice
      it is not.
    """
    references = []
    for row in rows:
        clear_sky = _row_clear_sky(row, latitude, longitude, elevation)
        if clear_sky < _MIN_CLEAR_SKY_FOR_RATIO:
            continue
        clearness = max(0.0, row["solar_mj_h"]) / clear_sky
        references.append((row["hour_start"], min(_MAX_CLEARNESS, clearness)))
    return references


def _fill_gap_hours(measured, gaps, latitude, longitude, elevation):
    """Fill the hours with no sample of their own from the sky around them.

    The rule that matters is what is *not* done here: an hour that has a sample
    of its own is never touched. A measurement is data. Rewriting a pyranometer
    reading because some other hour of the window went unreported would give a
    cloudy afternoon the shape of a clear one, and would do it in the most
    ordinary case there is -- a sensor polled once an hour and a window that
    opens a second past the hour.

    What a gap hour borrows from its nearest measured neighbour is the sky's
    condition, not its irradiance, and it applies that condition to its own
    clear sky. Darkness therefore receives nothing without being asked to: a
    clearness of anything at all, times a clear sky of zero, is zero.

    When no hour of the window measured a sky worth taking a ratio of, there is
    no condition to carry and the gap hours fall back to being shaped from the
    clear sky alone, exactly as a window with no samples at all is.
    """
    references = _clearness_references(measured, latitude, longitude, elevation)
    if not references:
        _spread_held_radiation(gaps, latitude, longitude, elevation)
        return
    for row in gaps:
        _stamp, clearness = min(
            references,
            key=lambda reference: (abs(reference[0] - row["hour_start"]), reference[0]),
        )
        row["solar_mj_h"] = clearness * _row_clear_sky(
            row, latitude, longitude, elevation
        )


def _spread_held_radiation(rows, latitude, longitude, elevation):
    """Put a held radiation under the sun instead of across it.

    The last resort, for hours that have no measurement of their own and no
    measured sky anywhere near them to borrow a condition from: the group's
    last known value, or a window whose only samples fell in the dark.

    Held as it stands, such a value is a constant irradiance -- the sun shining
    at the same rate at four in the morning as at noon, which is not a small
    error but a different sky. So the energy those hours were holding is kept
    and redistributed in proportion to what each hour's clear sky could have
    delivered. The night's share of a clear sky is zero, so the night receives
    nothing, and the total does not move.
    """
    total_mj = sum(row["solar_mj_h"] * row["coverage_h"] for row in rows)
    weights = [
        _row_clear_sky(row, latitude, longitude, elevation) * row["coverage_h"]
        for row in rows
    ]
    available = sum(weights)
    if available <= 0:
        # Night from end to end. No hour of it received anything, whatever the
        # sensor last said.
        for row in rows:
            row["solar_mj_h"] = 0.0
        return
    for row, weight in zip(rows, weights, strict=True):
        share = total_mj * weight / available
        row["solar_mj_h"] = share / row["coverage_h"] if row["coverage_h"] else 0.0


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
    """One row per clock hour the window touches, or None.

    A row is everything ``hourly_et`` needs for that hour and nothing else::

        {"hour_start": naive local datetime at the top of the hour,
         "hour": midpoint of the clock hour, e.g. 13.5,
         "doy": day of the year,
         "coverage_h": share of the hour the window covers, 0 < x <= 1,
         "tz_offset_h": the offset in force that hour,
         "temperature": degC, "humidity": %, "wind_2m": m/s,
         "solar_mj_h": MJ m-2 h-1,
         "pressure_kpa": kPa, when a barometer reports one}

    None -- keep the daily equation -- when the site has no coordinates, the
    window is empty, backwards or longer than ``HOURLY_ROWS_MAX_HOURS``, a
    required field has no reading anywhere in it and no last known value, or
    the sun of some hour cannot be established.

    ``last_entry`` is the group's last known value per field, and the caller
    passes only the fields that still have a source: a field whose sensor was
    removed keeps its value in the store for ever, and carrying that into every
    later calculation is how a removed rain gauge kept reporting no rain.
    """
    if latitude is None or longitude is None:
        return None

    effective, start, end = _effective_series(readings, since, now)
    if effective is None:
        return None

    span_h = (end - start).total_seconds() / 3600.0
    if span_h <= 0 or span_h > HOURLY_ROWS_MAX_HOURS:
        _LOGGER.debug(
            "A window of %.1f hours is not reduced to hourly rows (limit %s)",
            span_h,
            HOURLY_ROWS_MAX_HOURS,
        )
        return None

    by_field = _group_by_sensor(effective)
    held = {
        key: value
        for key, value in ((last_entry or {}).items())
        if _as_float(value) is not None
    }

    for field in REQUIRED_FIELDS:
        if not by_field.get(field) and _as_float(held.get(field)) is None:
            _LOGGER.debug(
                "No %s anywhere in the window, so it cannot be priced hour by hour",
                field,
            )
            return None

    rows = []
    hour_start = start.replace(minute=0, second=0, microsecond=0)
    while hour_start < end:
        hour_end = hour_start + _HOUR
        covered_start = max(hour_start, start)
        covered_end = min(hour_end, end)
        coverage = (covered_end - covered_start).total_seconds() / 3600.0
        if coverage <= 0:
            hour_start = hour_end
            continue

        row = {
            "hour_start": hour_start,
            "hour": hour_start.hour + 0.5,
            "doy": hour_start.timetuple().tm_yday,
            "coverage_h": coverage,
            "tz_offset_h": _offset_at(hour_start, tz, tz_offset_h),
        }
        for field, key in (
            (const.MAPPING_TEMPERATURE, "temperature"),
            (const.MAPPING_HUMIDITY, "humidity"),
            (const.MAPPING_WINDSPEED, "wind_2m"),
        ):
            row[key] = _mean_over(
                by_field.get(field, []),
                covered_start,
                covered_end,
                _as_float(held.get(field)),
            )
            if row[key] is None:
                return None

        pressure_hpa = _mean_over(
            by_field.get(const.MAPPING_PRESSURE, []),
            covered_start,
            covered_end,
            _as_float(held.get(const.MAPPING_PRESSURE)),
        )
        if pressure_hpa:
            # The store keeps pressure in hPa; the equations want kPa.
            row["pressure_kpa"] = pressure_hpa / 10.0

        rows.append((row, covered_start, covered_end))
        hour_start = hour_end

    if not rows:
        return None

    if not _fill_radiation(
        rows, by_field, held, solar_series, latitude, longitude, elevation or 0.0
    ):
        return None
    return [row for row, _covered_start, _covered_end in rows]


def _fill_radiation(rows, by_field, held, solar_series, latitude, longitude, elevation):
    """Give every row its ``solar_mj_h``, or say the window cannot be priced.

    Three sources, in the order of how much they know about the hour in
    question:

    1. the group's own radiation readings, which measured that sky;
    2. a series keyed by hour, from the weather service's history or from the
       temperature-range estimate -- a gap in it is a reason to keep the daily
       equation rather than to invent an hour;
    3. the group's last known value, which is one number for the whole window
       and is spread over it by the sun's own shape.
    """
    samples = by_field.get(const.MAPPING_SOLRAD) or []
    plain = [row for row, _start, _end in rows]

    if samples:
        measured, gaps = [], []
        for row, covered_start, covered_end in rows:
            # The buffer stores radiation as MJ/m2 per day.
            row["solar_mj_h"] = (
                _mean_over(samples, covered_start, covered_end) or 0.0
            ) / 24.0
            if _has_own_sample(samples, covered_start, covered_end):
                measured.append(row)
            else:
                gaps.append(row)
        if gaps:
            # Only the hours that measured nothing are modelled. The hours that
            # did keep what they read, because the alternative -- reshaping a
            # whole day because one hour of it went unreported -- gives a cloudy
            # afternoon the shape of a clear one, and fires whenever a window
            # opens a second past the hour.
            _fill_gap_hours(measured, gaps, latitude, longitude, elevation)
        return True

    if solar_series:
        for row in plain:
            value = solar_series.get(
                _hour_start_timestamp(row["hour_start"], row["tz_offset_h"])
            )
            if value is None:
                _LOGGER.debug(
                    "The radiation series does not cover %s, so the window keeps "
                    "the daily equation",
                    row["hour_start"],
                )
                return False
            row["solar_mj_h"] = float(value)
        return True

    last_known = _as_float(held.get(const.MAPPING_SOLRAD))
    if last_known is not None:
        for row in plain:
            row["solar_mj_h"] = last_known / 24.0
        _spread_held_radiation(plain, latitude, longitude, elevation)
        return True

    _LOGGER.debug("Nothing reports the sun over the window, so it cannot be priced")
    return False


def _night_cloudiness(rows, latitude, longitude, elevation, tz_offset_h=0.0):
    """What the window's daylight says the sky was like, or None.

    FAO-56 computes the long-wave loss of a night hour from the Rs/Rso measured
    two to three hours before sunset. The window is what this has, so the ratio
    is taken over all of its daylight at once, sum against sum -- which is also
    what the daily equation does for its own long-wave term, so the two forms
    cannot end up disagreeing about the same sky.

    None when the window holds no daylight at all: four hours of a winter
    night have nothing to say about the sky, and the caller then falls back to
    ``NIGHT_CLOUDINESS_FALLBACK``.
    """
    measured = 0.0
    clear_sky = 0.0
    for row in rows:
        ra_hr = max(
            0.0,
            extraterrestrial_radiation_hourly(
                latitude,
                longitude,
                row["doy"],
                row["hour"],
                row.get("tz_offset_h", tz_offset_h),
            ),
        )
        rso = clear_sky_radiation_hourly(ra_hr, elevation)
        if rso > 0:
            clear_sky += rso
            measured += row.get("solar_mj_h", 0.0)
    return cloudiness_factor(measured, clear_sky)


def price_hourly_rows(rows, latitude, longitude, elevation=0.0, tz_offset_h=0.0):
    """The millimetres each row evaporated, weighted by its coverage.

    A partial hour is charged its share and no more, which is what keeps the
    sum equal to the window rather than to the clock hours it overlaps.
    """
    if not rows:
        return []
    cloudiness = _night_cloudiness(
        rows, latitude, longitude, elevation or 0.0, tz_offset_h
    )
    priced = []
    for row in rows:
        millimetres = eto_hourly(
            t_c=row["temperature"],
            rh_pct=row["humidity"],
            wind_2m=row["wind_2m"],
            solar_rad_hr=row.get("solar_mj_h", 0.0),
            latitude_deg=latitude,
            longitude_deg=longitude,
            doy=row["doy"],
            hour_mid=row["hour"],
            tz_offset_h=row.get("tz_offset_h", tz_offset_h),
            elevation_m=elevation or 0.0,
            pressure_kpa=row.get("pressure_kpa"),
            cloudiness=cloudiness,
        )
        priced.append(millimetres * row.get("coverage_h", 1.0))
    return priced


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
    """``(millimetres, hours)`` over the window, or None.

    The millimetres already cover the whole window, so the caller must not
    scale them by the interval again the way the daily figure is scaled. The
    hours are returned because the caller needs them: to report the window, and
    to turn the sum into a rate per day when forecast days are averaged in.
    """
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
    hours = sum(row["coverage_h"] for row in rows)
    if hours <= 0:
        return None
    try:
        priced = price_hourly_rows(
            rows, latitude, longitude, elevation or 0.0, tz_offset_h
        )
    except (ArithmeticError, TypeError, ValueError):
        _LOGGER.debug("An hour of the window could not be priced", exc_info=True)
        return None
    if any(value is None for value in priced):
        return None
    return sum(priced), hours


def forecast_rows_by_day(series, tz=None, tz_offset_h=0.0, today=None):
    """``{date: [row, ...]}`` for each whole day of a forecast still to come.

    The series is what a weather client returns for the coming hours: a list of
    ``{"ts": unix timestamp, "temperature", "humidity", "wind", "solar_mj_h",
    "pressure_hpa"}``. Each entry is a whole hour, so every row's coverage is 1.

    Only days that are both *after today* and *complete* are returned. Today's
    remaining hours belong to today's own balance -- they are part of the
    measured window, not of a day to come -- and a day the series only half
    covers is not a day: averaging it in as one would quietly halve it.

    ``{}`` rather than a partial answer when any entry is malformed. A forecast
    read wrong is worse than a forecast not read: the caller falls back to the
    daily equation, which is a known quantity.
    """
    if not series:
        return {}
    today = today or datetime.date.today()

    by_day = {}
    for entry in series:
        try:
            stamp, offset = _naive_local_from_timestamp(
                float(entry["ts"]), tz, tz_offset_h
            )
            hour_start = stamp.replace(minute=0, second=0, microsecond=0)
            row = {
                "hour_start": hour_start,
                "hour": hour_start.hour + 0.5,
                "doy": hour_start.timetuple().tm_yday,
                "coverage_h": 1.0,
                "tz_offset_h": offset,
                "temperature": float(entry["temperature"]),
                "humidity": float(entry["humidity"]),
                "wind_2m": float(entry["wind"]),
                "solar_mj_h": float(entry["solar_mj_h"]),
            }
            pressure_hpa = entry.get("pressure_hpa")
            if pressure_hpa is not None:
                row["pressure_kpa"] = float(pressure_hpa) / 10.0
        except (AttributeError, KeyError, OSError, TypeError, ValueError):
            _LOGGER.debug("The hourly forecast could not be read", exc_info=True)
            return {}
        by_day.setdefault(hour_start.date(), []).append(row)

    return {
        day: sorted(rows, key=lambda row: row["hour_start"])
        for day, rows in by_day.items()
        if day > today and len(rows) == 24
    }


def forecast_eto_by_day(
    series,
    latitude=None,
    longitude=None,
    elevation=0.0,
    tz=None,
    tz_offset_h=0.0,
    today=None,
):
    """``{date: millimetres}`` for each whole forecast day, priced hour by hour.

    A zone that looks ahead waters on the mean of today and the days to come.
    That average is only meaningful if every term is the same kind of number,
    so each day here is its own twenty-four hours summed with the same equation
    as the measured window, and never a daily figure standing in.
    """
    if latitude is None or longitude is None:
        return {}
    by_day = forecast_rows_by_day(series, tz, tz_offset_h, today)
    priced = {}
    for day, rows in by_day.items():
        try:
            priced[day] = sum(
                price_hourly_rows(
                    rows, latitude, longitude, elevation or 0.0, tz_offset_h
                )
            )
        except (ArithmeticError, TypeError, ValueError):
            _LOGGER.debug("Forecast day %s could not be priced", day, exc_info=True)
    return priced
