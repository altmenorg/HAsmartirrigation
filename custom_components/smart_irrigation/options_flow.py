"""Options flow handler for Smart Irrigation integration."""

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_ELEVATION, CONF_LATITUDE, CONF_LONGITUDE
from homeassistant.helpers.selector import selector

from . import const
from .helpers import CannotConnect, InvalidAuth, validate_api_key


class SmartIrrigationOptionsFlowHandler(config_entries.OptionsFlow):
    """Smart Irrigation config flow options handler."""

    # options flow should allow change of use OWM (boolean)
    # options flow should allow update of API key (if set) and version (only if api key set)

    def __init__(self, config_entry) -> None:
        """Initialize HACS options flow."""
        # removing this as it's going be deprated in HA 2025.12
        # self.config_entry = config_entry
        self.options = dict(config_entry.options)
        self._errors = {}
        # migrate from use_owm to weather_service
        if "use_owm" in config_entry.data:
            self._use_weather_service = config_entry.data.get("use_owm")
            self._weather_service = const.CONF_WEATHER_SERVICE_OWM
            self._weather_service_api_key = config_entry.data.get("owm_api_key")
        if const.CONF_USE_WEATHER_SERVICE in self.options and self.options.get(
            const.CONF_USE_WEATHER_SERVICE
        ) != config_entry.data.get(const.CONF_USE_WEATHER_SERVICE):
            self._use_weather_service = self.options.get(const.CONF_USE_WEATHER_SERVICE)
        else:
            self._use_weather_service = config_entry.data.get(
                const.CONF_USE_WEATHER_SERVICE
            )
        if const.CONF_WEATHER_SERVICE in self.options:
            self._weather_service = self.options.get(const.CONF_WEATHER_SERVICE)
        else:
            self._weather_service = config_entry.data.get(const.CONF_WEATHER_SERVICE)
        if const.CONF_WEATHER_SERVICE_API_KEY in self.options:
            self._weather_service_api_key = self.options.get(
                const.CONF_WEATHER_SERVICE_API_KEY
            )
        else:
            self._weather_service_api_key = config_entry.data.get(
                const.CONF_WEATHER_SERVICE_API_KEY
            )
        if self._weather_service_api_key is not None:
            self._weather_service_api_key = self._weather_service_api_key.strip()
        if const.CONF_WEATHER_SERVICE_API_VERSION in self.options:
            self._owm_api_version = self.options.get(
                const.CONF_WEATHER_SERVICE_API_VERSION
            )
        else:
            self._owm_api_version = config_entry.data.get(
                const.CONF_WEATHER_SERVICE_API_VERSION
            )

        # Initialize manual coordinate settings
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

    async def async_step_init(self, user_input=None):  # pylint: disable=unused-argument
        """Manage the options."""
        self._errors = {}
        # set default values based on config
        if user_input is not None:
            # validation
            try:
                # store values entered
                self._use_weather_service = user_input[const.CONF_USE_WEATHER_SERVICE]

                if not self._use_weather_service:
                    # update the entry right away and remove the API info, include days setting
                    user_input[const.CONF_WEATHER_SERVICE_API_KEY] = None
                    # forcing it to be 3.0 because of sunsetting of 2.5 API by OWM in June 2024
                    # user_input[const.CONF_WEATHER_SERVICE_API_VERSION] = "3.0"
                    return self.async_create_entry(title="", data=user_input)
                # show the next step where you can configure / update API key/version
                return await self._show_step_1(user_input)

            except InvalidAuth:
                self._errors["base"] = "auth"
            except CannotConnect:
                self._errors["base"] = "auth"

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        const.CONF_USE_WEATHER_SERVICE,
                        default=self._use_weather_service,
                    ): bool,
                }
            ),
            errors=self._errors,
        )

    async def _show_step_1(self, user_input):
        return self.async_show_form(
            step_id="step1",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        const.CONF_WEATHER_SERVICE, default=self._weather_service
                    ): selector({"select": {"options": const.CONF_WEATHER_SERVICES}}),
                    vol.Required(
                        const.CONF_WEATHER_SERVICE_API_KEY,
                        default=self._weather_service_api_key,
                    ): str,
                    # vol.Required(const.CONF_OWM_API_VERSION, default=self._owm_api_version): selector(
                    #    {"select": {"options": ["2.5", "3.0"]}}
                    # ),
                }
            ),
            errors=self._errors,
        )

    async def async_step_step1(self, user_input=None):
        """Handle a step 1."""

        self._errors = {}
        if user_input is not None:
            try:
                # store values entered
                self._weather_service_api_key = user_input[
                    const.CONF_WEATHER_SERVICE_API_KEY
                ].strip()
                self._weather_service = user_input[const.CONF_WEATHER_SERVICE]
                # forcing it to be 3.0 because of sunsetting of 2.5 API by OWM in June 2024
                # user_input[const.CONF_WEATHER_SERVICE_API_VERSION] = "3.0"
                # self._owm_api_version = user_input[
                #    const.CONF_WEATHER_SERVICE_API_VERSION
                # ]
                user_input[const.CONF_USE_WEATHER_SERVICE] = self._use_weather_service
                await validate_api_key(
                    self.hass, self._weather_service, self._weather_service_api_key
                )
                # After weather service configuration, go to coordinate step
                return await self._show_coordinate_step(user_input)

            except InvalidAuth:
                self._errors["base"] = "auth"
            except CannotConnect:
                self._errors["base"] = "auth"

            return await self._show_step_1(user_input)
        return await self._show_step_1(user_input)

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
                # Store coordinate settings
                self._manual_coordinates_enabled = user_input[
                    const.CONF_MANUAL_COORDINATES_ENABLED
                ]

                # Merge weather service data with coordinate data
                final_data = {
                    const.CONF_USE_WEATHER_SERVICE: self._use_weather_service,
                    const.CONF_WEATHER_SERVICE: self._weather_service,
                    const.CONF_WEATHER_SERVICE_API_KEY: self._weather_service_api_key,
                    const.CONF_MANUAL_COORDINATES_ENABLED: self._manual_coordinates_enabled,
                }

                if self._manual_coordinates_enabled:
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

            except Exception:
                self._errors["base"] = "invalid_coordinates"

        return await self._show_coordinate_step(user_input)
