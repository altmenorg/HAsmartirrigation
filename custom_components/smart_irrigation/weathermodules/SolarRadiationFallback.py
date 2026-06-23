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

    def get_forecast_data(self):
        """Forecast from the primary, with radiation/ET0 filled per day from Open-Meteo."""
        data = self._primary.get_forecast_data()
        if not data:
            return data
        fb = self._fallback.get_forecast_data()
        if fb:
            for i, day in enumerate(data):
                if i < len(fb):
                    self._fill(day, fb[i])
        return data
