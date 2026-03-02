import { cookies } from "next/headers";
import { resolveLanguage, type Language } from "./shared";

export function getCurrentLanguage(): Language {
  const cookieStore = cookies() as unknown as {
    get(name: string): { value?: string } | undefined;
  };
  return resolveLanguage(cookieStore.get("metaenergy_lang")?.value);
}
