"""Test the Smart Irrigation switch platform (global weather-based skip toggle)."""

from unittest.mock import AsyncMock, Mock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.switch import (
    SmartIrrigationSkipOnPrecipitationSwitch,
)


def _hass_with_config(config: dict):
    """Return a minimal hass double wired to a coordinator/store returning config."""
    hass = Mock()
    hass.data = {}
    store = Mock()
    store.get_config = Mock(return_value=dict(config))
    coordinator = Mock()
    coordinator.store = store
    coordinator.async_update_config = AsyncMock()
    hass.data[const.DOMAIN] = {"coordinator": coordinator}
    return hass, coordinator


@pytest.fixture
def switch_entity():
    """Return a switch entity wired to a hass double, with state writes mocked."""
    hass, coordinator = _hass_with_config(
        {const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: False}
    )
    entity = SmartIrrigationSkipOnPrecipitationSwitch(hass)
    entity.hass = hass
    entity.async_write_ha_state = Mock()
    return entity, coordinator


def test_unique_id_and_entity_id():
    """The switch has a stable, hub-scoped unique_id and entity_id."""
    hass, _ = _hass_with_config({})
    entity = SmartIrrigationSkipOnPrecipitationSwitch(hass)
    assert entity.unique_id == f"{const.DOMAIN}_skip_irrigation_on_precipitation"
    assert entity.entity_id == f"switch.{const.DOMAIN}_skip_on_precipitation"


async def test_initial_state_reflects_store(switch_entity):
    """async_added_to_hass reads the initial value from the store."""
    entity, _coordinator = switch_entity
    await entity.async_added_to_hass()
    assert entity.is_on is False


async def test_initial_state_defaults_when_missing():
    """Falls back to the integration default when the config key is absent."""
    hass, _coordinator = _hass_with_config({})
    entity = SmartIrrigationSkipOnPrecipitationSwitch(hass)
    entity.hass = hass
    entity.async_write_ha_state = Mock()
    await entity.async_added_to_hass()
    assert entity.is_on == const.CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION


async def test_turn_on_persists_via_coordinator(switch_entity):
    """Turning on writes through coordinator.async_update_config and updates state."""
    entity, coordinator = switch_entity
    await entity.async_turn_on()
    coordinator.async_update_config.assert_awaited_once_with(
        {const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: True}
    )
    assert entity.is_on is True
    entity.async_write_ha_state.assert_called()


async def test_turn_off_persists_via_coordinator(switch_entity):
    """Turning off writes through coordinator.async_update_config and updates state."""
    entity, coordinator = switch_entity
    await entity.async_turn_off()
    coordinator.async_update_config.assert_awaited_once_with(
        {const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: False}
    )
    assert entity.is_on is False


async def test_global_config_update_refreshes_entity(switch_entity):
    """A global "_config_updated" dispatch (zone_id=None) re-reads the store."""
    entity, coordinator = switch_entity
    coordinator.store.get_config = Mock(
        return_value={const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: True}
    )
    entity._async_refresh(zone_id=None)
    assert entity.is_on is True
    entity.async_write_ha_state.assert_called()


async def test_zone_scoped_config_update_is_ignored(switch_entity):
    """A per-zone "_config_updated" dispatch doesn't touch this global switch."""
    entity, coordinator = switch_entity
    entity._attr_is_on = False
    coordinator.store.get_config = Mock(
        return_value={const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: True}
    )
    entity.async_write_ha_state.reset_mock()
    entity._async_refresh(zone_id=42)
    assert entity.is_on is False
    entity.async_write_ha_state.assert_not_called()
