"""What a zone needs, and the reference figure behind it (#850).

The Zones tab shows a "Daily ET deficiency" next to the bucket. It was the
reference evapotranspiration, ET0, with no crop factor: two zones sharing a
sensor group but growing different things showed the same need, and the number
did not agree with the bucket printed beside it. Megalos reported it.

So the deficiency is now this zone's own need, ETc = ET0 x Kc, and the
reference figure it comes from is kept separately as ``eto`` -- that one has to
stay free of the crop factor, because comparing it against what a weather
service publishes is exactly what it is for, and it is how this class of bug
gets found.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin

DAILY_DELTA = -4.0  # what the stand-in engine returns, mm/day


class _Module:
    forecast_days = 0

    def __init__(self):
        self.last_trace = {"module": "PyETO", "mean_delta": DAILY_DELTA}

    def calculate(self, weather_data, forecast_data):
        return DAILY_DELTA


class _Coordinator(CalculationMixin):
    def __init__(self, precip=0.0, seasonal=1.0):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.hass.config.language = "en"
        self.store = MagicMock()
        self.store.get_config = MagicMock(return_value={})
        self.store.get_mapping = MagicMock(
            return_value={
                const.MAPPING_ID: 1,
                const.MAPPING_MAPPINGS: {},
                const.MAPPING_DATA: [],
                const.MAPPING_DATA_LAST_ENTRY: {},
            }
        )
        self.store.get_module = MagicMock(
            return_value={const.MODULE_ID: 1, const.MODULE_NAME: "PyETO"}
        )
        self.getModuleInstanceByID = AsyncMock(return_value=_Module())
        self._build_calc_record = MagicMock(return_value=None)
        self._precipitation_net_of_superseded = MagicMock(return_value=precip)
        # (factor on the crop factor, offset on the irrigation threshold)
        self._seasonal_factors = MagicMock(return_value=(seasonal, 0.0))


def _zone(multiplier=1.0, **extra):
    zone = {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_MODULE: 1,
        const.ZONE_MAPPING: 1,
        const.ZONE_BUCKET: 0.0,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
        const.ZONE_DRAINAGE_RATE: 0.0,
        const.ZONE_MULTIPLIER: multiplier,
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_IRRIGATION_THRESHOLD: 0,
    }
    zone.update(extra)
    return zone


async def _run(coordinator, zone, multiplier=1.0):
    return await coordinator.calculate_module(
        zone, {const.MAPPING_DATA_MULTIPLIER: multiplier}, []
    )


@pytest.mark.parametrize("kc", [0.5, 0.8, 1.0, 1.2])
async def test_the_deficiency_is_the_need_of_this_zone(kc):
    data = await _run(_Coordinator(), _zone(multiplier=kc))

    assert data[const.ZONE_ET_DEFICIENCY] == pytest.approx(DAILY_DELTA * kc)


@pytest.mark.parametrize("kc", [0.5, 0.8, 1.0, 1.2])
async def test_the_reference_figure_carries_no_crop_factor(kc):
    """This is the number to hold against a weather service's own ET0."""
    data = await _run(_Coordinator(), _zone(multiplier=kc))

    assert data[const.ZONE_ETO] == pytest.approx(-DAILY_DELTA)


async def test_the_deficiency_agrees_with_what_reached_the_bucket():
    """Dry, over one interval: the deficiency is the delta. That is the whole
    point of showing it next to the bucket."""
    coordinator = _Coordinator()

    data = await _run(coordinator, _zone(multiplier=0.8))

    assert data[const.ZONE_DELTA] == pytest.approx(data[const.ZONE_ET_DEFICIENCY])


async def test_rain_and_the_interval_stay_out_of_it():
    """It is a daily need, so neither the length of the interval nor the rain
    that fell in it belongs in it (#576)."""
    coordinator = _Coordinator(precip=3.0)

    data = await _run(coordinator, _zone(multiplier=0.8), multiplier=0.5)

    assert data[const.ZONE_ET_DEFICIENCY] == pytest.approx(DAILY_DELTA * 0.8)
    # The delta is the half interval and the rain; the deficiency is not.
    assert data[const.ZONE_DELTA] == pytest.approx(DAILY_DELTA * 0.8 * 0.5 + 3.0)


async def test_a_seasonal_adjustment_is_part_of_the_need():
    """It scales the crop factor, so it scales what the crop needs."""
    coordinator = _Coordinator(seasonal=0.5)

    data = await _run(coordinator, _zone(multiplier=0.8))

    assert data[const.ZONE_ET_DEFICIENCY] == pytest.approx(DAILY_DELTA * 0.4)
    # And still not part of the reference figure.
    assert data[const.ZONE_ETO] == pytest.approx(-DAILY_DELTA)


async def test_a_zone_with_no_crop_factor_reads_the_same_either_way():
    data = await _run(_Coordinator(), _zone(multiplier=None))

    assert data[const.ZONE_ET_DEFICIENCY] == pytest.approx(DAILY_DELTA)
    assert data[const.ZONE_ETO] == pytest.approx(-DAILY_DELTA)
