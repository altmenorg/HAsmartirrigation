"""The water balance of a window, replayed hour by hour.

A calculation covers a window: from the zone's previous calculation to now. It
used to add all the window's rain to the bucket at once and then drain the
result over the whole window. Drainage depends on how full the soil is, so the
order matters: 2 mm that fell an hour ago were drained as if they had been in
the soil since the window opened, 17 hours too long for a rain at 4 PM after a
calculation at 11 PM the night before (#783).

Here the window is cut into hours. Each hour gets the evapotranspiration of
that hour (the hourly equation's own figure when it ran, else in proportion to
the sun), the rain that fell in it, then the drainage of that hour,
with the exact solution of the drainage law the single step already used. The
totals do not change: the same evapotranspiration and the same rain are
booked, only when they happen does.

The functions are pure, so they can be tested without Home Assistant.
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta

import homeassistant.util.dt as dt_util

from .helpers import parse_datetime
from .hourly_et import solar_elevation_sin

# The exponent of the drainage law: Brooks-Corey with a pore size index of 2,
# n = (2 + 3 * gamma) / gamma.
_GAMMA = 2
_N = (2 + 3 * _GAMMA) / _GAMMA


def drainage_over(
    bucket: float,
    hours: float,
    drainage_rate: float,
    maximum_bucket: float | None,
) -> float:
    """What drains from a bucket above field capacity over ``hours``, in mm.

    With a maximum bucket the rate is the full rate at saturation scaled by
    (bucket / maximum_bucket)^n, a rate law dB/dt = -r (B/M)^n whose exact
    solution for a constant r is used. Without one there is no saturation to
    scale by, and the soil drains at the constant rate. Nothing drains at or
    below field capacity.
    """
    if bucket <= 0 or hours <= 0 or not drainage_rate or drainage_rate <= 0:
        return 0.0
    if maximum_bucket is not None and maximum_bucket > 0:
        remaining = (
            bucket ** (1 - _N) + (_N - 1) * drainage_rate * hours / maximum_bucket**_N
        ) ** (1 / (1 - _N))
        return bucket - remaining
    # The caller clamps the bucket at 0: the single step reports the full
    # rate times the hours as the drainage, as it always has.
    return drainage_rate * hours


def _naive_local(stamp) -> datetime | None:
    """A reading's timestamp on the naive local clock the buffer writes."""
    if stamp is None:
        return None
    if not isinstance(stamp, datetime):
        try:
            stamp = parse_datetime(stamp)
        except (ValueError, TypeError):
            return None
        if stamp is None:
            return None
    if stamp.tzinfo is not None:
        try:
            stamp = dt_util.as_local(stamp).replace(tzinfo=None)
        except (OverflowError, ValueError, OSError):
            return None
    return stamp


def hour_slots(hours: float) -> list[float]:
    """The lengths of the hours a window of ``hours`` is cut into.

    Whole hours from the start, and what is left in the last one. A window
    shorter than an hour is one slot.
    """
    if hours <= 0:
        return []
    count = max(1, math.ceil(hours - 1e-9))
    return [1.0] * (count - 1) + [hours - (count - 1)]


