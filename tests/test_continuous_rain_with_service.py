"""A rain gauge is recorded as it reports, in a group that also uses a service (#935).

Megalos' group takes its weather from Open-Meteo and its rain from a gauge of
his own that reports every ten minutes. The five-minute replay of #931 spreads a
reading's rain back to the reading before it, so those ten-minute readings are
what it needs. Continuous updates already record the sensors of such a group as
they change (only the recalculation was held back, to spare the service), but
the setting said it "cannot be used" there, so nobody turned it on.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const

GAUGE = "sensor.weathercloud_neerslag_vandaag"


def _group():
    service = {const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_WEATHER_SERVICE}
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_DATA: [],
        const.MAPPING_MAPPINGS: {
            const.MAPPING_TEMPERATURE: dict(service),
            const.MAPPING_HUMIDITY: dict(service),
            const.MAPPING_PRECIPITATION: {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
                const.MAPPING_CONF_SENSOR: GAUGE,
            },
        },
    }


def _coordinator():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator._debounced_update_cancel = {}
    coordinator.store = MagicMock()
    coordinator.store.get_mapping = MagicMock(return_value=_group())
    coordinator.store.async_get_mappings = AsyncMock(return_value=[_group()])
    coordinator.store.async_get_zones = AsyncMock(
        return_value=[
            {
                const.ZONE_ID: 1,
                const.ZONE_MAPPING: 1,
                const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            }
        ]
    )
    coordinator.store.async_get_config = AsyncMock(
        return_value={const.CONF_SENSOR_DEBOUNCE: 0}
    )
    coordinator.store.async_update_mapping = AsyncMock()
    coordinator._sensor_reading_to_metric = lambda key, val, state, obj: float(state)
    return coordinator


@pytest.mark.asyncio
async def test_the_gauge_of_a_group_with_a_service_is_subscribed_to():
    coordinator = _coordinator()

    assert await coordinator.get_sensors_to_subscribe_to() == [GAUGE]


@pytest.mark.asyncio
async def test_each_report_of_the_gauge_is_recorded_with_its_time():
    coordinator = _coordinator()
    new_state = MagicMock()
    new_state.state = "3.4"
    event = MagicMock()
    event.data = {"entity_id": GAUGE, "new_state": new_state}

    await coordinator.async_sensor_state_changed(event)

    (mapping_id, changes), _ = coordinator.store.async_update_mapping.await_args
    assert mapping_id == 1
    [record] = changes[const.MAPPING_DATA]
    assert record[const.MAPPING_PRECIPITATION] == 3.4
    assert const.RETRIEVED_AT in record


@pytest.mark.asyncio
async def test_the_service_is_not_asked_at_each_report():
    """Recording the gauge costs no request: the group is not read again."""
    coordinator = _coordinator()
    coordinator._async_record_weather_for_mapping = AsyncMock()

    await coordinator.async_continuous_update_for_mapping(1)

    coordinator._async_record_weather_for_mapping.assert_not_awaited()
