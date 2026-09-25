"""Which sensor-group sources each calculation engine actually reads.

A sensor group used to be edited blind: every source was offered whatever
engine consumed the result, so a Passthrough group could be filled with
temperature and wind readings nothing would ever look at while its
evapotranspiration source sat empty. Saying what each engine needs is what lets
the editor show only that.

This lives next to the engines, and one place, on purpose. A copy of it in the
frontend would drift, and a source silently dropped from the editor is a water
balance quietly computed from less than the user thinks.
"""

from .. import const

# PyETO runs Penman-Monteith from the weather. Minimum and maximum temperature
# are derived from the Temperature source rather than mapped separately, and
# solar radiation is optional: without it PyETO estimates radiation from the
# temperature range, which is a coarser answer but still an answer.
_PYETO = (
    const.MAPPING_TEMPERATURE,
    const.MAPPING_DEWPOINT,
    const.MAPPING_HUMIDITY,
    const.MAPPING_PRESSURE,
    const.MAPPING_WINDSPEED,
    const.MAPPING_SOLRAD,
)

# Passthrough takes evapotranspiration already computed elsewhere.
_PASSTHROUGH = (const.MAPPING_EVAPOTRANSPIRATION,)

# Static uses a fixed delta held in the module's own configuration, so it asks
# the sensor group for nothing at all.
_STATIC = ()

CONSUMED_BY_ENGINE = {
    "PyETO": _PYETO,
    "Passthrough": _PASSTHROUGH,
    "Static": _STATIC,
}

# Rain is subtracted from whatever evapotranspiration the engine produced, so
# it matters to all of them. A greenhouse group hides these separately: there
# the rain is absent from the physical world, not from the engine.
ALWAYS_CONSUMED = (
    const.MAPPING_PRECIPITATION,
    const.MAPPING_CURRENT_PRECIPITATION,
)


def consumed_mappings(engine_name: str | None) -> list[str]:
    """The sources a group feeding ``engine_name`` needs, precipitation included.

    An unknown engine returns every source rather than none: a third-party or
    renamed engine should leave the editor as it was, not hide fields somebody
    depends on.
    """
    if engine_name in CONSUMED_BY_ENGINE:
        return list(CONSUMED_BY_ENGINE[engine_name]) + list(ALWAYS_CONSUMED)
    every = set()
    for sources in CONSUMED_BY_ENGINE.values():
        every.update(sources)
    return sorted(every) + list(ALWAYS_CONSUMED)


# Options an engine offers that only do something in one situation, with the
# source whose absence is that situation. "Coastal" picks the coefficient
# FAO-56 uses to estimate radiation from the day's temperature range, so it
# does nothing at all once something actually reports the radiation.
_OPTION_NEEDS_MISSING_SOURCE = {
    "PyETO": {const.CONF_PYETO_COASTAL: const.MAPPING_SOLRAD},
}


def sourced_fields(mapping: dict) -> set:
    """The sensor group's fields that something currently reports."""
    sourced = set()
    for key, conf in (mapping.get(const.MAPPING_MAPPINGS) or {}).items():
        if isinstance(conf, str):
            # A legacy group storing the source as a plain string.
            if conf and conf != const.MAPPING_CONF_SOURCE_NONE:
                sourced.add(key)
            continue
        if isinstance(conf, dict):
            source = conf.get(const.MAPPING_CONF_SOURCE)
            if source and source != const.MAPPING_CONF_SOURCE_NONE:
                sourced.add(key)
    return sourced


def idle_options(engine_name: str | None, mappings) -> list[str]:
    """The engine's options that change nothing for these sensor groups.

    Every option an installation is shown is one more thing to understand, and
    the ones that do nothing are the worst of them: they read as a decision the
    user has to make, and whatever they pick, nothing happens. So the editor is
    told which ones to leave out.

    An option is only called idle when it is idle for **every** group feeding
    the engine: a module shared by a group with a radiation sensor and one
    without still has a coastal setting that matters to the second. With no
    group at all, nothing is hidden, because nothing is known yet.
    """
    conditions = _OPTION_NEEDS_MISSING_SOURCE.get(engine_name)
    groups = list(mappings or [])
    if not conditions or not groups:
        return []
    idle = []
    for option, source in conditions.items():
        if all(source in sourced_fields(mapping) for mapping in groups):
            idle.append(option)
    return sorted(idle)
