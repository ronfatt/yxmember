"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "../lib/supabase/client";
import type { Language } from "../lib/i18n/shared";

type Order = {
  id: string;
  order_type: string;
  amount_total?: number | null;
  amount_cents?: number | null;
  currency: string;
  payment_status: string;
  slip_url: string | null;
  label?: string | null;
};

export default function OrderSlipUpload({
  orders,
  language
}: {
  orders: Order[];
  language: Language;
}) {
  const [uploading, setUploading] = useState<string | null>(null);

  const upload = async (orderId: string, file: File | null) => {
    if (!file) return;
    try {
      setUploading(orderId);
      const supabase = createClient();
      const path = `order-${orderId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("bank-slips").upload(path, file, {
        cacheControl: "3600",
        upsert: false
      });
      if (error) throw error;

      const { data: publicUrl } = supabase.storage.from("bank-slips").getPublicUrl(path);

      const res = await fetch("/api/orders/slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, slip_url: publicUrl.publicUrl })
      });
      if (!res.ok) throw new Error("Failed to attach slip");

      toast.success(language === "en" ? "Slip uploaded. We'll review soon." : "单据已上传，我们会尽快审核。");
      window.location.reload();
    } catch (error) {
      toast.error(language === "en" ? "Upload failed." : "上传失败。");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 border-b pb-2 text-sm">
          <div>
            <p className="font-medium">{order.label ?? order.order_type}</p>
            <p className="text-xs text-black/50">
              {Number(order.amount_total ?? (order.amount_cents ?? 0) / 100).toFixed(2)} {order.currency} · {order.payment_status}
            </p>
            {order.slip_url && (
              <a href={order.slip_url} target="_blank" className="text-xs text-jade" rel="noreferrer">
                {language === "en" ? "View slip" : "查看单据"}
              </a>
            )}
          </div>
          {order.payment_status === "PENDING" && !order.slip_url && (
            <label className="rounded-full bg-ink px-3 py-2 text-xs text-white">
              {uploading === order.id
                ? language === "en" ? "Uploading..." : "上传中..."
                : language === "en" ? "Upload transfer slip" : "上传汇款单据"}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={uploading === order.id}
                onChange={(e) => upload(order.id, e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
