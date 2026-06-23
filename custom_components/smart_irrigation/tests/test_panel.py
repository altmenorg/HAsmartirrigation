"""Test the Smart Irrigation panel registration."""

from unittest.mock import AsyncMock, Mock, patch

import pytest
from homeassistant.core import HomeAssistant

from custom_components.smart_irrigation.const import (
    DOMAIN,
    PANEL_ICON,
    PANEL_NAME,
    PANEL_TITLE,
    PANEL_URL,
)
from custom_components.smart_irrigation.panel import async_register_panel, remove_panel


class TestSmartIrrigationPanel:
    """Test Smart Irrigation panel registration."""

    @pytest.fixture
    def mock_hass(self):
        """Return a mock Home Assistant instance."""
        hass = Mock(spec=HomeAssistant)
        hass.config = Mock()
        hass.config.path = Mock(return_value="/config")
        hass.http = Mock()
        hass.http.async_register_static_paths = AsyncMock()
        return hass

    async def test_async_register_panel(self, mock_hass):
        """Test panel registration."""
        with patch(
            "custom_components.smart_irrigation.panel.panel_custom.async_register_panel"
        ) as mock_register:
            await async_register_panel(mock_hass)

            # Verify static path registration
            mock_hass.http.async_register_static_paths.assert_called_once()

            # Verify panel registration
            mock_register.assert_called_once()
            call_args = mock_register.call_args

            assert call_args[0][0] == mock_hass  # First positional arg is hass
            assert call_args[1]["webcomponent_name"] == PANEL_NAME
            assert call_args[1]["frontend_url_path"] == DOMAIN
            assert call_args[1]["module_url"] == PANEL_URL
            assert call_args[1]["sidebar_title"] == PANEL_TITLE
            assert call_args[1]["sidebar_icon"] == PANEL_ICON
            assert call_args[1]["require_admin"] is True
            assert call_args[1]["config"] == {}

    async def test_async_register_panel_static_path_config(self, mock_hass):
        """Test panel registration static path configuration."""
        with patch(
            "custom_components.smart_irrigation.panel.panel_custom.async_register_panel"
        ):
            await async_register_panel(mock_hass)

            # Check the static path configuration
            call_args = mock_hass.http.async_register_static_paths.call_args[0][0]
            assert len(call_args) == 1

            static_config = call_args[0]
            assert static_config.url_path == PANEL_URL
            assert static_config.cache_headers is False
            # Path should point to the panel file
            assert "smart_irrigation" in str(static_config.path)
            assert "frontend/dist/smart-irrigation.js" in str(static_config.path)

    def test_remove_panel(self, mock_hass):
        """Test panel removal."""
        with patch(
            "custom_components.smart_irrigation.panel.frontend.async_remove_panel"
        ) as mock_remove:
            remove_panel(mock_hass)

            mock_remove.assert_called_once_with(mock_hass, DOMAIN)

    async def test_panel_path_construction(self, mock_hass):
        """Test that panel path is constructed correctly."""
        mock_hass.config.path.return_value = "/test/config"

        with patch(
            "custom_components.smart_irrigation.panel.panel_custom.async_register_panel"
        ):
            await async_register_panel(mock_hass)

            # Verify config.path was called with correct argument
            mock_hass.config.path.assert_called_with("custom_components")

            # Verify static path registration was called
            mock_hass.http.async_register_static_paths.assert_called_once()
