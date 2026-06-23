"""Test the Smart Irrigation localization utilities."""

import json
from unittest.mock import AsyncMock, mock_open, patch

import pytest

from custom_components.smart_irrigation.localize import get_string_from_data, localize


class TestSmartIrrigationLocalize:
    """Test Smart Irrigation localization utilities."""

    @pytest.fixture
    def mock_translations(self):
        """Return mock translation data."""
        return {
            "en": {
                "common": {"hello": "Hello", "world": "World"},
                "zones": {"bucket": "Bucket", "enabled": "Enabled"},
            },
            "de": {
                "common": {"hello": "Hallo", "world": "Welt"},
                "zones": {"bucket": "Eimer"},
            },
        }

    async def test_localize_english(self, mock_translations):
        """Test localization for English."""
        with patch("aiofiles.open", mock_open()) as mock_file:
            mock_file.return_value.__aenter__.return_value.read = AsyncMock(
                return_value=json.dumps(mock_translations["en"])
            )

            result = await localize("common.hello", "en")
            assert result == "Hello"

    async def test_localize_german(self, mock_translations):
        """Test localization for German."""
        with patch("aiofiles.open", mock_open()) as mock_file:
            # First call for German, second call for English fallback
            mock_file.return_value.__aenter__.return_value.read = AsyncMock(
                side_effect=[
                    json.dumps(mock_translations["de"]),
                    json.dumps(mock_translations["en"]),
                ]
            )

            result = await localize("common.hello", "de")
            assert result == "Hallo"

    async def test_localize_fallback_to_english(self, mock_translations):
        """Test fallback to English when German translation is missing."""
        with patch("aiofiles.open", mock_open()) as mock_file:
            # First call for German (missing key), second call for English
            mock_file.return_value.__aenter__.return_value.read = AsyncMock(
                side_effect=[
                    json.dumps(mock_translations["de"]),
                    json.dumps(mock_translations["en"]),
                ]
            )

            result = await localize("zones.enabled", "de")  # Not in German
            assert result == "Enabled"

    async def test_localize_unsupported_language(self, mock_translations):
        """Test localization for unsupported language falls back to English."""
        with patch("aiofiles.open", mock_open()) as mock_file:
            mock_file.return_value.__aenter__.return_value.read = AsyncMock(
                return_value=json.dumps(mock_translations["en"])
            )

            result = await localize("common.hello", "fr")  # Unsupported
            assert result == "Hello"

    async def test_localize_key_not_found(self, mock_translations):
        """Test localization when key is not found."""
        with patch("aiofiles.open", mock_open()) as mock_file:
            mock_file.return_value.__aenter__.return_value.read = AsyncMock(
                return_value=json.dumps(mock_translations["en"])
            )

            result = await localize("nonexistent.key", "en")
            assert result == "nonexistent.key"

    async def test_localize_file_not_found(self):
        """Test localization when file cannot be opened."""
        with patch("aiofiles.open", side_effect=OSError("File not found")):
            result = await localize("common.hello", "en")
            assert result is None  # Function returns None on OSError

    async def test_localize_case_insensitive(self, mock_translations):
        """Test localization is case insensitive for language codes."""
        with patch("aiofiles.open", mock_open()) as mock_file:
            mock_file.return_value.__aenter__.return_value.read = AsyncMock(
                side_effect=[
                    json.dumps(mock_translations["de"]),
                    json.dumps(mock_translations["en"]),
                ]
            )

            result = await localize("common.hello", "DE")  # Uppercase
            assert result == "Hallo"

    def test_get_string_from_data_simple(self):
        """Test getting string from data with simple path."""
        data = {"hello": "world"}
        result = get_string_from_data(["hello"], data)
        assert result == "world"

    def test_get_string_from_data_nested(self):
        """Test getting string from data with nested path."""
        data = {"common": {"greetings": {"hello": "Hello World"}}}
        result = get_string_from_data(["common", "greetings", "hello"], data)
        assert result == "Hello World"

    def test_get_string_from_data_partial_path(self):
        """Test getting string from data with partial valid path."""
        data = {"common": {"hello": "Hello", "nested": {"world": "World"}}}
        result = get_string_from_data(["common", "nonexistent"], data)
        assert result == {"hello": "Hello", "nested": {"world": "World"}}

    def test_get_string_from_data_string_early_termination(self):
        """Test getting string from data when encountering string early."""
        data = {"common": "This is a string, not a dict"}
        result = get_string_from_data(["common", "hello"], data)
        assert result == "This is a string, not a dict"

    def test_get_string_from_data_empty_path(self):
        """Test getting string from data with empty path."""
        data = {"hello": "world"}
        result = get_string_from_data([], data)
        assert result == data

    def test_get_string_from_data_missing_key(self):
        """Test getting string from data with missing key."""
        data = {"hello": "world"}
        result = get_string_from_data(["nonexistent"], data)
        assert result == {"hello": "world"}
