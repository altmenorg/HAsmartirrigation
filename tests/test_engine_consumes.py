"""Every shipped engine has to say which sources it reads.

The sensor-group editor offers only those, so an engine that declares nothing
would have its group edited blind, and an engine whose declaration is wrong
would have a source hidden that its calculation actually needs.
"""

from pathlib import Path

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calcmodules.consumes import (
    ALWAYS_CONSUMED,
    CONSUMED_BY_ENGINE,
    consumed_mappings,
    required_mappings,
)

CALCMODULES = Path("custom_components/smart_irrigation/calcmodules")


def _shipped_engine_dirs():
    return sorted(
        p.name
        for p in CALCMODULES.iterdir()
        if p.is_dir() and (p / "__init__.py").exists() and not p.name.startswith("_")
    )


def test_there_are_engines_to_check():
    assert _shipped_engine_dirs()


@pytest.mark.parametrize("directory", _shipped_engine_dirs())
def test_every_shipped_engine_declares_its_sources(directory):
    """Adding an engine without declaring what it reads must fail here."""
    declared = {name.lower() for name in CONSUMED_BY_ENGINE}

    assert directory.lower() in declared, (
        f"the {directory} engine ships but does not say which sources it reads, "
        "so its sensor groups would be edited blind"
    )


def test_pyeto_asks_for_the_weather_and_not_for_evapotranspiration():
    sources = consumed_mappings("PyETO")

    assert const.MAPPING_TEMPERATURE in sources
    assert const.MAPPING_WINDSPEED in sources
    assert const.MAPPING_EVAPOTRANSPIRATION not in sources


def test_passthrough_asks_only_for_evapotranspiration():
    sources = consumed_mappings("Passthrough")

    assert const.MAPPING_EVAPOTRANSPIRATION in sources
    assert const.MAPPING_TEMPERATURE not in sources
    assert const.MAPPING_WINDSPEED not in sources


def test_static_asks_for_no_weather_at_all():
    """Its delta lives in the module's own configuration."""
    assert set(consumed_mappings("Static")) == set(ALWAYS_CONSUMED)


@pytest.mark.parametrize("engine", [*CONSUMED_BY_ENGINE, "Something else", None])
def test_rain_always_counts(engine):
    """The bucket is evapotranspiration minus rain, whichever engine produced it."""
    sources = consumed_mappings(engine)

    for rain in ALWAYS_CONSUMED:
        assert rain in sources


def test_an_unknown_engine_hides_nothing():
    """A third-party engine should leave the editor as it was, not empty it."""
    sources = consumed_mappings("Not one of ours")

    for declared in CONSUMED_BY_ENGINE.values():
        for source in declared:
            assert source in sources


def test_pyeto_requires_only_temperature_and_wind():
    """Every other input has an FAO-56 fallback in the engine.

    Dew point falls back to humidity and then to the minimum temperature,
    pressure to the elevation, radiation to the temperature range. Without
    temperature or wind PyETO prices the day at 0.
    """
    assert set(required_mappings("PyETO")) == {
        const.MAPPING_TEMPERATURE,
        const.MAPPING_WINDSPEED,
    }


def test_passthrough_requires_its_evapotranspiration():
    assert required_mappings("Passthrough") == [const.MAPPING_EVAPOTRANSPIRATION]


def test_static_and_unknown_engines_require_nothing():
    assert required_mappings("Static") == []
    assert required_mappings("Not one of ours") == []


def test_what_is_required_is_also_consumed():
    for engine in ("PyETO", "Passthrough", "Static"):
        assert set(required_mappings(engine)) <= set(consumed_mappings(engine))


async def test_the_engine_templates_carry_what_they_read_and_require():
    """The setup assistant reads the templates, not the installed modules.

    Without ``consumes`` on them it fell back to every source there is, and
    asked a PyETO zone for an evapotranspiration sensor and every other field,
    each of them mandatory.
    """
    from unittest.mock import AsyncMock, MagicMock

    from custom_components.smart_irrigation.websockets import (
        websocket_get_all_modules,
    )

    coordinator = MagicMock()
    coordinator.async_get_all_modules = AsyncMock(
        return_value=[{"name": "PyETO", "description": "d", "config": {}}]
    )
    hass = MagicMock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    connection = MagicMock()

    await websocket_get_all_modules.__wrapped__(hass, connection, {"id": 1})

    (template,) = connection.send_result.call_args[0][1]
    assert template["consumes"] == consumed_mappings("PyETO")
    assert set(template["requires"]) == {
        const.MAPPING_TEMPERATURE,
        const.MAPPING_WINDSPEED,
    }
