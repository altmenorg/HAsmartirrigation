---
title: "Manual coordinates"
---
# Manual coordinates

By default, Smart Irrigation reads the weather for the location set in Home Assistant. Manual coordinates (latitude, longitude and elevation) read it somewhere else, for instance when:

- your garden is at another property than your Home Assistant;
- you want the weather of a nearby weather station;
- your Home Assistant location is not set precisely;
- the elevation of your Home Assistant location is wrong or missing.

## Where

On the **Location coordinates** card, under **Weather › Weather service** in the Smart Irrigation panel. The card shows in [advanced mode](configuration.md#standard-and-advanced), or whenever manual coordinates are on, so coordinates in use are never out of sight.

!!! note

    The integration's **Configure** button (**Settings › Devices & services**) does not set them. Up to 2026.11.0 it asked for coordinates, but what it saved was never used. It now only points to the panel.

## The card

- **Use manual coordinates** switches between your own coordinates and the Home Assistant location. Off, the card shows the current Home Assistant coordinates.
- **Latitude**, in decimal degrees, from -90 to 90 (for example 40.7128 for New York).
- **Longitude**, in decimal degrees, from -180 to 180 (for example -74.0060 for New York).
- **Elevation**, in metres above sea level, from -1000 to 9000. Optional, 0 when left empty.

The values are checked as you type, up to 6 decimal places.

## How they are used

1. **Manual coordinates**, when they are on and both latitude and longitude are set.
2. Otherwise **the Home Assistant coordinates**. A warning is logged if Home Assistant still has its default location.

Every weather service reads the coordinates in use:

- **Open-Meteo** for the forecast, the hourly radiation history and the hourly forecast;
- **OpenWeatherMap** for its calls and for the pressure at your elevation;
- **Pirate Weather** for its forecasts.

They are used from the next weather update. No restart is needed.

## Examples

**A garden at another property.** Switch on manual coordinates, set the latitude and longitude of the garden, and its elevation if it differs much from home.

**A nearby weather station.** Switch on manual coordinates and enter the coordinates of the station.

**A wrong elevation.** Switch on manual coordinates, keep the latitude and longitude of Home Assistant, and set the correct elevation. The pressure, and so the evapotranspiration, depend on it.

## Troubleshooting

**The coordinates do not seem to be used.** Check that **Use manual coordinates** is on, then wait for the next weather update.

**The weather data looks wrong.** Check the coordinates on a map, check that the elevation is sensible, and check that the weather service's API key is valid.

The log says which coordinates are used:

```text
INFO: Using manual coordinates: lat=40.712800, lon=-74.006000, elevation=100m
INFO: Using Home Assistant coordinates: lat=52.000000, lon=5.000000, elevation=10m
```
