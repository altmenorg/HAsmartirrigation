"""Irrigation start-event triggers for the Smart Irrigation integration.

Extracted from __init__.py: registration of the configured start trigger
(sunrise / sunset / solar azimuth, plus the legacy "sunrise minus total
duration" default) and the per-trigger fire logic, including the once-per-day
watering decision (precipitation forecast + days-between) and the midnight
reset. The methods live on a mixin the coordinator inherits; their bodies are
unchanged and still use ``self`` to reach coordinator state.
"""

import logging
from datetime import datetime, timedelta
from functools import partial

from homeassistant.const import CONF_LONGITUDE
from homeassistant.core import callback
from homeassistant.helpers.event import (
    async_track_point_in_utc_time,
    async_track_sunrise,
    async_track_sunset,
)

from . import const
from .helpers import find_next_solar_azimuth_time, normalize_azimuth_angle

_LOGGER = logging.getLogger(__name__)


class TriggersMixin:
    """Start-event trigger registration and firing for the coordinator.

    Mixed into ``SmartIrrigationCoordinator``; methods use ``self`` to reach
    coordinator state (store, hass, the skip-condition checks, the trigger
    bookkeeping attributes, and the direct-valve runner).
    """

    async def register_start_event(self):
        """Register a callback to fire the irrigation start event before sunrise based on total duration of enabled zones."""
        # sun_state = self.hass.states.get("sun.sun")
        # if sun_state is not None:
        #    sun_rise = sun_state.attributes.get("next_rising")
        #    if sun_rise is not None:
        #        try:
        #            sun_rise = datetime.strptime(sun_rise, "%Y-%m-%dT%H:%M:%S.%f%z")
        #        except(ValueError):
        #            sun_rise = datetime.strptime(sun_rise, "%Y-%m-%dT%H:%M:%S%z")
        total_duration = await self.get_total_duration_all_enabled_zones()
        if self._track_sunrise_event_unsub:
            self._track_sunrise_event_unsub()
            self._track_sunrise_event_unsub = None

        for unsub in self._track_irrigation_triggers_unsub:
            unsub()
        self._track_irrigation_triggers_unsub.clear()

        # Get triggers configuration and the single active trigger. The defined
        # triggers are just the pool of options; only the selected one starts
        # irrigation, so multiple triggers can no longer each fire a full run
        # (which would over-water).
        config = await self.store.async_get_config()
        triggers = config.get(const.CONF_IRRIGATION_START_TRIGGERS, [])
        active = config.get(
            const.CONF_ACTIVE_START_TRIGGER, const.CONF_DEFAULT_ACTIVE_START_TRIGGER
        )

        # "default" (or a missing/deleted selection) -> legacy "sunrise minus
        # the total watering duration" so the run finishes at sunrise.
        selected = None
        if active and active != const.START_TRIGGER_DEFAULT:
            selected = next(
                (t for t in triggers if t.get(const.TRIGGER_CONF_NAME) == active),
                None,
            )
            if selected is None:
                _LOGGER.warning(
                    "Active start trigger '%s' not found; using default "
                    "(sunrise minus total duration)",
                    active,
                )

        if selected is None:
            await self._register_legacy_sunrise_trigger()
            return

        if total_duration <= 0:
            _LOGGER.info(
                "No enabled zones with duration > 0, skipping trigger registration"
            )
            return
        if not selected.get(const.TRIGGER_CONF_ENABLED, True):
            _LOGGER.info(
                "Active start trigger '%s' is disabled; nothing scheduled", active
            )
            return
        await self._register_trigger(selected, total_duration)

    async def _register_trigger(self, trigger, total_duration):
        """Register one start trigger (sunrise / sunset / solar azimuth)."""
        trigger_type = trigger.get(const.TRIGGER_CONF_TYPE)
        offset_minutes = trigger.get(const.TRIGGER_CONF_OFFSET_MINUTES, 0)
        trigger_name = trigger.get(const.TRIGGER_CONF_NAME, "Unnamed Trigger")
        account_for_duration = trigger.get(
            const.TRIGGER_CONF_ACCOUNT_FOR_DURATION, True
        )
        # Identity carried into the fired event so automations can tell
        # triggers apart (see _fire_start_event).
        trigger_info = {
            const.TRIGGER_CONF_NAME: trigger_name,
            const.TRIGGER_CONF_TYPE: trigger_type,
            const.TRIGGER_CONF_OFFSET_MINUTES: offset_minutes,
            const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: account_for_duration,
        }

        try:
            if trigger_type == const.TRIGGER_TYPE_SUNRISE:
                await self._register_sunrise_trigger(
                    offset_minutes,
                    trigger_name,
                    total_duration,
                    account_for_duration,
                    trigger_info,
                )
            elif trigger_type == const.TRIGGER_TYPE_SUNSET:
                await self._register_sunset_trigger(
                    offset_minutes,
                    trigger_name,
                    total_duration,
                    account_for_duration,
                    trigger_info,
                )
            elif trigger_type == const.TRIGGER_TYPE_SOLAR_AZIMUTH:
                azimuth_angle = trigger.get(const.TRIGGER_CONF_AZIMUTH_ANGLE, 0)
                # Normalize azimuth angle to 0-360 range
                azimuth_angle = normalize_azimuth_angle(azimuth_angle)
                trigger_info[const.TRIGGER_CONF_AZIMUTH_ANGLE] = azimuth_angle
                await self._register_azimuth_trigger(
                    azimuth_angle,
                    offset_minutes,
                    trigger_name,
                    total_duration,
                    account_for_duration,
                    trigger_info,
                )
            else:
                _LOGGER.warning("Unknown trigger type: %s", trigger_type)
        except Exception as e:
            _LOGGER.error("Failed to register trigger '%s': %s", trigger_name, e)

    async def _register_legacy_sunrise_trigger(self):
        """Register the legacy sunrise trigger for backward compatibility."""
        total_duration = await self.get_total_duration_all_enabled_zones()
        if total_duration > 0:
            # time_to_wait = sun_rise - datetime.now(timezone.utc) - timedelta(seconds=total_duration)
            # time_to_fire = datetime.now(timezone.utc) + time_to_wait
            # time_to_fire = sun_rise - timedelta(seconds=total_duration)
            # time_to_wait = total_duration

            # time_to_fire = datetime.now(timezone.utc)+timedelta(seconds=total_duration)

            # self._track_sunrise_event_unsub = async_track_point_in_utc_time(
            #    self.hass, self._fire_start_event, point_in_time=time_to_fire
            # )
            legacy_trigger_info = {
                const.TRIGGER_CONF_NAME: "default",
                const.TRIGGER_CONF_TYPE: const.TRIGGER_TYPE_SUNRISE,
                const.TRIGGER_CONF_OFFSET_MINUTES: 0,
                const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: True,
            }
            self._track_sunrise_event_unsub = async_track_sunrise(
                self.hass,
                partial(self._fire_start_event, legacy_trigger_info),
                timedelta(seconds=0 - total_duration),
            )
            event_to_fire = f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
            _LOGGER.info(
                "Legacy start irrigation event %s will fire at %s seconds before sunrise",
                event_to_fire,
                total_duration,
            )

    async def _register_sunrise_trigger(
        self,
        offset_minutes: int,
        trigger_name: str,
        total_duration: int,
        account_for_duration: bool,
        trigger_info: dict,
    ):
        """Register a sunrise-based trigger."""
        # Calculate offset based on account_for_duration setting
        if account_for_duration:
            if offset_minutes == 0:
                # Legacy behavior: use total duration for automatic timing
                offset_seconds = -total_duration  # Negative for "before"
            else:
                # Account for duration: subtract total duration from offset to finish at the target time
                offset_seconds = (offset_minutes * 60) - total_duration
        else:
            # Start exactly at the specified time
            offset_seconds = offset_minutes * 60

        unsub = async_track_sunrise(
            self.hass,
            partial(self._fire_start_event, trigger_info),
            timedelta(seconds=offset_seconds),
        )
        self._track_irrigation_triggers_unsub.append(unsub)

        offset_desc = (
            f"{abs(offset_seconds)} seconds before"
            if offset_seconds < 0
            else f"{offset_seconds} seconds after"
        )
        duration_desc = (
            " (accounting for total zone duration)" if account_for_duration else ""
        )
        _LOGGER.info(
            "Registered sunrise trigger '%s': will fire %s sunrise%s",
            trigger_name,
            offset_desc,
            duration_desc,
        )

    async def _register_sunset_trigger(
        self,
        offset_minutes: int,
        trigger_name: str,
        total_duration: int,
        account_for_duration: bool,
        trigger_info: dict,
    ):
        """Register a sunset-based trigger."""
        # Calculate offset based on account_for_duration setting
        if account_for_duration:
            # Account for duration: subtract total duration from offset to finish at the target time
            offset_seconds = (offset_minutes * 60) - total_duration
        else:
            # Start exactly at the specified time
            offset_seconds = offset_minutes * 60

        unsub = async_track_sunset(
            self.hass,
            partial(self._fire_start_event, trigger_info),
            timedelta(seconds=offset_seconds),
        )
        self._track_irrigation_triggers_unsub.append(unsub)

        offset_desc = (
            f"{abs(offset_seconds)} seconds before"
            if offset_seconds < 0
            else f"{offset_seconds} seconds after"
        )
        duration_desc = (
            " (accounting for total zone duration)" if account_for_duration else ""
        )
        _LOGGER.info(
            "Registered sunset trigger '%s': will fire %s sunset%s",
            trigger_name,
            offset_desc,
            duration_desc,
        )

    async def _register_azimuth_trigger(
        self,
        azimuth_angle: float,
        offset_minutes: int,
        trigger_name: str,
        total_duration: int,
        account_for_duration: bool,
        trigger_info: dict,
    ):
        """Register a solar azimuth-based trigger."""
        # Calculate next occurrence of this azimuth
        latitude = self._latitude
        longitude = self.hass.config.as_dict().get(CONF_LONGITUDE, 0.0)

        next_azimuth_time = find_next_solar_azimuth_time(
            latitude, longitude, azimuth_angle, datetime.now()
        )

        if next_azimuth_time is None:
            _LOGGER.warning(
                "Could not calculate next occurrence of azimuth %s° for trigger '%s'",
                azimuth_angle,
                trigger_name,
            )
            return

        # Calculate trigger time based on account_for_duration setting
        if account_for_duration:
            # Account for duration: subtract total duration from offset to finish at the target time
            trigger_time = (
                next_azimuth_time
                + timedelta(minutes=offset_minutes)
                - timedelta(seconds=total_duration)
            )
        else:
            # Start exactly at the specified time
            trigger_time = next_azimuth_time + timedelta(minutes=offset_minutes)

        # Schedule the trigger

        unsub = async_track_point_in_utc_time(
            self.hass,
            partial(self._fire_start_event, trigger_info),
            trigger_time,
        )
        self._track_irrigation_triggers_unsub.append(unsub)

        offset_desc = (
            f" with {offset_minutes} minute offset" if offset_minutes != 0 else ""
        )
        duration_desc = (
            " (accounting for total zone duration)" if account_for_duration else ""
        )
        _LOGGER.info(
            "Registered azimuth trigger '%s': will fire when sun reaches %s°%s at %s%s",
            trigger_name,
            azimuth_angle,
            offset_desc,
            trigger_time,
            duration_desc,
        )

    @callback
    def _fire_start_event(self, trigger_info, *args):
        """Fire the irrigation start event for one trigger, if conditions allow.

        Each trigger fires independently. The "is today a watering day" decision
        (precipitation forecast + days-between-irrigation) is computed once and
        shared by all triggers for the day. The fired event carries the trigger's
        identity (name/type/offset) so automations can tell triggers apart and
        react per-trigger.
        """
        name = trigger_info.get(const.TRIGGER_CONF_NAME) or "Unnamed Trigger"

        if name in self._fired_triggers_today:
            _LOGGER.debug("Trigger '%s' already fired today, skipping", name)
            return
        # Mark synchronously to avoid any re-entrancy double-fire.
        self._fired_triggers_today.add(name)

        async def check_and_fire():
            event_to_fire = f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
            event_data = {
                "trigger_name": name,
                "trigger_type": trigger_info.get(const.TRIGGER_CONF_TYPE),
                "offset_minutes": trigger_info.get(const.TRIGGER_CONF_OFFSET_MINUTES),
                "account_for_duration": trigger_info.get(
                    const.TRIGGER_CONF_ACCOUNT_FOR_DURATION
                ),
            }
            try:
                # Decide once per day whether today is a watering day.
                if self._watering_decision_today is None:
                    skip_reason = None
                    if await self._check_precipitation_forecast():
                        skip_reason = "forecasted precipitation"
                    elif await self._check_days_between_irrigation():
                        skip_reason = "insufficient days since last irrigation"
                    self._watering_decision_today = skip_reason is None
                    if skip_reason is not None:
                        _LOGGER.info(
                            "Today is not a watering day (%s); start triggers "
                            "will not fire",
                            skip_reason,
                        )
                        # Count this as a (skipped) day, once.
                        await self._increment_days_since_irrigation()

                if not self._watering_decision_today:
                    _LOGGER.info(
                        "Trigger '%s' reached but today is a skip day; not "
                        "firing event",
                        name,
                    )
                    return

                # Fire the event with the trigger's identity.
                self.hass.bus.fire(event_to_fire, event_data)
                _LOGGER.info(
                    "Fired start event %s for trigger '%s'", event_to_fire, name
                )

                # Optional executor: if direct valve control is on, SI drives the
                # valves itself (the event above still fires for external setups).
                if (
                    getattr(
                        self.store.config,
                        const.CONF_DIRECT_VALVE_CONTROL_ENABLED,
                        False,
                    )
                    is True
                ):
                    self._spawn_valve_run(self.async_run_direct_valves())

                # On the first actual fire of the day, mark the day as watered
                # and reset the days-since counter (once, not per trigger).
                if not self._start_event_fired_today:
                    self._start_event_fired_today = True
                    await self._reset_days_since_irrigation()
                    await self.store.async_update_config(
                        {const.START_EVENT_FIRED_TODAY: True}
                    )
            except Exception as e:
                _LOGGER.error(
                    "Error evaluating irrigation conditions for trigger '%s', "
                    "firing event anyway: %s",
                    name,
                    e,
                )
                self.hass.bus.fire(event_to_fire, event_data)

        self.hass.async_create_task(check_and_fire())

    @callback
    def _reset_event_fired_today(self, *args):
        # New day: every trigger may fire again and the watering decision is
        # recomputed on the next trigger that is reached.
        self._fired_triggers_today.clear()
        self._watering_decision_today = None
        if self._start_event_fired_today:
            _LOGGER.info("Resetting start event fired today tracker")
            self._start_event_fired_today = False
            # save config asynchronously - fire-and-forget since this is a callback
            self.hass.async_create_task(
                self.store.async_update_config(
                    {const.START_EVENT_FIRED_TODAY: self._start_event_fired_today}
                )
            )

        # Increment days since last irrigation at midnight
        # Fire-and-forget async task
        self.hass.async_create_task(self._increment_days_since_irrigation())
