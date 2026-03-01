"use client";

import { useRouter } from "next/navigation";
import { LANGUAGE_COOKIE, type Language } from "../lib/i18n/shared";

export default function LanguageSwitcher({ currentLanguage }: { currentLanguage: Language }) {
  const router = useRouter();

  const setLanguage = (language: Language) => {
    document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <div className="inline-flex items-center rounded-full border border-black/10 bg-white/80 p-1 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLanguage("zh")}
        className={`rounded-full px-3 py-1.5 transition ${currentLanguage === "zh" ? "bg-[#123524] text-white" : "text-black/60"}`}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1.5 transition ${currentLanguage === "en" ? "bg-[#123524] text-white" : "text-black/60"}`}
      >
        EN
      </button>
    </div>
  );
}
