"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";

type Booking = { id: string; status: string; party_size: number; room_slot_id: string };

export default function RoomBookingsList({ initial, language }: { initial: Booking[]; language: Language }) {
  const [bookings, setBookings] = useState(initial);

  const cancel = async (id: string) => {
    try {
      const res = await fetch("/api/bookings/room/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error("Failed");
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)));
      toast.success(language === "en" ? "Booking cancelled." : "预约已取消。");
    } catch (error) {
      toast.error(language === "en" ? "Unable to cancel booking." : "无法取消预约。");
    }
  };

  return (
    <div className="space-y-2">
      {bookings.length ? (
        bookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between text-sm text-black/70">
            <span>{booking.room_slot_id} - {booking.status} ({booking.party_size})</span>
            {booking.status === "CONFIRMED" && (
              <button onClick={() => cancel(booking.id)} className="text-xs text-red-600">{language === "en" ? "Cancel" : "取消"}</button>
            )}
          </div>
        ))
      ) : (
        <p className="text-black/60">{language === "en" ? "No room bookings yet." : "还没有房间预约。"}</p>
      )}
    </div>
  );
}
