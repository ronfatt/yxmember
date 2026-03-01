import { revalidatePath } from "next/cache";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../lib/supabase/admin";

async function createProduct(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const title = String(formData.get("title") || "");
  const subtitle = String(formData.get("subtitle") || "");
  const description = String(formData.get("description") || "");
  await admin.from("products").insert({
    title,
    subtitle,
    description,
    benefits: [],
    faq: [],
    images: [],
    is_published: false
  });
  revalidatePath("/admin/products");
}

async function togglePublish(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const id = String(formData.get("id"));
  const is_published = formData.get("is_published") === "true";
  await admin.from("products").update({ is_published }).eq("id", id);
  revalidatePath("/admin/products");
}

export default async function AdminProductsPage() {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  const { data: products } = await admin.from("products").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "创建产品", en: "Create Product" })}</h2>
        <form action={createProduct} className="grid gap-3">
          <input className="rounded border p-2" name="title" placeholder={t(language, { zh: "产品标题", en: "Title" })} required />
          <input className="rounded border p-2" name="subtitle" placeholder={t(language, { zh: "副标题", en: "Subtitle" })} />
          <textarea className="rounded border p-2" name="description" placeholder={t(language, { zh: "产品描述", en: "Description" })} />
          <button className="rounded-full bg-ink px-4 py-2 text-white">{t(language, { zh: "创建", en: "Create" })}</button>
        </form>
      </section>
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "产品列表", en: "Products" })}</h2>
        <div className="space-y-3">
          {products?.length ? (
            products.map((product) => (
              <form key={product.id} action={togglePublish} className="flex items-center justify-between gap-3 border-b pb-2">
                <div>
                  <p className="font-medium">{product.title}</p>
                  <p className="text-xs text-black/50">{product.subtitle}</p>
                </div>
                <input type="hidden" name="id" value={product.id} />
                <select name="is_published" defaultValue={String(product.is_published)} className="rounded border p-2 text-sm">
                  <option value="true">{t(language, { zh: "已发布", en: "Published" })}</option>
                  <option value="false">{t(language, { zh: "草稿", en: "Draft" })}</option>
                </select>
                <button className="rounded-full bg-ink px-3 py-1 text-xs text-white">{t(language, { zh: "更新", en: "Update" })}</button>
              </form>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有产品。", en: "No products yet." })}</p>
          )}
        </div>
      </section>
    </div>
  );
}
