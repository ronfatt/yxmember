"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "../lib/supabase/client";

function getReferralCodeFromCookie() {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("ref_code="));

  return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
}

export default function RegisterForm() {
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

      toast.success("Account created.");
      if (data.session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Register failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[30px] border border-[rgba(201,162,39,0.35)] bg-white/75 p-8 shadow-[0_22px_70px_rgba(0,0,0,0.10)] backdrop-blur-xl">
      <div className="text-xs font-semibold tracking-[0.28em] text-[#0f2f24]/80">Member Registration</div>
      <div className="mt-2 font-display text-4xl text-[#0f2f24]">创建你的会员账号</div>
      <div className="mt-2 text-sm leading-6 text-black/68">完成注册后，即可启用频率报告、积分累积与引荐关系绑定。</div>

      {referralCode ? (
        <div className="mt-5 rounded-[22px] border border-[rgba(15,47,36,0.12)] bg-[#0f2f24]/6 px-4 py-3 text-sm text-[#123524]">
          你将透过这个推荐码加入：<span className="font-semibold">{referralCode}</span>
        </div>
      ) : null}

      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleRegister();
        }}
      >
        <label className="block">
          <span className="text-xs font-medium text-[#0f2f24]/80">姓名</span>
          <div className="mt-2 rounded-[20px] border border-[rgba(201,162,39,0.25)] bg-[#fbf8f1] transition focus-within:border-[rgba(201,162,39,0.55)] focus-within:ring-4 focus-within:ring-[rgba(201,162,39,0.18)]">
            <input
              className="w-full bg-transparent px-4 py-3.5 text-[#0f2f24] outline-none"
              type="text"
              placeholder="请输入你的姓名"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-[#0f2f24]/80">生日</span>
          <div className="mt-2 rounded-[20px] border border-[rgba(201,162,39,0.25)] bg-[#fbf8f1] transition focus-within:border-[rgba(201,162,39,0.55)] focus-within:ring-4 focus-within:ring-[rgba(201,162,39,0.18)]">
            <input
              className="w-full bg-transparent px-4 py-3.5 text-[#0f2f24] outline-none"
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
            />
          </div>
        </label>

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
          <span className="text-xs font-medium text-[#0f2f24]/80">密码</span>
          <div className="mt-2 rounded-[20px] border border-[rgba(201,162,39,0.25)] bg-[#fbf8f1] transition focus-within:border-[rgba(201,162,39,0.55)] focus-within:ring-4 focus-within:ring-[rgba(201,162,39,0.18)]">
            <input
              className="w-full bg-transparent px-4 py-3.5 text-[#0f2f24] outline-none"
              type="password"
              placeholder="设置你的登录密码"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-[20px] bg-[linear-gradient(135deg,#e6cc73,#c9a227,#b4881b)] py-3.5 text-sm font-semibold text-[#0f2f24] shadow-[0_14px_30px_rgba(201,162,39,0.25)] transition hover:brightness-[1.03] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "创建中..." : "开始加入会员"}
        </button>

        <div className="flex items-center justify-between gap-4 pt-1 text-sm">
          <Link href="/login" className="text-[#0f2f24]/75 underline underline-offset-4 hover:text-[#0f2f24]">
            已有账号？去登入
          </Link>
          <span className="text-black/45">推荐关系会安全保留</span>
        </div>
      </form>
    </div>
  );
}
