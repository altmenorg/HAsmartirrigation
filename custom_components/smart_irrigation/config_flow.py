"""Config flow for the Smart Irrigation integration."""

import voluptuous as vol
from homeassistant import config_entries, exceptions
from homeassistant.core import callback
from homeassistant.helpers.selector import selector

from . import const
from .helpers import CannotConnect, InvalidAuth, validate_api_key
from .options_flow import SmartIrrigationOptionsFlowHandler


class SmartIrrigationConfigFlow(config_entries.ConfigFlow, domain=const.DOMAIN):
    """Config flow for SmartIrrigation."""

    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_POLL

    def __init__(self) -> None:
        """Initialize the SmartIrrigationConfigFlow instance."""
        self._errors = {}
        self._name = ""
        self._use_weather_service = False
        self._weather_service_api_key = ""
        self._weather_service = ""
        # not needed anymore because versions are hardcoded
        # self._forecasting_api_version = 3.0

    async def async_step_user(self, user_input=None):
        """Handle a flow initialized by the user."""

        self._errors = {}
        # Only a single instance of the integration
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            try:
                await self._check_unique(user_input[const.CONF_INSTANCE_NAME])
                self._name = user_input[const.CONF_INSTANCE_NAME]
                self._use_weather_service = user_input[const.CONF_USE_WEATHER_SERVICE]
                if not self._use_weather_service:
                    # else create the entry right away
                    return self.async_create_entry(title=const.NAME, data=user_input)
                return await self._show_step_1(user_input)
            except NotUnique:
                self._errors["base"] = "name"
        return await self._show_step_user(user_input)

    async def _show_step_user(self, user_input):
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(const.CONF_INSTANCE_NAME, default=const.NAME): str,
                    vol.Required(const.CONF_USE_WEATHER_SERVICE, default=True): bool,
                }
            ),
            errors=self._errors,
        )

    async def async_step_step1(self, user_input=None):
        """Handle a step 1."""

        self._errors = {}
        if user_input is not None:
            try:
                # store values entered (api key is optional for keyless services
                # such as Open-Meteo)
                self._weather_service_api_key = user_input.get(
                    const.CONF_WEATHER_SERVICE_API_KEY, ""
                ).strip()
                self._weather_service = user_input[const.CONF_WEATHER_SERVICE].strip()
                # v2024.4.5: removing handling of 2.5 API version of sunsetting by OWM in June 2024.
                # self._owm_api_version = user_input[const.CONF_OWM_API_VERSION]
                # user_input[const.CONF_FORECASTING_API_VERSION] = "3.0"
                # self._forecasting_api_version = user_input[
                #    const.CONF_FORECASTING_API_VERSION
                # ]
                user_input[const.CONF_USE_WEATHER_SERVICE] = self._use_weather_service
                user_input[const.CONF_INSTANCE_NAME] = self._name
                await validate_api_key(
                    self.hass, self._weather_service, self._weather_service_api_key
                )
                return self.async_create_entry(title=const.NAME, data=user_input)

            except InvalidAuth:
                self._errors["base"] = "auth"
            except CannotConnect:
                self._errors["base"] = "auth"

            return await self._show_step_1(user_input)
        return await self._show_step_1(user_input)

    async def _show_step_1(self, user_input):
        return self.async_show_form(
            step_id="step1",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        const.CONF_WEATHER_SERVICE,
                        default=const.CONF_DEFAULT_WEATHER_SERVICE,
                    ): selector({"select": {"options": const.CONF_WEATHER_SERVICES}}),
                    # Optional: keyless services (e.g. Open-Meteo) need no key.
                    vol.Optional(const.CONF_WEATHER_SERVICE_API_KEY, default=""): str,
                    # vol.Required(const.CONF_OWM_API_VERSION, default="3.0"): selector(
                    #    {"select": {"options": ["2.5", "3.0"]}}
                    # ),
                }
            ),
            errors=self._errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get options flow."""
        return SmartIrrigationOptionsFlowHandler(config_entry)

    async def _check_unique(self, thename):
        """Test if the specified name is not already claimed."""
        await self.async_set_unique_id(thename)
        self._abort_if_unique_id_configured()


class NotUnique(exceptions.HomeAssistantError):
    """Error to indicate there is invalid auth."""
