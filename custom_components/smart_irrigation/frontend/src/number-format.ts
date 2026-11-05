/**
 * Numbers as the user's Home Assistant number setting writes them, for the
 * panel and the card.
 */
/** The locales Home Assistant formats a number with, by its number setting. */
const NUMBER_FORMAT_LOCALES: Record<string, string[] | undefined> = {
  comma_decimal: ["de", "es", "it"],
  decimal_point: ["en-US", "en-CA", "en-GB"],
  space_comma: ["fr", "sv", "cs"],
  system: undefined,
};

/**
 * A number for reading, with a fixed number of decimals, written as the
 * user's number setting says: "9,5 mm" in German, where the panel wrote
 * "9.5 mm" from toFixed (UX review). ``locale`` is ``hass.locale``; without
 * it, the language. Input fields keep toFixed: a number input wants a dot.
 */
export const formatNumber = (
  value: number,
  decimals: number,
  locale?: { language?: string; number_format?: string } | null,
  language?: string,
): string => {
  if (!Number.isFinite(value)) return String(value);
  const setting = locale?.number_format;
  if (setting === "none") return value.toFixed(decimals);
  const locales =
    setting && setting in NUMBER_FORMAT_LOCALES
      ? NUMBER_FORMAT_LOCALES[setting]
      : locale?.language || language || undefined;
  try {
    const text = new Intl.NumberFormat(locales, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
    // A hair below zero rounds to "-0,0", which says nothing true.
    return /^-0([.,\s]0*)?$/.test(text) ? text.slice(1) : text;
  } catch (_e) {
    return value.toFixed(decimals);
  }
};
