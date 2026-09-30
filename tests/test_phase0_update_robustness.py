"""One weather-service failure costs one sensor group (audit 0.14).

- An exception while recording one group escaped the update pass, and every
  group after it went without a reading for the hour.
- Open-Meteo retried at once, even on a rate limit, and a timeout escaped
  instead of being retried.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import requests

from custom_components.smart_irrigation import SmartIrrigationCoordinator
from custom_components.smart_irrigation.weathermodules import OpenMeteoClient as om


@pytest.mark.asyncio
async def test_a_failing_group_does_not_stop_the_others():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.async_get_zones = AsyncMock(return_value=[])
    coordinator.store.async_get_config = AsyncMock(return_value={})
    coordinator._get_unique_mappings_for_automatic_zones = AsyncMock(
        return_value=[0, 1, 2]
    )
    coordinator.check_mapping_sources = lambda mapping_id: (True, False, False)
    recorded = []

    async def record(mapping_id):
        if mapping_id == 0:
            raise OSError("Cannot interact with OWM API")
        recorded.append(mapping_id)

    coordinator._async_record_weather_for_mapping = record

    await coordinator._async_update_all()

    assert recorded == [1, 2]


def _response(status):
    response = MagicMock()
    response.status_code = status
    response.text = "{}"
    return response


def _client():
    return om.OpenMeteoClient.__new__(om.OpenMeteoClient)


def test_a_rate_limit_is_retried_after_a_pause():
    with (
        patch.object(
            om.requests, "get", side_effect=[_response(429), _response(200)]
        ) as get,
        patch.object(om.time, "sleep") as sleep,
    ):
        assert _client()._request({}) == {}
    assert get.call_count == 2
    sleep.assert_called_once_with(1)


def test_a_request_error_is_not_retried():
    with (
        patch.object(om.requests, "get", return_value=_response(400)) as get,
        patch.object(om.time, "sleep"),
    ):
        assert _client()._request({}) is None
    assert get.call_count == 1


def test_a_timeout_is_retried_rather_than_raised():
    with (
        patch.object(
            om.requests,
            "get",
            side_effect=[requests.Timeout("slow"), _response(200)],
        ),
        patch.object(om.time, "sleep"),
    ):
        assert _client()._request({}) == {}
