"use client";

import { useState, type FormEvent } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { AIRBNB_HOST_FEE, tipFilters, tips, toolOptions } from "../content";

const fmt = (n: number) => n.toFixed(2).replace(/\.00$/, "");

/** Nightly price slider showing the 15.5% host-only fee. */
export function FeeCalculator() {
  const [price, setPrice] = useState(100);
  return (
    <div className="rounded-[22px] bg-white p-6 md:p-[30px]">
      <label htmlFor="fee" className="mb-1.5 block text-sm font-extrabold">
        Your nightly price: £{price}
      </label>
      <input
        id="fee"
        type="range"
        min={50}
        max={300}
        step={5}
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="h-7 w-full accent-coral"
      />
      <div className="mt-[18px] grid grid-cols-2 gap-3" aria-live="polite">
        <div className="rounded-[14px] bg-[#F5F6F7] p-4">
          <p className="m-0 mb-1 text-xs font-extrabold tracking-[1px] text-muted">AIRBNB FEE</p>
          <p className="m-0 text-[26px] font-extrabold">−£{fmt(price * AIRBNB_HOST_FEE)}</p>
        </div>
        <div className="rounded-[14px] bg-ink p-4 text-white">
          <p className="m-0 mb-1 text-xs font-extrabold tracking-[1px] text-coral-200">YOU RECEIVE</p>
          <p className="m-0 text-[26px] font-extrabold">£{fmt(price * (1 - AIRBNB_HOST_FEE))}</p>
        </div>
      </div>
      <p className="m-0 mt-4 text-[15px] leading-[1.55] text-ink-copy">
        To take home <strong className="text-ink">£{price}</strong> a night, you’d need to price at{" "}
        <strong className="text-ink">£{fmt(price / (1 - AIRBNB_HOST_FEE))}</strong>.
      </p>
    </div>
  );
}

/** 12 pricing tips, filterable by category. */
export function TipsFilter({ heading }: { heading: React.ReactNode }) {
  const [filter, setFilter] = useState(0);
  const cat = tipFilters[filter].cat;
  const shown = tips.map((t, i) => ({ ...t, n: String(i + 1).padStart(2, "0") })).filter((t) => !cat || t.cat === cat);
  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        {heading}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tips">
          {tipFilters.map((f, i) => (
            <button
              key={f.label}
              type="button"
              aria-pressed={filter === i}
              onClick={() => setFilter(i)}
              className={cn(
                "min-h-[44px] cursor-pointer rounded-full border-[1.5px] border-ink px-[18px] text-sm font-bold",
                filter === i ? "bg-ink text-white" : "bg-transparent text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {shown.map((t) => (
          <div key={t.n} className="flex flex-col gap-2.5 rounded-[18px] bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-[26px] font-extrabold tracking-[-1px] text-coral">{t.n}</span>
              <span className="rounded-md bg-[#F5F6F7] px-[9px] py-[5px] text-[11px] font-extrabold tracking-[1px] text-muted">{t.cat}</span>
            </div>
            <h3 className="m-0 text-[17px] leading-[1.35] font-extrabold">{t.h}</h3>
            <p className="m-0 text-sm leading-[1.6] text-body">{t.t}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/** Free pricing review request (opens the visitor's email app). */
export function ReviewForm() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const body = [
      `Listing link: ${d.get("listing") ?? ""}`,
      `First name: ${d.get("name") ?? ""}`,
      `Email: ${d.get("email") ?? ""}`,
      `Pricing tool: ${d.get("tool") ?? ""}`,
    ].join("\n");
    window.location.href = `mailto:${brand.contact.email}?subject=${encodeURIComponent("Free pricing review")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  const field = "field rounded-[10px]";
  return (
    <form aria-label="Free pricing review" onSubmit={onSubmit} className="grid gap-3.5 rounded-[22px] bg-white p-6 md:p-8">
      <label className="grid gap-1.5 text-sm font-bold">
        Listing link
        <input name="listing" type="url" required placeholder="https://airbnb.co.uk/rooms/…" className={field} />
      </label>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-bold">
          First name
          <input name="name" type="text" className={field} />
        </label>
        <label className="grid gap-1.5 text-sm font-bold">
          Email
          <input name="email" type="email" required className={field} />
        </label>
      </div>
      <fieldset className="m-0 border-none p-0">
        <legend className="mb-2 p-0 text-sm font-bold">Pricing tool you use</legend>
        <div className="flex flex-wrap gap-2">
          {toolOptions.map((o) => (
            <label
              key={o}
              className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-sm font-semibold"
            >
              <input type="radio" name="tool" value={o} className="accent-coral" />
              {o}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="btn btn-ink mt-1 w-full rounded-full">
        Review my pricing
      </button>
      {sent && (
        <p className="m-0 text-[13px] text-muted" role="status">
          Your email app should open. If not, email us at {brand.contact.email}.
        </p>
      )}
    </form>
  );
}
