"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "../lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[30px] border border-[rgba(201,162,39,0.35)] bg-white/75 p-8 shadow-[0_22px_70px_rgba(0,0,0,0.10)] backdrop-blur-xl">
      <div className="text-xs font-semibold tracking-[0.28em] text-[#0f2f24]/80">Member Access</div>
      <div className="mt-2 font-display text-4xl text-[#0f2f24]">欢迎回到你的能量空间</div>
      <div className="mt-2 text-sm leading-6 text-black/68">请输入你的邮箱与密码，继续未完成的轨迹。</div>

      <form
        className="mt-7 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <label className="block">
          <span className="text-xs font-medium text-[#0f2f24]/80">Email</span>
          <div className="mt-2 rounded-[20px] border border-[rgba(201,162,39,0.25)] bg-[#fbf8f1] transition focus-within:border-[rgba(201,162,39,0.55)] focus-within:ring-4 focus-within:ring-[rgba(201,162,39,0.18)]">
            <input
              className="w-full bg-transparent px-4 py-3.5 text-[#0f2f24] outline-none"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-[#0f2f24]/80">Password</span>
          <div className="mt-2 rounded-[20px] border border-[rgba(201,162,39,0.25)] bg-[#fbf8f1] transition focus-within:border-[rgba(201,162,39,0.55)] focus-within:ring-4 focus-within:ring-[rgba(201,162,39,0.18)]">
            <input
              className="w-full bg-transparent px-4 py-3.5 text-[#0f2f24] outline-none"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[20px] bg-[linear-gradient(135deg,#e6cc73,#c9a227,#b4881b)] py-3.5 text-sm font-semibold text-[#0f2f24] shadow-[0_14px_30px_rgba(201,162,39,0.25)] transition hover:brightness-[1.03] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "进入中..." : "进入会员空间"}
        </button>

        <div className="flex items-center justify-between gap-4 pt-1 text-sm">
          <Link href="/register" className="text-[#0f2f24]/75 underline underline-offset-4 hover:text-[#0f2f24]">
            免费加入会员 →
          </Link>
        </div>
      </form>

      <div className="mt-6 rounded-[22px] border border-[rgba(15,47,36,0.08)] bg-[#0f2f24]/5 p-4">
        <div className="text-xs font-semibold text-[#0f2f24]">本月动态</div>
        <div className="mt-1 text-xs leading-5 text-black/65">登入后查看本月专属活动、体验名额与会员礼遇更新。</div>
      </div>
    </div>
  );
}
