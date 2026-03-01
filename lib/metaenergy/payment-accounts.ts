import type { SupabaseClient } from "@supabase/supabase-js";

export type PaymentAccount = {
  id: string;
  label: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  reference_note: string | null;
  is_active: boolean;
  sort_order: number;
};

export async function getActivePaymentAccounts(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("payment_accounts")
    .select("id,label,bank_name,account_name,account_number,reference_note,is_active,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (data ?? []) as PaymentAccount[];
}

export function buildFallbackPaymentAccount() {
  const bankName = process.env.BANK_BANK_NAME?.trim();
  const accountName = process.env.BANK_ACCOUNT_NAME?.trim();
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER?.trim();

  if (!bankName && !accountName && !accountNumber) {
    return null;
  }

  return {
    id: "env-fallback",
    label: "Default account",
    bank_name: bankName ?? "",
    account_name: accountName ?? "",
    account_number: accountNumber ?? "",
    reference_note: process.env.BANK_TRANSFER_NOTE?.trim() ?? null,
    is_active: true,
    sort_order: 0
  } satisfies PaymentAccount;
}
