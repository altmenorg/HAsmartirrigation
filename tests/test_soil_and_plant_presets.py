"""Soil and planting in words, for two numbers nobody knows by heart.

A zone needs a drainage rate in mm/h and a crop coefficient. "How fast does
your soil drain" is unanswerable for most people; "clay" or "sandy" is not.
So the panel asks in those terms, and the number it stands for is what gets
stored and calculated with.
"""

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.presets import (
    CUSTOM,
    PLANT_TYPES,
    SOIL_TYPES,
    apply_preset,
    crop_coefficient_for,
    describe_zone,
    drainage_rate_for,
)


def test_every_soil_drains_slower_than_the_one_above_it():
    """The order is the physics: sand drains fast, clay holds water."""
    rates = [
        SOIL_TYPES[name] for name in ("sand", "sandy_loam", "loam", "clay_loam", "clay")
    ]

    assert rates == sorted(rates, reverse=True)
    assert all(rate > 0 for rate in rates)


def test_the_crop_coefficients_sit_in_the_range_fao_gives():
    """Between a bare surface and a crop that transpires more than grass."""
    assert all(0.3 <= value <= 1.2 for value in PLANT_TYPES.values())
    # Grass is the reference surface, so a lawn is close to 1 and below it.
    assert 0.75 <= PLANT_TYPES["lawn"] <= 0.95
    # Vegetables transpire more than shrubs.
    assert PLANT_TYPES["vegetables"] > PLANT_TYPES["shrubs"]


@pytest.mark.parametrize("soil", list(SOIL_TYPES))
def test_choosing_a_soil_writes_its_drainage_rate(soil):
    changes = apply_preset({const.ZONE_SOIL_TYPE: soil})

    assert changes[const.ZONE_DRAINAGE_RATE] == SOIL_TYPES[soil]


@pytest.mark.parametrize("plant", list(PLANT_TYPES))
def test_choosing_a_planting_writes_its_coefficient(plant):
    changes = apply_preset({const.ZONE_PLANT_TYPE: plant})

    assert changes[const.ZONE_MULTIPLIER] == PLANT_TYPES[plant]


def test_a_number_sent_with_the_choice_wins():
    """Someone who knows their own soil keeps their own number."""
    changes = apply_preset(
        {const.ZONE_SOIL_TYPE: "loam", const.ZONE_DRAINAGE_RATE: 6.0}
    )

    assert changes[const.ZONE_DRAINAGE_RATE] == 6.0


def test_choosing_custom_writes_nothing():
    changes = apply_preset({const.ZONE_SOIL_TYPE: CUSTOM})

    assert const.ZONE_DRAINAGE_RATE not in changes


def test_an_unknown_choice_writes_nothing():
    changes = apply_preset({const.ZONE_PLANT_TYPE: "triffids"})

    assert const.ZONE_MULTIPLIER not in changes


def test_a_save_that_says_nothing_about_soil_is_untouched():
    changes = apply_preset({const.ZONE_NAME: "Lawn"})

    assert changes == {const.ZONE_NAME: "Lawn"}


def test_a_zone_is_described_by_the_numbers_it_holds():
    """So a zone set up before this still reads as what it is."""
    zone = {
        const.ZONE_DRAINAGE_RATE: SOIL_TYPES["clay"],
        const.ZONE_MULTIPLIER: PLANT_TYPES["vegetables"],
    }

    assert describe_zone(zone) == {
        const.ZONE_SOIL_TYPE: "clay",
        const.ZONE_PLANT_TYPE: "vegetables",
    }


def test_plantings_that_share_a_coefficient_are_read_as_one_of_them():
    """Shrubs and vines both sit at 0.7, and a number cannot say which.

    Nothing is wrong with that: the two water the same. A zone that was
    described in words keeps the words, which is the case that matters.
    """
    zone = {const.ZONE_MULTIPLIER: PLANT_TYPES["vines"]}

    described = describe_zone(zone)[const.ZONE_PLANT_TYPE]

    assert PLANT_TYPES[described] == PLANT_TYPES["vines"]


def test_numbers_of_its_own_are_custom_rather_than_a_soil_nobody_chose():
    zone = {const.ZONE_DRAINAGE_RATE: 6.5, const.ZONE_MULTIPLIER: 1.15}

    assert describe_zone(zone) == {
        const.ZONE_SOIL_TYPE: CUSTOM,
        const.ZONE_PLANT_TYPE: CUSTOM,
    }


def test_what_was_chosen_wins_over_what_the_number_matches():
    """Two soils could share a rate one day; the choice is the answer."""
    zone = {
        const.ZONE_SOIL_TYPE: "clay_loam",
        const.ZONE_DRAINAGE_RATE: SOIL_TYPES["sand"],
    }

    assert describe_zone(zone)[const.ZONE_SOIL_TYPE] == "clay_loam"


def test_a_zone_without_numbers_at_all_is_custom():
    assert describe_zone({}) == {
        const.ZONE_SOIL_TYPE: CUSTOM,
        const.ZONE_PLANT_TYPE: CUSTOM,
    }
    assert describe_zone(None)[const.ZONE_SOIL_TYPE] == CUSTOM


def test_the_lookups_answer_nothing_for_nothing():
    assert drainage_rate_for(None) is None
    assert drainage_rate_for("moon dust") is None
    assert crop_coefficient_for(None) is None
