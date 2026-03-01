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

export default async function AdminMentorsPage() {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  const { data: mentors } = await admin.from("mentors").select("*").order("sort_order", { ascending: true });

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
        <h2 className="font-display text-2xl">{t(language, { zh: "导师列表", en: "Mentors" })}</h2>
        {mentors?.length ? (
          mentors.map((mentor) => (
            <div key={mentor.id} className="border-b pb-2">
              <p className="font-medium">{mentor.display_name}</p>
              <p className="text-xs text-black/50">{mentor.bio}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有导师。", en: "No mentors yet." })}</p>
        )}
      </section>
    </div>
  );
}
