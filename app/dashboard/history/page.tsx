import DashboardShell from "../../../components/DashboardShell";
import { requireUser } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { formatMoney } from "../../../lib/metaenergy/helpers";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardHistoryPage() {
  const user = await requireUser();
  const language = getCurrentLanguage();
  const supabase = createClient();

  const [{ data: orders }, { data: ledger }] = await Promise.all([
    supabase
      .from("orders")
      .select("id,amount_total,cash_paid,points_redeemed,order_type,payment_status,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("points_ledger")
      .select("id,points,action,note,order_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
  ]);

  return (
    <DashboardShell title={t(language, { zh: "历史记录", en: "History" })} subtitle={t(language, { zh: "订单时间线与积分记录", en: "Order timeline and points ledger" })}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "订单记录", en: "Orders" })}</h2>
            <p className="text-sm text-black/55">{orders?.length ?? 0} {t(language, { zh: "条", en: "shown" })}</p>
          </div>
          {orders?.length ? (
            orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#123524]">{order.order_type}</p>
                    <p className="text-xs uppercase tracking-wide text-black/45">{order.payment_status}</p>
                  </div>
                  <p className="text-[#123524]">{formatMoney(Number(order.amount_total))}</p>
                </div>
                <p className="mt-1 text-black/60">{t(language, { zh: "现金：", en: "Cash: " })}{formatMoney(Number(order.cash_paid))} | {t(language, { zh: "使用积分：", en: "Points used: " })}{order.points_redeemed}</p>
                <p className="mt-1 break-all text-black/45">{t(language, { zh: "订单编号：", en: "Order ID: " })}{order.id}</p>
                <p className="mt-1 text-black/45">{new Date(order.created_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有订单记录。", en: "No order history yet." })}</p>
          )}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "积分记录", en: "Points ledger" })}</h2>
            <p className="text-sm text-black/55">{ledger?.length ?? 0} {t(language, { zh: "条", en: "shown" })}</p>
          </div>
          {ledger?.length ? (
            ledger.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium uppercase tracking-wide text-black/70">{entry.action}</p>
                  <p className={entry.points >= 0 ? "text-jade" : "text-[#8c3a1f]"}>{entry.points} {language === "en" ? "pts" : "积分"}</p>
                </div>
                <p className="mt-1 text-black/60">{entry.note ?? t(language, { zh: "没有备注", en: "No note" })}.</p>
                {entry.order_id ? <p className="mt-1 break-all text-black/45">{t(language, { zh: "订单编号：", en: "Order ID: " })}{entry.order_id}</p> : null}
                <p className="mt-1 text-black/45">{new Date(entry.created_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有积分历史。", en: "No points history yet." })}</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
