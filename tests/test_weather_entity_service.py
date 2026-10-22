"""A weather entity of Home Assistant as the weather service.

Read through its attributes and weather.get_forecasts, converted from the units
Home Assistant shows them in to what the calculation works in, and never a
source of rain that fell.
"""

import asyncio
import datetime
import inspect
import math
import threading
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, Mock

import homeassistant.util.dt as dt_util
import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const, websockets
from custom_components.smart_irrigation.weathermodules.atmosphere import (
    sea_level_to_station_pressure,
)
from custom_components.smart_irrigation.weathermodules.HAWeatherEntityClient import (
    FORECAST_DAILY,
    FORECAST_HOURLY,
    FORECAST_TWICE_DAILY,
    WIND_10M_TO_2M,
    HAWeatherEntityClient,
)

ENTITY = "weather.home"
ELEVATION = 309


def _attrs(**overrides):
    attributes = {
        "temperature": 20.0,
        "temperature_unit": "°C",
        "humidity": 60,
        "pressure": 1015.0,
        "pressure_unit": "hPa",
        "wind_speed": 18.0,
        "wind_speed_unit": "km/h",
        "precipitation_unit": "mm",
        "supported_features": FORECAST_DAILY | FORECAST_HOURLY,
    }
    attributes.update(overrides)
    return attributes


def _hass(attributes=None, state="sunny", forecasts=None, loop=None):
    """A hass whose weather entity reads as told and answers get_forecasts."""
    hass = Mock()
    hass.config.units = METRIC_SYSTEM
    entity = (
        None
        if attributes is None
        else SimpleNamespace(state=state, attributes=attributes)
    )
    hass.states.get = lambda entity_id: entity if entity_id == ENTITY else None
    hass.asked = []

    async def _call(domain, service, data, **kwargs):
        hass.asked.append(data["type"])
        assert (domain, service) == ("weather", "get_forecasts")
        assert kwargs == {"blocking": True, "return_response": True}
        return {ENTITY: {"forecast": (forecasts or {}).get(data["type"], [])}}

    hass.services.async_call = _call
    if loop is not None:
        hass.loop = loop
        hass.loop_thread_id = threading.get_ident()
    return hass


async def _in_executor(function, *args):
    """As the coordinator calls a weather client: in the executor."""
    return await asyncio.get_running_loop().run_in_executor(None, function, *args)


def _day(offset, hour=0):
    moment = dt_util.start_of_local_day() + datetime.timedelta(days=offset, hours=hour)
    return moment.isoformat()


# Current values


def test_the_current_values_are_converted_to_what_the_calculation_works_in():
    client = HAWeatherEntityClient(
        _hass(
            _attrs(
                temperature=68.0,
                temperature_unit="°F",
                dew_point=50.0,
                pressure=29.92,
                pressure_unit="inHg",
                wind_speed=10.0,
                wind_speed_unit="mph",
            )
        ),
        ENTITY,
        ELEVATION,
    )

    data = client.get_data()

    assert data[const.MAPPING_TEMPERATURE] == pytest.approx(20.0)
    assert data[const.MAPPING_DEWPOINT] == pytest.approx(10.0)
    assert data[const.MAPPING_HUMIDITY] == 60
    # Sea-level pressure brought to the site, as for the other services.
    assert data[const.MAPPING_PRESSURE] == pytest.approx(
        sea_level_to_station_pressure(1013.21, ELEVATION), abs=0.1
    )
    # 10 mph at 10 m is 4.47 m/s, brought down to 2 m.
    assert data[const.MAPPING_WINDSPEED] == pytest.approx(4.4704 * WIND_10M_TO_2M)
    assert pytest.approx(4.87 / math.log(672.58)) == WIND_10M_TO_2M


def test_the_entity_is_never_a_source_of_rain_that_fell():
    data = HAWeatherEntityClient(_hass(_attrs()), ENTITY, ELEVATION).get_data()

    assert const.MAPPING_PRECIPITATION not in data
    assert const.MAPPING_CURRENT_PRECIPITATION not in data


