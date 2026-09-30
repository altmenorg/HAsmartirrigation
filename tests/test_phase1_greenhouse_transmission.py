"""A greenhouse with no light sensor does not get the sky's sun (phase 1.8).

Its sun was estimated from the temperature range, which describes the sky
outside, and a hot greenhouse day reached the clear-sky cap: ET about 40% too
high. The daily engine now dims an estimated sun by the glass's transmission.
"""

from unittest.mock import MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calcmodules.pyeto import PyETO
from custom_components.smart_irrigation.calculation import CalculationMixin

HOT_DAY = {
    const.MAPPING_MIN_TEMP: 12.0,
    const.MAPPING_MAX_TEMP: 37.0,
    const.MAPPING_DEWPOINT: 11.0,
    const.MAPPING_WINDSPEED: 0.5,
    const.MAPPING_PRESSURE: 1013.0,
}


def _module():
    hass = MagicMock()
    hass.config.as_dict.return_value = {"latitude": 47.0, "elevation": 10.0}
    return PyETO(hass, "", {})


class _Coordinator(CalculationMixin):
    def __init__(self, greenhouse):
        self.store = MagicMock()
        self.store.get_mapping = MagicMock(
            return_value={const.MAPPING_GREENHOUSE: greenhouse}
        )


def test_the_glass_dims_an_estimated_sun():
    outdoor = _module().calculate(HOT_DAY, [])
    under_glass = _module().calculate(
        {**HOT_DAY, const.MAPPING_DATA_SOLRAD_FACTOR: const.GREENHOUSE_TRANSMISSION},
        [],
    )
    assert under_glass > outdoor  # both negative: less water used under glass
    assert abs(under_glass) < 0.9 * abs(outdoor)


def test_a_measured_sun_is_left_as_it_is():
    measured = {**HOT_DAY, const.MAPPING_SOLRAD: 18.0}
    assert _module().calculate(
        {**measured, const.MAPPING_DATA_SOLRAD_FACTOR: 0.65}, []
    ) == pytest.approx(_module().calculate(measured, []))


def test_only_a_greenhouse_without_its_own_sun_is_dimmed():
    zone = {const.ZONE_MAPPING: 0}
    assert const.MAPPING_DATA_SOLRAD_FACTOR in _Coordinator(True)._under_glass(
        zone, dict(HOT_DAY)
    )
    assert const.MAPPING_DATA_SOLRAD_FACTOR not in _Coordinator(False)._under_glass(
        zone, dict(HOT_DAY)
    )
    assert const.MAPPING_DATA_SOLRAD_FACTOR not in _Coordinator(True)._under_glass(
        zone, {**HOT_DAY, const.MAPPING_SOLRAD: 18.0}
    )
