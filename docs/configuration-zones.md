---
title: "Zone configuration"
---
# Zone configuration

A zone is one part of the garden watered by one valve (or several opened together). Create as many as you have, each with its own area and flow. The duration of each zone is calculated from its water balance, its [module](configuration-modules.md) and its [sensor group](configuration-sensor-groups.md).

A zone is in one of three states:

- **Automatic**: Smart Irrigation calculates the duration from the water balance and waters at the start. It needs a [sensor group](configuration-sensor-groups.md).
- **Manual**: you set the duration yourself, in minutes. Every start waters the zone for that duration, whatever its water balance. No sensor group is needed.
- **Disabled**: never watered, and its water balance is not followed. Its duration is 0.

!!! tip "Units"

    Take note of the unit shown beside each field, so you enter values in the right one. Metric and imperial follow the unit system of Home Assistant.

## Adding a zone

Under **Zones**, the **Add zone** card asks for:

- **Name**: the name of the zone, for example "Lawn";
- **Size**: the area it waters, in m² or sq ft;
- **Throughput**: its flow, in litres or gallons per minute.

**Add zone** creates it, and **Set it up with the assistant** opens the [setup assistant](configuration-setup.md) instead. Each zone becomes a set of [entities](usage-entities.md) in Home Assistant. Then configure the rest of the zone, below.

## Actions on all zones

![The Actions on all zones card](assets/images/configuration-zones-1.png)

The **Actions on all zones** card acts on every automatic zone:

- **Update all zones**: read the weather for the [sensor groups](configuration-sensor-groups.md) of the automatic zones.
- **Calculate all zones**: calculate the duration of every automatic zone. The weather data used is deleted afterwards.
- **Reset all water balances**: set every automatic zone's water balance to 0.
- **Clear all weather data**: delete the weather data collected for the sensor groups of the automatic zones.

The last two discard data of every zone, and each asks first.

## Configuring a zone
To configure a zone, you need its flow (throughput) and the area it waters (size). If you do not know them, enter its precipitation rate (in mm/h or in/h) instead. To measure it, place a straight-sided container in the zone, water for exactly one hour, and measure the depth of water collected: that depth is the precipitation rate.

Every field of a zone has a short hint under it in the panel. For a manual zone, the line under the zone name shows its duration and litres; an automatic zone does not show it. The status band of an automatic zone reads the live estimate: "Short by X mm: about N min (V L) at the next calculation" when the estimate gives a duration, "Will water ... at the next start" when a stored duration exists, "Nothing to water" with the deficit under the zone's threshold, or "has what it needs".

You can change the following settings on a zone:

- **Name**: the name of the zone.
- **Input method**: how the water delivered is known:
  - *Throughput & area* (default): the rate is calculated from **Size** and **Throughput**.
  - *Precipitation rate*: you enter the rate directly.
- **Size** and **Throughput**: used with *Throughput & area*.
- **Precipitation rate**: used with *Precipitation rate*.
- **Drainage rate**: how fast a saturated root zone drains, in mm/h, which is the soil's saturated hydraulic conductivity. It only applies when `bucket > 0`, meaning the soil is above field capacity. It is the full rate at saturation, when the water balance reaches the maximum water balance; below that it falls steeply with how much surplus is left, following [Brooks and Corey, Eq. 4-6](https://open.library.okstate.edu/rainorshine/chapter/1-8-models-for-soil-hydraulic-conductivity/). The drainage over a calculation is worked out from that rate law exactly, so a surplus drains quickly at first and more and more slowly as it empties. Indicative values, from the texture-class averages in Rawls, Brakensiek and Saxton (1982): about 210 mm/h for sand, 60 for loamy sand, 26 for sandy loam, 13 for loam, 7 for silt loam, 2 for clay loam and under 1 mm/h for clay. A new zone starts at 8 mm/h, loam in the panel's soil list. Zones made earlier started at 50.8 mm/h, which is fast for most garden soils, and keep it. Either starting value reads as "Not chosen yet", with the number, until a soil is picked or a rate typed. The field appears right under **Soil** only when the soil is "I set the drainage myself", in both modes: a soil chosen by name stands for its rate. A drainage rate of **0** means a surplus never drains: rain above field capacity then stays in the water balance until evaporation removes it, and the next irrigation is delayed by however many days that takes.
- **State**: *Automatic*, *Manual* or *Disabled*, described at the top of this page.
- **Evapotranspiration**: how this zone's water need is worked out, in three answers:
  - *Calculated by Smart Irrigation*, from your measurements (temperature, humidity, wind, sun), with FAO-56 Penman-Monteith;
  - *Provided by a sensor or a service*, when you already have an evapotranspiration in millimetres, taken as it is;
  - *A fixed amount*, so many mm a day whatever the weather.

  The [module](configuration-modules.md) behind your answer is created and reused for you, one per zone: there is nothing to create by hand and no module to choose. On the advanced panel, the module's own settings appear with it: **Look ahead**, the number of days to come averaged into today's need (0 by default), and **Coastal site**, for a zone calculated by Smart Irrigation; **Evaporation per day**, a positive number of mm, for a zone that uses a fixed amount. Each zone has its own, so changing them here changes nothing anywhere else.
