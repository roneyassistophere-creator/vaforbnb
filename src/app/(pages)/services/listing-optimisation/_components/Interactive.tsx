"use client";

import { useEffect, useState, type FormEvent } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { handoffKey, readHandoffData } from "@/lib/tools/handoff";
import { needs, readinessChecks } from "../content";

function Sparkle({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="#5B3FA0" />
    </svg>
  );
}

/** How AI search sees a listing: pick a guest need, toggle vague vs AI-ready. */
export function AiSimulator() {
  const [need, setNeed] = useState(2);
  const [mode, setMode] = useState<"vague" | "ready">("ready");
  const nd = needs[need];
  const ready = mode === "ready";
  const rows = ready ? nd.ready : nd.vague;

  return (
    <div className="mt-16 box-border rounded-[28px] bg-ink p-6 text-white md:p-10">
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2">
        <div>
          <p className="m-0 mb-3.5 text-[13px] font-bold tracking-[1.4px] text-[#C9B8F0] uppercase">Try it: how AI search sees a listing</p>
          <h3 className="m-0 mb-[18px] text-[30px] leading-[1.2] font-extrabold tracking-[-0.8px]">Pick what a guest asks for</h3>
          <div className="mb-[22px] flex flex-wrap gap-2" role="group" aria-label="Guest needs">
            {needs.map((n, i) => (
              <button
                key={n.t}
                type="button"
                aria-pressed={need === i}
                onClick={() => setNeed(i)}
                className={cn(
                  "min-h-10 cursor-pointer rounded-full border px-3.5 text-[13px] font-bold",
                  need === i ? "border-white bg-white text-ink" : "border-night-field-line bg-transparent text-white",
                )}
              >
                {n.t}
              </button>
            ))}
          </div>
          <div className="mb-[22px] flex min-h-14 items-center gap-3 rounded-full bg-white px-5 text-ink">
            <Sparkle />
            <span className="text-[15px]">“{nd.q}”</span>
          </div>
          <p className="m-0 mb-2.5 text-[13px] font-bold text-mist">Your listing is written…</p>
          <div className="inline-flex gap-1 rounded-full bg-night-field p-1" role="group" aria-label="Listing version">
            {(
              [
                ["vague", "Vaguely"],
                ["ready", "AI-ready"],
              ] as const
            ).map(([k, t]) => (
              <button
                key={k}
                type="button"
                aria-pressed={mode === k}
                onClick={() => setMode(k)}
                className={cn(
                  "min-h-[42px] cursor-pointer rounded-full border-none px-[18px] text-sm font-bold",
                  mode === k ? "bg-coral text-ink" : "bg-transparent text-white",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="m-0 mt-[22px] text-[13px] leading-[1.6] text-faint">
            Illustration of the logic, not Airbnb’s actual system. Airbnb hasn’t published how AI search matches listings.
          </p>
        </div>
        <div className="rounded-[20px] bg-white p-6 text-ink" aria-live="polite">
          <div className="mb-4 flex items-center gap-3.5">
            <div className="size-16 flex-none rounded-xl bg-[#DCE4E8]" />
            <div>
              <p className="m-0 mb-1 text-base font-extrabold">{nd.title}</p>
              <p className="m-0 text-[13px] text-muted">Entire flat · 2 guests</p>
            </div>
          </div>
          <div className={cn("mb-4 rounded-xl px-3.5 py-3", ready ? "bg-violet-50" : "bg-[#F5F6F7]")}>
            <p className="m-0 mb-1 text-[11px] font-extrabold tracking-[1px] text-violet">AI SUMMARY</p>
            <p className={cn("m-0 text-sm leading-normal", ready ? "text-[#2E2650]" : "text-muted")}>
              {ready
                ? nd.ready
                    .map((r) => r[1])
                    .slice(0, 2)
                    .join(" · ")
                : "Cosy flat in a great location, close to everything."}
            </p>
          </div>
          <p className="m-0 mb-2 text-[13px] font-extrabold">Evidence for “{nd.short}”</p>
          {rows.map(([k, v]) => (
            <div key={k + v} className="flex items-start gap-3 border-t border-line-4 py-2.5">
              <span
                className={cn(
                  "flex size-[22px] flex-none items-center justify-center rounded-full text-xs font-extrabold text-white",
                  ready ? "bg-green-dot" : "bg-faint",
                )}
                aria-hidden="true"
              >
                {ready ? "✓" : "?"}
              </span>
              <span className="text-sm leading-normal">
                <strong>{k}:</strong> <span className={ready ? "text-ink" : "text-muted"}>{v}</span>
              </span>
            </div>
          ))}
          <div className={cn("mt-3.5 rounded-xl px-3.5 py-3 text-sm font-bold", ready ? "bg-green-100 text-green" : "bg-coral-50 text-brand-deep")}>
            {ready
              ? `Clear evidence in three places: easy to match and summarise for “${nd.short}”.`
              : `Nothing specific to match. A guest asking for “${nd.short}” may never see this listing.`}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Self-check: 10 items, scored out of 10. */
export function ReadinessCheck() {
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const done = readinessChecks.filter((_, i) => checks[i]).length;
  const label = done >= 9 ? "AI-ready" : done >= 5 ? "Getting there" : "Needs work";
  const lc = done >= 9 ? "text-green" : done >= 5 ? "text-amber" : "text-brand";
  return (
    <div className="rounded-[22px] bg-white p-7 shadow-[0_18px_48px_rgba(20,33,43,0.08)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="m-0 text-[13px] font-bold tracking-[1.4px] text-brand uppercase">AI-readiness check</p>
        <span className={cn("text-[13px] font-extrabold", lc)} aria-live="polite">
          {label}
        </span>
      </div>
      <p className="m-0 mb-1.5 text-[40px] font-extrabold tracking-[-1.5px]">
        {done}
        <span className="text-lg tracking-normal text-muted"> / 10</span>
      </p>
      <div className="mb-[18px] h-2 overflow-hidden rounded bg-line-4">
        <div className="h-2 rounded bg-violet transition-[width]" style={{ width: `${done * 10}%` }} />
      </div>
      <div className="grid gap-1.5">
        {readinessChecks.map((t, i) => {
          const on = !!checks[i];
          return (
            <button
              key={t}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => setChecks((c) => ({ ...c, [i]: !on }))}
              className={cn(
                "flex min-h-[44px] cursor-pointer items-start gap-3 rounded-[10px] border px-3 py-2.5 text-left text-sm leading-[1.45] text-ink",
                on ? "border-[#D9CFF0] bg-[#F7F5FC]" : "border-line bg-white",
              )}
            >
              <span
                className={cn(
                  "flex size-5 flex-none items-center justify-center rounded-[5px] border-[1.5px] text-xs font-extrabold text-white",
                  on ? "border-violet bg-violet" : "border-line-box bg-white",
                )}
              >
                {on ? "✓" : ""}
              </span>
              {t}
            </button>
          );
        })}
      </div>
      <a href="#audit" className="btn btn-coral mt-[18px] w-full rounded-full">
        Get a free AI-readiness audit
      </a>
      {isLive(scorer) && (
        <a href={toolLink(scorer!)} className="btn btn-outline mt-2 w-full rounded-full" data-scorer-link>
          Get your full readiness score (free tool) →
        </a>
      )}
    </div>
  );
}

const scorer = toolById("ai-readiness-listing-scorer");

type AuditPrefill = { score: number; band: string; town: string };
const checkPrefill = (d: unknown): AuditPrefill | null => {
  if (!d || typeof d !== "object") return null;
  const o = d as Partial<AuditPrefill>;
  if (typeof o.score !== "number" || o.score < 0 || o.score > 100 || typeof o.band !== "string") return null;
  return { score: Math.round(o.score), band: o.band.slice(0, 30), town: typeof o.town === "string" ? o.town.slice(0, 80) : "" };
};

/** Free listing audit request (opens the visitor's email app). */
export function AuditForm() {
  const [sent, setSent] = useState(false);
  // Score, band and town the host chose to share from the AI-readiness scorer (never listing text).
  const [prefill, setPrefill] = useState<AuditPrefill | null>(null);
  useEffect(() => {
    // Read once after hydration: saved on this device by the scorer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefill(readHandoffData("audit-prefill", checkPrefill)?.data ?? null);
  }, []);
  const dropPrefill = () => {
    try {
      window.localStorage.removeItem(handoffKey("audit-prefill"));
    } catch {
      // ignore
    }
    setPrefill(null);
  };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const body = [
      `Listing link: ${d.get("listing") ?? ""}`,
      `First name: ${d.get("name") ?? ""}`,
      `Number of listings: ${d.get("count") ?? ""}`,
      `Email: ${d.get("email") ?? ""}`,
      ...(prefill ? [`AI-readiness score: ${prefill.score} / 100 (${prefill.band})${prefill.town ? `, ${prefill.town}` : ""}`] : []),
    ].join("\n");
    window.location.href = `mailto:${brand.contact.email}?subject=${encodeURIComponent("Free listing audit")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  const field = "field rounded-[10px]";
  return (
    <form onSubmit={onSubmit} aria-label="Free listing audit" className="flex flex-col gap-4 rounded-[20px] bg-white p-6 text-ink md:p-8">
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Your listing link
        <input name="listing" type="url" required placeholder="https://airbnb.co.uk/rooms/…" className={field} />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          First name
          <input name="name" type="text" className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Number of listings
          <input name="count" type="number" min={1} className={field} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Email
        <input name="email" type="email" required className={field} />
      </label>
      {prefill && (
        <div className="flex flex-wrap items-center gap-2 rounded-[12px] bg-violet-50 px-3.5 py-3 text-sm text-ink" data-audit-prefill>
          <span className="flex-1">
            Included: your AI-readiness score <strong>{prefill.score} / 100</strong> ({prefill.band}){prefill.town ? `, ${prefill.town}` : ""}.
          </span>
          <button type="button" onClick={dropPrefill} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline">
            Don’t include
          </button>
        </div>
      )}
      <button type="submit" className="btn btn-coral mt-1 w-full rounded-full">
        Audit my listing
      </button>
      <p className="m-0 text-center text-[13px] text-muted" role="status">
        {sent ? `Your email app should open. If not, email us at ${brand.contact.email}.` : "Free. No obligation. Report within 48 hours (Mon–Sat)."}
      </p>
    </form>
  );
}
