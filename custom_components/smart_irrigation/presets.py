"""Soil and planting, in words, for the two numbers nobody knows by heart.

A zone needs a drainage rate in mm/h and a crop coefficient. Both are real
quantities with real effects, and both are unanswerable for most people: "how
fast does your soil drain" is not something a gardener knows, while "clay" or
"sandy" is something they can see by digging a hole.

So the panel asks in those terms and fills the numbers in. The values below
are the usual references, rounded to one useful digit: nobody measures their
own infiltration rate, and pretending to three decimals would be false
precision. Anyone who does know their own numbers can still type them.

Sources: FAO-56 (Allen et al. 1998), table 12 for the crop coefficients of the
mid-season stage, and the soil infiltration ranges of FAO Irrigation and
Drainage paper 24 / the USDA soil texture families.
"""

from . import const

# Drainage rate in mm/h by soil, taken at the middle of the usual range for
# that texture.
SOIL_TYPES: dict[str, float] = {
    "sand": 25.0,  # 20 to 30
    "sandy_loam": 15.0,  # 10 to 20
    "loam": 8.0,  # 5 to 10
    "clay_loam": 4.0,  # 3 to 5
    "clay": 2.0,  # 1 to 5, and the low end is the safe one
}

# Crop coefficient by planting, mid-season, for the reference grass surface.
PLANT_TYPES: dict[str, float] = {
    "lawn": 0.85,  # cool-season turf 0.9, warm-season 0.8
    "vegetables": 1.0,
    "flowers": 0.9,
    "shrubs": 0.7,
    "hedge": 0.7,
    "fruit_trees": 0.9,
    "vines": 0.7,
    "ground_cover": 0.8,
}

# What a zone whose numbers match no preset is called.
CUSTOM = "custom"

# What a zone still at the value it started with is called: nobody chose a
# soil or a planting for it (#982). It read "set myself" with the number,
# which said who chose it wrongly.
NOT_CHOSEN = "default"

# The drainage rates a zone starts with: today's, and the one zones made
# before started with.
DEFAULT_DRAINAGE_RATES = (
    const.CONF_DEFAULT_DRAINAGE_RATE,
    const.CONF_PREVIOUS_DEFAULT_DRAINAGE_RATE,
)

# The crop coefficient every zone starts with (store.ZoneEntry). It is also
# the vegetables' one, so a zone nobody described read as "Vegetables": a
# value never chosen. Left at it, the coefficient says nothing about the
# planting.
DEFAULT_MULTIPLIER = 1.0


def drainage_rate_for(soil_type: str | None) -> float | None:
    """The drainage rate a soil implies, in mm/h, or None for none."""
    return SOIL_TYPES.get(soil_type or "")


def crop_coefficient_for(plant_type: str | None) -> float | None:
    """The crop coefficient a planting implies, or None for none."""
    return PLANT_TYPES.get(plant_type or "")


def _matching(value, table) -> str | None:
    """The preset whose value is the one given, within a hair."""
    try:
        value = float(value)
    except (TypeError, ValueError):
        return None
    for name, preset in table.items():
        if abs(preset - value) < 1e-6:
            return name
    return None


def _is_one_of(value, defaults) -> bool:
    """Whether the value is one of the starting values, within a hair."""
    try:
        value = float(value)
    except (TypeError, ValueError):
        return False
    return any(abs(value - default) < 1e-6 for default in defaults)


def describe_zone(zone: dict) -> dict:
    """The soil and planting a zone's numbers correspond to.

    A soil or planting chosen by name is kept. A number still at the value
    the zone started with is "not chosen" (#982). Any other number that
    matches a preset reads as that preset, and one that matches nothing is
    "custom": the panel then shows the number itself rather than claiming a
    soil the user never chose.
    """
    zone = zone or {}
    drainage = zone.get(const.ZONE_DRAINAGE_RATE)
    soil = zone.get(const.ZONE_SOIL_TYPE) or (
        NOT_CHOSEN
        if _is_one_of(drainage, DEFAULT_DRAINAGE_RATES)
        else _matching(drainage, SOIL_TYPES)
    )
    multiplier = zone.get(const.ZONE_MULTIPLIER)
    plant = zone.get(const.ZONE_PLANT_TYPE) or (
        NOT_CHOSEN
        if _is_one_of(multiplier, (DEFAULT_MULTIPLIER,))
        else _matching(multiplier, PLANT_TYPES)
    )
    return {
        const.ZONE_SOIL_TYPE: soil or CUSTOM,
        const.ZONE_PLANT_TYPE: plant or CUSTOM,
    }


def apply_preset(changes: dict) -> dict:
    """Turn a chosen soil or planting into the number it stands for.

    The number is what the calculation reads, and it stays editable: choosing
    "loam" writes 8 mm/h, and typing 6 afterwards keeps 6, with the zone then
    described as custom.
    """
    changes = dict(changes or {})
    # "Not chosen" goes back to the starting value, and stores no choice.
    if changes.get(const.ZONE_SOIL_TYPE) == NOT_CHOSEN:
        changes[const.ZONE_SOIL_TYPE] = None
        changes.setdefault(const.ZONE_DRAINAGE_RATE, const.CONF_DEFAULT_DRAINAGE_RATE)
    if changes.get(const.ZONE_PLANT_TYPE) == NOT_CHOSEN:
        changes[const.ZONE_PLANT_TYPE] = None
        changes.setdefault(const.ZONE_MULTIPLIER, DEFAULT_MULTIPLIER)
    soil = changes.get(const.ZONE_SOIL_TYPE)
    if soil and soil != CUSTOM and const.ZONE_DRAINAGE_RATE not in changes:
        rate = drainage_rate_for(soil)
        if rate is not None:
            changes[const.ZONE_DRAINAGE_RATE] = rate
    plant = changes.get(const.ZONE_PLANT_TYPE)
    if plant and plant != CUSTOM and const.ZONE_MULTIPLIER not in changes:
        coefficient = crop_coefficient_for(plant)
        if coefficient is not None:
            changes[const.ZONE_MULTIPLIER] = coefficient
    return changes
