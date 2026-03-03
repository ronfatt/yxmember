import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { getCurrentLanguage } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/shared";
import { createPublicMetadata } from "../../lib/metaenergy/seo";
import { createClient } from "../../lib/supabase/server";

export const metadata: Metadata = createPublicMetadata(
  "产品",
  "浏览元象当前开放的产品、库存状态与预订安排，查看现货、低库存与可预订项目。",
  "/products"
);

export default async function ProductsPage() {
  const language = await getCurrentLanguage();
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id,title,subtitle,description,benefits,is_published,price_myr,stock_on_hand,track_inventory,allow_backorder")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container space-y-6 py-12">
        <h1 className="section-title">{t(language, { zh: "产品", en: "Products" })}</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {products?.length ? (
            products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="card hover:border-ink/40">
                <h2 className="font-display text-2xl">{product.title}</h2>
                <p className="text-black/60">{product.subtitle}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
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
                <p className="mt-3 text-sm text-black/70">{product.description}</p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "暂时没有已发布产品。", en: "No published products yet." })}</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
