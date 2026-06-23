"""Helpers for the Smart Irrigation integration."""

import importlib
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

from homeassistant import exceptions
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN, UnitOfTemperature
from homeassistant.core import HomeAssistant

from .const import (
    CONF_WEATHER_SERVICE_OM,
    CONF_WEATHER_SERVICE_OWM,
    CONF_WEATHER_SERVICE_PW,
    CUSTOM_COMPONENTS,
    DOMAIN,
    GALLON_TO_LITER_FACTOR,
    INCH_TO_MM_FACTOR,
    INHG_TO_HPA_FACTOR,
    INHG_TO_PSI_FACTOR,
    K_TO_C_FACTOR,
    KMH_TO_MILESH_FACTOR,
    KMH_TO_MS_FACTOR,
    LITER_TO_GALLON_FACTOR,
    M2_TO_SQ_FT_FACTOR,
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
    MBAR_TO_INHG_FACTOR,
    MBAR_TO_PSI_FACTOR,
    MILESH_TO_KMH_FACTOR,
    MILESH_TO_MS_FACTOR,
    MM_TO_INCH_FACTOR,
    MS_TO_KMH_FACTOR,
    MS_TO_MILESH_FACTOR,
    PSI_TO_HPA_FACTOR,
    PSI_TO_INHG_FACTOR,
    SQ_FT_TO_M2_FACTOR,
    UNIT_GPM,
    UNIT_HPA,
    UNIT_INCH,
    UNIT_INCHH,
    UNIT_INHG,
    UNIT_KMH,
    UNIT_LPM,
    UNIT_M2,
    UNIT_MBAR,
    UNIT_MH,
    UNIT_MILLIBAR,
    UNIT_MJ_DAY_M2,
    UNIT_MJ_DAY_SQFT,
    UNIT_MM,
    UNIT_MMH,
    UNIT_MS,
    UNIT_PERCENT,
    UNIT_PSI,
    UNIT_SECONDS,
    UNIT_SQ_FT,
    UNIT_W_M2,
    UNIT_W_SQFT,
    W_M2_TO_W_SQ_FT_FACTOR,
    W_SQ_FT_TO_W_M2_FACTOR,
    W_TO_MJ_DAY_FACTOR,
)
from .weathermodules.OpenMeteoClient import OpenMeteoClient
from .weathermodules.OWMClient import OWMClient
from .weathermodules.PirateWeatherClient import PirateWeatherClient

_LOGGER = logging.getLogger(__name__)


def friendly_name_for_entity_id(entity_id: str, hass: HomeAssistant):
    """Return the friendly name for an entity."""
    state = hass.states.get(entity_id)
    if state and state.attributes.get("friendly_name"):
        return state.attributes["friendly_name"]

    return entity_id


def omit(obj: dict, blacklisted_keys: list):
    """Return a copy of obj omitting keys present in blacklisted_keys."""
    return {key: val for key, val in obj.items() if key not in blacklisted_keys}


def check_time(itime):
    """Check time."""
    # Add type safety for None and non-string inputs
    if not isinstance(itime, str):
        return False

    try:
        timesplit = itime.split(":")
        if len(timesplit) != 2:
            return False

        hours = int(timesplit[0])
        minutes = int(timesplit[1])
        if hours in range(24) and minutes in range(
            60
        ):  # range does not include upper bound
            return True
    except (ValueError, AttributeError):
        return False

    return False


def convert_timestamp(val):
    """Convert a datetime or ISO string to a formatted timestamp string."""
    if val is None:
        return None

    outputformat = "%Y-%m-%d %H:%M:%S"

    if isinstance(val, str):
        try:
            return datetime.fromisoformat(val).strftime(outputformat)
        except (ValueError, TypeError):
            return val  # Return original if parsing fails
    elif isinstance(val, datetime):
        return val.strftime(outputformat)

    return str(val)  # Fallback to string representation


