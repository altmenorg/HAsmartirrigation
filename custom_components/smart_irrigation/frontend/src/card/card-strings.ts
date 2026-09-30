/**
 * The card's words, from the same language files as the panel (#873).
 *
 * They were a table in the card's own code, in English and French: nobody could
 * translate them without a pull request and a rebuild, and Weblate, which works
 * on the language files, never saw them. They live under "card" in those files
 * now. English is compiled in, as the panel does, because it is the fallback
 * and must be there before any fetch; only its "card" section is taken, so the
 * card does not carry the panel's words. Another language is fetched from the
 * files the integration serves, once, and only its "card" section is kept.
 */
import { card as EN_CARD } from "../../localize/languages/en.json";
import { VERSION } from "../const";

type Table = Record<string, any>;

const LANGUAGES_URL = "/api/smart_irrigation/languages";
const FETCH_TIMEOUT_MS = 5000;

/** The files that exist, as Home Assistant names the languages they are for. */
const FILES = [
  "cs",
  "da",
  "de",
  "es",
  "fi",
  "fr",
  "hu",
  "it",
  "nl",
  "no",
  "pl",
  "pt",
  "pt-BR",
  "ru",
  "sk",
  "sv",
  "uk",
  "zh-Hans",
];

/** Home Assistant language codes that are served by a file of another name. */
const ALIASES: Record<string, string> = { nb: "no", nn: "no" };

const loaded: Record<string, Table> = { en: EN_CARD as Table };
const pending: Record<string, Promise<void>> = {};

/** The file a Home Assistant language is read from, or "en". */
export function fileFor(language?: string): string {
  const lang = language || "en";
  if (FILES.includes(lang)) return lang;
  const base = lang.split("-")[0];
  if (ALIASES[base]) return ALIASES[base];
  return FILES.includes(base) ? base : "en";
}

/** Fetch a language's card strings, once. Resolves either way. */
export async function loadCardStrings(language?: string): Promise<void> {
  const file = fileFor(language);
  if (file in loaded) return;
  if (file in pending) return pending[file];
  pending[file] = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      // The version, so a browser holding last release's file asks again.
      const url = `${LANGUAGES_URL}/${file}.json?v=${encodeURIComponent(VERSION)}`;
      const response = await fetch(url, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const translations = await response.json();
      if (translations && typeof translations.card === "object") {
        loaded[file] = translations.card;
      }
    } catch (err) {
      console.warn(
        `Smart Irrigation card: could not load the ${file} translation, ` +
          `falling back to English`,
        err,
      );
    } finally {
      clearTimeout(timer);
      delete pending[file];
    }
  })();
  return pending[file];
}

/** Whether the strings of that language are in (English always is). */
export function cardStringsLoaded(language?: string): boolean {
  return fileFor(language) in loaded;
}

function lookup(table: Table | undefined, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<any>((node, part) => (node == null ? node : node[part]), table);
  return typeof value === "string" ? value : undefined;
}

/**
 * One string, with its {placeholders} filled. Falls back to English for a
 * string the language does not have yet, and to the key itself last.
 */
export function cardString(
  language: string | undefined,
  key: string,
  values: Record<string, string> = {},
): string {
  const template =
    lookup(loaded[fileFor(language)], key) ?? lookup(loaded.en, key) ?? key;
  return template.replace(/\{(\w+)\}/g, (_m, name) => values[name] ?? "");
}
