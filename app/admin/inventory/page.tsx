import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../lib/supabase/admin";

async function addInventoryMovement(formData: FormData) {
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

  if (!product) return;

  const quantity = Math.abs(Math.trunc(rawQuantity));
  if (!quantity) return;

  let nextStock = Number(product.stock_on_hand ?? 0);
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

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export default async function AdminInventoryPage() {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  const [{ data: products }, { data: movements }] = await Promise.all([
    admin
      .from("products")
      .select("id,title,sku,stock_on_hand,track_inventory,allow_backorder,is_published,updated_at")
      .order("updated_at", { ascending: false }),
    admin
      .from("stock_movements")
      .select("id,product_id,movement_type,quantity,note,created_at")
      .order("created_at", { ascending: false })
      .limit(150)
  ]);

  const movementMap = new Map<string, typeof movements>();
  (movements ?? []).forEach((movement) => {
    const list = movementMap.get(movement.product_id) ?? [];
    list.push(movement);
    movementMap.set(movement.product_id, list);
  });

  const trackedProducts = (products ?? []).filter((product) => product.track_inventory);
  const lowStock = trackedProducts.filter((product) => Number(product.stock_on_hand ?? 0) <= 5);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card space-y-2">
          <p className="text-sm text-black/55">{t(language, { zh: "追踪库存产品", en: "Tracked products" })}</p>
          <p className="font-display text-3xl text-[#123524]">{trackedProducts.length}</p>
          <p className="text-sm text-black/60">{t(language, { zh: "当前启用库存追踪的产品数量。", en: "Products currently using inventory tracking." })}</p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-black/55">{t(language, { zh: "低库存提醒", en: "Low stock alerts" })}</p>
          <p className="font-display text-3xl text-[#8c3a1f]">{lowStock.length}</p>
          <p className="text-sm text-black/60">{t(language, { zh: "库存少于或等于 5 的产品。", en: "Products with stock at or below 5 units." })}</p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-black/55">{t(language, { zh: "最近流水", en: "Recent movements" })}</p>
          <p className="font-display text-3xl text-[#123524]">{movements?.length ?? 0}</p>
          <p className="text-sm text-black/60">{t(language, { zh: "已加载最近 150 条库存流水。", en: "Showing the latest 150 stock movements." })}</p>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "库存管理", en: "Inventory management" })}</h2>
          <p className="text-sm text-black/60">{t(language, { zh: "在这里查看当前库存、输入进出货，或直接做盘点调整。", en: "View stock on hand, log incoming or outgoing units, or make a stocktake adjustment." })}</p>
        </div>

        {trackedProducts.length ? (
          <div className="space-y-4">
            {trackedProducts.map((product) => (
              <div key={product.id} className="rounded-3xl border border-black/10 bg-white px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-display text-2xl text-[#123524]">{product.title}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-black/45">{product.sku || t(language, { zh: "未设 SKU", en: "No SKU" })}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-[#edf5ef] px-3 py-1 text-jade">
                        {t(language, { zh: `当前库存 ${product.stock_on_hand}`, en: `${product.stock_on_hand} in stock` })}
                      </span>
                      {Number(product.stock_on_hand ?? 0) <= 5 ? (
                        <span className="rounded-full bg-[#fff4e8] px-3 py-1 text-[#8c3a1f]">
                          {t(language, { zh: "低库存", en: "Low stock" })}
                        </span>
                      ) : null}
                      {product.allow_backorder ? (
                        <span className="rounded-full bg-[#f7f2e7] px-3 py-1 text-[#8b6b2b]">
                          {t(language, { zh: "允许预订", en: "Backorders allowed" })}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-white px-3 py-1 text-black/55">
                        {product.is_published ? t(language, { zh: "已发布", en: "Published" }) : t(language, { zh: "草稿", en: "Draft" })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-black/45">
                    {t(language, { zh: "更新于：", en: "Updated: " })}
                    {new Date(product.updated_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}
                  </p>
                </div>

                <form action={addInventoryMovement} className="mt-4 grid gap-3 md:grid-cols-[0.9fr,0.8fr,1fr,auto]">
                  <input type="hidden" name="product_id" value={product.id} />
                  <select name="movement_type" className="rounded border p-2 text-sm" defaultValue="in">
                    <option value="in">{t(language, { zh: "入库", en: "Stock in" })}</option>
                    <option value="out">{t(language, { zh: "扣减", en: "Stock out" })}</option>
                    <option value="adjust">{t(language, { zh: "盘点调整", en: "Set stock" })}</option>
                  </select>
                  <input className="rounded border p-2" name="quantity" type="number" min="1" placeholder={t(language, { zh: "数量", en: "Quantity" })} required />
                  <input className="rounded border p-2" name="note" placeholder={t(language, { zh: "备注，例如：补货 / 破损 / 盘点", en: "Note, e.g. restock / damage / stocktake" })} />
                  <button className="rounded-full bg-[linear-gradient(135deg,#c8a55c,#e6c88f)] px-4 py-2 text-sm font-semibold text-[#123524]">
                    {t(language, { zh: "记录库存", en: "Log movement" })}
                  </button>
                </form>

                <div className="mt-4 space-y-2">
                  {(movementMap.get(product.id) ?? []).slice(0, 5).length ? (
                    (movementMap.get(product.id) ?? []).slice(0, 5).map((movement) => (
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
                    ))
                  ) : (
                    <p className="text-sm text-black/55">{t(language, { zh: "这项产品还没有库存流水。", en: "This product has no stock movements yet." })}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "目前没有启用库存追踪的产品。请先到产品页启用库存追踪。", en: "No products are currently using inventory tracking. Enable it from the products page first." })}</p>
        )}
      </section>
    </div>
  );
}
