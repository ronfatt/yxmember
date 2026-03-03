import { revalidatePath } from "next/cache";
import CopyField from "../../../components/CopyField";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { buildFallbackPaymentAccount, getActivePaymentAccounts } from "../../../lib/metaenergy/payment-accounts";
import { supabaseAdmin } from "../../../lib/supabase/admin";

async function createAccount(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  await admin.from("payment_accounts").insert({
    label: String(formData.get("label") || ""),
    bank_name: String(formData.get("bank_name") || ""),
    account_name: String(formData.get("account_name") || ""),
    account_number: String(formData.get("account_number") || ""),
    opening_balance: Number(formData.get("opening_balance") || 0),
    reference_note: String(formData.get("reference_note") || "") || null,
    sort_order: Number(formData.get("sort_order") || 0),
    is_active: formData.get("is_active") === "true"
  });
  revalidatePath("/admin/accounts");
  revalidatePath("/dashboard/programs");
}

async function updateAccount(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const id = String(formData.get("id"));
  await admin
    .from("payment_accounts")
    .update({
      label: String(formData.get("label") || ""),
      bank_name: String(formData.get("bank_name") || ""),
      account_name: String(formData.get("account_name") || ""),
      account_number: String(formData.get("account_number") || ""),
      opening_balance: Number(formData.get("opening_balance") || 0),
      reference_note: String(formData.get("reference_note") || "") || null,
      sort_order: Number(formData.get("sort_order") || 0),
      is_active: formData.get("is_active") === "true",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);
  revalidatePath("/admin/accounts");
  revalidatePath("/dashboard/programs");
}

export default async function AdminAccountsPage() {
  const language = await getCurrentLanguage();
  const admin = supabaseAdmin();
  const accounts = await getActivePaymentAccounts(admin);
  const { data: allAccounts } = await admin
    .from("payment_accounts")
    .select("id,label,bank_name,account_name,account_number,reference_note,is_active,sort_order,opening_balance")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const fallbackAccount = buildFallbackPaymentAccount();

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-2xl">{t(language, { zh: "新增收款账户", en: "Add payment account" })}</h2>
          <p className="text-sm text-black/60">{t(language, { zh: "把银行收款资料从环境变量移到后台管理。会员课程活动页会读取启用中的账户。", en: "Manage bank transfer destinations here instead of hardcoding them in environment variables." })}</p>
        </div>
        <form action={createAccount} className="grid gap-3 md:grid-cols-2">
          <input className="rounded border p-2" name="label" placeholder={t(language, { zh: "账户标签，例如：主收款户口", en: "Label, e.g. Main receiving account" })} required />
          <input className="rounded border p-2" name="bank_name" placeholder={t(language, { zh: "银行名称", en: "Bank name" })} required />
          <input className="rounded border p-2" name="account_name" placeholder={t(language, { zh: "账户名称", en: "Account name" })} required />
          <input className="rounded border p-2" name="account_number" placeholder={t(language, { zh: "账号", en: "Account number" })} required />
          <input className="rounded border p-2" name="opening_balance" type="number" step="0.01" defaultValue="0" placeholder={t(language, { zh: "期初余额", en: "Opening balance" })} />
          <input className="rounded border p-2" name="reference_note" placeholder={t(language, { zh: "备注 / 付款参考", en: "Reference note" })} />
          <input className="rounded border p-2" name="sort_order" type="number" placeholder={t(language, { zh: "排序", en: "Sort order" })} defaultValue="0" />
          <select name="is_active" className="rounded border p-2 text-sm">
            <option value="true">{t(language, { zh: "启用", en: "Active" })}</option>
            <option value="false">{t(language, { zh: "停用", en: "Inactive" })}</option>
          </select>
          <button className="rounded-full bg-ink px-4 py-2 text-white md:col-span-2">{t(language, { zh: "创建账户", en: "Create account" })}</button>
        </form>
      </section>

      <section className="card space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-2xl">{t(language, { zh: "启用中的账户", en: "Active accounts" })}</h2>
          <p className="text-sm text-black/60">{t(language, { zh: "会员在课程活动页看到的就是这里启用中的资料。", en: "Members see these active accounts on the programs page." })}</p>
        </div>
        {accounts.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {accounts.map((account) => (
              <div key={account.id} className="space-y-3 rounded-3xl border border-black/10 bg-white px-4 py-4">
                <p className="font-display text-xl text-[#123524]">{account.label}</p>
                <CopyField label={t(language, { zh: "银行", en: "Bank" })} value={account.bank_name} language={language} />
                <CopyField label={t(language, { zh: "账户名称", en: "Account name" })} value={account.account_name} language={language} />
                <CopyField label={t(language, { zh: "账号", en: "Account number" })} value={account.account_number} language={language} />
                <CopyField label={t(language, { zh: "期初余额", en: "Opening balance" })} value={`RM ${Number(account.opening_balance ?? 0).toFixed(2)}`} language={language} />
                {account.reference_note ? <CopyField label={t(language, { zh: "备注", en: "Reference" })} value={account.reference_note} language={language} /> : null}
              </div>
            ))}
          </div>
        ) : fallbackAccount ? (
          <div className="space-y-3 rounded-3xl border border-dashed border-black/10 bg-white px-4 py-4">
            <p className="font-display text-xl text-[#123524]">{t(language, { zh: "环境变量备用账户", en: "Environment fallback account" })}</p>
            <p className="text-sm text-black/60">{t(language, { zh: "数据库里还没有启用账户，所以系统暂时仍会读取环境变量。", en: "No active database account exists yet, so the system is still reading the environment fallback." })}</p>
            <CopyField label={t(language, { zh: "银行", en: "Bank" })} value={fallbackAccount.bank_name} language={language} />
            <CopyField label={t(language, { zh: "账户名称", en: "Account name" })} value={fallbackAccount.account_name} language={language} />
            <CopyField label={t(language, { zh: "账号", en: "Account number" })} value={fallbackAccount.account_number} language={language} />
          </div>
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有任何可用的收款账户。", en: "There are no payment accounts yet." })}</p>
        )}
      </section>

      <section className="card space-y-4">
        <h2 className="font-display text-2xl">{t(language, { zh: "账户列表", en: "All accounts" })}</h2>
        {allAccounts?.length ? (
          <div className="space-y-4">
            {allAccounts.map((account) => (
              <form key={account.id} action={updateAccount} className="grid gap-3 rounded-3xl border border-black/10 bg-white px-4 py-4 md:grid-cols-2">
                <input type="hidden" name="id" value={account.id} />
                <input className="rounded border p-2" name="label" defaultValue={account.label} />
                <input className="rounded border p-2" name="bank_name" defaultValue={account.bank_name} />
                <input className="rounded border p-2" name="account_name" defaultValue={account.account_name} />
                <input className="rounded border p-2" name="account_number" defaultValue={account.account_number} />
                <input className="rounded border p-2" name="opening_balance" type="number" step="0.01" defaultValue={account.opening_balance ?? 0} />
                <input className="rounded border p-2" name="reference_note" defaultValue={account.reference_note ?? ""} />
                <input className="rounded border p-2" name="sort_order" type="number" defaultValue={account.sort_order} />
                <select name="is_active" defaultValue={String(account.is_active)} className="rounded border p-2 text-sm">
                  <option value="true">{t(language, { zh: "启用", en: "Active" })}</option>
                  <option value="false">{t(language, { zh: "停用", en: "Inactive" })}</option>
                </select>
                <button className="rounded-full bg-ink px-4 py-2 text-white md:justify-self-start">{t(language, { zh: "更新账户", en: "Update account" })}</button>
              </form>
            ))}
          </div>
        ) : (
          <p className="text-sm text-black/60">{t(language, { zh: "还没有账户记录。", en: "No payment accounts yet." })}</p>
        )}
      </section>
    </div>
  );
}
