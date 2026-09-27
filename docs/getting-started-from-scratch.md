---
layout: default
title: From nothing to a watered garden
---
# From nothing to a watered garden

> Main page: [Introduction](index.md)<br/>
> Next: [Installation](installation.md)

This is the whole path, for somebody who has none of it yet: a machine, a valve, Home Assistant, Smart Irrigation, and a zone that waters itself on what the weather took out of the soil. Half an hour of work, most of it waiting for downloads.

It is deliberately the shortest path that is still correct. Every step links to the page that goes deeper, and nothing here has to be undone later.

## What you need

**Something to run Home Assistant on.** A Raspberry Pi 4 or 5 is the usual answer, with a decent SD card or, better, an SSD. Any machine on Home Assistant's [installation page](https://www.home-assistant.io/installation/) works, including an old laptop or a virtual machine.

**A way to open and close the water.** Two routes, and the choice matters more than anything else on this page:

| | How it works | Watch out for |
| --- | --- | --- |
| **A wireless valve** (Zigbee, Z-Wave, Wi-Fi, Bluetooth) | Battery or mains valve that screws onto a tap and appears in Home Assistant as a `valve` or `switch`. Zigbee and Z-Wave need a coordinator stick. | Battery life over a season, and range from the house to the garden. |
| **A relay board driving solenoid valves** | Irrigation solenoids (commonly 24 V AC) wired to a relay board, which Home Assistant switches. This is what a multi-zone garden ends up with. | Mains and water in the same box: use a proper enclosure and a transformer rated for your valves, and have an electrician do it if you are not sure. |

We do not sell or endorse hardware, and this page names no models on purpose: what matters is that the valve appears in Home Assistant as something you can turn on and off.

**Weather data.** No hardware needed: [Open-Meteo](weather-services.md) is free and needs no account. Your own sensors are better if you have them, and you can add them later without starting over.

**Numbers about your garden.** Two, per zone, and you can measure them in ten minutes:

- **the area it waters**, in m² or sq ft;
- **the flow**, in litres or gallons per minute. Time how long your sprinkler takes to fill a bucket of known volume: a 10 litre bucket in 40 seconds is 15 L/min.

If you would rather not, the panel also takes a **precipitation rate** in mm/h directly, which is what a sprinkler manufacturer's data sheet gives.

## 1. Home Assistant (15 minutes, mostly unattended)

Follow Home Assistant's own [installation guide](https://www.home-assistant.io/installation/) for your machine and pick **Home Assistant OS** if you have the choice: it is the version that supports add-ons and updates itself, and it is the one every instruction you will read assumes.

When it is up, create your account, set your **location, time zone and elevation** properly. Smart Irrigation needs them: the sun's position at your latitude is half of the evapotranspiration equation.

## 2. Your valve, in Home Assistant (5 minutes)

Add the valve the way its own integration asks (a Zigbee stick and ZHA or Zigbee2MQTT for a Zigbee valve, the brand's integration for a Wi-Fi one, a GPIO or Modbus integration for a relay board).

Then prove it works, before Smart Irrigation is anywhere near it: in **Developer tools > Actions**, call `switch.turn_on` (or `valve.open_valve`) on that entity and watch the water. Turn it off again. If that does not work, nothing later will, and it will look like our fault.

Write the entity id down, `switch.garden_tap` or whatever it is.

## 3. Smart Irrigation (5 minutes)

Install [HACS](https://hacs.xyz) if you do not have it, then:

1. **HACS > Integrations**, search for **Smart Irrigation**, download it.
2. Restart Home Assistant.
3. **Settings > Devices & services > Add integration**, search for **Smart Irrigation**.
4. Pick your weather service, or say you will use your own sensors. Open-Meteo needs nothing; OpenWeatherMap and Pirate Weather ask for a free API key.

The full version of this step, including the manual install and what to do when HACS does not find it, is on the [installation](installation.md) page.

## 4. The first zone (5 minutes)

Open **Smart Irrigation** in the sidebar. The setup assistant asks four questions at most: what the zone is, whether it is outside or under glass, where the evaporation figure should come from, and which sensors you have. It creates the sensor group and the first zone for you.

Then, on the zone's card, fill in what only you know:

- the **area** and the **flow** you measured;
- **what the soil is** and **what grows there**, in words. Those two write the drainage rate and the crop coefficient behind them (FAO-56 values), which is what nobody can answer in millimetres an hour.

You now have a zone that computes a duration every night at 23:00.

## 5. Make the water actually flow (2 minutes)

This is the step people skip, and then nothing waters: Smart Irrigation decides *how long*, and something has to *do it*. Two ways.

**Let Smart Irrigation do it.** In **Settings > General**, turn on **Let Smart Irrigation control the valve**, then set the zone's **Linked valve/switch** to the entity from step 2. It opens the valve at the start time, waits the calculated duration, closes it, and credits the zone itself. Nothing else to write. Give your valve a hardware failsafe if it has one: if Home Assistant goes down mid-run, nothing here can close it.

**Or keep your own automation.** An [import-ready blueprint](usage-automations.md#blueprints-we-provide) does it for a plain switch, for Irrigation Unlimited, or for a Rain Bird, Hydrawise, Rachio, OpenSprinkler or B-hyve controller. Turn the controller's own schedule off if it has one, or it will water twice.

Either way, the **Home** page tells you whether an installation would ever water, and names the reason when it would not.

## 6. Check it, tonight and tomorrow

- **Home** page: what happens next, and what would hold it back. It answers in one sentence.
- Press **irrigate now** on a zone, or add the [dashboard card](usage-card.md) and press it there: two taps, and you should hear water.
- Tomorrow morning, the zone's **calculation explanation** shows the night's numbers: what was read, what evaporated, what rain was credited, and the duration it produced.

## After a week

Change one thing at a time, and let a few days pass before judging it.

- **It waters too often, in short runs.** Raise the zone's **irrigation threshold**: the deficit it lets build up before watering at all. Deep and infrequent is better for almost everything, a lawn included; the [zones page](configuration-zones.md) has the arithmetic for picking a number from your soil and root depth.
- **It waters too much or too little overall.** The **crop factor** is the honest knob (the *what grows here* choice sets it), not the duration. Check the flow you measured first.
- **The ground stays soaked.** Your soil cannot take it that fast: **water in several passes** with a soak between them, under Settings > General on the advanced panel.
- **Nothing happens at all.** [Troubleshooting](usage-troubleshooting.md), then an [issue](https://github.com/altmenorg/HAsmartirrigation/issues) with a diagnostics file, which is the fastest way to a real answer.

## What to read next

- [How it works](how-it-works.md): the water balance, in plain terms.
- [Which weather service](weather-services.md), and what each one gives you.
- [Zone configuration](configuration-zones.md): every setting on a zone and what it does.
- [Closed loop](configuration-closed-loop.md): letting Smart Irrigation drive the valve, crediting from real runs, and cycle and soak.
