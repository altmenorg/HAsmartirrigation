"""The PyETO module for Smart Irrigation Integration."""

import datetime
import logging
from enum import Enum
from statistics import mean

import voluptuous as vol
from homeassistant.const import CONF_ELEVATION, CONF_LATITUDE
from homeassistant.core import HomeAssistant

from custom_components.smart_irrigation.calcmodules.calcmodule import (
    SmartIrrigationCalculationModule,
)
from custom_components.smart_irrigation.const import (
    CONF_PYETO_COASTAL,
    CONF_PYETO_FORECAST_DAYS,
    CONF_PYETO_SOLRAD_BEHAVIOR,
)

from .pyeto import (
    avp_from_tdew,
    convert,
    cs_rad,
    deg2rad,
    delta_svp,
    et_rad,
    fao56_penman_monteith,
    inv_rel_dist_earth_sun,
    net_in_sol_rad,
    net_out_lw_rad,
    net_rad,
    psy_const,
    sol_dec,
    sol_rad_from_t,
    sunset_hour_angle,
    svp_from_t,
)

# v1 only, no longer used in v2
# from ...const import CONF_MAXIMUM_ET, DEFAULT_MAXIMUM_ET
_LOGGER = logging.getLogger(__name__)


class SOLRAD_behavior(Enum):
    """Enumeration of solar radiation estimation behaviors for PyETO."""

    EstimateFromTemp = "1"
    EstimateFromSunHours = "2"
    DontEstimate = "3"
    EstimateFromSunHoursAndTemperature = "4"


DEFAULT_COASTAL = False
DEFAULT_SOLRAD_BEHAVIOR = SOLRAD_behavior.EstimateFromTemp
DEFAULT_FORECAST_DAYS = 0

MAPPING_DEWPOINT = "Dewpoint"
MAPPING_EVAPOTRANSPIRATION = "Evapotranspiration"
MAPPING_HUMIDITY = "Humidity"
MAPPING_MAX_TEMP = "Maximum Temperature"
MAPPING_MIN_TEMP = "Minimum Temperature"
MAPPING_PRECIPITATION = "Precipitation"
MAPPING_PRESSURE = "Pressure"
MAPPING_SOLRAD = "Solar Radiation"
MAPPING_TEMPERATURE = "Temperature"
MAPPING_WINDSPEED = "Windspeed"

SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_PYETO_COASTAL, default=DEFAULT_COASTAL): vol.Coerce(
            bool
        ),  # is really required, but otherwise the UI shows a * near the checkbox
        vol.Optional(
            CONF_PYETO_FORECAST_DAYS, default=DEFAULT_FORECAST_DAYS
        ): vol.Coerce(int),
    },
    # The solar-radiation estimation method used to be configurable here, which
    # was a footgun: it silently estimated even when a real radiation source was
    # available, or fell back silently when "don't estimate" was set without one.
    # Radiation is now used whenever a source provides it and estimated from
    # temperature otherwise — no setting needed. ALLOW_EXTRA tolerates the legacy
    # `solrad_behavior` key still present in configs saved before this change.
    extra=vol.ALLOW_EXTRA,
)


