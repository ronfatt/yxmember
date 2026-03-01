"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const open = openIndex === index;

        return (
          <div key={item.question} className="overflow-hidden rounded-[28px] border border-[rgba(15,47,37,0.08)] bg-[#f8f4ec]">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display text-xl text-[#0f2f25]">{item.question}</span>
              <span className="text-lg text-black/40">{open ? "−" : "+"}</span>
            </button>
            {open ? (
              <div className="border-t border-[rgba(15,47,37,0.08)] px-6 py-5 text-sm leading-8 text-black/68">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
