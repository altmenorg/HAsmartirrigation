"""IU's test configurations: reading them, and what they expect.

A test helper. ``load`` reads one of IU's test configurations with Home
Assistant's tags as plain values, ``location`` gives its time zone and sun,
``expected`` the on and off events a test window expects, in IU's form
``(time, controller, zone, on)``, and ``same`` compares them with what the
full controller switched (``iu_runner.simulate``) within IU's time step.
"""

from __future__ import annotations

import datetime as dt
from zoneinfo import ZoneInfo

import yaml
from astral import LocationInfo
from astral.location import Location


class _Loader(yaml.SafeLoader):
    """YAML with Home Assistant's tags read as plain values."""


def _any_tag(loader, suffix, node):
    if isinstance(node, yaml.ScalarNode):
        return f"<{suffix} {loader.construct_scalar(node)}>"
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    return loader.construct_mapping(node)


_Loader.add_multi_constructor("!", _any_tag)


def load(path) -> dict:
    """A configuration file of IU's tests."""
    with open(path, encoding="utf-8") as handle:
        return yaml.load(handle, Loader=_Loader) or {}


def location(homeassistant: dict):
    """The time zone and a sun function for the ``homeassistant`` section."""
    name = homeassistant.get("time_zone") or "UTC"
    place = Location(
        LocationInfo(
            "",
            "",
            name,
            float(homeassistant.get("latitude", 0) or 0),
            float(homeassistant.get("longitude", 0) or 0),
        )
    )
    elevation = float(homeassistant.get("elevation", 0) or 0)

    def sun(event, day):
        try:
            return getattr(place, event)(day, local=False, observer_elevation=elevation)
        except ValueError:  # no sunrise or sunset that day
            return None

    return ZoneInfo(name), sun


def expected(iu: dict, window: dict, tz) -> list:
    """IU's expected events of a test window, as ``simulate`` lists them.

    IU reports its controller (zone 0) whether or not it has a master; only a
    controller with one switches anything, so only those are kept.
    """
    controllers = iu.get("controllers")
    controllers = controllers if isinstance(controllers, list) else [controllers]
    with_master = {
        n
        for n, c in enumerate(controllers, start=1)
        if isinstance(c, dict) and c.get("entity_id")
    }
    wanted = []
    for result in window.get("results") or []:
        controller, zone = int(result["c"]), int(result["z"])
        if zone == 0 and controller not in with_master:
            continue
        wanted.append((moment_of(result["t"], tz), controller, zone, int(result["s"])))
    return wanted


def moment_of(text, tz) -> dt.datetime:
    """A time of IU's tests, local, as an aware time."""
    text = str(text)
    form = "%Y-%m-%d %H:%M:%S" if text.count(":") == 2 else "%Y-%m-%d %H:%M"
    return dt.datetime.strptime(text, form).replace(tzinfo=tz)


def same(got: list, wanted: list, tolerance: float) -> bool:
    """The same events, each within ``tolerance`` seconds (IU's time step)."""
    if len(got) != len(wanted):
        return False
    used: set = set()
    for want in wanted:
        hit = next(
            (
                i
                for i, event in enumerate(got)
                if i not in used
                and event[1:] == want[1:]
                and abs((event[0] - want[0]).total_seconds()) <= tolerance
            ),
            None,
        )
        if hit is None:
            return False
        used.add(hit)
    return True
