"""Every way a zone value is entered or read, on an install in imperial.

The migration itself is covered by test_metric_storage_migration. This is the
rest of the promise: what the user types is stored in metric, what a run or a
calculation writes is metric whatever the unit system, and what is shown comes
back as what was typed. A field forgotten at one of these edges is a value
wrong by a factor of 25.4, so each edge is checked rather than assumed.
"""

from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.units import (
    LITRES_PER_GALLON,
    MM_PER_INCH,
    ZONE_UNIT_FIELDS,
    zone_from_display,
    zone_to_display,
)


def test_every_zone_field_that_carries_a_unit_is_listed():
    """A new zone field with a unit must be added to ZONE_UNIT_FIELDS.

    This is the list the storage migration, the API and the sensors all work
    from, so a field missing from it is stored in whatever the user typed and
    read as metric.
    """
    expected = {
        const.ZONE_BUCKET,
        const.ZONE_MAXIMUM_BUCKET,
        const.ZONE_DELTA,
        const.ZONE_ET_DEFICIENCY,
        const.ZONE_CURRENT_DRAINAGE,
        const.ZONE_IRRIGATION_THRESHOLD,
        const.ZONE_DRAINAGE_RATE,
        const.ZONE_PRECIPITATION_RATE,
        const.ZONE_SIZE,
        const.ZONE_THROUGHPUT,
        const.ZONE_MEASURED_THROUGHPUT,
    }
    assert set(ZONE_UNIT_FIELDS) == expected


@pytest.mark.parametrize(
    ("field", "typed", "stored"),
    [
        (const.ZONE_PRECIPITATION_RATE, 0.5, 0.5 * MM_PER_INCH),
        (const.ZONE_MEASURED_THROUGHPUT, 2.0, 2.0 * LITRES_PER_GALLON),
        (const.ZONE_IRRIGATION_THRESHOLD, 0.25, 0.25 * MM_PER_INCH),
        (const.ZONE_DRAINAGE_RATE, 2.0, 2.0 * MM_PER_INCH),
        (const.ZONE_MAXIMUM_BUCKET, 1.0, MM_PER_INCH),
    ],
)
def test_a_value_typed_in_imperial_is_stored_in_metric(field, typed, stored):
    assert zone_from_display({field: typed}, metric=False)[field] == pytest.approx(
        stored
    )
    assert zone_to_display({field: stored}, metric=False)[field] == pytest.approx(typed)


def test_a_value_left_empty_stays_empty():
    """A zone entered by size and throughput has no precipitation rate."""
    changes = {const.ZONE_PRECIPITATION_RATE: None, const.ZONE_SIZE: None}

    assert zone_from_display(changes, metric=False) == changes
    assert zone_to_display(changes, metric=False) == changes


def test_text_is_not_scaled():
    """The same call carries the name and the state, which are not numbers."""
    changes = {const.ZONE_NAME: "Lawn", const.ZONE_STATE: "automatic"}

    assert zone_from_display(changes, metric=False) == changes


def test_a_bucket_set_by_service_is_read_as_the_unit_it_was_given_in():
    """set_bucket takes a depth in the user's unit, like the panel does."""
    given = {const.ATTR_NEW_BUCKET_VALUE: -0.5}

    stored = zone_from_display(given, metric=False)

    assert stored[const.ATTR_NEW_BUCKET_VALUE] == pytest.approx(-12.7)


