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
    sku: String(formData.get("sku") || "") || null,
    title,
    subtitle,
    description,
    price_myr: formData.get("price_myr") ? Number(formData.get("price_myr")) : null,
    stock_on_hand: Number(formData.get("stock_on_hand") || 0),
    track_inventory: formData.get("track_inventory") === "true",
    allow_backorder: formData.get("allow_backorder") === "true",
    benefits: [],
    faq: [],
    images: [],
    is_published: false
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

async function togglePublish(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const id = String(formData.get("id"));
  const is_published = formData.get("is_published") === "true";
  await admin.from("products").update({ is_published }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

async function updateStock(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const id = String(formData.get("id"));
  await admin
    .from("products")
    .update({
      sku: String(formData.get("sku") || "") || null,
      price_myr: formData.get("price_myr") ? Number(formData.get("price_myr")) : null,
      stock_on_hand: Number(formData.get("stock_on_hand") || 0),
      track_inventory: formData.get("track_inventory") === "true",
      allow_backorder: formData.get("allow_backorder") === "true",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/products");
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
          <input className="rounded border p-2" name="sku" placeholder={t(language, { zh: "SKU / 编号", en: "SKU" })} />
          <input className="rounded border p-2" name="subtitle" placeholder={t(language, { zh: "副标题", en: "Subtitle" })} />
          <textarea className="rounded border p-2" name="description" placeholder={t(language, { zh: "产品描述", en: "Description" })} />
          <input className="rounded border p-2" name="price_myr" type="number" step="0.01" placeholder={t(language, { zh: "价格（MYR）", en: "Price (MYR)" })} />
          <input className="rounded border p-2" name="stock_on_hand" type="number" placeholder={t(language, { zh: "当前库存", en: "Stock on hand" })} defaultValue="0" />
          <select name="track_inventory" className="rounded border p-2 text-sm" defaultValue="true">
            <option value="true">{t(language, { zh: "追踪库存", en: "Track inventory" })}</option>
            <option value="false">{t(language, { zh: "不追踪库存", en: "Do not track inventory" })}</option>
          </select>
          <select name="allow_backorder" className="rounded border p-2 text-sm" defaultValue="false">
            <option value="false">{t(language, { zh: "不可超卖", en: "No backorders" })}</option>
            <option value="true">{t(language, { zh: "允许预订 / 超卖", en: "Allow backorders" })}</option>
          </select>
          <button className="rounded-full bg-ink px-4 py-2 text-white">{t(language, { zh: "创建", en: "Create" })}</button>
        </form>
      </section>
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "产品列表", en: "Products" })}</h2>
        <div className="space-y-3">
          {products?.length ? (
            products.map((product) => (
              <div key={product.id} className="space-y-3 rounded-3xl border border-black/10 bg-white px-4 py-4">
                <form action={togglePublish} className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-xs text-black/50">{product.subtitle}</p>
                  </div>
                  <input type="hidden" name="id" value={product.id} />
                  <select name="is_published" defaultValue={String(product.is_published)} className="rounded border p-2 text-sm">
                    <option value="true">{t(language, { zh: "已发布", en: "Published" })}</option>
                    <option value="false">{t(language, { zh: "草稿", en: "Draft" })}</option>
                  </select>
                  <button className="rounded-full bg-ink px-3 py-1 text-xs text-white">{t(language, { zh: "更新发布状态", en: "Update publish state" })}</button>
                </form>

                <form action={updateStock} className="grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={product.id} />
                  <input className="rounded border p-2" name="sku" defaultValue={product.sku ?? ""} placeholder={t(language, { zh: "SKU / 编号", en: "SKU" })} />
                  <input className="rounded border p-2" name="price_myr" type="number" step="0.01" defaultValue={product.price_myr ?? ""} placeholder={t(language, { zh: "价格（MYR）", en: "Price (MYR)" })} />
                  <input className="rounded border p-2" name="stock_on_hand" type="number" defaultValue={product.stock_on_hand ?? 0} placeholder={t(language, { zh: "当前库存", en: "Stock on hand" })} />
                  <select name="track_inventory" defaultValue={String(product.track_inventory ?? true)} className="rounded border p-2 text-sm">
                    <option value="true">{t(language, { zh: "追踪库存", en: "Track inventory" })}</option>
                    <option value="false">{t(language, { zh: "不追踪库存", en: "Do not track inventory" })}</option>
                  </select>
                  <select name="allow_backorder" defaultValue={String(product.allow_backorder ?? false)} className="rounded border p-2 text-sm">
                    <option value="false">{t(language, { zh: "不可超卖", en: "No backorders" })}</option>
                    <option value="true">{t(language, { zh: "允许预订 / 超卖", en: "Allow backorders" })}</option>
                  </select>
                  <button className="rounded-full bg-[#123524] px-4 py-2 text-sm text-white md:justify-self-start">{t(language, { zh: "更新库存资料", en: "Update stock details" })}</button>
                </form>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有产品。", en: "No products yet." })}</p>
          )}
        </div>
      </section>
    </div>
  );
}
