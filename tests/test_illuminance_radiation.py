"""A light sensor can stand in for a solar radiation sensor (greenhouse mode).

Under glass or plastic there is no usable sky: no rain, no weather service worth
asking, and no pyranometer in most greenhouses. FAO-56 then lacks the term that
drives it. An illuminance sensor inside the greenhouse is something people do
have, and daylight relates lux to W/m2 through its luminous efficacy, so the
reading can feed Penman-Monteith properly rather than the calculation falling
back to estimating radiation from temperature.

The efficacy follows the sky (see ``illuminance``): these tests are about how
the coordinator uses it. Without the position of the sun it reads the middle of
the range; a figure stored by an earlier version of the panel still wins.
"""

from unittest.mock import MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import (
    SmartIrrigationCoordinator,
    const,
    illuminance,
)
from custom_components.smart_irrigation.helpers import convert_mapping_to_metric


def _coordinator():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    return coordinator


def test_full_sun_lands_near_a_thousand_watts():
    """100 000 lux is full daylight, a little under 900 W/m2 at the middle of the range."""
    coordinator = _coordinator()

    assert coordinator.radiation_from_illuminance(100000, {}) == pytest.approx(
        100000 / illuminance.default_luminous_efficacy(), abs=0.1
    )
    assert 850 < coordinator.radiation_from_illuminance(100000, {}) < 900


def test_darkness_is_no_radiation():
    coordinator = _coordinator()

    assert coordinator.radiation_from_illuminance(0, {}) == 0


def test_the_coefficient_is_configurable():
    """Glazing shifts the spectrum, so this is what gets calibrated."""
    coordinator = _coordinator()
    conf = {const.MAPPING_CONF_LUMINOUS_EFFICACY: 93}

    assert coordinator.radiation_from_illuminance(50000, conf) == pytest.approx(
        537.6, abs=0.1
    )


@pytest.mark.parametrize("bad", [None, 0, -5, "", "abc"])
def test_an_unusable_coefficient_falls_back_to_the_default(bad):
    """Never divide by zero or by a string someone typed into a number field."""
    coordinator = _coordinator()

    result = coordinator.radiation_from_illuminance(
        50000, {const.MAPPING_CONF_LUMINOUS_EFFICACY: bad}
    )

    assert result == pytest.approx(50000 / illuminance.default_luminous_efficacy())


def test_the_result_reaches_pyeto_in_the_unit_it_expects():
    """W/m2 has to become MJ/m2/day, which is what the module consumes."""
    coordinator = _coordinator()

    watts = coordinator.radiation_from_illuminance(100000, {})
    converted = convert_mapping_to_metric(
        watts, const.MAPPING_SOLRAD, const.UNIT_W_M2, True
    )

    # 879.7 W/m2 * 0.0864 = 76.0 MJ/m2/day, the same path a pyranometer takes.
    assert converted == pytest.approx(76.0, abs=0.1)


def test_a_light_sensor_counts_as_a_sensor_source():
    """Otherwise the group reports no source and nothing is ever collected."""
    coordinator = _coordinator()
    coordinator.store = MagicMock()
    coordinator.store.get_mapping = MagicMock(
        return_value={
            const.MAPPING_ID: 0,
            const.MAPPING_MAPPINGS: {
                const.MAPPING_SOLRAD: {
                    const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_ILLUMINANCE,
                    const.MAPPING_CONF_SENSOR: "sensor.greenhouse_lux",
                }
            },
        }
    )

    weather, sensor, static = coordinator.check_mapping_sources(mapping_id=0)

    assert sensor is True
    assert weather is False
    assert static is False


def test_a_light_sourced_key_is_not_overwritten_by_weather_data():
    """It is sensor-backed, so the weather service must not fill it in."""
    coordinator = _coordinator()
    mapping = {
        const.MAPPING_MAPPINGS: {
            const.MAPPING_SOLRAD: {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_ILLUMINANCE,
                const.MAPPING_CONF_SENSOR: "sensor.greenhouse_lux",
            }
        }
    }

    assert const.MAPPING_SOLRAD in coordinator._get_sensor_sourced_keys(mapping)


def test_the_reading_is_converted_when_the_values_are_built():
    """End to end through the path the coordinator actually uses."""
    coordinator = _coordinator()
    state = MagicMock()
    state.state = "50000"
    coordinator.hass.states.get = MagicMock(return_value=state)
    mapping = {
        const.MAPPING_MAPPINGS: {
            const.MAPPING_SOLRAD: {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_ILLUMINANCE,
                const.MAPPING_CONF_SENSOR: "sensor.greenhouse_lux",
            }
        }
    }

    values = coordinator.build_sensor_values_for_mapping(mapping)

    # 50000 lux / 113.7 = 439.9 W/m2 -> 38.0 MJ/m2/day
    assert values[const.MAPPING_SOLRAD] == pytest.approx(38.0, abs=0.1)


def _greenhouse_coordinator(greenhouse):
    coordinator = _coordinator()
    coordinator.store = MagicMock()
    coordinator.store.get_mapping = MagicMock(
        return_value={const.MAPPING_ID: 0, const.MAPPING_GREENHOUSE: greenhouse}
    )
    return coordinator


def test_a_greenhouse_group_counts_no_rain():
    """Rain measured outside waters nothing under glass."""
    coordinator = _greenhouse_coordinator(True)
    weatherdata = {
        const.MAPPING_PRECIPITATION: 8.0,
        const.MAPPING_DATA_MULTIPLIER: 1.0,
    }

    assert (
        coordinator._precipitation_for_interval(
            {const.ZONE_ID: 0, const.ZONE_MAPPING: 0}, weatherdata
        )
        == 0
    )


def test_an_outdoor_group_still_counts_rain():
    coordinator = _greenhouse_coordinator(False)
    weatherdata = {
        const.MAPPING_PRECIPITATION: 8.0,
        const.MAPPING_DATA_MULTIPLIER: 1.0,
    }

    assert coordinator._precipitation_for_interval(
        {const.ZONE_ID: 0, const.ZONE_MAPPING: 0}, weatherdata
    ) == pytest.approx(8.0)


def test_a_greenhouse_ignores_a_precipitation_rate_too():
    """Not just the depth: the rate must not sneak in through the fallback."""
    coordinator = _greenhouse_coordinator(True)
    weatherdata = {
        const.MAPPING_CURRENT_PRECIPITATION: 4.0,
        const.MAPPING_DATA_MULTIPLIER: 1.0,
        const.MAPPING_CURRENT_PRECIPITATION_SAMPLES: 24,
    }

    assert (
        coordinator._precipitation_for_interval(
            {const.ZONE_ID: 0, const.ZONE_MAPPING: 0}, weatherdata
        )
        == 0
    )
