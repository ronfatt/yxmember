import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../../lib/supabase/admin";
import { appointmentAdminActionSchema } from "../../../../../lib/zod";
import { getCurrentLanguage } from "../../../../../lib/i18n/server";
import { getAdminStatus } from "../../../../../lib/actions/session";

export async function POST(request: Request) {
  const language = getCurrentLanguage();
  const payload = await request.json().catch(() => null);
  const parsed = appointmentAdminActionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: language === "en" ? "Invalid request." : "请求无效。" }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !(await getAdminStatus(user.id, user.email))) {
    return NextResponse.json({ ok: false, error: language === "en" ? "Forbidden" : "无权限操作。" }, { status: 403 });
  }

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("appointments")
    .update({ status: "confirmed" })
    .eq("id", parsed.data.appointment_id)
    .in("status", ["pending", "confirmed"]);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
