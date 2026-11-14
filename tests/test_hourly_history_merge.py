"""A group that measures some inputs of the ET and reads the others from
Open-Meteo takes Open-Meteo's own hourly figures for those (#961).

Until now the hourly history was used only when every input came from the
service: one local sensor sent the whole window back to the polled readings,
one value an hour standing in for the hour around it. Now each input is taken
from where the group reads it: the service's revised hour-long figure for the
inputs mapped to the service, the group's own sensors for the others.
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, Mock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import (
    CalculationMixin,
    et_row_keys_from_the_service,
)
from custom_components.smart_irrigation.hourly_rows import (
    build_hourly_rows,
    merge_history_into_rows,
    price_hourly_rows,
    summed_hourly_eto,
)

LAT, LON, ELEV = 43.6, 1.44, 150.0
OFFSET = 2.0
NOON = datetime.datetime(2026, 6, 15, 12, 0)

SERVICE = const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
SENSOR = const.MAPPING_CONF_SOURCE_SENSOR
STATIC = const.MAPPING_CONF_SOURCE_STATIC_VALUE
NONE = const.MAPPING_CONF_SOURCE_NONE


class _FixedOffset(datetime.tzinfo):
    def utcoffset(self, _dt):
        return datetime.timedelta(hours=OFFSET)

    def dst(self, _dt):
        return datetime.timedelta(0)


TZ = _FixedOffset()


def _readings(hours, wind=2.0):
    return [
        {
            const.RETRIEVED_AT: (NOON + datetime.timedelta(hours=h)).isoformat(),
            const.MAPPING_TEMPERATURE: 22.0,
            const.MAPPING_HUMIDITY: 50.0,
            const.MAPPING_WINDSPEED: wind,
            const.MAPPING_SOLRAD: 48.0,
        }
        for h in range(hours + 1)
    ]


def _entry(local_hour_start, **values):
    """An Open-Meteo hourly entry for the hour starting at a local moment."""
    stamp = local_hour_start.replace(tzinfo=TZ).timestamp()
    return {
        "ts": stamp,
        "temperature": 30.0,
        "humidity": 20.0,
        "wind": 6.0,
        "solar_mj_h": 3.0,
        "pressure_hpa": 950.0,
        **values,
    }


def _rows(hours=3):
    return build_hourly_rows(
        _readings(hours),
        NOON,
        now=NOON + datetime.timedelta(hours=hours),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=TZ,
    )


# --- the merge


def test_only_the_inputs_read_from_the_service_take_the_history():
    rows = _rows()
    before = [dict(row) for row in rows]

    merged = merge_history_into_rows(
        rows,
        [_entry(row["hour_start"]) for row in rows],
        ("wind_2m",),
        tz=TZ,
    )

    assert merged == len(rows)
    for row, old in zip(rows, before, strict=True):
        assert row["wind_2m"] == 6.0
        assert row["temperature"] == old["temperature"]
        assert row["humidity"] == old["humidity"]
        assert row["solar_mj_h"] == old["solar_mj_h"]
        assert row["coverage_h"] == old["coverage_h"]


def test_an_hour_the_history_has_not_published_keeps_its_readings():
    rows = _rows()
    old_wind = rows[-1]["wind_2m"]

    merged = merge_history_into_rows(
        rows, [_entry(row["hour_start"]) for row in rows[:-1]], ("wind_2m",), tz=TZ
    )

    assert merged == len(rows) - 1
    assert rows[0]["wind_2m"] == 6.0
    assert rows[-1]["wind_2m"] == old_wind


def test_a_malformed_entry_is_skipped_not_fatal():
    rows = _rows()
    entries = [_entry(row["hour_start"]) for row in rows]
    entries[0] = {"ts": "not a time"}

    merged = merge_history_into_rows(rows, entries, ("wind_2m",), tz=TZ)

    assert merged == len(rows) - 1
    assert rows[1]["wind_2m"] == 6.0


def test_the_pressure_is_taken_in_kilopascals():
    rows = _rows()

    merge_history_into_rows(
        rows, [_entry(row["hour_start"]) for row in rows], ("pressure_kpa",), tz=TZ
    )

    assert all(row["pressure_kpa"] == pytest.approx(95.0) for row in rows)


def test_the_window_is_priced_on_the_merged_rows():
    entries = [_entry(NOON + datetime.timedelta(hours=h)) for h in range(3)]
    merged_rows = _rows()
    merge_history_into_rows(merged_rows, entries, ("wind_2m",), tz=TZ)

    kwargs = {
        "now": NOON + datetime.timedelta(hours=3),
        "latitude": LAT,
        "longitude": LON,
        "elevation": ELEV,
        "tz": TZ,
    }
    plain, _ = summed_hourly_eto(_readings(3), NOON, **kwargs)
    total, hours = summed_hourly_eto(
        _readings(3), NOON, history=entries, history_keys=("wind_2m",), **kwargs
    )

    assert hours == pytest.approx(3.0)
    assert total == pytest.approx(sum(price_hourly_rows(merged_rows, LAT, LON, ELEV)))
    # More wind on a dry afternoon: more evaporation than the readings said.
    assert total > plain


def test_no_keys_leaves_the_readings_alone():
    entries = [_entry(NOON + datetime.timedelta(hours=h)) for h in range(3)]
    kwargs = {
        "now": NOON + datetime.timedelta(hours=3),
        "latitude": LAT,
        "longitude": LON,
        "elevation": ELEV,
        "tz": TZ,
    }

    assert summed_hourly_eto(
        _readings(3), NOON, history=entries, history_keys=(), **kwargs
    ) == summed_hourly_eto(_readings(3), NOON, **kwargs)


# --- which inputs come from the service


def _group(**changes):
    sources = {
        const.MAPPING_TEMPERATURE: SERVICE,
        const.MAPPING_HUMIDITY: SERVICE,
        const.MAPPING_WINDSPEED: SERVICE,
        const.MAPPING_PRESSURE: SERVICE,
        const.MAPPING_SOLRAD: SERVICE,
        const.MAPPING_PRECIPITATION: SERVICE,
        const.MAPPING_DEWPOINT: NONE,
        **{getattr(const, key): value for key, value in changes.items()},
    }
    return {
        const.MAPPING_MAPPINGS: {
            field: {const.MAPPING_CONF_SOURCE: source}
            for field, source in sources.items()
        }
    }


def test_a_local_thermometer_keeps_its_temperature():
    keys = et_row_keys_from_the_service(_group(MAPPING_TEMPERATURE=SENSOR))

    assert "temperature" not in keys
    assert set(keys) == {"humidity", "wind_2m", "pressure_kpa", "solar_mj_h"}


def test_a_static_value_or_an_illuminance_sensor_is_not_the_service():
    keys = et_row_keys_from_the_service(
        _group(
            MAPPING_WINDSPEED=STATIC,
            MAPPING_SOLRAD=const.MAPPING_CONF_SOURCE_ILLUMINANCE,
        )
    )

    assert set(keys) == {"temperature", "humidity", "pressure_kpa"}


def test_a_dew_point_from_the_service_stands_for_the_humidity():
    keys = et_row_keys_from_the_service(
        _group(MAPPING_HUMIDITY=NONE, MAPPING_DEWPOINT=SERVICE)
    )

    assert "humidity" in keys


def test_a_measured_humidity_is_not_overruled_by_a_service_dew_point():
    keys = et_row_keys_from_the_service(
        _group(MAPPING_HUMIDITY=SENSOR, MAPPING_DEWPOINT=SERVICE)
    )

    assert "humidity" not in keys


def test_a_group_with_every_input_measured_takes_nothing():
    assert (
        et_row_keys_from_the_service(
            _group(
                MAPPING_TEMPERATURE=SENSOR,
                MAPPING_HUMIDITY=SENSOR,
                MAPPING_WINDSPEED=SENSOR,
                MAPPING_PRESSURE=SENSOR,
                MAPPING_SOLRAD=SENSOR,
            )
        )
        == ()
    )


def test_a_group_without_mappings_takes_nothing():
    assert et_row_keys_from_the_service(None) == ()
    assert et_row_keys_from_the_service({}) == ()


# --- when the coordinator fetches it


def _coordinator(service=const.CONF_WEATHER_SERVICE_OM, entries=("an entry",)):
    class _Coordinator(CalculationMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.hass.async_add_executor_job = AsyncMock(
        side_effect=lambda func, *args: func(*args)
    )
    coordinator.use_weather_service = True
    coordinator.weather_service = service
    coordinator._WeatherServiceClient = Mock()
    coordinator._WeatherServiceClient.get_hourly_history = Mock(
        return_value=list(entries)
    )
    return coordinator


async def test_open_meteo_hands_its_history():
    coordinator = _coordinator()

    assert await coordinator._open_meteo_history_entries(_group(), NOON) == ["an entry"]


async def test_another_service_hands_nothing():
    coordinator = _coordinator(service=const.CONF_WEATHER_SERVICE_OWM)

    assert await coordinator._open_meteo_history_entries(_group(), NOON) is None
    coordinator._WeatherServiceClient.get_hourly_history.assert_not_called()


async def test_a_greenhouse_hands_nothing():
    coordinator = _coordinator()

    assert (
        await coordinator._open_meteo_history_entries(
            {**_group(), const.MAPPING_GREENHOUSE: True}, NOON
        )
        is None
    )


async def test_an_empty_or_failing_history_hands_nothing():
    coordinator = _coordinator(entries=())
    assert await coordinator._open_meteo_history_entries(_group(), NOON) is None

    coordinator._WeatherServiceClient.get_hourly_history = Mock(
        side_effect=RuntimeError("down")
    )
    assert await coordinator._open_meteo_history_entries(_group(), NOON) is None
