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
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Failed to start checkout");
      const { order_id, requires_slip, payment_status } = payload;
      if (order_id) {
        if (payment_status === "PAID") {
          toast.success(language === "en" ? "Your seat is confirmed." : "报名成功，席位已确认。");
        } else if (requires_slip) {
          toast.success(language === "en" ? "Reservation created. Upload your transfer slip in Programs." : "报名订单已创建，请到课程活动页上传汇款单据。");
        } else {
          toast.success(language === "en" ? "Reservation created." : "报名订单已创建。");
        }
        window.location.href = "/dashboard/programs";
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : language === "en" ? "Unable to start checkout." : "无法开始报名。");
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
              : Number(session.price_cents ?? 0) <= 0
                ? language === "en"
                  ? "Reserve free seat"
                  : "免费报名"
                : language === "en"
                  ? `Reserve ${(session.price_cents / 100).toFixed(2)} ${session.currency}`
                  : `报名 ${(session.price_cents / 100).toFixed(2)} ${session.currency}`}
          </button>
        </div>
      ))}
    </div>
  );
}
