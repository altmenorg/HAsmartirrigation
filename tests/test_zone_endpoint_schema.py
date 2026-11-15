"""The write endpoints have to accept every field their model is made of.

The panel reads an object and posts the whole thing back when any single field
is edited. Voluptuous rejects unknown keys, so a field added to a model without
being added to that endpoint's schema fails the entire save with a 400, whatever
the user was actually editing.

That is how v2026.8.3 shipped with `precipitation_superseded` breaking every
zone save from the panel (#813, #812). This compares the two lists so the next
field cannot do it again, for zones and for sensor groups alike.
"""

import attr
import pytest

from custom_components.smart_irrigation import websockets
from custom_components.smart_irrigation.store import MappingEntry, ZoneEntry


def _accepted_keys(schema):
    """The keys a write schema allows (shared by the panel and the assistant)."""
    return {str(key) for key in schema.schema}


@pytest.mark.parametrize(
    ("model", "schema"),
    [
        (ZoneEntry, websockets.ZONE_SAVE_SCHEMA),
        (MappingEntry, websockets.MAPPING_SAVE_SCHEMA),
    ],
    ids=["zone", "sensor-group"],
)
def test_every_field_is_accepted_by_its_endpoint(model, schema):
    """A field the API returns but the endpoint rejects fails every save."""
    fields = set(attr.fields_dict(model).keys())

    missing = sorted(fields - _accepted_keys(schema))

    assert not missing, (
        "these fields are returned by the API but rejected on save, which "
        f"fails every edit of this object from the panel: {missing}"
    )
