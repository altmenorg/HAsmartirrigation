"""Irrigation skip-condition checks and days-between tracking.

Extracted from __init__.py. Covers the pre-irrigation decision logic (skip on
precipitation forecast, the days-between-irrigation counter) and the
total-duration query used by the scheduler and websockets. The methods live on a
mixin the coordinator inherits; their bodies are unchanged and still use
``self`` to reach coordinator state (store, hass, weather client).
"""

import logging
from datetime import timedelta

import homeassistant.util.dt as dt_util
from homeassistant.const import UnitOfSpeed, UnitOfTemperature
from homeassistant.util.unit_conversion import SpeedConverter, TemperatureConverter
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .valve_runner import setting, wall_clock_seconds
from .weathermodules.OpenMeteoClient import WIND_10M_TO_2M

_LOGGER = logging.getLogger(__name__)

# How far ahead of the run the forecast skip looks, where the service forecasts
# hour by hour: about the reach of the "today and tomorrow" it replaces.
FORECAST_SKIP_WINDOW_HOURS = 48


def _run_day_and_next(forecast_data, run_start):
    """The daily forecast of the run's day and the next, today at index 0.

    The run is now unless ``run_start`` says otherwise, and then the list is
    read from its day: by each entry's date where the service dates them,
    counting from today otherwise.
    """
    if run_start is None:
        return forecast_data[:2]
    try:
        run_day = dt_util.as_local(run_start).date()
    except (AttributeError, TypeError, ValueError, OverflowError):
        return forecast_data[:2]
    dated = [
        day
        for day in forecast_data
        if isinstance(day, dict) and isinstance(day.get("date"), str)
    ]
    if dated and len(dated) == len(forecast_data):
        return [day for day in forecast_data if day["date"] >= run_day.isoformat()][:2]
    offset = max(0, (run_day - dt_util.now().date()).days)
    return forecast_data[offset : offset + 2]


# The measured-condition thresholds: stored in the first unit, shown to an
# imperial install in the second.
_IMPERIAL_THRESHOLDS = {
    const.CONF_FREEZE_THRESHOLD: (
        TemperatureConverter,
        UnitOfTemperature.CELSIUS,
        UnitOfTemperature.FAHRENHEIT,
    ),
    const.CONF_WIND_THRESHOLD: (
        SpeedConverter,
        UnitOfSpeed.KILOMETERS_PER_HOUR,
        UnitOfSpeed.MILES_PER_HOUR,
    ),
}


def thresholds_for_display(config: dict, metric: bool) -> dict:
    """The config with the measured thresholds in the unit shown to the user."""
    if metric:
        return config
    shown = dict(config)
    for key, (converter, stored, displayed) in _IMPERIAL_THRESHOLDS.items():
        if shown.get(key) is not None:
            shown[key] = round(
                converter.convert(float(shown[key]), stored, displayed), 1
            )
    return shown


def thresholds_for_storage(changes: dict, metric: bool) -> dict:
    """The changes with the measured thresholds brought back to the stored unit."""
    if metric:
        return changes
    stored = dict(changes)
    for key, (converter, unit, displayed) in _IMPERIAL_THRESHOLDS.items():
        if stored.get(key) is not None:
            stored[key] = converter.convert(float(stored[key]), displayed, unit)
    return stored


