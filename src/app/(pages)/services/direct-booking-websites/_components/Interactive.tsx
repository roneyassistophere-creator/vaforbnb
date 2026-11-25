"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  buildSteps,
  builderVsCustom,
  channelManagers,
  faq,
  sources,
  themes,
  type SourceKey,
  type ThemeKey,
} from "../content";

const code = "font-jetbrains text-xs font-bold tracking-[0.4px]";

/** Browser window chrome. */
export function Win({ url, right, children, className }: { url?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-[#DDE3E8] bg-white shadow-[0_30px_70px_rgba(20,33,43,0.14)]", className)}>
      <div className="flex items-center gap-2 border-b border-[#E2E6EA] bg-fog px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-coral" />
        <span className="size-2.5 rounded-full bg-[#CBD3D9]" />
        <span className="size-2.5 rounded-full bg-[#CBD3D9]" />
        {url && <span className={cn(code, "ml-2.5 max-w-[340px] flex-1 truncate rounded-md bg-white px-3 py-[5px] text-body")}>{url}</span>}
        {right}
      </div>
      {children}
    </div>
  );
}

function Chip({ on, onClick, children, className, style }: { on: boolean; onClick: () => void; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      style={style}
      className={cn("min-h-[44px] cursor-pointer rounded-[10px] border-[1.5px] px-4 text-sm font-bold", className)}
    >
      {children}
    </button>
  );
}

/** Hero: preview a site for your business type and style. */
export function PreviewBuilder() {
  const [type, setType] = useState<"db" | "pm">("db");
  const [theme, setTheme] = useState<ThemeKey>("coastal");
  const th = themes[theme];
  const isDb = type === "db";
  const brandName = th.names[0];

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="grid flex-[1_1_260px] gap-5 rounded-2xl border border-[#DDE3E8] bg-white p-[22px]">
        <div>
          <p className={cn(code, "m-0 mb-1 text-brand")}>TRY IT</p>
          <p className="m-0 text-base font-extrabold">Preview a site for your business</p>
        </div>
        <div>
          <p className="m-0 mb-2 text-[13px] font-bold text-body">1. Your business</p>
          <div className="grid gap-1.5" role="group" aria-label="Business type">
            {(
              [
                ["db", "I want direct bookings"],
                ["pm", "I manage properties for landlords"],
              ] as const
            ).map(([k, t]) => (
              <Chip key={k} on={type === k} onClick={() => setType(k)} className={cn("border-ink text-left", type === k ? "bg-ink text-white" : "bg-white text-ink")}>
                {t}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="m-0 mb-2 text-[13px] font-bold text-body">2. Your style</p>
          <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Style">
            {(Object.keys(themes) as ThemeKey[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={theme === k}
                onClick={() => setTheme(k)}
                className={cn("min-h-16 cursor-pointer rounded-[10px] text-xs font-extrabold", theme === k ? "border-[3px] border-coral" : "border-[1.5px] border-line-strong")}
                style={{ background: themes[k].bg, color: themes[k].fg }}
              >
                {themes[k].label}
              </button>
            ))}
          </div>
        </div>
        <p className="m-0 text-xs leading-normal text-muted">A playful preview, not a template. Every site we build is designed for your brand.</p>
      </div>

      <Win url={`${brandName.toLowerCase().replace(/[^a-z]/g, "")}.co.uk`} className="min-w-0 flex-[999_1_640px]">
        <div className="px-6 pt-5 pb-7" style={{ background: th.bg, color: th.fg }} aria-live="polite">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <span className="text-lg font-extrabold tracking-[-0.4px]">{brandName}</span>
            <span className="flex flex-wrap items-center gap-4 text-[13px] font-semibold">
              {(isDb ? ["Stays", "Local guide", "About"] : ["Portfolio", "For landlords", "About"]).map((n) => (
                <span key={n}>{n}</span>
              ))}
              <span className="rounded-full px-3 py-[5px] font-extrabold" style={{ background: th.acc, color: th.accFg }}>
                {isDb ? "Book now" : "List your property"}
              </span>
            </span>
          </div>
          <p className="m-0 mb-2 max-w-[520px] text-[28px] leading-[1.1] font-extrabold tracking-[-1px] md:text-[34px]">
            {isDb ? "Book direct. Best stays, no booking fees." : "We manage short lets that guests love and owners trust."}
          </p>
          <p className="m-0 mb-[18px] max-w-[460px] text-sm opacity-85">
            {isDb ? "Live availability, secure payment, a host who replies." : "Fully managed short lets for landlords. [Your city]."}
          </p>
          <div className="mb-5 flex max-w-[520px] flex-wrap gap-1.5 rounded-xl bg-white p-2">
            {["Check-in · 14 Nov", "Check-out · 17 Nov", "2 guests"].map((x) => (
              <span key={x} className="flex-[1_1_100px] px-2.5 py-2 text-xs text-body">
                {x}
              </span>
            ))}
            <span className="rounded-lg px-3.5 py-2 text-xs font-extrabold" style={{ background: th.acc, color: th.accFg }}>
              {isDb ? "Check availability" : "Book a stay"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-white text-ink">
                <div className="h-20" style={{ background: th.imgs[i - 1] }} />
                <div className="p-2.5">
                  <p className="m-0 mb-0.5 truncate text-[13px] font-extrabold">{th.names[i]}</p>
                  <p className="m-0 truncate text-xs text-body">{isDb ? "from £[X] / night" : "Managed since [year]"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Win>
    </div>
  );
}

/** Click dates to book them from a channel; every calendar mirrors it. */
export function SyncDemo() {
  const [source, setSource] = useState<SourceKey>("airbnb");
  const [booked, setBooked] = useState<Record<number, SourceKey>>({ 3: "airbnb", 4: "airbnb", 9: "booking" });
  const days = Array.from({ length: 14 }, (_, i) => i + 1);
  const n = Object.keys(booked).length;
  const toggle = (d: number) =>
    setBooked((b) => {
      const nb = { ...b };
      if (nb[d]) delete nb[d];
      else nb[d] = source;
      return nb;
    });

  return (
    <div className="mx-auto max-w-[980px] rounded-[20px] border border-[#DDE3E8] bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Booking comes from">
          <span className="mr-1 self-center text-sm font-bold">Booking from:</span>
          {(Object.keys(sources) as SourceKey[]).map((k) => {
            const s = sources[k];
            const on = source === k;
            return (
              <Chip key={k} on={on} onClick={() => setSource(k)} style={{ borderColor: s.c, background: on ? s.c : "#FFFFFF", color: on ? s.fg : "#14212B" }}>
                {s.t}
              </Chip>
            );
          })}
        </div>
        <Chip on={false} onClick={() => setBooked({})} className="border-line-strong bg-white text-ink">
          Clear
        </Chip>
      </div>
      <div className="mb-[22px] grid grid-cols-7 gap-1 md:grid-cols-14" role="group" aria-label="November dates">
        {days.map((d) => {
          const b = booked[d];
          const s = b ? sources[b] : null;
          return (
            <button
              key={d}
              type="button"
              onClick={() => toggle(d)}
              aria-label={`November ${d}${s ? `, booked on ${s.t}` : ", available"}`}
              aria-pressed={!!b}
              className="min-h-12 cursor-pointer rounded-lg border-[1.5px] p-0 text-[13px] font-extrabold"
              style={{ background: s ? s.c : "#FFFFFF", color: s ? s.fg : "#14212B", borderColor: s ? s.c : "#CDD3D8" }}
            >
              {d}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3" aria-hidden="true">
        {["Airbnb calendar", "Booking.com calendar", "Your website calendar"].map((t) => (
          <div key={t} className="rounded-[14px] border border-[#E2E6EA] p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-sm font-extrabold">{t}</span>
              <span className={cn(code, "text-[10px] text-green")}>● SYNCED</span>
            </div>
            <div className="grid grid-cols-7 gap-[3px]">
              {days.map((d) => {
                const s = booked[d] ? sources[booked[d]] : null;
                return (
                  <span
                    key={d}
                    className="flex h-[26px] items-center justify-center rounded-[5px] text-[10px] font-extrabold"
                    style={{ background: s ? s.c : "#F2F4F6", color: s ? s.fg : "#5F6B75" }}
                  >
                    {s ? s.i : d}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="m-0 mt-3.5 text-center text-[13px] text-muted" aria-live="polite">
        {n} {n === 1 ? "night" : "nights"} booked · the same dates are blocked on every channel, so no double bookings. Illustration.
      </p>
    </div>
  );
}

/** Channel manager list "plugged into" a site preview. */
export function PlugBoard() {
  const [idx, setIdx] = useState(0);
  const cm = channelManagers[idx];
  return (
    <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)] md:gap-0">
      <div className="grid gap-2.5">
        {channelManagers.map((c, i) => {
          const on = idx === i;
          return (
            <button
              key={c.n}
              type="button"
              aria-pressed={on}
              onClick={() => setIdx(i)}
              className={cn(
                "flex min-h-[60px] cursor-pointer items-center justify-between gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left",
                on ? "border-ink bg-ink text-white" : "border-[#DDE3E8] bg-white text-ink",
              )}
            >
              <span className="text-base font-extrabold">{c.n}</span>
              <span className={cn(code, "text-[11px]")}>{c.tag}</span>
            </button>
          );
        })}
      </div>
      <div className="hidden h-full items-center justify-center md:flex" aria-hidden="true">
        <div className="h-[3px] w-full bg-[repeating-linear-gradient(90deg,#F0595A_0_10px,transparent_10px_18px)]" />
      </div>
      <Win
        right={
          <>
            <span className={cn(code, "ml-1 text-body")}>yourbrand.co.uk</span>
            <span className={cn(code, "ml-auto text-[10px] text-green")}>● CONNECTED</span>
          </>
        }
      >
        <div className="p-6" aria-live="polite">
          <p className={cn(code, "m-0 mb-2 text-brand")}>{cm.n}</p>
          <p className="m-0 mb-3.5 text-lg leading-[1.4] font-extrabold">{cm.opt}</p>
          <p className="m-0 text-[15px] leading-[1.6] text-body">
            <strong className="text-ink">How we connect it:</strong> {cm.how}
          </p>
        </div>
      </Win>
    </div>
  );
}

/** Builder vs custom comparison. */
export function BuilderVsCustom() {
  const [mode, setMode] = useState<"builder" | "custom">("builder");
  return (
    <>
      <div className="mt-16 mb-5 flex flex-wrap items-end justify-between gap-4">
        <h3 className="m-0 text-[26px] font-extrabold tracking-[-0.8px] md:text-[30px]">Builder or custom? We’ll recommend honestly.</h3>
        <div className="inline-flex gap-1 rounded-xl bg-fog p-1" role="group" aria-label="Compare options">
          {(
            [
              ["builder", "Channel manager builder"],
              ["custom", "Custom site via API"],
            ] as const
          ).map(([k, t]) => (
            <button
              key={k}
              type="button"
              aria-pressed={mode === k}
              onClick={() => setMode(k)}
              className={cn("min-h-[44px] cursor-pointer rounded-[9px] border-none px-4 text-sm font-bold text-ink", mode === k ? "bg-white shadow-sm" : "bg-transparent")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4" aria-live="polite">
        {builderVsCustom[mode].map((b) => (
          <div key={b.k} className="rounded-2xl border border-[#E2E6EA] p-5">
            <p className={cn(code, "m-0 mb-2.5 text-muted")}>{b.k}</p>
            <p className="m-0 mb-3 text-xl font-extrabold">{b.v}</p>
            <div className="h-1.5 overflow-hidden rounded-[3px] bg-fog">
              <div className="h-1.5 bg-coral transition-[width]" style={{ width: b.w }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Checkout mock with deposit / full payment choice. */
export function CheckoutMock() {
  const [pay, setPay] = useState<"deposit" | "full">("deposit");
  const opts = [
    { k: "deposit" as const, t: "Pay 25% deposit now", d: "£120 now · £360 later" },
    { k: "full" as const, t: "Pay in full", d: "£480 now" },
  ];
  return (
    <Win
      className="w-full max-w-[460px] justify-self-center"
      right={
        <>
          <span className={cn(code, "ml-1 text-body")}>Secure checkout</span>
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="ml-auto">
            <rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="#1F6B45" strokeWidth="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#1F6B45" strokeWidth="2" />
          </svg>
        </>
      }
    >
      <div className="grid gap-3.5 p-[22px]">
        <div className="flex items-center gap-3">
          <div className="size-16 flex-none rounded-[10px] bg-[#CFE1E2]" />
          <div>
            <p className="m-0 text-[15px] font-extrabold">Harbour View Apartment</p>
            <p className="m-0 text-[13px] text-muted">14–17 Nov · 3 nights · 2 guests</p>
          </div>
        </div>
        <div className="grid gap-1.5 border-y border-line-4 py-3 text-sm">
          <div className="flex justify-between">
            <span>3 nights × £150</span>
            <span>£450</span>
          </div>
          <div className="flex justify-between">
            <span>Cleaning</span>
            <span>£30</span>
          </div>
          <div className="flex justify-between font-extrabold">
            <span>Total</span>
            <span>£480</span>
          </div>
        </div>
        <div className="grid gap-1.5" role="radiogroup" aria-label="Payment option">
          {opts.map((o) => (
            <button
              key={o.k}
              type="button"
              role="radio"
              aria-checked={pay === o.k}
              onClick={() => setPay(o.k)}
              className={cn(
                "flex min-h-[52px] cursor-pointer items-center justify-between rounded-[10px] border-[1.5px] px-3.5 text-left text-sm text-ink",
                pay === o.k ? "border-coral bg-coral-50" : "border-[#DDE3E8] bg-white",
              )}
            >
              <span className="font-bold">{o.t}</span>
              <span className="text-[13px] text-body">{o.d}</span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[13px] font-bold">
          Discount code
          <input type="text" placeholder="WELCOMEBACK" className="min-h-10 flex-1 rounded-lg border border-line-strong px-2.5 text-[13px]" />
        </label>
        <label className="flex items-start gap-2 text-xs text-body">
          <input type="checkbox" className="mt-0.5 accent-coral" /> I accept the booking terms, cancellation policy and house rules
        </label>
        <button type="button" className="btn btn-coral w-full">
          Pay {pay === "deposit" ? "£120" : "£480"} now
        </button>
        <p className="m-0 text-center text-[11px] text-muted">Illustration. Options depend on your channel manager and payment provider.</p>
      </div>
    </Win>
  );
}

/** Eight build steps with a progress bar. */
export function BuildProgress() {
  const [step, setStep] = useState(4);
  const prog = `${Math.round(((step + 1) / buildSteps.length) * 100)}%`;
  const bs = buildSteps[step];
  return (
    <>
      <div className="mb-3.5 h-3 overflow-hidden rounded-md bg-fog">
        <div className="h-3 rounded-md bg-coral transition-[width]" style={{ width: prog }} />
      </div>
      <div className="mb-6 grid grid-cols-4 gap-1.5 md:grid-cols-8" role="tablist" aria-label="Build steps">
        {buildSteps.map((b, i) => {
          const on = i === step;
          const done = i < step;
          return (
            <button
              key={b.s}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setStep(i)}
              className={cn(
                "min-h-14 cursor-pointer rounded-[10px] border-[1.5px] px-1 py-1.5 text-xs font-extrabold",
                on ? "border-ink bg-ink text-white" : done ? "border-coral bg-coral-50 text-ink" : "border-[#DDE3E8] bg-white text-ink",
              )}
            >
              {String(i + 1).padStart(2, "0")}
              <span className="block text-[11px] font-semibold max-md:hidden">{b.s}</span>
            </button>
          );
        })}
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#DDE3E8] bg-white">
        <div className="flex items-center border-b border-[#E2E6EA] bg-fog px-3.5 py-2.5">
          <span className={cn(code, "text-body")}>
            step {step + 1} of {buildSteps.length}
          </span>
          <span className={cn(code, "ml-auto text-brand")}>{prog} built</span>
        </div>
        <div className="grid grid-cols-1 items-center gap-5 p-7 md:grid-cols-2" aria-live="polite">
          <p className="m-0 text-[30px] font-extrabold tracking-[-0.8px]">{bs.h}</p>
          <p className="m-0 text-base leading-[1.65] text-ink-copy">{bs.t}</p>
        </div>
      </div>
    </>
  );
}

/** Searchable open FAQ list. */
export function FaqSearch() {
  const [query, setQuery] = useState("");
  const q = query.toLowerCase().trim();
  const shown = q ? faq.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q)) : faq;
  return (
    <>
      <label className="mb-5 flex min-h-14 items-center gap-3 rounded-[14px] border-[1.5px] border-ink bg-white px-4">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="#14212B" strokeWidth="2" />
          <path d="M16 16l5 5" stroke="#14212B" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="sr-only-label">Search questions</span>
        <input
          type="search"
          placeholder="Search: sync, payments, Airbnb, landlords…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[52px] min-w-0 flex-1 border-none bg-transparent text-base outline-none"
        />
      </label>
      <p className={cn(code, "m-0 mb-3 text-muted")} aria-live="polite">
        {shown.length} of {faq.length} questions
      </p>
      {shown.map((f) => (
        <div key={f.q} className="border-t border-line py-[22px]">
          <h3 className="m-0 mb-2 text-lg font-extrabold">{f.q}</h3>
          <p className="m-0 text-[15px] leading-[1.65] text-body">{f.a}</p>
        </div>
      ))}
    </>
  );
}
