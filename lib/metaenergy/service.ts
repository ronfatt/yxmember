import { addMonths, format, startOfMonth } from "date-fns";
import { calcCashPaid, calcCommissionForOrder, calcCommissionRate, calcEarnedPoints, calcMaxRedeemablePoints } from "./calculations";
import type { SupabaseClient } from "@supabase/supabase-js";

type CreateOrderInput = {
  userId: string;
  amountTotal: number;
  pointsRedeemed?: number;
  orderType: "personal" | "service" | "product";
  referrerId?: string | null;
  referredUserId?: string | null;
};

function currentMonthKey(date = new Date()) {
  return format(startOfMonth(date), "yyyy-MM-dd");
}

async function updateMonthlyStats(admin: SupabaseClient, userId: string, createdAt: string) {
  const month = format(startOfMonth(new Date(createdAt)), "yyyy-MM-dd");

  const { data: totals, error: totalsError } = await admin
    .from("orders")
    .select("cash_paid")
    .eq("user_id", userId)
    .gte("created_at", month)
    .lt("created_at", format(addMonths(new Date(month), 1), "yyyy-MM-dd"));

  if (totalsError) throw totalsError;

  const personalCashTotal = (totals ?? []).reduce((sum, row) => sum + Number(row.cash_paid ?? 0), 0);

  const { error: statError } = await admin.from("monthly_stats").upsert(
    {
      user_id: userId,
      month,
      personal_cash_total: personalCashTotal
    },
    { onConflict: "user_id,month" }
  );

  if (statError) throw statError;
}

export async function createMetaOrder(admin: SupabaseClient, input: CreateOrderInput) {
  const amountTotal = Number(input.amountTotal);
  const requestedPoints = Math.max(0, Math.floor(Number(input.pointsRedeemed ?? 0)));

  const { data: buyerProfile, error: buyerError } = await admin
    .from("users_profile")
    .select("id, points_balance, referred_by")
    .eq("id", input.userId)
    .single();

  if (buyerError || !buyerProfile) {
    throw buyerError ?? new Error("Buyer profile not found.");
  }

  const effectiveReferrerId = buyerProfile.referred_by ?? null;
  const requestedReferrerId = input.referrerId ?? null;
  const requestedReferredUserId = input.referredUserId ?? null;

  if (requestedReferredUserId && requestedReferredUserId !== input.userId) {
    throw new Error("Referred user must match the buyer.");
  }

  if (effectiveReferrerId) {
    if (requestedReferrerId && requestedReferrerId !== effectiveReferrerId) {
      throw new Error("Referrer does not match this member's upstream relationship.");
    }
  } else if (requestedReferrerId || requestedReferredUserId) {
    throw new Error("This member has no upstream referrer, so the order cannot be recorded as referred.");
  }

  const safePoints = calcMaxRedeemablePoints(amountTotal, buyerProfile.points_balance);
  const pointsRedeemed = Math.min(requestedPoints, safePoints);
  const cashPaid = calcCashPaid(amountTotal, pointsRedeemed);
  const earnedPoints = calcEarnedPoints(cashPaid);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: input.userId,
      order_type: input.orderType,
      amount_total: amountTotal,
      cash_paid: cashPaid,
      points_redeemed: pointsRedeemed,
      amount_cents: Math.round(amountTotal * 100),
      currency: "MYR",
      payment_status: "PAID",
      payment_provider: "ADMIN",
      payment_method: pointsRedeemed > 0 ? "CASH_PLUS_POINTS" : "CASH",
      paid_at: new Date().toISOString()
    })
    .select("id, created_at")
    .single();

  if (orderError || !order) {
    throw orderError ?? new Error("Unable to create order.");
  }

  if (pointsRedeemed > 0) {
    const { error: redeemLedgerError } = await admin.from("points_ledger").insert({
      user_id: input.userId,
      points: -pointsRedeemed,
      action: "redeem",
      order_id: order.id,
      note: "Redeemed during checkout"
    });

    if (redeemLedgerError) throw redeemLedgerError;
  }

  if (earnedPoints > 0) {
    const { error: earnLedgerError } = await admin.from("points_ledger").insert({
      user_id: input.userId,
      points: earnedPoints,
      action: "earn",
      order_id: order.id,
      note: "Earned from cash paid"
    });

    if (earnLedgerError) throw earnLedgerError;
  }

  const { error: pointsError } = await admin
    .from("users_profile")
    .update({
      points_balance: buyerProfile.points_balance - pointsRedeemed + earnedPoints
    })
    .eq("id", input.userId);

  if (pointsError) throw pointsError;

  await updateMonthlyStats(admin, input.userId, order.created_at);

  if (effectiveReferrerId) {
    const { data: referrerProfile, error: referrerError } = await admin
      .from("users_profile")
      .select("id, tier_rate, total_referred_sales, total_commission_earned")
      .eq("id", effectiveReferrerId)
      .single();

    if (referrerError || !referrerProfile) {
      throw referrerError ?? new Error("Referrer profile not found.");
    }

    const currentRate = Number(referrerProfile.tier_rate ?? 0);
    const commissionAmount = calcCommissionForOrder(currentRate, cashPaid);
    const nextReferredSales = Number(referrerProfile.total_referred_sales ?? 0) + amountTotal;
    const nextTierRate = calcCommissionRate(nextReferredSales);
    const tierUnlockedAt =
      nextTierRate > currentRate ? new Date().toISOString() : null;

    const { error: referralOrderError } = await admin.from("referral_orders").insert({
      order_id: order.id,
      referrer_id: effectiveReferrerId,
      referred_user_id: input.userId,
      commission_rate: currentRate,
      commission_amount: commissionAmount
    });

    if (referralOrderError) throw referralOrderError;

    const { error: referrerUpdateError } = await admin
      .from("users_profile")
      .update({
        total_referred_sales: nextReferredSales,
        total_commission_earned: Number(referrerProfile.total_commission_earned ?? 0) + commissionAmount,
        tier_rate: nextTierRate,
        tier_unlocked_at: tierUnlockedAt ?? undefined
      })
      .eq("id", input.referrerId);

    if (referrerUpdateError) throw referrerUpdateError;
  }

  return {
    orderId: order.id,
    amountTotal,
    cashPaid,
    pointsRedeemed,
    earnedPoints,
    currentMonth: currentMonthKey(new Date(order.created_at))
  };
}

