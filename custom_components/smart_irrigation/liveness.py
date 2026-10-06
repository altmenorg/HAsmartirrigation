"""Tell the user when a weather sensor of a sensor group stops reporting.

A thermometer that died used to cost a line in the log and, six hours later, a
reading left out of the record: the calculation went on with what remained and
nothing on screen said a sensor had stopped. This watches the fields whose
silence matters (``const.STALE_FIELDS``) on the sensor groups that automatic
zones use, raises a repair notice naming the silent sensors and since when,
fires one event when a field goes silent and one when it is back, and clears
the notice by itself.

The decision is pure (``silent_fields`` and ``diff_silent``) and the mixin
only gathers the timestamps and acts on the answer.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta

import homeassistant.util.dt as dt_util
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.event import async_track_time_interval

from . import const

_LOGGER = logging.getLogger(__name__)

# How long a field may stay quiet before it counts as silent.
SILENT_AFTER = timedelta(hours=const.STALE_AFTER_HOURS)
# How often the groups are looked at.
CHECK_INTERVAL = timedelta(minutes=15)

DOCS_URL = (
    "https://altmenorg.github.io/HAsmartirrigation/"
    "configuration-sensor-groups.html#silent-sensors"
)

WEATHER_SERVICE_LABEL = "weather service"


@dataclass(frozen=True)
class FieldReport:
    """When the source of one field last reported.

    ``last_report`` is None when it never has, or when the entity is gone.
    ``not_before`` is a floor for sources whose stamp outlives the process (a
    weather service's last fetch is stored): after downtime it is old through no
    fault of the source, so the silence is counted from the later of the two.
    """

    field: str
    source: str
    last_report: datetime | None
    not_before: datetime | None = None


@dataclass(frozen=True)
class SilentField:
    """A field whose source has not reported for too long."""

    field: str
    source: str
    since: datetime


def silent_fields(
    reports,
    now: datetime,
    thresholds: dict | None = None,
    default: timedelta = SILENT_AFTER,
) -> list[SilentField]:
    """The fields whose source has been quiet for longer than its threshold.

    ``thresholds`` overrides the default per field. A source that never
    reported is counted from its ``not_before``; with neither there is nothing
    to measure from, and it is not reported.
    """
    thresholds = thresholds or {}
    silent = []
    for report in reports:
        threshold = thresholds.get(report.field, default)
        last = report.last_report
        floor = report.not_before
        if last is None or floor is not None and floor > last:
            last = floor
        if last is None:
            continue
        if now - last > threshold:
            silent.append(SilentField(report.field, report.source, last))
    return silent


def diff_silent(previous: set[str], silent) -> tuple[list[SilentField], list[str]]:
    """What changed since the last check: (newly silent, recovered fields)."""
    current = {item.field for item in silent}
    newly = [item for item in silent if item.field not in previous]
    recovered = sorted(previous - current)
    return newly, recovered


def _as_utc(value) -> datetime | None:
    """A stored or live timestamp as an aware UTC datetime, or None."""
    if isinstance(value, str):
        value = dt_util.parse_datetime(value)
    if not isinstance(value, datetime):
        return None
    return dt_util.as_utc(value)


class WeatherLivenessMixin:
    """Per-group watch over the sensors a sensor group's fields come from."""

    hass: HomeAssistant

    def _liveness_state(self) -> dict:
        state = getattr(self, "_weather_silent", None)
        if state is None:
            state = {}
            self._weather_silent = state
        return state

    @staticmethod
    def _liveness_issue_id(mapping_id) -> str:
        return f"weather_silent_{mapping_id}"

    async def async_setup_weather_liveness(self) -> None:
        """Start watching: one timer, cancelled by the teardown below."""
        self.async_teardown_weather_liveness(clear_issues=False)
        self._weather_liveness_started = dt_util.utcnow()
        self._weather_liveness_unsub = async_track_time_interval(
            self.hass, self.async_check_weather_liveness, CHECK_INTERVAL
        )
        await self.async_check_weather_liveness()

    def async_teardown_weather_liveness(self, clear_issues: bool = True) -> None:
        """Stop the timer and, by default, take down the notices raised."""
        unsub = getattr(self, "_weather_liveness_unsub", None)
        if unsub is not None:
            unsub()
        self._weather_liveness_unsub = None
        state = self._liveness_state()
        if clear_issues:
            for mapping_id in list(state):
                ir.async_delete_issue(
                    self.hass, const.DOMAIN, self._liveness_issue_id(mapping_id)
                )
        state.clear()

    def _liveness_reports(self, mapping: dict) -> list[FieldReport]:
        """The reports of the fields of one group that are worth watching.

        Only fields whose source the group actually uses: a sensor that is
        mapped, or the weather service for a field it supplies. A field mapped
        to nothing or to a static value cannot go silent.
        """
        reports = []
        started = getattr(self, "_weather_liveness_started", None)
        for key, the_map in (mapping.get(const.MAPPING_MAPPINGS) or {}).items():
            if key not in const.STALE_FIELDS or not isinstance(the_map, dict):
                continue
            source = the_map.get(const.MAPPING_CONF_SOURCE)
            if source in const.MAPPING_CONF_SENSOR_BACKED_SOURCES:
                entity_id = the_map.get(const.MAPPING_CONF_SENSOR)
                if not entity_id:
                    continue
                state = self.hass.states.get(entity_id)
                stamp = None
                if state is not None:
                    stamp = _as_utc(getattr(state, "last_reported", None)) or _as_utc(
                        getattr(state, "last_updated", None)
                    )
                # A state outlives a reload, so its own time is the truth; only
                # an entity that is gone is counted from when watching began.
                reports.append(
                    FieldReport(
                        key, entity_id, stamp, started if stamp is None else None
                    )
                )
            elif source == const.MAPPING_CONF_SOURCE_WEATHER_SERVICE:
                if not getattr(self, "use_weather_service", False):
                    continue
                reports.append(
                    FieldReport(
                        key,
                        WEATHER_SERVICE_LABEL,
                        _as_utc(mapping.get(const.MAPPING_DATA_LAST_UPDATED)),
                        started,
                    )
                )
        return reports

    async def async_check_weather_liveness(self, *_args) -> None:
        """Compare every watched group with the last check and act on changes."""
        now = dt_util.utcnow()
        zones = await self.store.async_get_zones()
        watched = {
            zone.get(const.ZONE_MAPPING)
            for zone in zones
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC
            and zone.get(const.ZONE_MAPPING) is not None
        }
        state = self._liveness_state()
        # A group nobody uses any more has nothing to be silent about.
        for mapping_id in list(state):
            if mapping_id not in watched:
                self._liveness_clear(mapping_id)
                state.pop(mapping_id, None)
        for mapping_id in watched:
            mapping = self.store.get_mapping(mapping_id)
            if mapping is None:
                continue
            silent = silent_fields(self._liveness_reports(mapping), now)
            previous = state.get(mapping_id, {})
            newly, recovered = diff_silent(set(previous), silent)
            if silent:
                state[mapping_id] = {item.field: item for item in silent}
                self._liveness_raise(mapping, silent)
            else:
                state.pop(mapping_id, None)
                self._liveness_clear(mapping_id)
            if newly:
                self.hass.bus.async_fire(
                    f"{const.DOMAIN}_{const.EVENT_WEATHER_STALE}",
                    self._liveness_event(mapping, [item.field for item in newly])
                    | {"since": min(i.since for i in newly).isoformat()},
                )
            if recovered:
                self.hass.bus.async_fire(
                    f"{const.DOMAIN}_{const.EVENT_WEATHER_RECOVERED}",
                    self._liveness_event(mapping, recovered),
                )

    @staticmethod
    def _liveness_event(mapping: dict, fields: list) -> dict:
        return {
            "mapping_id": mapping.get(const.MAPPING_ID),
            "mapping": mapping.get(const.MAPPING_NAME),
            "fields": list(fields),
        }

    def _liveness_clear(self, mapping_id) -> None:
        ir.async_delete_issue(
            self.hass, const.DOMAIN, self._liveness_issue_id(mapping_id)
        )

    def _liveness_raise(self, mapping: dict, silent: list[SilentField]) -> None:
        mapping_id = mapping.get(const.MAPPING_ID)
        since = min(item.since for item in silent)
        sensors = ", ".join(f"{item.field} ({item.source})" for item in silent)
        _LOGGER.warning(
            "Sensor group %s: no report for over %s hours from %s",
            mapping.get(const.MAPPING_NAME) or mapping_id,
            const.STALE_AFTER_HOURS,
            sensors,
        )
        ir.async_create_issue(
            self.hass,
            const.DOMAIN,
            self._liveness_issue_id(mapping_id),
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key="weather_silent",
            translation_placeholders={
                "mapping": str(mapping.get(const.MAPPING_NAME) or mapping_id),
                "sensors": sensors,
                "since": dt_util.as_local(since).strftime("%Y-%m-%d %H:%M"),
                "hours": str(const.STALE_AFTER_HOURS),
            },
            learn_more_url=DOCS_URL,
        )
