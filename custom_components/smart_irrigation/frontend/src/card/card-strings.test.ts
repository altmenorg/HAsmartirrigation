/**
 * The card reads its words from the language files (#873), so Weblate
 * translates them with the panel's, and a missing or broken file leaves it in
 * English rather than without words.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

async function fresh() {
  vi.resetModules();
  return await import("./card-strings");
}

function respondWith(body: unknown, ok = true) {
  return vi
    .fn()
    .mockResolvedValue({ ok, status: ok ? 200 : 404, json: async () => body });
}

describe("card strings", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("answers in English without fetching", async () => {
    const fetchMock = respondWith({});
    vi.stubGlobal("fetch", fetchMock);
    const { cardString } = await fresh();

    expect(cardString("en", "next_start")).toBe("Next start");
    expect(cardString("en", "short_by", { value: "3 mm" })).toBe("short 3 mm");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers in the language once its file is in", async () => {
    vi.stubGlobal(
      "fetch",
      respondWith({ card: { next_start: "Nächster Start" } }),
    );
    const { cardString, loadCardStrings } = await fresh();

    expect(cardString("de", "next_start")).toBe("Next start");
    await loadCardStrings("de");
    expect(cardString("de", "next_start")).toBe("Nächster Start");
    // A string the file does not have yet is English.
    expect(cardString("de", "water_now")).toBe("Water now");
  });

  it("has the programs block words, with English as the fallback", async () => {
    vi.stubGlobal(
      "fetch",
      respondWith({ card: { programs: { start: "Démarrer" } } }),
    );
    const { cardString, loadCardStrings } = await fresh();
    expect(
      cardString("en", "programs.step_of", { step: "1", steps: "2" }),
    ).toBe("step 1/2");
    await loadCardStrings("fr");
    expect(cardString("fr", "programs.start")).toBe("Démarrer");
    expect(cardString("fr", "programs.states.paused")).toBe("paused");
  });

  it("translates a skip reason", async () => {
    const { cardString } = await fresh();
    expect(cardString("en", "reasons.precipitation")).toBe("rain forecast");
  });

  it("stays in English when the file cannot be read", async () => {
    vi.stubGlobal("fetch", respondWith({}, false));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { cardString, loadCardStrings } = await fresh();

    await loadCardStrings("fr");
    expect(cardString("fr", "next_start")).toBe("Next start");
  });

  it("finds the file for Home Assistant's language codes", async () => {
    const { fileFor } = await fresh();
    expect(fileFor("de")).toBe("de");
    expect(fileFor("pt-BR")).toBe("pt-BR");
    expect(fileFor("de-CH")).toBe("de");
    expect(fileFor("nb")).toBe("no");
    expect(fileFor("xx")).toBe("en");
    expect(fileFor(undefined)).toBe("en");
  });
});
