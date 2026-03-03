import { revalidatePath } from "next/cache";
import AdminOrderForm from "../../../components/AdminOrderForm";
import { requireAdmin } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { formatMoney, formatPercent } from "../../../lib/metaenergy/helpers";
import { reverseMetaOrder } from "../../../lib/metaenergy/service";
import { supabaseAdmin } from "../../../lib/supabase/admin";

type AdminOrdersPageProps = {
  searchParams?: Promise<{
    source?: string;
    buyer?: string;
    referrer?: string;
    limit?: string;
    status?: string;
  }>;
};

async function reverseOrderAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const orderId = String(formData.get("order_id"));
  await reverseMetaOrder(supabaseAdmin(), orderId);
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/points");
  revalidatePath("/dashboard/referrals");
  revalidatePath("/dashboard/history");
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdmin();
  const language = await getCurrentLanguage();
  const admin = supabaseAdmin();
  const resolvedSearchParams = (await searchParams) ?? {};
  const sourceFilter = resolvedSearchParams.source === "referred" || resolvedSearchParams.source === "personal" ? resolvedSearchParams.source : "all";
  const buyerFilter = resolvedSearchParams.buyer ?? "";
  const referrerFilter = resolvedSearchParams.referrer ?? "";
  const statusFilter = ["all", "PAID", "REFUNDED"].includes(resolvedSearchParams.status ?? "") ? resolvedSearchParams.status ?? "all" : "all";
  const limit = Math.min(Math.max(Number(resolvedSearchParams.limit ?? "20"), 5), 100);

  const [{ data: users }, { data: allOrders }, { data: referralOrders }, { data: products }] = await Promise.all([
    admin.from("users_profile").select("id,name,referral_code,referred_by").order("created_at", { ascending: false }),
    admin
      .from("orders")
      .select("id,user_id,amount_total,cash_paid,points_redeemed,order_type,created_at,payment_status,product_id,quantity")
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("referral_orders")
      .select("id,order_id,commission_rate,commission_amount,referrer_id,referred_user_id,created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("products")
      .select("id,title,price_myr,stock_on_hand,track_inventory,allow_backorder")
      .order("created_at", { ascending: false })
  ]);

  const userMap = new Map(
    (users ?? []).map((user) => [
      user.id,
      {
        name: user.name ?? t(language, { zh: "会员", en: "Member" }),
        referralCode: user.referral_code
      }
    ])
  );

  const referralOrderMap = new Map((referralOrders ?? []).map((entry) => [entry.order_id, entry]));
  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const normalizedBuyerFilter = buyerFilter.trim().toLowerCase();
  const normalizedReferrerFilter = referrerFilter.trim().toLowerCase();

  const orders = (allOrders ?? []).filter((order) => {
    const buyer = userMap.get(order.user_id);
    const referralEntry = referralOrderMap.get(order.id);
    const referrer = referralEntry ? userMap.get(referralEntry.referrer_id) : null;
    const buyerMatches =
      !normalizedBuyerFilter ||
      buyer?.name.toLowerCase().includes(normalizedBuyerFilter) ||
      buyer?.referralCode.toLowerCase().includes(normalizedBuyerFilter);
    const referrerMatches =
      !normalizedReferrerFilter ||
      (!!referrer &&
        (referrer.name.toLowerCase().includes(normalizedReferrerFilter) ||
          referrer.referralCode.toLowerCase().includes(normalizedReferrerFilter)));
    const sourceMatches =
      sourceFilter === "all" ||
      (sourceFilter === "referred" && referralOrderMap.has(order.id)) ||
      (sourceFilter === "personal" && !referralOrderMap.has(order.id));
    const statusMatches = statusFilter === "all" || order.payment_status === statusFilter;

    return buyerMatches && referrerMatches && sourceMatches && statusMatches;
  });

  const filteredReferralOrders = (referralOrders ?? []).filter((entry) => {
    const buyer = userMap.get(entry.referred_user_id);
    const referrer = userMap.get(entry.referrer_id);
    const buyerMatches =
      !normalizedBuyerFilter ||
      buyer?.name.toLowerCase().includes(normalizedBuyerFilter) ||
      buyer?.referralCode.toLowerCase().includes(normalizedBuyerFilter);
    const referrerMatches =
      !normalizedReferrerFilter ||
      referrer?.name.toLowerCase().includes(normalizedReferrerFilter) ||
      referrer?.referralCode.toLowerCase().includes(normalizedReferrerFilter);

    return buyerMatches && referrerMatches;
  });

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">{t(language, { zh: "后台订单录入", en: "Admin order entry" })}</p>
          <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "创建已支付订单", en: "Create paid order" })}</h2>
          <p className="text-sm text-black/60">{t(language, { zh: "推荐订单的回馈比例，会使用这张订单写入前的上级层级。", en: "Referred orders credit commission using the referrer tier before this order updates cumulative sales." })}</p>
        </div>
        <AdminOrderForm users={users ?? []} products={products ?? []} language={language} />
      </div>

      <div className="card space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">{t(language, { zh: "后台筛选", en: "Admin filters" })}</p>
          <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "筛选记录", en: "Filter records" })}</h2>
        </div>
        <form className="grid gap-3 lg:grid-cols-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-black/65">{t(language, { zh: "来源", en: "Source" })}</span>
            <select name="source" defaultValue={sourceFilter} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3">
              <option value="all">{language === "en" ? "all" : "全部"}</option>
              <option value="referred">{language === "en" ? "referred" : "推荐订单"}</option>
              <option value="personal">{language === "en" ? "personal/direct" : "个人 / 直接订单"}</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-black/65">{t(language, { zh: "购买会员姓名或推荐码", en: "Buyer name or code" })}</span>
            <input name="buyer" defaultValue={buyerFilter} placeholder={language === "en" ? "ronnie / RONNIE" : "输入 ronnie / RONNIE"} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-black/65">{t(language, { zh: "上级姓名或推荐码", en: "Referrer name or code" })}</span>
            <input name="referrer" defaultValue={referrerFilter} placeholder={language === "en" ? "ronfatt / RONFAT" : "输入 ronfatt / RONFAT"} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-black/65">{t(language, { zh: "显示数量", en: "Limit" })}</span>
            <input type="number" name="limit" min="5" max="100" defaultValue={String(limit)} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-black/65">{t(language, { zh: "状态", en: "Status" })}</span>
            <select name="status" defaultValue={statusFilter} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3">
              <option value="all">{language === "en" ? "all" : "全部"}</option>
              <option value="PAID">{language === "en" ? "paid" : "已支付"}</option>
              <option value="REFUNDED">{language === "en" ? "refunded" : "已退款"}</option>
            </select>
          </label>
          <div className="flex items-end gap-3 lg:col-span-4">
            <button type="submit" className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white">
              {t(language, { zh: "应用筛选", en: "Apply filters" })}
            </button>
            <a href="/admin/orders" className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-[#123524]">
              {t(language, { zh: "清除", en: "Clear" })}
            </a>
          </div>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "最近订单", en: "Recent orders" })}</h2>
            <p className="text-sm text-black/55">{orders.length} {t(language, { zh: "条", en: "shown" })}</p>
          </div>
          {orders?.length ? (
            orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#123524]">
                      {userMap.get(order.user_id)?.name ?? t(language, { zh: "未知会员", en: "Unknown member" })} ({userMap.get(order.user_id)?.referralCode ?? order.user_id})
                    </p>
                    <p className="text-xs uppercase tracking-wide text-black/45">
                      {order.order_type} | {order.payment_status}
                    </p>
                    {order.order_type === "product" && order.product_id ? (
                      <p className="text-xs text-black/55">
                        {(productMap.get(order.product_id)?.title ?? t(language, { zh: "产品", en: "Product" }))} · {t(language, { zh: "数量", en: "Qty" })} {order.quantity ?? 1}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-[#123524]">{formatMoney(Number(order.amount_total))}</p>
                </div>
                <p className="mt-1 text-black/60">{t(language, { zh: "现金：", en: "Cash: " })}{formatMoney(Number(order.cash_paid))} | {t(language, { zh: "积分：", en: "Points: " })}{order.points_redeemed}</p>
                <p className="mt-1 text-black/55">
                  {t(language, { zh: "来源：", en: "Source: " })}
                  <span className="font-medium">
                    {referralOrderMap.has(order.id)
                      ? t(language, { zh: "推荐订单", en: "referred" })
                      : t(language, { zh: "个人 / 直接订单", en: "personal/direct" })}
                  </span>
                </p>
                {referralOrderMap.has(order.id) ? (
                  <p className="mt-1 text-black/55">
                    {t(language, { zh: "上级：", en: "Referrer: " })}
                    <span className="font-medium">
                      {userMap.get(referralOrderMap.get(order.id)!.referrer_id)?.name ?? t(language, { zh: "未知会员", en: "Unknown member" })} (
                      {userMap.get(referralOrderMap.get(order.id)!.referrer_id)?.referralCode ?? referralOrderMap.get(order.id)!.referrer_id})
                    </span>
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-black/45">{new Date(order.created_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}</p>
                  {order.payment_status === "PAID" ? (
                    <form action={reverseOrderAction}>
                      <input type="hidden" name="order_id" value={order.id} />
                      <button className="rounded-full border border-[#8c3a1f]/20 bg-[#fff5f1] px-4 py-2 text-xs font-semibold text-[#8c3a1f]">
                        {t(language, { zh: "冲正订单", en: "Reverse order" })}
                      </button>
                    </form>
                  ) : (
                    <span className="rounded-full border border-black/10 bg-[#f8f6f2] px-4 py-2 text-xs font-semibold text-black/55">
                      {t(language, { zh: "已退款", en: "Refunded" })}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有创建任何订单。", en: "No orders created yet." })}</p>
          )}
        </div>
        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "推荐回馈记录", en: "Referral commissions" })}</h2>
            <p className="text-sm text-black/55">{filteredReferralOrders.length} {t(language, { zh: "条", en: "shown" })}</p>
          </div>
          {filteredReferralOrders?.length ? (
            filteredReferralOrders.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#123524]">
                      {userMap.get(entry.referrer_id)?.name ?? t(language, { zh: "未知上级", en: "Unknown referrer" })} {"->"} {userMap.get(entry.referred_user_id)?.name ?? t(language, { zh: "未知买家", en: "Unknown buyer" })}
                    </p>
                    <p className="text-xs text-black/45">
                      {t(language, { zh: "上级 ", en: "Referrer " })}{userMap.get(entry.referrer_id)?.referralCode ?? entry.referrer_id} | {t(language, { zh: "买家 ", en: "Buyer " })}{userMap.get(entry.referred_user_id)?.referralCode ?? entry.referred_user_id}
                    </p>
                  </div>
                  <p className="text-[#123524]">{formatMoney(Number(entry.commission_amount))}</p>
                </div>
                <p className="mt-1 text-black/60">{t(language, { zh: "比例：", en: "Rate: " })}{formatPercent(Number(entry.commission_rate))} | {t(language, { zh: "订单：", en: "Order: " })}{entry.order_id}</p>
                <p className="mt-1 text-black/45">{new Date(entry.created_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有推荐订单记录。", en: "No referral orders yet." })}</p>
          )}
        </div>
      </div>
    </div>
  );
}
