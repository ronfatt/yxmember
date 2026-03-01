import DashboardShell from "../../../components/DashboardShell";
import FrequencyGenerator from "../../../components/FrequencyGenerator";
import ReminderGenerator from "../../../components/ReminderGenerator";
import Link from "next/link";
import { requireUser } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import {
  localizeFrequencyReport,
  localizeWeeklyReminder,
  type FrequencyReport,
  type WeeklyReminder
} from "../../../lib/metaenergy/frequency";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FrequencyDashboardPage() {
  const user = await requireUser();
  const language = getCurrentLanguage();
  const supabase = createClient();

  const [{ data: profile }, { data: report }, { data: reminders }] = await Promise.all([
    supabase.from("users_profile").select("birthday").eq("id", user.id).single(),
    supabase
      .from("frequency_reports")
      .select("report_json,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("weekly_reminders")
      .select("id,week_start,content")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(8)
  ]);

  const rawFrequency = report?.report_json as FrequencyReport | undefined;
  const frequency = localizeFrequencyReport(rawFrequency, language);

  return (
    <DashboardShell title={t(language, { zh: "频率工具", en: "Frequency tools" })} subtitle={t(language, { zh: "生日报告与每周提醒", en: "Birthday-based report and weekly guidance" })}>
      <div className="grid gap-4 lg:grid-cols-[1.15fr,1fr]">
        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-black/55">{t(language, { zh: "最新报告", en: "Latest report" })}</p>
              <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "频率档案", en: "Frequency profile" })}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {frequency ? (
                <Link
                  href="/dashboard/frequency/print"
                  className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-[#123524]"
                >
                  {t(language, { zh: "打印版", en: "Print view" })}
                </Link>
              ) : null}
              <FrequencyGenerator birthday={profile?.birthday ?? null} language={language} />
            </div>
          </div>
          <p className="text-sm text-black/70">{frequency?.summary ?? t(language, { zh: "先生成一份报告，这里才会出现内容。", en: "Generate a report to populate this card." })}</p>
          {frequency ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="text-black/50">{t(language, { zh: "生命路径", en: "Life path" })}</p>
                  <p className="mt-1 font-display text-2xl text-[#123524]">{frequency.lifePath}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="text-black/50">{t(language, { zh: "当下重点", en: "Focus" })}</p>
                  <p className="mt-1 font-display text-2xl text-[#123524]">{frequency.focus}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="text-black/50">{t(language, { zh: "年度能量", en: "Year energy" })}</p>
                  <p className="mt-1 font-display text-2xl text-[#123524]">{frequency.yearEnergy}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-jade/10 bg-jade/5 px-4 py-3 text-sm text-[#123524]">
                <p className="text-xs uppercase tracking-[0.2em]">{t(language, { zh: "核心句", en: "Mantra" })}</p>
                <p className="mt-1 font-medium">{frequency.mantra}</p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-black/70">{t(language, { zh: "主题", en: "Themes" })}</p>
                  <p className="mt-1 text-black/60">{frequency.themes.join(", ")}.</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-black/70">{t(language, { zh: "优势", en: "Strengths" })}</p>
                  <p className="mt-1 text-black/60">{frequency.strengths.join(", ")}.</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-black/70">{t(language, { zh: "留意事项", en: "Watchouts" })}</p>
                  <p className="mt-1 text-black/60">{frequency.watchouts.join(", ")}.</p>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                    <p className="font-medium text-black/70">{t(language, { zh: "工作", en: "Work" })}</p>
                    <p className="mt-1 text-black/60">{frequency.guidance.work}</p>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                    <p className="font-medium text-black/70">{t(language, { zh: "关系", en: "Relationships" })}</p>
                    <p className="mt-1 text-black/60">{frequency.guidance.relationships}</p>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                    <p className="font-medium text-black/70">{t(language, { zh: "身心状态", en: "Wellbeing" })}</p>
                    <p className="mt-1 text-black/60">{frequency.guidance.wellbeing}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-black/70">{t(language, { zh: "行动计划", en: "Action plan" })}</p>
                  <ul className="mt-2 space-y-1 text-black/60">
                    {frequency.actionPlan.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </div>
        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-black/55">{t(language, { zh: "每周提醒", en: "Weekly reminders" })}</p>
              <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "生成器", en: "Generator" })}</h2>
            </div>
            <ReminderGenerator language={language} />
          </div>
          {reminders?.length ? (
            reminders.map((entry) => {
              const parsed = (() => {
                try {
                  return localizeWeeklyReminder(JSON.parse(entry.content) as WeeklyReminder, language, rawFrequency);
                } catch {
                  return null;
                }
              })();

              return (
                <div key={entry.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70">
                  <p className="font-medium text-[#123524]">{entry.week_start}</p>
                  {parsed ? (
                    <>
                      <p className="mt-2 font-medium">{parsed.headline}</p>
                      <p className="mt-1">{parsed.focusTheme}</p>
                      <ul className="mt-2 space-y-1">
                        {parsed.priorityList.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                      <p className="mt-2 text-black/60">{t(language, { zh: "边界提醒：", en: "Boundary: " })}{parsed.boundaryNote}</p>
                      <p className="mt-1 text-black/60">{t(language, { zh: "反思问题：", en: "Reflection: " })}{parsed.reflectionPrompt}</p>
                    </>
                  ) : (
                    <p className="mt-1">{entry.content}</p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有保存的提醒。", en: "No reminders stored yet." })}</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
