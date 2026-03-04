"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";
import { calcCashPaid, calcMaxRedeemablePoints, pointsToRinggit } from "../lib/metaenergy/calculations";

type Product = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price_myr: number | null;
  stock_on_hand: number | null;
  track_inventory: boolean | null;
  allow_backorder: boolean | null;
};

export default function ProductOrderCard({
  product,
  language,
  pointsBalance
}: {
  product: Product;
  language: Language;
  pointsBalance: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [pointsRequested, setPointsRequested] = useState(0);
  const [loading, setLoading] = useState(false);

  const isUnavailable = Boolean(product.track_inventory && !product.allow_backorder && Number(product.stock_on_hand ?? 0) <= 0);
  const amountTotal = Number(product.price_myr ?? 0) * quantity;
  const maxRedeemable = calcMaxRedeemablePoints(amountTotal, pointsBalance);
  const appliedPoints = Math.min(pointsRequested, maxRedeemable);
  const cashRequired = calcCashPaid(amountTotal, appliedPoints);

  const createOrder = async () => {
    if (loading || isUnavailable) return;
    try {
      setLoading(true);
      const response = await fetch("/api/products/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          points_requested: appliedPoints
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to create product order.");
      }

      toast.success(language === "en" ? "Order created. Upload your transfer slip below." : "订单已建立，请在下方上传汇款单据。");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : language === "en" ? "Order failed." : "下单失败。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-black/10 bg-white/80 p-5">
      <div className="space-y-2">
        <h3 className="font-display text-2xl text-[#123524]">{product.title}</h3>
        {product.subtitle ? <p className="text-sm text-black/65">{product.subtitle}</p> : null}
        {product.description ? <p className="text-sm text-black/60">{product.description}</p> : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {product.price_myr != null ? (
          <span className="rounded-full bg-[#f4ead2] px-3 py-1 text-[#6a4d14]">{product.price_myr} MYR</span>
        ) : null}
        {product.track_inventory ? (
          Number(product.stock_on_hand ?? 0) > 0 ? (
            <>
              <span className="rounded-full bg-[#edf5ef] px-3 py-1 text-jade">
                {language === "en" ? `${product.stock_on_hand} in stock` : `现货 ${product.stock_on_hand}`}
              </span>
              {Number(product.stock_on_hand ?? 0) <= 5 ? (
                <span className="rounded-full bg-[#fff4e8] px-3 py-1 text-[#8c3a1f]">
                  {language === "en" ? "Low stock" : "低库存"}
                </span>
              ) : null}
            </>
          ) : product.allow_backorder ? (
            <span className="rounded-full bg-[#f7f2e7] px-3 py-1 text-[#8b6b2b]">{language === "en" ? "Available for preorder" : "可预订"}</span>
          ) : (
            <span className="rounded-full bg-[#f8ece8] px-3 py-1 text-[#8c3a1f]">{language === "en" ? "Out of stock" : "暂时缺货"}</span>
          )
        ) : (
          <span className="rounded-full bg-[#edf5ef] px-3 py-1 text-jade">{language === "en" ? "Available" : "持续开放"}</span>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-black/65">
          <span>{language === "en" ? "Quantity" : "数量"}</span>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="w-24 rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-black/65">
          <span>{language === "en" ? "Points" : "积分"}</span>
          <input
            type="number"
            min="0"
            max={maxRedeemable}
            value={appliedPoints}
            onChange={(event) => setPointsRequested(Math.max(0, Number(event.target.value) || 0))}
            className="w-28 rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </label>
        <button
          type="button"
          disabled={loading || isUnavailable}
          onClick={createOrder}
          className="rounded-full bg-[linear-gradient(135deg,#c8a55c,#e6c88f)] px-4 py-2 text-sm font-semibold text-[#123524] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? language === "en" ? "Creating..." : "建立中..."
            : product.allow_backorder && Number(product.stock_on_hand ?? 0) <= 0
              ? language === "en" ? "Preorder now" : "立即预订"
              : language === "en" ? "Create purchase order" : "建立购买订单"}
        </button>
      </div>
      <div className="mt-4 rounded-2xl bg-[#f8f4ea] px-4 py-3 text-sm text-black/65">
        <p>
          {language === "en" ? "Estimated total: " : "订单总额："}
          <span className="font-medium text-[#123524]">{amountTotal.toFixed(2)} MYR</span>
        </p>
        <p className="mt-1">
          {language === "en" ? "Points offset: " : "积分抵扣："}
          <span className="font-medium text-[#123524]">{appliedPoints} {language === "en" ? "pts" : "积分"}</span>
          {" · "}
          {pointsToRinggit(appliedPoints).toFixed(2)} MYR
        </p>
        <p className="mt-1">
          {language === "en" ? "Cash required: " : "需现金支付："}
          <span className="font-medium text-[#123524]">{cashRequired.toFixed(2)} MYR</span>
        </p>
        <p className="mt-1 text-xs text-black/50">
          {language === "en"
            ? `You can use up to ${maxRedeemable} pts on this order.`
            : `这笔订单最多可使用 ${maxRedeemable} 积分。`}
        </p>
      </div>
    </div>
  );
}
