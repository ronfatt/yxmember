import Link from "next/link";
import { requireAdmin } from "../../../../lib/actions/session";
import { getCurrentLanguage } from "../../../../lib/i18n/server";
import { t } from "../../../../lib/i18n/shared";
import { resolveAccountingMonth, getMonthBounds } from "../../../../lib/metaenergy/accounting";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export default async function AdminAccountingReconciliationPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const language = await getCurrentLanguage();
  const resolvedSearchParams = (await searchParams) ?? {};
  const month = resolveAccountingMonth(typeof resolvedSearchParams.month === "string" ? resolvedSearchParams.month : null);
  const { startDate, endDate } = getMonthBounds(month);
  const admin = supabaseAdmin();

  const [{ data: accounts }, { data: pendingOrders }, { data: paidTransfers }, { data: manualIncome }, { data: expenses }] = await Promise.all([
    admin
      .from("payment_accounts")
      .select("id,label,bank_name,account_name,account_number,is_active")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    admin
      .from("orders")
      .select("id,user_id,amount_total,currency,payment_status,slip_url,created_at")
      .eq("payment_status", "PENDING")
      .not("slip_url", "is", null)
      .gte("created_at", startDate)
      .lt("created_at", endDate)
      .order("created_at", { ascending: false }),
    admin
      .from("orders")
      .select("id,user_id,amount_total,currency,payment_status,payment_provider,payment_method,slip_url,created_at,paid_at")
      .eq("payment_status", "PAID")
      .or("payment_provider.eq.BANK_TRANSFER,payment_method.eq.BANK_TRANSFER")
      .gte("created_at", startDate)
      .lt("created_at", endDate)
      .order("created_at", { ascending: false }),
    admin
      .from("manual_income_entries")
      .select("id,title,amount_total,received_on,payment_account_id,receipt_url,note,status")
      .eq("status", "received")
      .gte("received_on", startDate)
      .lt("received_on", endDate)
      .order("received_on", { ascending: false }),
    admin
      .from("expenses")
      .select("id,title,amount_total,spent_on,payment_account_id,receipt_url,note,status")
      .eq("status", "paid")
      .gte("spent_on", startDate)
      .lt("spent_on", endDate)
      .order("spent_on", { ascending: false })
  ]);

  const memberIds = Array.from(
    new Set([...(pendingOrders ?? []).map((order) => order.user_id), ...(paidTransfers ?? []).map((order) => order.user_id)].filter(Boolean))
  );
  const { data: members } = memberIds.length
    ? await admin.from("users_profile").select("id,name,referral_code").in("id", memberIds)
    : { data: [] as Array<{ id: string; name: string | null; referral_code: string | null }> };
  const memberMap = new Map((members ?? []).map((member) => [member.id, member]));

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d7240]">
              {t(language, { zh: "银行对账", en: "Bank reconciliation" })}
            </p>
            <h2 className="font-display text-4xl text-[#123524]">
              {t(language, { zh: `${month} 对账看板`, en: `${month} reconciliation board` })}
            </h2>
            <p className="text-sm text-black/60">
              {t(language, { zh: "把待审核汇款、已收银行转账、手动收入和支出放在一起，方便内部对账。", en: "Review pending slips, settled transfers, manual income, and expenses in one place for internal reconciliation." })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/accounting?month=${month}`} className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70">
              {t(language, { zh: "返回财务中心", en: "Back to accounting" })}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card space-y-4">
          <h3 className="font-display text-3xl text-[#123524]">{t(language, { zh: "待审核汇款单据", en: "Pending transfer slips" })}</h3>
          {(pendingOrders ?? []).length ? (
            <div className="space-y-3">
              {(pendingOrders ?? []).map((order) => {
                const member = memberMap.get(order.user_id);
                return (
                  <div key={order.id} className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#123524]">{member?.name ?? t(language, { zh: "会员", en: "Member" })}{member?.referral_code ? ` (${member.referral_code})` : ""}</p>
                        <p className="text-xs text-black/50">RM {Number(order.amount_total ?? 0).toFixed(2)} · {order.currency} · #{order.id.slice(0, 8)}</p>
                      </div>
                      {order.slip_url ? (
                        <a href={order.slip_url} target="_blank" rel="noreferrer" className="text-jade underline underline-offset-4">
                          {t(language, { zh: "查看单据", en: "View slip" })}
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "这个月份没有待审核汇款。", en: "There are no pending transfer slips this month." })}</p>
          )}
        </div>

        <div className="card space-y-4">
          <h3 className="font-display text-3xl text-[#123524]">{t(language, { zh: "已收银行转账", en: "Settled bank transfers" })}</h3>
          {(paidTransfers ?? []).length ? (
            <div className="space-y-3">
              {(paidTransfers ?? []).map((order) => {
                const member = memberMap.get(order.user_id);
                return (
                  <div key={order.id} className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#123524]">{member?.name ?? t(language, { zh: "会员", en: "Member" })}{member?.referral_code ? ` (${member.referral_code})` : ""}</p>
                        <p className="text-xs text-black/50">RM {Number(order.amount_total ?? 0).toFixed(2)} · #{order.id.slice(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-black/45">{order.paid_at ?? order.created_at}</p>
                        {order.slip_url ? (
                          <a href={order.slip_url} target="_blank" rel="noreferrer" className="text-jade underline underline-offset-4">
                            {t(language, { zh: "查看单据", en: "View slip" })}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "这个月份没有银行转账入账。", en: "There are no bank-transfer receipts this month." })}</p>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="card space-y-4">
          <h3 className="font-display text-3xl text-[#123524]">{t(language, { zh: "账户清单", en: "Accounts" })}</h3>
          {(accounts ?? []).length ? (
            <div className="space-y-3">
              {(accounts ?? []).map((account) => (
                <div key={account.id} className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-[#123524]">{account.label}</p>
                  <p className="text-xs text-black/50">{account.bank_name} · {account.account_name} · {account.account_number}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有设置收款账户。", en: "No payment accounts yet." })}</p>
          )}
        </div>

        <div className="card space-y-4">
          <h3 className="font-display text-3xl text-[#123524]">{t(language, { zh: "账户相关记录", en: "Account-linked records" })}</h3>
          <div className="space-y-3">
            {(manualIncome ?? []).map((entry) => (
              <div key={`income-${entry.id}`} className="rounded-2xl border border-black/8 bg-[#f7faf7] px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#123524]">{t(language, { zh: "手动收入", en: "Manual income" })} · {entry.title}</p>
                    <p className="text-xs text-black/50">{entry.received_on} · RM {Number(entry.amount_total ?? 0).toFixed(2)}</p>
                  </div>
                  {entry.receipt_url ? <a href={entry.receipt_url} target="_blank" rel="noreferrer" className="text-jade underline underline-offset-4">{t(language, { zh: "查看凭证", en: "View receipt" })}</a> : null}
                </div>
              </div>
            ))}
            {(expenses ?? []).map((entry) => (
              <div key={`expense-${entry.id}`} className="rounded-2xl border border-black/8 bg-[#fff7f2] px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#8c3a1f]">{t(language, { zh: "支出", en: "Expense" })} · {entry.title}</p>
                    <p className="text-xs text-black/50">{entry.spent_on} · RM {Number(entry.amount_total ?? 0).toFixed(2)}</p>
                  </div>
                  {entry.receipt_url ? <a href={entry.receipt_url} target="_blank" rel="noreferrer" className="text-jade underline underline-offset-4">{t(language, { zh: "查看凭证", en: "View receipt" })}</a> : null}
                </div>
              </div>
            ))}
            {!manualIncome?.length && !expenses?.length ? (
              <p className="text-sm text-black/60">{t(language, { zh: "这个月份还没有账户相关收入或支出记录。", en: "There are no account-linked income or expense records for this month." })}</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
