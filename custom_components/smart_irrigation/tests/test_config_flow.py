"""Test Smart Irrigation config flow."""

import sys
from unittest.mock import AsyncMock, MagicMock, patch

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.config_flow import CannotConnect, InvalidAuth
from tests.common import MockConfigEntry

# Patch all problematic modules BEFORE any Home Assistant imports
sys.modules["homeassistant.helpers.trigger"] = MagicMock()
sys.modules["homeassistant.helpers.device_registry"] = MagicMock()
sys.modules["homeassistant.components.frontend"] = MagicMock()
sys.modules["homeassistant.components.websocket_api"] = MagicMock()

# Mock the specific functions that are causing issues
trigger_mock = MagicMock()
trigger_mock.async_initialize_triggers = AsyncMock(return_value=None)
sys.modules["homeassistant.helpers.trigger"] = trigger_mock

device_registry_mock = MagicMock()
device_registry_mock.async_get = MagicMock(return_value=MagicMock())
sys.modules["homeassistant.helpers.device_registry"] = device_registry_mock

frontend_mock = MagicMock()
frontend_mock.async_register_built_in_panel = MagicMock()
sys.modules["homeassistant.components.frontend"] = frontend_mock

websocket_mock = MagicMock()
websocket_mock.async_register_command = MagicMock()
sys.modules["homeassistant.components.websocket_api"] = websocket_mock


class TestSmartIrrigationConfigFlow:
    """Test Smart Irrigation config flow."""

    async def test_form_user_step(self, hass: HomeAssistant) -> None:
        """Test we get the form for user step."""
        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        assert result["type"] is FlowResultType.FORM
        assert result["errors"] == {}

    async def test_form_user_step_single_instance(self, hass: HomeAssistant) -> None:
        """Test single instance check."""
        config_entry = MockConfigEntry(
            domain=const.DOMAIN,
            title=const.NAME,
            data={},
            entry_id="existing_entry",
        )
        config_entry.add_to_hass(hass)

        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        assert result["type"] is FlowResultType.ABORT
        assert result["reason"] == "single_instance_allowed"

    async def test_form_user_step_without_weather_service(
        self, hass: HomeAssistant
    ) -> None:
        """Test form submission without weather service."""
        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        user_input = {
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: False,
        }

        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"], user_input
        )

        assert result2["type"] is FlowResultType.CREATE_ENTRY
        assert result2["title"] == const.NAME
        assert result2["data"] == user_input

    async def test_form_user_step_with_weather_service(
        self, hass: HomeAssistant
    ) -> None:
        """Test form submission with weather service enabled."""
        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        user_input = {
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: True,
        }

        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"], user_input
        )

        assert result2["type"] is FlowResultType.FORM
        assert result2["step_id"] == "step1"

    @patch("custom_components.smart_irrigation.helpers.validate_api_key")
    async def test_weather_service_step_owm(
        self, mock_test_api: AsyncMock, hass: HomeAssistant
    ) -> None:
        """Test weather service configuration step with OWM."""
        mock_test_api.return_value = None

        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        user_input_1 = {
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: True,
        }

        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"], user_input_1
        )

        user_input_2 = {
            const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OWM,
            const.CONF_WEATHER_SERVICE_API_KEY: "validate_api_key",
        }

        result3 = await hass.config_entries.flow.async_configure(
            result2["flow_id"], user_input_2
        )

        assert result3["type"] is FlowResultType.CREATE_ENTRY
        assert result3["title"] == const.NAME
        expected_data = {**user_input_1, **user_input_2}
        assert result3["data"] == expected_data
        mock_test_api.assert_called_once()

    @patch("custom_components.smart_irrigation.helpers.validate_api_key")
    async def test_weather_service_invalid_api_key(
        self, mock_test_api: AsyncMock, hass: HomeAssistant
    ) -> None:
        """Test weather service configuration with invalid API key."""
        mock_test_api.side_effect = InvalidAuth

        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        user_input_1 = {
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: True,
        }

        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"], user_input_1
        )

        user_input_2 = {
            const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OWM,
            const.CONF_WEATHER_SERVICE_API_KEY: "invalid_key",
        }

        result3 = await hass.config_entries.flow.async_configure(
            result2["flow_id"], user_input_2
        )

        assert result3["type"] is FlowResultType.FORM
        assert result3["errors"]["base"] == "auth"

    @patch("custom_components.smart_irrigation.helpers.validate_api_key")
    async def test_weather_service_connection_error(
        self, mock_test_api: AsyncMock, hass: HomeAssistant
    ) -> None:
        """Test weather service configuration with connection error."""
        mock_test_api.side_effect = CannotConnect

        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        user_input_1 = {
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: True,
        }

        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"], user_input_1
        )

        user_input_2 = {
            const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OWM,
            const.CONF_WEATHER_SERVICE_API_KEY: "test_key",
        }

        result3 = await hass.config_entries.flow.async_configure(
            result2["flow_id"], user_input_2
        )

        assert result3["type"] is FlowResultType.FORM
        assert result3["errors"]["base"] == "auth"

    @patch("custom_components.smart_irrigation.async_setup_entry", return_value=True)
    async def test_options_flow(
        self, mock_setup_entry: AsyncMock, hass: HomeAssistant
    ) -> None:
        """Test options flow."""
        config_entry = MockConfigEntry(
            domain=const.DOMAIN,
            title=const.NAME,
            data={
                const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
                const.CONF_USE_WEATHER_SERVICE: False,
            },
            entry_id="test_entry",
        )
        config_entry.add_to_hass(hass)

        result = await hass.config_entries.options.async_init(config_entry.entry_id)

        assert result["type"] is FlowResultType.FORM
        assert result["step_id"] == "init"
