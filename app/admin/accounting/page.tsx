import { revalidatePath } from "next/cache";
import Link from "next/link";
import { requireAdmin } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { getAccountingSnapshot, resolveAccountingMonth } from "../../../lib/metaenergy/accounting";
import { supabaseAdmin } from "../../../lib/supabase/admin";

async function createExpenseCategory(formData: FormData) {
  "use server";
  await requireAdmin();
  const admin = supabaseAdmin();
  await admin.from("expense_categories").insert({
    name: String(formData.get("name") || ""),
    sort_order: Number(formData.get("sort_order") || 0),
    is_active: formData.get("is_active") === "true"
  });
  revalidatePath("/admin/accounting");
}

async function createExpense(formData: FormData) {
  "use server";
  const adminUser = await requireAdmin();
  const admin = supabaseAdmin();
  await admin.from("expenses").insert({
    title: String(formData.get("title") || ""),
    category_id: String(formData.get("category_id") || "") || null,
    payment_account_id: String(formData.get("payment_account_id") || "") || null,
    amount_total: Number(formData.get("amount_total") || 0),
    spent_on: String(formData.get("spent_on") || ""),
    note: String(formData.get("note") || "") || null,
    status: String(formData.get("status") || "paid"),
    created_by: adminUser.id
  });
  revalidatePath("/admin/accounting");
}

async function createManualIncome(formData: FormData) {
  "use server";
  const adminUser = await requireAdmin();
  const admin = supabaseAdmin();
  await admin.from("manual_income_entries").insert({
    title: String(formData.get("title") || ""),
    payment_account_id: String(formData.get("payment_account_id") || "") || null,
    amount_total: Number(formData.get("amount_total") || 0),
    received_on: String(formData.get("received_on") || ""),
    note: String(formData.get("note") || "") || null,
    source_type: String(formData.get("source_type") || "other"),
    status: String(formData.get("status") || "received"),
    created_by: adminUser.id
  });
  revalidatePath("/admin/accounting");
}

function monthLabel(month: string, language: "zh" | "en") {
  const [year, monthNumber] = month.split("-");
  return language === "en" ? `${year}-${monthNumber}` : `${year} 年 ${monthNumber} 月`;
}

