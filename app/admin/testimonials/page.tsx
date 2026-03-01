import { revalidatePath } from "next/cache";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../lib/supabase/admin";

async function updateStatus(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await admin.from("testimonials").update({ status, approved_at: status === "APPROVED" ? new Date().toISOString() : null }).eq("id", id);
  revalidatePath("/admin/testimonials");
}

export default async function AdminTestimonialsPage() {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  const { data: testimonials } = await admin.from("testimonials").select("*").order("created_at", { ascending: false });

  return (
    <div className="card space-y-3">
      <h2 className="font-display text-2xl">{t(language, { zh: "见证反馈", en: "Testimonials" })}</h2>
      {testimonials?.length ? (
        testimonials.map((item) => (
          <form key={item.id} action={updateStatus} className="flex items-center justify-between gap-3 border-b pb-2">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-black/50">{item.content}</p>
            </div>
            <input type="hidden" name="id" value={item.id} />
            <select name="status" defaultValue={item.status} className="rounded border p-2 text-sm">
              <option value="PENDING">{t(language, { zh: "待审核", en: "PENDING" })}</option>
              <option value="APPROVED">{t(language, { zh: "已通过", en: "APPROVED" })}</option>
              <option value="REJECTED">{t(language, { zh: "已拒绝", en: "REJECTED" })}</option>
            </select>
            <button className="rounded-full bg-ink px-3 py-1 text-xs text-white">{t(language, { zh: "更新", en: "Update" })}</button>
          </form>
        ))
      ) : (
        <p className="text-sm text-black/60">{t(language, { zh: "还没有见证反馈。", en: "No testimonials yet." })}</p>
      )}
    </div>
  );
}
