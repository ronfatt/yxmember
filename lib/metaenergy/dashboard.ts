import type { Language } from "../i18n/shared";
import { formatMoney } from "./helpers";

export type DashboardProfile = {
  id: string;
  name: string | null;
  birthday: string | null;
  referral_code: string;
  tier_rate: number;
  total_referred_sales: number;
  total_commission_earned: number;
  points_balance: number;
  months_under_50: number;
  referred_by: string | null;
};

export function buildKeepAliveLabel(monthsUnder50: number, language: Language = "en") {
  if (monthsUnder50 >= 1) {
    return language === "en"
      ? "1 strike recorded. Another month below RM50 resets tier progress."
      : "已记录 1 次提醒。若再有一个月低于 RM50，将重置层级进度。";
  }

  return language === "en"
    ? "Active. Stay above RM50 personal cash spend each month."
    : "目前维持正常。每个月个人现金消费请保持在 RM50 以上。";
}

export function buildTierHint(language: Language = "en") {
  return language === "en"
    ? "Strict non-retroactive tiers: the order that crosses a threshold still uses the previous rate."
    : "严格采用不追溯层级：跨过门槛的那一单，仍使用前一个比例。";
}

export function buildPointsHint(language: Language = "en") {
  return language === "en"
    ? "Points can offset up to 50% of an order. At least 50% must be paid in cash."
    : "积分最多只能抵扣订单的 50%。至少 50% 必须以现金支付。";
}

export function buildSpendSummary(value: number, language: Language = "en") {
  return language === "en" ? `${formatMoney(value)} this calendar month` : `本月累计 ${formatMoney(value)}`;
}
