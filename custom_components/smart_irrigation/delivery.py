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

import datetime

import homeassistant.util.dt as dt_util

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


# A zone that has stopped being calculated, while the installation as a whole
# is working. Nothing ever said so: #847 spent five days with one zone frozen
# on a panel that looked perfectly healthy, because the only trace was a line
# in the log. The cause there was a sensor group with id 0 read as no group
# (#846), but the cause is not the point -- a zone whose water need is days old
# waters on days-old weather, whatever froze it.

# How far behind the rest a zone has to be before it is worth saying. A nightly
# calculation puts every zone within minutes of the others, so half a day is
# already far outside anything normal.
BEHIND_BY_HOURS = 12
# And when the newest calculation of all is older than this, the installation
# has stopped calculating rather than one zone falling behind.
STALE_AFTER_HOURS = 36


def _as_naive_local(value):
    """A stored moment as a naive local datetime, or None if it is unreadable.

    The store keeps naive local timestamps, the API hands them over as strings,
    and an installation that once wrote an aware one still has it on disk.
    """
    if value is None:
        return None
    if isinstance(value, str):
        value = dt_util.parse_datetime(value)
        if value is None:
            return None
    if not isinstance(value, datetime.datetime):
        return None
    if value.tzinfo is not None:
        value = dt_util.as_local(value).replace(tzinfo=None)
    return value


def stale_zones(config: dict, zones, now=None) -> list:
    """The automatic zones whose last calculation is not recent, with its date.

    Empty when nothing is wrong, and empty as well when nothing is calculated
    at all: automatic calculation switched off is already reported on its own,
    and a fresh installation before its first run is not a fault.
    """
    config = config or {}
    if not config.get(const.CONF_AUTO_CALC_ENABLED, True):
        return []

    now = now or datetime.datetime.now()
    candidates = [
        zone
        for zone in (zones or [])
        if zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC
    ]
    moments = {
        zone.get(const.ZONE_ID): _as_naive_local(zone.get(const.ZONE_LAST_CALCULATED))
        for zone in candidates
    }
    known = [moment for moment in moments.values() if moment is not None]
    if not known:
        return []

    newest = max(known)
    everything_is_old = (now - newest) > datetime.timedelta(hours=STALE_AFTER_HOURS)
    behind = newest - datetime.timedelta(hours=BEHIND_BY_HOURS)

    stale = []
    for zone in candidates:
        moment = moments.get(zone.get(const.ZONE_ID))
        if not everything_is_old and moment is not None and moment >= behind:
            continue
        stale.append(
            {
                "zone_id": zone.get(const.ZONE_ID),
                "zone": zone.get(const.ZONE_NAME),
                "last_calculated": moment.isoformat() if moment else None,
            }
        )
    return stale
