import Link from "next/link";
import DashboardShell from "../../../components/DashboardShell";
import { requireUser } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { createClient } from "../../../lib/supabase/server";
import { formatMoney } from "../../../lib/metaenergy/helpers";

export const dynamic = "force-dynamic";

export default async function DashboardAppointmentsPage() {
  const user = await requireUser();
  const language = await getCurrentLanguage();
  const supabase = await createClient();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id,start_at,end_at,status,session_mode,price_total,cash_due,deposit_paid,balance_paid,created_at,mentors(display_name),mentor_services(name,duration_min)")
    .eq("user_id", user.id)
    .order("start_at", { ascending: false });

  return (
    <DashboardShell
      title={t(language, { zh: "我的预约", en: "My appointments" })}
      subtitle={t(language, { zh: "查看会谈时间、付款状态与当前安排。", en: "Review your session times, payment state, and status." })}
    >
      <div className="space-y-4">
        {appointments?.length ? (
          appointments.map((appointment) => (
            <div key={appointment.id} className="card grid gap-4 lg:grid-cols-[1.4fr,0.8fr,0.8fr]">
              <div className="space-y-2">
                <p className="font-display text-3xl text-[#123524]">{(appointment.mentors as { display_name?: string } | null)?.display_name ?? "-"}</p>
                <p className="text-sm text-black/65">
                  {(appointment.mentor_services as { name?: string; duration_min?: number } | null)?.name ?? "-"}
                  {" · "}
                  {(appointment.mentor_services as { duration_min?: number } | null)?.duration_min ?? 0}
                  {language === "en" ? " min" : " 分钟"}
                </p>
                <p className="text-sm text-black/55">{new Date(appointment.start_at).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <div className="space-y-2 text-sm text-black/65">
                <p>{t(language, { zh: "状态", en: "Status" })} · {appointment.status}</p>
                <p>{t(language, { zh: "形式", en: "Mode" })} · {appointment.session_mode === "online" ? t(language, { zh: "线上", en: "Online" }) : t(language, { zh: "线下", en: "In person" })}</p>
              </div>
              <div className="space-y-2 text-sm text-black/65">
                <p>{t(language, { zh: "总价", en: "Total" })} · {formatMoney(Number(appointment.price_total ?? 0))}</p>
                <p>{t(language, { zh: "现金", en: "Cash due" })} · {formatMoney(Number(appointment.cash_due ?? 0))}</p>
                <p>
                  {t(language, { zh: "付款状态", en: "Payment" })} ·{" "}
                  {appointment.balance_paid ? t(language, { zh: "已完成", en: "Settled" }) : t(language, { zh: "待后台确认", en: "Awaiting admin confirmation" })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="card space-y-4 text-sm text-black/60">
            <p>
              {t(language, { zh: "你还没有会谈预约。可以先进入导师页，选择一位导师与会谈时间。", en: "You have no mentor appointments yet. Start by choosing a mentor and a time slot." })}
            </p>
            <div>
              <Link
                href="/mentors"
                className="inline-flex rounded-full bg-jade px-4 py-2 text-sm font-semibold text-white"
              >
                {t(language, { zh: "前往导师页", en: "Browse mentors" })}
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
