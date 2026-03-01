"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";

export default function MentorBookingForm({ mentorId, language }: { mentorId: string; language: Language }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    start_at: "",
    end_at: "",
    location_text: "",
    deposit_required: false,
    deposit_amount_cents: 0,
    notes: ""
  });

  const submit = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentor_id: mentorId,
          start_at: form.start_at,
          end_at: form.end_at,
          location_text: form.location_text,
          deposit_required: form.deposit_required,
          deposit_amount_cents: Number(form.deposit_amount_cents || 0),
          notes: form.notes
        })
      });
      if (!res.ok) throw new Error("Failed");
      const { order_id } = await res.json();
      if (order_id) {
        toast.success(language === "en" ? "Deposit order created. Upload bank-in slip in dashboard." : "订金订单已创建，请到会员中心上传汇款凭证。");
        window.location.href = "/dashboard";
      } else {
        toast.success(language === "en" ? "Booking requested." : "预约申请已提交。");
      }
    } catch (error) {
      toast.error(language === "en" ? "Unable to submit booking." : "无法提交预约。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <label className="text-sm">{language === "en" ? "Start (ISO)" : "开始时间（ISO）"}</label>
        <input className="rounded-lg border p-2" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm">{language === "en" ? "End (ISO)" : "结束时间（ISO）"}</label>
        <input className="rounded-lg border p-2" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm">{language === "en" ? "Location" : "地点"}</label>
        <input className="rounded-lg border p-2" value={form.location_text} onChange={(e) => setForm({ ...form, location_text: e.target.value })} />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.deposit_required} onChange={(e) => setForm({ ...form, deposit_required: e.target.checked })} />
        <span>{language === "en" ? "Deposit required" : "需要订金"}</span>
      </div>
      {form.deposit_required && (
        <div className="grid gap-2">
          <label className="text-sm">{language === "en" ? "Deposit amount (cents)" : "订金金额（分）"}</label>
          <input
            type="number"
            className="rounded-lg border p-2"
            value={form.deposit_amount_cents}
            onChange={(e) => setForm({ ...form, deposit_amount_cents: Number(e.target.value) })}
          />
        </div>
      )}
      <div className="grid gap-2">
        <label className="text-sm">{language === "en" ? "Notes" : "备注"}</label>
        <textarea className="rounded-lg border p-2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <button onClick={submit} disabled={loading} className="rounded-full bg-ink px-4 py-2 text-white">
        {loading ? (language === "en" ? "Submitting..." : "提交中...") : language === "en" ? "Request Booking" : "提交预约"}
      </button>
    </div>
  );
}
