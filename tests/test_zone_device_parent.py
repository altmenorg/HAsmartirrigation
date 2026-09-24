"""A per-zone device names its parent the way this Home Assistant expects.

``via_device`` (the parent's identifiers) is deprecated and stops working in
Home Assistant 2027.8; ``via_device_id`` (the parent's id in the device
registry) replaces it, and passing both is an error (#833). We support Home
Assistant 2025.5 and up, which spans both forms, so the helper asks the running
version which one it knows.
"""

from unittest.mock import Mock, patch

from custom_components.smart_irrigation import const, entity


def _hass():
    hass = Mock()
    hass.data = {const.DOMAIN: {"coordinator": Mock(id="abc123")}}
    return hass


def _registry_with_hub(device_id="hubdev"):
    registry = Mock()
    registry.async_get_device = Mock(return_value=Mock(id=device_id))
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
    registry.async_get_device.assert_called_once_with(
        identifiers={(const.DOMAIN, "abc123")}
    )


def test_an_older_home_assistant_still_gets_the_identifiers():
    """Supported down to 2025.5, which does not know via_device_id."""
    with patch.object(entity, "_via_device_id_supported", return_value=False):
        info = entity.zone_device_info(_hass(), 1, "Front lawn")

    assert info["via_device"] == (const.DOMAIN, "abc123")
    assert "via_device_id" not in info


def test_a_hub_device_that_is_not_registered_yet_falls_back():
    """The link matters more than the warning, so the old form still applies."""
    registry = Mock()
    registry.async_get_device = Mock(return_value=None)

    with (
        patch.object(entity, "_via_device_id_supported", return_value=True),
        patch.object(entity.dr, "async_get", return_value=registry),
    ):
        info = entity.zone_device_info(_hass(), 1, "Front lawn")

    assert info["via_device"] == (const.DOMAIN, "abc123")


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
