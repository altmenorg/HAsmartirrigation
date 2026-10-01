"""What the soil holds, the rain that counts, the water that arrives.

Three optional refinements of the water balance. Each one is inert until it is
set, so an installation that sets none of them calculates exactly as before.
"""

from unittest.mock import MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


def _zone(**fields):
    return {const.ZONE_ID: 0, **fields}


# --- available water: the floor and the stress coefficient


def test_without_an_available_water_figure_nothing_is_reduced():
    assert CalculationMixin._water_stress(_zone(), -40.0) == 1.0
    assert CalculationMixin._water_stress(_zone(available_water=None), -40.0) == 1.0
    assert CalculationMixin._water_stress(_zone(available_water=0), -40.0) == 1.0


def test_within_the_allowed_depletion_the_plants_draw_freely():
    zone = _zone(available_water=40.0)  # RAW is half of it: 20 mm

    assert CalculationMixin._water_stress(zone, 0.0) == 1.0
    assert CalculationMixin._water_stress(zone, -20.0) == 1.0


def test_past_the_allowed_depletion_the_draw_falls_to_zero_at_the_available_water():
    zone = _zone(available_water=40.0)

    assert CalculationMixin._water_stress(zone, -30.0) == pytest.approx(0.5)
    assert CalculationMixin._water_stress(zone, -40.0) == pytest.approx(0.0)
    assert CalculationMixin._water_stress(zone, -90.0) == 0.0


def test_the_allowed_depletion_is_the_zones_own_when_set():
    zone = _zone(available_water=40.0, allowed_depletion=25.0)  # RAW 10 mm

    assert CalculationMixin._water_stress(zone, -10.0) == 1.0
    assert CalculationMixin._water_stress(zone, -25.0) == pytest.approx(
        (40 - 25) / (0.75 * 40)
    )


# --- distribution efficiency


def test_without_an_efficiency_the_throughput_is_taken_at_its_word():
    assert CalculationMixin._distribution_efficiency(_zone()) == 1.0
    assert CalculationMixin._distribution_efficiency(
        _zone(distribution_efficiency=None)
    ) == pytest.approx(1.0)


@pytest.mark.parametrize(
    ("percent", "share"), [(80, 0.8), (100, 1.0), (150, 1.0), (1, 0.05)]
)
def test_the_efficiency_is_a_share_of_the_water(percent, share):
    assert CalculationMixin._distribution_efficiency(
        _zone(distribution_efficiency=percent)
    ) == pytest.approx(share)


def _coordinator():
    class _Coordinator(CalculationMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    return coordinator


def test_a_less_efficient_zone_waters_longer_for_the_same_depth():
    coordinator = _coordinator()
    plain = {const.ZONE_THROUGHPUT: 10.0, const.ZONE_SIZE: 20.0}
    leaky = {**plain, const.ZONE_DISTRIBUTION_EFFICIENCY: 80.0}

    rate_plain = coordinator._zone_precipitation_rate(plain)[0]
    rate_leaky = coordinator._zone_precipitation_rate(leaky)[0]

    assert rate_plain == pytest.approx(30.0)
    assert rate_leaky == pytest.approx(24.0)


def test_the_same_efficiency_applies_to_a_rate_entered_directly():
    coordinator = _coordinator()
    zone = {
        const.ZONE_INPUT_METHOD: const.ZONE_INPUT_METHOD_PRECIPITATION_RATE,
        const.ZONE_PRECIPITATION_RATE: 20.0,
        const.ZONE_DISTRIBUTION_EFFICIENCY: 50.0,
    }

    assert coordinator._zone_precipitation_rate(zone)[0] == pytest.approx(10.0)


def test_the_duration_follows_the_effective_rate():
    coordinator = _coordinator()
    zone = {
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_SIZE: 20.0,
        const.ZONE_DISTRIBUTION_EFFICIENCY: 50.0,
        const.ZONE_LEAD_TIME: 0.0,
        const.ZONE_MAXIMUM_DURATION: 99999,
    }

    # 6 mm short, at 15 mm/h: 24 minutes instead of 12.
    assert coordinator.duration_from_bucket(zone, -6.0) == 1440


# --- effective rain


def _with_rain_setting(enabled):
    coordinator = _coordinator()
    coordinator.store.get_config.return_value = {const.CONF_EFFECTIVE_RAIN: enabled}
    return coordinator


def test_a_small_shower_is_not_counted_when_the_setting_is_on():
    coordinator = _with_rain_setting(True)
    window = {const.MAPPING_DATA_MULTIPLIER: 1.0}

    # 5 mm of ET0 in the window: the line is 1 mm.
    assert coordinator._effective_rain(0.6, -5.0, window, None) == 0.0
    assert coordinator._effective_rain(1.5, -5.0, window, None) == 1.5


def test_a_window_shorter_than_a_day_lowers_the_line():
    coordinator = _with_rain_setting(True)
    window = {const.MAPPING_DATA_MULTIPLIER: 0.5}

    # The ET0 of the window is 2.5 mm: the line is 0.5 mm.
    assert coordinator._effective_rain(0.6, -5.0, window, None) == 0.6


def test_an_hourly_sum_is_already_the_whole_window():
    coordinator = _with_rain_setting(True)

    assert coordinator._effective_rain(0.6, -5.0, {}, (5.0, 24.0)) == 0.0
    assert coordinator._effective_rain(1.2, -5.0, {}, (5.0, 24.0)) == 1.2


def test_every_drop_counts_when_the_setting_is_off():
    coordinator = _with_rain_setting(False)

    assert coordinator._effective_rain(0.1, -5.0, {}, None) == 0.1


def test_no_rain_is_no_rain():
    coordinator = _with_rain_setting(True)

    assert coordinator._effective_rain(0, -5.0, {}, None) == 0
    assert coordinator._effective_rain(None, -5.0, {}, None) is None


# --- the soil's own sensor at every calculation


def _soil_zone(**fields):
    return {
        const.ZONE_NAME: "Lawn",
        const.ZONE_SOIL_MOISTURE_SENSOR: "sensor.soil",
        const.ZONE_SOIL_MOISTURE_THRESHOLD: 50.0,
        **fields,
    }


def _with_sensor(reading):
    coordinator = _coordinator()
    coordinator._entity_reading = lambda entity: reading
    return coordinator


def test_a_moist_soil_sets_the_bucket_to_field_capacity():
    coordinator = _with_sensor((62.0, "%"))

    assert coordinator._recalibrate_on_soil(_soil_zone(), -7.5) == 0.0


def test_a_soil_below_the_threshold_leaves_the_bucket_alone():
    coordinator = _with_sensor((31.0, "%"))

    assert coordinator._recalibrate_on_soil(_soil_zone(), -7.5) == -7.5


def test_a_bucket_already_full_is_left_alone():
    coordinator = _with_sensor((90.0, "%"))

    assert coordinator._recalibrate_on_soil(_soil_zone(), 3.0) == 3.0


def test_a_sensor_that_cannot_be_read_changes_nothing():
    assert _with_sensor(None)._recalibrate_on_soil(_soil_zone(), -4.0) == -4.0

    def boom(entity):
        raise RuntimeError("gone")

    coordinator = _coordinator()
    coordinator._entity_reading = boom
    assert coordinator._recalibrate_on_soil(_soil_zone(), -4.0) == -4.0


def test_a_zone_without_a_sensor_is_untouched():
    coordinator = _with_sensor((99.0, "%"))
    zone = {const.ZONE_NAME: "Beds"}

    assert coordinator._recalibrate_on_soil(zone, -4.0) == -4.0
