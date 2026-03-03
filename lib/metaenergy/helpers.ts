import { addMonths, format, startOfMonth, subMonths } from "date-fns";

export function getMonthStart(input: Date) {
  return startOfMonth(input);
}

export function getPreviousMonthRange(reference = new Date()) {
  const monthStart = startOfMonth(subMonths(reference, 1));
  const nextMonthStart = addMonths(monthStart, 1);

  return {
    monthStart,
    nextMonthStart,
    monthKey: format(monthStart, "yyyy-MM-dd")
  };
}

export function formatMoney(value: number | null | undefined) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value ?? 0);
}

export function formatPercent(rate: number | null | undefined) {
  return `${Math.round((rate ?? 0) * 100)}%`;
}

export function generateReferralCode(seed: string) {
  return seed
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
    .slice(0, 10);
}
