"""Client to talk to the Open-Meteo API."""  # pylint: disable=invalid-name

import datetime
import json
import logging
import math
import sys
import time

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
    "precipitation_probability_max",
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
# Open-Meteo serves 16 days of forecast at most.
MAX_FORECAST_DAYS = 16
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
        # Hourly radiation history, see get_hourly_radiation.
        self._radiation_series = None
        self._radiation_fetched_at = datetime.datetime(1900, 1, 1, 0, 0, 0)
        self._radiation_covers_from = math.inf
        # Hourly rain forecast, see get_expected_rain_ahead.
        self._rain_ahead_series = None
        self._rain_ahead_fetched_at = datetime.datetime(1900, 1, 1, 0, 0, 0)
        # Hourly reference ET history, see get_hourly_et0.
        self._et0_series = None
        self._et0_fetched_at = datetime.datetime(1900, 1, 1, 0, 0, 0)
        self._et0_covers_from = math.inf
        # Hourly forecast, see get_hourly_forecast.
        self._forecast_series = None
        self._forecast_fetched_at = datetime.datetime(1900, 1, 1, 0, 0, 0)
        self._forecast_days = 0

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
        """GET the forecast endpoint, retrying; the decoded response or None.

        Retried only when another try can help: a timeout, a server error or
        a rate limit, and after a growing pause. Retrying at once hit a rate
        limit again straight away, and a request error cannot change.
        """
        req = None
        for attempt in range(RETRY_TIMES):
            try:
                req = requests.get(OpenMeteo_URL, params=params, timeout=60)
            except requests.RequestException as ex:
                req = None
                _LOGGER.warning("Open-Meteo request failed: %s", ex)
            else:
                if req.status_code == 200:
                    break
                if req.status_code < 500 and req.status_code != 429:
                    break
            if attempt < RETRY_TIMES - 1:
                time.sleep(2**attempt)
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
            # Today's daily *precipitation* total is deliberately not reported
            # here. It is a forecast for the part of the day that has not
            # happened yet, and feeding it to the water balance credited rain
            # before it fell (#787). The water balance reads the hourly history
            # instead (see get_precipitation_between), and falls back to
            # integrating Current Precipitation above (#764). The daily total is
            # still used where a forecast is what is wanted, in
            # get_forecast_data and the precipitation-skip check.
            #
            # The daily reference evapotranspiration is different and is
            # reported: it is the only way this service can answer a zone whose
            # evapotranspiration is "provided", the sensor group offers the
            # field as coming from the weather service, and it was never
            # recorded -- so that method could not work at all with Open-Meteo,
            # and such a zone was simply never calculated (#847). It is a rate
            # per day, which is what the engine consumes, and unlike a depth of
            # rain a partly-forecast rate is not double counted by anything.
            et0 = self._today(doc, "et0_fao_evapotranspiration")
            if et0 is not None:
                parsed_data[MAPPING_EVAPOTRANSPIRATION] = et0
            self._cached_doc = doc
            return parsed_data
        except (KeyError, requests.RequestException, json.JSONDecodeError) as ex:
            _LOGGER.warning("Error reading current data from Open-Meteo: %s", ex)
            return None

    @staticmethod
    def _today(doc, field):
        """Today's value of a daily field, or None if the block does not have it.

        The daily block starts at today, because the request asks for no past
        days; a response that ever changed that would give the wrong day rather
        than no day, so the date is checked.

        The main request asks for no time format, so the API dates the block
        in ISO ("2026-09-28"), in the location's own time zone. Reading that as
        a unix timestamp failed on every real response and the value was never
        taken. Today is therefore today at the location, from the offset the
        response carries, not the date of the machine's clock, which a Docker
        container left on UTC puts on another day for hours each night.
        """
        daily = (doc or {}).get("daily") or {}
        values = daily.get(field)
        times = daily.get("time")
        if not values or not times:
            return None
        first = times[0]
        try:
            if isinstance(first, str):
                day = datetime.date.fromisoformat(first[:10])
            else:
                day = datetime.datetime.fromtimestamp(float(first)).date()
        except (TypeError, ValueError, OSError):
            return None
        offset = doc.get("utc_offset_seconds")
        if isinstance(offset, (int, float)):
            today = (
                datetime.datetime.now(datetime.UTC) + datetime.timedelta(seconds=offset)
            ).date()
        else:
            today = datetime.date.today()
        if day != today:
            return None
        return values[0]

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

    def get_hourly_radiation(self, start, end):
        """The sun of each hour between two moments, in MJ/m2/h, or None.

        Keyed by the hour's start as a unix timestamp, which is how the hourly
        equation asks for it: one value per clock hour, the mean over that hour.
        Open-Meteo stamps its radiation with the END of the hour it averages
        ("average of the preceding hour"): the value stamped 15:00 is the mean
        of 14:00 to 15:00, which is what the sun at the first hours of the day
        says (2 W/m2 stamped 08:00, 56 stamped 09:00, at a sunrise a little
        before 08:00). Read as the hour that starts at its stamp, every hour of
        sun came an hour late (#879).

        This is what lets an installation without a radiation sensor calculate
        hour by hour. Estimating the sun of one hour from the day's
        temperatures is a guess, but Open-Meteo actually measures and models
        it, so the hourly equation gets the driving term it needs.

        ``start`` and ``end`` are datetimes; naive ones are local time. None
        means the history could not be read, and the caller keeps the daily
        equation rather than invent an hour's sun.
        """
        try:
            start_ts = start.timestamp()
            end_ts = end.timestamp()
        except (AttributeError, TypeError, ValueError, OverflowError):
            return None
        if end_ts <= start_ts:
            return {}
        series = self._hourly_radiation(start_ts)
        if series is None:
            return None
        # W/m2 is a rate, so an hour of it is W/m2 * 3600 s = J, and
        # 1 W/m2 over an hour is 0.0036 MJ/m2.
        return {
            hour_start: watts * SECONDS_PER_HOUR / 1_000_000
            for hour_start, watts in series
            # The hour that starts before the window ends has sun in it.
            if start_ts - SECONDS_PER_HOUR < hour_start < end_ts
        }

    def _hourly_radiation(self, since_ts):
        """Return (hour start as unix time, W/m2) pairs from ``since_ts`` on."""
        now = datetime.datetime.now()
        if (
            self._radiation_series is not None
            and now
            < self._radiation_fetched_at
            + datetime.timedelta(seconds=PRECIPITATION_CACHE_SECONDS)
            and self._radiation_covers_from <= since_ts
        ):
            return self._radiation_series

        past_seconds = max(0.0, now.timestamp() - since_ts)
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "hourly": "shortwave_radiation",
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
            # The stamp is the end of the hour averaged: the hour starts an
            # hour earlier.
            series = [
                (float(stamp) - SECONDS_PER_HOUR, float(watts or 0.0))
                for stamp, watts in zip(
                    hourly["time"], hourly["shortwave_radiation"], strict=False
                )
            ]
        except (KeyError, TypeError, ValueError, requests.RequestException) as ex:
            _LOGGER.warning("Error reading hourly radiation from Open-Meteo: %s", ex)
            return None
        if not series:
            return None
        self._radiation_series = series
        self._radiation_fetched_at = now
        self._radiation_covers_from = series[0][0]
        return series

    # The fields an hourly FAO-56 row is built from, as Open-Meteo names them.
    _FORECAST_HOURLY_VARS = (
        "temperature_2m",
        "relative_humidity_2m",
        "wind_speed_10m",
        "shortwave_radiation",
        "surface_pressure",
    )

    def get_hourly_forecast(self, days):
        """The coming ``days`` days, hour by hour, or None.

        A list of dicts, one per hour, carrying the hour's start as a unix
        timestamp and the fields the hourly equation prices: temperature in C,
        humidity in %, wind in m/s, the hour's sun in MJ/m2 and the pressure in
        hPa. Today is left out: the hours that have already happened are in the
        sensor group's own history, and the ones to come belong to today's own
        balance, not to a forecast day.

        This is what lets a zone that looks ahead stay on the hourly equation.
        Averaging a forecast day computed from its daily means back into an
        hourly sum would put the bias the hourly form removes straight back in.
        """
        try:
            days = int(days)
        except (TypeError, ValueError):
            return None
        if days <= 0:
            return []
        # Every zone that looks ahead asks within moments of the others, and
        # the live estimate asks again: one fetch serves them all.
        now = datetime.datetime.now()
        if (
            self._forecast_series is not None
            and self._forecast_days >= days
            and now
            < self._forecast_fetched_at
            + datetime.timedelta(seconds=PRECIPITATION_CACHE_SECONDS)
        ):
            return self._forecast_series
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "hourly": ",".join(self._FORECAST_HOURLY_VARS),
            "wind_speed_unit": "ms",
            "temperature_unit": "celsius",
            "timezone": "GMT",
            "timeformat": "unixtime",
            "past_days": 0,
            # The day that is running now, plus the days asked for.
            "forecast_days": min(MAX_FORECAST_DAYS, days + 1),
        }
        try:
            doc = self._request(params)
            if doc is None:
                return None
            hourly = doc["hourly"]
            stamps = hourly["time"]
            out = []
            for index, stamp in enumerate(stamps):
                row = {"ts": float(stamp)}
                for key, name in (
                    ("temperature", "temperature_2m"),
                    ("humidity", "relative_humidity_2m"),
                    ("wind", "wind_speed_10m"),
                ):
                    value = hourly[name][index]
                    if value is None:
                        return None
                    row[key] = float(value)
                # The equation wants the wind at 2 m, and every other Open-Meteo
                # path converts it (FAO-56 Eq. 47). Taken as it came, the 10 m
                # figure raised the wind of every forecast day by about a third.
                row["wind"] *= WIND_10M_TO_2M
                # The radiation stamped at the end of an hour is that hour's
                # mean (see get_hourly_radiation): the sun of the hour that
                # starts at this stamp is the next value. The last hour has no
                # next one, and keeps its own.
                sun = hourly["shortwave_radiation"]
                watts = sun[index + 1] if index + 1 < len(sun) else sun[index]
                row["solar_mj_h"] = float(watts or 0.0) * SECONDS_PER_HOUR / 1_000_000
                pressure = hourly.get("surface_pressure", [None] * len(stamps))[index]
                if pressure is not None:
                    row["pressure_hpa"] = float(pressure)
                out.append(row)
        except (
            KeyError,
            IndexError,
            TypeError,
            ValueError,
            requests.RequestException,
        ) as ex:
            _LOGGER.warning("Error reading the hourly forecast from Open-Meteo: %s", ex)
            return None
        self._forecast_series = out
        self._forecast_fetched_at = now
        self._forecast_days = days
        return out

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

    def get_expected_rain_ahead(self, start, end):
        """The rain to expect between two moments, in mm, or None.

        From Open-Meteo's hourly forecast, each hour's millimetres weighted by
        its probability when it gives one, as the skip guard weights its days:
        10 mm at 30% is not 10 mm. Each value is the rain of the hour ending at
        its timestamp, and an hour only partly inside the window counts for the
        share that is. The window is measured from ``start``, the moment the run
        begins, not from the calculation hours earlier: rain that falls between
        the two is accounted for by the rain already measured.

        None means the forecast could not be read, or does not reach the end of
        the window, and the caller leaves the run as calculated rather than
        credit a part of the window as if it were all of it.
        """
        try:
            start_ts = start.timestamp()
            end_ts = end.timestamp()
        except (AttributeError, TypeError, ValueError, OverflowError):
            return None
        if end_ts <= start_ts:
            return 0.0
        series = self._hourly_rain_ahead()
        if not series or series[-1][0] < end_ts:
            return None
        total = 0.0
        for hour_end, expected in series:
            overlap = min(end_ts, hour_end) - max(start_ts, hour_end - SECONDS_PER_HOUR)
            if overlap > 0:
                total += expected * overlap / SECONDS_PER_HOUR
        return total

    def _hourly_rain_ahead(self):
        """Return (hour end as unix time, expected mm) pairs, or None."""
        now = datetime.datetime.now()
        if (
            self._rain_ahead_series is not None
            and now
            < self._rain_ahead_fetched_at
            + datetime.timedelta(seconds=PRECIPITATION_CACHE_SECONDS)
        ):
            return self._rain_ahead_series
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "hourly": "precipitation,precipitation_probability",
            "precipitation_unit": "mm",
            "timezone": "GMT",
            "timeformat": "unixtime",
            "forecast_days": 3,
        }
        try:
            doc = self._request(params)
            if doc is None:
                return None
            hourly = doc["hourly"]
            probabilities = hourly.get("precipitation_probability") or []
            series = []
            for index, (hour_end, amount) in enumerate(
                zip(hourly["time"], hourly["precipitation"], strict=False)
            ):
                millimetres = float(amount or 0.0)
                probability = (
                    probabilities[index] if index < len(probabilities) else None
                )
                if probability is not None:
                    millimetres *= min(100.0, max(0.0, float(probability))) / 100.0
                series.append((float(hour_end), millimetres))
        except (KeyError, TypeError, ValueError, requests.RequestException) as ex:
            _LOGGER.warning("Error reading the rain forecast from Open-Meteo: %s", ex)
            return None
        if not series:
            return None
        self._rain_ahead_series = series
        self._rain_ahead_fetched_at = now
        return series

    def get_hourly_et0(self, start, end):
        """The reference ET Open-Meteo quotes between two moments, in mm, or None.

        Summed from its hourly ``et0_fao_evapotranspiration``, where each value
        is the ET of the hour ending at its timestamp (the convention of the
        hourly rain). An hour that only partly lies in the window counts for
        the share that does, so the sum grows smoothly through the hour still
        under way instead of stepping on the hour.

        This is what lets a zone whose ET is *provided* follow the day: the
        daily total spread evenly over the elapsed time falls at a constant
        rate, night included. ``start`` and ``end`` are datetimes; naive ones
        are local time. None means the history could not be read, and the
        caller keeps the daily figure rather than invent an hour's ET.
        """
        try:
            start_ts = start.timestamp()
            end_ts = end.timestamp()
        except (AttributeError, TypeError, ValueError, OverflowError):
            return None
        if end_ts <= start_ts:
            return 0.0
        series = self._hourly_et0(start_ts)
        if series is None:
            return None
        total = 0.0
        for hour_end, amount in series:
            overlap = min(end_ts, hour_end) - max(start_ts, hour_end - SECONDS_PER_HOUR)
            if overlap > 0:
                total += amount * overlap / SECONDS_PER_HOUR
        return total

    def _hourly_et0(self, since_ts):
        """Return (hour end as unix time, mm) pairs from ``since_ts`` on, or None."""
        now = datetime.datetime.now()
        if (
            self._et0_series is not None
            and now
            < self._et0_fetched_at
            + datetime.timedelta(seconds=PRECIPITATION_CACHE_SECONDS)
            and self._et0_covers_from <= since_ts
        ):
            return self._et0_series

        past_seconds = max(0.0, now.timestamp() - since_ts)
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "hourly": "et0_fao_evapotranspiration",
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
                    hourly["time"], hourly["et0_fao_evapotranspiration"], strict=False
                )
            ]
        except (KeyError, TypeError, ValueError, requests.RequestException) as ex:
            _LOGGER.warning("Error reading hourly ET0 from Open-Meteo: %s", ex)
            return None
        if not series:
            return None
        self._et0_series = series
        self._et0_fetched_at = now
        self._et0_covers_from = series[0][0] - SECONDS_PER_HOUR
        return series

    def get_cached_forecast_data(self):
        """The daily forecast from the last response, without asking again.

        For the live estimate, which runs on every refresh of a display and
        must not spend a request each time: the forecast is fetched with every
        hourly reading, so the last one is at most an interval old. None when
        nothing has been fetched yet.
        """
        if self._cached_doc is None:
            return None
        return self.get_forecast_data(cached_only=True)

    def get_forecast_data(self, include_today=False, cached_only=False):
        """Return a list of daily forecast dicts, keyed by MAPPING_* constants.

        By default today (index 0) is dropped so the list starts at tomorrow,
        matching the PyETO forecast semantics. Pass ``include_today=True`` (the
        precipitation-skip check) to keep today at index 0. See #775.
        ``cached_only`` reads the last response and never fetches.
        """
        try:
            doc = self._cached_doc if cached_only else self._get_doc()
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
                # The day this forecast is for, so a caller can label it: the
                # panel shows a strip of days and cannot count them itself, a
                # request can be served from a cache made yesterday.
                parsed_data = {"date": day}
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
                # How likely that rain is, in %, for the forecast skip.
                probability = daily.get("precipitation_probability_max", [])
                if i < len(probability) and probability[i] is not None:
                    parsed_data["precipitation_probability"] = probability[i]
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
                # The day's mean wind, as the evaporation needs, where the
                # hourly series has it: wind_speed_10m_max is the strongest
                # gust hour of the day, and fed as the day's wind it raised
                # the forecast evaporation of every forecast day.
                if "wind" in means:
                    parsed_data[MAPPING_WINDSPEED] = means["wind"] * WIND_10M_TO_2M
                parsed_data_total.append(parsed_data)
            return parsed_data_total if include_today else parsed_data_total[1:]
        except (KeyError, requests.RequestException, json.JSONDecodeError) as ex:
            _LOGGER.warning("Error reading forecast data from Open-Meteo: %s", ex)
            return None

    def _hourly_daily_means(self, doc):
        """Average the hourly humidity/pressure/dew point/wind per calendar day."""
        hourly = doc.get("hourly")
        if not hourly or "time" not in hourly:
            return {}
        times = hourly["time"]
        fields = {
            "humidity": hourly.get("relative_humidity_2m"),
            "pressure": hourly.get("surface_pressure"),
            "dewpoint": hourly.get("dew_point_2m"),
            "wind": hourly.get("wind_speed_10m"),
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
