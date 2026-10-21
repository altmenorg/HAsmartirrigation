"""A field the sensor group no longer reads must not come back from the past.

Every calculation fills the fields missing from the interval's readings with
the group's last known entry, so a source that reports rarely still counts. The
last entry keeps its keys for good, though, and nothing checked whether the
group still has a source for them.

Since v2026.8.2 a weather service feeds the rain through ``Current
Precipitation``, the rate, and the migration sets ``Precipitation`` to no
source. The value ``Precipitation`` last held, typically 0.0, stayed in the
last entry, was carried into every later calculation, and won: it is a depth,
so it takes precedence over the rate. Rain stopped reaching the bucket
entirely, with no error and nothing missing from the panel (#834).
"""

from datetime import timedelta
from unittest.mock import MagicMock

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.liveness import WeatherLivenessMixin


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.hass = MagicMock()
        self.store = MagicMock()


def _mapping(precipitation_source, last_entry):
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_NAME: "Garden",
        const.MAPPING_MAPPINGS: {
            const.MAPPING_PRECIPITATION: {
                const.MAPPING_CONF_SOURCE: precipitation_source
            },
            const.MAPPING_CURRENT_PRECIPITATION: {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
            },
        },
        const.MAPPING_DATA_LAST_ENTRY: last_entry,
    }


def _fill(mapping, data_by_sensor):
    _Coordinator()._fill_missing_from_last_entry(mapping, data_by_sensor)
    return data_by_sensor


class TestCarryingOver:
    def test_a_field_with_no_source_is_not_carried_over(self):
        """The bug, stated as a test."""
        mapping = _mapping(
            const.MAPPING_CONF_SOURCE_NONE, {const.MAPPING_PRECIPITATION: 0.0}
        )

        filled = _fill(mapping, {const.MAPPING_CURRENT_PRECIPITATION: [2.0]})

        assert const.MAPPING_PRECIPITATION not in filled

    def test_a_field_that_still_has_a_source_is_carried_over(self):
        """A rain gauge that reports rarely must still count."""
        mapping = _mapping(
            const.MAPPING_CONF_SOURCE_SENSOR, {const.MAPPING_PRECIPITATION: 1.5}
        )

        filled = _fill(mapping, {const.MAPPING_CURRENT_PRECIPITATION: [2.0]})

        assert filled[const.MAPPING_PRECIPITATION] == [1.5]

    def test_a_field_present_in_the_window_is_left_alone(self):
        mapping = _mapping(
            const.MAPPING_CONF_SOURCE_SENSOR, {const.MAPPING_PRECIPITATION: 1.5}
        )

        filled = _fill(mapping, {const.MAPPING_PRECIPITATION: [3.0, 4.0]})

        assert filled[const.MAPPING_PRECIPITATION] == [3.0, 4.0]

    def test_an_empty_source_counts_as_no_source(self):
        mapping = _mapping("", {const.MAPPING_PRECIPITATION: 0.0})

        assert const.MAPPING_PRECIPITATION not in _fill(mapping, {})

    def test_a_group_with_no_mappings_at_all_carries_nothing(self):
        mapping = {
            const.MAPPING_ID: 1,
            const.MAPPING_DATA_LAST_ENTRY: {const.MAPPING_PRECIPITATION: 0.0},
        }

        assert const.MAPPING_PRECIPITATION not in _fill(mapping, {})


class TestWhatTheCalculationThenSees:
    """The consequence, at the level the user feels it."""

    @pytest.mark.asyncio
    async def test_the_rate_is_used_once_the_stale_depth_is_gone(self):
        coord = _Coordinator()
        coord.store.get_mapping = MagicMock(
            return_value=_mapping(
                const.MAPPING_CONF_SOURCE_NONE, {const.MAPPING_PRECIPITATION: 0.0}
            )
        )
        data_by_sensor = {const.MAPPING_CURRENT_PRECIPITATION: [2.0]}
        coord._fill_missing_from_last_entry(coord.store.get_mapping(), data_by_sensor)

        weatherdata = {
            const.MAPPING_CURRENT_PRECIPITATION: 2.0,
            const.MAPPING_DATA_MULTIPLIER: 1 / 24,
            const.MAPPING_CURRENT_PRECIPITATION_SAMPLES: 1,
        }
        if const.MAPPING_PRECIPITATION in data_by_sensor:
            weatherdata[const.MAPPING_PRECIPITATION] = 0.0

        precip = coord._precipitation_for_interval({const.ZONE_MAPPING: 1}, weatherdata)

        # One hour observed at 2 mm/h, not the 0.0 mm the old depth asserted.
        assert precip == pytest.approx(2.0)


