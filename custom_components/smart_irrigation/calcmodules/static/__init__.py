"""The Static module for Smart Irrigation Integration."""

import logging

import voluptuous as vol
from homeassistant.core import HomeAssistant

from custom_components.smart_irrigation.calcmodules.calcmodule import (
    SmartIrrigationCalculationModule,
)

# v1 only, no longer used in v2
# from ...const import CONF_MAXIMUM_ET, DEFAULT_MAXIMUM_ET

_LOGGER = logging.getLogger(__name__)

CONF_DELTA = "delta"

DEFAULT_DELTA = 0.0
SCHEMA = vol.Schema(
    {
        vol.Required(CONF_DELTA, default=DEFAULT_DELTA): vol.Coerce(str, float),
    }
)


class Static(SmartIrrigationCalculationModule):
    """Calculation module that returns a static delta value for Smart Irrigation."""

    def __init__(self, hass: HomeAssistant | None, description, config: dict) -> None:
        """Initialize the Static calculation module with configuration.

        Args:
            hass: The Home Assistant instance.
            description: Description of the calculation module.
            config: Configuration dictionary for the module.

        """
        super().__init__(
            name="Static", description=description, config=config, schema=SCHEMA
        )
        self._delta = DEFAULT_DELTA
        if config:
            if config.get(CONF_DELTA) == "":
                self._delta = DEFAULT_DELTA
            else:
                self._delta = float(config.get(CONF_DELTA, DEFAULT_DELTA))

    def calculate(self) -> float:
        """Return the static delta value for irrigation calculation."""
        return self._delta