def test_a_value_the_entity_does_not_have_is_left_out():
    """DWD's weather entity has no dew point: the calculation falls back."""
    data = HAWeatherEntityClient(_hass(_attrs()), ENTITY, ELEVATION).get_data()

    assert const.MAPPING_DEWPOINT not in data


@pytest.mark.parametrize(
    ("attributes", "state"),
    [
        (None, "sunny"),
        (_attrs(), "unavailable"),
        (_attrs(temperature=None), "sunny"),
    ],
    ids=["missing", "unavailable", "no-temperature"],
)
def test_an_entity_that_cannot_be_read_raises_as_the_other_services_do(
    attributes, state
):
    client = HAWeatherEntityClient(_hass(attributes, state), ENTITY, ELEVATION)

    with pytest.raises(OSError):
        client.get_data()


# The forecast


async def test_the_daily_forecast_becomes_dated_rows_today_first():
    forecasts = {
        "daily": [
            {
                "datetime": _day(0),
                "temperature": 22.0,
                "templow": 10.0,
                "precipitation": 0.2,
                "precipitation_unit": "in",
                "precipitation_probability": 40,
                "humidity": 70,
                "wind_speed": 18.0,
            },
            {
                "datetime": _day(1),
                "temperature": 18.0,
                "templow": 8.0,
                "precipitation": 0,
            },
        ]
    }
    hass = _hass(
        _attrs(precipitation_unit="in"),
        forecasts=forecasts,
        loop=asyncio.get_running_loop(),
    )
    client = HAWeatherEntityClient(hass, ENTITY, ELEVATION)

    rows = await _in_executor(client.get_forecast_data, True)

    today = dt_util.now().date()
    assert [row["date"] for row in rows] == [
        today.isoformat(),
        (today + datetime.timedelta(days=1)).isoformat(),
    ]
    first = rows[0]
    assert first[const.MAPPING_MAX_TEMP] == 22.0
    assert first[const.MAPPING_MIN_TEMP] == 10.0
    assert first[const.MAPPING_TEMPERATURE] == 16.0
    assert first[const.MAPPING_PRECIPITATION] == pytest.approx(5.08)
    assert first["precipitation_probability"] == 40
    assert first[const.MAPPING_HUMIDITY] == 70
    assert first[const.MAPPING_WINDSPEED] == pytest.approx(5.0 * WIND_10M_TO_2M)
    # Without today, as the PyETO averaging wants it.
    later = await _in_executor(client.get_forecast_data)
    assert [row["date"] for row in later] == [rows[1]["date"]]
    # One update cycle asks the entity once.
    assert hass.asked == ["daily"]
    assert client.get_cached_forecast_data() == later


async def test_an_entity_without_a_daily_forecast_is_folded_into_days():
    hourly = [
        {"datetime": _day(1, hour), "temperature": 10.0 + hour, "precipitation": 0.5}
        for hour in range(24)
    ]
    hass = _hass(
        _attrs(supported_features=FORECAST_HOURLY),
        forecasts={"hourly": hourly},
        loop=asyncio.get_running_loop(),
    )
    client = HAWeatherEntityClient(hass, ENTITY, ELEVATION)

    rows = await _in_executor(client.get_forecast_data, True)

    assert hass.asked == ["hourly"]
    assert len(rows) == 1
    assert rows[0][const.MAPPING_MAX_TEMP] == 33.0
    assert rows[0][const.MAPPING_MIN_TEMP] == 10.0
    assert rows[0][const.MAPPING_PRECIPITATION] == pytest.approx(12.0)


