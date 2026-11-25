import type { ReactNode } from "react";
import Link from "next/link";
import { brand } from "@/config/brand";
import { isToolLive, toolBySlug } from "@/content/tools/catalog";
import { toolSlug as certSlug } from "@/content/tools/certificateRemindersId";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import { reviewedBy } from "@/components/service/ServiceBlocks";
import { CompanyDirectory, FaqFilter, LinenOptions, QuoteChooser } from "./_components/Interactive";
import {
  checklistHref,
  gantt,
  glance,
  honest,
  hours,
  jobs,
  lanes,
  laundrySteps,
  legend,
  packageCta,
  proof,
  sidebarCta,
  sidebarToc,
  sources,
  steps,
  tradeChecks,
  tradeSteps,
  triage,
  year,
} from "./content";
import { seo } from "./seo";
import { ServiceTocLayout } from "@/components/service/ServiceToc";

/* Editorial style: cream page, 1px ink rules, 6px corners, monospace labels. */
const mono = "font-mono text-xs font-semibold tracking-[0.6px] uppercase";
const W = "mx-auto box-border max-w-[1200px] px-4 md:px-7";
const two = "grid grid-cols-1 items-start gap-7 md:grid-cols-2 md:gap-12";
const sec = "py-14 md:py-20";
const btnBase = "btn min-h-[50px] rounded-md";
const btnOutline = "btn min-h-[50px] rounded-md border-[1.5px] border-ink bg-transparent text-ink hover:bg-ink hover:text-white";

function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn(mono, "m-0", className)}>{children}</p>;
}

function H3({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("m-0 text-[26px] font-extrabold tracking-[-0.8px] md:text-[30px]", className)}>{children}</h3>;
}

function Chapter({ n, part, title }: { n: string; part: string; title: string }) {
  return (
    <div className="grid grid-cols-1 items-end gap-2 border-b-2 border-ink pt-[72px] pb-9 md:grid-cols-[auto_minmax(0,1fr)] md:gap-7">
      <span
        className="text-[84px] leading-[0.8] font-extrabold tracking-[-3px] text-transparent md:text-[150px] md:tracking-[-6px]"
        style={{ WebkitTextStroke: "2px #14212B" }}
        aria-hidden="true"
      >
        {n}
      </span>
      <div>
        <Mono className="mb-2 text-brand">{part}</Mono>
        <h2 className="m-0 text-[30px] leading-[1.12] font-extrabold tracking-[-1.2px] md:text-[40px]">{title}</h2>
      </div>
    </div>
  );
}