def time_profile(timing, window_end, hours: float) -> list[float] | None:
    """The share of a quantity that happened in each hour of the window.

    ``timing`` is a list of ``(timestamp, weight)``: when a reading showed
    rain and how much, or an hour of evapotranspiration and its millimetres. A
    reading before the window belongs to the previous one; one after the end
    (a clock that moved) counts in the last hour.

    None when nothing tells when: no readings in the window, or readings that
    all weigh nothing.
    """
    slots = hour_slots(hours)
    if not slots or not timing or window_end is None:
        return None
    end = _naive_local(window_end)
    if end is None:
        return None
    start = end - timedelta(hours=hours)
    weights = [0.0] * len(slots)
    for stamp, weight in timing:
        try:
            weight = float(weight)
        except (TypeError, ValueError):
            continue
        moment = _naive_local(stamp)
        if moment is None or weight <= 0 or moment < start:
            continue
        index = int((moment - start).total_seconds() // 3600)
        weights[min(index, len(slots) - 1)] += weight
    total = sum(weights)
    if total <= 0:
        return None
    return [weight / total for weight in weights]


# When it rained, from the rain readings.
rain_profile = time_profile


def sun_profile(
    window_end, hours: float, latitude: float | None, longitude: float | None
) -> list[float] | None:
    """The share of the window's evapotranspiration in each hour, by the sun.

    When no hour-by-hour figure exists, the evapotranspiration is placed where
    the energy that drives it is: in proportion to how high the sun stands at
    the middle of each hour (FAO-56 Annex 3, Eq. 3-15), nothing at night. None
    without coordinates, or for a window the sun never rises over, and the
    replay then spreads it evenly.
    """
    slots = hour_slots(hours)
    end = _naive_local(window_end)
    if not slots or end is None or latitude is None or longitude is None:
        return None
    start = end - timedelta(hours=hours)
    weights = []
    offset = 0.0
    for length in slots:
        middle = start + timedelta(hours=offset + length / 2)
        offset += length
        try:
            utc_offset = middle.astimezone().utcoffset()
            tz_offset_h = utc_offset.total_seconds() / 3600 if utc_offset else 0.0
            sine = solar_elevation_sin(
                float(latitude),
                float(longitude),
                middle.timetuple().tm_yday,
                middle.hour + middle.minute / 60,
                tz_offset_h,
            )
        except (ArithmeticError, OSError, OverflowError, TypeError, ValueError):
            return None
        weights.append(max(0.0, sine) * length)
    total = sum(weights)
    if total <= 0:
        return None
    return [weight / total for weight in weights]


def replay(
    bucket: float,
    et_mm: float,
    rain_mm: float,
    hours: float,
    profile: list[float] | None,
    maximum_bucket: float | None,
    drainage_rate: float,
    available_water: float | None = None,
    et_profile: list[float] | None = None,
) -> tuple[float, float, float]:
    """The bucket at the end of the window, replayed hour by hour.

    ``et_mm`` is the evapotranspiration part of the window's change (negative
    when the soil dries), spread by ``et_profile``. ``rain_mm`` is spread by
    ``profile``. Either is spread evenly over the hours when it has no
    profile. Each hour, in this order:

    - its evapotranspiration and its rain are added;
    - the deficit is floored at the available water, the surplus capped at
      the maximum bucket (what goes above it runs off);
    - what is above field capacity drains for that hour.

    Returns ``(bucket, drainage, peak)``: the bucket at the end, the total that
    drained, and the highest the bucket reached before draining, which says
    whether any drainage could apply at all.
    """
    slots = hour_slots(hours)
    if not slots:
        slots = [0.0]
    span = sum(slots)
    even = [(length / span) if span > 0 else 1.0 / len(slots) for length in slots]
    if profile is None or len(profile) != len(slots):
        profile = even
    if et_profile is None or len(et_profile) != len(slots):
        et_profile = even
    drained_total = 0.0
    peak = None
    for length, share, et_share in zip(slots, profile, et_profile, strict=True):
        bucket = bucket + et_mm * et_share + rain_mm * share
        if available_water and available_water > 0 and bucket < -available_water:
            bucket = -float(available_water)
        if maximum_bucket is not None and bucket > maximum_bucket:
            bucket = float(maximum_bucket)
        peak = bucket if peak is None else max(peak, bucket)
        # Nothing drains at or below field capacity, and never more than the
        # surplus there is.
        drained = drainage_over(bucket, length, drainage_rate, maximum_bucket)
        if drained > 0:
            drained = min(bucket, drained)
            drained_total += drained
            bucket -= drained
    return bucket, drained_total, peak
