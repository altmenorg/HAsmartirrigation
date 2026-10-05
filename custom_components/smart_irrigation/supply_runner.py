"""Switching the supplies (pumps, main valves) around the runs of the zones.

See supplies.py for what a supply is and what its delays mean. What is here is
the switching, in the order a pump needs and in the places a run can end:

* A zone's pass takes a hold on its supply before it opens its valve, and gives
  it back after the valve has closed, in the same ``finally``. The supply goes
  off when the last hold is given back, never on a guess of when the cycle ends
  (what the fork this was learnt from first did, and got wrong in every case it
  measured).
* The flag saying a supply is on is set before the first await, so two passes
  starting together do not both switch it on.
* A supply that is going off after its delay is switched off by a timer that
  looks at the holds again when it fires, and is cancelled by anyone taking a
  hold. A reload cancels it without firing it: the next start finds a supply
  that is on and has no holds, and switches it off.
"""

import asyncio
import logging

from . import const
from .supplies import SupplyHolds, find_supply, usable

_LOGGER = logging.getLogger(__name__)

PROBLEM_SUPPLY_DID_NOT_TURN_ON = "supply_did_not_turn_on"
PROBLEM_SUPPLY_DID_NOT_TURN_OFF = "supply_did_not_turn_off"

# States that say a supply is running.
_ON_STATES = ("on", "open", "opening")

# How long to wait before the second try at switching a supply off.
SUPPLY_OFF_RETRY_DELAY = 3.0


