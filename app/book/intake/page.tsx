import { redirect } from "next/navigation";
import DashboardShell from "../../../components/DashboardShell";
import { requireUser } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { createClient } from "../../../lib/supabase/server";
import { getMentorService } from "../../../lib/metaenergy/appointments";

export const dynamic = "force-dynamic";

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingIntakePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const language = await getCurrentLanguage();
  const resolvedSearchParams = await searchParams;
  const mentorId = getSingle(resolvedSearchParams.mentorId);
  const serviceId = getSingle(resolvedSearchParams.serviceId);
  const slot = getSingle(resolvedSearchParams.slot);
  const sessionMode = getSingle(resolvedSearchParams.sessionMode) as "online" | "offline" | undefined;

  if (!mentorId || !serviceId || !slot || !sessionMode) {
    redirect("/mentors");
  }

  const [startAt, endAt] = slot.split("__");
  if (!startAt || !endAt) {
    redirect(`/book/${mentorId}/${serviceId}`);
  }

  const supabase = await createClient();
  const { mentor, service } = await getMentorService(supabase, mentorId, serviceId);

  return (
    <DashboardShell
      title={t(language, { zh: "填写会谈意图", en: "Complete your intake" })}
      subtitle={t(language, { zh: "让导师在会谈前知道你真正想整理什么。", en: "Help the mentor prepare with the right context." })}
    >
      <form action="/book/confirm" className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <input type="hidden" name="mentorId" value={mentorId} />
        <input type="hidden" name="serviceId" value={serviceId} />
        <input type="hidden" name="slot" value={slot} />
        <input type="hidden" name="sessionMode" value={sessionMode} />

        <div className="card space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d7240]">
              {t(language, { zh: "第二步", en: "Step 2" })}
            </p>
            <h2 className="font-display text-4xl text-[#123524]">
              {t(language, { zh: "把这次会谈想整理的事，说清楚一点。", en: "Describe what this session is here to support." })}
            </h2>
          </div>

          <label className="grid gap-2 text-sm text-black/65">
            <span>{t(language, { zh: "这次最想整理什么？", en: "What would you most like to work through?" })}</span>
            <textarea
              name="intention"
              required
              maxLength={300}
              rows={5}
              className="rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
            />
          </label>

          <div className="grid gap-3">
            <p className="text-sm text-black/65">{t(language, { zh: "想关注的主题", en: "Themes you want to focus on" })}</p>
            <div className="flex flex-wrap gap-2">
              {[
                t(language, { zh: "关系", en: "Relationships" }),
                t(language, { zh: "事业", en: "Work" }),
                t(language, { zh: "节奏", en: "Rhythm" }),
                t(language, { zh: "情绪", en: "Emotional clarity" })
              ].map((theme) => (
                <label key={theme} className="cursor-pointer">
                  <input type="checkbox" name="theme" value={theme} className="peer sr-only" />
                  <span className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm peer-checked:border-jade peer-checked:bg-jade peer-checked:text-white">
                    {theme}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <label className="grid gap-2 text-sm text-black/65">
            <span>{t(language, { zh: "你希望会谈结束后得到什么？", en: "What do you hope to leave the session with?" })}</span>
            <input name="desiredOutcome" required maxLength={160} className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none" />
          </label>

          <div className="grid gap-3 text-sm text-black/65">
            <label className="flex items-center gap-3">
              <input type="checkbox" name="shareBirthday" value="1" />
              <span>{t(language, { zh: "愿意分享生日，作为频率报告辅助", en: "Share birthday to support frequency context" })}</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="allowRecording" value="1" />
              <span>{t(language, { zh: "若导师需要，我愿意接受录音", en: "I consent to optional recording if needed" })}</span>
            </label>
          </div>

          <div className="flex justify-end">
            <button className="rounded-full bg-jade px-5 py-3 text-sm font-semibold text-white">
              {t(language, { zh: "继续确认", en: "Continue to confirm" })}
            </button>
          </div>
        </div>

        <aside className="card space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d7240]">
            {t(language, { zh: "当前选择", en: "Current selection" })}
          </p>
          <h3 className="font-display text-3xl text-[#123524]">{mentor.display_name}</h3>
          <div className="space-y-2 text-sm text-black/65">
            <p>{service.name}</p>
            <p>{service.duration_min}{language === "en" ? " min" : " 分钟"}</p>
            <p>{sessionMode === "online" ? t(language, { zh: "线上会谈", en: "Online session" }) : t(language, { zh: "线下会谈", en: "In-person session" })}</p>
            <p>{new Date(startAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>
        </aside>
      </form>
    </DashboardShell>
  );
}
