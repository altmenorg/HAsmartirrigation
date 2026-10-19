"""Install the blueprints we bundle into the user's own blueprint folders.

Home Assistant has no API for "this integration ships blueprints", so we copy
the YAML files next to this module into ``config/blueprints/<domain>/
smart_irrigation/`` when the integration starts. Users get working examples for
their hardware without hunting through the documentation first.

The copy is skipped whenever a file of that name is already there, so a
blueprint somebody has imported or edited by hand is never overwritten. The
flip side is that an improved blueprint reaches existing users through the
import link in the docs rather than silently behind their back, which is the
trade we want for something that opens valves.

Every filesystem error is logged and swallowed: failing to lay down an example
automation must never stop the integration from setting up.
"""

import hashlib
import logging
import shutil
from pathlib import Path

from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

BUNDLED_BLUEPRINTS = Path(__file__).parent / "blueprints"

# Copies we shipped that Home Assistant rejects, by file name and by the SHA-256
# of their text with line endings normalised. Nobody can be using one, so an
# exact match is replaced by the corrected file; a copy edited by hand no longer
# matches and is left alone, as every other existing file is.
BROKEN_SHIPPED_COPIES = {
    # `required: false` on an input, not a blueprint key (#926).
    "weather-responsive-scheduling.yaml": {
        "f3c1f4b3d8a2f9128129c2c1cd8baa88b71dd075f55ee01119f62a27433aaf16",
    },
}


def _is_broken_shipped_copy(target: Path) -> bool:
    """Whether this file is, byte for byte, one we shipped broken."""
    known = BROKEN_SHIPPED_COPIES.get(target.name)
    if not known:
        return False
    try:
        text = target.read_bytes().replace(b"\r\n", b"\n")
    except OSError:
        return False
    return hashlib.sha256(text).hexdigest() in known


def install_bundled_blueprints(config_dir: str) -> int:
    """Copy every bundled blueprint the user does not already have.

    Returns the number of files actually written. Blocking, so call it through
    an executor job.
    """
    try:
        # One sub-directory per blueprint domain: automation, script.
        domains = sorted(p for p in BUNDLED_BLUEPRINTS.iterdir() if p.is_dir())
    except OSError as err:
        _LOGGER.debug("No bundled blueprints to install: %s", err)
        return 0

    installed = 0
    for domain_dir in domains:
        target_dir = Path(config_dir) / "blueprints" / domain_dir.name / DOMAIN
        for source in sorted(domain_dir.glob("*.yaml")):
            target = target_dir / source.name
            if target.exists() and not _is_broken_shipped_copy(target):
                continue
            try:
                target_dir.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(source, target)
            except OSError as err:
                _LOGGER.warning(
                    "Could not install the %s blueprint: %s", source.name, err
                )
                continue
            installed += 1
            _LOGGER.debug("Installed blueprint %s", target)

    if installed:
        _LOGGER.info(
            "Installed %s Smart Irrigation blueprint(s). They show up under "
            "Settings > Automations & scenes > Blueprints",
            installed,
        )
    return installed


async def async_install_bundled_blueprints(hass: HomeAssistant) -> int:
    """Install the bundled blueprints without blocking the event loop."""
    try:
        return await hass.async_add_executor_job(
            install_bundled_blueprints, hass.config.config_dir
        )
    except Exception:  # noqa: BLE001 - setup must survive anything here
        _LOGGER.exception("Installing the bundled blueprints failed")
        return 0
