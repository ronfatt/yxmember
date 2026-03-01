import Link from "next/link";
import { requireAdmin } from "../../lib/actions/session";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { t } from "../../lib/i18n/shared";
import { getCurrentLanguage } from "../../lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const language = getCurrentLanguage();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f5f1e8_0%,_#ffffff_100%)]">
      <header className="border-b border-black/10 bg-white/90">
        <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <h1 className="font-display text-2xl text-[#123524]">
            {t(language, { zh: "元象后台", en: "MetaEnergy Admin" })}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <LanguageSwitcher currentLanguage={language} />
            <nav className="flex gap-4 text-sm">
              <Link href="/admin/accounts">{t(language, { zh: "账户", en: "Accounts" })}</Link>
              <Link href="/admin/orders">{t(language, { zh: "订单", en: "Orders" })}</Link>
              <Link href="/admin/courses">{t(language, { zh: "课程活动", en: "Programs" })}</Link>
              <Link href="/admin/appointments">{t(language, { zh: "预约", en: "Appointments" })}</Link>
              <Link href="/admin/mentors">{t(language, { zh: "导师", en: "Mentors" })}</Link>
              <Link href="/admin/relationships">{t(language, { zh: "关系", en: "Relationships" })}</Link>
              <Link href="/dashboard">{t(language, { zh: "会员中心", en: "Dashboard" })}</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