def convert_mapping_to_metric(val, mapping, unit, system_is_metric):
    """Convert a value to its metric equivalent based on mapping, unit, and system settings.

    Args:
        val: The value to convert.
        mapping: The type of measurement being converted.
        unit: The current unit of the value.
        system_is_metric: Whether the system is using metric units.

    Returns:
        The value converted to metric units, or None if conversion is not possible.

    """
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if mapping == MAPPING_HUMIDITY:
        # humidity unit is same in metric and imperial: %
        return val
    if mapping in [
        MAPPING_DEWPOINT,
        MAPPING_TEMPERATURE,
        MAPPING_MAX_TEMP,
        MAPPING_MIN_TEMP,
    ]:
        # either Celsius or F. If celsius, no need to convert.
        if unit:
            # a unit was set, convert it
            return convert_between(
                from_unit=unit, to_unit=UnitOfTemperature.CELSIUS, val=val
            )
        # no unit was set, so it's dependent on system_is_metric if we need to convert
        if system_is_metric:
            return val
        # assume the unit is in F
        return convert_between(
            from_unit=UnitOfTemperature.FAHRENHEIT,
            to_unit=UnitOfTemperature.CELSIUS,
            val=val,
        )
    if mapping in [MAPPING_PRECIPITATION, MAPPING_EVAPOTRANSPIRATION]:
        # either mm or inch. If mm no need to convert.
        if unit:
            return convert_between(from_unit=unit, to_unit=UNIT_MM, val=val)
        if system_is_metric:
            return val
        # assume the unit is in inch
        return convert_between(from_unit=UNIT_INCH, to_unit=UNIT_MM, val=val)
    if mapping == MAPPING_CURRENT_PRECIPITATION:
        # either mm/h or inch/h. If mm/h no need to convert.
        if unit:
            return convert_between(from_unit=unit, to_unit=UNIT_MMH, val=val)
        if system_is_metric:
            return val
        # assume the unit is in inch/h
        return convert_between(from_unit=UNIT_INCHH, to_unit=UNIT_MMH, val=val)
    if mapping == MAPPING_PRESSURE:
        # either: mbar, hpa (default for metric), psi or inhg (default for imperial)
        if unit:
            return convert_between(from_unit=unit, to_unit=UNIT_HPA, val=val)
        if system_is_metric:
            return val
        # assume it's inHG
        return convert_between(from_unit=UNIT_INHG, to_unit=UNIT_HPA, val=val)
    if mapping == MAPPING_SOLRAD:
        # either: assume w/m2 for metric, w/sqft for imperial
        if unit:
            _LOGGER.debug(
                "[convert_mapping_to_metric]: unit set, converting %s from %s to %s",
                val,
                unit,
                UNIT_MJ_DAY_M2,
            )
            return convert_between(from_unit=unit, to_unit=UNIT_MJ_DAY_M2, val=val)
        if system_is_metric:
            # assume it's w/m2
            _LOGGER.debug(
                "[convert_mapping_to_metric]: since system is metric and unit was not set, converting %s from W/m2 to MJ/day/m2",
                val,
            )
            return convert_between(from_unit=UNIT_W_M2, to_unit=UNIT_MJ_DAY_M2, val=val)
        # assume it's w/sqft
        _LOGGER.debug(
            "[convert_mapping_to_metric]: since system is imperial and unit was not set, converting %s from W/sq ft to MJ/day/m2",
            val,
        )
        return convert_between(from_unit=UNIT_W_SQFT, to_unit=UNIT_MJ_DAY_M2, val=val)
    if mapping == MAPPING_WINDSPEED:
        # either UNIT_KMH, unit: UNIT_MS (Default for metric), m/h (imperial)
        if unit:
            return convert_between(from_unit=unit, to_unit=UNIT_MS, val=val)
        if system_is_metric:
            return val
        # assume it's m/h
        return convert_between(from_unit=UNIT_MH, to_unit=UNIT_MS, val=val)
    return None


