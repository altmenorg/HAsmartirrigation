"""The adjust_program service: change how long a program waters, for a while.

Irrigation Unlimited's ``adjust_time``, done natively. An adjustment is a
percentage and/or a number of seconds applied on top of the steps' own duration
(see ``programs.adjusted_water``), kept in its own configuration key so the
programs, which the panel sends back whole, never overwrite it.

* It is **absolute**: setting one replaces the previous one, it never adds up.
* It only changes the runs that start after it is set; a run under way keeps
  the plan it started with.
* It survives a restart, and ends by itself at ``hours`` from now when given.
* ``reset`` clears it.
"""

from datetime import timedelta

import homeassistant.util.dt as dt_util
import voluptuous as vol
from homeassistant.exceptions import ServiceValidationError

from . import const
from .programs import (
    MAX_ADJUST_SECONDS,
    MAX_PERCENT,
    active_adjustment,
    find_program,
)
from .watering_control import MAX_SUSPEND_HOURS, _number_validator, finite_number

ADJUST_PROGRAM_SCHEMA = vol.Schema(
    {
        vol.Required(const.ATTR_PROGRAM_ID): vol.All(
            vol.Coerce(str), vol.Length(min=1)
        ),
        vol.Optional(const.ADJUST_PERCENT): vol.Any(
            None, _number_validator(0, MAX_PERCENT, "percent")
        ),
        vol.Optional(const.ADJUST_SECONDS): vol.Any(
            None,
            _number_validator(-MAX_ADJUST_SECONDS, MAX_ADJUST_SECONDS, "seconds"),
        ),
        vol.Optional(const.ATTR_HOURS): vol.Any(
            None, _number_validator(1, MAX_SUSPEND_HOURS, "hours")
        ),
        vol.Optional(const.ATTR_RESET): vol.Boolean(),
    },
    extra=vol.ALLOW_EXTRA,
)


class ProgramAdjustMixin:
    """The handler of ``smart_irrigation.adjust_program``."""

    async def handle_adjust_program(self, call):
        """Set, replace or clear the runtime adjustment of a program."""
        config = self.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            raise ServiceValidationError(
                "adjust_program needs the full controller, which is off"
            )
        program_id = str(call.data.get(const.ATTR_PROGRAM_ID))
        program = find_program(getattr(config, const.CONF_PROGRAMS, None), program_id)
        if program is None:
            raise ServiceValidationError(f"{program_id} is not a program")
        if program.get(const.PROGRAM_MAIN):
            raise ServiceValidationError(
                "the main program has no steps to adjust: adjust a program with steps"
            )
        now = dt_util.utcnow()
        adjustments = {
            k: v
            for k, v in dict(
                getattr(config, const.CONF_PROGRAM_ADJUSTMENTS, None) or {}
            ).items()
            if active_adjustment({k: v}, k, now) is not None
        }
        if call.data.get(const.ATTR_RESET):
            adjustments.pop(program_id, None)
        else:
            percent = call.data.get(const.ADJUST_PERCENT)
            seconds = call.data.get(const.ADJUST_SECONDS)
            if percent is None and seconds is None:
                raise ServiceValidationError(
                    "give a percent, some seconds, or reset to clear the adjustment"
                )
            hours = call.data.get(const.ATTR_HOURS)
            until = None
            if hours is not None:
                try:
                    hours = finite_number(hours, 1, MAX_SUSPEND_HOURS, "hours")
                except ValueError as e:
                    raise ServiceValidationError(str(e)) from None
                until = (now + timedelta(hours=hours)).isoformat()
            adjustments[program_id] = {
                const.ADJUST_PERCENT: None if percent is None else float(percent),
                const.ADJUST_SECONDS: None if seconds is None else float(seconds),
                const.ADJUST_UNTIL: until,
            }
        await self.store.async_update_config(
            {const.CONF_PROGRAM_ADJUSTMENTS: adjustments}
        )
        self._notify_programs()
