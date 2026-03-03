import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { isAdminEmail } from "../../../../lib/metaenergy/auth";

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let isAdmin = isAdminEmail(auth.user.email);
  if (!isAdmin) {
    const { data: role } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", auth.user.id)
      .single();
    isAdmin = !!role && ["ADMIN", "STAFF"].includes(role.role);
  }

  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const stockFilter = url.searchParams.get("stock") ?? "all";
  const fromDate = url.searchParams.get("from") ?? "";
  const toDate = url.searchParams.get("to") ?? "";
  const productId = url.searchParams.get("productId") ?? "";

  let movementQuery = supabase
    .from("stock_movements")
    .select("id,product_id,order_id,movement_type,quantity,note,created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (productId) movementQuery = movementQuery.eq("product_id", productId);
  if (fromDate) movementQuery = movementQuery.gte("created_at", `${fromDate}T00:00:00+08:00`);
  if (toDate) movementQuery = movementQuery.lte("created_at", `${toDate}T23:59:59.999+08:00`);

  let orderQuery = supabase
    .from("orders")
    .select("id,user_id,product_id,quantity,amount_total,cash_paid,payment_status,created_at")
    .eq("order_type", "product")
    .not("product_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (productId) orderQuery = orderQuery.eq("product_id", productId);
  if (fromDate) orderQuery = orderQuery.gte("created_at", `${fromDate}T00:00:00+08:00`);
  if (toDate) orderQuery = orderQuery.lte("created_at", `${toDate}T23:59:59.999+08:00`);

  const [{ data: products }, { data: movements }, { data: orders }] = await Promise.all([
    supabase
      .from("products")
      .select("id,title,sku,stock_on_hand,track_inventory,allow_backorder,is_published,updated_at,price_myr")
      .order("updated_at", { ascending: false }),
    movementQuery,
    orderQuery
  ]);

  const trackedProducts = (products ?? []).filter((product) => product.track_inventory);
  const filteredProducts = trackedProducts.filter((product) => {
    const matchesQuery = !query || product.title.toLowerCase().includes(query) || (product.sku ?? "").toLowerCase().includes(query);
    if (!matchesQuery) return false;
    if (productId && product.id !== productId) return false;
    if (stockFilter === "low") return Number(product.stock_on_hand ?? 0) <= 5;
    if (stockFilter === "published") return product.is_published;
    if (stockFilter === "draft") return !product.is_published;
    return true;
  });

  const movementMap = new Map<string, typeof movements>();
  (movements ?? []).forEach((movement) => {
    const list = movementMap.get(movement.product_id) ?? [];
    list.push(movement);
    movementMap.set(movement.product_id, list);
  });
  const orderMap = new Map<string, typeof orders>();
  (orders ?? []).forEach((order) => {
    if (!order.product_id) return;
    const list = orderMap.get(order.product_id) ?? [];
    list.push(order);
    orderMap.set(order.product_id, list);
  });

  const rows = [
    [
      "sku",
      "title",
      "price_myr",
      "stock_on_hand",
      "low_stock",
      "published",
      "allow_backorder",
      "movement_count",
      "order_count",
      "units_sold",
      "latest_movement_at",
      "latest_order_at",
      "updated_at"
    ].join(","),
    ...filteredProducts.map((product) => {
      const productMovements = movementMap.get(product.id) ?? [];
      const productOrders = orderMap.get(product.id) ?? [];
      const unitsSold = productOrders.reduce((sum, order) => sum + Number(order.quantity ?? 0), 0);
      return [
        csvCell(product.sku ?? ""),
        csvCell(product.title),
        csvCell(Number(product.price_myr ?? 0).toFixed(2)),
        csvCell(product.stock_on_hand ?? 0),
        csvCell(Number(product.stock_on_hand ?? 0) <= 5 ? "yes" : "no"),
        csvCell(product.is_published ? "yes" : "no"),
        csvCell(product.allow_backorder ? "yes" : "no"),
        csvCell(productMovements.length),
        csvCell(productOrders.length),
        csvCell(unitsSold),
        csvCell(productMovements[0]?.created_at ?? ""),
        csvCell(productOrders[0]?.created_at ?? ""),
        csvCell(product.updated_at ?? "")
      ].join(",");
    })
  ].join("\n");

  const filename = productId ? `inventory-product-${productId.slice(0, 8)}.csv` : "inventory-export.csv";
  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
