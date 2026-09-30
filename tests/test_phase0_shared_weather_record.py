"""Two sensor groups must never share one weather record (audit 0.2).

OpenWeatherMap and Pirate Weather return their cached dict itself, the same
object for every group read in one pass. Each group edited it -- its sensors
merged in, sensor-sourced keys removed, the timestamp -- and stored it, so a
group fed only by the service could end up with another group's greenhouse
temperature. Open-Meteo builds a new dict each call, which hid this.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const

GARDEN, GREENHOUSE = 0, 1


def _coordinator(cache):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()

    async def run(fn, *args):
        return fn(*args)

    coordinator.hass.async_add_executor_job = run
    coordinator.use_weather_service = True
    client = MagicMock()
    client.get_data = MagicMock(return_value=cache)
    coordinator._WeatherServiceClient = client
    mappings = {
        GARDEN: {const.MAPPING_ID: GARDEN, const.MAPPING_DATA: []},
        GREENHOUSE: {const.MAPPING_ID: GREENHOUSE, const.MAPPING_DATA: []},
    }
    coordinator.store = MagicMock()
    coordinator.store.get_mapping = MagicMock(side_effect=mappings.get)

    async def update_mapping(mapping_id, data):
        mappings[mapping_id].update(data)

    coordinator.store.async_update_mapping = AsyncMock(side_effect=update_mapping)
    coordinator.store.async_update_zone = AsyncMock()
    coordinator._get_zones_that_use_this_mapping = AsyncMock(return_value=[])
    # Garden: all from the service. Greenhouse: its own temperature sensor.
    coordinator.check_mapping_sources = lambda mapping_id: (
        True,
        mapping_id == GREENHOUSE,
        False,
    )
    coordinator._get_sensor_sourced_keys = lambda mapping: (
        [const.MAPPING_TEMPERATURE] if mapping[const.MAPPING_ID] == GREENHOUSE else []
    )
    coordinator.build_sensor_values_for_mapping = lambda mapping: {
        const.MAPPING_TEMPERATURE: 31.0
    }
    return coordinator, mappings


@pytest.mark.asyncio
async def test_one_group_s_sensor_does_not_end_up_in_another_group_s_record():
    cache = {const.MAPPING_TEMPERATURE: 18.0, const.MAPPING_HUMIDITY: 70}
    coordinator, mappings = _coordinator(cache)

    await coordinator._async_record_weather_for_mapping(GREENHOUSE)
    await coordinator._async_record_weather_for_mapping(GARDEN)

    garden = mappings[GARDEN][const.MAPPING_DATA][-1]
    greenhouse = mappings[GREENHOUSE][const.MAPPING_DATA][-1]
    assert greenhouse[const.MAPPING_TEMPERATURE] == 31.0
    assert garden[const.MAPPING_TEMPERATURE] == 18.0
    assert garden is not greenhouse
    # And the client's cache is left as the service sent it.
    assert cache == {const.MAPPING_TEMPERATURE: 18.0, const.MAPPING_HUMIDITY: 70}
