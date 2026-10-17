"""A zone without a lead time is calculated as one with a lead time of 0.

A zone stores ``lead_time`` as ``None`` until someone types a value: the setup
assistant creates its zone without one, and ``ZoneEntry`` defaults it to
``None``. Every reader of the field treats that as 0 (``programs.py``,
``valve_runner.py``, ``observed_watering.py``, ``skip_conditions.py``), except
the two places in the calculation that add it to the duration. There it raised
``TypeError: unsupported operand type(s) for +: 'NoneType' and 'float'``, so a
zone made by the assistant could never be calculated and the panel answered the
request with an error.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Module:
    """A Static module: it returns the evapotranspiration it was given."""

    name = "Static"

    def calculate(self):
        return -5.0


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.hass.config.language = "en"
        self.store = MagicMock()
        self.store.get_module = MagicMock(
            return_value={const.MODULE_ID: 1, const.MODULE_NAME: "Static"}
        )
        self.getModuleInstanceByID = AsyncMock(return_value=_Module())
        self._build_calc_record = MagicMock(return_value=None)


def _zone(lead_time):
    return {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_MODULE: 1,
        const.ZONE_MAPPING: None,
        const.ZONE_BUCKET: -1.0,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
        const.ZONE_DRAINAGE_RATE: 0.0,
        const.ZONE_MULTIPLIER: 1.0,
        # 100 m2 at 10 l/min is 6 mm/h.
        const.ZONE_SIZE: 100.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MAXIMUM_DURATION: -1,
        const.ZONE_LEAD_TIME: lead_time,
        const.ZONE_IRRIGATION_THRESHOLD: 0,
    }


@pytest.mark.asyncio
async def test_a_zone_without_a_lead_time_is_calculated():
    coord = _Coordinator()

    without = await coord.calculate_module(_zone(None), {}, [])
    with_zero = await coord.calculate_module(_zone(0), {}, [])

    assert without[const.ZONE_DURATION] > 0
    assert without[const.ZONE_DURATION] == with_zero[const.ZONE_DURATION]


@pytest.mark.asyncio
async def test_a_lead_time_is_still_added():
    coord = _Coordinator()

    without = await coord.calculate_module(_zone(0), {}, [])
    with_lead = await coord.calculate_module(_zone(30), {}, [])

    assert with_lead[const.ZONE_DURATION] == without[const.ZONE_DURATION] + 30


def test_the_duration_from_the_bucket_treats_a_missing_lead_time_as_0():
    coord = _Coordinator()

    # 1 mm at 6 mm/h is 600 s.
    assert coord.duration_from_bucket(_zone(None), -1.0) == pytest.approx(600)
    assert coord.duration_from_bucket(_zone(15), -1.0) == pytest.approx(615)
