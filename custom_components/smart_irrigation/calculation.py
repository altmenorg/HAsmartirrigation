"""Weather aggregation and ET / bucket / duration calculation.

Extracted from __init__.py: the weather -> calculation pipeline. Merges weather
and sensor values, groups and aggregates a mapping's data, computes the interval
hour-multiplier, loads the calculation module, and computes the ET delta, bucket
and duration per zone. The methods live on a mixin the coordinator inherits;
their bodies are unchanged and still use ``self`` to reach coordinator state.
"""

import asyncio
import logging
import statistics
from datetime import datetime

from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .helpers import convert_between, loadModules, parse_datetime
from .localize import localize

_LOGGER = logging.getLogger(__name__)


class CalculationMixin:
    """Weather aggregation and ET/bucket/duration calculation for the coordinator.

    Mixed into ``SmartIrrigationCoordinator``; methods use ``self`` to reach
    coordinator state (store, hass, the weather client, and the module loader).
    """

    async def merge_weatherdata_and_sensor_values(self, wd, sv):
        """Merge weather data and sensor values dictionaries, giving precedence to sensor values.

        Args:
            wd: The weather data dictionary or None.
            sv: The sensor values dictionary or None.

        Returns:
            dict: A merged dictionary with sensor values overriding weather data where keys overlap.

        """
        if wd is None:
            return sv
        if sv is None:
            return wd
        retval = wd
        for key, val in sv.items():
            if key in retval:
                _LOGGER.debug(
                    "merge_weatherdata_and_sensor_values, overriding %s value %s from OWM with %s from sensors",
                    key,
                    retval[key],
                    val,
                )
            else:
                _LOGGER.debug(
                    "merge_weatherdata_and_sensor_values, adding %s value %s from sensors",
                    key,
                    val,
                )
            retval[key] = val

        return retval

    async def apply_aggregates_to_mapping_data(self, mapping, continuous_updates=False):
        """Apply aggregation functions to mapping data and return the aggregated result.

        Args:
            mapping: The mapping dictionary containing sensor data.
            continuous_updates: Whether continuous updates are enabled.

        Returns:
            dict or None: Aggregated mapping data or None if no data is available.

        """
        _LOGGER.debug("[apply_aggregates_to_mapping_data]: mapping: %s", mapping)
        data = mapping.get(const.MAPPING_DATA)
        if not data:
            return None

        data_by_sensor = self._group_data_by_sensor(data)
        resultdata = {}

        hour_multiplier = self._calc_hour_multiplier(data_by_sensor, mapping)
        resultdata[const.MAPPING_DATA_MULTIPLIER] = hour_multiplier

        if continuous_updates:
            self._fill_missing_from_last_entry(mapping, data_by_sensor)

        await self._aggregate_sensor_data(data_by_sensor, mapping, resultdata)

        _LOGGER.debug("[apply_aggregates_to_mapping_data] returns %s", resultdata)
        return resultdata

    def _group_data_by_sensor(self, data):
        """Group mapping data by sensor key."""
        data_by_sensor = {}
        for d in data:
            if isinstance(d, dict):
                for key, val in d.items():
                    if val is not None:
                        data_by_sensor.setdefault(key, []).append(val)
        # Drop MAX and MIN temp mapping because we calculate it from temp
        data_by_sensor.pop(const.MAPPING_MAX_TEMP, None)
        data_by_sensor.pop(const.MAPPING_MIN_TEMP, None)
        return data_by_sensor

    def _calc_hour_multiplier(self, data_by_sensor, mapping):
        """Process retrieved_at timestamps and calculate hour multiplier."""

        # get interval from last calculation to now
        diff = None
        last_calc_time = None
        if last_calc := mapping.get(const.MAPPING_DATA_LAST_CALCULATION):
            last_calc_time = parse_datetime(last_calc.get(const.MAPPING_TIMESTAMP))
            if last_calc_time:
                diff = datetime.now() - last_calc_time
                _LOGGER.debug(
                    "[_calc_hour_multiplier]: mapping last calculated: %s",
                    last_calc_time,
                )
        if last_calc_time is None:
            _LOGGER.debug(
                "[_calc_hour_multiplier]: mapping has never been calculated, using retrieved_ats",
            )
            if const.RETRIEVED_AT not in data_by_sensor:
                _LOGGER.error(
                    "[_calc_hour_multiplier]: missing RETRIEVED_AT, returning 0"
                )
                return 0
            retrieved_ats = data_by_sensor.pop(const.RETRIEVED_AT)
            hour_multiplier = 1.0
            formatted_retrieved_ats = []
            for item in retrieved_ats:
                if parsed := parse_datetime(item):
                    formatted_retrieved_ats.append(parsed)
            if not formatted_retrieved_ats:
                _LOGGER.error(
                    "[_calc_hour_multiplier]: retrieved_ats empty, returning 0"
                )
                return 0
            first_retrieved_at = min(formatted_retrieved_ats)
            last_retrieved_at = max(formatted_retrieved_ats)
            diff = last_retrieved_at - first_retrieved_at
            _LOGGER.debug(
                "[_calc_hour_multiplier]: first_retrieved_at: %s, last_retrieved_at: %s",
                first_retrieved_at,
                last_retrieved_at,
            )

        # Get interval in hours, then days
        diff_in_hours = abs(diff.total_seconds() / 3600)
        hour_multiplier = diff_in_hours / 24
        _LOGGER.debug(
            "[_calc_hour_multiplier]: diff: %s diff_in_seconds: %s, diff_in_hours: %s, hour_multiplier: %s",
            diff,
            diff.total_seconds(),
            diff_in_hours,
            hour_multiplier,
        )
        return hour_multiplier

    async def _aggregate_sensor_data(self, data_by_sensor, mapping, resultdata):
        """Aggregate sensor data by configured or default aggregate."""
        last_calc_data = mapping.get(const.MAPPING_DATA_LAST_CALCULATION) or {}
        last_calc_data[const.MAPPING_TIMESTAMP] = datetime.now()

        for key, d in data_by_sensor.items():
            if key == const.RETRIEVED_AT:
                continue
            d = [float(i) for i in d]

            aggregate = const.MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT
            if key == const.MAPPING_PRECIPITATION:
                aggregate = const.MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_PRECIPITATION
            elif key == const.MAPPING_TEMPERATURE:
                resultdata[const.MAPPING_MAX_TEMP] = max(d)
                resultdata[const.MAPPING_MIN_TEMP] = min(d)
            mappings = mapping.get(const.MAPPING_MAPPINGS, {})
            if key in mappings:
                aggregate = mappings[key].get(
                    const.MAPPING_CONF_AGGREGATE,
                    aggregate,
                )

            _LOGGER.debug(
                "[_aggregate_sensor_data]: aggregation loop: key: %s, aggregate: %s, data: %s",
                key,
                aggregate,
                d,
            )

            if aggregate == const.MAPPING_CONF_AGGREGATE_DELTA:
                # Fetch value from last calculation
                last_calc_value = last_calc_data.get(key)
                if last_calc_value is None:
                    _LOGGER.debug(
                        "[_aggregate_sensor_data]: last calc value is not set, using d[0] = %s",
                        d[0],
                    )
                    last_calc_value = d[0]
                # Accumulate values
                prev = last_calc_value
                result = 0
                for val in d:
                    # Detect resets to zero (i.e. passing midnight)
                    if val < prev:
                        if val == 0:
                            _LOGGER.debug(
                                "[_aggregate_sensor_data]: detected reset to zero",
                                val,
                                prev,
                            )
                            prev = 0
                        else:
                            _LOGGER.warning(
                                "[_aggregate_sensor_data]: value decreased (%s < %s), skipping",
                                val,
                                prev,
                            )
                            prev = val
                    result += val - prev
                    prev = val
                _LOGGER.debug(
                    "[_aggregate_sensor_data]: last calc value: %s change: %s",
                    last_calc_value,
                    result,
                )
                resultdata[key] = result

            elif len(d) < 2:
                if key == const.MAPPING_TEMPERATURE:
                    resultdata[const.MAPPING_MAX_TEMP] = d[0]
                    resultdata[const.MAPPING_MIN_TEMP] = d[0]
                resultdata[key] = d[0]

            elif aggregate == const.MAPPING_CONF_AGGREGATE_AVERAGE:
                resultdata[key] = statistics.mean(d)
            elif aggregate == const.MAPPING_CONF_AGGREGATE_FIRST:
                resultdata[key] = d[0]
            elif aggregate == const.MAPPING_CONF_AGGREGATE_LAST:
                resultdata[key] = d[-1]
            elif aggregate == const.MAPPING_CONF_AGGREGATE_MAXIMUM:
                resultdata[key] = max(d)
            elif aggregate == const.MAPPING_CONF_AGGREGATE_MINIMUM:
                resultdata[key] = min(d)
            elif aggregate == const.MAPPING_CONF_AGGREGATE_MEDIAN:
                resultdata[key] = statistics.median(d)
            elif aggregate == const.MAPPING_CONF_AGGREGATE_SUM:
                resultdata[key] = sum(d)
            elif aggregate == const.MAPPING_CONF_AGGREGATE_RIEMANNSUM:
                # apply the riemann sum to the data in d
                # Use the trapezoidal rule for Riemann sum approximation
                # Assume each value in d is sampled at equal intervals
                if len(d) < 2:
                    resultdata[key] = float(d[0])
                else:
                    # Trapezoidal rule: sum((d[i] + d[i+1]) / 2) * dt
                    # dt is the interval between samples, assume 1 if not available
                    dt = 1.0
                    # If we have timestamps, use them to get dt
                    if const.RETRIEVED_AT in data_by_sensor:
                        timestamps = data_by_sensor[const.RETRIEVED_AT]
                        if len(timestamps) == len(d):
                            try:
                                # Convert all to datetime
                                times = []
                                for t in timestamps:
                                    if parsed := parse_datetime(t):
                                        times.append(parsed)
                                # Calculate average dt in seconds
                                if len(times) > 1:
                                    dts = [
                                        (times[i + 1] - times[i]).total_seconds()
                                        for i in range(len(times) - 1)
                                    ]
                                    dt = statistics.mean(dts)
                            except (ValueError, TypeError) as err:
                                _LOGGER.error(
                                    "[_aggregate_sensor_data]: Failed to parse timestamps for Riemann sum: %s",
                                    err,
                                )
                    # Calculate the sum
                    riemann_sum = 0.0
                    for i in range(len(d) - 1):
                        riemann_sum += ((d[i] + d[i + 1]) / 2) * dt
                    resultdata[key] = riemann_sum
            last_calc_data[key] = d[-1]

        # update LAST_CALCULATION entry
        await self.store.async_update_mapping(
            mapping.get(const.MAPPING_ID),
            {
                const.MAPPING_DATA_LAST_CALCULATION: last_calc_data,
            },
        )
        _LOGGER.debug(
            "[_aggregate_sensor_data] updating MAPPING_DATA_LAST_CALCULATION: %s",
            last_calc_data,
        )

    def _fill_missing_from_last_entry(self, mapping, data_by_sensor):
        """Fill missing keys in data_by_sensor from last entry data."""
        last_entry = mapping.get(const.MAPPING_DATA_LAST_ENTRY)
        _LOGGER.debug(
            "[_fill_missing_from_last_entry]: last entry data for sensor group %s: %s",
            mapping.get(const.MAPPING_ID),
            last_entry,
        )
        if not last_entry:
            return
        for key, val in last_entry.items():
            if key not in data_by_sensor and val is not None:
                _LOGGER.debug(
                    "[_fill_missing_from_last_entry]: %s is missing from data_by_sensor, adding %s from last entry",
                    key,
                    val,
                )
                data_by_sensor[key] = [val]

    async def _async_clear_all_weatherdata(self, *args):
        _LOGGER.info("Clearing all weatherdata")
        mappings = await self.store.async_get_mappings()
        for mapping in mappings:
            changes = {}
            changes[const.MAPPING_DATA] = []
            changes[const.MAPPING_DATA_LAST_CALCULATION] = {}
            await self.store.async_update_mapping(
                mapping.get(const.MAPPING_ID), changes
            )

    async def _async_calculate_all(self, delete_weather_data):
        _LOGGER.info("Calculating all automatic zones")
        # get all zones that are in automatic and for all of those, loop over the unique list of mappings
        # are any modules using OWM / sensors?

        unfiltered_zones = await self.store.async_get_zones()

        # skip over zones that use pure sensors (not weather service) if continuous updates are enabled
        the_config = await self.store.async_get_config()
        zones = []
        if the_config.get(const.CONF_CONTINUOUS_UPDATES):
            _LOGGER.debug(
                "Continuous updates are enabled, filtering out pure sensor zones"
            )
            # filter zones and only add zone if it uses a weather service
            for z in unfiltered_zones:
                mapping_id = z.get(const.ZONE_MAPPING)
                weather_service_in_mapping, sensor_in_mapping, static_in_mapping = (
                    self.check_mapping_sources(mapping_id=mapping_id)
                )
                if weather_service_in_mapping:
                    _LOGGER.debug(
                        "[async_calculate_all]: zone %s uses a weather service so should be included in the calculation even though continuous updates are on",
                        z.get(const.ZONE_ID),
                    )
                    zones.append(z)
                else:
                    _LOGGER.debug(
                        "[async_calculate_all]: Skipping zone %s from calculation because it uses a pure sensor mapping and continuous updates are enabled",
                        z.get(const.ZONE_ID),
                    )
        else:
            # no need to filter, continue with unfiltered zones
            zones = unfiltered_zones

        # TODO: convert relative pressure to absolute?

        # apply aggregates to sensor data for each mapping
        mapping_ids = await self._get_unique_mappings_for_automatic_zones(zones)
        aggregated_mapping_data = {}
        for mapping_id in mapping_ids:
            mapping = self.store.get_mapping(mapping_id)
            if mapping.get(const.MAPPING_DATA):
                aggregated_mapping_data[mapping_id] = (
                    await self.apply_aggregates_to_mapping_data(mapping, True)
                )

        # TODO: maybe calc each module once here

        # loop over zones and calculate
        forecastdata = None
        for zone in zones:
            # get forecast data if needed (once)
            modinst = await self.getModuleInstanceByID(zone.get(const.ZONE_MODULE))
            if modinst and modinst.name == "PyETO" and modinst.forecast_days > 0:
                if self.use_weather_service:
                    # get forecast info from OWM
                    if forecastdata is None:
                        forecastdata = await self.hass.async_add_executor_job(
                            self._WeatherServiceClient.get_forecast_data
                        )
                    # _LOGGER.debug("Retrieved forecast data: %s", forecastdata)
                else:
                    _LOGGER.error(
                        "Error calculating zone %s: You have configured forecasting but there is no OWM API configured. Either configure the OWM API or stop using forecasting on the PyETO module",
                        zone.get(const.ZONE_NAME),
                    )
                    continue
            # calculate the zone
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC:
                mapping_id = zone.get(const.ZONE_MAPPING)
                weatherdata = aggregated_mapping_data.get(mapping_id)
                if not weatherdata:
                    _LOGGER.error(
                        "[async_calculate_all] Error calculating zone %s: no sensor data available",
                        zone.get(const.ZONE_NAME),
                    )
                    continue
                await self.async_calculate_zone(
                    zone.get(const.ZONE_ID), weatherdata, forecastdata
                )

        # remove mapping data from all mappings used
        if delete_weather_data:
            async with asyncio.TaskGroup() as tg:
                for mapping_id in mapping_ids:
                    changes = {}
                    changes[const.MAPPING_DATA] = []
                    if mapping_id is not None:
                        _LOGGER.debug(
                            "[async_calculate_all] Clearing sensor data for mapping %s",
                            mapping_id,
                        )
                        tg.create_task(
                            self.store.async_update_mapping(mapping_id, changes)
                        )

        # update start_event
        _LOGGER.debug("calling register start event from async_calculate_all")
        await self.register_start_event()

    async def async_calculate_zone(
        self, zone_id, weatherdata, forecastdata=None, delete_weather_data=False
    ):
        """Calculate irrigation values for a specific zone.

        Args:
            zone_id: The ID of the zone to calculate.
            delete_weather_data: Whether to delete weather data.

        """
        _LOGGER.debug("async_calculate_zone: Calculating zone %s", zone_id)
        zone = self.store.get_zone(zone_id)

        # make sure we convert forecast data pressure to absolute!
        calc_data = await self.calculate_module(
            zone,
            weatherdata,
            forecastdata,
        )

        # Apply seasonal adjustments before updating the zone
        calc_data = await self.seasonal_adjustment_manager.apply_seasonal_adjustments(
            calc_data, zone_id
        )

        calc_data[const.ZONE_LAST_CALCULATED] = datetime.now()
        calc_data[const.ZONE_LAST_UPDATED] = datetime.now()

        # check if data contains delete data true, if so delete the weather data
        if delete_weather_data:
            # remove sensor data from mapping
            mapping_id = zone.get(const.ZONE_MAPPING)
            if mapping_id is not None:
                changes = {}
                changes[const.MAPPING_DATA] = []
                await self.store.async_update_mapping(mapping_id, changes=changes)

        await self.store.async_update_zone(zone.get(const.ZONE_ID), calc_data)
        async_dispatcher_send(
            self.hass,
            const.DOMAIN + "_config_updated",
            zone.get(const.ZONE_ID),
        )
        async_dispatcher_send(self.hass, const.DOMAIN + "_update_frontend")

    async def getModuleInstanceByID(self, module_id):
        """Retrieve and instantiate a module by its ID.

        Args:
            module_id: The ID of the module to retrieve.

        Returns:
            The instantiated module object, or None if not found.

        """
        m = self.store.get_module(module_id)
        if m is None:
            return None
        # load the module dynamically
        mods = await self.hass.async_add_executor_job(loadModules, const.MODULE_DIR)
        modinst = None
        for mod in mods:
            if mods[mod]["class"] == m[const.MODULE_NAME]:
                themod = getattr(mods[mod]["module"], mods[mod]["class"])
                modinst = themod(
                    self.hass, description=m["description"], config=m["config"]
                )
                break
        return modinst

    async def calculate_module(self, zone, weatherdata, forecastdata):
        """Calculate irrigation values for a zone using the specified weather and forecast data.

        Args:
            zone: The zone dictionary containing configuration and state.
            weatherdata: Aggregated weather data for the calculation.
            forecastdata: Forecast data if required by the module.

        Returns:
            dict: Updated zone data including calculation results and explanation.

        """
        _LOGGER.debug("calculate_module for zone: %s", zone)
        # _LOGGER.debug("[calculate_module] for zone: %s, weatherdata: %s, forecastdata: %s", zone, weatherdata, forecastdata)
        mod_id = zone.get(const.ZONE_MODULE)
        m = self.store.get_module(mod_id)
        if m is None:
            return None
        modinst = await self.getModuleInstanceByID(mod_id)
        if not modinst:
            _LOGGER.error("Unknown module for zone %s", zone.get(const.ZONE_NAME))
            return None
        # precip = 0
        ha_config_is_metric = self.hass.config.units is METRIC_SYSTEM
        bucket = zone.get(const.ZONE_BUCKET)
        maximum_bucket = zone.get(const.ZONE_MAXIMUM_BUCKET)
        if not ha_config_is_metric:
            bucket = convert_between(const.UNIT_INCH, const.UNIT_MM, bucket)
            if zone.get(const.ZONE_MAXIMUM_BUCKET) is not None:
                maximum_bucket = convert_between(
                    const.UNIT_INCH, const.UNIT_MM, zone.get(const.ZONE_MAXIMUM_BUCKET)
                )
        data = {}
        old_bucket = bucket
        explanation = ""

        precip = 0
        if m[const.MODULE_NAME] == "PyETO":
            # pyeto expects pressure in hpa, solar radiation in mj/m2/day and wind speed in m/s
            delta = modinst.calculate(
                weather_data=weatherdata, forecast_data=forecastdata
            )
            # only PyETO uses precipitation
            precip = weatherdata.get(const.MAPPING_PRECIPITATION, 0)
            _LOGGER.debug("[calculate-module]: precip: %s", precip)
        elif m[const.MODULE_NAME] == "Static":
            delta = modinst.calculate()
        elif m[const.MODULE_NAME] == "Passthrough":
            if const.MAPPING_EVAPOTRANSPIRATION in weatherdata:
                delta = 0 - modinst.calculate(
                    et_data=weatherdata[const.MAPPING_EVAPOTRANSPIRATION]
                )
            else:
                _LOGGER.error(
                    "No evapotranspiration value provided for Passthrough module for zone %s",
                    zone.get(const.ZONE_NAME),
                )
                return None
        # Scale module ET value by interval (hour_multiplier = fractional days)
        _LOGGER.debug("[calculate-module]: retrieved from module: %s", delta)
        # Keep the raw per-day ET deficiency (before interval scaling and
        # precipitation). This is the daily water need that tracks the sensor
        # group / weather; unlike the bucket it does not depend on the
        # hour_multiplier or on bucket resets, so it is the value to compare when
        # experimenting with configurations (issue #576).
        et_deficiency = delta
        hour_multiplier = weatherdata.get(const.MAPPING_DATA_MULTIPLIER, 1.0)
        _LOGGER.debug("[calculate-module]: hour_multiplier: %s", hour_multiplier)
        delta = delta * hour_multiplier + precip
        data[const.ZONE_DELTA] = delta
        _LOGGER.debug("[calculate-module]: new delta: %s", delta)
        newbucket = bucket + delta

        # if maximum bucket configured, limit bucket with that.
        # any water above maximum is removed with runoff / bypass flow.
        if maximum_bucket is not None and newbucket > maximum_bucket:
            newbucket = float(maximum_bucket)
            _LOGGER.debug(
                "[calculate-module]: capped new bucket because of maximum bucket: %s",
                newbucket,
            )
        bucket_plus_delta_capped = newbucket

        # take drainage rate into account
        drainage_rate = zone.get(const.ZONE_DRAINAGE_RATE, 0.0)
        if drainage_rate is None:
            drainage_rate = 0.0
        if not ha_config_is_metric:
            # drainage_rate is in inch/h since HA is not in metric, so we need to adjust those first!
            # using inch and mm here since both are per hour
            drainage_rate = convert_between(
                const.UNIT_INCH, const.UNIT_MM, drainage_rate
            )
        _LOGGER.debug("[calculate-module]: drainage_rate: %s", drainage_rate)
        # drainage only applies above field capacity (bucket > 0)
        drainage = 0
        if newbucket > 0:
            # drainage rate is related to water level, such that full drainage_rate
            # occurs at saturation (maximum_bucket), but is reduced below that point.
            # if maximum_bucket is not set, ignore this relationship and just
            # drain at a constant rate.
            drainage = drainage_rate * hour_multiplier * 24
            if maximum_bucket is not None and maximum_bucket > 0:
                # gamma is set by uniformity of soil particle size,
                # but 2 is a reasonable approximation.
                gamma = 2
                drainage *= (newbucket / maximum_bucket) ** ((2 + 3 * gamma) / gamma)
            _LOGGER.debug("[calculate-module]: current_drainage: %s", drainage)
            newbucket = max(0, newbucket - drainage)

        data[const.ZONE_CURRENT_DRAINAGE] = drainage
        _LOGGER.debug("[calculate-module]: newbucket: %s", newbucket)

        explanation = (
            await localize(
                "module.calculation.explanation.module-returned-evapotranspiration-deficiency",
                self.hass.config.language,
            )
            + f" {data[const.ZONE_DELTA]:.2f}."
        )
        explanation += (
            await localize(
                "module.calculation.explanation.bucket-was", self.hass.config.language
            )
            + f" {old_bucket:.2f}"
        )
        explanation += (
            ".<br/>"
            + await localize(
                "module.calculation.explanation.maximum-bucket-is",
                self.hass.config.language,
            )
            + f" {float(maximum_bucket):.1f}"
        )
        explanation += (
            ".<br/>"
            + await localize(
                "module.calculation.explanation.drainage-rate-is",
                self.hass.config.language,
            )
            + f" {float(drainage_rate):.1f}.<br/>"
        )

        # Define some localized strings here for cleaner code below
        hours_loc = await localize(
            "module.calculation.explanation.hours", self.hass.config.language
        )
        drainage_loc = await localize(
            "module.calculation.explanation.drainage", self.hass.config.language
        )
        drainage_rate_loc = await localize(
            "module.calculation.explanation.drainage-rate", self.hass.config.language
        )
        delta_loc = await localize(
            "module.calculation.explanation.delta", self.hass.config.language
        )
        old_bucket_loc = await localize(
            "module.calculation.explanation.old-bucket-variable",
            self.hass.config.language,
        )
        max_bucket_loc = await localize(
            "module.calculation.explanation.max-bucket-variable",
            self.hass.config.language,
        )

        if bucket_plus_delta_capped <= 0:
            explanation += (
                await localize(
                    "module.calculation.explanation.no-drainage",
                    self.hass.config.language,
                )
                + f" [{old_bucket_loc}] + [{delta_loc}] <= 0 ({old_bucket:.2f}{data[const.ZONE_DELTA]:+.2f} = {bucket_plus_delta_capped:.2f})"
            )
        else:
            explanation += await localize(
                "module.calculation.explanation.current-drainage-is",
                self.hass.config.language,
            )
            if maximum_bucket is None or maximum_bucket <= 0:
                explanation += f" [{drainage_rate_loc}] * {hours_loc} = {drainage_rate:.1f} * {24 * hour_multiplier:.2f} = {drainage:.2f}"
            else:
                explanation += f" [{drainage_rate_loc}] * [{hours_loc}] * (min([{old_bucket_loc}] + [{delta_loc}], [{max_bucket_loc}]) / [{max_bucket_loc}])^4 = {drainage_rate:.1f} * {24 * hour_multiplier:.2f} * ({bucket_plus_delta_capped:.2f} / {maximum_bucket:.1f})^4 = {drainage:.2f}"
        explanation += ".<br/>" + await localize(
            "module.calculation.explanation.new-bucket-values-is",
            self.hass.config.language,
        )

        if maximum_bucket is not None and maximum_bucket > 0:
            explanation += f" max(0, min([{old_bucket_loc}] + [{delta_loc}], {max_bucket_loc}) - [{drainage_loc}]) = max(0, min({old_bucket:.2f}{data[const.ZONE_DELTA]:+.2f}, {maximum_bucket:.1f}) - {drainage:.2f}) = {newbucket:.2f}.<br/>"
        else:
            explanation += f" [{old_bucket_loc}] + [{delta_loc}] - [{drainage_loc}] = {old_bucket:.2f} + {data[const.ZONE_DELTA]:.2f} - {drainage:.2f} = {newbucket:.2f}.<br/>"

        if newbucket < 0:
            # calculate duration

            tput = zone.get(const.ZONE_THROUGHPUT)
            sz = zone.get(const.ZONE_SIZE)
            if not ha_config_is_metric:
                # throughput is in gpm and size is in sq ft since HA is not in metric, so we need to adjust those first!
                tput = convert_between(const.UNIT_GPM, const.UNIT_LPM, tput)
                sz = convert_between(const.UNIT_SQ_FT, const.UNIT_M2, sz)
            precipitation_rate = (tput * 60) / sz
            # new version of calculation below - this is the old version from V1. Switching to the new version removes the need for ET values to be passed in!
            # water_budget = 1
            # if mod.maximum_et != 0:
            #    water_budget = round(abs(data[const.ZONE_BUCKET])/mod.maximum_et,2)
            #
            # base_schedule_index = (mod.maximum_et / precipitation_rate * 60)*60

            # duration = water_budget * base_schedule_index
            # new version (2.0): ART = W * BSI = ( |B| / ETpeak ) * ( ETpeak / PR * 3600 ) = |B| / PR * 3600 = ( ET - P ) / PR * 3600
            # so duration = |B| / PR * 3600
            duration = abs(newbucket) / precipitation_rate * 3600
            explanation += (
                await localize(
                    "module.calculation.explanation.bucket-less-than-zero-irrigation-necessary",
                    self.hass.config.language,
                )
                + ".<br/>"
                + await localize(
                    "module.calculation.explanation.steps-taken-to-calculate-duration",
                    self.hass.config.language,
                )
                + ":<br/>"
            )
            # v1 only
            # explanation += "<ol><li>Water budget is defined as abs([bucket])/max(ET)={}</li>".format(water_budget)
            # beta25: temporarily removing all rounds to see if we can find the math issue reported in #186
            explanation += (
                "<ol><li>"
                + await localize(
                    "module.calculation.explanation.precipitation-rate-defined-as",
                    self.hass.config.language,
                )
                + " ["
                + await localize(
                    "common.attributes.throughput", self.hass.config.language
                )
                + "] * 60 / ["
                + await localize("common.attributes.size", self.hass.config.language)
                + f"] = {tput:.1f} * 60 / {sz:.1f} = {precipitation_rate:.1f}.</li>"
            )
            # v1 only
            # explanation += "<li>The base schedule index is defined as (max(ET)/[precipitation rate]*60)*60=({}/{}*60)*60={}</li>".format(mod.maximum_et,precipitation_rate,round(base_schedule_index,1))
            # explanation += "<li>the duration is calculated as [water_budget]*[base_schedule_index]={}*{}={}</li>".format(water_budget,round(base_schedule_index,1),round(duration))
            # beta25: temporarily removing all rounds to see if we can find the math issue reported in #186
            explanation += (
                "<li>"
                + await localize(
                    "module.calculation.explanation.duration-is-calculated-as",
                    self.hass.config.language,
                )
                + " abs(["
                + await localize(
                    "module.calculation.explanation.bucket", self.hass.config.language
                )
                + "]) / ["
                + await localize(
                    "module.calculation.explanation.precipitation-rate-variable",
                    self.hass.config.language,
                )
                + f"] * 3600 = {abs(newbucket):.2f} / {precipitation_rate:.1f} * 3600 = {duration:.0f}.</li>"
            )
            duration = zone.get(const.ZONE_MULTIPLIER) * duration
            explanation += (
                "<li>"
                + await localize(
                    "module.calculation.explanation.multiplier-is-applied",
                    self.hass.config.language,
                )
                + f" {zone.get(const.ZONE_MULTIPLIER)}, "
            )
            explanation += (
                await localize(
                    "module.calculation.explanation.duration-after-multiplier-is",
                    self.hass.config.language,
                )
                + f" {round(duration)}.</li>"
            )

            # get maximum duration if set and >=0 and override duration if it's higher than maximum duration
            explanation += (
                "<li>"
                + await localize(
                    "module.calculation.explanation.maximum-duration-is-applied",
                    self.hass.config.language,
                )
                + f" {zone.get(const.ZONE_MAXIMUM_DURATION):.0f}"
            )
            if (
                zone.get(const.ZONE_MAXIMUM_DURATION) is not None
                and zone.get(const.ZONE_MAXIMUM_DURATION) >= 0
                and duration > zone.get(const.ZONE_MAXIMUM_DURATION)
            ):
                duration = zone.get(const.ZONE_MAXIMUM_DURATION)
                explanation += (
                    ", "
                    + await localize(
                        "module.calculation.explanation.duration-after-maximum-duration-is",
                        self.hass.config.language,
                    )
                    + f" {duration:.0f}"
                )
            explanation += ".</li>"

            # add the lead time but only if duration is > 0 at this point
            if duration > 0.0:
                duration = round(zone.get(const.ZONE_LEAD_TIME) + duration)
                explanation += (
                    "<li>"
                    + await localize(
                        "module.calculation.explanation.lead-time-is-applied",
                        self.hass.config.language,
                    )
                    + f" {zone.get(const.ZONE_LEAD_TIME)}, "
                )
                explanation += (
                    await localize(
                        "module.calculation.explanation.duration-after-lead-time-is",
                        self.hass.config.language,
                    )
                    + f" {duration}</li></ol>"
                )
                explanation += (
                    await localize(
                        "module.calculation.explanation.duration-after-lead-time-is",
                        self.hass.config.language,
                    )
                    + f" {duration}.</li></ol>"
                )

                # _LOGGER.debug("[calculate-module]: explanation: %s", explanation)
        else:
            # no need to irrigate, set duration to 0
            duration = 0
            explanation += (
                await localize(
                    "module.calculation.explanation.bucket-larger-than-or-equal-to-zero-no-irrigation-necessary",
                    self.hass.config.language,
                )
                + f" {duration}"
            )

        data[const.ZONE_BUCKET] = newbucket
        data[const.ZONE_ET_DEFICIENCY] = et_deficiency
        if not ha_config_is_metric:
            # bucket, delta, et_deficiency and current_drainage are computed in
            # mm internally; store them in the HA unit (inches) so the sensors
            # and panel show a value consistent with the rest of the imperial UI.
            data[const.ZONE_BUCKET] = convert_between(
                const.UNIT_MM, const.UNIT_INCH, data[const.ZONE_BUCKET]
            )
            data[const.ZONE_DELTA] = convert_between(
                const.UNIT_MM, const.UNIT_INCH, data[const.ZONE_DELTA]
            )
            data[const.ZONE_ET_DEFICIENCY] = convert_between(
                const.UNIT_MM, const.UNIT_INCH, data[const.ZONE_ET_DEFICIENCY]
            )
            data[const.ZONE_CURRENT_DRAINAGE] = convert_between(
                const.UNIT_MM, const.UNIT_INCH, data[const.ZONE_CURRENT_DRAINAGE]
            )
        data[const.ZONE_DURATION] = duration
        data[const.ZONE_EXPLANATION] = explanation
        return data
