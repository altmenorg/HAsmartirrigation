"""Choosing how a zone is calculated, without ever naming an engine.

A zone is what people think about: this bed, that greenhouse. How its water
need is worked out is a property of the zone in their heads, so that is where
the choice belongs, in their words: calculate it from the weather, take a
value I already have, or use a fixed amount.

Underneath, the engine lives on the sensor group, because what sources a group
must provide depends on it, and a group shared by two zones computed
differently has no answer to that question. Nothing here changes that. What it
does is remove the step where somebody had to create an engine by hand before
they could use one: asking for a method creates the instance it needs, or
reuses the one that is already there, and the user never sees it.
"""

import logging

from . import const

_LOGGER = logging.getLogger(__name__)

# The methods a zone can be calculated by, in the order the panel offers them,
# and the engine behind each. The names on the left are ours to keep; the ones
# on the right are implementation, and never shown.
METHOD_FROM_WEATHER = "from_weather"
METHOD_PROVIDED = "provided"
METHOD_FIXED = "fixed"

ENGINE_BY_METHOD = {
    METHOD_FROM_WEATHER: "PyETO",
    METHOD_PROVIDED: "Passthrough",
    METHOD_FIXED: "Static",
}
METHOD_BY_ENGINE = {engine: method for method, engine in ENGINE_BY_METHOD.items()}


def method_of_engine(engine_name: str | None) -> str | None:
    """The method an engine implements, or None for one we do not know."""
    return METHOD_BY_ENGINE.get(engine_name)


class EngineBindingMixin:
    """Bind a zone to an engine instance, creating one when there is none."""

    async def async_module_for_method(self, method: str, config: dict | None = None):
        """The id of a module that calculates ``method``, creating it if needed.

        One instance per method is enough: two identical engines are two places
        to change the same setting. An existing instance is therefore reused,
        and only its own options (a fixed value, a number of forecast days) are
        updated when the caller passes some.
        """
        engine_name = ENGINE_BY_METHOD.get(method)
        if engine_name is None:
            _LOGGER.warning("Unknown calculation method %s", method)
            return None

        for module in await self.store.async_get_modules():
            if module.get(const.MODULE_NAME) == engine_name:
                if config:
                    merged = {**(module.get(const.MODULE_CONFIG) or {}), **config}
                    await self.store.async_update_module(
                        module[const.MODULE_ID], {const.MODULE_CONFIG: merged}
                    )
                return module[const.MODULE_ID]

        for template in await self.async_get_all_modules():
            if template.get("name") != engine_name:
                continue
            created = await self.store.async_create_module(
                {
                    const.MODULE_NAME: template["name"],
                    const.MODULE_DESCRIPTION: template["description"],
                    const.MODULE_CONFIG: {
                        **(template["config"] or {}),
                        **(config or {}),
                    },
                    const.MODULE_SCHEMA: template["schema"],
                }
            )
            _LOGGER.debug("Created the %s engine for method %s", engine_name, method)
            return created[const.MODULE_ID]

        _LOGGER.error("No calculation engine named %s is installed", engine_name)
        return None

    async def async_set_zone_method(self, zone_id: int, method: str, config=None):
        """Point a zone at the engine that calculates ``method``.

        The engine belongs to the zone's sensor group when that group feeds
        this zone alone: that is the model the calculation reads, and it keeps
        the group's editor able to show the sources this engine needs. A group
        shared with zones calculated another way is left undecided instead, and
        the zone carries its own engine, which is the fallback the calculation
        already has for exactly this case.
        """
        module_id = await self.async_module_for_method(method, config)
        if module_id is None:
            return None
        zone = self.store.get_zone(zone_id)
        if zone is None:
            return None

        mapping_id = zone.get(const.ZONE_MAPPING)
        await self.store.async_update_zone(zone_id, {const.ZONE_MODULE: module_id})
        if mapping_id is None:
            return module_id

        others = [
            other
            for other in await self.store.async_get_zones()
            if other.get(const.ZONE_MAPPING) == mapping_id
            and other.get(const.ZONE_ID) != zone_id
        ]
        shared_differently = any(
            other.get(const.ZONE_MODULE) not in (None, module_id) for other in others
        )
        await self.store.async_update_mapping(
            mapping_id,
            {const.MAPPING_MODULE: None if shared_differently else module_id},
        )
        if shared_differently:
            _LOGGER.debug(
                "Sensor group %s feeds zones calculated differently; each zone "
                "keeps its own engine",
                mapping_id,
            )
        return module_id
