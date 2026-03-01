"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "../lib/supabase/client";
import type { Language } from "../lib/i18n/shared";

function getReferralCodeFromCookie() {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("ref_code="));

  return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
}

export default function RegisterForm({ language }: { language: Language }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReferralCode((params.get("ref") ?? getReferralCodeFromCookie() ?? "").toUpperCase());
  }, []);

  const handleRegister = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            birthday,
            referred_code: referralCode || null
          }
        }
      });

      if (error) throw error;

      toast.success(language === "en" ? "Account created." : "账号已创建。");
      if (data.session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : language === "en" ? "Register failed." : "注册失败。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[36px] border border-[rgba(200,165,92,0.24)] bg-white/78 p-9 shadow-[0_26px_90px_rgba(0,0,0,0.09)] backdrop-blur-xl">
      <div className="font-accent text-sm tracking-[0.18em] text-[#8d7240]">
        {language === "en" ? "Member Registration" : "会员注册"}
      </div>
      <div className="mt-4 font-display text-4xl leading-tight text-[#0f2f25]">
        {language === "en" ? "Create your membership account" : "创建你的会员账号"}
      </div>
      <div className="mt-4 text-sm leading-7 text-black/64">
        {language === "en"
          ? "Complete registration to unlock frequency reports, points, and referral linking."
          : "完成注册后，即可启用频率报告、积分累积与引荐关系绑定。"}
      </div>

      {referralCode ? (
        <div className="mt-7 rounded-[24px] border border-[rgba(15,47,36,0.10)] bg-[#0f2f24]/6 px-5 py-4 text-sm leading-7 text-[#123524]">
          {language === "en" ? "You are joining with referral code: " : "你将透过这个推荐码加入："}
          <span className="font-semibold">{referralCode}</span>
        </div>
      ) : null}

      <form
        className="mt-8 grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleRegister();
        }}
      >
        <label className="block">
          <span className="text-xs font-medium tracking-[0.12em] text-[#0f2f24]/78">{language === "en" ? "Full name" : "姓名"}</span>
          <div className="mt-2 rounded-[24px] border border-[rgba(200,165,92,0.22)] bg-[#fbf8f1] transition focus-within:border-[rgba(200,165,92,0.55)] focus-within:ring-4 focus-within:ring-[rgba(200,165,92,0.16)]">
            <input
              className="w-full bg-transparent px-5 py-4 text-[#0f2f24] outline-none"
              type="text"
              placeholder={language === "en" ? "Enter your full name" : "请输入你的姓名"}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium tracking-[0.12em] text-[#0f2f24]/78">{language === "en" ? "Birthday" : "生日"}</span>
          <div className="mt-2 rounded-[24px] border border-[rgba(200,165,92,0.22)] bg-[#fbf8f1] transition focus-within:border-[rgba(200,165,92,0.55)] focus-within:ring-4 focus-within:ring-[rgba(200,165,92,0.16)]">
            <input
              className="w-full bg-transparent px-5 py-4 text-[#0f2f24] outline-none"
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium tracking-[0.12em] text-[#0f2f24]/78">{language === "en" ? "Email" : "电子邮箱"}</span>
          <div className="mt-2 rounded-[24px] border border-[rgba(200,165,92,0.22)] bg-[#fbf8f1] transition focus-within:border-[rgba(200,165,92,0.55)] focus-within:ring-4 focus-within:ring-[rgba(200,165,92,0.16)]">
            <input
              className="w-full bg-transparent px-5 py-4 text-[#0f2f24] outline-none"
              type="email"
              placeholder={language === "en" ? "you@email.com" : "请输入你的邮箱"}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium tracking-[0.12em] text-[#0f2f24]/78">{language === "en" ? "Password" : "密码"}</span>
          <div className="mt-2 rounded-[24px] border border-[rgba(200,165,92,0.22)] bg-[#fbf8f1] transition focus-within:border-[rgba(200,165,92,0.55)] focus-within:ring-4 focus-within:ring-[rgba(200,165,92,0.16)]">
            <input
              className="w-full bg-transparent px-5 py-4 text-[#0f2f24] outline-none"
              type="password"
              placeholder={language === "en" ? "Create your password" : "设置你的登录密码"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="champagne-gradient mt-2 w-full rounded-[24px] py-4 text-sm font-semibold tracking-[0.08em] text-[#0f2f24] shadow-[0_16px_34px_rgba(200,165,92,0.24)] transition hover:brightness-[1.03] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (language === "en" ? "Creating..." : "创建中...") : language === "en" ? "Start membership" : "开始加入会员"}
        </button>

        <div className="flex items-center justify-between gap-4 pt-2 text-sm">
          <Link href="/login" className="text-[#0f2f24]/75 underline underline-offset-4 hover:text-[#0f2f24]">
            {language === "en" ? "Already a member? Sign in" : "已有账号？去登入"}
          </Link>
          <span className="text-black/45">{language === "en" ? "Referral relationships stay intact" : "推荐关系会安全保留"}</span>
        </div>
      </form>
    </div>
  );
}
