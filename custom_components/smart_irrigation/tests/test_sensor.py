"""Test Smart Irrigation sensor platform."""

from unittest.mock import AsyncMock, Mock, patch

from homeassistant.components.sensor import DOMAIN as SENSOR_DOMAIN
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.sensor import (
    SmartIrrigationZoneEntity,
    async_setup_entry,
)


class TestSensorPlatform:
    """Test sensor platform setup."""

    async def test_async_setup_entry(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
    ) -> None:
        """Test sensor platform setup."""
        mock_add_entities = Mock(spec=AddEntitiesCallback)

        # Set up coordinator in hass data
        mock_coordinator = AsyncMock()
        hass.data[const.DOMAIN] = {
            "coordinator": mock_coordinator,
            "zones": {},
        }

        with patch(
            "custom_components.smart_irrigation.sensor.async_dispatcher_connect"
        ) as mock_connect:
            await async_setup_entry(hass, mock_config_entry, mock_add_entities)

            # Verify dispatcher connection was set up
            mock_connect.assert_called()


class TestSmartIrrigationZoneEntity:
    """Test SmartIrrigationZoneEntity."""

    def test_entity_creation(
        self,
        hass: HomeAssistant,
        mock_zone_config: dict,
    ) -> None:
        """Test zone entity creation."""
        entity_id = f"{SENSOR_DOMAIN}.{const.DOMAIN}_test_zone"

        entity = SmartIrrigationZoneEntity(
            hass=hass,
            entity_id=entity_id,
            config=mock_zone_config,
        )

        assert entity.entity_id == entity_id
        assert entity.name == mock_zone_config["name"]
        assert entity._attr_unique_id is not None

    def test_entity_properties(
        self,
        hass: HomeAssistant,
        mock_zone_config: dict,
    ) -> None:
        """Test zone entity properties."""
        entity_id = f"{SENSOR_DOMAIN}.{const.DOMAIN}_test_zone"

        entity = SmartIrrigationZoneEntity(
            hass=hass,
            entity_id=entity_id,
            config=mock_zone_config,
        )

        # Test basic properties
        assert entity.should_poll is False
        assert entity.available is True

        # Test device info
        device_info = entity.device_info
        assert device_info is not None
        assert device_info["identifiers"] == {(const.DOMAIN, "test_zone")}
        assert device_info["name"] == "Test Zone"
        assert device_info["manufacturer"] == const.MANUFACTURER

    async def test_entity_state_update(
        self,
        hass: HomeAssistant,
        mock_zone_config: dict,
    ) -> None:
        """Test zone entity state updates."""
        entity_id = f"{SENSOR_DOMAIN}.{const.DOMAIN}_test_zone"

        entity = SmartIrrigationZoneEntity(
            hass=hass,
            entity_id=entity_id,
            config=mock_zone_config,
        )

        # Mock state update
        with patch.object(entity, "async_write_ha_state") as mock_write_state:
            entity.bucket = 10.5
            entity.async_write_ha_state()
            mock_write_state.assert_called_once()

    def test_entity_attributes(
        self,
        hass: HomeAssistant,
        mock_zone_config: dict,
    ) -> None:
        """Test zone entity extra state attributes."""
        entity_id = f"{SENSOR_DOMAIN}.{const.DOMAIN}_test_zone"

        entity = SmartIrrigationZoneEntity(
            hass=hass,
            entity_id=entity_id,
            config=mock_zone_config,
        )

        # Set some test values
        entity.bucket = 5.5
        entity.netto_precipitation = 2.3
        entity.evapotranspiration = 3.2
        entity.throughput = 10.0
        entity.size = 100

        attributes = entity.extra_state_attributes

        assert attributes["bucket"] == 5.5
        assert attributes["netto_precipitation"] == 2.3
        assert attributes["evapotranspiration"] == 3.2
        assert attributes["throughput"] == 10.0
        assert attributes["size"] == 100

    async def test_entity_async_added_to_hass(
        self,
        hass: HomeAssistant,
        mock_zone_config: dict,
    ) -> None:
        """Test entity added to Home Assistant."""
        entity_id = f"{SENSOR_DOMAIN}.{const.DOMAIN}_test_zone"

        entity = SmartIrrigationZoneEntity(
            hass=hass,
            entity_id=entity_id,
            config=mock_zone_config,
        )

        with patch(
            "custom_components.smart_irrigation.sensor.async_dispatcher_connect"
        ) as mock_connect:
            await entity.async_added_to_hass()
            mock_connect.assert_called()

    async def test_entity_async_will_remove_from_hass(
        self,
        hass: HomeAssistant,
        mock_zone_config: dict,
    ) -> None:
        """Test entity removal from Home Assistant."""
        entity_id = f"{SENSOR_DOMAIN}.{const.DOMAIN}_test_zone"

        entity = SmartIrrigationZoneEntity(
            hass=hass,
            entity_id=entity_id,
            config=mock_zone_config,
        )

        # Mock unsubscriber
        entity._unsubscriber = Mock()

        await entity.async_will_remove_from_hass()

        entity._unsubscriber.assert_called_once()

    def test_async_handle_unit_system_change(
        self,
        hass: HomeAssistant,
        mock_zone_config: dict,
    ) -> None:
        """Test unit system change handling in sensor entity."""
        entity_id = f"{SENSOR_DOMAIN}.{const.DOMAIN}_test_zone"

        entity = SmartIrrigationZoneEntity(
            hass=hass,
            entity_id=entity_id,
            name=mock_zone_config["name"],
            id=mock_zone_config["id"],
            size=mock_zone_config["size"],
            throughput=mock_zone_config["throughput"],
            state=mock_zone_config["state"],
            duration=mock_zone_config["duration"],
            bucket=mock_zone_config["bucket"],
            last_updated=mock_zone_config["last_updated"],
            last_calculated=mock_zone_config["last_calculated"],
            number_of_data_points=mock_zone_config["number_of_data_points"],
            delta=mock_zone_config["delta"],
            drainage_rate=mock_zone_config["drainage_rate"],
            current_drainage=mock_zone_config["current_drainage"],
        )

        # Mock the async_schedule_update_ha_state method
        entity.async_schedule_update_ha_state = Mock()

        # Call the unit system change handler
        entity.async_handle_unit_system_change()

        # Verify state update was scheduled
        entity.async_schedule_update_ha_state.assert_called_once_with(
            force_refresh=True
        )
