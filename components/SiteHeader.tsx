import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import HeaderAuthNav from "./HeaderAuthNav";
import { t } from "../lib/i18n/shared";
import { getCurrentLanguage } from "../lib/i18n/server";

export default async function SiteHeader() {
  const language = await getCurrentLanguage();

  return (
    <header className="border-b border-black/5 bg-white/60 backdrop-blur-xl">
      <div className="container flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="font-display text-xl text-[#0f2f25] md:text-2xl">
          {t(language, { zh: "元象能量会员系统", en: "MetaEnergy Member System" })}
        </Link>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <LanguageSwitcher currentLanguage={language} />
          <HeaderAuthNav language={language} />
        </div>
      </div>
    </header>
  );
}
