import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../../lib/supabase/admin";

export async function POST(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = supabaseAdmin();
  const { data: booking } = await admin.from("room_bookings").select("user_id,status").eq("id", id).single();
  if (!booking || booking.user_id !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await admin.from("room_bookings").update({ status: "CANCELLED", updated_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({ ok: true });
}
