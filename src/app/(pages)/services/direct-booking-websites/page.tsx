import type { ReactNode } from "react";
import { isToolLive } from "@/content/tools/catalog";
import { toolPath as directToolPath, toolSlug as directToolSlug } from "@/content/tools/directBookingId";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import { reviewedBy } from "@/components/service/ServiceBlocks";
import {
  BuildProgress,
  BuilderVsCustom,
  CheckoutMock,
  FaqSearch,
  PlugBoard,
  PreviewBuilder,
  SyncDemo,
} from "./_components/Interactive";
import {
  blueprint,
  dbPages,
  gallery,
  honest,
  landlord,
  miniCal,
  own,
  payPoints,
  plans,
  pmPages,
  rightWay,
  sidebarCta,
  sidebarToc,
  sitemap,
  sourcesNote,
  ukEssentials,
  why,
} from "./content";
import { seo } from "./seo";
import { ServiceTocLayout } from "@/components/service/ServiceToc";

/* Blueprint style: faint grid backgrounds, browser windows, JetBrains Mono labels. */
const W = "mx-auto box-border max-w-[1200px] px-4 md:px-7";
const sec = "py-16 md:py-[104px]";
const two = "grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-14";
const code = "font-jetbrains text-xs font-bold tracking-[0.4px]";
const bp =
  "bg-[#F8FAFB] [background-image:linear-gradient(#E8EDF1_1px,transparent_1px),linear-gradient(90deg,#E8EDF1_1px,transparent_1px)] [background-size:32px_32px]";
const btn = "btn min-h-[52px] rounded-xl";
const btnOutline = "btn min-h-[52px] rounded-xl border-[1.5px] border-ink bg-white text-ink hover:bg-ink hover:text-white";

function Tag({ children, dark }: { children: string; dark?: boolean }) {
  return (
    <span className={cn(code, "mb-4 inline-block rounded-md px-2.5 py-[5px]", dark ? "bg-ink-hover text-coral-200" : "bg-coral-50 text-brand")}>
      {`<${children} />`}
    </span>
  );
}

function H2({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("m-0 mb-4 text-[32px] leading-[1.06] font-extrabold tracking-[-1.8px] md:text-[46px]", className)}>{children}</h2>;
}

function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 max-w-[680px] text-lg leading-[1.65] text-body", className)}>{children}</p>;
}

