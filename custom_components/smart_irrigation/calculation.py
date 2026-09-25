"""Weather aggregation and ET / bucket / duration calculation.

Extracted from __init__.py: the weather -> calculation pipeline. Merges weather
and sensor values, groups and aggregates a mapping's data, computes the interval
hour-multiplier, loads the calculation module, and computes the ET delta, bucket
and duration per zone. The methods live on a mixin the coordinator inherits;
their bodies are unchanged and still use ``self`` to reach coordinator state.
"""

import logging
import statistics
from datetime import datetime, timedelta

from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .calc_log import timestamps as calc_log_timestamps
from .calcmodules.consumes import sourced_fields
from .helpers import loadModules, parse_datetime
from .hourly_rows import SystemLocalTime, forecast_eto_by_day, summed_hourly_eto
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

    def module_id_for_zone(self, zone) -> int | None:
        """Which engine computes this zone's evapotranspiration.

        The sensor group decides when it says so: "this group produces ET this
        way" is a property of the group, not of every zone that happens to read
        it, and it is what lets the editor show only the sources that engine
        consumes.

        A group that has not adopted an engine, because its zones disagree or
        because it predates the move, leaves the zone's own module in charge.
        Nothing changes for those installs until the disagreement is resolved.
        """
        mapping_id = zone.get(const.ZONE_MAPPING)
        if mapping_id is not None:
            mapping = self.store.get_mapping(mapping_id)
            if mapping and mapping.get(const.MAPPING_MODULE) is not None:
                return mapping.get(const.MAPPING_MODULE)
        return zone.get(const.ZONE_MODULE)

    @staticmethod
    def zone_window_start(zone):
        """Where a zone's unread window starts, or None if it has read none.

        None means the zone takes the whole buffer, which is what emptying the
        buffer used to leave behind and so is what an install upgrading to
        watermarks should see on its first calculation.
        """
        stamp = zone.get(const.ZONE_LAST_CONSUMED_AT)
        if stamp is None:
            return None
        try:
            return parse_datetime(stamp)
        except (ValueError, TypeError):
            return None

    async def prune_consumed_readings(self, mapping_id) -> None:
        """Drop the readings every zone of a group has already consumed.

        The buffer is shared, so it can only lose what the slowest reader has
        passed. Only automatic zones read it. A disabled zone is not
        calculating, and a manual one never does: its duration is the one its
        owner set. Letting either pin the buffer would grow the store without
        end, which a manual zone did, having no mark and so seeming to need
        everything.

        Readings are also capped at a week regardless, so a group whose zones
        have all stopped calculating does not accumulate indefinitely. A zone
        that has never consumed used to return before the cap was applied.
        """
        mapping = self.store.get_mapping(mapping_id)
        if not mapping or not mapping.get(const.MAPPING_DATA):
            return

        watermarks = []
        never_consumed = False
        for zone in await self.store.async_get_zones():
            if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                continue
            if zone.get(const.ZONE_MAPPING) is None:
                continue
            try:
                same = int(zone.get(const.ZONE_MAPPING)) == int(mapping_id)
            except (TypeError, ValueError):
                continue
            if not same:
                continue
            start = self.zone_window_start(zone)
            if start is None:
                # A zone that has never consumed still needs everything the
                # week cap keeps.
                never_consumed = True
                continue
            watermarks.append(start)

        cutoff = datetime.now() - timedelta(days=7)
        if watermarks and not never_consumed:
            cutoff = max(cutoff, min(watermarks))

        buffered = mapping.get(const.MAPPING_DATA)
        kept = self._readings_after(buffered, cutoff)
        # Keep the last reading each field took before the cutoff. Those are
        # consumed, so they are never counted again, but a cumulative sensor
        # measures the window against them: drop them and the rain that fell
        # between the cutoff and the window's first sample goes uncounted, with
        # nothing to show it went missing.
        baselines = sorted(
            {
                id(record): (stamp, record)
                for stamp, record in self._latest_before(buffered, cutoff).values()
            }.values(),
            key=lambda pair: pair[0],
        )
        kept = [record for _, record in baselines] + kept
        if len(kept) == len(buffered):
            return
        _LOGGER.debug(
            "[prune_consumed_readings] sensor group %s: %s readings kept of %s "
            "(%s of them baselines held for the fields' next delta)",
            mapping_id,
            len(kept),
            len(buffered),
            len(baselines),
        )
        await self.store.async_update_mapping(
            mapping_id, changes={const.MAPPING_DATA: kept}
        )

    @staticmethod
    def _readings_after(data, since):
        """The buffered readings a zone has not consumed yet.

        A sensor group's buffer is shared by every zone reading that group, so
        it cannot be emptied when one of them calculates. Each zone takes only
        what arrived after its own watermark instead.

        A reading whose timestamp cannot be read is kept. It is an anomaly
        either way, and counting a reading twice waters a little too much,
        while dropping one silently waters too little and leaves no trace.
        """
        if since is None:
            return data
        window = []
        for record in data:
            if not isinstance(record, dict):
                continue
            stamp = record.get(const.RETRIEVED_AT)
            try:
                parsed = parse_datetime(stamp) if stamp is not None else None
            except (ValueError, TypeError):
                parsed = None
            if parsed is None or parsed > since:
                window.append(record)
        return window

    @staticmethod
    def _latest_before(data, moment):
        """The newest reading of each field from before ``moment``.

        A sensor writes one row per state change carrying that one field, so
        "the reading before the window" is not a single row: it is one row per
        field. Keeping only the newest of them would leave every other field
        without the value its delta is measured from.

        This is what a cumulative sensor (a rain gauge that counts up) needs.
        Its reading is a total, so the rain that fell during a window is the
        last total minus the total the window started from, and that starting
        total is by definition the reading before the window.

        A reading whose timestamp cannot be read is not a candidate: those are
        left in the window by ``_readings_after``, and one cannot be both.
        """
        if moment is None:
            return {}
        latest = {}
        for record in data or []:
            if not isinstance(record, dict):
                continue
            stamp = record.get(const.RETRIEVED_AT)
            try:
                parsed = parse_datetime(stamp) if stamp is not None else None
            except (ValueError, TypeError):
                parsed = None
            if parsed is None or parsed > moment:
                continue
            for key in record:
                if key == const.RETRIEVED_AT:
                    continue
                known = latest.get(key)
                if known is None or known[0] <= parsed:
                    latest[key] = (parsed, record)
        return latest

    async def apply_aggregates_to_mapping_data(
        self, mapping, continuous_updates=False, persist=True, since=None
    ):
        """Apply aggregation functions to mapping data and return the aggregated result.

        Args:
            mapping: The mapping dictionary containing sensor data.
            continuous_updates: Whether continuous updates are enabled.
            persist: Whether to record this as the mapping's last calculation.
                Pass False to look at the data without consuming it: the last
                calculation marks where the next interval starts, so moving it
                would truncate the window the next real calculation works over.
            since: Only aggregate readings taken after this moment. This is how
                one zone reads a group shared with others without consuming
                their history. None takes the whole buffer.

        Returns:
            dict or None: Aggregated mapping data or None if no data is available.

        """
        _LOGGER.debug("[apply_aggregates_to_mapping_data]: mapping: %s", mapping)
        buffered = mapping.get(const.MAPPING_DATA)
        data = self._readings_after(buffered, since)
        if not data:
            return None

        # What each field read just before this window opened. A delta is
        # measured from there, and the mapping's last calculation cannot say
        # it any more: it belongs to the group, so on a group read by several
        # zones it holds whichever zone calculated last rather than where this
        # zone left off.
        before = self._latest_before(buffered, since)
        baselines = {key: record.get(key) for key, (_, record) in before.items()}
        baseline_stamps = {key: stamp for key, (stamp, _) in before.items()}

        data_by_sensor, timestamps_by_sensor = self._group_data_by_sensor(data)
        resultdata = {}
        # Calculation audit log (#12): record how the raw sensor records became
        # the aggregate the calculation module is fed. None when the log is off.
        audit = self._new_mapping_audit(mapping, data)

        hour_multiplier = self._calc_hour_multiplier(
            data_by_sensor, mapping, audit, since=since
        )
        resultdata[const.MAPPING_DATA_MULTIPLIER] = hour_multiplier
        # The rain window is the interval that scales ET. Both ends are taken
        # before aggregating: a persisting aggregation moves the last
        # calculation marker the window starts at, and ending no later than the
        # new marker keeps two windows from counting the same hour.
        rain_window = (self._rain_window_start(mapping, data, since), datetime.now())

        if continuous_updates:
            self._fill_missing_from_last_entry(mapping, data_by_sensor, audit)

        await self._aggregate_sensor_data(
            data_by_sensor,
            mapping,
            resultdata,
            persist=persist,
            timestamps_by_sensor=timestamps_by_sensor,
            audit=audit,
            baselines=baselines,
            baseline_stamps=baseline_stamps,
        )

        rain = await self._weather_service_rain(mapping, *rain_window)
        if rain is not None:
            resultdata[const.MAPPING_WEATHER_SERVICE_RAIN] = rain

        if audit is not None:
            audit["multiplier"] = hour_multiplier
            self._mapping_audit_store()[mapping.get(const.MAPPING_ID)] = audit

        _LOGGER.debug("[apply_aggregates_to_mapping_data] returns %s", resultdata)
        return resultdata

    # --- calculation audit log helpers (#12) ---

    def _calc_log_enabled(self) -> bool:
        """Whether the opt-in calculation audit log is switched on."""
        logger = getattr(self, "calc_logger", None)
        if logger is None:
            return False
        try:
            return logger.is_enabled(self.store.get_config())
        except (AttributeError, TypeError):  # pragma: no cover - defensive
            return False

    def _mapping_audit_store(self) -> dict:
        """Per-sensor-group aggregation audits, keyed by mapping id."""
        store = getattr(self, "_mapping_audits", None)
        if store is None:
            store = {}
            self._mapping_audits = store
        return store

    def _new_mapping_audit(self, mapping, data) -> dict | None:
        """Start an aggregation audit for a sensor group, if logging is on."""
        if not self._calc_log_enabled():
            return None
        return {
            "id": mapping.get(const.MAPPING_ID),
            "name": mapping.get(const.MAPPING_NAME),
            "aggregated_at": datetime.now(),
            "records": len(data),
            "interval": {},
            "fields": {},
            "carried_over": [],
        }

    def _record_field_audit(self, audit, mapping, key, values, aggregate, value):
        """Record one aggregated field: where it came from and how it was aggregated."""
        the_map = mapping.get(const.MAPPING_MAPPINGS, {}).get(key)
        source = None
        entity = None
        static_value = None
        if isinstance(the_map, dict):
            source = the_map.get(const.MAPPING_CONF_SOURCE)
            entity = the_map.get(const.MAPPING_CONF_SENSOR)
            static_value = the_map.get(const.MAPPING_CONF_STATIC_VALUE)
        audit["fields"][key] = {
            "value": value,
            "aggregate": aggregate,
            "count": len(values),
            # min/max of the raw records make a single outlier visible without
            # having to dump every record.
            "min": min(values),
            "max": max(values),
            "source": source,
            "entity": entity,
            "static_value": static_value,
            "carried_over": key in audit["carried_over"],
        }

    @staticmethod
    def _cumulative_change(values, stamps=None, start=None, start_stamp=None):
        """The rain a cumulative gauge counted, from its successive totals.

        The gauge reports a running total, so only a reading above the highest
        total seen so far is new rain. A total can go down for two reasons, and
        they need opposite treatment:

        - the counter was reset. A "rain today" total restarts at midnight, and
          any counter restarts at 0. What it reads afterwards fell since the
          reset, so the reading itself is counted and becomes the new mark;
        - the source revised its total down, as sensors fed by a web service do
          when the service corrects itself. No water left the ground, so this
          counts nothing and the mark stays where it was. Counting the climb
          back to it counted that rain twice: a total revised from 4.3 to 3.0
          and then reaching 5.0 is 5.0 mm, not 6.3.

        A drop to 0, or across midnight between two readings, is a reset. Any
        other drop is a revision. Home Assistant's own rule for these counters
        (any drop of more than 10% is a reset) would take that 4.3 to 3.0
        revision for a reset and count the 3.0 again.

        ``start`` is the total the window is measured from, None to measure
        from the first reading. ``stamps`` pairs a timestamp with each value.
        A missing or unreadable one cannot show midnight, so a drop there is a
        reset only if it reaches 0.
        """

        def _day(stamp):
            if isinstance(stamp, datetime):
                return stamp.date()
            if stamp is None:
                return None
            try:
                parsed = parse_datetime(stamp)
            except (ValueError, TypeError):
                return None
            return parsed.date() if parsed is not None else None

        values = list(values)
        stamps = list(stamps or [])
        if not values:
            return 0.0
        if start is None:
            start, start_stamp = values[0], (stamps[0] if stamps else None)
        mark, previous_day, total = start, _day(start_stamp), 0.0
        for index, value in enumerate(values):
            day = _day(stamps[index]) if index < len(stamps) else None
            if value >= mark:
                total += value - mark
                mark = value
            elif value == 0 or (
                day is not None and previous_day is not None and day > previous_day
            ):
                _LOGGER.debug(
                    "[_aggregate_sensor_data]: counter reset (%s after %s)", value, mark
                )
                total += value
                mark = value
            else:
                _LOGGER.debug(
                    "[_aggregate_sensor_data]: total revised down (%s below %s), "
                    "counting nothing until it passes it again",
                    value,
                    mark,
                )
            if day is not None:
                previous_day = day
        return total

    def _group_data_by_sensor(self, data):
        """Group mapping data by sensor key, keeping each value's timestamp.

        A record does not have to carry every key. Continuous updates append one
        record per sensor state change, so most records carry a single key, and
        a value can also be missing because its sensor was unavailable. The flat
        list of record timestamps therefore does not line up with any one key's
        values, which is why they are paired here instead (#363).

        Returns:
            tuple: (values per key, timestamp per value per key)

        """
        data_by_sensor = {}
        timestamps_by_sensor = {}
        for d in data:
            if not isinstance(d, dict):
                continue
            retrieved_at = d.get(const.RETRIEVED_AT)
            for key, val in d.items():
                if val is None:
                    continue
                data_by_sensor.setdefault(key, []).append(val)
                if key != const.RETRIEVED_AT:
                    timestamps_by_sensor.setdefault(key, []).append(retrieved_at)
        # Drop MAX and MIN temp mapping because we calculate it from temp
        for key in (const.MAPPING_MAX_TEMP, const.MAPPING_MIN_TEMP):
            data_by_sensor.pop(key, None)
            timestamps_by_sensor.pop(key, None)
        return data_by_sensor, timestamps_by_sensor

    def _calc_hour_multiplier(self, data_by_sensor, mapping, audit=None, since=None):
        """Process retrieved_at timestamps and calculate hour multiplier.

        ``since`` is where this reader's own window opens, and it wins when it
        is given. The sensor group's last calculation belongs to the group: on
        a group read by two zones on different schedules it holds whichever of
        them calculated last, so the zone that calculates second would scale a
        day of evapotranspiration by the other zone's interval.
        """

        # get interval from last calculation to now
        diff = None
        last_calc_time = None
        if since is not None:
            last_calc_time = since
            now = datetime.now()
            diff = now - since
            if audit is not None:
                audit["interval"] = {
                    "start": since,
                    "end": now,
                    "source": const.ZONE_LAST_CONSUMED_AT,
                }
        elif last_calc := mapping.get(const.MAPPING_DATA_LAST_CALCULATION):
            last_calc_time = parse_datetime(last_calc.get(const.MAPPING_TIMESTAMP))
            if last_calc_time:
                now = datetime.now()
                diff = now - last_calc_time
                if audit is not None:
                    audit["interval"] = {
                        "start": last_calc_time,
                        "end": now,
                        "source": const.MAPPING_DATA_LAST_CALCULATION,
                    }
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
            if audit is not None:
                audit["interval"] = {
                    "start": first_retrieved_at,
                    "end": last_retrieved_at,
                    "source": const.RETRIEVED_AT,
                }
            _LOGGER.debug(
                "[_calc_hour_multiplier]: first_retrieved_at: %s, last_retrieved_at: %s",
                first_retrieved_at,
                last_retrieved_at,
            )

        # Get interval in hours, then days
        diff_in_hours = abs(diff.total_seconds() / 3600)
        hour_multiplier = diff_in_hours / 24
        if audit is not None:
            audit["interval"]["hours"] = diff_in_hours
        _LOGGER.debug(
            "[_calc_hour_multiplier]: diff: %s diff_in_seconds: %s, diff_in_hours: %s, hour_multiplier: %s",
            diff,
            diff.total_seconds(),
            diff_in_hours,
            hour_multiplier,
        )
        return hour_multiplier

    def _precipitation_net_of_superseded(self, zone, weatherdata):
        """Precipitation for the interval, less what an asserted bucket covered.

        Setting the bucket says the soil is in a known state, so the rain that
        fell before it is already accounted for and must not be added on top of
        the value asserted (#811).
        """
        precip = self._precipitation_for_interval(zone, weatherdata)
        superseded = zone.get(const.ZONE_PRECIPITATION_SUPERSEDED) or 0.0
        if superseded <= 0:
            return precip
        net = max(0.0, precip - superseded)
        _LOGGER.debug(
            "[calculate-module]: %.1f mm of the %.1f mm collected was superseded by an asserted bucket value, using %.1f mm",
            superseded,
            precip,
            net,
        )
        return net

    def _rain_window_start(self, mapping, data, since=None):
        """Where the rain window of an aggregation starts, or None.

        The same moment the interval that scales ET starts at: this reader's
        own window when it has one, else the sensor group's last calculation,
        else its earliest reading. The group's marker is shared, so on a group
        read by two zones it would hand the second zone the rain of the first
        zone's interval instead of its own.
        """
        if since is not None:
            return since
        last_calc = mapping.get(const.MAPPING_DATA_LAST_CALCULATION) or {}
        start = self._parse_stamp(last_calc.get(const.MAPPING_TIMESTAMP))
        if start is not None:
            return start
        stamps = [
            stamp
            for record in data or []
            if isinstance(record, dict)
            and (stamp := self._parse_stamp(record.get(const.RETRIEVED_AT)))
        ]
        try:
            return min(stamps) if stamps else None
        except TypeError:
            # Naive and aware timestamps mixed: no window rather than a crash.
            return None

    @staticmethod
    def _parse_stamp(value):
        """A stored timestamp as a datetime, or None when absent or unreadable."""
        if value is None:
            return None
        try:
            return parse_datetime(value)
        except (ValueError, TypeError):
            return None

    async def _weather_service_rain(self, mapping, start, end):
        """Rain that fell over the window per the weather service's history, in mm.

        Only Open-Meteo keeps an hourly precipitation history, and it is only
        asked when the sensor group takes its rain from the weather service.
        The history holds the rain of every hour of the window, where the rate
        sampled at each update sees only the moment of that update: the last
        15 minutes for Open-Meteo, whose "current" block is 15-minutely (#835).

        Returns None when it does not apply or could not be read, which leaves
        the sampled rate to the calculation.
        """
        if (
            not getattr(self, "use_weather_service", False)
            or getattr(self, "weather_service", None) != const.CONF_WEATHER_SERVICE_OM
            or start is None
            or (mapping or {}).get(const.MAPPING_GREENHOUSE)
        ):
            return None
        fetch = getattr(
            getattr(self, "_WeatherServiceClient", None),
            "get_precipitation_between",
            None,
        )
        if fetch is None:
            return None
        the_map = ((mapping or {}).get(const.MAPPING_MAPPINGS) or {}).get(
            const.MAPPING_CURRENT_PRECIPITATION
        )
        if (
            not isinstance(the_map, dict)
            or the_map.get(const.MAPPING_CONF_SOURCE)
            != const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
        ):
            return None

        rain = await self.hass.async_add_executor_job(fetch, start, end)
        if rain is None:
            _LOGGER.warning(
                "Could not read the hourly precipitation from Open-Meteo for sensor "
                "group %s; using the sampled precipitation rate instead",
                mapping.get(const.MAPPING_NAME),
            )
            return None
        _LOGGER.debug(
            "[_weather_service_rain]: sensor group %s: %.2f mm fell between %s and %s",
            mapping.get(const.MAPPING_NAME),
            rain,
            start,
            end,
        )
        return rain

    def _precipitation_for_interval(self, zone, weatherdata):
        """Return the precipitation to add to the bucket, in mm.

        Two different quantities can carry the rain, and only one of them may be
        counted or it is added twice:

        - ``Precipitation`` is a depth in mm already accumulated over the
          interval, which is what its aggregate produces.
        - ``Current Precipitation`` is a rate in mm/h, so it has to be
          integrated over the interval to become a depth.

        ``Precipitation`` wins when it has a value. Falling back to the rate is
        what makes a sensor group that only maps a rain-rate sensor count its
        rain at all: the rate was collected, converted and shown in the panel,
        but never reached the water balance (#571).

        Between the two, the weather service's hourly history of the interval is
        used when there is one. It is already a depth, and it covers every hour
        where the sampled rate only sees the moments of the updates (#835).
        """
        mapping = self.store.get_mapping(zone.get(const.ZONE_MAPPING))
        if (mapping or {}).get(const.MAPPING_GREENHOUSE):
            # Nothing falls on a greenhouse. Any precipitation reaching this
            # group is measuring the weather outside it, which waters nothing.
            _LOGGER.debug(
                "[calculate-module]: sensor group is a greenhouse, no rain counted"
            )
            return 0

        precip = weatherdata.get(const.MAPPING_PRECIPITATION)
        if precip is not None:
            _LOGGER.debug("[calculate-module]: precip: %s", precip)
            return precip

        rain = weatherdata.get(const.MAPPING_WEATHER_SERVICE_RAIN)
        if rain is not None:
            _LOGGER.debug(
                "[calculate-module]: rain from the weather service's hourly history: %s",
                rain,
            )
            return rain

        rate = weatherdata.get(const.MAPPING_CURRENT_PRECIPITATION)
        if not rate:
            return 0

        aggregate = ((mapping or {}).get(const.MAPPING_MAPPINGS) or {}).get(
            const.MAPPING_CURRENT_PRECIPITATION
        )
        if not isinstance(aggregate, dict):
            aggregate = {}
        # A Riemann sum has already integrated the rate over the samples, so it
        # is a depth; every other aggregate hands back a representative rate.
        if (
            aggregate.get(const.MAPPING_CONF_AGGREGATE)
            == const.MAPPING_CONF_AGGREGATE_RIEMANNSUM
        ):
            precip = rate
        else:
            interval_hours = weatherdata.get(const.MAPPING_DATA_MULTIPLIER, 0) * 24
            # The services report the rain of the last hour only, so one sample
            # accounts for one hour however far apart the samples are. Spreading
            # the average over the whole interval extrapolates the hours that
            # were never looked at: at a six-hourly update, 6 mm falling in a
            # sampled hour came out as 36 mm. Never credit more hours than were
            # actually observed.
            observed_hours = weatherdata.get(
                const.MAPPING_CURRENT_PRECIPITATION_SAMPLES
            )
            if observed_hours:
                interval_hours = min(interval_hours, observed_hours)
            precip = rate * interval_hours
        _LOGGER.debug(
            "[calculate-module]: no precipitation depth, using the rate %s mm/h over the interval: %s",
            rate,
            precip,
        )
        return precip

    async def _aggregate_sensor_data(
        self,
        data_by_sensor,
        mapping,
        resultdata,
        persist=True,
        timestamps_by_sensor=None,
        audit=None,
        baselines=None,
        baseline_stamps=None,
    ):
        """Aggregate sensor data by configured or default aggregate.

        ``timestamps_by_sensor`` carries the timestamp of each value, per key,
        which is what the Riemann sum integrates over. Without it the flat
        RETRIEVED_AT list is used, which is only right when every record carries
        every key.

        ``baselines`` carries what each field read just before this window, for
        the aggregates that measure a change rather than a level, and
        ``baseline_stamps`` when it read it.
        """
        # A copy, not the stored dict: this is stamped with a new timestamp
        # below, and anything that is only looking (a dry run, the live
        # estimate) must leave the mapping it was handed exactly as it found
        # it. Bumping that timestamp in place would shorten the interval the
        # next real calculation works over, and under-water every zone.
        last_calc_data = dict(mapping.get(const.MAPPING_DATA_LAST_CALCULATION) or {})
        # When the stored totals were read, before the copy is restamped.
        last_calc_stamp = last_calc_data.get(const.MAPPING_TIMESTAMP)
        last_calc_data[const.MAPPING_TIMESTAMP] = datetime.now()

        for key, d in data_by_sensor.items():
            if key == const.RETRIEVED_AT:
                continue
            d = [float(i) for i in d]

            if key == const.MAPPING_CURRENT_PRECIPITATION:
                resultdata[const.MAPPING_CURRENT_PRECIPITATION_SAMPLES] = len(d)

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
                # Where this window starts from, most precise source first: the
                # reading this field took just before the window, then the
                # group's last calculation (right when the group has a single
                # reader, stale when it has several), then the first reading of
                # the window, which measures the change across the window and
                # loses whatever happened before its first sample.
                stamps = (timestamps_by_sensor or {}).get(key) or []
                last_calc_value = (baselines or {}).get(key)
                start_stamp = (baseline_stamps or {}).get(key)
                if last_calc_value is None:
                    last_calc_value = last_calc_data.get(key)
                    start_stamp = last_calc_stamp
                if last_calc_value is None:
                    _LOGGER.debug(
                        "[_aggregate_sensor_data]: last calc value is not set, using d[0] = %s",
                        d[0],
                    )
                    last_calc_value = d[0]
                    start_stamp = stamps[0] if stamps else None
                try:
                    last_calc_value = float(last_calc_value)
                except (TypeError, ValueError):
                    last_calc_value = d[0]
                    start_stamp = stamps[0] if stamps else None
                result = self._cumulative_change(
                    d, stamps, start=last_calc_value, start_stamp=start_stamp
                )
                _LOGGER.debug(
                    "[_aggregate_sensor_data]: last calc value: %s change: %s",
                    last_calc_value,
                    result,
                )
                resultdata[key] = result

            elif len(d) < 2 and aggregate != const.MAPPING_CONF_AGGREGATE_RIEMANNSUM:
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
                #
                # dt has to be expressed in the same time unit as the values,
                # which is per day for everything except the precipitation rate:
                # convert_mapping_to_metric normalises solar radiation to
                # MJ/day/m2 (#784) but leaves the precipitation rate in mm/h, so
                # integrating it in days overstated the result 24-fold.
                seconds_per_unit = (
                    3600.0 if key == const.MAPPING_CURRENT_PRECIPITATION else 86400.0
                )
                if len(d) < 2 and key != const.MAPPING_CURRENT_PRECIPITATION:
                    # One sample of a rate per day is that rate (see the
                    # time-weighted mean below).
                    resultdata[key] = float(d[0])
                elif len(d) < 2:
                    # A single sample carries no interval of its own, so
                    # integrate the rate over the calculation interval instead of
                    # handing back the rate as if it were already a total.
                    interval_days = resultdata.get(const.MAPPING_DATA_MULTIPLIER, 0)
                    resultdata[key] = float(d[0]) * (
                        interval_days * 86400.0 / seconds_per_unit
                    )
                else:
                    # Trapezoidal rule: sum((d[i] + d[i+1]) / 2 * dt[i]), with
                    # each interval measured from the timestamps of the two
                    # values it joins rather than from one average spacing, so
                    # samples that are not evenly spaced integrate correctly.
                    timestamps = (timestamps_by_sensor or {}).get(key)
                    if timestamps is None:
                        # No per-key timestamps: the flat record timestamps are
                        # only usable when every record carried every key.
                        timestamps = data_by_sensor.get(const.RETRIEVED_AT)
                    times = []
                    if timestamps is not None and len(timestamps) == len(d):
                        try:
                            times = [parse_datetime(t) for t in timestamps]
                        except (ValueError, TypeError) as err:
                            _LOGGER.error(
                                "[_aggregate_sensor_data]: Failed to parse timestamps for Riemann sum: %s",
                                err,
                            )
                            times = []
                    if len(times) != len(d) or any(t is None for t in times):
                        # Falling back to one day per sample silently inflated
                        # the result by the number of samples (#363), so say so
                        # and integrate over the calculation interval instead.
                        interval_days = resultdata.get(const.MAPPING_DATA_MULTIPLIER, 0)
                        dt = (
                            interval_days
                            * 86400.0
                            / seconds_per_unit
                            / max(len(d) - 1, 1)
                        )
                        _LOGGER.warning(
                            "[_aggregate_sensor_data]: no usable timestamps for the Riemann sum of '%s'; "
                            "spreading its %s samples evenly over the calculation interval",
                            key,
                            len(d),
                        )
                        times = None
                    riemann_sum = 0.0
                    span = 0.0
                    for i in range(len(d) - 1):
                        if times is not None:
                            dt = (
                                times[i + 1] - times[i]
                            ).total_seconds() / seconds_per_unit
                        riemann_sum += ((d[i] + d[i + 1]) / 2) * dt
                        span += dt
                    resultdata[key] = riemann_sum
                    if key != const.MAPPING_CURRENT_PRECIPITATION and span > 0:
                        # The precipitation rate is integrated into the depth
                        # that fell. Anything else is a rate per day that the
                        # engine takes as the day's value, above all the solar
                        # radiation in MJ/m2/day: its integral is the energy of
                        # the samples' span, which equals a day's value only
                        # when the span is a day. Continuous updates calculate
                        # over minutes and handed PyETO almost no sun; a
                        # two-day window handed it twice the sun, then scaled
                        # the result by the interval again. The time-weighted
                        # mean is the value the engine expects.
                        resultdata[key] = riemann_sum / span
            last_calc_data[key] = d[-1]
            if audit is not None:
                self._record_field_audit(
                    audit, mapping, key, d, aggregate, resultdata.get(key)
                )

        if audit is not None:
            # Max/min temperature are not mapped fields: they are derived from
            # the temperature records above, so record where they came from.
            for derived_key, derived_aggregate in (
                (const.MAPPING_MAX_TEMP, const.MAPPING_CONF_AGGREGATE_MAXIMUM),
                (const.MAPPING_MIN_TEMP, const.MAPPING_CONF_AGGREGATE_MINIMUM),
            ):
                if derived_key in resultdata:
                    audit["fields"][derived_key] = {
                        "value": resultdata[derived_key],
                        "aggregate": derived_aggregate,
                        "derived_from": const.MAPPING_TEMPERATURE,
                    }

        if not persist:
            # Advancing the marker here would shrink the next real calculation's
            # hour_multiplier and re-baseline the delta aggregates, double
            # counting precipitation, so anything that is only looking (a dry
            # run, the live estimate) must leave it alone.
            _LOGGER.debug(
                "[_aggregate_sensor_data] not persisting MAPPING_DATA_LAST_CALCULATION"
            )
            return
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

    async def _hourly_solar_series(self, mapping, since):
        """The sun of each hour of the window from the weather service, or None.

        For a sensor group with no radiation source. The daily equation
        estimates the day's sun from its temperature range, which is a fair
        guess for a whole day and a poor one for an hour, so without this an
        installation without a pyranometer could never calculate hour by hour.

        Open-Meteo publishes the history. On OpenWeatherMap or Pirate Weather,
        which publish no radiation at all, the client is already wrapped in the
        Open-Meteo fallback that fills that field, and the same wrapper answers
        here: the choice of service was never a choice about radiation.

        A greenhouse is not asked: no sky reading describes what reaches a
        plant under glass.
        """
        if (
            not getattr(self, "use_weather_service", False)
            or since is None
            or (mapping or {}).get(const.MAPPING_GREENHOUSE)
        ):
            return None
        fetch = getattr(
            getattr(self, "_WeatherServiceClient", None), "get_hourly_radiation", None
        )
        if fetch is None:
            return None
        series = await self.hass.async_add_executor_job(fetch, since, datetime.now())
        if not series:
            _LOGGER.debug(
                "No hourly radiation from Open-Meteo for sensor group %s",
                (mapping or {}).get(const.MAPPING_NAME),
            )
            return None
        return series

    async def _hourly_with_forecast(self, zone, mapping, measured, forecast_days):
        """The window's ET averaged with the days to come, hour by hour.

        A zone set to look ahead does not water on what fell; it waters on what
        the mean of today and the next days asks for, so a hot tomorrow raises
        today's run. The daily equation does that by averaging days, and this
        keeps exactly that arithmetic, with every term summed hour by hour:
        the measured window as a rate per day, and each forecast day as its own
        24 hours.

        None when the hours of those days cannot be read, and the caller then
        keeps the daily equation rather than average an hourly sum with a
        daily one, which would put back the bias the hourly form removes.
        """
        total_mm, hours = measured
        if hours <= 0:
            return None
        series = await self._hourly_forecast_series(mapping, forecast_days)
        if not series:
            return None
        by_day = forecast_eto_by_day(
            series,
            latitude=getattr(self, "_effective_latitude", None),
            longitude=getattr(self, "_effective_longitude", None),
            elevation=getattr(self, "_effective_elevation", None) or 0.0,
            tz=SystemLocalTime(),
        )
        days = [eto for _day, eto in sorted(by_day.items())][:forecast_days]
        if len(days) < forecast_days:
            _LOGGER.debug(
                "[calculate-module]: zone %s: only %s of %s forecast days can be "
                "read hour by hour, keeping the daily equation",
                zone.get(const.ZONE_ID),
                len(days),
                forecast_days,
            )
            return None
        # The window as the rate per day it implies, so it is one term among
        # days, exactly as the daily equation averages them.
        measured_per_day = total_mm * 24.0 / hours
        mean_per_day = (measured_per_day + sum(days)) / (1 + len(days))
        return mean_per_day * hours / 24.0, hours

    async def _hourly_forecast_series(self, mapping, days):
        """The coming days hour by hour from the weather service, or None."""
        if not getattr(self, "use_weather_service", False) or (mapping or {}).get(
            const.MAPPING_GREENHOUSE
        ):
            return None
        fetch = getattr(
            getattr(self, "_WeatherServiceClient", None), "get_hourly_forecast", None
        )
        if fetch is None:
            return None
        return await self.hass.async_add_executor_job(fetch, days)

    async def _hourly_reference_et(self, zone, modinst):
        """Reference ET summed hour by hour over the zone's window, or None.

        ``(total_mm, hours)`` when the hourly calculation is switched on and the
        window supports it. None in every other case, and then the caller runs
        the daily equation exactly as before:

        - the setting is off, which is the default;
        - the engine averages forecast days and the hours of those days cannot
          be read, which only Open-Meteo publishes;
        - the sensor group has no readings, or a required field missing
          everywhere;
        - the sensor group has no radiation source and the weather service
          cannot supply the sun of each hour: the hourly equation needs the
          hour's own sun, and estimating it from the day would be a guess;
        - the site has no coordinates, since placing the sun needs them.

        The window is the zone's own, from its mark to now, the same one the
        daily path reads, so switching forms never moves where a calculation
        starts or ends.
        """
        config = self.store.get_config() or {}
        if not config.get(const.CONF_HOURLY_CALCULATION):
            return None
        mapping = self.store.get_mapping(zone.get(const.ZONE_MAPPING))
        if not mapping or not mapping.get(const.MAPPING_DATA):
            return None
        sourced = self._sourced_fields(mapping)
        last_entry = {
            key: value
            for key, value in (mapping.get(const.MAPPING_DATA_LAST_ENTRY) or {}).items()
            if key in sourced
        }
        since = self.zone_window_start(zone)
        solar_series = None
        if const.MAPPING_SOLRAD not in sourced:
            solar_series = await self._hourly_solar_series(mapping, since)
            if solar_series is None:
                return None
        result = summed_hourly_eto(
            mapping.get(const.MAPPING_DATA),
            since,
            now=datetime.now(),
            last_entry=last_entry,
            latitude=getattr(self, "_effective_latitude", None),
            longitude=getattr(self, "_effective_longitude", None),
            elevation=getattr(self, "_effective_elevation", None) or 0.0,
            tz=SystemLocalTime(),
            solar_series=solar_series,
        )
        if result is None:
            _LOGGER.debug(
                "[calculate-module]: zone %s: the window will not reduce to hourly "
                "rows, keeping the daily equation",
                zone.get(const.ZONE_ID),
            )
            return None
        forecast_days = getattr(modinst, "forecast_days", 0) or 0
        if forecast_days:
            result = await self._hourly_with_forecast(
                zone, mapping, result, forecast_days
            )
            if result is None:
                return None
        _LOGGER.debug(
            "[calculate-module]: zone %s: %.3f mm of reference ET summed over "
            "%.2f hours",
            zone.get(const.ZONE_ID),
            result[0],
            result[1],
        )
        return result

    @staticmethod
    def _sourced_fields(mapping) -> set:
        """The sensor group's fields that something currently reports.

        A field whose source was removed keeps whatever it last held in the
        last entry, and the last entry never loses a key. Shared with the
        module editor, which hides the options a sourced field makes idle.
        """
        return sourced_fields(mapping)

    def _fill_missing_from_last_entry(self, mapping, data_by_sensor, audit=None):
        """Fill missing keys in data_by_sensor from last entry data.

        Only for fields the group still reads. A source that reports rarely has
        to keep counting between its updates, which is what this is for, but a
        field whose source was removed must not: its last value stays in the
        last entry for good and would be carried into every later calculation.

        That is what stopped rain reaching the bucket for weather-service users
        (#834). Since v2026.8.2 the service feeds the rain as a rate through
        ``Current Precipitation`` and the migration leaves ``Precipitation``
        without a source. The 0.0 it last held kept being carried over, and a
        depth takes precedence over a rate, so every drop was discarded.
        """
        last_entry = mapping.get(const.MAPPING_DATA_LAST_ENTRY)
        _LOGGER.debug(
            "[_fill_missing_from_last_entry]: last entry data for sensor group %s: %s",
            mapping.get(const.MAPPING_ID),
            last_entry,
        )
        if not last_entry:
            return
        sourced = self._sourced_fields(mapping)
        for key, val in last_entry.items():
            if key not in data_by_sensor and key not in sourced:
                _LOGGER.debug(
                    "[_fill_missing_from_last_entry]: %s has no source on this sensor "
                    "group any more, not carrying its last value (%s) over",
                    key,
                    val,
                )
                continue
            if key not in data_by_sensor and val is not None:
                _LOGGER.debug(
                    "[_fill_missing_from_last_entry]: %s is missing from data_by_sensor, adding %s from last entry",
                    key,
                    val,
                )
                data_by_sensor[key] = [val]
                if audit is not None:
                    audit["carried_over"].append(key)

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

    async def _async_calculate_all(self, delete_weather_data=True, dry_run=False):
        """Calculate every automatic zone.

        ``delete_weather_data`` defaults to True because that is what every
        caller wants: the weather data collected since the previous calculation
        has been consumed and must not be counted again. It also doubles as the
        time argument when this is used directly as an async_track_time_change
        callback, and the recurring scheduler calls it without any argument at
        all.

        ``dry_run`` computes without committing anything. It forces
        ``delete_weather_data`` off whatever the caller asked, because a preview
        must not advance any zone's watermark.
        """
        if dry_run:
            delete_weather_data = False
        _LOGGER.info(
            "Calculating all automatic zones%s", " (dry run)" if dry_run else ""
        )
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

        # Each zone is aggregated over its own window rather than the group
        # being aggregated once and shared: two zones on the same group can be
        # at different points in its buffer, and the one that calculated most
        # recently must not be handed the other's unread history.
        mapping_ids = await self._get_unique_mappings_for_automatic_zones(zones)

        # TODO: maybe calc each module once here

        # loop over zones and calculate
        forecastdata = None
        results = {}
        for zone in zones:
            # get forecast data if needed (once)
            modinst = await self.getModuleInstanceByID(self.module_id_for_zone(zone))
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
                # `is not None`, because the sensor group created on a fresh
                # install has id 0: a falsy check left every default setup
                # without weather data, and the zone was never calculated
                # (#846).
                mapping = (
                    self.store.get_mapping(mapping_id)
                    if mapping_id is not None
                    else None
                )
                weatherdata = None
                if mapping and mapping.get(const.MAPPING_DATA):
                    weatherdata = await self.apply_aggregates_to_mapping_data(
                        mapping,
                        True,
                        persist=not dry_run,
                        since=self.zone_window_start(zone),
                    )
                if not weatherdata:
                    _LOGGER.error(
                        "[async_calculate_all] Error calculating zone %s: no sensor data available",
                        zone.get(const.ZONE_NAME),
                    )
                    continue
                calc_data = await self.async_calculate_zone(
                    zone.get(const.ZONE_ID),
                    weatherdata,
                    forecastdata,
                    delete_weather_data=delete_weather_data,
                    prune=False,
                    dry_run=dry_run,
                )
                if calc_data is not None:
                    results[zone.get(const.ZONE_ID)] = calc_data

        # Drop what every zone of each group has now read. Not a wipe: a group
        # can be shared with a zone that did not calculate in this pass, and its
        # history is still owed to that zone.
        if delete_weather_data:
            for mapping_id in mapping_ids:
                if mapping_id is not None:
                    await self.prune_consumed_readings(mapping_id)

        # A dry run changed no durations, so there is no new start event to register.
        if not dry_run:
            _LOGGER.debug("calling register start event from async_calculate_all")
            await self.register_start_event()
        return results

    async def async_calculate_zone(
        self,
        zone_id,
        weatherdata,
        forecastdata=None,
        delete_weather_data=False,
        prune=True,
        dry_run=False,
    ):
        """Calculate irrigation values for a specific zone.

        Args:
            zone_id: The ID of the zone to calculate.
            weatherdata: Aggregated weather data for the calculation.
            forecastdata: Forecast data if required by the module.
            delete_weather_data: Whether to delete weather data.
            dry_run: When True, compute and return the result without writing
                anything: the bucket, the zone and the collected weather data are
                all left as they were.

        Returns:
            dict or None: The calculated zone data.

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
        # The window this calculation just consumed is the one an asserted
        # bucket value superseded part of, so the marker has done its job (#811).
        calc_data[const.ZONE_PRECIPITATION_SUPERSEDED] = 0.0

        # Calculation audit log (#12): written after the seasonal adjustments so
        # the record shows the values the zone would be updated with. A dry run
        # is logged as well -- it is exactly when one asks "why this number?" --
        # but flagged, so it is never mistaken for a real calculation. The log
        # is a diagnostic side-file, not integration state, so writing it does
        # not break the dry-run promise.
        await self._async_write_calc_record(calc_data, dry_run=dry_run)

        if dry_run:
            _LOGGER.info(
                "[async_calculate_zone] dry run for zone %s: bucket would become %s, duration %s (nothing was saved)",
                zone_id,
                calc_data.get(const.ZONE_BUCKET),
                calc_data.get(const.ZONE_DURATION),
            )
            return calc_data

        # This zone has now read its window, so record where it got to instead
        # of emptying the group's buffer. The buffer belongs to every zone
        # reading that group: clearing it here left the others calculating on
        # whatever had arrived since, which under-watered them silently.
        if delete_weather_data:
            calc_data[const.ZONE_LAST_CONSUMED_AT] = datetime.now()

        await self.store.async_update_zone(zone.get(const.ZONE_ID), calc_data)

        if delete_weather_data and prune:
            # What every zone of the group has passed can go. The all-zones
            # path prunes once at the end instead, since pruning between two
            # zones of the same group would do the same work repeatedly.
            mapping_id = zone.get(const.ZONE_MAPPING)
            if mapping_id is not None:
                await self.prune_consumed_readings(mapping_id)
        async_dispatcher_send(
            self.hass,
            const.DOMAIN + "_config_updated",
            zone.get(const.ZONE_ID),
        )
        async_dispatcher_send(self.hass, const.DOMAIN + "_update_frontend")
        return calc_data

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
        # Audit record of this call (#12); only filled in on a successful
        # calculation, so an early return cannot leave a stale one behind.
        self._pending_calc_record = None
        mod_id = zone.get(const.ZONE_MODULE)
        mod_id = self.module_id_for_zone(zone)
        m = self.store.get_module(mod_id)
        if m is None:
            return None
        modinst = await self.getModuleInstanceByID(mod_id)
        if not modinst:
            _LOGGER.error("Unknown module for zone %s", zone.get(const.ZONE_NAME))
            return None
        # precip = 0
        # Zone values are stored in metric (units.py): the calculation reads
        # and writes them as they are.
        ha_config_is_metric = self.hass.config.units is METRIC_SYSTEM
        bucket = zone.get(const.ZONE_BUCKET)
        maximum_bucket = zone.get(const.ZONE_MAXIMUM_BUCKET)
        data = {}
        old_bucket = bucket
        explanation = ""
        # Only computed when irrigation is needed, but recorded in the audit log
        # (#12) either way, so a zero duration can be told apart from a missing
        # precipitation rate.
        precipitation_rate = None
        throughput_metric = None
        size_metric = None

        precip = 0
        # Set when the ET below already covers the whole window, as the hourly
        # sum does. Scaling it by the interval again would count it twice.
        hourly = None
        if m[const.MODULE_NAME] == "PyETO":
            hourly = await self._hourly_reference_et(zone, modinst)
            if hourly is not None:
                delta = -hourly[0]
            else:
                # pyeto expects pressure in hpa, solar radiation in mj/m2/day and wind speed in m/s
                delta = modinst.calculate(
                    weather_data=weatherdata, forecast_data=forecastdata
                )
            precip = self._precipitation_net_of_superseded(zone, weatherdata)
        elif m[const.MODULE_NAME] == "Static":
            delta = modinst.calculate()
        elif m[const.MODULE_NAME] == "Passthrough":
            if const.MAPPING_EVAPOTRANSPIRATION in weatherdata:
                delta = 0 - modinst.calculate(
                    et_data=weatherdata[const.MAPPING_EVAPOTRANSPIRATION]
                )
                # Passthrough bypasses the ET calculation, not the water
                # balance: measured/forecast precipitation must still refill
                # the bucket, otherwise it can only ever drain (#790).
                precip = self._precipitation_net_of_superseded(zone, weatherdata)
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
        # The multiplier is the crop factor Kc, so it belongs on the crop's water
        # use and nowhere else: ETc = ET0 * Kc. It used to be applied at the very
        # end, to the duration, which scaled the whole water balance and so
        # scaled the rain along with it, crediting only Kc times the millimetres
        # that fell. It also left the bucket draining at the full ET0, reaching
        # any irrigation threshold about 1/Kc times too fast, and no factor
        # applied afterwards can undo a decision about *when* to water (#779).
        crop_factor = zone.get(const.ZONE_MULTIPLIER)
        if crop_factor is None:
            crop_factor = 1.0
        # A seasonal multiplier adjustment scales the crop factor for the months
        # it covers.
        crop_factor = crop_factor * self._seasonal_factors(zone)[0]
        delta = delta * crop_factor
        hour_multiplier = weatherdata.get(const.MAPPING_DATA_MULTIPLIER, 1.0)
        _LOGGER.debug(
            "[calculate-module]: crop factor: %s, hour_multiplier: %s",
            crop_factor,
            hour_multiplier,
        )
        delta = delta * (1.0 if hourly is not None else hour_multiplier) + precip
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
        _LOGGER.debug("[calculate-module]: drainage_rate: %s", drainage_rate)
        # drainage only applies above field capacity (bucket > 0)
        drainage = 0
        if newbucket > 0:
            hours = hour_multiplier * 24
            if maximum_bucket is not None and maximum_bucket > 0:
                # Brooks-Corey: the drainage rate is the full rate at saturation
                # (maximum_bucket) scaled by (bucket / maximum_bucket)^n, so it is
                # a rate law, dB/dt = -r (B/M)^n, and it falls as the surplus
                # drains. It used to be evaluated once, at the bucket after the
                # interval's rain, and applied over the whole interval: one
                # 24-hour step on a curve that steep drained an 8 mm surplus
                # completely where the law itself drains 3.7 mm and leaves 4.3.
                # The law has an exact solution for a constant rate, so use it.
                # gamma is set by uniformity of soil particle size, but 2 is a
                # reasonable approximation, which makes n = 4.
                gamma = 2
                n = (2 + 3 * gamma) / gamma
                if drainage_rate > 0 and hours > 0:
                    remaining = (
                        newbucket ** (1 - n)
                        + (n - 1) * drainage_rate * hours / maximum_bucket**n
                    ) ** (1 / (1 - n))
                    drainage = newbucket - remaining
            else:
                # No saturation reference to scale by: drain at a constant rate.
                drainage = drainage_rate * hours
            _LOGGER.debug("[calculate-module]: current_drainage: %s", drainage)
            newbucket = max(0, newbucket - drainage)

        data[const.ZONE_CURRENT_DRAINAGE] = drainage
        _LOGGER.debug("[calculate-module]: newbucket: %s", newbucket)

        # The formatting note is a note about the whole text, so it stands on
        # its own line, and the crop factor is stated where it is applied,
        # which is to the evapotranspiration and not to the duration (#817).
        explanation = (
            await localize(
                "module.calculation.explanation.formatting-note",
                self.hass.config.language,
            )
            + "<br/><br/>"
        )
        if hourly is not None:
            explanation += (
                await localize(
                    "module.calculation.explanation.module-returned-hourly-evapotranspiration-deficiency",
                    self.hass.config.language,
                )
                + f" {hourly[1]:.1f} h:"
                + f" {data[const.ZONE_DELTA]:.2f} mm."
            )
        else:
            explanation += (
                await localize(
                    "module.calculation.explanation.module-returned-evapotranspiration-deficiency",
                    self.hass.config.language,
                )
                + f" {data[const.ZONE_DELTA]:.2f} mm."
            )
        explanation += (
            " "
            + await localize(
                "module.calculation.explanation.crop-factor-is",
                self.hass.config.language,
            )
            + f" {crop_factor}."
        )
        explanation += (
            "<br/>"
            + await localize(
                "module.calculation.explanation.bucket-was", self.hass.config.language
            )
            + f" {old_bucket:.2f} mm"
        )
        explanation += (
            ".<br/>"
            + await localize(
                "module.calculation.explanation.maximum-bucket-is",
                self.hass.config.language,
            )
            # A zone may have no maximum bucket: the schema allows it, and
            # clearing the field in the panel sends null. The drainage handles
            # that case; this line used to raise on it and take the whole
            # calculation of the zone down with it.
            + (
                f" {float(maximum_bucket):.1f} mm"
                if maximum_bucket is not None
                else " -"
            )
        )
        explanation += (
            ".<br/>"
            + await localize(
                "module.calculation.explanation.drainage-rate-is",
                self.hass.config.language,
            )
            + f" {float(drainage_rate):.1f} mm/h.<br/>"
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
                + f" [{old_bucket_loc}] + [{delta_loc}] <= 0 ({old_bucket:.2f} mm {data[const.ZONE_DELTA]:+.2f} mm = {bucket_plus_delta_capped:.2f} mm)"
            )
        else:
            explanation += await localize(
                "module.calculation.explanation.current-drainage-is",
                self.hass.config.language,
            )
            if maximum_bucket is None or maximum_bucket <= 0:
                explanation += f" [{drainage_rate_loc}] * {hours_loc} = {drainage_rate:.1f} * {24 * hour_multiplier:.2f} = {drainage:.2f} mm"
            else:
                start = f"min([{old_bucket_loc}] + [{delta_loc}], [{max_bucket_loc}])"
                explanation += (
                    f" {start} - ({start}^-3 + 3 * [{drainage_rate_loc}] * [{hours_loc}]"
                    f" / [{max_bucket_loc}]^4)^(-1/3)"
                    f" = {bucket_plus_delta_capped:.2f} - ({bucket_plus_delta_capped:.2f}^-3"
                    f" + 3 * {drainage_rate:.1f} * {24 * hour_multiplier:.2f}"
                    f" / {maximum_bucket:.1f}^4)^(-1/3) = {drainage:.2f} mm"
                )
        explanation += ".<br/>" + await localize(
            "module.calculation.explanation.new-bucket-values-is",
            self.hass.config.language,
        )

        if bucket_plus_delta_capped <= 0:
            # Deficit: drainage and the max(0, ...) clamp do not apply (see the
            # `if newbucket > 0` guard above), so the bucket stays negative.
            # Show the formula that was actually used, without max(0)/min/drainage.
            explanation += f" [{old_bucket_loc}] + [{delta_loc}] = {old_bucket:.2f} mm {data[const.ZONE_DELTA]:+.2f} mm = {newbucket:.2f} mm.<br/>"
        elif maximum_bucket is not None and maximum_bucket > 0:
            explanation += f" max(0, min([{old_bucket_loc}] + [{delta_loc}], {max_bucket_loc}) - [{drainage_loc}]) = max(0, min({old_bucket:.2f} mm {data[const.ZONE_DELTA]:+.2f} mm, {maximum_bucket:.1f} mm) - {drainage:.2f} mm) = {newbucket:.2f} mm.<br/>"
        else:
            explanation += f" max(0, [{old_bucket_loc}] + [{delta_loc}] - [{drainage_loc}]) = max(0, {old_bucket:.2f} mm + {data[const.ZONE_DELTA]:.2f} mm - {drainage:.2f} mm) = {newbucket:.2f} mm.<br/>"

        threshold_mm = self.irrigation_threshold_mm(zone)
        # Two different reasons not to water, and only one of them is "the soil
        # is full". A deficit that has not reached the zone's threshold is
        # explained here, and must not then be told it is at or above zero
        # (#832): the bucket is negative, that is the whole point of a
        # threshold.
        below_threshold = newbucket < 0 and abs(newbucket) < threshold_mm
        if below_threshold:
            explanation += (
                await localize(
                    "module.calculation.explanation.below-irrigation-threshold",
                    self.hass.config.language,
                )
                + f" {abs(newbucket):.2f} mm / {threshold_mm:.2f} mm.<br/>"
            )
        if newbucket < 0 and abs(newbucket) >= threshold_mm:
            # calculate duration

            precipitation_rate, tput, sz = self._zone_precipitation_rate(zone)
            # Guard against a missing/zero rate (e.g. direct mode with no value
            # entered yet) so the formatting below never divides by None/0.
            precipitation_rate = precipitation_rate or 0
            # Recorded by the calculation log. Both are None when the rate was
            # entered directly, because there is no throughput or size behind it.
            throughput_metric = tput
            size_metric = sz
            # new version of calculation below - this is the old version from V1. Switching to the new version removes the need for ET values to be passed in!
            # water_budget = 1
            # if mod.maximum_et != 0:
            #    water_budget = round(abs(data[const.ZONE_BUCKET])/mod.maximum_et,2)
            #
            # base_schedule_index = (mod.maximum_et / precipitation_rate * 60)*60

            # duration = water_budget * base_schedule_index
            # new version (2.0): ART = W * BSI = ( |B| / ETpeak ) * ( ETpeak / PR * 3600 ) = |B| / PR * 3600 = ( ET - P ) / PR * 3600
            # so duration = |B| / PR * 3600
            duration = (
                abs(newbucket) / precipitation_rate * 3600 if precipitation_rate else 0
            )
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
            if tput is not None and sz is not None:
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
                    + await localize(
                        "common.attributes.size", self.hass.config.language
                    )
                    + f"] = {tput:.1f} * 60 / {sz:.1f} = {precipitation_rate:.1f} mm/h.</li>"
                )
            else:
                explanation += (
                    "<ol><li>"
                    + await localize(
                        "module.calculation.explanation.precipitation-rate-is",
                        self.hass.config.language,
                    )
                    + f" {precipitation_rate:.1f} mm/h.</li>"
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
                + f"] * 3600 = {abs(newbucket):.2f} / {precipitation_rate:.1f} * 3600 = {duration:.0f} s.</li>"
            )
            # get maximum duration if set and >=0 and override duration if it's higher than maximum duration
            explanation += (
                "<li>"
                + await localize(
                    "module.calculation.explanation.maximum-duration-is-applied",
                    self.hass.config.language,
                )
                + f" {zone.get(const.ZONE_MAXIMUM_DURATION):.0f} s"
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
                    + f" {duration:.0f} s"
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
                    + f" {zone.get(const.ZONE_LEAD_TIME)} s.</li></ol>"
                )
                explanation += (
                    await localize(
                        "module.calculation.explanation.duration-after-lead-time-is",
                        self.hass.config.language,
                    )
                    + f" {duration} s."
                )

                # _LOGGER.debug("[calculate-module]: explanation: %s", explanation)
        else:
            # no need to irrigate, set duration to 0
            duration = 0
            if not below_threshold:
                explanation += (
                    await localize(
                        "module.calculation.explanation.bucket-larger-than-or-equal-to-zero-no-irrigation-necessary",
                        self.hass.config.language,
                    )
                    + f" {duration} s"
                )

        data[const.ZONE_BUCKET] = newbucket
        data[const.ZONE_ET_DEFICIENCY] = et_deficiency
        data[const.ZONE_DURATION] = duration
        data[const.ZONE_EXPLANATION] = explanation

        self._pending_calc_record = self._build_calc_record(
            zone=zone,
            module_name=m[const.MODULE_NAME],
            modinst=modinst,
            weatherdata=weatherdata,
            forecastdata=forecastdata,
            metric=ha_config_is_metric,
            values={
                "et_deficiency": et_deficiency,
                "hour_multiplier": hour_multiplier,
                "precipitation": precip,
                "delta": delta,
                "bucket_before": old_bucket,
                "bucket_plus_delta_capped": bucket_plus_delta_capped,
                "maximum_bucket": maximum_bucket,
                "drainage_rate": drainage_rate,
                "drainage": drainage,
                "bucket_after": newbucket,
                "precipitation_rate": precipitation_rate,
                "throughput": throughput_metric,
                "size": size_metric,
                "duration": duration,
                "hourly": hourly,
            },
        )
        return data

    async def precipitation_since_last_calculation(self, zone) -> float:
        """Rain collected for a zone since its last calculation, in mm.

        Reads the window the next calculation will consume without consuming it,
        so the same rain is still counted there. Aggregation is the calculation's
        own, which is what keeps the two answers consistent.
        """
        mapping = self.store.get_mapping(zone.get(const.ZONE_MAPPING))
        if not mapping or not mapping.get(const.MAPPING_DATA):
            return 0.0
        # From the zone's own mark, as its next calculation will read: the
        # group's last calculation belongs to whichever zone ran last, and it
        # does not move when this zone's bucket is asserted.
        weatherdata = await self.apply_aggregates_to_mapping_data(
            mapping, persist=False, since=self.zone_window_start(zone)
        )
        if not weatherdata:
            return 0.0
        return float(self._precipitation_for_interval(zone, weatherdata) or 0.0)

    def irrigation_threshold_mm(self, zone) -> float:
        """The deficit a zone lets build up before watering, in mm.

        Watering the instant anything is missing is a management allowed
        depletion of zero: right for a lawn, wrong for a tree or a hedge, which
        wants the soil to dry down and then a deep soak. Both places that turn a
        bucket into a duration read it from here so they cannot disagree (#815).
        """
        threshold = zone.get(const.ZONE_IRRIGATION_THRESHOLD) or 0.0
        # A seasonal threshold adjustment is in mm and moves the threshold for
        # the months it covers, never below watering at any deficit.
        threshold = max(0.0, float(threshold) + self._seasonal_factors(zone)[1])
        return threshold

    def _seasonal_factors(self, zone):
        """``(multiplier, threshold_offset_mm)`` of the season, neutral if none."""
        manager = getattr(self, "seasonal_adjustment_manager", None)
        if manager is None:
            return 1.0, 0.0
        try:
            multiplier, offset = manager.seasonal_factors(zone.get(const.ZONE_ID))
            return float(multiplier), float(offset)
        except Exception:  # noqa: BLE001 - never let the season break a calculation
            return 1.0, 0.0

    def _zone_precipitation_rate(self, zone: dict):
        """Return the zone's precipitation rate in mm/h.

        If the zone is configured with a directly entered precipitation rate
        (``ZONE_INPUT_METHOD_PRECIPITATION_RATE``), that value is used.
        Otherwise it is derived from throughput (L/min) and size (m2).

        Returns a tuple ``(precipitation_rate, tput, sz)`` where ``tput``/``sz``
        are ``None`` when the direct rate is used (nothing to show in that
        formula). ``precipitation_rate`` is ``None`` if it cannot be determined.
        """
        if (
            zone.get(const.ZONE_INPUT_METHOD)
            == const.ZONE_INPUT_METHOD_PRECIPITATION_RATE
        ):
            rate = zone.get(const.ZONE_PRECIPITATION_RATE)
            if not rate:
                return None, None, None
            return rate, None, None

        tput = zone.get(const.ZONE_THROUGHPUT)
        sz = zone.get(const.ZONE_SIZE)
        if not tput or not sz:
            return None, tput, sz
        return (tput * 60) / sz, tput, sz

    def _build_calc_record(
        self, zone, module_name, modinst, weatherdata, forecastdata, metric, values
    ) -> dict | None:
        """Assemble one audit record for a zone calculation (#12).

        Returns None when the audit log is switched off. Inputs, module
        intermediates and outputs are in the metric units the calculation itself
        works in (mm, m/s, hPa, litres, seconds) whatever the Home Assistant
        unit system, so records stay comparable across a unit-system change; the
        ``outputs.final`` block added on write is the exception, mirroring what
        is stored on the zone. ``unit_system`` records which one was in effect.
        """
        if not self._calc_log_enabled():
            return None

        mapping_id = zone.get(const.ZONE_MAPPING)
        # The aggregation audit is kept, not consumed: several zones commonly
        # share one sensor group and each of them needs it. Without fresh
        # aggregated data there is nothing it could describe, so skip it.
        aggregation = (
            self._mapping_audit_store().get(mapping_id) if weatherdata else None
        )
        duration = values.get("duration") or 0
        throughput = values.get("throughput")
        # Volume in m3: throughput (l/min) * duration (s) / 60 / 1000.
        volume_m3 = None
        if throughput is not None:
            volume_m3 = throughput * duration / 60 / 1000

        record = {
            **calc_log_timestamps(),
            "version": const.VERSION,
            "unit_system": const.CONF_METRIC if metric else const.CONF_IMPERIAL,
            "zone": {
                "id": zone.get(const.ZONE_ID),
                "name": zone.get(const.ZONE_NAME),
                "state": zone.get(const.ZONE_STATE),
                "module": module_name,
                "multiplier": zone.get(const.ZONE_MULTIPLIER),
                "lead_time": zone.get(const.ZONE_LEAD_TIME),
                "maximum_duration": zone.get(const.ZONE_MAXIMUM_DURATION),
            },
            "inputs": {
                "sensor_group": {
                    "id": mapping_id,
                    "name": (aggregation or {}).get("name"),
                    "records": (aggregation or {}).get("records"),
                    "aggregated_at": (aggregation or {}).get("aggregated_at"),
                },
                "interval": (aggregation or {}).get("interval", {}),
                "fields": (aggregation or {}).get("fields", {}),
                "carried_over": (aggregation or {}).get("carried_over", []),
                # What the module was actually handed, after aggregation.
                "aggregate": {
                    key: value
                    for key, value in (weatherdata or {}).items()
                    if key != const.MAPPING_DATA_MULTIPLIER
                },
                "forecast_records": len(forecastdata) if forecastdata else 0,
            },
            # The hourly sum does not call the module, whose last trace would
            # then describe some earlier calculation instead of this one.
            "module": (
                {
                    "form": "hourly",
                    "reference_et": values["hourly"][0],
                    "hours": values["hourly"][1],
                }
                if values.get("hourly") is not None
                else getattr(modinst, "last_trace", None)
            ),
            "outputs": {
                "et_deficiency": values.get("et_deficiency"),
                "hour_multiplier": values.get("hour_multiplier"),
                "precipitation": values.get("precipitation"),
                "delta": values.get("delta"),
                "bucket_before": values.get("bucket_before"),
                "bucket_plus_delta_capped": values.get("bucket_plus_delta_capped"),
                "maximum_bucket": values.get("maximum_bucket"),
                "drainage_rate": values.get("drainage_rate"),
                "drainage": values.get("drainage"),
                "bucket_after": values.get("bucket_after"),
                "precipitation_rate": values.get("precipitation_rate"),
                "throughput": throughput,
                "size": values.get("size"),
                "duration": duration,
                "volume_m3": volume_m3,
            },
        }
        return record

    async def _async_write_calc_record(self, calc_data, dry_run=False) -> None:
        """Write the pending audit record, completed with the stored values."""
        record = getattr(self, "_pending_calc_record", None)
        self._pending_calc_record = None
        if record is None:
            return
        record["dry_run"] = dry_run
        if calc_data:
            # After seasonal adjustments: what the zone is updated with (would
            # be, on a dry run), in the user's unit system. Only the keys the
            # calculation produced -- a multiplier here means a seasonal
            # adjustment changed it, which is exactly what one looks for on a
            # surprising day.
            record["outputs"]["final"] = {
                key: calc_data[key]
                for key in (
                    const.ZONE_DURATION,
                    const.ZONE_MULTIPLIER,
                    const.ZONE_BUCKET,
                    const.ZONE_DELTA,
                    const.ZONE_ET_DEFICIENCY,
                )
                if key in calc_data
            }
        await self.calc_logger.async_log(record)

    def duration_from_bucket(self, zone: dict, bucket_native: float) -> float:
        """Duration (seconds) implied by a zone's current bucket value.

        Mirrors the bucket -> duration maths in ``calculate_module`` so callers
        that move the bucket outside a full calculation (observed watering
        crediting the bucket, #772) can refresh the zone duration consistently.
        A bucket at or above zero means no irrigation is needed, so 0.

        ``bucket_native`` is in mm, like the stored ``ZONE_BUCKET``.
        """
        bucket_mm = bucket_native
        if bucket_mm >= 0:
            return 0
        # Below the allowed depletion there is nothing to do yet, so that the
        # water builds up into one deep run instead of a trickle every day.
        if abs(bucket_mm) < self.irrigation_threshold_mm(zone):
            return 0

        precipitation_rate, _tput, _sz = self._zone_precipitation_rate(zone)
        if not precipitation_rate:
            return 0
        duration = abs(bucket_mm) / precipitation_rate * 3600
        # No crop factor here: it is applied to the evapotranspiration that fills
        # the bucket, so the bucket handed in already carries it (#779).

        maximum_duration = zone.get(const.ZONE_MAXIMUM_DURATION)
        if (
            maximum_duration is not None
            and maximum_duration >= 0
            and duration > maximum_duration
        ):
            duration = maximum_duration

        if duration > 0.0:
            duration = round(zone.get(const.ZONE_LEAD_TIME) + duration)
        return duration