def convert_between(from_unit, to_unit, val):
    """Convert a value from one unit to another based on the provided units.

    Args:
        from_unit: The unit of the input value.
        to_unit: The unit to convert the value to.
        val: The value to be converted.

    Returns:
        The converted value, or None if conversion is not possible.

    """
    _LOGGER.debug(
        "[convert_between]: Converting %s from %s to %s", val, from_unit, to_unit
    )
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        _LOGGER.debug(
            ["[convert_between]: Value is None, Unknown or Unavailable, returning None"]
        )
        return None
    if from_unit == to_unit or from_unit in [UNIT_PERCENT, UNIT_SECONDS]:
        # no conversion necessary here!
        _LOGGER.debug(
            "[convert_between]: No conversion necessary, returning value %s", val
        )
        return val
    # convert temperatures
    if from_unit in [
        UnitOfTemperature.CELSIUS,
        UnitOfTemperature.FAHRENHEIT,
        UnitOfTemperature.KELVIN,
    ]:
        _LOGGER.debug("[convert_between]: Converting temperatures")
        return convert_temperatures(from_unit, to_unit, val)
    # convert lengths
    if from_unit in [UNIT_MM, UNIT_INCH]:
        _LOGGER.debug("[convert_between]: Converting lengths")
        return convert_length(from_unit, to_unit, val)
    # convert precip rates
    if from_unit in [UNIT_MMH, UNIT_INCHH]:
        _LOGGER.debug("[convert_between]: Converting precip rates")
        return convert_precip_rate(from_unit, to_unit, val)
    # convert volumes
    if from_unit in [UNIT_LPM, UNIT_GPM]:
        _LOGGER.debug("[convert_between]: Converting volumes")
        return convert_volume(from_unit, to_unit, val)
    # convert areas
    if from_unit in [UNIT_M2, UNIT_SQ_FT]:
        _LOGGER.debug("[convert_between]: Converting areas")
        return convert_area(from_unit, to_unit, val)
    # convert pressures
    if from_unit in [UNIT_MBAR, UNIT_MILLIBAR, UNIT_HPA, UNIT_PSI, UNIT_INHG]:
        _LOGGER.debug("[convert_between]: Converting pressures")
        return convert_pressure(from_unit, to_unit, val)
    # convert speeds
    if from_unit in [UNIT_KMH, UNIT_MS, UNIT_MH]:
        _LOGGER.debug("[convert_between]: Converting speeds")
        return convert_speed(from_unit, to_unit, val)
    # convert production/area
    if from_unit in [UNIT_W_M2, UNIT_MJ_DAY_M2, UNIT_W_SQFT, UNIT_MJ_DAY_SQFT]:
        _LOGGER.debug("[convert_between]: Converting production/area")
        return convert_production(from_unit, to_unit, val)
    # unexpected from_unit
    _LOGGER.warning(
        "Unexpected conversion of %s from %s to %s", val, from_unit, to_unit
    )
    return None


def convert_production(from_unit, to_unit, val):
    """Convert production/area values between different units.

    Args:
        from_unit: The unit of the input value.
        to_unit: The unit to convert the value to.
        val: The value to be converted.

    Returns:
        The converted value, or None if conversion is not possible.

    """
    _LOGGER.debug(
        "[convert production]: converting %s from %s to %s", val, from_unit, to_unit
    )
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        _LOGGER.debug("[convert production]: Value is None, Unknown or Unavailable")
        return None
    if to_unit == from_unit:
        _LOGGER.debug("[convert production]: No conversion necessary")
        return val
    if to_unit == UNIT_MJ_DAY_M2:
        _LOGGER.debug("[convert production]: Converting to MJ/day/m2")
        if from_unit == UNIT_W_M2:
            outval = float(float(val) * W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from W/m2 to MJ/day/m2. Result: %s",
                val,
                outval,
            )
            return outval
        if from_unit == UNIT_W_SQFT:
            outval = float((float(val) * W_SQ_FT_TO_W_M2_FACTOR) * W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from W/sq ft to MJ/day/m2. Result: %s",
                val,
                outval,
            )
            return outval
        if from_unit == UNIT_MJ_DAY_SQFT:
            outval = float(float(val) * SQ_FT_TO_M2_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from MJ/day/sq ft to MJ/day/m2. Result: %s",
                val,
                outval,
            )
            return outval
    elif to_unit == UNIT_MJ_DAY_SQFT:
        _LOGGER.debug("[convert production]: Converting to MJ/day/sq ft")
        if from_unit == UNIT_W_M2:
            outval = float((float(val) * W_M2_TO_W_SQ_FT_FACTOR) * W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from W/m2 to MJ/day/sq ft. Result: %s",
                val,
                outval,
            )
            return outval
        if from_unit == UNIT_W_SQFT:
            outval = float(float(val) * W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from W/sq ft to MJ/day/sq ft. Result: %s",
                val,
                outval,
            )
            return outval
        if from_unit == UNIT_MJ_DAY_M2:
            outval = float(float(val) * M2_TO_SQ_FT_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from MJ/day/m2 to MJ/day/sq ft. Result: %s",
                val,
                outval,
            )
            return outval
    elif to_unit == UNIT_W_M2:
        _LOGGER.debug("[convert production]: Converting to W/m2")
        if from_unit == UNIT_W_SQFT:
            outval = float(float(val) * W_SQ_FT_TO_W_M2_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from W/sq ft to W/m2. Result: %s",
                val,
                outval,
            )
            return outval
        if from_unit == UNIT_MJ_DAY_SQFT:
            outval = float((float(val) / W_TO_MJ_DAY_FACTOR) * W_SQ_FT_TO_W_M2_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from MJ/day/sq ft to W/m2. Result: %s",
                val,
                outval,
            )
            return outval
        if from_unit == UNIT_MJ_DAY_M2:
            outval = float(float(val) / W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from MJ/day/m2 to W/m2. Result: %s",
                val,
                outval,
            )
            return outval
    elif to_unit == UNIT_W_SQFT:
        _LOGGER.debug("[convert production]: Converting to W/sq ft")
        if from_unit == UNIT_W_M2:
            outval = float(float(val) * W_M2_TO_W_SQ_FT_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from W/m2 to W/sq ft. Result: %s",
                val,
                outval,
            )
            return outval
        if from_unit == UNIT_MJ_DAY_M2:
            outval = float((float(val) / W_TO_MJ_DAY_FACTOR) * W_M2_TO_W_SQ_FT_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from MJ/day/m2 to W/sq ft. Result: %s",
                val,
                outval,
            )
            return outval
        if from_unit == UNIT_MJ_DAY_SQFT:
            outval = float(float(val) / W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                "[convert production]: Converting %s from MJ/day/sq ft to W/sq ft. Result: %s",
                val,
                outval,
            )
            return outval
    # unknown conversion
    return None


