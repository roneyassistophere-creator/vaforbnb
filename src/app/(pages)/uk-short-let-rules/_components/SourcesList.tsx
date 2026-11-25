"use client";

import { useState } from "react";
import { sources } from "../content";

export function SourcesList() {
  const [all, setAll] = useState(false);
  const shown = all ? sources : sources.slice(0, 6);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="eyebrow m-0">Sources ({sources.length})</p>
        <button
          type="button"
          aria-expanded={all}
          aria-controls="sources-list"
          onClick={() => setAll((v) => !v)}
          className="min-h-10 cursor-pointer rounded-lg border border-line-6 bg-white px-3.5 text-[13px] font-bold text-ink"
        >
          {all ? "Show fewer" : "Show all"}
        </button>
      </div>
      <ul id="sources-list" className="m-0 list-none p-0">
        {shown.map((s) => (
          <li key={s} className="border-b border-sand-rule py-[9px] text-[13px] leading-normal text-ink-copy">
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
