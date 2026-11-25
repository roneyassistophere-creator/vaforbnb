import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { anchors } from "@/config/navigation";
import { prices, showPrice } from "@/config/pricing";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import { reviewedBy } from "@/components/service/ServiceBlocks";
import {
  FitSlider,
  GbpCheck,
  IncludedAreas,
  MythCards,
  PeopleAlsoAsk,
  SearchSimulator,
  StreetCompare,
} from "./_components/Interactive";
import {
  honest,
  host,
  proof,
  related,
  searchMap,
  sidebarCta,
  sidebarToc,
  sources,
  steps,
  traits,
  versus,
} from "./content";
import { seo } from "./seo";
import { ServiceTocLayout } from "@/components/service/ServiceToc";

const W = "mx-auto box-border max-w-[1180px] px-4 md:px-7";
const sec = "py-16 md:py-[100px]";
const two = "grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-14";
const pill = "btn min-h-[52px] rounded-full";
const pillOutline = "btn min-h-[52px] rounded-full border-[1.5px] border-ink bg-white text-ink hover:bg-ink hover:text-white";

/** Faux search-result breadcrumb shown above each heading. */
function Crumb({ path, icon, dark, center }: { path: string; icon: ReactNode; dark?: boolean; center?: boolean }) {
  return (
    <p className={cn("m-0 mb-1.5 flex items-center gap-2 text-[13px]", dark ? "text-faint" : "text-muted", center && "justify-center")}>
      <span className={cn("inline-flex size-[26px] flex-none items-center justify-center rounded-full", dark ? "bg-ink-hover" : "bg-coral-50")}>
        {icon}
      </span>
      {host} › seo › {path}
    </p>
  );
}

function H2({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "m-0 mt-1.5 mb-4 text-[34px] leading-[1.05] font-extrabold tracking-[-1.8px] md:text-5xl",
        "[&_em]:font-serif [&_em]:font-normal [&_em]:tracking-[-0.5px] [&_em]:text-brand [&_em]:italic",
        className,
      )}
    >
      {children}
    </h2>
  );
}

function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 max-w-[700px] text-lg leading-[1.65] text-body", className)}>{children}</p>;
}

const ico = (d: ReactNode) => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    {d}
  </svg>
);

