import Link from "next/link";
import DashboardShell from "../../../components/DashboardShell";
import OrderSlipUpload from "../../../components/OrderSlipUpload";
import { requireUser } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDate(value: string, language: "zh" | "en") {
  return new Date(value).toLocaleString(language === "en" ? "en-MY" : "zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default async function DashboardProgramsPage() {
  const user = await requireUser();
  const language = getCurrentLanguage();
  const supabase = createClient();

  const [{ data: courses }, { data: sessions }, { data: orders }] = await Promise.all([
    supabase
      .from("courses")
      .select("id,title,tagline,level,location_text,is_published")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("course_sessions")
      .select("id,course_id,start_at,end_at,timezone,venue_name,capacity,price_cents,currency,status")
      .eq("status", "PUBLISHED")
      .order("start_at", { ascending: true }),
    supabase
      .from("orders")
      .select("id,order_type,amount_total,amount_cents,currency,payment_status,slip_url,course_session_id,created_at")
      .eq("user_id", user.id)
      .eq("order_type", "COURSE")
      .order("created_at", { ascending: false })
  ]);

  const sessionsByCourse = new Map<string, typeof sessions>();
  (sessions ?? []).forEach((session) => {
    const list = sessionsByCourse.get(session.course_id) ?? [];
    list.push(session);
    sessionsByCourse.set(session.course_id, list);
  });

  const sessionById = new Map((sessions ?? []).map((session) => [session.id, session]));
  const pendingOrders = (orders ?? [])
    .filter((order) => order.payment_status === "PENDING")
    .map((order) => {
      const session = order.course_session_id ? sessionById.get(order.course_session_id) : null;
      return {
        ...order,
        label:
          session?.venue_name
            ? `${t(language, { zh: "课程报名", en: "Program reservation" })} · ${session.venue_name}`
            : t(language, { zh: "课程报名", en: "Program reservation" })
      };
    });

  return (
    <DashboardShell
      title={t(language, { zh: "课程与活动", en: "Programs" })}
      subtitle={t(language, { zh: "查看开放场次、完成报名与上传汇款单据。", en: "Browse sessions, reserve a seat, and upload your bank transfer slip." })}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="card space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-black/55">{t(language, { zh: "开放报名", en: "Open for members" })}</p>
              <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "课程与活动列表", en: "Programs and events" })}</h2>
            </div>
            <Link
              href="/courses"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:border-jade/30 hover:text-jade"
            >
              {t(language, { zh: "查看公开页", en: "View public page" })}
            </Link>
          </div>

          {courses?.length ? (
            <div className="space-y-4">
              {courses.map((course) => {
                const courseSessions = sessionsByCourse.get(course.id) ?? [];
                return (
                  <div key={course.id} className="rounded-[28px] border border-black/10 bg-white/80 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="font-display text-2xl text-[#123524]">{course.title}</h3>
                        {course.tagline ? <p className="text-sm text-black/65">{course.tagline}</p> : null}
                        <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                          {course.level || t(language, { zh: "会员开放", en: "Members only" })}
                          {course.location_text ? ` · ${course.location_text}` : ""}
                        </p>
                      </div>
                      <Link
                        href={`/courses/${course.id}`}
                        className="rounded-full bg-[linear-gradient(135deg,#c8a55c,#e6c88f)] px-4 py-2 text-sm font-semibold text-[#123524]"
                      >
                        {t(language, { zh: "查看详情", en: "View details" })}
                      </Link>
                    </div>

                    <div className="mt-4 space-y-3">
                      {courseSessions.length ? (
                        courseSessions.slice(0, 3).map((session) => (
                          <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-[#f8f4ea] px-4 py-3 text-sm">
                            <div className="space-y-1">
                              <p className="text-[#123524]">{formatDate(session.start_at, language)}</p>
                              <p className="text-black/55">
                                {session.venue_name || t(language, { zh: "场地待公布", en: "Venue to be announced" })} · {session.capacity} {t(language, { zh: "席", en: "seats" })}
                              </p>
                            </div>
                            <p className="font-medium text-[#123524]">
                              {Number(session.price_cents ?? 0) > 0
                                ? `${(Number(session.price_cents) / 100).toFixed(2)} ${session.currency}`
                                : t(language, { zh: "免费", en: "Free" })}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-black/55">{t(language, { zh: "暂时还没有开放场次。", en: "No published sessions yet." })}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-black/55">{t(language, { zh: "目前还没有开放中的课程或活动。", en: "No open programs or events yet." })}</p>
          )}
        </section>

        <section className="space-y-6">
          <div className="card space-y-4">
            <div>
              <p className="text-sm text-black/55">{t(language, { zh: "待完成付款", en: "Pending transfer" })}</p>
              <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "上传汇款单据", en: "Upload transfer slip" })}</h2>
            </div>
            <p className="text-sm text-black/65">
              {t(language, {
                zh: "收费课程或活动会先为你保留报名订单。完成银行转账后，在这里上载单据，后台确认后即会锁定席位。",
                en: "Paid programs create a pending reservation first. Upload your transfer slip here and your seat will be confirmed after review."
              })}
            </p>
            {pendingOrders.length ? (
              <OrderSlipUpload orders={pendingOrders} language={language} />
            ) : (
              <p className="text-sm text-black/55">{t(language, { zh: "当前没有待上传单据的课程订单。", en: "There are no pending program orders right now." })}</p>
            )}
          </div>

          <div className="card space-y-4">
            <div>
              <p className="text-sm text-black/55">{t(language, { zh: "已提交报名", en: "Recent reservations" })}</p>
              <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "最近记录", en: "Recent activity" })}</h2>
            </div>
            {(orders ?? []).length ? (
              <div className="space-y-3">
                {orders?.slice(0, 6).map((order) => {
                  const session = order.course_session_id ? sessionById.get(order.course_session_id) : null;
                  return (
                    <div key={order.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-[#123524]">{session?.venue_name || t(language, { zh: "课程报名", en: "Program reservation" })}</p>
                        <p className="text-black/50">{order.payment_status}</p>
                      </div>
                      {session ? <p className="mt-1 text-black/55">{formatDate(session.start_at, language)}</p> : null}
                      <p className="mt-1 text-black/55">
                        {Number(order.amount_total ?? (order.amount_cents ?? 0) / 100).toFixed(2)} {order.currency}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-black/55">{t(language, { zh: "你还没有课程或活动报名记录。", en: "You do not have any program reservations yet." })}</p>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
