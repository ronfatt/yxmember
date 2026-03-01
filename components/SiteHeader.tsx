import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { t } from "../lib/i18n/shared";
import { getCurrentLanguage } from "../lib/i18n/server";

export default function SiteHeader() {
  const language = getCurrentLanguage();
  const links = [
    { href: "/dashboard", label: t(language, { zh: "会员中心", en: "Dashboard" }) },
    { href: "/dashboard/referrals", label: t(language, { zh: "引荐进度", en: "Referrals" }) },
    { href: "/dashboard/points", label: t(language, { zh: "积分", en: "Points" }) },
    { href: "/admin/orders", label: t(language, { zh: "后台", en: "Admin" }) }
  ];

  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="container flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="font-display text-2xl text-[#123524]">
          {t(language, { zh: "元象能量会员系统", en: "MetaEnergy Member System" })}
        </Link>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <LanguageSwitcher currentLanguage={language} />
          <nav className="flex flex-wrap items-center gap-5 text-sm font-medium">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-jade">
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="rounded-full bg-[#123524] px-4 py-2 text-white">
              {t(language, { zh: "会员登入", en: "Member Login" })}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
