import { format, startOfWeek } from "date-fns";
import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/actions/session";
import { getCurrentLanguage } from "../../../../lib/i18n/server";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  const language = await getCurrentLanguage();
  try {
    const user = await requireUser();
    const supabase = await createClient();
    const payload = await request.json().catch(() => ({}));
    const responseText = String(payload.responseText ?? "").trim();

    if (!responseText) {
      return NextResponse.json(
        { ok: false, error: language === "en" ? "Response text is required." : "请先写下你的回应。" },
        { status: 400 }
      );
    }

    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    const { error } = await supabase.from("frequency_journal_entries").upsert(
      {
        user_id: user.id,
        week_start: weekStart,
        response_text: responseText,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,week_start" }
    );

    if (error) throw error;

    return NextResponse.json({ ok: true, weekStart });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : language === "en" ? "Unable to save journal entry." : "暂时无法保存回应。" },
      { status: 400 }
    );
  }
}
