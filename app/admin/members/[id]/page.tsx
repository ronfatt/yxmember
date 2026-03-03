import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../lib/actions/session";
import { getCurrentLanguage } from "../../../../lib/i18n/server";
import { t } from "../../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

type MemberDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function updateMemberContactAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const admin = supabaseAdmin();
  const memberId = String(formData.get("member_id") || "");
  const phone = String(formData.get("phone") || "").trim() || null;

  await admin
    .from("users_profile")
    .update({
      phone,
      address_line1: String(formData.get("address_line1") || "").trim() || null,
      address_line2: String(formData.get("address_line2") || "").trim() || null,
      city: String(formData.get("city") || "").trim() || null,
      state: String(formData.get("state") || "").trim() || null,
      postal_code: String(formData.get("postal_code") || "").trim() || null,
      country: String(formData.get("country") || "").trim() || null
    })
    .eq("id", memberId);

  await admin.from("users").update({ phone }).eq("id", memberId);

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/relationships");
}

function formatAddress(profile: {
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}) {
  return [
    profile.address_line1,
    profile.address_line2,
    [profile.postal_code, profile.city].filter(Boolean).join(" "),
    profile.state,
    profile.country
  ]
    .filter(Boolean)
    .join(", ");
}

export default async function AdminMemberDetailPage({ params }: MemberDetailPageProps) {
  await requireAdmin();
  const language = await getCurrentLanguage();
  const { id } = await params;
  const admin = supabaseAdmin();

  const { data: profile } = await admin
    .from("users_profile")
    .select("id,name,username_id,phone,birthday,referral_code,referred_by,total_referred_sales,tier_rate,created_at,address_line1,address_line2,city,state,postal_code,country")
    .eq("id", id)
    .single();

  if (!profile) {
    notFound();
  }

  const [{ data: member }, { data: upstream }, { count: downlineCount }] = await Promise.all([
    admin.from("users").select("email,phone").eq("id", id).single(),
    profile.referred_by
      ? admin.from("users_profile").select("id,name,username_id,referral_code").eq("id", profile.referred_by).single()
      : Promise.resolve({ data: null }),
    admin.from("users_profile").select("*", { count: "exact", head: true }).eq("referred_by", id)
  ]);

  const address = formatAddress(profile);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">{t(language, { zh: "会员资料", en: "Member detail" })}</p>
          <h1 className="font-display text-4xl text-[#123524]">{profile.name ?? profile.username_id ?? profile.referral_code}</h1>
          <p className="text-sm text-black/55">{profile.username_id ? `@${profile.username_id}` : profile.referral_code}</p>
        </div>
        <Link href="/admin/relationships" className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-[#123524]">
          {t(language, { zh: "返回关系页", en: "Back to relationships" })}
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="card space-y-4">
          <div>
            <p className="text-sm text-black/55">{t(language, { zh: "基本资料", en: "Member profile" })}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "用户名 ID", en: "Username ID" })}</p>
                <p className="mt-1 text-base text-[#123524]">{profile.username_id ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "推荐码", en: "Referral code" })}</p>
                <p className="mt-1 text-base text-[#123524]">{profile.referral_code}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "电邮", en: "Email" })}</p>
                <p className="mt-1 text-base text-[#123524]">{member?.email ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "手机号码", en: "Phone" })}</p>
                <p className="mt-1 text-base text-[#123524]">{profile.phone ?? member?.phone ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "生日", en: "Birthday" })}</p>
                <p className="mt-1 text-base text-[#123524]">{profile.birthday ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "加入时间", en: "Joined" })}</p>
                <p className="mt-1 text-base text-[#123524]">{new Date(profile.created_at).toLocaleDateString(language === "en" ? "en-US" : "zh-CN")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#f8f6f2] p-5">
            <p className="text-sm text-black/55">{t(language, { zh: "关系与业绩", en: "Relationship and performance" })}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "上级", en: "Upstream" })}</p>
                <p className="mt-1 text-base text-[#123524]">
                  {upstream ? `${upstream.name ?? upstream.username_id ?? upstream.referral_code} (${upstream.referral_code})` : t(language, { zh: "没有上级", en: "No upstream" })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "层级", en: "Tier" })}</p>
                <p className="mt-1 text-base text-[#123524]">{Math.round(Number(profile.tier_rate ?? 0) * 100)}%</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "下线人数", en: "Downlines" })}</p>
                <p className="mt-1 text-base text-[#123524]">{downlineCount ?? 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-black/45">{t(language, { zh: "累计推荐业绩", en: "Total referred sales" })}</p>
              <p className="mt-1 text-base text-[#123524]">RM {Number(profile.total_referred_sales ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <p className="text-sm text-black/55">{t(language, { zh: "联系方式与地址", en: "Contact and address" })}</p>
            <p className="mt-1 text-sm text-black/50">{t(language, { zh: "以后课程、订单、寄送或人工跟进都可以统一从这里查看与维护。", en: "Use this as the central contact record for future orders, deliveries, and follow-up." })}</p>
          </div>

          <div className="rounded-3xl border border-black/8 bg-[#fcfbf8] p-4 text-sm text-black/65">
            <p className="font-medium text-[#123524]">{t(language, { zh: "当前地址摘要", en: "Current address" })}</p>
            <p className="mt-2">{address || t(language, { zh: "还没有填写地址。", en: "No address saved yet." })}</p>
          </div>

          <form action={updateMemberContactAction} className="grid gap-3">
            <input type="hidden" name="member_id" value={profile.id} />
            <label className="grid gap-2">
              <span className="text-sm text-black/55">{t(language, { zh: "手机号码", en: "Phone" })}</span>
              <input name="phone" defaultValue={profile.phone ?? member?.phone ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-black/55">{t(language, { zh: "地址第 1 行", en: "Address line 1" })}</span>
              <input name="address_line1" defaultValue={profile.address_line1 ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-black/55">{t(language, { zh: "地址第 2 行", en: "Address line 2" })}</span>
              <input name="address_line2" defaultValue={profile.address_line2 ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-black/55">{t(language, { zh: "城市", en: "City" })}</span>
                <input name="city" defaultValue={profile.city ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-black/55">{t(language, { zh: "州属", en: "State" })}</span>
                <input name="state" defaultValue={profile.state ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-black/55">{t(language, { zh: "邮编", en: "Postal code" })}</span>
                <input name="postal_code" defaultValue={profile.postal_code ?? ""} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-black/55">{t(language, { zh: "国家", en: "Country" })}</span>
                <input name="country" defaultValue={profile.country ?? "Malaysia"} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
            </div>
            <button className="mt-2 w-fit rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white">
              {t(language, { zh: "保存资料", en: "Save details" })}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
