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
    response.headers = {}
    return response


def _client():
    return om.OpenMeteoClient.__new__(om.OpenMeteoClient)


def test_a_rate_limit_pauses_open_meteo_instead_of_asking_again():
    """A second later only meets the limit again, and every caller retrying
    on its own kept it going (#911): the gate pauses for everyone."""
    with (
        patch.object(
            om.requests, "get", side_effect=[_response(429), _response(200)]
        ) as get,
        patch.object(om.time, "sleep") as sleep,
    ):
        assert _client()._request({}) is None
        assert _client()._request({"other": 1}) is None  # paused, not asked
    assert get.call_count == 1
    sleep.assert_not_called()


def test_the_pause_ends_and_open_meteo_is_asked_again():
    with (
        patch.object(
            om.requests, "get", side_effect=[_response(503)] * 3 + [_response(200)]
        ) as get,
        patch.object(om.time, "sleep"),
        patch.object(om.time, "monotonic", side_effect=[0.0, 1.0, 400.0, 401.0]),
    ):
        assert _client()._request({}) is None  # three tries, then a pause
        assert _client()._request({}) == {}  # after PAUSE_AFTER_FAILURE
    assert get.call_count == 4


def test_a_retry_after_header_sets_the_pause():
    limited = _response(429)
    limited.headers = {"Retry-After": "120"}
    with (
        patch.object(om.requests, "get", side_effect=[limited, _response(200)]),
        patch.object(om.time, "sleep"),
        patch.object(om.time, "monotonic", side_effect=[0.0, 1.0, 100.0, 122.0, 123.0]),
    ):
        assert _client()._request({}) is None
        assert _client()._request({}) is None  # 100 s: still paused
        assert _client()._request({}) == {}  # 122 s: over


def test_the_same_request_at_the_same_moment_is_asked_once():
    with patch.object(om.requests, "get", return_value=_response(200)) as get:
        first = _client()._request({"hourly": "x"})
        second = _client()._request({"hourly": "x"})
        _client()._request({"hourly": "y"})
    assert first == second == {}
    assert get.call_count == 2


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


def test_a_run_of_failures_is_logged_once_and_its_end_too(caplog):
    caplog.set_level("DEBUG", logger=om.__name__)
    with (
        patch.object(
            om.requests,
            "get",
            side_effect=[_response(429), _response(429), _response(200)],
        ),
        patch.object(om.time, "sleep"),
        patch.object(
            om.time, "monotonic", side_effect=[0.0, 1.0, 2000.0, 2001.0, 4000.0, 4001.0]
        ),
    ):
        assert _client()._request({}) is None
        assert _client()._request({}) is None  # the pause was over, asked again
        assert _client()._request({}) == {}

    warnings = [r for r in caplog.records if r.levelname == "WARNING"]
    errors = [r for r in caplog.records if r.levelname == "ERROR"]
    infos = [r.getMessage() for r in caplog.records if r.levelname == "INFO"]
    assert len(warnings) == 1
    assert "429" in warnings[0].getMessage()
    assert not errors
    assert infos == ["Open-Meteo answers again"]
