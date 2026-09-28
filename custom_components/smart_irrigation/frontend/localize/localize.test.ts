/**
 * The translations are fetched now, so the failure modes are network ones.
 *
 * What matters is that none of them can leave the panel without words: a file
 * that 404s, one that times out, one that is not JSON at all, all have to end
 * with English on screen and a promise that settled.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const LANG_URL = "/api/smart_irrigation/languages";

/** A fresh copy of the module, since it caches what it has loaded. */
async function freshModule() {
  vi.resetModules();
  return await import("./localize");
}

function respondWith(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  });
}

describe("localize", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("answers in English without fetching anything", async () => {
    const fetchMock = respondWith({});
    vi.stubGlobal("fetch", fetchMock);
    const { localize } = await freshModule();

    expect(localize("panels.groups.home", "en")).toBe("Home");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers in English for a language nobody has loaded yet", async () => {
    vi.stubGlobal("fetch", respondWith({}));
    const { localize } = await freshModule();

    expect(localize("panels.groups.home", "de")).toBe("Home");
  });

  it("answers in the language once it is loaded", async () => {
    vi.stubGlobal(
      "fetch",
      respondWith({ panels: { groups: { home: "Start" } } }),
    );
    const { loadLanguage, localize, languageLoaded } = await freshModule();

    expect(languageLoaded("de")).toBe(false);
    await loadLanguage("de");

    expect(languageLoaded("de")).toBe(true);
    expect(localize("panels.groups.home", "de")).toBe("Start");
  });

  it("falls back to English for a string the language is missing", async () => {
    vi.stubGlobal("fetch", respondWith({ panels: { groups: {} } }));
    const { loadLanguage, localize } = await freshModule();
    await loadLanguage("de");

    expect(localize("panels.groups.home", "de")).toBe("Home");
  });

  it("fetches the file of the language, with the version", async () => {
    const fetchMock = respondWith({});
    vi.stubGlobal("fetch", fetchMock);
    const { loadLanguage } = await freshModule();

    await loadLanguage("zh-Hans", "v2026.9.3");

    expect(fetchMock.mock.calls[0][0]).toBe(
      `${LANG_URL}/zh-Hans.json?v=v2026.9.3`,
    );
  });

  it("fetches once however many times it is asked", async () => {
    const fetchMock = respondWith({ panels: { groups: { home: "Start" } } });
    vi.stubGlobal("fetch", fetchMock);
    const { loadLanguage } = await freshModule();

    await Promise.all([
      loadLanguage("de"),
      loadLanguage("de"),
      loadLanguage("de"),
    ]);
    await loadLanguage("de");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not fetch a language that has no file", async () => {
    const fetchMock = respondWith({});
    vi.stubGlobal("fetch", fetchMock);
    const { loadLanguage } = await freshModule();

    await loadLanguage("kl");
    await loadLanguage("");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("settles and stays in English when the file is not there", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", respondWith(null, false, 404));
    const { loadLanguage, localize, languageLoaded } = await freshModule();

    await expect(loadLanguage("de")).resolves.toBeUndefined();
    expect(languageLoaded("de")).toBe(false);
    expect(localize("panels.groups.home", "de")).toBe("Home");
  });

  it("settles and stays in English when the fetch throws", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { loadLanguage, localize } = await freshModule();

    await expect(loadLanguage("de")).resolves.toBeUndefined();
    expect(localize("panels.groups.home", "de")).toBe("Home");
  });

  it("refuses a file that is not an object", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", respondWith("<html>not found</html>"));
    const { loadLanguage, localize, languageLoaded } = await freshModule();

    await loadLanguage("de");

    expect(languageLoaded("de")).toBe(false);
    expect(localize("panels.groups.home", "de")).toBe("Home");
  });

  it("tries again after a failure rather than remembering it", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ panels: { groups: { home: "Start" } } }),
      });
    vi.stubGlobal("fetch", fetchMock);
    const { loadLanguage, localize } = await freshModule();

    await loadLanguage("de");
    await loadLanguage("de");

    expect(localize("panels.groups.home", "de")).toBe("Start");
  });

  it("still substitutes placeholders in a fetched string", async () => {
    vi.stubGlobal(
      "fetch",
      respondWith({
        panels: { mappings: { summary: { "zones-other": "{n} Zonen" } } },
      }),
    );
    const { loadLanguage, localize } = await freshModule();
    await loadLanguage("de");

    expect(
      localize("panels.mappings.summary.zones-other", "de", "{n}", 3),
    ).toBe("3 Zonen");
  });

  it("ignores the quotes Home Assistant sometimes puts around a language", async () => {
    vi.stubGlobal(
      "fetch",
      respondWith({ panels: { groups: { home: "Start" } } }),
    );
    const { loadLanguage, localize } = await freshModule();
    await loadLanguage('"de"');

    expect(localize("panels.groups.home", '"de"')).toBe("Start");
  });
});
