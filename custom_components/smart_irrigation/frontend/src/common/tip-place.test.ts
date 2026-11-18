/**
 * The "i" bubble stays on the screen (#1047): on a phone it was cut off at the
 * right edge, or pushed the page sideways.
 */
import { describe, expect, it } from "vitest";

import { MARGIN, placeTip } from "./tip-place";

const phone = { width: 412, height: 900 };
const icon = (left: number, top = 100) => ({
  left,
  right: left + 18,
  top,
  bottom: top + 18,
});

describe("placeTip", () => {
  it("opens under the icon, from its start, when it fits", () => {
    expect(placeTip(icon(40), { width: 200, height: 80 }, phone)).toEqual({
      x: 32,
      y: 124,
    });
  });

  it("moves back inside the screen near its right edge", () => {
    const { x } = placeTip(icon(380), { width: 340, height: 80 }, phone);
    expect(x + 340).toBe(phone.width - MARGIN);
  });

  it("never starts left of the margin", () => {
    expect(placeTip(icon(2), { width: 396, height: 80 }, phone).x).toBe(MARGIN);
  });

  it("opens above the icon when there is no room under it", () => {
    const { y } = placeTip(icon(40, 850), { width: 200, height: 120 }, phone);
    expect(y).toBe(850 - 6 - 120);
  });

  it("stays under when there is no room above either", () => {
    const { y } = placeTip(icon(40, 50), { width: 200, height: 880 }, phone);
    expect(y).toBe(74);
  });

  it("ends at the icon in a right-to-left page", () => {
    const { x } = placeTip(icon(300), { width: 200, height: 80 }, phone, true);
    expect(x).toBe(300 + 18 + 8 - 200);
  });
});