def convert_speed(from_unit, to_unit, val):
    """Convert speed values between different units.

    Args:
        from_unit: The unit of the input value.
        to_unit: The unit to convert the value to.
        val: The value to be converted.

    Returns:
        The converted value, or None if conversion is not possible.

    """
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit == UNIT_KMH:
        if from_unit == UNIT_MS:
            return float(float(val) * MS_TO_KMH_FACTOR)
        if from_unit == UNIT_MH:
            return float(float(val) * MILESH_TO_KMH_FACTOR)
    elif to_unit == UNIT_MS:
        if from_unit == UNIT_KMH:
            return float(float(val) * KMH_TO_MS_FACTOR)
        if from_unit == UNIT_MH:
            return float(float(val) * MILESH_TO_MS_FACTOR)
    elif to_unit == UNIT_MH:
        if from_unit == UNIT_KMH:
            return float(float(val) * KMH_TO_MILESH_FACTOR)
        if from_unit == UNIT_MS:
            return float(float(val) * MS_TO_MILESH_FACTOR)
    # unknown conversion
    return None


def convert_pressure(from_unit, to_unit, val):
    """Convert pressure values between different units.

    Args:
        from_unit: The unit of the input value.
        to_unit: The unit to convert the value to.
        val: The value to be converted.

    Returns:
        The converted value, or None if conversion is not possible.

    """
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit in [UNIT_MBAR, UNIT_HPA]:
        if from_unit in [UNIT_HPA, UNIT_MBAR]:
            # 1 mbar = 1hpa
            return val
        if from_unit == UNIT_PSI:
            return float(float(val) * PSI_TO_HPA_FACTOR)
        if from_unit == UNIT_INHG:
            return float(float(val) * INHG_TO_HPA_FACTOR)
    if to_unit == UNIT_PSI:
        if from_unit in [UNIT_HPA, UNIT_MBAR]:
            return float(float(val) * MBAR_TO_PSI_FACTOR)
        if from_unit == UNIT_INHG:
            return float(float(val) * INHG_TO_PSI_FACTOR)
    if to_unit == UNIT_INHG:
        if from_unit in [UNIT_HPA, UNIT_MBAR]:
            return float(float(val) * MBAR_TO_INHG_FACTOR)
        if from_unit == UNIT_PSI:
            return float(float(val) * PSI_TO_INHG_FACTOR)
    # unknown conversion
    return None


def convert_area(from_unit, to_unit, val):
    """Convert area values between different units.

    Args:
        from_unit: The unit of the input value.
        to_unit: The unit to convert the value to.
        val: The value to be converted.

    Returns:
        The converted value, or None if conversion is not possible.

    """
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit == UNIT_M2:
        if from_unit == UNIT_SQ_FT:
            return float(float(val) * SQ_FT_TO_M2_FACTOR)
    elif to_unit == UNIT_SQ_FT:
        if from_unit == UNIT_M2:
            return float(float(val) * M2_TO_SQ_FT_FACTOR)
    # unexpected conversion
    return None


