---
title: "How it works"
---
# How it works

The picture below shows what Smart Irrigation does. The words for each part, as the panel uses them, are in the [glossary](glossary.md).

![Rain adds water to the soil, evapotranspiration takes it away, and the water balance keeps the difference](assets/images/smart_irrigation_diagram.png)

1. Rain and snow add water to the ground: the **precipitation**.
2. Sun, temperature, humidity, wind and the place on earth decide how much water leaves the ground and the leaves: the **evapotranspiration**.
3. The difference between the two is the **net precipitation** (the `delta`). Negative, more water was lost than the rain brought; positive, the rain brought more than was lost.
4. At each calculation, the net precipitation is added to the zone's **water balance** (the `bucket` attribute), which starts at zero: `new water balance = old water balance + net precipitation`.
5. Above zero, the soil holds more than it can keep, and the surplus drains. The drainage rate falls as the surplus empties, following the hydraulic conductivity of [Brooks and Corey, Eq. 4-6](https://open.library.okstate.edu/rainorshine/chapter/1-8-models-for-soil-hydraulic-conductivity/), scaled by the maximum water balance.

    When it rained during the period, the period is replayed **hour by hour**: each hour gets its evapotranspiration, the rain that fell in it, then that hour's drainage. The evapotranspiration of each hour is the hourly equation's own figure when the hourly calculation is on, and otherwise follows the sun (in proportion to how high it stands, nothing at night). A rain that just fell only drains from the hour it fell, not as if it had been in the soil since the previous calculation. When the rain fell is taken from the readings of the rain sensor (a rain gauge's total, or a rain rate); when nothing says it, the rain is spread evenly over the period.

6. Below zero, the zone is short of water: watering is needed.
7. The zone waters for `sensor.smart_irrigation_[zone_name]` seconds. That is 0 when the water balance is zero or above, or when the deficit is below the zone's **irrigation threshold**: deep and infrequent beats a daily trickle.
8. Afterwards, the water balance is credited with the water that went in. Three ways, and you pick one:
   - let Smart Irrigation [open the valve itself](usage-full-controller.md) (Calculate and water), which credits the runs it makes;
   - let it [watch the valve](configuration-closed-loop.md) (observed watering) and credit any run of it;
   - call [`credit_watering`](usage-services.md) from your own automation with how long the zone ran. A [blueprint](usage-automations.md) does it for you, per brand of controller.

   Never two of them, or the water is counted twice.

The whole of what is published and when it changes is on one page: [the output contract](usage-output-contract.md).

## What the crop needs, not what a lawn of grass would

The evapotranspiration the equation computes is a **reference**: what a short,
well-watered grass surface would lose. A hedge, a vegetable bed and a lawn do
not lose the same, and the difference is the **crop factor** `Kc`, which is the
zone's crop factor setting:

```text
ETc = ET0 x Kc
```

It is applied to the evapotranspiration, before the water balance. That order
matters, and it is worth saying why, because it used to be the other way round:
the factor was applied at the very end, to the duration. That scaled the whole
balance rather than the crop's water use, so a factor below 1 credited only that
fraction of the rain that fell, and the water balance kept draining at the full
reference rate, reaching any threshold about `1/Kc` times too fast. No factor
applied at the end can undo a decision about *when* to water.

The panel asks what grows in the zone, in words, and writes the FAO-56 factor
for the answer. Your own number wins if you set one.

## Hour by hour, or once a day

The equation exists in two forms, and both are FAO-56.

The **daily** form runs once over the whole window, on its averages. The
**hourly** form prices each hour of the window and adds them up. They are not
the same number, because evapotranspiration is not linear in its terms: a cool
humid night and a hot dry afternoon priced separately do not give what their
averages give, and the separate answer is the right one. The daily equation is
an average of a curve.

A new installation starts on the hourly form. One that existed before it arrived
keeps the daily one until its owner switches, because the two give different
numbers and nobody's watering should change on an update. The switch is under
Settings › General, and [what each form needs is documented
there](configuration-general.md).

Either way the sun is the term the result is most sensitive to. A radiation
sensor is best, a weather service that publishes radiation is next, and the
day's temperature range is the last resort: the estimate FAO-56 gives for
exactly that case.

## A week, as an example

To see how the precipitation, the net precipitation, the water balance and the watering work together, here is one zone over a week. Use it to check your own configuration. The values are made up and only show the mechanism.

At the start, the water balance is `0`, so the duration is `0` seconds.

### Variables used

- `P`: precipitation
- `Et`: evapotranspiration
- `D`: net precipitation, or delta (`P - Et`)
- `B`: water balance
- `Bu`: water balance after the calculation (`B + D`)
- `Du`: watering duration, in seconds

### Scenario

| Day | `P` | `Et` | `D` | `B` | `Bu` | `Du` | Notes |
|---|---|---|---|---|---|---|---|
|1|`0.5`|`0.1`|`0.4`|`0`|`0.4`|`0`|`P > Et`, so the water balance increased from `0` to `0.4`. Since `Bu > 0`, no watering is required|
|2|`0`|`0.6`|`-0.6`|`0.4`|`-0.2`|`180`|`P < Et`, so the water balance decreased from `0.4` to `-0.2`. Since `Bu < 0`, watering is required, and the water balance is credited back to `0` afterwards|
|3|`1`|`0.2`|`0.8`|`0` (credited)|`0.8`|`0`|No watering required|
|4|`0.2`|`0.4`|`-0.2`|`0.8`|`0.6`|`0`|No watering required, even though `P < Et` and the water balance decreased from `0.8` to `0.6`|
|5|`0`|`1.5`|`-1.5`|`0.6`|`-0.9`|`600`|Since `Bu < 0`, watering is required, and the water balance is credited back to `0` afterwards|
|6|`0`|`0.4`|`-0.4`|`0` (credited)|`-0.4`|`300`|Since `Bu < 0`, watering is required, and the water balance is credited back to `0` afterwards|
|7|`0.5`|`0.2`|`0.3`|`0` (credited)|`0.3`|`0`|No watering required|

## When to water

For most plants, a lawn included, deep and infrequent watering is better than a little every day: it encourages deep roots. Smart Irrigation does that with two settings rather than an automation of your own:

- the zone's **irrigation threshold**, the deficit it lets build up before watering at all (see [zones](configuration-zones.md), which explains how to pick a number from your soil and root depth);
- the **days between irrigation**, the fewest days between two waterings (see [Skip watering](configuration-weather.md#days-between-irrigation-events)).
