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

import homeassistant.util.dt as dt_util
from homeassistant.const import CONF_LONGITUDE
from homeassistant.core import callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_track_point_in_utc_time,
    async_track_sunrise,
    async_track_sunset,
    async_track_time_change,
)
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .helpers import (
    check_time,
    convert_between,
    find_next_solar_azimuth_time,
    normalize_azimuth_angle,
)

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

        # A trigger that accounts for the duration has to know it to work out
        # when to start, so there is nothing to schedule without one. A trigger
        # that fires at a fixed offset does not need it and stays scheduled, so
        # its event is still fired (and shown as the next start) on a day when
        # no zone happens to need water.
        if total_duration <= 0 and selected.get(
            const.TRIGGER_CONF_ACCOUNT_FOR_DURATION, True
        ):
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
            elif trigger_type == const.TRIGGER_TYPE_TIME:
                at = trigger.get(const.TRIGGER_CONF_AT, const.TRIGGER_CONF_DEFAULT_AT)
                trigger_info[const.TRIGGER_CONF_AT] = at
                await self._register_time_trigger(
                    at,
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

    async def _register_time_trigger(
        self,
        at: str,
        trigger_name: str,
        total_duration: int,
        account_for_duration: bool,
        trigger_info: dict,
    ):
        """Register a trigger on a clock time.

        With ``account_for_duration`` the run is worked back from ``at`` so it
        finishes then, which is what people asking for this want: irrigation done
        by a fixed hour whatever the season. Without it, it starts at ``at``.

        Unlike the azimuth trigger this uses a repeating time tracker rather than
        a one-shot point in time, so it survives a day on which nothing
        re-registers it.
        """
        if not check_time(at):
            _LOGGER.warning(
                "Start trigger '%s' has an invalid time: %s", trigger_name, at
            )
            return
        hours, minutes = (int(part) for part in at.split(":")[:2])
        fire_at = datetime.now().replace(
            hour=hours, minute=minutes, second=0, microsecond=0
        )
        if account_for_duration:
            fire_at -= timedelta(seconds=total_duration)

        unsub = async_track_time_change(
            self.hass,
            partial(self._fire_start_event, trigger_info),
            hour=fire_at.hour,
            minute=fire_at.minute,
            second=0,
        )
        self._track_irrigation_triggers_unsub.append(unsub)
        _LOGGER.info(
            "Registered time trigger '%s': will fire at %02d:%02d%s",
            trigger_name,
            fire_at.hour,
            fire_at.minute,
            f" so the run finishes at {at}" if account_for_duration else "",
        )

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
                    # One structured evaluation rather than two booleans, so
                    # what the panel shows and what the runner decides come from
                    # the same call (#794).
                    evaluation = await self.async_evaluate_skip_conditions()
                    # Stamp it: the panel shows this next to the live preview,
                    # and "what it decided" is only meaningful with "when".
                    self._last_skip_evaluation = {
                        **evaluation,
                        "evaluated_at": dt_util.now().isoformat(),
                    }
                    skip_reason = evaluation["reason"]
                    self._watering_decision_today = not evaluation["should_skip"]
                    if skip_reason is not None:
                        _LOGGER.info(
                            "Today is not a watering day (%s); start triggers "
                            "will not fire",
                            skip_reason,
                        )
                        # Do NOT increment days-since-irrigation here: the
                        # midnight reset already counts every calendar day
                        # exactly once, skipped days included. Counting again
                        # here advanced the counter by 2 per skipped day, so a
                        # days-between setting of 5 watered every 3 days (#802).

                sheltered = set()
                if not self._watering_decision_today:
                    # A rain forecast is a statement about the sky, so it has
                    # nothing to say about zones under glass. When some of them
                    # are sheltered the run goes ahead for those, and only the
                    # zones the rain can actually reach are held back.
                    if (
                        self._last_skip_evaluation
                        and self._last_skip_evaluation.get("reason") == "precipitation"
                    ):
                        sheltered = await self.async_zones_sheltered_from_rain()
                    if not sheltered:
                        # Nothing is sheltered, so this is a skip day exactly as
                        # before: no event, and no automation of the user's runs
                        # against zeroed durations it may not think to check.
                        _LOGGER.info(
                            "Trigger '%s' reached but today is a skip day; not "
                            "firing event",
                            name,
                        )
                        # Say so. A skipped day used to be the absence of an
                        # event, which an automation cannot listen for: users
                        # ended up polling their zones hours later to find out
                        # nothing had run (#841).
                        self.hass.bus.fire(
                            f"{const.DOMAIN}_{const.EVENT_IRRIGATE_SKIPPED}",
                            {
                                **event_data,
                                "reason": (self._last_skip_evaluation or {}).get(
                                    "reason"
                                ),
                                "checks": (self._last_skip_evaluation or {}).get(
                                    "checks", []
                                ),
                            },
                        )
                        return
                    _LOGGER.info(
                        "Rain is forecast, so only the %s sheltered zone(s) run",
                        len(sheltered),
                    )
                    await self._hold_back_zones_exposed_to_rain(sheltered)

                # Rain between the calculation and now shortens the run.
                await self._apply_rain_since_calculation()

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
                # Fail safe, not fail open (#804): if we cannot tell whether
                # today is a watering day, not watering is recoverable (one
                # missed day, visible in the log) while watering on an
                # unevaluated decision is not. Firing here also risked a double
                # fire when the exception came from the post-fire bookkeeping.
                _LOGGER.error(
                    "Error evaluating irrigation conditions for trigger '%s'; "
                    "not firing the start event (fail-safe): %s",
                    name,
                    e,
                )

        self.hass.async_create_task(check_and_fire())

    async def _hold_back_zones_exposed_to_rain(self, sheltered: set) -> None:
        """Zero this run for every zone the forecast rain will reach.

        The start event is a single event for the whole install, and an
        executor decides what to water from each zone's duration. So holding a
        zone back means giving it a duration of 0 for this run, which is the
        same thing the calculation already does for a zone that has not reached
        its threshold.

        The bucket is left alone on purpose. It is a running balance, so the
        deficit simply rolls over to the next run, exactly as it would have on
        a whole skipped day.
        """
        try:
            zones = await self.store.async_get_zones()
        except Exception as e:  # pragma: no cover - defensive
            _LOGGER.error("Could not read the zones to hold back: %s", e)
            return

        for zone in zones:
            zone_id = zone.get(const.ZONE_ID)
            if zone_id in sheltered:
                continue
            if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                continue
            if not zone.get(const.ZONE_DURATION):
                continue
            _LOGGER.info(
                "Zone %s is held back: rain is forecast and it is not sheltered",
                zone.get(const.ZONE_NAME),
            )
            await self.store.async_update_zone(zone_id, {const.ZONE_DURATION: 0})
        async_dispatcher_send(self.hass, const.DOMAIN + "_update_frontend")

    async def _apply_rain_since_calculation(self):
        """Shorten each zone's run by the rain that fell since it was calculated.

        The duration is worked out at calculation time, hours before irrigation
        starts, and rain in between was ignored: a bucket of -12 mm followed by
        8 mm of rain overnight still watered 12 mm (#810).

        The bucket itself is deliberately left alone. It is a running balance:
        irrigation credits it by the water actually applied, and the next
        calculation adds the whole interval's rain, so crediting the rain here as
        well would count it twice. Shortening only this run keeps the balance
        exact, since the smaller amount applied is what gets credited.

        A zone whose sensor group saw no rain is not touched at all, so a dry
        night leaves the calculated duration exactly as it was.
        """
        try:
            zones = await self.store.async_get_zones()
        except Exception as e:  # pragma: no cover - defensive
            _LOGGER.error("Could not read the zones to account for rain: %s", e)
            return

        ha_config_is_metric = self.hass.config.units is METRIC_SYSTEM
        for zone in zones:
            if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                # A manual zone carries a duration its owner set, not one
                # derived from the bucket.
                continue
            if not zone.get(const.ZONE_DURATION):
                continue
            try:
                rain_mm = await self.precipitation_since_last_calculation(zone)
                # Rain an asserted bucket value already accounted for is not
                # available to shorten the run either (#811).
                rain_mm -= zone.get(const.ZONE_PRECIPITATION_SUPERSEDED) or 0.0
                if rain_mm <= 0:
                    continue
                rain_native = (
                    rain_mm
                    if ha_config_is_metric
                    else convert_between(const.UNIT_MM, const.UNIT_INCH, rain_mm)
                )
                bucket = (zone.get(const.ZONE_BUCKET) or 0.0) + rain_native
                duration = self.duration_from_bucket(zone, bucket)
                # Rain can only ever shorten a run. Anything else would mean the
                # two ways of deriving a duration from a bucket have drifted
                # apart, and lengthening a run over rain is not a thing to do on
                # the strength of that.
                if duration >= zone.get(const.ZONE_DURATION):
                    continue
                _LOGGER.info(
                    "Zone %s: %.1f mm of rain since the calculation, watering for %s s instead of %s s",
                    zone.get(const.ZONE_NAME),
                    rain_mm,
                    duration,
                    zone.get(const.ZONE_DURATION),
                )
                await self.store.async_update_zone(
                    zone.get(const.ZONE_ID), {const.ZONE_DURATION: duration}
                )
                async_dispatcher_send(
                    self.hass,
                    const.DOMAIN + "_config_updated",
                    zone.get(const.ZONE_ID),
                )
            except Exception as e:
                # Watering the calculated amount is the previous behaviour, so a
                # failure here costs accuracy, not the run.
                _LOGGER.error(
                    "Could not account for rain since the calculation on zone %s: %s",
                    zone.get(const.ZONE_NAME),
                    e,
                )

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
