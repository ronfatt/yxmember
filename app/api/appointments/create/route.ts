import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { appointmentCreateSchema } from "../../../../lib/zod";
import { buildAppointmentQuote, ensureAppointmentSlotAvailable, getMentorService } from "../../../../lib/metaenergy/appointments";
import { getCurrentLanguage } from "../../../../lib/i18n/server";

export async function POST(request: Request) {
  const language = await getCurrentLanguage();
  const payload = await request.json().catch(() => null);
  const parsed = appointmentCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: language === "en" ? "Invalid appointment request." : "预约资料不完整。" },
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
  const [{ data: profile, error: profileError }, mentorData] = await Promise.all([
    admin.from("users_profile").select("id,points_balance,birthday").eq("id", user.id).single(),
    getMentorService(admin, parsed.data.mentor_id, parsed.data.service_id)
  ]);

  if (profileError || !profile) {
    return NextResponse.json(
      { ok: false, error: language === "en" ? "Member profile not found." : "找不到会员资料。" },
      { status: 400 }
    );
  }

  const { mentor, service } = mentorData;

  if (mentor.location_type !== "both" && parsed.data.session_mode !== mentor.location_type) {
    return NextResponse.json(
      {
        ok: false,
        error: language === "en" ? "This mentor does not support the selected session mode." : "这位导师不提供你选择的会谈形式。"
      },
      { status: 400 }
    );
  }

  const durationMinutes = Math.round((new Date(parsed.data.end_at).getTime() - new Date(parsed.data.start_at).getTime()) / 60000);
  if (durationMinutes !== Number(service.duration_min)) {
    return NextResponse.json(
      { ok: false, error: language === "en" ? "Session duration does not match the selected service." : "预约时长与所选服务不一致。" },
      { status: 400 }
    );
  }

  await ensureAppointmentSlotAvailable(admin, mentor.id, parsed.data.start_at, parsed.data.end_at);

  const quote = buildAppointmentQuote(service, Number(profile.points_balance ?? 0), parsed.data.points_requested);
  const intakeJson = {
    ...parsed.data.intake,
    shared_birthday: parsed.data.intake.share_birthday ? profile.birthday : null,
    mentor_name: mentor.display_name,
    service_name: service.name
  };

  const { data: appointment, error } = await admin
    .from("appointments")
    .insert({
      user_id: user.id,
      mentor_id: mentor.id,
      service_id: service.id,
      start_at: parsed.data.start_at,
      end_at: parsed.data.end_at,
      session_mode: parsed.data.session_mode,
      intake_json: intakeJson,
      price_total: quote.priceTotal,
      deposit_amount: quote.depositAmount,
      points_used: quote.pointsUsed,
      cash_due: quote.cashDue,
      location_note: parsed.data.session_mode === "offline" ? mentor.location_note : null,
      meeting_link: parsed.data.session_mode === "online" ? null : null
    })
    .select("id")
    .single();

  if (error || !appointment) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? (language === "en" ? "Unable to create appointment." : "无法创建预约。") },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    appointmentId: appointment.id,
    redirectTo: "/dashboard/appointments"
  });
}
