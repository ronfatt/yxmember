import { revalidatePath } from "next/cache";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../lib/supabase/admin";

async function createRoom(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  await admin.from("rooms").insert({
    name: String(formData.get("name")),
    capacity: Number(formData.get("capacity") || 1),
    open_time: String(formData.get("open_time") || "11:00"),
    close_time: String(formData.get("close_time") || "17:00"),
    timezone: String(formData.get("timezone") || "Asia/Kuala_Lumpur")
  });
  revalidatePath("/admin/rooms");
}

async function regenerateSlots(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const days = Number(formData.get("days") || 60);
  await admin.rpc("generate_room_slots", { days_ahead: days });
  revalidatePath("/admin/rooms");
}

async function blockSlot(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  await admin.from("room_slots").update({ status: "BLOCKED" }).eq("id", String(formData.get("slot_id")));
  revalidatePath("/admin/rooms");
}

export default async function AdminRoomsPage() {
  const language = await getCurrentLanguage();
  const admin = supabaseAdmin();
  const { data: rooms } = await admin.from("rooms").select("*").order("created_at", { ascending: false });
  const { data: slots } = await admin.from("room_slots").select("id,start_at,end_at,status").order("start_at", { ascending: true }).limit(20);

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "创建房间", en: "Create Room" })}</h2>
        <form action={createRoom} className="grid gap-3">
          <input className="rounded border p-2" name="name" placeholder={t(language, { zh: "房间名称", en: "Room name" })} required />
          <input className="rounded border p-2" name="capacity" placeholder={t(language, { zh: "容量", en: "Capacity" })} type="number" required />
          <div className="grid gap-2 md:grid-cols-3">
            <input className="rounded border p-2" name="open_time" placeholder={t(language, { zh: "开放时间", en: "Open time" })} defaultValue="11:00" />
            <input className="rounded border p-2" name="close_time" placeholder={t(language, { zh: "关闭时间", en: "Close time" })} defaultValue="17:00" />
            <input className="rounded border p-2" name="timezone" placeholder={t(language, { zh: "时区", en: "Timezone" })} defaultValue="Asia/Kuala_Lumpur" />
          </div>
          <button className="rounded-full bg-ink px-4 py-2 text-white">{t(language, { zh: "创建", en: "Create" })}</button>
        </form>
      </section>

      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "重新生成时段", en: "Regenerate Slots" })}</h2>
        <form action={regenerateSlots} className="flex items-center gap-3">
          <input className="rounded border p-2" name="days" placeholder={t(language, { zh: "未来天数", en: "Days ahead" })} type="number" defaultValue={60} />
          <button className="rounded-full bg-ink px-4 py-2 text-white">{t(language, { zh: "重新生成", en: "Regenerate" })}</button>
        </form>
      </section>

      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "房间列表", en: "Rooms" })}</h2>
        {rooms?.length ? (
          rooms.map((room) => (
            <div key={room.id} className="border-b pb-2 text-sm">
              {room.name} - {t(language, { zh: "容量", en: "capacity" })} {room.capacity} - {room.open_time} {t(language, { zh: "至", en: "to" })} {room.close_time}
            </div>
          ))
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有房间。", en: "No rooms yet." })}</p>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-display text-2xl">{t(language, { zh: "封锁时段", en: "Block Slot" })}</h2>
        <form action={blockSlot} className="flex items-center gap-3">
          <input className="rounded border p-2" name="slot_id" placeholder={t(language, { zh: "时段 ID", en: "Slot ID" })} required />
          <button className="rounded-full bg-ink px-4 py-2 text-white">{t(language, { zh: "封锁", en: "Block" })}</button>
        </form>
        <div className="text-xs text-black/50">{t(language, { zh: "最近时段", en: "Recent slots" })}</div>
        {slots?.length ? (
          slots.map((slot) => (
            <div key={slot.id} className="text-xs text-black/70">
              {slot.id} - {slot.start_at} ({slot.status})
            </div>
          ))
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有时段。", en: "No slots yet." })}</p>
        )}
      </section>
    </div>
  );
}
