import { redirect } from "next/navigation";
import DashboardShell from "../../../components/DashboardShell";
import AppointmentConfirmCard from "../../../components/AppointmentConfirmCard";
import { requireUser } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { createClient } from "../../../lib/supabase/server";
import { buildAppointmentQuote, getMentorService } from "../../../lib/metaenergy/appointments";

export const dynamic = "force-dynamic";

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getMulti(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function BookingConfirmPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await requireUser();
  const language = getCurrentLanguage();
  const mentorId = getSingle(searchParams.mentorId);
  const serviceId = getSingle(searchParams.serviceId);
  const slot = getSingle(searchParams.slot);
  const sessionMode = getSingle(searchParams.sessionMode) as "online" | "offline" | undefined;
  const intention = getSingle(searchParams.intention);
  const desiredOutcome = getSingle(searchParams.desiredOutcome);

  if (!mentorId || !serviceId || !slot || !sessionMode || !intention || !desiredOutcome) {
    redirect("/mentors");
  }

  const [startAt, endAt] = slot.split("__");
  if (!startAt || !endAt) {
    redirect(`/book/${mentorId}/${serviceId}`);
  }

  const shareBirthday = getSingle(searchParams.shareBirthday) === "1";
  const allowRecording = getSingle(searchParams.allowRecording) === "1";
  const themes = getMulti(searchParams.theme);

  const supabase = createClient();
  const [{ mentor, service }, { data: profile }] = await Promise.all([
    getMentorService(supabase, mentorId, serviceId),
    supabase.from("users_profile").select("points_balance").eq("id", user.id).single()
  ]);

  const initialQuote = buildAppointmentQuote(service, Number(profile?.points_balance ?? 0), 0);

  return (
    <DashboardShell
      title={t(language, { zh: "确认预约", en: "Confirm appointment" })}
      subtitle={t(language, { zh: "最后确认一次时间、会谈内容与结算方式。", en: "Review the time, intake, and payment summary." })}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr,0.92fr]">
        <div className="card space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d7240]">
              {t(language, { zh: "第三步", en: "Step 3" })}
            </p>
            <h2 className="font-display text-4xl text-[#123524]">{mentor.display_name}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-black/10 bg-white p-5 text-sm text-black/65">
              <p className="font-medium text-[#123524]">{t(language, { zh: "会谈摘要", en: "Session summary" })}</p>
              <p className="mt-2">{service.name}</p>
              <p>{new Date(startAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</p>
              <p>{sessionMode === "online" ? t(language, { zh: "线上会谈", en: "Online session" }) : t(language, { zh: "线下会谈", en: "In-person session" })}</p>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white p-5 text-sm text-black/65">
              <p className="font-medium text-[#123524]">{t(language, { zh: "会谈意图", en: "Intake summary" })}</p>
              <p className="mt-2">{intention}</p>
              <p className="mt-2">{t(language, { zh: "期望结果", en: "Desired outcome" })} · {desiredOutcome}</p>
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 bg-[#fbf8f1] p-5 text-sm leading-7 text-black/65">
            <p>{t(language, { zh: "关注主题", en: "Themes" })} · {themes.length ? themes.join("、") : t(language, { zh: "未特别选择", en: "Not specified" })}</p>
            <p>{t(language, { zh: "生日辅助", en: "Birthday support" })} · {shareBirthday ? t(language, { zh: "愿意提供", en: "Shared" }) : t(language, { zh: "暂不提供", en: "Not shared" })}</p>
            <p>{t(language, { zh: "录音授权", en: "Recording consent" })} · {allowRecording ? t(language, { zh: "可选同意", en: "Optional consent" }) : t(language, { zh: "未授权", en: "Not granted" })}</p>
          </div>
        </div>

        <AppointmentConfirmCard
          mentorId={mentorId}
          serviceId={serviceId}
          startAt={startAt}
          endAt={endAt}
          sessionMode={sessionMode}
          intake={{
            intention,
            themes,
            share_birthday: shareBirthday,
            allow_recording: allowRecording,
            desired_outcome: desiredOutcome
          }}
          language={language}
          initialQuote={initialQuote}
        />
      </div>
    </DashboardShell>
  );
}
