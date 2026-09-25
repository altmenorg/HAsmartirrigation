"""Why an installation would not water, when that is the case.

Smart Irrigation calculates; something has to act on the result. An
installation can therefore be perfectly configured and still never water, and
it says nothing: the durations update every night and no valve ever opens.
That is the single most expensive thing a newcomer can get wrong here, because
everything looks right.

So the panel says it, in the one place that answers "what is about to happen".
The rules below are what can be checked from the configuration itself: what
cannot be checked is whether an automation somewhere listens to our event, so
the last one is worded as what it is, a reminder rather than an error.
"""

from . import const

# Nothing is calculated at all.
GAP_AUTO_CALC_OFF = "auto_calc_off"
# Calculated, but no zone is in a state that waters.
GAP_NO_AUTOMATIC_ZONE = "no_automatic_zone"
# Calculated, and nothing here opens a valve: an automation has to.
GAP_NO_VALVE_PATH = "no_valve_path"


def delivery_gap(config: dict, zones) -> str | None:
    """The reason nothing would water, or None when something will.

    Ordered from the one that stops the most: no calculation at all, then no
    zone to water, then no valve this integration can open itself.
    """
    config = config or {}
    if not config.get(const.CONF_AUTO_CALC_ENABLED, True):
        return GAP_AUTO_CALC_OFF

    zones = list(zones or [])
    if zones and not any(
        zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC for zone in zones
    ):
        return GAP_NO_AUTOMATIC_ZONE

    if config.get(const.CONF_DIRECT_VALVE_CONTROL_ENABLED, False) is True:
        return None
    if any(zone.get(const.ZONE_LINKED_ENTITY) for zone in zones):
        # A linked valve without direct valve control is still a valve this
        # integration knows about, and the observed-watering path uses it.
        return None
    if not zones:
        return None
    return GAP_NO_VALVE_PATH
