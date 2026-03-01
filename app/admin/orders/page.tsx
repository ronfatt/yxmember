import AdminOrderForm from "../../../components/AdminOrderForm";
import { requireAdmin } from "../../../lib/actions/session";
import { formatMoney, formatPercent } from "../../../lib/metaenergy/helpers";
import { supabaseAdmin } from "../../../lib/supabase/admin";

type AdminOrdersPageProps = {
  searchParams?: {
    source?: string;
    buyer?: string;
    referrer?: string;
    limit?: string;
  };
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdmin();
  const admin = supabaseAdmin();
  const sourceFilter = searchParams?.source === "referred" || searchParams?.source === "personal" ? searchParams.source : "all";
  const buyerFilter = searchParams?.buyer ?? "";
  const referrerFilter = searchParams?.referrer ?? "";
  const limit = Math.min(Math.max(Number(searchParams?.limit ?? "20"), 5), 100);

  const [{ data: users }, { data: allOrders }, { data: referralOrders }] = await Promise.all([
    admin.from("users_profile").select("id,name,referral_code,referred_by").order("created_at", { ascending: false }),
    admin
      .from("orders")
      .select("id,user_id,amount_total,cash_paid,points_redeemed,order_type,created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("referral_orders")
      .select("id,order_id,commission_rate,commission_amount,referrer_id,referred_user_id,created_at")
      .order("created_at", { ascending: false })
      .limit(limit)
  ]);

  const userMap = new Map(
    (users ?? []).map((user) => [
      user.id,
      {
        name: user.name ?? "Member",
        referralCode: user.referral_code
      }
    ])
  );

  const referralOrderMap = new Map((referralOrders ?? []).map((entry) => [entry.order_id, entry]));
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

    return buyerMatches && referrerMatches && sourceMatches;
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">Admin order entry</p>
          <h2 className="font-display text-3xl text-[#123524]">Create paid order</h2>
          <p className="text-sm text-black/60">Referred orders credit commission using the referrer tier before this order updates cumulative sales.</p>
        </div>
        <AdminOrderForm users={users ?? []} />
      </div>

      <div className="card space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">Admin filters</p>
          <h2 className="font-display text-3xl text-[#123524]">Filter records</h2>
        </div>
        <form className="grid gap-3 lg:grid-cols-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-black/65">Source</span>
            <select name="source" defaultValue={sourceFilter} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3">
              <option value="all">all</option>
              <option value="referred">referred</option>
              <option value="personal">personal/direct</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-black/65">Buyer name or code</span>
            <input
              name="buyer"
              defaultValue={buyerFilter}
              placeholder="ronnie / RONNIE"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-black/65">Referrer name or code</span>
            <input
              name="referrer"
              defaultValue={referrerFilter}
              placeholder="ronfatt / RONFAT"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-black/65">Limit</span>
            <input
              type="number"
              name="limit"
              min="5"
              max="100"
              defaultValue={String(limit)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            />
          </label>
          <div className="flex items-end gap-3 lg:col-span-4">
            <button type="submit" className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white">
              Apply filters
            </button>
            <a href="/admin/orders" className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-[#123524]">
              Clear
            </a>
          </div>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[#123524]">Recent orders</h2>
            <p className="text-sm text-black/55">{orders.length} shown</p>
          </div>
          {orders?.length ? (
            orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#123524]">
                      {userMap.get(order.user_id)?.name ?? "Unknown member"} ({userMap.get(order.user_id)?.referralCode ?? order.user_id})
                    </p>
                    <p className="text-xs uppercase tracking-wide text-black/45">{order.order_type}</p>
                  </div>
                  <p className="text-[#123524]">{formatMoney(Number(order.amount_total))}</p>
                </div>
                <p className="mt-1 text-black/60">Cash: {formatMoney(Number(order.cash_paid))} | Points: {order.points_redeemed}</p>
                <p className="mt-1 text-black/55">
                  Source:{" "}
                  <span className="font-medium">
                    {referralOrderMap.has(order.id) ? "referred" : "personal/direct"}
                  </span>
                </p>
                {referralOrderMap.has(order.id) ? (
                  <p className="mt-1 text-black/55">
                    Referrer:{" "}
                    <span className="font-medium">
                      {userMap.get(referralOrderMap.get(order.id)!.referrer_id)?.name ?? "Unknown member"} (
                      {userMap.get(referralOrderMap.get(order.id)!.referrer_id)?.referralCode ?? referralOrderMap.get(order.id)!.referrer_id})
                    </span>
                  </p>
                ) : null}
                <p className="mt-1 text-black/45">{new Date(order.created_at).toLocaleString("en-MY")}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">No orders created yet.</p>
          )}
        </div>
        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[#123524]">Referral commissions</h2>
            <p className="text-sm text-black/55">{filteredReferralOrders.length} shown</p>
          </div>
          {filteredReferralOrders?.length ? (
            filteredReferralOrders.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#123524]">
                      {userMap.get(entry.referrer_id)?.name ?? "Unknown referrer"} {"->"} {userMap.get(entry.referred_user_id)?.name ?? "Unknown buyer"}
                    </p>
                    <p className="text-xs text-black/45">
                      Referrer {userMap.get(entry.referrer_id)?.referralCode ?? entry.referrer_id} | Buyer {userMap.get(entry.referred_user_id)?.referralCode ?? entry.referred_user_id}
                    </p>
                  </div>
                  <p className="text-[#123524]">{formatMoney(Number(entry.commission_amount))}</p>
                </div>
                <p className="mt-1 text-black/60">Rate: {formatPercent(Number(entry.commission_rate))} | Order: {entry.order_id}</p>
                <p className="mt-1 text-black/45">{new Date(entry.created_at).toLocaleString("en-MY")}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">No referral orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
