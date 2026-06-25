---
layout: default
title: Installation: Configuring weather service
---
# Configuring the weather service

> Main page: [Installation](installation.md)<br/>
> Previous: [Downloading the integration](installation-download.md)<br/>
> Next: [Configuration](configuration.md)

The weather service is configured **from the Smart Irrigation panel**, on the fly — it is no longer part of the install wizard. You can enable it, change it, or turn it off at any time without reinstalling or reloading the integration.

To set it up:

1. Open the **Smart Irrigation** panel from the Home Assistant sidebar.
2. Go to the **Weather service** settings.
3. Toggle **Use a weather service** on, then pick the service you want:
   - **Open-Meteo** (the default) is keyless and works worldwide — no API key required.
   - **Open Weather Map** and **Pirate Weather** require an API key (see below).
4. Enter the API key if the chosen service needs one, then save. If the key is valid you will see a success message; otherwise double check the key.

If you turn the weather service **off**, forecasting is unavailable and you must provide all weather data from another source, such as your own weather station sensors, configured in your [sensor groups](configuration-sensor-groups.md).

Make sure your Home Assistant home location is set correctly so the data matches your location, or set [manual coordinates](installation-options.md).

## Getting Open Weather Map API Key

Go to [OpenWeatherMap](https://openweathermap.org) and create an account. You can enter any company and purpose while creating an account. After creating your account, You will need to sign up for the paid (but free for limited API calls) OneCall API 3.0 plan if you do not have a key already. Make sure to enter credit card information to get the API truly activated. Then, go to API Keys and get your key. If the key does not work right away, no worries. The email you should have received from OpenWeaterMap says it will be activated 'within the next couple of hours'. So if it does not work right away, be patient a bit. If you are worried about the cost of the API, You can put a rate limit below the paid threshold in the "Billing plans" page of your profile.

## Getting Pirate Weather API key
Follow the instructions on this page (see `API Key` section): https://docs.pirateweather.net/en/latest/API/.

> Main page: [Installation](installation.md)<br/>
> Previous: [Downloading the integration](installation-download.md)<br/>
> Next: [Configuration](configuration.md)
