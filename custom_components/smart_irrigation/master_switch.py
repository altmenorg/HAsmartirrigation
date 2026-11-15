"""The master switch: Smart Irrigation on or off as a whole.

Off, it still takes its weather readings and keeps its sensors, so that the
history is there when it is switched on again, but it calculates nothing,
leaves every bucket as it is, opens no valve, whether by direct valve control or
by hand, and runs no program of the full controller. Postponing holds the
automatic watering back for a while and keeps calculating; this stops it all.

Each path that waters or calculates asks ``irrigation_off`` at its entrance.
"""

from . import const


def irrigation_off(config) -> bool:
    """Whether the master switch is off.

    ``config`` is the store, its config, or the config as a dict. Anything that
    does not say it is off counts as on, as it was before the switch existed.
    """
    if not isinstance(config, dict) and hasattr(config, "config"):
        config = getattr(config, "config", None)
    if isinstance(config, dict):
        value = config.get(const.CONF_IRRIGATION_ENABLED)
    else:
        value = getattr(config, const.CONF_IRRIGATION_ENABLED, None)
    return value is False


def watering_off(config) -> bool:
    """Whether nothing may start watering: switched off, or calculating only.

    "Calculate only" keeps the balances and durations current and holds every
    way a watering starts: the valves driven by Smart Irrigation, the programs
    and the start event an automation of one's own listens to. Nothing else is
    changed, so "Calculate and water" takes everything up as it was.
    """
    if irrigation_off(config):
        return True
    if not isinstance(config, dict) and hasattr(config, "config"):
        config = getattr(config, "config", None)
    if isinstance(config, dict):
        value = config.get(const.CONF_WATERING_ENABLED)
    else:
        value = getattr(config, const.CONF_WATERING_ENABLED, None)
    return value is False
