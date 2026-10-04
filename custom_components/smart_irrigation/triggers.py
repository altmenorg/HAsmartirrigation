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
from homeassistant.helpers.sun import get_astral_event_next

from . import const
from .calcmodules.consumes import sourced_fields
from .helpers import (
    check_time,
    find_next_solar_azimuth_time,
    normalize_azimuth_angle,
)
from .rain_history import MAX_FACTOR, MIN_FACTOR, rain_suppression

_LOGGER = logging.getLogger(__name__)


def sun_trigger_offset_seconds(
    offset_minutes, total_duration, account_for_duration
) -> int:
    """Seconds from the sun event to the start of a sunrise or sunset trigger.

    The trigger's offset, less the whole run when it is to finish at that
    moment rather than start then. The Info page's preview reads the same
    function, so the start it shows is the one the trigger fires at.
    """
    offset_seconds = int(offset_minutes or 0) * 60
    if account_for_duration:
        offset_seconds -= int(total_duration or 0)
    return offset_seconds


class TriggersMixin:
    """Start-event trigger registration and firing for the coordinator.

    Mixed into ``SmartIrrigationCoordinator``; methods use ``self`` to reach
    coordinator state (store, hass, the skip-condition checks, the trigger
    bookkeeping attributes, and the direct-valve runner).
    """

    async def register_start_event(self):
        """Register a callback to fire the irrigation start event before sunrise based on total duration of enabled zones.

        Every path through this either arms a tracker or leaves the
        installation with none, and ``start_trigger_armed`` records which: the
        panel showed a start time worked out arithmetically whether or not
        anything was scheduled to happen at it, which is what a countdown that
        reaches zero and rolls over to tomorrow looks like (#841).
        """
        # sun_state = self.hass.states.get("sun.sun")
        # if sun_state is not None:
        #    sun_rise = sun_state.attributes.get("next_rising")
        #    if sun_rise is not None:
        #        try:
        #            sun_rise = datetime.strptime(sun_rise, "%Y-%m-%dT%H:%M:%S.%f%z")
        #        except(ValueError):
        #            sun_rise = datetime.strptime(sun_rise, "%Y-%m-%dT%H:%M:%S%z")
        total_duration = await self.get_total_duration_all_enabled_zones()
        self.start_trigger_armed = False
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
        self.start_trigger_armed = bool(self._track_irrigation_triggers_unsub)
        if selected.get(const.TRIGGER_CONF_ACCOUNT_FOR_DURATION, True):
            self._catch_up_missed_start(
                {
                    const.TRIGGER_CONF_NAME: selected.get(
                        const.TRIGGER_CONF_NAME, "Unnamed Trigger"
                    ),
                    const.TRIGGER_CONF_TYPE: selected.get(const.TRIGGER_CONF_TYPE),
                    const.TRIGGER_CONF_OFFSET_MINUTES: selected.get(
                        const.TRIGGER_CONF_OFFSET_MINUTES, 0
                    ),
                    const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: True,
                    const.TRIGGER_CONF_AT: selected.get(const.TRIGGER_CONF_AT),
                },
                total_duration,
            )

    def _start_target(self, trigger_info, now):
        """When a duration-aware trigger wants the run finished, or None.

        The next such moment from ``now``: the next sunrise or sunset plus the
        offset, or the next time the clock shows ``at``. None for a trigger
        type this does not know how to place (the solar azimuth).
        """
        trigger_type = trigger_info.get(const.TRIGGER_CONF_TYPE)
        offset = timedelta(
            minutes=trigger_info.get(const.TRIGGER_CONF_OFFSET_MINUTES) or 0
        )
        if trigger_type in (const.TRIGGER_TYPE_SUNRISE, const.TRIGGER_TYPE_SUNSET):
            event = (
                "sunrise" if trigger_type == const.TRIGGER_TYPE_SUNRISE else "sunset"
            )
            return get_astral_event_next(self.hass, event, now - offset) + offset
        if trigger_type == const.TRIGGER_TYPE_TIME:
            at = (
                trigger_info.get(const.TRIGGER_CONF_AT) or const.TRIGGER_CONF_DEFAULT_AT
            )
            if not check_time(at):
                return None
            hours, minutes = (int(part) for part in at.split(":")[:2])
            local = dt_util.as_local(now)
            target = local.replace(hour=hours, minute=minutes, second=0, microsecond=0)
            if target <= local:
                target += timedelta(days=1)
            return target
        return None

    def _catch_up_missed_start(self, trigger_info, total_duration) -> None:
        """Start now a run whose start time has already gone by.

        A trigger that finishes the run at a moment (sunrise, a clock time)
        starts it that long before. When that start is already past as the
        trigger is armed -- the run is longer than the time left before the
        moment, the calculation runs inside the watering window, or Home
        Assistant was restarting when the start came -- the tracker waits for
        the next day and nothing runs today. If the moment itself is still
        ahead, the run starts now: late, but before the moment it was meant to
        be done by, which is better than a day without water.
        """
        if not total_duration or total_duration <= 0:
            return
        try:
            now = dt_util.utcnow()
            target = self._start_target(trigger_info, now)
        except Exception as ex:  # noqa: BLE001 - arming must not fail over this
            _LOGGER.debug("Could not place the start trigger's moment: %s", ex)
            return
        if target is None:
            return
        start = target - timedelta(seconds=total_duration)
        if not start <= now < target:
            return
        if getattr(self, "_start_event_fired_today", False) and (
            dt_util.as_local(target).date() == dt_util.as_local(now).date()
        ):
            # Today's run has gone already. The flag is persisted, so this also
            # holds after a restart, when the triggers fired in memory are gone.
            return
        _LOGGER.warning(
            "Start trigger '%s': the start (%s) has already gone by and the run "
            "should finish by %s, so it starts now",
            trigger_info.get(const.TRIGGER_CONF_NAME),
            dt_util.as_local(start).strftime("%H:%M"),
            dt_util.as_local(target).strftime("%H:%M"),
        )
        self._fire_start_event(trigger_info)

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
            self.start_trigger_armed = True
            self._catch_up_missed_start(legacy_trigger_info, total_duration)
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
        offset_seconds = sun_trigger_offset_seconds(
            offset_minutes, total_duration, account_for_duration
        )

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
        offset_seconds = sun_trigger_offset_seconds(
            offset_minutes, total_duration, account_for_duration
        )

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
        # Both from the same place: the latitude followed manual coordinates
        # while the longitude was always Home Assistant's own.
        latitude = self._latitude
        longitude = getattr(self, "_effective_longitude", None)
        if longitude is None:
            longitude = self.hass.config.as_dict().get(CONF_LONGITUDE, 0.0)

        # In UTC: the sun's position is computed from UTC, and the local time
        # this used to pass was read as UTC, which moved the trigger by the
        # zone's offset from it (two hours in a French summer).
        next_azimuth_time = find_next_solar_azimuth_time(
            latitude, longitude, azimuth_angle, dt_util.utcnow()
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
                    # Fresh numbers first, when the user asked for them: the
                    # skip checks and the durations below should rest on them.
                    await self._recalculate_before_start()
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
                    # Decided with the day: the first run resets the counters,
                    # and a second trigger must not read that as "just watered".
                    try:
                        self._zones_held_by_days_between = (
                            await self.async_zones_held_by_days_between()
                        )
                    except Exception as e:  # noqa: BLE001 - an extra, not the decision
                        self._zones_held_by_days_between = set()
                        _LOGGER.warning(
                            "Could not work out the zones held by their days "
                            "between irrigation: %s",
                            e,
                        )
                    # Count the days the forecast holds the run back, so that
                    # showers forecast day after day cannot hold it back for
                    # ever (skip_conditions.py).
                    if skip_reason == "precipitation":
                        await self._count_precipitation_skip()
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

                # A zone that has to wait longer between two irrigations sits
                # this run out, whatever the other zones do (#875).
                await self._hold_back_zones_held_by_days_between(
                    getattr(self, "_zones_held_by_days_between", None) or set()
                )

                # A zone whose own soil is already moist sits this run out.
                await self._hold_back_zones_with_moist_soil()

                # Rain between the calculation and now shortens the run.
                await self._apply_rain_since_calculation()

                # Rain forecast for the day ahead shortens it as well, when the
                # user asked for that.
                await self._apply_forecast_rain_credit()

                # And, for a zone with no rain gauge and no service to give it
                # millimetres, what a binary rain sensor says about the last few
                # days shortens it too.
                self._last_rain_history = await self._apply_rain_history_suppression()

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

                # Only a run that waters something makes today a watering day
                # for days-between. A start with every duration at zero, or
                # every zone held back above, used to reset the counter too, so
                # the first day with a real deficit was vetoed and watering
                # slipped by up to days-between each time.
                if await self._any_zone_to_water():
                    # The general counter belongs to the zones that follow the
                    # general setting: a zone with days of its own, watered every
                    # day, must not keep the others from ever being due (#875).
                    if await self._any_zone_to_water(general_setting_only=True):
                        await self._reset_days_since_irrigation()
                    await self._reset_zone_days_since_irrigation()
                    await self.store.async_update_config(
                        {const.CONF_PRECIPITATION_SKIPS_IN_A_ROW: 0}
                    )
                else:
                    _LOGGER.info(
                        "Trigger '%s' fired with nothing to water; the days since "
                        "the last irrigation keep counting",
                        name,
                    )
                if not self._start_event_fired_today:
                    self._start_event_fired_today = True
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

    async def _count_precipitation_skip(self) -> None:
        """One more day held back by the forecast. Bookkeeping only: a failure
        here must not decide the day, so it is logged and left."""
        try:
            config = await self.store.async_get_config()
            count = int(config.get(const.CONF_PRECIPITATION_SKIPS_IN_A_ROW, 0) or 0)
            await self.store.async_update_config(
                {const.CONF_PRECIPITATION_SKIPS_IN_A_ROW: count + 1}
            )
        except Exception as ex:  # noqa: BLE001 - see docstring
            _LOGGER.warning("Could not count the day held back by rain: %s", ex)

    async def _any_zone_to_water(self, general_setting_only: bool = False) -> bool:
        """Whether a zone that is not disabled has a duration above zero.

        With ``general_setting_only``, only the zones that follow the general
        days-between setting count, not the ones with days of their own.
        """
        for zone in await self.store.async_get_zones():
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED:
                continue
            if (
                general_setting_only
                and zone.get(const.ZONE_DAYS_BETWEEN_IRRIGATION) is not None
            ):
                continue
            duration = zone.get(const.ZONE_DURATION)
            if isinstance(duration, (int, float)) and duration > 0:
                return True
        return False

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

    async def _recalculate_before_start(self) -> None:
        """Calculate the zones again just before the first start of the day.

        Opt-in (``recalculate_before_start``): it only makes sense when Smart
        Irrigation itself starts the watering. Whatever else does, a schedule of
        its own or Irrigation Unlimited, reads the durations when it likes and
        has no start of ours to wait for. The nightly calculation prices
        the evapotranspiration, the temperature and the wind of the hours before
        it; a start at sunset then waters on data some twenty hours old. Only
        the rain was brought up to date (rain since the calculation, the
        forecast, the rain history). This brings everything up to date by
        running the calculation itself, which also collects the weather again.

        Skipped when a zone was calculated within the hour, since nothing could
        be fresher. A failure leaves the zones as they were calculated: the run
        goes ahead on the earlier numbers, as it always did.
        """
        try:
            config = self.store.get_config() or {}
            if not config.get(const.CONF_RECALCULATE_BEFORE_START):
                return
            fresh = timedelta(minutes=const.RECALCULATE_FRESH_MINUTES)
            now = datetime.now()
            for zone in await self.store.async_get_zones():
                calculated = zone.get(const.ZONE_LAST_CALCULATED)
                if isinstance(calculated, str):
                    calculated = datetime.fromisoformat(calculated)
                if calculated is not None:
                    calculated = calculated.replace(tzinfo=None)
                    if now - calculated < fresh:
                        _LOGGER.debug(
                            "Not recalculating before the start: zone %s was "
                            "calculated less than an hour ago",
                            zone.get(const.ZONE_NAME),
                        )
                        return
            _LOGGER.info("Calculating again before the first start of the day")
            await self._async_calculate_all()
        except Exception as e:  # noqa: BLE001 - the run goes ahead on what it has
            _LOGGER.warning("Could not calculate again before the start: %s", e)

    async def _hold_back_zones_held_by_days_between(self, held: set) -> None:
        """Zero this run for the zones still within their days between irrigation.

        ``held`` is decided once a day (``async_zones_held_by_days_between``).
        The general setting applies to a zone without a value of its own, so with
        no zone customised this holds back exactly the zones the whole-day veto
        would have, and that veto normally gets there first. It matters when
        zones differ: the run goes ahead for the zones that are due and sits out
        for the others. The bucket is left alone, so the deficit rolls over to
        the next run (#875).
        """
        if not held:
            return
        try:
            zones = await self.store.async_get_zones()
        except Exception as e:  # noqa: BLE001 - never block the run over this
            _LOGGER.error("Could not read the zones to hold back: %s", e)
            return
        for zone in zones:
            if zone.get(const.ZONE_ID) not in held or not zone.get(const.ZONE_DURATION):
                continue
            _LOGGER.info(
                "Zone %s is held back: not enough days since it was last watered",
                zone.get(const.ZONE_NAME),
            )
            await self.store.async_update_zone(
                zone.get(const.ZONE_ID), {const.ZONE_DURATION: 0}
            )
        async_dispatcher_send(self.hass, const.DOMAIN + "_update_frontend")

    async def _hold_back_zones_with_moist_soil(self) -> None:
        """Zero this run for every zone whose soil moisture sensor reads moist.

        The sensor measures the soil, the bucket models it, and where they
        disagree the measurement is right: a zone whose soil reads moist is at
        field capacity, so its bucket is set to it. The bucket used to be left
        alone, which kept the modelled deficit and watered all of it the first
        morning the sensor dipped below its threshold, on soil that had been
        moist all along. Setting it is an assertion, like ``set_bucket``, so
        the zone's next window starts now. A zone whose sensor cannot be read
        waters as usual.
        """
        try:
            held = await self.async_zones_held_by_soil_moisture()
            if not held:
                return
            zones = await self.store.async_get_zones()
        except Exception as e:  # noqa: BLE001 - never block the run over this
            _LOGGER.error("Could not read the soil moisture sensors: %s", e)
            return
        for zone in zones:
            if zone.get(const.ZONE_ID) not in held or not zone.get(const.ZONE_DURATION):
                continue
            _LOGGER.info(
                "Zone %s is held back: its soil moisture is at or above %s%%, "
                "so its bucket is set to field capacity",
                zone.get(const.ZONE_NAME),
                zone.get(const.ZONE_SOIL_MOISTURE_THRESHOLD),
            )
            changes = {const.ZONE_DURATION: 0}
            if (zone.get(const.ZONE_BUCKET) or 0.0) < 0:
                changes.update(
                    {
                        const.ZONE_BUCKET: 0.0,
                        const.ZONE_LAST_CONSUMED_AT: datetime.now(),
                        const.ZONE_PRECIPITATION_SUPERSEDED: 0.0,
                    }
                )
            await self.store.async_update_zone(zone.get(const.ZONE_ID), changes)
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
                # The bucket is stored in mm (units.py).
                bucket = (zone.get(const.ZONE_BUCKET) or 0.0) + rain_mm
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

    async def _apply_forecast_rain_credit(self):
        """Shorten each zone's run by the rain forecast for the day after it starts.

        Opt-in (``forecast_rain_credit``). The skip on a forecast is all or
        nothing; this credits what is expected, so a forecast of 4 mm against a
        10 mm deficit waters 6 mm instead of 10 or nothing.

        It is done the way rain since the calculation is: the duration is
        shortened and the bucket is left alone. The rain that falls is measured
        and credited at the next calculation, and the smaller amount applied is
        what the run credits, so nothing is counted twice. The window starts
        with the run, not with the calculation, which on a morning run is hours
        earlier: a forecast list starts at a calendar day whatever time it is,
        and pricing it by position puts the rain of the wrong day against a run.

        A zone under glass is left as it is, as it is for the skip: a forecast
        says nothing about a greenhouse. Rain can only shorten a run, and any
        failure costs accuracy, not the run.
        """
        try:
            config = self.store.get_config() or {}
            enabled = config.get(const.CONF_FORECAST_RAIN_CREDIT)
        except Exception:  # noqa: BLE001 - an extra, never the decision
            return
        if not enabled:
            return
        if not getattr(self, "use_weather_service", False):
            return
        fetch = getattr(
            getattr(self, "_WeatherServiceClient", None),
            "get_expected_rain_ahead",
            None,
        )
        if fetch is None:
            return
        try:
            zones = await self.store.async_get_zones()
            sheltered = await self.async_zones_sheltered_from_rain()
            start = datetime.now()
            expected_mm = await self.hass.async_add_executor_job(
                fetch, start, start + timedelta(hours=const.FORECAST_RAIN_CREDIT_HOURS)
            )
        except Exception as e:  # noqa: BLE001 - never block the run over this
            _LOGGER.warning("Could not read the rain forecast to credit: %s", e)
            return
        if not expected_mm or expected_mm <= 0:
            return

        for zone in zones:
            if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                continue
            if zone.get(const.ZONE_ID) in sheltered:
                continue
            if not zone.get(const.ZONE_DURATION):
                continue
            try:
                # What the run is sized from now, the rain that fell since the
                # calculation included, less what the forecast says will fall.
                rain_so_far = await self.precipitation_since_last_calculation(zone)
                rain_so_far -= zone.get(const.ZONE_PRECIPITATION_SUPERSEDED) or 0.0
                bucket = (
                    (zone.get(const.ZONE_BUCKET) or 0.0)
                    + max(0.0, rain_so_far)
                    + expected_mm
                )
                duration = self.duration_from_bucket(zone, bucket)
                if duration >= zone.get(const.ZONE_DURATION):
                    continue
                _LOGGER.info(
                    "Zone %s: %.1f mm of rain forecast for the next %s hours, "
                    "watering for %s s instead of %s s",
                    zone.get(const.ZONE_NAME),
                    expected_mm,
                    const.FORECAST_RAIN_CREDIT_HOURS,
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
            except Exception as e:  # noqa: BLE001
                _LOGGER.error(
                    "Could not credit the forecast rain on zone %s: %s",
                    zone.get(const.ZONE_NAME),
                    e,
                )

    async def _apply_rain_history_suppression(self):
        """Shorten runs by what a binary rain sensor says about the last few days.

        Only for a zone whose sensor group has no precipitation in millimetres at
        all. Where there is real rain data the bucket already carries it, and
        this would take the same rain off twice.

        The factor comes from the sensor's own history (rain_history.py). It
        does not know how many millimetres fell, only that the rain covered
        that share of the need, so the bucket is credited with that share of
        its deficit, as rain that the balance, having no rain source, never
        saw. It used to be left alone: the run was shortened today and the
        whole deficit watered on the first dry day, so the sensor only ever
        delayed the water.

        Returns the suppression that was applied, or None, so the panel can say
        what happened.
        """
        config = await self.store.async_get_config()
        if not config.get(const.CONF_RAIN_HISTORY_ENABLED):
            return None
        suppression = await rain_suppression(
            self.hass, config.get(const.CONF_RAIN_SENSOR)
        )
        if suppression is None:
            return None
        factor = suppression["factor"]
        if factor < MIN_FACTOR:
            return suppression

        try:
            zones = await self.store.async_get_zones()
        except Exception as e:  # pragma: no cover - defensive
            _LOGGER.error("Could not read the zones to account for rain: %s", e)
            return suppression

        for zone in zones:
            if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                continue
            duration = zone.get(const.ZONE_DURATION) or 0
            if duration <= 0:
                continue
            if self._zone_has_precipitation_source(zone):
                continue
            shortened = 0 if factor > MAX_FACTOR else round(duration * (1.0 - factor))
            if shortened >= duration:
                continue
            _LOGGER.info(
                "Zone %s: %s reported rain over the last days, watering for %s s "
                "instead of %s s",
                zone.get(const.ZONE_NAME),
                suppression["source"],
                shortened,
                duration,
            )
            changes = {const.ZONE_DURATION: shortened}
            bucket = zone.get(const.ZONE_BUCKET) or 0.0
            if bucket < 0:
                changes[const.ZONE_BUCKET] = (
                    0.0 if factor > MAX_FACTOR else bucket * (1.0 - factor)
                )
            await self.store.async_update_zone(zone.get(const.ZONE_ID), changes)
            async_dispatcher_send(
                self.hass, const.DOMAIN + "_config_updated", zone.get(const.ZONE_ID)
            )
        return suppression

    def _zone_has_precipitation_source(self, zone) -> bool:
        """Whether this zone's sensor group reports rain in millimetres.

        Either shape counts: a depth from a gauge, or a rate from a service.
        When one of them is there, the bucket has the rain and nothing else
        should guess at it.
        """
        mapping_id = zone.get(const.ZONE_MAPPING)
        if mapping_id is None:
            return False
        mapping = self.store.get_mapping(mapping_id)
        sourced = sourced_fields(mapping) if mapping else set()
        return bool(
            sourced & {const.MAPPING_PRECIPITATION, const.MAPPING_CURRENT_PRECIPITATION}
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

        # And arm the start trigger again for the new day. Registration happens
        # after a calculation and after a zone is edited, and it deliberately
        # arms nothing when no zone needs water; an installation could
        # therefore sit unarmed until one of those happened again, which is
        # "it starts working after I restart Home Assistant" (#841). The
        # durations are those of the night's calculation, so this costs nothing
        # and cannot arm a run that is not owed.
        self.hass.async_create_task(self.register_start_event())
