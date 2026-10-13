import { describe, expect, it } from "vitest";
import { readingsNotNeeded } from "./readings";

describe("readingsNotNeeded", () => {
  it("keeps the readings of a group whose zones are calculated, whatever its source (#909)", () => {
    // The reported group: a ready-made source kept from an older version,
    // three zones calculated by Smart Irrigation.
    expect(readingsNotNeeded({ provided: 0, calculated: 3 }, true)).toBe(false);
    expect(readingsNotNeeded({ provided: 0, calculated: 3 }, false)).toBe(
      false,
    );
  });

  it("keeps them when one zone of the group is calculated", () => {
    expect(readingsNotNeeded({ provided: 2, calculated: 1 }, true)).toBe(false);
  });

  it("leaves them out when every zone takes its evapotranspiration ready-made", () => {
    expect(readingsNotNeeded({ provided: 2, calculated: 0 }, true)).toBe(true);
    expect(readingsNotNeeded({ provided: 2, calculated: 0 }, false)).toBe(true);
  });

  it("follows the group's own source while no zone reads it", () => {
    expect(readingsNotNeeded({ provided: 0, calculated: 0 }, true)).toBe(true);
    expect(readingsNotNeeded({ provided: 0, calculated: 0 }, false)).toBe(
      false,
    );
  });
});
