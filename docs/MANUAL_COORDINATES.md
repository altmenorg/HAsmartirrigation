# Manual Coordinate Configuration

This feature allows users to manually set coordinates (latitude, longitude, and elevation) for weather data retrieval, rather than inheriting them from the Home Assistant global settings by default.

## Overview

By default, Smart Irrigation uses your Home Assistant's configured location coordinates for weather data retrieval. With this feature, you can override these coordinates if you need weather data from a different location, such as:

- Your irrigation system is at a different property than your Home Assistant instance
- You want to use weather data from a nearby weather station
- Your Home Assistant location is not precisely set
- You need elevation data for more accurate weather calculations

## Configuration

### Initial Setup (Options Flow)

When configuring Smart Irrigation for the first time or updating settings:

1. **Weather Service Setup**: First configure your weather service (OpenWeatherMap, Pirate Weather, or KNMI)
2. **Coordinate Configuration**: After weather service setup, you'll see a coordinate configuration step
3. **Choose Coordinate Source**:
   - **Use Home Assistant location** (default): Uses your HA's configured coordinates
   - **Use manual coordinates**: Allows you to specify custom coordinates

### Manual Coordinate Fields

When manual coordinates are enabled, you can configure:

- **Latitude**: Decimal degrees, range -90 to 90 (e.g., 40.7128 for New York)
- **Longitude**: Decimal degrees, range -180 to 180 (e.g., -74.0060 for New York)  
- **Elevation**: Meters above sea level, range -1000 to 9000 (optional, defaults to 0)

### General Settings UI

In the Smart Irrigation general settings panel, you'll find a "Location Coordinates" card where you can:

- Toggle between manual coordinates and Home Assistant location
- View current Home Assistant coordinates when manual mode is disabled
- Edit manual coordinates with real-time validation
- See the coordinate values that will be used for weather data

## Technical Details

### Coordinate Selection Logic

The system uses the following priority order for coordinates:

1. **Manual coordinates** (if enabled and valid)
   - Must have both latitude and longitude set
   - Elevation defaults to 0 if not specified
2. **Home Assistant coordinates** (fallback)
   - Uses HA's configured latitude, longitude, elevation
   - Logs warnings if using default values

### Weather Service Integration

All supported weather services automatically use the effective coordinates:

- **OpenWeatherMap**: Uses coordinates for API calls and pressure calculations
- **Pirate Weather**: Uses coordinates for location-specific forecasts
- **KNMI**: Uses coordinates for Dutch weather data (when applicable)

### Coordinate Validation

Input validation ensures:
- Latitude: -90° to 90° (North/South poles to equator)
- Longitude: -180° to 180° (International Date Line coverage)
- Elevation: -1000m to 9000m (below sea level to high mountains)
- Precision: Up to 6 decimal places for sub-meter accuracy

## Usage Examples

### Example 1: Remote Property
Your Home Assistant is at your main residence, but you want to irrigate a garden at a remote property:

1. Enable manual coordinates
2. Set latitude/longitude to the remote property location
3. Set elevation if significantly different from your main location

### Example 2: Weather Station Alignment
You want to use data from a specific weather station location:

1. Find the coordinates of your preferred weather station
2. Enable manual coordinates  
3. Input the weather station's coordinates

### Example 3: Elevation Correction
Your HA location is correct but elevation is wrong or missing:

1. Enable manual coordinates
2. Keep the same latitude/longitude as HA
3. Set the correct elevation for better pressure calculations

## Internationalization

The coordinate configuration feature is fully localized in:
- German (de)
- English (en) 
- Spanish (es)
- French (fr)
- Italian (it)
- Dutch (nl)
- Norwegian (no)
- Slovak (sk)

## Troubleshooting

### Common Issues

**Coordinates not taking effect:**
- Restart Home Assistant after changing coordinates
- Check that manual coordinates are enabled in both options flow and general settings

**Weather data seems wrong:**
- Verify coordinates are correct (use a mapping service to confirm)
- Check that elevation is reasonable for your location
- Ensure weather service API key is valid

**UI shows default coordinates:**
- Manual coordinates may not be enabled
- Check the toggle in the general settings coordinate card

### Logging

The system logs coordinate selection decisions:
```
INFO: Using manual coordinates: lat=40.712800, lon=-74.006000, elevation=100m
INFO: Using Home Assistant coordinates: lat=52.000000, lon=5.000000, elevation=10m
```

Look for these messages in your Home Assistant logs to confirm which coordinates are being used.