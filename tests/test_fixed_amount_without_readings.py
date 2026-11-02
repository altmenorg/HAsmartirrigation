"""A zone calculated from a fixed amount per day needs no readings.

The setup assistant's path "a fixed amount per day" asks for no sensor and
makes a sensor group with no source, on purpose: the fixed amount (the
"Static" engine) reads no weather. Such a group never gets a reading, and both
ways a zone is calculated stopped there with "no sensor data available": the
zone was never calculated, by hand or at night, and never watered. The panel
showed a green tick meanwhile.

A fixed amount is a rate per day, so what it needs is a window: the time since
the zone was last calculated, and one day the first time.
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calcmodules.static import Static
from custom_components.smart_irrigation.calculation import CalculationMixin


def _zone(**extra):
    zone = {
        const.ZONE_ID: 0,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_MODULE: 2,
        const.ZONE_MAPPING: 1,
        const.ZONE_BUCKET: 0.0,
        const.ZONE_MAXIMUM_BUCKET: 50.0,
        const.ZONE_DRAINAGE_RATE: 0.0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_SIZE: 100.0,
        const.ZONE_THROUGHPUT: 18.5,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_IRRIGATION_THRESHOLD: 0,
    }
    zone.update(extra)
    return zone


class _Coordinator(CalculationMixin):
    """The calculation as it is, over a store with one fixed-amount zone whose
    sensor group has no source and no reading."""

    def __init__(self, module_name="Static", delta=-4.5):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.hass.config.language = "en"
        self.use_weather_service = False
        self.store = MagicMock()
        self.store.get_config = MagicMock(return_value={})
        self.store.async_get_config = AsyncMock(return_value={})
        self.store.get_mapping = MagicMock(
            return_value={
                const.MAPPING_ID: 1,
                const.MAPPING_MAPPINGS: {},
                const.MAPPING_DATA: [],
                const.MAPPING_DATA_LAST_ENTRY: {},
            }
        )
        self.store.get_module = MagicMock(
            return_value={
                const.MODULE_ID: 2,
                const.MODULE_NAME: module_name,
                const.MODULE_CONFIG: {"delta": delta},
            }
        )
        self.getModuleInstanceByID = AsyncMock(
            return_value=Static(None, description="", config={"delta": delta})
        )
        self._build_calc_record = MagicMock(return_value=None)
        self._seasonal_factors = MagicMock(return_value=(1.0, 0.0))


def test_a_first_calculation_covers_one_day():
    window = _Coordinator().fixed_amount_window(_zone())
    assert window[const.MAPPING_DATA_MULTIPLIER] == 1.0
    assert isinstance(window[const.MAPPING_DATA_WINDOW_END], datetime)


@pytest.mark.parametrize(
    "stamp",
    [
        lambda: datetime.now() - timedelta(hours=12),
        lambda: (datetime.now() - timedelta(hours=12)).isoformat(),
        # Stored with an offset, as an aware value: read in local time.
        lambda: (datetime.now().astimezone() - timedelta(hours=12)).isoformat(),
    ],
)
def test_a_later_one_covers_the_time_since_the_last(stamp):
    zone = _zone(**{const.ZONE_LAST_CALCULATED: stamp()})
    window = _Coordinator().fixed_amount_window(zone)
    assert window[const.MAPPING_DATA_MULTIPLIER] == pytest.approx(0.5, abs=0.01)


def test_a_last_calculation_that_cannot_be_read_counts_as_none():
    zone = _zone(**{const.ZONE_LAST_CALCULATED: "not a time"})
    assert (
        _Coordinator().fixed_amount_window(zone)[const.MAPPING_DATA_MULTIPLIER] == 1.0
    )


def test_a_bucket_set_since_starts_the_window_there():
    """Setting the bucket moves the zone's mark to then (#811): what the zone
    lost until then is in the bucket already, so it is not counted again."""
    zone = _zone(
        **{
            const.ZONE_LAST_CALCULATED: (
                datetime.now() - timedelta(hours=24)
            ).isoformat(),
            const.ZONE_LAST_CONSUMED_AT: (
                datetime.now() - timedelta(hours=8)
            ).isoformat(),
        }
    )
    window = _Coordinator().fixed_amount_window(zone)
    assert window[const.MAPPING_DATA_MULTIPLIER] == pytest.approx(1 / 3, abs=0.01)


def test_an_older_mark_does_not_widen_the_window():
    zone = _zone(
        **{
            const.ZONE_LAST_CALCULATED: (
                datetime.now() - timedelta(hours=6)
            ).isoformat(),
            const.ZONE_LAST_CONSUMED_AT: (
                datetime.now() - timedelta(hours=30)
            ).isoformat(),
        }
    )
    window = _Coordinator().fixed_amount_window(zone)
    assert window[const.MAPPING_DATA_MULTIPLIER] == pytest.approx(0.25, abs=0.01)


def test_a_long_gap_counts_a_week_at_most():
    """A zone left manual all winter is not dried out by every day of it."""
    zone = _zone(
        **{
            const.ZONE_LAST_CALCULATED: (
                datetime.now() - timedelta(days=90)
            ).isoformat()
        }
    )
    window = _Coordinator().fixed_amount_window(zone)
    assert window[const.MAPPING_DATA_MULTIPLIER] == 7.0


def test_an_engine_that_reads_the_weather_gets_no_such_window():
    """Without readings, an engine that needs weather has nothing to work on:
    that is still an error, not a day of nothing."""
    assert _Coordinator(module_name="PyETO").fixed_amount_window(_zone()) is None
    assert _Coordinator(module_name="Passthrough").fixed_amount_window(_zone()) is None


async def test_the_fixed_amount_dries_the_zone_by_a_day():
    coordinator = _Coordinator()
    zone = _zone()
    result = await coordinator.calculate_module(
        zone, coordinator.fixed_amount_window(zone), None
    )
    assert result[const.ZONE_BUCKET] == pytest.approx(-4.5)
    assert result[const.ZONE_DURATION] > 0


async def test_the_nightly_run_calculates_it():
    coordinator = _Coordinator()
    zone = _zone()
    coordinator.store.async_get_zones = AsyncMock(return_value=[zone])
    coordinator.store.get_zone = MagicMock(return_value=zone)
    coordinator._get_unique_mappings_for_automatic_zones = AsyncMock(return_value=[1])
    coordinator.prune_consumed_readings = AsyncMock()
    coordinator.register_start_event = AsyncMock()
    coordinator.async_calculate_zone = AsyncMock(return_value={const.ZONE_BUCKET: -4.5})

    results = await coordinator._async_calculate_all(delete_weather_data=True)

    assert results == {0: {const.ZONE_BUCKET: -4.5}}
    window = coordinator.async_calculate_zone.await_args.args[1]
    assert window[const.MAPPING_DATA_MULTIPLIER] == 1.0


async def test_the_nightly_run_still_skips_a_zone_that_needs_weather():
    coordinator = _Coordinator(module_name="PyETO")
    zone = _zone()
    coordinator.store.async_get_zones = AsyncMock(return_value=[zone])
    coordinator._get_unique_mappings_for_automatic_zones = AsyncMock(return_value=[1])
    coordinator.prune_consumed_readings = AsyncMock()
    coordinator.register_start_event = AsyncMock()
    coordinator.async_calculate_zone = AsyncMock()
    coordinator.getModuleInstanceByID = AsyncMock(return_value=None)

    assert await coordinator._async_calculate_all(delete_weather_data=True) == {}
    coordinator.async_calculate_zone.assert_not_awaited()
