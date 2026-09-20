"""The explanation a user reads to check the numbers (#817).

It is the only place the water balance shows its work, so it has to be right in
the small ways too: units on the quantities, the crop factor stated where it is
applied rather than among the duration steps, and the closing sentence said once
instead of twice.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Module:
    """A Static module: it returns the evapotranspiration it was given."""

    name = "Static"

    def __init__(self, value):
        self._value = value

    def calculate(self):
        return self._value


class _Coordinator(CalculationMixin):
    def __init__(self, et=-5.0):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.hass.config.language = "en"
        self.store = MagicMock()
        self.store.get_module = MagicMock(
            return_value={const.MODULE_ID: 1, const.MODULE_NAME: "Static"}
        )
        self.getModuleInstanceByID = AsyncMock(return_value=_Module(et))
        self._build_calc_record = MagicMock(return_value=None)


def _zone(**overrides):
    zone = {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_MODULE: 1,
        const.ZONE_MAPPING: None,
        const.ZONE_BUCKET: -1.0,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
        const.ZONE_DRAINAGE_RATE: 0.0,
        const.ZONE_MULTIPLIER: 0.8,
        const.ZONE_SIZE: 85.0,
        const.ZONE_THROUGHPUT: 14.9,
        const.ZONE_MAXIMUM_DURATION: 9970,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_IRRIGATION_THRESHOLD: 0,
    }
    zone.update(overrides)
    return zone


async def _explain(**overrides):
    coord = _Coordinator(et=overrides.pop("et", -5.0))
    data = await coord.calculate_module(_zone(**overrides), {}, [])
    return data[const.ZONE_EXPLANATION]


@pytest.mark.asyncio
async def test_the_closing_sentence_is_said_once():
    """It used to be appended twice, closing the list twice with it."""
    explanation = await _explain()

    assert explanation.count("hence the final duration is") == 1
    assert explanation.count("</ol>") == 1


@pytest.mark.asyncio
async def test_the_crop_factor_is_stated_with_the_evapotranspiration():
    """It multiplies the ET, so explaining it among the duration steps put it
    where it is not applied."""
    explanation = await _explain()

    head, _, steps = explanation.partition("To calculate the exact duration")
    assert "Crop factor is 0.8" in head
    assert "Kc" in head
    assert "crop factor" not in steps.lower()


@pytest.mark.asyncio
async def test_the_quantities_carry_their_unit():
    explanation = await _explain()

    for expected in ("mm.", "mm/h", " s."):
        assert expected in explanation, expected


@pytest.mark.asyncio
async def test_the_formatting_note_stands_on_its_own():
    explanation = await _explain()

    note, separator, rest = explanation.partition("<br/><br/>")
    assert separator, "the note is not separated from the calculation"
    assert note.startswith("Note:")
    assert rest.startswith("Module returned")


@pytest.mark.asyncio
async def test_a_zone_that_needs_no_water_still_explains_itself():
    """The other branch of the text: no duration steps, so no list to close."""
    explanation = await _explain(bucket=20.0, et=0.0)

    assert "no irrigation is necessary" in explanation
    assert "<ol>" not in explanation


@pytest.mark.asyncio
async def test_a_deficit_below_the_threshold_is_not_called_a_full_bucket():
    """Two different reasons not to water, and only one is "the soil is full".

    Under the threshold the explanation said the deficit had not been reached
    and then, in the same breath, that the bucket was at or above zero. It is
    negative: that is what a threshold is for (#832).
    """
    explanation = await _explain(irrigation_threshold=8.0, et=-2.0, bucket=-1.0)

    assert "irrigation threshold" in explanation
    assert "bucket >= 0" not in explanation
    assert "no irrigation is necessary and duration is set to" not in explanation


@pytest.mark.asyncio
async def test_a_full_bucket_still_says_so():
    """The other side of the same branch, so the sentence is not lost for good."""
    explanation = await _explain(irrigation_threshold=8.0, et=0.0, bucket=20.0)

    assert "no irrigation is necessary" in explanation