class PyETO(SmartIrrigationCalculationModule):
    """Calculation module for estimating evapotranspiration using the PyETO method."""

    def __init__(self, hass: HomeAssistant | None, description, config: dict) -> None:
        """Initialize the PyETO calculation module with Home Assistant context, description, and configuration.

        Args:
            hass: The Home Assistant instance or None.
            description: Description of the calculation module.
            config: Configuration dictionary for the module.

        """
        if config:
            if (
                CONF_PYETO_FORECAST_DAYS in config
                and not isinstance(config[CONF_PYETO_FORECAST_DAYS], int)
                and not config[CONF_PYETO_FORECAST_DAYS].isnumeric()
            ):
                config[CONF_PYETO_FORECAST_DAYS] = DEFAULT_FORECAST_DAYS

        super().__init__(
            name="PyETO",
            description=description,
            schema=SCHEMA,
            config=config,
        )
        self._hass = hass
        self._latitude = hass.config.as_dict().get(CONF_LATITUDE)
        self._elevation = hass.config.as_dict().get(CONF_ELEVATION)
        self._coastal = DEFAULT_COASTAL
        self.forecast_days = DEFAULT_FORECAST_DAYS
        self._solrad_behavior = DEFAULT_SOLRAD_BEHAVIOR
        if config:
            self._coastal = config.get(CONF_PYETO_COASTAL, DEFAULT_COASTAL)
            self._solrad_behavior = config.get(
                CONF_PYETO_SOLRAD_BEHAVIOR, DEFAULT_SOLRAD_BEHAVIOR
            )
            self.forecast_days = config.get(
                CONF_PYETO_FORECAST_DAYS, DEFAULT_FORECAST_DAYS
            )
            if not isinstance(self.forecast_days, int):
                try:
                    self.forecast_days = int(self.forecast_days)
                except ValueError:
                    self.forecast_days = DEFAULT_FORECAST_DAYS

    def calculate(self, weather_data, forecast_data) -> float:
        """Calculate the average evapotranspiration delta for the given weather and forecast data.

        Args:
            weather_data: Dictionary containing current weather data.
            forecast_data: List of dictionaries containing forecasted weather data for upcoming days.

        Returns:
            The mean evapotranspiration delta as a float.

        """
        delta = 0.0
        deltas = []
        if weather_data:
            deltas.append(self.calculate_et_for_day(weather_data))
            # loop over the forecast days
            for x in range(self.forecast_days):
                _LOGGER.debug(
                    "[pyETO: calculate_et_for_day] calculating delta for forecast day: %s",
                    x,
                )
                if len(forecast_data) - 1 >= x:
                    deltas.append(self.calculate_et_for_day(forecast_data[x]))
        # return average of the collected deltas
        _LOGGER.debug("[pyETO: calculate_et_for_day] collected deltas: %s", deltas)
        if deltas:
            delta = mean(deltas)
            _LOGGER.debug("[pyETO: calculate]: mean of deltas returned: %s", delta)
        return delta

    def calculate_et_for_day(self, weather_data):
        """Calculate the evapotranspiration delta for a single day's weather data.

        Args:
            weather_data: Dictionary containing weather data for the day..

        Returns:
            The evapotranspiration delta as a float.

        """
        # _LOGGER.debug("[pyETO: calculate_et_for_day] weather_data: %s", weather_data)
        if weather_data:
            tdew = weather_data.get(MAPPING_DEWPOINT)
            temp_c_min = weather_data.get(MAPPING_MIN_TEMP)
            temp_c_max = weather_data.get(MAPPING_MAX_TEMP)
            wind_m_s = weather_data.get(MAPPING_WINDSPEED)
            atmos_pres = weather_data.get(MAPPING_PRESSURE)
            sol_rad = weather_data.get(MAPPING_SOLRAD)
            if (
                tdew is not None
                and temp_c_min is not None
                and temp_c_max is not None
                and wind_m_s is not None
                and atmos_pres is not None
            ):
                day_of_year = datetime.datetime.now().timetuple().tm_yday

                sha = sunset_hour_angle(deg2rad(self._latitude), sol_dec(day_of_year))

                ird = inv_rel_dist_earth_sun(day_of_year)
                et_radvar = et_rad(
                    deg2rad(self._latitude), sol_dec(day_of_year), sha, ird
                )
                _LOGGER.debug("[pyETO: calculate_et_for_day] et_radvar: %s", et_radvar)
                cs_radvar = cs_rad(self._elevation, et_radvar)
                _LOGGER.debug("[pyETO: calculate_et_for_day] cs_radvar: %s", cs_radvar)
                # Use the solar radiation provided by the sensor group (a sensor,
                # or a weather service such as Open-Meteo) when available, and
                # estimate it from temperature (FAO-56) only when no source
                # provides it. Provided radiation always takes precedence — this
                # is what makes a full Penman-Monteith possible instead of a
                # temperature-only approximation.
                if sol_rad is None:
                    sol_rad = sol_rad_from_t(
                        et_radvar, cs_radvar, temp_c_min, temp_c_max, self._coastal
                    )
                    _LOGGER.debug(
                        "[pyETO: calculate_et_for_day] no solar radiation provided; "
                        "estimated from temperature: %s",
                        sol_rad,
                    )
                else:
                    _LOGGER.debug(
                        "[pyETO: calculate_et_for_day] using provided solar radiation: %s",
                        sol_rad,
                    )
                _LOGGER.debug(
                    "[pyETO: calculate_et_for_day] sol_rad passed to net_in_sol_radvar: %s",
                    sol_rad,
                )
                net_in_sol_radvar = net_in_sol_rad(sol_rad=sol_rad, albedo=0.23)
                _LOGGER.debug(
                    "[pyETO: calculate_et_for_day] net_in_sol_radvar: %s",
                    net_in_sol_radvar,
                )
                avp = avp_from_tdew(tdew)
                _LOGGER.debug(
                    "[pyETO: calculate_et_for_day] avp_from_tdew: %s for tdew %s",
                    avp,
                    tdew,
                )
                net_out_lw_radvar = net_out_lw_rad(
                    convert.celsius2kelvin(temp_c_min),
                    convert.celsius2kelvin(temp_c_max),
                    sol_rad,
                    cs_radvar,
                    avp,
                )
                _LOGGER.debug(
                    "[pyETO: calculate_et_for_day] net_out_lw_radvar: %s",
                    net_out_lw_radvar,
                )
                net_radvar = net_rad(net_in_sol_radvar, net_out_lw_radvar)
                _LOGGER.debug(
                    "[pyETO: calculate_et_for_day] net_radvar: %s", net_radvar
                )
                # experiment in v0.0.71: do not pass in day temperature (temp_c) but instead the average of temp_max and temp_min
                # see https://github.com/jeroenterheerdt/HAsmartirrigation/issues/70
                temp_c = (temp_c_min + temp_c_max) / 2.0

                eto = fao56_penman_monteith(
                    net_rad=net_radvar,
                    t=convert.celsius2kelvin(temp_c),
                    ws=wind_m_s,
                    svp=svp_from_t(temp_c),
                    avp=avp,
                    delta_svp=delta_svp(temp_c),
                    psy=psy_const(
                        atmos_pres / 10
                    ),  # value stored is in hPa, but needs to be provided in kPa
                )
                _LOGGER.debug("[pyETO: calculate_et_for_day] eto: %s", eto)
                if eto is None:
                    eto = 0
                delta = -eto

                _LOGGER.debug("[pyETO: calculate_et_for_day] delta returned: %s", delta)
                return delta
            # some data is missing, let's check and log what is missing
            _LOGGER.warning(
                "[pyETO: calculate_et_for_day] cannot calculate as some data is missing!"
            )
            if tdew is None:
                _LOGGER.warning(
                    "[pyETO: calculate_et_for_day] missing %s", MAPPING_DEWPOINT
                )
            if temp_c_min is None:
                _LOGGER.warning(
                    "[pyETO: calculate_et_for_day] missing %s", MAPPING_MIN_TEMP
                )
            if temp_c_max is None:
                _LOGGER.warning(
                    "[pyETO: calculate_et_for_day] missing %s", MAPPING_MAX_TEMP
                )
            if wind_m_s is None:
                _LOGGER.warning(
                    "[pyETO: calculate_et_for_day] missing %s", MAPPING_WINDSPEED
                )
            if atmos_pres is None:
                _LOGGER.warning(
                    "[pyETO: calculate_et_for_day] missing %s", MAPPING_PRESSURE
                )
        _LOGGER.debug("[pyETO: calculate_et_for_day] returned: 0!")
        return 0
