---
layout: default
title: "Weather services"
---
# Weather services

> Related: [How it works](how-it-works.md) &middot; [Sensor groups](configuration-sensor-groups.md) &middot; [Weather service setup](installation-weatherservice.md)

Smart Irrigation needs weather data to estimate evapotranspiration (ET) and, from it, how long to run each zone. That data can come from a **weather service**, from your **own sensors**, or from a mix of both (configured per field in a [sensor group](configuration-sensor-groups.md)).

Four weather services are supported: three online services, and a weather entity of Home Assistant itself.

## The services at a glance

| Service | API key | Solar radiation | Reference ET0 (FAO-56) | Cost |
|---|---|---|---|---|
| **Open-Meteo** *(default)* | **None** | ✅ yes | ✅ yes | Free |
| OpenWeatherMap | Required | ❌ no | ❌ no | Free tier + paid |
| Pirate Weather | Required | ❌ no | ❌ no | Free tier + paid |
| A weather entity in Home Assistant | **None** | ❌ no | ❌ no | Free |

The online services provide temperature, humidity, dew point, pressure, wind and precipitation. A weather entity provides temperature, humidity, pressure and wind, a dew point when its integration has one, and never the rain that fell (see [below](#a-weather-entity-in-home-assistant)). The difference that matters for accuracy is **solar radiation**.

## Why solar radiation matters

The PyETO module computes ET with the **FAO-56 Penman-Monteith** equation, the agronomic reference for reference evapotranspiration. Solar radiation is its dominant term. Two cases:

- **Radiation available** → a full Penman-Monteith calculation. Most accurate.
- **No radiation** → radiation is **estimated from temperature** (a Hargreaves-style approximation). Still useful, but less precise, especially in cloudy or coastal climates.

You do not configure this. Radiation is **used automatically whenever a source provides it, and estimated from temperature otherwise**. There is no "estimation method" toggle to get wrong.

## Getting solar radiation, per service

### Open-Meteo: full Penman-Monteith, out of the box

Open-Meteo provides solar radiation (and a ready-made FAO-56 ET0) directly, with **no API key**. In a [sensor group](configuration-sensor-groups.md), set the **Solar Radiation** source to **Weather service**. That is all: you get a full Penman-Monteith calculation with no extra hardware and no key.

This is why Open-Meteo is the default and the recommended choice for this integration.

### OpenWeatherMap / Pirate Weather

These services do not provide solar radiation themselves, but you still have two ways to get a full Penman-Monteith with them:

1. **Let Open-Meteo fill it in (easiest).** Set the **Solar Radiation** source to **Weather service** in your [sensor group](configuration-sensor-groups.md). Because OpenWeatherMap and Pirate Weather do not supply radiation, the integration fetches just that field from Open-Meteo (free and keyless) and labels the option "(via Open-Meteo)" so it is clear where the value comes from. The same applies to the reference ET0. No sensor, no key.
2. **Use a dedicated radiation sensor.** Add a pyranometer, or any entity that reports irradiance (some weather stations and a few HA integrations expose it), set it as the **Solar Radiation** source, and declare its unit (for example W/m²). Use this if you prefer a strictly single-source, on-site measurement.

Without either, ET falls back to the temperature-based estimate described above.

### A weather entity in Home Assistant

If you already have your national weather service in Home Assistant (DWD, Met.no, KNMI, the NWS, ...) or a station of your own with a forecast, choose **A weather entity in Home Assistant** and pick the entity. No API key, no second provider, and a run is skipped on the forecast you see in Home Assistant.

- **Current values** come from the entity's attributes: temperature, humidity, pressure, wind, and the dew point when the entity has one. They are read in the units Home Assistant shows them in and converted for the calculation. The wind is taken as measured at the standard 10 m and brought to 2 m, the pressure as reported at sea level and brought to your elevation, as for the online services.
- **The forecast** comes from `weather.get_forecasts`: the daily forecast, or else the twice-daily or the hourly one, folded into days. The hourly one, when the entity has it, also gives the rain expected in the hours ahead of a run.
- **No rain that fell.** A weather entity only forecasts rain, and a forecast never enters the water balance. Give each sensor group a rain sensor under **Current precipitation**: a gauge, or a sensor that measures rain. Check that it is a measurement: some weather integrations also offer next-hour or nowcast sensors with the same device class, and those are forecasts. The panel does not offer the weather service for the rain with this choice, and a new sensor group starts with no rain source. After switching, the weather service page names the groups that still take their rain from it, and the log says so for each of them.
- **Solar radiation and reference ET0** come from Open-Meteo, as with OpenWeatherMap and Pirate Weather.
- One entity per installation, since the weather service is a general setting. A field can still read any sensor of its own.

## What reads from Open-Meteo, whatever service you pick

Open-Meteo is the default service and also the one Smart Irrigation turns to for the data the others do not publish. With OpenWeatherMap, Pirate Weather or a weather entity, these still come from Open-Meteo, keyless and free:

- **the sun**, hour by hour, for the hourly calculation when no radiation sensor is mapped, and the daily radiation and reference ET0;
- **the hours of the days ahead**, for a zone whose engine looks ahead.

Your own service's rain is never replaced by Open-Meteo's. With Open-Meteo itself, one more use:

- with **Open-Meteo itself and a sensor group fed only by the weather service**, the hourly calculation is priced on Open-Meteo's own hourly history instead of the readings Smart Irrigation took (see [the hourly calculation](configuration-general.md)).

None of this is a single point of failure. When Open-Meteo cannot be reached, each of these falls back to what Smart Irrigation can do without it: the sun is estimated from the day's temperature range (FAO-56 Eq. 50) or read from your sensor, the rain comes from the readings, a forecast that is not available leaves the zone on the daily equation, and the hourly calculation sums the readings it recorded. A calculation is made, with a little less precision, and the log says what was missing.

## Skipping the calculation entirely (Open-Meteo + Passthrough)

Open-Meteo also returns a finished FAO-56 ET0. If you would rather not run the calculation yourself, use the **Passthrough** module instead of PyETO and set the **Evapotranspiration** source to **Weather service**. The integration then uses Open-Meteo's ET0 as-is. (Open-Meteo computes that ET0 from its own model data, so it does not take your individual sensor mappings into account; PyETO + a radiation source does.)

## Switching service at any time

You can change the weather service whenever you like from the **Weather service** page under **Data**, without reinstalling the integration. The API-key field is hidden for keyless services such as Open-Meteo, and the key is validated against the service before the change is applied. For a weather entity, Save stays disabled until one is picked.

## Which should I pick?

- **Want it to just work, accurately, for free?** Use **Open-Meteo** (the default), source Solar Radiation from the weather service, done.
- **Already invested in OpenWeatherMap or Pirate Weather and want full accuracy?** Source Solar Radiation from the weather service (filled from Open-Meteo automatically), or add a dedicated radiation sensor.
- **Already have your national weather service in Home Assistant?** Choose **A weather entity in Home Assistant**, and give each sensor group a rain sensor.
- **No radiation source at all?** It still works, on a temperature-based estimate, which is good enough for many gardens.
