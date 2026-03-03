import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export async function POST(request: Request) {
  const { order_id, slip_url } = await request.json();
  if (!order_id || !slip_url) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const { data: order } = await admin.from("orders").select("user_id").eq("id", order_id).single();
  if (!order || order.user_id !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await admin.from("orders").update({
    slip_url,
    slip_uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq("id", order_id);

  return NextResponse.json({ ok: true });
}
