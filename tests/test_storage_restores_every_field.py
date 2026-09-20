"""Everything a storage entry holds has to be read back when it is rebuilt.

Zones, modules, sensor groups and the configuration are all reconstructed from
the stored file field by field at startup. A field left out of that list is not
an omission you notice: the entry comes back with the default, the next save
writes that default over the file, and the value is gone for good.

Three fields were in exactly that state and none of them raised anything. The
calculation explanation vanished on every restart of Home Assistant. A zone's
last calculation was never set on any install at all. Seasonal adjustments and
recurring schedules, which are configuration the user typed rather than state
the integration derives, were replaced by empty lists.

This reads the source rather than the behaviour on purpose: the failure is a
missing line in a constructor call, so that is where to look for it, and a
behavioural test would need one case per field to say the same thing.
"""

import ast
from pathlib import Path

import pytest

SOURCE = Path("custom_components/smart_irrigation/store.py")
# Rebuilt from the stored file; each one loses anything left out.
STORAGE_CLASSES = ("ZoneEntry", "ModuleEntry", "MappingEntry", "Config")


def _tree():
    return ast.parse(SOURCE.read_text(encoding="utf-8"))


def _fields_of(tree, name):
    """The attrs fields a storage class declares."""
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef) and node.name == name:
            return [
                statement.targets[0].id
                for statement in node.body
                if isinstance(statement, ast.Assign)
                and isinstance(statement.targets[0], ast.Name)
            ]
    raise AssertionError(f"{name} is not defined in {SOURCE}")


def _restored_by_populate(tree, name):
    """The fields _populate_from_data passes when it rebuilds that class."""
    populate = next(
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.AsyncFunctionDef) and node.name == "_populate_from_data"
    )
    restored = set()
    for node in ast.walk(populate):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Name)
            and node.func.id == name
        ):
            restored.update(kw.arg for kw in node.keywords if kw.arg)
    return restored


@pytest.mark.parametrize("name", STORAGE_CLASSES)
def test_every_stored_field_is_read_back(name):
    tree = _tree()
    declared = _fields_of(tree, name)
    restored = _restored_by_populate(tree, name)

    missing = [field for field in declared if field not in restored]

    assert not missing, (
        f"{name} declares {missing} but _populate_from_data never reads them "
        "back, so a restart replaces them with their defaults and the next "
        "save makes that permanent"
    )


def test_the_check_can_actually_fail():
    """A guard nobody has seen fail is a guard nobody can trust."""
    tree = _tree()

    assert _fields_of(tree, "ZoneEntry"), "no fields found: the parser is wrong"
    assert "explanation" not in _restored_by_populate(tree, "MappingEntry")
