"""Options flow handler for Smart Irrigation integration.

Everything is set in the integration's own panel, so the integration page's
"Configure" only says where to go.

It used to ask for manual coordinates, but what it stored was never read: the
weather is fetched for the coordinates set on the panel (Weather > Weather
service), kept in the integration's own store. Somebody typed a latitude there,
saw the integration reload, and nothing changed. Saying where the setting
really is beats a form that does nothing. (The entry's options are left as they
are: the weather service keys an older Reconfigure left there still apply.)
"""

from homeassistant import config_entries


class SmartIrrigationOptionsFlowHandler(config_entries.OptionsFlow):
    """Smart Irrigation options flow handler: points to the panel."""

    def __init__(self, config_entry) -> None:
        """Initialize the options flow."""
        # config_entry is not kept: HA sets self.config_entry itself (2025.12).

    async def async_step_init(self, user_input=None):
        """Say that the settings are in the panel."""
        return self.async_abort(reason="use_panel")