async def test_twice_daily_comes_before_hourly():
    twice = [
        {"datetime": _day(1, 6), "temperature": 15.0, "precipitation": 1.0},
        {"datetime": _day(1, 18), "temperature": 9.0, "precipitation": 2.0},
    ]
    hass = _hass(
        _attrs(supported_features=FORECAST_TWICE_DAILY | FORECAST_HOURLY),
        forecasts={"twice_daily": twice},
        loop=asyncio.get_running_loop(),
    )

    rows = await _in_executor(
        HAWeatherEntityClient(hass, ENTITY, ELEVATION).get_forecast_data, True
    )

    assert hass.asked == ["twice_daily"]
    assert rows[0][const.MAPPING_MAX_TEMP] == 15.0
    assert rows[0][const.MAPPING_MIN_TEMP] == 9.0
    assert rows[0][const.MAPPING_PRECIPITATION] == 3.0


async def test_an_entity_without_a_forecast_has_none():
    hass = _hass(_attrs(supported_features=0), loop=asyncio.get_running_loop())

    rows = await _in_executor(
        HAWeatherEntityClient(hass, ENTITY, ELEVATION).get_forecast_data, True
    )

    assert rows is None
    assert hass.asked == []


async def test_called_on_the_event_loop_it_gives_up_rather_than_hang():
    """The forecast is a call on the loop: from the loop itself it would wait forever."""
    hass = _hass(_attrs(), forecasts={"daily": []}, loop=asyncio.get_running_loop())
    client = HAWeatherEntityClient(hass, ENTITY, ELEVATION)

    assert client.get_forecast_data(True) is None
    assert hass.asked == []


@pytest.mark.parametrize("state", [None, "unavailable", "unknown"])
async def test_an_entity_that_cannot_be_read_has_no_forecast(state):
    """Missing or unavailable: no forecast, never an error.

    As the docstrings promise for an entity without a forecast. Raising here
    once ended the nightly run of every zone (fixed on that side in cea3069).
    """
    hass = _hass(
        None if state is None else _attrs(),
        state=state or "sunny",
        forecasts={"daily": [{"datetime": _day(1), "temperature": 18.0}]},
        loop=asyncio.get_running_loop(),
    )
    client = HAWeatherEntityClient(hass, ENTITY, ELEVATION)
    start = dt_util.now()

    assert await _in_executor(client.get_forecast_data, True) is None
    assert await _in_executor(client.get_forecast_data) is None
    assert (
        await _in_executor(
            client.get_expected_rain_ahead,
            start,
            start + datetime.timedelta(hours=2),
        )
        is None
    )
    assert hass.asked == []


async def test_through_the_radiation_wrapper_an_unreadable_entity_has_no_forecast():
    """As the coordinator holds it: wrapped for radiation from Open-Meteo."""
    from custom_components.smart_irrigation.weathermodules.SolarRadiationFallback import (
        SolarRadiationFallbackClient,
    )

    hass = _hass(_attrs(), state="unavailable", loop=asyncio.get_running_loop())
    client = SolarRadiationFallbackClient(
        HAWeatherEntityClient(hass, ENTITY, ELEVATION),
        latitude=49.45,
        longitude=11.08,
        elevation=ELEVATION,
    )
    client._fallback.get_forecast_data = Mock(side_effect=AssertionError)
    start = dt_util.now()

    assert await _in_executor(client.get_forecast_data) is None
    assert (
        await _in_executor(
            client.get_expected_rain_ahead,
            start,
            start + datetime.timedelta(hours=2),
        )
        is None
    )


# The rain to expect ahead of a run


async def test_the_rain_ahead_is_summed_from_the_hourly_forecast():
    start = dt_util.start_of_local_day() + datetime.timedelta(days=1)
    hourly = [
        {
            "datetime": (start + datetime.timedelta(hours=hour)).isoformat(),
            "precipitation": 2.0,
            "precipitation_probability": 50 if hour == 1 else None,
        }
        for hour in range(6)
    ]
    hass = _hass(
        _attrs(), forecasts={"hourly": hourly}, loop=asyncio.get_running_loop()
    )
    client = HAWeatherEntityClient(hass, ENTITY, ELEVATION)

    # Half of hour 0, hour 1 at 50 %, all of hour 2: 1 + 1 + 2 mm.
    expected = await _in_executor(
        client.get_expected_rain_ahead,
        start + datetime.timedelta(minutes=30),
        start + datetime.timedelta(hours=3),
    )

    assert expected == pytest.approx(4.0)


