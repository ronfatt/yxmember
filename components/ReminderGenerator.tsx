"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";

export default function ReminderGenerator({ language }: { language: Language }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleGenerate = async () => {
    const response = await fetch("/api/reminder/generate", { method: "POST" });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? (language === "en" ? "Unable to generate reminder." : "无法生成提醒。"));
      return;
    }

    toast.success(language === "en" ? "Weekly reminder generated." : "本周提醒已生成。");
    startTransition(() => router.refresh());
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleGenerate}
      className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white"
    >
      {isPending ? (language === "en" ? "Generating..." : "生成中...") : language === "en" ? "Generate" : "生成"}
    </button>
  );
}
