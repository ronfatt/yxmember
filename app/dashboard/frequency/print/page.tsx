import PrintReportButton from "../../../../components/PrintReportButton";
import { requireUser } from "../../../../lib/actions/session";
import type { FrequencyReport, WeeklyReminder } from "../../../../lib/metaenergy/frequency";
import { createClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

function parseReminder(content: string | null) {
  if (!content) return null;
  try {
    return JSON.parse(content) as WeeklyReminder;
  } catch {
    return null;
  }
}

export default async function FrequencyPrintPage() {
  const user = await requireUser();
  const supabase = createClient();

  const [{ data: profile }, { data: report }, { data: reminder }] = await Promise.all([
    supabase.from("users_profile").select("name,birthday,referral_code").eq("id", user.id).single(),
    supabase
      .from("frequency_reports")
      .select("report_json,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("weekly_reminders")
      .select("week_start,content")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const frequency = report?.report_json as FrequencyReport | undefined;
  const weeklyReminder = parseReminder(reminder?.content ?? null);

  return (
    <div className="min-h-screen bg-[#f8f6f2] print:bg-white">
      <div className="mx-auto max-w-4xl px-6 py-10 print:px-0">
        <div className="mb-8 flex items-start justify-between gap-4 print:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">Frequency report</p>
            <h1 className="font-display text-5xl text-[#123524]">Printable view</h1>
          </div>
          <PrintReportButton />
        </div>

        <div className="space-y-6 rounded-[32px] border border-black/10 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="border-b border-black/10 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">MetaEnergy Frequency Report</p>
            <h2 className="mt-2 font-display text-5xl text-[#123524]">{profile?.name ?? "Member"}</h2>
            <p className="mt-2 text-sm text-black/60">
              Birthday: {profile?.birthday ?? "-"} | Referral code: {profile?.referral_code ?? "-"}
            </p>
          </div>

          {frequency ? (
            <>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-black/50">Life path</p>
                  <p className="mt-2 font-display text-3xl text-[#123524]">{frequency.lifePath}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-black/50">Focus</p>
                  <p className="mt-2 font-display text-3xl text-[#123524]">{frequency.focus}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-black/50">Year energy</p>
                  <p className="mt-2 font-display text-3xl text-[#123524]">{frequency.yearEnergy}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-black/50">Profile band</p>
                  <p className="mt-2 font-display text-3xl capitalize text-[#123524]">{frequency.profileBand}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-jade/10 bg-jade/5 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">Summary</p>
                <p className="mt-3 text-lg text-black/75">{frequency.summary}</p>
                <p className="mt-4 font-medium text-[#123524]">Mantra: {frequency.mantra}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-5">
                  <p className="font-medium text-[#123524]">Themes</p>
                  <ul className="mt-3 space-y-2 text-sm text-black/65">
                    {frequency.themes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-5">
                  <p className="font-medium text-[#123524]">Strengths</p>
                  <ul className="mt-3 space-y-2 text-sm text-black/65">
                    {frequency.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-5 lg:col-span-2">
                  <p className="font-medium text-[#123524]">Watchouts</p>
                  <ul className="mt-3 space-y-2 text-sm text-black/65">
                    {frequency.watchouts.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-5">
                  <p className="font-medium text-[#123524]">Work guidance</p>
                  <p className="mt-3 text-sm text-black/65">{frequency.guidance.work}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-5">
                  <p className="font-medium text-[#123524]">Relationship guidance</p>
                  <p className="mt-3 text-sm text-black/65">{frequency.guidance.relationships}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-5">
                  <p className="font-medium text-[#123524]">Wellbeing guidance</p>
                  <p className="mt-3 text-sm text-black/65">{frequency.guidance.wellbeing}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white px-5 py-5">
                <p className="font-medium text-[#123524]">Current action plan</p>
                <ol className="mt-3 space-y-2 text-sm text-black/65">
                  {frequency.actionPlan.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>

              {weeklyReminder ? (
                <div className="rounded-2xl border border-black/10 bg-[#f8f6f2] px-5 py-5">
                  <p className="font-medium text-[#123524]">Weekly reminder snapshot</p>
                  <p className="mt-2 text-sm text-black/60">Week starting {weeklyReminder.weekStart}</p>
                  <p className="mt-3 text-base font-medium text-black/75">{weeklyReminder.headline}</p>
                  <p className="mt-2 text-sm text-black/65">{weeklyReminder.focusTheme}</p>
                  <ul className="mt-3 space-y-1 text-sm text-black/65">
                    {weeklyReminder.priorityList.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-black/60">Boundary: {weeklyReminder.boundaryNote}</p>
                  <p className="mt-1 text-sm text-black/60">Reflection: {weeklyReminder.reflectionPrompt}</p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-black/60">No frequency report has been generated yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
