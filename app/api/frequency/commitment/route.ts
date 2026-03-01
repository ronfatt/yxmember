import { format, startOfWeek } from "date-fns";
import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/actions/session";
import { getCurrentLanguage } from "../../../../lib/i18n/server";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  const language = getCurrentLanguage();
  try {
    const user = await requireUser();
    const supabase = createClient();
    const payload = await request.json().catch(() => ({}));
    const commitmentText = String(payload.commitmentText ?? "").trim();

    if (!commitmentText) {
      return NextResponse.json(
        { ok: false, error: language === "en" ? "Commitment text is required." : "请先选择本周重点。" },
        { status: 400 }
      );
    }

    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    const { error } = await supabase.from("frequency_commitments").upsert(
      {
        user_id: user.id,
        week_start: weekStart,
        commitment_text: commitmentText,
        confirmed_at: new Date().toISOString()
      },
      { onConflict: "user_id,week_start" }
    );

    if (error) throw error;

    return NextResponse.json({ ok: true, weekStart });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : language === "en" ? "Unable to save commitment." : "暂时无法保存本周重点。" },
      { status: 400 }
    );
  }
}
