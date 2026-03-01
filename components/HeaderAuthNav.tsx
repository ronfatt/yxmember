"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/client";
import type { Language } from "../lib/i18n/shared";
import { t } from "../lib/i18n/shared";

export default function HeaderAuthNav({ language }: { language: Language }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const links = user
    ? [
        { href: "/dashboard", label: t(language, { zh: "会员中心", en: "Dashboard" }) },
        { href: "/dashboard/referrals", label: t(language, { zh: "引荐进度", en: "Referrals" }) },
        { href: "/dashboard/points", label: t(language, { zh: "积分", en: "Points" }) }
      ]
    : [];

  return (
    <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-black/62">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="transition hover:text-[#0f2f25]">
          {link.label}
        </Link>
      ))}
      <Link
        href={user ? "/dashboard" : "/login"}
        className="rounded-full border border-[rgba(15,47,37,0.08)] bg-[#0f2f25] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white transition hover:opacity-90"
      >
        {user
          ? t(language, { zh: "进入会员中心", en: "Go to Dashboard" })
          : t(language, { zh: "会员登入", en: "Member Login" })}
      </Link>
    </nav>
  );
}
