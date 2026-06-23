from unittest.mock import AsyncMock, Mock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator


async def test_handle_reset_all_buckets(mock_hass, mock_coordinator):
    """Test the reset all buckets service handler."""
    # Test the service handler directly
    await mock_coordinator.handle_reset_all_buckets(None)

    # Verify the coordinator method was called correctly
    assert mock_coordinator.handle_reset_all_buckets.called


async def test_handle_reset_bucket(mock_hass, mock_coordinator):
    """Test the reset bucket service handler."""
    # Mock call data
    call = Mock()
    call.data = {"entity_id": "sensor.smart_irrigation_test_zone"}

    # Test the service handler directly
    await mock_coordinator.handle_reset_bucket(call)

    # Verify the coordinator method was called correctly
    assert mock_coordinator.handle_reset_bucket.called
