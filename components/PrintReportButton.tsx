"use client";

import type { Language } from "../lib/i18n/shared";

export default function PrintReportButton({ language }: { language: Language }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-[#123524]"
    >
      {language === "en" ? "Print / Save PDF" : "打印 / 保存 PDF"}
    </button>
  );
}
