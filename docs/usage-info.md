---
layout: default
title: Usage: Info and history
---
# Info and history

> Main page: [Usage](usage.md)<br/>
> Next: [Dashboard card](usage-card.md)

Two tabs answer the questions the other tabs cannot: what is about to happen,
and what already happened.

## Info

The **Info** tab is built around the next start, and it answers three
questions in order.

### When is the next run, and why then

The start time, which trigger decides it, the total duration and the zones that
would run. When the trigger works back from sunrise, the start is the moment
the run has to begin to finish on time, so it moves with the season and with
the durations themselves.

A run shortened by rain still starts when it was scheduled and finishes early,
rather than starting late.

### Will it be skipped

The two conditions that can hold a day back, each with its own state and its
own numbers: the rain forecast against your threshold, and the days since the
last irrigation against the interval you set.

This is a **preview, not a promise**. It is evaluated now, and a forecast can
change before the start. That is also why a projected skip does not move the
next start to the following day: the page says the start would be skipped on
the forecast as it stands, and lets you see the numbers it is saying it from.

Underneath, the last *real* decision, with the moment it was taken. That is the
one that actually happened.

If you want to be told rather than to look, the
[`smart_irrigation_irrigation_skipped` event](usage-events.md) fires when a
start is skipped, carrying the reason.

### Where each zone stands

For every zone: the deficit **now**, the deficit **at its last calculation**,
how long it **would water** if it ran at this moment, and when it **last
watered**.

"Now" is an estimate. It re-runs the calculation over the readings collected
since the last one and throws the result away: nothing is written, no reading
is consumed, and the zone keeps the value of its last calculation until the
next one. It is there to answer "what would happen if it ran right now"
without disturbing anything.

A zone shows nothing here when no reading has arrived since it last
calculated, which is normal in the minutes after a calculation.

## History

The **History** tab lists what actually ran, grouped by day: which zone, when,
for how long and how much water. A run appears whether Smart Irrigation drove
the valve itself or observed one being driven by something else.

The **Weather service** tab keeps its own history of what was retrieved and
when, which is the place to look when a calculation used a value you did not
expect.

For the full chain behind a single number, from each raw reading to the
duration, there is the opt-in
[calculation log](configuration-general.md).
