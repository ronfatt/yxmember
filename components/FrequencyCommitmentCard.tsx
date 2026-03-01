"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";

export default function FrequencyCommitmentCard({
  language,
  commitmentText,
  existingCommitment
}: {
  language: Language;
  commitmentText: string;
  existingCommitment: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [locked, setLocked] = useState(Boolean(existingCommitment));

  return (
    <div className="rounded-[32px] bg-[#faf6ee] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8d7240]">
        {language === "en" ? "Weekly commitment" : "本周承诺"}
      </p>
      <h3 className="mt-3 font-display text-3xl text-[#123524]">
        {language === "en" ? "One clear move is enough." : "这一周，你只需要完成一件事。"}
      </h3>
      <p className="mt-4 text-base leading-8 text-black/65">{existingCommitment ?? commitmentText}</p>

      <button
        type="button"
        disabled={isPending || locked}
        onClick={() =>
          startTransition(async () => {
            try {
              const response = await fetch("/api/frequency/commitment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commitmentText })
              });
              const data = await response.json();
              if (!response.ok || !data.ok) {
                throw new Error(data.error ?? "Unable to save commitment.");
              }
              setLocked(true);
              toast.success(language === "en" ? "Weekly commitment locked." : "本周重点已锁定。");
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : language === "en" ? "Unable to save commitment." : "无法保存本周重点。");
            }
          })
        }
        className="mt-6 rounded-full bg-[linear-gradient(135deg,#c8a55c,#e6c88f)] px-5 py-3 text-sm font-semibold text-[#123524] shadow-[0_18px_30px_rgba(200,165,92,0.2)] disabled:opacity-70"
      >
        {locked
          ? language === "en"
            ? "✔ Weekly focus locked"
            : "✔ 本周已锁定"
          : isPending
            ? language === "en"
              ? "Saving..."
              : "保存中..."
            : language === "en"
              ? "I have confirmed this week's focus"
              : "我已确认本周重点"}
      </button>
    </div>
  );
}
