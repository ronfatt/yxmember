import { t } from "../lib/i18n/shared";
import { getCurrentLanguage } from "../lib/i18n/server";

export default function SiteFooter() {
  const language = getCurrentLanguage();

  return (
    <footer className="border-t border-black/10 bg-white/80">
      <div className="container flex flex-col gap-3 py-8 text-sm text-black/70">
        <p className="font-medium text-[#123524]">
          {t(language, { zh: "元象能量会员系统", en: "MetaEnergy Member System" })}
        </p>
        <p>
          {t(language, {
            zh: "为长期而设计的能量与回馈空间。",
            en: "A long-term space for energy, participation, and rewards."
          })}
        </p>
      </div>
    </footer>
  );
}
