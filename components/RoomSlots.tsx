"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";

type Slot = {
  id: string;
  start_at: string;
  end_at: string;
  remaining_capacity: number;
  total_capacity: number;
  room_name: string;
};

export default function RoomSlots({ slots, language }: { slots: Slot[]; language: Language }) {
  const [partySize, setPartySize] = useState(1);
  const [loading, setLoading] = useState<string | null>(null);

  const book = async (slotId: string) => {
    try {
      setLoading(slotId);
      const res = await fetch("/api/bookings/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_slot_id: slotId, party_size: partySize })
      });
      if (!res.ok) throw new Error("Failed");
      const { order_id } = await res.json();
      if (order_id) {
        toast.success(language === "en" ? "Room booking created. Upload bank-in slip in dashboard." : "房间预约已创建，请到会员中心上传汇款凭证。");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.error(language === "en" ? "Unable to start room checkout." : "无法开始房间预约结账。");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <span>{language === "en" ? "Party size" : "人数"}</span>
        <input
          type="number"
          min={1}
          max={7}
          value={partySize}
          onChange={(e) => setPartySize(Number(e.target.value))}
          className="w-20 rounded-lg border p-2"
        />
      </div>
      {slots.map((slot) => (
        <div key={slot.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/80 p-4">
          <div>
            <p className="text-sm text-black/60">{slot.room_name}</p>
            <p className="text-sm">{slot.start_at} - {slot.end_at}</p>
            <p className="text-xs text-black/50">{language === "en" ? "Remaining " : "剩余 "} {slot.remaining_capacity}/{slot.total_capacity}</p>
          </div>
          <button
            onClick={() => book(slot.id)}
            disabled={loading === slot.id || slot.remaining_capacity < partySize}
            className="rounded-full bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {loading === slot.id ? (language === "en" ? "Redirecting..." : "跳转中...") : language === "en" ? "Book" : "预约"}
          </button>
        </div>
      ))}
    </div>
  );
}
