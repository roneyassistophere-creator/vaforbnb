import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import { AiSimulator, AuditForm, ReadinessCheck } from "./_components/Interactive";
import {
  amenities,
  auditItems,
  competitorChecks,
  cover,
  descSteps,
  events,
  facts,
  faq,
  funnel,
  guestFavourite,
  honest,
  included,
  keyPoints,
  launched,
  longStayGuests,
  oldNew,
  packageCta,
  photoMistakes,
  photoTour,
  platforms,
  process,
  proof,
  ranking,
  related,
  rules8,
  sidebarCta,
  sidebarToc,
  sources,
  struggle,
  titles,
  toc,
  topFive,
} from "./content";
import { seo } from "./seo";
import { ServiceTocLayout } from "@/components/service/ServiceToc";

const W = "mx-auto box-border max-w-[1160px] px-4 md:px-6";
const sec = "py-16 md:py-24";
const split = "grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-14";
const card = "box-border rounded-2xl border border-line bg-white p-6";
const pill = "btn min-h-12 rounded-full px-[22px]";
const pillOutline = "btn min-h-12 rounded-full border-[1.5px] border-ink bg-transparent px-[22px] text-ink hover:bg-ink hover:text-white";

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 mb-3.5 text-[13px] font-bold tracking-[1.4px] text-brand uppercase", className)}>{children}</p>;
}

function H2({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("m-0 mb-4 text-[30px] leading-[1.15] font-extrabold tracking-[-1.2px] md:text-[40px]", className)}>{children}</h2>;
}

function H3({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("m-0 mb-5 text-[26px] font-extrabold tracking-[-0.6px]", className)}>{children}</h3>;
}

function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 max-w-[720px] text-lg leading-[1.65] text-body", className)}>{children}</p>;
}

function Src({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 mt-3.5 text-[13px] leading-normal text-muted", className)}>{children}</p>;
}

function Row({ k, children }: { k: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1.5 border-t border-line py-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] md:gap-4">
      <span className="text-[15px] font-bold">{k}</span>
      {children}
    </div>
  );
}

function PinkCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 flex-none">
      <circle cx="12" cy="12" r="11" fill="#FDECEC" />
      <path d="M7 12.5l3 3 7-7" fill="none" stroke="#B8383A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="flex-none transition-transform group-open:rotate-45">
      <path d="M12 5v14M5 12h14" stroke="#14212B" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function ListingOptimisationPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-sand">
        <div className={cn(W, "pt-7 pb-[88px]")}>
          <Breadcrumbs seo={seo} className="mb-12" />
          <div className={cn(split, "items-center")}>
            <div>
              <Eyebrow>Service · Part of the Run package</Eyebrow>
              <h1 className="m-0 mb-6 text-[40px] leading-[1.06] font-extrabold tracking-[-2px] md:text-[56px]">
                Airbnb listing optimisation for UK hosts, <span className="text-brand">ready for AI search</span>
              </h1>
              <p className="m-0 mb-8 text-lg leading-[1.7] text-ink-copy">
                <strong className="text-ink">The short answer:</strong> Airbnb’s new AI search lets guests describe what
                they need, like “a quiet flat near the station with a desk”. It’s starting in the US. Listings with
                clear, specific, consistent facts are easiest to match; vague ones risk being skipped. We make every part
                of your listing work harder: the cover photo that earns the click, the photo order, a title under 50
                characters, a description that answers guests’ questions, accurate amenities, longer-stay settings and
                timely event updates. No one can guarantee rankings, but a well-built listing gives every visitor the best
                reason to book.
              </p>
              <div className="mb-8 flex flex-wrap gap-3">
                <a href="#audit" className={cn(pill, "btn-coral")}>
                  Get a free AI-readiness audit
                </a>
                <a href="#ai" className={pillOutline}>
                  What AI search changes
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-body">
                <div className="flex size-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-white" aria-hidden="true">
                  {brand.team.founder.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <span>
                  Reviewed by <strong className="text-ink">{brand.team.founder.name}</strong>, {brand.team.founder.role} · Updated
                  November 2026
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[22px] bg-white p-5 shadow-[0_24px_60px_rgba(20,33,43,0.10)]">
                <div className="mb-3.5 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-muted">How guests see you in search</span>
                  <span className="rounded-full bg-coral-50 px-2.5 py-1.5 text-xs font-bold text-brand-deep">Example</span>
                </div>
                <div className="relative flex h-[230px] items-end overflow-hidden rounded-[14px] bg-[#DCE4E8]" aria-hidden="true">
                  <div className="absolute inset-x-0 bottom-0 h-[90px] bg-[#9FB4BF]" />
                  <div className="absolute inset-x-0 bottom-0 h-[34px] bg-[#7D98A6]" />
                  <div className="absolute bottom-[60px] left-10 h-[120px] w-[150px] rounded bg-sand" />
                  <div className="absolute bottom-[120px] left-[58px] size-10 bg-[#BFD3DC]" />
                  <div className="absolute bottom-[120px] left-[112px] size-10 bg-[#BFD3DC]" />
                  <div className="absolute bottom-[60px] left-[220px] h-[150px] w-[120px] rounded bg-[#EDE6DA]" />
                  <span className="relative m-3.5 rounded-full bg-white px-2.5 py-1.5 text-xs font-bold text-ink">
                    Cover photo: the canal view, not the hallway
                  </span>
                </div>
                <div className="px-1 pt-[18px] pb-1">
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="text-[11px] font-extrabold tracking-[1px] text-muted">BEFORE</span>
                    <span className="text-[15px] text-muted line-through">Lovely 2 Bed Flat in Manchester</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[11px] font-extrabold tracking-[1px] text-brand-deep">AFTER</span>
                    <span className="text-[17px] font-bold">Canal-view flat · free parking · fast Wi-Fi</span>
                    <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green">42 / 50</span>
                  </div>
                  <div className="mt-3.5 flex items-start gap-2.5 rounded-xl bg-[#F5F3FA] px-3.5 py-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="mt-px flex-none">
                      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="#5B3FA0" />
                    </svg>
                    <span className="text-[13px] leading-normal text-[#2E2650]">
                      <strong>AI summary (how AI search may describe you):</strong> quiet top-floor flat · desk + 300 Mbps
                      Wi-Fi · 4-min walk to Piccadilly · free parking
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY POINTS */}
      <section className="bg-sand">
        <div className={cn(W, "pb-16")}>
          <div className="rounded-3xl bg-white px-6 py-8 shadow-[0_20px_50px_rgba(20,33,43,0.08)] md:px-9">
            <div className="mb-[22px] flex flex-wrap items-center justify-between gap-4">
              <Eyebrow className="m-0">Key points · 10-second read</Eyebrow>
              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet">Airbnb 2026 Fall Update</span>
            </div>
            <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 md:grid-cols-5">
              {keyPoints.map((k, i) => (
                <div key={k}>
                  <p className="m-0 mb-2 text-[28px] font-extrabold tracking-[-1px] text-coral">{String(i + 1).padStart(2, "0")}</p>
                  <p className="m-0 text-[15px] leading-[1.55] text-ink-copy">{k}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FACTS STRIP */}
      <section className="bg-ink text-white">
        <div className={cn(W, "py-11")}>
          <p className="m-0 mb-[22px] text-[13px] font-bold tracking-[1.4px] text-coral-200 uppercase">Airbnb’s own numbers, in one place</p>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-4">
            {facts.map((f) => (
              <div key={f.n} className="border-l-2 border-coral pl-[18px]">
                <div className="text-4xl font-extrabold tracking-[-1px] text-white">{f.n}</div>
                <div className="text-[15px] leading-normal text-mist">{f.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceTocLayout items={sidebarToc} cta={sidebarCta}>
        {/* AI SEARCH */}
        <section id="ai" className={sec}>
          <div className={W}>
            <div className={cn(split, "mb-10 items-end")}>
              <div>
                <Eyebrow className="text-violet">New · AI search</Eyebrow>
                <H2>Airbnb’s AI search is changing how guests find listings</H2>
              </div>
              <Lead>
                Guests can now{" "}
                <strong className="text-ink">“search across homes, experiences, and services using your own words or voice.”</strong>{" "}
                It’s starting in the US. Airbnb hasn’t announced a UK date, and we won’t guess one, but hosts who prepare now
                will be ready on day one.
              </Lead>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-5">
              {launched.map((l) => (
                <div key={l.k} className={cn("rounded-[18px] p-[22px]", l.violet ? "bg-violet-50" : "bg-sand")}>
                  <p className="m-0 mb-2.5 text-xs font-extrabold tracking-[1px] text-violet">{l.k}</p>
                  <p className="m-0 mb-2.5 text-[15px] leading-normal font-bold">{l.h}</p>
                  <p className="m-0 text-sm leading-[1.55] text-body">{l.t}</p>
                </div>
              ))}
            </div>
            <Src>Sources: Airbnb Newsroom, Airbnb 2026 Fall Update (30 September 2026); Skift, 30 September 2026 (US-only availability).</Src>

            <AiSimulator />

            {/* old vs new */}
            <div className={cn(split, "mt-16")}>
              <div>
                <Eyebrow>Old search vs AI search</Eyebrow>
                <H3>The search pattern is changing</H3>
                {oldNew.map((o) => (
                  <Row key={o.k} k={<span className="text-sm font-extrabold">{o.k}</span>}>
                    <span className="text-sm leading-[1.55] text-body">
                      <span className="mb-1 block text-muted line-through decoration-line-strong">{o.a}</span>
                      <span className="font-semibold text-ink">{o.b}</span>
                    </span>
                  </Row>
                ))}
                <div className="mt-5 rounded-[14px] bg-violet-50 px-5 py-[18px] text-[15px] leading-[1.6] text-[#2E2650]">
                  <strong>An honest note:</strong> Airbnb hasn’t published exactly how AI search ranks or matches listings.
                  What’s certain: an AI can only match, summarise and compare the information your listing gives it. That’s
                  what we optimise for, and we’ll update this page as Airbnb shares more.
                </div>
              </div>
              <div>
                <Eyebrow>Who will struggle</Eyebrow>
                <H3>Five listing habits that won’t survive AI search</H3>
                {struggle.map((w) => (
                  <div key={w.b} className="flex gap-3.5 border-t border-line py-3.5">
                    <span className="flex size-[26px] flex-none items-center justify-center rounded-lg bg-coral-50 text-sm font-extrabold text-brand" aria-hidden="true">
                      ×
                    </span>
                    <p className="m-0 text-[15px] leading-[1.55] text-ink-copy">
                      <strong className="text-ink">{w.b}</strong> {w.t}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 8 rules */}
            <div className="mt-[72px]">
              <Eyebrow>Our 8 rules for an AI-ready listing</Eyebrow>
              <h3 className="m-0 mb-6 text-[30px] font-extrabold tracking-[-0.8px]">Write for people. Make it readable for AI.</h3>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-4">
                {rules8.map((r, i) => (
                  <div key={r.h} className={cn(card, "rounded-[18px]")}>
                    <p className="m-0 mb-2.5 text-[13px] font-extrabold text-violet">RULE {i + 1}</p>
                    <p className="m-0 mb-2 text-[17px] leading-[1.3] font-extrabold">{r.h}</p>
                    <p className="m-0 text-sm leading-[1.55] text-body">{r.t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* before/after + checklist */}
            <div className={cn(split, "mt-[72px]")}>
              <div>
                <Eyebrow>Before and after</Eyebrow>
                <H3>Same flat. One version AI can match.</H3>
                <div className="mb-3 rounded-[18px] bg-[#F5F6F7] p-[22px]">
                  <p className="m-0 mb-2 text-xs font-extrabold tracking-[1px] text-muted">BEFORE · VAGUE</p>
                  <p className="m-0 text-base leading-[1.65] text-muted">
                    Cosy flat in a great location, close to everything. Perfect for business or leisure. Fast Wi-Fi and
                    parking available.
                  </p>
                </div>
                <div className="rounded-[18px] bg-coral-50 p-[22px]">
                  <p className="m-0 mb-2 text-xs font-extrabold tracking-[1px] text-brand-deep">AFTER · AI-READY, STILL HUMAN</p>
                  <p className="m-0 text-base leading-[1.65] text-ink">
                    Quiet top-floor flat with double glazing, a 12-minute walk to [Station name]. A proper desk (120 cm) with
                    300 Mbps Wi-Fi, a king bed with blackout blinds, and free parking for one car. Ideal for work trips and
                    couples.
                  </p>
                </div>
                <Src>Example only (invented property).</Src>
                <div className="mt-5 rounded-2xl border border-dashed border-coral px-[22px] py-5 text-[15px] leading-[1.6] text-ink-copy">
                  <strong className="text-ink">Why prepare before the UK launch?</strong> Rewriting a description is quick.
                  Captioning 30 photos, re-shooting rooms, checking every amenity and fixing contradictions across platforms
                  takes time. Start now and you’re ready the day AI search reaches UK guests.
                </div>
              </div>
              <ReadinessCheck />
            </div>
          </div>
        </section>

        {/* INCLUDED */}
        <section id="included" className={sec}>
          <div className={W}>
            <Eyebrow>What’s included</Eyebrow>
            <H2>Ten areas we audit, fix and maintain</H2>
            <Lead className="mb-11">
              From the first photo guests see in search to the platforms you list on. You approve every change before it
              goes live.
            </Lead>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {included.map((i) => (
                <div key={i.h} className={cn(card, "flex items-start gap-4")}>
                  <div className="flex size-10 flex-none items-center justify-center rounded-xl bg-coral-50 text-sm font-extrabold text-brand">{i.n}</div>
                  <div>
                    <h3 className="m-0 mt-0.5 mb-1.5 text-[17px] font-bold">{i.h}</h3>
                    <p className="m-0 text-[15px] leading-[1.55] text-body">{i.t}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ON THIS PAGE */}
        <nav aria-label="On this page" className="bg-sand toc:hidden">
          <div className={cn(W, "flex flex-wrap items-center gap-3 py-8")}>
            <span className="mr-1.5 text-sm font-bold text-body">On this page</span>
            {toc.map((t) => (
              <a
                key={t.href}
                href={t.href}
                className="inline-flex min-h-9 items-center rounded-full border border-line bg-white px-3.5 text-sm font-semibold text-ink no-underline hover:border-coral hover:text-ink"
              >
                {t.label}
              </a>
            ))}
          </div>
        </nav>

        {/* DIAGNOSE */}
        <section id="diagnose" className={sec}>
          <div className={W}>
            <Eyebrow>Step one</Eyebrow>
            <H2>Diagnose before you change anything</H2>
            <Lead className="mb-12">
              Most hosts react to slow bookings by dropping the price. Airbnb’s performance data splits the guest journey
              into stages, and each stage points to a different fix.
            </Lead>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {funnel.map((s, i) => (
                <div key={s.h} className={cn(card, "p-7")}>
                  <div className="mb-[22px] h-2 overflow-hidden rounded bg-fog-2" aria-hidden="true">
                    <div className="h-2 bg-coral" style={{ width: s.w }} />
                  </div>
                  <p className="m-0 mb-1 text-[13px] font-bold text-muted">Stage {i + 1}</p>
                  <h3 className="m-0 mb-2.5 text-xl font-extrabold">{s.h}</h3>
                  <p className="m-0 mb-[18px] text-[15px] leading-[1.55] text-body">{s.t}</p>
                  <p className="m-0 text-sm leading-[1.55]">
                    <strong>If weak, look at:</strong> {s.fix}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-ink p-7 text-white">
                <div className="text-[56px] leading-none font-extrabold tracking-[-2px] text-coral-200">1 in 47</div>
                <div className="flex-[1_1_220px]">
                  <p className="m-0 mb-1.5 text-base font-bold">first-page search impressions turns into a booking</p>
                  <p className="m-0 text-[13px] leading-normal text-mist">
                    Median across 24,000+ US listings, Uplisting and IntelliHost, May 2026. A guide, not a UK benchmark.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-coral-50 p-7">
                <p className="m-0 mb-2 text-base font-extrabold">Our rule: one big change at a time</p>
                <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">
                  Change the cover photo, wait 2 to 3 weeks, compare the data. Change everything at once and you never know
                  what worked.
                </p>
              </div>
            </div>
            <Src>Source: Airbnb Help, Understanding performance data for conversion.</Src>
          </div>
        </section>

        {/* RANKING */}
        <section id="ranking" className={cn(sec, "bg-sand")}>
          <div className={cn(W, split)}>
            <div>
              <Eyebrow>How search works</Eyebrow>
              <H2>What Airbnb says it ranks on</H2>
              <Lead>
                Airbnb publishes its main ranking factors. It says they are not weighted equally, and that{" "}
                <strong className="text-ink">price, quality and popularity</strong> have the strongest influence.
              </Lead>
              <Src>Source: Airbnb Resource Centre, How search works on Airbnb.</Src>
            </div>
            <div className={cn(card, "px-7 py-2")}>
              <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] gap-4 pt-4 pb-3 text-xs font-extrabold tracking-[1px] text-muted md:grid">
                <span>FACTOR</span>
                <span>WHAT WE OPTIMISE</span>
              </div>
              {ranking.map((r) => (
                <Row key={r.f} k={r.f}>
                  <span className="text-[15px] leading-normal text-body">{r.o}</span>
                </Row>
              ))}
            </div>
          </div>
        </section>

        {/* PHOTOS */}
        <section id="photos" className={sec}>
          <div className={W}>
            <Eyebrow>Photos</Eyebrow>
            <H2>Win the click, then win the booking</H2>
            <Lead className="mb-12">
              Your first photo is the big image in search. Your first five make the grid at the top of your listing. Airbnb’s
              advice: “Make sure the first one is amazing.”
            </Lead>
            <div className={cn(split, "items-center")}>
              <div className="grid grid-cols-[2fr_1fr_1fr] grid-rows-[150px_150px] gap-2">
                <div className="row-span-2 flex flex-col justify-between rounded-[16px_6px_6px_16px] bg-ink p-[18px] text-white">
                  <span className="flex size-8 items-center justify-center rounded-full bg-coral font-extrabold text-ink">1</span>
                  <span className="text-base font-bold">Cover: your standout feature</span>
                </div>
                {topFive.map((p) => (
                  <div key={p.n} className="flex flex-col justify-between bg-sand p-3.5" style={{ borderRadius: p.r }}>
                    <span className="flex size-7 items-center justify-center rounded-full bg-white text-[13px] font-extrabold">{p.n}</span>
                    <span className="text-sm font-bold">{p.t}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="m-0 mb-[18px] text-[22px] font-extrabold">The cover photo</h3>
                {cover.map((c) => (
                  <div key={c.b} className="mb-4 flex gap-3">
                    <PinkCheck />
                    <p className="m-0 text-base leading-[1.55] text-ink-copy">
                      <strong className="text-ink">{c.b}</strong> {c.t}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className={cn(card, "p-7")}>
                <h3 className="m-0 mb-4 text-[19px] font-extrabold">Airbnb’s photo tour, done properly</h3>
                {photoTour.map((t) => (
                  <p key={t} className="relative m-0 mb-3 pl-[18px] text-[15px] leading-[1.55] text-ink-copy">
                    <span className="absolute top-[9px] left-0 size-1.5 rounded-full bg-coral" aria-hidden="true" />
                    {t}
                  </p>
                ))}
              </div>
              <div className={cn(card, "bg-[#FAFAFB] p-7")}>
                <h3 className="m-0 mb-4 text-[19px] font-extrabold">Photo mistakes we fix</h3>
                {photoMistakes.map((m) => (
                  <p key={m} className="m-0 mb-3 flex gap-2.5 text-[15px] leading-[1.55] text-ink-copy">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="mt-[3px] flex-none">
                      <path d="M6 6l12 12M18 6L6 18" stroke="#5F6B75" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                    {m}
                  </p>
                ))}
              </div>
            </div>
            <Src>Source: Airbnb Resource Centre, How to organise listing photos into a home tour.</Src>
          </div>
        </section>

        {/* TITLE */}
        <section id="title" className={cn(sec, "bg-sand")}>
          <div className={W}>
            <Eyebrow>Title</Eyebrow>
            <H2>Under 50 characters, front-loaded</H2>
            <Lead className="mb-9">
              Airbnb recommends fewer than 50 characters, because longer titles get cut off. No capitals on every word, no
              emojis, and don’t repeat the city or bed count: search already shows them.
            </Lead>
            <div className="mb-10 flex flex-wrap items-center gap-2.5">
              <span className="rounded-xl bg-ink px-[18px] py-3 text-base font-bold text-white">Standout feature</span>
              <span className="text-[22px] font-extrabold text-brand">+</span>
              <span className="rounded-xl border-[1.5px] border-ink bg-white px-[18px] py-3 text-base font-bold">Who it’s ideal for, or a key benefit</span>
              <span className="text-[22px] font-extrabold text-brand">+</span>
              <span className="rounded-xl border-[1.5px] border-ink bg-white px-[18px] py-3 text-base font-bold">Location hook</span>
            </div>
            <div className={cn(card, "overflow-hidden p-0")}>
              {titles.map((t) => (
                <div key={t.weak} className="grid grid-cols-1 items-center gap-x-6 gap-y-3 border-b border-line-4 px-7 py-[22px] last:border-b-0 md:grid-cols-3">
                  <span className="text-[15px] text-muted line-through">{t.weak}</span>
                  <span className="flex flex-wrap items-center gap-2.5 text-base font-bold">
                    {t.good}
                    <span className="rounded-md bg-green-100 px-2 py-[3px] text-xs font-bold text-green">{t.len}</span>
                  </span>
                  <span className="text-sm leading-normal text-body">{t.why}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">
                <strong className="text-ink">The data:</strong> in a 2026 study of 70,000+ US two-bed listings, titles of 1
                to 20 characters sat about 7% below their area’s median nightly rate. The authors stress it’s a correlation,
                not proof. Use the space you have, wisely.
              </p>
              <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">
                <strong className="text-ink">Seasonal tip:</strong> swap one phrase for an event, like “walk to the Christmas
                market” or “10 min to the racecourse”, then switch back afterwards.
              </p>
            </div>
            <Src>Sources: Airbnb, Guidelines for writing your listing title; IntelliHost, title length study (US data).</Src>
          </div>
        </section>

        {/* DESCRIPTION */}
        <section id="description" className={sec}>
          <div className={cn(W, split)}>
            <div>
              <Eyebrow>Description</Eyebrow>
              <H2>Answer questions before guests ask them</H2>
              <Lead className="mb-8">The main description holds 500 characters, and it’s what most guests read. Sell here; put the detail in the other sections.</Lead>
              <ol className="m-0 list-none p-0">
                {descSteps.map((d, i) => (
                  <li key={d.b} className="mb-[18px] flex items-start gap-4">
                    <span className="flex size-[30px] flex-none items-center justify-center rounded-full border-[1.5px] border-ink text-[13px] font-extrabold">
                      {i + 1}
                    </span>
                    <p className="m-0 mt-[3px] text-base leading-[1.55] text-ink-copy">
                      <strong className="text-ink">{d.b}</strong> {d.t}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <div className="rounded-[20px] bg-white p-7 shadow-[0_18px_48px_rgba(20,33,43,0.08)]">
                <div className="mb-[18px] flex items-center justify-between">
                  <span className="text-[13px] font-bold text-muted">Example description</span>
                  <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green">418 / 500</span>
                </div>
                <p className="m-0 text-base leading-[1.75] text-ink">
                  Wake up to canal views in this bright 2-bed flat, a 4-minute walk from Piccadilly station. Perfect for
                  couples, small families and work trips: a king bed, a sofa bed, a proper desk and 300 Mbps Wi-Fi. Free
                  secure parking for one car, self check-in, and a fully equipped kitchen. Bars and cafes on the doorstep,
                  and the city centre 10 minutes away on foot. Book your dates; we look forward to hosting you.
                </p>
              </div>
              <div className="mt-5 rounded-2xl bg-coral-50 px-6 py-[22px]">
                <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">
                  <strong className="text-ink">Honest note on keywords:</strong> Airbnb matches guests mainly on location,
                  dates, price and filters. Your description drives the decision to book more than your ranking. Write for
                  people first. With AI search (live in the US since the 2026 Fall Update), clear, specific facts matter even
                  more, because they’re what AI can match and summarise. Say the downsides too (stairs, street noise): it
                  protects your accuracy rating.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AMENITIES */}
        <section id="amenities" className={cn(sec, "bg-ink text-white")}>
          <div className={W}>
            <Eyebrow className="text-coral-200">Amenities</Eyebrow>
            <H2 className="text-white">Show up in every filter you qualify for</H2>
            <Lead className="mb-10 text-mist">
              Guests filter by amenities, so one missing tick can hide you from a search. Airbnb’s most-searched amenities
              worldwide in 2025:
            </Lead>
            <ol className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 md:grid-cols-5">
              {amenities.map((a, i) => (
                <li key={a.h} className="rounded-[14px] bg-night-field px-5 py-[18px]">
                  <div className="mb-1.5 flex items-baseline gap-2.5">
                    <span className="text-sm font-extrabold text-coral-200">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[17px] font-bold">{a.h}</span>
                  </div>
                  <p className="m-0 text-sm leading-normal text-mist">{a.t}</p>
                </li>
              ))}
            </ol>
            <p className="m-0 mt-8 text-base leading-[1.6] text-[#E4E9ED]">
              <strong className="text-white">Often missed in UK listings:</strong> dedicated workspace, EV charger, pets
              allowed, travel cot and high chair, garden, step-free access, long-term stays allowed.
            </p>
            <Src className="text-[#AEB9C2]">Source: Airbnb Resource Centre, The amenities guests want (2025 search data).</Src>
          </div>
        </section>

        {/* GUEST FAVOURITES */}
        <section id="favourites" className={sec}>
          <div className={cn(W, split)}>
            <div>
              <Eyebrow>Reviews and badges</Eyebrow>
              <H2>How Guest Favourites are chosen</H2>
              <Lead>
                Airbnb’s Guest Favourite badge goes to its most-loved homes. Top listings can show a top 1%, 5% or 10%
                highlight; the bottom 10% get a label instead.
              </Lead>
              <p className="m-0 mt-6 text-base leading-[1.6] text-ink-copy">
                <strong className="text-ink">Where optimisation helps:</strong> accurate photos protect your accuracy score,
                clear check-in photos protect your check-in score, and honest notes prevent the disappointment behind low
                ratings.
              </p>
              <Src>Source: Airbnb Help, Guest favourites and highlights.</Src>
            </div>
            <div className={cn(card, "p-7")}>
              <p className="m-0 mb-[18px] text-[13px] font-extrabold tracking-[1px] text-muted">WHAT AIRBNB LOOKS AT</p>
              {guestFavourite.map((g) => (
                <div key={g} className="flex gap-3 border-t border-line-4 py-3.5">
                  <PinkCheck />
                  <span className="text-[15px] leading-normal">{g}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LONG STAYS */}
        <section id="longstays" className={cn(sec, "bg-sand")}>
          <div className={W}>
            <Eyebrow>Longer stays</Eyebrow>
            <H2>Fill quiet months and cut turnovers</H2>
            <Lead className="mb-10">Longer bookings mean fewer cleans, fewer empty nights and steadier income.</Lead>
            <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                ["7+ nights", "Weekly discount applies"],
                ["28+ nights", "Monthly discount applies"],
                ["10% or more", "Discounts at this level show in search results"],
              ].map(([h, t]) => (
                <div key={h} className={card}>
                  <div className="text-[32px] font-extrabold tracking-[-1px]">{h}</div>
                  <p className="m-0 mt-1.5 text-[15px] text-body">{t}</p>
                </div>
              ))}
            </div>
            <h3 className="m-0 mb-[18px] text-[22px] font-extrabold">Write for the guests who stay longer</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
              {longStayGuests.map((g) => (
                <div key={g.h} className={card}>
                  <h4 className="m-0 mb-2.5 text-[17px] font-extrabold">{g.h}</h4>
                  <p className="m-0 mb-3.5 text-sm leading-[1.55] text-body">{g.want}</p>
                  <p className="m-0 border-t border-line-4 pt-3.5 text-sm leading-[1.55]">
                    <strong>Show:</strong> {g.show}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-4 rounded-2xl border-[1.5px] border-ink bg-white px-6 py-[22px]">
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
                <path d="M12 3l10 18H2L12 3z" fill="none" stroke="#14212B" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 10v5M12 18v.5" stroke="#14212B" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">
                <strong className="text-ink">Check the rules first.</strong> In London, homes can be let short-term for up to
                90 nights a year without planning permission. In England, a stay that becomes a guest’s main home may be
                treated as a tenancy. For stays of several months, get advice before you accept.
              </p>
            </div>
            <Src>Source: Airbnb Help, Weekly and monthly discounts.</Src>
          </div>
        </section>

        {/* EVENTS */}
        <section id="events" className={sec}>
          <div className={W}>
            <Eyebrow>Seasonal and event updates</Eyebrow>
            <H2>Be the obvious choice when demand peaks</H2>
            <Lead className="mb-10">Before big events, we update your cover photo, a title phrase and your opening line, then switch back afterwards.</Lead>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              {events.map((e) => (
                <div key={e.m} className="rounded-[14px] border border-line p-5">
                  <p className="m-0 mb-2 text-[13px] font-extrabold tracking-[0.6px] text-brand">{e.m}</p>
                  <p className="m-0 mb-2.5 text-[15px] leading-[1.45] font-bold">{e.ev}</p>
                  <p className="m-0 text-sm leading-normal text-body">{e.up}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-green-100 p-[26px]">
                <h3 className="m-0 mb-3.5 text-lg font-extrabold text-ink">Event cover photos: do</h3>
                <p className="m-0 mb-2.5 text-[15px] leading-[1.55] text-ink-hover">
                  Use a real seasonal photo of your home: the living room at Christmas, the garden in bloom.
                </p>
                <p className="m-0 mb-2.5 text-[15px] leading-[1.55] text-ink-hover">
                  Keep any caption small, with the property as the main image (Airbnb cover only).
                </p>
                <p className="m-0 text-[15px] leading-[1.55] text-ink-hover">Switch back after the event, so the listing stays accurate.</p>
              </div>
              <div className="rounded-2xl bg-coral-50 p-[26px]">
                <h3 className="m-0 mb-3.5 text-lg font-extrabold text-ink">Don’t</h3>
                <p className="m-0 mb-2.5 text-[15px] leading-[1.55] text-[#3A2A2A]">
                  Add logos, phone numbers, websites or QR codes: they break off-platform rules.
                </p>
                <p className="m-0 text-[15px] leading-[1.55] text-[#3A2A2A]">
                  Use text on Vrbo or Booking.com photos: Vrbo reportedly blocks photos with text.
                </p>
              </div>
            </div>
            <Src>Check exact event dates every year; some, like Glastonbury, take fallow years.</Src>
          </div>
        </section>

        {/* COMPETITORS */}
        <section id="competitors" className={cn(sec, "bg-sand")}>
          <div className={cn(W, split)}>
            <div>
              <Eyebrow>Competitor analysis</Eyebrow>
              <H2>See your listing the way guests do: next to the others</H2>
              <Lead className="mb-7">For every audit we review 8 to 12 comparable listings: same area, similar size and guest numbers.</Lead>
              {competitorChecks.map((c) => (
                <Row key={c.w} k={c.w}>
                  <span className="text-[15px] text-body">{c.s}</span>
                </Row>
              ))}
            </div>
            <div className="rounded-[20px] bg-white p-7 shadow-[0_18px_48px_rgba(20,33,43,0.08)]">
              <div className="mb-[22px] flex items-center justify-between">
                <span className="text-base font-extrabold">Your one-page snapshot</span>
                <span className="rounded-full bg-coral-50 px-2.5 py-1.5 text-xs font-bold text-brand-deep">Sample layout</span>
              </div>
              <p className="m-0 mb-2 text-xs font-extrabold tracking-[1px] text-green">WHERE YOU LEAD</p>
              <p className="m-0 mb-5 text-[15px] leading-[1.55]">[Rating above area average · Parking · Self check-in]</p>
              <p className="m-0 mb-2 text-xs font-extrabold tracking-[1px] text-brand-deep">WHERE YOU LAG</p>
              <p className="m-0 mb-[22px] text-[15px] leading-[1.55]">[Cover photo · No monthly discount · 3-night minimum]</p>
              <div className="rounded-[14px] bg-ink p-5 text-white">
                <p className="m-0 mb-3 text-xs font-extrabold tracking-[1px] text-coral-200">3 CHANGES MOST LIKELY TO HELP</p>
                <p className="m-0 mb-2 text-[15px]">1. [Swap cover to the garden photo]</p>
                <p className="m-0 mb-2 text-[15px]">2. [Add a 15% monthly discount]</p>
                <p className="m-0 text-[15px]">3. [Allow 2-night stays mid-week]</p>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORMS */}
        <section id="platforms" className={sec}>
          <div className={W}>
            <Eyebrow>Multi-platform listing</Eyebrow>
            <H2>Don’t rely on one platform</H2>
            <Lead className="mb-10">
              We set up and keep your listing consistent on other channels, connected through your channel manager so your
              calendar never double-books.
            </Lead>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {platforms.map((p) => (
                <div key={p.n} className={card}>
                  <h3 className="m-0 mb-1.5 text-lg font-extrabold">{p.n}</h3>
                  <p className="m-0 mb-3 text-sm font-bold text-brand">{p.best}</p>
                  <p className="m-0 text-sm leading-[1.55] text-body">{p.note}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-[#F5F6F7] px-[26px] py-6">
              <p className="m-0 mb-2.5 text-base font-extrabold">Two platforms that no longer fit</p>
              <p className="m-0 mb-2 text-[15px] leading-[1.6] text-ink-copy">
                <strong className="text-ink">Holiday Lettings and FlipKey:</strong> Tripadvisor stopped taking holiday rental
                bookings for stays from 1 November 2024.
              </p>
              <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">
                <strong className="text-ink">OpenRent:</strong> built for long-term tenancies, not short lets.
              </p>
            </div>
            <Src>Sources: Skift, September 2024; Short Term Rentalz, October 2020 (HomeAway became Vrbo in the UK).</Src>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className={cn(sec, "bg-sand")}>
          <div className={W}>
            <Eyebrow>How it works</Eyebrow>
            <H2 className="mb-11">Six steps, and you approve every change</H2>
            <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
              {process.map((s, i) => (
                <li key={s.h} className="flex items-start gap-[18px] rounded-2xl bg-white p-6">
                  <span className="flex-none text-[30px] leading-none font-extrabold tracking-[-1px] text-coral">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="m-0 mt-0.5 mb-1.5 text-[17px] font-extrabold">{s.h}</h3>
                    <p className="m-0 text-[15px] leading-[1.55] text-body">{s.t}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* HONEST + PROOF */}
        <section id="proof" className={sec}>
          <div className={cn(W, split)}>
            <div>
              <Eyebrow>What to expect, honestly</Eyebrow>
              <H2 className="mb-7">No hype, no guaranteed rankings</H2>
              {honest.map((h) => (
                <div key={h.b} className="border-t border-line py-4">
                  <p className="m-0 mb-1 text-base font-extrabold">{h.b}</p>
                  <p className="m-0 text-[15px] leading-[1.55] text-body">{h.t}</p>
                </div>
              ))}
            </div>
            <div>
              <Eyebrow>Proof</Eyebrow>
              <H2 className="mb-7">Before and after</H2>
              {proof.map((p) => (
                <div key={p.l} className={cn(card, "mb-4")}>
                  <div className="mb-3.5 flex flex-wrap justify-between gap-3">
                    <span className="text-base font-extrabold">{p.l}</span>
                    <span className="text-[13px] text-muted">{p.c}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#F5F6F7] p-4">
                      <p className="m-0 mb-1 text-xs font-extrabold text-muted">BEFORE</p>
                      <p className="m-0 text-[22px] font-extrabold">{p.b}</p>
                    </div>
                    <div className="rounded-xl bg-coral-50 p-4">
                      <p className="m-0 mb-1 text-xs font-extrabold text-brand-deep">AFTER</p>
                      <p className="m-0 text-[22px] font-extrabold">{p.a}</p>
                    </div>
                  </div>
                </div>
              ))}
              <Src>Real client data, shared with permission. Screenshots dated.</Src>
            </div>
          </div>
        </section>

        {/* AUDIT FORM */}
        <section id="audit" className="bg-ink text-white">
          <div className={cn(W, split, sec, "items-center")}>
            <div>
              <Eyebrow className="text-coral-200">Free listing audit</Eyebrow>
              <H2 className="text-white">Find out what’s holding your listing back</H2>
              <Lead className="mb-6 text-mist">
                Send your listing link. Within 48 hours you get a scored report, plus the 3 changes most likely to make a
                difference, which you can make yourself.
              </Lead>
              <div className="flex flex-wrap gap-2">
                {auditItems.map((a) => (
                  <span key={a} className="rounded-full bg-night-field px-3.5 py-2 text-sm font-semibold text-[#E4E9ED]">
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <AuditForm />
          </div>
        </section>

        {/* PACKAGE */}
        <section id="call" className="bg-coral-50">
          <div className={cn(W, "flex flex-wrap items-center justify-between gap-7 py-14")}>
            <div className="flex-[1_1_520px]">
              <h2 className="m-0 mb-2 text-[26px] font-extrabold tracking-[-0.6px]">{packageCta.title}</h2>
              <p className="m-0 text-base leading-[1.6] text-ink-copy">{packageCta.text}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#audit" className={cn(pill, "btn-ink")}>
                Get a free audit
              </a>
              <SmartLink href={brand.links.bookCall} className={pillOutline}>
                Book a 20-minute call
              </SmartLink>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={sec}>
          <div className={cn(W, split)}>
            <div className="md:sticky md:top-6">
              <Eyebrow>FAQ</Eyebrow>
              <H2>Questions hosts ask us (and Google)</H2>
              <Lead>Short, sourced answers. Can’t find yours? Ask us in the audit form.</Lead>
            </div>
            <div className="border-b border-line">
              {faq.map((q) => (
                <details key={q.q} className="group border-t border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-[22px] text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
                    {q.q}
                    <PlusIcon />
                  </summary>
                  <p className="m-0 mb-[22px] text-base leading-[1.65] text-body">{q.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* RELATED + SOURCES */}
        <section className="bg-sand">
          <div className={cn(W, "py-[72px]")}>
            <h2 className="m-0 mb-7 text-[26px] font-extrabold tracking-[-0.6px]">Keep going</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {related.map((r) => (
                <SmartLink
                  key={r.h}
                  href={r.href}
                  className="box-border flex min-h-[140px] flex-col gap-2 rounded-2xl bg-white p-6 text-ink no-underline hover:text-ink hover:shadow-[0_10px_28px_rgba(20,33,43,0.08)]"
                >
                  <span className="text-xs font-extrabold tracking-[1px] text-brand uppercase">{r.k}</span>
                  <span className="text-[17px] font-extrabold">{r.h}</span>
                  <span className="text-sm leading-normal text-body">{r.t}</span>
                </SmartLink>
              ))}
            </div>
            <details className="group mt-10 border-t border-[#DDD6C9]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-[22px] text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                Sources used on this page
                <PlusIcon size={18} />
              </summary>
              {sources.map((s) => (
                <p key={s} className="m-0 mb-2 text-sm leading-normal text-body">
                  {s}
                </p>
              ))}
            </details>
          </div>
        </section>
      </ServiceTocLayout>
    </>
  );
}
