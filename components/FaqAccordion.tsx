"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const open = openIndex === index;

        return (
          <div key={item.question} className="overflow-hidden rounded-2xl border border-black/10 bg-[#f8f6f2]">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-medium text-[#123524]">{item.question}</span>
              <span className="text-lg text-black/45">{open ? "−" : "+"}</span>
            </button>
            {open ? (
              <div className="border-t border-black/10 px-5 py-4 text-sm leading-7 text-black/68">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
