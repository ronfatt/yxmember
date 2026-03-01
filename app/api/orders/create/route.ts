import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/actions/session";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { createMetaOrder } from "../../../../lib/metaenergy/service";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const payload = await request.json();

    const result = await createMetaOrder(supabaseAdmin(), {
      userId: String(payload.userId),
      amountTotal: Number(payload.amountTotal),
      pointsRedeemed: Number(payload.pointsRedeemed ?? 0),
      orderType: payload.orderType,
      productId: payload.productId ? String(payload.productId) : null,
      quantity: payload.quantity ? Number(payload.quantity) : 1,
      referrerId: payload.referrerId ? String(payload.referrerId) : null,
      referredUserId: payload.referredUserId ? String(payload.referredUserId) : null
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
