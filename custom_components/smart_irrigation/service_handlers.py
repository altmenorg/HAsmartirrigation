"""Service-call handlers for the Smart Irrigation integration.

Extracted from __init__.py: the ``handle_*`` methods registered as Home
Assistant services (calculate / update / reset / set zones and buckets and
multipliers, clear weather data, the watering-calendar service, the recurring
schedule and seasonal adjustment services, and the Irrigation Unlimited
services), plus the ``_async_set_all_*`` helpers they call. The methods live on
a mixin the coordinator inherits; their bodies are unchanged and still use
``self`` to reach coordinator state.
"""

import logging
import re
from datetime import datetime, timedelta

import homeassistant.util.dt as dt_util
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .exceptions import SmartIrrigationError
from .programs import find_program
from .units import depth_from_display, zone_from_display
from .watering_control import (
    MAX_SUSPEND_HOURS,
    MAX_WATER_ZONE_SECONDS,
    finite_number,
    parse_suspend_until,
)

_LOGGER = logging.getLogger(__name__)


def _summarize_calculations(results):
    """Build a JSON-serializable summary of calculation results per zone.

    Used as the service response so a dry run is visible to the caller: with
    ``dry_run: true`` nothing is written to the zone, so the response is the
    only place the outcome shows up.

    Every reported key is always present, as null when the module did not
    produce it, so a template can index the response without guarding.
    """
    summary = []
    for zone_id, calc_data in results.items():
        if not calc_data:
            continue
        entry = {const.ZONE_ID: zone_id}
        for key in (
            const.ZONE_DELTA,
            const.ZONE_BUCKET,
            const.ZONE_DURATION,
            const.ZONE_CURRENT_DRAINAGE,
            const.ZONE_ET_DEFICIENCY,
        ):
            value = calc_data.get(key)
            if value is None:
                entry[key] = None
                continue
            try:
                entry[key] = float(value)
            except (TypeError, ValueError):
                # Some fields are loosely typed in the schema; pass through as-is.
                entry[key] = value
        summary.append(entry)
    return summary


def _entity_ids(call) -> list:
    """The entity ids a service call targets, always as a list.

    Home Assistant hands a single target over as a plain string when it is
    written that way (``entity_id: sensor.smart_irrigation_lawn`` in YAML, or a
    REST call). Iterating the string walked it character by character, so
    calculate_zone and update_zone ran for "zone s", "zone e"... found nothing
    and calculated nothing, without a word.
    """
    eid = call.data.get(const.SERVICE_ENTITY_ID)
    if eid is None:
        return []
    if isinstance(eid, str):
        return [eid]
    return list(eid)


