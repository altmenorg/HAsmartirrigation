"""Zone values are stored and calculated in metric, and shown in the unit system.

A zone used to keep its depths, rates, area and flow in whatever unit system
Home Assistant was set to, and every piece of code that read one had to
remember to convert it: the calculation, the run crediting, the flow check,
the start-of-run rain adjustment, the sensors, the calendar. Each place that
forgot was a bug, and switching Home Assistant between metric and imperial
reinterpreted every stored value in the new unit.

Everything is stored in metric now. The conversion happens at the edges only:
what the panel, the entities and the services show or accept.
"""

from __future__ import annotations

from . import const

# Exact definitions, so that a value shown and saved back comes back the same:
# the rounded factors elsewhere drifted by a few parts in 10^8 per round trip.
MM_PER_INCH = 25.4
M2_PER_SQ_FT = 0.09290304
LITRES_PER_GALLON = 3.785411784

# Zone fields that carry a unit: the metric value is the imperial one times
# this factor. Every other field is unitless or the same in both systems
# (seconds, %, litres).
ZONE_UNIT_FIELDS: dict[str, float] = {
    const.ZONE_BUCKET: MM_PER_INCH,
    const.ZONE_MAXIMUM_BUCKET: MM_PER_INCH,
    const.ZONE_DELTA: MM_PER_INCH,
    const.ZONE_ET_DEFICIENCY: MM_PER_INCH,
    const.ZONE_CURRENT_DRAINAGE: MM_PER_INCH,
    const.ZONE_IRRIGATION_THRESHOLD: MM_PER_INCH,
    const.ZONE_DRAINAGE_RATE: MM_PER_INCH,  # mm/h per in/h
    const.ZONE_PRECIPITATION_RATE: MM_PER_INCH,
    const.ZONE_SIZE: M2_PER_SQ_FT,
    const.ZONE_THROUGHPUT: LITRES_PER_GALLON,  # L/min per gal/min
    const.ZONE_MEASURED_THROUGHPUT: LITRES_PER_GALLON,
}

# Set on the stored configuration once the zones are in metric.
CONF_STORED_UNITS = "stored_units"
STORED_UNITS_METRIC = "metric"


def _scale(value, factor):
    """``value * factor`` for a number; anything else (None, text) as it is."""
    if value is None or isinstance(value, bool):
        return value
    try:
        return float(value) * factor
    except (TypeError, ValueError):
        return value


def zone_to_display(zone: dict, metric: bool) -> dict:
    """A stored zone with its values in the unit system shown to the user."""
    if metric or not zone:
        return zone
    shown = dict(zone)
    for key, factor in ZONE_UNIT_FIELDS.items():
        if key in shown:
            shown[key] = _scale(shown[key], 1 / factor)
    return shown


def zone_from_display(changes: dict, metric: bool) -> dict:
    """Zone values entered in the user's unit system, in the stored metric ones."""
    if metric or not changes:
        return changes
    stored = dict(changes)
    for key, factor in ZONE_UNIT_FIELDS.items():
        if key in stored:
            stored[key] = _scale(stored[key], factor)
    if const.ATTR_NEW_BUCKET_VALUE in stored:
        stored[const.ATTR_NEW_BUCKET_VALUE] = _scale(
            stored[const.ATTR_NEW_BUCKET_VALUE], MM_PER_INCH
        )
    return stored


def depth_to_display(value_mm, metric: bool):
    """A depth in mm, in the unit shown to the user."""
    return value_mm if metric else _scale(value_mm, 1 / MM_PER_INCH)


def depth_from_display(value, metric: bool):
    """A depth entered in the user's unit, in mm."""
    return value if metric else _scale(value, MM_PER_INCH)
