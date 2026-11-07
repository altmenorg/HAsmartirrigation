"""The write endpoints have to accept every field their model is made of.

The panel reads an object and posts the whole thing back when any single field
is edited. Voluptuous rejects unknown keys, so a field added to a model without
being added to that endpoint's schema fails the entire save with a 400, whatever
the user was actually editing.

That is how v2026.8.3 shipped with `precipitation_superseded` breaking every
zone save from the panel (#813, #812). This compares the two lists so the next
field cannot do it again, for zones and for sensor groups alike.
"""

import re
from pathlib import Path

import attr
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import MappingEntry, ZoneEntry

NEW_CLASS = "\nclass "


def _accepted_keys(view):
    """The const-backed keys a view's write schema allows."""
    source = Path("custom_components/smart_irrigation/websockets.py").read_text(
        encoding="utf-8"
    )
    start = source.index("class " + view)
    block = source[start : source.index(NEW_CLASS, start + 10)]
    names = re.findall(r"vol\.Optional\(const\.([A-Z_]+)\)", block)
    return {
        getattr(const, name)
        for name in names
        if isinstance(getattr(const, name, None), str)
    }


@pytest.mark.parametrize(
    ("model", "view"),
    [
        (ZoneEntry, "SmartIrrigationZoneView"),
        (MappingEntry, "SmartIrrigationMappingView"),
    ],
    ids=["zone", "sensor-group"],
)
def test_every_field_is_accepted_by_its_endpoint(model, view):
    """A field the API returns but the endpoint rejects fails every save."""
    fields = set(attr.fields_dict(model).keys())

    missing = sorted(fields - _accepted_keys(view))

    assert not missing, (
        "these fields are returned by the API but rejected on save, which "
        f"fails every edit of this object from the panel: {missing}"
    )
