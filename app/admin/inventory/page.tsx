import { revalidatePath } from "next/cache";
import Link from "next/link";
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

export default async function AdminInventoryPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const language = getCurrentLanguage();
  const admin = supabaseAdmin();
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : "";
  const stockFilter = typeof resolvedSearchParams.stock === "string" ? resolvedSearchParams.stock : "all";
  const focusProductId = typeof resolvedSearchParams.focus === "string" ? resolvedSearchParams.focus : "";
  const fromDate = typeof resolvedSearchParams.from === "string" ? resolvedSearchParams.from : "";
  const toDate = typeof resolvedSearchParams.to === "string" ? resolvedSearchParams.to : "";
  const page = Math.max(1, Number(typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : "1") || 1);
  const limit = Math.min(
    100,
    Math.max(10, Number(typeof resolvedSearchParams.limit === "string" ? resolvedSearchParams.limit : "20") || 20)
  );

  let movementQuery = admin
    .from("stock_movements")
    .select("id,product_id,order_id,movement_type,quantity,note,created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (fromDate) movementQuery = movementQuery.gte("created_at", `${fromDate}T00:00:00+08:00`);
  if (toDate) movementQuery = movementQuery.lte("created_at", `${toDate}T23:59:59.999+08:00`);

  let orderQuery = admin
    .from("orders")
    .select("id,user_id,product_id,quantity,amount_total,cash_paid,payment_status,created_at")
    .eq("order_type", "product")
    .not("product_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(500);
  if (fromDate) orderQuery = orderQuery.gte("created_at", `${fromDate}T00:00:00+08:00`);
  if (toDate) orderQuery = orderQuery.lte("created_at", `${toDate}T23:59:59.999+08:00`);

  const [{ data: products }, { data: movements }, { data: productOrders }] = await Promise.all([
    admin
      .from("products")
      .select("id,title,sku,stock_on_hand,track_inventory,allow_backorder,is_published,updated_at,price_myr")
      .order("updated_at", { ascending: false }),
    movementQuery,
    orderQuery
  ]);

  const movementMap = new Map<string, typeof movements>();
  (movements ?? []).forEach((movement) => {
    const list = movementMap.get(movement.product_id) ?? [];
    list.push(movement);
    movementMap.set(movement.product_id, list);
  });

  const orderMap = new Map<string, typeof productOrders>();
  (productOrders ?? []).forEach((order) => {
    if (!order.product_id) return;
    const list = orderMap.get(order.product_id) ?? [];
    list.push(order);
    orderMap.set(order.product_id, list);
  });

  const buyerIds = Array.from(new Set((productOrders ?? []).map((order) => order.user_id).filter(Boolean)));
  const { data: buyers } = buyerIds.length
    ? await admin.from("users_profile").select("id,name,referral_code").in("id", buyerIds)
    : { data: [] as Array<{ id: string; name: string | null; referral_code: string | null }> };
  const buyerMap = new Map((buyers ?? []).map((buyer) => [buyer.id, buyer]));

  const trackedProducts = (products ?? []).filter((product) => product.track_inventory);
  const lowStock = trackedProducts.filter((product) => Number(product.stock_on_hand ?? 0) <= 5);
  const unpublishedTracked = trackedProducts.filter((product) => !product.is_published);
  const normalizedQuery = query.toLowerCase();
  const filteredProducts = trackedProducts.filter((product) => {
    const matchesQuery = !normalizedQuery
      || product.title.toLowerCase().includes(normalizedQuery)
      || (product.sku ?? "").toLowerCase().includes(normalizedQuery);
    if (!matchesQuery) return false;
    if (stockFilter === "low") return Number(product.stock_on_hand ?? 0) <= 5;
    if (stockFilter === "published") return product.is_published;
    if (stockFilter === "draft") return !product.is_published;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * limit, currentPage * limit);

  const baseParams = {
    q: query || undefined,
    stock: stockFilter !== "all" ? stockFilter : undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
    limit: String(limit)
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
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
          <p className="text-sm text-black/60">{t(language, {
            zh: fromDate || toDate ? "已按日期筛选库存流水与产品订单。" : "当前显示最近 500 条库存流水。",
            en: fromDate || toDate ? "Movements and product orders are filtered by date." : "Showing the latest 500 stock movements."
          })}</p>
        </div>
        <div className="card space-y-3">
          <div>
            <p className="text-sm text-black/55">{t(language, { zh: "当前优先处理", en: "Action queue" })}</p>
            <p className="font-display text-3xl text-[#8c3a1f]">{lowStock.length}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/inventory${createQueryString({ ...baseParams, stock: "low", page: "1" })}`}
              className="rounded-full bg-[linear-gradient(135deg,#c8a55c,#e6c88f)] px-4 py-2 text-sm font-semibold text-[#123524]"
            >
              {t(language, { zh: "一键只看低库存", en: "Show low stock only" })}
            </Link>
            <Link
              href="/admin/products"
              className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70"
            >
              {t(language, { zh: "管理产品资料", en: "Manage products" })}
            </Link>
          </div>
          <p className="text-sm text-black/60">
            {t(language, {
              zh: unpublishedTracked.length ? `另有 ${unpublishedTracked.length} 项草稿产品仍在追踪库存。` : "所有追踪库存产品都已进入工作台。",
              en: unpublishedTracked.length ? `${unpublishedTracked.length} tracked products are still in draft.` : "All tracked products are included in the workbench."
            })}
          </p>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "库存管理", en: "Inventory management" })}</h2>
          <p className="text-sm text-black/60">{t(language, { zh: "在这里查看当前库存、输入进出货，或直接做盘点调整。", en: "View stock on hand, log incoming or outgoing units, or make a stocktake adjustment." })}</p>
        </div>

        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr),180px,160px,160px,120px,auto]">
          <input
            className="rounded-full border border-black/10 bg-white px-4 py-3"
            name="q"
            defaultValue={query}
            placeholder={t(language, { zh: "搜索产品名称或 SKU", en: "Search product title or SKU" })}
          />
          <select name="stock" defaultValue={stockFilter} className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm">
            <option value="all">{t(language, { zh: "全部状态", en: "All stock states" })}</option>
            <option value="low">{t(language, { zh: "只看低库存", en: "Low stock only" })}</option>
            <option value="published">{t(language, { zh: "只看已发布", en: "Published only" })}</option>
            <option value="draft">{t(language, { zh: "只看草稿", en: "Draft only" })}</option>
          </select>
          <input
            type="date"
            name="from"
            defaultValue={fromDate}
            className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm"
            aria-label={t(language, { zh: "开始日期", en: "From date" })}
          />
          <input
            type="date"
            name="to"
            defaultValue={toDate}
            className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm"
            aria-label={t(language, { zh: "结束日期", en: "To date" })}
          />
          <select name="limit" defaultValue={String(limit)} className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm">
            {[10, 20, 40, 80].map((option) => (
              <option key={option} value={option}>
                {t(language, { zh: `${option} 项`, en: `${option} rows` })}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button className="rounded-full bg-[#123524] px-5 py-3 text-sm font-semibold text-white">
              {t(language, { zh: "筛选", en: "Filter" })}
            </button>
            <Link href="/admin/inventory" className="rounded-full border border-black/10 px-5 py-3 text-sm text-black/65">
              {t(language, { zh: "清除", en: "Reset" })}
            </Link>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/inventory/export${createQueryString({
              q: query || undefined,
              stock: stockFilter !== "all" ? stockFilter : undefined,
              from: fromDate || undefined,
              to: toDate || undefined
            })}`}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/70"
          >
            {t(language, { zh: "导出库存 CSV", en: "Export inventory CSV" })}
          </Link>
          {(fromDate || toDate) ? (
            <span className="text-xs text-black/50">
              {t(language, {
                zh: `日期范围：${fromDate || "…"} 至 ${toDate || "…"} `,
                en: `Date range: ${fromDate || "…"} to ${toDate || "…"}`
              })}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-black/60">
          <p>
            {t(language, {
              zh: `当前显示 ${pagedProducts.length} / ${filteredProducts.length} 项`,
              en: `Showing ${pagedProducts.length} of ${filteredProducts.length}`
            })}
          </p>
          <div className="flex items-center gap-2">
            <span>{t(language, { zh: "页码", en: "Page" })}</span>
            <Link
              href={`/admin/inventory${createQueryString({ ...baseParams, page: String(Math.max(1, currentPage - 1)) })}`}
              className={`rounded-full border px-3 py-1 ${currentPage <= 1 ? "pointer-events-none border-black/5 text-black/25" : "border-black/10 text-black/65"}`}
            >
              {t(language, { zh: "上一页", en: "Prev" })}
            </Link>
            <span className="rounded-full bg-[#edf5ef] px-3 py-1 text-jade">{currentPage} / {totalPages}</span>
            <Link
              href={`/admin/inventory${createQueryString({ ...baseParams, page: String(Math.min(totalPages, currentPage + 1)) })}`}
              className={`rounded-full border px-3 py-1 ${currentPage >= totalPages ? "pointer-events-none border-black/5 text-black/25" : "border-black/10 text-black/65"}`}
            >
              {t(language, { zh: "下一页", en: "Next" })}
            </Link>
          </div>
        </div>

        {trackedProducts.length ? (
          <div className="space-y-4">
            {pagedProducts.map((product) => {
              const productMovements = movementMap.get(product.id) ?? [];
              const productOrdersForCard = orderMap.get(product.id) ?? [];
              const isFocused = focusProductId === product.id;
              const visibleMovements = isFocused ? productMovements.slice(0, 15) : productMovements.slice(0, 5);
              const visibleOrders = isFocused ? productOrdersForCard.slice(0, 15) : productOrdersForCard.slice(0, 5);
              const focusHref = `/admin/inventory${createQueryString({
                ...baseParams,
                page: String(currentPage),
                focus: isFocused ? undefined : product.id
              })}#product-${product.id}`;

              return (
              <div key={product.id} id={`product-${product.id}`} className="rounded-3xl border border-black/10 bg-white px-4 py-4">
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
                      {product.price_myr ? (
                        <span className="rounded-full bg-white px-3 py-1 text-black/55">
                          RM {Number(product.price_myr).toFixed(2)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-xs text-black/45">
                    {t(language, { zh: "更新于：", en: "Updated: " })}
                    {new Date(product.updated_at).toLocaleString(language === "en" ? "en-MY" : "zh-CN")}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/inventory/${product.id}${createQueryString({ from: fromDate || undefined, to: toDate || undefined })}`}
                    className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70"
                  >
                    {t(language, { zh: "查看库存详情", en: "Open stock detail" })}
                  </Link>
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

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#123524]">{t(language, { zh: "库存流水", en: "Stock movements" })}</p>
                      {productMovements.length > 5 ? (
                        <Link href={focusHref} className="text-xs text-black/55 underline underline-offset-4">
                          {isFocused ? t(language, { zh: "收起", en: "Collapse" }) : t(language, { zh: "查看更多", en: "View more" })}
                        </Link>
                      ) : null}
                    </div>
                  {visibleMovements.length ? (
                    visibleMovements.map((movement) => (
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
                          {movement.order_id ? (
                            <p className="text-xs text-jade">
                              {t(language, { zh: "关联订单：", en: "Linked order: " })}
                              {movement.order_id.slice(0, 8)}
                            </p>
                          ) : null}
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#123524]">{t(language, { zh: "产品订单明细", en: "Product order details" })}</p>
                      {productOrdersForCard.length > 5 ? (
                        <Link href={focusHref} className="text-xs text-black/55 underline underline-offset-4">
                          {isFocused ? t(language, { zh: "收起", en: "Collapse" }) : t(language, { zh: "查看更多", en: "View more" })}
                        </Link>
                      ) : null}
                    </div>
                    {visibleOrders.length ? (
                      visibleOrders.map((order) => {
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
                      })
                    ) : (
                      <p className="text-sm text-black/55">{t(language, { zh: "这项产品还没有订单记录。", en: "This product has no product orders yet." })}</p>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "目前没有启用库存追踪的产品。请先到产品页启用库存追踪。", en: "No products are currently using inventory tracking. Enable it from the products page first." })}</p>
        )}
      </section>
    </div>
  );
}
