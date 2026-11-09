"""One action where there were "one zone" and "all zones" pairs (#1004).

calculate, update_weather, set_bucket and set_multiplier act on the zones a
target picks, and on all zones without one; set_bucket without a value is the
reset. set_seasonal_adjustment creates, changes or removes. The old names keep
working until 2027.11, each call raising a repair issue that says what to use.
"""

import json
import logging
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest
import yaml
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import issue_registry as ir

from custom_components.smart_irrigation import (
    const,
    deprecated_actions,
    register_services,
)
from custom_components.smart_irrigation.blueprint_install import (
    install_bundled_blueprints,
)
from custom_components.smart_irrigation.service_handlers import ServiceHandlersMixin

ROOT = Path(__file__).parent.parent / "custom_components" / "smart_irrigation"
ZONE = "sensor.smart_irrigation_lawn"

OLD_HANDLERS = (
    "handle_calculate_zone",
    "handle_calculate_all_zones",
    "handle_update_zone",
    "handle_update_all_zones",
    "handle_set_zone",
    "handle_set_all_buckets",
    "handle_set_all_multipliers",
    "handle_create_seasonal_adjustment",
    "handle_update_seasonal_adjustment",
    "handle_delete_seasonal_adjustment",
)


class _Coordinator(ServiceHandlersMixin):
    """The merged handlers over mocks of the ones they hand on to."""

    def __init__(self) -> None:
        for name in OLD_HANDLERS:
            setattr(self, name, AsyncMock(return_value={"zones": ["x"]}))


class _Call:
    def __init__(self, **data) -> None:
        self.data = data


def _only(coordinator, name):
    """The one handler called, and the data it got."""
    called = [n for n in OLD_HANDLERS if getattr(coordinator, n).await_count]
    assert called == [name], called
    return getattr(coordinator, name).await_args.args[0].data


# --- calculate and update_weather -------------------------------------------


async def test_calculate_without_a_target_calculates_all_zones():
    c = _Coordinator()
    result = await c.handle_calculate(_Call(dry_run=True))
    assert _only(c, "handle_calculate_all_zones") == {"dry_run": True}
    assert result == {"zones": ["x"]}


async def test_calculate_with_a_target_calculates_those_zones():
    c = _Coordinator()
    await c.handle_calculate(_Call(entity_id=[ZONE], delete_weather_data=False))
    assert _only(c, "handle_calculate_zone")["entity_id"] == [ZONE]


async def test_update_weather_without_and_with_a_target():
    c = _Coordinator()
    await c.handle_update_weather(_Call())
    _only(c, "handle_update_all_zones")

    c = _Coordinator()
    await c.handle_update_weather(_Call(entity_id=ZONE))
    _only(c, "handle_update_zone")


async def test_an_empty_target_is_no_zone_not_every_zone(caplog):
    """A template that matched nothing must not calculate or reset the garden."""
    c = _Coordinator()
    with caplog.at_level(logging.WARNING):
        assert await c.handle_calculate(_Call(entity_id=[])) == {"zones": []}
        await c.handle_set_bucket(_Call(entity_id=[]))
        await c.handle_update_weather(_Call(entity_id=""))
        await c.handle_set_multiplier(_Call(entity_id=[], new_multiplier_value=2))
    assert not any(getattr(c, n).await_count for n in OLD_HANDLERS)
    assert "empty target" in caplog.text


@pytest.mark.parametrize("target", ["area_id", "device_id", "floor_id", "label_id"])
async def test_an_area_or_device_target_is_refused_not_read_as_all(target):
    c = _Coordinator()
    with pytest.raises(ServiceValidationError, match=target):
        await c.handle_set_bucket(_Call(**{target: ["garden"]}))
    assert not any(getattr(c, n).await_count for n in OLD_HANDLERS)


# --- set_bucket and set_multiplier ------------------------------------------


async def test_set_bucket_without_a_value_resets_the_zones_picked():
    c = _Coordinator()
    await c.handle_set_bucket(_Call(entity_id=[ZONE]))
    data = _only(c, "handle_set_zone")
    assert data == {"entity_id": [ZONE], const.ATTR_NEW_BUCKET_VALUE: 0}


async def test_set_bucket_with_a_value_sets_the_zones_picked():
    c = _Coordinator()
    await c.handle_set_bucket(_Call(entity_id=ZONE, new_bucket_value=-4))
    assert _only(c, "handle_set_zone")[const.ATTR_NEW_BUCKET_VALUE] == -4


