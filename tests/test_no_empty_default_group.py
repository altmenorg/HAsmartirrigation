"""No empty default sensor group on a fresh install (finding 23 of #982).

A fresh install has no weather service, so the default sensor group was
created with nine sources pointing at sensors nobody chose: a group that looked
set up and never delivered anything, next to the group the assistant creates.
It is now created only when it can read from a weather service.
"""

from unittest.mock import AsyncMock, Mock

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import (
    MappingEntry,
    SmartIrrigationStorage,
)


def _store(hass, service=None):
    store = SmartIrrigationStorage(hass)
    store.async_schedule_save = Mock()
    store.async_factory_default_modules = AsyncMock()
    hass.data[const.DOMAIN] = {
        const.CONF_USE_WEATHER_SERVICE: service is not None,
        const.CONF_WEATHER_SERVICE: service,
    }
    return store


async def test_without_a_weather_service_no_group_is_created(hass):
    store = _store(hass)

    await store.set_up_factory_defaults()

    assert store.mappings == {}


async def test_with_a_weather_service_the_default_group_reads_from_it(hass):
    store = _store(hass, const.CONF_WEATHER_SERVICE_OM)

    await store.set_up_factory_defaults()

    assert list(store.mappings) == [0]
    sources = store.mappings[0].mappings
    assert sources[const.MAPPING_TEMPERATURE][const.MAPPING_CONF_SOURCE] == (
        const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )
    assert sources[const.MAPPING_WINDSPEED][const.MAPPING_CONF_SOURCE] == (
        const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )


async def test_the_weather_service_is_read_where_the_integration_keeps_it(hass):
    """The store's own config can lag behind; hass.data is what runs."""
    import attr

    store = _store(hass)
    store.config = attr.evolve(store.config, use_weather_service=True)

    await store.set_up_factory_defaults()

    assert store.mappings == {}


async def test_a_weather_entity_keeps_its_rain_rate_off(hass):
    """As for any new group: a weather entity reports no rain that fell."""
    store = _store(hass, const.CONF_WEATHER_SERVICE_HA)

    await store.set_up_factory_defaults()

    sources = store.mappings[0].mappings
    assert sources[const.MAPPING_CURRENT_PRECIPITATION][const.MAPPING_CONF_SOURCE] == (
        const.MAPPING_CONF_SOURCE_NONE
    )


async def test_existing_groups_are_left_alone(hass):
    store = _store(hass, const.CONF_WEATHER_SERVICE_OM)
    store.mappings = {3: MappingEntry(id=3, name="Garden", mappings={})}

    await store.set_up_factory_defaults()

    assert list(store.mappings) == [3]
