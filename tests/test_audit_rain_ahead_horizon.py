"""The hourly rain ahead has to reach as far as the window it is asked about.

The skip and the rain credit read 48 hours from the start of a run. The hours
are requested by whole days in GMT, so a run in the evening, or a preview opened
in the evening for the next morning, needs a fourth day to reach its end.
"""

from unittest.mock import patch

from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    OpenMeteoClient,
)


def test_the_hourly_rain_ahead_asks_for_four_days():
    client = OpenMeteoClient(latitude=47.6, longitude=19.36)
    doc = {"hourly": {"time": [], "precipitation": [], "precipitation_probability": []}}

    with patch.object(OpenMeteoClient, "_request", return_value=doc) as request:
        client._hourly_rain_ahead()

    assert request.call_args[0][0]["forecast_days"] == 4
