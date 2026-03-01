"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";

type UserOption = {
  id: string;
  name: string | null;
  referral_code: string;
  referred_by: string | null;
};

export default function AdminOrderForm({
  users,
  language
}: {
  users: UserOption[];
  language: Language;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [amountTotal, setAmountTotal] = useState("100");
  const [pointsRedeemed, setPointsRedeemed] = useState("0");
  const [orderType, setOrderType] = useState<"personal" | "service" | "product">("product");
  const [referrerId, setReferrerId] = useState("");
  const selectedUser = users.find((user) => user.id === userId);
  const inferredReferrerId = selectedUser?.referred_by ?? "";
  const selectedReferrer = users.find((user) => user.id === (referrerId || inferredReferrerId));
  const source = inferredReferrerId ? "referred" : "personal";

  useEffect(() => {
    setReferrerId(inferredReferrerId);
  }, [inferredReferrerId]);

  const handleSubmit = async () => {
    const payload = {
      userId,
      amountTotal: Number(amountTotal),
      pointsRedeemed: Number(pointsRedeemed),
      orderType,
      referrerId: source === "referred" ? (referrerId || inferredReferrerId) : null,
      referredUserId: source === "referred" ? userId : null
    };

    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? (language === "en" ? "Unable to create order." : "无法创建订单。"));
      return;
    }

    toast.success(language === "en" ? "Order created." : "订单已创建。");
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-black/65">{language === "en" ? "Buyer" : "购买会员"}</span>
          <select
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ?? (language === "en" ? "Member" : "会员")} ({user.referral_code})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-black/65">{language === "en" ? "Amount total (RM)" : "订单总额（RM）"}</span>
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            type="number"
            min="0"
            step="0.01"
            value={amountTotal}
            onChange={(event) => setAmountTotal(event.target.value)}
            placeholder={language === "en" ? "Amount total" : "输入订单总额"}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-black/65">{language === "en" ? "Points redeemed" : "使用积分"}</span>
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            type="number"
            min="0"
            value={pointsRedeemed}
            onChange={(event) => setPointsRedeemed(event.target.value)}
            placeholder={language === "en" ? "Points redeemed" : "输入抵扣积分"}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-black/65">{language === "en" ? "Order type" : "订单类型"}</span>
          <select
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            value={orderType}
            onChange={(event) => setOrderType(event.target.value as "personal" | "service" | "product")}
          >
            <option value="personal">{language === "en" ? "personal" : "个人"}</option>
            <option value="service">{language === "en" ? "service" : "服务"}</option>
            <option value="product">{language === "en" ? "product" : "产品"}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-black/65">{language === "en" ? "Order source" : "订单归因"}</span>
          <div className="w-full rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-3">
            <p className="font-medium text-[#123524]">{source === "referred" ? (language === "en" ? "referred" : "推荐订单") : language === "en" ? "personal/direct" : "个人 / 直接订单"}</p>
            <p className="mt-1 text-xs text-black/55">
              {source === "referred"
                ? language === "en"
                  ? "Auto-detected from this member's referred_by relationship."
                  : "系统已根据这个会员的 referred_by 关系自动归因为推荐订单。"
                : language === "en"
                  ? "This member has no upstream referrer, so the order stays personal/direct."
                  : "这个会员没有上级推荐人，因此订单会保持为个人 / 直接订单。"}
            </p>
          </div>
        </label>
        {source === "referred" ? (
          <label className="space-y-2 text-sm">
            <span className="font-medium text-black/65">{language === "en" ? "Referrer" : "上级推荐人"}</span>
            <div className="w-full rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-3">
              <p className="font-medium text-[#123524]">
                {selectedReferrer?.name ?? (language === "en" ? "Member" : "会员")} ({selectedReferrer?.referral_code ?? "-"})
              </p>
              <p className="mt-1 text-xs text-black/55">
                {language === "en"
                  ? "Locked from buyer profile referred_by. Change the member relationship if you need to correct attribution."
                  : "这个值锁定自买家档案里的 referred_by。若要修正归因，请先去修改会员关系。"}
              </p>
            </div>
          </label>
        ) : null}
      </div>
      <div className="rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-3 text-sm text-black/65">
        {language === "en" ? "Buyer: " : "购买会员："}
        <span className="font-medium text-[#123524]">{selectedUser?.name ?? (language === "en" ? "Member" : "会员")} ({selectedUser?.referral_code ?? "-"})</span>.
        {source === "referred" ? (
          <>
            {" "}{language === "en" ? "Referrer: " : "上级推荐人："}
            <span className="font-medium text-[#123524]">{selectedReferrer?.name ?? (language === "en" ? "Not selected" : "未选择")} ({selectedReferrer?.referral_code ?? "-"})</span>.
            {" "}{language === "en"
              ? "This order will count toward the upstream member's cumulative referred sales. The threshold-crossing order still uses the previous tier."
              : "这张订单会计入上级会员的累计推荐业绩。跨越门槛的那一单仍然沿用前一个层级。"}
          </>
        ) : (
          <> {language === "en" ? "This will be stored as a direct buyer order without referral commission or upstream cumulative sales." : "这张订单会作为个人 / 直接订单保存，不会产生推荐回馈，也不会计入上级累计业绩。"} </>
        )}
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white"
      >
        {isPending ? (language === "en" ? "Submitting..." : "提交中...") : language === "en" ? "Create order" : "创建订单"}
      </button>
    </div>
  );
}
