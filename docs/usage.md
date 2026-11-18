---
title: "Usage"
---
# Usage

Once Smart Irrigation is set up, it works out every day how much water each zone is short of. What happens next is up to you: Smart Irrigation can open the valves itself, or hand the durations to an automation, a controller or another integration. These pages cover both, and what you see along the way.

## Day to day

<div class="grid cards" markdown>

-   :material-home-outline:{ .lg .middle } **The Home tab**

    ---

    What is about to water, and why or why not; what already watered, in the history.

    [:octicons-arrow-right-24: Info and history](usage-info.md)

-   :material-view-dashboard-outline:{ .lg .middle } **The dashboard card**

    ---

    Where each zone stands and when the water goes on, next to your lights.

    [:octicons-arrow-right-24: The card](usage-card.md)

-   :material-robot-outline:{ .lg .middle } **Assistants (AI)**

    ---

    Ask Claude, ChatGPT or Assist about your watering, or let it set Smart Irrigation up with you.

    [:octicons-arrow-right-24: Assistants](usage-assistants.md)

-   :material-lifebuoy:{ .lg .middle } **Troubleshooting**

    ---

    A zone that does not water, a duration that looks wrong, a weather service that stays silent.

    [:octicons-arrow-right-24: Troubleshooting](usage-troubleshooting.md)

</div>

## Let Smart Irrigation water

With **Calculate and water**, Smart Irrigation runs the valves itself: programs of steps, schedules ("done by sunrise", every other day, only in summer), chained programs, pumps and main valves, and the planning of what will run and why.

<div class="grid cards" markdown>

-   :material-calendar-clock-outline:{ .lg .middle } **Programs and schedules**

    ---

    Everything about watering with Smart Irrigation at the wheel.

    [:octicons-arrow-right-24: Watering with programs](usage-full-controller.md)

-   :material-swap-horizontal:{ .lg .middle } **Coming from Irrigation Unlimited**

    ---

    Import your controllers, zones and sequences, and where each setting went.

    [:octicons-arrow-right-24: From Irrigation Unlimited](usage-from-irrigation-unlimited.md)

</div>

## Water with your own setup

With **Calculate only**, Smart Irrigation computes the durations and something else opens the valves.

<div class="grid cards" markdown>

-   :material-script-text-outline:{ .lg .middle } **Automations and blueprints**

    ---

    Ready-made blueprints for plain valves and ESPHome, and how to write your own.

    [:octicons-arrow-right-24: Automations](usage-automations.md)

-   :material-water-pump:{ .lg .middle } **Off-the-shelf controllers**

    ---

    Rain Bird, Hydrawise, Rachio, OpenSprinkler, B-hyve: a blueprint per brand hands them the durations.

    [:octicons-arrow-right-24: Controllers](usage-controllers.md)

-   :material-calendar-sync-outline:{ .lg .middle } **Irrigation Unlimited and Irrigation-V5**

    ---

    Hand the calculated run times to another irrigation integration.

    [:octicons-arrow-right-24: Other integrations](usage-enhanced-scheduling-integration.md)

</div>

## Reference

What Smart Irrigation publishes in Home Assistant, for automations and for your own code.

| Page | What it covers |
| --- | --- |
| [Entities](usage-entities.md) | The sensor of each zone and its attributes, and the hub's entities. |
| [Services](usage-services.md) | The actions you can call: calculate, fetch the weather, set a water balance, postpone, run a program… |
| [Events](usage-events.md) | What Smart Irrigation fires: a start, a skipped start, a program that started or finished, a leak. |
| [The output contract](usage-output-contract.md) | What is published, when it changes, and what is promised, for anyone driving the water from their own code. |
