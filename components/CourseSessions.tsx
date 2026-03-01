"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";

export default function CourseSessions({ sessions, language }: { sessions: any[]; language: Language }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (sessionId: string) => {
    try {
      setLoading(sessionId);
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_session_id: sessionId })
      });
      if (!res.ok) throw new Error("Failed to start checkout");
      const { order_id } = await res.json();
      if (order_id) {
        toast.success(language === "en" ? "Order created. Upload bank-in slip in dashboard." : "订单已创建，请到会员中心上传汇款凭证。");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.error(language === "en" ? "Unable to start checkout." : "无法开始结账。");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/80 p-4">
          <div>
            <p className="text-sm text-black/50">{session.start_at} - {session.end_at} ({session.timezone})</p>
            <p className="text-sm">{language === "en" ? "Capacity: " : "人数上限："}{session.capacity}</p>
          </div>
          <button
            onClick={() => handleCheckout(session.id)}
            disabled={loading === session.id}
            className="rounded-full bg-ink px-4 py-2 text-sm text-white"
          >
            {loading === session.id
              ? language === "en" ? "Processing..." : "处理中..."
              : language === "en"
                ? `Reserve ${(session.price_cents / 100).toFixed(2)} ${session.currency}`
                : `预约 ${(session.price_cents / 100).toFixed(2)} ${session.currency}`}
          </button>
        </div>
      ))}
    </div>
  );
}
