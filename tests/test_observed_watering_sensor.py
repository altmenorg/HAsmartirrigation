"""The hub's "Observed watering" binary sensor (discussion #1012).

One automation shared between installs can read it to know whether Smart
Irrigation credits the runs itself or the automation must reset the balance.
"""

from types import SimpleNamespace
from unittest.mock import MagicMock

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.binary_sensor import (
    SmartIrrigationObservedWateringBinarySensor,
)


def _sensor(enabled):
    hass = MagicMock()
    config = SimpleNamespace(**{const.CONF_OBSERVED_WATERING_ENABLED: enabled})
    hass.data = {
        const.DOMAIN: {
            "coordinator": SimpleNamespace(store=SimpleNamespace(config=config))
        }
    }
    sensor = SmartIrrigationObservedWateringBinarySensor(hass)
    sensor.async_write_ha_state = MagicMock()
    return sensor, config


def test_it_says_whether_observed_watering_is_on():
    on, _ = _sensor(True)
    off, _ = _sensor(False)
    on._recompute()
    off._recompute()
    assert on.is_on is True
    assert off.is_on is False
    assert on.unique_id == f"{const.DOMAIN}_observed_watering"
    assert on.entity_id == f"binary_sensor.{const.DOMAIN}_observed_watering"


def test_it_follows_the_setting_and_ignores_zone_updates():
    sensor, config = _sensor(False)
    sensor._recompute()

    setattr(config, const.CONF_OBSERVED_WATERING_ENABLED, True)
    sensor._async_refresh(3)  # a zone saved: not the setting
    assert sensor.is_on is False
    sensor._async_refresh()
    assert sensor.is_on is True
    sensor.async_write_ha_state.assert_called_once()

    sensor._async_refresh()  # nothing changed, nothing written
    sensor.async_write_ha_state.assert_called_once()


def test_nothing_loaded_reads_off():
    hass = MagicMock()
    hass.data = {}
    sensor = SmartIrrigationObservedWateringBinarySensor(hass)
    sensor._recompute()
    assert sensor.is_on is False
