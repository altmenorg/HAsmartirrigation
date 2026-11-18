---
title: "Info and history"
---
# Info and history

The **Home** tab answers the questions the other tabs cannot: what is about to
happen, and what already happened. Info is its first page, History its second.

## Info

### One answer, first

The page opens with a single sentence: this zone will water for so long at the next start, or nothing is short of water, or a postponement is holding it back, or the weather is. While something waters, it says **Watering now**, with **Pause**, **Next step** and **Stop** at hand.

Underneath it, the detail: what decides the start, whether it works back from sunrise, the zones that would run and how the total is counted. When the start works back from sunrise, it is the moment the run has to begin to finish on time, so it moves with the season and with the durations themselves. A run shortened by rain still starts when it was scheduled and finishes early, rather than starting late.

Three warnings stand above the sentence while they are true, since each needs something done:

- **Nothing is armed to start a run that is owed.** The time shown is arithmetic; whether anything is armed to act on it is another question.
- **A zone is no longer being calculated**, with the date of its last calculation. One zone can freeze while everything else works, and it then waters on the weather of days ago.
- **This installation would never water**, when the configuration says so: **No watering duration is being calculated**, **No zone waters on its own**, or **Nothing here opens a valve**. An installation can be correct, update its durations every night and never open a valve, in silence: this says so.

Everything else comes after the sentence, the buttons to hold watering back first.

### Hold watering back

**Hold for 24 h** and **Hold for 48 h** postpone every zone, for rain the forecast missed or an afternoon on the lawn; **Resume now** lifts it. A postponement ends by itself and resets nothing, so the deficit it held back is still there afterwards. The same thing is available as the `postpone_irrigation` and `resume_irrigation` actions, and as buttons of the hub device (see [entities](usage-entities.md)).

### Will it be skipped?

When nothing holds the next run back, the card says so in one line; open it for the checks. When something does, the checks are shown straight away.

Seven checks can hold a run back, each with its own state and its own numbers: a postponement of yours, the rain sensor, the freeze, the wind, the rain forecast against your threshold, the days since the last watering against the days between irrigation, and the soil moisture of the zones. They are set on [Weather › Skip watering](configuration-weather.md#skipping-a-run).

This is a **preview, not a promise**. It is evaluated now, and a forecast can change before the start. That is also why a projected skip does not move the next start to the following day: the page says the start would be skipped on the forecast as it stands, and shows the numbers it says it from.

Underneath, the **last real decision**, with the moment it was taken.

To be told rather than to look, use the [`smart_irrigation_irrigation_skipped` event](usage-events.md), fired when a start is skipped, with the reason.

### Where each zone stands

For every zone: the deficit **now**, the deficit **at its last calculation**,
how long it **would water** if it ran at this moment, and when it **last
watered**.

The headline and this table use the live estimate. With the watering duration set to **Just before each start**, the announced run is the estimate, and a line says so. The warning **No watering duration is being calculated** only appears when the watering duration is set to **Only when I ask** (see [General settings](configuration-general.md#calculating-the-watering-duration)). With Calculate only and the active start trigger on **None**, the page says **No trigger is active**. **At last calculation** shows the day and time of that calculation.

"Now" is an estimate. It re-runs the calculation over the readings collected
since the last one and throws the result away: nothing is written, no reading
is consumed, and the zone keeps the value of its last calculation until the
next one. It is there to answer "what would happen if it ran right now"
without disturbing anything.

A zone shows nothing here when no reading has arrived since it last
calculated, which is normal in the minutes after a calculation.

## History

The **History** page lists what actually ran, grouped by day: which zone, when,
for how long and how much water. A run appears whether Smart Irrigation drove
the valve itself or observed one being driven by something else.

The **Weather › Weather service** page keeps its own history of what was
retrieved and when, which is the place to look when a calculation used a value
you did not expect.

For the full chain behind a single number, from each raw reading to the
duration, there is the opt-in
[calculation log](configuration-general.md#calculation-log).
