import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { getCurrentLanguage } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/shared";
import { createClient } from "../../lib/supabase/server";

export default async function ProductsPage() {
  const language = getCurrentLanguage();
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id,title,subtitle,description,benefits,is_published")
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
