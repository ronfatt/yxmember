import { cookies } from "next/headers";
import { resolveLanguage, type Language } from "./shared";

export function getCurrentLanguage(): Language {
  return resolveLanguage(cookies().get("metaenergy_lang")?.value);
}
