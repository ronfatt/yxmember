import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { updateMemberUpstream } from "../../../lib/metaenergy/service";
import { supabaseAdmin } from "../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

type RelationshipProfile = {
  id: string;
  name: string | null;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
  total_referred_sales: number | null;
  tier_rate: number | null;
};

type RelationshipsPageProps = {
  searchParams?: Promise<{
    q?: string;
    limit?: string;
    page?: string;
    linked?: string;
  }>;
};

async function updateUpstreamAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const memberId = String(formData.get("member_id"));
  const upstreamId = String(formData.get("upstream_id") || "") || null;
  await updateMemberUpstream(supabaseAdmin(), memberId, upstreamId);
  revalidatePath("/admin/relationships");
  revalidatePath("/admin/orders");
}

function buildMemberLabel(language: "zh" | "en", name: string | null, code: string) {
  return `${name ?? t(language, { zh: "会员", en: "Member" })} (${code})`;
}

export default async function AdminRelationshipsPage({ searchParams }: RelationshipsPageProps) {
  await requireAdmin();
  const language = await getCurrentLanguage();
  const admin = supabaseAdmin();
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = (resolvedSearchParams.q ?? "").trim().toLowerCase();
  const linkedFilter = resolvedSearchParams.linked === "unlinked" ? "unlinked" : resolvedSearchParams.linked === "linked" ? "linked" : "all";
  const limit = Math.min(Math.max(Number(resolvedSearchParams.limit ?? "25"), 10), 100);
  const page = Math.max(Number(resolvedSearchParams.page ?? "1"), 1);

  const { data: profiles } = await admin
    .from("users_profile")
    .select("id,name,referral_code,referred_by,created_at,total_referred_sales,tier_rate")
    .order("created_at", { ascending: true });

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      {
        name: profile.name ?? t(language, { zh: "会员", en: "Member" }),
        referralCode: profile.referral_code,
        totalReferredSales: Number(profile.total_referred_sales ?? 0),
        tierRate: Number(profile.tier_rate ?? 0)
      }
    ])
  );

  const downlinesMap = new Map<string, RelationshipProfile[]>();
  for (const profile of profiles ?? []) {
    if (!profile.referred_by) continue;
    const current = downlinesMap.get(profile.referred_by) ?? [];
    current.push(profile);
    downlinesMap.set(profile.referred_by, current);
  }

  const filteredProfiles = (profiles ?? []).filter((profile) => {
    const upstream = profile.referred_by ? profileMap.get(profile.referred_by) : null;

    const queryMatches =
      !query ||
      (profile.name ?? "").toLowerCase().includes(query) ||
      profile.referral_code.toLowerCase().includes(query) ||
      (upstream?.name ?? "").toLowerCase().includes(query) ||
      (upstream?.referralCode ?? "").toLowerCase().includes(query);

    const linkedMatches =
      linkedFilter === "all" ||
      (linkedFilter === "linked" && !!profile.referred_by) ||
      (linkedFilter === "unlinked" && !profile.referred_by);

    return queryMatches && linkedMatches;
  });

  const totalProfiles = profiles?.length ?? 0;
  const linkedCount = (profiles ?? []).filter((profile) => !!profile.referred_by).length;
  const unlinkedCount = totalProfiles - linkedCount;
  const lowContextDownlines = [...downlinesMap.values()].reduce((sum, entries) => sum + entries.length, 0);

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / limit));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * limit;
  const pageItems = filteredProfiles.slice(startIndex, startIndex + limit);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card space-y-2">
          <p className="text-sm text-black/55">{t(language, { zh: "会员总数", en: "Members" })}</p>
          <p className="font-display text-3xl text-[#123524]">{totalProfiles}</p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-black/55">{t(language, { zh: "已绑定上级", en: "Linked upstreams" })}</p>
          <p className="font-display text-3xl text-[#123524]">{linkedCount}</p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-black/55">{t(language, { zh: "待处理未绑定", en: "Unlinked members" })}</p>
          <p className="font-display text-3xl text-[#8c3a1f]">{unlinkedCount}</p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-black/55">{t(language, { zh: "关系边数", en: "Linked edges" })}</p>
          <p className="font-display text-3xl text-[#123524]">{lowContextDownlines}</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">{t(language, { zh: "后台关系管理", en: "Admin relationships" })}</p>
          <h2 className="font-display text-3xl text-[#123524]">{t(language, { zh: "上下线列表", en: "Relationship directory" })}</h2>
          <p className="text-sm text-black/60">{t(language, { zh: "改成搜索优先的紧凑列表，更适合几百位会员的日常维护。", en: "A search-first compact list that scales better when you have hundreds of members." })}</p>
        </div>

        <form className="grid gap-3 lg:grid-cols-[1.5fr,0.8fr,0.5fr,auto,auto]">
          <input
            name="q"
            defaultValue={resolvedSearchParams.q ?? ""}
            placeholder={language === "en" ? "Search member, code, or upstream" : "搜索会员、推荐码或上级"}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3"
          />
          <select name="linked" defaultValue={linkedFilter} className="rounded-2xl border border-black/10 bg-white px-4 py-3">
            <option value="all">{t(language, { zh: "全部关系", en: "All relationships" })}</option>
            <option value="linked">{t(language, { zh: "只看已绑定", en: "Linked only" })}</option>
            <option value="unlinked">{t(language, { zh: "只看未绑定", en: "Unlinked only" })}</option>
          </select>
          <input
            type="number"
            name="limit"
            min="10"
            max="100"
            defaultValue={String(limit)}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3"
          />
          <button type="submit" className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white">
            {t(language, { zh: "搜索", en: "Search" })}
          </button>
          <a href="/admin/relationships" className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-[#123524]">
            {t(language, { zh: "清除", en: "Clear" })}
          </a>
        </form>
      </div>

      <div className="card overflow-hidden">
        {pageItems.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8f6f2] text-left text-black/55">
                <tr>
                  <th className="px-4 py-3 font-medium">{t(language, { zh: "会员", en: "Member" })}</th>
                  <th className="px-4 py-3 font-medium">{t(language, { zh: "上级", en: "Upstream" })}</th>
                  <th className="px-4 py-3 font-medium">{t(language, { zh: "下线", en: "Downlines" })}</th>
                  <th className="px-4 py-3 font-medium">{t(language, { zh: "层级 / 业绩", en: "Tier / sales" })}</th>
                  <th className="px-4 py-3 font-medium">{t(language, { zh: "修改上级", en: "Change upstream" })}</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((profile) => {
                  const upstream = profile.referred_by ? profileMap.get(profile.referred_by) : null;
                  const downlines = downlinesMap.get(profile.id) ?? [];
                  const downlinePreview = downlines.slice(0, 3);

                  return (
                    <tr key={profile.id} className="border-t border-black/8 align-top">
                      <td className="px-4 py-4">
                        <p className="font-medium text-[#123524]">{profile.name ?? t(language, { zh: "会员", en: "Member" })}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-black/45">{profile.referral_code}</p>
                      </td>
                      <td className="px-4 py-4 text-black/70">
                        {upstream ? buildMemberLabel(language, upstream.name, upstream.referralCode) : t(language, { zh: "没有上级", en: "No upstream" })}
                      </td>
                      <td className="px-4 py-4 text-black/70">
                        <p>{downlines.length} {t(language, { zh: "人", en: "members" })}</p>
                        {downlinePreview.length ? (
                          <p className="mt-1 text-xs text-black/50">
                            {downlinePreview.map((downline) => buildMemberLabel(language, downline.name, downline.referral_code)).join(" · ")}
                            {downlines.length > downlinePreview.length ? ` +${downlines.length - downlinePreview.length}` : ""}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-black/70">
                        <p>{Math.round(Number(profile.tier_rate ?? 0) * 100)}%</p>
                        <p className="mt-1 text-xs text-black/50">RM {Number(profile.total_referred_sales ?? 0).toFixed(2)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <form action={updateUpstreamAction} className="flex min-w-[320px] flex-wrap items-center gap-2">
                          <input type="hidden" name="member_id" value={profile.id} />
                          <select
                            name="upstream_id"
                            defaultValue={profile.referred_by ?? ""}
                            className="min-w-[220px] flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3"
                          >
                            <option value="">{t(language, { zh: "没有上级推荐人", en: "No upstream referrer" })}</option>
                            {(profiles ?? [])
                              .filter((candidate) => candidate.id !== profile.id)
                              .map((candidate) => (
                                <option key={candidate.id} value={candidate.id}>
                                  {buildMemberLabel(language, candidate.name, candidate.referral_code)}
                                </option>
                              ))}
                          </select>
                          <button className="rounded-full bg-[#123524] px-4 py-2 text-xs font-semibold text-white">
                            {t(language, { zh: "保存", en: "Save" })}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-6 text-sm text-black/60">
            {t(language, { zh: "没有找到符合当前搜索条件的会员。", en: "No members matched the current search." })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-black/60">
        <p>
          {t(language, { zh: "当前显示", en: "Showing" })} {startIndex + 1}-{Math.min(startIndex + limit, filteredProfiles.length)} / {filteredProfiles.length}
        </p>
        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <a
              href={`/admin/relationships?q=${encodeURIComponent(resolvedSearchParams.q ?? "")}&linked=${linkedFilter}&limit=${limit}&page=${currentPage - 1}`}
              className="rounded-full border border-black/10 bg-white px-4 py-2"
            >
              {t(language, { zh: "上一页", en: "Previous" })}
            </a>
          ) : null}
          {currentPage < totalPages ? (
            <a
              href={`/admin/relationships?q=${encodeURIComponent(resolvedSearchParams.q ?? "")}&linked=${linkedFilter}&limit=${limit}&page=${currentPage + 1}`}
              className="rounded-full border border-black/10 bg-white px-4 py-2"
            >
              {t(language, { zh: "下一页", en: "Next" })}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
