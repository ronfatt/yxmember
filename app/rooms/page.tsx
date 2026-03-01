import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { getCurrentLanguage } from "../../lib/i18n/server";
import { t } from "../../lib/i18n/shared";
import { createClient } from "../../lib/supabase/server";
import RoomSlots from "../../components/RoomSlots";

export default async function RoomsPage() {
  const language = getCurrentLanguage();
  const supabase = createClient();
  const { data: slots } = await supabase
    .from("room_slots_view")
    .select("id,start_at,end_at,room_name,remaining_capacity,total_capacity,status")
    .eq("status", "OPEN")
    .order("start_at", { ascending: true })
    .limit(30);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container space-y-6 py-12">
        <h1 className="section-title">{t(language, { zh: "调频空间", en: "Tuning Rooms" })}</h1>
        <p className="text-black/70">{t(language, { zh: "开放时间为 11:00-17:00（Asia/Kuala_Lumpur）。每个时段为 60 分钟。", en: "Operating hours 11:00-17:00 Asia/Kuala_Lumpur. Each slot is 60 minutes." })}</p>
        {slots?.length ? (
          <RoomSlots slots={slots as any} language={language} />
        ) : (
          <p className="text-black/60">{t(language, { zh: "目前没有可预约时段。", en: "No slots available." })}</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
