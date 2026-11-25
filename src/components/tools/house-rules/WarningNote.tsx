"use client";

import Link from "next/link";
import { useState } from "react";
import { copy } from "@/content/tools/houseRules";
import { cn } from "@/lib/cn";
import type { Warning } from "@/lib/tools/house-rules";

/** A gentle inline note (amber) or a "left out until reworded" message (red), always with words and a "Why?" link. */
export function WarningNote({ w }: { w: Warning }) {
  const [open, setOpen] = useState(false);
  const red = w.level === "red";
  return (
    <div className={cn("rounded-[12px] px-3.5 py-2.5 text-sm leading-[1.5]", red ? "bg-coral-50 text-brand" : "bg-amber-25 text-[#6B4A00]")} role={red ? "alert" : "note"} data-warning={w.type}>
      <p className="m-0 font-bold">
        <span className="mr-1 font-extrabold">{red ? "Left out:" : "Check:"}</span>
        {w.message}{" "}
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="min-h-8 cursor-pointer border-none bg-transparent p-0 font-extrabold text-ink underline underline-offset-2">
          {copy.why}
        </button>
      </p>
      {open && (
        <p className="m-0 mt-1.5 font-normal text-ink">
          {w.why}{" "}
          <Link href={`/uk-short-let-rules#${w.anchor}`} className="font-bold text-brand">
            Read more in the UK Rules Hub →
          </Link>
        </p>
      )}
    </div>
  );
}
