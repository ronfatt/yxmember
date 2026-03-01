import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { getCurrentLanguage } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/shared";
import { createClient } from "../../lib/supabase/server";

export default async function MentorsPage() {
  const language = getCurrentLanguage();
  const supabase = createClient();
  const { data: mentors } = await supabase
    .from("mentors")
    .select("id,display_name,bio,specialties,avatar_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container space-y-6 py-12">
        <h1 className="section-title">{t(language, { zh: "导师", en: "Mentors" })}</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {mentors?.length ? (
            mentors.map((mentor) => (
              <Link key={mentor.id} href={`/mentors/${mentor.id}`} className="card hover:border-ink/40">
                <h2 className="font-display text-2xl">{mentor.display_name}</h2>
                <p className="text-black/70">{mentor.bio}</p>
                <p className="text-xs text-black/50">{(mentor.specialties ?? []).join(", ")}</p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "暂时没有可预约导师。", en: "No active mentors yet." })}</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
