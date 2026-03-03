import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { enrollmentSchema } from "../../../lib/zod";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { renderProgramEmail, sendEmail } from "../../../lib/notifications/email";

export async function POST(request: Request) {
  const language = await getCurrentLanguage();
  const body = await request.json();
  const parsed = enrollmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: language === "en" ? "Invalid input." : "请求无效。" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: language === "en" ? "Please sign in first." : "请先登录会员账号。" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const { data: session } = await admin
    .from("course_sessions")
    .select("id,course_id,price_cents,currency,status,start_at,venue_name")
    .eq("id", parsed.data.course_session_id)
    .single();

  if (!session) {
    return NextResponse.json({ error: language === "en" ? "Session not found." : "找不到这个课程场次。" }, { status: 404 });
  }

  const { data: course } = await admin
    .from("courses")
    .select("title")
    .eq("id", session.course_id)
    .maybeSingle();

  if (session.status !== "PUBLISHED") {
    return NextResponse.json({ error: language === "en" ? "This session is not open for booking yet." : "这个场次暂时还不能报名。" }, { status: 400 });
  }

  const { data: existingOrder } = await admin
    .from("orders")
    .select("id,payment_status,slip_url")
    .eq("user_id", auth.user.id)
    .eq("course_session_id", session.id)
    .in("payment_status", ["PENDING", "PAID"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingOrder) {
    return NextResponse.json({
      order_id: existingOrder.id,
      payment_status: existingOrder.payment_status,
      requires_slip: existingOrder.payment_status === "PENDING"
    });
  }

  const price = Number(session.price_cents ?? 0) / 100;

  const { data: order, error: orderError } = await admin.from("orders").insert({
    user_id: auth.user.id,
    order_type: "COURSE",
    course_session_id: session.id,
    amount_cents: session.price_cents,
    amount_total: price,
    cash_paid: price,
    points_redeemed: 0,
    currency: session.currency,
    payment_provider: price > 0 ? "BANK_TRANSFER" : "FREE",
    payment_method: price > 0 ? "BANK_TRANSFER" : "FREE",
    payment_status: "PENDING"
  }).select("id").single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? (language === "en" ? "Unable to create enrollment." : "无法创建报名订单。") }, { status: 400 });
  }

  if (price <= 0) {
    const { error: processError } = await admin.rpc("process_paid_order", {
      order_id_input: order.id,
      payment_intent_input: "FREE_ENROLLMENT"
    });

    if (processError) {
      return NextResponse.json({ error: processError.message }, { status: 400 });
    }

    if (auth.user.email) {
      await sendEmail({
        to: auth.user.email,
        subject: language === "en" ? "Your MetaEnergy reservation is confirmed" : "你的元象课程席位已确认",
        html: renderProgramEmail({
          heading: language === "en" ? "Your seat is confirmed" : "你的席位已确认",
          intro:
            language === "en"
              ? "Your reservation has been confirmed. We look forward to welcoming you into this experience."
              : "你的报名已确认。我们期待在这次体验中迎接你的到来。",
          lines: [
            `${language === "en" ? "Program" : "课程 / 活动"}：${course?.title ?? "-"}`,
            `${language === "en" ? "Session time" : "场次时间"}：${new Date(session.start_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}`,
            `${language === "en" ? "Venue" : "地点"}：${session.venue_name || (language === "en" ? "To be announced" : "待公布")}`
          ]
        })
      }).catch(() => null);
    }

    return NextResponse.json({
      order_id: order.id,
      payment_status: "PAID",
      requires_slip: false
    });
  }

  if (auth.user.email) {
    await sendEmail({
      to: auth.user.email,
      subject: language === "en" ? "Upload your transfer slip to complete reservation" : "请上传汇款单据以完成报名",
      html: renderProgramEmail({
        heading: language === "en" ? "Your reservation has been created" : "你的报名订单已建立",
        intro:
          language === "en"
            ? "To secure this seat, please complete your bank transfer and upload the slip in your member dashboard."
            : "若要锁定席位，请完成银行转账，并到会员中心上传汇款单据。",
        lines: [
          `${language === "en" ? "Program" : "课程 / 活动"}：${course?.title ?? "-"}`,
          `${language === "en" ? "Session time" : "场次时间"}：${new Date(session.start_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}`,
          `${language === "en" ? "Amount due" : "需汇款金额"}：${price.toFixed(2)} ${session.currency}`
        ]
      })
    }).catch(() => null);
  }

  return NextResponse.json({
    order_id: order.id,
    payment_status: "PENDING",
    requires_slip: true
  });
}
