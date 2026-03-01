import { revalidatePath } from "next/cache";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
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
}

export default async function AdminCoursesPage() {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  const { data: courses } = await admin.from("courses").select("*").order("created_at", { ascending: false });
  const { data: sessions } = await admin.from("course_sessions").select("*").order("start_at", { ascending: true });

  return (
    <div className="space-y-6">
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
            <div key={session.id} className="border-b pb-2 text-sm text-black/70">
              {session.start_at} - {session.end_at} ({session.status})
            </div>
          ))
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有场次。", en: "No sessions yet." })}</p>
        )}
      </section>
    </div>
  );
}
