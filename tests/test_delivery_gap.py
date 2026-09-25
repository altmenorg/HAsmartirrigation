"""An installation that calculates and never waters should say so.

Smart Irrigation computes a duration; something else acts on it. So an
installation can be configured correctly, update its durations every night,
and never open a valve, without a single error anywhere. The panel names that
case rather than letting somebody find out in August.
"""

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.delivery import (
    GAP_AUTO_CALC_OFF,
    GAP_NO_AUTOMATIC_ZONE,
    GAP_NO_VALVE_PATH,
    delivery_gap,
)


def _zone(state=const.ZONE_STATE_AUTOMATIC, linked=None):
    return {const.ZONE_ID: 1, const.ZONE_STATE: state, const.ZONE_LINKED_ENTITY: linked}


def test_an_installation_that_waters_says_nothing():
    config = {const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True}

    assert delivery_gap(config, [_zone()]) is None


def test_calculation_turned_off_stops_everything_else():
    """Named first, because nothing downstream can matter."""
    config = {
        const.CONF_AUTO_CALC_ENABLED: False,
        const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True,
    }

    assert delivery_gap(config, [_zone()]) == GAP_AUTO_CALC_OFF


@pytest.mark.parametrize("state", [const.ZONE_STATE_MANUAL, const.ZONE_STATE_DISABLED])
def test_no_zone_left_on_automatic(state):
    config = {const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True}

    assert delivery_gap(config, [_zone(state=state)]) == GAP_NO_AUTOMATIC_ZONE


def test_one_automatic_zone_among_others_is_enough():
    config = {const.CONF_DIRECT_VALVE_CONTROL_ENABLED: True}
    zones = [_zone(state=const.ZONE_STATE_DISABLED), _zone()]

    assert delivery_gap(config, zones) is None


def test_nothing_here_opens_a_valve():
    """The common one: the durations are right and no automation exists."""
    assert delivery_gap({}, [_zone()]) == GAP_NO_VALVE_PATH


def test_a_linked_valve_counts_even_without_direct_control():
    """The integration knows that valve, and watches it water."""
    assert delivery_gap({}, [_zone(linked="switch.lawn")]) is None


def test_a_fresh_installation_is_not_told_off():
    """With no zone yet there is nothing to water, which is not a fault."""
    assert delivery_gap({}, []) is None


def test_the_configuration_may_be_missing_its_keys():
    """Both settings default the way a new installation has them."""
    assert delivery_gap(None, None) is None
    assert delivery_gap({}, [_zone()]) == GAP_NO_VALVE_PATH
