import { t } from "../lib/i18n/shared";
import { getCurrentLanguage } from "../lib/i18n/server";

export default function SiteFooter() {
  const language = getCurrentLanguage();

  return (
    <footer className="border-t border-black/10 bg-[#f8f2e8]">
      <div className="container flex flex-col gap-2 py-10 text-xs text-black/55">
        <p className="font-display text-lg text-[#0f2f25]">
          {t(language, { zh: "元象能量会员系统", en: "MetaEnergy Member System" })}
        </p>
        <p className="font-accent text-sm text-black/60">
          {t(language, {
            zh: "为长期回响而设计。",
            en: "Designed for long-term resonance."
          })}
        </p>
        <p>© 2026 MetaEnergy</p>
        <p>All rights reserved.</p>
      </div>
    </footer>
  );
}
