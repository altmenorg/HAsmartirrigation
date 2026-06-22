"""Client to talk to Pirate Weather API."""  # pylint: disable=invalid-name

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
    MAPPING_HUMIDITY,
    MAPPING_MAX_TEMP,
    MAPPING_MIN_TEMP,
    MAPPING_PRECIPITATION,
    MAPPING_PRESSURE,
    MAPPING_TEMPERATURE,
    MAPPING_WINDSPEED,
)

_LOGGER = logging.getLogger(__name__)

# Open Weather Map URL
PirateWeather_URL = "https://api.pirateweather.net/forecast/{}/{},{}?units={}&version={}&exclude=minutely,hourly,alerts"

RETRY_TIMES = 3
# Required PirateWeather keys for validation
PirateWeather_wind_speed_key_name = "windSpeed"
PirateWeather_pressure_key_name = "pressure"
PirateWeather_humidity_key_name = "humidity"
PirateWeather_temp_key_name = "temperature"
PirateWeather_dew_point_key_name = "dewPoint"
PirateWeather_current_weather_key_name = "currently"
PirateWeather_daily_weather_key_name = "daily"
PirateWeather_max_temp_key_name = "temperatureMax"
PirateWeather_min_temp_key_name = "temperatureMin"
PirateWeather_precip_key_name = "precipAccumulation"
PirateWeather_current_precip_key_name = "precipIntensity"

PirateWeather_required_keys = {
    PirateWeather_wind_speed_key_name,
    PirateWeather_dew_point_key_name,
    PirateWeather_temp_key_name,
    PirateWeather_humidity_key_name,
    PirateWeather_pressure_key_name,
}
PirateWeather_required_keys_daily = {
    PirateWeather_wind_speed_key_name,
    PirateWeather_dew_point_key_name,
    PirateWeather_humidity_key_name,
    PirateWeather_pressure_key_name,
    PirateWeather_max_temp_key_name,
    PirateWeather_min_temp_key_name,
    PirateWeather_precip_key_name,
    PirateWeather_current_precip_key_name,
}

PirateWeather_required_key_temp = {
    PirateWeather_max_temp_key_name,
    PirateWeather_min_temp_key_name,
}

# Validators
PirateWeatherValidators = {
    "windSpeed": {"max": 135, "min": 0},
    "dewPoint": {"max": 35, "min": -21},
    "temperature": {"max": 56.7, "min": -89.2},
    "humidity": {"max": 100, "min": 0},
    "pressure": {"max": 1084.8, "min": 870},
}


