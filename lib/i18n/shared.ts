export const LANGUAGE_COOKIE = "metaenergy_lang";

export type Language = "zh" | "en";

export function resolveLanguage(value?: string | null): Language {
  return value === "en" ? "en" : "zh";
}

export function t<T>(language: Language, copy: { zh: T; en: T }): T {
  return language === "en" ? copy.en : copy.zh;
}
