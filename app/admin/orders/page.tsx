import AdminOrderForm from "../../../components/AdminOrderForm";
import { requireAdmin } from "../../../lib/actions/session";
import { formatMoney, formatPercent } from "../../../lib/metaenergy/helpers";
import { supabaseAdmin } from "../../../lib/supabase/admin";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const admin = supabaseAdmin();

  const [{ data: users }, { data: orders }, { data: referralOrders }] = await Promise.all([
    admin.from("users_profile").select("id,name,referral_code").order("created_at", { ascending: false }),
    admin
      .from("orders")
      .select("id,user_id,amount_total,cash_paid,points_redeemed,order_type,created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("referral_orders")
      .select("id,order_id,commission_rate,commission_amount,referrer_id,referred_user_id,created_at")
      .order("created_at", { ascending: false })
      .limit(20)
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <h2 className="font-display text-3xl text-[#123524]">Recent orders</h2>
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
          <h2 className="font-display text-3xl text-[#123524]">Referral commissions</h2>
          {referralOrders?.length ? (
            referralOrders.map((entry) => (
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
