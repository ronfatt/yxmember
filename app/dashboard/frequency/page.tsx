import DashboardShell from "../../../components/DashboardShell";
import FrequencyGenerator from "../../../components/FrequencyGenerator";
import ReminderGenerator from "../../../components/ReminderGenerator";
import { requireUser } from "../../../lib/actions/session";
import type { FrequencyReport, WeeklyReminder } from "../../../lib/metaenergy/frequency";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FrequencyDashboardPage() {
  const user = await requireUser();
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

  const frequency = report?.report_json as FrequencyReport | undefined;

  return (
    <DashboardShell title="Frequency tools" subtitle="Birthday-based report and weekly guidance">
      <div className="grid gap-4 lg:grid-cols-[1.15fr,1fr]">
        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-black/55">Latest report</p>
              <h2 className="font-display text-3xl text-[#123524]">Frequency profile</h2>
            </div>
            <FrequencyGenerator birthday={profile?.birthday ?? null} />
          </div>
          <p className="text-sm text-black/70">{frequency?.summary ?? "Generate a report to populate this card."}</p>
          {frequency ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="text-black/50">Life path</p>
                  <p className="mt-1 font-display text-2xl text-[#123524]">{frequency.lifePath}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="text-black/50">Focus</p>
                  <p className="mt-1 font-display text-2xl text-[#123524]">{frequency.focus}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="text-black/50">Year energy</p>
                  <p className="mt-1 font-display text-2xl text-[#123524]">{frequency.yearEnergy}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-jade/10 bg-jade/5 px-4 py-3 text-sm text-[#123524]">
                <p className="text-xs uppercase tracking-[0.2em]">Mantra</p>
                <p className="mt-1 font-medium">{frequency.mantra}</p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-black/70">Themes</p>
                  <p className="mt-1 text-black/60">{frequency.themes.join(", ")}.</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-black/70">Strengths</p>
                  <p className="mt-1 text-black/60">{frequency.strengths.join(", ")}.</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-black/70">Watchouts</p>
                  <p className="mt-1 text-black/60">{frequency.watchouts.join(", ")}.</p>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                    <p className="font-medium text-black/70">Work</p>
                    <p className="mt-1 text-black/60">{frequency.guidance.work}</p>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                    <p className="font-medium text-black/70">Relationships</p>
                    <p className="mt-1 text-black/60">{frequency.guidance.relationships}</p>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                    <p className="font-medium text-black/70">Wellbeing</p>
                    <p className="mt-1 text-black/60">{frequency.guidance.wellbeing}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-black/70">Action plan</p>
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
              <p className="text-sm text-black/55">Weekly reminders</p>
              <h2 className="font-display text-3xl text-[#123524]">Generator</h2>
            </div>
            <ReminderGenerator />
          </div>
          {reminders?.length ? (
            reminders.map((entry) => {
              const parsed = (() => {
                try {
                  return JSON.parse(entry.content) as WeeklyReminder;
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
                      <p className="mt-2 text-black/60">Boundary: {parsed.boundaryNote}</p>
                      <p className="mt-1 text-black/60">Reflection: {parsed.reflectionPrompt}</p>
                    </>
                  ) : (
                    <p className="mt-1">{entry.content}</p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-black/60">No reminders stored yet.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
