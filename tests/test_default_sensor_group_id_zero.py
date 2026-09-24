"""A sensor group with id 0 is a real group, and its buffer is a real list.

Two defects reported together in #846, both on a default install:

- ``_async_calculate_all`` looked its zone's sensor group up behind
  ``if mapping_id``. The group created on a fresh install has id 0, which is
  falsy, so the group was never fetched, the zone had no weather data and every
  calculation logged "no sensor data available". The workaround was to create a
  second group, whose id is 1.
- the buffer defaulted to the string ``"[]"``. It is truthy, so a reader that
  checks truthiness takes it for a buffer holding readings and then appends to
  a string.
"""

from unittest.mock import AsyncMock, Mock

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.store import (
    MappingEntry,
    SmartIrrigationStorage,
    as_reading_list,
)


def _calculator(mapping_id):
    """A coordinator with one automatic zone reading the group `mapping_id`."""
    calc = CalculationMixin()
    calc.hass = Mock()
    calc.use_weather_service = False
    calc.store = Mock()
    calc.store.async_get_zones = AsyncMock(
        return_value=[
            {
                const.ZONE_ID: 1,
                const.ZONE_NAME: "zone",
                const.ZONE_MAPPING: mapping_id,
                const.ZONE_MODULE: 0,
                const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            }
        ]
    )
    calc.store.async_get_config = AsyncMock(return_value={})
    calc.store.get_mapping = Mock(
        return_value={
            const.MAPPING_ID: mapping_id,
            const.MAPPING_DATA: [{const.MAPPING_TEMPERATURE: 20.0}],
        }
    )
    calc.store.async_update_mapping = AsyncMock()
    calc._get_unique_mappings_for_automatic_zones = AsyncMock(return_value=[mapping_id])
    calc.apply_aggregates_to_mapping_data = AsyncMock(return_value={"aggregated": 1})
    calc.getModuleInstanceByID = AsyncMock(return_value=None)
    calc.async_calculate_zone = AsyncMock(
        return_value={const.ZONE_BUCKET: -7.5, const.ZONE_DURATION: 900}
    )
    calc.prune_consumed_readings = AsyncMock()
    calc.register_start_event = AsyncMock()
    calc.zone_window_start = Mock(return_value=None)
    return calc


async def test_a_zone_on_the_default_sensor_group_is_calculated():
    """The regression: group 0 is the one a fresh install creates."""
    calc = _calculator(0)

    results = await calc._async_calculate_all(delete_weather_data=True)

    calc.store.get_mapping.assert_called_with(0)
    calc.apply_aggregates_to_mapping_data.assert_awaited()
    assert results[1][const.ZONE_BUCKET] == -7.5


async def test_a_zone_on_a_later_sensor_group_still_is():
    """The workaround path must keep working exactly as before."""
    calc = _calculator(1)

    results = await calc._async_calculate_all(delete_weather_data=True)

    assert results[1][const.ZONE_BUCKET] == -7.5


async def test_a_zone_with_no_sensor_group_is_not_calculated():
    """ "No group" is None, and it must not be mistaken for group 0."""
    calc = _calculator(None)
    calc.store.get_mapping.reset_mock()

    results = await calc._async_calculate_all(delete_weather_data=True)

    calc.store.get_mapping.assert_not_called()
    calc.apply_aggregates_to_mapping_data.assert_not_awaited()
    assert results == {}


def test_a_new_sensor_group_starts_with_an_empty_list():
    """Not the string "[]", which every reader then has to recognise."""
    assert MappingEntry().data == []


def test_each_sensor_group_gets_its_own_buffer():
    """A shared default list would collect the readings of every group."""
    first, second = MappingEntry(), MappingEntry()

    first.data.append({"reading": 1})

    assert second.data == []


def test_a_stored_string_buffer_is_read_as_a_list():
    """Installs created before this carry the string on disk."""
    assert as_reading_list("[]") == []
    assert as_reading_list(None) == []
    assert as_reading_list("not json") == []
    assert as_reading_list([{"reading": 1}]) == [{"reading": 1}]
    # A buffer posted as JSON is decoded rather than thrown away.
    assert as_reading_list('[{"Temperature": 20.0}]') == [{"Temperature": 20.0}]


async def test_a_buffer_sent_as_a_string_is_stored_as_a_list():
    """The API takes what a caller sends, so it coerces on the way in."""
    store = SmartIrrigationStorage.__new__(SmartIrrigationStorage)
    store.mappings = {}
    store.config = Mock(use_weather_service=False)
    store.async_schedule_save = Mock()
    store.async_get_mappings = AsyncMock(return_value=[])

    created = await store.async_create_mapping(
        {const.MAPPING_NAME: "group", const.MAPPING_DATA: "[]"}
    )
    assert created[const.MAPPING_DATA] == []

    updated = await store.async_update_mapping(
        created[const.MAPPING_ID], {const.MAPPING_DATA: '[{"Temperature": 20.0}]'}
    )
    assert updated[const.MAPPING_DATA] == [{"Temperature": 20.0}]
