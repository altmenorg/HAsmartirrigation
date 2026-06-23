"""Backward-compatibility tests for loading an existing Smart Irrigation store.

These guard the consolidation: an installation created by the original upstream
Smart Irrigation (storage version 5) must keep its full configuration when it is
loaded by this consolidated code, even though the ``Config`` model has gained new
fields since. The on-disk format for zones, modules and mappings is unchanged and
every new ``Config`` field has a default, so an old payload must load intact with
the new fields falling back to their defaults rather than being required.
"""

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import (
    STORAGE_KEY,
    STORAGE_VERSION,
    MigratableStore,
    SmartIrrigationStorage,
)


def _canonical_v5_payload():
    """Return a storage-shaped dict as written by the original upstream code.

    It deliberately omits every field this fork added later (the ``manual_*``
    coordinates on the config and the optional newer zone fields) so the test
    proves those are filled from defaults rather than required on disk. The
    mapping keeps the legacy ``Maximum/Minimum Temperature`` source entries that
    old stores carried, to exercise the inline cleanup in the loader.
    """
    return {
        "config": {
            const.CONF_CALC_TIME: "23:00",
            const.CONF_USE_WEATHER_SERVICE: True,
            const.CONF_WEATHER_SERVICE: "OpenWeatherMap",
        },
        "zones": [
            {
                const.ZONE_ID: 0,
                const.ZONE_NAME: "Front Lawn",
                const.ZONE_SIZE: 100.0,
                const.ZONE_THROUGHPUT: 15.0,
                const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
                const.ZONE_DELTA: 2.5,
                const.ZONE_BUCKET: -3.0,
                const.ZONE_DURATION: 600,
                const.ZONE_MODULE: 0,
                const.ZONE_MULTIPLIER: 1.0,
                const.ZONE_MAPPING: 0,
                const.ZONE_LEAD_TIME: 0,
            }
        ],
        "mappings": [
            {
                const.MAPPING_ID: 0,
                const.MAPPING_NAME: "Weather group",
                const.MAPPING_MAPPINGS: {
                    const.MAPPING_MAX_TEMP: {"source": "weather_service"},
                    const.MAPPING_MIN_TEMP: {"source": "weather_service"},
                    "Temperature": {"source": "weather_service"},
                },
            }
        ],
    }


@pytest.mark.asyncio
async def test_canonical_v5_store_loads_intact(hass):
    """An upstream v5 store (without this fork's new fields) loads without loss."""
    store = SmartIrrigationStorage(hass)
    await store._populate_from_data(_canonical_v5_payload())

    # Core config is preserved as stored.
    assert store.config.calctime == "23:00"
    assert store.config.use_weather_service is True
    assert store.config.weather_service == "OpenWeatherMap"

    # Fields added by this fork fall back to defaults (not required on disk).
    assert store.config.manual_coordinates_enabled is False
    assert store.config.manual_latitude is None
    assert store.config.manual_longitude is None

    # Zone preserved; optional newer fields default without raising KeyError.
    assert 0 in store.zones
    zone = store.zones[0]
    assert zone.name == "Front Lawn"
    assert zone.size == 100.0
    assert zone.bucket == -3.0
    assert zone.duration == 600
    assert zone.maximum_duration == const.CONF_DEFAULT_MAXIMUM_DURATION
    assert zone.drainage_rate is None

    # Mapping preserved; the loader drops the legacy temp source entries and
    # ensures the current-precipitation slot exists.
    assert 0 in store.mappings
    the_map = store.mappings[0].mappings
    assert const.MAPPING_MAX_TEMP not in the_map
    assert const.MAPPING_MIN_TEMP not in the_map
    assert const.MAPPING_CURRENT_PRECIPITATION in the_map
    assert "Temperature" in the_map


@pytest.mark.asyncio
async def test_unknown_config_keys_do_not_break_load(hass):
    """Stray or legacy keys in the stored config are ignored, not fatal."""
    payload = _canonical_v5_payload()
    payload["config"]["use_owm"] = True  # legacy key removed long ago
    payload["config"]["some_obsolete_setting"] = 42

    store = SmartIrrigationStorage(hass)
    await store._populate_from_data(payload)  # must not raise

    assert store.config.calctime == "23:00"


@pytest.mark.asyncio
async def test_migrate_v4_to_v5_adds_fields_and_strips_unknown(hass):
    """The version migration adds the v5 config fields and strips unknown keys."""
    mstore = MigratableStore(hass, STORAGE_VERSION, STORAGE_KEY)
    data = {
        "config": {
            const.CONF_CALC_TIME: "06:00",
            const.CONF_USE_WEATHER_SERVICE: True,
            "use_owm": True,  # legacy key, must be stripped
            "obsolete_field": "x",  # unknown key, must be stripped
        }
    }

    migrated = await mstore._async_migrate_func(4, data)
    cfg = migrated["config"]

    # v5 fields are added with their defaults.
    assert const.CONF_IRRIGATION_START_TRIGGERS in cfg
    assert const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION in cfg
    assert const.CONF_DAYS_BETWEEN_IRRIGATION in cfg

    # Unknown/legacy keys are stripped (they would otherwise TypeError on
    # Config(**cfg) since they are not attributes of the Config class).
    assert "use_owm" not in cfg
    assert "obsolete_field" not in cfg
