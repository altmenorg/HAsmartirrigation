"""The sun of each hour, estimated, for an installation that measures none.

The hourly equation needs the radiation of each hour. Three sources can give
it: a pyranometer, a lux sensor, or the weather service's own hourly history.
An installation with none of them fell back to the daily equation, which is the
last thing keeping the hourly calculation from working everywhere.

What is available in that case is what the daily equation already uses: the
day's temperature range. FAO-56 Eq. 50 turns it into the day's radiation,

    Rs = krs * sqrt(Tmax - Tmin) * Ra

capped at the clear-sky radiation, since no day can beat a clear sky. That is a
daily total, and this module spreads it over the hours in proportion to the
extraterrestrial radiation each hour receives, which is the shape of the sun's
own path: the hours around noon take most of it and the night takes none.

Two things it is careful about.

* **The daily total is unchanged.** Summed back over a day, the estimate equals
  what the daily equation would have used, so switching a zone to hourly does
  not change how much sun it is credited with. What changes is *when*, and that
  is the whole point: evapotranspiration is not linear in its terms, so pricing
  a cool humid night and a hot dry afternoon separately does not give the same
  answer as pricing their averages, and the separate answer is the right one.
* **It is an estimate and says so.** The trace records that the radiation was
  estimated, exactly as the daily path does, because a zone whose sun is
  guessed from a thermometer deserves to be read differently from one with a
  pyranometer on the roof.

The window it works over is the zone's own, and the temperature range it reads
is the range of that window, day by day. A window of a few hours therefore has
a narrower range than the day really had and the estimate is poorer; that is
equally true of the daily equation, which reads the same aggregate, so the two
forms stay consistent with each other.
"""

import datetime
import logging
import math

from . import const
from .hourly_et import extraterrestrial_radiation_hourly
from .hourly_rows import (
    _effective_series,
    _group_by_sensor,
    _hour_start_timestamp,
)

_LOGGER = logging.getLogger(__name__)

# Adjustment coefficient of FAO-56 Eq. 50: 0.16 for an interior location, 0.19
# for a coastal one, where a sea breeze brings air of a different origin and
# narrows the day's range for the same amount of sun. The engine already asks
# this question ("coastal"), so the answer is reused rather than asked twice.
KRS_INTERIOR = 0.16
KRS_COASTAL = 0.19


def solar_radiation_from_temperature_range(
    ra_day_mj: float,
    temp_min_c: float,
    temp_max_c: float,
    elevation_m: float = 0.0,
    coastal: bool = False,
) -> float:
    """A day's solar radiation from its temperature range (FAO-56 Eq. 50).

    In MJ/m2, capped at the clear-sky radiation for the site (Eq. 37), which is
    what the daily path does through the same equation.
    """
    if ra_day_mj <= 0:
        return 0.0
    spread = max(0.0, (temp_max_c or 0.0) - (temp_min_c or 0.0))
    krs = KRS_COASTAL if coastal else KRS_INTERIOR
    estimated = krs * math.sqrt(spread) * ra_day_mj
    clear_sky = (0.75 + 2e-5 * (elevation_m or 0.0)) * ra_day_mj
    return min(estimated, clear_sky)


def _day_ranges(samples):
    """``{date: (min, max)}`` of the temperatures read on each local day."""
    ranges = {}
    for stamp, value in samples:
        if stamp is None:
            continue
        try:
            reading = float(value)
        except (TypeError, ValueError):
            continue
        day = stamp.date()
        low, high = ranges.get(day, (reading, reading))
        ranges[day] = (min(low, reading), max(high, reading))
    return ranges


def estimated_solar_series(
    readings,
    since,
    *,
    now,
    latitude,
    longitude,
    elevation=0.0,
    tz=None,
    tz_offset_h=0.0,
    coastal=False,
):
    """The sun of each hour of the window, estimated, or None.

    Keyed by the hour's start as a unix timestamp and valued in MJ/m2, which is
    the shape a radiation series has everywhere else here, so the row builder
    takes it without knowing where it came from.

    None when there is nothing to estimate from: no coordinates, no window, or
    no temperature readings in it.
    """
    if latitude is None or longitude is None:
        return None
    effective, start, end = _effective_series(readings, since, now)
    if effective is None:
        return None

    temperatures = _group_by_sensor(effective).get(const.MAPPING_TEMPERATURE)
    if not temperatures:
        return None
    ranges = _day_ranges(temperatures)
    if not ranges:
        return None

    # Every clock hour the window touches, with the share of the sky's own
    # potential it holds. The hours are grouped by the local day they fall in,
    # because that is the day whose temperature range pays for them.
    potential = {}
    hour_start = start.replace(minute=0, second=0, microsecond=0)
    step = datetime.timedelta(hours=1)
    while hour_start < end:
        offset = tz_offset_h
        if tz is not None:
            utc_offset = tz.utcoffset(hour_start)
            if utc_offset is not None:
                offset = utc_offset.total_seconds() / 3600.0
        ra_hour = max(
            0.0,
            extraterrestrial_radiation_hourly(
                latitude,
                longitude,
                hour_start.timetuple().tm_yday,
                hour_start.hour + 0.5,
                offset,
            ),
        )
        potential.setdefault(hour_start.date(), []).append(
            (hour_start, offset, ra_hour)
        )
        hour_start += step

    series = {}
    for day, hours in potential.items():
        ra_day = sum(ra_hour for _stamp, _offset, ra_hour in hours)
        if ra_day <= 0:
            # A polar night, or a window that only touches the small hours: no
            # sun to share out, which is the right answer rather than no answer.
            for stamp, offset, _ra_hour in hours:
                series[_hour_start_timestamp(stamp, offset)] = 0.0
            continue
        temp_min, temp_max = ranges.get(day, (None, None))
        if temp_min is None:
            # A day of the window with no temperature of its own: the range of
            # the whole window is the closest honest stand-in.
            lows = [low for low, _high in ranges.values()]
            highs = [high for _low, high in ranges.values()]
            temp_min, temp_max = min(lows), max(highs)
        rs_day = solar_radiation_from_temperature_range(
            ra_day, temp_min, temp_max, elevation or 0.0, coastal
        )
        for stamp, offset, ra_hour in hours:
            series[_hour_start_timestamp(stamp, offset)] = rs_day * ra_hour / ra_day

    _LOGGER.debug(
        "Estimated the sun of %d hour(s) from the temperature range of %d day(s)",
        len(series),
        len(potential),
    )
    return series or None
