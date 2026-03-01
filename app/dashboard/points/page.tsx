import DashboardShell from "../../../components/DashboardShell";
import RedeemSimulator from "../../../components/RedeemSimulator";
import { requireUser } from "../../../lib/actions/session";
import { formatMoney } from "../../../lib/metaenergy/helpers";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PointsDashboardPage() {
  const user = await requireUser();
  const supabase = createClient();

  const [{ data: profile }, { data: ledger }] = await Promise.all([
    supabase.from("users_profile").select("points_balance").eq("id", user.id).single(),
    supabase
      .from("points_ledger")
      .select("id,points,action,note,order_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  return (
    <DashboardShell title="Points wallet" subtitle="Balance, history, and redemption cap simulator">
      <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <div className="card space-y-3">
          <p className="text-sm text-black/55">Points balance</p>
          <p className="font-display text-4xl text-[#123524]">{Number(profile?.points_balance ?? 0)} pts</p>
          <p className="text-sm text-black/65">1 point = RM0.10. Any redemption is capped at 50% of the order total.</p>
          <RedeemSimulator pointsBalance={Number(profile?.points_balance ?? 0)} />
        </div>
        <div className="card space-y-3">
          <h2 className="font-display text-3xl text-[#123524]">Recent ledger</h2>
          {ledger?.length ? (
            ledger.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium uppercase tracking-wide text-black/70">{entry.action}</p>
                  <p className={entry.points >= 0 ? "text-jade" : "text-[#8c3a1f]"}>{entry.points} pts</p>
                </div>
                <p className="mt-1 text-black/60">{entry.note ?? "No note"}.</p>
                {entry.order_id ? <p className="mt-1 break-all text-black/45">Order ID: {entry.order_id}</p> : null}
                <p className="mt-1 text-black/45">{new Date(entry.created_at).toLocaleString("en-MY")}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">No point activity yet.</p>
          )}
        </div>
      </div>
      <div className="card mt-4">
        <p className="text-sm text-black/60">
          Example rule: an order worth {formatMoney(100)} can use at most {formatMoney(50)} in points, so the member must still pay {formatMoney(50)} cash.
        </p>
      </div>
    </DashboardShell>
  );
}