def _coordinator(units):
    """A coordinator with the run-crediting path and nothing else."""
    from custom_components.smart_irrigation.calculation import CalculationMixin
    from custom_components.smart_irrigation.observed_watering import (
        ObservedWateringMixin,
    )

    class _Coordinator(ObservedWateringMixin, CalculationMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = units
    coordinator.store = MagicMock()
    return coordinator


@pytest.mark.parametrize("units", [METRIC_SYSTEM, US_CUSTOMARY_SYSTEM])
def test_a_run_credits_the_same_depth_in_either_unit_system(units):
    """10 L/min over 10 m2 is 1 mm a minute, wherever the install is.

    The zone's size and throughput are stored in metric now, so this is the
    same arithmetic on both. It used to be done in the stored unit and
    converted, which is where a forgotten conversion changed the bucket.
    """
    coordinator = _coordinator(units)
    zone = {
        const.ZONE_ID: 1,
        const.ZONE_SIZE: 10.0,  # m2
        const.ZONE_THROUGHPUT: 10.0,  # L/min
    }

    depth = coordinator._applied_depth_mm(zone, seconds=120)

    assert depth == pytest.approx(2.0)


@pytest.mark.parametrize("units", [METRIC_SYSTEM, US_CUSTOMARY_SYSTEM])
def test_a_zone_entered_as_a_rate_credits_that_rate(units):
    """The rate is stored in mm/h, so the credit does not depend on the system."""
    coordinator = _coordinator(units)
    zone = {
        const.ZONE_ID: 1,
        const.ZONE_INPUT_METHOD: const.ZONE_INPUT_METHOD_PRECIPITATION_RATE,
        const.ZONE_PRECIPITATION_RATE: 30.0,  # mm/h
        const.ZONE_SIZE: 999.0,
        const.ZONE_THROUGHPUT: 999.0,
    }

    depth = coordinator._applied_depth_mm(zone, seconds=120)

    assert depth == pytest.approx(1.0)


async def test_the_api_stores_what_the_panel_sent_in_the_users_unit():
    """The one place a zone is written from the panel, end to end."""
    from custom_components.smart_irrigation.websockets import SmartIrrigationZoneView

    hass = MagicMock()
    hass.config.units = US_CUSTOMARY_SYSTEM
    coordinator = MagicMock()
    coordinator.async_update_zone_config = AsyncMock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    request = MagicMock()
    request.app = {"hass": hass}

    view = SmartIrrigationZoneView()
    with patch("custom_components.smart_irrigation.websockets.async_dispatcher_send"):
        await view.post.__wrapped__(
            view,
            request,
            {
                const.ZONE_ID: 1,
                const.ZONE_SIZE: 100.0,
                const.ZONE_THROUGHPUT: 2.0,
                const.ZONE_NAME: "Lawn",
            },
        )

    _, stored = coordinator.async_update_zone_config.call_args[0]
    assert stored[const.ZONE_SIZE] == pytest.approx(9.290304)
    assert stored[const.ZONE_THROUGHPUT] == pytest.approx(7.570823568)
    assert stored[const.ZONE_NAME] == "Lawn"


def test_the_zones_endpoint_shows_the_stored_values_in_the_users_unit():
    """The mirror of the above: what the panel reads back."""
    stored = {const.ZONE_SIZE: 9.290304, const.ZONE_THROUGHPUT: 7.570823568}

    shown = zone_to_display(stored, metric=False)

    assert shown[const.ZONE_SIZE] == pytest.approx(100.0)
    assert shown[const.ZONE_THROUGHPUT] == pytest.approx(2.0)


def test_a_metric_install_is_handed_the_very_same_dict():
    """No copy, no rounding, nothing to drift."""
    stored = {const.ZONE_SIZE: 50.0}

    assert zone_to_display(stored, metric=True) is stored
    assert zone_from_display(stored, metric=True) is stored


def test_the_live_estimate_is_shown_in_the_users_unit():
    from custom_components.smart_irrigation.units import depth_to_display

    assert depth_to_display(-12.7, metric=False) == pytest.approx(-0.5)
    assert depth_to_display(-12.7, metric=True) == pytest.approx(-12.7)


def test_a_round_trip_through_the_panel_changes_nothing():
    """Open the page, save it back, twice: the stored value must not drift.

    The rounded factors this replaced drifted by parts in 10^8 per trip, which
    a bucket accumulates.
    """
    stored = {
        const.ZONE_BUCKET: -12.7,
        const.ZONE_SIZE: 9.290304,
        const.ZONE_THROUGHPUT: 7.570823568,
        const.ZONE_DRAINAGE_RATE: 2.54,
    }

    once = zone_from_display(zone_to_display(stored, False), False)
    twice = zone_from_display(zone_to_display(once, False), False)

    for key, value in stored.items():
        assert twice[key] == pytest.approx(value, rel=1e-12), key


def test_a_zone_that_has_never_been_calculated_survives_the_conversion():
    """Its numbers are None, and None is not a number to scale."""
    zone = {
        const.ZONE_BUCKET: None,
        const.ZONE_DELTA: None,
        const.ZONE_SIZE: 50.0,
    }

    shown = zone_to_display(zone, metric=False)

    assert shown[const.ZONE_BUCKET] is None
    assert shown[const.ZONE_SIZE] == pytest.approx(538.1955)


def test_a_boolean_is_not_a_number_either():
    """True * 25.4 is 25.4, which would be a very confusing bucket."""
    assert zone_to_display({const.ZONE_BUCKET: True}, metric=False) == {
        const.ZONE_BUCKET: True
    }


def test_nothing_in_the_stored_zone_is_lost_on_the_way_out():
    """Conversion must not drop the fields it does not touch."""
    stored = {
        const.ZONE_ID: 3,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: "automatic",
        const.ZONE_DURATION: 600,
        const.ZONE_MULTIPLIER: 1.2,
        const.ZONE_LEAD_TIME: 30,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_WATER_USED: 120.5,
        const.ZONE_SOIL_MOISTURE_THRESHOLD: 50,
        const.ZONE_BUCKET: -12.7,
    }

    shown = zone_to_display(stored, metric=False)

    assert set(shown) == set(stored)
    # Everything but the bucket is unitless, or already the same in both.
    for key, value in stored.items():
        if key != const.ZONE_BUCKET:
            assert shown[key] == value, key


def _sensor(hass, value):
    """The child sensor that shows a depth, with nothing else wired."""
    from custom_components.smart_irrigation.sensor import (
        SmartIrrigationZoneChildSensor,
    )

    sensor = SmartIrrigationZoneChildSensor.__new__(SmartIrrigationZoneChildSensor)
    sensor._hass = hass
    sensor._value = value
    return sensor


@pytest.mark.parametrize(
    ("units", "expected", "unit"),
    [
        (METRIC_SYSTEM, -12.7, const.UNIT_MM),
        (US_CUSTOMARY_SYSTEM, -0.5, const.UNIT_INCH),
    ],
)
def test_a_depth_entity_shows_the_stored_millimetres_in_the_users_unit(
    units, expected, unit
):
    hass = Mock()
    hass.config.units = units
    sensor = _sensor(hass, -12.7)

    assert sensor.native_value == pytest.approx(expected)
    assert sensor.native_unit_of_measurement == unit
