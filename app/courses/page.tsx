import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { getCurrentLanguage } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/shared";
import { createClient } from "../../lib/supabase/server";

export default async function CoursesPage() {
  const language = getCurrentLanguage();
  const supabase = createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id,title,tagline,level,is_published")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container space-y-6 py-12">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-black/45">{t(language, { zh: "公开页", en: "Public page" })}</p>
          <h1 className="section-title">{t(language, { zh: "课程与活动", en: "Programs and events" })}</h1>
          <p className="text-sm text-black/60">{t(language, { zh: "查看元象当前开放的课程、主题活动与会员场次。", en: "Browse the current courses, themed gatherings, and member sessions open at MetaEnergy." })}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {courses?.length ? (
            courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="card hover:border-ink/40">
                <h2 className="font-display text-2xl">{course.title}</h2>
                <p className="text-black/60">{course.tagline}</p>
                <p className="text-xs text-black/50">{t(language, { zh: "难度：", en: "Level: " })}{course.level}</p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "暂时没有已发布课程。", en: "No published courses yet." })}</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
