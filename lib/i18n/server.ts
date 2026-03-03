import { cookies } from "next/headers";
import { resolveLanguage, type Language } from "./shared";

export async function getCurrentLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  return resolveLanguage(cookieStore.get("metaenergy_lang")?.value);
}
