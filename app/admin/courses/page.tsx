import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import CopyField from "../../../components/CopyField";
import { renderProgramEmail, sendEmail } from "../../../lib/notifications/email";
import { supabaseAdmin } from "../../../lib/supabase/admin";

async function createCourse(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  await admin.from("courses").insert({
    title: String(formData.get("title")),
    tagline: String(formData.get("tagline") || ""),
    description: String(formData.get("description") || ""),
    highlights: [],
    duration_text: String(formData.get("duration_text") || ""),
    level: String(formData.get("level") || "Beginner"),
    location_text: String(formData.get("location_text") || ""),
    cover_image: null,
    is_published: false
  });
  revalidatePath("/admin/courses");
}

async function createSession(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  await admin.from("course_sessions").insert({
    course_id: String(formData.get("course_id")),
    start_at: String(formData.get("start_at")),
    end_at: String(formData.get("end_at")),
    timezone: String(formData.get("timezone") || "Asia/Kuala_Lumpur"),
    venue_name: String(formData.get("venue_name") || ""),
    venue_address: String(formData.get("venue_address") || ""),
    capacity: Number(formData.get("capacity") || 20),
    price_cents: Number(formData.get("price_cents") || 0),
    currency: String(formData.get("currency") || "MYR"),
    status: "DRAFT"
  });
  revalidatePath("/admin/courses");
}

