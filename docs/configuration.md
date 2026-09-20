---
layout: default
title: Configuration
---
# Configuration

You use the Smart Irrigation panel to configure the integration. Make sure you [install](installation.md) it first.

![](assets/images/configuration-1.png)

The panel has a tab per job:

1. [Setup](configuration-setup.md): a guided way to create your first zone, one question at a time. It creates a module, a sensor group and a zone for you, and locks nothing.
2. [Info](usage-info.md): what will happen at the next start and why, whether it would be skipped, and where each zone stands right now.
3. [General](configuration-general.md): update and calculation schedules, start triggers, and the other settings that apply to everything.
4. [Zones](configuration-zones.md): the zones of your irrigation system. Each is mapped to a sensor group and a module, and several zones can share either.
5. [Modules](configuration-modules.md): how the calculation is done, in three modes.
6. [Sensor groups](configuration-sensor-groups.md): which sensors or weather service provide each value the calculation reads.
7. [Weather service](installation-weatherservice.md): the service itself, and a history of what it returned and when.
8. [History](usage-info.md): what actually ran, by day, with durations and volumes.
9. **Backup / restore**: export the whole configuration to a file, and put it back.
10. **Help**: links to this documentation.

See also: [Closed-loop watering](configuration-closed-loop.md), which lets Smart Irrigation credit the bucket from real irrigation and, optionally, drive the valves itself.