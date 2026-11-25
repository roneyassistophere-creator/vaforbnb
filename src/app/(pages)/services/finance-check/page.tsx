import Link from "next/link";
import { isToolLive, toolBySlug } from "@/content/tools/catalog";
import { toolPath as profitPath, toolSlug as profitSlug } from "@/content/tools/profitId";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import { reviewedBy } from "@/components/service/ServiceBlocks";
import { BreakEven, FaqMasterDetail, ReportSwitcher, SheetPreview } from "./_components/Interactive";
import {
  changes,
  checks,
  cycle,
  dataCare,
  fall,
  fixCosts,
  honest,
  incomeFields,
  packageCta,
  receive,
  sheetTabs,
  sources,
  toc,
  varCosts,
} from "./content";
import { TocNav } from "@/components/service/ServiceToc";
import { seo } from "./seo";

const W = "mx-auto box-border max-w-[1240px] px-4 md:px-7";
const sheet = brand.downloads.financeSheet;
const sheetGoogle = brand.downloads.financeSheetGoogle;

function K({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 mb-3 text-xs font-extrabold tracking-[1.4px] text-brand uppercase", className)}>{children}</p>;
}

function H2({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("m-0 mb-3.5 text-[28px] leading-[1.15] font-extrabold tracking-[-1px] md:text-[34px]", className)}>{children}</h2>;
}

function Block({ id, children, last }: { id: string; children: ReactNode; last?: boolean }) {
  return (
    <section id={id} className={cn("py-12 md:py-16", !last && "border-b border-line")}>
      {children}
    </section>
  );
}

function DownloadIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FinanceCheckPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-sand">
        <div className={cn(W, "grid grid-cols-1 items-center gap-12 py-16 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]")}>
          <div>
            <Breadcrumbs seo={seo} className="mb-[18px]" />
            <h1 className="m-0 mb-[22px] text-[40px] leading-[1.05] font-extrabold tracking-[-2px] md:text-[54px]">
              Know exactly what each property earned, or lost, this month.
            </h1>
            <p className="m-0 mb-7 text-[17px] leading-[1.7] text-ink-copy">
              Every month our team builds a profit and loss report for each of your properties: every booking{" "}
              <strong className="text-ink">after OTA commission and fees</strong>, direct bookings, and every cost from
              each clean to your mortgage, energy bills and council tax. One clear number per property, and the reasons
              behind it.
            </p>
            <div className="flex flex-wrap gap-3">
              {isToolLive(profitSlug) && (
                <Link href={profitPath} className="btn btn-coral rounded-[10px]" data-profit-link>
                  Work out your real profit
                </Link>
              )}
              <a href="#download" className="btn btn-ink rounded-[10px]">
                <DownloadIcon color="#FFFFFF" />
                Download the free sheet
              </a>
              <SmartLink href={brand.links.bookCall} className="btn btn-outline rounded-[10px] border-[1.5px]">
                Book a 20-minute call
              </SmartLink>
            </div>
          </div>
          <SheetPreview />
        </div>
      </section>

      {/* DOWNLOAD STRIP */}
      <section className="bg-coral">
        <div className={cn(W, "flex flex-wrap items-center justify-between gap-4 py-[18px]")}>
          <p className="m-0 text-base font-bold text-ink">
            Free: the Short-Let Monthly Finance Sheet. Excel and Google Sheets. Up to 5 properties.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <SmartLink href={sheet} className="btn btn-ink min-h-[44px] rounded-[10px]">
              Download (.xlsx)
            </SmartLink>
            {sheetGoogle && (
              <SmartLink href={sheetGoogle} className="btn btn-white min-h-[44px] rounded-[10px]">
                Open in Google Sheets
              </SmartLink>
            )}
          </div>
        </div>
      </section>

      {/* BODY WITH SIDEBAR */}
      <div className={cn(W, "flex flex-wrap gap-12 pt-6")}>
        <aside className="flex-[0_1_250px] pt-10 max-md:hidden">
          <div className="sticky top-6">
            <p className="m-0 mb-2.5 ml-3 text-xs font-extrabold tracking-[1.2px] text-muted">ON THIS PAGE</p>
            <TocNav items={toc} />
            <div className="mt-6 rounded-[14px] bg-ink p-5 text-white">
              <p className="m-0 mb-1.5 text-[15px] font-extrabold">Prefer we do it?</p>
              <p className="m-0 mb-3.5 text-[13px] leading-[1.55] text-mist">Your report by the [5th] working day, every month.</p>
              <a href="#call" className="btn btn-coral min-h-[44px] w-full rounded-[10px]">
                Book a call
              </a>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-[999_1_560px]">
          {/* 1 */}
          <Block id="s1">
            <K>01 · Payouts aren’t profit</K>
            <H2>From booking value to what you actually keep</H2>
            <p className="m-0 mb-7 text-base leading-[1.7] text-body">
              A good month of payouts can still be a loss once the mortgage, bills and a repair go out. Here’s the
              example month from our sheet, step by step.
            </p>
            <div className="grid gap-2.5 tabular-nums">
              {fall.map((f) => (
                <div key={f.t} className="grid grid-cols-[120px_minmax(0,1fr)_90px] items-center gap-3.5 md:grid-cols-[200px_minmax(0,1fr)_110px]">
                  <span className="text-sm" style={{ fontWeight: f.fw }}>
                    {f.t}
                  </span>
                  <div className="relative h-[34px] rounded-md bg-[#F5F6F7]" aria-hidden="true">
                    <span className="absolute inset-y-0 rounded-md" style={{ left: f.l, width: f.w, background: f.c }} />
                  </div>
                  <span className="text-right text-[15px] font-extrabold" style={{ color: f.tc }}>
                    {f.v}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-coral-50 px-5 py-[18px] text-[15px] leading-[1.6] text-ink-copy">
              <strong className="text-ink">Fee check:</strong> Airbnb now charges hosts a single 15.5% host-only fee, so a
              £100 night pays out £84.50. Commissions get their own line in our report, so changes like this are obvious.
            </div>
            <p className="m-0 mt-3.5 text-[13px] leading-normal text-muted">
              Source: Airbnb Resource Centre, Simplifying Airbnb service fees (2026). Example figures.
            </p>
          </Block>

          {/* 2 */}
          <Block id="s2">
            <K>02 · What goes into your report</K>
            <H2>Every booking, every cost, against the right property</H2>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-[14px] border border-line p-6">
                <p className="m-0 mb-3.5 text-base font-extrabold">Income, per booking</p>
                {incomeFields.map((i) => (
                  <div key={i.a} className="grid border-t border-[#F0F1F3] py-2.5">
                    <span className="text-sm font-bold">{i.a}</span>
                    <span className="text-[13px] text-muted">{i.b}</span>
                  </div>
                ))}
              </div>
              <div className="grid content-start gap-5">
                <div className="rounded-[14px] border border-line p-6">
                  <p className="m-0 mb-3 text-base font-extrabold">
                    Variable costs <span className="text-[13px] font-semibold text-muted">per stay or job</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {varCosts.map((v) => (
                      <span key={v} className="rounded-full bg-coral-50 px-3 py-[7px] text-[13px] font-bold">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[14px] border border-line p-6">
                  <p className="m-0 mb-3 text-base font-extrabold">
                    Fixed costs <span className="text-[13px] font-semibold text-muted">every month</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {fixCosts.map((v) => (
                      <span key={v} className="rounded-full bg-steel-100 px-3 py-[7px] text-[13px] font-bold">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="m-0 text-sm leading-[1.6] text-body">
                  Costs shared by all your properties, like a pricing tool, sit in their own “shared” column so each
                  property’s result stays accurate.
                </p>
              </div>
            </div>
          </Block>

          {/* 3 */}
          <Block id="s3">
            <K>03 · A sample monthly report</K>
            <ReportSwitcher />
            <p className="m-0 mt-3.5 text-[13px] leading-normal text-muted">Illustrative figures matching the example rows in the free sheet.</p>
          </Block>

          {/* 4 */}
          <Block id="s4">
            <K>04 · Extra checks most hosts miss</K>
            <H2 className="mb-6">Beyond profit and loss</H2>
            <div className="grid grid-cols-1 border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3">
              {checks.map((c) => (
                <div key={c.h} className="border-r border-b border-line p-5">
                  <p className="m-0 mb-1.5 text-[15px] font-extrabold">{c.h}</p>
                  <p className="m-0 text-sm leading-[1.55] text-body">{c.t}</p>
                </div>
              ))}
            </div>
          </Block>

          {/* 5 */}
          <Block id="s5">
            <K>05 · Break-even nights</K>
            <H2>How many nights do you need to cover your costs?</H2>
            <p className="m-0 mb-6 text-base leading-[1.7] text-body">Try it with your own numbers. Every night after break-even is profit.</p>
            <BreakEven />
            <p className="m-0 mt-[18px] text-[15px] leading-[1.6] text-ink-copy">
              <strong className="text-ink">Why it matters:</strong> our pricing team uses your break-even point and
              profit per night to decide when to hold a price, and when a lower price still makes money.
            </p>
          </Block>

          {/* 6 */}
          <Block id="s6">
            <K>06 · UK changes to know about</K>
            <H2 className="mb-7">What’s changed for short-let finances</H2>
            <ol className="relative m-0 list-none border-l-2 border-ink py-0 pr-0 pl-7">
              {changes.map((c) => (
                <li key={c.h} className="relative pb-7">
                  <span
                    className="absolute top-0.5 -left-[38px] size-[18px] rounded-full border-[3px] border-white shadow-[0_0_0_2px_#14212B]"
                    style={{ background: c.dot }}
                  />
                  <p className="m-0 mb-1 text-[13px] font-extrabold text-brand">{c.d}</p>
                  <p className="m-0 mb-1.5 text-lg font-extrabold">{c.h}</p>
                  <p className="m-0 mb-1.5 text-[15px] leading-[1.6] text-ink-copy">{c.t}</p>
                  <p className="m-0 text-xs text-muted">Source: {c.s}</p>
                  {c.tool && isToolLive(c.tool) && (
                    <Link href={toolBySlug(c.tool)!.href!} className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-brand">
                      Check if your holiday let qualifies →
                    </Link>
                  )}
                </li>
              ))}
            </ol>
            <div className="rounded-xl bg-sand px-5 py-[18px] text-[15px] leading-[1.6] text-ink-copy">
              We keep your records clean and ready for your accountant.{" "}
              <strong className="text-ink">We’re not accountants, and this isn’t tax advice.</strong>
            </div>
          </Block>

          {/* 7 */}
          <Block id="s7">
            <K>07 · How it works each month</K>
            <H2 className="mb-6">Your month, closed and reported</H2>
            <ol className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-5">
              {cycle.map((c) => (
                <li
                  key={c.h}
                  className="flex min-h-[170px] flex-col justify-between gap-3 rounded-[14px] p-5"
                  style={{ background: c.bg, color: c.fg }}
                >
                  <span className="text-xs font-extrabold tracking-[1px] uppercase opacity-85">{c.when}</span>
                  <span>
                    <strong className="mb-1 block text-[17px]">{c.h}</strong>
                    <span className="text-[13px] leading-normal">{c.t}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Block>

          {/* 8 */}
          <Block id="s8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <K>08 · What you receive</K>
                <ul className="m-0 list-none p-0">
                  {receive.map((r) => (
                    <li key={r} className="flex gap-3 border-b border-[#F0F1F3] py-3 text-[15px] leading-normal">
                      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="mt-px flex-none">
                        <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#B8383A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[14px] bg-fog p-6">
                <K className="text-ink">Your data, handled carefully</K>
                {dataCare.map((d) => (
                  <div key={d.h} className="flex gap-3 py-2.5">
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
                      <rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="#14212B" strokeWidth="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#14212B" strokeWidth="2" />
                    </svg>
                    <span className="text-[15px] leading-normal">
                      <strong>{d.h}</strong> {d.t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Block>

          {/* 9 */}
          <Block id="s9" last>
            <K>09 · What to expect, honestly</K>
            <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {honest.map((h) => (
                <div key={h.b} className="border-t-[3px] border-ink pt-3.5">
                  <p className="m-0 mb-1.5 text-[15px] font-extrabold">{h.b}</p>
                  <p className="m-0 text-sm leading-[1.55] text-body">{h.t}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[14px] border-2 border-dashed border-line-strong p-[22px] text-sm leading-[1.6] text-body">
              <strong className="text-ink">Proof:</strong> [anonymised monthly report screenshot] · [client quote about
              finally knowing their real profit]. Real data only.
            </div>
          </Block>
        </div>
      </div>

      {/* BIG DOWNLOAD PANEL */}
      <section id="download" className="bg-ink text-white">
        <div className={cn(W, "grid grid-cols-1 items-center gap-12 py-20 md:grid-cols-2")}>
          <div>
            <K className="text-coral-200">Free download</K>
            <h2 className="m-0 mb-3.5 text-[32px] leading-[1.1] font-extrabold tracking-[-1.2px] md:text-[40px]">
              The Short-Let Monthly Finance Sheet
            </h2>
            <p className="m-0 mb-6 text-base leading-[1.7] text-mist">
              The same sheet our team uses. Log bookings and costs per property and it works out your profit or loss,
              occupancy, average nightly rate, commission costs and channel mix for any month, plus a year overview with
              a chart.
            </p>
            <div className="mb-[18px] flex flex-wrap gap-3">
              <SmartLink href={sheet} className="btn btn-coral rounded-[10px]">
                <DownloadIcon color="#14212B" />
                Download (.xlsx)
              </SmartLink>
              {sheetGoogle && (
                <SmartLink
                  href={sheetGoogle}
                  className="btn rounded-[10px] border-[1.5px] border-[#4A5A66] bg-transparent text-white hover:text-white"
                >
                  Open in Google Sheets
                </SmartLink>
              )}
            </div>
            <p className="m-0 text-[13px] text-faint">Free. No sign-up needed. Not tax advice.</p>
          </div>
          <ol className="m-0 grid list-none gap-2 p-0">
            {sheetTabs.map((s) => (
              <li key={s.n} className="grid grid-cols-[46px_minmax(0,1fr)] items-center gap-3.5 rounded-xl bg-night-field px-4 py-3.5">
                <span
                  className="flex size-[46px] items-center justify-center rounded-[10px] font-extrabold text-ink"
                  style={{ background: s.c }}
                >
                  {s.n}
                </span>
                <span>
                  <strong className="block text-[15px]">{s.h}</strong>
                  <span className="text-[13px] text-mist">{s.t}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* RUN */}
      <section id="call" className="bg-sand">
        <div className={cn(W, "flex flex-wrap items-center justify-between gap-7 py-14")}>
          <div className="flex-[1_1_520px]">
            <K>Included in the Run package</K>
            <h2 className="m-0 mb-2 text-[26px] font-extrabold tracking-[-0.8px] md:text-[30px]">{packageCta.title}</h2>
            <p className="m-0 text-base leading-[1.6] text-body">{packageCta.text}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SmartLink href={brand.links.bookCall} className="btn btn-ink rounded-[10px]">
              Book a 20-minute call
            </SmartLink>
            <a href="#download" className="btn btn-outline rounded-[10px] border-[1.5px]">
              Free finance sheet
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className={cn(W, "py-20")}>
          <K>FAQ</K>
          <H2 className="mb-7">Questions hosts ask</H2>
          <FaqMasterDetail />
          <p className="m-0 mt-10 text-[13px] leading-[1.7] text-muted">
            <strong className="text-ink-copy">Sources:</strong> {sources} {reviewedBy("November 2026")} Not accountants;
            nothing on this page is tax advice.
          </p>
        </div>
      </section>
    </>
  );
}
