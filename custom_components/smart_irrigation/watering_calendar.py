"""Watering-calendar generation for the Smart Irrigation integration.

Extracted from __init__.py: builds a representative 12-month watering calendar
per zone from synthetic, latitude-based monthly climate data (not real weather),
for planning estimates. The methods live on a mixin the coordinator inherits;
their bodies are unchanged and still use ``self`` to reach coordinator state.
"""

import logging
import math
from datetime import datetime

from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .exceptions import SmartIrrigationError
from .helpers import altitudeToPressure, convert_between

_LOGGER = logging.getLogger(__name__)


class WateringCalendarMixin:
    """Watering-calendar generation for ``SmartIrrigationCoordinator``.

    Mixed into the coordinator; methods use ``self`` to reach coordinator state
    (store, the calculation-module loader, and the configured location).
    """

    async def async_generate_watering_calendar(self, zone_id: int | None = None):
        """Generate a 12-month watering calendar for a zone or all zones.

        Args:
            zone_id: The ID of the zone to generate calendar for. If None, generates for all zones.

        Returns:
            dict: Dictionary mapping zone IDs to their 12-month watering calendars.

        """
        _LOGGER.debug(
            "[async_generate_watering_calendar]: generating calendar for zone %s",
            zone_id,
        )

        # Get zones to process
        if zone_id is not None:
            zone = self.store.get_zone(zone_id)
            if not zone:
                raise SmartIrrigationError(f"Zone {zone_id} not found")
            zones = [zone]
        else:
            zones = await self.store.async_get_zones()

        calendar_data = {}

        for zone in zones:
            zone_id = zone.get(const.ZONE_ID)
            zone_name = zone.get(const.ZONE_NAME)

            _LOGGER.debug(
                "[async_generate_watering_calendar]: processing zone %s (%s)",
                zone_id,
                zone_name,
            )

            # Skip disabled zones
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED:
                _LOGGER.debug(
                    "[async_generate_watering_calendar]: skipping disabled zone %s",
                    zone_id,
                )
                continue

            try:
                monthly_calendar = await self._calculate_monthly_watering_for_zone(zone)
                calendar_data[zone_id] = {
                    "zone_name": zone_name,
                    "zone_id": zone_id,
                    "monthly_estimates": monthly_calendar,
                    "generated_at": datetime.now().isoformat(),
                    "calculation_method": self._get_zone_calculation_method(zone),
                }
            except Exception as e:
                _LOGGER.warning(
                    "[async_generate_watering_calendar]: failed to calculate calendar for zone %s: %s",
                    zone_id,
                    e,
                )
                calendar_data[zone_id] = {
                    "zone_name": zone_name,
                    "zone_id": zone_id,
                    "monthly_estimates": [],
                    "error": str(e),
                    "generated_at": datetime.now().isoformat(),
                }

        return calendar_data

    async def _calculate_monthly_watering_for_zone(self, zone):
        """Calculate monthly watering estimates for a specific zone.

        Args:
            zone: The zone dictionary containing configuration.

        Returns:
            list: List of 12 monthly estimates with watering volumes.

        """
        mapping_id = zone.get(const.ZONE_MAPPING)
        module_id = zone.get(const.ZONE_MODULE)

        if mapping_id is None or module_id is None:
            raise SmartIrrigationError(
                f"Zone {zone.get(const.ZONE_ID)} missing mapping or module configuration"
            )

        # Get the calculation module instance
        modinst = await self.getModuleInstanceByID(module_id)
        if not modinst:
            raise SmartIrrigationError(
                f"Cannot load calculation module for zone {zone.get(const.ZONE_ID)}"
            )

        # Generate representative monthly climate data based on location
        monthly_data = self._generate_monthly_climate_data()

        monthly_estimates = []

        for month in range(1, 13):
            month_name = datetime(2024, month, 1).strftime("%B")
            month_data = monthly_data[month - 1]

            try:
                # Calculate ET and watering needs for this month using the zone's module
                if modinst.name == "PyETO":
                    et_estimate = self._calculate_monthly_et_pyeto(
                        month_data, modinst, month
                    )
                elif modinst.name == "Static":
                    et_estimate = modinst.calculate()
                else:
                    # For other modules like Passthrough, use a simple estimation
                    et_estimate = (
                        month_data.get("average_daily_et", 3.0) * 30
                    )  # mm/month

                # Calculate watering volume based on zone parameters
                watering_volume = self._calculate_monthly_watering_volume(
                    zone, et_estimate, month_data
                )

                monthly_estimates.append(
                    {
                        "month": month,
                        "month_name": month_name,
                        "estimated_et_mm": round(et_estimate, 2),
                        "estimated_watering_volume_liters": round(watering_volume, 1),
                        "average_temperature_c": month_data.get("avg_temp", 20.0),
                        "average_precipitation_mm": month_data.get(
                            "precipitation", 50.0
                        ),
                        "calculation_notes": f"Based on typical {month_name} climate patterns",
                    }
                )

            except Exception as e:
                _LOGGER.warning(
                    "[_calculate_monthly_watering_for_zone]: failed to calculate month %s for zone %s: %s",
                    month,
                    zone.get(const.ZONE_ID),
                    e,
                )
                monthly_estimates.append(
                    {
                        "month": month,
                        "month_name": month_name,
                        "estimated_et_mm": 0.0,
                        "estimated_watering_volume_liters": 0.0,
                        "error": str(e),
                    }
                )

        return monthly_estimates

    def _generate_monthly_climate_data(self):
        """Generate representative monthly climate data based on latitude.

        Returns:
            list: List of 12 monthly climate data dictionaries.

        """
        # Get latitude for seasonal variation (default to temperate zone if not available)
        latitude = abs(self._latitude or 45.0)

        # Base temperatures and seasonal variations based on latitude
        if latitude < 23.5:  # Tropical
            base_temp = 27.0
            temp_variation = 3.0
        elif latitude < 45.0:  # Subtropical
            base_temp = 22.0
            temp_variation = 8.0
        else:  # Temperate
            base_temp = 15.0
            temp_variation = 15.0

        monthly_data = []

        for month in range(1, 13):
            # Calculate seasonal temperature variation
            temp_factor = math.cos((month - 7) * math.pi / 6)  # Peak in July (month 7)
            if self._latitude and self._latitude < 0:  # Southern hemisphere
                temp_factor = -temp_factor

            avg_temp = base_temp + (temp_variation * temp_factor)
            min_temp = avg_temp - 5.0
            max_temp = avg_temp + 5.0

            # Simple precipitation model (more in winter for temperate, varies by location)
            if latitude > 35.0:  # Temperate zones
                precip_factor = 1.5 - 0.5 * math.cos(
                    (month - 1) * math.pi / 6
                )  # More in winter
            else:  # Tropical/subtropical
                precip_factor = 1.0 + 0.3 * math.sin(
                    (month - 1) * math.pi / 6
                )  # Slight seasonal variation

            precipitation = 60.0 * precip_factor  # Base 60mm/month

            # Humidity varies seasonally (higher in winter for temperate zones)
            humidity = 65.0 + 15.0 * math.cos((month - 7) * math.pi / 6)

            # Wind speed (slightly higher in winter)
            wind_speed = 3.0 + 1.0 * math.cos((month - 7) * math.pi / 6)

            # Pressure (standard sea level, adjusted for elevation)
            pressure = altitudeToPressure(self._elevation or 0)

            # Dewpoint estimation
            dewpoint = avg_temp - ((100 - humidity) / 5)

            monthly_data.append(
                {
                    "month": month,
                    "avg_temp": avg_temp,
                    "min_temp": min_temp,
                    "max_temp": max_temp,
                    "precipitation": precipitation,
                    "humidity": humidity,
                    "wind_speed": wind_speed,
                    "pressure": pressure,
                    "dewpoint": dewpoint,
                    "average_daily_et": 2.0
                    + 2.0 * math.cos((month - 7) * math.pi / 6),  # Higher ET in summer
                }
            )

        return monthly_data

    def _calculate_monthly_et_pyeto(self, month_data, modinst, month):
        """Calculate monthly ET using PyETO module.

        Args:
            month_data: Monthly climate data dictionary.
            modinst: PyETO module instance.
            month: Month number (1-12).

        Returns:
            float: Monthly ET estimate in mm.

        """
        # Create weather data in the format expected by PyETO
        weather_data = {
            const.MAPPING_TEMPERATURE: month_data["avg_temp"],
            const.MAPPING_MIN_TEMP: month_data["min_temp"],
            const.MAPPING_MAX_TEMP: month_data["max_temp"],
            const.MAPPING_PRECIPITATION: month_data["precipitation"],
            const.MAPPING_HUMIDITY: month_data["humidity"],
            const.MAPPING_WINDSPEED: month_data["wind_speed"],
            const.MAPPING_PRESSURE: month_data["pressure"],
            const.MAPPING_DEWPOINT: month_data["dewpoint"],
        }

        # Calculate daily ET and scale to monthly
        daily_et_delta = modinst.calculate_et_for_day(weather_data)

        # Get days in month
        import calendar

        days_in_month = calendar.monthrange(2024, month)[
            1
        ]  # Use 2024 as reference year

        # Convert daily ET delta to monthly total (remove precipitation since we want just ET)
        daily_et = abs(daily_et_delta) + month_data["precipitation"] / days_in_month
        return daily_et * days_in_month

    def _calculate_monthly_watering_volume(self, zone, et_mm, month_data):
        """Calculate monthly watering volume in liters for a zone.

        Args:
            zone: Zone configuration dictionary.
            et_mm: Monthly evapotranspiration in mm.
            month_data: Monthly climate data.

        Returns:
            float: Watering volume in liters.

        """
        zone_size_m2 = zone.get(const.ZONE_SIZE, 1.0)  # Default 1 m²
        multiplier = zone.get(const.ZONE_MULTIPLIER, 1.0)
        precipitation_mm = month_data.get("precipitation", 0.0)

        # Convert from imperial if needed
        ha_config_is_metric = self.hass.config.units is METRIC_SYSTEM
        if not ha_config_is_metric:
            zone_size_m2 = convert_between(
                const.UNIT_SQ_FT, const.UNIT_M2, zone_size_m2
            )

        # Calculate net water need (ET minus precipitation)
        net_water_need_mm = max(0, et_mm - precipitation_mm)

        # Apply zone multiplier
        adjusted_water_need_mm = net_water_need_mm * multiplier

        # Convert mm over area to liters (1mm over 1m² = 1 liter)
        return adjusted_water_need_mm * zone_size_m2

    def _get_zone_calculation_method(self, zone):
        """Get the calculation method description for a zone.

        Args:
            zone: Zone configuration dictionary.

        Returns:
            str: Description of the calculation method used.

        """
        module_id = zone.get(const.ZONE_MODULE)
        if module_id is None:
            return "No calculation module configured"

        module = self.store.get_module(module_id)
        if module is None:
            return f"Module {module_id} not found"

        method_name = module.get(const.MODULE_NAME, "Unknown")

        if method_name == "PyETO":
            return "FAO-56 Penman-Monteith method using PyETO"
        if method_name == "Static":
            return "Static evapotranspiration rate"
        if method_name == "Passthrough":
            return "Direct evapotranspiration input"
        return f"{method_name} calculation method"
