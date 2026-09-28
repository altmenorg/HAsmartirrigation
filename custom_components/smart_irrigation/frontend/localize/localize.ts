import * as en from "./languages/en.json";

import IntlMessageFormat from "intl-messageformat";

/**
 * English is the only language in the bundle. The others are fetched.
 *
 * Every language used to be imported here, which compiled all nineteen of them
 * into the panel. It worked, and it made a correction to one translation cost a
 * bundle rebuild: a contributor could not fix a wrong string without running
 * Node, and a merged fix changed nothing for anyone until someone rebuilt. For
 * translations that come from people who speak the language rather than from
 * whoever happens to have a build setup, that is the wrong trade.
 *
 * So the language files are served by the integration and loaded on demand, and
 * English stays compiled in: it is the fallback for every missing string, so it
 * has to be there before any fetch has finished, or before one has failed.
 */
const LANGUAGES_URL = "/api/smart_irrigation/languages";

/** A fetch that never finishes must not keep the panel in English forever. */
const FETCH_TIMEOUT_MS = 5000;

/** The languages that exist as files. English is not fetched. */
export const FETCHABLE_LANGUAGES = [
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

const languages: any = { en: en };
const pending: Record<string, Promise<void>> = {};

/** Whether `localize` can already answer in this language. */
export function languageLoaded(language: string): boolean {
  return normalize(language) in languages;
}

function normalize(language: string): string {
  return (language || "").replace(/['"]+/g, "");
}

/**
 * Load one language, once.
 *
 * Resolves either way: a language that cannot be fetched leaves the panel in
 * English, which is a worse panel and a working one. `version` is appended to
 * the URL so that a browser holding the previous release's file asks again.
 */
export async function loadLanguage(
  language: string,
  version = "",
): Promise<void> {
  const lang = normalize(language);
  if (lang in languages) return;
  if (!FETCHABLE_LANGUAGES.includes(lang)) return;
  if (lang in pending) return pending[lang];

  const load = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const url = version
        ? `${LANGUAGES_URL}/${lang}.json?v=${encodeURIComponent(version)}`
        : `${LANGUAGES_URL}/${lang}.json`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const translations = await response.json();
      // An empty or broken file would silently blank the interface, which is
      // harder to diagnose than an interface in English.
      if (!translations || typeof translations !== "object") {
        throw new Error("not an object");
      }
      languages[lang] = translations;
    } catch (err) {
      console.warn(
        `Smart Irrigation: could not load the ${lang} translation, ` +
          `falling back to English`,
        err,
      );
    } finally {
      clearTimeout(timer);
      delete pending[lang];
    }
  })();

  pending[lang] = load;
  return load;
}

export function localize(
  string: string,
  language: string,
  ...args: any[]
): string {
  const lang = normalize(language);
  let translated: string;

  try {
    translated = string.split(".").reduce((o, i) => o[i], languages[lang]);
  } catch (e) {
    translated = string.split(".").reduce((o, i) => o[i], languages["en"]);
  }

  if (translated === undefined)
    translated = string.split(".").reduce((o, i) => o[i], languages["en"]);

  if (!args.length) return translated;

  const argObject = {};
  for (let i = 0; i < args.length; i += 2) {
    let key = args[i];
    key = key.replace(/^{([^}]+)?}$/, "$1");
    argObject[key] = args[i + 1];
  }

  try {
    const message = new IntlMessageFormat(translated, language);
    return message.format(argObject) as string;
  } catch (err) {
    return "Translation " + err;
  }
}
