"""The companion Lovelace card: served by the integration, registered for you.

The panel is where an installation is configured, which is occasional work. The
card is what an owner looks at daily, next to the lights: what each zone is
short of, when the water goes on, and why it would not.

A card usually means a HACS install and a hand-written resource entry, which
is a lot to ask for something the integration already ships. So the file is
served from the integration folder and the Lovelace resource is created and
kept up to date here. The registration is a no-op on a YAML-mode dashboard,
where resources belong to the user's own file: there the log says what to add.
"""

import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import (
    CARD_FILENAME,
    CARD_URL,
    CUSTOM_COMPONENTS,
    INTEGRATION_FOLDER,
    PANEL_FOLDER,
    VERSION,
)

_LOGGER = logging.getLogger(__name__)

# Home Assistant's Lovelace data lives under this key, and its resources are a
# storage collection only when the dashboard is in storage mode.
LOVELACE_DATA = "lovelace"


def _stamp(path: Path) -> int | None:
    """The file's modification time, or None when it cannot be read."""
    try:
        return int(path.stat().st_mtime)
    except OSError:  # pragma: no cover - defensive
        return None


def card_module_url(stamp: int | None) -> str:
    """The resource URL, carrying the version and the file's own timestamp.

    A fixed URL is cached by the browser and by the frontend's service worker,
    so a card replaced by an update keeps rendering the old code. The version
    only moves at a release, so the file's timestamp goes in too, which is what
    moves whenever the file does. This is the panel's rule, for the same
    reason.
    """
    url = f"{CARD_URL}?v={VERSION}"
    return url if stamp is None else f"{url}.{stamp}"


def _resources(hass: HomeAssistant):
    """The Lovelace resource collection, when there is one we may write to."""
    lovelace = hass.data.get(LOVELACE_DATA)
    resources = getattr(lovelace, "resources", None)
    if resources is None:
        return None
    # A YAML-mode dashboard has a read-only collection: it has no create.
    if not hasattr(resources, "async_create_item"):
        return None
    return resources


def _existing(items, url_without_query: str) -> dict | None:
    """The resource entry that already points at our card, whatever its query."""
    for item in items or []:
        url = item.get("url") or ""
        if url.split("?")[0] == url_without_query:
            return item
    return None


async def async_register_card(hass: HomeAssistant) -> None:
    """Serve the card and make sure Lovelace knows where to find it.

    A dashboard card is a convenience. Nothing it needs is worth failing the
    setup of an integration whose job is to water a garden, so whatever goes
    wrong here is a warning and the rest of the setup carries on.
    """
    try:
        await _async_register_card(hass)
    except Exception:  # noqa: BLE001 - see the docstring
        _LOGGER.warning(
            "Could not set up the Smart Irrigation dashboard card. Everything "
            "else works; the panel is unaffected",
            exc_info=True,
        )


async def _async_register_card(hass: HomeAssistant) -> None:
    """Serve the file, then create or refresh its Lovelace resource."""
    root_dir = Path(hass.config.path(CUSTOM_COMPONENTS)) / INTEGRATION_FOLDER
    card_file = root_dir / PANEL_FOLDER / CARD_FILENAME

    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(card_file), cache_headers=False)]
    )

    stamp = await hass.async_add_executor_job(_stamp, card_file)
    url = card_module_url(stamp)

    resources = _resources(hass)
    if resources is None:
        _LOGGER.info(
            "Lovelace resources are managed in YAML here, so the card is not "
            "registered automatically. Add it with: url: %s, type: module",
            url,
        )
        return

    try:
        # The collection loads lazily, and reading it before it has is empty,
        # which would add a second entry on every restart.
        if hasattr(resources, "async_get_info"):
            await resources.async_get_info()
        existing = _existing(resources.async_items(), CARD_URL)
        if existing is None:
            await resources.async_create_item({"res_type": "module", "url": url})
            _LOGGER.info("Registered the Smart Irrigation card with Lovelace")
        elif existing.get("url") != url:
            # Same card, new build: point the existing entry at the new URL
            # rather than leaving the browser on the cached one.
            await resources.async_update_item(existing["id"], {"url": url})
            _LOGGER.debug("Updated the Smart Irrigation card resource to %s", url)
    except Exception:  # noqa: BLE001 - the card is never worth failing setup for
        _LOGGER.warning(
            "Could not register the Smart Irrigation card with Lovelace. Add it "
            "by hand if you want it: url: %s, type: module",
            url,
            exc_info=True,
        )