export async function runKeepAlive(admin: SupabaseClient, referenceDate = new Date()) {
  const previousMonth = startOfMonth(addMonths(referenceDate, -1));
  const nextMonth = startOfMonth(addMonths(previousMonth, 1));
  const monthKey = format(previousMonth, "yyyy-MM-dd");

  const { data: profiles, error: profilesError } = await admin
    .from("users_profile")
    .select("id, months_under_50");

  if (profilesError) throw profilesError;

  const results: Array<{ userId: string; personalCashTotal: number; reset: boolean }> = [];

  for (const profile of profiles ?? []) {
    const { data: orders, error: orderError } = await admin
      .from("orders")
      .select("cash_paid")
      .eq("user_id", profile.id)
      .gte("created_at", monthKey)
      .lt("created_at", format(nextMonth, "yyyy-MM-dd"));

    if (orderError) throw orderError;

    const personalCashTotal = (orders ?? []).reduce((sum, row) => sum + Number(row.cash_paid ?? 0), 0);
    const nextStrikes = personalCashTotal < 50 ? Number(profile.months_under_50 ?? 0) + 1 : 0;
    const shouldReset = nextStrikes >= 2;

    const { error: statError } = await admin.from("monthly_stats").upsert(
      {
        user_id: profile.id,
        month: monthKey,
        personal_cash_total: personalCashTotal
      },
      { onConflict: "user_id,month" }
    );

    if (statError) throw statError;

    const updatePayload = shouldReset
      ? {
          months_under_50: 0,
          tier_rate: 0,
          total_referred_sales: 0,
          tier_unlocked_at: null,
          last_keepalive_month: monthKey
        }
      : {
          months_under_50: nextStrikes,
          last_keepalive_month: monthKey
        };

    const { error: profileError } = await admin
      .from("users_profile")
      .update(updatePayload)
      .eq("id", profile.id);

    if (profileError) throw profileError;

    results.push({
      userId: profile.id,
      personalCashTotal,
      reset: shouldReset
    });
  }

  return {
    month: monthKey,
    processed: results.length,
    resets: results.filter((entry) => entry.reset).length,
    results
  };
}
