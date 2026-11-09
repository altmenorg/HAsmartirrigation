"""Test the Smart Irrigation config flow.

Setup asks nothing. It asked for a "unique name of the integration", which
nothing showed afterwards and nothing could clash with, since only one
instance is allowed.
"""

import json
from pathlib import Path

import pytest
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.config_flow import SmartIrrigationConfigFlow

TRANSLATIONS = (
    Path(__file__).parent.parent
    / "custom_components"
    / "smart_irrigation"
    / "translations"
)


def _flow(hass) -> SmartIrrigationConfigFlow:
    flow = SmartIrrigationConfigFlow()
    flow.hass = hass
    flow.context = {"source": "user"}
    return flow


async def test_the_form_asks_nothing(hass):
    result = await _flow(hass).async_step_user()

    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"
    assert result["data_schema"] is None


async def test_submit_installs_without_a_weather_service(hass):
    flow = _flow(hass)
    result = await flow.async_step_user({})

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == const.NAME
    assert result["data"] == {
        const.CONF_INSTANCE_NAME: const.NAME,
        const.CONF_USE_WEATHER_SERVICE: False,
    }
    # The hub device's identifier: what the name field defaulted to.
    assert flow.unique_id == const.NAME


async def test_a_second_instance_is_refused(hass):
    MockConfigEntry(domain=const.DOMAIN, unique_id="My garden").add_to_hass(hass)

    result = await _flow(hass).async_step_user()

    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"


@pytest.mark.parametrize(
    "path", sorted(TRANSLATIONS.glob("*.json")), ids=lambda p: p.stem
)
def test_no_language_asks_for_a_name(path):
    config = json.loads(path.read_text("utf-8"))["config"]
    assert "data" not in config["step"]["user"]
    assert "name" not in config.get("error", {})
