"""Config flow for the Smart Irrigation integration."""

from homeassistant import config_entries
from homeassistant.core import callback

from . import const
from .options_flow import SmartIrrigationOptionsFlowHandler


class SmartIrrigationConfigFlow(config_entries.ConfigFlow, domain=const.DOMAIN):
    """Config flow for SmartIrrigation.

    Setup asks nothing: one step that says where Smart Irrigation is set up,
    and a Submit. It used to ask for a "unique name of the integration", which
    nothing showed afterwards and nothing could clash with, since only one
    instance is allowed. The weather service, the sensor groups and the zones
    are set up in the panel, by its assistant.
    """

    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_POLL

    async def async_step_user(self, user_input=None):
        """Handle a flow initialized by the user."""
        # Only a single instance of the integration
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is None:
            return self.async_show_form(step_id="user")

        # The entry's unique id is the hub device's identifier. It was the
        # name typed here, "Smart Irrigation" unless changed; an installation
        # keeps whatever it has.
        await self.async_set_unique_id(const.NAME)
        self._abort_if_unique_id_configured()
        # Install with no weather service; it is enabled and chosen later from
        # the panel.
        return self.async_create_entry(
            title=const.NAME,
            data={
                const.CONF_INSTANCE_NAME: const.NAME,
                const.CONF_USE_WEATHER_SERVICE: False,
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get options flow."""
        return SmartIrrigationOptionsFlowHandler(config_entry)
