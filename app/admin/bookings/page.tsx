import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../lib/supabase/admin";

export default async function AdminBookingsPage({ searchParams }: { searchParams: { status?: string } }) {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  const bookingsQuery = admin.from("bookings").select("*").order("created_at", { ascending: false });
  if (searchParams.status) bookingsQuery.eq("booking_status", searchParams.status);
  const { data: bookings } = await bookingsQuery;

  const roomQuery = admin.from("room_bookings").select("*").order("created_at", { ascending: false });
  const { data: roomBookings } = await roomQuery;

  return (
    <div className="space-y-6">
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
