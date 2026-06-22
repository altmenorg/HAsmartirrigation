---
layout: default
title: Introduction
---
# HAppy Irrigation

Ever wondered if you're watering your lawn/garden/greenhouse/plants/crops too much or too little?
Are you fed up with the guesswork? Did you just set the timer on your sprinklers to 15 minutes?
Do you have a watering system that you can control through Home Assistant (turn on / turn off)?

If so, this integration is for you!

This integration calculates the time to run your irrigation system to compensate for moisture loss by [evapotranspiration](https://en.wikipedia.org/wiki/Evapotranspiration). Using this integration you water your garden, lawn or crops precisely enough to compensate what has evaporated. It takes into account precipitation (rain, snow) and moisture loss caused by evapotranspiration and adjusts accordingly.
If it rains or snows less than the amount of moisture lost, then irrigation is required. Otherwise, no irrigation is required.
The integration can take into account weather forecasts for the coming days and also keeps track of the total moisture lost or added ('bucket').
Multiple zones are supported with each zone having it own configuration and set up.

Note that this integration does not control your irrigation system - it merely calculates durations and you are expected to build an [automation](usage-automations.html) to interact with your irrigation system.

> **Note - use this integration at your own risk - we do not assume responsibility for any inconvience caused by using this integration. Always use common sense before deciding to irrigate using the calculations this integration provides. For example, irrigating during excessive rainfall might cause flooding. Again - we assume no responsibility for any inconvience caused.**

**Sounds good? let's get started with [installation](installation.md)**.

Prefer to learn more first? Read [how it works](how-it-works.md) or watch [our official tutorial videos on Youtube (English)](https://youtube.com/playlist?list=PLUHIAUPJHMiakbda92--fgb6A0hFReAo7&si=82Xc6mHoLDwFBfCP) and [community-created tutorial in German](https://youtu.be/1AYLuIs7_Pw).

---

## Attribution

**HAppy Irrigation** is an independent, community-maintained fork of [Smart Irrigation](https://github.com/jeroenterheerdt/HAsmartirrigation) created by [Jeroen ter Heerdt](https://github.com/jeroenterheerdt) and its contributors. This documentation is derived from the original project's documentation and adapted for the fork.

Both the original integration and this fork are distributed under the [MIT License](https://github.com/altmenorg/HAppyIrrigation/blob/master/LICENSE) — © Jeroen ter Heerdt and contributors. All credit for the underlying evapotranspiration calculation engine and the original design goes to the original authors. The original documentation remains available at [jeroenterheerdt.github.io/HAsmartirrigation](https://jeroenterheerdt.github.io/HAsmartirrigation/).
