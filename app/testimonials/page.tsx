import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { getCurrentLanguage } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/shared";
import { createClient } from "../../lib/supabase/server";

export default async function TestimonialsPage() {
  const language = getCurrentLanguage();
  const supabase = createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id,category,title,content,media_urls,is_anonymous,created_at")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false });

  const categories = Array.from(new Set(testimonials?.map((item) => item.category).filter(Boolean)));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container space-y-6 py-12">
        <h1 className="section-title">{t(language, { zh: "会员见证", en: "Testimonials" })}</h1>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <span key={category} className="badge">{category}</span>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials?.length ? (
            testimonials.map((testimonial) => (
              <div key={testimonial.id} className="card space-y-2">
                <p className="text-xs uppercase text-black/50">{testimonial.category}</p>
                <h2 className="font-display text-2xl">{testimonial.title}</h2>
                <p className="text-black/70">{testimonial.content}</p>
                <p className="text-xs text-black/40">
                  {testimonial.is_anonymous ? t(language, { zh: "匿名", en: "Anonymous" }) : t(language, { zh: "会员", en: "Member" })}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "暂时没有已通过的见证。", en: "No approved testimonials yet." })}</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
