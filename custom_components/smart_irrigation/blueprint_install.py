"""Install the blueprints we bundle into the user's own blueprint folders.

Home Assistant has no API for "this integration ships blueprints", so we copy
the YAML files next to this module into ``config/blueprints/<domain>/
smart_irrigation/`` when the integration starts. Users get working examples for
their hardware without hunting through the documentation first.

The copy is skipped whenever a file of that name is already there, so a
blueprint somebody has imported or edited by hand is never overwritten. Each
one is laid down once: the ones installed are recorded, and a blueprint the
user deleted stays deleted (#930). The whole copy can be switched off in the
general settings. The flip side is that an improved blueprint reaches existing
users through the import link in the docs rather than silently behind their
back, which is the trade we want for something that opens valves. The one
exception is a copy still identical to one we shipped and had to change
(broken, or calling an action on its way out): nobody edited it, so it is
replaced.

Every filesystem error is logged and swallowed: failing to lay down an example
automation must never stop the integration from setting up.
"""

import hashlib
import logging
import shutil
from pathlib import Path

from homeassistant.core import HomeAssistant

from .const import (
    CONF_DEFAULT_INSTALL_BLUEPRINTS,
    CONF_INSTALL_BLUEPRINTS,
    CONF_INSTALLED_BLUEPRINTS,
    DOMAIN,
)

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


# Copies we shipped that call actions on their way out (#1004), by file name
# and by the SHA-256 of the version we shipped. Only versions that differ from
# today's in nothing but the action names are here: replacing one changes no
# input and no behaviour, so the automations made from it go on as before. A
# copy edited by hand no longer matches, and an older version that differs in
# more than the names is not ours to change under an automation; both keep
# working on the old names until they go, and their calls raise the repair
# issue that says so.
OUTDATED_SHIPPED_COPIES = {
    "esphome.yaml": {
        "23ab5ccb27779a005daf11439c6ee60c5ac4e6ea94d7acc521eb1c5baaac3c57",
    },
    "irrigation-unlimited-reset-bucket.yaml": {
        "cb28af6578c7d5c230c28ca1855c57df64759701da3a0d74836a1149f5cc2d1c",
    },
    "weather-responsive-scheduling.yaml": {
        "262057a37a9a9bdec990168420acd21a4cbe8a1f8bea1e364fba6a4c324fcb26",
    },
    "simple-scheduler.yaml": {
        "83050fbad5798e91000f1e11190d480c62101b041a6246a152a41d71d07aad5b",
    },
}


def _is_broken_shipped_copy(target: Path) -> bool:
    """Whether this file is, byte for byte, one we shipped that is to go.

    Broken (Home Assistant rejects it) or outdated (it calls an action on its
    way out): either way nobody edited it, so the current file replaces it.
    """
    known = BROKEN_SHIPPED_COPIES.get(target.name, set()) | (
        OUTDATED_SHIPPED_COPIES.get(target.name, set())
    )
    if not known:
        return False
    try:
        text = target.read_bytes().replace(b"\r\n", b"\n")
    except OSError:
        return False
    return hashlib.sha256(text).hexdigest() in known


def install_bundled_blueprints(config_dir: str, record: set | None = None) -> int:
    """Copy every bundled blueprint the user does not already have.

    ``record`` is the set of blueprints installed before, as
    "domain/file.yaml". It is updated in place with every one that is there
    now, and one that is in it but gone from the folder is not copied again.
    Without it every missing blueprint is copied.

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
            name = f"{domain_dir.name}/{source.name}"
            if target.exists():
                if record is not None:
                    record.add(name)
                if not _is_broken_shipped_copy(target):
                    continue
            elif record is not None and name in record:
                # Installed before and gone now: the user deleted it.
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
            if record is not None:
                record.add(name)
            _LOGGER.debug("Installed blueprint %s", target)

    if installed:
        _LOGGER.info(
            "Installed %s Smart Irrigation blueprint(s). They show up under "
            "Settings > Automations & scenes > Blueprints",
            installed,
        )
    return installed


def bundled_blueprint_names() -> list[str]:
    """Every bundled blueprint, as "domain/file.yaml"."""
    try:
        return sorted(
            f"{source.parent.name}/{source.name}"
            for source in BUNDLED_BLUEPRINTS.glob("*/*.yaml")
        )
    except OSError:
        return []


def _had_our_folder(config_dir: str) -> bool:
    """Whether an earlier version already laid blueprints down here."""
    root = Path(config_dir) / "blueprints"
    try:
        return any(
            (root / domain / DOMAIN).is_dir() for domain in ("automation", "script")
        )
    except OSError:
        return False


async def async_install_bundled_blueprints(hass: HomeAssistant, store=None) -> int:
    """Install the bundled blueprints without blocking the event loop.

    With the store, the general setting decides whether anything is copied,
    and the blueprints installed are remembered there so a deleted one is not
    laid down again. The first run with that record treats an installation
    that already had our blueprints (or zones) as having installed them all:
    the ones somebody deleted before this version stay deleted.
    """
    try:
        config = store.get_config() if store is not None else {}
        if not config.get(CONF_INSTALL_BLUEPRINTS, CONF_DEFAULT_INSTALL_BLUEPRINTS):
            return 0
        recorded = config.get(CONF_INSTALLED_BLUEPRINTS)
        record = None
        if store is not None:
            record = set(recorded or [])
            if recorded is None and (
                await hass.async_add_executor_job(
                    _had_our_folder, hass.config.config_dir
                )
                or getattr(store, "zones", None)
            ):
                record = set(bundled_blueprint_names())
        written = await hass.async_add_executor_job(
            install_bundled_blueprints, hass.config.config_dir, record
        )
        if record is not None and (recorded is None or record != set(recorded)):
            await store.async_update_config({CONF_INSTALLED_BLUEPRINTS: sorted(record)})
        return written
    except Exception:  # noqa: BLE001 - setup must survive anything here
        _LOGGER.exception("Installing the bundled blueprints failed")
        return 0
