"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";

export default function CopyField({
  label,
  value,
  language
}: {
  label: string;
  value: string;
  language: Language;
}) {
  const [copying, setCopying] = useState(false);

  async function handleCopy() {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(value);
      toast.success(language === "en" ? "Copied." : "已复制。");
    } catch {
      toast.error(language === "en" ? "Copy failed." : "复制失败。");
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-black/45">{label}</p>
        <p className="truncate text-sm text-[#123524]">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        disabled={copying}
        className="rounded-full border border-black/10 bg-[#f8f4ea] px-3 py-1 text-xs font-medium text-[#123524] hover:border-jade/30 hover:text-jade"
      >
        {copying ? (language === "en" ? "Copying..." : "复制中...") : language === "en" ? "Copy" : "复制"}
      </button>
    </div>
  );
}
