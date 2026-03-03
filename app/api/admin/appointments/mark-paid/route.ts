import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../../lib/supabase/admin";
import { appointmentAdminActionSchema } from "../../../../../lib/zod";
import { getCurrentLanguage } from "../../../../../lib/i18n/server";
import { getAdminStatus } from "../../../../../lib/actions/session";
import { createMetaOrder } from "../../../../../lib/metaenergy/service";

export async function POST(request: Request) {
  const language = await getCurrentLanguage();
  const payload = await request.json().catch(() => null);
  const parsed = appointmentAdminActionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: language === "en" ? "Invalid request." : "请求无效。" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !(await getAdminStatus(user.id, user.email))) {
    return NextResponse.json({ ok: false, error: language === "en" ? "Forbidden" : "无权限操作。" }, { status: 403 });
  }

  const admin = supabaseAdmin();
  const { data: appointment, error: appointmentError } = await admin
    .from("appointments")
    .select("id,user_id,status,price_total,points_used,order_id")
    .eq("id", parsed.data.appointment_id)
    .single();

  if (appointmentError || !appointment) {
    return NextResponse.json({ ok: false, error: language === "en" ? "Appointment not found." : "找不到预约。" }, { status: 404 });
  }

  if (appointment.order_id) {
    return NextResponse.json({ ok: false, error: language === "en" ? "This appointment is already marked as paid." : "这笔预约已经记为已付款。" }, { status: 400 });
  }

  if (appointment.status === "cancelled" || appointment.status === "no_show") {
    return NextResponse.json({ ok: false, error: language === "en" ? "Cancelled appointments cannot be marked as paid." : "已取消的预约不能记为已付款。" }, { status: 400 });
  }

  const order = await createMetaOrder(admin, {
    userId: appointment.user_id,
    amountTotal: Number(appointment.price_total ?? 0),
    pointsRedeemed: Number(appointment.points_used ?? 0),
    orderType: "service"
  });

  const { error } = await admin
    .from("appointments")
    .update({
      order_id: order.orderId,
      points_used: order.pointsRedeemed,
      cash_due: order.cashPaid,
      deposit_paid: true,
      balance_paid: true,
      status: appointment.status === "pending" ? "confirmed" : appointment.status
    })
    .eq("id", appointment.id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, orderId: order.orderId });
}
