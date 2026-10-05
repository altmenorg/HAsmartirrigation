"""The programs of the full controller: plain data, no Home Assistant."""

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.programs import (
    MAIN_PROGRAM_ID,
    default_main_program,
    ensure_main_program,
    find_program,
)


def test_the_main_program_is_created_first():
    other = {const.PROGRAM_ID: "evening", const.PROGRAM_NAME: "Evening"}

    programs = ensure_main_program([other])

    assert [p[const.PROGRAM_ID] for p in programs] == [MAIN_PROGRAM_ID, "evening"]
    assert programs[0] == default_main_program()


def test_an_existing_main_program_is_left_alone():
    renamed = {
        const.PROGRAM_ID: MAIN_PROGRAM_ID,
        const.PROGRAM_NAME: "My garden",
        const.PROGRAM_ENABLED: False,
    }

    programs = ensure_main_program([renamed])

    assert programs == [renamed]


def test_nothing_stored_gives_just_the_main_program():
    assert ensure_main_program(None) == [default_main_program()]
    assert ensure_main_program([]) == [default_main_program()]


def test_the_input_list_is_not_modified():
    stored = [{const.PROGRAM_ID: "evening"}]

    ensure_main_program(stored)

    assert stored == [{const.PROGRAM_ID: "evening"}]


def test_a_malformed_entry_is_dropped():
    assert ensure_main_program(["junk", None]) == [default_main_program()]


def test_find_program():
    programs = ensure_main_program(None)
    assert find_program(programs, MAIN_PROGRAM_ID) is programs[0]
    assert find_program(programs, "nope") is None
    assert find_program(None, MAIN_PROGRAM_ID) is None
