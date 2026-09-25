"""The engine belongs to the sensor group, not to each zone that reads it.

While the engine lived only on the zone, a group shared by a PyETO zone and a
Passthrough one had no answer to "which sources does this group need", so the
editor showed every field whatever the engine actually consumed. Recording it
on the group makes that answerable.

The migration must not change anybody's water balance. It records what is
already true and leaves every ambiguous case alone.
"""

from unittest.mock import Mock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.store import (
    MappingEntry,
    ZoneEntry,
    adopt_module_from_zones,
)


def _zones(*pairs):
    """Zones as (mapping, module) pairs, keyed by index."""
    return {
        i: ZoneEntry(id=i, mapping=m, module=mod) for i, (m, mod) in enumerate(pairs)
    }


def _mappings(*ids, module=None):
    return {i: MappingEntry(id=i, name=f"Group {i}", module=module) for i in ids}


class TestTheMigration:
    def test_a_group_whose_zones_agree_adopts_their_engine(self):
        result = adopt_module_from_zones(_mappings(0), _zones((0, 3), (0, 3)))

        assert result[0].module == 3

    def test_a_group_whose_zones_disagree_is_left_undecided(self):
        """Choosing for them would change how one zone's balance is computed."""
        result = adopt_module_from_zones(_mappings(0), _zones((0, 3), (0, 7)))

        assert result[0].module is None

    def test_a_group_nobody_uses_is_left_undecided(self):
        result = adopt_module_from_zones(_mappings(0), _zones((1, 3)))

        assert result[0].module is None

    def test_a_group_that_already_has_an_engine_is_untouched(self):
        result = adopt_module_from_zones(_mappings(0, module=9), _zones((0, 3)))

        assert result[0].module == 9

    def test_zones_without_an_engine_do_not_count(self):
        result = adopt_module_from_zones(_mappings(0), _zones((0, None), (0, 3)))

        assert result[0].module == 3

    def test_a_group_reference_stored_as_a_string_still_matches(self):
        result = adopt_module_from_zones(_mappings(0), _zones(("0", 3)))

        assert result[0].module == 3

    def test_an_unparseable_group_reference_is_ignored_rather_than_raising(self):
        result = adopt_module_from_zones(_mappings(0), _zones(("not-an-id", 3)))

        assert result[0].module is None

    def test_each_group_is_resolved_independently(self):
        result = adopt_module_from_zones(
            _mappings(0, 1), _zones((0, 3), (1, 7), (1, 7))
        )

        assert result[0].module == 3
        assert result[1].module == 7


class _Coordinator(CalculationMixin):
    def __init__(self, mapping):
        self.store = Mock()
        self.store.get_mapping = Mock(return_value=mapping)


class TestTheResolver:
    def test_the_zone_s_own_engine_wins(self):
        """It used to be the group's, and that was changed on purpose.

        An engine carries settings the zone owns: how many days it looks
        ahead, the fixed amount it uses. While a group's engine won, zones
        sharing a group shared those settings, and changing one on a zone
        changed it on the others. Every zone has its own instance now, and the
        zone is therefore what says which.
        """
        coord = _Coordinator({const.MAPPING_MODULE: 7})

        assert (
            coord.module_id_for_zone({const.ZONE_MAPPING: 0, const.ZONE_MODULE: 3}) == 3
        )

    def test_a_zone_without_one_falls_back_to_its_group(self):
        """Which is what an install set up before the split had."""
        coord = _Coordinator({const.MAPPING_MODULE: 7})

        assert (
            coord.module_id_for_zone({const.ZONE_MAPPING: 0, const.ZONE_MODULE: None})
            == 7
        )

    def test_an_undecided_group_and_no_zone_engine_is_nothing(self):
        coord = _Coordinator({const.MAPPING_MODULE: None})

        assert (
            coord.module_id_for_zone({const.ZONE_MAPPING: 0, const.ZONE_MODULE: None})
            is None
        )

    def test_a_group_predating_the_move_leaves_the_zone_in_charge(self):
        coord = _Coordinator({const.MAPPING_NAME: "old"})

        assert (
            coord.module_id_for_zone({const.ZONE_MAPPING: 0, const.ZONE_MODULE: 3}) == 3
        )

    @pytest.mark.parametrize("mapping", [None, {const.MAPPING_MODULE: 7}])
    def test_a_zone_with_no_group_uses_its_own(self, mapping):
        coord = _Coordinator(mapping)

        assert (
            coord.module_id_for_zone({const.ZONE_MAPPING: None, const.ZONE_MODULE: 3})
            == 3
        )

    def test_a_missing_group_leaves_the_zone_in_charge(self):
        coord = _Coordinator(None)

        assert (
            coord.module_id_for_zone({const.ZONE_MAPPING: 0, const.ZONE_MODULE: 3}) == 3
        )

    def test_no_engine_anywhere_is_reported_as_none(self):
        coord = _Coordinator({const.MAPPING_MODULE: None})

        assert (
            coord.module_id_for_zone({const.ZONE_MAPPING: 0, const.ZONE_MODULE: None})
            is None
        )
