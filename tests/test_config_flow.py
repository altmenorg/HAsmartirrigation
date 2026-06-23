"""Test the Smart Irrigation config flow."""

from unittest import mock

import pytest
from homeassistant.const import CONF_ACCESS_TOKEN, CONF_NAME, CONF_PATH
from pytest_homeassistant_custom_component.common import (
    AsyncMock,
    MockConfigEntry,
    patch,
)

from custom_components.smart_irrigation import config_flow
from custom_components.smart_irrigation.const import DOMAIN
