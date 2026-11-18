---
title: "Configuration"
---
# Configuration

Smart Irrigation is configured in its own panel, **Smart Irrigation** in the Home Assistant sidebar. [Install](installation.md) it first.

![The Smart Irrigation panel](assets/images/configuration-1.png)

## The tabs

The panel has four tabs, five with **Calculate and water**. Each is a group of pages: a tab opens its first page and shows the others on a second row.

1. **Home**: what is happening. [Info](usage-info.md) says what will happen at the next start and why, whether it would be held back, where each zone stands right now, and the days ahead. **History** says what actually ran, by day, with durations and volumes.
2. **Zones**: [the zones](configuration-zones.md) of your irrigation system: what each waters, how it is calculated, and what it is short of.
3. **Watering**, with **Calculate and water** only: **Planning**, **Programs**, and **Pumps and valves**. See [Watering with programs](usage-full-controller.md).
4. **Weather**: where the numbers come from, and what holds a run back. See [Weather configuration](configuration-weather.md):
   - **Weather service**: the [weather service](installation-weatherservice.md), the location it is read for and how often it is read;
   - **Sensor groups**: which sensor or service provides each value the calculation reads ([sensor groups](configuration-sensor-groups.md));
   - **Skip watering**: every check that can [hold a run back](configuration-weather.md#skipping-a-run), the days between irrigation included.
5. **Settings**: what you set once. [General](configuration-general.md): what Smart Irrigation does (Calculate and water, Calculate only, or Stop everything), then the calculation, the control and the system. Then **Backup / restore**, and **Help**.

Two pages are in no tab, and open from a card of **Settings › General**:

- the [setup assistant](configuration-setup.md), for a first zone, another one, or a fresh start;
- the [import from Irrigation Unlimited](usage-from-irrigation-unlimited.md#importing-your-configuration).

There is no modules page any more: a zone says how it is calculated, and the [module](configuration-modules.md) behind that answer is created and reused for you.

??? note "Coming from an older version"

    The panel used to have ten tabs. The **Weather** tab was called **Data**, and the **Skip watering** page was called **Skip on weather** until 2026.11.1. The pages kept their addresses.

## Standard and advanced

The panel comes in two depths, switched by **Advanced settings** under **Settings › General**, in the System section.

The **standard** panel keeps what a zone is: its name, what it waters with, where its weather comes from, what it is short of. The **advanced** panel adds the settings that tune the model (the drainage rate, the thresholds, the crop factor, how far ahead a zone looks...). They have sound defaults and are not improved by being met by accident. These pages mark them like this:

!!! advanced

    A setting shown only on the advanced panel. Once it is changed from its default, most of them show in every mode, so a setting in use is never hidden.

An installation that already had zones when the two depths arrived is on the advanced panel, because those settings were chosen on purpose. A fresh installation starts on the standard one. Either way the choice is yours, and nothing is lost in either direction: the settings keep their values.

## Set in YAML

Programs and zones have **Edit in YAML**, which shows every option as text. A program's power-user options (rounds, time added, days of the month, months, some of the weather checks...) and a zone's resends of the open are fields of the advanced mode only: in the standard mode, a program or a zone that uses one lists it in a **Shown in the advanced mode or in YAML** box, with **Edit in YAML** at hand. Two technical options have no field in any mode and are written in YAML only. These pages mark them like this:

!!! yaml-only

    An option with no field in the form, in any mode. Editing in the form keeps it, and a program or a zone that uses one lists it in a **Set in YAML (not editable here)** box, with **Edit in YAML** at hand.

The tiers are under [advanced and YAML-only options](usage-full-controller.md#yaml-only-options), and every key of a program is in its [reference](usage-full-controller.md#a-program-in-yaml).

See also: [Closed-loop watering](configuration-closed-loop.md), which credits the water balance from real watering and covers what happens at the valve.
