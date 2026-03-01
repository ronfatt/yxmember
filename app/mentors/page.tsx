import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { getCurrentLanguage } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/shared";
import { createClient } from "../../lib/supabase/server";

export default async function MentorsPage() {
  const language = getCurrentLanguage();
  const supabase = createClient();
  const [{ data: mentors }, { data: services }] = await Promise.all([
    supabase
      .from("mentors")
      .select("id,display_name,headline,bio,specialties,suitable_for,location_type,location_note,avatar_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("mentor_services")
      .select("id,mentor_id,name,duration_min,price_total")
      .eq("active", true)
  ]);

  const serviceMap = new Map<string, Array<{ id: string; name: string; duration_min: number; price_total: number }>>();
  for (const service of services ?? []) {
    const existing = serviceMap.get(service.mentor_id) ?? [];
    existing.push(service);
    serviceMap.set(service.mentor_id, existing);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container space-y-6 py-12">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8d7240]">
            {t(language, { zh: "私人导师会谈", en: "Private guidance sessions" })}
          </p>
          <h1 className="section-title">{t(language, { zh: "导师", en: "Mentors" })}</h1>
          <p className="text-base leading-8 text-black/60">
            {t(language, {
              zh: "选择一位适合当下阶段的导师，以更安静、更聚焦的方式进入一场 1 对 1 会谈。",
              en: "Choose the mentor that best fits your current chapter and move into a calm, focused one-on-one session."
            })}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {mentors?.length ? (
            mentors.map((mentor) => {
              const mentorServices = serviceMap.get(mentor.id) ?? [];
              return (
                <Link key={mentor.id} href={`/mentors/${mentor.id}`} className="card hover:border-ink/40">
                  <h2 className="font-display text-2xl">{mentor.display_name}</h2>
                  <p className="text-sm text-[#8d7240]">{mentor.headline ?? mentor.suitable_for ?? ""}</p>
                  <p className="text-black/70">{mentor.bio}</p>
                  <p className="text-xs text-black/50">{(mentor.specialties ?? []).join(", ")}</p>
                  <p className="text-xs text-black/50">
                    {mentor.location_type === "both"
                      ? t(language, { zh: "线上 / 线下", en: "Online / in person" })
                      : mentor.location_type === "online"
                        ? t(language, { zh: "仅线上", en: "Online only" })
                        : t(language, { zh: "仅线下", en: "In person only" })}
                  </p>
                  <p className="mt-3 text-sm text-black/65">
                    {mentorServices.length
                      ? t(language, {
                          zh: `可预约 ${mentorServices.length} 种会谈，起价 RM${Number(Math.min(...mentorServices.map((service) => Number(service.price_total ?? 0)))).toFixed(0)}`,
                          en: `${mentorServices.length} services available, from RM${Number(Math.min(...mentorServices.map((service) => Number(service.price_total ?? 0)))).toFixed(0)}`
                        })
                      : t(language, { zh: "导师资料已开放，服务时段即将上架。", en: "Mentor profile is live. Services will open shortly." })}
                  </p>
                </Link>
              );
            })
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "暂时没有可预约导师。", en: "No active mentors yet." })}</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
