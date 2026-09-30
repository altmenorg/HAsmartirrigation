/**
 * Opening the panel lands on Home > Info (#871). The beta 6 fix changed where
 * the panel navigates when the address names no page, but getPath() answered
 * "general" for such an address, so that fix never ran.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { getPath } from "./navigation";

function at(pathname: string) {
  vi.stubGlobal("window", { location: { pathname } });
}

describe("getPath", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("opens on the info page when the address names none", () => {
    at("/smart_irrigation");
    expect(getPath().page).toBe("info");
    at("/smart_irrigation/");
    expect(getPath().page).toBe("info");
  });

  it("keeps the page the address names", () => {
    at("/smart_irrigation/general");
    expect(getPath().page).toBe("general");
  });
});