export default function SeoForShortLetsPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-sand">
        <div className={cn(W, "pt-[72px] pb-24")}>
          <div className="mb-[18px] flex justify-center">
            <Breadcrumbs seo={seo} separator="›" />
          </div>
          <h1 className="mx-auto mb-[22px] max-w-[980px] text-center text-[46px] leading-[0.98] font-extrabold tracking-[-3px] md:text-[72px]">
            Be the place they find{" "}
            <span className="font-serif font-normal tracking-[-1px] text-brand italic">when they Google.</span>
          </h1>
          <p className="mx-auto mb-[30px] max-w-[760px] text-center text-lg leading-[1.7] text-ink-copy">
            SEO helps your website appear when people search Google for somewhere to stay. It works best for{" "}
            <strong>longer stays</strong>: contractors, companies, relocations and insurance placements who search
            directly to avoid OTA fees, then call the host they find. And if you have one to three properties, we’ll tell
            you honestly: <strong>it’s probably not worth it yet.</strong>
          </p>
          <div className="mb-14 flex flex-wrap justify-center gap-3">
            <a href="#fit" className={cn(pill, "btn-coral")}>
              Check if SEO is right for you
            </a>
            <a href="#check" className={pillOutline}>
              Book a 20-minute call
            </a>
          </div>
          <SearchSimulator />
        </div>
      </section>

      <ServiceTocLayout items={sidebarToc} cta={sidebarCta}>
        {/* FIT */}
        <section className={sec} id="fit">
          <div className={cn(W, two)}>
            <div>
              <Crumb path="is-it-right-for-you" icon={ico(<path d="M4 20V10l8-6 8 6v10" fill="none" stroke="#B8383A" strokeWidth="2.4" strokeLinejoin="round" />)} />
              <H2>
                Is SEO right for you <em>yet?</em>
              </H2>
              <Lead>
                SEO pays back over months. Whether it’s worth it depends on how many nights you have to fill. Move the
                slider and we’ll give you our honest answer.
              </Lead>
              <div className="mt-7 rounded-r-2xl border-l-4 border-coral bg-coral-50 px-6 py-[22px]">
                <p className="m-0 text-[15px] leading-[1.6]">
                  <strong>Why we say this:</strong> we’d rather you spend on what makes the biggest difference now. When
                  your portfolio grows, SEO turns into a real asset, and we’ll be here.
                </p>
              </div>
            </div>
            <FitSlider />
          </div>
        </section>

        {/* LONGER STAYS */}
        <section id="longer-stays" className={cn(sec, "bg-ink text-white")}>
          <div className={W}>
            <Crumb
              dark
              path="longer-stays"
              icon={ico(
                <>
                  <rect x="4" y="7" width="16" height="12" rx="2" fill="none" stroke="#F0595A" strokeWidth="2.2" />
                  <path d="M9 7V5h6v2" fill="none" stroke="#F0595A" strokeWidth="2.2" />
                </>,
              )}
            />
            <H2 className="max-w-[820px] text-white [&_em]:text-coral-200">
              Why SEO works best for <em>longer stays</em>
            </H2>
            <Lead className="text-mist">
              Business and long-stay guests book differently. If your site appears for their searches, you get the call,
              and the chance to convert them.
            </Lead>
            <ol className="m-0 mt-11 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 md:grid-cols-5">
              {traits.map((t, i) => (
                <li key={t.h} className="rounded-[18px] bg-night-field p-5">
                  <p className="m-0 mb-2.5 font-serif text-[34px] leading-none text-coral italic">{String(i + 1).padStart(2, "0")}</p>
                  <p className="m-0 mb-1.5 text-base font-extrabold">{t.h}</p>
                  <p className="m-0 text-[13px] leading-[1.55] text-mist">{t.t}</p>
                </li>
              ))}
            </ol>
            <h3 className="m-0 mt-16 mb-[18px] text-[22px] font-extrabold">Matching real searches to the pages we build</h3>
            <div className="overflow-hidden rounded-[20px] border border-night-4">
              <div className="hidden grid-cols-[1fr_1.3fr_1.6fr] gap-5 bg-night-field px-5 py-3.5 text-xs font-extrabold tracking-[1px] text-faint md:grid">
                <span>GUEST TYPE</span>
                <span>WHAT THEY MIGHT SEARCH</span>
                <span>THE PAGE WE BUILD</span>
              </div>
              {searchMap.map((m) => (
                <div key={m.g} className="grid grid-cols-1 gap-2 border-t border-night-4 px-5 py-[18px] text-[15px] leading-normal md:grid-cols-[1fr_1.3fr_1.6fr] md:gap-5">
                  <strong>{m.g}</strong>
                  <span className="flex gap-2 text-coral-200">
                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="mt-[3px] flex-none">
                      <circle cx="11" cy="11" r="7" fill="none" stroke="#F8A3A4" strokeWidth="2.4" />
                      <path d="M16 16l5 5" stroke="#F8A3A4" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                    {m.s}
                  </span>
                  <span className="text-mist">{m.p}</span>
                </div>
              ))}
            </div>
            <p className="m-0 mt-4 text-[13px] leading-normal text-faint">
              Illustrative searches. We research real search terms for your area before writing anything.
            </p>
          </div>
        </section>

        {/* WITHOUT SEO: street */}
        <section id="without-seo" className={sec}>
          <div className={W}>
            <div className="mx-auto mb-11 max-w-[780px] text-center">
              <Crumb center path="without-seo" icon={ico(<path d="M3 20h18M6 20V9h12v11" fill="none" stroke="#B8383A" strokeWidth="2.2" />)} />
              <H2>
                A website without SEO is a shop on an <em>unmarked street.</em>
              </H2>
              <Lead className="mx-auto">It exists. But only people who already know your name will find it.</Lead>
            </div>
            <StreetCompare />
          </div>
        </section>

        {/* WHAT'S INCLUDED */}
        <section className={cn(sec, "bg-sand")} id="included">
          <div className={W}>
            <IncludedAreas
              heading={
                <>
                  <Crumb path="whats-included" icon={ico(<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#B8383A" strokeWidth="2.6" strokeLinecap="round" />)} />
                  <H2>
                    What our SEO <em>includes</em>
                  </H2>
                  <Lead>Eight areas, one plan. Tap any area to see what we do for you.</Lead>
                </>
              }
            />
          </div>
        </section>

        {/* GBP */}
        <section id="gbp" className={sec}>
          <div className={cn(W, two)}>
            <div>
              <Crumb
                path="google-maps-rules"
                icon={ico(
                  <>
                    <path d="M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11z" fill="none" stroke="#B8383A" strokeWidth="2.2" />
                    <circle cx="12" cy="10" r="2" fill="#B8383A" />
                  </>,
                )}
              />
              <H2>
                Can my holiday home go on <em>Google Maps?</em>
              </H2>
              <Lead>
                Google’s guidelines say rental properties such as vacation homes <strong>aren’t eligible</strong> for a
                Business Profile. A sales or leasing office can be, if it meets customers in person during its stated hours.
              </Lead>
              <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
                Source: Google Business Profile Help, Business eligibility and ownership guidelines.
              </p>
              <div className="mt-7 rounded-[18px] bg-sand p-[22px]">
                <p className="m-0 mb-2 text-[15px] leading-[1.6]">
                  For eligible businesses, local ranking is mainly based on <strong>relevance, distance and prominence</strong>.
                  Google says:
                </p>
                <p className="m-0 font-serif text-[26px] leading-[1.25]">
                  “There’s no way to request or pay for a better local ranking on Google.”
                </p>
                <p className="m-0 mt-2 text-[13px] leading-normal text-muted">Google Business Profile Help, How Google determines local ranking.</p>
              </div>
            </div>
            <div className="rounded-[20px] border-2 border-ink bg-white p-[30px]">
              <p className="m-0 mb-1 text-xs font-extrabold tracking-[1px] text-brand">QUICK ELIGIBILITY CHECK</p>
              <p className="m-0 mb-5 text-[22px] font-extrabold">What are you hoping to list?</p>
              <GbpCheck />
              <p className="m-0 mt-4 text-[13px] leading-[1.55] text-muted">
                Professional property managers may also appear on Google Vacation Rentals through an approved connectivity
                provider. <SmartLink href={anchors.service("website")}>See direct booking websites</SmartLink>.
              </p>
            </div>
          </div>
        </section>

        {/* SEO vs GEO */}
        <section id="seo-vs-geo" className={cn(sec, "bg-coral-50")}>
          <div className={W}>
            <div className="mx-auto mb-10 max-w-[820px] text-center">
              <Crumb center path="seo-vs-geo" icon={ico(<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#B8383A" />)} />
              <H2>
                SEO vs GEO: what about <em>AI search?</em>
              </H2>
              <Lead className="mx-auto">
                GEO (generative engine optimisation) means optimising for AI answers, like Google’s AI Overviews and AI
                Mode, or ChatGPT. Here’s what Google itself says:
              </Lead>
            </div>
            <figure className="mx-auto mb-12 flex max-w-[900px] items-start gap-5 rounded-3xl bg-white px-6 py-8 md:px-9">
              <div className="flex size-11 flex-none items-center justify-center rounded-full bg-ink">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#F0595A" />
                </svg>
              </div>
              <div>
                <blockquote className="m-0 mb-2.5 font-serif text-[26px] leading-[1.2] md:text-[32px]">
                  “Optimizing for generative AI search is optimizing for the search experience, and thus still SEO.”
                </blockquote>
                <figcaption className="text-[13px] text-muted">
                  Google Search Central, Optimizing your website for generative AI features (updated July 2026)
                </figcaption>
              </div>
            </figure>
            <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
              {versus.map((v) => (
                <div key={v.k} className="rounded-[20px] bg-white p-6">
                  <p className="m-0 mb-3.5 text-[13px] font-extrabold tracking-[1px] text-brand uppercase">{v.k}</p>
                  <p className="m-0 mb-1 text-xs font-extrabold text-muted">SEO</p>
                  <p className="m-0 mb-3.5 text-[15px] leading-normal">{v.seo}</p>
                  <p className="m-0 mb-1 text-xs font-extrabold text-muted">GEO / AI SEARCH</p>
                  <p className="m-0 text-[15px] leading-normal">{v.geo}</p>
                </div>
              ))}
            </div>
            <h3 className="m-0 mb-[18px] text-center text-[22px] font-extrabold">Myth or fact? Tap a card.</h3>
            <MythCards />
            <p className="m-0 mt-4 text-center text-[13px] leading-normal text-muted">
              Source: Google Search Central, AI optimisation guide. Google says Search doesn’t use llms.txt; other services
              may.
            </p>
            <div className="mx-auto mt-9 max-w-[820px] rounded-[20px] bg-ink px-7 py-6 text-base leading-[1.6] text-white">
              <strong className="text-coral-200">Our approach:</strong> one strategy for both. Clear, accurate, first-hand
              pages about your properties and area, consistent business details everywhere, and genuine reviews. That’s
              what search engines and AI tools can trust and quote.
            </div>
          </div>
        </section>

        {/* PROCESS + EXPECTATIONS */}
        <section id="process" className={sec}>
          <div className={W}>
            <Crumb path="how-we-work" icon={ico(<path d="M4 18l5-6 4 3 7-9" fill="none" stroke="#B8383A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />)} />
            <H2>
              Months, <em>not weeks.</em>
            </H2>
            <Lead>SEO compounds. Here’s how we work, and why it’s a slow climb rather than a switch.</Lead>
            <div className="relative mt-12">
              <svg viewBox="0 0 1124 200" width="100%" height="200" aria-hidden="true" preserveAspectRatio="none" className="hidden md:block">
                <path
                  d="M0 190 C 300 188, 500 170, 700 120 S 1000 20, 1124 10"
                  fill="none"
                  stroke="#F0595A"
                  strokeWidth="4"
                  strokeDasharray="2 10"
                  strokeLinecap="round"
                />
                <path d="M0 190 C 300 188, 500 170, 700 120 S 1000 20, 1124 10 L 1124 200 L 0 200 Z" fill="#FDECEC" opacity="0.6" />
              </svg>
              <ol className="m-0 mt-3 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-3 md:grid-cols-6">
                {steps.map((s) => (
                  <li key={s.h} className="border-t-[3px] border-ink pt-3.5">
                    <p className="m-0 mb-1 text-xs font-extrabold text-brand uppercase">{s.n}</p>
                    <p className="m-0 mb-1.5 text-[17px] font-extrabold">{s.h}</p>
                    <p className="m-0 text-sm leading-[1.55] text-body">{s.t}</p>
                  </li>
                ))}
              </ol>
              <p className="m-0 mt-4 text-[13px] leading-normal text-muted">The curve is illustrative, not a forecast.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              {honest.map((h) => (
                <div key={h.b} className="rounded-[20px] border-[1.5px] border-line-2 p-[22px]">
                  <p className="m-0 mb-2 text-[17px] leading-[1.3] font-extrabold">{h.b}</p>
                  <p className="m-0 text-sm leading-[1.55] text-body">{h.t}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-[18px] bg-ink px-6 py-5 text-white">
              <span className="rounded-full bg-coral px-3 py-1.5 text-xs font-extrabold tracking-[1px] text-ink">RED FLAG</span>
              <span className="flex-1 text-base leading-normal">
                If an SEO company guarantees a #1 ranking, Google’s advice is to <strong>find someone else</strong>. “No one
                can guarantee a #1 ranking on Google.”
              </span>
              <span className="text-xs text-faint">Google Search Central, Do you need an SEO?</span>
            </div>
          </div>
        </section>

        {/* PROOF + PRICING */}
        <section className={cn(sec, "bg-sand")} id="check">
          <div className={cn(W, two, "items-center")}>
            <div>
              <Crumb
                path="results"
                icon={ico(<path d="M4 20h16M7 16V10M12 16V6M17 16v-4" stroke="#B8383A" strokeWidth="2.4" strokeLinecap="round" />)}
              />
              <H2>
                Real results, <em>real data only.</em>
              </H2>
              <Lead>Anonymised client examples, shared with permission. Before and after compares the same months.</Lead>
              <div className="mt-7 grid gap-2.5">
                {proof.map((p) => (
                  <div key={p.c} className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-3 rounded-2xl bg-white px-5 py-[18px]">
                    <div>
                      <p className="m-0 text-[15px] font-extrabold">{p.c}</p>
                      <p className="m-0 mt-0.5 text-[13px] text-muted">{p.f}</p>
                    </div>
                    <div>
                      <p className="m-0 text-[11px] font-extrabold text-muted">BEFORE</p>
                      <p className="m-0 text-sm font-bold">{p.b}</p>
                    </div>
                    <div>
                      <p className="m-0 text-[11px] font-extrabold text-green">AFTER</p>
                      <p className="m-0 text-sm font-bold">{p.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] bg-ink p-7 text-white md:p-9">
              <p className="m-0 mb-2 text-xs font-extrabold tracking-[1px] text-coral-200">PART OF THE GROW PACKAGE</p>
              <p className="m-0 mb-1 text-base text-mist">SEO for short lets</p>
              <p className="m-0 mb-4 text-[52px] font-extrabold tracking-[-2px]">
                {showPrice(prices.seoMonthly)}
                <span className="text-lg font-semibold tracking-normal text-mist">/month</span>
              </p>
              <p className="m-0 mb-[22px] text-[15px] leading-[1.6] text-mist">
                After a free SEO check. Minimum term [X] months. Alongside direct booking websites and social media.
              </p>
              <div className="grid gap-2.5">
                <SmartLink href={brand.links.freeAudit} className={cn(pill, "btn-coral")}>
                  Get a free SEO check
                </SmartLink>
                <SmartLink
                  href={brand.links.bookCall}
                  className={cn(pill, "border-[1.5px] border-white bg-transparent text-white hover:text-white")}
                >
                  Book a 20-minute call
                </SmartLink>
              </div>
              <p className="m-0 mt-[18px] text-[13px] text-faint">
                Have 1–3 properties? Start with{" "}
                <SmartLink href={anchors.service("listing")} className="text-coral-200">
                  listing optimisation
                </SmartLink>{" "}
                or a{" "}
                <SmartLink href={anchors.service("website")} className="text-coral-200">
                  direct booking website
                </SmartLink>{" "}
                instead.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={sec}>
          <div className={cn(W, "max-w-[860px]")}>
            <Crumb
              path="faq"
              icon={ico(
                <>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="#B8383A" strokeWidth="2.2" />
                  <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" fill="none" stroke="#B8383A" strokeWidth="2.2" strokeLinecap="round" />
                </>,
              )}
            />
            <H2>
              People also <em>ask</em>
            </H2>
            <PeopleAlsoAsk />
            <div className="mt-10 flex flex-wrap gap-2">
              <span className="mr-1.5 self-center text-[13px] font-extrabold text-body">Related:</span>
              {related.map((r) => (
                <SmartLink
                  key={r.label}
                  href={r.href}
                  className="rounded-full border border-line-6 px-4 py-[9px] text-sm font-bold text-ink no-underline hover:border-ink hover:text-ink"
                >
                  {r.label}
                </SmartLink>
              ))}
            </div>
            <p className="m-0 mt-8 text-[13px] leading-[1.7] text-muted">
              <strong className="text-ink-copy">Sources:</strong> {sources} {reviewedBy("November 2026")}
            </p>
          </div>
        </section>
      </ServiceTocLayout>
    </>
  );
}
