import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/actions/session";
import { calcCashPaid, calcMaxRedeemablePoints } from "../../../../lib/metaenergy/calculations";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const supabase = await createClient();
    const payload = await request.json();

    const amountTotal = Number(payload.amountTotal);
    const desiredPoints = Math.max(0, Math.floor(Number(payload.pointsRedeemed ?? 0)));

    const { data: profile, error } = await supabase
      .from("users_profile")
      .select("points_balance")
      .eq("id", user.id)
      .single();

    if (error || !profile) throw error ?? new Error("Profile not found.");

    const maxRedeemablePoints = calcMaxRedeemablePoints(amountTotal, profile.points_balance);
    const appliedPoints = Math.min(desiredPoints || maxRedeemablePoints, maxRedeemablePoints);
    const cashRequired = calcCashPaid(amountTotal, appliedPoints);

    return NextResponse.json({
      ok: true,
      maxRedeemablePoints,
      appliedPoints,
      cashRequired
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to calculate redemption.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
