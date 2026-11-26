import Link from "next/link";
import { isToolLive, toolById, toolBySlug, toolLink } from "@/content/tools/catalog";
import { toolPath as perfPath, toolSlug as perfSlug } from "@/content/tools/bookingPerformanceId";
import { toolSlug as longStaySlug } from "@/content/tools/longStayId";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import { reviewedBy } from "@/components/service/ServiceBlocks";
import { FeeCalculator, ReviewForm, TipsFilter } from "./_components/Interactive";
import {
  calendar,
  compChecks,
  dow,
  events,
  faq,
  heroChips,
  honest,
  included,
  kpis,
  overrides,
  packageCta,
  process,
  proofRows,
  propertyTypes,
  receipts,
  reviewItems,
  seasons,
  sidebarCta,
  sidebarToc,
  sources,
  toolVsHuman,
  valuePoints,
  weAsk,
  weHandle,
} from "./content";
import { seo } from "./seo";
import { ServiceTocLayout } from "@/components/service/ServiceToc";

const W = "mx-auto box-border max-w-[1180px] px-4 md:px-6";
const sec = "py-16 md:py-[100px]";
const cols = "grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-14";
const pill = "btn min-h-[50px] rounded-full";

function Label({ children, center, className }: { children: ReactNode; center?: boolean; className?: string }) {
  return (
    <p
      className={cn(
        "m-0 mb-3.5 flex items-center gap-2.5 text-xs font-extrabold tracking-[1.6px] text-brand uppercase before:inline-block before:h-0.5 before:w-6 before:bg-coral",
        center && "justify-center",
        className,
      )}
    >
      {children}
    </p>
  );
}

function H2({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("m-0 mb-4 text-[32px] leading-[1.1] font-extrabold tracking-[-1.4px] md:text-[42px]", className)}>{children}</h2>;
}

function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 max-w-[700px] text-lg leading-[1.65] text-body", className)}>{children}</p>;
}

function Step({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 border-t border-line py-11 md:grid-cols-[120px_minmax(0,1fr)] md:gap-8">
      <span className="text-5xl leading-[0.9] font-extrabold tracking-[-3px] text-coral md:text-7xl">{n}</span>
      {children}
    </div>
  );
}

