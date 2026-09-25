"""Transparent solar-radiation (and ET0) fallback via Open-Meteo.

OpenWeatherMap and Pirate Weather do not provide solar radiation, which the
FAO-56 Penman-Monteith calculation needs. This wrapper keeps the user's chosen
primary client for every field it provides, and fills in the missing Solar
Radiation and reference Evapotranspiration from Open-Meteo (free, keyless) so
those fields can be sourced from the weather service on any provider.
"""

import logging

from ..const import MAPPING_EVAPOTRANSPIRATION, MAPPING_SOLRAD
from .OpenMeteoClient import OpenMeteoClient

_LOGGER = logging.getLogger(__name__)

# Fields the primary services (OWM/PW) lack and that Open-Meteo provides.
_FALLBACK_FIELDS = (MAPPING_SOLRAD, MAPPING_EVAPOTRANSPIRATION)


class SolarRadiationFallbackClient:  # pylint: disable=invalid-name
    """Wrap a primary weather client and fill solar radiation / ET0 from Open-Meteo."""

    def __init__(self, primary, latitude, longitude, elevation) -> None:
        """Init with the primary client and the coordinates for the fallback."""
        self._primary = primary
        self._fallback = OpenMeteoClient(
            latitude=latitude, longitude=longitude, elevation=elevation
        )

    # The coordinator tweaks cache_seconds on the client; proxy it to both.
    @property
    def cache_seconds(self):
        """Return the primary client's cache window."""
        return getattr(self._primary, "cache_seconds", 0)

    @cache_seconds.setter
    def cache_seconds(self, value):
        self._primary.cache_seconds = value
        self._fallback.cache_seconds = value

    def _fill(self, target: dict, source: dict) -> None:
        """Copy missing fallback fields from source into target (in place)."""
        if not source:
            return
        for field in _FALLBACK_FIELDS:
            if field not in target and field in source:
                target[field] = source[field]

    def get_data(self):
        """Current data from the primary, with radiation/ET0 filled from Open-Meteo."""
        data = self._primary.get_data()
        if data is None:
            return None
        if any(field not in data for field in _FALLBACK_FIELDS):
            self._fill(data, self._fallback.get_data())
            _LOGGER.debug(
                "Filled solar radiation/ET0 from Open-Meteo fallback (current)"
            )
        return data

    def get_forecast_data(self, include_today=False):
        """Forecast from the primary, with radiation/ET0 filled per day from Open-Meteo."""
        data = self._primary.get_forecast_data(include_today=include_today)
        if not data:
            return data
        fb = self._fallback.get_forecast_data(include_today=include_today)
        if fb:
            for i, day in enumerate(data):
                if i < len(fb):
                    self._fill(day, fb[i])
        return data

    def get_hourly_radiation(self, start, end):
        """The sun of each hour, from Open-Meteo, for the hourly equation.

        The primary services do not publish radiation at all, hourly or
        otherwise, which is the reason this wrapper exists. So this goes
        straight to the fallback, and an installation on OpenWeatherMap or
        Pirate Weather can calculate hour by hour like any other.
        """
        return self._fallback.get_hourly_radiation(start, end)

    def get_precipitation_between(self, start, end):
        """The rain of each hour, from the primary when it keeps a history.

        Only Open-Meteo does, and the fallback is not asked for it: rain is a
        field the user's own service reports, and reading it from another
        would mix two services' idea of the same sky.
        """
        fetch = getattr(self._primary, "get_precipitation_between", None)
        return None if fetch is None else fetch(start, end)

    def get_hourly_forecast(self, days):
        """The coming days hour by hour, from Open-Meteo.

        The primaries publish no radiation, so their own hourly forecast could
        not price an hour even if they had one.
        """
        return self._fallback.get_hourly_forecast(days)