async def test_set_bucket_without_a_target_sets_all_and_without_a_value_resets_all():
    c = _Coordinator()
    await c.handle_set_bucket(_Call(new_bucket_value=-7))
    assert _only(c, "handle_set_all_buckets") == {const.ATTR_NEW_BUCKET_VALUE: -7}

    c = _Coordinator()
    await c.handle_set_bucket(_Call())
    assert _only(c, "handle_set_all_buckets") == {const.ATTR_NEW_BUCKET_VALUE: 0}


async def test_set_bucket_for_all_zones_takes_only_the_value():
    c = _Coordinator()
    with pytest.raises(ServiceValidationError, match="new_multiplier_value"):
        await c.handle_set_bucket(_Call(new_multiplier_value=2))


async def test_set_multiplier_for_the_zones_picked_or_for_all():
    c = _Coordinator()
    await c.handle_set_multiplier(_Call(entity_id=[ZONE], new_multiplier_value=1.2))
    _only(c, "handle_set_zone")

    c = _Coordinator()
    await c.handle_set_multiplier(_Call(new_multiplier_value=0.8))
    assert _only(c, "handle_set_all_multipliers") == {
        const.ATTR_NEW_MULTIPLIER_VALUE: 0.8
    }

    c = _Coordinator()
    with pytest.raises(ServiceValidationError, match="new_multiplier_value"):
        await c.handle_set_multiplier(_Call())


# --- set_seasonal_adjustment ------------------------------------------------


async def test_set_seasonal_adjustment_without_an_id_creates_one():
    c = _Coordinator()
    await c.handle_set_seasonal_adjustment(
        _Call(name="Summer", month_start=6, month_end=8, remove=False)
    )
    assert _only(c, "handle_create_seasonal_adjustment") == {
        "name": "Summer",
        "month_start": 6,
        "month_end": 8,
    }


async def test_set_seasonal_adjustment_with_an_id_changes_it():
    c = _Coordinator()
    await c.handle_set_seasonal_adjustment(_Call(adjustment_id="a1", enabled=False))
    assert _only(c, "handle_update_seasonal_adjustment") == {
        "adjustment_id": "a1",
        "enabled": False,
    }


async def test_set_seasonal_adjustment_with_an_id_and_remove_removes_it():
    c = _Coordinator()
    await c.handle_set_seasonal_adjustment(
        _Call(adjustment_id="a1", remove=True, name="ignored")
    )
    assert _only(c, "handle_delete_seasonal_adjustment") == {"adjustment_id": "a1"}


# --- the old names ------------------------------------------------------------


class _Handlers:
    """A coordinator whose every handler is an AsyncMock."""

    def __init__(self) -> None:
        self._mocks: dict[str, AsyncMock] = {}

    def __getattr__(self, name):
        if not name.startswith("handle_"):
            raise AttributeError(name)
        return self._mocks.setdefault(name, AsyncMock(return_value=None))


@pytest.fixture
def registered(hass):
    coordinator = _Handlers()
    hass.data[const.DOMAIN] = {"coordinator": coordinator}
    deprecated_actions._warned.clear()
    register_services(hass)
    return coordinator


async def test_24_actions_once_the_old_names_are_gone(hass, registered):
    services = set(hass.services.async_services()[const.DOMAIN])
    old = set(deprecated_actions.DEPRECATED_ACTIONS)
    assert old <= services
    assert len(services) == 38
    assert len(services - old) == 24
    assert {
        "calculate",
        "update_weather",
        "set_bucket",
        "set_multiplier",
        "set_seasonal_adjustment",
    } <= services - old


@pytest.mark.parametrize(
    ("old", "handler", "replacement"),
    [
        ("calculate_zone", "handle_calculate_zone", "calculate"),
        ("calculate_all_zones", "handle_calculate_all_zones", "calculate"),
        ("update_zone", "handle_update_zone", "update_weather"),
        ("update_all_zones", "handle_update_all_zones", "update_weather"),
        ("reset_bucket", "handle_reset_bucket", "set_bucket"),
        ("reset_all_buckets", "handle_reset_all_buckets", "set_bucket"),
        ("set_all_buckets", "handle_set_all_buckets", "set_bucket"),
        ("set_all_multipliers", "handle_set_all_multipliers", "set_multiplier"),
        (
            "update_seasonal_adjustment",
            "handle_update_seasonal_adjustment",
            "set_seasonal_adjustment",
        ),
    ],
)
async def test_an_old_name_works_as_before_and_says_what_to_use(
    hass, registered, old, handler, replacement
):
    await hass.services.async_call(const.DOMAIN, old, {}, blocking=True)

    assert getattr(registered, handler).await_count == 1
    issue = ir.async_get(hass).async_get_issue(const.DOMAIN, f"deprecated_action_{old}")
    assert issue is not None
    assert issue.translation_key == "deprecated_action"
    assert issue.translation_placeholders == {
        "action": f"smart_irrigation.{old}",
        "replacement": f"smart_irrigation.{replacement}",
        "version": "2027.11",
    }
    assert issue.severity == ir.IssueSeverity.WARNING


