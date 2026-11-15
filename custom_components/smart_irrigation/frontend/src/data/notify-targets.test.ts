import { describe, expect, it } from "vitest";

import { notifyTargets } from "./notify-targets";

describe("notifyTargets", () => {
  it("lists the persistent notification, entities and actions, once each", () => {
    const targets = notifyTargets({
      states: {
        "notify.kitchen_display": { attributes: { friendly_name: "Kitchen" } },
        "sensor.other": {},
      },
      services: {
        notify: {
          send_message: {},
          persistent_notification: {},
          notify: {},
          mobile_app_pixel: {},
          kitchen_display: {},
        },
      },
    });
    expect(targets).toEqual([
      { id: "persistent_notification", name: "persistent_notification" },
      { id: "notify.kitchen_display", name: "Kitchen" },
      { id: "notify.mobile_app_pixel", name: "notify.mobile_app_pixel" },
    ]);
  });

  it("lists a phone once, as its action, under its entity's name", () => {
    const targets = notifyTargets({
      states: {
        "notify.pixel_anthony": { attributes: { friendly_name: "Pixel" } },
      },
      services: { notify: { mobile_app_pixel_anthony: {} } },
    });
    expect(targets).toEqual([
      { id: "persistent_notification", name: "persistent_notification" },
      { id: "notify.mobile_app_pixel_anthony", name: "Pixel" },
    ]);
  });

  it("still offers the persistent notification when nothing else exists", () => {
    expect(notifyTargets({ states: {}, services: {} })).toEqual([
      { id: "persistent_notification", name: "persistent_notification" },
    ]);
  });
});
