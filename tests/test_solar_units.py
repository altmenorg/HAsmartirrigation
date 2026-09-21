"""Every solar radiation unit the panel offers converts to every other one.

MJ/day/sq ft was offered to imperial installs and converted to MJ/day/m2 by
multiplying by the area of a square foot instead of dividing by it: 1/116th
of the radiation reached the calculation. Checked here against one reference,
everything expressed in W/m2.
"""

import pytest

from custom_components.smart_irrigation.helpers import convert_between

UNITS = ["W/m2", "MJ/day/m2", "W/sq ft", "MJ/day/sq ft"]
SQ_FT = 0.09290304  # m2
IN_W_M2 = {
    "W/m2": 1.0,
    "MJ/day/m2": 1e6 / 86400,
    "W/sq ft": 1 / SQ_FT,
    "MJ/day/sq ft": 1e6 / 86400 / SQ_FT,
}


@pytest.mark.parametrize("to_unit", UNITS)
@pytest.mark.parametrize("from_unit", UNITS)
def test_every_pair_matches_the_reference(from_unit, to_unit):
    expected = IN_W_M2[from_unit] / IN_W_M2[to_unit]

    assert convert_between(from_unit, to_unit, 1.0) == pytest.approx(expected, rel=1e-4)


def test_a_sunny_day_per_square_foot():
    """2 MJ/day/sq ft is a bright day, 21.5 MJ/day/m2, not 0.19."""
    assert convert_between("MJ/day/sq ft", "MJ/day/m2", 2.0) == pytest.approx(
        21.53, abs=0.01
    )