class SupplyRunnerMixin:
    """Switch the supplies of the zones being watered."""

    def _supply_runtime(self) -> dict:
        """What is only in memory: who holds each supply, and which are on."""
        runtime = getattr(self, "_supply_runtime_state", None)
        if runtime is None:
            runtime = self._supply_runtime_state = {
                "holds": SupplyHolds(),
                "on": set(),
                "off_tasks": {},
            }
        return runtime

    def _supply_for_zone(self, zone: dict):
        """The supply that feeds this zone, if the full controller has one for it."""
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return None
        supply = find_supply(
            getattr(config, const.CONF_SUPPLIES, None), zone.get(const.ZONE_SUPPLY_ID)
        )
        return supply if usable(supply) else None

    # --- taking and giving back ---------------------------------------------

    async def _supply_before_open(self, supply: dict, token, zone_id):
        """Take a hold and bring the supply up ahead of the valve.

        Returns the seconds after the valve opens at which the supply should
        come on (the valve leads, a negative delay), 0 when the supply is on
        already or was brought up here, or None when the run was stopped while
        the supply was leading and the valve must not open at all.
        """
        runtime = self._supply_runtime()
        supply_id = supply[const.SUPPLY_ID]
        runtime["holds"].acquire(supply_id, token)
        self._supply_cancel_off(supply_id)
        if supply_id in runtime["on"]:
            return 0.0
        delay = float(supply.get(const.SUPPLY_DELAY_BEFORE) or 0.0)
        if delay < 0:
            return -delay
        runtime["on"].add(supply_id)
        await self._supply_switch(supply, True)
        if delay > 0 and await self._wait_or_stop(zone_id, delay):
            return None
        return 0.0

    async def _supply_ensure_on(self, supply: dict) -> None:
        runtime = self._supply_runtime()
        supply_id = supply[const.SUPPLY_ID]
        if supply_id in runtime["on"]:
            return
        runtime["on"].add(supply_id)
        await self._supply_switch(supply, True)

    async def _supply_release(self, supply: dict, token, immediate: bool = False):
        """Give the hold back; the last one out puts the supply off, delay first.

        ``immediate`` skips the delay, for a run being cancelled.
        """
        runtime = self._supply_runtime()
        supply_id = supply[const.SUPPLY_ID]
        remaining = runtime["holds"].release(supply_id, token)
        if remaining is None or remaining > 0:
            return
        if supply_id not in runtime["on"]:
            return
        delay = max(0.0, float(supply.get(const.SUPPLY_DELAY_AFTER) or 0.0))
        if delay <= 0 or immediate:
            await self._supply_off_now(supply)
            return
        self._supply_cancel_off(supply_id)
        runtime["off_tasks"][supply_id] = self._spawn_valve_run(
            self._supply_off_later(supply, delay)
        )

    async def _supply_off_later(self, supply: dict, delay: float) -> None:
        supply_id = supply[const.SUPPLY_ID]
        runtime = self._supply_runtime()
        await asyncio.sleep(delay)
        runtime["off_tasks"].pop(supply_id, None)
        # Looked at again now: somebody may have taken a hold meanwhile.
        if runtime["holds"].count(supply_id) > 0:
            return
        await self._supply_off_now(supply)

    def _supply_cancel_off(self, supply_id: str) -> None:
        task = self._supply_runtime()["off_tasks"].pop(supply_id, None)
        if task is not None and not task.done():
            task.cancel()

    async def _supply_off_now(self, supply: dict) -> None:
        runtime = self._supply_runtime()
        runtime["on"].discard(supply[const.SUPPLY_ID])
        await self._supply_switch(supply, False)

    # --- while the valve is open --------------------------------------------

    async def _hold_valve(self, zone_id, held: float, supply, token, lag: float):
        """Hold the valve open for ``held`` seconds. True if the run was stopped.

        With a supply the wait is cut where the delays say: the supply comes on
        ``lag`` seconds after the valve opened, and goes off ``early`` seconds
        before it closes when it is the last hold on it.
        """
        if supply is None:
            return await self._wait_or_stop(zone_id, held)
        remaining = held
        if 0 < lag < remaining:
            if await self._wait_or_stop(zone_id, lag):
                return True
            remaining -= lag
            await self._supply_ensure_on(supply)
        early = max(0.0, -float(supply.get(const.SUPPLY_DELAY_AFTER) or 0.0))
        early = min(early, remaining)
        if early > 0:
            if remaining - early > 0 and await self._wait_or_stop(
                zone_id, remaining - early
            ):
                return True
            remaining = early
            if self._supply_runtime()["holds"].only_holder(
                supply[const.SUPPLY_ID], token
            ):
                await self._supply_off_now(supply)
        return await self._wait_or_stop(zone_id, remaining)

    # --- switching ----------------------------------------------------------

    async def _supply_switch(self, supply: dict, on: bool) -> bool:
        """Switch every entity of the supply. Never raises; says if all went well."""
        ok = True
        for entity_id in supply.get(const.SUPPLY_ENTITIES) or []:
            domain, on_service, off_service = self._valve_services(entity_id)
            service = on_service if on else off_service
            failed = False
            for attempt in range(1 if on else 2):
                try:
                    await self._async_call_valve_service(domain, service, entity_id)
                    failed = False
                    break
                except asyncio.CancelledError:
                    raise
                except Exception as e:  # noqa: BLE001 - a supply must not stop a run
                    failed = True
                    _LOGGER.error(
                        "Supply %s: %s on %s failed: %s",
                        supply.get(const.SUPPLY_NAME),
                        service,
                        entity_id,
                        e,
                    )
                    if attempt == 0 and not on:
                        await asyncio.sleep(SUPPLY_OFF_RETRY_DELAY)
            if failed:
                ok = False
                self._report_supply_problem(
                    supply,
                    entity_id,
                    (
                        PROBLEM_SUPPLY_DID_NOT_TURN_ON
                        if on
                        else PROBLEM_SUPPLY_DID_NOT_TURN_OFF
                    ),
                )
        return ok

    def _report_supply_problem(self, supply: dict, entity_id: str, reason: str) -> None:
        self.hass.bus.async_fire(
            f"{const.DOMAIN}_{const.EVENT_SUPPLY_PROBLEM}",
            {
                "supply_id": supply.get(const.SUPPLY_ID),
                "supply": supply.get(const.SUPPLY_NAME),
                "entity_id": entity_id,
                "reason": reason,
            },
        )

    async def _align_supplies(self) -> None:
        """Switch off a supply that is running with nothing holding it.

        What a restart leaves behind: a pump on whose valve closed, or whose
        off timer a reload cancelled. A reading that says nothing is not "on".
        """
        runtime = self._supply_runtime()
        in_use = runtime["holds"].in_use()
        for supply in getattr(self.store.config, const.CONF_SUPPLIES, None) or []:
            if not usable(supply) or supply[const.SUPPLY_ID] in in_use:
                continue
            for entity_id in supply.get(const.SUPPLY_ENTITIES) or []:
                state = self.hass.states.get(entity_id)
                if state is not None and state.state in _ON_STATES:
                    _LOGGER.warning(
                        "Full controller: supply %s is on and no run holds it, "
                        "switching it off",
                        supply.get(const.SUPPLY_NAME),
                    )
                    await self._supply_off_now(supply)
                    break