async def test_no_rain_ahead_when_the_forecast_does_not_reach_the_end():
    start = dt_util.start_of_local_day() + datetime.timedelta(days=1)
    hourly = [{"datetime": start.isoformat(), "precipitation": 1.0}]
    hass = _hass(
        _attrs(), forecasts={"hourly": hourly}, loop=asyncio.get_running_loop()
    )

    expected = await _in_executor(
        HAWeatherEntityClient(hass, ENTITY, ELEVATION).get_expected_rain_ahead,
        start,
        start + datetime.timedelta(hours=6),
    )

    assert expected is None


async def test_no_rain_ahead_without_an_hourly_forecast():
    hass = _hass(
        _attrs(supported_features=FORECAST_DAILY), loop=asyncio.get_running_loop()
    )
    start = dt_util.now()

    expected = await _in_executor(
        HAWeatherEntityClient(hass, ENTITY, ELEVATION).get_expected_rain_ahead,
        start,
        start + datetime.timedelta(hours=6),
    )

    assert expected is None
    assert hass.asked == []


# Choosing it in the panel


def _ws_hass(entity_exists=True):
    hass = MagicMock()
    hass.data = {const.DOMAIN: {}}
    coordinator = MagicMock()
    coordinator.async_apply_weather_service = AsyncMock()
    hass.data[const.DOMAIN]["coordinator"] = coordinator
    entry = MagicMock()
    entry.data = {}
    entry.options = {}
    hass.config_entries.async_entries.return_value = [entry]
    hass.states.get = lambda entity_id: (
        SimpleNamespace(state="sunny", attributes=_attrs())
        if entity_exists and entity_id == ENTITY
        else None
    )
    return hass, coordinator, entry


async def _set(hass, **msg):
    handler = inspect.unwrap(websockets.websocket_set_weather_service)
    connection = Mock()
    await handler(hass, connection, {"id": 1, **msg})
    return connection


async def test_the_entity_is_applied_and_kept_with_no_key_to_check():
    hass, coordinator, entry = _ws_hass()

    connection = await _set(
        hass,
        use_weather_service=True,
        weather_service=const.CONF_WEATHER_SERVICE_HA,
        weather_service_entity=ENTITY,
    )

    connection.send_result.assert_called_once()
    coordinator.async_apply_weather_service.assert_awaited_once_with(
        True, const.CONF_WEATHER_SERVICE_HA, None, ENTITY
    )
    data = hass.config_entries.async_update_entry.call_args.kwargs["data"]
    assert data[const.CONF_WEATHER_SERVICE_ENTITY] == ENTITY
    assert data[const.CONF_WEATHER_SERVICE_API_KEY] is None


@pytest.mark.parametrize(
    ("entity", "exists"),
    [(None, True), ("sensor.temperature", True), (ENTITY, False)],
    ids=["none", "not-a-weather-entity", "gone"],
)
async def test_without_a_weather_entity_nothing_is_changed(entity, exists):
    hass, coordinator, entry = _ws_hass(entity_exists=exists)

    connection = await _set(
        hass,
        use_weather_service=True,
        weather_service=const.CONF_WEATHER_SERVICE_HA,
        weather_service_entity=entity,
    )

    assert connection.send_error.call_args.args[1] == "invalid_entity"
    coordinator.async_apply_weather_service.assert_not_awaited()


