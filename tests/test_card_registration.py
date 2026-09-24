"""The companion card is served and registered without the user doing it.

A Lovelace card normally means a HACS install and a hand-written resource
entry. This one ships with the integration, so it registers itself, and the
things that can go wrong there must never take the integration down with them.
"""

from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest

from custom_components.smart_irrigation import card
from custom_components.smart_irrigation.const import CARD_URL, VERSION


def _hass(resources=None):
    hass = MagicMock()
    hass.config.path = Mock(return_value="/config/custom_components")
    hass.http.async_register_static_paths = AsyncMock()
    hass.async_add_executor_job = AsyncMock(return_value=1700000000)
    hass.data = {}
    if resources is not None:
        lovelace = Mock()
        lovelace.resources = resources
        hass.data["lovelace"] = lovelace
    return hass


def _storage_resources(items=()):
    resources = MagicMock()
    resources.async_get_info = AsyncMock()
    resources.async_items = Mock(return_value=list(items))
    resources.async_create_item = AsyncMock()
    resources.async_update_item = AsyncMock()
    return resources


def test_the_url_carries_the_version_and_the_file_stamp():
    """A fixed URL is cached by the browser, so an update keeps the old card."""
    assert card.card_module_url(1700000000) == f"{CARD_URL}?v={VERSION}.1700000000"


def test_without_a_readable_file_the_version_alone_is_used():
    assert card.card_module_url(None) == f"{CARD_URL}?v={VERSION}"


async def test_the_card_is_served_and_registered():
    resources = _storage_resources()
    hass = _hass(resources)

    await card.async_register_card(hass)

    hass.http.async_register_static_paths.assert_awaited_once()
    served = hass.http.async_register_static_paths.call_args[0][0][0]
    assert served.url_path == CARD_URL
    # Separators are the host's, so compare on the name alone.
    assert served.path.replace("\\", "/").endswith("dist/smart-irrigation-card.js")
    resources.async_create_item.assert_awaited_once_with(
        {"res_type": "module", "url": card.card_module_url(1700000000)}
    )


async def test_an_existing_entry_is_pointed_at_the_new_build():
    """Otherwise the browser keeps loading the cached card after an update."""
    resources = _storage_resources(
        [{"id": "res1", "url": f"{CARD_URL}?v=v2026.9.1.1600000000"}]
    )

    await card.async_register_card(_hass(resources))

    resources.async_create_item.assert_not_awaited()
    resources.async_update_item.assert_awaited_once_with(
        "res1", {"url": card.card_module_url(1700000000)}
    )


async def test_an_up_to_date_entry_is_left_alone():
    resources = _storage_resources(
        [{"id": "res1", "url": card.card_module_url(1700000000)}]
    )

    await card.async_register_card(_hass(resources))

    resources.async_create_item.assert_not_awaited()
    resources.async_update_item.assert_not_awaited()


async def test_the_collection_is_loaded_before_it_is_read():
    """It loads lazily, and reading it too early adds a second entry each restart."""
    resources = _storage_resources()

    await card.async_register_card(_hass(resources))

    resources.async_get_info.assert_awaited_once()


async def test_a_yaml_dashboard_is_not_written_to():
    """Resources belong to the user's file there, so the log says what to add."""
    yaml_resources = Mock(spec=["async_items"])
    hass = _hass(yaml_resources)

    await card.async_register_card(hass)

    # Still served: the user can add the resource by hand.
    hass.http.async_register_static_paths.assert_awaited_once()


async def test_lovelace_not_loaded_yet_is_not_an_error():
    hass = _hass()

    await card.async_register_card(hass)

    hass.http.async_register_static_paths.assert_awaited_once()


async def test_a_failing_registration_never_breaks_the_integration():
    resources = _storage_resources()
    resources.async_create_item = AsyncMock(side_effect=RuntimeError("storage is busy"))

    await card.async_register_card(_hass(resources))  # must not raise


@pytest.mark.parametrize(
    ("items", "expected"),
    [
        ([], None),
        ([{"url": "/other/card.js"}], None),
        ([{"url": f"{CARD_URL}?v=1"}], {"url": f"{CARD_URL}?v=1"}),
        ([{"url": CARD_URL}], {"url": CARD_URL}),
        ([{}], None),
    ],
)
def test_our_entry_is_recognised_whatever_its_query(items, expected):
    assert card._existing(items, CARD_URL) == expected


async def test_the_card_is_registered_at_setup():
    """The registration is wired in, not just written."""
    with patch(
        "custom_components.smart_irrigation.async_register_card", AsyncMock()
    ) as registered:
        from custom_components import smart_irrigation

        assert smart_irrigation.async_register_card is registered
