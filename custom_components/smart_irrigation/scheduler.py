"""Enhanced scheduling system for Smart Irrigation."""

import datetime
import logging
import uuid
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import (
    async_track_time_change,
    async_track_time_interval,
)

from . import const

_LOGGER = logging.getLogger(__name__)


class RecurringScheduleManager:
    """Manages recurring schedules for Smart Irrigation."""

    def __init__(self, hass: HomeAssistant, coordinator) -> None:
        """Initialize the recurring schedule manager."""
        self.hass = hass
        self.coordinator = coordinator
        self._schedule_trackers = {}
        self._schedules = []

    async def async_load_schedules(self) -> None:
        """Load recurring schedules from configuration."""
        config = await self.coordinator.store.async_get_config()
        self._schedules = config.get(const.CONF_RECURRING_SCHEDULES, [])
        await self._setup_schedule_trackers()

    async def async_create_schedule(self, schedule_data: dict[str, Any]) -> None:
        """Create a new recurring schedule."""
        # Validate schedule data
        self._validate_schedule_data(schedule_data)

        # Add unique ID if not provided
        if const.SCHEDULE_CONF_ID not in schedule_data:
            schedule_data[const.SCHEDULE_CONF_ID] = self._generate_schedule_id()

        # Add to schedules list
        self._schedules.append(schedule_data)

        # Update configuration
        await self._save_schedules()

        # Set up tracker for this schedule
        await self._setup_schedule_tracker(schedule_data)

        _LOGGER.info(
            "Created recurring schedule: %s", schedule_data[const.SCHEDULE_CONF_NAME]
        )

    async def async_update_schedule(
        self, schedule_id: str, schedule_data: dict[str, Any]
    ) -> None:
        """Update an existing recurring schedule."""
        # Find the schedule
        schedule_index = None
        for i, schedule in enumerate(self._schedules):
            if schedule[const.SCHEDULE_CONF_ID] == schedule_id:
                schedule_index = i
                break

        if schedule_index is None:
            raise ValueError(f"Schedule with ID {schedule_id} not found")

        # Validate updated data
        self._validate_schedule_data(schedule_data)

        # Remove old tracker
        await self._remove_schedule_tracker(schedule_id)

        # Update schedule
        self._schedules[schedule_index].update(schedule_data)

        # Save configuration
        await self._save_schedules()

        # Set up new tracker
        await self._setup_schedule_tracker(self._schedules[schedule_index])

        _LOGGER.info(
            "Updated recurring schedule: %s",
            schedule_data.get(const.SCHEDULE_CONF_NAME, schedule_id),
        )

    async def async_delete_schedule(self, schedule_id: str) -> None:
        """Delete a recurring schedule."""
        # Remove tracker
        await self._remove_schedule_tracker(schedule_id)

        # Remove from schedules list
        self._schedules = [
            s for s in self._schedules if s[const.SCHEDULE_CONF_ID] != schedule_id
        ]

        # Save configuration
        await self._save_schedules()

        _LOGGER.info("Deleted recurring schedule: %s", schedule_id)

    async def _setup_schedule_trackers(self) -> None:
        """Set up all schedule trackers."""
        # Clear existing trackers
        for tracker in self._schedule_trackers.values():
            if tracker:
                tracker()
        self._schedule_trackers.clear()

        # Set up trackers for enabled schedules
        for schedule in self._schedules:
            if schedule.get(const.SCHEDULE_CONF_ENABLED, True):
                await self._setup_schedule_tracker(schedule)

    async def _setup_schedule_tracker(self, schedule: dict[str, Any]) -> None:
        """Set up a tracker for a single schedule."""
        if not schedule.get(const.SCHEDULE_CONF_ENABLED, True):
            return

        schedule_id = schedule[const.SCHEDULE_CONF_ID]
        schedule_type = schedule[const.SCHEDULE_CONF_TYPE]

        if schedule_type == const.SCHEDULE_TYPE_DAILY:
            tracker = await self._setup_daily_tracker(schedule)
        elif schedule_type == const.SCHEDULE_TYPE_WEEKLY:
            tracker = await self._setup_weekly_tracker(schedule)
        elif schedule_type == const.SCHEDULE_TYPE_MONTHLY:
            tracker = await self._setup_monthly_tracker(schedule)
        elif schedule_type == const.SCHEDULE_TYPE_INTERVAL:
            tracker = await self._setup_interval_tracker(schedule)
        else:
            _LOGGER.warning("Unknown schedule type: %s", schedule_type)
            return

        self._schedule_trackers[schedule_id] = tracker

    async def _setup_daily_tracker(self, schedule: dict[str, Any]) -> Any:
        """Set up a daily schedule tracker."""
        time_str = schedule[const.SCHEDULE_CONF_TIME]
        hour, minute = map(int, time_str.split(":"))

        return async_track_time_change(
            self.hass,
            lambda now: self._execute_schedule(schedule, now),
            hour=hour,
            minute=minute,
            second=0,
        )

    async def _setup_weekly_tracker(self, schedule: dict[str, Any]) -> Any:
        """Set up a weekly schedule tracker."""
        time_str = schedule[const.SCHEDULE_CONF_TIME]
        hour, minute = map(int, time_str.split(":"))
        days_of_week = schedule.get(const.SCHEDULE_CONF_DAYS_OF_WEEK, [])

        # Convert day names to numbers (0=Monday, 6=Sunday)
        day_mapping = {
            "monday": 0,
            "tuesday": 1,
            "wednesday": 2,
            "thursday": 3,
            "friday": 4,
            "saturday": 5,
            "sunday": 6,
        }

        def check_and_execute(now):
            current_weekday = now.weekday()
            day_names = [day.lower() for day in days_of_week]
            if any(
                day_mapping.get(day_name) == current_weekday for day_name in day_names
            ):
                self._execute_schedule(schedule, now)

        return async_track_time_change(
            self.hass, check_and_execute, hour=hour, minute=minute, second=0
        )

    async def _setup_monthly_tracker(self, schedule: dict[str, Any]) -> Any:
        """Set up a monthly schedule tracker."""
        time_str = schedule[const.SCHEDULE_CONF_TIME]
        hour, minute = map(int, time_str.split(":"))
        day_of_month = schedule.get(const.SCHEDULE_CONF_DAY_OF_MONTH, 1)

        def check_and_execute(now):
            if now.day == day_of_month:
                self._execute_schedule(schedule, now)

        return async_track_time_change(
            self.hass, check_and_execute, hour=hour, minute=minute, second=0
        )

    async def _setup_interval_tracker(self, schedule: dict[str, Any]) -> Any:
        """Set up an interval-based schedule tracker."""
        interval_hours = schedule.get(const.SCHEDULE_CONF_INTERVAL_HOURS, 24)
        interval_delta = datetime.timedelta(hours=interval_hours)

        return async_track_time_interval(
            self.hass, lambda now: self._execute_schedule(schedule, now), interval_delta
        )

    async def _remove_schedule_tracker(self, schedule_id: str) -> None:
        """Remove a schedule tracker."""
        if schedule_id in self._schedule_trackers:
            tracker = self._schedule_trackers[schedule_id]
            if tracker:
                tracker()
            del self._schedule_trackers[schedule_id]

    @callback
    def _execute_schedule(
        self, schedule: dict[str, Any], now: datetime.datetime
    ) -> None:
        """Execute a scheduled action."""
        # Check date range if specified
        start_date = schedule.get(const.SCHEDULE_CONF_START_DATE)
        end_date = schedule.get(const.SCHEDULE_CONF_END_DATE)

        if start_date:
            start_dt = datetime.datetime.fromisoformat(start_date)
            if now < start_dt:
                return

        if end_date:
            end_dt = datetime.datetime.fromisoformat(end_date)
            if now > end_dt:
                return

        action = schedule.get(const.SCHEDULE_CONF_ACTION, "calculate")
        zones = schedule.get(const.SCHEDULE_CONF_ZONES, "all")
        schedule_name = schedule.get(const.SCHEDULE_CONF_NAME, "Unnamed Schedule")

        _LOGGER.info(
            "Executing recurring schedule: %s (action: %s)", schedule_name, action
        )

        # Fire event
        self.hass.bus.fire(
            f"{const.DOMAIN}_{const.EVENT_RECURRING_SCHEDULE_TRIGGERED}",
            {
                "schedule_id": schedule[const.SCHEDULE_CONF_ID],
                "schedule_name": schedule_name,
                "action": action,
                "zones": zones,
                "timestamp": now.isoformat(),
            },
        )

        # Execute the action asynchronously
        self.hass.async_create_task(
            self._perform_schedule_action(action, zones, schedule_name)
        )

    async def _perform_schedule_action(
        self, action: str, zones: str | list[str], schedule_name: str
    ) -> None:
        """Perform the scheduled action."""
        try:
            if action == "calculate":
                if zones == "all":
                    await self.coordinator._async_calculate_all()
                else:
                    for zone_id in zones:
                        await self.coordinator.async_calculate_zone(zone_id)
            elif action == "update":
                if zones == "all":
                    await self.coordinator._async_update_all()
                else:
                    for zone_id in zones:
                        await self.coordinator._async_update_zone(zone_id)
            elif action == "irrigate":
                # Fire irrigation event for specified zones
                event_data = {
                    "triggered_by": "recurring_schedule",
                    "schedule_name": schedule_name,
                    "zones": zones,
                }
                self.hass.bus.fire(
                    f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}", event_data
                )

            _LOGGER.info(
                "Successfully executed schedule action: %s for zones: %s", action, zones
            )

        except Exception as e:
            _LOGGER.error("Error executing schedule action %s: %s", action, e)
            raise

    async def _save_schedules(self) -> None:
        """Save schedules to configuration."""
        await self.coordinator.store.async_update_config(
            {const.CONF_RECURRING_SCHEDULES: self._schedules}
        )

    def _validate_schedule_data(self, schedule_data: dict[str, Any]) -> None:
        """Validate schedule data."""
        required_fields = [const.SCHEDULE_CONF_NAME, const.SCHEDULE_CONF_TYPE]
        for field in required_fields:
            if field not in schedule_data:
                raise ValueError(f"Missing required field: {field}")

        schedule_type = schedule_data[const.SCHEDULE_CONF_TYPE]
        if schedule_type not in const.SCHEDULE_TYPES:
            raise ValueError(f"Invalid schedule type: {schedule_type}")

        # Validate time format if provided
        if const.SCHEDULE_CONF_TIME in schedule_data:
            time_str = schedule_data[const.SCHEDULE_CONF_TIME]
            try:
                datetime.datetime.strptime(time_str, "%H:%M")
            except ValueError as e:
                raise ValueError(
                    f"Invalid time format: {time_str}. Expected HH:MM"
                ) from e

    def _generate_schedule_id(self) -> str:
        """Generate a unique schedule ID."""
        import uuid

        return f"schedule_{uuid.uuid4().hex[:8]}"

    def get_schedules(self) -> list[dict[str, Any]]:
        """Get all schedules."""
        return self._schedules.copy()


