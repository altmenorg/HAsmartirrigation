"""The controller blueprints hand each controller the run in the unit it takes.

Rain Bird, Hydrawise, Rachio and B-hyve take whole minutes, OpenSprinkler takes
seconds, each with a maximum. Smart Irrigation's duration is in seconds, so the
run is rounded up (a deficit is never left) and clamped. The template is
rendered by Home Assistant's own engine here, not re-implemented.
"""

import pathlib

import pytest
import yaml
from homeassistant.helpers.template import Template

FOLDER = pathlib.Path("custom_components/smart_irrigation/blueprints/automation")

CONTROLLERS = {
    # file: (action, duration field, maximum)
    "rainbird.yaml": ("rainbird.start_irrigation", "duration", 1440),
    "hydrawise.yaml": ("hydrawise.start_watering", "duration", 1440),
    "rachio.yaml": ("rachio.start_watering", "duration", 180),
    "opensprinkler.yaml": ("opensprinkler.run", "run_seconds", 64800),
    "bhyve.yaml": ("bhyve.start_watering", "minutes", 1440),
}


class _Loader(yaml.SafeLoader):
    pass


_Loader.add_constructor("!input", lambda loader, node: f"!input {node.value}")


def _blueprint(name):
    return yaml.load((FOLDER / name).read_text(encoding="utf-8"), Loader=_Loader)


async def _amount(hass, name, seconds):
    hass.states.async_set("sensor.lawn", str(seconds))
    source = _blueprint(name)["variables"]["amount"]
    return Template(
        source.replace("duration_entity", "'sensor.lawn'"), hass
    ).async_render()


@pytest.mark.parametrize("name", sorted(CONTROLLERS))
def test_it_calls_the_controllers_own_action(name):
    action, field, _maximum = CONTROLLERS[name]
    call = _blueprint(name)["actions"][0]

    assert call["action"] == action
    assert field in call["data"]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "name", ["rainbird.yaml", "hydrawise.yaml", "rachio.yaml", "bhyve.yaml"]
)
@pytest.mark.parametrize(
    ("seconds", "minutes"), [(30, 1), (60, 1), (61, 2), (899, 15), (3600, 60)]
)
async def test_minutes_are_rounded_up_and_at_least_one(hass, name, seconds, minutes):
    assert await _amount(hass, name, seconds) == minutes


@pytest.mark.asyncio
@pytest.mark.parametrize("name", sorted(CONTROLLERS))
async def test_a_run_is_clamped_to_what_the_controller_accepts(hass, name):
    _action, _field, maximum = CONTROLLERS[name]

    assert await _amount(hass, name, 10**7) == maximum


@pytest.mark.asyncio
async def test_opensprinkler_takes_seconds(hass):
    assert await _amount(hass, "opensprinkler.yaml", 90.4) == 91
