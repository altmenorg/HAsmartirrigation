"""The bundled blueprints must reach the user without ever clobbering theirs."""

from pathlib import Path

import pytest

from custom_components.smart_irrigation.blueprint_install import (
    BUNDLED_BLUEPRINTS,
    install_bundled_blueprints,
)


def _bundled():
    return sorted(BUNDLED_BLUEPRINTS.glob("*/*.yaml"))


def test_we_actually_bundle_blueprints():
    """A silent regression here would ship an empty folder."""
    assert _bundled(), f"no blueprints found under {BUNDLED_BLUEPRINTS}"


def test_bundled_blueprints_live_in_a_known_domain():
    for source in _bundled():
        assert source.parent.name in ("automation", "script")


def test_every_bundled_blueprint_is_installed(tmp_path):
    installed = install_bundled_blueprints(str(tmp_path))

    assert installed == len(_bundled())
    for source in _bundled():
        target = (
            tmp_path
            / "blueprints"
            / source.parent.name
            / "smart_irrigation"
            / source.name
        )
        assert target.read_bytes() == source.read_bytes()


def test_a_blueprint_the_user_already_has_is_left_alone(tmp_path):
    source = _bundled()[0]
    target_dir = tmp_path / "blueprints" / source.parent.name / "smart_irrigation"
    target_dir.mkdir(parents=True)
    mine = target_dir / source.name
    mine.write_text("# I edited this one\n", encoding="utf-8")

    installed = install_bundled_blueprints(str(tmp_path))

    assert mine.read_text(encoding="utf-8") == "# I edited this one\n"
    assert installed == len(_bundled()) - 1


def test_running_twice_installs_nothing_the_second_time(tmp_path):
    assert install_bundled_blueprints(str(tmp_path)) == len(_bundled())
    assert install_bundled_blueprints(str(tmp_path)) == 0


def test_a_filesystem_error_never_raises(tmp_path, monkeypatch):
    def boom(*args, **kwargs):
        raise OSError("read-only file system")

    monkeypatch.setattr(
        "custom_components.smart_irrigation.blueprint_install.shutil.copyfile", boom
    )

    assert install_bundled_blueprints(str(tmp_path)) == 0


def test_a_missing_bundle_is_not_an_error(tmp_path, monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.blueprint_install.BUNDLED_BLUEPRINTS",
        Path(tmp_path / "does-not-exist"),
    )

    assert install_bundled_blueprints(str(tmp_path)) == 0


@pytest.mark.parametrize("source", _bundled(), ids=lambda p: p.name)
def test_bundled_blueprint_declares_its_domain(source):
    """HA refuses a blueprint whose `blueprint:` block has no matching domain."""
    text = source.read_text(encoding="utf-8")
    assert f"domain: {source.parent.name}" in text


# --- a copy we shipped broken is replaced (#926) -------------------------------

BROKEN_926 = (
    Path(__file__).parent
    / "fixtures/blueprints/weather-responsive-scheduling.broken-926.yaml"
)
WEATHER = "weather-responsive-scheduling.yaml"


def _installed_weather(tmp_path, content: bytes) -> Path:
    target_dir = tmp_path / "blueprints" / "automation" / "smart_irrigation"
    target_dir.mkdir(parents=True)
    target = target_dir / WEATHER
    target.write_bytes(content)
    return target


@pytest.mark.parametrize("crlf", [False, True], ids=["lf", "crlf"])
def test_the_broken_weather_blueprint_we_shipped_is_replaced(tmp_path, crlf):
    """Home Assistant rejected it, so nobody can be using that copy, and
    without this the corrected file never reached anyone who had it."""
    broken = BROKEN_926.read_bytes().replace(b"\r\n", b"\n")
    if crlf:
        broken = broken.replace(b"\n", b"\r\n")
    target = _installed_weather(tmp_path, broken)

    install_bundled_blueprints(str(tmp_path))

    source = BUNDLED_BLUEPRINTS / "automation" / WEATHER
    assert target.read_bytes() == source.read_bytes()
    assert b"required: false" not in target.read_bytes()


def test_the_broken_one_edited_by_hand_is_left_alone(tmp_path):
    edited = BROKEN_926.read_bytes() + b"# my change\n"
    target = _installed_weather(tmp_path, edited)

    install_bundled_blueprints(str(tmp_path))

    assert target.read_bytes() == edited


# --- each blueprint once, and a switch to copy none (#930) ---------------------

from custom_components.smart_irrigation import const  # noqa: E402
from custom_components.smart_irrigation.blueprint_install import (  # noqa: E402
    async_install_bundled_blueprints,
    bundled_blueprint_names,
)


class _Store:
    def __init__(self, config=None, zones=None):
        self.config = dict(config or {})
        self.zones = zones or {}
        self.updates = []

    def get_config(self):
        return dict(self.config)

    async def async_update_config(self, changes):
        self.updates.append(changes)
        self.config.update(changes)


def _target(config_dir, name):
    domain, file = name.split("/")
    return Path(config_dir) / "blueprints" / domain / "smart_irrigation" / file


async def test_a_fresh_install_gets_every_blueprint_and_remembers_them(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    store = _Store()

    written = await async_install_bundled_blueprints(hass, store)

    assert written == len(_bundled())
    assert store.config[const.CONF_INSTALLED_BLUEPRINTS] == bundled_blueprint_names()


async def test_a_blueprint_the_user_deleted_is_not_put_back(hass, tmp_path):
    """The request: deleted by hand, back at every restart."""
    hass.config.config_dir = str(tmp_path)
    store = _Store()
    await async_install_bundled_blueprints(hass, store)
    gone = bundled_blueprint_names()[0]
    _target(tmp_path, gone).unlink()

    written = await async_install_bundled_blueprints(hass, store)

    assert written == 0
    assert not _target(tmp_path, gone).exists()


async def test_an_existing_install_keeps_what_was_deleted_before_this_version(
    hass, tmp_path
):
    """No record yet, but our folder is there: what is missing was deleted."""
    hass.config.config_dir = str(tmp_path)
    install_bundled_blueprints(str(tmp_path))
    gone = bundled_blueprint_names()[0]
    _target(tmp_path, gone).unlink()
    store = _Store()

    written = await async_install_bundled_blueprints(hass, store)

    assert written == 0
    assert not _target(tmp_path, gone).exists()
    assert gone in store.config[const.CONF_INSTALLED_BLUEPRINTS]


async def test_an_install_with_zones_but_no_folder_is_not_refilled(hass, tmp_path):
    """Somebody who deleted the whole folder already: it stays deleted."""
    hass.config.config_dir = str(tmp_path)
    store = _Store(zones={0: object()})

    assert await async_install_bundled_blueprints(hass, store) == 0
    assert not (tmp_path / "blueprints").exists()


async def test_switched_off_nothing_is_copied(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    store = _Store({const.CONF_INSTALL_BLUEPRINTS: False})

    assert await async_install_bundled_blueprints(hass, store) == 0
    assert not (tmp_path / "blueprints").exists()
    assert store.updates == []


async def test_the_broken_copy_is_still_replaced_with_a_record(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    target = _installed_weather(tmp_path, BROKEN_926.read_bytes())
    store = _Store({const.CONF_INSTALLED_BLUEPRINTS: bundled_blueprint_names()})

    await async_install_bundled_blueprints(hass, store)

    assert b"required: false" not in target.read_bytes()
