"""Repairs Smart Irrigation can fix from Home Assistant's Repairs page."""

from __future__ import annotations

from typing import Any

from homeassistant.components.repairs import ConfirmRepairFlow, RepairsFlow
from homeassistant.core import HomeAssistant

from . import const
from .one_choice import ISSUE_MOVED
from .set_aside import ISSUE_PREFIX


class PutBackZoneFlow(RepairsFlow):
    """Put back a zone set aside after failed runs (set_aside.py)."""

    def __init__(self, zone_id: int) -> None:
        self._zone_id = zone_id

    # The result's type changed in Home Assistant 2026.10 (RepairsFlowResult).
    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> Any:
        return await self.async_step_confirm()

    async def async_step_confirm(self, user_input: dict[str, Any] | None = None) -> Any:
        if user_input is not None:
            coordinator = (self.hass.data.get(const.DOMAIN) or {}).get("coordinator")
            if coordinator is not None:
                await coordinator.async_put_back_zone(self._zone_id, "repair")
            return self.async_create_entry(data={})
        # A confirmation only: no field to fill.
        return self.async_show_form(step_id="confirm")


async def async_create_fix_flow(
    hass: HomeAssistant, issue_id: str, data: dict[str, Any] | None
) -> RepairsFlow:
    """The flow that fixes ``issue_id``."""
    if issue_id == ISSUE_MOVED:
        # A notice: confirming it is all there is to do.
        return ConfirmRepairFlow()
    if issue_id.startswith(ISSUE_PREFIX):
        zone_id = (data or {}).get("zone_id")
        if zone_id is None:
            zone_id = issue_id[len(ISSUE_PREFIX) :]
        return PutBackZoneFlow(int(zone_id))
    raise ValueError(f"Unknown repair {issue_id}")
