"""Zone values are stored in metric, and an imperial install is migrated once.

The zones used to keep their values in Home Assistant's unit system. An install
in imperial is converted when it loads, exactly once; a metric one has nothing
to convert. A backup taken before the migration is converted when restored,
and one taken after is not converted again.
"""

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import (
    STORAGE_KEY,
    STORAGE_VERSION,
    SmartIrrigationStorage,
)
from custom_components.smart_irrigation.units import (
    CONF_STORED_UNITS,
    STORED_UNITS_METRIC,
    zone_from_display,
    zone_to_display,
)

IMPERIAL_ZONE = {
    const.ZONE_ID: 0,
    const.ZONE_NAME: "Lawn",
    const.ZONE_STATE: "automatic",
    const.ZONE_SIZE: 100.0,  # sq ft
    const.ZONE_THROUGHPUT: 2.0,  # gal/min
    const.ZONE_BUCKET: -0.5,  # in
    const.ZONE_DELTA: -0.1,  # in
    const.ZONE_MAXIMUM_BUCKET: 1.0,  # in
    const.ZONE_DRAINAGE_RATE: 0.1,  # in/h
    const.ZONE_IRRIGATION_THRESHOLD: 0.25,  # in
    const.ZONE_DURATION: 600,
    const.ZONE_LEAD_TIME: 0,
    const.ZONE_MULTIPLIER: 1.0,
    const.ZONE_MODULE: 0,
    const.ZONE_MAPPING: 0,
}

EXPECTED_METRIC = {
    const.ZONE_SIZE: 9.290304,
    const.ZONE_THROUGHPUT: 7.570823568,
    const.ZONE_BUCKET: -12.7,
    const.ZONE_DELTA: -2.54,
    const.ZONE_MAXIMUM_BUCKET: 25.4,
    const.ZONE_DRAINAGE_RATE: 2.54,
    const.ZONE_IRRIGATION_THRESHOLD: 6.35,
}


def _document(zone, config=None):
    return {
        "version": STORAGE_VERSION,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": {
            "config": dict(config or {}),
            "zones": [dict(zone)],
            "modules": [],
            "mappings": [],
        },
    }


async def _load(hass, hass_storage, zone, units, config=None):
    hass.config.units = units
    hass_storage[STORAGE_KEY] = _document(zone, config)
    store = SmartIrrigationStorage(hass)
    await store.async_load()
    return store


@pytest.mark.asyncio
async def test_an_imperial_install_is_converted_to_metric(hass, hass_storage):
    store = await _load(hass, hass_storage, IMPERIAL_ZONE, US_CUSTOMARY_SYSTEM)

    zone = store.get_zone(0)
    for key, expected in EXPECTED_METRIC.items():
        assert zone[key] == pytest.approx(expected), key
    # What carries no unit is left alone.
    assert zone[const.ZONE_DURATION] == 600
    assert zone[const.ZONE_MULTIPLIER] == 1.0
    assert store.config.stored_units == STORED_UNITS_METRIC


@pytest.mark.asyncio
async def test_it_is_converted_only_once(hass, hass_storage):
    converted = {**IMPERIAL_ZONE, **EXPECTED_METRIC}
    store = await _load(
        hass,
        hass_storage,
        converted,
        US_CUSTOMARY_SYSTEM,
        config={CONF_STORED_UNITS: STORED_UNITS_METRIC},
    )

    assert store.get_zone(0)[const.ZONE_BUCKET] == pytest.approx(-12.7)


@pytest.mark.asyncio
async def test_a_metric_install_has_nothing_to_convert(hass, hass_storage):
    metric_zone = {**IMPERIAL_ZONE, const.ZONE_BUCKET: -5.0, const.ZONE_SIZE: 50.0}
    store = await _load(hass, hass_storage, metric_zone, METRIC_SYSTEM)

    zone = store.get_zone(0)
    assert zone[const.ZONE_BUCKET] == -5.0
    assert zone[const.ZONE_SIZE] == 50.0
    assert store.config.stored_units == STORED_UNITS_METRIC


@pytest.mark.asyncio
async def test_the_marker_survives_a_restart(hass, hass_storage):
    store = await _load(hass, hass_storage, IMPERIAL_ZONE, US_CUSTOMARY_SYSTEM)
    await store.async_save()

    again = SmartIrrigationStorage(hass)
    await again.async_load()

    assert again.config.stored_units == STORED_UNITS_METRIC
    assert again.get_zone(0)[const.ZONE_BUCKET] == pytest.approx(-12.7)


@pytest.mark.asyncio
async def test_an_old_backup_is_converted_and_a_new_one_is_not(hass, hass_storage):
    store = await _load(hass, hass_storage, IMPERIAL_ZONE, US_CUSTOMARY_SYSTEM)

    await store.async_import(_document(IMPERIAL_ZONE)["data"])
    assert store.get_zone(0)[const.ZONE_BUCKET] == pytest.approx(-12.7)

    await store.async_import(await store.async_export())
    assert store.get_zone(0)[const.ZONE_BUCKET] == pytest.approx(-12.7)


def test_what_is_shown_is_what_was_entered():
    """The panel shows imperial and saves it back: nothing drifts."""
    stored = {**IMPERIAL_ZONE, **EXPECTED_METRIC}
    shown = zone_to_display(stored, metric=False)

    assert shown[const.ZONE_BUCKET] == pytest.approx(-0.5)
    assert shown[const.ZONE_THROUGHPUT] == pytest.approx(2.0)
    assert zone_from_display(shown, metric=False) == pytest.approx(stored)


def test_a_metric_install_shows_what_is_stored():
    stored = {**IMPERIAL_ZONE, **EXPECTED_METRIC}

    assert zone_to_display(stored, metric=True) is stored


@pytest.mark.asyncio
async def test_a_calculation_does_not_depend_on_the_unit_system():
    """Stored in metric, calculated in metric: the unit system only changes what
    is shown, never the water balance."""
    from unittest.mock import AsyncMock, MagicMock

    from custom_components.smart_irrigation.calculation import CalculationMixin

    class _Module:
        name = "Static"

        def calculate(self):
            return -4.0

    class _Coordinator(CalculationMixin):
        def __init__(self, units):
            self.hass = MagicMock()
            self.hass.config.units = units
            self.hass.config.language = "en"
            self.store = MagicMock()
            self.store.get_module = MagicMock(
                return_value={const.MODULE_ID: 1, const.MODULE_NAME: "Static"}
            )
            self.getModuleInstanceByID = AsyncMock(return_value=_Module())
            self._build_calc_record = MagicMock(return_value=None)
            self.seasonal_adjustment_manager = None

    zone = {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_MODULE: 1,
        const.ZONE_MAPPING: None,
        const.ZONE_BUCKET: -3.0,
        const.ZONE_MAXIMUM_BUCKET: 25.0,
        const.ZONE_DRAINAGE_RATE: 10.0,
        const.ZONE_MULTIPLIER: 0.8,
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_IRRIGATION_THRESHOLD: 2.0,
    }
    results = []
    for units in (METRIC_SYSTEM, US_CUSTOMARY_SYSTEM):
        data = await _Coordinator(units).calculate_module(
            dict(zone), {const.MAPPING_DATA_MULTIPLIER: 1.0}, []
        )
        results.append({k: v for k, v in data.items() if k != const.ZONE_EXPLANATION})

    assert results[0] == results[1]
    assert results[0][const.ZONE_DURATION] > 0
