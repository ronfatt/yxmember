import { NextResponse } from "next/server";
import { endOfWeek, startOfWeek } from "date-fns";
import { requireUser } from "../../../../lib/actions/session";
import { buildWeeklyReminder } from "../../../../lib/metaenergy/frequency";
import { getCurrentLanguage } from "../../../../lib/i18n/server";
import { createClient } from "../../../../lib/supabase/server";

export async function POST() {
  try {
    const user = await requireUser();
    const language = getCurrentLanguage();
    const supabase = createClient();

    const { data: latestReport, error: reportError } = await supabase
      .from("frequency_reports")
      .select("report_json")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (reportError && reportError.code !== "PGRST116") {
      throw reportError;
    }

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id,cash_paid,created_at")
      .eq("user_id", user.id)
      .eq("payment_status", "PAID")
      .gte("created_at", weekStart.toISOString())
      .lte("created_at", weekEnd.toISOString());

    if (ordersError) throw ordersError;

    const { data: referralOrders, error: referralOrdersError } = await supabase
      .from("referral_orders")
      .select("id,created_at")
      .eq("referrer_id", user.id)
      .gte("created_at", weekStart.toISOString())
      .lte("created_at", weekEnd.toISOString());

    if (referralOrdersError) throw referralOrdersError;

    const reminder = buildWeeklyReminder((latestReport?.report_json as Record<string, unknown>) ?? {}, {
      orderCount: orders?.length ?? 0,
      personalCashSpent: (orders ?? []).reduce((sum, order) => sum + Number(order.cash_paid ?? 0), 0),
      referredOrderCount: referralOrders?.length ?? 0
    }, language);

    const { error } = await supabase.from("weekly_reminders").upsert(
      {
        user_id: user.id,
        week_start: reminder.weekStart,
        content: JSON.stringify(reminder)
      },
      { onConflict: "user_id,week_start" }
    );

    if (error) throw error;

    return NextResponse.json({ ok: true, reminder });
  } catch (error) {
    const language = getCurrentLanguage();
    const message = error instanceof Error ? error.message : language === "en" ? "Unable to generate reminder." : "暂时无法生成提醒。";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
