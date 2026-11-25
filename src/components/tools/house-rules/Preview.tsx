"use client";

import { copy } from "@/content/tools/houseRules";
import { cn } from "@/lib/cn";
import type { ChecklistItem, Line, Rules } from "@/lib/tools/house-rules";
import { CopyButton } from "../CopyButton";

export type PreviewTab = "full" | "listing" | "platform" | "sign";
const TABS: PreviewTab[] = ["full", "listing", "platform", "sign"];

const icons: Record<string, string> = {
  clock: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 7v5l3 2",
  people: "M8 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6zM3 20c0-3 2.2-5 5-5s5 2 5 5M11 20c0-3 2.2-5 5-5s5 2 5 5",
  moon: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z",
  paw: "M12 13c-3 0-5 3-5 5s2 2 5 2s5 0 5-2s-2-5-5-5zM6 9a1.5 2 0 1 0 0.01 0M10 6a1.5 2 0 1 0 0.01 0M14 6a1.5 2 0 1 0 0.01 0M18 9a1.5 2 0 1 0 0.01 0",
  bin: "M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13",
  no: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM6 18L18 6",
};

export function SignIcon({ kind }: { kind?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-full" fill="none" stroke="#14212B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[kind ?? "no"] ?? icons.no} />
    </svg>
  );
}

