"""Config flow for the Smart Irrigation integration."""

import voluptuous as vol
from homeassistant import config_entries, exceptions
from homeassistant.core import callback

from . import const
from .options_flow import SmartIrrigationOptionsFlowHandler


class SmartIrrigationConfigFlow(config_entries.ConfigFlow, domain=const.DOMAIN):
    """Config flow for SmartIrrigation.

    Setup only asks for the instance name. The weather service is configured
    afterwards, on the fly, from the integration panel (Settings → Weather
    service), so it is no longer part of the install flow.
    """

    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_POLL

    def __init__(self) -> None:
        """Initialize the SmartIrrigationConfigFlow instance."""
        self._errors = {}
        self._name = ""

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
                # Install with no weather service; it is enabled and chosen later
                # from the panel.
                return self.async_create_entry(
                    title=const.NAME,
                    data={
                        const.CONF_INSTANCE_NAME: self._name,
                        const.CONF_USE_WEATHER_SERVICE: False,
                    },
                )
            except NotUnique:
                self._errors["base"] = "name"
        return await self._show_step_user(user_input)

    async def _show_step_user(self, user_input):
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(const.CONF_INSTANCE_NAME, default=const.NAME): str,
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
