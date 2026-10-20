"""A weather entity of Home Assistant as the weather service.

Many people already have their national weather service in Home Assistant
(DWD, Met.no, KNMI, the NWS, ...), or a station of their own with a forecast.
This client reads the current values from that entity's attributes and the
forecast through ``weather.get_forecasts``, so Smart Irrigation needs no API key
and no second provider, and skips a run on the forecast the user sees.

What a weather entity does not have is not invented here:

- No rain that fell. The entity has no measured precipitation, only a forecast,
  and a forecast never becomes rain in the water balance. Rain comes from a
  sensor (a gauge, or a rain sensor of the same integration).
- No solar radiation and no reference ET. The coordinator wraps this client in
  the Open-Meteo fallback for those, as it does for OWM and Pirate Weather.
- No history. The hourly calculation finds no history here and falls back as it
  does with any service that keeps none.

The entity's values are in the units Home Assistant shows them in, named by its
``*_unit`` attributes, and are converted here to what the calculation works in:
°C, hPa at the site, m/s at 2 m, mm.

The methods are called from the executor, as for the other clients. The forecast
is a service call on the event loop, so they hand it to the loop and wait.
"""

import asyncio
import datetime
import logging
import math
import threading

from homeassistant.const import (
    UnitOfPrecipitationDepth,
    UnitOfPressure,
    UnitOfSpeed,
    UnitOfTemperature,
)
from homeassistant.util import dt as dt_util
from homeassistant.util.unit_conversion import (
    DistanceConverter,
    PressureConverter,
    SpeedConverter,
    TemperatureConverter,
)

from ..const import (
    MAPPING_DEWPOINT,
    MAPPING_HUMIDITY,
    MAPPING_MAX_TEMP,
    MAPPING_MIN_TEMP,
    MAPPING_PRECIPITATION,
    MAPPING_PRESSURE,
    MAPPING_TEMPERATURE,
    MAPPING_WINDSPEED,
)
from .atmosphere import sea_level_to_station_pressure

_LOGGER = logging.getLogger(__name__)

# WeatherEntityFeature: which forecasts the entity offers.
FORECAST_DAILY = 1
FORECAST_HOURLY = 2
FORECAST_TWICE_DAILY = 4

# How long a forecast is kept when no cache window has been set: the entity's
# forecast changes at most every few minutes, and the panel asks often.
DEFAULT_FORECAST_CACHE_SECONDS = 600
SERVICE_TIMEOUT_SECONDS = 30
SECONDS_PER_HOUR = 3600

# A weather service reports the wind at the standard height of 10 m (WMO); the
# equations want it at 2 m (FAO-56 Eq. 47).
WIND_10M_TO_2M = 4.87 / math.log(67.8 * 10 - 5.42)


def _number(value):
    """A float, or None for anything that is not a number (booleans included)."""
    if isinstance(value, bool):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(number) or math.isinf(number):
        return None
    return number


