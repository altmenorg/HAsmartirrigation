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

    async def async_module_for_method(
        self, method: str, config: dict | None = None, zone_id: int | None = None
    ):
        """The id of an engine that calculates ``method``, for this zone.

        Every zone has its own instance, because an engine carries settings the
        zone owns: how many days it looks ahead, the fixed amount it uses.
        Sharing one made those change together behind the user's back.

        So the zone's own engine is kept when it already computes this method,
        and only its options are updated; otherwise a new one is created for
        this zone alone.
        """
        if zone_id is not None:
            zone = self.store.get_zone(zone_id)
            current_id = (zone or {}).get(const.ZONE_MODULE)
            current = (
                self.store.get_module(current_id) if current_id is not None else None
            )
            if current and method_of_engine(current.get(const.MODULE_NAME)) == method:
                if config:
                    merged = {**(current.get(const.MODULE_CONFIG) or {}), **config}
                    await self.store.async_update_module(
                        current_id, {const.MODULE_CONFIG: merged}
                    )
                return current_id
            return await self._async_create_engine(method, config)
        return await self._async_reuse_or_create_engine(method, config)

    async def _async_reuse_or_create_engine(self, method, config):
        """An engine of this kind, any of them: for a caller with no zone."""
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

        return await self._async_create_engine(method, config)

    async def _async_create_engine(self, method, config):
        """A new engine instance of the kind ``method`` names."""
        engine_name = ENGINE_BY_METHOD.get(method)
        if engine_name is None:
            _LOGGER.warning("Unknown calculation method %s", method)
            return None
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

        The zone carries the engine, because the engine carries settings the
        zone owns. The sensor group still records one, for the editor that
        shows the sources this kind of engine reads and for a zone that has
        none of its own: it records this zone's when every zone it feeds is
        calculated the same way, and nothing when they are not, which is what
        "the sources are ambiguous here" means.
        """
        module_id = await self.async_module_for_method(method, config, zone_id=zone_id)
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
