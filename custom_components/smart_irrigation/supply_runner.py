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
  hold. A reload cancels it without firing it, but switches the supply off on
  the way out; and if that is missed, the next start finds a supply that is on
  and has no holds, and switches it off.
* Switching a supply on or off is done under a lock of its own, so a zone that
  arrives while another is switching it (or waiting out the pump's lead) waits
  its turn instead of reading a state that is not true yet.
* A supply that did not go off stays recorded as on, and the off is asked again
  after a few growing waits. One that did not come on keeps its zone's valve
  shut, and the problem is reported.
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
# Waits before the later tries at a supply that would not go off (bounded: a
# supply still on after them stays recorded as on, for the next run or start).
SUPPLY_OFF_RETRY_BACKOFF = (15.0, 45.0, 120.0)
# When, after the start, a supply whose state was unreadable is looked at again.
SUPPLY_ALIGN_RECHECK_AT = (30.0, 120.0)
# How long a teardown waits for a supply to go off.
SUPPLY_TEARDOWN_TIMEOUT = 10.0

# Readings that say nothing about whether a supply is running.
_UNREADABLE = (None, "", "unknown", "unavailable")


class SupplyDidNotStart(Exception):
    """The supply would not come on: the valve it feeds must stay shut."""


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
                "retry_tasks": {},
                "locks": {},
            }
        return runtime

    def _supply_lock(self, supply_id: str) -> asyncio.Lock:
        """The lock that serialises the on and off of one supply."""
        locks = self._supply_runtime()["locks"]
        lock = locks.get(supply_id)
        if lock is None:
            lock = locks[supply_id] = asyncio.Lock()
        return lock

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
        the supply was leading and the valve must not open at all. Raises
        SupplyDidNotStart when the supply would not come on.

        The lock is kept through the pump's lead: a second zone arriving meanwhile
        waits for it to be over, and does not open against a pump still priming.
        """
        runtime = self._supply_runtime()
        supply_id = supply[const.SUPPLY_ID]
        runtime["holds"].acquire(supply_id, token)
        self._supply_cancel_off(supply_id)
        async with self._supply_lock(supply_id):
            if supply_id in runtime["on"]:
                return 0.0
            delay = float(supply.get(const.SUPPLY_DELAY_BEFORE) or 0.0)
            if delay < 0:
                return -delay
            if not await self._supply_turn_on(supply):
                raise SupplyDidNotStart(supply_id)
            if delay > 0 and await self._wait_or_stop(zone_id, delay):
                return None
            return 0.0

    async def _supply_turn_on(self, supply: dict) -> bool:
        """Switch the supply on, with its lock held. Recorded as on only if it is."""
        runtime = self._supply_runtime()
        supply_id = supply[const.SUPPLY_ID]
        # Recorded before the call: a cancellation in the middle of it must find
        # the supply on, and put it off.
        runtime["on"].add(supply_id)
        ok = False
        try:
            ok = await self._supply_switch(supply, True)
        finally:
            if not ok:
                runtime["on"].discard(supply_id)
        if not ok and len(supply.get(const.SUPPLY_ENTITIES) or []) > 1:
            # One of several came on, maybe: do not leave it running alone.
            await self._supply_switch(supply, False, quiet=True)
        return ok

    async def _supply_ensure_on(self, supply: dict) -> bool:
        runtime = self._supply_runtime()
        supply_id = supply[const.SUPPLY_ID]
        async with self._supply_lock(supply_id):
            if supply_id in runtime["on"]:
                return True
            return await self._supply_turn_on(supply)

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

    async def _supply_off_now(
        self,
        supply: dict,
        *,
        respect_holds: bool = True,
        retry: bool = True,
        quiet: bool = False,
    ) -> bool:
        """Switch the supply off. True if it is off, or was not to be switched.

        A supply that will not go off stays recorded as on, so that the release
        of the next run, the next start, and the retries scheduled here ask
        again. ``respect_holds`` leaves it on if a zone took a hold while this
        waited for the lock; the early off of a negative delay passes False,
        being asked by the very zone that holds it.
        """
        runtime = self._supply_runtime()
        supply_id = supply[const.SUPPLY_ID]
        async with self._supply_lock(supply_id):
            if respect_holds and runtime["holds"].count(supply_id) > 0:
                return True
            runtime["on"].discard(supply_id)
            try:
                ok = await self._supply_switch(supply, False, quiet=quiet)
            except asyncio.CancelledError:
                runtime["on"].add(supply_id)
                raise
            if not ok:
                runtime["on"].add(supply_id)
                if retry:
                    self._supply_schedule_off_retry(supply)
            return ok

    def _supply_schedule_off_retry(self, supply: dict) -> None:
        runtime = self._supply_runtime()
        supply_id = supply[const.SUPPLY_ID]
        task = runtime["retry_tasks"].get(supply_id)
        if task is not None and not task.done():
            return
        runtime["retry_tasks"][supply_id] = self._spawn_valve_run(
            self._supply_off_retry(supply)
        )

    async def _supply_off_retry(self, supply: dict) -> None:
        runtime = self._supply_runtime()
        supply_id = supply[const.SUPPLY_ID]
        try:
            for wait in SUPPLY_OFF_RETRY_BACKOFF:
                await asyncio.sleep(wait)
                if supply_id not in runtime["on"]:
                    return  # Switched off by someone else meanwhile.
                if runtime["holds"].count(supply_id) > 0:
                    return  # Wanted on again; its release will put it off.
                _LOGGER.warning(
                    "Supply %s did not go off, trying again",
                    supply.get(const.SUPPLY_NAME),
                )
                if await self._supply_off_now(supply, retry=False, quiet=True):
                    return
            _LOGGER.error(
                "Supply %s is still on after the retries; the next run or "
                "restart switches it off",
                supply.get(const.SUPPLY_NAME),
            )
        except asyncio.CancelledError:
            raise
        except Exception as e:  # noqa: BLE001 - a retry must not leave a stray error
            _LOGGER.error("Supply off retry failed: %s", e)
        finally:
            if runtime["retry_tasks"].get(supply_id) is asyncio.current_task():
                runtime["retry_tasks"].pop(supply_id, None)

    def _supply_teardown_pending(self) -> list:
        """The supplies to switch off as the runner is torn down.

        A pending off timer, a retry or a supply recorded as on, with no hold:
        the tasks that would have switched them off are about to be cancelled.
        """
        runtime = getattr(self, "_supply_runtime_state", None)
        if runtime is None:
            return []
        in_use = runtime["holds"].in_use()
        ids = set(runtime["off_tasks"]) | set(runtime["retry_tasks"]) | runtime["on"]
        runtime["off_tasks"].clear()
        runtime["retry_tasks"].clear()
        found = []
        for supply in getattr(self.store.config, const.CONF_SUPPLIES, None) or []:
            if (
                usable(supply)
                and supply[const.SUPPLY_ID] in ids
                and supply[const.SUPPLY_ID] not in in_use
            ):
                found.append(supply)
        return found

    async def _supply_teardown_off(self, supplies: list) -> None:
        """Best effort, bounded: the pumps whose timer a teardown just cancelled."""
        for supply in supplies:
            try:
                await asyncio.wait_for(
                    self._supply_off_now(supply, retry=False),
                    SUPPLY_TEARDOWN_TIMEOUT,
                )
            except asyncio.CancelledError:
                raise
            except Exception as e:  # noqa: BLE001 - a teardown goes on
                _LOGGER.error(
                    "Supply %s could not be switched off at teardown: %s",
                    supply.get(const.SUPPLY_NAME),
                    e,
                )

    async def _supply_after_expired_run(self, zone_id) -> None:
        """A run found expired at startup: its pump may have been left on.

        The run takes no hold, as its valve is only being closed; this puts the
        pump off if nothing else holds it.
        """
        supply = self._supply_for_zone(self._zone_or_stub(zone_id))
        if supply is None:
            return
        try:
            await self._supply_off_now(supply)
        except asyncio.CancelledError:
            raise
        except Exception as e:  # noqa: BLE001 - the credit still has to be made
            _LOGGER.error("Supply off after an expired run failed: %s", e)

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
            # A pump that would not come on has been reported; the valve is
            # open already and the pass goes on.
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
                await self._supply_off_now(supply, respect_holds=False)
        return await self._wait_or_stop(zone_id, remaining)

    # --- switching ----------------------------------------------------------

    async def _supply_switch(self, supply: dict, on: bool, quiet: bool = False) -> bool:
        """Switch every entity of the supply. Never raises; says if all went well."""
        ok = True
        for entity_id in supply.get(const.SUPPLY_ENTITIES) or []:
            domain, on_service, off_service = self._valve_services(entity_id)
            service = on_service if on else off_service
            failed = False
            for attempt in range(2):
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
                    if attempt == 0:
                        await asyncio.sleep(SUPPLY_OFF_RETRY_DELAY)
            if not failed:
                self._fire_valve_event(
                    const.EVENT_VALVE_ON if on else const.EVENT_VALVE_OFF,
                    entity_id,
                    kind="supply",
                    supply_id=supply.get(const.SUPPLY_ID),
                    supply=supply.get(const.SUPPLY_NAME),
                )
            if failed:
                ok = False
                if quiet:
                    continue
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

    async def _align_supplies(self, only=None, attempt: int = 0) -> None:
        """Switch off a supply that is running with nothing holding it.

        What a restart leaves behind: a pump on whose valve closed, or whose
        off timer a reload cancelled. A reading that says nothing is not "on",
        but it is looked at again later, a bounded number of times, since the
        entity of a pump often comes up after Home Assistant has started. A
        supply recorded as on after an off that failed is switched off here too.
        """
        runtime = self._supply_runtime()
        in_use = runtime["holds"].in_use()
        unknown = []
        for supply in getattr(self.store.config, const.CONF_SUPPLIES, None) or []:
            supply_id = supply.get(const.SUPPLY_ID)
            if not usable(supply) or supply_id in in_use:
                continue
            if only is not None and supply_id not in only:
                continue
            seen_on = supply_id in runtime["on"]
            unreadable = False
            for entity_id in supply.get(const.SUPPLY_ENTITIES) or []:
                state = self.hass.states.get(entity_id)
                if state is None or state.state in _UNREADABLE:
                    unreadable = True
                elif state.state in _ON_STATES:
                    seen_on = True
            if seen_on:
                _LOGGER.warning(
                    "Full controller: supply %s is on and no run holds it, "
                    "switching it off",
                    supply.get(const.SUPPLY_NAME),
                )
                await self._supply_off_now(supply)
            elif unreadable:
                unknown.append(supply_id)
        if unknown and attempt < len(SUPPLY_ALIGN_RECHECK_AT):
            self._spawn_valve_run(self._align_recheck(unknown, attempt))

    async def _align_recheck(self, supply_ids: list, attempt: int) -> None:
        previous = SUPPLY_ALIGN_RECHECK_AT[attempt - 1] if attempt else 0.0
        try:
            await asyncio.sleep(SUPPLY_ALIGN_RECHECK_AT[attempt] - previous)
            await self._align_supplies(only=set(supply_ids), attempt=attempt + 1)
        except asyncio.CancelledError:
            raise
        except Exception as e:  # noqa: BLE001 - a recheck must not leave a stray error
            _LOGGER.error("Supply alignment recheck failed: %s", e)
