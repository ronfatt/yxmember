import { addMonths, format, startOfMonth } from "date-fns";
import { calcCashPaid, calcCommissionForOrder, calcCommissionRate, calcEarnedPoints, calcMaxRedeemablePoints } from "./calculations";
import type { SupabaseClient } from "@supabase/supabase-js";

type CreateOrderInput = {
  userId: string;
  amountTotal: number;
  pointsRedeemed?: number;
  orderType: "personal" | "service" | "product";
  productId?: string | null;
  quantity?: number;
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
    .eq("payment_status", "PAID")
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

async function recalculateReferrerMetrics(admin: SupabaseClient, referrerId: string) {
  const { data: referralOrders, error: referralOrdersError } = await admin
    .from("referral_orders")
    .select("id,order_id")
    .eq("referrer_id", referrerId);

  if (referralOrdersError) throw referralOrdersError;

  if (!referralOrders?.length) {
    const { error: resetError } = await admin
      .from("users_profile")
      .update({
        total_referred_sales: 0,
        total_commission_earned: 0,
        tier_rate: 0,
        tier_unlocked_at: null
      })
      .eq("id", referrerId);

    if (resetError) throw resetError;
    return;
  }

  const orderIds = referralOrders.map((entry) => entry.order_id);
  const { data: orders, error: ordersError } = await admin
    .from("orders")
    .select("id,amount_total,cash_paid,created_at,payment_status")
    .in("id", orderIds);

  if (ordersError) throw ordersError;

  const orderMap = new Map((orders ?? []).map((order) => [order.id, order]));
  const activeEntries = referralOrders
    .map((entry) => ({
      referralOrderId: entry.id,
      order: orderMap.get(entry.order_id)
    }))
    .filter((entry): entry is { referralOrderId: string; order: { id: string; amount_total: number; cash_paid: number; created_at: string; payment_status: string } } =>
      !!entry.order && entry.order.payment_status === "PAID"
    )
    .sort((left, right) => new Date(left.order.created_at).getTime() - new Date(right.order.created_at).getTime());

  let cumulativeSales = 0;
  let totalCommission = 0;
  let currentTier = 0;
  let tierUnlockedAt: string | null = null;

  for (const entry of activeEntries) {
    const rateBeforeOrder = calcCommissionRate(cumulativeSales);
    const commissionAmount = calcCommissionForOrder(rateBeforeOrder, Number(entry.order.cash_paid ?? 0));
    const nextCumulativeSales = cumulativeSales + Number(entry.order.amount_total ?? 0);
    const nextTier = calcCommissionRate(nextCumulativeSales);

    const { error: updateReferralError } = await admin
      .from("referral_orders")
      .update({
        commission_rate: rateBeforeOrder,
        commission_amount: commissionAmount
      })
      .eq("id", entry.referralOrderId);

    if (updateReferralError) throw updateReferralError;

    cumulativeSales = nextCumulativeSales;
    totalCommission += commissionAmount;
    if (nextTier > currentTier) {
      currentTier = nextTier;
      tierUnlockedAt = entry.order.created_at;
    }
  }

  const { error: profileUpdateError } = await admin
    .from("users_profile")
    .update({
      total_referred_sales: cumulativeSales,
      total_commission_earned: totalCommission,
      tier_rate: calcCommissionRate(cumulativeSales),
      tier_unlocked_at: tierUnlockedAt
    })
    .eq("id", referrerId);

  if (profileUpdateError) throw profileUpdateError;
}

async function applyPaidOrderEffects(
  admin: SupabaseClient,
  input: {
    orderId: string;
    userId: string;
    amountTotal: number;
    cashPaid: number;
    pointsRedeemed: number;
    orderType: "personal" | "service" | "product";
    productId?: string | null;
    quantity?: number;
    createdAt: string;
  }
) {
  const { data: buyerProfile, error: buyerError } = await admin
    .from("users_profile")
    .select("id, points_balance, referred_by")
    .eq("id", input.userId)
    .single();

  if (buyerError || !buyerProfile) {
    throw buyerError ?? new Error("Buyer profile not found.");
  }

  const safePoints = calcMaxRedeemablePoints(input.amountTotal, buyerProfile.points_balance);
  const pointsRedeemed = Math.min(Math.max(0, Math.floor(Number(input.pointsRedeemed ?? 0))), safePoints);
  const cashPaid = input.cashPaid > 0 ? Number(input.cashPaid) : calcCashPaid(input.amountTotal, pointsRedeemed);
  const earnedPoints = calcEarnedPoints(cashPaid);

  const { error: orderSyncError } = await admin
    .from("orders")
    .update({
      cash_paid: cashPaid,
      points_redeemed: pointsRedeemed,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.orderId);

  if (orderSyncError) throw orderSyncError;

  if (pointsRedeemed > 0) {
    const { error: redeemLedgerError } = await admin.from("points_ledger").insert({
      user_id: input.userId,
      points: -pointsRedeemed,
      action: "redeem",
      order_id: input.orderId,
      note: "Redeemed during checkout"
    });

    if (redeemLedgerError) throw redeemLedgerError;
  }

  if (earnedPoints > 0) {
    const { error: earnLedgerError } = await admin.from("points_ledger").insert({
      user_id: input.userId,
      points: earnedPoints,
      action: "earn",
      order_id: input.orderId,
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

  if (input.orderType === "product" && input.productId) {
    const { data: product, error: productError } = await admin
      .from("products")
      .select("id,title,stock_on_hand,track_inventory,allow_backorder")
      .eq("id", input.productId)
      .single();

    if (productError || !product) {
      throw productError ?? new Error("Product not found.");
    }

    const quantity = Math.max(1, Math.trunc(Number(input.quantity ?? 1)));

    if (product.track_inventory && !product.allow_backorder && Number(product.stock_on_hand ?? 0) < quantity) {
      throw new Error("Not enough stock for this product order.");
    }

    if (product.track_inventory) {
      const nextStock = Math.max(0, Number(product.stock_on_hand ?? 0) - quantity);
      const { error: stockUpdateError } = await admin
        .from("products")
        .update({
          stock_on_hand: nextStock,
          updated_at: new Date().toISOString()
        })
        .eq("id", product.id);

      if (stockUpdateError) throw stockUpdateError;

      const { error: movementError } = await admin.from("stock_movements").insert({
        product_id: product.id,
        order_id: input.orderId,
        movement_type: "out",
        quantity,
        note: `Order ${input.orderId}: sold to member`,
        created_by: input.userId
      });

      if (movementError) throw movementError;
    }
  }

  await updateMonthlyStats(admin, input.userId, input.createdAt);

  if (buyerProfile.referred_by) {
    const { data: referrerProfile, error: referrerError } = await admin
      .from("users_profile")
      .select("id, tier_rate")
      .eq("id", buyerProfile.referred_by)
      .single();

    if (referrerError || !referrerProfile) {
      throw referrerError ?? new Error("Referrer profile not found.");
    }

    const currentRate = Number(referrerProfile.tier_rate ?? 0);
    const commissionAmount = calcCommissionForOrder(currentRate, cashPaid);

    const { error: referralOrderError } = await admin.from("referral_orders").insert({
      order_id: input.orderId,
      referrer_id: buyerProfile.referred_by,
      referred_user_id: input.userId,
      commission_rate: currentRate,
      commission_amount: commissionAmount
    });

    if (referralOrderError) throw referralOrderError;

    await recalculateReferrerMetrics(admin, buyerProfile.referred_by);
  }

  return {
    pointsRedeemed,
    earnedPoints,
    cashPaid
  };
}

export async function createMetaOrder(admin: SupabaseClient, input: CreateOrderInput) {
  const amountTotal = Number(input.amountTotal);
  const requestedPoints = Math.max(0, Math.floor(Number(input.pointsRedeemed ?? 0)));
  const quantity = Math.max(1, Math.trunc(Number(input.quantity ?? 1)));

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
  let product: { id: string; title: string; stock_on_hand: number; track_inventory: boolean; allow_backorder: boolean } | null = null;

  if (input.orderType === "product") {
    if (!input.productId) {
      throw new Error("Product orders require a selected product.");
    }

    const { data: foundProduct, error: productError } = await admin
      .from("products")
      .select("id,title,stock_on_hand,track_inventory,allow_backorder")
      .eq("id", input.productId)
      .single();

    if (productError || !foundProduct) {
      throw productError ?? new Error("Product not found.");
    }

    product = foundProduct;

    if (foundProduct.track_inventory && !foundProduct.allow_backorder && Number(foundProduct.stock_on_hand ?? 0) < quantity) {
      throw new Error("Not enough stock for this product order.");
    }
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: input.userId,
      order_type: input.orderType,
      product_id: product?.id ?? null,
      quantity,
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

  await applyPaidOrderEffects(admin, {
    orderId: order.id,
    userId: input.userId,
    amountTotal,
    cashPaid,
    pointsRedeemed,
    orderType: input.orderType,
    productId: product?.id ?? null,
    quantity,
    createdAt: order.created_at
  });

  return {
    orderId: order.id,
    amountTotal,
    cashPaid,
    pointsRedeemed,
    earnedPoints,
    currentMonth: currentMonthKey(new Date(order.created_at))
  };
}

export async function approvePendingProductOrder(admin: SupabaseClient, orderId: string, reviewerId?: string | null) {
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id,user_id,amount_total,cash_paid,points_redeemed,order_type,payment_status,product_id,quantity,created_at")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw orderError ?? new Error("Order not found.");
  }

  if (order.order_type !== "product") {
    throw new Error("This is not a product order.");
  }

  if (order.payment_status === "PAID") {
    throw new Error("This product order is already marked as paid.");
  }

  if (order.payment_status === "REFUNDED") {
    throw new Error("Refunded product orders cannot be approved.");
  }

  const cashPaid = calcCashPaid(Number(order.amount_total ?? 0), Number(order.points_redeemed ?? 0));

  const { error: updateError } = await admin
    .from("orders")
    .update({
      cash_paid: cashPaid,
      payment_status: "PAID",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId ?? null
    })
    .eq("id", orderId);

  if (updateError) throw updateError;

  await applyPaidOrderEffects(admin, {
    orderId: order.id,
    userId: order.user_id,
    amountTotal: Number(order.amount_total ?? 0),
    cashPaid,
    pointsRedeemed: Number(order.points_redeemed ?? 0),
    orderType: "product",
    productId: order.product_id,
    quantity: Number(order.quantity ?? 1),
    createdAt: order.created_at
  });

  return { orderId: order.id, cashPaid };
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
      .eq("payment_status", "PAID")
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

export async function updateMemberUpstream(admin: SupabaseClient, memberId: string, upstreamId: string | null) {
  const { data: profiles, error } = await admin
    .from("users_profile")
    .select("id,referred_by");

  if (error) throw error;

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  if (!profileMap.has(memberId)) {
    throw new Error("Member not found.");
  }

  if (upstreamId) {
    if (!profileMap.has(upstreamId)) {
      throw new Error("Upstream member not found.");
    }
    if (upstreamId === memberId) {
      throw new Error("A member cannot refer themselves.");
    }

    let current: string | null | undefined = upstreamId;
    while (current) {
      if (current === memberId) {
        throw new Error("This relationship would create a referral loop.");
      }
      current = profileMap.get(current)?.referred_by;
    }
  }

  const { error: updateError } = await admin
    .from("users_profile")
    .update({ referred_by: upstreamId })
    .eq("id", memberId);

  if (updateError) throw updateError;
}

export async function reverseMetaOrder(admin: SupabaseClient, orderId: string) {
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id,user_id,payment_status,created_at,cash_paid,points_redeemed,order_type,product_id,quantity")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw orderError ?? new Error("Order not found.");
  }

  if (order.payment_status === "REFUNDED") {
    throw new Error("Order already reversed.");
  }

  const { data: profile, error: profileError } = await admin
    .from("users_profile")
    .select("points_balance")
    .eq("id", order.user_id)
    .single();

  if (profileError || !profile) {
    throw profileError ?? new Error("Buyer profile not found.");
  }

  const { data: referralOrder } = await admin
    .from("referral_orders")
    .select("id,referrer_id")
    .eq("order_id", orderId)
    .maybeSingle();

  const { data: ledgerEntries, error: ledgerError } = await admin
    .from("points_ledger")
    .select("id,points,action")
    .eq("order_id", orderId);

  if (ledgerError) throw ledgerError;

  const refundedPoints = Math.max(0, Number(order.points_redeemed ?? 0));
  const earnedPoints = (ledgerEntries ?? [])
    .filter((entry) => entry.action === "earn")
    .reduce((sum, entry) => sum + Number(entry.points ?? 0), 0);

  const adjustments: Array<{ user_id: string; points: number; action: "adjust"; order_id: string; note: string }> = [];
  if (refundedPoints > 0) {
    adjustments.push({
      user_id: order.user_id,
      points: refundedPoints,
      action: "adjust",
      order_id: orderId,
      note: "Refund reversal: restored redeemed points"
    });
  }
  if (earnedPoints > 0) {
    adjustments.push({
      user_id: order.user_id,
      points: -earnedPoints,
      action: "adjust",
      order_id: orderId,
      note: "Refund reversal: removed earned points"
    });
  }

  if (adjustments.length) {
    const { error: adjustError } = await admin.from("points_ledger").insert(adjustments);
    if (adjustError) throw adjustError;
  }

  const { error: pointsUpdateError } = await admin
    .from("users_profile")
    .update({
      points_balance: Number(profile.points_balance ?? 0) + refundedPoints - earnedPoints
    })
    .eq("id", order.user_id);

  if (pointsUpdateError) throw pointsUpdateError;

  const { error: refundError } = await admin
    .from("orders")
    .update({
      payment_status: "REFUNDED",
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId);

  if (refundError) throw refundError;

  if (referralOrder) {
    const { error: deleteReferralError } = await admin
      .from("referral_orders")
      .delete()
      .eq("id", referralOrder.id);

    if (deleteReferralError) throw deleteReferralError;
    await recalculateReferrerMetrics(admin, referralOrder.referrer_id);
  }

  if (order.order_type === "product" && order.product_id) {
    const { data: product } = await admin
      .from("products")
      .select("id,stock_on_hand,track_inventory")
      .eq("id", order.product_id)
      .single();

    if (product?.track_inventory) {
      const restoreQuantity = Math.max(1, Number(order.quantity ?? 1));
      const { error: restoreError } = await admin
        .from("products")
        .update({
          stock_on_hand: Number(product.stock_on_hand ?? 0) + restoreQuantity,
          updated_at: new Date().toISOString()
        })
        .eq("id", product.id);

      if (restoreError) throw restoreError;

      const { error: movementError } = await admin.from("stock_movements").insert({
        product_id: product.id,
        order_id: orderId,
        movement_type: "in",
        quantity: restoreQuantity,
        note: `Order ${orderId}: stock restored after reversal`,
        created_by: order.user_id
      });

      if (movementError) throw movementError;
    }
  }

  await updateMonthlyStats(admin, order.user_id, order.created_at);
}
