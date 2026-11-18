"""The watering calendar as the panel fetches it: websocket and HTTP view.

The calendar itself is built in test_watering_calendar.py. This checks the two
doors to it: that the zone id the panel sends (a string over HTTP) reaches the
coordinator as a number, that what the coordinator builds is what goes out,
and that a zone that does not exist comes back as an error, not a crash.
"""

import json
from unittest.mock import AsyncMock, MagicMock

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.exceptions import SmartIrrigationError
from custom_components.smart_irrigation.websockets import (
    SmartIrrigationWateringCalendarView,
    websocket_get_watering_calendar,
)

_CALENDAR = {
    1: {
        "zone_name": "Lawn",
        "zone_id": 1,
        "monthly_estimates": [
            {
                "month": month,
                "month_name": f"M{month}",
                "estimated_et_mm": 40.0 + month,
                "estimated_watering_volume_liters": 100.0 * month,
                "average_temperature_c": 15.0,
                "average_precipitation_mm": 50.0,
                "calculation_notes": "n",
            }
            for month in range(1, 13)
        ],
        "generated_at": "2026-11-18T06:00:00",
        "calculation_method": "FAO-56 Penman-Monteith",
    }
}


async def _generate(zone_id=None):
    if zone_id in (None, 1):
        return _CALENDAR
    raise SmartIrrigationError(f"Zone {zone_id} not found")


async def test_the_calendar_is_served_as_built_and_an_unknown_zone_is_an_error():
    coordinator = MagicMock()
    coordinator.async_generate_watering_calendar = AsyncMock(side_effect=_generate)
    hass = MagicMock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}

    # Websocket: every zone, then one zone by id.
    connection = MagicMock()
    await websocket_get_watering_calendar.__wrapped__(hass, connection, {"id": 3})
    connection.send_result.assert_called_once_with(3, _CALENDAR)
    connection.send_error.assert_not_called()

    connection = MagicMock()
    await websocket_get_watering_calendar.__wrapped__(
        hass, connection, {"id": 4, "zone_id": "1"}
    )
    connection.send_result.assert_called_once_with(4, _CALENDAR)
    assert coordinator.async_generate_watering_calendar.await_args_list[-1].args == (1,)

    connection = MagicMock()
    await websocket_get_watering_calendar.__wrapped__(
        hass, connection, {"id": 5, "zone_id": 99}
    )
    connection.send_result.assert_not_called()
    connection.send_error.assert_called_once_with(
        5, "calendar_generation_failed", "Zone 99 not found"
    )

    # HTTP: the query string carries the id as text.
    view = SmartIrrigationWateringCalendarView()
    request = MagicMock()
    request.app = {"hass": hass}
    request.query = {"zone_id": "1"}

    response = await view.get(request)

    assert response.status == 200
    body = json.loads(response.body)
    # JSON keys are strings: the panel reads the zone under "1".
    assert list(body) == ["1"]
    zone = body["1"]
    assert zone["zone_id"] == 1
    assert zone["zone_name"] == "Lawn"
    assert zone["calculation_method"] == "FAO-56 Penman-Monteith"
    assert [m["month"] for m in zone["monthly_estimates"]] == list(range(1, 13))
    assert zone["monthly_estimates"][6]["estimated_watering_volume_liters"] == 700.0
    assert coordinator.async_generate_watering_calendar.await_args_list[-1].args == (1,)

    request.query = {"zone_id": "99"}
    response = await view.get(request)

    assert response.status == 500
    assert json.loads(response.body) == {"error": "Zone 99 not found"}
