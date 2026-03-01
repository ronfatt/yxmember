import Link from "next/link";
import LogoutButton from "./LogoutButton";
import LanguageSwitcher from "./LanguageSwitcher";
import { t } from "../lib/i18n/shared";
import { getCurrentLanguage } from "../lib/i18n/server";

export default function DashboardShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const language = getCurrentLanguage();
  const links = [
    { href: "/dashboard", label: t(language, { zh: "总览", en: "Overview" }) },
    { href: "/dashboard/referrals", label: t(language, { zh: "引荐", en: "Referrals" }) },
    { href: "/dashboard/points", label: t(language, { zh: "积分", en: "Points" }) },
    { href: "/dashboard/history", label: t(language, { zh: "历史", en: "History" }) },
    { href: "/dashboard/frequency", label: t(language, { zh: "频率", en: "Frequency" }) }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(203,230,210,0.5),_transparent_35%),linear-gradient(180deg,_#f5f1e8_0%,_#ffffff_100%)]">
      <header className="border-b border-black/10 bg-white/80 backdrop-blur">
        <div className="container flex flex-col gap-4 py-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">
              {t(language, { zh: "元象会员空间", en: "MetaEnergy dashboard" })}
            </p>
            <h1 className="font-display text-4xl text-[#123524]">{title}</h1>
            <p className="text-sm text-black/65">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <LanguageSwitcher currentLanguage={language} />
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-black/10 bg-white px-4 py-2 hover:border-jade/30 hover:text-jade"
              >
                {link.label}
              </Link>
            ))}
            <LogoutButton language={language} />
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
