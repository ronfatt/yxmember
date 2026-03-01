"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";
import { normalizeBirthday } from "../lib/metaenergy/birthday";

export default function FrequencyGenerator({
  birthday,
  language
}: {
  birthday: string | null;
  language: Language;
}) {
  const router = useRouter();
  const [value, setValue] = useState(normalizeBirthday(birthday));
  const [isPending, startTransition] = useTransition();

  const handleGenerate = async () => {
    const safeBirthday = normalizeBirthday(value);
    if (!safeBirthday) {
      toast.error(language === "en" ? "Please choose a valid birthday." : "请选择正确的生日。");
      return;
    }

    const response = await fetch("/api/frequency/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthday: safeBirthday })
    });

    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? (language === "en" ? "Unable to generate report." : "无法生成报告。"));
      return;
    }

    toast.success(language === "en" ? "Frequency report updated." : "频率报告已更新。");
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-3">
      <input
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
        type="date"
        value={value}
        onChange={(event) => setValue(normalizeBirthday(event.target.value))}
      />
      <button
        type="button"
        disabled={isPending}
        onClick={handleGenerate}
        className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white"
      >
        {isPending ? (language === "en" ? "Generating..." : "生成中...") : language === "en" ? "Generate / Update" : "生成 / 更新"}
      </button>
    </div>
  );
}
