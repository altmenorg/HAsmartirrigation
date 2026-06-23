"""Calculation module base class for Smart Irrigation integration."""

import logging
import time

import voluptuous as vol

from .voluptuous_serialize import convert

# this version of serialize has a bug when working with enums!
# from voluptuous_serialize import convert

_LOGGER = logging.getLogger(__name__)


class SmartIrrigationCalculationModule:
    """Base class for calculation modules in the Smart Irrigation integration."""

    def __init__(self, name, description, schema: vol.Schema, config) -> None:
        """Initialize the calculation module with name, description, schema, and config.

        Args:
            name: The name of the calculation module.
            description: A brief description of the calculation module.
            schema: The voluptuous schema for validating the config.
            config: The configuration dictionary to validate and use.

        """
        self._id = str(int(time.time()))
        self._name = name
        self._description = description
        self._schema = schema
        self.config = config

        # test if config passed in follows the schema
        if config and schema:
            self._schema(config)

    @property
    def name(self):
        """Return the name of the calculation module."""
        return self._name

    @property
    def description(self):
        """Return the description of the calculation module."""
        return self._description

    def calculate(self) -> float:
        """Perform the calculation and return the result as a float."""
        return 0

    def schema_serialized(self):
        """Return the serialized voluptuous schema if available, otherwise None."""
        if self._schema:
            return convert(self._schema)
        return None
