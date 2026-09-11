"""Client to talk to the Open-Meteo API."""  # pylint: disable=invalid-name

import datetime
import json
import logging
import math
import sys

import requests

# DO NOT USE THESE FOR TESTING, INSTEAD DEFINE THE CONSTS IN THIS FILE
from ..const import (
    MAPPING_CURRENT_PRECIPITATION,
    MAPPING_DEWPOINT,
    MAPPING_EVAPOTRANSPIRATION,
    MAPPING_HUMIDITY,
    MAPPING_MAX_TEMP,
    MAPPING_MIN_TEMP,
    MAPPING_PRECIPITATION,
    MAPPING_PRESSURE,
    MAPPING_SOLRAD,
    MAPPING_TEMPERATURE,
    MAPPING_WINDSPEED,
)

_LOGGER = logging.getLogger(__name__)

# Open-Meteo forecast endpoint. No API key is required for non-commercial use.
OpenMeteo_URL = "https://api.open-meteo.com/v1/forecast"

RETRY_TIMES = 3

# Hourly variables we request (used for "current" snapshot and to derive the
# daily aggregates Open-Meteo does not expose for humidity/pressure/dew point).
OpenMeteo_hourly_vars = [
    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "surface_pressure",
    "wind_speed_10m",
    "precipitation",
    "shortwave_radiation",
]
# Daily variables. shortwave_radiation_sum is in MJ/m² (what pyETO expects),
# and et0_fao_evapotranspiration is FAO-56 reference ET0 in mm.
OpenMeteo_daily_vars = [
    "temperature_2m_max",
    "temperature_2m_min",
    "temperature_2m_mean",
    "wind_speed_10m_max",
    "precipitation_sum",
    "shortwave_radiation_sum",
    "et0_fao_evapotranspiration",
]
OpenMeteo_current_vars = [
    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "surface_pressure",
    "wind_speed_10m",
    "precipitation",
    "shortwave_radiation",
]

# FAO-56 conversion factor from 10 m to 2 m wind speed (same as the other
# clients): u2 = u10 * 4.87 / ln(67.8 * 10 - 5.42).
WIND_10M_TO_2M = 4.87 / math.log((67.8 * 10) - 5.42)

# Convert a mean irradiance in W/m² to a daily energy sum in MJ/m²/day:
# 1 W/m² sustained for a day = 86400 J/m² = 0.0864 MJ/m².
WM2_TO_MJ_PER_DAY = 0.0864

SECONDS_PER_HOUR = 3600
# The "current" block is built from 15-minutely data, and its precipitation is
# the amount over that interval. The response states the length in
# current.interval (seconds); assume 15 minutes if it is ever missing.
CURRENT_INTERVAL_SECONDS_DEFAULT = 900
# The forecast endpoint keeps at most this many days of past hours.
MAX_PAST_DAYS = 92
# A calculation and the live estimate of every zone ask for the hourly
# precipitation within moments of each other, so one fetch is reused this long.
PRECIPITATION_CACHE_SECONDS = 600


def current_precipitation_rate(current):
    """Return the precipitation rate of an Open-Meteo "current" block, in mm/h.

    ``precipitation`` there is the amount over the block's own interval, which
    is 15 minutes, not an hour. Taken as an hourly amount it credited a quarter
    of the rain (#835), so it is scaled to the hour.
    """
    amount = current.get("precipitation") or 0.0
    interval = current.get("interval") or CURRENT_INTERVAL_SECONDS_DEFAULT
    return float(amount) * SECONDS_PER_HOUR / float(interval)