class ServiceHandlersMixin:
    """Service-call handlers for ``SmartIrrigationCoordinator``.

    Mixed into the coordinator; methods use ``self`` to reach coordinator state
    (store, hass, the schedule/adjustment managers, the IU integration, and the
    zone-config / calculation helpers).
    """

    async def _async_set_all_buckets(self, val=0):
        """Set all buckets to val."""
        zones = await self.store.async_get_zones()
        data = {}
        data[const.ATTR_SET_BUCKET] = {}
        data[const.ATTR_NEW_BUCKET_VALUE] = val

        for zone in zones:
            await self.async_update_zone_config(
                zone_id=zone.get(const.ZONE_ID), data=data
            )

    async def _async_set_all_multipliers(self, val=0):
        """Set all multipliers to val."""
        zones = await self.store.async_get_zones()
        data = {}
        data[const.ATTR_SET_MULTIPLIER] = {}
        data[const.ATTR_NEW_MULTIPLIER_VALUE] = val

        for zone in zones:
            await self.async_update_zone_config(
                zone_id=zone.get(const.ZONE_ID), data=data
            )

    async def handle_calculate_all_zones(self, call):
        """Calculate all zones."""
        dry_run = call.data.get(const.ATTR_DRY_RUN, False)
        _LOGGER.info("Calculate all zones service called (dry_run=%s)", dry_run)
        results = await self._async_calculate_all(
            call.data.get(const.ATTR_DELETE_WEATHER_DATA, True), dry_run=dry_run
        )
        return {"zones": _summarize_calculations(results or {})}

    async def handle_calculate_zone(self, call):
        """Calculate specific zone."""
        dry_run = call.data.get(const.ATTR_DRY_RUN, False)
        results = {}
        if const.SERVICE_ENTITY_ID in call.data:
            for entity in _entity_ids(call):
                _LOGGER.info(
                    "Calculate zone service called for zone %s (dry_run=%s)",
                    entity,
                    dry_run,
                )
                # find entity zone id and call calculate on the zone
                state = self.hass.states.get(entity)
                if state:
                    # find zone_id for zone with name
                    zone_id = state.attributes.get(const.ZONE_ID)
                    if zone_id is not None:
                        data = {}
                        data[const.ATTR_CALCULATE] = const.ATTR_CALCULATE
                        data[const.ATTR_DRY_RUN] = dry_run
                        data[const.ATTR_DELETE_WEATHER_DATA] = call.data.get(
                            const.ATTR_DELETE_WEATHER_DATA, True
                        )
                        calc_data = await self.async_update_zone_config(
                            zone_id=zone_id, data=data
                        )
                        if calc_data is not None:
                            results[zone_id] = calc_data
        return {"zones": _summarize_calculations(results)}

    async def handle_update_all_zones(self, call):
        """Update all zones."""
        _LOGGER.info("Update all zones service called")
        await self._async_update_all()

    async def handle_update_zone(self, call):
        """Update specific zone."""
        if const.SERVICE_ENTITY_ID in call.data:
            for entity in _entity_ids(call):
                _LOGGER.info("Update zone service called for zone %s", entity)
                # find entity zone id and call update on the zone
                state = self.hass.states.get(entity)
                if state:
                    # find zone_id for zone with name
                    zone_id = state.attributes.get(const.ZONE_ID)
                    if zone_id is not None:
                        data = {}
                        data[const.ATTR_UPDATE] = const.ATTR_UPDATE
                        await self.async_update_zone_config(zone_id=zone_id, data=data)

    async def handle_postpone_irrigation(self, call):
        """Hold watering back for a while, then let it resume by itself.

        A postponement is a moment, not a countdown, so it survives a restart
        and ends on its own. Nothing is reset: a zone that is short of water
        still is when it ends, and the next run makes it up.
        """
        hours = call.data.get(const.ATTR_HOURS, 24)
        try:
            hours = float(hours)
        except (TypeError, ValueError):
            _LOGGER.warning("postpone_irrigation called with %s hours", hours)
            return
        if hours <= 0:
            await self.handle_resume_irrigation(call)
            return
        until = dt_util.utcnow() + timedelta(hours=hours)
        await self.store.async_update_config(
            {const.CONF_POSTPONE_UNTIL: until.isoformat()}
        )
        _LOGGER.info("Irrigation postponed until %s", until.isoformat())
        async_dispatcher_send(self.hass, const.DOMAIN + "_config_updated")

    async def handle_resume_irrigation(self, _call=None):
        """Lift a postponement, whatever is left of it."""
        await self.store.async_update_config({const.CONF_POSTPONE_UNTIL: None})
        _LOGGER.info("Irrigation resumed")
        async_dispatcher_send(self.hass, const.DOMAIN + "_config_updated")

    async def handle_run_program(self, call):
        """Run a program of the full controller, or take its turn if one is running."""
        program_id = call.data.get(const.ATTR_PROGRAM_ID)
        if not program_id:
            return
        # The run takes as long as the watering: the service does not wait for it.
        self._spawn_valve_run(self.async_run_program(str(program_id)))

    async def handle_pause_watering(self, call):
        """Close the open valves and hold the watering until it is resumed."""
        await self.async_pause_watering(call.data.get("minutes"))

    async def handle_resume_watering(self, call):
        """Go on with a paused watering."""
        await self.async_resume_watering()

    async def handle_next_step(self, call):
        """End the zones of the step a program is on, and go on to the next."""
        await self.async_skip_step()

    @staticmethod
    def _check_suspend_input(hours, until) -> None:
        try:
            if until is not None:
                parse_suspend_until(until)
            elif hours is not None and hours != "":
                finite_number(hours, 0, MAX_SUSPEND_HOURS, "hours")
        except ValueError as e:
            raise ServiceValidationError(str(e)) from None

    def _known_program(self, program_id, lifting: bool) -> bool:
        """Whether a suspension may be set for this program id.

        An id that is no program is ignored, so that a typo does not leave a
        suspension behind that waits for a program of that name. Lifting is
        allowed for what is already recorded.
        """
        programs = getattr(self.store.config, const.CONF_PROGRAMS, None)
        if find_program(programs, str(program_id)) is not None:
            return True
        if lifting and f"{const.SUSPEND_PROGRAM}:{program_id}" in self._suspensions():
            return True
        _LOGGER.warning("suspend: %s is not a program, ignored", program_id)
        return False

    async def handle_suspend(self, call):
        """Keep a zone or a program from watering for a while, or lift that."""
        hours = call.data.get("hours")
        until = call.data.get("until")
        program_id = call.data.get(const.ATTR_PROGRAM_ID)
        # Refused as a whole before anything is changed.
        self._check_suspend_input(hours, until)
        if program_id and self._known_program(program_id, lifting=not (hours or until)):
            await self.async_suspend(
                const.SUSPEND_PROGRAM, str(program_id), hours=hours, until=until
            )
        eid = call.data.get(const.SERVICE_ENTITY_ID)
        for entity in eid if isinstance(eid, list) else ([eid] if eid else []):
            state = self.hass.states.get(entity)
            zone_id = state.attributes.get(const.ZONE_ID) if state else None
            if zone_id is None:
                _LOGGER.warning("suspend: %s is not a zone", entity)
                continue
            await self.async_suspend(
                const.SUSPEND_ZONE, int(zone_id), hours=hours, until=until
            )

    async def handle_water_zone(self, call):
        """Water a zone now, for a time, or when it is its turn."""
        eid = call.data.get(const.SERVICE_ENTITY_ID)
        seconds = call.data.get(const.ATTR_SECONDS)
        if seconds is not None:
            # Checked here: a run is spawned, and an error in it reaches no one.
            try:
                seconds = finite_number(seconds, 1, MAX_WATER_ZONE_SECONDS, "seconds")
            except ValueError as e:
                raise ServiceValidationError(str(e)) from None
        if isinstance(eid, str):
            eid = [eid]
        for entity in eid or []:
            state = self.hass.states.get(entity)
            zone_id = state.attributes.get(const.ZONE_ID) if state else None
            if zone_id is None:
                _LOGGER.warning("water_zone: %s is not a zone", entity)
                continue
            # Runs as long as the watering does: the service does not wait.
            self._spawn_valve_run(self.async_water_zone_now(int(zone_id), seconds))

    async def handle_use_measured_throughput(self, call):
        """Take the flow the meter measured as the zone's throughput.

        The measured value is advice, never applied on its own (pressure varies,
        a meter may serve several zones). This is the person saying yes.
        """
        zone_ids = []
        if call.data.get("zone_id") is not None:
            zone_ids.append(int(call.data["zone_id"]))
        eid = call.data.get(const.SERVICE_ENTITY_ID)
        for entity in eid if isinstance(eid, list) else ([eid] if eid else []):
            state = self.hass.states.get(entity)
            zone_id = state.attributes.get(const.ZONE_ID) if state else None
            if zone_id is None:
                _LOGGER.warning("use_measured_throughput: %s is not a zone", entity)
                continue
            zone_ids.append(int(zone_id))
        for zone_id in zone_ids:
            zone = self.store.get_zone(zone_id) or {}
            measured = zone.get(const.ZONE_MEASURED_THROUGHPUT)
            if not measured or measured <= 0:
                _LOGGER.warning(
                    "Zone %s has no measured throughput to take yet", zone_id
                )
                continue
            await self.async_update_zone_config(
                zone_id=zone_id, data={const.ZONE_THROUGHPUT: float(measured)}
            )
            self.async_clear_throughput_issue(zone_id)
            _LOGGER.info(
                "Zone %s throughput set to the measured %.2f", zone_id, measured
            )

    async def handle_stop_watering(self, call):
        """Stop the watering now: every zone, or the ones named."""
        eid = call.data.get(const.SERVICE_ENTITY_ID)
        if eid is None:
            await self.async_stop_watering()
            return
        if not isinstance(eid, list):
            eid = [eid]
        zone_ids = []
        for entity in eid:
            state = self.hass.states.get(entity)
            zone_id = state.attributes.get(const.ZONE_ID) if state else None
            if zone_id is None:
                _LOGGER.warning("stop_watering: %s is not a zone", entity)
                continue
            zone_ids.append(int(zone_id))
        if zone_ids:
            await self.async_stop_watering(zone_ids)

    async def handle_credit_watering(self, call):
        """Credit a zone with the water a run of its own actually delivered.

        ``reset_bucket`` sets the bucket to 0, which is right only when the run
        was the whole of what the zone needed. A run cut short by the maximum
        duration left a deficit that the reset wiped out, and the time between
        the calculation and the reset was taken out of the next window, so its
        evaporation was never counted either. This credits what the run put
        down instead: the precipitation rate times the seconds it ran, less the
        lead time that only filled the pipe, as a run observed by Smart
        Irrigation is credited. Without ``seconds``, the zone's own duration,
        which is what an automation that just ran it has used.
        """
        eid = call.data.get(const.SERVICE_ENTITY_ID)
        if eid is None:
            return
        if not isinstance(eid, list):
            eid = [eid]
        for entity in eid:
            state = self.hass.states.get(entity)
            zone_id = state.attributes.get(const.ZONE_ID) if state else None
            if zone_id is None:
                _LOGGER.warning("credit_watering: %s is not a zone", entity)
                continue
            zone = self.store.get_zone(zone_id) or {}
            seconds = call.data.get(const.ATTR_SECONDS)
            if seconds is None:
                seconds = zone.get(const.ZONE_DURATION) or 0
            try:
                seconds = float(seconds)
            except (TypeError, ValueError):
                _LOGGER.warning("credit_watering: %s is not a duration", seconds)
                continue
            if seconds <= 0:
                _LOGGER.info("credit_watering: zone %s ran for nothing", zone_id)
                continue
            _LOGGER.info(
                "Crediting zone %s with a run of %.0f s",
                zone.get(const.ZONE_NAME),
                seconds,
            )
            await self._credit_observed_watering(int(zone_id), seconds)

    async def handle_reset_bucket(self, call):
        """Reset a specific zone bucket to 0."""
        if const.SERVICE_ENTITY_ID in call.data:
            eid = call.data[const.SERVICE_ENTITY_ID]
            if not isinstance(eid, list):
                eid = [call.data[const.SERVICE_ENTITY_ID]]
            for entity in eid:
                _LOGGER.info("Reset bucket service called for zone %s", entity)
                # find entity zone id and call calculate on the zone
                state = self.hass.states.get(entity)
                if state:
                    # find zone_id for zone with name
                    zone_id = state.attributes.get(const.ZONE_ID)
                    if zone_id is not None:
                        data = {}
                        data[const.ATTR_SET_BUCKET] = {}
                        data[const.ATTR_NEW_BUCKET_VALUE] = 0
                        await self.async_update_zone_config(zone_id=zone_id, data=data)

    async def handle_reset_all_buckets(self, call):
        """Reset all buckets to 0."""
        _LOGGER.info("Reset all buckets service called")
        await self._async_set_all_buckets(0)

    async def handle_set_all_buckets(self, call):
        """Reset all buckets to new value."""
        if const.ATTR_NEW_BUCKET_VALUE in call.data:
            new_value = call.data[const.ATTR_NEW_BUCKET_VALUE]
            _LOGGER.info("Set all buckets service called, new value: %s", new_value)
            # Entered in the unit system, stored in mm (units.py).
            await self._async_set_all_buckets(
                depth_from_display(new_value, self.hass.config.units is METRIC_SYSTEM)
            )

    async def handle_set_zone(self, call):
        """Reset a specific zone state to new value."""
        if const.SERVICE_ENTITY_ID not in call.data:
            return

        eid = call.data[const.SERVICE_ENTITY_ID]
        if not isinstance(eid, list):
            eid = [call.data[const.SERVICE_ENTITY_ID]]

        data = call.data.copy()
        data.pop(const.SERVICE_ENTITY_ID)

        for entity in eid:
            _LOGGER.info("Set zone data service called with zone %s", entity)

            # find entity zone id and call calculate on the zone
            state = self.hass.states.get(entity)
            if not state:
                raise SmartIrrigationError(f"No state found for entity {entity}")

            # find zone_id for zone with name
            zone_id = state.attributes.get(const.ZONE_ID)
            if zone_id is None:
                raise SmartIrrigationError("No zone_id found in state attributes.")

            zone = self.store.get_zone(zone_id)
            metric = self.hass.config.units is METRIC_SYSTEM
            zone_data = {}
            count = 0
            for v in data:
                if (
                    v not in const.LIST_SET_ZONE_ALLOWED_ARGS
                    and v != const.SERVICE_ENTITY_ID
                ):
                    raise SmartIrrigationError(f"Argument ({v}) is not allowed")

                if (
                    v == const.ATTR_NEW_DURATION_VALUE
                    and zone.get(const.ZONE_STATE) != const.ZONE_STATE_MANUAL
                ):
                    raise SmartIrrigationError(
                        "Can only set duration if zone state is set to manual."
                    )
                # A zone may have no maximum bucket; comparing with None
                # raised a TypeError instead of setting the value.
                maximum = zone.get(const.ZONE_MAXIMUM_BUCKET)
                if (
                    v == const.ATTR_NEW_BUCKET_VALUE
                    and maximum is not None
                    and depth_from_display(data[v], metric) > maximum
                ):
                    raise SmartIrrigationError(
                        "Bucket size is above maximmum bucket allowed value."
                    )
                # This checked the value against the key's own name, "state",
                # as a substring, so it rejected nothing and a misspelt state
                # left the zone outside every automatic and manual path.
                if v == const.ATTR_NEW_STATE_VALUE and data[v] not in const.ZONE_STATES:
                    raise SmartIrrigationError(
                        f"Invalid value ({data[v]}) for zone state."
                    )

                m = re.match("^new_(.+)_value$", v)
                if m:
                    zone_data[m.group(1)] = data[v]
                    _LOGGER.info("Setting value for %s", m.group(1))
                    count += 1

            if count == 0:
                raise SmartIrrigationError("No valid parameter provided")

            if count > 0:
                # Entered in the unit system, stored in metric (units.py).
                zone_data = zone_from_display(zone_data, metric)
                # A bucket set here asserts the soil's state as set_bucket
                # does, so the weather before it must leave the zone's next
                # window the same way; written straight to the store, it was
                # counted again on top of the value set (#811).
                if const.ZONE_BUCKET in zone_data:
                    zone_data = await self._start_window_at_bucket_assertion(
                        zone_id,
                        {
                            **zone_data,
                            const.ATTR_NEW_BUCKET_VALUE: zone_data.pop(
                                const.ZONE_BUCKET
                            ),
                        },
                    )
                await self.store.async_update_zone(zone_id, zone_data)
                async_dispatcher_send(
                    self.hass,
                    const.DOMAIN + "_config_updated",
                    zone_id,
                )

    async def handle_set_all_multipliers(self, call):
        """Reset all multipliers to new value."""
        if const.ATTR_NEW_MULTIPLIER_VALUE in call.data:
            new_value = call.data[const.ATTR_NEW_MULTIPLIER_VALUE]
            _LOGGER.info("Set all multipliers service called, new value: %s", new_value)
            await self._async_set_all_multipliers(new_value)

    async def handle_clear_weatherdata(self, call):
        """Clear the collected weatherdata: all of it, or that of some zones.

        Weather data belongs to a sensor group and is shared by its zones, so
        naming zones clears the data of their groups, and the other zones of
        those groups lose it too. Without zones, every group is cleared.
        """
        entities = call.data.get(const.SERVICE_ENTITY_ID)
        if not entities:
            await self._async_clear_all_weatherdata()
            return
        if not isinstance(entities, list):
            entities = [entities]
        mapping_ids = set()
        for entity in entities:
            state = self.hass.states.get(entity)
            zone_id = state.attributes.get(const.ZONE_ID) if state else None
            zone = self.store.get_zone(zone_id) if zone_id is not None else None
            if zone is None or zone.get(const.ZONE_MAPPING) is None:
                _LOGGER.warning("clear_all_weather_data: %s is not a zone", entity)
                continue
            mapping_ids.add(zone.get(const.ZONE_MAPPING))
        await self._async_clear_weatherdata_of_mappings(mapping_ids)

    async def handle_generate_watering_calendar(self, call):
        """Generate watering calendar service handler."""
        zone_id = call.data.get("zone_id")

        if zone_id is not None:
            zone_id = int(zone_id)

        _LOGGER.info("Generate watering calendar service called for zone %s", zone_id)

        try:
            calendar_data = await self.async_generate_watering_calendar(zone_id)

            # Store the result in hass.data for retrieval by automation
            if "watering_calendars" not in self.hass.data[const.DOMAIN]:
                self.hass.data[const.DOMAIN]["watering_calendars"] = {}

            self.hass.data[const.DOMAIN]["watering_calendars"][
                "last_generated"
            ] = calendar_data

            # Fire an event with the calendar data
            self.hass.bus.fire(
                f"{const.DOMAIN}_watering_calendar_generated",
                {
                    "zone_id": zone_id,
                    "calendar_data": calendar_data,
                    "generated_at": datetime.now().isoformat(),
                },
            )

            _LOGGER.info(
                "Watering calendar generated successfully for %s zones",
                len(calendar_data),
            )

        except Exception as e:
            _LOGGER.error("Failed to generate watering calendar: %s", e)
            self.hass.bus.fire(
                f"{const.DOMAIN}_watering_calendar_error",
                {
                    "zone_id": zone_id,
                    "error": str(e),
                    "generated_at": datetime.now().isoformat(),
                },
            )

    # Enhanced Scheduling Service Handlers
    async def handle_create_recurring_schedule(self, call):
        """Create recurring schedule service handler."""
        schedule_data = dict(call.data)
        _LOGGER.info(
            "Create recurring schedule service called: %s",
            schedule_data.get("name", "Unnamed"),
        )

        try:
            await self.recurring_schedule_manager.async_create_schedule(schedule_data)
            _LOGGER.info("Successfully created recurring schedule")
        except Exception as e:
            _LOGGER.error("Failed to create recurring schedule: %s", e)
            raise

    async def handle_update_recurring_schedule(self, call):
        """Update recurring schedule service handler."""
        schedule_id = call.data.get("schedule_id")
        schedule_data = dict(call.data)
        schedule_data.pop("schedule_id", None)

        _LOGGER.info("Update recurring schedule service called for ID: %s", schedule_id)

        try:
            await self.recurring_schedule_manager.async_update_schedule(
                schedule_id, schedule_data
            )
            _LOGGER.info("Successfully updated recurring schedule")
        except Exception as e:
            _LOGGER.error("Failed to update recurring schedule: %s", e)
            raise

    async def handle_delete_recurring_schedule(self, call):
        """Delete recurring schedule service handler."""
        schedule_id = call.data.get("schedule_id")

        _LOGGER.info("Delete recurring schedule service called for ID: %s", schedule_id)

        try:
            await self.recurring_schedule_manager.async_delete_schedule(schedule_id)
            _LOGGER.info("Successfully deleted recurring schedule")
        except Exception as e:
            _LOGGER.error("Failed to delete recurring schedule: %s", e)
            raise

    async def handle_create_seasonal_adjustment(self, call):
        """Create seasonal adjustment service handler."""
        adjustment_data = dict(call.data)
        _LOGGER.info(
            "Create seasonal adjustment service called: %s",
            adjustment_data.get("name", "Unnamed"),
        )

        try:
            await self.seasonal_adjustment_manager.async_create_adjustment(
                adjustment_data
            )
            _LOGGER.info("Successfully created seasonal adjustment")
        except Exception as e:
            _LOGGER.error("Failed to create seasonal adjustment: %s", e)
            raise

    async def handle_update_seasonal_adjustment(self, call):
        """Update seasonal adjustment service handler."""
        adjustment_id = call.data.get("adjustment_id")
        adjustment_data = dict(call.data)
        adjustment_data.pop("adjustment_id", None)

        _LOGGER.info(
            "Update seasonal adjustment service called for ID: %s", adjustment_id
        )

        try:
            await self.seasonal_adjustment_manager.async_update_adjustment(
                adjustment_id, adjustment_data
            )
            _LOGGER.info("Successfully updated seasonal adjustment")
        except Exception as e:
            _LOGGER.error("Failed to update seasonal adjustment: %s", e)
            raise

    async def handle_delete_seasonal_adjustment(self, call):
        """Delete seasonal adjustment service handler."""
        adjustment_id = call.data.get("adjustment_id")

        _LOGGER.info(
            "Delete seasonal adjustment service called for ID: %s", adjustment_id
        )

        try:
            await self.seasonal_adjustment_manager.async_delete_adjustment(
                adjustment_id
            )
            _LOGGER.info("Successfully deleted seasonal adjustment")
        except Exception as e:
            _LOGGER.error("Failed to delete seasonal adjustment: %s", e)
            raise