async def test_another_service_does_not_keep_an_entity(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.helpers.validate_api_key", AsyncMock()
    )
    hass, coordinator, entry = _ws_hass()

    await _set(
        hass,
        use_weather_service=True,
        weather_service=const.CONF_WEATHER_SERVICE_OM,
        weather_service_entity=ENTITY,
    )

    coordinator.async_apply_weather_service.assert_awaited_once_with(
        True, const.CONF_WEATHER_SERVICE_OM, None, None
    )


async def test_the_panel_is_told_the_entity_and_that_it_has_no_rain():
    handler = inspect.unwrap(websockets.websocket_get_weather_service)
    hass = Mock()
    hass.data = {
        const.DOMAIN: {
            const.CONF_USE_WEATHER_SERVICE: True,
            const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_HA,
            const.CONF_WEATHER_SERVICE_ENTITY: ENTITY,
        }
    }
    connection = Mock()

    await handler(hass, connection, {"id": 1})

    result = connection.send_result.call_args.args[1]
    assert result[const.CONF_WEATHER_SERVICE_ENTITY] == ENTITY
    assert result["supplies_rain"] is False
    assert const.CONF_WEATHER_SERVICE_HA in result["services"]
    assert const.CONF_WEATHER_SERVICE_HA in result["services_without_api_key"]


# A new sensor group


def test_a_new_group_does_not_start_with_its_rain_on_the_entity():
    from custom_components.smart_irrigation.store import default_mapping_entry

    def source(key, service):
        return default_mapping_entry(key, True, service)[const.MAPPING_CONF_SOURCE]

    assert source(
        const.MAPPING_CURRENT_PRECIPITATION, const.CONF_WEATHER_SERVICE_HA
    ) == (const.MAPPING_CONF_SOURCE_NONE)
    assert source(const.MAPPING_TEMPERATURE, const.CONF_WEATHER_SERVICE_HA) == (
        const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )
    # Every other service brings its rain, and so does a group without one.
    assert source(
        const.MAPPING_CURRENT_PRECIPITATION, const.CONF_WEATHER_SERVICE_OM
    ) == (const.MAPPING_CONF_SOURCE_WEATHER_SERVICE)
    assert source(const.MAPPING_CURRENT_PRECIPITATION, None) == (
        const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )


async def test_a_group_created_without_sources_follows_the_service_in_use(hass):
    import attr

    from custom_components.smart_irrigation.store import SmartIrrigationStorage

    store = SmartIrrigationStorage(hass)
    store.config = attr.evolve(store.config, use_weather_service=True)
    store.async_schedule_save = Mock()
    hass.data[const.DOMAIN] = {
        const.CONF_USE_WEATHER_SERVICE: True,
        const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_HA,
    }

    created = await store.async_create_mapping(
        {
            const.MAPPING_NAME: "Garden",
            const.MAPPING_MAPPINGS: {
                const.MAPPING_CURRENT_PRECIPITATION: "",
                const.MAPPING_TEMPERATURE: "",
            },
        }
    )

    the_map = created[const.MAPPING_MAPPINGS]
    assert the_map[const.MAPPING_CURRENT_PRECIPITATION][const.MAPPING_CONF_SOURCE] == (
        const.MAPPING_CONF_SOURCE_NONE
    )
    assert the_map[const.MAPPING_TEMPERATURE][const.MAPPING_CONF_SOURCE] == (
        const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )


# A group left with its rain on the service


def test_a_group_with_its_rain_on_the_entity_is_warned_about_once(caplog):
    from custom_components.smart_irrigation import SmartIrrigationCoordinator

    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.weather_service = const.CONF_WEATHER_SERVICE_HA
    mapping = {
        const.MAPPING_ID: 2,
        const.MAPPING_NAME: "Garden",
        const.MAPPING_MAPPINGS: {
            const.MAPPING_PRECIPITATION: {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
            }
        },
    }

    coordinator._warn_rain_from_a_service_without_it(mapping)
    coordinator._warn_rain_from_a_service_without_it(mapping)

    warnings = [r for r in caplog.records if "no rain is recorded" in r.getMessage()]
    assert len(warnings) == 1
    assert "Garden" in warnings[0].getMessage()


