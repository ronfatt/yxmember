import Link from "next/link";
import DashboardShell from "../../../../components/DashboardShell";
import { requireUser } from "../../../../lib/actions/session";
import { getCurrentLanguage } from "../../../../lib/i18n/server";
import { t } from "../../../../lib/i18n/shared";
import { createClient } from "../../../../lib/supabase/server";
import { getBookableSlots, getMentorService } from "../../../../lib/metaenergy/appointments";
import { formatMoney } from "../../../../lib/metaenergy/helpers";

export const dynamic = "force-dynamic";

export default async function AppointmentSlotPage({
  params
}: {
  params: { mentorId: string; serviceId: string };
}) {
  await requireUser();
  const language = getCurrentLanguage();
  const supabase = createClient();
  const { mentor, service } = await getMentorService(supabase, params.mentorId, params.serviceId);
  const slots = await getBookableSlots(supabase, params.mentorId, service.duration_min, new Date(), 14);

  const grouped = slots.reduce<Record<string, typeof slots>>((acc, slot) => {
    acc[slot.dateKey] = [...(acc[slot.dateKey] ?? []), slot];
    return acc;
  }, {});

  const modeOptions =
    mentor.location_type === "both"
      ? [
          { value: "online", label: t(language, { zh: "线上会谈", en: "Online session" }) },
          { value: "offline", label: t(language, { zh: "线下会谈", en: "In-person session" }) }
        ]
      : [
          {
            value: mentor.location_type,
            label: mentor.location_type === "online" ? t(language, { zh: "线上会谈", en: "Online session" }) : t(language, { zh: "线下会谈", en: "In-person session" })
          }
        ];

  return (
    <DashboardShell
      title={t(language, { zh: "选择会谈时间", en: "Choose session time" })}
      subtitle={t(language, {
        zh: `${mentor.display_name} · ${service.name} · ${service.duration_min} 分钟`,
        en: `${mentor.display_name} · ${service.name} · ${service.duration_min} min`
      })}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <form action="/book/intake" className="card space-y-6">
          <input type="hidden" name="mentorId" value={mentor.id} />
          <input type="hidden" name="serviceId" value={service.id} />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d7240]">
              {t(language, { zh: "第一步", en: "Step 1" })}
            </p>
            <h2 className="font-display text-4xl text-[#123524]">
              {t(language, { zh: "先选一个安静而明确的时间。", en: "Start by choosing a quiet, deliberate time." })}
            </h2>
          </div>

          <div className="grid gap-3">
            <label className="grid gap-2 text-sm text-black/65">
              <span>{t(language, { zh: "会谈形式", en: "Session mode" })}</span>
              <select name="sessionMode" className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                {modeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {slots.length ? (
            <div className="space-y-5">
              {Object.entries(grouped).map(([dateKey, dateSlots]) => (
                <div key={dateKey} className="space-y-3 rounded-[26px] border border-black/10 bg-white p-5">
                  <p className="font-medium text-[#123524]">{dateSlots[0]?.dateLabel}</p>
                  <div className="flex flex-wrap gap-3">
                    {dateSlots.map((slot) => {
                      const value = `${slot.startAt}__${slot.endAt}`;
                      return (
                        <label key={value} className="cursor-pointer">
                          <input type="radio" name="slot" value={value} required className="peer sr-only" />
                          <span className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm peer-checked:border-jade peer-checked:bg-jade peer-checked:text-white">
                            {slot.timeLabel}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[26px] border border-dashed border-black/10 bg-white p-6 text-sm text-black/60">
              {t(language, { zh: "未来 14 天暂时没有可预约时段。请先到后台为导师新增服务时段。", en: "No bookable slots are available in the next 14 days yet." })}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Link href={`/mentors/${mentor.id}`} className="text-sm text-black/55 underline underline-offset-4">
              {t(language, { zh: "返回导师页", en: "Back to mentor profile" })}
            </Link>
            <button className="rounded-full bg-jade px-5 py-3 text-sm font-semibold text-white">
              {t(language, { zh: "继续填写会谈意图", en: "Continue to intake" })}
            </button>
          </div>
        </form>

        <aside className="card space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d7240]">
            {t(language, { zh: "会谈摘要", en: "Session summary" })}
          </p>
          <h3 className="font-display text-3xl text-[#123524]">{service.name}</h3>
          <p className="text-sm text-black/65">{mentor.headline ?? mentor.bio}</p>
          <div className="space-y-2 text-sm text-black/65">
            <p>{t(language, { zh: "时长", en: "Duration" })} · {service.duration_min}{language === "en" ? " min" : " 分钟"}</p>
            <p>{t(language, { zh: "价格", en: "Price" })} · {formatMoney(service.price_total)}</p>
            <p>{t(language, { zh: "订金参考", en: "Deposit reference" })} · {formatMoney(service.deposit_amount)}</p>
            <p>{t(language, { zh: "地点", en: "Location" })} · {mentor.location_note ?? t(language, { zh: "线上 / 元象空间", en: "Online / MetaEnergy space" })}</p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-[#fbf8f1] p-4 text-sm leading-7 text-black/60">
            {t(language, {
              zh: "改期与取消会以安静但明确的方式处理。会谈开始前 24 小时外可申请调整一次，24 小时内的更动将按当次安排与名额情况处理。",
              en: "Reschedules and cancellations are handled in a calm but clear way. Changes outside 24 hours can be requested once; later changes depend on availability."
            })}
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