function Tick() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#B8383A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DirectBookingWebsitesPage() {
  return (
    <>
      {/* HERO */}
      <section className={bp}>
        <div className={cn(W, "pt-16 pb-24")}>
          <div className="mx-auto mb-10 max-w-[900px] text-center">
            <div className="mb-4 flex justify-center">
              <Breadcrumbs seo={seo} className={code} />
            </div>
            <h1 className="m-0 mb-[22px] text-[44px] leading-none font-extrabold tracking-[-2.8px] md:text-[68px]">
              Your properties. Your brand. <span className="text-coral">Your bookings.</span>
            </h1>
            <p className="mx-auto mb-7 max-w-[720px] text-lg leading-[1.7] text-ink-copy">
              We build direct booking websites and property management websites for UK short-let businesses, synced with
              your channel manager, with secure payments and pages that win landlords. From domain to first booking, A to Z.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#call" className={cn(btn, "btn-coral")}>
                Book a 20-minute website call
              </a>
              {isToolLive(directToolSlug) && (
                <SmartLink href={directToolPath} className={btnOutline} data-direct-tool-link>
                  See what you’d save
                </SmartLink>
              )}
              <a href="#included" className={btnOutline}>
                See what’s included
              </a>
            </div>
          </div>
          <PreviewBuilder />
        </div>
      </section>

      <ServiceTocLayout items={sidebarToc} cta={sidebarCta}>
        {/* WHY */}
        <section id="why" className={sec}>
          <div className={W}>
            <div className={cn(two, "mb-11 items-end")}>
              <div>
                <Tag>why</Tag>
                <H2 className="m-0">A website is your business identity</H2>
              </div>
              <Lead>
                It’s where guests book without commission, where landlords decide whether to trust you, and where your brand
                lives when platforms change the rules.
              </Lead>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-5">
              {why.map((y) => (
                <div key={y.k} className="overflow-hidden rounded-2xl border border-[#E2E6EA]">
                  <div className="flex items-center gap-2 border-b border-[#E2E6EA] bg-fog px-3 py-2">
                    <span className="size-2 rounded-full bg-coral" />
                    <span className={cn(code, "text-[11px] text-muted")}>{y.k}</span>
                  </div>
                  <div className="p-5">
                    <p className="m-0 mb-2 text-lg leading-[1.3] font-extrabold">{y.h}</p>
                    <p className="m-0 text-sm leading-[1.55] text-body">{y.t}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-5 rounded-2xl bg-ink px-[26px] py-[22px] text-white">
              <span className="text-[44px] font-extrabold tracking-[-2px] text-coral-200">15.5%</span>
              <p className="m-0 flex-[1_1_420px] text-base leading-[1.6] text-[#E4E9ED]">
                Airbnb’s single host-only fee now comes out of your payout. Every direct booking avoids it (you still pay
                payment processing and any channel manager fees).{" "}
                <span className="text-[13px] text-[#AEB9C2]">Source: Airbnb Resource Centre, 2026.</span>
              </p>
            </div>
          </div>
        </section>

        {/* SYNC */}
        <section id="sync" className={bp}>
          <div className={cn(W, sec)}>
            <div className="mx-auto mb-9 max-w-[760px] text-center">
              <Tag>sync</Tag>
              <H2>One booking. Every calendar. Instantly.</H2>
              <Lead className="mx-auto">
                We connect your site to your channel manager, so availability matches everywhere. Try it: pick where the
                booking comes from, then click a date.
              </Lead>
            </div>
            <SyncDemo />
          </div>
        </section>

        {/* TWO KINDS */}
        <section id="included" className={sec}>
          <div className={W}>
            <div className="mx-auto mb-12 max-w-[760px] text-center">
              <Tag>two-kinds</Tag>
              <H2>Two kinds of website. Or both in one.</H2>
            </div>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
              <div className="flex flex-col gap-[22px] rounded-3xl bg-sand p-6 md:p-8">
                <div className="flex items-end gap-5">
                  <div className="w-[120px] flex-none rounded-[22px] bg-ink p-[7px]" aria-hidden="true">
                    <div className="box-border flex h-[210px] flex-col gap-1.5 rounded-2xl bg-white p-2.5">
                      <div className="h-[70px] rounded-lg bg-[#CFE1E2]" />
                      <div className="h-2 w-[70%] rounded-[3px] bg-ink" />
                      <div className="h-1.5 w-1/2 rounded-[3px] bg-[#CBD3D9]" />
                      <div className="mt-1 grid grid-cols-7 gap-0.5">
                        {miniCal.map((c, i) => (
                          <span key={i} className="h-[7px] rounded-sm" style={{ background: c }} />
                        ))}
                      </div>
                      <div className="mt-auto h-[22px] rounded-md bg-coral" />
                    </div>
                  </div>
                  <div>
                    <p className={cn(code, "m-0 mb-1.5 text-brand")}>FOR HOSTS AND OPERATORS</p>
                    <h3 className="m-0 text-[28px] font-extrabold tracking-[-0.8px]">Direct booking website</h3>
                  </div>
                </div>
                <p className="m-0 text-base leading-[1.6] text-ink-copy">
                  <strong className="text-ink">Goal:</strong> bookings and payments.
                </p>
                <div className="flex flex-wrap gap-2">
                  {dbPages.map((p) => (
                    <span key={p} className="rounded-lg bg-white px-3 py-[7px] text-[13px] font-bold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-[22px] rounded-3xl bg-ink p-6 text-white md:p-8">
                <div className="flex items-end gap-5">
                  <div className="w-[200px] flex-none max-sm:w-[150px]" aria-hidden="true">
                    <div className="rounded-t-[10px] bg-ink-hover p-[7px]">
                      <div className="box-border grid h-[118px] grid-cols-2 gap-[5px] rounded bg-white p-2">
                        <div className="col-span-2 h-[26px] rounded bg-sand" />
                        <div className="rounded bg-[#DCE6F2]" />
                        <div className="rounded bg-coral-50" />
                        <div className="rounded bg-green-100" />
                        <div className="rounded bg-coral" />
                      </div>
                    </div>
                    <div className="-mx-3.5 h-2.5 rounded-b-lg bg-night-field-line" />
                  </div>
                  <div>
                    <p className={cn(code, "m-0 mb-1.5 text-coral-200")}>FOR PROPERTY MANAGERS</p>
                    <h3 className="m-0 text-[28px] font-extrabold tracking-[-0.8px]">Property management website</h3>
                  </div>
                </div>
                <p className="m-0 text-base leading-[1.6] text-mist">
                  <strong className="text-white">Goal:</strong> trust, portfolio and landlord enquiries, plus bookings.
                </p>
                <div className="flex flex-wrap gap-2">
                  {pmPages.map((p) => (
                    <span key={p} className="rounded-lg bg-ink-hover px-3 py-[7px] text-[13px] font-bold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LANDLORD BLUEPRINT */}
        <section id="landlord" className="bg-[#1A2A36] text-white [background-image:linear-gradient(#22374A_1px,transparent_1px),linear-gradient(90deg,#22374A_1px,transparent_1px)] [background-size:32px_32px]">
          <div className={cn(W, sec)}>
            <div className={cn(two, "items-center")}>
              <div>
                <Tag dark>for-landlords</Tag>
                <H2 className="text-white">The landlord page: your sales page</H2>
                <Lead className="mb-6 text-mist">
                  If you manage, or plan to manage, properties, owners will check your website before they call. This
                  blueprint answers their questions first.
                </Lead>
                <ol className="m-0 list-none p-0">
                  {landlord.map((l, i) => (
                    <li key={l.h} className="flex gap-3.5 py-2.5">
                      <span className="flex size-7 flex-none items-center justify-center rounded-full border-2 border-coral text-[13px] font-extrabold text-coral-200">
                        {i + 1}
                      </span>
                      <span className="text-[15px] leading-normal">
                        <strong>{l.h}</strong> <span className="text-mist">{l.t}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="grid gap-2.5 rounded-2xl border-2 border-dashed border-[#4A6378] p-[18px]" aria-hidden="true">
                {blueprint.map((b, i) => (
                  <div
                    key={b.t}
                    className="relative box-border flex items-center gap-3 rounded-[10px] border-[1.5px] border-[#4A6378] p-3.5"
                    style={{ minHeight: b.h }}
                  >
                    <span className="flex size-[26px] flex-none items-center justify-center rounded-full bg-coral text-xs font-extrabold text-ink">
                      {i + 1}
                    </span>
                    <span className={cn(code, "text-mist")}>{b.t}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="m-0 mt-6 text-[13px] text-faint">Only show performance figures you can prove, with permission and dates.</p>
          </div>
        </section>

        {/* CHANNEL MANAGERS */}
        <section id="channel-managers" className={sec}>
          <div className={W}>
            <div className={cn(two, "mb-10 items-end")}>
              <div>
                <Tag>connect</Tag>
                <H2 className="m-0">Plugs into the channel manager you already use</H2>
              </div>
              <Lead>If your channel manager offers a booking engine or API, we can usually connect it. We check your plan includes it before we start.</Lead>
            </div>
            <PlugBoard />
            <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
              Sources: Uplisting direct booking website page; Hostaway direct booking feature page; HostAway Connector plugin
              (WordPress.org); Tokeet API documentation via Boostly. Features change by plan.
            </p>
            <BuilderVsCustom />
          </div>
        </section>

        {/* PAYMENTS */}
        <section id="payments" className={bp}>
          <div className={cn(W, sec, two, "items-center")}>
            <div>
              <Tag>checkout</Tag>
              <H2>Secure payments, deposits and damage holds</H2>
              <Lead className="mb-[22px]">
                Usually through Stripe or the payment provider your channel manager supports, with card authentication
                handled by the provider.
              </Lead>
              {payPoints.map((p) => (
                <div key={p} className="flex gap-3 py-[9px] text-[15px] leading-normal">
                  <Tick />
                  {p}
                </div>
              ))}
            </div>
            <CheckoutMock />
          </div>
        </section>

        {/* SITEMAP */}
        <section id="sitemap" className={sec}>
          <div className={W}>
            <div className="mx-auto mb-11 max-w-[760px] text-center">
              <Tag>sitemap</Tag>
              <H2>Everything a good direct booking site needs</H2>
            </div>
            <div className="flex justify-center">
              <span className="rounded-xl bg-ink px-6 py-3 font-extrabold text-white">Home</span>
            </div>
            <div className="mx-auto h-7 w-0.5 bg-line-strong" aria-hidden="true" />
            <div className="mx-[8%] border-t-2 border-line-strong max-md:hidden" aria-hidden="true" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              {sitemap.map((s) => (
                <div key={s.h} className="flex flex-col items-center">
                  <div className="h-[22px] w-0.5 bg-line-strong" aria-hidden="true" />
                  <div className="box-border w-full rounded-[14px] border-[1.5px] border-ink p-4" style={{ background: s.bg }}>
                    <p className="m-0 mb-1.5 text-[15px] font-extrabold">{s.h}</p>
                    <p className="m-0 text-[13px] leading-normal text-body">{s.t}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* UK ESSENTIALS + RIGHT WAY */}
        <section id="uk-essentials" className="bg-sand">
          <div className={cn(W, sec, two)}>
            <div>
              <Tag>uk-essentials</Tag>
              <H2>The UK must-haves, set up for you</H2>
              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {ukEssentials.map((u) => (
                  <div key={u.h} className="rounded-2xl bg-white p-[18px]">
                    <p className="m-0 mb-1.5 text-base font-extrabold">{u.h}</p>
                    <p className="m-0 text-[13px] leading-[1.55] text-body">{u.t}</p>
                  </div>
                ))}
              </div>
              <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
                Source: ICO, Data protection fee. Not legal advice: have your terms reviewed by a qualified adviser.
              </p>
            </div>
            <div>
              <Tag>get-bookings</Tag>
              <H2>Getting direct bookings the right way</H2>
              <div className="mt-5 mb-3.5 rounded-[18px] bg-ink p-[22px] text-white">
                <p className="m-0 mb-1.5 text-[13px] font-extrabold text-coral-200">ONE RULE MATTERS MOST</p>
                <p className="m-0 text-base leading-[1.6]">
                  Don’t use Airbnb messages to send guests to your website. Airbnb’s off-platform policy doesn’t allow
                  encouraging guests to book or pay outside Airbnb.
                </p>
                <p className="m-0 mt-2 text-xs text-[#AEB9C2]">Source: Airbnb Help, article 2799.</p>
              </div>
              {rightWay.map((r) => (
                <div key={r.h} className="flex gap-3 border-b border-[#E2DCD0] py-2.5">
                  <span className={cn(code, "flex-none text-green")}>✓</span>
                  <span className="text-[15px] leading-normal">
                    <strong>{r.h}</strong> {r.t}
                  </span>
                </div>
              ))}
              <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
                Google Vacation Rentals: for professional property management companies via an approved connectivity
                provider (Google Hotel Center help).
              </p>
            </div>
          </div>
        </section>

        {/* BUILD PROGRESS */}
        <section id="build" className={sec}>
          <div className={W}>
            <div className={cn(two, "mb-8 items-end")}>
              <div>
                <Tag>build</Tag>
                <H2 className="m-0">From discovery call to first booking</H2>
              </div>
              <Lead>Click through the build. Timelines are agreed in writing at the plan stage.</Lead>
            </div>
            <BuildProgress />
          </div>
        </section>

        {/* OWN IT + HONEST */}
        <section id="own-it" className="bg-ink text-white">
          <div className={cn(W, sec, two)}>
            <div>
              <Tag dark>you-own-it</Tag>
              <H2 className="text-white">No lock-in. It’s yours.</H2>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {own.map((o) => (
                  <div key={o} className="rounded-2xl bg-night-field p-[18px]">
                    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="8" cy="12" r="4" fill="none" stroke="#F0595A" strokeWidth="2" />
                      <path d="M12 12h9M18 12v3M21 12v2" stroke="#F0595A" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p className="m-0 mt-2.5 text-[15px] leading-[1.45] font-bold">{o}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Tag dark>honest</Tag>
              <H2 className="text-white">What to expect</H2>
              {honest.map((h) => (
                <div key={h.b} className="border-t border-night-4 py-3.5">
                  <p className="m-0 mb-1 text-base font-extrabold">{h.b}</p>
                  <p className="m-0 text-sm leading-[1.55] text-mist">{h.t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROOF GALLERY */}
        <section id="proof" className={sec}>
          <div className={W}>
            <Tag>portfolio</Tag>
            <H2 className="mb-8">Sites we’ve built</H2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {gallery.map((g, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-[#DDE3E8] bg-white shadow-[0_14px_34px_rgba(20,33,43,0.08)]">
                  <div className="flex items-center gap-2 border-b border-[#E2E6EA] bg-fog px-3.5 py-2.5">
                    <span className="size-2.5 rounded-full bg-coral" />
                    <span className={cn(code, "text-body")}>[clientbrand.co.uk]</span>
                  </div>
                  <div className="flex h-[180px] items-center justify-center" style={{ background: g.bg }}>
                    <span className={cn(code, "text-body")}>[Screenshot]</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2.5 p-4">
                    <span className="text-[15px] font-extrabold">{g.t}</span>
                    <span className={cn(code, "text-muted")}>{g.cm}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="m-0 mt-4 text-[13px] leading-normal text-muted">Real client sites only, with permission and launch dates.</p>
          </div>
        </section>

        {/* GROW PRICING */}
        <section id="call" className={bp}>
          <div className={cn(W, "py-20")}>
            <div className="mx-auto mb-9 max-w-[760px] text-center">
              <Tag>grow</Tag>
              <H2>Part of the Grow package</H2>
              <Lead className="mx-auto">Alongside SEO and social media. Prices confirmed after a short call about your business.</Lead>
            </div>
            <div className="mx-auto grid max-w-[980px] grid-cols-1 gap-3.5 md:grid-cols-3">
              {plans.map((p) => (
                <div
                  key={p.k}
                  className={cn("flex flex-col gap-3 rounded-[20px] border-[1.5px] border-ink p-[26px]", p.dark ? "bg-ink text-white" : "bg-white text-ink")}
                >
                  <p className={cn(code, "m-0", p.dark ? "text-coral-200" : "text-brand")}>{p.k}</p>
                  <p className="m-0 text-[34px] font-extrabold tracking-[-1px]">{p.price}</p>
                  <p className="m-0 mb-1.5 text-sm leading-[1.55] opacity-90">{p.t}</p>
                  <SmartLink href={brand.links.bookCall} className={cn(btn, "mt-auto", p.dark ? "btn-coral" : "btn-ink")}>
                    Book a website call
                  </SmartLink>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={sec}>
          <div className={cn(W, "max-w-[880px]")}>
            <div className="mb-7 text-center">
              <Tag>faq</Tag>
              <H2>Questions about direct booking websites</H2>
            </div>
            <FaqSearch />
            <p className="m-0 mt-8 text-center text-[13px] leading-[1.7] text-muted">
              <strong className="text-ink-copy">Sources:</strong> {sourcesNote} {reviewedBy("November 2026")}
            </p>
          </div>
        </section>
      </ServiceTocLayout>
    </>
  );
}
