import * as cs from "./languages/cs.json";
import * as da from "./languages/da.json";
import * as de from "./languages/de.json";
import * as en from "./languages/en.json";
import * as es from "./languages/es.json";
import * as fi from "./languages/fi.json";
import * as fr from "./languages/fr.json";
import * as hu from "./languages/hu.json";
import * as it from "./languages/it.json";
import * as nl from "./languages/nl.json";
import * as no from "./languages/no.json";
import * as pl from "./languages/pl.json";
import * as pt from "./languages/pt.json";
import * as ptBR from "./languages/pt-BR.json";
import * as ru from "./languages/ru.json";
import * as sk from "./languages/sk.json";
import * as sv from "./languages/sv.json";
import * as uk from "./languages/uk.json";
import * as zhHans from "./languages/zh-Hans.json";

import IntlMessageFormat from "intl-messageformat";

const languages: any = {
  cs: cs,
  da: da,
  de: de,
  en: en,
  es: es,
  fi: fi,
  fr: fr,
  hu: hu,
  it: it,
  nl: nl,
  no: no,
  pl: pl,
  pt: pt,
  "pt-BR": ptBR,
  ru: ru,
  sk: sk,
  sv: sv,
  uk: uk,
  "zh-Hans": zhHans,
};

export function localize(
  string: string,
  language: string,
  ...args: any[]
): string {
  const lang = language.replace(/['"]+/g, "");
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
