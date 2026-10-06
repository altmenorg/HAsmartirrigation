"""Regression tests for weather services that do not require an API key."""

from unittest.mock import AsyncMock, Mock, patch

from homeassistant.core import HomeAssistant

from custom_components.smart_irrigation import (
    _normalize_api_key,
    async_setup_entry,
    const,
    options_update_listener,
)


def test_normalize_api_key_accepts_none_and_trims_strings() -> None:
    """Keyless services keep None while keyed services still trim whitespace."""
    assert _normalize_api_key(None) is None
    assert _normalize_api_key("  secret  ") == "secret"
    assert _normalize_api_key("") == ""


async def test_setup_entry_accepts_keyless_open_meteo(
    hass: HomeAssistant,
) -> None:
    """A persisted Open-Meteo entry with a null key must survive a restart."""
    entry = Mock()
    entry.entry_id = "keyless_open_meteo"
    entry.unique_id = "keyless_open_meteo"
    entry.data = {
        const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
        const.CONF_USE_WEATHER_SERVICE: True,
        const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OM,
        const.CONF_WEATHER_SERVICE_API_KEY: None,
    }
    entry.options = {}
    entry.add_update_listener.return_value = Mock()

    coordinator = Mock()
    coordinator.id = "keyless_open_meteo"
    coordinator.use_weather_service = True
    coordinator.recurring_schedule_manager.async_load_schedules = AsyncMock()
    coordinator.seasonal_adjustment_manager.async_load_adjustments = AsyncMock()
    coordinator.update_subscriptions = AsyncMock()
    coordinator.async_setup_observed_watering = AsyncMock()
    coordinator.async_resume_valve_runs = AsyncMock()
    coordinator.async_restore_pause_and_queue = AsyncMock()
    coordinator.async_setup_weather_liveness = AsyncMock()
    coordinator.async_setup_zone_unwatered_watch = AsyncMock()

    with (
        patch("custom_components.smart_irrigation.async_get_registry") as registry,
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
            hass.config_entries,
            "async_forward_entry_setups",
            new_callable=AsyncMock,
        ),
    ):
        store = AsyncMock()
        store.async_get_config.return_value = {
            const.CONF_USE_WEATHER_SERVICE: True,
            const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OM,
        }
        store.async_get_zones.return_value = []
        store.config = Mock(
            manual_coordinates_enabled=False,
            manual_latitude=None,
            manual_longitude=None,
            manual_elevation=0,
        )
        store.get_config = Mock(
            return_value={
                const.CONF_AUTO_UPDATE_ENABLED: False,
                const.CONF_AUTO_CALC_ENABLED: False,
                const.CONF_AUTO_CLEAR_ENABLED: False,
                const.START_EVENT_FIRED_TODAY: False,
            }
        )
        registry.return_value = store

        assert await async_setup_entry(hass, entry) is True

    assert hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] is None


async def test_options_listener_accepts_null_api_key(mock_hass) -> None:
    """Reconfiguring a keyless service must not call strip on None."""
    entry = Mock()
    entry.entry_id = "keyless_open_meteo"
    entry.options = {
        const.CONF_USE_WEATHER_SERVICE: True,
        const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OM,
        const.CONF_WEATHER_SERVICE_API_KEY: None,
    }
    mock_hass.data[const.DOMAIN] = {}
    mock_hass.config_entries = Mock()
    mock_hass.config_entries.async_reload = AsyncMock()

    await options_update_listener(mock_hass, entry)

    assert mock_hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] is None
    mock_hass.config_entries.async_reload.assert_awaited_once_with(entry.entry_id)
