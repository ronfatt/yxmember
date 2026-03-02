import { addMonths, format, parse, startOfMonth } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";

export function resolveAccountingMonth(input?: string | null) {
  const fallback = format(startOfMonth(new Date()), "yyyy-MM");
  if (!input) return fallback;
  return /^\d{4}-\d{2}$/.test(input) ? input : fallback;
}

export function getMonthBounds(month: string) {
  const start = parse(`${month}-01`, "yyyy-MM-dd", new Date());
  const end = addMonths(start, 1);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd")
  };
}

export async function getAccountingSnapshot(admin: SupabaseClient, month: string) {
  const { startDate, endDate } = getMonthBounds(month);

  const [
    { data: paidOrders },
    { data: manualIncome },
    { data: expenses },
    { data: categories },
    { data: accounts }
  ] = await Promise.all([
    admin
      .from("orders")
      .select("id,order_type,cash_paid,amount_total,created_at,payment_status,payment_provider,payment_method")
      .eq("payment_status", "PAID")
      .gte("created_at", startDate)
      .lt("created_at", endDate)
      .order("created_at", { ascending: false }),
    admin
      .from("manual_income_entries")
      .select("id,title,amount_total,received_on,payment_account_id,note,receipt_url,source_type,status,created_at")
      .eq("status", "received")
      .gte("received_on", startDate)
      .lt("received_on", endDate)
      .order("received_on", { ascending: false }),
    admin
      .from("expenses")
      .select("id,title,amount_total,spent_on,payment_account_id,category_id,note,receipt_url,status,created_at")
      .eq("status", "paid")
      .gte("spent_on", startDate)
      .lt("spent_on", endDate)
      .order("spent_on", { ascending: false }),
    admin
      .from("expense_categories")
      .select("id,name,is_active,sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    admin
      .from("payment_accounts")
      .select("id,label,bank_name,account_name,account_number,is_active,sort_order,opening_balance")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
  ]);

  const orderRevenue = (paidOrders ?? []).reduce((sum, order) => sum + Number(order.cash_paid ?? 0), 0);
  const manualIncomeTotal = (manualIncome ?? []).reduce((sum, entry) => sum + Number(entry.amount_total ?? 0), 0);
  const expenseTotal = (expenses ?? []).reduce((sum, entry) => sum + Number(entry.amount_total ?? 0), 0);
  const netCashflow = orderRevenue + manualIncomeTotal - expenseTotal;

  const orderBreakdown = (paidOrders ?? []).reduce<Record<string, number>>((acc, order) => {
    const key = order.order_type || "other";
    acc[key] = (acc[key] ?? 0) + Number(order.cash_paid ?? 0);
    return acc;
  }, {});

  const expenseByCategory = (expenses ?? []).reduce<Record<string, number>>((acc, expense) => {
    const categoryName = categories?.find((category) => category.id === expense.category_id)?.name ?? "Uncategorized";
    acc[categoryName] = (acc[categoryName] ?? 0) + Number(expense.amount_total ?? 0);
    return acc;
  }, {});

  const accountBalances = (accounts ?? []).map((account) => {
    const income = (manualIncome ?? [])
      .filter((entry) => entry.payment_account_id === account.id)
      .reduce((sum, entry) => sum + Number(entry.amount_total ?? 0), 0);
    const outgoing = (expenses ?? [])
      .filter((entry) => entry.payment_account_id === account.id)
      .reduce((sum, entry) => sum + Number(entry.amount_total ?? 0), 0);
    return {
      ...account,
      monthIncome: income,
      monthExpense: outgoing,
      trackedBalance: Number(account.opening_balance ?? 0) + income - outgoing
    };
  });

  const timeline = [
    ...(paidOrders ?? []).map((order) => ({
      id: `order-${order.id}`,
      type: "order" as const,
      title: `Order · ${order.order_type ?? "other"}`,
      amount: Number(order.cash_paid ?? 0),
      date: order.created_at,
      note: [order.payment_provider, order.payment_method].filter(Boolean).join(" · ")
    })),
    ...(manualIncome ?? []).map((entry) => ({
      id: `income-${entry.id}`,
      type: "income" as const,
      title: entry.title,
      amount: Number(entry.amount_total ?? 0),
      date: entry.received_on,
      note: entry.note ?? entry.source_type,
      receiptUrl: entry.receipt_url ?? null
    })),
    ...(expenses ?? []).map((entry) => ({
      id: `expense-${entry.id}`,
      type: "expense" as const,
      title: entry.title,
      amount: Number(entry.amount_total ?? 0),
      date: entry.spent_on,
      note: entry.note ?? null,
      receiptUrl: entry.receipt_url ?? null
    }))
  ].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

  return {
    month,
    startDate,
    endDate,
    paidOrders: paidOrders ?? [],
    manualIncome: manualIncome ?? [],
    expenses: expenses ?? [],
    categories: categories ?? [],
    accounts: accounts ?? [],
    orderRevenue,
    manualIncomeTotal,
    expenseTotal,
    netCashflow,
    orderBreakdown,
    expenseByCategory,
    accountBalances,
    timeline
  };
}