def convert_volume(from_unit, to_unit, val):
    """Convert volume values between different units.

    Args:
        from_unit: The unit of the input value.
        to_unit: The unit to convert the value to.
        val: The value to be converted.

    Returns:
        The converted value, or None if conversion is not possible.

    """
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit == UNIT_LPM:
        if from_unit == UNIT_GPM:
            return float(float(val) * GALLON_TO_LITER_FACTOR)
    elif to_unit == UNIT_GPM:
        if from_unit == UNIT_LPM:
            return float(float(val) * LITER_TO_GALLON_FACTOR)
    # unknown conversion
    return None


def convert_length(from_unit, to_unit, val):
    """Convert length values between different units.

    Args:
        from_unit: The unit of the input value.
        to_unit: The unit to convert the value to.
        val: The value to be converted.

    Returns:
        The converted value, or None if conversion is not possible.

    """
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit == UNIT_MM:
        if from_unit == UNIT_INCH:
            return float(float(val) * INCH_TO_MM_FACTOR)
    elif to_unit == UNIT_INCH:
        if from_unit == UNIT_MM:
            return float(float(val) * MM_TO_INCH_FACTOR)
    # unknown conversion
    return None


def convert_precip_rate(from_unit, to_unit, val):
    """Convert precipitation rate values between different units.

    Args:
        from_unit: The unit of the input value.
        to_unit: The unit to convert the value to.
        val: The value to be converted.

    Returns:
        The converted value, or None if conversion is not possible.

    """
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit == UNIT_MMH:
        if from_unit == UNIT_INCHH:
            return float(float(val) * INCH_TO_MM_FACTOR)
    elif to_unit == UNIT_INCHH:
        if from_unit == UNIT_MMH:
            return float(float(val) * MM_TO_INCH_FACTOR)
    # unknown conversion
    return None


def convert_temperatures(from_unit, to_unit, val):
    """Convert temperature values between different units.

    Args:
        from_unit: The unit of the input value.
        to_unit: The unit to convert the value to.
        val: The value to be converted.

    Returns:
        The converted value, or None if conversion is not possible.

    """
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit == UnitOfTemperature.CELSIUS:
        if from_unit == UnitOfTemperature.FAHRENHEIT:
            return float((float(val) - 32.0) / 1.8)
        if from_unit == UnitOfTemperature.KELVIN:
            return val - K_TO_C_FACTOR
    elif to_unit == UnitOfTemperature.FAHRENHEIT:
        if from_unit == UnitOfTemperature.CELSIUS:
            return float((val * 1.8) + 32.0)
        if from_unit == UnitOfTemperature.KELVIN:
            return float(1.8 * (val - 273) + 32)
    elif to_unit == UnitOfTemperature.KELVIN:
        if from_unit == UnitOfTemperature.FAHRENHEIT:
            return (val + 459.67) * (5.0 / 9.0)
        if from_unit == UnitOfTemperature.CELSIUS:
            return val + K_TO_C_FACTOR
    # unable to do conversion because of unexpected to or from unit
    return None


def check_reference_et(reference_et):
    """Check reference et values here."""
    try:
        if len(reference_et) != 12:
            return False
        all_floats = True
        for ref in reference_et:
            if not isinstance(ref, float):
                all_floats = False
                break
        # test that max > 0
        if all_floats and max(reference_et) == 0:
            return False
    except (TypeError, ValueError):
        return False
    else:
        return all_floats


def relative_to_absolute_pressure(pressure, height):
    """Convert relative pressure to absolute pressure."""
    # Constants
    g = 9.80665  # m/s^2
    M = 0.0289644  # kg/mol
    R = 8.31447  # J/(mol*K)
    T0 = 288.15  # K

    # Calculate temperature at given height
    temperature = T0 - (g * M * height) / (R * T0)

    # Calculate absolute pressure at given height
    return pressure * (T0 / temperature) ** (g * M / (R * 287))


def altitudeToPressure(alt):
    """Take altitude in meters and convert it to hPa = mbar."""
    return 100 * ((44331.514 - alt) / 11880.516) ** (1 / 0.1902632) / 100


