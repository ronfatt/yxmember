import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { createClient } from "../../../lib/supabase/server";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const language = getCurrentLanguage();
  const supabase = createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", params.id).single();

  if (!product) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="container py-12">{t(language, { zh: "找不到产品。", en: "Product not found." })}</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container space-y-6 py-12">
        <div className="card space-y-3">
          <h1 className="font-display text-3xl">{product.title}</h1>
          <p className="text-black/60">{product.subtitle}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {product.sku ? <span className="rounded-full bg-white px-3 py-1 text-black/60">{t(language, { zh: "SKU：", en: "SKU: " })}{product.sku}</span> : null}
            {product.price_myr != null ? (
              <span className="rounded-full bg-[#f4ead2] px-3 py-1 text-[#6a4d14]">
                {product.price_myr} MYR
              </span>
            ) : null}
            {product.track_inventory ? (
              product.stock_on_hand > 0 ? (
                <>
                  <span className="rounded-full bg-[#edf5ef] px-3 py-1 text-jade">
                    {t(language, { zh: `现货 ${product.stock_on_hand}`, en: `${product.stock_on_hand} in stock` })}
                  </span>
                  {product.stock_on_hand <= 5 ? (
                    <span className="rounded-full bg-[#fff4e8] px-3 py-1 text-[#8c3a1f]">
                      {t(language, { zh: "低库存", en: "Low stock" })}
                    </span>
                  ) : null}
                </>
              ) : product.allow_backorder ? (
                <span className="rounded-full bg-[#f7f2e7] px-3 py-1 text-[#8b6b2b]">
                  {t(language, { zh: "可预订", en: "Available for preorder" })}
                </span>
              ) : (
                <span className="rounded-full bg-[#f8ece8] px-3 py-1 text-[#8c3a1f]">
                  {t(language, { zh: "暂时缺货", en: "Out of stock" })}
                </span>
              )
            ) : (
              <span className="rounded-full bg-[#edf5ef] px-3 py-1 text-jade">
                {t(language, { zh: "持续开放", en: "Available" })}
              </span>
            )}
          </div>
          <p className="text-black/70">{product.description}</p>
          <div>
            <h3 className="font-medium">{t(language, { zh: "产品益处", en: "Benefits" })}</h3>
            <ul className="list-disc pl-5 text-black/70">
              {(product.benefits ?? []).map((benefit: string) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
