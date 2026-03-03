import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { createClient } from "../../../lib/supabase/server";
import CourseSessions from "../../../components/CourseSessions";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const language = await getCurrentLanguage();
  const supabase = await createClient();
  const resolvedParams = await params;
  const { data: course } = await supabase.from("courses").select("*").eq("id", resolvedParams.id).single();
  const { data: sessions } = await supabase
    .from("course_sessions")
    .select("*")
    .eq("course_id", resolvedParams.id)
    .eq("status", "PUBLISHED")
    .order("start_at", { ascending: true });

  if (!course) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="container py-12">{t(language, { zh: "找不到课程。", en: "Course not found." })}</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container space-y-6 py-12">
        <div className="card space-y-4">
          <h1 className="font-display text-3xl">{course.title}</h1>
          <p className="text-black/60">{course.tagline}</p>
          <p className="text-black/70">{course.description}</p>
          <div>
            <h3 className="font-medium">{t(language, { zh: "亮点", en: "Highlights" })}</h3>
            <ul className="list-disc pl-5 text-black/70">
              {(course.highlights ?? []).map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card space-y-4">
          <h2 className="font-display text-2xl">{t(language, { zh: "开放报名场次", en: "Open sessions" })}</h2>
          <p className="text-sm text-black/60">{t(language, { zh: "免费场次可直接确认；收费场次会先建立报名订单，并在你上传银行转账单据后审核。", en: "Free sessions confirm instantly. Paid sessions create a reservation order first, then move to review after you upload your transfer slip." })}</p>
          {sessions?.length ? <CourseSessions sessions={sessions} language={language} /> : <p className="text-black/60">{t(language, { zh: "还没有已发布场次。", en: "No published sessions yet." })}</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