export default function LaundryMaintenancePage() {
  return (
    <div className="bg-[#FBF8F3]">
      {/* HERO */}
      <section>
        <div className={cn(W, "pt-14 pb-10")}>
          <Breadcrumbs seo={seo} className={cn(mono, "mb-[18px]")} />
          <div className={cn(two, "items-end md:gap-10")}>
            <h1 className="m-0 text-[40px] leading-none font-extrabold tracking-[-2.6px] md:text-[64px]">
              Fresh linen on time. Repairs sorted. You just pay the invoice.
            </h1>
            <div>
              <p className="m-0 mb-6 text-[17px] leading-[1.7] text-ink-copy">
                We place your linen orders and time every delivery with your cleaner. We work with your handyman, or find
                local trades, collect quotes and let you choose. Then we book the job around your guests and check it’s
                done. <strong className="text-ink">You pay the tradesperson directly; we do the rest.</strong>
              </p>
              <div className="flex flex-wrap gap-3">
                <SmartLink href={brand.links.bookCall} className={cn(btnBase, "btn-coral")}>
                  Book a 20-minute call
                </SmartLink>
                <SmartLink href={checklistHref} className={btnOutline}>
                  Free maintenance checklist
                </SmartLink>
              </div>
            </div>
          </div>
        </div>
        <div className={cn(W, "pb-[72px]")}>
          <div className="grid grid-cols-1 overflow-hidden rounded-md border border-ink md:grid-cols-2">
            <a
              href="#laundry"
              className="flex flex-col gap-[22px] bg-coral-50 p-6 text-ink no-underline hover:text-ink md:border-r md:border-ink md:p-8"
            >
              <span className="flex items-center justify-between">
                <span className={mono}>01 · Laundry</span>
                <span className={cn(mono, "text-brand-deep")}>Jump ↓</span>
              </span>
              <span className="grid gap-2.5 rounded-md border border-ink bg-white p-[18px]">
                <span className={cn(mono, "text-muted")}>Linen order #2041 · Flat 2</span>
                <span className="text-xl font-extrabold">3 bed sets · 6 towels · 2 bath mats</span>
                <span className="grid grid-cols-2 gap-2 text-sm">
                  <span className="rounded bg-[#F5F6F7] px-2.5 py-2">
                    <strong>Delivery</strong>
                    <br />
                    09:30–11:00
                  </span>
                  <span className="rounded bg-[#F5F6F7] px-2.5 py-2">
                    <strong>Cleaner</strong>
                    <br />
                    arrives 11:00
                  </span>
                </span>
                <span className="text-[13px] font-bold text-green">Delivered 10:12 · counts confirmed by cleaner</span>
              </span>
            </a>
            <a
              href="#maintenance"
              className="flex flex-col gap-[22px] bg-ink p-6 text-white no-underline hover:text-white md:p-8"
            >
              <span className="flex items-center justify-between">
                <span className={cn(mono, "text-coral-200")}>02 · Maintenance</span>
                <span className={cn(mono, "text-coral-200")}>Jump ↓</span>
              </span>
              <span className="grid gap-2.5 rounded-md border border-night-field-line bg-night-field p-[18px]">
                <span className={cn(mono, "text-[#AEB9C2]")}>Job #318 · Garden tidy</span>
                <span className="text-xl font-extrabold">3 quotes in · you chose Quote B</span>
                <span className="grid grid-cols-2 gap-2 text-sm">
                  <span className="rounded bg-ink-hover px-2.5 py-2">
                    <strong>Booked</strong>
                    <br />
                    Tue, no guests in
                  </span>
                  <span className="rounded bg-ink-hover px-2.5 py-2">
                    <strong>You pay</strong>
                    <br />
                    the gardener direct
                  </span>
                </span>
                <span className="text-[13px] font-bold text-coral-200">Completion photos received 15:40</span>
              </span>
            </a>
          </div>
          <p className="m-0 mt-2.5 text-xs text-muted">Illustrations with example details.</p>
        </div>
      </section>

      <ServiceTocLayout items={sidebarToc} cta={sidebarCta}>
        {/* AT A GLANCE */}
        <section id="glance" className="border-y border-ink bg-white">
          <div className={cn(W, "py-16")}>
            <Mono className="mb-5">At a glance</Mono>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-[15px] leading-normal">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th className="w-[200px] pb-2.5">
                      <span className="sr-only-label">Topic</span>
                    </th>
                    <th className={cn(mono, "pb-2.5 text-left text-brand")}>Laundry coordination</th>
                    <th className={cn(mono, "pb-2.5 text-left text-brand")}>Maintenance coordination</th>
                  </tr>
                </thead>
                <tbody>
                  {glance.map((g) => (
                    <tr key={g.k} className="border-b border-[#D9D4CB]">
                      <th scope="row" className={cn(mono, "py-4 pr-4 text-left align-top text-body")}>
                        {g.k}
                      </th>
                      <td className="py-4 pr-4 align-top">{g.a}</td>
                      <td className="py-4 align-top">{g.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CHAPTER 1: LAUNDRY */}
        <section id="laundry">
          <div className={W}>
            <Chapter n="01" part="Part one" title="Laundry and linen coordination" />
            <div className={cn(sec, "pb-10 md:pb-10")}>
              <LinenOptions
                intro={
                  <p className="m-0 mb-6 max-w-[680px] text-[17px] leading-[1.7] text-body">
                    Not every host uses a laundry service. If you do, the hard part isn’t the washing; it’s the timing.
                    Fresh linen arriving at 2pm for an 11am clean means a late check-in. That’s what we manage.
                  </p>
                }
              />
            </div>

            <div className={cn(sec, "pt-10 md:pt-10")}>
              <CompanyDirectory />
              <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
                Details from each company’s website or partner pages, checked November 2026. Prices and coverage change;
                check directly. {brand.name} is not affiliated with these companies, and works with whichever you choose.
              </p>
            </div>

            <div className={cn(sec, "pt-0 md:pt-0")}>
              <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] md:gap-12">
                <div>
                  <Mono className="mb-2.5 text-brand">How we coordinate laundry</Mono>
                  <H3 className="mb-[18px]">One turnover day, timed to the minute</H3>
                  <ol className="m-0 list-none p-0">
                    {laundrySteps.map((s, i) => (
                      <li key={s.h} className="grid grid-cols-[34px_minmax(0,1fr)] gap-2.5 border-t border-[#D9D4CB] py-2.5 text-[15px] leading-normal">
                        <span className={cn(mono, "text-brand")}>{String(i + 1).padStart(2, "0")}</span>
                        <span>
                          <strong>{s.h}</strong> {s.t}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="overflow-x-auto rounded-md border border-ink bg-white p-6">
                  <div className="min-w-[560px]">
                    <div className="mb-2 grid grid-cols-[120px_minmax(0,1fr)]">
                      <span />
                      <div className={cn(mono, "flex justify-between")}>
                        {hours.map((h) => (
                          <span key={h} className="text-[11px] text-muted">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                    {gantt.map((r) => (
                      <div key={r.who} className="grid grid-cols-[120px_minmax(0,1fr)] items-center border-t border-[#EDE8DF] py-2.5">
                        <span className="text-sm font-extrabold">{r.who}</span>
                        <div
                          className="relative h-[34px]"
                          style={{
                            background:
                              "repeating-linear-gradient(90deg, transparent, transparent calc(11.11% - 1px), #EDE8DF calc(11.11% - 1px), #EDE8DF 11.11%)",
                          }}
                        >
                          {r.bars.map((b) => (
                            <span
                              key={b.t}
                              className="absolute top-[3px] box-border flex h-7 items-center overflow-hidden rounded px-2 text-[11px] font-bold whitespace-nowrap"
                              style={{ left: b.l, width: b.w, background: b.c, color: b.fg }}
                            >
                              {b.t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <p className="m-0 mt-3.5 text-[13px] text-muted">
                      Example day: check-out 11:00, check-in 15:00. Timing tip: on back-to-backs, book the earliest
                      delivery slot and keep one spare set on site.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER 2: MAINTENANCE */}
        <section id="maintenance" className="border-t border-ink bg-white">
          <div className={W}>
            <Chapter n="02" part="Part two" title="Maintenance coordination" />
            <div className={cn(sec, "pb-12 md:pb-12")}>
              <div className={two}>
                <div>
                  <p className="m-0 mb-[26px] max-w-[680px] text-[17px] leading-[1.7] text-body">
                    Things break, and guests notice. Our job is to get the right person there quickly, at a time that suits
                    your guests, and make sure it’s fixed.
                  </p>
                  <div className="rounded-md border border-ink bg-[#FBF8F3] p-6">
                    <Mono className="mb-2.5">Already have a handyman?</Mono>
                    <p className="m-0 text-base leading-[1.6]">
                      We work with them: clear job details with photos, a time agreed around your bookings, access arranged,
                      follow-up, and photos of the finished work. One organised point of contact instead of scattered
                      messages.
                    </p>
                  </div>
                </div>
                <div>
                  <Mono className="mb-3.5">Need someone new? Example: an overgrown garden</Mono>
                  <ol className="m-0 list-none border-l-2 border-ink p-0">
                    {tradeSteps.map((s) => (
                      <li key={s.h} className="relative pb-[18px] pl-[26px]">
                        <span
                          className="absolute top-0.5 -left-[9px] box-border size-4 rounded-full border-2 border-ink"
                          style={{ background: s.c }}
                        />
                        <p className="m-0 mb-[3px] text-base font-extrabold">{s.h}</p>
                        <p className="m-0 text-sm leading-[1.55] text-body">{s.t}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="pb-[72px]">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <h3 className="m-0 text-[28px] font-extrabold tracking-[-0.6px]">You compare. You choose. We book.</h3>
                <Mono className="text-muted">Try it: pick a quote</Mono>
              </div>
              <QuoteChooser />
              <p className="m-0 mt-4 text-[13px] leading-normal text-muted">Illustrative layout with placeholder values.</p>
            </div>

            <div className="pb-[72px]">
              <Mono className="mb-4">Checked before anyone’s booked</Mono>
              <div className="grid grid-cols-1 overflow-hidden rounded-md border border-ink sm:grid-cols-2 md:grid-cols-5">
                {tradeChecks.map((c) => (
                  <div key={c.h} className="border-r border-b border-[#D9D4CB] p-5">
                    <p className="m-0 mb-1.5 text-base font-extrabold">{c.h}</p>
                    <p className="m-0 text-sm leading-normal text-body">{c.t}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pb-[72px]">
              <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.5fr)] md:gap-12">
                <div>
                  <Mono className="mb-2.5 text-brand">How we prioritise</Mono>
                  <H3 className="mb-3.5">Four levels, one rule: the guest comes first</H3>
                  <div className="rounded-md bg-ink p-5 text-sm leading-[1.6] text-white">
                    <span className={cn(mono, "text-coral-200")}>Outside our hours</span>
                    <br />
                    Your guidebook gives guests 999, the gas emergency line (0800 111 999) and your emergency contact.
                    Overnight reports are picked up first thing the next working morning.
                  </div>
                </div>
                <div className="grid gap-2.5">
                  {triage.map((t) => (
                    <div key={t.lvl} className="grid grid-cols-[10px_minmax(0,1fr)] overflow-hidden rounded-md border border-ink">
                      <span style={{ background: t.c }} />
                      <div className="grid grid-cols-1 gap-x-6 gap-y-2 px-5 py-[18px] md:grid-cols-2">
                        <span>
                          <span className={mono} style={{ color: t.tc }}>
                            {t.lvl}
                          </span>
                          <span className="mt-1 block text-sm leading-normal text-body">{t.ex}</span>
                        </span>
                        <span className="text-[15px] leading-normal font-semibold">{t.aim}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pb-[88px]">
              <div className={two}>
                <div>
                  <Mono className="mb-2.5 text-brand">Every job logged</Mono>
                  <h3 className="m-0 mb-4 text-[26px] font-extrabold tracking-[-0.6px]">A full history of your property</h3>
                  <div className="overflow-x-auto rounded-md border border-ink bg-white">
                    <table className="w-full min-w-[460px] border-collapse text-[13px]">
                      <thead>
                        <tr>
                          {["Date", "Issue", "Fixed by", "Proof"].map((h) => (
                            <th key={h} className={cn(mono, "border-b border-ink px-3.5 py-3 text-left text-[11px]")}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((j) => (
                          <tr key={j.d + j.i}>
                            <td className="border-b border-[#EDE8DF] px-3.5 py-3 font-mono">{j.d}</td>
                            <td className="border-b border-[#EDE8DF] px-3.5 py-3">{j.i}</td>
                            <td className="border-b border-[#EDE8DF] px-3.5 py-3">{j.f}</td>
                            <td className="border-b border-[#EDE8DF] px-3.5 py-3 font-bold text-green">{j.p}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
                    Example entries. Each job keeps the date, problem, who fixed it, before and after photos, and the
                    invoice.
                  </p>
                </div>
                <div>
                  <Mono className="mb-2.5 text-brand">Safety and compliance reminders</Mono>
                  <h3 className="m-0 mb-4 text-[26px] font-extrabold tracking-[-0.6px]">Your property’s year, on one calendar</h3>
                  <div className="rounded-md border border-ink bg-white p-[18px]">
                    <div className="mb-3 grid grid-cols-12 gap-1" aria-hidden="true">
                      {year.map((m) => (
                        <div key={m.m} className="text-center">
                          <span className={cn(mono, "text-[10px] text-muted")}>{m.m.slice(0, 1)}</span>
                          <div className="mt-1.5 box-border flex h-16 flex-col justify-end gap-[3px] rounded-[3px] bg-[#F5F2EC] px-[3px] py-1">
                            {m.marks.map((k, i) => (
                              <span key={i} className="h-2 rounded-sm" style={{ background: k }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <ul className="m-0 grid list-none gap-1.5 p-0 text-[13px]">
                      {legend.map((l) => (
                        <li key={l.h} className="flex items-center gap-2">
                          <span className="h-2 w-3.5 flex-none rounded-sm" style={{ background: l.c }} />
                          <span>
                            <strong>{l.h}</strong> {l.t}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
                    Example calendar. HSE guidance for holiday accommodation: display the gas safety record for stays under
                    28 days. A reminder service, not legal advice.
                  </p>
                  {isToolLive(certSlug) && (
                    <Link href={toolBySlug(certSlug)!.href!} className="mt-4 inline-flex min-h-11 items-center text-[15px] font-bold text-brand">
                      Build your own certificate reminders, free →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHO DOES WHAT */}
        <section id="who-does-what" className="bg-ink text-white">
          <div className={cn(W, sec)}>
            <Mono className="mb-3 text-coral-200">Who does what</Mono>
            <h2 className="m-0 mb-9 text-[30px] leading-[1.12] font-extrabold tracking-[-1.2px] text-white md:text-[40px]">Clear lanes, no surprises</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {lanes.map((l) => (
                <div
                  key={l.h}
                  className={cn(
                    "rounded-md border p-6",
                    l.tone === "coral" && "border-coral bg-coral text-ink",
                    l.tone === "white" && "border-white bg-white text-ink",
                    l.tone === "outline" && "border-night-field-line bg-transparent text-white",
                  )}
                >
                  <Mono className="mb-4">{l.h}</Mono>
                  {l.items.map((i) => (
                    <p
                      key={i}
                      className={cn(
                        "m-0 mb-3 border-b border-dashed pb-3 text-[15px] leading-normal",
                        l.tone === "coral" ? "border-ink/35" : l.tone === "white" ? "border-[#D9D4CB]" : "border-night-field-line",
                      )}
                    >
                      {i}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-6 rounded-md border border-coral p-6">
              <span className="text-[52px] font-extrabold tracking-[-2px] text-coral-200">£[X]</span>
              <p className="m-0 flex-[1_1_420px] text-base leading-[1.6] text-[#E4E9ED]">
                <strong className="text-white">Your spending limit.</strong> Urgent repairs under it can go ahead without
                waiting for your reply. Anything above it always comes to you first.
              </p>
            </div>
          </div>
        </section>

        {/* PROCESS + HONEST + PROOF */}
        <section id="process">
          <div className={cn(W, sec, two)}>
            <div>
              <Mono className="mb-3 text-brand">How it works</Mono>
              <h2 className="m-0 mb-6 text-[30px] leading-[1.12] font-extrabold tracking-[-1.2px] md:text-[40px]">Five steps to hand it over</h2>
              <ol className="m-0 list-none p-0">
                {steps.map((s) => (
                  <li key={s.n} className="grid grid-cols-[54px_minmax(0,1fr)] gap-3 border-t border-ink py-4">
                    <span className="text-[26px] font-extrabold text-coral">{s.n}</span>
                    <span>
                      <strong className="mb-[3px] block text-base">{s.h}</strong>
                      <span className="text-[15px] leading-[1.55] text-body">{s.t}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="grid gap-4">
              <div className="rounded-md border border-ink bg-white p-[26px]">
                <Mono className="mb-3.5">What to expect, honestly</Mono>
                {honest.map((h) => (
                  <p key={h.b} className="m-0 mb-3 text-[15px] leading-[1.55] text-ink-copy">
                    <strong className="text-ink">{h.b}</strong> {h.t}
                  </p>
                ))}
              </div>
              <div className="rounded-md border border-ink bg-coral-50 p-[26px]">
                <Mono className="mb-3.5">Proof</Mono>
                {proof.map((p) => (
                  <div key={p.k} className="flex justify-between gap-3 border-b border-[#F0C9C9] py-2.5 text-[15px]">
                    <span>{p.k}</span>
                    <strong>{p.v}</strong>
                  </div>
                ))}
                <p className="m-0 mt-3 text-[13px] text-muted">
                  Real data only: job log extracts, before/after repair photos, anonymised quote comparisons.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RUN PACKAGE */}
        <section id="call" className="border-y border-ink bg-coral">
          <div className={cn(W, "flex flex-wrap items-center justify-between gap-7 py-14")}>
            <div className="flex-[1_1_520px]">
              <Mono className="mb-2.5">Included in the Run package</Mono>
              <h2 className="m-0 mb-2 text-[28px] leading-[1.1] font-extrabold tracking-[-1px] md:text-[34px]">{packageCta.title}</h2>
              <p className="m-0 text-base leading-[1.6] font-medium">{packageCta.text}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <SmartLink href={brand.links.bookCall} className={cn(btnBase, "btn-ink")}>
                Book a 20-minute call
              </SmartLink>
              <SmartLink href={checklistHref} className={btnOutline}>
                Free maintenance checklist
              </SmartLink>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className={cn(W, sec)}>
            <FaqFilter />
            <p className="m-0 mt-7 text-[13px] leading-[1.7] text-muted">
              <strong className="text-ink-copy">Sources:</strong> {sources} {reviewedBy("November 2026")} Not affiliated
              with Airbnb or any company listed on this page.
            </p>
          </div>
        </section>
      </ServiceTocLayout>
    </div>
  );
}
