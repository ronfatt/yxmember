import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { roomBookingSchema } from "../../../../lib/zod";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = roomBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const { data: slot } = await admin
    .from("room_slots_view")
    .select("id,room_id,room_name,start_at,end_at,total_capacity,remaining_capacity")
    .eq("id", parsed.data.room_slot_id)
    .single();

  if (!slot) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }

  const bookingInsert = await admin.from("room_bookings").insert({
    user_id: auth.user.id,
    room_id: slot.room_id,
    room_slot_id: slot.id,
    party_size: parsed.data.party_size,
    status: "PENDING_PAYMENT"
  }).select("id").single();

  const priceCents = Number(process.env.ROOM_BOOKING_PRICE_CENTS ?? 0);
  const currency = process.env.ROOM_BOOKING_CURRENCY ?? "MYR";

  const { data: order } = await admin.from("orders").insert({
    user_id: auth.user.id,
    order_type: "ROOM",
    booking_id: bookingInsert.data?.id,
    amount_cents: priceCents,
    currency,
    payment_provider: "BANK_TRANSFER",
    payment_status: "PENDING"
  }).select("id").single();
  return NextResponse.json({ order_id: order?.id });
}