async def validate_api_key(hass: HomeAssistant, weather_service, api_key):
    """Test access to Weather Service API here."""
    client = None
    test_lat = 52.353218
    test_lon = 5.0027695
    test_elev = 1
    if weather_service == CONF_WEATHER_SERVICE_OM:
        # Open-Meteo is keyless — just verify connectivity.
        client = OpenMeteoClient(
            latitude=test_lat,
            longitude=test_lon,
            elevation=test_elev,
        )
    elif weather_service == CONF_WEATHER_SERVICE_OWM:
        client = OWMClient(
            api_key=api_key.strip(),
            api_version="3.0",
            latitude=test_lat,
            longitude=test_lon,
            elevation=test_elev,
        )
    elif weather_service == CONF_WEATHER_SERVICE_PW:
        client = PirateWeatherClient(
            api_key=api_key.strip(),
            api_version="1",
            latitude=test_lat,
            longitude=test_lon,
            elevation=test_elev,
        )
    if client:
        try:
            await hass.async_add_executor_job(client.get_data)
        except OSError as err:
            raise InvalidAuth from err
        except Exception as err:
            raise CannotConnect from err


def loadModules(moduleDir=None):
    """Dynamically load modules from a given directory and return a dictionary of module and class information.

    Args:
        moduleDir: The directory containing modules to load.

    Returns:
        A dictionary mapping module names to their module and class information, or None if no directory is provided.

    """
    if moduleDir:
        res = {}
        moduleDirFullPath = str(Path(__file__).resolve().parent / moduleDir)
        if moduleDirFullPath not in sys.path:
            sys.path.append(moduleDirFullPath)
        # check subfolders
        module_path = Path(moduleDirFullPath)
        thedir = []
        for d in module_path.iterdir():
            s = d
            if s.is_dir() and (s / "__init__.py").exists():
                thedir.append(d.name)
        # load the detected modules

        def extract_classname(theclass):
            """Extract the class name from the __init__ method."""
            if "__init__" in theclass.__dict__:
                return (
                    str(theclass.__dict__["__init__"])
                    .split(".", maxsplit=1)[0]
                    .split(" ")[1]
                )
            return None

        for d in thedir:
            if moduleDirFullPath + os.sep + d not in sys.path:
                sys.path.append(moduleDirFullPath + os.sep + d)
            mod = importlib.import_module(
                "." + d, package=CUSTOM_COMPONENTS + "." + DOMAIN + "." + moduleDir
            )
            if not mod:
                continue
            theclasses = [
                mod.__dict__[c]
                for c in mod.__dict__
                if (
                    isinstance(mod.__dict__[c], type)
                    and mod.__dict__[c].__module__ == mod.__name__
                )
            ]
            for theclass in theclasses:
                classname = extract_classname(theclass)
                if classname:
                    res[d] = {"module": mod, "class": classname}
        return res
    return None


def convert_list_to_dict(lst):
    """Convert list to dict."""
    res_dict = {}
    for i in range(0, len(lst), 1):
        # print(i)
        # print(lst[i])
        if isinstance(lst[i], str):
            if i + 1 >= len(lst) or isinstance(lst[i + 1], str):
                res_dict[lst[i]] = None
            else:
                res_dict[lst[i]] = lst[i + 1]
    return res_dict


def parse_datetime(val) -> datetime | None:
    """Gets a datetime value or converts one from a string."""
    if isinstance(val, datetime):
        return val
    if isinstance(val, str):
        return datetime.strptime(val, "%Y-%m-%dT%H:%M:%S.%f")
    _LOGGER.warning("[get_datetime]: value not instanceof datetime or string: %s", val)
    return None


class CannotConnect(exceptions.HomeAssistantError):
    """Error to indicate we cannot connect."""


class InvalidAuth(exceptions.HomeAssistantError):
    """Error to indicate there is invalid auth."""


def normalize_azimuth_angle(angle: float) -> float:
    """Normalize any azimuth angle to 0-360 degree range.

    Args:
        angle: Input angle in degrees (can be any value)

    Returns:
        Normalized angle in 0-360 degree range

    Examples:
        normalize_azimuth_angle(450) -> 90
        normalize_azimuth_angle(-30) -> 330
        normalize_azimuth_angle(365) -> 5
    """
    return angle % 360


