import { format, startOfMonth, startOfWeek } from "date-fns";
import Link from "next/link";
import { headers } from "next/headers";
import DashboardShell from "../../components/DashboardShell";
import FrequencyGenerator from "../../components/FrequencyGenerator";
import ReminderGenerator from "../../components/ReminderGenerator";
import { requireUser } from "../../lib/actions/session";
import { buildKeepAliveLabel, buildPointsHint, buildSpendSummary, buildTierHint } from "../../lib/metaenergy/dashboard";
import {
  localizeFrequencyReport,
  localizeWeeklyReminder,
  type FrequencyReport,
  type WeeklyReminder
} from "../../lib/metaenergy/frequency";
import { formatMoney, formatPercent } from "../../lib/metaenergy/helpers";
import { getCurrentLanguage } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/shared";
import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

function MetricCard({
  title,
  value,
  caption
}: {
  title: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="card space-y-2">
      <p className="text-sm text-black/55">{title}</p>
      <p className="font-display text-3xl text-[#123524]">{value}</p>
      <p className="text-sm text-black/65">{caption}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const language = getCurrentLanguage();
  const supabase = createClient();
  const requestHeaders = await headers();
  const monthKey = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const requestSiteUrl = host ? `${forwardedProto ?? "https"}://${host}` : null;
  const siteUrl = (
    requestSiteUrl
    ?? process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.NODE_ENV === "production" ? "https://yxenergy.my" : "http://localhost:3000")
  ).replace(/\/$/, "");

  const [{ data: profile }, { data: currentMonth }, { data: latestReport }, { data: latestReminder }, { count: mentorServiceCount }] =
    await Promise.all([
      supabase
        .from("users_profile")
        .select("id,name,birthday,referral_code,tier_rate,total_referred_sales,total_commission_earned,points_balance,months_under_50")
        .eq("id", user.id)
        .single(),
      supabase
        .from("monthly_stats")
        .select("personal_cash_total")
        .eq("user_id", user.id)
        .eq("month", monthKey)
        .maybeSingle(),
      supabase
        .from("frequency_reports")
        .select("report_json,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("weekly_reminders")
        .select("content")
        .eq("user_id", user.id)
        .eq("week_start", weekKey)
        .maybeSingle(),
      supabase
        .from("mentor_services")
        .select("id", { count: "exact", head: true })
        .eq("active", true)
    ]);

  const rawFrequency = latestReport?.report_json as FrequencyReport | undefined;
  const frequency = localizeFrequencyReport(rawFrequency, language);
  const weeklyReminder = latestReminder?.content
    ? (() => {
        try {
          return localizeWeeklyReminder(JSON.parse(latestReminder.content) as WeeklyReminder, language, rawFrequency);
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <DashboardShell
      title={t(language, { zh: profile?.name ? `欢迎，${profile.name}` : "欢迎回来", en: `Welcome${profile?.name ? `, ${profile.name}` : ""}` })}
      subtitle={t(language, { zh: "引荐、积分与频率总览", en: "Referral + points overview" })}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard
          title={t(language, { zh: "推荐码", en: "Referral code" })}
          value={profile?.referral_code ?? "-"}
          caption={`${siteUrl}/r/${profile?.referral_code ?? ""}`}
        />
        <MetricCard
          title={t(language, { zh: "当前层级", en: "Current tier" })}
          value={formatPercent(Number(profile?.tier_rate ?? 0))}
          caption={buildTierHint(language)}
        />
        <MetricCard
          title={t(language, { zh: "累计推荐业绩", en: "Total referred sales" })}
          value={formatMoney(Number(profile?.total_referred_sales ?? 0))}
          caption={t(language, { zh: "重置后重新累计", en: "Post-reset cumulative total" })}
        />
        <MetricCard
          title={t(language, { zh: "已获得回馈", en: "Commission earned" })}
          value={formatMoney(Number(profile?.total_commission_earned ?? 0))}
          caption={t(language, { zh: "系统累计记录", en: "Stored running total" })}
        />
        <MetricCard
          title={t(language, { zh: "本月个人消费", en: "Personal spend this month" })}
          value={formatMoney(Number(currentMonth?.personal_cash_total ?? 0))}
          caption={buildSpendSummary(Number(currentMonth?.personal_cash_total ?? 0), language)}
        />
        <MetricCard
          title={t(language, { zh: "活跃维持状态", en: "Keep-alive status" })}
          value={language === "en" ? `${Number(profile?.months_under_50 ?? 0)} strike` : `${Number(profile?.months_under_50 ?? 0)} 次提醒`}
          caption={buildKeepAliveLabel(Number(profile?.months_under_50 ?? 0), language)}
        />
        <MetricCard
          title={t(language, { zh: "积分余额", en: "Points balance" })}
          value={`${Number(profile?.points_balance ?? 0)} ${language === "en" ? "pts" : "积分"}`}
          caption={buildPointsHint(language)}
        />
        <div className="card flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-black/55">{t(language, { zh: "课程与活动", en: "Programs" })}</p>
            <p className="font-display text-3xl text-[#123524]">{t(language, { zh: "查看开放报名", en: "Open reservations" })}</p>
            <p className="text-sm text-black/65">
              {t(language, {
                zh: "浏览课程与活动，免费场次可直接确认，收费场次可先报名并上传银行转账单据。",
                en: "Browse programs and events. Free sessions confirm instantly, while paid sessions can be reserved and completed by bank transfer."
              })}
            </p>
          </div>
          <div>
            <Link
              href="/dashboard/programs"
              className="inline-flex rounded-full bg-[linear-gradient(135deg,#c8a55c,#e6c88f)] px-4 py-2 text-sm font-semibold text-[#123524] shadow-[0_16px_28px_rgba(200,165,92,0.2)]"
            >
              {t(language, { zh: "进入课程活动", en: "View programs" })}
            </Link>
          </div>
        </div>
        <div className="card flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-black/55">{t(language, { zh: "导师会谈", en: "Guidance sessions" })}</p>
            <p className="font-display text-3xl text-[#123524]">{t(language, { zh: "预约导师", en: "Book a mentor" })}</p>
            <p className="text-sm text-black/65">
              {mentorServiceCount
                ? t(language, {
                    zh: "进入导师页，选择会谈服务、时间与会谈意图。",
                    en: "Choose a mentor, service, time slot, and intake in one flow."
                  })
                : t(language, {
                    zh: "导师资料已开放，服务时段正在整理中。",
                    en: "Mentor profiles are available, while bookable services are still being prepared."
                  })}
            </p>
          </div>
          <div>
            <Link
              href="/mentors"
              className="inline-flex rounded-full bg-[linear-gradient(135deg,#c8a55c,#e6c88f)] px-4 py-2 text-sm font-semibold text-[#123524] shadow-[0_16px_28px_rgba(200,165,92,0.2)]"
            >
              {mentorServiceCount
                ? t(language, { zh: "前往导师页", en: "Browse mentors" })
                : t(language, { zh: "查看导师", en: "View mentors" })}
            </Link>
          </div>
        </div>
        <div className="card space-y-4 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-black/55">{t(language, { zh: "频率报告", en: "Frequency report" })}</p>
              <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "摘要", en: "Summary" })}</h2>
            </div>
            <FrequencyGenerator birthday={profile?.birthday ?? null} language={language} />
          </div>
          <p className="text-sm text-black/70">{frequency?.summary ?? t(language, { zh: "尚未生成报告。", en: "No report generated yet." })}</p>
          {frequency?.mantra ? <p className="text-sm text-black/60">{t(language, { zh: "核心句：", en: "Mantra: " })}{frequency.mantra}</p> : null}
          {frequency?.actionPlan?.length ? (
            <p className="text-sm text-black/60">{t(language, { zh: "行动建议：", en: "Action plan: " })}{frequency.actionPlan.slice(0, 2).join(" | ")}.</p>
          ) : null}
          {frequency?.watchouts?.length ? (
            <p className="text-sm text-black/60">{t(language, { zh: "留意事项：", en: "Watchouts: " })}{frequency.watchouts.slice(0, 2).join(", ")}.</p>
          ) : null}
        </div>
        <div className="card space-y-4 lg:col-span-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-black/55">{t(language, { zh: "本周提醒", en: "Weekly reminder" })}</p>
              <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "本周", en: "This week" })}</h2>
            </div>
            <ReminderGenerator language={language} />
          </div>
          {weeklyReminder ? (
            <div className="grid gap-3 lg:grid-cols-[1.2fr,1fr]">
              <div>
                <p className="text-sm font-medium text-[#123524]">{weeklyReminder.headline}</p>
                <p className="mt-1 text-sm text-black/70">{weeklyReminder.focusTheme}</p>
              </div>
              <div className="text-sm text-black/60">
                <p>{t(language, { zh: "优先事项：", en: "Priorities: " })}{weeklyReminder.priorityList.join(" | ")}</p>
                <p className="mt-1">{t(language, { zh: "边界提醒：", en: "Boundary: " })}{weeklyReminder.boundaryNote}</p>
                <p className="mt-1">{t(language, { zh: "反思问题：", en: "Reflection: " })}{weeklyReminder.reflectionPrompt}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-black/70">{latestReminder?.content ?? t(language, { zh: "本周尚未生成提醒。", en: "No reminder generated for this week yet." })}</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