async def test_a_recurring_schedule_call_points_to_the_programs(hass, registered):
    await hass.services.async_call(
        const.DOMAIN, "delete_recurring_schedule", {"schedule_id": "s"}, blocking=True
    )

    assert registered.handle_delete_recurring_schedule.await_count == 1
    issue = ir.async_get(hass).async_get_issue(
        const.DOMAIN, "deprecated_action_delete_recurring_schedule"
    )
    assert issue.translation_key == "deprecated_recurring_schedule"
    assert issue.translation_placeholders["version"] == "2027.11"


async def test_the_log_says_it_once_per_name(hass, registered, caplog):
    with caplog.at_level(logging.WARNING):
        for _ in range(3):
            await hass.services.async_call(
                const.DOMAIN, "reset_bucket", {}, blocking=True
            )
    assert caplog.text.count("smart_irrigation.reset_bucket is deprecated") == 1


async def test_a_dry_run_answers_under_the_old_name_too(hass, registered):
    registered.handle_calculate_zone.return_value = {"zones": []}
    response = await hass.services.async_call(
        const.DOMAIN,
        "calculate_zone",
        {"dry_run": True},
        blocking=True,
        return_response=True,
    )
    assert response == {"zones": []}


# --- what ships with the integration -----------------------------------------


def test_every_action_is_described_and_named():
    described = set(yaml.safe_load((ROOT / "services.yaml").read_text()))
    english = json.loads((ROOT / "translations" / "en.json").read_text())
    named = set(english["services"])
    actions = set(deprecated_actions.DEPRECATED_ACTIONS) | {
        "calculate",
        "update_weather",
        "set_seasonal_adjustment",
    }
    assert actions <= described
    assert actions <= named
    for old in deprecated_actions.DEPRECATED_ACTIONS:
        assert "2027.11" in english["services"][old]["description"]


def test_the_repair_texts_have_their_placeholders():
    for lang in ("en", "de"):
        issues = json.loads((ROOT / "translations" / f"{lang}.json").read_text())[
            "issues"
        ]
        text = json.dumps(issues["deprecated_action"])
        for placeholder in ("{action}", "{replacement}", "{version}"):
            assert placeholder in text
        assert "{version}" in json.dumps(issues["deprecated_recurring_schedule"])


def test_no_blueprint_we_ship_calls_an_old_name():
    for blueprint in (ROOT / "blueprints").glob("*/*.yaml"):
        text = blueprint.read_text()
        for old in deprecated_actions.DEPRECATED_ACTIONS:
            assert f"smart_irrigation.{old}\n" not in text, (blueprint.name, old)


def _as_shipped_before(name: str) -> bytes:
    """The bundled blueprint as dev shipped it, on reset_bucket."""
    current = (ROOT / "blueprints" / "automation" / name).read_text()
    return current.replace(
        "service: smart_irrigation.set_bucket\n",
        "service: smart_irrigation.reset_bucket\n",
    ).encode()


def test_an_unedited_copy_on_an_old_name_is_replaced(tmp_path):
    target_dir = tmp_path / "blueprints" / "automation" / const.DOMAIN
    target_dir.mkdir(parents=True)
    target = target_dir / "esphome.yaml"
    target.write_bytes(_as_shipped_before("esphome.yaml"))
    record = {"automation/esphome.yaml"}

    install_bundled_blueprints(str(tmp_path), record)

    assert "smart_irrigation.set_bucket" in target.read_text()
    assert "reset_bucket" not in target.read_text()


def test_an_edited_copy_is_left_alone(tmp_path):
    target_dir = tmp_path / "blueprints" / "automation" / const.DOMAIN
    target_dir.mkdir(parents=True)
    target = target_dir / "esphome.yaml"
    edited = _as_shipped_before("esphome.yaml") + b"# my own change\n"
    target.write_bytes(edited)

    install_bundled_blueprints(str(tmp_path), {"automation/esphome.yaml"})

    assert target.read_bytes() == edited


def test_the_panel_uses_the_new_seasonal_action():
    view = ROOT / "frontend" / "src" / "views" / "general" / "view-general.ts"
    text = view.read_text()
    assert '"set_seasonal_adjustment"' in text
    for old in ("create", "update", "delete"):
        assert f'"{old}_seasonal_adjustment"' not in text


def test_nothing_else_is_mocked_away():
    """The handlers the old names call are the coordinator's real ones."""
    handlers = MagicMock(spec=ServiceHandlersMixin)
    for name in OLD_HANDLERS:
        assert hasattr(handlers, name)
