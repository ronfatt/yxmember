import Link from "next/link";
import CopyField from "../../../components/CopyField";
import DashboardShell from "../../../components/DashboardShell";
import OrderSlipUpload from "../../../components/OrderSlipUpload";
import ProductOrderCard from "../../../components/ProductOrderCard";
import { requireUser } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { buildFallbackPaymentAccount, getActivePaymentAccounts } from "../../../lib/metaenergy/payment-accounts";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardProductsPage() {
  const user = await requireUser();
  const language = await getCurrentLanguage();
  const supabase = await createClient();

  const [{ data: products }, { data: orders }, activeAccounts, { data: profile }] = await Promise.all([
    supabase
      .from("products")
      .select("id,title,subtitle,description,price_myr,stock_on_hand,track_inventory,allow_backorder,is_published")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id,order_type,amount_total,amount_cents,currency,payment_status,slip_url,product_id,quantity,created_at")
      .eq("user_id", user.id)
      .eq("order_type", "product")
      .order("created_at", { ascending: false }),
    getActivePaymentAccounts(supabase),
    supabase.from("users_profile").select("points_balance").eq("id", user.id).single()
  ]);

  const accounts = activeAccounts.length ? activeAccounts : (buildFallbackPaymentAccount() ? [buildFallbackPaymentAccount()!] : []);
  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const pendingOrders = (orders ?? [])
    .filter((order) => order.payment_status === "PENDING")
    .map((order) => {
      const product = order.product_id ? productMap.get(order.product_id) : null;
      return {
        ...order,
        label: product?.title
          ? `${product.title} · ${language === "en" ? `Qty ${order.quantity ?? 1}` : `数量 ${order.quantity ?? 1}`}`
          : t(language, { zh: "产品订单", en: "Product order" })
      };
    });

  return (
    <DashboardShell
      title={t(language, { zh: "产品专区", en: "Products" })}
      subtitle={t(language, { zh: "查看可购买产品、建立预购订单并上传汇款单据。", en: "Browse available products, create purchase orders, and upload transfer slips." })}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="card space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-black/55">{t(language, { zh: "会员购买", en: "Member purchasing" })}</p>
              <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "产品列表", en: "Product list" })}</h2>
            </div>
            <Link href="/products" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:border-jade/30 hover:text-jade">
              {t(language, { zh: "查看公开页", en: "View public page" })}
            </Link>
          </div>

          {products?.length ? (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductOrderCard key={product.id} product={product} language={language} pointsBalance={Number(profile?.points_balance ?? 0)} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/55">{t(language, { zh: "目前还没有开放购买的产品。", en: "No products are open for purchase yet." })}</p>
          )}
        </section>

        <section className="space-y-6">
          <div className="card space-y-4">
            <div>
              <p className="text-sm text-black/55">{t(language, { zh: "汇款信息", en: "Bank transfer details" })}</p>
              <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "银行转账资料", en: "Transfer instructions" })}</h2>
            </div>
            <p className="text-sm text-black/65">
              {t(language, {
                zh: "建立产品订单后，请按以下资料完成银行转账，再在下方上传汇款单据。",
                en: "After creating a product order, complete the bank transfer below and then upload your slip."
              })}
            </p>
            {accounts.length ? (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="space-y-3 rounded-3xl border border-black/8 bg-[#fbf7ef] p-4">
                    <p className="font-display text-xl text-[#123524]">{account.label}</p>
                    <CopyField label={t(language, { zh: "银行", en: "Bank" })} value={account.bank_name} language={language} />
                    <CopyField label={t(language, { zh: "账户名称", en: "Account name" })} value={account.account_name} language={language} />
                    <CopyField label={t(language, { zh: "账号", en: "Account number" })} value={account.account_number} language={language} />
                    {account.reference_note ? <CopyField label={t(language, { zh: "备注", en: "Reference" })} value={account.reference_note} language={language} /> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8c3a1f]">{t(language, { zh: "尚未设置银行账户资料，请先联系管理员。", en: "Bank transfer details are not configured yet." })}</p>
            )}
          </div>

          <div className="card space-y-4">
            <div>
              <p className="text-sm text-black/55">{t(language, { zh: "待完成付款", en: "Pending transfer" })}</p>
              <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "上传汇款单据", en: "Upload transfer slip" })}</h2>
            </div>
            <p className="text-sm text-black/65">
              {t(language, {
                zh: "收费产品会先建立待确认订单。完成转账后，在这里上传单据，后台确认后才会正式扣库存并完成订单。",
                en: "Product orders stay pending until you upload the transfer slip and an admin confirms payment."
              })}
            </p>
            {pendingOrders.length ? (
              <OrderSlipUpload orders={pendingOrders} language={language} />
            ) : (
              <p className="text-sm text-black/55">{t(language, { zh: "当前没有待上传单据的产品订单。", en: "There are no pending product orders right now." })}</p>
            )}
          </div>

          <div className="card space-y-4">
            <div>
              <p className="text-sm text-black/55">{t(language, { zh: "最近产品订单", en: "Recent product orders" })}</p>
              <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "最近记录", en: "Recent activity" })}</h2>
            </div>
            {orders?.length ? (
              <div className="space-y-3">
                {orders.slice(0, 6).map((order) => {
                  const product = order.product_id ? productMap.get(order.product_id) : null;
                  return (
                    <div key={order.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-[#123524]">{product?.title ?? t(language, { zh: "产品订单", en: "Product order" })}</p>
                        <p className="text-black/50">{order.payment_status}</p>
                      </div>
                      <p className="mt-1 text-black/55">{t(language, { zh: "数量：", en: "Quantity: " })}{order.quantity ?? 1}</p>
                      <p className="mt-1 text-black/55">{Number(order.amount_total ?? (order.amount_cents ?? 0) / 100).toFixed(2)} {order.currency}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-black/55">{t(language, { zh: "你还没有产品订单记录。", en: "You do not have any product orders yet." })}</p>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
