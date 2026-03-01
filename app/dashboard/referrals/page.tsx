import DashboardShell from "../../../components/DashboardShell";
import { requireUser } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { formatMoney, formatPercent } from "../../../lib/metaenergy/helpers";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReferralDashboardPage() {
  const user = await requireUser();
  const language = getCurrentLanguage();
  const supabase = createClient();

  const [{ data: profile }, { data: referralOrders }] = await Promise.all([
    supabase
      .from("users_profile")
      .select("referral_code,tier_rate,total_referred_sales,total_commission_earned")
      .eq("id", user.id)
      .single(),
    supabase
      .from("referral_orders")
      .select("id,commission_rate,commission_amount,created_at,referred_user_id")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false })
  ]);

  const referredUserIds = Array.from(new Set((referralOrders ?? []).map((order) => order.referred_user_id)));
  const { data: referredProfiles } = referredUserIds.length
    ? await supabase.from("users_profile").select("id,name,referral_code").in("id", referredUserIds)
    : { data: [] as Array<{ id: string; name: string | null; referral_code: string }> };

  const referredProfileMap = new Map(
    (referredProfiles ?? []).map((profile) => [
      profile.id,
      {
        name: profile.name ?? t(language, { zh: "会员", en: "Member" }),
        referralCode: profile.referral_code
      }
    ])
  );

  const groupedMembers = Array.from(
    (referralOrders ?? []).reduce((acc, order) => {
      const current = acc.get(order.referred_user_id) ?? {
        referredUserId: order.referred_user_id,
        orderCount: 0,
        totalCommission: 0,
        lastOrderAt: order.created_at
      };

      current.orderCount += 1;
      current.totalCommission += Number(order.commission_amount ?? 0);
      if (new Date(order.created_at) > new Date(current.lastOrderAt)) {
        current.lastOrderAt = order.created_at;
      }

      acc.set(order.referred_user_id, current);
      return acc;
    }, new Map<string, { referredUserId: string; orderCount: number; totalCommission: number; lastOrderAt: string }>())
      .values()
  ).sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());

  return (
    <DashboardShell
      title={t(language, { zh: "引荐表现", en: "Referral performance" })}
      subtitle={t(language, { zh: "查看层级进度与被计入的推荐订单", en: "Tier progress and credited referred orders" })}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card">
          <p className="text-sm text-black/55">{t(language, { zh: "分享推荐码", en: "Share code" })}</p>
          <p className="font-display text-3xl text-[#123524]">{profile?.referral_code ?? "-"}</p>
        </div>
        <div className="card">
          <p className="text-sm text-black/55">{t(language, { zh: "当前层级", en: "Current tier" })}</p>
          <p className="font-display text-3xl text-[#123524]">{formatPercent(Number(profile?.tier_rate ?? 0))}</p>
        </div>
        <div className="card">
          <p className="text-sm text-black/55">{t(language, { zh: "推荐业绩", en: "Referred sales" })}</p>
          <p className="font-display text-3xl text-[#123524]">{formatMoney(Number(profile?.total_referred_sales ?? 0))}</p>
        </div>
      </div>
      <div className="card mt-4 space-y-4">
        <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "我的下线会员", en: "Referred members" })}</h2>
        {groupedMembers.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {groupedMembers.map((member) => (
              <div key={member.referredUserId} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <p className="font-medium text-[#123524]">
                  {referredProfileMap.get(member.referredUserId)?.name ?? t(language, { zh: "会员", en: "Member" })} ({referredProfileMap.get(member.referredUserId)?.referralCode ?? member.referredUserId})
                </p>
                <p className="mt-1 text-black/60">{t(language, { zh: "计入订单：", en: "Orders credited: " })}{member.orderCount}</p>
                <p className="mt-1 text-black/60">{t(language, { zh: "产生回馈：", en: "Commission generated: " })}{formatMoney(member.totalCommission)}</p>
                <p className="mt-1 text-black/45">{t(language, { zh: "最近一单：", en: "Last order: " })}{new Date(member.lastOrderAt).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有被计入的下线会员。", en: "No referred members credited yet." })}</p>
        )}
      </div>
      <div className="card mt-4 space-y-4">
        <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "推荐订单记录", en: "Referral order history" })}</h2>
        {referralOrders?.length ? (
          <div className="space-y-3">
            {referralOrders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">
                    {t(language, { zh: "下线会员：", en: "Referred member: " })}{referredProfileMap.get(order.referred_user_id)?.name ?? t(language, { zh: "会员", en: "Member" })} ({referredProfileMap.get(order.referred_user_id)?.referralCode ?? order.referred_user_id})
                  </p>
                  <p className="text-black/55">{new Date(order.created_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}</p>
                </div>
                <div className="text-right">
                  <p>{formatPercent(Number(order.commission_rate))}</p>
                  <p className="font-medium text-[#123524]">{formatMoney(Number(order.commission_amount))}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有被计入的推荐订单。", en: "No referred orders credited yet." })}</p>
        )}
      </div>
    </DashboardShell>
  );
}
