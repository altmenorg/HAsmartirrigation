"""Shortwave radiation from an illuminance reading.

A light sensor reports lux, what the eye sees. Evaporation is driven by the
radiation, in W/m2, and the two are tied by the luminous efficacy of daylight,
lumen per watt. That efficacy is not a constant: it moves with the sky. A clear
sky gives a little over 110 lm/W, an overcast one a little under 125, and the
figure to use depends on how clear the sky is.

The relation used here is Muneer and Kinghorn's (Lighting Research and
Technology, 1997), fitted on five sites in the United Kingdom and found among
the most accurate of the global luminous efficacy models when it was compared
with Perez, Littlefair and Chung on measurements from Kingsville and Taipei
(Model Evaluation and Development for Global Luminous Efficacy Models, IBPSA
Building Simulation 2019):

    Kg = 136.6 - 74.541 Kt + 57.3421 Kt^2        [lm/W]

with Kt the clearness index, the global radiation on a horizontal plane over
the radiation at the top of the atmosphere above it. Kt is the unknown, since
the radiation is what is being looked for, but the equation has one solution:
illuminance is E = Kg(Kt) Kt R, R being the extraterrestrial radiation on the
horizontal, which the position of the sun gives, and Kg Kt rises with Kt, so
the solution is found by bisection. The season and the hour enter through R.

Under glass the sensor sees what the plants get, which is the figure wanted;
the glazing shifts the spectrum a little, which the model does not describe, and
the error stays within a few percent.
"""

from __future__ import annotations

import math

# Solar constant, W/m2 (FAO-56 uses 0.0820 MJ m-2 min-1, the same 1367).
SOLAR_CONSTANT_W_M2 = 1367.0

# Below this height of the sun the clearness index means nothing: the
# extraterrestrial radiation it divides by tends to zero, and so does the
# precision of anything divided by it. The efficacy of the middle of the range
# is used instead, which is also what the model gives at Kt = 0.5.
MIN_SUN_ELEVATION_DEG = 5.0

# Muneer and Kinghorn (1997).
_A, _B, _C = 136.6, -74.541, 57.3421


def global_luminous_efficacy(kt: float) -> float:
    """Luminous efficacy of global radiation, lm/W, for a clearness index."""
    kt = min(max(kt, 0.0), 1.0)
    return _A + _B * kt + _C * kt * kt


def default_luminous_efficacy() -> float:
    """The efficacy when the sun is too low to say how clear the sky is."""
    return global_luminous_efficacy(0.5)


def extraterrestrial_horizontal(sin_elevation: float, doy: int) -> float:
    """Radiation at the top of the atmosphere on a horizontal plane, W/m2."""
    dr = 1.0 + 0.033 * math.cos(2.0 * math.pi * doy / 365.0)
    return SOLAR_CONSTANT_W_M2 * dr * max(sin_elevation, 0.0)


def radiation_from_illuminance(lux: float, sin_elevation: float, doy: int) -> float:
    """Global radiation in W/m2 for an illuminance in lux.

    ``sin_elevation`` is the sine of the sun's height above the horizon at the
    time of the reading and ``doy`` the day of the year.
    """
    if lux <= 0:
        return 0.0

    if sin_elevation < math.sin(math.radians(MIN_SUN_ELEVATION_DEG)):
        return lux / default_luminous_efficacy()

    ra = extraterrestrial_horizontal(sin_elevation, doy)
    target = lux / ra  # = Kg(Kt) * Kt

    def reached(kt: float) -> float:
        return global_luminous_efficacy(kt) * kt

    # A reading brighter than the sky at its clearest can give: take the
    # clearest sky rather than inventing a Kt above one.
    if target >= reached(1.0):
        return lux / global_luminous_efficacy(1.0)

    low, high = 0.0, 1.0
    for _ in range(40):
        mid = 0.5 * (low + high)
        if reached(mid) < target:
            low = mid
        else:
            high = mid
    kt = 0.5 * (low + high)
    return kt * ra
