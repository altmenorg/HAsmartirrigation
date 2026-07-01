"""Test the Smart Irrigation number platform's global precipitation threshold.

The per-zone multiplier entity (SmartIrrigationZoneMultiplierEntity) has no
existing test coverage to extend; these tests cover the new
SmartIrrigationPrecipitationThresholdNumber hub entity only.
"""

from unittest.mock import AsyncMock, Mock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.number import (
    SmartIrrigationPrecipitationThresholdNumber,
)


def _hass_with_config(config: dict, units=METRIC_SYSTEM):
    """Return a minimal hass double wired to a coordinator/store returning config."""
    hass = Mock()
    hass.data = {}
    hass.config = Mock()
    hass.config.units = units
    store = Mock()
    store.get_config = Mock(return_value=dict(config))
    coordinator = Mock()
    coordinator.store = store
    coordinator.async_update_config = AsyncMock()
    hass.data[const.DOMAIN] = {"coordinator": coordinator}
    return hass, coordinator


@pytest.fixture
def number_entity():
    """Return a number entity (metric) wired to a hass double."""
    hass, coordinator = _hass_with_config(
        {const.CONF_PRECIPITATION_THRESHOLD_MM: 3.0}, units=METRIC_SYSTEM
    )
    entity = SmartIrrigationPrecipitationThresholdNumber(hass)
    entity.hass = hass
    entity.async_write_ha_state = Mock()
    return entity, coordinator


def test_unique_id_and_entity_id():
    """The number has a stable, hub-scoped unique_id and entity_id."""
    hass, _ = _hass_with_config({})
    entity = SmartIrrigationPrecipitationThresholdNumber(hass)
    assert entity.unique_id == f"{const.DOMAIN}_precipitation_threshold"
    assert entity.entity_id == f"number.{const.DOMAIN}_precipitation_threshold"


async def test_initial_state_reflects_store_metric(number_entity):
    """In a metric HA instance, the value and unit are mm, unconverted."""
    entity, _coordinator = number_entity
    await entity.async_added_to_hass()
    assert entity.native_value == 3.0
    assert entity.native_unit_of_measurement == const.UNIT_MM


async def test_initial_state_defaults_when_missing():
    """Falls back to the integration default when the config key is absent."""
    hass, _coordinator = _hass_with_config({}, units=METRIC_SYSTEM)
    entity = SmartIrrigationPrecipitationThresholdNumber(hass)
    entity.hass = hass
    entity.async_write_ha_state = Mock()
    await entity.async_added_to_hass()
    assert entity.native_value == const.CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM


async def test_imperial_instance_displays_inches():
    """In an imperial HA instance, the mm store value displays as inches."""
    hass, _coordinator = _hass_with_config(
        {const.CONF_PRECIPITATION_THRESHOLD_MM: 25.4}, units=US_CUSTOMARY_SYSTEM
    )
    entity = SmartIrrigationPrecipitationThresholdNumber(hass)
    entity.hass = hass
    entity.async_write_ha_state = Mock()
    await entity.async_added_to_hass()
    assert entity.native_unit_of_measurement == const.UNIT_INCH
    assert entity.native_value == pytest.approx(1.0, abs=0.01)


async def test_set_native_value_metric_passes_value_through(number_entity):
    """On a metric instance, the raw mm value is sent straight to the coordinator."""
    entity, coordinator = number_entity
    await entity.async_set_native_value(5.5)
    coordinator.async_update_config.assert_awaited_once_with(
        {const.CONF_PRECIPITATION_THRESHOLD_MM: 5.5}
    )


async def test_set_native_value_imperial_sends_raw_display_value():
    """On an imperial instance, the raw (inch) value is sent, not pre-converted.

    The coordinator's own async_update_config() applies the inches -> mm
    conversion when HA is non-metric (see __init__.py), so this entity must not
    convert twice.
    """
    hass, coordinator = _hass_with_config(
        {const.CONF_PRECIPITATION_THRESHOLD_MM: 25.4}, units=US_CUSTOMARY_SYSTEM
    )
    entity = SmartIrrigationPrecipitationThresholdNumber(hass)
    entity.hass = hass
    entity.async_write_ha_state = Mock()
    await entity.async_set_native_value(2.0)
    coordinator.async_update_config.assert_awaited_once_with(
        {const.CONF_PRECIPITATION_THRESHOLD_MM: 2.0}
    )


async def test_global_config_update_refreshes_entity(number_entity):
    """A global "_config_updated" dispatch (zone_id=None) re-reads the store."""
    entity, coordinator = number_entity
    coordinator.store.get_config = Mock(
        return_value={const.CONF_PRECIPITATION_THRESHOLD_MM: 9.0}
    )
    entity._async_refresh(zone_id=None)
    assert entity.native_value == 9.0
    entity.async_write_ha_state.assert_called()


async def test_zone_scoped_config_update_is_ignored(number_entity):
    """A per-zone "_config_updated" dispatch doesn't touch this global number."""
    entity, coordinator = number_entity
    entity._threshold_mm = 3.0
    coordinator.store.get_config = Mock(
        return_value={const.CONF_PRECIPITATION_THRESHOLD_MM: 9.0}
    )
    entity.async_write_ha_state.reset_mock()
    entity._async_refresh(zone_id=42)
    assert entity.native_value == 3.0
    entity.async_write_ha_state.assert_not_called()
