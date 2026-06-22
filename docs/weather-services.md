---
layout: default
title: Weather services
---
# Weather services

> Related: [How it works](how-it-works.md) &middot; [Sensor groups](configuration-sensor-groups.md) &middot; [Weather service setup](installation-weatherservice.md)

HAppy Irrigation needs weather data to estimate evapotranspiration (ET) and, from it, how long to run each zone. That data can come from a **weather service**, from your **own sensors**, or from a mix of both (configured per field in a [sensor group](configuration-sensor-groups.md)).

Three weather services are supported.

## The three services at a glance

| Service | API key | Solar radiation | Reference ET0 (FAO-56) | Cost |
|---|---|---|---|---|
| **Open-Meteo** *(default)* | **None** | ✅ yes | ✅ yes | Free |
| OpenWeatherMap | Required | ❌ no | ❌ no | Free tier + paid |
| Pirate Weather | Required | ❌ no | ❌ no | Free tier + paid |

All three provide temperature, humidity, dew point, pressure, wind and precipitation. The difference that matters for accuracy is **solar radiation**.

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

## Skipping the calculation entirely (Open-Meteo + Passthrough)

Open-Meteo also returns a finished FAO-56 ET0. If you would rather not run the calculation yourself, use the **Passthrough** module instead of PyETO and set the **Evapotranspiration** source to **Weather service**. The integration then uses Open-Meteo's ET0 as-is. (Open-Meteo computes that ET0 from its own model data, so it does not take your individual sensor mappings into account; PyETO + a radiation source does.)

## Switching service at any time

You can change the weather service whenever you like from the **Weather service** tab, without reinstalling the integration. The API-key field is hidden for keyless services such as Open-Meteo, and the key is validated against the service before the change is applied.

## Which should I pick?

- **Want it to just work, accurately, for free?** Use **Open-Meteo** (the default), source Solar Radiation from the weather service, done.
- **Already invested in OpenWeatherMap or Pirate Weather and want full accuracy?** Source Solar Radiation from the weather service (filled from Open-Meteo automatically), or add a dedicated radiation sensor.
- **No radiation source at all?** It still works, on a temperature-based estimate, which is good enough for many gardens.
