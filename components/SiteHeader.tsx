import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { t } from "../lib/i18n/shared";
import { getCurrentLanguage } from "../lib/i18n/server";
import { createClient } from "../lib/supabase/server";
import { isAdminEmail } from "../lib/metaenergy/auth";

export default async function SiteHeader() {
  const language = getCurrentLanguage();
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  const links = user
    ? [
        { href: "/dashboard", label: t(language, { zh: "会员中心", en: "Dashboard" }) },
        { href: "/dashboard/referrals", label: t(language, { zh: "引荐进度", en: "Referrals" }) },
        { href: "/dashboard/points", label: t(language, { zh: "积分", en: "Points" }) }
      ]
    : [];
  let showAdmin = false;

  if (user) {
    showAdmin = isAdminEmail(user.email);
    if (!showAdmin) {
      const { data: role } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      showAdmin = Boolean(role && ["ADMIN", "STAFF"].includes(role.role));
    }
  }

  return (
    <header className="border-b border-black/5 bg-white/60 backdrop-blur-xl">
      <div className="container flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="font-display text-xl text-[#0f2f25] md:text-2xl">
          {t(language, { zh: "元象能量会员系统", en: "MetaEnergy Member System" })}
        </Link>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <LanguageSwitcher currentLanguage={language} />
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-black/62">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-[#0f2f25]">
                {link.label}
              </Link>
            ))}
            {showAdmin ? (
              <Link href="/admin/orders" className="transition hover:text-[#0f2f25]">
                {t(language, { zh: "后台", en: "Admin" })}
              </Link>
            ) : null}
            <Link
              href={user ? "/dashboard" : "/login"}
              className="rounded-full border border-[rgba(15,47,37,0.08)] bg-[#0f2f25] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white transition hover:opacity-90"
            >
              {user
                ? t(language, { zh: "进入会员中心", en: "Go to Dashboard" })
                : t(language, { zh: "会员登入", en: "Member Login" })}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
