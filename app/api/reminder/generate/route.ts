import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/actions/session";
import { buildWeeklyReminder } from "../../../../lib/metaenergy/frequency";
import { createClient } from "../../../../lib/supabase/server";

export async function POST() {
  try {
    const user = await requireUser();
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

    const reminder = buildWeeklyReminder((latestReport?.report_json as Record<string, unknown>) ?? {});

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
    const message = error instanceof Error ? error.message : "Unable to generate reminder.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
