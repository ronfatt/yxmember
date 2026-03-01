import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../lib/actions/session";
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

async function addStockMovement(formData: FormData) {
  "use server";
  const adminUser = await requireAdmin();
  const admin = supabaseAdmin();
  const productId = String(formData.get("product_id"));
  const movementType = String(formData.get("movement_type"));
  const rawQuantity = Number(formData.get("quantity") || 0);
  const note = String(formData.get("note") || "") || null;

  const { data: product } = await admin
    .from("products")
    .select("id,stock_on_hand")
    .eq("id", productId)
    .single();

  if (!product) {
    return;
  }

  let nextStock = Number(product.stock_on_hand ?? 0);
  const quantity = Math.abs(Math.trunc(rawQuantity));

  if (!quantity) {
    return;
  }

  if (movementType === "in") {
    nextStock += quantity;
  } else if (movementType === "out") {
    nextStock = Math.max(0, nextStock - quantity);
  } else {
    nextStock = quantity;
  }

  await admin.from("stock_movements").insert({
    product_id: productId,
    movement_type: movementType,
    quantity,
    note,
    created_by: adminUser.id
  });

  await admin
    .from("products")
    .update({
      stock_on_hand: nextStock,
      updated_at: new Date().toISOString()
    })
    .eq("id", productId);

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export default async function AdminProductsPage() {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  const [{ data: products }, { data: movements }] = await Promise.all([
    admin.from("products").select("*").order("created_at", { ascending: false }),
    admin
      .from("stock_movements")
      .select("id,product_id,movement_type,quantity,note,created_at")
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  const movementsByProduct = new Map<string, typeof movements>();
  (movements ?? []).forEach((movement) => {
    const list = movementsByProduct.get(movement.product_id) ?? [];
    list.push(movement);
    movementsByProduct.set(movement.product_id, list);
  });

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
                    {product.track_inventory && Number(product.stock_on_hand ?? 0) <= 5 ? (
                      <p className="mt-1 text-xs font-medium text-[#8c3a1f]">
                        {t(language, { zh: `低库存提醒：当前剩余 ${product.stock_on_hand}`, en: `Low stock warning: ${product.stock_on_hand} left` })}
                      </p>
                    ) : null}
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

                <div className="space-y-3 border-t border-black/10 pt-4">
                  <div className="space-y-1">
                    <p className="font-medium text-[#123524]">{t(language, { zh: "库存流水", en: "Stock movement" })}</p>
                    <p className="text-xs text-black/50">{t(language, { zh: "记录进货、扣减或盘点调整，系统会自动回写当前库存。", en: "Log incoming stock, deductions, or stocktakes. Current stock will be updated automatically." })}</p>
                  </div>

                  <form action={addStockMovement} className="grid gap-3 md:grid-cols-[0.9fr,0.8fr,1fr,auto]">
                    <input type="hidden" name="product_id" value={product.id} />
                    <select name="movement_type" className="rounded border p-2 text-sm" defaultValue="in">
                      <option value="in">{t(language, { zh: "入库", en: "Stock in" })}</option>
                      <option value="out">{t(language, { zh: "扣减", en: "Stock out" })}</option>
                      <option value="adjust">{t(language, { zh: "盘点调整", en: "Set stock" })}</option>
                    </select>
                    <input className="rounded border p-2" name="quantity" type="number" min="1" placeholder={t(language, { zh: "数量", en: "Quantity" })} required />
                    <input className="rounded border p-2" name="note" placeholder={t(language, { zh: "备注，例如：到货 / 损耗 / 样品", en: "Note, e.g. delivery / damage / sample" })} />
                    <button className="rounded-full bg-[linear-gradient(135deg,#c8a55c,#e6c88f)] px-4 py-2 text-sm font-semibold text-[#123524]">
                      {t(language, { zh: "记录", en: "Log" })}
                    </button>
                  </form>

                  {movementsByProduct.get(product.id)?.length ? (
                    <div className="space-y-2">
                      {movementsByProduct.get(product.id)!.slice(0, 5).map((movement) => (
                        <div key={movement.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-[#faf7f0] px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium text-[#123524]">
                              {movement.movement_type === "in"
                                ? t(language, { zh: "入库", en: "Stock in" })
                                : movement.movement_type === "out"
                                  ? t(language, { zh: "扣减", en: "Stock out" })
                                  : t(language, { zh: "盘点调整", en: "Set stock" })}
                              {" · "}
                              {movement.quantity}
                            </p>
                            <p className="text-xs text-black/50">{movement.note || t(language, { zh: "没有备注", en: "No note" })}</p>
                          </div>
                          <p className="text-xs text-black/45">
                            {new Date(movement.created_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-black/55">{t(language, { zh: "还没有库存流水。", en: "No stock movements yet." })}</p>
                  )}
                </div>
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
