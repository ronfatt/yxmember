import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { mentorBookingSchema } from "../../../../lib/zod";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = mentorBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const bookingInsert = await admin.from("bookings").insert({
    user_id: auth.user.id,
    mentor_id: parsed.data.mentor_id,
    availability_id: parsed.data.availability_id ?? null,
    start_at: parsed.data.start_at,
    end_at: parsed.data.end_at,
    location_text: parsed.data.location_text,
    notes: parsed.data.notes ?? null,
    booking_status: "REQUESTED",
    deposit_required: parsed.data.deposit_required,
    deposit_amount_cents: parsed.data.deposit_amount_cents
  }).select("id").single();

  if (parsed.data.deposit_required && parsed.data.deposit_amount_cents > 0) {
    const { data: order } = await admin.from("orders").insert({
      user_id: auth.user.id,
      order_type: "MENTOR_DEPOSIT",
      booking_id: bookingInsert.data?.id,
      amount_cents: parsed.data.deposit_amount_cents,
      currency: "MYR",
      payment_provider: "BANK_TRANSFER",
      payment_status: "PENDING"
    }).select("id").single();
    return NextResponse.json({ order_id: order?.id });
  }

  return NextResponse.json({ order_id: null });
}
