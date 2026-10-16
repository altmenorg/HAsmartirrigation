"""What a sensor group records from the weather service, and when it is silent.

Checked against bugs another project found in a shared ancestor:

- rain set to "none" in the group was still taken from the service's record,
  and the calculation books what the record holds;
- a group with sensors of its own stamped its last update even when the
  service had not answered, so the service looked alive;
- OpenWeatherMap raises where the other clients return None, and the group's
  own sensors were lost with it for that poll;
- the service was called silent after six hours, even when it is only polled
  once a day.
"""

from datetime import timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.liveness import service_silent_after

GROUP = 0


def _coordinator(get_data, sources, sensors=True):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()

    async def run(fn, *args):
        return fn(*args)

    coordinator.hass.async_add_executor_job = run
    coordinator.use_weather_service = True
    client = MagicMock()
    client.get_data = get_data
    coordinator._WeatherServiceClient = client
    mapping = {
        const.MAPPING_ID: GROUP,
        const.MAPPING_DATA: [],
        const.MAPPING_MAPPINGS: sources,
    }
    coordinator.store = MagicMock()
    coordinator.store.get_mapping = MagicMock(return_value=mapping)

    async def update_mapping(mapping_id, data):
        mapping.update(data)

    coordinator.store.async_update_mapping = AsyncMock(side_effect=update_mapping)
    coordinator.store.async_update_zone = AsyncMock()
    coordinator._get_zones_that_use_this_mapping = AsyncMock(return_value=[])
    coordinator.check_mapping_sources = lambda mapping_id: (True, sensors, False)
    coordinator._get_sensor_sourced_keys = lambda m: (
        [const.MAPPING_HUMIDITY] if sensors else []
    )
    coordinator.build_sensor_values_for_mapping = lambda m: {
        const.MAPPING_HUMIDITY: 55.0
    }
    return coordinator, mapping


def _source(source):
    return {const.MAPPING_CONF_SOURCE: source}


SERVICE = const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
NONE = const.MAPPING_CONF_SOURCE_NONE


@pytest.mark.asyncio
async def test_rain_set_to_none_is_not_taken_from_the_service():
    coordinator, mapping = _coordinator(
        MagicMock(
            return_value={
                const.MAPPING_TEMPERATURE: 18.0,
                const.MAPPING_CURRENT_PRECIPITATION: 2.0,
            }
        ),
        {
            const.MAPPING_TEMPERATURE: _source(SERVICE),
            const.MAPPING_CURRENT_PRECIPITATION: _source(NONE),
        },
    )

    await coordinator._async_record_weather_for_mapping(GROUP)

    [record] = mapping[const.MAPPING_DATA]
    assert const.MAPPING_CURRENT_PRECIPITATION not in record
    assert record[const.MAPPING_TEMPERATURE] == 18.0


@pytest.mark.asyncio
async def test_rain_from_the_service_is_still_taken_when_set_to_it():
    coordinator, mapping = _coordinator(
        MagicMock(return_value={const.MAPPING_CURRENT_PRECIPITATION: 2.0}),
        {const.MAPPING_CURRENT_PRECIPITATION: _source(SERVICE)},
    )

    await coordinator._async_record_weather_for_mapping(GROUP)

    assert mapping[const.MAPPING_DATA][0][const.MAPPING_CURRENT_PRECIPITATION] == 2.0


@pytest.mark.asyncio
async def test_the_service_stamp_moves_only_when_the_service_answered():
    answers = [None, {const.MAPPING_TEMPERATURE: 18.0}]
    coordinator, mapping = _coordinator(
        MagicMock(side_effect=lambda: answers.pop(0)),
        {const.MAPPING_TEMPERATURE: _source(SERVICE)},
    )

    await coordinator._async_record_weather_for_mapping(GROUP)
    assert const.MAPPING_DATA_LAST_UPDATED in mapping  # the sensors were read
    assert const.MAPPING_DATA_LAST_SERVICE_FETCH not in mapping

    await coordinator._async_record_weather_for_mapping(GROUP)
    assert const.MAPPING_DATA_LAST_SERVICE_FETCH in mapping


@pytest.mark.asyncio
async def test_a_service_that_raises_does_not_lose_the_group_s_sensors():
    coordinator, mapping = _coordinator(
        MagicMock(side_effect=OSError("Cannot interact with OWM API")),
        {const.MAPPING_TEMPERATURE: _source(SERVICE)},
    )

    await coordinator._async_record_weather_for_mapping(GROUP)

    [record] = mapping[const.MAPPING_DATA]
    assert record[const.MAPPING_HUMIDITY] == 55.0
    assert const.MAPPING_DATA_LAST_SERVICE_FETCH not in mapping


@pytest.mark.asyncio
async def test_a_service_only_group_still_reports_the_failure():
    coordinator, _ = _coordinator(
        MagicMock(side_effect=OSError("Cannot interact with OWM API")),
        {const.MAPPING_TEMPERATURE: _source(SERVICE)},
        sensors=False,
    )

    with pytest.raises(OSError):
        await coordinator._async_record_weather_for_mapping(GROUP)


def test_the_service_threshold_follows_the_polling():
    hourly = {
        const.CONF_AUTO_UPDATE_ENABLED: True,
        const.CONF_AUTO_UPDATE_SCHEDULE: const.CONF_AUTO_UPDATE_HOURLY,
        const.CONF_AUTO_UPDATE_INTERVAL: "1",
    }
    daily = {**hourly, const.CONF_AUTO_UPDATE_SCHEDULE: const.CONF_AUTO_UPDATE_DAILY}
    every_5_hours = {**hourly, const.CONF_AUTO_UPDATE_INTERVAL: "5"}
    off = {**hourly, const.CONF_AUTO_UPDATE_ENABLED: False}

    assert service_silent_after(hourly) == timedelta(hours=6)
    assert service_silent_after(every_5_hours) == timedelta(hours=10)
    assert service_silent_after(daily) == timedelta(days=2)
    assert service_silent_after(off) == timedelta(days=2)
