"""Options flow handler for Smart Irrigation integration.

The weather service is configured on the fly from the integration panel
(Settings → Weather service), so it is no longer part of this flow. What remains
here is the optional manual-coordinates override.
"""

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_ELEVATION, CONF_LATITUDE, CONF_LONGITUDE

from . import const


class SmartIrrigationOptionsFlowHandler(config_entries.OptionsFlow):
    """Smart Irrigation options flow handler (manual coordinates only)."""

    def __init__(self, config_entry) -> None:
        """Initialize the options flow."""
        # removing this as it's going be deprecated in HA 2025.12
        # self.config_entry = config_entry
        self.options = dict(config_entry.options)
        self._errors = {}

        # Manual coordinate settings (options override data).
        self._manual_coordinates_enabled = config_entry.options.get(
            const.CONF_MANUAL_COORDINATES_ENABLED,
            config_entry.data.get(
                const.CONF_MANUAL_COORDINATES_ENABLED,
                const.CONF_DEFAULT_MANUAL_COORDINATES_ENABLED,
            ),
        )
        self._manual_latitude = config_entry.options.get(
            const.CONF_MANUAL_LATITUDE,
            config_entry.data.get(const.CONF_MANUAL_LATITUDE),
        )
        self._manual_longitude = config_entry.options.get(
            const.CONF_MANUAL_LONGITUDE,
            config_entry.data.get(const.CONF_MANUAL_LONGITUDE),
        )
        self._manual_elevation = config_entry.options.get(
            const.CONF_MANUAL_ELEVATION,
            config_entry.data.get(const.CONF_MANUAL_ELEVATION),
        )

    async def async_step_init(self, user_input=None):
        """Entry point: go straight to the coordinate configuration."""
        return await self.async_step_coordinates(user_input)

    async def _show_coordinate_step(self, user_input):
        """Show the coordinate configuration step."""
        # Get current Home Assistant coordinates for display
        ha_lat = self.hass.config.as_dict().get(CONF_LATITUDE)
        ha_lon = self.hass.config.as_dict().get(CONF_LONGITUDE)
        ha_elev = self.hass.config.as_dict().get(CONF_ELEVATION)

        # Build data schema with defaults
        schema_dict = {
            vol.Required(
                const.CONF_MANUAL_COORDINATES_ENABLED,
                default=self._manual_coordinates_enabled,
            ): bool,
        }

        # Add coordinate fields only if manual coordinates are enabled
        if self._manual_coordinates_enabled:
            schema_dict.update(
                {
                    vol.Required(
                        const.CONF_MANUAL_LATITUDE,
                        default=self._manual_latitude or ha_lat,
                    ): vol.All(vol.Coerce(float), vol.Range(min=-90, max=90)),
                    vol.Required(
                        const.CONF_MANUAL_LONGITUDE,
                        default=self._manual_longitude or ha_lon,
                    ): vol.All(vol.Coerce(float), vol.Range(min=-180, max=180)),
                    vol.Optional(
                        const.CONF_MANUAL_ELEVATION,
                        default=self._manual_elevation or ha_elev or 0,
                    ): vol.All(vol.Coerce(float), vol.Range(min=-1000, max=9000)),
                }
            )

        return self.async_show_form(
            step_id="coordinates",
            data_schema=vol.Schema(schema_dict),
            errors=self._errors,
        )

    async def async_step_coordinates(self, user_input=None):
        """Handle the coordinate configuration step."""
        if user_input is not None:
            try:
                enabled = user_input[const.CONF_MANUAL_COORDINATES_ENABLED]

                # If the toggle was just turned on, re-show the form so the
                # latitude/longitude fields appear (they were hidden before).
                if enabled and not self._manual_coordinates_enabled:
                    self._manual_coordinates_enabled = True
                    return await self._show_coordinate_step(user_input)

                self._manual_coordinates_enabled = enabled
                final_data = {
                    const.CONF_MANUAL_COORDINATES_ENABLED: enabled,
                }

                if enabled:
                    self._manual_latitude = user_input[const.CONF_MANUAL_LATITUDE]
                    self._manual_longitude = user_input[const.CONF_MANUAL_LONGITUDE]
                    self._manual_elevation = user_input.get(
                        const.CONF_MANUAL_ELEVATION, 0
                    )
                    final_data.update(
                        {
                            const.CONF_MANUAL_LATITUDE: self._manual_latitude,
                            const.CONF_MANUAL_LONGITUDE: self._manual_longitude,
                            const.CONF_MANUAL_ELEVATION: self._manual_elevation,
                        }
                    )

                return self.async_create_entry(title="", data=final_data)

            except Exception:  # noqa: BLE001
                self._errors["base"] = "invalid_coordinates"

        return await self._show_coordinate_step(user_input)
