---
layout: default
title: Usage: The output contract
---
# The output contract

> Main page: [Usage](usage.md)<br/>
> See also: [Entities](usage-entities.md), [Events](usage-events.md), [Automations](usage-automations.md)

This page is for anybody who drives the water themselves: your own automation, a controller integration, or another integration that wants to consume what Smart Irrigation decides. It is one page on purpose, so it can be read without reading the rest, and it says what is promised and what is not.

Smart Irrigation calculates. Something else opens a valve. This is the interface between the two.

## The one number

Per zone, one sensor carries the answer:

```
sensor.smart_irrigation_<zone name>
```

- **The state is a number of whole seconds.** It is the time that zone needs the water on for.
- **`0` means do nothing.** Not "run briefly": there is nothing owed, or what is owed is below the zone's threshold, so a run would be a trickle. Treat `0` as a skip.
- It is never negative.
- Its attributes carry the rest (the bucket, the water need, the units in use, the last calculation): see [entities](usage-entities.md).

How that number is produced, in order: the soil water deficit in millimetres, divided by the zone's precipitation rate, gives an hour fraction; that becomes seconds. Below the zone's **irrigation threshold** the result is `0`. Above the zone's **maximum duration** the result is that maximum. The zone's **lead time** is then added, and the whole is rounded to the second, so a zone with a lead time can publish slightly more than its maximum duration: the maximum bounds the watering, the lead time is the delay before water actually arrives.

The crop factor is not applied here. It scales the evapotranspiration that fills the bucket, so the deficit already carries it.

## When it changes

1. **At the calculation time** (23:00 by default, or a schedule of your own, or the `calculate_all_zones` action). Every automatic zone gets a new duration.
2. **At the start trigger**, just before the start event fires: rain that fell between the calculation and now shortens the run, zones sheltered from forecast rain are separated from exposed ones, and a zone whose own soil moisture sensor says it is wet is held back. So the duration you read when the event arrives is the one to use, not the one from the night.
3. **After a run is credited**, if you use observed watering or direct valve control: crediting the bucket recomputes the duration from it, which normally lands on `0`.
4. **Never on its own between those.** The number stands until one of the above.

If you want a value that moves with the weather through the day, that is the **Live bucket** sensor, which is an estimate and is documented as one.

## The events

| Event | When | Data |
| --- | --- | --- |
| `smart_irrigation_start_irrigation_all_zones` | A start trigger is reached and today is a watering day | The trigger's identity |
| `smart_irrigation_irrigation_skipped` | A start trigger is reached and today is not | The trigger's identity, `reason`, and `checks`, the same detail the Home page shows |
| `smart_irrigation_irrigation_started` | Direct valve control begins a run | `sequencing`, and `zones`: `{zone_id, zone, seconds}` |
| `smart_irrigation_irrigation_finished` | Direct valve control finishes | `zones`: `{zone_id, zone, seconds, volume_l, bucket}`, and `problems`: `{zone_id, zone, reason}` |
| `smart_irrigation_zone_problem` | A valve did not open | `zone_id`, `zone`, `entity_id`, `reason` |

The skip event exists because the absence of an event is not something an automation can listen for.

## Consuming it

**As seconds.** Read the sensor, open the valve, wait that long, close it. This is what the [`standard-irrigation` blueprint](usage-automations.md#blueprints-we-provide) does.

**As minutes.** Most off-the-shelf controllers take whole minutes. Round **up**, never down: rounding 90 seconds down to one minute loses a third of the water, and the deficit then rolls to the next day. The [controller blueprints](usage-controllers.md) do this.

**As a percentage or a coefficient.** Some schedulers do not take a duration, they scale their own base time. Ours is an absolute need, not a scaling of somebody's schedule, so the mapping has to be made explicit:

- with a base time of **1 second**, a multiplier-based system reads the seconds directly. That is why [Irrigation-V5](usage-enhanced-scheduling-integration.md) needs no blueprint: point its adjustment sensor at the zone sensor and set the base watering time to 1 second.
- with a real base time, the percentage is `our seconds / base seconds x 100`, and the scheduler's own limits apply.
- **Irrigation Unlimited** takes both: `adjust_time` in `actual` mode takes a duration, which is what our blueprints use. Adjusting a *sequence* rather than a zone spreads the time across its zones in proportion to their original durations, which is not what a calculated duration means, so adjust one zone at a time.

## What to send back

**In open loop**, tell us the water was delivered, or the deficit stays and the zone waters again tomorrow:

```yaml
action: smart_irrigation.reset_bucket
data:
  entity_id: sensor.smart_irrigation_lawn
```

**In closed loop** (observed watering or direct valve control), send nothing: the integration credits the bucket from the run itself. Calling `reset_bucket` as well counts the water twice, which empties the bucket and makes the next calculation ask for more than it should.

Never both, and never a blueprint that resets the bucket on top of a closed-loop setup. The [closed loop page](configuration-closed-loop.md) says which is which.

## Promised, and not promised

**Promised.**

- The duration is whole seconds, `0` or positive, one per zone.
- `0` means no run at all.
- Depths in the entities follow Home Assistant's unit system; internally everything is metric and converted at the edges only.
- The start event fires once per trigger, and either it or the skip event fires when a trigger is reached.
- The duration published when the start event fires already accounts for rain since the calculation.

**Not promised.**

- That a zone has a duration at all: a zone with no precipitation rate (no area and flow, no rate) cannot have one, and publishes `0`.
- That the run finishes before any particular moment. The default trigger works back from sunrise using the sum or the maximum of the zone durations depending on the sequencing, plus soaking and pauses when direct valve control performs the run, but nothing here can know how long your own executor takes.
- That the number will not change between the event and your action: an executor that waits an hour before starting should read the sensor again.
- That a zone's duration is independent of the others. The sequencing setting decides what the whole run is taken to be.

## If you maintain an integration

If you want to consume this from another integration rather than from an automation, the same contract applies and the events above are the hook. The zone entities are stable: the duration sensor's `entity_id` and its recorded history have been preserved across every version of this integration, deliberately. An [issue](https://github.com/altmenorg/HAsmartirrigation/issues) or a [discussion](https://github.com/altmenorg/HAsmartirrigation/discussions) is the place to ask for something the contract does not cover yet.
