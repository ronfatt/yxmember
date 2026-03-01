import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { createClient } from "../../../lib/supabase/server";
import Link from "next/link";
import { formatMoney } from "../../../lib/metaenergy/helpers";

export default async function MentorDetailPage({ params }: { params: { id: string } }) {
  const language = getCurrentLanguage();
  const supabase = createClient();
  const [{ data: mentor }, { data: services }] = await Promise.all([
    supabase.from("mentors").select("*").eq("id", params.id).single(),
    supabase
      .from("mentor_services")
      .select("id,name,duration_min,price_total,deposit_amount,allow_points")
      .eq("mentor_id", params.id)
      .eq("active", true)
      .order("duration_min", { ascending: true })
  ]);

  if (!mentor) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="container py-12">{t(language, { zh: "找不到导师。", en: "Mentor not found." })}</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container space-y-6 py-12">
        <div className="card space-y-3">
          <h1 className="font-display text-3xl">{mentor.display_name}</h1>
          {mentor.headline ? <p className="text-sm text-[#8d7240]">{mentor.headline}</p> : null}
          <p className="text-black/70">{mentor.bio}</p>
          <p className="text-xs text-black/50">{(mentor.specialties ?? []).join(", ")}</p>
          {mentor.suitable_for ? <p className="text-sm text-black/60">{t(language, { zh: "适合对象", en: "Best for" })} · {mentor.suitable_for}</p> : null}
        </div>
        <div className="card space-y-4">
          <h2 className="font-display text-2xl">{t(language, { zh: "选择会谈形式", en: "Choose a session" })}</h2>
          {services?.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {services.map((service) => (
                <div key={service.id} className="rounded-[24px] border border-black/10 bg-white p-5">
                  <p className="font-display text-2xl text-[#123524]">{service.name}</p>
                  <p className="mt-2 text-sm text-black/60">{service.duration_min}{language === "en" ? " min" : " 分钟"}</p>
                  <p className="mt-1 text-sm text-black/60">{formatMoney(Number(service.price_total ?? 0))}</p>
                  <p className="mt-1 text-xs text-black/50">
                    {service.allow_points
                      ? t(language, { zh: "可使用积分抵扣，最高 50%。", en: "Points can offset up to 50%." })
                      : t(language, { zh: "此服务暂不开放积分抵扣。", en: "Points are not enabled for this service." })}
                  </p>
                  <Link
                    href={`/book/${mentor.id}/${service.id}`}
                    className="mt-4 inline-flex rounded-full bg-jade px-4 py-2 text-sm font-semibold text-white"
                  >
                    {t(language, { zh: "选择时间", en: "Choose time" })}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "这位导师的会谈服务正在整理中。", en: "Session services for this mentor are coming soon." })}</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
