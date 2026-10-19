"""The shipped blueprints have to be importable and actually wired up.

Blueprints are the bridge between the calculation and whatever runs the valves,
so they are the first thing a new user touches. They are also YAML that nothing
executes in CI, which is how four of them shipped broken at once:

- two Irrigation Unlimited ones passed a variable to ``states()`` quoted, so it
  looked up an entity literally named "duration"; the condition never passed;
- the weather one referenced five of its own inputs as bare Jinja names, which
  Home Assistant does not resolve, so the temperature and wind checks compared
  against 0 and the seasonal multiplier was empty;
- one asked for a ``switch`` for Irrigation Unlimited, which exposes
  ``binary_sensor``, and then called ``switch.turn_on`` on it.

These check the properties that would have caught all of that.
"""

import pathlib

import pytest
import yaml

BLUEPRINTS = sorted(
    pathlib.Path("custom_components/smart_irrigation/blueprints").rglob("*.yaml")
)


class _Loader(yaml.SafeLoader):
    """Understands Home Assistant's !input tag."""


_Loader.add_constructor(
    "!input", lambda loader, node: {"__input__": loader.construct_scalar(node)}
)


def _load(path):
    return yaml.load(path.read_text(encoding="utf-8"), Loader=_Loader)


def _inputs_used(document):
    """Every input actually bound with !input somewhere in the body."""
    used = set()

    def walk(node):
        if isinstance(node, dict):
            if "__input__" in node:
                used.add(node["__input__"])
                return
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)

    walk({k: v for k, v in document.items() if k != "blueprint"})
    return used


def test_there_are_blueprints_to_check():
    assert BLUEPRINTS


@pytest.mark.parametrize("path", BLUEPRINTS, ids=lambda p: p.name)
def test_blueprint_is_importable(path):
    """A file without a blueprint block cannot be imported at all."""
    document = _load(path)

    assert isinstance(document, dict)
    assert "blueprint" in document
    assert document["blueprint"].get("domain") in ("automation", "script")
    assert document["blueprint"].get("name")


@pytest.mark.parametrize("path", BLUEPRINTS, ids=lambda p: p.name)
def test_every_input_is_bound(path):
    """An input nothing binds is a field the user fills in for nothing.

    Referencing one as a bare Jinja name does not count: Home Assistant does not
    expose inputs as template variables, so it resolves to undefined.
    """
    document = _load(path)
    declared = set(document["blueprint"].get("input") or {})

    unbound = sorted(declared - _inputs_used(document))

    assert not unbound, f"declared but never bound with !input: {unbound}"


@pytest.mark.parametrize("path", BLUEPRINTS, ids=lambda p: p.name)
def test_inputs_are_not_referenced_as_bare_jinja_names(path):
    """`{{ my_input }}` silently resolves to nothing; bind it first."""
    document = _load(path)
    declared = set(document["blueprint"].get("input") or {})
    bound_names = _bound_variable_names(document)
    body = path.read_text(encoding="utf-8")

    offenders = [
        name
        for name in declared
        if name not in bound_names and f"{{{{ {name} }}}}" in body
    ]

    assert not offenders, f"used as bare template variables: {offenders}"


def _bound_variable_names(document):
    """Names a variables block binds an input to, which templates may use."""
    names = set()
    blocks = document.get("variables")
    if isinstance(blocks, dict):
        names |= {
            k for k, v in blocks.items() if isinstance(v, dict) and "__input__" in v
        }
    return names


@pytest.mark.parametrize("path", BLUEPRINTS, ids=lambda p: p.name)
def test_entity_pickers_are_filtered(path):
    """An unfiltered picker offers every entity in the house."""
    document = _load(path)

    for name, spec in (document["blueprint"].get("input") or {}).items():
        selector = (spec or {}).get("selector") or {}
        entity = selector.get("entity")
        if isinstance(entity, dict):
            assert (
                entity.get("domain")
                or entity.get("filter")
                or entity.get("integration")
            ), f"{name} has an unfiltered entity picker"


@pytest.mark.parametrize("path", BLUEPRINTS, ids=lambda p: p.name)
def test_irrigation_unlimited_entities_are_binary_sensors(path):
    """Irrigation Unlimited exposes binary sensors, not switches.

    Asking for a switch offers the wrong entities and then cannot be turned on.
    """
    document = _load(path)

    for name, spec in (document["blueprint"].get("input") or {}).items():
        if "unlimited" not in name.lower():
            continue
        selector = ((spec or {}).get("selector") or {}).get("entity") or {}
        domains = {selector.get("domain")} | {
            f.get("domain") for f in selector.get("filter") or []
        }
        assert "switch" not in domains, f"{name} asks for a switch"


@pytest.mark.parametrize("path", BLUEPRINTS, ids=lambda p: p.name)
def test_bound_variables_are_not_quoted_inside_states(path):
    """`states('duration')` looks up an entity called "duration".

    When a variable holds an entity id it has to reach states() unquoted.
    Quoting it returns "unknown" for an entity that does not exist, which reads
    as a working template and silently produces nothing: the Irrigation
    Unlimited blueprints never passed their condition, and would have sent an
    adjustment of zero seconds if they had.
    """
    document = _load(path)
    body = path.read_text(encoding="utf-8")

    offenders = [
        name
        for name in _bound_variable_names(document)
        if f"states('{name}')" in body or f'states("{name}")' in body
    ]

    assert not offenders, f"entity-id variables quoted inside states(): {offenders}"


@pytest.mark.parametrize("path", BLUEPRINTS, ids=lambda p: p.name)
def test_home_assistant_accepts_the_blueprint(path):
    """Validated with Home Assistant's own schema, as `blueprint/list` does.

    A key the schema does not know, such as `required: false` on an input,
    makes Home Assistant reject the whole file: the weather blueprint was never
    offered to anyone because of one (#926).
    """
    from homeassistant.components.blueprint.models import Blueprint
    from homeassistant.components.blueprint.schemas import BLUEPRINT_SCHEMA
    from homeassistant.util.yaml import load_yaml

    data = load_yaml(str(path))

    Blueprint(
        data, expected_domain=data["blueprint"]["domain"], schema=BLUEPRINT_SCHEMA
    )
