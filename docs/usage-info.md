---
layout: default
title: Usage: Info and history
---
# Info and history

> Main page: [Usage](usage.md)<br/>
> Next: [Dashboard card](usage-card.md)

The **Home** tab answers the questions the other tabs cannot: what is about to
happen, and what already happened. Info is its first page, History its second.

## Info

### One answer, first

The page opens with a single sentence, because that is what the question
deserves: this zone will water for so long at the next start, or nothing is
short of water, or a postponement is holding it back, or the weather is. It
used to print four rows of label and value which between them managed to say
"next run tomorrow at 07:58" and "nothing to water" at the same time -- both
true, and nonsense together.

Underneath it, the detail: which trigger decides the start, whether it works
back from sunrise, the zones that would run and how the total is counted. When
a trigger works back from sunrise, the start is the moment the run has to begin
to finish on time, so it moves with the season and with the durations
themselves. A run shortened by rain still starts when it was scheduled and
finishes early, rather than starting late.

Three things the page says when they are true, each of which used to be
invisible:

- **nothing is scheduled to start a run that is owed.** The time above it is
  arithmetic; whether anything is armed to act on it is another question, and a
  countdown reaching zero and rolling over to tomorrow is what the answer used
  to look like.
- **a zone has stopped being calculated**, with the date of its last one. One
  zone can freeze while everything else works, and it then waters on the
  weather of days ago.
- **this installation would never water**, when the configuration says so:
  nothing calculated, no zone in a state that waters, or nothing here that can
  open a valve. This integration calculates and something else acts, so an
  installation can be correct, update its durations every night and never open
  a valve, in silence.

### Hold watering back

One button postpones every zone for a day or two, for rain the forecast missed.
It ends by itself and resets nothing, so the deficit it was holding back is
still there afterwards. The same thing is available as the
`postpone_irrigation` action for automations.

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

The headline and this table use the live estimate. With the watering duration set to **Just before each start**, the announced run is the estimate, and a line says "Estimated: the zones are calculated again just before the start". The warning "Nothing is being calculated" only appears when the watering duration is set to **Only when I ask** (see [General configuration](configuration-general.md)). When the active start trigger is **None**, the page says "No trigger is active". **At last calculation** shows the day and time of that calculation.

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
