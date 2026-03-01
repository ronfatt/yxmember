"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "../lib/supabase/client";
import type { Language } from "../lib/i18n/shared";

export default function LoginForm({ language }: { language: Language }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.assign("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : language === "en" ? "Login failed." : "登入失败。";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[36px] border border-[rgba(200,165,92,0.24)] bg-white/78 p-9 shadow-[0_26px_90px_rgba(0,0,0,0.09)] backdrop-blur-xl">
      <div className="font-accent text-sm tracking-[0.18em] text-[#8d7240]">
        {language === "en" ? "Member Access" : "会员登入"}
      </div>
      <div className="mt-4 font-display text-4xl leading-tight text-[#0f2f25]">
        {language === "en" ? "Welcome back to your energy space" : "欢迎回到你的能量空间"}
      </div>
      <div className="mt-4 text-sm leading-7 text-black/64">
        {language === "en" ? "Enter your email and password to continue your path." : "请输入你的邮箱与密码，继续未完成的轨迹。"}
      </div>

      <form
        className="mt-9 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
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
              placeholder={language === "en" ? "••••••••••••" : "••••••••••••"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="champagne-gradient w-full rounded-[24px] py-4 text-sm font-semibold tracking-[0.08em] text-[#0f2f24] shadow-[0_16px_34px_rgba(200,165,92,0.24)] transition hover:brightness-[1.03] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (language === "en" ? "Entering..." : "进入中...") : language === "en" ? "Enter member space" : "进入会员空间"}
        </button>

        {errorMessage ? (
          <div className="rounded-[18px] border border-[#c98f8f]/30 bg-[#fff4f1] px-4 py-3 text-sm text-[#8b3a2a]">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 pt-2 text-sm">
          <Link href="/register" className="text-[#0f2f24]/75 underline underline-offset-4 hover:text-[#0f2f24]">
            {language === "en" ? "Join membership free →" : "免费加入会员 →"}
          </Link>
        </div>
      </form>

      <div className="mt-8 rounded-[26px] border border-[rgba(15,47,36,0.08)] bg-[#0f2f24]/5 p-5">
        <div className="font-accent text-sm tracking-[0.16em] text-[#8d7240]">{language === "en" ? "This Month" : "本月动态"}</div>
        <div className="mt-2 text-sm leading-7 text-black/65">
          {language === "en"
            ? "Sign in to view current campaigns, member experiences, and updated privileges."
            : "登入后查看本月专属活动、体验名额与会员礼遇更新。"}
        </div>
      </div>
    </div>
  );
}
