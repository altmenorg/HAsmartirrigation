"""A fixed amount of evaporation dries the zone, whatever sign it was typed with.

The Static engine adds its delta to the bucket, so a zone dries by a negative
one. Since v2026.10.1 the zone card asks for "So many mm a day, whatever the
weather" and stored the number as typed: 4 mm of evaporation added 4 mm of water
every day and the zone was never watered. Stored configurations are turned
around when they are loaded.
"""

from custom_components.smart_irrigation.calcmodules.static import Static
from custom_components.smart_irrigation.store import static_delta_dries


def test_a_positive_delta_is_turned_into_drying():
    assert static_delta_dries("Static", {"delta": 4.0}) == {"delta": -4.0}


def test_a_delta_typed_as_text_is_read_as_a_number():
    assert static_delta_dries("Static", {"delta": "4.5"}) == {"delta": -4.5}


def test_a_drying_delta_is_left_alone():
    config = {"delta": -4.0}

    assert static_delta_dries("Static", config) is config


def test_zero_and_unreadable_deltas_are_left_alone():
    assert static_delta_dries("Static", {"delta": 0.0}) == {"delta": 0.0}
    assert static_delta_dries("Static", {"delta": ""}) == {"delta": ""}
    assert static_delta_dries("Static", {}) == {}
    assert static_delta_dries("Static", None) is None


def test_other_engines_are_left_alone():
    config = {"delta": 4.0}

    assert static_delta_dries("PyETO", config) is config


def test_the_turned_delta_dries_the_bucket():
    engine = Static(None, "fixed", static_delta_dries("Static", {"delta": 4.0}))

    assert engine.calculate() == -4.0