def test_a_service_with_rain_is_not_warned_about(caplog):
    from custom_components.smart_irrigation import SmartIrrigationCoordinator

    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.weather_service = const.CONF_WEATHER_SERVICE_OM
    mapping = {
        const.MAPPING_ID: 2,
        const.MAPPING_MAPPINGS: {
            const.MAPPING_PRECIPITATION: {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
            }
        },
    }

    coordinator._warn_rain_from_a_service_without_it(mapping)

    assert "no rain is recorded" not in caplog.text


# Readings the entity gets wrong or leaves out


def test_a_reading_that_is_not_a_number_is_left_out():
    hass = _hass(_attrs(humidity=True, pressure=float("nan"), wind_speed=float("inf")))

    data = HAWeatherEntityClient(hass, ENTITY, ELEVATION).get_data()

    assert const.MAPPING_TEMPERATURE in data
    assert const.MAPPING_HUMIDITY not in data
    assert const.MAPPING_PRESSURE not in data
    assert const.MAPPING_WINDSPEED not in data


async def test_supported_features_that_are_not_a_number_mean_no_forecast():
    hass = _hass(
        _attrs(supported_features="daily"),
        forecasts={"daily": [{"datetime": _day(1), "temperature": 18.0}]},
        loop=asyncio.get_running_loop(),
    )

    rows = await _in_executor(
        HAWeatherEntityClient(hass, ENTITY, ELEVATION).get_forecast_data, True
    )

    assert rows is None
    assert hass.asked == []


async def test_a_forecast_answer_without_a_list_is_no_forecast():
    hass = _hass(
        _attrs(supported_features=FORECAST_DAILY), loop=asyncio.get_running_loop()
    )

    async def _call(domain, service, data, **kwargs):
        return {ENTITY: {"forecast": "unavailable"}}

    hass.services.async_call = _call

    rows = await _in_executor(
        HAWeatherEntityClient(hass, ENTITY, ELEVATION).get_forecast_data, True
    )

    assert rows is None


async def test_forecast_entries_that_cannot_be_placed_are_skipped():
    """Not an entry, no time, or a time without a zone, as some entities send."""
    naive_tomorrow = (
        dt_util.start_of_local_day() + datetime.timedelta(days=1, hours=12)
    ).replace(tzinfo=None)
    forecasts = {
        "daily": [
            "not an entry",
            {"datetime": "not a time", "temperature": 30.0},
            {"temperature": 30.0},
            # Only a low, and no rain given: the day has its low and no rain.
            {"datetime": naive_tomorrow.isoformat(), "templow": 7.0},
        ]
    }
    hass = _hass(
        _attrs(supported_features=FORECAST_DAILY),
        forecasts=forecasts,
        loop=asyncio.get_running_loop(),
    )

    rows = await _in_executor(
        HAWeatherEntityClient(hass, ENTITY, ELEVATION).get_forecast_data, True
    )

    tomorrow = (dt_util.now().date() + datetime.timedelta(days=1)).isoformat()
    assert [row["date"] for row in rows] == [tomorrow]
    assert rows[0][const.MAPPING_MIN_TEMP] == 7.0
    assert const.MAPPING_MAX_TEMP not in rows[0]
    assert rows[0][const.MAPPING_PRECIPITATION] == 0


def test_no_cached_forecast_before_one_was_read():
    client = HAWeatherEntityClient(_hass(_attrs()), ENTITY, ELEVATION)

    assert client.get_cached_forecast_data() is None


def test_no_rain_ahead_for_a_window_that_is_not_one():
    client = HAWeatherEntityClient(_hass(_attrs()), ENTITY, ELEVATION)
    now = dt_util.now()

    assert client.get_expected_rain_ahead(None, now) is None
    assert client.get_expected_rain_ahead(now, now) == 0.0
    assert client.get_expected_rain_ahead(now, now - datetime.timedelta(hours=1)) == 0.0


