"""Actions on their way out, and the notice a call to one raises (#1004).

The "one zone" and "all zones" pairs became one action each, where a target
picks the zones and no target means all of them, and the recurring schedules
gave way to the programs' schedules. The old names keep working for a year,
so no automation breaks on an update. Each call to one logs a warning (once per
name) and raises a repair issue that names what to use instead and when the old
name goes. They go in winter, outside the watering season, so no garden breaks
in July.
"""

from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable, Coroutine
from typing import Any

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import issue_registry as ir

from . import const

_LOGGER = logging.getLogger(__name__)

# The release from which the old names may be removed: not before it, and in
# winter. Versions go by month, so this is a date, not a count of releases.
REMOVED_IN = "2027.11"

DOCS_URL = (
    "https://altmenorg.github.io/HAsmartirrigation/"
    "usage-services.html#actions-on-their-way-out"
)

# The old name, and the action to use instead. None: no action replaces it.
DEPRECATED_ACTIONS: dict[str, str | None] = {
    const.SERVICE_CALCULATE_ZONE: const.SERVICE_CALCULATE,
    const.SERVICE_CALCULATE_ALL_ZONES: const.SERVICE_CALCULATE,
    const.SERVICE_UPDATE_ZONE: const.SERVICE_UPDATE_WEATHER,
    const.SERVICE_UPDATE_ALL_ZONES: const.SERVICE_UPDATE_WEATHER,
    const.SERVICE_RESET_BUCKET: const.SERVICE_SET_BUCKET,
    const.SERVICE_RESET_ALL_BUCKETS: const.SERVICE_SET_BUCKET,
    const.SERVICE_SET_ALL_BUCKETS: const.SERVICE_SET_BUCKET,
    const.SERVICE_SET_ALL_MULTIPLIERS: const.SERVICE_SET_MULTIPLIER,
    const.SERVICE_CREATE_SEASONAL_ADJUSTMENT: const.SERVICE_SET_SEASONAL_ADJUSTMENT,
    const.SERVICE_UPDATE_SEASONAL_ADJUSTMENT: const.SERVICE_SET_SEASONAL_ADJUSTMENT,
    const.SERVICE_DELETE_SEASONAL_ADJUSTMENT: const.SERVICE_SET_SEASONAL_ADJUSTMENT,
    # Overlapping with the programs' schedules, and not in the panel.
    const.SERVICE_CREATE_RECURRING_SCHEDULE: None,
    const.SERVICE_UPDATE_RECURRING_SCHEDULE: None,
    const.SERVICE_DELETE_RECURRING_SCHEDULE: None,
}

# Names warned about since start: the log says it once, the repair issue stays.
_warned: set[str] = set()


def issue_id(action: str) -> str:
    """The repair issue of an old action."""
    return f"deprecated_action_{action}"


def async_notice(hass: HomeAssistant, action: str) -> None:
    """Say that ``action`` is going away, and what to use instead."""
    replacement = DEPRECATED_ACTIONS[action]
    old = f"{const.DOMAIN}.{action}"
    if replacement is None:
        translation_key = "deprecated_recurring_schedule"
        placeholders = {"action": old, "version": REMOVED_IN}
        instead = "the programs' schedules (Watering tab)"
    else:
        translation_key = "deprecated_action"
        placeholders = {
            "action": old,
            "replacement": f"{const.DOMAIN}.{replacement}",
            "version": REMOVED_IN,
        }
        instead = placeholders["replacement"]
    if action not in _warned:
        _warned.add(action)
        _LOGGER.warning(
            "The action %s is deprecated and will be removed from %s on; "
            "use %s instead",
            old,
            REMOVED_IN,
            instead,
        )
    ir.async_create_issue(
        hass,
        const.DOMAIN,
        issue_id(action),
        is_fixable=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key=translation_key,
        translation_placeholders=placeholders,
        learn_more_url=DOCS_URL,
    )


def deprecated(
    hass: HomeAssistant,
    action: str,
    handler: Callable[[ServiceCall], Awaitable[Any]],
) -> Callable[[ServiceCall], Coroutine[Any, Any, Any]]:
    """``handler`` under its old name: it works as before, and says it goes."""

    async def _handle(call: ServiceCall) -> Any:
        async_notice(hass, action)
        return await handler(call)

    return _handle