class OpenMeteoClient:  # pylint: disable=invalid-name
    """Open-Meteo Client.

    Mirrors the OWM/PirateWeather client interface (``get_data`` and
    ``get_forecast_data``) so it is a drop-in third weather service. The
    constructor keeps the same signature for compatibility; ``api_key`` and
    ``api_version`` are ignored because Open-Meteo's free tier needs neither.
    """

    def __init__(
        self,
        api_key=None,
        api_version=None,
        latitude=0.0,
        longitude=0.0,
        elevation=0.0,
        cache_seconds=0,
        override_cache=False,
    ) -> None:
        """Init."""
        # api_key / api_version are intentionally unused (no key required).
        self.longitude = longitude
        self.latitude = latitude
        self.elevation = elevation
        self.cache_seconds = cache_seconds
        # The coordinator sets cache_seconds to the update interval, so one fetch
        # per cycle is reused across all intra-cycle lookups (zones, mappings,
        # primary + fallback) instead of hitting the API every time.
        self.override_cache = override_cache
        self._last_time_called = datetime.datetime(1900, 1, 1, 0, 0, 0)
        self._cached_doc = None
        # Hourly precipitation history, see get_precipitation_between.
        self._precipitation_series = None
        self._precipitation_fetched_at = datetime.datetime(1900, 1, 1, 0, 0, 0)
        self._precipitation_covers_from = math.inf

    def _params(self):
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "current": ",".join(OpenMeteo_current_vars),
            "hourly": ",".join(OpenMeteo_hourly_vars),
            "daily": ",".join(OpenMeteo_daily_vars),
            "wind_speed_unit": "ms",  # SI: m/s, like the other clients
            "temperature_unit": "celsius",
            "precipitation_unit": "mm",
            "timezone": "auto",
        }
        # Pass the configured elevation so surface pressure and ET0 match the
        # site instead of Open-Meteo's 90 m DEM default.
        if self.elevation is not None:
            params["elevation"] = self.elevation
        return params

    def _request(self, params):
        """GET the forecast endpoint, retrying; the decoded response or None."""
        req = None
        for _ in range(RETRY_TIMES):
            req = requests.get(OpenMeteo_URL, params=params, timeout=60)
            if req.status_code == 200:
                break
        if req is None or req.status_code != 200:
            _LOGGER.error(
                "Open-Meteo API returned error status code: %s",
                None if req is None else req.status_code,
            )
            return None
        doc = json.loads(req.text)
        _LOGGER.debug("OpenMeteoClient called API %s and received %s", req.url, doc)
        return doc

    def _get_doc(self):
        """Fetch (and cache) the combined current+hourly+daily response."""
        if (
            self._cached_doc is not None
            and not self.override_cache
            and datetime.datetime.now()
            < self._last_time_called + datetime.timedelta(seconds=self.cache_seconds)
        ):
            _LOGGER.info("Returning cached Open-Meteo data")
            return self._cached_doc

        doc = self._request(self._params())
        if doc is None:
            return None
        self._cached_doc = doc
        self._last_time_called = datetime.datetime.now()
        return doc

    def get_data(self):
        """Return the current weather values, keyed by MAPPING_* constants."""
        try:
            doc = self._get_doc()
            if doc is None or "current" not in doc:
                _LOGGER.warning(
                    "Ignoring Open-Meteo input: missing 'current' block in API return"
                )
                return None
            cur = doc["current"]
            parsed_data = {}
            parsed_data[MAPPING_TEMPERATURE] = cur["temperature_2m"]
            parsed_data[MAPPING_HUMIDITY] = cur["relative_humidity_2m"]
            parsed_data[MAPPING_DEWPOINT] = cur["dew_point_2m"]
            # surface_pressure is the actual (absolute) pressure at the site, in hPa
            parsed_data[MAPPING_PRESSURE] = cur["surface_pressure"]
            # wind is reported at 10 m; convert to 2 m for FAO-56
            parsed_data[MAPPING_WINDSPEED] = cur["wind_speed_10m"] * WIND_10M_TO_2M
            # the precipitation of the last 15 minutes, as a rate in mm/h
            parsed_data[MAPPING_CURRENT_PRECIPITATION] = current_precipitation_rate(cur)
            # instantaneous shortwave radiation (W/m²) converted to MJ/m²/day
            if cur.get("shortwave_radiation") is not None:
                parsed_data[MAPPING_SOLRAD] = (
                    cur["shortwave_radiation"] * WM2_TO_MJ_PER_DAY
                )
            # Today's daily total is deliberately not reported here. It is a
            # forecast for the part of the day that has not happened yet, and
            # feeding it to the water balance credited rain before it fell
            # (#787). The water balance reads the hourly history instead (see
            # get_precipitation_between), and falls back to integrating Current
            # Precipitation above (#764). The daily total is still used where a
            # forecast is what is wanted, in get_forecast_data and the
            # precipitation-skip check.
            self._cached_doc = doc
            return parsed_data
        except (KeyError, requests.RequestException, json.JSONDecodeError) as ex:
            _LOGGER.warning("Error reading current data from Open-Meteo: %s", ex)
            return None

    def get_precipitation_between(self, start, end):
        """Return the rain that fell between two moments, in mm, or None.

        Summed from Open-Meteo's hourly precipitation, where each value is the
        rain of the hour ending at its timestamp. An hour is counted when it
        ends after ``start`` and no later than ``end``, so consecutive windows
        count every hour exactly once however often weather data is collected,
        and the hour still under way at ``end`` is left to the next window.

        ``start`` and ``end`` are datetimes; naive ones are local time. None
        means the history could not be read, so the caller can fall back to
        the sampled rate rather than credit no rain at all.
        """
        try:
            start_ts = start.timestamp()
            end_ts = end.timestamp()
        except (AttributeError, TypeError, ValueError, OverflowError):
            return None
        if end_ts <= start_ts:
            return 0.0
        series = self._hourly_precipitation(start_ts)
        if series is None:
            return None
        return float(
            sum(amount for hour_end, amount in series if start_ts < hour_end <= end_ts)
        )

    def _hourly_precipitation(self, since_ts):
        """Return (hour end as unix time, mm) pairs from ``since_ts`` on, or None."""
        now = datetime.datetime.now()
        if (
            self._precipitation_series is not None
            and now
            < self._precipitation_fetched_at
            + datetime.timedelta(seconds=PRECIPITATION_CACHE_SECONDS)
            and self._precipitation_covers_from <= since_ts
        ):
            return self._precipitation_series

        past_seconds = max(0.0, now.timestamp() - since_ts)
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "hourly": "precipitation",
            "precipitation_unit": "mm",
            # Unix timestamps in UTC, so the hours compare directly with the
            # calculation's own moments whatever the site's time zone.
            "timezone": "GMT",
            "timeformat": "unixtime",
            "past_days": min(MAX_PAST_DAYS, math.ceil(past_seconds / 86400) + 1),
            "forecast_days": 1,
        }
        try:
            doc = self._request(params)
            if doc is None:
                return None
            hourly = doc["hourly"]
            series = [
                (float(hour_end), float(amount or 0.0))
                for hour_end, amount in zip(
                    hourly["time"], hourly["precipitation"], strict=False
                )
            ]
        except (KeyError, TypeError, ValueError, requests.RequestException) as ex:
            _LOGGER.warning(
                "Error reading hourly precipitation from Open-Meteo: %s", ex
            )
            return None
        if not series:
            return None
        self._precipitation_series = series
        self._precipitation_fetched_at = now
        self._precipitation_covers_from = series[0][0] - SECONDS_PER_HOUR
        return series

    def get_forecast_data(self, include_today=False):
        """Return a list of daily forecast dicts, keyed by MAPPING_* constants.

        By default today (index 0) is dropped so the list starts at tomorrow,
        matching the PyETO forecast semantics. Pass ``include_today=True`` (the
        precipitation-skip check) to keep today at index 0. See #775.
        """
        try:
            doc = self._get_doc()
            if doc is None or "daily" not in doc:
                _LOGGER.warning(
                    "Ignoring Open-Meteo input: missing 'daily' block in API return"
                )
                return None
            daily = doc["daily"]
            days = daily.get("time", [])
            # hourly means per calendar day for the fields Open-Meteo has no
            # daily aggregate for (humidity, pressure, dew point).
            hourly_means = self._hourly_daily_means(doc)
            parsed_data_total = []
            # parse from index 0 (today) so the precipitation-skip check can see
            # today; today is dropped again on return unless include_today.
            for i in range(0, len(days)):
                day = days[i]
                parsed_data = {}
                tmax = daily["temperature_2m_max"][i]
                tmin = daily["temperature_2m_min"][i]
                parsed_data[MAPPING_MAX_TEMP] = tmax
                parsed_data[MAPPING_MIN_TEMP] = tmin
                mean = daily.get("temperature_2m_mean", [None] * len(days))[i]
                parsed_data[MAPPING_TEMPERATURE] = (
                    mean if mean is not None else (tmax + tmin) / 2.0
                )
                parsed_data[MAPPING_WINDSPEED] = (
                    daily["wind_speed_10m_max"][i] * WIND_10M_TO_2M
                )
                parsed_data[MAPPING_PRECIPITATION] = daily["precipitation_sum"][i]
                # shortwave_radiation_sum is already MJ/m²/day (what pyETO wants)
                if daily.get("shortwave_radiation_sum") is not None:
                    parsed_data[MAPPING_SOLRAD] = daily["shortwave_radiation_sum"][i]
                # FAO-56 reference ET0 in mm (for the Passthrough module)
                if daily.get("et0_fao_evapotranspiration") is not None:
                    parsed_data[MAPPING_EVAPOTRANSPIRATION] = daily[
                        "et0_fao_evapotranspiration"
                    ][i]
                # daily means derived from the hourly arrays
                means = hourly_means.get(day, {})
                if "humidity" in means:
                    parsed_data[MAPPING_HUMIDITY] = means["humidity"]
                if "pressure" in means:
                    parsed_data[MAPPING_PRESSURE] = means["pressure"]
                if "dewpoint" in means:
                    parsed_data[MAPPING_DEWPOINT] = means["dewpoint"]
                parsed_data_total.append(parsed_data)
            return parsed_data_total if include_today else parsed_data_total[1:]
        except (KeyError, requests.RequestException, json.JSONDecodeError) as ex:
            _LOGGER.warning("Error reading forecast data from Open-Meteo: %s", ex)
            return None

    def _daily_value(self, doc, key, index, default):
        """Safely read doc['daily'][key][index]."""
        try:
            return doc["daily"][key][index]
        except (KeyError, IndexError, TypeError):
            return default

    def _hourly_daily_means(self, doc):
        """Average the hourly humidity/pressure/dew point per calendar day."""
        hourly = doc.get("hourly")
        if not hourly or "time" not in hourly:
            return {}
        times = hourly["time"]
        fields = {
            "humidity": hourly.get("relative_humidity_2m"),
            "pressure": hourly.get("surface_pressure"),
            "dewpoint": hourly.get("dew_point_2m"),
        }
        # accumulate sums/counts per day (date prefix of the ISO timestamp)
        acc = {}
        for idx, ts in enumerate(times):
            day = ts[:10]
            bucket = acc.setdefault(day, {})
            for name, series in fields.items():
                if series is None:
                    continue
                val = series[idx] if idx < len(series) else None
                if val is None:
                    continue
                s, c = bucket.get(name, (0.0, 0))
                bucket[name] = (s + val, c + 1)
        return {
            day: {name: s / c for name, (s, c) in names.items() if c}
            for day, names in acc.items()
        }


# for testing call: python OpenMeteoClient [latitude] [longitude] [elevation]
if __name__ == "__main__":
    args = sys.argv[1:]
    client = OpenMeteoClient(
        latitude=args[0], longitude=args[1], elevation=args[2] if len(args) > 2 else 0
    )
    print(client.get_data())  # noqa: T201
    print(client.get_forecast_data())  # noqa: T201