async def test_no_rain_ahead_from_an_empty_hourly_forecast():
    hass = _hass(_attrs(), forecasts={"hourly": []}, loop=asyncio.get_running_loop())
    start = dt_util.now()

    expected = await _in_executor(
        HAWeatherEntityClient(hass, ENTITY, ELEVATION).get_expected_rain_ahead,
        start,
        start + datetime.timedelta(hours=2),
    )

    assert expected is None
    assert hass.asked == ["hourly"]


async def test_hourly_entries_without_rain_are_skipped_in_the_rain_ahead():
    start = dt_util.start_of_local_day() + datetime.timedelta(days=1)
    hourly = [
        "not an entry",
        {"datetime": start.isoformat()},
        {
            "datetime": (start + datetime.timedelta(hours=1)).isoformat(),
            "precipitation": 1.5,
        },
    ]
    hass = _hass(
        _attrs(), forecasts={"hourly": hourly}, loop=asyncio.get_running_loop()
    )

    expected = await _in_executor(
        HAWeatherEntityClient(hass, ENTITY, ELEVATION).get_expected_rain_ahead,
        start,
        start + datetime.timedelta(hours=2),
    )

    assert expected == pytest.approx(1.5)


# Setting it up from the config entry


def _entry(options):
    entry = Mock()
    entry.entry_id = "weather_entity"
    entry.unique_id = "weather_entity"
    entry.data = {
        const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
        const.CONF_USE_WEATHER_SERVICE: True,
        const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OM,
    }
    entry.options = options
    entry.add_update_listener.return_value = Mock()
    return entry


async def test_the_entity_chosen_in_the_options_is_set_up(hass):
    from unittest.mock import patch

    from custom_components.smart_irrigation import async_setup_entry

    entry = _entry(
        {
            const.CONF_USE_WEATHER_SERVICE: True,
            const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_HA,
            const.CONF_WEATHER_SERVICE_ENTITY: ENTITY,
        }
    )
    coordinator = MagicMock()
    coordinator.id = entry.unique_id
    for name in (
        "recurring_schedule_manager.async_load_schedules",
        "seasonal_adjustment_manager.async_load_adjustments",
    ):
        owner, attribute = name.split(".")
        setattr(getattr(coordinator, owner), attribute, AsyncMock())
    for name in (
        "update_subscriptions",
        "async_setup_observed_watering",
        "async_resume_valve_runs",
        "async_restore_pause_and_queue",
        "async_setup_weather_liveness",
        "async_bind_engineless_zones",
        "async_setup_zone_unwatered_watch",
    ):
        setattr(coordinator, name, AsyncMock())
    store = AsyncMock()
    store.async_get_config.return_value = {}
    store.get_config = Mock(return_value={})

    with (
        patch(
            "custom_components.smart_irrigation.async_get_registry",
            return_value=store,
        ),
        patch(
            "custom_components.smart_irrigation.SmartIrrigationCoordinator",
            return_value=coordinator,
        ),
        patch("custom_components.smart_irrigation.dr.async_get"),
        patch(
            "custom_components.smart_irrigation._migrate_duration_unique_ids",
            new_callable=AsyncMock,
        ),
        patch("custom_components.smart_irrigation.async_register_panel"),
        patch("custom_components.smart_irrigation.async_register_websockets"),
        patch("custom_components.smart_irrigation.register_services"),
        patch.object(
            hass.config_entries, "async_forward_entry_setups", new_callable=AsyncMock
        ),
    ):
        assert await async_setup_entry(hass, entry) is True

    assert hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] == (
        const.CONF_WEATHER_SERVICE_HA
    )
    assert hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_ENTITY] == ENTITY


