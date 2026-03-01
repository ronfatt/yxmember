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
