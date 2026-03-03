import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../lib/actions/session";
import { getCurrentLanguage } from "../../../../lib/i18n/server";
import { t } from "../../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

type MemberDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function updateMemberContactAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const admin = supabaseAdmin();
  const memberId = String(formData.get("member_id") || "");
  const phone = String(formData.get("phone") || "").trim() || null;

  await admin
    .from("users_profile")
    .update({
      phone,
      address_line1: String(formData.get("address_line1") || "").trim() || null,
      address_line2: String(formData.get("address_line2") || "").trim() || null,
      city: String(formData.get("city") || "").trim() || null,
      state: String(formData.get("state") || "").trim() || null,
      postal_code: String(formData.get("postal_code") || "").trim() || null,
      country: String(formData.get("country") || "").trim() || null,
      internal_note: String(formData.get("internal_note") || "").trim() || null
    })
    .eq("id", memberId);

  await admin.from("users").update({ phone }).eq("id", memberId);

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/relationships");
}

function formatAddress(profile: {
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}) {
  return [
    profile.address_line1,
    profile.address_line2,
    [profile.postal_code, profile.city].filter(Boolean).join(" "),
    profile.state,
    profile.country
  ]
    .filter(Boolean)
    .join(", ");
}

export default async function AdminMemberDetailPage({ params }: MemberDetailPageProps) {
  await requireAdmin();
  const language = await getCurrentLanguage();
  const { id } = await params;
  const admin = supabaseAdmin();

  const { data: profile } = await admin
    .from("users_profile")
    .select("id,name,username_id,phone,birthday,referral_code,referred_by,total_referred_sales,tier_rate,created_at,address_line1,address_line2,city,state,postal_code,country,internal_note")
    .eq("id", id)
    .single();

  if (!profile) {
    notFound();
  }

  const [{ data: member }, { data: upstream }, { count: downlineCount }, { data: orders }, { data: appointments }, { data: courseSessions }, { data: courses }, { data: mentors }] = await Promise.all([
    admin.from("users").select("email,phone").eq("id", id).single(),
    profile.referred_by
      ? admin.from("users_profile").select("id,name,username_id,referral_code").eq("id", profile.referred_by).single()
      : Promise.resolve({ data: null }),
    admin.from("users_profile").select("*", { count: "exact", head: true }).eq("referred_by", id),
    admin
      .from("orders")
      .select("id,amount_total,cash_paid,points_redeemed,order_type,payment_status,created_at,course_session_id,product_id,quantity")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("appointments")
      .select("id,mentor_id,service_id,start_at,end_at,status,session_mode,price_total,cash_due,created_at")
      .eq("user_id", id)
      .order("start_at", { ascending: false })
      .limit(10),
    admin.from("course_sessions").select("id,course_id,start_at,venue_name"),
    admin.from("courses").select("id,title"),
    admin.from("mentors").select("id,display_name")
  ]);

  const address = formatAddress(profile);
  const sessionMap = new Map((courseSessions ?? []).map((session) => [session.id, session]));
  const courseMap = new Map((courses ?? []).map((course) => [course.id, course]));
  const mentorMap = new Map((mentors ?? []).map((mentor) => [mentor.id, mentor]));

  const programOrders = (orders ?? []).filter((order) => order.order_type === "COURSE" || order.course_session_id);

  function getOrderLabel(order: {
    order_type: string | null;
    course_session_id: string | null;
    product_id?: string | null;
  }) {
    if (order.order_type === "COURSE" && order.course_session_id) {
      const session = sessionMap.get(order.course_session_id);
      const course = session ? courseMap.get(session.course_id) : null;
      return course?.title ?? t(language, { zh: "课程 / 活动报名", en: "Program reservation" });
    }
    if (order.order_type === "product") return t(language, { zh: "产品订单", en: "Product order" });
    if (order.order_type === "service") return t(language, { zh: "导师会谈", en: "Guidance session" });
    if (order.order_type === "personal") return t(language, { zh: "个人消费", en: "Personal purchase" });
    return order.order_type ?? t(language, { zh: "订单", en: "Order" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">{t(language, { zh: "会员资料", en: "Member detail" })}</p>
          <h1 className="font-display text-4xl text-[#123524]">{profile.name ?? profile.username_id ?? profile.referral_code}</h1>
          <p className="text-sm text-black/55">{profile.username_id ? `@${profile.username_id}` : profile.referral_code}</p>
        </div>
        <Link href="/admin/relationships" className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-[#123524]">
          {t(language, { zh: "返回关系页", en: "Back to relationships" })}
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="card space-y-4">
          <div>
            <p className="text-sm text-black/55">{t(language, { zh: "基本资料", en: "Member profile" })}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "用户名 ID", en: "Username ID" })}</p>
                <p className="mt-1 text-base text-[#123524]">{profile.username_id ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "推荐码", en: "Referral code" })}</p>
                <p className="mt-1 text-base text-[#123524]">{profile.referral_code}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "电邮", en: "Email" })}</p>
                <p className="mt-1 text-base text-[#123524]">{member?.email ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "手机号码", en: "Phone" })}</p>
                <p className="mt-1 text-base text-[#123524]">{profile.phone ?? member?.phone ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "生日", en: "Birthday" })}</p>
                <p className="mt-1 text-base text-[#123524]">{profile.birthday ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "加入时间", en: "Joined" })}</p>
                <p className="mt-1 text-base text-[#123524]">{new Date(profile.created_at).toLocaleDateString(language === "en" ? "en-US" : "zh-CN")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#f8f6f2] p-5">
            <p className="text-sm text-black/55">{t(language, { zh: "关系与业绩", en: "Relationship and performance" })}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "上级", en: "Upstream" })}</p>
                <p className="mt-1 text-base text-[#123524]">
                  {upstream ? `${upstream.name ?? upstream.username_id ?? upstream.referral_code} (${upstream.referral_code})` : t(language, { zh: "没有上级", en: "No upstream" })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "层级", en: "Tier" })}</p>
                <p className="mt-1 text-base text-[#123524]">{Math.round(Number(profile.tier_rate ?? 0) * 100)}%</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "下线人数", en: "Downlines" })}</p>
                <p className="mt-1 text-base text-[#123524]">{downlineCount ?? 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "累计推荐业绩", en: "Total referred sales" })}</p>
              <p className="mt-1 text-base text-[#123524]">RM {Number(profile.total_referred_sales ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <p className="text-sm text-black/55">{t(language, { zh: "联系方式与地址", en: "Contact and address" })}</p>
            <p className="mt-1 text-sm text-black/50">{t(language, { zh: "以后课程、订单、寄送或人工跟进都可以统一从这里查看与维护。", en: "Use this as the central contact record for future orders, deliveries, and follow-up." })}</p>
          </div>

          <div className="rounded-3xl border border-black/8 bg-[#fcfbf8] p-4 text-sm text-black/65">
            <p className="font-medium text-[#123524]">{t(language, { zh: "当前地址摘要", en: "Current address" })}</p>
            <p className="mt-2">{address || t(language, { zh: "还没有填写地址。", en: "No address saved yet." })}</p>
          </div>

          <form action={updateMemberContactAction} className="grid gap-3">
            <input type="hidden" name="member_id" value={profile.id} />
            <label className="grid gap-2">
              <span className="text-sm text-black/55">{t(language, { zh: "手机号码", en: "Phone" })}</span>
              <input name="phone" defaultValue={profile.phone ?? member?.phone ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-black/55">{t(language, { zh: "地址第 1 行", en: "Address line 1" })}</span>
              <input name="address_line1" defaultValue={profile.address_line1 ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-black/55">{t(language, { zh: "地址第 2 行", en: "Address line 2" })}</span>
              <input name="address_line2" defaultValue={profile.address_line2 ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-black/55">{t(language, { zh: "城市", en: "City" })}</span>
                <input name="city" defaultValue={profile.city ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-black/55">{t(language, { zh: "州属", en: "State" })}</span>
                <input name="state" defaultValue={profile.state ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-black/55">{t(language, { zh: "邮编", en: "Postal code" })}</span>
                <input name="postal_code" defaultValue={profile.postal_code ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-black/55">{t(language, { zh: "国家", en: "Country" })}</span>
                <input name="country" defaultValue={profile.country ?? "Malaysia"} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
            </div>
            <label className="grid gap-2">
              <span className="text-sm text-black/55">{t(language, { zh: "内部备注", en: "Internal note" })}</span>
              <textarea
                name="internal_note"
                defaultValue={profile.internal_note ?? ""}
                rows={5}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3"
                placeholder={t(language, { zh: "记录联系偏好、跟进重点、特殊安排。", en: "Track follow-up context, preferences, or special handling." })}
              />
            </label>
            <button className="mt-2 w-fit rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white">
              {t(language, { zh: "保存资料", en: "Save details" })}
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "最近订单", en: "Recent orders" })}</h2>
            <p className="text-sm text-black/50">{orders?.length ?? 0}</p>
          </div>
          {orders?.length ? (
            orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-black/8 bg-[#fcfbf8] px-4 py-3 text-sm">
                <p className="font-medium text-[#123524]">{getOrderLabel(order)}</p>
                <p className="mt-1 text-black/60">RM {Number(order.amount_total ?? 0).toFixed(2)} · {order.payment_status}</p>
                <p className="mt-1 text-black/45">{new Date(order.created_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有订单记录。", en: "No order history yet." })}</p>
          )}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "课程与活动", en: "Programs" })}</h2>
            <p className="text-sm text-black/50">{programOrders.length}</p>
          </div>
          {programOrders.length ? (
            programOrders.map((order) => {
              const session = order.course_session_id ? sessionMap.get(order.course_session_id) : null;
              const course = session ? courseMap.get(session.course_id) : null;
              return (
                <div key={order.id} className="rounded-2xl border border-black/8 bg-[#fcfbf8] px-4 py-3 text-sm">
                  <p className="font-medium text-[#123524]">{course?.title ?? t(language, { zh: "课程 / 活动报名", en: "Program reservation" })}</p>
                  <p className="mt-1 text-black/60">{session ? new Date(session.start_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN") : "-"}</p>
                  <p className="mt-1 text-black/45">{session?.venue_name ?? t(language, { zh: "场地待公布", en: "Venue to be announced" })}</p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有课程或活动报名。", en: "No program reservations yet." })}</p>
          )}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "导师会谈", en: "Guidance sessions" })}</h2>
            <p className="text-sm text-black/50">{appointments?.length ?? 0}</p>
          </div>
          {appointments?.length ? (
            appointments.map((appointment) => (
              <div key={appointment.id} className="rounded-2xl border border-black/8 bg-[#fcfbf8] px-4 py-3 text-sm">
                <p className="font-medium text-[#123524]">{mentorMap.get(appointment.mentor_id)?.display_name ?? t(language, { zh: "导师", en: "Mentor" })}</p>
                <p className="mt-1 text-black/60">{new Date(appointment.start_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}</p>
                <p className="mt-1 text-black/45">{appointment.status} · {appointment.session_mode}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有导师预约记录。", en: "No guidance sessions yet." })}</p>
          )}
        </div>
      </div>
    </div>
  );
}