function Check({ color = "#F0595A" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 flex-none">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PricingOptimisationPage() {
  return (
    <>
      {/* HERO (dark) */}
      <section className="bg-ink text-white">
        <div className={cn(W, cols, "items-center pt-[72px] pb-24")}>
          <div>
            <Breadcrumbs seo={seo} onDark className="mb-[22px] font-bold [&_a]:text-coral-200" />
            <h1 className="m-0 mb-6 text-[42px] leading-[1.04] font-extrabold tracking-[-2.2px] md:text-[58px]">
              Pricing that chases profit, not just a full calendar
            </h1>
            <p className="m-0 mb-[22px] text-lg leading-[1.7] text-mist">
              Tools like PriceLabs react to market data. They don’t know your costs, can’t see how your home compares with
              the one next door, and don’t start the month with a target. Our team does, and you approve every major
              change.
            </p>
            <div className="mb-9 flex flex-wrap gap-2.5">
              {heroChips.map((c) => (
                <span key={c} className="rounded-full bg-night-field px-3.5 py-2 text-[13px] font-bold text-[#E4E9ED]">
                  {c}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#review" className={cn(pill, "btn-coral")}>
                Get a free pricing review
              </a>
              {isToolLive(perfSlug) && (
                <Link href={perfPath} className={cn(pill, "border-[1.5px] border-[#4A5A66] bg-transparent text-white hover:border-white hover:text-white")} data-perf-link>
                  Check your RevPAR
                </Link>
              )}
              <a href="#how" className={cn(pill, "border-[1.5px] border-[#4A5A66] bg-transparent text-white hover:border-white hover:text-white")}>
                See how we price
              </a>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-[26px] text-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="m-0 mb-1 text-[13px] font-bold text-muted">March target · Canal-view flat</p>
                <p className="m-0 text-[30px] font-extrabold tracking-[-1px]">
                  £2,050 <span className="text-base font-semibold text-muted">of £2,400</span>
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-2.5 py-1.5 text-xs font-bold text-green">Ahead of pace</span>
            </div>
            <div className="mb-[22px] h-2.5 overflow-hidden rounded-[5px] bg-fog-2">
              <div className="h-2.5 w-[85%] rounded-[5px] bg-coral" />
            </div>
            <div className="mb-2 grid grid-cols-7 gap-[5px]" aria-hidden="true">
              {dow.map((d) => (
                <span key={d} className="text-center text-[11px] font-bold text-muted">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-[5px]" aria-hidden="true">
              {calendar.map((c, i) => (
                <div
                  key={i}
                  className={cn(
                    "box-border flex h-[46px] flex-col justify-between rounded-lg border px-1.5 py-1",
                    c.kind === "booked" && "border-ink bg-ink text-white",
                    c.kind === "event" && "border-coral bg-coral-50 text-ink",
                    c.kind === "open" && "border-[#E2E6EA] bg-white text-ink",
                    c.kind === "blank" && "border-transparent bg-transparent",
                  )}
                >
                  {c.d && (
                    <>
                      <span className="text-[10px] font-bold opacity-85">{c.d}</span>
                      <span className="text-xs font-extrabold max-sm:hidden">£{c.p}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3.5 flex flex-wrap gap-4 text-xs font-semibold text-body">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-[3px] bg-ink" />
                Booked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-[3px] border border-coral bg-coral-50" />
                Event premium
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-[3px] border border-[#D5DADF] bg-white" />
                Open
              </span>
            </div>
            <p className="m-0 mt-3 text-[11px] text-muted">Illustration with example figures.</p>
          </div>
        </div>
      </section>

      <ServiceTocLayout items={sidebarToc} cta={sidebarCta}>
        {/* FEE CHANGE */}
        <section id="fee-change" className="bg-coral-50">
          <div className={cn(W, cols, "items-center py-[72px]")}>
            <div>
              <Label>The 2026 fee change</Label>
              <H2 className="md:text-4xl">Airbnb now takes 15.5% from you. Have you repriced?</H2>
              <Lead className="text-ink-copy">
                Airbnb moved hosts to a single 15.5% host-only fee. Guests see the price you set, and the fee comes out of
                your payout. A £100 price that hasn’t changed now pays you £84.50.
              </Lead>
              <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
                Source: Airbnb Resource Centre, Simplifying Airbnb service fees (July 2026, updated October 2026).
              </p>
            </div>
            <FeeCalculator />
          </div>
        </section>

        {/* PROFIT VS OCCUPANCY */}
        <section id="profit" className={sec}>
          <div className={W}>
            <div className={cn(cols, "mb-[52px] items-end")}>
              <div>
                <Label>Our core idea</Label>
                <H2 className="m-0">Occupancy is not the goal. Profit is.</H2>
              </div>
              <Lead>
                Every extra stay brings a clean, laundry, wear and tear, and another chance of a bad review. Here’s the same
                one-bed flat priced two ways for a 30-night month.
              </Lead>
            </div>
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
              <div className="rounded-[22px] border-[1.5px] border-line p-8">
                <p className="m-0 mb-1 text-[13px] font-extrabold tracking-[1px] text-muted">{receipts.occupancy.label}</p>
                <p className="m-0 mb-6 text-[15px] text-muted">{receipts.occupancy.sub}</p>
                {receipts.occupancy.rows.map((r) => (
                  <div key={r.k} className="flex justify-between gap-3 border-b border-dashed border-[#D5DADF] py-3 text-[15px]">
                    <span className="text-body">{r.k}</span>
                    <span className="font-bold">{r.v}</span>
                  </div>
                ))}
                <div className="flex items-baseline justify-between pt-5">
                  <span className="text-[15px] font-extrabold">You keep</span>
                  <span className="text-[34px] font-extrabold tracking-[-1px] text-muted">{receipts.occupancy.keep}</span>
                </div>
              </div>
              <div className="relative rounded-[22px] bg-ink p-8 text-white">
                <span className="absolute -top-3.5 right-6 rounded-full bg-coral px-3 py-[7px] text-xs font-extrabold text-ink">
                  {receipts.profit.badge}
                </span>
                <p className="m-0 mb-1 text-[13px] font-extrabold tracking-[1px] text-coral-200">{receipts.profit.label}</p>
                <p className="m-0 mb-6 text-[15px] text-mist">{receipts.profit.sub}</p>
                {receipts.profit.rows.map((r) => (
                  <div key={r.k} className="flex justify-between gap-3 border-b border-dashed border-night-field-line py-3 text-[15px]">
                    <span className="text-mist">{r.k}</span>
                    <span className="font-bold">{r.v}</span>
                  </div>
                ))}
                <div className="flex items-baseline justify-between pt-5">
                  <span className="text-[15px] font-extrabold">You keep</span>
                  <span className="text-[34px] font-extrabold tracking-[-1px] text-coral-200">{receipts.profit.keep}</span>
                </div>
              </div>
            </div>
            <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
              Illustrative example with invented figures; turnover cost of £55 (clean, laundry, consumables) is an
              assumption. Before other costs. Wheelhouse makes the same point: selling every night cheaply can earn less
              than fewer nights at a premium.
            </p>
          </div>
        </section>

        {/* UK MARKET */}
        <section id="uk-market" className="bg-sand">
          <div className={cn(W, sec)}>
            <Label>The UK market, honestly</Label>
            <H2 className="mb-10">What “normal” looks like for a UK short let</H2>
            <div className="mb-5 grid grid-cols-1 overflow-hidden rounded-[20px] bg-white sm:grid-cols-2 md:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.k} className="border-r border-b border-line-4 p-7">
                  <p className="m-0 mb-1.5 text-[13px] font-bold text-muted">{k.k}</p>
                  <p className="m-0 mb-1.5 text-[40px] font-extrabold tracking-[-1.5px]">{k.v}</p>
                  <p className="m-0 text-[13px] text-body">{k.r}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {seasons.map((s) => (
                <div key={s.k} className={cn("rounded-2xl p-[22px]", s.dark ? "bg-ink text-white" : "bg-white")}>
                  <p className={cn("m-0 mb-1.5 text-[13px] font-extrabold", s.dark ? "text-coral-200" : s.kc)}>{s.k}</p>
                  <p className={cn("m-0 text-[15px] leading-normal", !s.dark && "text-ink-hover")}>{s.t}</p>
                </div>
              ))}
            </div>
            <p className="m-0 mt-6 max-w-[820px] text-base leading-[1.6] text-ink-hover">
              <strong>Bookings are getting later:</strong> Key Data’s UK Spring 2026 report showed lead times down 1% to 4%
              and stays 2% to 4% shorter, while nightly rates rose. Late, short bookings are exactly where blind automation
              drops prices too far, too early.
            </p>
            <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
              Sources: PriceLabs UK market report (Feb 2025–Jan 2026); Key Data UK Spring 2026 Index via Property Reporter.
              UK averages; your area will differ.
            </p>
          </div>
        </section>

        {/* TOOL VS HUMAN */}
        <section id="tool-vs-human" className={sec}>
          <div className={W}>
            <div className="mx-auto mb-12 max-w-[760px] text-center">
              <Label center>Tools plus people</Label>
              <H2>What the tool does well, and where a person makes the difference</H2>
              <Lead className="mx-auto">
                Even PriceLabs says market data can’t measure your floor, view or furniture quality. We use the tool for
                speed, and our judgement for everything it can’t see.
              </Lead>
            </div>
            <div className="overflow-hidden rounded-[22px] border border-line">
              <div className="grid grid-cols-2 bg-[#F5F6F7]">
                <div className="flex items-center gap-2.5 px-4 py-[18px] text-[15px] font-extrabold md:px-7">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="#14212B" strokeWidth="2" />
                    <path d="M9 9h6v6H9z" fill="#14212B" />
                  </svg>
                  Pricing tool
                </div>
                <div className="flex items-center gap-2.5 bg-ink px-4 py-[18px] text-[15px] font-extrabold text-white md:px-7">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" fill="none" stroke="#F0595A" strokeWidth="2" />
                    <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="#F0595A" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Your {brand.name} team
                </div>
              </div>
              {toolVsHuman.map((t) => (
                <div key={t.a} className="grid grid-cols-2 border-t border-line-4">
                  <div className="px-4 py-5 text-[15px] leading-normal text-body md:px-7">{t.a}</div>
                  <div className="bg-[#FDF6F6] px-4 py-5 text-[15px] leading-normal font-semibold md:px-7">{t.b}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-start gap-4 rounded-2xl bg-sand px-6 py-[22px]">
              <span className="flex-none rounded-lg bg-white px-2.5 py-1.5 text-[13px] font-extrabold">Smart Pricing?</span>
              <p className="m-0 flex-1 text-[15px] leading-[1.6] text-ink-copy">
                Airbnb’s Smart Pricing uses “hundreds of factors” within a minimum and maximum you set. It’s a simple start,
                but it only prices Airbnb, overrides Airbnb’s pricing rule-sets, and length-of-stay discounts work on top of
                it. Most growing hosts get more control from a dedicated tool plus a person watching it.
              </p>
            </div>
            <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
              Sources: PriceLabs, Vacation rental base price guide; Airbnb Help, Smart Pricing (article 1168).
            </p>
          </div>
        </section>

        {/* HOW WE SET */}
        <section id="how" className="border-t border-line-4 bg-[#FAFAFB]">
          <div className={cn(W, sec)}>
            <Label>How we set your price</Label>
            <H2 className="mb-8">Five steps, every month</H2>

            <Step n="01">
              <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
                <div>
                  <h3 className="m-0 mb-2.5 text-2xl font-extrabold">Start the month with a number</h3>
                  <p className="m-0 text-base leading-[1.65] text-body">
                    Before each month, we agree a realistic revenue target with you from your history, the season, the
                    market and what’s already booked. Every decision that month is measured against it.
                  </p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="grid grid-cols-3 bg-[#F5F6F7] text-xs font-extrabold tracking-[1px] text-muted">
                    <span className="px-4 py-3">TARGET £2,400</span>
                    <span className="px-4 py-3">1 MARCH</span>
                    <span className="px-4 py-3">15 MARCH</span>
                  </div>
                  <div className="grid grid-cols-3 border-t border-line-4 text-sm">
                    <span className="px-4 py-3 text-body">Booked</span>
                    <span className="px-4 py-3 font-bold">£1,500 (63%)</span>
                    <span className="px-4 py-3 font-bold">£2,050 (85%)</span>
                  </div>
                  <div className="grid grid-cols-3 border-t border-line-4 text-sm">
                    <span className="px-4 py-3 text-body">Pace</span>
                    <span className="px-4 py-3 font-bold">On pace</span>
                    <span className="px-4 py-3 font-bold text-green">Ahead</span>
                  </div>
                  <div className="border-t border-line-4 px-4 py-3 text-sm leading-normal text-ink-hover">
                    <strong>Ahead:</strong> hold or raise remaining dates. <strong>Behind:</strong> targeted changes on
                    specific dates, never a blanket cut.
                  </div>
                </div>
              </div>
            </Step>

            <Step n="02">
              <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
                <div>
                  <h3 className="m-0 mb-2.5 text-2xl font-extrabold">Price against your real competitors</h3>
                  <p className="m-0 text-base leading-[1.65] text-body">
                    Every week we review 8 to 12 listings guests compare you with: same neighbourhood, similar size and
                    standard.
                  </p>
                </div>
                <ul className="m-0 grid list-none gap-2.5 p-0">
                  {compChecks.map((c) => (
                    <li key={c} className="flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 text-[15px] leading-normal">
                      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 flex-none">
                        <circle cx="11" cy="11" r="7" fill="none" stroke="#B8383A" strokeWidth="2" />
                        <path d="M16 16l5 5" stroke="#B8383A" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </Step>

            <Step n="03">
              <div>
                <h3 className="m-0 mb-2.5 text-2xl font-extrabold">Fit the price to your property and neighbourhood</h3>
                <p className="m-0 mb-[22px] max-w-[680px] text-base leading-[1.65] text-body">
                  Dynamic pricing isn’t one-size-fits-all. Each type of home has its own demand pattern.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {propertyTypes.map((p) => (
                    <div key={p.h} className="rounded-2xl border border-line bg-white p-[22px]">
                      <h4 className="m-0 mb-2.5 text-[17px] font-extrabold">{p.h}</h4>
                      <p className="m-0 mb-3 text-sm leading-normal text-body">{p.d}</p>
                      <p className="m-0 border-t border-line-4 pt-3 text-sm leading-normal font-bold">{p.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Step>

            <Step n="04">
              <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
                <div>
                  <h3 className="m-0 mb-2.5 text-2xl font-extrabold">Override the tool when it’s wrong</h3>
                  <p className="m-0 text-base leading-[1.65] text-body">
                    Raising a date the tool hasn’t caught up on yet, or lowering a stubborn gap night so it books instead of
                    sitting empty. Every override is logged with a reason.
                  </p>
                </div>
                <div className="rounded-2xl bg-ink p-5 text-sm text-white">
                  <p className="m-0 mb-3 text-xs font-extrabold tracking-[1px] text-coral-200">OVERRIDE LOG · EXAMPLE</p>
                  {overrides.map((o) => (
                    <div key={o.d} className="grid grid-cols-[60px_70px_minmax(0,1fr)] gap-2.5 border-t border-night-4 py-2.5 md:grid-cols-[70px_90px_minmax(0,1fr)]">
                      <span className="text-mist">{o.d}</span>
                      <span className="font-extrabold">{o.c}</span>
                      <span className="text-[#E4E9ED]">{o.r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Step>

            <Step n="05">
              <div>
                <h3 className="m-0 mb-2.5 text-2xl font-extrabold">You approve the big decisions</h3>
                <p className="m-0 mb-[22px] text-base leading-[1.65] text-body">
                  Day-to-day moves stay inside the range you agree. Anything bigger comes to you first.
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-green-100 p-6">
                    <p className="m-0 mb-3.5 text-[13px] font-extrabold tracking-[1px] text-green">WE HANDLE DAY TO DAY</p>
                    {weHandle.map((w) => (
                      <p key={w} className="m-0 mb-2.5 text-[15px] leading-normal text-ink">
                        {w}
                      </p>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-coral-50 p-6">
                    <p className="m-0 mb-3.5 text-[13px] font-extrabold tracking-[1px] text-brand-deep">WE ASK YOU FIRST</p>
                    {weAsk.map((w) => (
                      <p key={w} className="m-0 mb-2.5 text-[15px] leading-normal text-ink">
                        {w}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Step>

            {/* London hosts: longer stays + the 90-night counter (shown once the tool is live) */}
            {isToolLive("london-90-night-counter") && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-line bg-white p-5 md:p-6">
                <div className="max-w-[640px]">
                  <p className="m-0 mb-1 text-xs font-extrabold tracking-[1.2px] text-brand uppercase">London hosts</p>
                  <p className="m-0 text-[17px] leading-[1.5] font-extrabold text-ink">Fill the gaps with longer stays</p>
                  <p className="m-0 mt-1 text-[15px] leading-[1.6] text-body">
                    Whole-home short lets in London have a yearly night limit. We set minimum stays and monthly rates so the rest of the year still earns. Track your nights across every platform first.
                  </p>
                </div>
                <Link href={toolBySlug("london-90-night-counter")!.href!} className="btn btn-ink">
                  Count my London nights →
                </Link>
              </div>
            )}

            {/* Scotland and Wales: visitor levy in the price (shown once the tool is live) */}
            {isToolLive("uk-visitor-levy-calculator") && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-line bg-white p-5 md:p-6">
                <div className="max-w-[640px]">
                  <p className="m-0 mb-1 text-xs font-extrabold tracking-[1.2px] text-brand uppercase">Edinburgh, Cardiff and more</p>
                  <p className="m-0 text-[17px] leading-[1.5] font-extrabold text-ink">Price in the visitor levy</p>
                  <p className="m-0 mt-1 text-[15px] leading-[1.6] text-body">
                    Some areas add a visitor levy to each stay. We build it into your rates so the price guests see is the price they pay.
                  </p>
                </div>
                <Link href={toolBySlug("uk-visitor-levy-calculator")!.href!} className="btn btn-ink">
                  Calculate the levy →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* EVENTS */}
        <section id="events" className={sec}>
          <div className={W}>
            <div className={cn(cols, "mb-10 items-end")}>
              <div>
                <Label>Event and demand pricing</Label>
                <H2 className="m-0">Be early, not late</H2>
              </div>
              <Lead>When an event is announced, guests search straight away. If your price hasn’t moved, the early bookings go at your normal rate.</Lead>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-5">
              {events.map((e) => (
                <div key={e.k} className="flex min-h-[120px] overflow-hidden rounded-2xl border border-line">
                  <div className="w-3.5 flex-none bg-coral" />
                  <div className="border-l-2 border-dashed border-line p-5">
                    <p className="m-0 mb-2 text-xs font-extrabold tracking-[1px] text-brand">{e.k}</p>
                    <p className="m-0 text-[15px] leading-[1.45] font-bold">{e.t}</p>
                  </div>
                </div>
              ))}
            </div>
            {isToolLive("uk-event-calendar") && (
              <p className="m-0 mt-5 text-[15px] font-semibold text-ink-copy" data-event-calendar-link>
              See what’s coming up near your property:{" "}
              <Link href={toolLink(toolById("uk-event-calendar")!)} className="font-extrabold text-brand">
                free UK event calendar →
              </Link>
            </p>
            )}
            <div className="mt-6 grid grid-cols-1 gap-3.5 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F5F6F7] p-6">
                <p className="m-0 mb-2 text-base font-extrabold">For each event we decide</p>
                <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">
                  The premium, a minimum stay for the busy nights, and when to release the price if demand turns out softer.
                </p>
              </div>
              <div className="rounded-2xl bg-ink p-6 text-white">
                <p className="m-0 mb-2 text-base font-extrabold text-coral-200">Our rule</p>
                <p className="m-0 text-[15px] leading-[1.6] text-[#E4E9ED]">
                  Price event dates early with a premium, then review weekly. Lowering later is easy; you can’t take back a
                  booking sold too cheaply.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 12 TIPS */}
        <section id="tips" className="bg-sand">
          <div className={cn(W, sec)}>
            <TipsFilter
              heading={
                <div>
                  <Label>Free to use</Label>
                  <H2 className="m-0">12 pricing tips we use every week</H2>
                </div>
              }
            />
            {isToolLive(longStaySlug) && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-line bg-white px-6 py-5" data-long-stay-link>
                <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">
                  <strong className="text-ink">Thinking about a weekly or monthly discount?</strong> Our free calculator compares short stays with one discounted long stay, after fees and turnovers.
                </p>
                <SmartLink href={toolLink(toolBySlug(longStaySlug)!)} className="btn btn-coral rounded-full">
                  Check a long-stay discount (free tool) →
                </SmartLink>
              </div>
            )}
            <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
              Sources: PriceLabs base price guide and customisations list; Airbnb Help, weekly and monthly discounts;
              SmartOrder, Booking.com Genius discount stacking.
            </p>
          </div>
        </section>

        {/* VALUE FOR MONEY */}
        <section id="value" className={sec}>
          <div className={cn(W, "max-w-[980px] text-center")}>
            <Label center>Value for money</Label>
            <p className="m-0 mb-8 text-[28px] leading-[1.25] font-extrabold tracking-[-1.2px] md:text-[38px]">
              “Value” is one of the six ratings guests leave on Airbnb. We price the stay guests will rate well, not just
              the highest number that books.
            </p>
            <div className="grid grid-cols-1 gap-3.5 text-left md:grid-cols-3">
              {valuePoints.map((v) => (
                <div key={v} className="border-t-[3px] border-coral pt-4">
                  <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INCLUDED + PROCESS */}
        <section id="included" className="bg-ink text-white">
          <div className={cn(W, sec, cols)}>
            <div>
              <Label className="text-coral-200">What’s included</Label>
              <H2 className="mb-7 text-white">Everything your pricing needs</H2>
              <ul className="m-0 list-none p-0">
                {included.map((i) => (
                  <li key={i.h} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 border-t border-night-4 py-3.5">
                    <Check />
                    <span>
                      <strong className="mb-0.5 block text-base">{i.h}</strong>
                      <span className="text-sm leading-normal text-mist">{i.t}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Label className="text-coral-200">How it works</Label>
              <H2 className="mb-7 text-white">From review to monthly report</H2>
              <ol className="relative m-0 mb-9 list-none p-0">
                {process.map((p, i) => (
                  <li key={p.h} className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 pb-[22px]">
                    <span className="flex size-11 items-center justify-center rounded-full bg-coral font-extrabold text-ink">{i + 1}</span>
                    <span className="pt-0.5">
                      <strong className="mb-1 block text-base">{p.h}</strong>
                      <span className="text-sm leading-[1.55] text-mist">{p.t}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="rounded-[18px] bg-night-field p-6">
                <p className="m-0 mb-3.5 text-[13px] font-extrabold tracking-[1px] text-coral-200">WHAT TO EXPECT, HONESTLY</p>
                {honest.map((h) => (
                  <p key={h.b} className="m-0 mb-3 text-sm leading-[1.55] text-[#E4E9ED]">
                    <strong className="text-white">{h.b}</strong> {h.t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section id="proof" className={sec}>
          <div className={W}>
            <Label>Proof</Label>
            <H2 className="mb-8">Before and after, same months</H2>
            <div className="overflow-x-auto rounded-[18px] border border-line">
              <table className="w-full min-w-[720px] border-collapse text-[15px]">
                <thead>
                  <tr className="bg-[#F5F6F7] text-left">
                    <th className="px-5 py-4">Listing</th>
                    <th className="px-5 py-4">Period</th>
                    <th className="px-5 py-4">Before</th>
                    <th className="bg-coral-50 px-5 py-4">After</th>
                  </tr>
                </thead>
                <tbody>
                  {proofRows.map((r) => (
                    <tr key={r.l} className="border-t border-line-4">
                      <td className="px-5 py-4 font-bold">{r.l}</td>
                      <td className="px-5 py-4 text-body">{r.p}</td>
                      <td className="px-5 py-4">{r.b}</td>
                      <td className="bg-[#FDF6F6] px-5 py-4 font-bold">{r.a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
              Real client data only, shared with permission, with dated screenshots of the monthly tracker and override log.
            </p>
          </div>
        </section>

        {/* REVIEW FORM */}
        <section id="review" className="bg-coral-50">
          <div className={cn(W, cols, sec, "items-center")}>
            <div>
              <Label>Free pricing review</Label>
              <H2>Are your prices leaving money on the table?</H2>
              <Lead className="mb-[22px] text-ink-copy">Send your listing link. Within 48 hours ({brand.hours.range.split(",")[0]}) you’ll get:</Lead>
              {reviewItems.map((r) => (
                <p key={r} className="m-0 mb-2.5 flex gap-2.5 text-base leading-normal">
                  <Check color="#B8383A" />
                  {r}
                </p>
              ))}
            </div>
            <ReviewForm />
          </div>
        </section>

        {/* RUN PACKAGE */}
        <section id="call">
          <div className={cn(W, "py-16")}>
            <div className="flex flex-wrap items-center justify-between gap-7 rounded-3xl border-2 border-ink p-7 md:p-9">
              <div className="flex-[1_1_520px]">
                <p className="m-0 mb-2 text-[13px] font-extrabold tracking-[1.4px] text-brand">INCLUDED IN THE RUN PACKAGE</p>
                <h2 className="m-0 mb-2 text-[28px] font-extrabold tracking-[-0.8px]">{packageCta.title}</h2>
                <p className="m-0 text-[15px] leading-[1.6] text-body">{packageCta.text}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#review" className={cn(pill, "btn-coral")}>
                  Free pricing review
                </a>
                <SmartLink href={brand.links.bookCall} className={cn(pill, "btn-ink")}>
                  Book a 20-minute call
                </SmartLink>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-line-4 bg-[#FAFAFB]">
          <div className={cn(W, sec, "max-w-[920px]")}>
            <Label>FAQ</Label>
            <H2 className="mb-9">Pricing questions hosts ask us</H2>
            {faq.map((q, i) => (
              <div key={q.q} className="grid grid-cols-[56px_minmax(0,1fr)] gap-4 border-t border-line py-[26px]">
                <span className="text-[15px] font-extrabold text-brand">Q{i + 1}</span>
                <div>
                  <h3 className="m-0 mb-2.5 text-[19px] font-extrabold">{q.q}</h3>
                  <p className="m-0 text-base leading-[1.65] text-body">{q.a}</p>
                </div>
              </div>
            ))}
            <p className="m-0 mt-8 border-t border-line pt-[22px] text-[13px] leading-[1.7] text-muted">
              <strong className="text-ink-copy">Sources:</strong> {sources} {reviewedBy("November 2026")}
            </p>
          </div>
        </section>
      </ServiceTocLayout>
    </>
  );
}
