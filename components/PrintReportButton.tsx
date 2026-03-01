"use client";

export default function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-[#123524]"
    >
      Print / Save PDF
    </button>
  );
}
