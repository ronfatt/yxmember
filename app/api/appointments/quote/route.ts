import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { appointmentQuoteSchema } from "../../../../lib/zod";
import { buildAppointmentQuote } from "../../../../lib/metaenergy/appointments";
import { getCurrentLanguage } from "../../../../lib/i18n/server";

export async function POST(request: Request) {
  const language = await getCurrentLanguage();
  const payload = await request.json().catch(() => null);
  const parsed = appointmentQuoteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: language === "en" ? "Invalid quote request." : "报价请求无效。" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: language === "en" ? "Unauthorized" : "请先登录。" },
      { status: 401 }
    );
  }

  const admin = supabaseAdmin();
  const [{ data: profile, error: profileError }, { data: service, error: serviceError }] = await Promise.all([
    admin.from("users_profile").select("points_balance").eq("id", user.id).single(),
    admin
      .from("mentor_services")
      .select("id,mentor_id,name,duration_min,price_total,deposit_amount,allow_points,active")
      .eq("id", parsed.data.service_id)
      .eq("active", true)
      .single()
  ]);

  if (profileError || !profile || serviceError || !service) {
    return NextResponse.json(
      { ok: false, error: language === "en" ? "Unable to prepare quote." : "暂时无法计算预约金额。" },
      { status: 400 }
    );
  }

  const quote = buildAppointmentQuote(service, Number(profile.points_balance ?? 0), parsed.data.points_requested);
  return NextResponse.json({ ok: true, quote });
}