class SeasonalAdjustmentManager:
    """Manages seasonal adjustments for Smart Irrigation."""

    def __init__(self, hass: HomeAssistant, coordinator) -> None:
        """Initialize the seasonal adjustment manager."""
        self.hass = hass
        self.coordinator = coordinator
        self._adjustments = []

    async def async_load_adjustments(self) -> None:
        """Load seasonal adjustments from configuration."""
        config = await self.coordinator.store.async_get_config()
        self._adjustments = config.get(const.CONF_SEASONAL_ADJUSTMENTS, [])

    async def async_create_adjustment(self, adjustment_data: dict[str, Any]) -> None:
        """Create a new seasonal adjustment."""
        # Validate adjustment data
        self._validate_adjustment_data(adjustment_data)

        # Add unique ID if not provided
        if const.SEASONAL_CONF_ID not in adjustment_data:
            adjustment_data[const.SEASONAL_CONF_ID] = self._generate_adjustment_id()

        # Add to adjustments list
        self._adjustments.append(adjustment_data)

        # Save configuration
        await self._save_adjustments()

        _LOGGER.info(
            "Created seasonal adjustment: %s", adjustment_data[const.SEASONAL_CONF_NAME]
        )

    async def async_update_adjustment(
        self, adjustment_id: str, adjustment_data: dict[str, Any]
    ) -> None:
        """Update an existing seasonal adjustment."""
        # Find the adjustment
        adjustment_index = None
        for i, adjustment in enumerate(self._adjustments):
            if adjustment[const.SEASONAL_CONF_ID] == adjustment_id:
                adjustment_index = i
                break

        if adjustment_index is None:
            raise ValueError(f"Adjustment with ID {adjustment_id} not found")

        # Validate updated data
        self._validate_adjustment_data(adjustment_data)

        # Update adjustment
        self._adjustments[adjustment_index].update(adjustment_data)

        # Save configuration
        await self._save_adjustments()

        _LOGGER.info(
            "Updated seasonal adjustment: %s",
            adjustment_data.get(const.SEASONAL_CONF_NAME, adjustment_id),
        )

    async def async_delete_adjustment(self, adjustment_id: str) -> None:
        """Delete a seasonal adjustment."""
        # Remove from adjustments list
        self._adjustments = [
            a for a in self._adjustments if a[const.SEASONAL_CONF_ID] != adjustment_id
        ]

        # Save configuration
        await self._save_adjustments()

        _LOGGER.info("Deleted seasonal adjustment: %s", adjustment_id)

    async def apply_seasonal_adjustments(
        self, zone_data: dict[str, Any], zone_id: int | None = None
    ) -> dict[str, Any]:
        """Apply applicable seasonal adjustments to zone data."""
        current_month = datetime.datetime.now().month
        applied_adjustments = []

        for adjustment in self._adjustments:
            if not adjustment.get(const.SEASONAL_CONF_ENABLED, True):
                continue

            # Check if adjustment applies to this zone
            adjustment_zones = adjustment.get(const.SEASONAL_CONF_ZONES, "all")
            if adjustment_zones != "all" and zone_id not in adjustment_zones:
                continue

            # Check if current month is within adjustment period
            month_start = adjustment.get(const.SEASONAL_CONF_MONTH_START, 1)
            month_end = adjustment.get(const.SEASONAL_CONF_MONTH_END, 12)

            if month_start <= month_end:
                # Normal range (e.g., March to September)
                in_range = month_start <= current_month <= month_end
            else:
                # Cross-year range (e.g., November to February)
                in_range = current_month >= month_start or current_month <= month_end

            if not in_range:
                continue

            # Apply multiplier adjustment
            multiplier_adj = adjustment.get(
                const.SEASONAL_CONF_MULTIPLIER_ADJUSTMENT, 1.0
            )
            if multiplier_adj != 1.0 and const.ZONE_MULTIPLIER in zone_data:
                old_multiplier = zone_data[const.ZONE_MULTIPLIER]
                zone_data[const.ZONE_MULTIPLIER] = old_multiplier * multiplier_adj
                applied_adjustments.append(
                    {
                        "name": adjustment[const.SEASONAL_CONF_NAME],
                        "type": "multiplier",
                        "old_value": old_multiplier,
                        "new_value": zone_data[const.ZONE_MULTIPLIER],
                        "adjustment": multiplier_adj,
                    }
                )

            # Apply threshold adjustment (if applicable)
            threshold_adj = adjustment.get(
                const.SEASONAL_CONF_THRESHOLD_ADJUSTMENT, 0.0
            )
            if threshold_adj != 0.0 and const.ZONE_BUCKET in zone_data:
                zone_data[const.ZONE_BUCKET] += threshold_adj
                applied_adjustments.append(
                    {
                        "name": adjustment[const.SEASONAL_CONF_NAME],
                        "type": "threshold",
                        "adjustment": threshold_adj,
                    }
                )

        # Fire event if adjustments were applied
        if applied_adjustments:
            self.hass.bus.fire(
                f"{const.DOMAIN}_{const.EVENT_SEASONAL_ADJUSTMENT_APPLIED}",
                {
                    "zone_id": zone_id,
                    "adjustments": applied_adjustments,
                    "month": current_month,
                    "timestamp": datetime.datetime.now().isoformat(),
                },
            )

            _LOGGER.info(
                "Applied %d seasonal adjustments to zone %s",
                len(applied_adjustments),
                zone_id,
            )

        return zone_data

    async def _save_adjustments(self) -> None:
        """Save adjustments to configuration."""
        await self.coordinator.store.async_update_config(
            {const.CONF_SEASONAL_ADJUSTMENTS: self._adjustments}
        )

    def _validate_adjustment_data(self, adjustment_data: dict[str, Any]) -> None:
        """Validate adjustment data."""
        required_fields = [const.SEASONAL_CONF_NAME]
        for field in required_fields:
            if field not in adjustment_data:
                raise ValueError(f"Missing required field: {field}")

        # Validate month range
        month_start = adjustment_data.get(const.SEASONAL_CONF_MONTH_START, 1)
        month_end = adjustment_data.get(const.SEASONAL_CONF_MONTH_END, 12)

        if not (1 <= month_start <= 12) or not (1 <= month_end <= 12):
            raise ValueError("Month values must be between 1 and 12")

    def _generate_adjustment_id(self) -> str:
        """Generate a unique adjustment ID."""

        return f"adjustment_{uuid.uuid4().hex[:8]}"

    def get_adjustments(self) -> list[dict[str, Any]]:
        """Get all adjustments."""
        return self._adjustments.copy()
