import Link from "next/link";
import { requireAdmin } from "../../../../lib/actions/session";
import { getCurrentLanguage } from "../../../../lib/i18n/server";
import { t } from "../../../../lib/i18n/shared";
import { getAccountingSnapshot, resolveAccountingMonth } from "../../../../lib/metaenergy/accounting";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export default async function AdminAccountingReportsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const language = getCurrentLanguage();
  const resolvedSearchParams = (await searchParams) ?? {};
  const month = resolveAccountingMonth(typeof resolvedSearchParams.month === "string" ? resolvedSearchParams.month : null);
  const snapshot = await getAccountingSnapshot(supabaseAdmin(), month);

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d7240]">
              {t(language, { zh: "月度报表", en: "Monthly report" })}
            </p>
            <h2 className="font-display text-4xl text-[#123524]">
              {t(language, { zh: `${snapshot.month} 财务摘要`, en: `${snapshot.month} financial summary` })}
            </h2>
          </div>
          <Link href={`/admin/accounting?month=${snapshot.month}`} className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70">
            {t(language, { zh: "返回财务中心", en: "Back to accounting" })}
          </Link>
          <Link href={`/admin/accounting/export?month=${snapshot.month}`} className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70">
            {t(language, { zh: "导出 CSV", en: "Export CSV" })}
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <h3 className="font-display text-3xl text-[#123524]">{t(language, { zh: "收入来源", en: "Revenue sources" })}</h3>
          <div className="space-y-3">
            {Object.entries(snapshot.orderBreakdown).length ? Object.entries(snapshot.orderBreakdown).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm">
                <span className="text-[#123524]">{key}</span>
                <span className="font-medium text-[#123524]">RM {value.toFixed(2)}</span>
              </div>
            )) : (
              <p className="text-sm text-black/60">{t(language, { zh: "这个月没有订单收入。", en: "There is no order revenue this month." })}</p>
            )}
            <div className="flex items-center justify-between rounded-2xl border border-black/8 bg-[#f7faf7] px-4 py-3 text-sm">
              <span>{t(language, { zh: "手动收入", en: "Manual income" })}</span>
              <span className="font-medium text-[#123524]">RM {snapshot.manualIncomeTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-display text-3xl text-[#123524]">{t(language, { zh: "支出分类", en: "Expense categories" })}</h3>
          <div className="space-y-3">
            {Object.entries(snapshot.expenseByCategory).length ? Object.entries(snapshot.expenseByCategory).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm">
                <span className="text-[#123524]">{key}</span>
                <span className="font-medium text-[#8c3a1f]">RM {value.toFixed(2)}</span>
              </div>
            )) : (
              <p className="text-sm text-black/60">{t(language, { zh: "这个月没有支出记录。", en: "There are no expenses this month." })}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
