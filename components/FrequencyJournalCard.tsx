"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";

export default function FrequencyJournalCard({
  language,
  initialValue
}: {
  language: Language;
  initialValue: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-[28px] bg-[#faf6ee] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8d7240]">
        {language === "en" ? "Your response" : "记录我的回应"}
      </p>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={5}
        className="mt-4 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 text-sm leading-7 outline-none"
        placeholder={
          language === "en"
            ? "Write one honest response to this week's guidance."
            : "写下一句你此刻最真实的回应。"
        }
      />
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              const response = await fetch("/api/frequency/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ responseText: value })
              });
              const data = await response.json();
              if (!response.ok || !data.ok) {
                throw new Error(data.error ?? "Unable to save journal entry.");
              }
              toast.success(language === "en" ? "Response saved." : "回应已保存。");
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : language === "en" ? "Unable to save journal entry." : "无法保存回应。");
            }
          })
        }
        className="mt-4 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#123524]"
      >
        {isPending ? (language === "en" ? "Saving..." : "保存中...") : language === "en" ? "Save my response" : "保存我的回应"}
      </button>
    </div>
  );
}
