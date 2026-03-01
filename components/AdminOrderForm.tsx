"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type UserOption = {
  id: string;
  name: string | null;
  referral_code: string;
  referred_by: string | null;
};

export default function AdminOrderForm({ users }: { users: UserOption[] }) {
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
      toast.error(data.error ?? "Unable to create order.");
      return;
    }

    toast.success("Order created.");
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-black/65">Buyer</span>
          <select
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ?? "Member"} ({user.referral_code})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-black/65">Amount total (RM)</span>
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            type="number"
            min="0"
            step="0.01"
            value={amountTotal}
            onChange={(event) => setAmountTotal(event.target.value)}
            placeholder="Amount total"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-black/65">Points redeemed</span>
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            type="number"
            min="0"
            value={pointsRedeemed}
            onChange={(event) => setPointsRedeemed(event.target.value)}
            placeholder="Points redeemed"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-black/65">Order type</span>
          <select
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            value={orderType}
            onChange={(event) => setOrderType(event.target.value as "personal" | "service" | "product")}
          >
            <option value="personal">personal</option>
            <option value="service">service</option>
            <option value="product">product</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-black/65">Order source</span>
          <div className="w-full rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-3">
            <p className="font-medium text-[#123524]">{source === "referred" ? "referred" : "personal/direct"}</p>
            <p className="mt-1 text-xs text-black/55">
              {source === "referred"
                ? "Auto-detected from this member's referred_by relationship."
                : "This member has no upstream referrer, so the order stays personal/direct."}
            </p>
          </div>
        </label>
        {source === "referred" ? (
          <label className="space-y-2 text-sm">
            <span className="font-medium text-black/65">Referrer</span>
            <div className="w-full rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-3">
              <p className="font-medium text-[#123524]">
                {selectedReferrer?.name ?? "Member"} ({selectedReferrer?.referral_code ?? "-"})
              </p>
              <p className="mt-1 text-xs text-black/55">
                Locked from buyer profile `referred_by`. Change the member relationship if you need to correct attribution.
              </p>
            </div>
          </label>
        ) : null}
      </div>
      <div className="rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-3 text-sm text-black/65">
        Buyer: <span className="font-medium text-[#123524]">{selectedUser?.name ?? "Member"} ({selectedUser?.referral_code ?? "-"})</span>.
        {source === "referred" ? (
          <>
            {" "}Referrer: <span className="font-medium text-[#123524]">{selectedReferrer?.name ?? "Not selected"} ({selectedReferrer?.referral_code ?? "-"})</span>.
            {" "}This order will count toward the upstream member's cumulative referred sales. The threshold-crossing order still uses the previous tier.
          </>
        ) : (
          <> This will be stored as a direct buyer order without referral commission or upstream cumulative sales.</>
        )}
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white"
      >
        {isPending ? "Submitting..." : "Create order"}
      </button>
    </div>
  );
}
