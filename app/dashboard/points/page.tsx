import DashboardShell from "../../../components/DashboardShell";
import RedeemSimulator from "../../../components/RedeemSimulator";
import { requireUser } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { formatMoney } from "../../../lib/metaenergy/helpers";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PointsDashboardPage() {
  const user = await requireUser();
  const language = await getCurrentLanguage();
  const supabase = await createClient();

  const [{ data: profile }, { data: ledger }] = await Promise.all([
    supabase.from("users_profile").select("points_balance").eq("id", user.id).single(),
    supabase
      .from("points_ledger")
      .select("id,points,action,note,order_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  return (
    <DashboardShell title={t(language, { zh: "积分钱包", en: "Points wallet" })} subtitle={t(language, { zh: "查看余额、记录与抵扣模拟", en: "Balance, history, and redemption cap simulator" })}>
      <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <div className="card space-y-3">
          <p className="text-sm text-black/55">{t(language, { zh: "积分余额", en: "Points balance" })}</p>
          <p className="font-display text-4xl text-[#123524]">{Number(profile?.points_balance ?? 0)} {language === "en" ? "pts" : "积分"}</p>
          <p className="text-sm text-black/65">{t(language, { zh: "1 积分 = RM0.10。单笔订单最多只能抵扣 50%。", en: "1 point = RM0.10. Any redemption is capped at 50% of the order total." })}</p>
          <RedeemSimulator pointsBalance={Number(profile?.points_balance ?? 0)} language={language} />
        </div>
        <div className="card space-y-3">
          <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "最近积分记录", en: "Recent ledger" })}</h2>
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
            <p className="text-sm text-black/60">{t(language, { zh: "还没有积分变动记录。", en: "No point activity yet." })}</p>
          )}
        </div>
      </div>
      <div className="card mt-4">
        <p className="text-sm text-black/60">
          {t(language, { zh: "例如：一张", en: "Example rule: an order worth " })}{formatMoney(100)}
          {t(language, { zh: " 的订单，最多只能用 ", en: " can use at most " })}{formatMoney(50)}
          {t(language, { zh: " 积分抵扣，因此仍需现金支付 ", en: " in points, so the member must still pay " })}{formatMoney(50)}
          {language === "en" ? " cash." : "。"}
        </p>
      </div>
    </DashboardShell>
  );
}
