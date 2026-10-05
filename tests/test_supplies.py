"""Supplies as data: what is stored, and how holds are counted."""

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.supplies import (
    SupplyHolds,
    find_supply,
    normalize_supplies,
    usable,
)


def _supply(**overrides):
    data = {
        const.SUPPLY_ID: "pump",
        const.SUPPLY_NAME: "Pump",
        const.SUPPLY_ENTITIES: ["switch.pump"],
        const.SUPPLY_DELAY_BEFORE: 0,
        const.SUPPLY_DELAY_AFTER: 0,
    }
    data.update(overrides)
    return data


def test_a_supply_is_stored_well_formed():
    [supply] = normalize_supplies(
        [
            {
                "name": " Well pump ",
                "entities": "switch.a, switch.b ,switch.a, nonsense",
                "delay_before": "5",
                "delay_after": -2,
            }
        ]
    )

    assert supply[const.SUPPLY_NAME] == "Well pump"
    assert supply[const.SUPPLY_ID] == "well_pump"
    assert supply[const.SUPPLY_ENTITIES] == ["switch.a", "switch.b"]
    assert supply[const.SUPPLY_DELAY_BEFORE] == 5.0
    assert supply[const.SUPPLY_DELAY_AFTER] == -2.0
    assert supply[const.SUPPLY_ENABLED] is True


def test_the_delays_are_signed_and_held_to_range():
    [supply] = normalize_supplies([_supply(delay_before=99999, delay_after=-99999)])

    limit = const.SUPPLY_MAX_DELAY_SECONDS
    assert supply[const.SUPPLY_DELAY_BEFORE] == limit
    assert supply[const.SUPPLY_DELAY_AFTER] == -limit


def test_a_delay_that_is_no_number_is_zero():
    [supply] = normalize_supplies([_supply(delay_before="soon", delay_after=None)])

    assert supply[const.SUPPLY_DELAY_BEFORE] == 0.0
    assert supply[const.SUPPLY_DELAY_AFTER] == 0.0


def test_ids_are_unique_and_made_up_when_missing():
    supplies = normalize_supplies(
        [{"name": "Pump"}, {"name": "Pump"}, {"id": "pump", "name": "Other"}]
    )

    ids = [s[const.SUPPLY_ID] for s in supplies]
    assert len(set(ids)) == 3


def test_what_is_not_a_supply_is_dropped():
    assert normalize_supplies(["junk", None, 3]) == []
    assert normalize_supplies(None) == []


def test_a_disabled_supply_or_one_without_entity_is_not_usable():
    assert usable(_supply())
    assert not usable(_supply(enabled=False))
    assert not usable(_supply(entities=[]))
    assert not usable(None)


def test_find_supply():
    supplies = [_supply()]
    assert find_supply(supplies, "pump") is supplies[0]
    assert find_supply(supplies, "other") is None
    assert find_supply(supplies, None) is None


def test_the_last_hold_is_the_one_that_ends_it():
    holds = SupplyHolds()
    a, b = object(), object()

    assert holds.acquire("pump", a) == 1
    assert holds.acquire("pump", b) == 2
    assert not holds.only_holder("pump", a)
    assert holds.release("pump", a) == 1
    assert holds.only_holder("pump", b)
    assert holds.release("pump", b) == 0
    assert holds.in_use() == set()


def test_giving_back_a_hold_never_taken_does_nothing():
    """Its ``finally`` runs whatever happened, so it must be harmless."""
    holds = SupplyHolds()
    taken = object()
    holds.acquire("pump", taken)

    assert holds.release("pump", object()) is None
    assert holds.release("other", taken) is None
    assert holds.count("pump") == 1


def test_a_hold_is_given_back_once():
    holds = SupplyHolds()
    token = object()
    holds.acquire("pump", token)

    assert holds.release("pump", token) == 0
    assert holds.release("pump", token) is None
