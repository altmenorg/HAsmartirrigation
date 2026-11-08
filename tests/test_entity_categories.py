"""Which zone entities a dashboard shows by default (finding 22 of #982).

Home Assistant lists an entity under Configuration or Diagnostic by its
category, leaves those out of the dashboards it generates, and creates an
entity disabled when the integration says so. Three child sensors repeat an
attribute of the duration sensor: they are diagnostic and start disabled on a
new zone. The multiplier and the two weather-skip settings are settings.
"""

from unittest.mock import MagicMock

import pytest
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity import EntityCategory
from pytest_homeassistant_custom_component.common import MockEntityPlatform

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.number import (
    SmartIrrigationPrecipitationThresholdNumber,
    SmartIrrigationZoneMultiplierEntity,
)
from custom_components.smart_irrigation.sensor import (
    DUPLICATE_DIAGNOSTIC_SUFFIXES,
    SmartIrrigationZoneChildSensor,
)
from custom_components.smart_irrigation.switch import (
    SmartIrrigationSkipOnPrecipitationSwitch,
)

CHILD_SENSORS = [
    ("bucket", const.ZONE_BUCKET),
    ("et_value", const.ZONE_DELTA),
    ("et_deficiency", const.ZONE_ET_DEFICIENCY),
    ("current_drainage", const.ZONE_CURRENT_DRAINAGE),
]


def _child(hass, suffix, data_key):
    return SmartIrrigationZoneChildSensor(
        hass, f"sensor.smart_irrigation_lawn_{suffix}", 1, "Lawn", suffix, data_key
    )


def _bare_hass():
    hass = MagicMock()
    hass.data = {}
    return hass


def test_the_duplicates_of_attributes_are_diagnostic_and_start_disabled():
    hass = _bare_hass()
    for suffix, key in CHILD_SENSORS:
        sensor = _child(hass, suffix, key)
        if suffix in DUPLICATE_DIAGNOSTIC_SUFFIXES:
            assert sensor.entity_category == EntityCategory.DIAGNOSTIC
            assert sensor.entity_registry_enabled_default is False
        else:
            assert sensor.entity_category is None
            assert sensor.entity_registry_enabled_default is True


def test_the_three_duplicates_are_also_attributes_of_the_duration_sensor():
    """Nothing is lost while they are disabled: the attribute stays."""
    keys = dict(CHILD_SENSORS)
    assert {keys[s] for s in DUPLICATE_DIAGNOSTIC_SUFFIXES} == {
        const.ZONE_DELTA,
        const.ZONE_ET_DEFICIENCY,
        const.ZONE_CURRENT_DRAINAGE,
    }
    import inspect

    from custom_components.smart_irrigation import sensor

    source = inspect.getsource(sensor.SmartIrrigationZoneEntity)
    for name in ("ZONE_DELTA", "ZONE_ET_DEFICIENCY", "ZONE_CURRENT_DRAINAGE"):
        assert f"const.{name}:" in source


def test_the_settings_are_configuration():
    hass = _bare_hass()
    multiplier = SmartIrrigationZoneMultiplierEntity(
        hass=hass,
        entity_id="number.smart_irrigation_lawn_multiplier",
        zone_id=1,
        zone_name="Lawn",
        multiplier=1.0,
    )
    assert multiplier.entity_category == EntityCategory.CONFIG
    assert (
        SmartIrrigationPrecipitationThresholdNumber(hass).entity_category
        == EntityCategory.CONFIG
    )
    assert (
        SmartIrrigationSkipOnPrecipitationSwitch(hass).entity_category
        == EntityCategory.CONFIG
    )


@pytest.mark.parametrize(
    ("suffix", "key", "disabled"),
    [
        ("et_value", const.ZONE_DELTA, True),
        ("bucket", const.ZONE_BUCKET, False),
    ],
)
async def test_a_new_zone_registers_them_that_way(hass, suffix, key, disabled):
    """What the entity registry makes of it, as for a zone created now."""
    hass.data[const.DOMAIN] = {}
    platform = MockEntityPlatform(hass, domain="sensor", platform_name=const.DOMAIN)
    sensor = _child(hass, suffix, key)
    sensor._attr_unique_id = f"{const.DOMAIN}_1_{suffix}"
    sensor._attr_device_info = None

    await platform.async_add_entities([sensor])

    entry = er.async_get(hass).async_get(sensor.entity_id)
    assert entry is not None
    if disabled:
        assert entry.disabled_by is er.RegistryEntryDisabler.INTEGRATION
        assert entry.entity_category == EntityCategory.DIAGNOSTIC
        assert hass.states.get(sensor.entity_id) is None
    else:
        assert entry.disabled_by is None
        assert entry.entity_category is None