class SkipConditionsMixin:
    """Skip-condition checks and days-between tracking for the coordinator.

    Mixed into ``SmartIrrigationCoordinator``; methods use ``self`` to reach
    coordinator state (store, hass, weather client).
    """

    async def get_total_duration_all_enabled_zones(self, durations_by_zone=None):
        """How long watering every enabled zone takes, in seconds.

        This is what a start trigger works back from to finish at sunrise, so it
        has to be the wall-clock length of the run, not the amount of watering in
        it. Zones run one after another by default, which is their sum; run in
        parallel they all finish with the longest one, and summing then started
        the run hours too early (#552). Which of the two it is comes from the
        zone sequencing setting.

        ``durations_by_zone`` replaces the stored duration of the zones it names,
        for the panel to say what the run will be once the zones have been
        calculated again just before the start.

        Returns:
            int: The duration of the whole run for all enabled zones.

        """
        zones = await self.store.async_get_zones()
        replaced = durations_by_zone or {}
        enabled = [
            zone
            for zone in zones
            if zone.get(const.ZONE_STATE)
            in (const.ZONE_STATE_AUTOMATIC, const.ZONE_STATE_MANUAL)
        ]
        durations = [
            replaced.get(zone.get(const.ZONE_ID), zone.get(const.ZONE_DURATION, 0))
            for zone in enabled
        ]
        leads = [zone.get(const.ZONE_LEAD_TIME) or 0 for zone in enabled]
        if not durations:
            return 0
        config = await self.store.async_get_config()
        # Cycle and soak, and the pause between zones, occupy the run without
        # watering in it. They only exist when Smart Irrigation opens the
        # valves itself; an executor of your own keeps its own timing.
        driving = bool(
            config.get(
                const.CONF_DIRECT_VALVE_CONTROL_ENABLED,
                const.CONF_DEFAULT_DIRECT_VALVE_CONTROL_ENABLED,
            )
        )
        lengths = (
            [
                wall_clock_seconds(config, duration, lead)
                for duration, lead in zip(durations, leads, strict=True)
            ]
            if driving
            else list(durations)
        )
        sequencing = config.get(
            const.CONF_ZONE_SEQUENCING, const.CONF_DEFAULT_ZONE_SEQUENCING
        )
        if sequencing == const.CONF_ZONE_SEQUENCING_PARALLEL:
            return int(max(lengths))
        pauses = 0.0
        if driving and len(lengths) > 1:
            pauses = setting(
                config,
                const.CONF_PAUSE_BETWEEN_ZONES,
                const.CONF_DEFAULT_PAUSE_BETWEEN_ZONES,
            ) * (len(lengths) - 1)
        return int(sum(lengths) + pauses)

    async def async_evaluate_skip_conditions(self, run_start=None) -> dict:
        """Evaluate every skip condition and say which one vetoes watering.

        The runner needs one boolean, but a panel that only knows *that* a run
        was skipped cannot tell anyone *why*, which is what people actually ask
        (#794). So the checks report themselves, and the boolean falls out of
        them, which also means the two can never disagree: the explanation is
        produced by the code that makes the decision.

        Returns a dict with ``should_skip``, the ``reason`` id of the first
        check that vetoes, and ``checks``, one entry per condition carrying
        whether it is enabled, whether it could be evaluated at all, whether it
        skips, and the numbers behind that.

        ``run_start`` is the start being decided, for a preview of a run still
        to come; None is a run starting now. Only the forecast reads it.
        """
        # What is happening now first, then what is forecast, then the
        # calendar: the first check that vetoes is the reason given, and "it is
        # raining" is a better answer than "it will rain".
        checks = [
            # First, because it is the user saying "not now" in as many words.
            await self._guarded("postponed", self._evaluate_postponed),
            await self._guarded("rain_sensor", self._evaluate_rain_sensor),
            await self._guarded("freeze", self._evaluate_freeze),
            await self._guarded("wind", self._evaluate_wind),
            await (
                self._evaluate_precipitation_forecast()
                if run_start is None
                else self._evaluate_precipitation_forecast(run_start=run_start)
            ),
            await self._evaluate_days_between_irrigation(),
            await self._guarded("soil_moisture", self._evaluate_soil_moisture),
        ]
        vetoing = next((check for check in checks if check["skip"]), None)
        return {
            "should_skip": vetoing is not None,
            "reason": vetoing["id"] if vetoing else None,
            "checks": checks,
        }

    async def _guarded(self, check_id, evaluate) -> dict:
        """Run an optional check, reading any failure as "could not evaluate".

        An error escaping the evaluation makes the whole day a skip day (the
        fail-safe in triggers, #804). That is right for the decision itself,
        but these checks are optional extras, and one that breaks must leave
        the run exactly as it would be without it, as an unavailable sensor
        does.
        """
        try:
            return await evaluate()
        except Exception as e:  # noqa: BLE001 - see above
            _LOGGER.warning("Could not evaluate the %s check: %s", check_id, e)
            return {"id": check_id, "enabled": True, "available": False, "skip": False}

    async def _check_precipitation_forecast(self) -> bool:
        """Whether the forecast vetoes watering."""
        return (await self._evaluate_precipitation_forecast())["skip"]

    async def _check_days_between_irrigation(self) -> bool:
        """Whether too few days have passed since the last irrigation."""
        return (await self._evaluate_days_between_irrigation())["skip"]

    async def async_zones_sheltered_from_rain(self) -> set:
        """Zone ids the forecast cannot reach, because they are under glass.

        A rain forecast is a statement about the sky. It says nothing about a
        greenhouse, so pausing those zones over it waters nothing and dries out
        the plants that depend on us most.
        """
        sheltered = set()
        for zone in await self.store.async_get_zones():
            if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                continue
            mapping_id = zone.get(const.ZONE_MAPPING)
            if mapping_id is None:
                continue
            mapping = self.store.get_mapping(mapping_id)
            if mapping and mapping.get(const.MAPPING_GREENHOUSE):
                sheltered.add(zone.get(const.ZONE_ID))
        return sheltered

    async def _evaluate_precipitation_forecast(self, run_start=None) -> dict:
        """Report the forecast-precipitation guard.

        ``available`` is False when the forecast could not be read at all. The
        run then goes ahead, which is the behaviour this has always had, but a
        reader can tell "no rain is coming" apart from "we could not find out".

        ``run_start`` is when the run this decides begins, an aware datetime:
        now for the decision itself (None), the next start for the panel's
        preview, so the preview reads the same hours as the decision will.
        """
        result = {
            "id": "precipitation",
            "enabled": False,
            "available": True,
            "skip": False,
            "forecast_mm": None,
            "threshold_mm": None,
        }
        config = await self.store.async_get_config()

        # Check if precipitation skip is enabled
        skip_on_precipitation = config.get(
            const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
            const.CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION,
        )
        if not skip_on_precipitation:
            return result
        result["enabled"] = True

        # Check if weather service is being used
        use_weather_service = config.get(
            const.CONF_USE_WEATHER_SERVICE, const.CONF_DEFAULT_USE_WEATHER_SERVICE
        )
        if not use_weather_service:
            _LOGGER.debug(
                "Weather service not enabled, cannot check precipitation forecast"
            )
            result["available"] = False
            return result

        # Get precipitation threshold
        threshold_mm = config.get(
            const.CONF_PRECIPITATION_THRESHOLD_MM,
            const.CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM,
        )
        result["threshold_mm"] = threshold_mm

        try:
            # Get weather service
            weather_service = config.get(
                const.CONF_WEATHER_SERVICE, const.CONF_DEFAULT_WEATHER_SERVICE
            )
            if weather_service is None:
                _LOGGER.debug("No weather service configured")
                result["available"] = False
                return result

            weather_client = self._WeatherServiceClient

            if weather_client is None:
                _LOGGER.debug("Weather client not available")
                result["available"] = False
                return result

            # The rain of the hours ahead of the run, where the service has
            # them: two calendar days read from today counted the hours of
            # today already past, and looked 42 hours ahead of a 06:00 run but
            # 27 ahead of a 21:00 one.
            expected_ahead = await self._expected_rain_ahead_of(
                weather_client, run_start
            )
            if expected_ahead is not None:
                result["window_hours"] = FORECAST_SKIP_WINDOW_HOURS
                total_precipitation = expected_ahead
                expected_precipitation = expected_ahead
            else:
                # Get forecast data including today (index 0). Without
                # include_today the list would start at tomorrow and today's
                # forecast rain would be missed entirely (#775).
                forecast_data = await self.hass.async_add_executor_job(
                    weather_client.get_forecast_data, True
                )
                if not forecast_data:
                    _LOGGER.debug("No forecast data available")
                    result["available"] = False
                    return result

                # Check precipitation for the day of the run and the next
                total_precipitation = 0.0
                # The rain to expect: each day's forecast weighted by how likely
                # it is, when the service says. 10 mm at 30% is not 10 mm.
                expected_precipitation = 0.0
                for day_data in _run_day_and_next(forecast_data, run_start):
                    millimetres = day_data.get(const.MAPPING_PRECIPITATION) or 0.0
                    total_precipitation += millimetres
                    probability = day_data.get("precipitation_probability")
                    if probability is not None:
                        millimetres *= min(100.0, max(0.0, float(probability))) / 100.0
                    expected_precipitation += millimetres

            _LOGGER.debug(
                "Forecast precipitation: %.1f mm, %.1f mm to expect "
                "(threshold: %.1f mm)",
                total_precipitation,
                expected_precipitation,
                threshold_mm,
            )

            result["forecast_mm"] = total_precipitation
            result["expected_mm"] = expected_precipitation
            if expected_precipitation >= threshold_mm:
                deficit = await self._largest_deficit_to_water()
                skips = int(config.get(const.CONF_PRECIPITATION_SKIPS_IN_A_ROW, 0) or 0)
                result["deficit_mm"] = deficit
                result["skips_in_a_row"] = skips
                if skips >= const.MAX_PRECIPITATION_SKIPS_IN_A_ROW:
                    # Held back that many days already: the forecast has been
                    # wrong often enough, and a zone must not dry out on it.
                    result["overridden"] = "skips_in_a_row"
                    _LOGGER.info(
                        "Rain is forecast again (%.1f mm), but the run was held "
                        "back %s days in a row already; watering",
                        expected_precipitation,
                        skips,
                    )
                elif (
                    deficit is not None
                    and expected_precipitation
                    < const.PRECIPITATION_SKIP_DEFICIT_SHARE * deficit
                ):
                    result["overridden"] = "deficit"
                    _LOGGER.info(
                        "Rain is forecast (%.1f mm), too little for a zone "
                        "%.1f mm short; watering",
                        expected_precipitation,
                        deficit,
                    )
                else:
                    _LOGGER.info(
                        "Skipping irrigation due to forecasted precipitation: "
                        "%.1f mm (threshold: %.1f mm)",
                        expected_precipitation,
                        threshold_mm,
                    )
                    result["skip"] = True

        except Exception as e:
            _LOGGER.warning("Error checking precipitation forecast: %s", e)
            result["available"] = False

        return result

    async def _expected_rain_ahead_of(self, weather_client, run_start):
        """The rain to expect in the hours ahead of the run, in mm, or None.

        None when the service has no hourly forecast, or it does not reach the
        end of the window: the caller then reads the daily forecast.
        """
        fetch = getattr(weather_client, "get_expected_rain_ahead", None)
        if fetch is None:
            return None
        start = run_start if run_start is not None else dt_util.now()
        try:
            expected = await self.hass.async_add_executor_job(
                fetch,
                start,
                start + timedelta(hours=FORECAST_SKIP_WINDOW_HOURS),
            )
        except Exception as e:  # noqa: BLE001 - the daily forecast still answers
            _LOGGER.debug("No hourly rain forecast for the skip: %s", e)
            return None
        if isinstance(expected, bool) or not isinstance(expected, (int, float)):
            return None
        return max(0.0, float(expected))

    async def _largest_deficit_to_water(self):
        """The largest deficit, in mm, among the zones that would water, or None."""
        deficits = [
            -float(zone.get(const.ZONE_BUCKET) or 0.0)
            for zone in await self.store.async_get_zones()
            if zone.get(const.ZONE_STATE) != const.ZONE_STATE_DISABLED
            and (zone.get(const.ZONE_DURATION) or 0) > 0
        ]
        return max(deficits) if deficits else None

    def _entity_reading(self, entity_id):
        """``(value, unit)`` of a numeric entity, or None if it has none.

        None covers an entity that does not exist, is unavailable or unknown,
        or does not hold a number: the condition then cannot be evaluated,
        which the report says, and the run goes ahead as it always has.
        """
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in ("unavailable", "unknown", None, ""):
            return None
        try:
            value = float(state.state)
        except (TypeError, ValueError):
            return None
        return value, state.attributes.get("unit_of_measurement")

    async def _weather_service_now(self):
        """The weather service's current reading, or None.

        Used by the freeze and wind checks when no sensor of their own is set.
        """
        config = await self.store.async_get_config()
        if not config.get(
            const.CONF_USE_WEATHER_SERVICE, const.CONF_DEFAULT_USE_WEATHER_SERVICE
        ):
            return None
        client = getattr(self, "_WeatherServiceClient", None)
        if client is None:
            return None
        try:
            return await self.hass.async_add_executor_job(client.get_data)
        except Exception as e:  # noqa: BLE001 - a check must not fail the run
            _LOGGER.warning("Could not read the weather service: %s", e)
            return None

    async def _evaluate_measured_limit(
        self,
        *,
        check_id,
        enabled_key,
        threshold_key,
        sensor_key,
        default_metric,
        default_imperial,
        metric_unit,
        system_unit,
        convert,
        from_service,
        skips,
    ) -> dict:
        """The freeze and wind checks, which differ only in their numbers.

        The threshold is stored in ``metric_unit`` and compared in
        ``system_unit``, None meaning the default for the unit system. The reading comes from the configured
        entity, converted from its own unit, or from the weather service when
        no entity is set. ``skips(value, threshold)`` says whether it vetoes.
        """
        result = {
            "id": check_id,
            "enabled": False,
            "available": True,
            "skip": False,
            "value": None,
            "threshold": None,
            "unit": system_unit,
            "source": None,
        }
        config = await self.store.async_get_config()
        if not config.get(enabled_key):
            return result
        result["enabled"] = True
        # Stored in metric whatever the unit system, so that changing it
        # cannot turn 2 C into 2 F; shown and compared in the system's unit.
        stored = config.get(threshold_key)
        if stored is not None:
            threshold = convert(float(stored), metric_unit, system_unit)
        elif self.hass.config.units is METRIC_SYSTEM:
            threshold = default_metric
        else:
            threshold = default_imperial
        result["threshold"] = round(threshold, 1)

        value = None
        entity_id = config.get(sensor_key)
        if entity_id:
            result["source"] = entity_id
            reading = self._entity_reading(entity_id)
            if reading is not None:
                raw, unit = reading
                try:
                    value = convert(raw, unit or system_unit, system_unit)
                except Exception:  # noqa: BLE001 - an unknown unit
                    _LOGGER.warning(
                        "%s: cannot convert %s %s from %s",
                        check_id,
                        raw,
                        unit,
                        entity_id,
                    )
        else:
            result["source"] = "weather_service"
            value = from_service(await self._weather_service_now())

        if value is None:
            result["available"] = False
            return result
        result["value"] = round(value, 1)
        if skips(value, threshold):
            _LOGGER.info(
                "Skipping irrigation (%s): %.1f %s against a threshold of %.1f",
                check_id,
                value,
                system_unit,
                threshold,
            )
            result["skip"] = True
        return result

    async def _evaluate_freeze(self) -> dict:
        """Report the freeze guard: no watering at or below the threshold."""
        system_unit = self.hass.config.units.temperature_unit

        def from_service(data):
            celsius = (data or {}).get(const.MAPPING_TEMPERATURE)
            if celsius is None:
                return None
            return TemperatureConverter.convert(
                float(celsius), UnitOfTemperature.CELSIUS, system_unit
            )

        return await self._evaluate_measured_limit(
            check_id="freeze",
            enabled_key=const.CONF_SKIP_ON_FREEZE,
            threshold_key=const.CONF_FREEZE_THRESHOLD,
            sensor_key=const.CONF_FREEZE_SENSOR,
            default_metric=const.CONF_DEFAULT_FREEZE_THRESHOLD_C,
            default_imperial=const.CONF_DEFAULT_FREEZE_THRESHOLD_F,
            metric_unit=UnitOfTemperature.CELSIUS,
            system_unit=system_unit,
            convert=TemperatureConverter.convert,
            from_service=from_service,
            skips=lambda value, threshold: value <= threshold,
        )

    async def _evaluate_wind(self) -> dict:
        """Report the wind guard: no watering at or above the threshold."""
        # km/h or mph, whatever Home Assistant's own wind unit: its metric
        # system says m/s, which is not how anyone quotes a wind limit.
        system_unit = (
            UnitOfSpeed.KILOMETERS_PER_HOUR
            if self.hass.config.units is METRIC_SYSTEM
            else UnitOfSpeed.MILES_PER_HOUR
        )

        def from_service(data):
            wind_2m = (data or {}).get(const.MAPPING_WINDSPEED)
            if wind_2m is None:
                return None
            # The services' wind is brought down to 2 m for the evaporation.
            # A wind limit is read against the usual 10 m wind that forecasts
            # and weather stations quote, so take it back up.
            return SpeedConverter.convert(
                float(wind_2m) / WIND_10M_TO_2M,
                UnitOfSpeed.METERS_PER_SECOND,
                system_unit,
            )

        return await self._evaluate_measured_limit(
            check_id="wind",
            enabled_key=const.CONF_SKIP_ON_WIND,
            threshold_key=const.CONF_WIND_THRESHOLD,
            sensor_key=const.CONF_WIND_SENSOR,
            default_metric=const.CONF_DEFAULT_WIND_THRESHOLD_KMH,
            default_imperial=const.CONF_DEFAULT_WIND_THRESHOLD_MPH,
            metric_unit=UnitOfSpeed.KILOMETERS_PER_HOUR,
            system_unit=system_unit,
            convert=SpeedConverter.convert,
            from_service=from_service,
            skips=lambda value, threshold: value >= threshold,
        )

    async def _evaluate_rain_sensor(self) -> dict:
        """Report the rain sensor guard: no watering while it says it rains."""
        result = {
            "id": "rain_sensor",
            "enabled": False,
            "available": True,
            "skip": False,
            "source": None,
            "raining": None,
        }
        config = await self.store.async_get_config()
        if not config.get(const.CONF_SKIP_ON_RAIN_SENSOR):
            return result
        result["enabled"] = True
        entity_id = config.get(const.CONF_RAIN_SENSOR)
        result["source"] = entity_id
        state = self.hass.states.get(entity_id) if entity_id else None
        if state is None or state.state not in ("on", "off"):
            result["available"] = False
            return result
        result["raining"] = state.state == "on"
        if result["raining"]:
            _LOGGER.info("Skipping irrigation: %s says it is raining", entity_id)
            result["skip"] = True
        return result

    async def _evaluate_soil_moisture(self) -> dict:
        """Report which zones sit out the run because their soil is moist.

        This one never vetoes the whole day: it is a statement about each zone's
        own soil, so the zones that are dry enough still water. Holding the
        others back is done at the start of the run (see triggers).
        """
        result = {
            "id": "soil_moisture",
            "enabled": False,
            "available": True,
            "skip": False,
            "zones": [],
        }
        for zone in await self.store.async_get_zones():
            entity_id = zone.get(const.ZONE_SOIL_MOISTURE_SENSOR)
            if (
                not entity_id
                or zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC
            ):
                continue
            threshold = zone.get(const.ZONE_SOIL_MOISTURE_THRESHOLD)
            if threshold is None:
                threshold = const.CONF_DEFAULT_SOIL_MOISTURE_THRESHOLD
            reading = self._entity_reading(entity_id)
            moisture = reading[0] if reading is not None else None
            result["zones"].append(
                {
                    "zone_id": zone.get(const.ZONE_ID),
                    "name": zone.get(const.ZONE_NAME),
                    "moisture": moisture,
                    "threshold": threshold,
                    "held": moisture is not None and moisture >= threshold,
                }
            )
        result["enabled"] = bool(result["zones"])
        # Available when at least one zone could be read. A zone whose sensor
        # cannot be read waters, as it would with no sensor at all.
        result["available"] = not result["zones"] or any(
            entry["moisture"] is not None for entry in result["zones"]
        )
        return result

    async def async_zones_held_by_soil_moisture(self) -> set:
        """Zone ids whose soil is moist enough to sit out this run."""
        report = await self._evaluate_soil_moisture()
        return {entry["zone_id"] for entry in report["zones"] if entry["held"]}

    async def _evaluate_postponed(self) -> dict:
        """Report the postponement the user asked for, if it still holds.

        A postponement is a moment, not a countdown: it survives a restart, and
        it ends by itself. Nothing is cleared when it ends, so a zone that was
        short of water still is, and the next run makes it up.
        """
        result = {
            "id": "postponed",
            "enabled": False,
            "available": True,
            "skip": False,
            "until": None,
        }
        config = await self.store.async_get_config()
        until = config.get(const.CONF_POSTPONE_UNTIL)
        if not until:
            return result
        moment = dt_util.parse_datetime(until)
        if moment is None:
            _LOGGER.warning("Unreadable postponement moment: %s", until)
            return result
        result["enabled"] = True
        result["until"] = until
        result["skip"] = dt_util.utcnow() < dt_util.as_utc(moment)
        return result

    @staticmethod
    def zone_days_between(zone, config) -> tuple:
        """``(days_required, days_since)`` for a zone.

        A zone with a value of its own replaces the general setting and counts
        the days since it was last watered itself; one without follows the
        general setting and its counter (#875). A zone with nothing recorded yet
        has been dry for as long as we know, so it is never held back.
        """
        own_value = zone.get(const.ZONE_DAYS_BETWEEN_IRRIGATION)
        if own_value is None:
            return (
                config.get(
                    const.CONF_DAYS_BETWEEN_IRRIGATION,
                    const.CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION,
                ),
                config.get(
                    const.CONF_DAYS_SINCE_LAST_IRRIGATION,
                    const.CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION,
                ),
            )
        since = zone.get(const.ZONE_DAYS_SINCE_IRRIGATION)
        return own_value, (float("inf") if since is None else since)

    @classmethod
    def days_until_a_zone_is_due(cls, zones, config) -> float:
        """Days left before the first automatic zone may water again.

        0 when one is due now; the general setting alone when there is no zone.
        """
        remaining = []
        for zone in zones:
            if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                continue
            required, since = cls.zone_days_between(zone, config)
            remaining.append(max(0, required - since) if required > 0 else 0)
        if remaining:
            return min(remaining)
        required, since = cls.zone_days_between({}, config)
        return max(0, required - since) if required > 0 else 0

    async def async_zones_held_by_days_between(self) -> set:
        """Ids of the automatic zones that must wait longer before watering."""
        config = await self.store.async_get_config()
        held = set()
        for zone in await self.store.async_get_zones():
            if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                continue
            required, since = self.zone_days_between(zone, config)
            if required and required > 0 and since < required:
                held.add(zone.get(const.ZONE_ID))
        return held

    async def _evaluate_days_between_irrigation(self) -> dict:
        """Report the days-between-irrigation guard.

        The general setting applies to every zone without a value of its own.
        The day is a skip day only when every automatic zone is held back; when
        only some are, the run goes ahead and those are zeroed for it
        (``_hold_back_zones_held_by_days_between``).
        """
        result = {
            "id": "days_between",
            "enabled": False,
            "available": True,
            "skip": False,
            "days_since": None,
            "days_required": None,
        }
        config = await self.store.async_get_config()

        # Get the configured minimum days between irrigation
        days_between = config.get(
            const.CONF_DAYS_BETWEEN_IRRIGATION,
            const.CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION,
        )
        days_since_last = config.get(
            const.CONF_DAYS_SINCE_LAST_IRRIGATION,
            const.CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION,
        )
        zones = [
            zone
            for zone in await self.store.async_get_zones()
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC
        ]
        own_zones = [
            zone.get(const.ZONE_ID)
            for zone in zones
            if zone.get(const.ZONE_DAYS_BETWEEN_IRRIGATION) is not None
        ]

        # No restriction (always allow irrigation) when the general setting is
        # 0 and no zone asks for days of its own.
        if days_between <= 0 and not any(
            (zone.get(const.ZONE_DAYS_BETWEEN_IRRIGATION) or 0) > 0 for zone in zones
        ):
            return result

        result["enabled"] = True
        result["days_required"] = days_between
        result["days_since"] = days_since_last
        if own_zones:
            result["zones_with_own_setting"] = own_zones

        if zones:
            held = await self.async_zones_held_by_days_between()
            result["zones_held"] = sorted(held)
            skip = len(held) == len(zones)
        else:
            skip = days_since_last < days_between
        if skip:
            _LOGGER.info(
                "Skipping irrigation: not enough days since the last irrigation "
                "(%s of %s days for the general setting)",
                days_since_last,
                days_between,
            )
            result["skip"] = True

        return result

    async def _increment_days_since_irrigation(self):
        """Increment the counter for days since last irrigation."""
        config = await self.store.async_get_config()
        current_days = config.get(
            const.CONF_DAYS_SINCE_LAST_IRRIGATION,
            const.CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION,
        )

        new_days = current_days + 1
        await self.store.async_update_config(
            {const.CONF_DAYS_SINCE_LAST_IRRIGATION: new_days}
        )

        # And the zones that count their own days (#875).
        for zone in await self.store.async_get_zones():
            since = zone.get(const.ZONE_DAYS_SINCE_IRRIGATION)
            if since is not None:
                await self.store.async_update_zone(
                    zone.get(const.ZONE_ID),
                    {const.ZONE_DAYS_SINCE_IRRIGATION: since + 1},
                )

        _LOGGER.debug("Incremented days since last irrigation to %d", new_days)

    async def _reset_days_since_irrigation(self):
        """Reset the counter for days since last irrigation to 0."""
        await self.store.async_update_config({const.CONF_DAYS_SINCE_LAST_IRRIGATION: 0})

        _LOGGER.debug("Reset days since last irrigation to 0")

    async def _reset_zone_days_since_irrigation(self):
        """Restart the count of every zone that has something to water today."""
        for zone in await self.store.async_get_zones():
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED:
                continue
            duration = zone.get(const.ZONE_DURATION)
            if isinstance(duration, (int, float)) and duration > 0:
                await self.store.async_update_zone(
                    zone.get(const.ZONE_ID), {const.ZONE_DAYS_SINCE_IRRIGATION: 0}
                )