export default async function AdminAccountingPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const language = getCurrentLanguage();
  const resolvedSearchParams = (await searchParams) ?? {};
  const month = resolveAccountingMonth(typeof resolvedSearchParams.month === "string" ? resolvedSearchParams.month : null);
  const admin = supabaseAdmin();
  const snapshot = await getAccountingSnapshot(admin, month);

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d7240]">
              {t(language, { zh: "财务中心", en: "Accounting center" })}
            </p>
            <h2 className="font-display text-4xl text-[#123524]">
              {t(language, { zh: "记账、收入、支出与月报", en: "Bookkeeping, cash-in, expenses, and monthly reporting" })}
            </h2>
            <p className="text-sm text-black/60">
              {t(language, { zh: "这版财务中心直接建立在现有订单、账户、库存之上，先满足内部记账与营运复盘。", en: "This accounting MVP sits on top of your existing orders, accounts, and inventory to support internal bookkeeping and operating reviews." })}
            </p>
          </div>

          <form className="flex flex-wrap items-center gap-3">
            <input type="month" name="month" defaultValue={month} className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm" />
            <button className="rounded-full bg-[#123524] px-5 py-3 text-sm font-semibold text-white">
              {t(language, { zh: "查看月份", en: "Load month" })}
            </button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white px-5 py-4">
            <p className="text-sm text-black/55">{t(language, { zh: "订单现金收入", en: "Order cash revenue" })}</p>
            <p className="font-display text-3xl text-[#123524]">RM {snapshot.orderRevenue.toFixed(2)}</p>
            <p className="text-xs text-black/50">{monthLabel(snapshot.month, language)}</p>
          </div>
          <div className="rounded-3xl bg-white px-5 py-4">
            <p className="text-sm text-black/55">{t(language, { zh: "手动收入", en: "Manual income" })}</p>
            <p className="font-display text-3xl text-[#123524]">RM {snapshot.manualIncomeTotal.toFixed(2)}</p>
            <p className="text-xs text-black/50">{snapshot.manualIncome.length} {t(language, { zh: "笔", en: "entries" })}</p>
          </div>
          <div className="rounded-3xl bg-white px-5 py-4">
            <p className="text-sm text-black/55">{t(language, { zh: "已付支出", en: "Paid expenses" })}</p>
            <p className="font-display text-3xl text-[#8c3a1f]">RM {snapshot.expenseTotal.toFixed(2)}</p>
            <p className="text-xs text-black/50">{snapshot.expenses.length} {t(language, { zh: "笔", en: "entries" })}</p>
          </div>
          <div className="rounded-3xl bg-white px-5 py-4">
            <p className="text-sm text-black/55">{t(language, { zh: "净现金流", en: "Net cashflow" })}</p>
            <p className={`font-display text-3xl ${snapshot.netCashflow >= 0 ? "text-[#123524]" : "text-[#8c3a1f]"}`}>
              RM {snapshot.netCashflow.toFixed(2)}
            </p>
            <p className="text-xs text-black/50">{t(language, { zh: "订单现金 + 手动收入 - 支出", en: "Order cash + manual income - expenses" })}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-3xl text-[#123524]">{t(language, { zh: "月度流水", en: "Monthly ledger" })}</h3>
              <p className="text-sm text-black/60">{t(language, { zh: "把订单、手动收入、支出放到一个时间轴里查看。", en: "Review orders, manual income, and expenses in a single timeline." })}</p>
            </div>
            <Link href={`/admin/accounting/reports?month=${snapshot.month}`} className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70">
              {t(language, { zh: "查看报表", en: "Open reports" })}
            </Link>
          </div>

          {snapshot.timeline.length ? (
            <div className="space-y-3">
              {snapshot.timeline.slice(0, 18).map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-[#123524]">
                      {item.type === "order"
                        ? t(language, { zh: "订单收入", en: "Order revenue" })
                        : item.type === "income"
                          ? t(language, { zh: "手动收入", en: "Manual income" })
                          : t(language, { zh: "支出", en: "Expense" })}
                      {" · "}
                      {item.title}
                    </p>
                    <p className="text-xs text-black/50">{item.note || t(language, { zh: "没有备注", en: "No note" })}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${item.type === "expense" ? "text-[#8c3a1f]" : "text-[#123524]"}`}>
                      {item.type === "expense" ? "-" : "+"} RM {item.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-black/45">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "这个月份还没有财务流水。", en: "There is no accounting activity for this month yet." })}</p>
          )}
        </div>

        <div className="card space-y-4">
          <div>
            <h3 className="font-display text-3xl text-[#123524]">{t(language, { zh: "账户余额视图", en: "Account balance view" })}</h3>
            <p className="text-sm text-black/60">{t(language, { zh: "根据账户期初余额 + 本月手动收入 - 本月支出得出，可作为内部跟踪余额。", en: "Computed from opening balance + monthly manual income - monthly expenses for internal tracking." })}</p>
          </div>
          {snapshot.accountBalances.length ? (
            <div className="space-y-3">
              {snapshot.accountBalances.map((account) => (
                <div key={account.id} className="rounded-2xl border border-black/8 bg-white px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#123524]">{account.label}</p>
                      <p className="text-xs text-black/50">{account.bank_name} · {account.account_name}</p>
                    </div>
                    <p className="font-display text-2xl text-[#123524]">RM {Number(account.trackedBalance).toFixed(2)}</p>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-black/55 md:grid-cols-3">
                    <p>{t(language, { zh: "期初", en: "Opening" })}: RM {Number(account.opening_balance ?? 0).toFixed(2)}</p>
                    <p>{t(language, { zh: "本月收入", en: "Month income" })}: RM {Number(account.monthIncome ?? 0).toFixed(2)}</p>
                    <p>{t(language, { zh: "本月支出", en: "Month expense" })}: RM {Number(account.monthExpense ?? 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/60">{t(language, { zh: "还没有收款账户。请先到账户页建立。", en: "No payment accounts yet. Add them from the accounts page first." })}</p>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="card space-y-4">
          <div>
            <h3 className="font-display text-2xl text-[#123524]">{t(language, { zh: "新增支出分类", en: "Add expense category" })}</h3>
            <p className="text-sm text-black/60">{t(language, { zh: "例如：场地、导师费、广告、采购、杂费。", en: "Examples: venue, mentor fee, ads, purchases, misc." })}</p>
          </div>
          <form action={createExpenseCategory} className="space-y-3">
            <input className="w-full rounded border p-2" name="name" placeholder={t(language, { zh: "分类名称", en: "Category name" })} required />
            <input className="w-full rounded border p-2" name="sort_order" type="number" defaultValue="0" placeholder={t(language, { zh: "排序", en: "Sort order" })} />
            <select name="is_active" className="w-full rounded border p-2 text-sm" defaultValue="true">
              <option value="true">{t(language, { zh: "启用", en: "Active" })}</option>
              <option value="false">{t(language, { zh: "停用", en: "Inactive" })}</option>
            </select>
            <button className="rounded-full bg-[#123524] px-4 py-2 text-sm text-white">{t(language, { zh: "创建分类", en: "Create category" })}</button>
          </form>
        </div>

        <div className="card space-y-4">
          <div>
            <h3 className="font-display text-2xl text-[#123524]">{t(language, { zh: "登记支出", en: "Log expense" })}</h3>
            <p className="text-sm text-black/60">{t(language, { zh: "用于记录导师费、房租、采购、广告与其他支出。", en: "Record mentor fees, rent, purchasing, advertising, and other outgoing cash." })}</p>
          </div>
          <form action={createExpense} className="space-y-3">
            <input className="w-full rounded border p-2" name="title" placeholder={t(language, { zh: "支出标题", en: "Expense title" })} required />
            <select name="category_id" className="w-full rounded border p-2 text-sm" defaultValue="">
              <option value="">{t(language, { zh: "未分类", en: "Uncategorized" })}</option>
              {snapshot.categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select name="payment_account_id" className="w-full rounded border p-2 text-sm" defaultValue="">
              <option value="">{t(language, { zh: "不指定账户", en: "No account selected" })}</option>
              {snapshot.accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.label}</option>
              ))}
            </select>
            <input className="w-full rounded border p-2" name="amount_total" type="number" step="0.01" placeholder={t(language, { zh: "金额（RM）", en: "Amount (RM)" })} required />
            <input className="w-full rounded border p-2" name="spent_on" type="date" required />
            <textarea className="w-full rounded border p-2" name="note" placeholder={t(language, { zh: "备注", en: "Note" })} />
            <select name="status" className="w-full rounded border p-2 text-sm" defaultValue="paid">
              <option value="paid">{t(language, { zh: "已支付", en: "Paid" })}</option>
              <option value="draft">{t(language, { zh: "草稿", en: "Draft" })}</option>
            </select>
            <button className="rounded-full bg-[#123524] px-4 py-2 text-sm text-white">{t(language, { zh: "保存支出", en: "Save expense" })}</button>
          </form>
        </div>

        <div className="card space-y-4">
          <div>
            <h3 className="font-display text-2xl text-[#123524]">{t(language, { zh: "登记手动收入", en: "Log manual income" })}</h3>
            <p className="text-sm text-black/60">{t(language, { zh: "用于记录线下收入、调整项或不经过订单系统的现金流入。", en: "Record offline income, adjustments, or cash-in that does not come through the order system." })}</p>
          </div>
          <form action={createManualIncome} className="space-y-3">
            <input className="w-full rounded border p-2" name="title" placeholder={t(language, { zh: "收入标题", en: "Income title" })} required />
            <select name="payment_account_id" className="w-full rounded border p-2 text-sm" defaultValue="">
              <option value="">{t(language, { zh: "不指定账户", en: "No account selected" })}</option>
              {snapshot.accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.label}</option>
              ))}
            </select>
            <input className="w-full rounded border p-2" name="amount_total" type="number" step="0.01" placeholder={t(language, { zh: "金额（RM）", en: "Amount (RM)" })} required />
            <input className="w-full rounded border p-2" name="received_on" type="date" required />
            <select name="source_type" className="w-full rounded border p-2 text-sm" defaultValue="other">
              <option value="other">{t(language, { zh: "其他", en: "Other" })}</option>
              <option value="offline_sale">{t(language, { zh: "线下销售", en: "Offline sale" })}</option>
              <option value="adjustment">{t(language, { zh: "调整项", en: "Adjustment" })}</option>
            </select>
            <textarea className="w-full rounded border p-2" name="note" placeholder={t(language, { zh: "备注", en: "Note" })} />
            <select name="status" className="w-full rounded border p-2 text-sm" defaultValue="received">
              <option value="received">{t(language, { zh: "已到账", en: "Received" })}</option>
              <option value="draft">{t(language, { zh: "草稿", en: "Draft" })}</option>
            </select>
            <button className="rounded-full bg-[#123524] px-4 py-2 text-sm text-white">{t(language, { zh: "保存收入", en: "Save income" })}</button>
          </form>
        </div>
      </section>
    </div>
  );
}
