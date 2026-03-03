import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { getCurrentLanguage } from "../../../../lib/i18n/server";
import { productOrderSchema } from "../../../../lib/zod";
import { calcCashPaid, calcMaxRedeemablePoints } from "../../../../lib/metaenergy/calculations";

export async function POST(request: Request) {
  const language = await getCurrentLanguage();
  const body = await request.json();
  const parsed = productOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: language === "en" ? "Invalid request." : "请求无效。" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: language === "en" ? "Please sign in first." : "请先登录会员账号。" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const [{ data: product }, { data: profile }] = await Promise.all([
    admin
      .from("products")
      .select("id,title,price_myr,is_published,track_inventory,stock_on_hand,allow_backorder")
      .eq("id", parsed.data.product_id)
      .single(),
    admin
      .from("users_profile")
      .select("points_balance")
      .eq("id", auth.user.id)
      .single()
  ]);

  if (!product || !product.is_published) {
    return NextResponse.json({ error: language === "en" ? "Product not found." : "找不到这个产品。" }, { status: 404 });
  }

  const quantity = Math.max(1, parsed.data.quantity);
  const amountTotal = Number(product.price_myr ?? 0) * quantity;

  if (amountTotal <= 0) {
    return NextResponse.json({ error: language === "en" ? "This product is not ready for purchase yet." : "这个产品暂时还不能下单。" }, { status: 400 });
  }

  if (product.track_inventory && !product.allow_backorder && Number(product.stock_on_hand ?? 0) < quantity) {
    return NextResponse.json({ error: language === "en" ? "Not enough stock for this quantity." : "目前库存不足，无法下这笔数量。" }, { status: 400 });
  }

  const pointsBalance = Number(profile?.points_balance ?? 0);
  const requestedPoints = Math.max(0, parsed.data.points_requested);
  const pointsRedeemed = Math.min(requestedPoints, calcMaxRedeemablePoints(amountTotal, pointsBalance));
  const cashPaid = calcCashPaid(amountTotal, pointsRedeemed);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: auth.user.id,
      order_type: "product",
      product_id: product.id,
      quantity,
      amount_total: amountTotal,
      cash_paid: cashPaid,
      points_redeemed: pointsRedeemed,
      amount_cents: Math.round(amountTotal * 100),
      currency: "MYR",
      payment_provider: "BANK_TRANSFER",
      payment_method: "BANK_TRANSFER",
      payment_status: "PENDING"
    })
    .select("id,payment_status")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? (language === "en" ? "Unable to create order." : "无法创建产品订单。") }, { status: 400 });
  }

  return NextResponse.json({
    order_id: order.id,
    payment_status: order.payment_status,
    requires_slip: true
  });
}
