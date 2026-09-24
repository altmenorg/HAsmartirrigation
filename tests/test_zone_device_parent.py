"""A per-zone device names its parent the way this Home Assistant expects.

``via_device`` (the parent's identifiers) is deprecated and stops working in
Home Assistant 2027.8; ``via_device_id`` (the parent's id in the device
registry) replaces it, and passing both is an error (#833). We support Home
Assistant 2025.5 and up, which spans both forms, so the helper asks the running
version which one it knows.
"""

from unittest.mock import Mock, patch

from custom_components.smart_irrigation import const, entity


def _hass(entry_id="entry1"):
    hass = Mock()
    coordinator = Mock(id="abc123")
    coordinator.entry = Mock(entry_id=entry_id) if entry_id else None
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    return hass


class _NewRegistry:
    """A registry with the signature Home Assistant actually declares.

    A Mock accepts any arguments, so it cannot catch a call that does not
    match: the first version of this passed the identifier positionally, and
    every zone entity failed to be added on a real install, which only the
    running Home Assistant said.
    """

    def __init__(self, device_id="hubdev"):
        self.device_id = device_id
        self.calls = []

    def async_get_device_by_identifier(self, identifier: tuple, config_entry_id: str):
        self.calls.append((identifier, config_entry_id))
        return Mock(id=self.device_id) if self.device_id else None


def _registry_with_hub(device_id="hubdev", by_identifier=True):
    """A registry with only the lookup the emulated version would have."""
    if by_identifier:
        return _NewRegistry(device_id)
    registry = Mock(spec=["async_get_device"])
    registry.async_get_device.return_value = Mock(id=device_id)
    return registry


def test_the_new_form_names_the_parent_by_its_device_id():
    registry = _registry_with_hub()

    with (
        patch.object(entity, "_via_device_id_supported", return_value=True),
        patch.object(entity.dr, "async_get", return_value=registry),
    ):
        info = entity.zone_device_info(_hass(), 1, "Front lawn")

    assert info["via_device_id"] == "hubdev"
    assert "via_device" not in info, "passing both is an error"
    assert registry.calls == [((const.DOMAIN, "abc123"), "entry1")]


def test_an_older_home_assistant_still_gets_the_identifiers():
    """Supported down to 2025.5, which does not know via_device_id."""
    with patch.object(entity, "_via_device_id_supported", return_value=False):
        info = entity.zone_device_info(_hass(), 1, "Front lawn")

    assert info["via_device"] == (const.DOMAIN, "abc123")
    assert "via_device_id" not in info


def test_an_older_registry_is_looked_up_the_old_way():
    """`async_get_device` goes at the same time as `via_device`, not before."""
    registry = _registry_with_hub(by_identifier=False)

    with (
        patch.object(entity, "_via_device_id_supported", return_value=True),
        patch.object(entity.dr, "async_get", return_value=registry),
    ):
        info = entity.zone_device_info(_hass(), 1, "Front lawn")

    assert info["via_device_id"] == "hubdev"
    registry.async_get_device.assert_called_once_with(
        identifiers={(const.DOMAIN, "abc123")}
    )


def test_a_hub_device_that_is_not_registered_yet_falls_back():
    """The link matters more than the warning, so the old form still applies."""
    registry = _NewRegistry(device_id=None)

    with (
        patch.object(entity, "_via_device_id_supported", return_value=True),
        patch.object(entity.dr, "async_get", return_value=registry),
    ):
        info = entity.zone_device_info(_hass(), 1, "Front lawn")

    assert info["via_device"] == (const.DOMAIN, "abc123")


def test_without_a_config_entry_the_old_lookup_is_used():
    """The new lookup needs the entry, so there is nothing to ask it with."""
    registry = Mock(spec=["async_get_device_by_identifier", "async_get_device"])
    registry.async_get_device.return_value = Mock(id="hubdev")

    with (
        patch.object(entity, "_via_device_id_supported", return_value=True),
        patch.object(entity.dr, "async_get", return_value=registry),
    ):
        info = entity.zone_device_info(_hass(entry_id=None), 1, "Front lawn")

    assert info["via_device_id"] == "hubdev"
    registry.async_get_device_by_identifier.assert_not_called()


def test_the_rest_of_the_zone_device_is_unchanged():
    with patch.object(entity, "_via_device_id_supported", return_value=False):
        info = entity.zone_device_info(_hass(), 2, "Potager")

    assert info["identifiers"] == {(const.DOMAIN, "abc123_zone_2")}
    assert info["name"] == "Potager"
    assert info["model"] == "Irrigation zone"
    assert info["manufacturer"] == const.MANUFACTURER


def test_the_hub_device_has_no_parent_of_its_own():
    info = entity.hub_device_info(_hass())

    assert info["identifiers"] == {(const.DOMAIN, "abc123")}
    assert "via_device" not in info
    assert "via_device_id" not in info


def test_the_support_check_reads_the_running_home_assistant():
    """Whatever this version declares, the check follows it rather than a
    version number, which is what keeps the two forms mutually exclusive."""
    from homeassistant.helpers import device_registry as dr

    declared = "via_device_id" in getattr(dr.DeviceInfo, "__annotations__", {})

    assert entity._via_device_id_supported() is declared