class HAWeatherEntityClient:  # pylint: disable=invalid-name
    """A Home Assistant weather entity, read as a weather service."""

    def __init__(
        self,
        hass,
        entity_id,
        elevation,
        cache_seconds=0,
        override_cache=False,
    ) -> None:
        """Init."""
        self.hass = hass
        self.entity_id = (entity_id or "").strip()
        self.elevation = elevation
        # Set by the coordinator to its update interval, as for the others.
        self.cache_seconds = cache_seconds
        self.override_cache = override_cache
        self._forecasts = {}
        self._fetched_at = {}
        self._cached_rows = None

    # The entity

    def _state(self):
        """The entity's state, or an OSError saying why it cannot be read."""
        state = self.hass.states.get(self.entity_id)
        if state is None:
            raise OSError(f"Weather entity {self.entity_id} does not exist")
        if state.state in (None, "", "unknown", "unavailable"):
            raise OSError(f"Weather entity {self.entity_id} is {state.state}")
        return state

    def _units(self, attributes):
        """The units the entity's values are in, by its own attributes."""
        return {
            "temperature": attributes.get("temperature_unit")
            or self.hass.config.units.temperature_unit,
            "pressure": attributes.get("pressure_unit") or UnitOfPressure.HPA,
            "wind": attributes.get("wind_speed_unit")
            or UnitOfSpeed.KILOMETERS_PER_HOUR,
            "precipitation": attributes.get("precipitation_unit")
            or UnitOfPrecipitationDepth.MILLIMETERS,
        }

    def _temperature(self, value, units):
        value = _number(value)
        if value is None:
            return None
        return TemperatureConverter.convert(
            value, units["temperature"], UnitOfTemperature.CELSIUS
        )

    def _pressure_at_site(self, value, units):
        """The pressure at the site, from the sea-level pressure a service reports."""
        value = _number(value)
        if value is None:
            return None
        hpa = PressureConverter.convert(value, units["pressure"], UnitOfPressure.HPA)
        return sea_level_to_station_pressure(hpa, self.elevation)

    def _wind_at_two_metres(self, value, units):
        value = _number(value)
        if value is None:
            return None
        metres_per_second = SpeedConverter.convert(
            value, units["wind"], UnitOfSpeed.METERS_PER_SECOND
        )
        return metres_per_second * WIND_10M_TO_2M

    def _precipitation(self, value, units):
        value = _number(value)
        if value is None:
            return None
        return DistanceConverter.convert(
            value, units["precipitation"], UnitOfPrecipitationDepth.MILLIMETERS
        )

    def _values(self, source, units, keys):
        """The fields of one reading or one forecast entry, converted."""
        values = {}
        converters = {
            MAPPING_TEMPERATURE: lambda: self._temperature(
                source.get("temperature"), units
            ),
            MAPPING_DEWPOINT: lambda: self._temperature(source.get("dew_point"), units),
            MAPPING_HUMIDITY: lambda: _number(source.get("humidity")),
            MAPPING_PRESSURE: lambda: self._pressure_at_site(
                source.get("pressure"), units
            ),
            MAPPING_WINDSPEED: lambda: self._wind_at_two_metres(
                source.get("wind_speed"), units
            ),
        }
        for key in keys:
            value = converters[key]()
            if value is not None:
                values[key] = value
        return values

    def get_data(self):
        """The current values, from the entity's attributes.

        Temperature, humidity, pressure, wind and dew point, those the entity
        has. No rain: see the module's docstring.
        """
        state = self._state()
        attributes = dict(state.attributes)
        units = self._units(attributes)
        data = self._values(
            attributes,
            units,
            (
                MAPPING_TEMPERATURE,
                MAPPING_DEWPOINT,
                MAPPING_HUMIDITY,
                MAPPING_PRESSURE,
                MAPPING_WINDSPEED,
            ),
        )
        if MAPPING_TEMPERATURE not in data:
            raise OSError(f"Weather entity {self.entity_id} reports no temperature")
        return data

    # The forecast

    def _supported(self):
        try:
            return int(self._state().attributes.get("supported_features") or 0)
        except (TypeError, ValueError):
            return 0

    def _call_on_loop(self, coro):
        """Run a coroutine on Home Assistant's loop from the executor, and wait."""
        if getattr(self.hass, "loop_thread_id", None) == threading.get_ident():
            coro.close()
            raise RuntimeError("The weather entity client must run in the executor")
        future = asyncio.run_coroutine_threadsafe(coro, self.hass.loop)
        return future.result(SERVICE_TIMEOUT_SECONDS)

    def _forecast(self, kind):
        """The entity's forecast of one kind ("daily", "hourly", "twice_daily").

        Kept for the cache window, so one update cycle asks once. None when the
        entity offers no such forecast or it cannot be read.
        """
        now = datetime.datetime.now()
        window = self.cache_seconds or DEFAULT_FORECAST_CACHE_SECONDS
        if (
            not self.override_cache
            and kind in self._forecasts
            and now < self._fetched_at[kind] + datetime.timedelta(seconds=window)
        ):
            return self._forecasts[kind]
        try:
            response = self._call_on_loop(
                self.hass.services.async_call(
                    "weather",
                    "get_forecasts",
                    {"entity_id": self.entity_id, "type": kind},
                    blocking=True,
                    return_response=True,
                )
            )
        except Exception as ex:  # noqa: BLE001 - the caller treats None as "none"
            _LOGGER.warning(
                "Could not read the %s forecast of %s: %s", kind, self.entity_id, ex
            )
            return None
        forecast = ((response or {}).get(self.entity_id) or {}).get("forecast")
        if not isinstance(forecast, list):
            return None
        self._forecasts[kind] = forecast
        self._fetched_at[kind] = now
        return forecast

    @staticmethod
    def _local(stamp):
        moment = dt_util.parse_datetime(stamp) if isinstance(stamp, str) else stamp
        if not isinstance(moment, datetime.datetime):
            return None
        if moment.tzinfo is None:
            moment = moment.replace(tzinfo=dt_util.get_default_time_zone())
        return dt_util.as_local(moment)

    def _days(self, forecast, units):
        """One row per local day, from entries of one day, half a day or an hour.

        A daily entry is a day already. Shorter ones are folded into their day:
        the highest and lowest temperature, the rain summed, the rest averaged,
        and the highest probability of rain, as the daily ones give it. A day an
        hourly forecast only starts in (the rest of today) holds those hours, so
        its rain is what is still to fall that day.
        """
        days = {}
        for entry in forecast:
            if not isinstance(entry, dict):
                continue
            moment = self._local(entry.get("datetime"))
            if moment is None:
                continue
            day = days.setdefault(
                moment.date().isoformat(),
                {"highs": [], "lows": [], "rain": [], "chance": [], "means": {}},
            )
            high = self._temperature(entry.get("temperature"), units)
            low = self._temperature(entry.get("templow"), units)
            if high is not None:
                day["highs"].append(high)
                day["lows"].append(low if low is not None else high)
            elif low is not None:
                day["lows"].append(low)
            rain = self._precipitation(entry.get("precipitation"), units)
            if rain is not None:
                day["rain"].append(rain)
            chance = _number(entry.get("precipitation_probability"))
            if chance is not None:
                day["chance"].append(chance)
            for key, value in self._values(
                entry,
                units,
                (
                    MAPPING_DEWPOINT,
                    MAPPING_HUMIDITY,
                    MAPPING_PRESSURE,
                    MAPPING_WINDSPEED,
                ),
            ).items():
                day["means"].setdefault(key, []).append(value)
        rows = []
        for date in sorted(days):
            day = days[date]
            row = {"date": date}
            if day["highs"]:
                row[MAPPING_MAX_TEMP] = max(day["highs"])
            if day["lows"]:
                row[MAPPING_MIN_TEMP] = min(day["lows"])
            if MAPPING_MAX_TEMP in row and MAPPING_MIN_TEMP in row:
                row[MAPPING_TEMPERATURE] = (
                    row[MAPPING_MAX_TEMP] + row[MAPPING_MIN_TEMP]
                ) / 2
            row[MAPPING_PRECIPITATION] = sum(day["rain"])
            if day["chance"]:
                row["precipitation_probability"] = max(day["chance"])
            for key, values in day["means"].items():
                row[key] = sum(values) / len(values)
            rows.append(row)
        return rows

    def _daily_rows(self):
        """The forecast as daily rows, from the best kind the entity offers."""
        supported = self._supported()
        units = self._units(dict(self._state().attributes))
        for flag, kind in (
            (FORECAST_DAILY, "daily"),
            (FORECAST_TWICE_DAILY, "twice_daily"),
            (FORECAST_HOURLY, "hourly"),
        ):
            if supported & flag:
                forecast = self._forecast(kind)
                if forecast:
                    return self._days(forecast, units)
        return None

    def get_forecast_data(self, include_today=False):
        """The coming days, today first when ``include_today``, else from tomorrow.

        Each row carries its ``date``, so a forecast that starts tomorrow is
        never read as today. None when the entity has no forecast.
        """
        rows = self._daily_rows()
        self._cached_rows = rows
        if not rows:
            return None
        return rows if include_today else self._from_tomorrow(rows)

    @staticmethod
    def _from_tomorrow(rows):
        today = dt_util.now().date().isoformat()
        return [row for row in rows if row.get("date", today) > today]

    def get_cached_forecast_data(self):
        """The last forecast read, from tomorrow, without asking the entity again."""
        rows = self._cached_rows
        if not rows:
            return None
        return self._from_tomorrow(rows)

    def get_expected_rain_ahead(self, start, end):
        """The rain to expect between two moments, in mm, or None.

        From the hourly forecast, when the entity has one: each hour's
        millimetres weighted by its probability when it gives one, and an hour
        only partly inside the window counted for the share that is (as the
        Open-Meteo client does). An entry is the hour starting at its time.
        None when there is no hourly forecast or it does not reach the end of
        the window: the caller then reads the daily forecast.
        """
        try:
            start_ts = start.timestamp()
            end_ts = end.timestamp()
        except (AttributeError, TypeError, ValueError, OverflowError):
            return None
        if end_ts <= start_ts:
            return 0.0
        if not self._supported() & FORECAST_HOURLY:
            return None
        forecast = self._forecast("hourly")
        if not forecast:
            return None
        units = self._units(dict(self._state().attributes))
        series = []
        for entry in forecast:
            if not isinstance(entry, dict):
                continue
            moment = self._local(entry.get("datetime"))
            rain = self._precipitation(entry.get("precipitation"), units)
            if moment is None or rain is None:
                continue
            chance = _number(entry.get("precipitation_probability"))
            if chance is not None:
                rain *= min(100.0, max(0.0, chance)) / 100.0
            series.append((moment.timestamp(), rain))
        if not series or series[-1][0] + SECONDS_PER_HOUR < end_ts:
            return None
        total = 0.0
        for hour_start, rain in series:
            overlap = min(end_ts, hour_start + SECONDS_PER_HOUR) - max(
                start_ts, hour_start
            )
            if overlap > 0:
                total += rain * overlap / SECONDS_PER_HOUR
        return total
