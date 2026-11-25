"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { FaqEntry } from "@/lib/seo";

/**
 * Accordion FAQ. One item open at a time (first open by default).
 * The visual variants match each page's reference design.
 */
export type FaqVariant = "home" | "services" | "pricing" | "tools" | "who" | "rules";

type Props = { items: FaqEntry[]; variant: FaqVariant; className?: string };

export function Faq({ items, variant, className }: Props) {
  const [open, setOpen] = useState(0);

  const wrapper: Record<FaqVariant, string> = {
    home: "border-t border-sand-line",
    services: "card px-6",
    pricing: "border-t border-linen",
    tools: "rounded-[20px] border border-line bg-white px-6 py-1",
    who: "border-t border-line",
    rules: "mt-6 border-t border-line-3",
  };
  const row: Record<FaqVariant, string> = {
    home: "border-b border-sand-line",
    services: "border-b border-line-4 last:border-b-transparent",
    pricing: "border-b border-linen",
    tools: "border-b border-line last:border-b-transparent",
    who: "border-b border-line",
    rules: "border-b border-line-3",
  };
  const button: Record<FaqVariant, string> = {
    home: "py-[22px] text-[17px]",
    services: "py-5 text-base",
    pricing: "py-5 text-base",
    tools: "min-h-[60px] text-base",
    who: "py-5 text-base",
    rules: "min-h-[60px] px-1 text-base",
  };
  const answer: Record<FaqVariant, string> = {
    home: "pr-12 pb-[22px] leading-[1.7]",
    services: "pr-8 pb-5 leading-[1.65]",
    pricing: "pr-10 pb-5 leading-[1.65]",
    tools: "pb-5 leading-[1.65]",
    who: "pr-11 pb-5 leading-[1.65]",
    rules: "px-1 pb-5 leading-[1.65]",
  };

  return (
    <div className={cn(wrapper[variant], className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const id = `faq-${variant}-${i}`;
        return (
          <div key={item.q} className={row[variant]}>
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent text-left font-bold text-ink",
                  button[variant],
                )}
              >
                {item.q}
                <FaqIcon variant={variant} open={isOpen} />
              </button>
            </h3>
            <div id={id} hidden={!isOpen}>
              <p className={cn("m-0 text-[15px] text-body", answer[variant])}>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FaqIcon({ variant, open }: { variant: FaqVariant; open: boolean }) {
  const sign = open ? "−" : "+";
  switch (variant) {
    case "home":
      return (
        <span
          className={cn(
            "flex size-8 flex-none items-center justify-center rounded-full text-lg",
            open ? "bg-ink text-white" : "bg-sand-200 text-ink",
          )}
        >
          {sign}
        </span>
      );
    case "who":
      return (
        <span
          className={cn(
            "flex size-[30px] flex-none items-center justify-center rounded-[10px] text-lg",
            open ? "bg-ink text-white" : "bg-fog text-ink",
          )}
        >
          {sign}
        </span>
      );
    case "tools":
      return (
        <span className="flex size-7 flex-none items-center justify-center rounded-full bg-fog text-base">{sign}</span>
      );
    case "rules":
      return <span className="flex-none text-lg text-muted">{sign}</span>;
    case "pricing":
      return <span className="flex-none text-[22px] font-bold text-brand">{sign}</span>;
    default:
      return <span className="flex-none text-[22px] text-brand">{sign}</span>;
  }
}