async function toggleCoursePublish(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const id = String(formData.get("id"));
  const is_published = formData.get("is_published") === "true";
  await admin.from("courses").update({ is_published }).eq("id", id);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

async function updateSessionStatus(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await admin.from("course_sessions").update({ status }).eq("id", id);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

async function approveCourseTransfer(formData: FormData) {
  "use server";
  const adminUser = await requireAdmin();
  const admin = supabaseAdmin();
  const orderId = String(formData.get("order_id"));

  const { data: order } = await admin
    .from("orders")
    .select("id,user_id,amount_total,currency,course_session_id")
    .eq("id", orderId)
    .single();

  if (!order) {
    return;
  }

  const [{ data: member }, { data: session }] = await Promise.all([
    admin.from("users").select("email,name").eq("id", order.user_id).maybeSingle(),
    admin
      .from("course_sessions")
      .select("id,start_at,venue_name,course_id")
      .eq("id", order.course_session_id)
      .maybeSingle()
  ]);

  const { data: course } = session
    ? await admin.from("courses").select("title").eq("id", session.course_id).maybeSingle()
    : { data: null };

  await admin.rpc("process_paid_order", {
    order_id_input: orderId,
    payment_intent_input: "BANK_TRANSFER_REVIEWED"
  });

  await admin
    .from("orders")
    .update({
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminUser.id
    })
    .eq("id", orderId);

  if (member?.email) {
    await sendEmail({
      to: member.email,
      subject: "你的元象课程席位已确认",
      html: renderProgramEmail({
        heading: "你的席位已确认",
        intro: "我们已经确认收到你的汇款，这次课程 / 活动的席位已经为你保留。",
        lines: [
          `课程 / 活动：${course?.title ?? "-"}`,
          `场次时间：${session ? new Date(session.start_at).toLocaleString("zh-CN") : "-"}`,
          `地点：${session?.venue_name || "待公布"}`,
          `确认金额：${Number(order.amount_total ?? 0).toFixed(2)} ${order.currency}`
        ]
      })
    }).catch(() => null);
  }

  revalidatePath("/admin/courses");
  revalidatePath("/dashboard/programs");
  revalidatePath("/dashboard/history");
}

export default async function AdminCoursesPage() {
  const language = await getCurrentLanguage();
  const admin = supabaseAdmin();
  const bankAccountName = process.env.BANK_ACCOUNT_NAME?.trim();
  const bankAccountNumber = process.env.BANK_ACCOUNT_NUMBER?.trim();
  const bankBankName = process.env.BANK_BANK_NAME?.trim();
  const bankTransferNote = process.env.BANK_TRANSFER_NOTE?.trim();
  const [{ data: courses }, { data: sessions }, { data: pendingOrders }, { data: profiles }] = await Promise.all([
    admin.from("courses").select("*").order("created_at", { ascending: false }),
    admin.from("course_sessions").select("*").order("start_at", { ascending: true }),
    admin
      .from("orders")
      .select("id,user_id,amount_total,currency,slip_url,created_at,course_session_id,payment_status")
      .eq("order_type", "COURSE")
      .eq("payment_status", "PENDING")
      .order("created_at", { ascending: false }),
    admin.from("users_profile").select("id,name,referral_code")
  ]);

  const courseMap = new Map((courses ?? []).map((course) => [course.id, course]));
  const sessionMap = new Map((sessions ?? []).map((session) => [session.id, session]));
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-2xl">{t(language, { zh: "当前汇款资料", en: "Current bank transfer details" })}</h2>
          <p className="text-sm text-black/60">{t(language, { zh: "会员在课程活动页看到的银行转账资料。建议先在部署环境中设置这些值。", en: "These are the bank transfer details shown to members on the programs page." })}</p>
        </div>
        {bankAccountName || bankAccountNumber || bankBankName ? (
          <div className="grid gap-3 md:grid-cols-2">
            {bankBankName ? <CopyField label={t(language, { zh: "银行", en: "Bank" })} value={bankBankName} language={language} /> : null}
            {bankAccountName ? <CopyField label={t(language, { zh: "账户名称", en: "Account name" })} value={bankAccountName} language={language} /> : null}
            {bankAccountNumber ? <CopyField label={t(language, { zh: "账号", en: "Account number" })} value={bankAccountNumber} language={language} /> : null}
            {bankTransferNote ? <CopyField label={t(language, { zh: "备注", en: "Reference" })} value={bankTransferNote} language={language} /> : null}
          </div>
        ) : (
          <p className="text-sm text-[#8c3a1f]">
            {t(language, {
              zh: "尚未设置汇款资料。请在 Vercel 或 .env.local 加入 BANK_ACCOUNT_NAME、BANK_ACCOUNT_NUMBER、BANK_BANK_NAME，可选 BANK_TRANSFER_NOTE。",
              en: "Transfer details are not configured yet. Add BANK_ACCOUNT_NAME, BANK_ACCOUNT_NUMBER, BANK_BANK_NAME, and optional BANK_TRANSFER_NOTE in Vercel or .env.local."
            })}
          </p>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "创建课程", en: "Create Course" })}</h2>
        <form action={createCourse} className="grid gap-3">
          <input className="rounded border p-2" name="title" placeholder={t(language, { zh: "课程标题", en: "Title" })} required />
          <input className="rounded border p-2" name="tagline" placeholder={t(language, { zh: "副标题", en: "Tagline" })} />
          <textarea className="rounded border p-2" name="description" placeholder={t(language, { zh: "课程描述", en: "Description" })} />
          <input className="rounded border p-2" name="duration_text" placeholder={t(language, { zh: "时长", en: "Duration" })} />
          <input className="rounded border p-2" name="level" placeholder={t(language, { zh: "难度级别", en: "Level" })} />
          <input className="rounded border p-2" name="location_text" placeholder={t(language, { zh: "地点", en: "Location" })} />
          <button className="rounded-full bg-ink px-4 py-2 text-white">{t(language, { zh: "创建", en: "Create" })}</button>
        </form>
      </section>

      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "创建场次", en: "Create Session" })}</h2>
        <form action={createSession} className="grid gap-3">
          <select name="course_id" className="rounded border p-2" required>
            <option value="">{t(language, { zh: "选择课程", en: "Select course" })}</option>
            {courses?.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          <input className="rounded border p-2" name="start_at" placeholder={t(language, { zh: "开始时间（ISO）", en: "Start (ISO)" })} required />
          <input className="rounded border p-2" name="end_at" placeholder={t(language, { zh: "结束时间（ISO）", en: "End (ISO)" })} required />
          <input className="rounded border p-2" name="timezone" placeholder={t(language, { zh: "时区", en: "Timezone" })} defaultValue="Asia/Kuala_Lumpur" />
          <input className="rounded border p-2" name="venue_name" placeholder={t(language, { zh: "场地名称", en: "Venue Name" })} />
          <input className="rounded border p-2" name="venue_address" placeholder={t(language, { zh: "场地地址", en: "Venue Address" })} />
          <input className="rounded border p-2" name="capacity" placeholder={t(language, { zh: "人数上限", en: "Capacity" })} type="number" />
          <input className="rounded border p-2" name="price_cents" placeholder={t(language, { zh: "价格（分）", en: "Price (cents)" })} type="number" />
          <input className="rounded border p-2" name="currency" placeholder={t(language, { zh: "货币", en: "Currency" })} defaultValue="MYR" />
          <button className="rounded-full bg-ink px-4 py-2 text-white">{t(language, { zh: "创建场次", en: "Create Session" })}</button>
        </form>
      </section>

      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "课程列表", en: "Courses" })}</h2>
        {courses?.length ? (
          courses.map((course) => (
            <form key={course.id} action={toggleCoursePublish} className="flex items-center justify-between gap-3 border-b pb-2">
              <div>
                <p className="font-medium">{course.title}</p>
                <p className="text-xs text-black/50">{course.tagline}</p>
              </div>
              <input type="hidden" name="id" value={course.id} />
              <select name="is_published" defaultValue={String(course.is_published)} className="rounded border p-2 text-sm">
                <option value="true">{t(language, { zh: "已发布", en: "Published" })}</option>
                <option value="false">{t(language, { zh: "草稿", en: "Draft" })}</option>
              </select>
              <button className="rounded-full bg-ink px-3 py-1 text-xs text-white">{t(language, { zh: "更新", en: "Update" })}</button>
            </form>
          ))
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有课程。", en: "No courses yet." })}</p>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "场次列表", en: "Sessions" })}</h2>
        {sessions?.length ? (
          sessions.map((session) => (
            <form key={session.id} action={updateSessionStatus} className="flex flex-wrap items-center justify-between gap-3 border-b pb-2 text-sm text-black/70">
              <div>
                <p className="font-medium text-[#123524]">{courseMap.get(session.course_id)?.title ?? session.course_id}</p>
                <p>{session.start_at} - {session.end_at}</p>
                <p className="text-xs text-black/50">{session.venue_name || "-"} · {(Number(session.price_cents ?? 0) / 100).toFixed(2)} {session.currency}</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="hidden" name="id" value={session.id} />
                <select name="status" defaultValue={session.status} className="rounded border p-2 text-sm">
                  <option value="DRAFT">{t(language, { zh: "草稿", en: "Draft" })}</option>
                  <option value="PUBLISHED">{t(language, { zh: "开放报名", en: "Published" })}</option>
                  <option value="CANCELLED">{t(language, { zh: "已取消", en: "Cancelled" })}</option>
                </select>
                <button className="rounded-full bg-ink px-3 py-1 text-xs text-white">{t(language, { zh: "更新", en: "Update" })}</button>
              </div>
            </form>
          ))
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有场次。", en: "No sessions yet." })}</p>
        )}
      </section>

      <section className="card space-y-3">
        <div className="space-y-1">
          <h2 className="font-display text-2xl">{t(language, { zh: "汇款审核", en: "Transfer review" })}</h2>
          <p className="text-sm text-black/60">{t(language, { zh: "会员报名收费课程后，会在这里出现待审核订单。确认收到汇款后，系统会自动锁定席位。", en: "Paid program reservations appear here for review. Once transfer is confirmed, the system will lock the seat automatically." })}</p>
        </div>
        {pendingOrders?.length ? (
          pendingOrders.map((order) => {
            const session = order.course_session_id ? sessionMap.get(order.course_session_id) : null;
            const course = session ? courseMap.get(session.course_id) : null;
            const member = profileMap.get(order.user_id);

            return (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-[#123524]">{course?.title ?? t(language, { zh: "课程报名", en: "Program order" })}</p>
                  <p className="text-black/60">
                    {(member?.name || member?.referral_code || order.user_id)} · {Number(order.amount_total ?? 0).toFixed(2)} {order.currency}
                  </p>
                  {session ? <p className="text-black/50">{session.start_at} · {session.venue_name || "-"}</p> : null}
                  <p className="text-black/50">{new Date(order.created_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}</p>
                  {order.slip_url ? (
                    <a href={order.slip_url} target="_blank" rel="noreferrer" className="text-jade underline underline-offset-4">
                      {t(language, { zh: "查看单据", en: "View slip" })}
                    </a>
                  ) : (
                    <p className="text-[#8c3a1f]">{t(language, { zh: "会员尚未上传单据。", en: "Member has not uploaded a slip yet." })}</p>
                  )}
                </div>
                <form action={approveCourseTransfer}>
                  <input type="hidden" name="order_id" value={order.id} />
                  <button className="rounded-full bg-[linear-gradient(135deg,#c8a55c,#e6c88f)] px-4 py-2 text-sm font-semibold text-[#123524]">
                    {t(language, { zh: "确认已汇款", en: "Mark paid" })}
                  </button>
                </form>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "目前没有待审核的课程汇款订单。", en: "There are no pending program transfer orders." })}</p>
        )}
      </section>
    </div>
  );
}
