import { revalidatePath } from "next/cache";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../lib/supabase/admin";

async function createMentor(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  await admin.from("mentors").insert({
    display_name: String(formData.get("display_name")),
    bio: String(formData.get("bio") || ""),
    specialties: String(formData.get("specialties") || "").split(",").map((s) => s.trim()).filter(Boolean),
    locations: [],
    avatar_url: null,
    is_active: true,
    sort_order: Number(formData.get("sort_order") || 0)
  });
  revalidatePath("/admin/mentors");
}

async function createService(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  await admin.from("mentor_services").insert({
    mentor_id: String(formData.get("mentor_id")),
    name: String(formData.get("name")),
    duration_min: Number(formData.get("duration_min")),
    price_total: Number(formData.get("price_total")),
    deposit_amount: Number(formData.get("deposit_amount") || 0),
    allow_points: formData.get("allow_points") === "on",
    active: true
  });
  revalidatePath("/admin/mentors");
}

async function createAvailabilityRule(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  await admin.from("mentor_availability_rules").insert({
    mentor_id: String(formData.get("mentor_id")),
    weekday: Number(formData.get("weekday")),
    start_time: String(formData.get("start_time")),
    end_time: String(formData.get("end_time")),
    slot_interval_min: Number(formData.get("slot_interval_min") || 30),
    timezone: "Asia/Kuala_Lumpur",
    active: true
  });
  revalidatePath("/admin/mentors");
}

export default async function AdminMentorsPage() {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  const [{ data: mentors }, { data: services }, { data: rules }] = await Promise.all([
    admin.from("mentors").select("*").order("sort_order", { ascending: true }),
    admin.from("mentor_services").select("*").order("created_at", { ascending: false }),
    admin.from("mentor_availability_rules").select("*").order("weekday", { ascending: true })
  ]);

  const serviceMap = new Map<string, Array<{ id: string; name: string; duration_min: number; price_total: number }>>();
  for (const service of services ?? []) {
    const existing = serviceMap.get(service.mentor_id) ?? [];
    existing.push(service);
    serviceMap.set(service.mentor_id, existing);
  }
  const ruleMap = new Map<string, Array<{ id: string; weekday: number; start_time: string; end_time: string }>>();
  for (const rule of rules ?? []) {
    const existing = ruleMap.get(rule.mentor_id) ?? [];
    existing.push(rule);
    ruleMap.set(rule.mentor_id, existing);
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "创建导师", en: "Create Mentor" })}</h2>
        <form action={createMentor} className="grid gap-3">
          <input className="rounded border p-2" name="display_name" placeholder={t(language, { zh: "导师名称", en: "Display name" })} required />
          <textarea className="rounded border p-2" name="bio" placeholder={t(language, { zh: "导师简介", en: "Bio" })} />
          <input className="rounded border p-2" name="specialties" placeholder={t(language, { zh: "专长（逗号分隔）", en: "Specialties (comma separated)" })} />
          <input className="rounded border p-2" name="sort_order" placeholder={t(language, { zh: "排序", en: "Sort order" })} type="number" />
          <button className="rounded-full bg-ink px-4 py-2 text-white">{t(language, { zh: "创建", en: "Create" })}</button>
        </form>
      </section>
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "新增服务", en: "Create service" })}</h2>
        <form action={createService} className="grid gap-3 md:grid-cols-2">
          <select className="rounded border p-2" name="mentor_id" required>
            <option value="">{t(language, { zh: "选择导师", en: "Select mentor" })}</option>
            {mentors?.map((mentor) => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.display_name}
              </option>
            ))}
          </select>
          <input className="rounded border p-2" name="name" placeholder={t(language, { zh: "服务名称", en: "Service name" })} required />
          <select className="rounded border p-2" name="duration_min" required>
            <option value="30">30</option>
            <option value="60">60</option>
            <option value="90">90</option>
          </select>
          <input className="rounded border p-2" name="price_total" placeholder="RM" type="number" step="0.01" required />
          <input className="rounded border p-2" name="deposit_amount" placeholder={t(language, { zh: "订金参考", en: "Deposit amount" })} type="number" step="0.01" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="allow_points" defaultChecked />
            <span>{t(language, { zh: "允许积分抵扣", en: "Allow points" })}</span>
          </label>
          <button className="rounded-full bg-ink px-4 py-2 text-white md:col-span-2">{t(language, { zh: "新增服务", en: "Add service" })}</button>
        </form>
      </section>
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "新增每周时段", en: "Create weekly rule" })}</h2>
        <form action={createAvailabilityRule} className="grid gap-3 md:grid-cols-2">
          <select className="rounded border p-2" name="mentor_id" required>
            <option value="">{t(language, { zh: "选择导师", en: "Select mentor" })}</option>
            {mentors?.map((mentor) => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.display_name}
              </option>
            ))}
          </select>
          <select className="rounded border p-2" name="weekday" required>
            <option value="1">{t(language, { zh: "周一", en: "Monday" })}</option>
            <option value="2">{t(language, { zh: "周二", en: "Tuesday" })}</option>
            <option value="3">{t(language, { zh: "周三", en: "Wednesday" })}</option>
            <option value="4">{t(language, { zh: "周四", en: "Thursday" })}</option>
            <option value="5">{t(language, { zh: "周五", en: "Friday" })}</option>
            <option value="6">{t(language, { zh: "周六", en: "Saturday" })}</option>
            <option value="0">{t(language, { zh: "周日", en: "Sunday" })}</option>
          </select>
          <input className="rounded border p-2" name="start_time" type="time" required />
          <input className="rounded border p-2" name="end_time" type="time" required />
          <input className="rounded border p-2" name="slot_interval_min" type="number" defaultValue={30} />
          <button className="rounded-full bg-ink px-4 py-2 text-white md:col-span-2">{t(language, { zh: "新增时段规则", en: "Add rule" })}</button>
        </form>
      </section>
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "导师列表", en: "Mentors" })}</h2>
        {mentors?.length ? (
          mentors.map((mentor) => (
            <div key={mentor.id} className="border-b pb-2">
              <p className="font-medium">{mentor.display_name}</p>
              <p className="text-xs text-black/50">{mentor.bio}</p>
              <p className="text-xs text-black/50">
                {t(language, { zh: "服务", en: "Services" })} · {(serviceMap.get(mentor.id) ?? []).map((service) => `${service.name} (${service.duration_min})`).join(", ") || "-"}
              </p>
              <p className="text-xs text-black/50">
                {t(language, { zh: "每周时段", en: "Weekly rules" })} · {(ruleMap.get(mentor.id) ?? []).map((rule) => `${rule.weekday} ${rule.start_time}-${rule.end_time}`).join(", ") || "-"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有导师。", en: "No mentors yet." })}</p>
        )}
      </section>
    </div>
  );
}
