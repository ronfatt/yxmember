import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../lib/actions/session";
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
  searchParams?: {
    q?: string;
  };
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

export default async function AdminRelationshipsPage({ searchParams }: RelationshipsPageProps) {
  await requireAdmin();
  const admin = supabaseAdmin();
  const query = (searchParams?.q ?? "").trim().toLowerCase();

  const { data: profiles } = await admin
    .from("users_profile")
    .select("id,name,referral_code,referred_by,created_at,total_referred_sales,tier_rate")
    .order("created_at", { ascending: true });

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      {
        name: profile.name ?? "Member",
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
    if (!query) return true;
    const upstream = profile.referred_by ? profileMap.get(profile.referred_by) : null;
    return (
      (profile.name ?? "").toLowerCase().includes(query) ||
      profile.referral_code.toLowerCase().includes(query) ||
      (upstream?.name ?? "").toLowerCase().includes(query) ||
      (upstream?.referralCode ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">Admin relationships</p>
          <h2 className="font-display text-3xl text-[#123524]">Upstream and downline map</h2>
          <p className="text-sm text-black/60">Use this page to confirm who belongs to which referrer before creating or auditing orders.</p>
        </div>
        <form className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={searchParams?.q ?? ""}
            placeholder="Search member, code, or upstream"
            className="min-w-[280px] flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3"
          />
          <button type="submit" className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white">
            Search
          </button>
          <a href="/admin/relationships" className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-[#123524]">
            Clear
          </a>
        </form>
      </div>

      <div className="grid gap-4">
        {filteredProfiles.length ? (
          filteredProfiles.map((profile) => {
            const upstream = profile.referred_by ? profileMap.get(profile.referred_by) : null;
            const downlines = downlinesMap.get(profile.id) ?? [];

            return (
              <div key={profile.id} className="card space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-3xl text-[#123524]">{profile.name ?? "Member"}</p>
                    <p className="text-sm text-black/60">{profile.referral_code}</p>
                  </div>
                  <div className="text-sm text-black/60">
                    <p>Tier: {Math.round(Number(profile.tier_rate ?? 0) * 100)}%</p>
                    <p>Referred sales: RM {Number(profile.total_referred_sales ?? 0).toFixed(2)}</p>
                    <p>Downlines: {downlines.length}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-3 text-sm">
                  <p className="font-medium text-black/70">Upstream</p>
                  <p className="mt-1 text-[#123524]">
                    {upstream ? `${upstream.name} (${upstream.referralCode})` : "No upstream referrer"}
                  </p>
                  <form action={updateUpstreamAction} className="mt-3 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="member_id" value={profile.id} />
                    <label className="min-w-[260px] flex-1 space-y-2 text-sm">
                      <span className="font-medium text-black/65">Change upstream</span>
                      <select
                        name="upstream_id"
                        defaultValue={profile.referred_by ?? ""}
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
                      >
                        <option value="">No upstream referrer</option>
                        {(profiles ?? [])
                          .filter((candidate) => candidate.id !== profile.id)
                          .map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                              {candidate.name ?? "Member"} ({candidate.referral_code})
                            </option>
                          ))}
                      </select>
                    </label>
                    <button className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white">
                      Save upstream
                    </button>
                  </form>
                  <p className="mt-2 text-xs text-black/50">
                    Relationship edits affect future order attribution only. Historical commissions are not rewritten automatically.
                  </p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-black/70">Downlines</p>
                  {downlines.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {downlines.map((downline) => (
                        <span key={downline.id} className="rounded-full border border-black/10 bg-[#f8f6f2] px-3 py-1 text-black/70">
                          {downline.name ?? "Member"} ({downline.referral_code})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-black/55">No downlines yet.</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card">
            <p className="text-sm text-black/60">No members matched the current search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
