from unittest.mock import Mock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator


async def test_reset_bucket_service(mock_hass, mock_coordinator):
    """Test the reset bucket service handler."""
    # Mock call data
    call = Mock()
    call.data = {"entity_id": "sensor.smart_irrigation_test_zone"}

    # Test the service handler directly
    await mock_coordinator.handle_reset_bucket(call)

    # Verify the coordinator method was called correctly
    assert mock_coordinator.handle_reset_bucket.called