- **Sensor group**: Choose the [sensor group](configuration-sensor-groups.md) that provides the weather data for this zone.
- **Water balance**: calculated, or set by hand. Negative, the zone is short of water; zero or above, it has what it needs. A deficit only leads to watering once it reaches the zone's **Irrigation threshold** (below). See [how it works](how-it-works.md).
- **Maximum water balance**: how much water the root zone can hold **above field capacity** before it is saturated, so it only applies when `bucket > 0`. Anything beyond it runs off, and it is the saturation reference the drainage curve is scaled by. It is not the total water your soil holds for the plant, and it never changes when a zone starts watering.

    Physically it is `(saturation - field capacity) x root depth`: the soil's drainable porosity over the depth the roots use. The same averages give about 0.35 for sand, 0.19 for loam and 0.08 for clay, so for a 20 cm root zone roughly **70 mm for sand, 40 mm for loam and 15 mm for clay**. Take them as a starting point: they move with how field capacity is defined, and a real soil is not a class average.

    Sand gets the larger value, not the smaller. Its big pores hold a lot of water for the short while it takes to drain and little once it has; clay is the reverse. Earlier versions of this page gave 30 mm for clay and 12 mm for sand. Those are closer to the available water capacity, which belongs to the other way of counting soil water, and they are inverted for this one. See [discussion #783](https://github.com/altmenorg/HAsmartirrigation/discussions/783) for how this was worked out.

- **Lead time**: the time your system needs before water arrives, in seconds: to connect, start a pump, build pressure. It is added to a calculated duration above 0.
- **Maximum duration**: the longest run of the zone, to avoid flooding or waste. When one run at this duration cannot make up what the zone loses between two waterings (a drip line capped at ten minutes with three days between waterings, say), Smart Irrigation raises a repair issue naming the zone: its deficit would otherwise grow for good. It is advice, and clears itself once the zone can keep up.
- **Crop factor (Kc)**: the factor between the reference evapotranspiration and what the planting uses. The field appears right under **What grows here** only when that choice is "I set the crop factor myself". It scales the evapotranspiration to the water your crop actually uses, `ETc = ET0 * Kc`, so the water balance is depleted at the crop's rate rather than the reference one. It is applied to the evapotranspiration and not to the rain that fell on it, nor to the resulting duration. For lawns, it is recommended to set the crop factor depending on your grass type (See [this discussion for more details](https://github.com/altmenorg/HAsmartirrigation/discussions/448)):
  - cool-season grasses (such as fescue, bluegrass): `0.8`;
  - warm-season grasses (such as bermuda, zoysia): `0.7`.

  **It carries plant density too, not just species.** The reference the calculation starts from is a continuous grass surface, so the figure quoted for a species assumes it covers the ground. A zone that does not is using less water per square metre than that figure says, because there is less leaf there to lose it. A hedge on a drip line, measured over the strip its emitters wet, is close to full cover once it has grown together and the species figure is about right. A young or widely spaced planting is not, and its factor should come down roughly in proportion to how much of the zone the canopy actually shades. The landscape literature writes this as the species factor multiplied by a density factor, which is the same idea.

  This is why the area you enter and the crop factor have to describe the same patch of ground. If you take the whole bed as the area for a drip line, you are claiming a canopy over all of it; if you take the wetted strip, you are claiming one over the strip, which for an established hedge is true. Either can be made correct, but not by mixing one area with the other's factor.

  A dry spell waters the same as it always did: the crop factor ends up multiplying the same total either way. What changes is a period with rain, where a factor below 1 used to credit only that fraction of the millimetres that fell and therefore over-watered, and the moment irrigation becomes necessary, which now arrives at the crop's rate of depletion rather than about `1/Kc` times too early.
- **Soil**: the soil of the zone by name (sandy, sandy loam, loam, clay loam, clay), which stands for its drainage rate (see Drainage rate above). Choose "I set the drainage rate myself" to type the rate. A zone nobody chose a soil for reads "Not chosen yet:" and its starting rate; choosing that again puts the zone back on 8 mm/h.
- **What grows here**: the planting by name (lawn, vegetables, flowers, shrubs, hedge, fruit trees, vines, ground cover), which stands for its crop factor. Choose "I set the crop factor myself" to type the Crop factor (Kc) above. A zone nobody chose a planting for reads "Not chosen yet: factor 1.0".
- **Soil moisture sensor** and **Skip at or above** (advanced mode; once a sensor is set, they show in every mode): a sensor of the soil of this zone and the % from which the zone sits out a run. See [Skipping a run](configuration-weather.md#skipping-a-run).
- **Linked valve/switch**: the valve or switch that waters this zone. It is what [observed watering](configuration-closed-loop.md) watches, and what Smart Irrigation opens with **Calculate and water**. It can be linked once Calculate and water or observed watering is on.
- **Other valves of the zone**, **Pump or main valve**: valves opened and closed together with the linked one, and the [supply](usage-full-controller.md#pumps-and-main-valves-supplies) that feeds the zone (Calculate and water).
- **Wait for the valve to confirm**, the safety off fields, **Valve's own duration** and **If the valve's own timer can't be set** (advanced mode, with Calculate and water and a linked valve): see [when Smart Irrigation runs the valves](configuration-closed-loop.md#when-smart-irrigation-runs-the-valves) and [hardware auto-off](configuration-closed-loop.md#hardware-auto-off-mqtt-on_time-dead-man).
- **Ignore runs up to** (advanced mode): see [leave short runs out](configuration-closed-loop.md#optional-leave-short-runs-out).
- **Cumulative volume meter**: a water-meter total for the zone, for exact crediting instead of throughput x time. See [the volume meter](configuration-closed-loop.md#optional-a-cumulative-volume-meter-more-precise).
- **Days between irrigation** (advanced mode; once set, it shows in every mode): the minimum number of calendar days between two waterings of this zone alone. Empty, the default, follows the general [days between irrigation](configuration-weather.md#days-between-irrigation-events) setting, which is what every installation did before this field existed. A number replaces the general setting for this zone: `1` waters it every day it needs water, `3` at most every third day, `0` removes the restriction for it. The days are counted from the last time *this zone* was watered, and the zone's deficit keeps building while it waits, so it is made up at the next run. Useful when one garden holds a lawn that wants infrequent deep watering and flower beds that want water daily.
- **Crop factor by month** (advanced mode): for a crop whose water use follows its growth, the crop factor (Kc) of each month, January first. A month left empty uses the crop factor of the zone, and twelve empty months are that crop factor all year, as before. A lawn can read 0.6 in March, 0.9 in June and 0.5 in November without a single adjustment to create. [Seasonal adjustments](configuration-general.md#seasonal-adjustments) still apply on top, as a multiplier of the factor of the month.
- **Available water** and **allowed depletion** (advanced mode): what the soil of the zone holds for the plants, in mm, and the share of it the plants may use up before they suffer. Empty, the default, leaves the water balance exactly as it was: the deficit grows for as long as it does not rain. Set the available water (the root depth in metres times what the soil holds per metre of depth, about 50 to 110 mm for sand, 130 to 180 mm for loam and 120 to 200 mm for clay according to FAO-56, Table 19, so a lawn rooted at 0.15 m on loam holds about 20 to 27 mm) and two things change. The deficit cannot go below it, because a soil cannot be drier than that, and once the deficit passes the allowed share of it (50% unless you change it) the plants draw less water, falling to nothing as the soil empties (the FAO-56 stress coefficient). A zone watered in time never reaches that point, so the figure matters most after a long dry spell or a missed run, where it stops the water balance from showing a deficit no plant could have used. The threshold below stays in mm and is not tied to it.
- **Distribution efficiency** (advanced mode): the share of the water leaving the emitters that reaches the plants, in %. Empty is 100%: the throughput is taken at its word, as before. A zone at 80% waters 25% longer for the same depth, and credits the water balance with only 80% of what it delivers, whether it is timed, observed or metered. Sprinklers in wind or on a slope lose some; drip loses almost none.
- **Irrigation threshold**: how much of a soil moisture deficit to let build up before watering at all, in mm or inch. `0`, the default, waters as soon as anything is missing, which is what every installation did before this setting existed; it is not what agronomy recommends for anything, a lawn included. Set a threshold and the zone stays dry until that much water is owed, then delivers all of it in one deep run: a lawn wants a small one because its roots are shallow, a tree or a hedge a large one. It changes *when* a zone waters, not *how much*: once the threshold is reached the run still covers the whole deficit. It follows that a zone never waters less than its threshold, so it also rules out very short runs. In soil terms this is the management allowed depletion (MAD).

To pick a value, work from the water your soil actually holds for the plant, the total available water: `TAW = available water capacity of the soil x root depth`. As a rough guide the available water capacity runs about 50 to 110 mm per metre in sand, 130 to 180 in loam and 120 to 200 in clay ([FAO-56, Table 19](https://www.fao.org/4/x0490e/x0490e0c.htm)), and the root depth is what matters for that planting, perhaps 0.15 to 0.3 m for turf and a metre or more for an established tree. The threshold is then a fraction of that, `p x TAW`, with `p` around 0.5 as a starting point (FAO-56 gives per-crop values, mostly between 0.4 and 0.6). A lawn on loam at 0.2 m therefore lands somewhere near 15 mm.

Do **not** derive it from the **Maximum water balance**: that setting caps the surplus above field capacity, which is the other side of zero and a different quantity entirely.

The default of `0` is there to keep existing installs behaving exactly as before, not because watering the instant anything is missing is good practice. Deep and infrequent watering suits a lawn too; it simply wants a smaller threshold than a tree because its roots are shallower.

### Zone actions

Each zone's card also has:

- **Calculate**, **Update** (read its weather) and **Reset water balance**;
- **Water**, with Calculate and water and a linked valve: waters the zone now (see [watering one zone by hand](configuration-closed-loop.md#watering-one-zone-by-hand));
- **View weather data**: the last 10 records of its sensor group;
- **View watering calendar**: a 12-month watering estimate from the location and typical weather;
- **Delete**.

### A zone in YAML

The **Edit in YAML** icon in a zone's header row shows its settings as text, in place of the form, and back, as for a [program](usage-full-controller.md#a-program-in-yaml). The numbers are in the units the panel shows. Only settings are written: what the calculation and the runs write (water balance, duration, explanation, last calculation, measured throughput...) is not, and cannot be set there. An optional setting you remove is cleared; a required one (`name`, `size`, `state`...) is kept. Nothing is saved until **Apply**, which saves only what changed, the same way the form does; a key that is not a zone setting, or a value the zone refuses, is named under the editor.

```yaml
name: Front lawn
state: automatic
size: 50
throughput: 12
linked_entity: valve.front_lawn
safety_off_topic: zigbee2mqtt/front_lawn_valve/set
safety_off_state_key: state_l1
open_resends: 0
```

<a id="zone-yaml-only-options"></a>

!!! yaml-only "YAML only: the safety off state key"

    `safety_off_state_key: state_l1`, the [safety off state key](configuration-closed-loop.md#hardware-auto-off-mqtt-on_time-dead-man) (empty is `state`), has no field in the form, in any mode. Editing the zone in the form keeps it, and a zone that uses it says so in a **Set in YAML (not editable here)** box, with **Edit in YAML** at hand.

!!! advanced "Advanced mode: the resends of the open"

    `open_resends: 0`, how often [the open is sent again](configuration-closed-loop.md#when-smart-irrigation-runs-the-valves) while the valve has not confirmed (0 to 10; empty is the default), is a field of the advanced mode, next to **Wait for the valve to confirm**. In the standard mode, a zone that uses it lists it in a **Shown in the advanced mode or in YAML** box.
