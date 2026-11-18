---
title: "Configuring the weather service"
---
# Configuring the weather service

The weather service is set **in the Smart Irrigation panel**, not when the integration is added. You can turn it on, change it, or turn it off at any time, without reinstalling or reloading anything. Which one to choose is explained on [Which weather service](weather-services.md).

To set it up:

1. Open the **Smart Irrigation** panel from the Home Assistant sidebar.
2. Go to **Weather › Weather service**.
3. Switch on **Use a weather service**, then pick the service:
   - **Open-Meteo** (the default) works worldwide and needs no API key.
   - **A weather entity in Home Assistant** reads one of your weather entities (DWD, Met.no, KNMI...): pick the entity instead of a key. It reports no rain that fell, so each sensor group needs a rain sensor (see [weather services](weather-services.md#a-weather-entity-in-home-assistant)).
   - **OpenWeatherMap** and **Pirate Weather** need an API key (see below).
4. Enter the API key if the service needs one, or pick the weather entity, then **Save**. The key or the entity is checked before the change is applied, and a message says whether it was accepted.

After switching to a weather entity, the page also names the sensor groups that still take their rain from the weather service: give each of them a rain sensor.

If you turn the weather service **off**, there is no forecast, and all the weather data must come from your own sensors, set in your [sensor groups](configuration-sensor-groups.md).

Make sure your Home Assistant location is set correctly so the data matches your garden, or set [manual coordinates](MANUAL_COORDINATES.md).

## Getting an OpenWeatherMap API key

1. Create an account on [OpenWeatherMap](https://openweathermap.org). Any company name and purpose will do.
2. Subscribe to the **One Call API 3.0** plan. It is a paid plan that is free up to 1000 calls a day, and it must be activated with a payment card. A plain default key is refused.
3. Copy your key from **API keys**.

A new key can take a couple of hours to work, as the OpenWeatherMap email says. If you worry about the cost, set a call limit below the paid threshold on the **Billing plans** page of your profile.

## Getting a Pirate Weather API key

Follow the **API Key** section of the [Pirate Weather documentation](https://docs.pirateweather.net/en/latest/API/).