/** Live preview of the four outputs. */
export function Preview({
  tab,
  onTab,
  rules,
  listing,
  limit,
  checklist,
  ticked,
  onTick,
  sign,
  fullText,
  checklistText,
  onCopied,
  onPdf,
  onTxt,
  onSignPdf,
  onToGuide,
  guideMessage,
}: {
  tab: PreviewTab;
  onTab: (t: PreviewTab) => void;
  rules: Rules;
  listing: string;
  limit: number;
  checklist: ChecklistItem[];
  ticked: Set<string>;
  onTick: (id: string) => void;
  sign: Line[];
  fullText: string;
  checklistText: string;
  onCopied: (type: string) => void;
  onPdf: () => void;
  onTxt: () => void;
  onSignPdf: () => void;
  onToGuide: () => void;
  guideMessage: string;
}) {
  const A = copy.actions;
  const over = listing.length - limit;
  return (
    <section aria-label="Preview of your house rules" className="rounded-[20px] border border-line bg-white" data-result-panel>
      <div role="tablist" aria-label="Preview" className="grid grid-cols-2 gap-1 border-b border-line p-1.5 sm:grid-cols-4">
        {TABS.map((t, i) => (
          <button
            key={t}
            id={`hr-tab-${t}`}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls={`hr-tabpanel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => onTab(t)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const n = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
              onTab(n);
              document.getElementById(`hr-tab-${n}`)?.focus();
            }}
            className={cn("min-h-11 cursor-pointer rounded-[12px] border-none px-2 text-[13px] font-extrabold", tab === t ? "bg-ink text-white" : "bg-transparent text-ink-copy hover:bg-fog")}
          >
            {copy.tabs[t]}
          </button>
        ))}
      </div>

      <div id={`hr-tabpanel-${tab}`} role="tabpanel" aria-labelledby={`hr-tab-${tab}`} className="p-5 md:p-6">
        {tab === "full" && (
          <>
            <div aria-live="polite" className="grid gap-4" data-full-rules>
              <h2 className="m-0 text-xl font-extrabold">{rules.title}</h2>
              {rules.sections.map((s) => (
                <div key={s.key}>
                  <h3 className="m-0 mb-1.5 text-[13px] font-extrabold tracking-[0.8px] text-brand uppercase">{s.heading}</h3>
                  <ul className="m-0 grid list-none gap-1 p-0 text-[15px] leading-[1.55] text-ink">
                    {s.lines.map((l) => (
                      <li key={l.key} className="flex gap-2">
                        <span aria-hidden="true" className="mt-[9px] size-1.5 flex-none rounded-full bg-coral" />
                        <span>
                          {l.text}
                          {l.locked && (
                            <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-cloud px-2 py-0.5 align-middle text-[11px] font-bold text-ink-copy">
                              <span aria-hidden="true">🔒</span> Always included
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              <CopyButton label={A.copy} copiedLabel={A.copied} className="min-h-11" getText={() => (onCopied("full"), fullText)} />
              <button type="button" onClick={onPdf} className="btn btn-outline min-h-11">
                {A.pdf}
              </button>
              <button type="button" onClick={onTxt} className="btn btn-outline min-h-11">
                {A.txt}
              </button>
            </div>
            <div className="mt-3">
              <button type="button" onClick={onToGuide} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
                {A.toGuide} →
              </button>
              <p aria-live="polite" className="m-0 text-sm font-bold text-green">
                {guideMessage}
              </p>
            </div>
          </>
        )}

        {tab === "listing" && (
          <>
            <p className="m-0 mb-3 text-sm text-ink-copy">{copy.listing.intro}</p>
            <pre className="m-0 rounded-[14px] bg-sand p-4 font-sans text-[14px] leading-[1.6] whitespace-pre-wrap text-ink" data-listing>
              {listing}
            </pre>
            <p aria-live="polite" className={cn("m-0 mt-2 text-sm font-extrabold tabular-nums", over > 0 ? "text-[#6B4A00]" : "text-ink-copy")} data-counter>
              {listing.length} / {limit} characters
              {over > 0 && <span className="mt-1 block rounded-[10px] bg-amber-25 px-3 py-2 font-bold">{copy.listing.over.replace("{n}", String(over))}</span>}
            </p>
            <div className="mt-4">
              <CopyButton label={A.copy} copiedLabel={A.copied} className="min-h-11" getText={() => (onCopied("listing"), listing)} />
            </div>
          </>
        )}

        {tab === "platform" && (
          <>
            <p className="m-0 mb-4 text-sm text-ink-copy">{copy.platform.intro}</p>
            {(["airbnb", "booking"] as const).map((p) => (
              <fieldset key={p} className="m-0 mb-4 min-w-0 border-none p-0">
                <legend className="mb-2 p-0 text-base font-extrabold">{p === "airbnb" ? "Airbnb" : "Booking.com"}</legend>
                <ul className="m-0 grid list-none gap-1 p-0">
                  {checklist
                    .filter((c) => c.platform === p)
                    .map((c) => (
                      <li key={c.id}>
                        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] px-2 text-[15px] hover:bg-cloud">
                          <input type="checkbox" checked={ticked.has(c.id)} onChange={() => onTick(c.id)} className="size-5 flex-none accent-ink" />
                          <span className={cn(ticked.has(c.id) && "text-muted line-through")}>{c.text}</span>
                        </label>
                      </li>
                    ))}
                </ul>
              </fieldset>
            ))}
            <CopyButton label={A.copyChecklist} copiedLabel={A.copied} className="min-h-11" getText={() => (onCopied("platform"), checklistText)} />
          </>
        )}

        {tab === "sign" && (
          <>
            <div className="mx-auto aspect-[210/297] w-full max-w-[380px] overflow-hidden rounded-[6px] border border-line bg-white shadow-[0_8px_24px_rgba(20,33,43,0.1)]" data-sign>
              <div className="h-[1.5%] bg-coral" />
              <div className="flex h-[98.5%] flex-col px-[7%] pt-[6%] pb-[5%]">
                <p className="m-0 mb-[4%] text-[clamp(16px,5.4vw,24px)] leading-tight font-extrabold text-ink md:text-[22px]">{rules.title.replace(/^House rules – /, "") || "House rules"}</p>
                <ul className="m-0 grid flex-1 list-none content-start gap-[3.2%] p-0">
                  {sign.map((l) => (
                    <li key={l.key} className="flex items-start gap-3 text-[clamp(10px,2.9vw,13px)] leading-snug text-ink md:text-[12.5px]">
                      <span className="mt-0.5 size-[clamp(18px,5vw,24px)] flex-none">
                        <SignIcon kind={l.icon} />
                      </span>
                      {l.text}
                    </li>
                  ))}
                </ul>
                <p className="m-0 border-t border-ink pt-[3%] text-[clamp(12px,3.6vw,16px)] font-extrabold text-ink">Need help? Message us.</p>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <button type="button" onClick={onSignPdf} className="btn btn-ink min-h-11">
                {A.pdf}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
