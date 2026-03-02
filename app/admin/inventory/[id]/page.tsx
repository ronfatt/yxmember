import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../lib/actions/session";
import { getCurrentLanguage } from "../../../../lib/i18n/server";
import { t } from "../../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

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
  if (movementType === "in") nextStock += quantity;
  else if (movementType === "out") nextStock = Math.max(0, nextStock - quantity);
  else nextStock = quantity;

  await admin.from("stock_movements").insert({
    product_id: productId,
    movement_type: movementType,
    quantity,
    order_id: null,
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

  revalidatePath(`/admin/inventory/${productId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

function createQueryString(params: Record<string, string | null | undefined>) {
  const next = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim()) next.set(key, value);
  });
  const query = next.toString();
  return query ? `?${query}` : "";
}

export default async function AdminInventoryDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  await requireAdmin();
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const fromDate = typeof resolvedSearchParams.from === "string" ? resolvedSearchParams.from : "";
  const toDate = typeof resolvedSearchParams.to === "string" ? resolvedSearchParams.to : "";

  const { data: product } = await admin
    .from("products")
    .select("id,title,sku,price_myr,stock_on_hand,track_inventory,allow_backorder,is_published,updated_at")
    .eq("id", id)
    .single();

  if (!product) notFound();

  let movementQuery = admin
    .from("stock_movements")
    .select("id,product_id,order_id,movement_type,quantity,note,created_at")
    .eq("product_id", id)
    .order("created_at", { ascending: false })
    .limit(300);
  if (fromDate) movementQuery = movementQuery.gte("created_at", `${fromDate}T00:00:00+08:00`);
  if (toDate) movementQuery = movementQuery.lte("created_at", `${toDate}T23:59:59.999+08:00`);

  let orderQuery = admin
    .from("orders")
    .select("id,user_id,product_id,quantity,amount_total,cash_paid,payment_status,created_at")
    .eq("order_type", "product")
    .eq("product_id", id)
    .order("created_at", { ascending: false })
    .limit(300);
  if (fromDate) orderQuery = orderQuery.gte("created_at", `${fromDate}T00:00:00+08:00`);
  if (toDate) orderQuery = orderQuery.lte("created_at", `${toDate}T23:59:59.999+08:00`);

  const [{ data: movements }, { data: orders }] = await Promise.all([movementQuery, orderQuery]);
  const buyerIds = Array.from(new Set((orders ?? []).map((order) => order.user_id).filter(Boolean)));
  const { data: buyers } = buyerIds.length
    ? await admin.from("users_profile").select("id,name,referral_code").in("id", buyerIds)
    : { data: [] as Array<{ id: string; name: string | null; referral_code: string | null }> };
  const buyerMap = new Map((buyers ?? []).map((buyer) => [buyer.id, buyer]));
  const movementCount = movements?.length ?? 0;
  const totalUnitsSold = (orders ?? []).reduce((sum, order) => sum + Number(order.quantity ?? 0), 0);

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Link href="/admin/inventory" className="text-sm text-black/55 underline underline-offset-4">
              {t(language, { zh: "返回库存工作台", en: "Back to inventory workbench" })}
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-black/45">{product.sku || t(language, { zh: "未设 SKU", en: "No SKU" })}</p>
              <h1 className="font-display text-4xl text-[#123524]">{product.title}</h1>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-[#edf5ef] px-3 py-1 text-jade">
                {t(language, { zh: `当前库存 ${product.stock_on_hand}`, en: `${product.stock_on_hand} in stock` })}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-black/55">RM {Number(product.price_myr ?? 0).toFixed(2)}</span>
              {product.allow_backorder ? (
                <span className="rounded-full bg-[#f7f2e7] px-3 py-1 text-[#8b6b2b]">
                  {t(language, { zh: "允许预订", en: "Backorders allowed" })}
                </span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-[#faf7f0] px-4 py-3">
              <p className="text-xs text-black/45">{t(language, { zh: "库存流水", en: "Movements" })}</p>
              <p className="font-display text-2xl text-[#123524]">{movementCount}</p>
            </div>
            <div className="rounded-2xl bg-[#faf7f0] px-4 py-3">
              <p className="text-xs text-black/45">{t(language, { zh: "订单数量", en: "Orders" })}</p>
              <p className="font-display text-2xl text-[#123524]">{orders?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-[#faf7f0] px-4 py-3">
              <p className="text-xs text-black/45">{t(language, { zh: "累计售出", en: "Units sold" })}</p>
              <p className="font-display text-2xl text-[#123524]">{totalUnitsSold}</p>
            </div>
          </div>
        </div>

        <form className="grid gap-3 md:grid-cols-[160px,160px,auto,auto]">
          <input type="date" name="from" defaultValue={fromDate} className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm" />
          <input type="date" name="to" defaultValue={toDate} className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm" />
          <button className="rounded-full bg-[#123524] px-5 py-3 text-sm font-semibold text-white">
            {t(language, { zh: "筛选日期", en: "Filter dates" })}
          </button>
          <Link href={`/admin/inventory/${id}`} className="rounded-full border border-black/10 px-5 py-3 text-sm text-black/65">
            {t(language, { zh: "清除", en: "Reset" })}
          </Link>
        </form>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/inventory/export${createQueryString({ productId: id, from: fromDate || undefined, to: toDate || undefined })}`}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/70"
          >
            {t(language, { zh: "导出该产品 CSV", en: "Export this product CSV" })}
          </Link>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "快速录入库存", en: "Quick stock entry" })}</h2>
          <p className="text-sm text-black/60">{t(language, { zh: "为这项产品直接记录入库、扣减或盘点调整。", en: "Log stock in, stock out, or a stocktake adjustment for this product." })}</p>
        </div>
        <form action={addInventoryMovement} className="grid gap-3 md:grid-cols-[0.9fr,0.8fr,1fr,auto]">
          <input type="hidden" name="product_id" value={product.id} />
          <select name="movement_type" className="rounded border p-2 text-sm" defaultValue="in">
            <option value="in">{t(language, { zh: "入库", en: "Stock in" })}</option>
            <option value="out">{t(language, { zh: "扣减", en: "Stock out" })}</option>
            <option value="adjust">{t(language, { zh: "盘点调整", en: "Set stock" })}</option>
          </select>
          <input className="rounded border p-2" name="quantity" type="number" min="1" placeholder={t(language, { zh: "数量", en: "Quantity" })} required />
          <input className="rounded border p-2" name="note" placeholder={t(language, { zh: "备注，例如：补货 / 样品 / 盘点", en: "Note, e.g. restock / sample / stocktake" })} />
          <button className="rounded-full bg-[linear-gradient(135deg,#c8a55c,#e6c88f)] px-4 py-2 text-sm font-semibold text-[#123524]">
            {t(language, { zh: "记录库存", en: "Log movement" })}
          </button>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "库存流水", en: "Stock movements" })}</h2>
          {(movements ?? []).length ? (
            <div className="space-y-2">
              {(movements ?? []).map((movement) => (
                <div key={movement.id} className="rounded-2xl border border-black/8 bg-[#faf7f0] px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
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
                      {movement.order_id ? (
                        <p className="text-xs text-jade">
                          {t(language, { zh: "关联订单：", en: "Linked order: " })}#{movement.order_id.slice(0, 8)}
                        </p>
                      ) : null}
                      <p className="text-xs text-black/50">{movement.note || t(language, { zh: "没有备注", en: "No note" })}</p>
                    </div>
                    <p className="text-xs text-black/45">
                      {new Date(movement.created_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/55">{t(language, { zh: "这段时间没有库存流水。", en: "No stock movements in this period." })}</p>
          )}
        </div>

        <div className="card space-y-3">
          <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "产品订单明细", en: "Product order details" })}</h2>
          {(orders ?? []).length ? (
            <div className="space-y-2">
              {(orders ?? []).map((order) => {
                const buyer = buyerMap.get(order.user_id);
                return (
                  <div key={order.id} className="rounded-2xl border border-black/8 bg-[#f7faf7] px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#123524]">
                          {buyer?.name ?? t(language, { zh: "会员", en: "Member" })}
                          {buyer?.referral_code ? ` (${buyer.referral_code})` : ""}
                        </p>
                        <p className="text-xs text-black/50">
                          {t(language, { zh: "数量", en: "Qty" })} {order.quantity ?? 1}
                          {" · "}
                          RM {Number(order.amount_total ?? order.cash_paid ?? 0).toFixed(2)}
                          {" · "}
                          {order.payment_status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-jade">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-black/45">
                          {new Date(order.created_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-black/55">{t(language, { zh: "这段时间没有产品订单。", en: "No product orders in this period." })}</p>
          )}
        </div>
      </section>
    </div>
  );
}