class TestASilentSourceIsNotCarriedOver:
    """A dead thermometer's last reading must not stand in for every later day.

    With continuous updates, a field missing from the window takes the group's
    last entry, which used to have no age limit: one sensor outage and the
    last temperature it sent fed every calculation after it, while the repair
    notice already said the sensor had stopped. The same threshold now decides
    both.
    """

    class _Live(CalculationMixin, WeatherLivenessMixin):
        def __init__(self, reported_hours_ago):
            self.store = MagicMock()
            self.store.get_config = MagicMock(return_value={})
            self.hass = MagicMock()
            state = MagicMock()
            state.last_reported = dt_util.utcnow() - timedelta(hours=reported_hours_ago)
            self.hass.states.get = MagicMock(return_value=state)

    @staticmethod
    def _mapping():
        return {
            const.MAPPING_ID: 1,
            const.MAPPING_NAME: "Garden",
            const.MAPPING_MAPPINGS: {
                const.MAPPING_TEMPERATURE: {
                    const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
                    const.MAPPING_CONF_SENSOR: "sensor.garden_temperature",
                },
            },
            const.MAPPING_DATA_LAST_ENTRY: {const.MAPPING_TEMPERATURE: 21.0},
        }

    def test_a_sensor_silent_beyond_the_threshold_is_left_out(self):
        coord = self._Live(reported_hours_ago=const.STALE_AFTER_HOURS + 4)
        data_by_sensor = {}

        coord._fill_missing_from_last_entry(self._mapping(), data_by_sensor)

        assert const.MAPPING_TEMPERATURE not in data_by_sensor

    def test_a_sensor_that_reported_recently_still_carries_over(self):
        """A steady temperature sends no new state, and must keep counting."""
        coord = self._Live(reported_hours_ago=1)
        data_by_sensor = {}

        coord._fill_missing_from_last_entry(self._mapping(), data_by_sensor)

        assert data_by_sensor[const.MAPPING_TEMPERATURE] == [21.0]


class TestASilentServiceTakesAllItsFieldsWithIt:
    """A weather service that stops answering supplies nothing more at all.

    The notice watches temperature, humidity and dew point, and the carry-over
    used to stop only those: the service's last wind, pressure, radiation and
    rain rate were reused in every later calculation, in a group that still
    recorded its own sensors, with nothing on screen to say so.
    """

    SERVICE_FIELDS = (
        const.MAPPING_TEMPERATURE,
        const.MAPPING_WINDSPEED,
        const.MAPPING_PRESSURE,
        const.MAPPING_SOLRAD,
        const.MAPPING_CURRENT_PRECIPITATION,
    )

    class _Live(CalculationMixin, WeatherLivenessMixin):
        def __init__(self):
            self.store = MagicMock()
            # Polled every hour: silent after the six-hour floor.
            self.store.get_config = MagicMock(return_value={})
            self.hass = MagicMock()
            state = MagicMock()
            state.last_reported = dt_util.utcnow()
            self.hass.states.get = MagicMock(return_value=state)
            self.use_weather_service = True

    @classmethod
    def _mapping(cls, fetched_hours_ago):
        mappings = {
            key: {const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_WEATHER_SERVICE}
            for key in cls.SERVICE_FIELDS
        }
        # A sensor of its own: it keeps carrying over whatever the service does.
        mappings[const.MAPPING_HUMIDITY] = {
            const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
            const.MAPPING_CONF_SENSOR: "sensor.garden_humidity",
        }
        last_entry = {key: 1.0 for key in cls.SERVICE_FIELDS}
        last_entry[const.MAPPING_HUMIDITY] = 70.0
        return {
            const.MAPPING_ID: 1,
            const.MAPPING_NAME: "Garden",
            const.MAPPING_MAPPINGS: mappings,
            const.MAPPING_DATA_LAST_ENTRY: last_entry,
            const.MAPPING_DATA_LAST_SERVICE_FETCH: (
                dt_util.utcnow() - timedelta(hours=fetched_hours_ago)
            ).isoformat(),
        }

    def test_nothing_the_silent_service_supplied_is_carried_over(self):
        data_by_sensor = {}

        self._Live()._fill_missing_from_last_entry(
            self._mapping(fetched_hours_ago=72), data_by_sensor
        )

        for key in self.SERVICE_FIELDS:
            assert key not in data_by_sensor, key
        assert data_by_sensor[const.MAPPING_HUMIDITY] == [70.0]

    def test_a_service_that_answered_recently_still_carries_over(self):
        data_by_sensor = {}

        self._Live()._fill_missing_from_last_entry(
            self._mapping(fetched_hours_ago=1), data_by_sensor
        )

        for key in self.SERVICE_FIELDS:
            assert data_by_sensor[key] == [1.0], key

    def test_without_a_weather_service_in_use_nothing_changes(self):
        coord = self._Live()
        coord.use_weather_service = False

        blocked = coord._fields_not_to_carry(self._mapping(fetched_hours_ago=72))

        assert blocked == set()
