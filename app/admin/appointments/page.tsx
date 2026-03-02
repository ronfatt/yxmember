import AdminAppointmentActions from "../../../components/AdminAppointmentActions";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { formatMoney } from "../../../lib/metaenergy/helpers";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  const resolvedSearchParams = await searchParams;
  const query = admin
    .from("appointments")
    .select("id,user_id,start_at,end_at,status,session_mode,price_total,cash_due,points_used,balance_paid,deposit_paid,created_at,mentors(display_name),mentor_services(name,duration_min)")
    .order("start_at", { ascending: false });

  if (resolvedSearchParams.status) query.eq("status", resolvedSearchParams.status);
  const { data: appointments } = await query;

  const userIds = [...new Set((appointments ?? []).map((entry) => entry.user_id))];
  const { data: profiles } = userIds.length
    ? await admin.from("users_profile").select("id,name,referral_code").in("id", userIds)
    : { data: [] as Array<{ id: string; name: string | null; referral_code: string | null }> };

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8d7240]">
            {t(language, { zh: "导师会谈", en: "Guidance sessions" })}
          </p>
          <h2 className="font-display text-5xl text-[#123524]">{t(language, { zh: "预约管理", en: "Appointments desk" })}</h2>
        </div>
        <div className="flex gap-2 text-sm">
          {["pending", "confirmed", "completed", "cancelled"].map((status) => (
            <a key={status} href={`/admin/appointments?status=${status}`} className="rounded-full border border-black/10 bg-white px-4 py-2">
              {status}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {appointments?.length ? (
          appointments.map((appointment) => {
            const profile = profileMap.get(appointment.user_id);
            return (
              <div key={appointment.id} className="card grid gap-4 xl:grid-cols-[1.3fr,0.8fr,0.8fr,0.8fr]">
                <div className="space-y-2">
                  <p className="font-display text-3xl text-[#123524]">{(appointment.mentors as { display_name?: string } | null)?.display_name ?? "-"}</p>
                  <p className="text-sm text-black/65">
                    {profile?.name ?? profile?.referral_code ?? appointment.user_id}
                    {profile?.referral_code ? ` (${profile.referral_code})` : ""}
                  </p>
                  <p className="text-sm text-black/55">{new Date(appointment.start_at).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
                <div className="space-y-2 text-sm text-black/65">
                  <p>{(appointment.mentor_services as { name?: string } | null)?.name ?? "-"}</p>
                  <p>{(appointment.mentor_services as { duration_min?: number } | null)?.duration_min ?? 0}{language === "en" ? " min" : " 分钟"}</p>
                  <p>{appointment.session_mode}</p>
                  <p>{appointment.status}</p>
                </div>
                <div className="space-y-2 text-sm text-black/65">
                  <p>{t(language, { zh: "总价", en: "Total" })} · {formatMoney(Number(appointment.price_total ?? 0))}</p>
                  <p>{t(language, { zh: "现金", en: "Cash" })} · {formatMoney(Number(appointment.cash_due ?? 0))}</p>
                  <p>{t(language, { zh: "积分", en: "Points" })} · {appointment.points_used}</p>
                  <p>{t(language, { zh: "付款", en: "Payment" })} · {appointment.balance_paid ? t(language, { zh: "已完成", en: "Settled" }) : t(language, { zh: "未完成", en: "Pending" })}</p>
                </div>
                <AdminAppointmentActions appointmentId={appointment.id} status={appointment.status} language={language} />
              </div>
            );
          })
        ) : (
          <div className="card text-sm text-black/60">{t(language, { zh: "目前还没有导师会谈预约。", en: "No mentor appointments yet." })}</div>
        )}
      </div>
    </section>
  );
}
