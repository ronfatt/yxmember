import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import Link from "next/link";

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  const resolvedSearchParams = await searchParams;
  const bookingsQuery = admin.from("bookings").select("*").order("created_at", { ascending: false });
  if (resolvedSearchParams.status) bookingsQuery.eq("booking_status", resolvedSearchParams.status);
  const { data: bookings } = await bookingsQuery;

  const roomQuery = admin.from("room_bookings").select("*").order("created_at", { ascending: false });
  const { data: roomBookings } = await roomQuery;

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d7240]">
          {t(language, { zh: "旧版预约页", en: "Legacy bookings page" })}
        </p>
        <h2 className="font-display text-3xl text-[#123524]">
          {t(language, { zh: "新的导师会谈预约，请改用预约后台。", en: "Use the new appointments desk for guidance sessions." })}
        </h2>
        <Link href="/admin/appointments" className="inline-flex rounded-full bg-jade px-4 py-2 text-sm font-semibold text-white">
          {t(language, { zh: "前往预约后台", en: "Open appointments desk" })}
        </Link>
      </section>
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "导师预约", en: "Mentor Bookings" })}</h2>
        {bookings?.length ? (
          bookings.map((booking) => (
            <div key={booking.id} className="border-b pb-2 text-sm">
              {booking.booking_status} - {booking.start_at} - {booking.location_text}
            </div>
          ))
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有导师预约。", en: "No mentor bookings yet." })}</p>
        )}
      </section>
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "房间预约", en: "Room Bookings" })}</h2>
        {roomBookings?.length ? (
          roomBookings.map((booking) => (
            <div key={booking.id} className="border-b pb-2 text-sm">
              {booking.status} - slot {booking.room_slot_id} - party {booking.party_size}
            </div>
          ))
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有房间预约。", en: "No room bookings yet." })}</p>
        )}
      </section>
    </div>
  );
}
