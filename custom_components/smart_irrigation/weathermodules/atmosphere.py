"""Atmosphere helpers shared by the weather service clients."""


def sea_level_to_station_pressure(pressure, elevation):
    """The pressure at the site from a pressure reduced to sea level, in hPa.

    FAO-56 Eq. 7, scaled to the reported sea-level pressure so the weather of
    the day is kept: P = P0 * ((293 - 0.0065 z) / 293) ** 5.26.

    OpenWeatherMap and Pirate Weather report sea-level pressure. The formula
    this replaces returned it all but unchanged at any height, 113 hPa too high
    at 1000 m. Penman-Monteith is not very sensitive to it: under 1% of ET.
    """
    height = float(elevation or 0.0)
    return float(pressure) * ((293.0 - 0.0065 * height) / 293.0) ** 5.26
