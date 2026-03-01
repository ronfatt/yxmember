import Link from "next/link";
import { format, startOfWeek } from "date-fns";
import DashboardShell from "../../../components/DashboardShell";
import FrequencyCommitmentCard from "../../../components/FrequencyCommitmentCard";
import FrequencyGenerator from "../../../components/FrequencyGenerator";
import FrequencyJournalCard from "../../../components/FrequencyJournalCard";
import ReminderGenerator from "../../../components/ReminderGenerator";
import { requireUser } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import {
  localizeFrequencyReport,
  localizeWeeklyReminder,
  type FrequencyReport,
  type WeeklyReminder
} from "../../../lib/metaenergy/frequency";
import { normalizeBirthday } from "../../../lib/metaenergy/birthday";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

function parseReminder(content: string, language: "zh" | "en", report?: FrequencyReport) {
  try {
    return localizeWeeklyReminder(JSON.parse(content) as WeeklyReminder, language, report);
  } catch {
    return null;
  }
}

export default async function FrequencyDashboardPage() {
  const user = await requireUser();
  const language = getCurrentLanguage();
  const supabase = createClient();
  const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const [{ data: profile }, { data: reports }, { data: reminders }, { data: commitment }, { data: journal }] = await Promise.all([
    supabase.from("users_profile").select("birthday").eq("id", user.id).single(),
    supabase
      .from("frequency_reports")
      .select("id,report_json,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("weekly_reminders")
      .select("id,week_start,content")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(8),
    supabase
      .from("frequency_commitments")
      .select("commitment_text")
      .eq("user_id", user.id)
      .eq("week_start", weekKey)
      .maybeSingle(),
    supabase
      .from("frequency_journal_entries")
      .select("response_text")
      .eq("user_id", user.id)
      .eq("week_start", weekKey)
      .maybeSingle()
  ]);

  const latestRaw = reports?.[0]?.report_json as FrequencyReport | undefined;
  const frequency = localizeFrequencyReport(latestRaw, language);
  const localizedReminders = (reminders ?? [])
    .map((entry) => ({
      id: entry.id,
      weekStart: entry.week_start,
      reminder: parseReminder(entry.content, language, latestRaw)
    }))
    .filter((entry): entry is { id: string; weekStart: string; reminder: WeeklyReminder } => !!entry.reminder);

  const latestReminder = localizedReminders[0]?.reminder ?? null;
  const reportsTimeline = (reports ?? []).map((entry) => ({
    id: entry.id,
    createdAt: entry.created_at,
    report: localizeFrequencyReport(entry.report_json as FrequencyReport, language)
  }));

  return (
    <DashboardShell
      title={t(language, { zh: "今日节奏", en: "Today's rhythm" })}
      subtitle={t(language, { zh: "你的当前能量正在流动。", en: "Your current energy is already in motion." })}
    >
      <div className="space-y-10">
        <section className="space-y-6 text-center">
          <div className="space-y-3">
            <p className="text-sm tracking-[0.28em] text-[#8d7240]">
              {normalizeBirthday(frequency?.birthday ?? profile?.birthday ?? "").replaceAll("-", " · ") || "—"}
            </p>
            <div className="mx-auto h-px w-24 bg-[linear-gradient(135deg,#c8a55c,#e6c88f)]" />
            <p className="text-sm text-black/60">
              {t(language, { zh: "生命路径", en: "Path" })} {frequency?.lifePath ?? "-"} ｜ {t(language, { zh: "当前焦点", en: "Focus" })} {frequency?.focus ?? "-"} ｜ {t(language, { zh: "年度能量", en: "Year" })} {frequency?.yearEnergy ?? "-"}
            </p>
          </div>

          <div className="mx-auto max-w-4xl rounded-[40px] bg-[radial-gradient(circle_at_top,rgba(230,200,143,0.18),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,241,232,0.94))] px-8 py-14 shadow-[0_24px_60px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8d7240]">
              {t(language, { zh: "核心句", en: "Core sentence" })}
            </p>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-tight text-[#123524] drop-shadow-[0_6px_18px_rgba(200,165,92,0.12)] md:text-6xl">
              {frequency?.mantra ?? t(language, { zh: "先生成一份频率档案。", en: "Generate your frequency profile first." })}
            </h2>
            <div className="mx-auto mt-6 h-px w-40 bg-[linear-gradient(135deg,#c8a55c,#e6c88f)]" />
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-black/65">
              {frequency?.summary ?? t(language, { zh: "这里会出现你的当前节奏摘要。", en: "Your current rhythm summary will appear here." })}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {frequency ? (
                <Link
                  href="/dashboard/frequency/print"
                  className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#123524]"
                >
                  {t(language, { zh: "查看打印版", en: "Open print view" })}
                </Link>
              ) : null}
              <FrequencyGenerator birthday={profile?.birthday ?? null} language={language} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { key: "Path", labelZh: "Path", value: frequency?.lifePath ?? "-", helperZh: "生命路径" },
                { key: "Focus", labelZh: "Focus", value: frequency?.focus ?? "-", helperZh: "当前焦点" },
                { key: "Year", labelZh: "Year", value: frequency?.yearEnergy ?? "-", helperZh: "年度能量" }
              ].map((item) => (
                <div key={item.key} className="flex flex-col items-center justify-center gap-3 rounded-[34px] bg-white px-6 py-8 text-center shadow-[0_22px_50px_rgba(0,0,0,0.04)]">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-[#e6d6b2] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),rgba(246,241,232,0.75))] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    <span className="font-display text-5xl text-[#123524]">{item.value}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.28em] text-[#8d7240]">{item.key}</p>
                    <p className="text-sm text-black/50">{item.helperZh}</p>
                  </div>
                </div>
              ))}
            </div>

            {frequency ? (
              <div className="space-y-4">
                {[
                  { title: t(language, { zh: "主题", en: "Theme" }), items: frequency.themes },
                  { title: t(language, { zh: "优势", en: "Strengths" }), items: frequency.strengths },
                  { title: t(language, { zh: "注意", en: "Watchouts" }), items: frequency.watchouts }
                ].map((section) => (
                  <details key={section.title} className="rounded-[28px] bg-white px-6 py-5 shadow-[0_18px_36px_rgba(0,0,0,0.04)]">
                    <summary className="cursor-pointer list-none text-xl font-medium text-[#123524]">
                      {section.title}
                    </summary>
                    <div className="mt-4 space-y-2 text-base leading-8 text-black/65">
                      {section.items.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : null}

            {frequency ? (
              <FrequencyCommitmentCard
                language={language}
                commitmentText={frequency.actionPlan[0] ?? ""}
                existingCommitment={commitment?.commitment_text ?? null}
              />
            ) : null}

            {frequency ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_36px_rgba(0,0,0,0.04)]">
                  <p className="text-sm font-medium text-[#123524]">{t(language, { zh: "工作", en: "Work" })}</p>
                  <p className="mt-3 text-sm leading-7 text-black/65">{frequency.guidance.work}</p>
                </div>
                <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_36px_rgba(0,0,0,0.04)]">
                  <p className="text-sm font-medium text-[#123524]">{t(language, { zh: "关系", en: "Relationships" })}</p>
                  <p className="mt-3 text-sm leading-7 text-black/65">{frequency.guidance.relationships}</p>
                </div>
                <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_36px_rgba(0,0,0,0.04)]">
                  <p className="text-sm font-medium text-[#123524]">{t(language, { zh: "身心状态", en: "Wellbeing" })}</p>
                  <p className="mt-3 text-sm leading-7 text-black/65">{frequency.guidance.wellbeing}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-[34px] bg-white p-8 shadow-[0_24px_56px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8d7240]">
                    {t(language, { zh: "本周指引", en: "Weekly guidance" })}
                  </p>
                  <h3 className="mt-3 font-display text-4xl text-[#123524]">
                    {latestReminder?.headline ?? t(language, { zh: "先生成本周提醒", en: "Generate this week's guidance" })}
                  </h3>
                </div>
                <ReminderGenerator language={language} />
              </div>

              {latestReminder ? (
                <div className="mt-6 space-y-5 text-black/68">
                  <p className="text-base leading-8">{latestReminder.focusTheme}</p>
                  <div className="space-y-3">
                    {latestReminder.priorityList.slice(0, 3).map((item) => (
                      <div key={item} className="rounded-2xl bg-[#faf6ee] px-4 py-3 text-sm leading-7">
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-[#faf6ee] px-4 py-4 text-sm leading-7">
                    <p className="font-medium text-[#123524]">{t(language, { zh: "反思问题", en: "Reflection" })}</p>
                    <p className="mt-2">{latestReminder.reflectionPrompt}</p>
                  </div>
                  <FrequencyJournalCard language={language} initialValue={journal?.response_text ?? ""} />
                </div>
              ) : (
                <p className="mt-6 text-sm text-black/60">
                  {t(language, { zh: "这周的提醒还没有生成。生成后，这里会出现更安静、更具体的行动线索。", en: "No weekly guidance has been generated yet." })}
                </p>
              )}
            </div>

            <div className="rounded-[34px] bg-white p-8 shadow-[0_24px_56px_rgba(0,0,0,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8d7240]">
                {t(language, { zh: "你的能量轨迹", en: "Your rhythm timeline" })}
              </p>
              <div className="mt-5 space-y-3">
                {reportsTimeline.length ? (
                  reportsTimeline.map((entry) => (
                    <details key={entry.id} className="rounded-2xl bg-[#faf6ee] px-4 py-4">
                      <summary className="cursor-pointer list-none text-sm font-medium text-[#123524]">
                        {format(new Date(entry.createdAt), "yyyy-MM-dd")}
                      </summary>
                      {entry.report ? (
                        <div className="mt-3 space-y-2 text-sm leading-7 text-black/65">
                          <p>{entry.report.summary}</p>
                          <p>{t(language, { zh: "核心句：", en: "Mantra: " })}{entry.report.mantra}</p>
                        </div>
                      ) : null}
                    </details>
                  ))
                ) : (
                  <p className="text-sm text-black/60">
                    {t(language, { zh: "这里会留下你每一次生成的节奏记录。", en: "Your previous reports will appear here." })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[40px] bg-[linear-gradient(135deg,rgba(200,165,92,0.14),rgba(255,255,255,0.9))] px-8 py-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.04)]">
          <p className="text-sm leading-8 text-black/62">
            {t(language, {
              zh: "如果你想更深入理解这份节奏，可以把它带进一场更安静的对话里。",
              en: "If you want to go deeper with this rhythm, carry it into a quieter one-on-one conversation."
            })}
          </p>
          <Link
            href="/mentors"
            className="mt-5 inline-flex rounded-full bg-jade px-5 py-3 text-sm font-semibold text-white"
          >
            {t(language, { zh: "预约导师会谈", en: "Book a mentor session" })}
          </Link>
        </section>
      </div>
    </DashboardShell>
  );
}