def calculate_solar_azimuth(
    latitude: float, longitude: float, timestamp: datetime
) -> float:
    """Calculate solar azimuth angle for a given location and time.

    Args:
        latitude: Latitude in degrees
        longitude: Longitude in degrees
        timestamp: UTC datetime object

    Returns:
        Solar azimuth angle in degrees (0-360, 0=North, 90=East, 180=South, 270=West)
    """
    import math

    # Convert to radians
    lat_rad = math.radians(latitude)

    # Day of year
    day_of_year = timestamp.timetuple().tm_yday

    # Solar declination (simplified)
    declination = math.radians(
        23.45 * math.sin(math.radians(360 * (284 + day_of_year) / 365))
    )

    # Hour angle
    time_decimal = timestamp.hour + timestamp.minute / 60.0 + timestamp.second / 3600.0
    # Longitude correction for local solar time
    longitude_correction = longitude / 15.0
    solar_time = time_decimal - longitude_correction
    hour_angle = math.radians((solar_time - 12) * 15)

    # Solar elevation (calculated but not used in this function)
    # elevation = math.asin(
    #     math.sin(lat_rad) * math.sin(declination) +
    #     math.cos(lat_rad) * math.cos(declination) * math.cos(hour_angle)
    # )

    # Solar azimuth
    azimuth = math.atan2(
        math.sin(hour_angle),
        math.cos(hour_angle) * math.sin(lat_rad)
        - math.tan(declination) * math.cos(lat_rad),
    )

    # Convert to degrees and normalize to 0-360 (0=North, 90=East, 180=South, 270=West)
    azimuth_degrees = (math.degrees(azimuth) + 180) % 360

    return azimuth_degrees


def find_next_solar_azimuth_time(
    latitude: float,
    longitude: float,
    target_azimuth: float,
    start_time: datetime,
    max_days: int = 1,
) -> datetime | None:
    """Find the next time when the sun will be at a specific azimuth angle.

    Args:
        latitude: Latitude in degrees
        longitude: Longitude in degrees
        target_azimuth: Target azimuth angle in degrees (0-360)
        start_time: Starting datetime to search from
        max_days: Maximum days to search ahead

    Returns:
        Next datetime when sun will be at target azimuth, or None if not found
    """
    from datetime import timedelta

    # Search in 15-minute intervals for the next 24 hours by default
    search_interval = timedelta(minutes=15)
    max_search_time = start_time + timedelta(days=max_days)

    current_time = start_time
    prev_azimuth = calculate_solar_azimuth(latitude, longitude, current_time)

    while current_time < max_search_time:
        current_time += search_interval
        current_azimuth = calculate_solar_azimuth(latitude, longitude, current_time)

        # Check if we've crossed the target azimuth
        if _azimuth_crossed_target(prev_azimuth, current_azimuth, target_azimuth):
            # Refine to minute precision
            return _refine_azimuth_time(
                latitude,
                longitude,
                target_azimuth,
                current_time - search_interval,
                current_time,
            )

        prev_azimuth = current_azimuth

    return None


def _azimuth_crossed_target(
    prev_azimuth: float, current_azimuth: float, target: float
) -> bool:
    """Check if azimuth crossed the target between two measurements."""
    # Handle wraparound case (359° -> 1°)
    if abs(prev_azimuth - current_azimuth) > 180:
        if prev_azimuth > current_azimuth:
            # Wrapped from 359 to small number
            return target >= prev_azimuth or target <= current_azimuth
        # Wrapped from small number to 359
        return target <= prev_azimuth or target >= current_azimuth
    # Normal case
    return (
        min(prev_azimuth, current_azimuth)
        <= target
        <= max(prev_azimuth, current_azimuth)
    )


def _refine_azimuth_time(
    latitude: float,
    longitude: float,
    target_azimuth: float,
    start_time: datetime,
    end_time: datetime,
) -> datetime:
    """Refine azimuth time to minute precision using binary search."""
    while (end_time - start_time).total_seconds() > 60:
        mid_time = start_time + (end_time - start_time) / 2
        mid_azimuth = calculate_solar_azimuth(latitude, longitude, mid_time)

        start_azimuth = calculate_solar_azimuth(latitude, longitude, start_time)

        if _azimuth_crossed_target(start_azimuth, mid_azimuth, target_azimuth):
            end_time = mid_time
        else:
            start_time = mid_time
    return start_time