async def test_reconfiguring_keeps_the_entity_and_turning_it_off_clears_it(
    mock_hass,
):
    from custom_components.smart_irrigation import options_update_listener

    mock_hass.data[const.DOMAIN] = {}
    mock_hass.config_entries = Mock()
    mock_hass.config_entries.async_reload = AsyncMock()
    entry = _entry(
        {
            const.CONF_USE_WEATHER_SERVICE: True,
            const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_HA,
            const.CONF_WEATHER_SERVICE_ENTITY: ENTITY,
        }
    )

    await options_update_listener(mock_hass, entry)
    assert mock_hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_ENTITY] == ENTITY

    entry.options = {const.CONF_USE_WEATHER_SERVICE: False}
    await options_update_listener(mock_hass, entry)
    assert mock_hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_ENTITY] is None


# The coordinator's client


def _store():
    store = Mock()
    store.config.manual_coordinates_enabled = False
    store.get_config.return_value = {
        const.CONF_USE_WEATHER_SERVICE: False,
        const.CONF_WEATHER_SERVICE: None,
        const.CONF_AUTO_UPDATE_ENABLED: False,
        const.CONF_AUTO_CALC_ENABLED: False,
        const.CONF_AUTO_CLEAR_ENABLED: False,
        const.START_EVENT_FIRED_TODAY: False,
    }
    store.async_update_config = AsyncMock()
    return store


@pytest.fixture
async def make_coordinator(hass, monkeypatch):
    """A real coordinator, its midnight timer cancelled afterwards.

    Without the start-event registration the constructor schedules, which needs
    zones this test has none of.
    """
    from custom_components.smart_irrigation import SmartIrrigationCoordinator

    monkeypatch.setattr(SmartIrrigationCoordinator, "register_start_event", AsyncMock())
    made = []

    def _make(**data):
        hass.data[const.DOMAIN] = {
            const.CONF_USE_WEATHER_SERVICE: False,
            const.CONF_WEATHER_SERVICE: None,
            **data,
        }
        entry = Mock(unique_id="weather_entity", data={}, options={})
        coordinator = SmartIrrigationCoordinator(hass, None, entry, _store())
        made.append(coordinator)
        return coordinator

    yield _make
    for coordinator in made:
        if coordinator._track_midnight_time_unsub:
            coordinator._track_midnight_time_unsub()


def _primary(client):
    from custom_components.smart_irrigation.weathermodules.SolarRadiationFallback import (
        SolarRadiationFallbackClient,
    )

    assert isinstance(client, SolarRadiationFallbackClient)
    return client._primary


async def test_the_coordinator_reads_the_entity_with_radiation_from_open_meteo(
    make_coordinator,
):
    coordinator = make_coordinator(
        **{
            const.CONF_USE_WEATHER_SERVICE: True,
            const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_HA,
            const.CONF_WEATHER_SERVICE_ENTITY: ENTITY,
        }
    )

    primary = _primary(coordinator._WeatherServiceClient)
    assert isinstance(primary, HAWeatherEntityClient)
    assert primary.entity_id == ENTITY


async def test_without_an_entity_the_coordinator_has_no_client(
    make_coordinator, caplog
):
    coordinator = make_coordinator(
        **{
            const.CONF_USE_WEATHER_SERVICE: True,
            const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_HA,
        }
    )

    assert coordinator._WeatherServiceClient is None
    assert "none is chosen" in caplog.text


async def test_choosing_the_entity_in_the_panel_applies_it_in_place(
    hass, make_coordinator
):
    coordinator = make_coordinator()

    await coordinator.async_apply_weather_service(
        True, const.CONF_WEATHER_SERVICE_HA, None, ENTITY
    )

    assert _primary(coordinator._WeatherServiceClient).entity_id == ENTITY
    assert hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_ENTITY] == ENTITY
    coordinator.store.async_update_config.assert_awaited()

    await coordinator.async_apply_weather_service(
        False, const.CONF_WEATHER_SERVICE_HA, None, ENTITY
    )

    assert coordinator._WeatherServiceClient is None
    assert hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_ENTITY] is None
