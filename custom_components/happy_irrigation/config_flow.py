"""Config flow for the HAppy Irrigation integration."""

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
        self._migration_offered = False
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

        # First run: if a legacy Smart Irrigation configuration exists, offer to
        # import it before the normal setup questions.
        if user_input is None and not self._migration_offered:
            self._migration_offered = True
            if await self.hass.async_add_executor_job(self._legacy_storage_exists):
                return await self.async_step_migrate()

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

    def _legacy_storage_exists(self) -> bool:
        """Return True if a legacy Smart Irrigation storage file is present."""
        import os

        return os.path.exists(
            self.hass.config.path(".storage", f"{const.LEGACY_DOMAIN}.storage")
        )

    async def async_step_migrate(self, user_input=None):
        """Offer to import an existing Smart Irrigation configuration."""
        if user_input is not None:
            if user_input.get("import_existing"):
                # Give the imported entry a stable unique_id, exactly like the
                # normal setup flow does (_check_unique). Without it,
                # entry.unique_id stays None and the "if entry.unique_id is None"
                # branch in async_setup_entry fires on every restart — which used
                # to wipe entry.data (incl. the weather-service API key) each time.
                await self.async_set_unique_id(const.NAME)
                self._abort_if_unique_id_configured()
                # Carry over the weather-service settings + API key from the
                # legacy config entry NOW (they live in the entry, not the
                # storage file), and flag the entry so async_setup_entry imports
                # the zones/modules/mappings from the legacy storage.
                data = {
                    const.CONF_IMPORT_FROM_LEGACY: True,
                    const.CONF_INSTANCE_NAME: const.NAME,
                }
                legacy = self.hass.config_entries.async_entries(const.LEGACY_DOMAIN)
                if legacy:
                    legacy_data = legacy[0].data
                    for key in (
                        const.CONF_USE_WEATHER_SERVICE,
                        const.CONF_WEATHER_SERVICE,
                        const.CONF_WEATHER_SERVICE_API_KEY,
                    ):
                        if key in legacy_data:
                            data[key] = legacy_data[key]
                return self.async_create_entry(title=const.NAME, data=data)
            # Declined: fall through to the normal first-time setup.
            return await self._show_step_user(None)
        return self.async_show_form(
            step_id="migrate",
            data_schema=vol.Schema(
                {vol.Required("import_existing", default=True): bool}
            ),
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
                    vol.Required(const.CONF_WEATHER_SERVICE): selector(
                        {"select": {"options": const.CONF_WEATHER_SERVICES}}
                    ),
                    vol.Required(const.CONF_WEATHER_SERVICE_API_KEY): str,
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
