"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";
import { formatMoney } from "../lib/metaenergy/helpers";

type Quote = {
  priceTotal: number;
  maxPointsUsable: number;
  pointsUsed: number;
  cashDue: number;
  depositAmount: number;
};

export default function AppointmentConfirmCard({
  mentorId,
  serviceId,
  startAt,
  endAt,
  sessionMode,
  intake,
  language,
  initialQuote
}: {
  mentorId: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  sessionMode: "online" | "offline";
  intake: {
    intention: string;
    themes: string[];
    share_birthday: boolean;
    allow_recording: boolean;
    desired_outcome: string;
  };
  language: Language;
  initialQuote: Quote;
}) {
  const router = useRouter();
  const [quote, setQuote] = useState(initialQuote);
  const [pointsRequested, setPointsRequested] = useState(String(initialQuote.pointsUsed));
  const [isPending, startTransition] = useTransition();

  const pointsInput = useMemo(() => Math.max(0, Number(pointsRequested || 0)), [pointsRequested]);

  async function refreshQuote(nextPoints: number) {
    const res = await fetch("/api/appointments/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        points_requested: nextPoints
      })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error ?? "Unable to update quote.");
    }

    setQuote(data.quote);
  }

  async function submitBooking() {
    const res = await fetch("/api/appointments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentor_id: mentorId,
        service_id: serviceId,
        start_at: startAt,
        end_at: endAt,
        session_mode: sessionMode,
        points_requested: pointsInput,
        intake: {
          intention: intake.intention,
          themes: intake.themes,
          share_birthday: intake.share_birthday,
          allow_recording: intake.allow_recording,
          desired_outcome: intake.desired_outcome
        }
      })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error ?? "Unable to create appointment.");
    }

    toast.success(language === "en" ? "Appointment request submitted." : "预约申请已提交。");
    router.push(data.redirectTo ?? "/dashboard/appointments");
    router.refresh();
  }

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_36px_rgba(0,0,0,0.04)]">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1 text-sm text-black/65">
          <p>{language === "en" ? "Price total" : "会谈总价"}</p>
          <p className="font-display text-3xl text-[#123524]">{formatMoney(quote.priceTotal)}</p>
        </div>
        <div className="space-y-1 text-sm text-black/65">
          <p>{language === "en" ? "Cash due" : "需支付现金"}</p>
          <p className="font-display text-3xl text-[#123524]">{formatMoney(quote.cashDue)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <label className="grid gap-2 text-sm text-black/70">
          <span>{language === "en" ? "Points to use" : "本次使用积分"}</span>
          <input
            type="number"
            min={0}
            max={quote.maxPointsUsable}
            value={pointsRequested}
            onChange={(event) => setPointsRequested(event.target.value)}
            onBlur={() => {
              startTransition(() => {
                refreshQuote(pointsInput).catch((error) => {
                  toast.error(error instanceof Error ? error.message : language === "en" ? "Unable to update quote." : "无法更新金额。");
                });
              });
            }}
            className="rounded-2xl border border-black/10 bg-[#fbf8f1] px-4 py-3 outline-none"
          />
        </label>
        <p className="text-xs text-black/50">
          {language === "en"
            ? `Up to ${quote.maxPointsUsable} points can be used for this session.`
            : `本次最多可使用 ${quote.maxPointsUsable} 积分。`}
        </p>
        <p className="text-xs text-black/50">
          {language === "en"
            ? `Deposit policy reference: ${formatMoney(quote.depositAmount)}. MVP currently settles the full session when admin marks it paid.`
            : `订金参考：${formatMoney(quote.depositAmount)}。当前 MVP 由后台确认后按全额入账。`}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          startTransition(() => {
            submitBooking().catch((error) => {
              toast.error(error instanceof Error ? error.message : language === "en" ? "Unable to create appointment." : "无法创建预约。");
            });
          })
        }
        disabled={isPending}
        className="mt-6 w-full rounded-full bg-[linear-gradient(135deg,#c8a55c,#e6c88f)] px-5 py-3 font-semibold text-[#123524] shadow-[0_18px_34px_rgba(200,165,92,0.24)]"
      >
        {isPending ? (language === "en" ? "Submitting..." : "提交中...") : language === "en" ? "Submit appointment request" : "提交预约申请"}
      </button>
    </div>
  );
}
