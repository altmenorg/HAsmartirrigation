"""An option that changes nothing is not shown.

PyETO's "coastal" setting picks the coefficient FAO-56 uses to estimate solar
radiation from the day's temperature range. Once a sensor group reports the
radiation, nothing reads that coefficient, and the setting sits in the editor
as a decision with no consequence.

The engine says which of its options are idle for the groups feeding it, and
the editor leaves those out. It is a property of the code and of the current
configuration, so it is computed, never stored.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calcmodules.consumes import (
    idle_options,
    sourced_fields,
)
from custom_components.smart_irrigation.websockets import _mappings_feeding


def _group(mapping_id=1, module=None, **sources):
    """A sensor group, with a source on each field named."""
    return {
        const.MAPPING_ID: mapping_id,
        const.MAPPING_MODULE: module,
        const.MAPPING_MAPPINGS: {
            field: {const.MAPPING_CONF_SOURCE: source}
            for field, source in sources.items()
        },
    }


WITH_SUN = _group(
    Temperature=const.MAPPING_CONF_SOURCE_SENSOR,
    **{const.MAPPING_SOLRAD: const.MAPPING_CONF_SOURCE_WEATHER_SERVICE},
)
WITHOUT_SUN = _group(Temperature=const.MAPPING_CONF_SOURCE_SENSOR)


def test_a_group_that_reports_the_sun_makes_coastal_idle():
    assert idle_options("PyETO", [WITH_SUN]) == [const.CONF_PYETO_COASTAL]


def test_a_group_without_it_keeps_coastal():
    """Without a radiation source the coefficient is read on every calculation."""
    assert idle_options("PyETO", [WITHOUT_SUN]) == []


def test_one_group_that_needs_it_is_enough_to_keep_it():
    """A module shared by both kinds still has a setting that matters."""
    assert idle_options("PyETO", [WITH_SUN, WITHOUT_SUN]) == []


def test_a_source_set_to_none_does_not_count_as_reporting():
    none_sun = _group(**{const.MAPPING_SOLRAD: const.MAPPING_CONF_SOURCE_NONE})

    assert idle_options("PyETO", [none_sun]) == []


def test_a_module_no_group_feeds_hides_nothing():
    """Nothing is known yet, so nothing is taken away."""
    assert idle_options("PyETO", []) == []
    assert idle_options("PyETO", None) == []


@pytest.mark.parametrize("engine", ["Passthrough", "Static", "SomeoneElses", None])
def test_an_engine_without_such_options_hides_nothing(engine):
    assert idle_options(engine, [WITH_SUN]) == []


def test_a_legacy_group_storing_its_source_as_text_is_read_too():
    legacy = {
        const.MAPPING_ID: 1,
        const.MAPPING_MAPPINGS: {const.MAPPING_SOLRAD: "sensor"},
    }

    assert sourced_fields(legacy) == {const.MAPPING_SOLRAD}
    assert idle_options("PyETO", [legacy]) == [const.CONF_PYETO_COASTAL]


def test_a_legacy_group_whose_source_is_none_reports_nothing():
    legacy = {
        const.MAPPING_ID: 1,
        const.MAPPING_MAPPINGS: {const.MAPPING_SOLRAD: const.MAPPING_CONF_SOURCE_NONE},
    }

    assert sourced_fields(legacy) == set()


def test_a_group_with_no_mappings_at_all_reports_nothing():
    assert sourced_fields({}) == set()
    assert sourced_fields({const.MAPPING_MAPPINGS: None}) == set()


# --- which groups feed which module -----------------------------------------


def _zone(zone_id, mapping, module):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_MAPPING: mapping,
        const.ZONE_MODULE: module,
    }


def test_a_group_that_adopted_an_engine_feeds_that_one():
    adopted = _group(mapping_id=5, module=2)

    assert _mappings_feeding(2, [adopted], []) == [adopted]
    assert _mappings_feeding(3, [adopted], []) == []


def test_a_group_that_has_not_adopted_one_is_tied_by_its_zones():
    undecided = _group(mapping_id=5)
    zones = [_zone(1, 5, 7)]

    assert _mappings_feeding(7, [undecided], zones) == [undecided]
    assert _mappings_feeding(8, [undecided], zones) == []


def test_the_group_s_own_engine_wins_over_its_zones():
    """That is the rule the calculation follows, so the editor follows it too."""
    adopted = _group(mapping_id=5, module=2)
    zones = [_zone(1, 5, 7)]

    assert _mappings_feeding(7, [adopted], zones) == []
    assert _mappings_feeding(2, [adopted], zones) == [adopted]


def test_a_module_id_of_zero_is_a_module_like_any_other():
    """The first module created carries id 0, which is not "no module"."""
    undecided = _group(mapping_id=5)

    assert _mappings_feeding(0, [undecided], [_zone(1, 5, 0)]) == [undecided]


def test_nothing_feeds_nothing():
    assert _mappings_feeding(None, [WITH_SUN], []) == []
    assert _mappings_feeding(1, [], []) == []
    assert _mappings_feeding(1, None, None) == []


async def test_the_modules_endpoint_carries_the_idle_options():
    """End to end: what the panel actually receives."""
    from custom_components.smart_irrigation.websockets import websocket_get_modules

    coordinator = MagicMock()
    coordinator.store.async_get_modules = AsyncMock(
        return_value=[{const.MODULE_ID: 2, const.MODULE_NAME: "PyETO"}]
    )
    coordinator.store.async_get_mappings = AsyncMock(
        return_value=[
            _group(mapping_id=5, module=2, **{const.MAPPING_SOLRAD: "sensor"})
        ]
    )
    coordinator.store.async_get_zones = AsyncMock(return_value=[])
    hass = MagicMock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    connection = MagicMock()

    # The handler is wrapped for the websocket API; call what it wraps.
    await websocket_get_modules.__wrapped__(hass, connection, {"id": 1})

    published = connection.send_result.call_args[0][1][0]
    assert published["idle_options"] == [const.CONF_PYETO_COASTAL]
    assert const.MAPPING_SOLRAD in published["consumes"]
