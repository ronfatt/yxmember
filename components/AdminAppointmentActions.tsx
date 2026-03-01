"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";

async function postAction(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }
}

export default function AdminAppointmentActions({
  appointmentId,
  status,
  language
}: {
  appointmentId: string;
  status: string;
  language: Language;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function run(path: string, body: Record<string, unknown>, successMessage: string) {
    startTransition(() => {
      postAction(path, body)
        .then(() => {
          toast.success(successMessage);
          router.refresh();
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : successMessage);
        });
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status === "pending" ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                "/api/admin/appointments/confirm",
                { appointment_id: appointmentId },
                language === "en" ? "Appointment confirmed." : "预约已确认。"
              )
            }
            className="rounded-full border border-[#c8a55c]/40 bg-[#fff8e6] px-3 py-1 text-xs font-semibold text-[#6a4d14]"
          >
            {language === "en" ? "Confirm" : "确认"}
          </button>
        ) : null}
        {status !== "cancelled" && status !== "completed" ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                "/api/admin/appointments/mark-paid",
                { appointment_id: appointmentId },
                language === "en" ? "Marked as paid." : "已记为付款完成。"
              )
            }
            className="rounded-full border border-jade/20 bg-jade px-3 py-1 text-xs font-semibold text-white"
          >
            {language === "en" ? "Mark paid" : "记为已付款"}
          </button>
        ) : null}
      </div>

      {status !== "cancelled" && status !== "completed" ? (
        <div className="grid gap-2">
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={language === "en" ? "Cancel note (optional)" : "取消备注（可选）"}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs outline-none"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                "/api/admin/appointments/cancel",
                { appointment_id: appointmentId, reason },
                language === "en" ? "Appointment cancelled." : "预约已取消。"
              )
            }
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/70"
          >
            {language === "en" ? "Cancel appointment" : "取消预约"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
