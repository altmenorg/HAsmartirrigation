---
layout: default
title: "Usage: Assistants (AI)"
---

# Assistants (AI)

> Main page: [Usage](usage.md)<br/>

Smart Irrigation can be offered to an assistant: Claude, ChatGPT or any other client of the Model Context Protocol (MCP), or a conversation agent of Home Assistant (Assist). The assistant can then answer questions such as "why was the lawn not watered this morning?", "what will run tomorrow?" or "which zone is the driest?", and help you write a program.

It is **off by default** and **read only**: the assistant can read and check, it cannot change the configuration and it never opens a valve.

## Turning it on

1. In Smart Irrigation, **Settings**, **AI access**, turn on **Offer Smart Irrigation to assistants**. Smart Irrigation then registers an API with Home Assistant; it runs no server of its own.
2. For an MCP client: add Home Assistant's own **Model Context Protocol Server** integration (Settings, Devices & services, Add integration) and tick **Smart Irrigation** in its options. Connect the client to Home Assistant as that integration's page explains; Home Assistant does the authentication.
3. For Assist: in the options of your conversation agent, tick **Smart Irrigation** among the APIs it may use.

Turn the option off and the API is taken away at once.

## What the assistant can do

| Tool | What it gives |
| --- | --- |
| `GetZones` | Each zone: state, water balance (mm, a deficit when negative), next duration, valve, size, throughput, lead time, sensor group. |
| `GetIrrigationInfo` | The next watering and why a zone is held back or skipped, as on the Home tab. |
| `GetPrograms` | The programs of the [full controller](usage-full-controller.md), their steps (zones by id and by name) and schedules. |
| `GetPlanning` | What the programs will water over the next days (1 to 14), each run's zones in order and whether the weather is expected to hold it back. |
| `PreviewProgram` | A program as the assistant wrote it, cleaned the way a save cleans it and dry-run on the zones as they are now: each zone's start, end and water, the total, and the zones it could not find. Nothing is saved. |

## Writing a program with an assistant

Ask for the program you want ("water the vegetable garden and the greenhouse together every other evening, then the hedges"). The assistant writes it in the [YAML shape of the program editor](usage-full-controller.md#a-program-in-yaml), checks it with `PreviewProgram` and gives it to you. Paste it in **Watering**, **Programs**, **New program in YAML** (or **Edit in YAML** on an existing program): the timeline shows what it would do before you apply it.

## Privacy

The assistant receives what these tools return: zone names, valve entity ids, the weather-based figures and the schedules. With a cloud assistant, that leaves your home. Leave the option off if you do not want that.
