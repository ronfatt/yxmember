"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "../lib/supabase/client";
import type { Language } from "../lib/i18n/shared";

export default function LogoutButton({ language }: { language: Language }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : language === "en" ? "Logout failed." : "退出失败。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full bg-[#123524] px-4 py-2 text-sm font-semibold text-white"
    >
      {loading ? (language === "en" ? "Logging out..." : "退出中...") : language === "en" ? "Logout" : "退出"}
    </button>
  );
}