class PirateWeatherClient:  # pylint: disable=invalid-name
    """Pirate Weather Client."""

    def __init__(
        self,
        api_key,
        api_version,
        latitude,
        longitude,
        elevation,
        cache_seconds=0,
        override_cache=False,
    ) -> None:
        """Init."""
        self.api_key = api_key.strip().replace(" ", "")
        self.api_version = api_version.strip()  # valid versions: 1 or 2
        self.api_version = 1  # hardcode version to 1
        self.longitude = longitude
        self.latitude = latitude
        self.elevation = elevation
        self.url = PirateWeather_URL.format(
            self.api_key, self.latitude, self.longitude, "si", self.api_version
        )
        # defaults to no cache
        self.cache_seconds = cache_seconds
        self.override_cache = override_cache
        # disabling cache for now
        self.override_cache = True
        self._last_time_called = datetime.datetime(1900, 1, 1, 0, 0, 0)
        self._cached_data = None
        self._cached_forecast_data = None

    def get_forecast_data(self):
        """Validate and return forecast data."""
        if (
            self._cached_forecast_data is None
            or self.override_cache
            or datetime.datetime.now()
            >= self._last_time_called + datetime.timedelta(seconds=self.cache_seconds)
        ):
            try:
                for i in range(RETRY_TIMES):
                    req = requests.get(self.url, timeout=60)  # 60 seconds timeout
                    if req.status_code == 200:
                        break
                    i = i + 1
                if req.status_code != 200:
                    _LOGGER.error(
                        "PirateWeather API returned error status code: %s",
                        req.status_code,
                    )
                    return None
                doc = json.loads(req.text)
                _LOGGER.debug(
                    "PirateWeatherClient get_forecast_data called API %s and received %s",
                    self.url,
                    doc,
                )
                # parse out values from daily
                if PirateWeather_daily_weather_key_name in doc:
                    parsed_data_total = []
                    # get the required values from daily.
                    for x in range(
                        1, len(doc[PirateWeather_daily_weather_key_name]["data"]) - 1
                    ):
                        data = doc[PirateWeather_daily_weather_key_name]["data"][x]
                        parsed_data = {}
                        parsed_data[MAPPING_WINDSPEED] = data[
                            PirateWeather_wind_speed_key_name
                        ] * (4.87 / math.log((67.8 * 10) - 5.42))

                        parsed_data[MAPPING_PRESSURE] = (
                            self.relative_to_absolute_pressure(
                                data[PirateWeather_pressure_key_name],
                                self.elevation,
                            )
                        )

                        parsed_data[MAPPING_HUMIDITY] = (
                            data[PirateWeather_humidity_key_name] * 100.0
                        )  # update since humidity reported by PirateWeather is how reported on a scale from 0-1
                        parsed_data[MAPPING_TEMPERATURE] = (
                            data[PirateWeather_max_temp_key_name]
                            + data[PirateWeather_min_temp_key_name] / 2.0
                        )
                        # also put in min/max here
                        parsed_data[MAPPING_MAX_TEMP] = data[
                            PirateWeather_max_temp_key_name
                        ]
                        parsed_data[MAPPING_MIN_TEMP] = data[
                            PirateWeather_min_temp_key_name
                        ]
                        parsed_data[MAPPING_DEWPOINT] = data[
                            PirateWeather_dew_point_key_name
                        ]
                        # add precip from daily
                        parsed_data[MAPPING_PRECIPITATION] = data[
                            PirateWeather_precip_key_name
                        ]
                        parsed_data_total.append(parsed_data)
                    self._cached_forecast_data = parsed_data_total
                    self._last_time_called = datetime.datetime.now()
                    return parsed_data_total
                _LOGGER.warning(
                    "Ignoring PirateWeather input: missing required key '%s' in PirateWeather API return",
                    PirateWeather_daily_weather_key_name,
                )
                return None
            except requests.RequestException as ex:
                _LOGGER.error("Error reading from PirateWeather: %s", ex)
            except json.JSONDecodeError as ex:
                _LOGGER.error("Error decoding PirateWeather API response: %s", ex)
            else:
                return None
        else:
            # return cached_data
            _LOGGER.info("Returning cached PirateWeather forecastdata")
            return self._cached_forecast_data

    def relative_to_absolute_pressure(self, pressure, height):
        """Convert relative pressure to absolute pressure."""
        # Constants
        g = 9.80665  # m/s^2
        M = 0.0289644  # kg/mol
        R = 8.31447  # J/(mol*K)
        T0 = 288.15  # K

        # Calculate temperature at given height
        temperature = T0 - (g * M * float(height)) / (R * T0)
        # Calculate absolute pressure at given height
        return pressure * (T0 / temperature) ** (g * M / (R * 287))

    def get_data(self):
        """Validate and return data."""
        if (
            self._cached_data is None
            or self.override_cache
            or datetime.datetime.now()
            >= self._last_time_called + datetime.timedelta(seconds=self.cache_seconds)
        ):
            try:
                for i in range(RETRY_TIMES):
                    req = requests.get(self.url, timeout=60)  # 60 seconds timeout
                    if req.status_code == 200:
                        break
                    i = i + 1
                if req.status_code != 200:
                    _LOGGER.error(
                        "PirateWeather API returned error status code: %s",
                        req.status_code,
                    )
                    return None
                doc = json.loads(req.text)
                _LOGGER.debug(
                    "PirateWeatherClient get_data called API %s and received %s",
                    self.url,
                    doc,
                )
                # parse out values for currently and rain/snow from daily[0].
                if (
                    PirateWeather_current_weather_key_name in doc
                    and PirateWeather_daily_weather_key_name in doc
                ):
                    parsed_data = {}
                    # get the required values from currently and daily.
                    data = doc[PirateWeather_current_weather_key_name]
                    for k in PirateWeather_required_keys:
                        if k not in data:
                            self.raiseIOError(k)
                        elif k not in [
                            PirateWeather_wind_speed_key_name,
                            PirateWeather_pressure_key_name,
                        ]:
                            if (
                                data[k] < PirateWeatherValidators[k]["min"]
                                or data[k] > PirateWeatherValidators[k]["max"]
                            ):
                                self.validationError(
                                    k,
                                    data[k],
                                    PirateWeatherValidators[k]["min"],
                                    PirateWeatherValidators[k]["max"],
                                )
                        elif k is PirateWeather_wind_speed_key_name:
                            # PirateWeather reports wind speed at 10m height, so need to convert to 2m:
                            data[PirateWeather_wind_speed_key_name] = data[
                                PirateWeather_wind_speed_key_name
                            ] * (4.87 / math.log((67.8 * 10) - 5.42))
                        elif k is PirateWeather_pressure_key_name:
                            # PirateWeather provides relative pressure, replace it with estimated absolute pressure returning!
                            data[PirateWeather_pressure_key_name] = (
                                self.relative_to_absolute_pressure(
                                    data[PirateWeather_pressure_key_name],
                                    self.elevation,
                                )
                            )
                    parsed_data[MAPPING_WINDSPEED] = data[
                        PirateWeather_wind_speed_key_name
                    ]
                    parsed_data[MAPPING_PRESSURE] = data[
                        PirateWeather_pressure_key_name
                    ]
                    parsed_data[MAPPING_HUMIDITY] = (
                        data[PirateWeather_humidity_key_name] * 100.0
                    )  # update since humidity reported by PirateWeather is how reported on a scale from 0-1
                    parsed_data[MAPPING_TEMPERATURE] = data[PirateWeather_temp_key_name]
                    parsed_data[MAPPING_DEWPOINT] = data[
                        PirateWeather_dew_point_key_name
                    ]
                    # should this only be added if the precipProbability is above a certain threshold?
                    parsed_data[MAPPING_CURRENT_PRECIPITATION] = data[
                        PirateWeather_current_precip_key_name
                    ]

                    # add precip from daily
                    dailydata = doc[PirateWeather_daily_weather_key_name]["data"][0]
                    if dailydata is not None:
                        parsed_data[MAPPING_PRECIPITATION] = dailydata[
                            PirateWeather_precip_key_name
                        ]
                        _LOGGER.debug(
                            "PirateWeatherClient daily precipitation: %s",
                            dailydata[PirateWeather_precip_key_name],
                        )

                    else:
                        parsed_data[MAPPING_PRECIPITATION] = 0.0
                    _LOGGER.debug(
                        "PirateWeatherCLIENT daily precipitation: %s",
                        parsed_data[MAPPING_PRECIPITATION],
                    )

                    self._cached_data = parsed_data
                    self._last_time_called = datetime.datetime.now()
                    return parsed_data
                _LOGGER.warning(
                    "Ignoring PirateWeather input: missing required key '%s' and '%s' in PirateWeather API return",
                    PirateWeather_current_weather_key_name,
                    PirateWeather_daily_weather_key_name,
                )
                return None
            except Exception as ex:
                _LOGGER.warning(ex)
                raise
            else:
                return parsed_data
        else:
            # return cached_data
            _LOGGER.info("Returning cached PirateWeather data")
            return self._cached_data

    def raiseIOError(self, key):
        """Raise an OSError when a required key is missing in the PirateWeather API return."""
        raise OSError(f"Missing required key {key} in PirateWeather API return")

    def validationError(self, key, value, minval, maxval):
        """Raise a ValueError if a value is outside the expected range for a key."""
        raise ValueError(
            f"Value {value} is not valid for {key}. Excepted range: {minval}-{maxval}"
        )


# for testing call: python PirateWeatherClient [api_key] [api_version] [latitude] [longitude] [elevation]
if __name__ == "__main__":
    args = sys.argv[1:]
    client = PirateWeatherClient(args[0], args[1], args[2], args[3], args[4])
    print(client.get_data())  # noqa: T201
    print(client.get_forecast_data())  # noqa: T201
