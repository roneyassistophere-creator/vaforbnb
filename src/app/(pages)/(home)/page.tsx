import { brand } from "@/config/brand";
import { anchors, routes } from "@/config/navigation";
import { prices, showPrice } from "@/config/pricing";
import { cn } from "@/lib/cn";
import { Faq } from "@/components/ui/Faq";
import { Icon, SearchIcon } from "@/components/ui/Icon";
import { Cross, Tick } from "@/components/ui/Marks";
import { SmartLink } from "@/components/ui/SmartLink";
import { PackageExplorer } from "./_components/PackageExplorer";
import { PainPicker } from "./_components/PainPicker";
import { WhoTabs } from "./_components/WhoTabs";
import {
  aiSearch,
  cases,
  compare,
  faq,
  finalCta,
  freebies,
  hero,
  outcomes,
  priceCards,
  promises,
  steps,
  today,
} from "./content";


export default function HomePage() {
  return (
    <>
      {/* 1 HERO */}
      <section className="bg-sand">
        <div className="wrap grid grid-cols-1 items-center gap-14 pt-16 pb-16 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:pt-[88px] md:pb-24">
          <div>
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1 className="font-serif m-0 mb-[22px] text-[46px] leading-[1.02] font-normal tracking-[-1px] md:text-[66px]">
              {hero.titleStart} <em className="text-brand">{hero.titleEm}</em> {hero.titleEnd}
            </h1>
            <p className="lead mb-[30px]">{hero.lead}</p>
            <div className="mb-7 flex flex-wrap gap-3">
              <SmartLink href={brand.links.freeAudit} className="btn btn-coral">
                {hero.primaryCta}
              </SmartLink>
              <SmartLink href={brand.links.bookCall} className="btn btn-outline">
                {hero.secondaryCta}
              </SmartLink>
            </div>
            <ul className="m-0 flex list-none flex-wrap gap-5 p-0 text-sm font-semibold text-body">
              {hero.trust.map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <Tick size={20} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="card p-[26px] shadow-[0_30px_60px_rgba(20,33,43,0.10)]">
              <div className="mb-[18px] flex items-center justify-between gap-3">
                <div>
                  <p className="m-0 text-xs font-extrabold tracking-[1px] text-muted uppercase">{today.label}</p>
                  <p className="font-serif m-0 mt-1 text-[28px]">{today.day}</p>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green">{today.status}</span>
              </div>
              <ul className="m-0 grid list-none gap-1 p-0">
                {today.items.map((d, i) => (
                  <li
                    key={d.time}
                    className={cn(
                      "flex items-center gap-3.5 py-[11px]",
                      i < today.items.length - 1 && "border-b border-sand-row",
                    )}
                  >
                    <span className="w-[46px] flex-none text-[13px] font-bold text-muted">{d.time}</span>
                    <span className="flex-1 text-sm font-semibold">{d.text}</span>
                    <span
                      className={cn(
                        "flex-none rounded-full px-2.5 py-1 text-xs font-bold",
                        d.tone === "ok" ? "bg-green-50 text-green" : "bg-steel-100 text-ink-soft",
                      )}
                    >
                      {d.status}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-[18px] flex items-center justify-between gap-3 rounded-[14px] bg-coral-50 px-4 py-3.5">
                <span className="text-sm font-bold">{today.pending}</span>
                <span className="text-[13px] font-extrabold text-brand">Review →</span>
              </div>
            </div>
            <p className="mx-1 mt-3.5 mb-0 text-xs text-subtle">{today.note}</p>
          </div>
        </div>
      </section>

      {/* 2 SOUND FAMILIAR */}
      <section className="sec">
        <div className="wrap">
          <PainPicker />
        </div>
      </section>

      {/* 3 OUTCOMES */}
      <section className="sec border-t border-sand-line bg-white">
        <div className="wrap">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">What changes when we join</p>
              <h2 className="h2 m-0">
                What you <em>get back</em>
              </h2>
            </div>
            <p className="lead max-w-[420px]">Not a list of tasks. These are the results hosts hire us for.</p>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[22px] border border-sand-line bg-sand-line sm:grid-cols-2 md:grid-cols-4">
            {outcomes.map((o, i) => {
              const dark = i === outcomes.length - 1;
              return (
                <div
                  key={o.h}
                  className={cn("box-border flex min-h-[230px] flex-col gap-3 px-6 py-7", dark ? "bg-ink" : "bg-white")}
                >
                  <span className={cn("text-[13px] font-extrabold", dark ? "text-coral" : "text-brand")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className={cn("font-serif m-0 text-[26px] leading-[1.1] font-normal", dark ? "text-white" : "text-ink")}>
                    {o.h}
                  </h3>
                  <p className={cn("m-0 flex-1 text-sm leading-[1.6]", dark ? "text-mist" : "text-body")}>{o.t}</p>
                  <SmartLink
                    href={o.href}
                    className={cn("text-[13px] font-bold no-underline", dark ? "text-coral hover:text-coral-200" : "text-brand")}
                  >
                    {o.l} →
                  </SmartLink>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 HOW IT WORKS */}
      <section className="sec bg-sand">
        <div className="wrap">
          <div className="mb-[52px] text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="h2">
              Up and running in <em>three simple steps</em>
            </h2>
          </div>
          <ol className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="card relative p-[30px]">
                <div className="mb-5 flex items-center gap-3">
                  <span className="font-serif flex size-[52px] items-center justify-center rounded-full bg-ink text-[26px] text-white">
                    {s.n}
                  </span>
                  <span className="text-xs font-extrabold tracking-[1px] text-muted uppercase">{s.when}</span>
                </div>
                <h3 className="m-0 mb-2.5 text-xl font-extrabold tracking-[-0.4px]">{s.h}</h3>
                <p className="m-0 mb-[18px] text-[15px] leading-[1.6] text-body">{s.t}</p>
                <div className="grid gap-2">
                  {s.pts.map((p) => (
                    <span key={p} className="flex items-center gap-2.5 text-sm font-semibold">
                      <Tick size={20} />
                      {p}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <SmartLink href={brand.links.bookCall} className="btn btn-ink">
              Book a 20-minute call
            </SmartLink>
          </div>
        </div>
      </section>

      {/* 5 SERVICES */}
      <section className="sec" id="services">
        <div className="wrap">
          <PackageExplorer />
        </div>
      </section>

      {/* 6 WHY A TEAM */}
      <section className="sec bg-ink text-white">
        <div className="wrap grid grid-cols-1 items-center gap-14 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <p className="eyebrow text-faint">Why a team, not one VA</p>
            <h2 className="h2 text-white">
              No single point of <em className="text-coral">failure</em>
            </h2>
            <p className="lead mb-6 text-mist">
              Hiring one freelance VA works until they’re ill, on holiday, overloaded or gone. With {brand.name} you get
              a trained Airbnb virtual assistant team that follows the same written processes, so your guests get the
              same standard every day.
            </p>
            <SmartLink href={anchors.servicesHowWeWork} className="btn btn-coral">
              How our team works
            </SmartLink>
          </div>
          <div className="overflow-hidden rounded-[22px] bg-white text-ink">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-[13px] md:text-sm">
                <thead>
                  <tr className="bg-sand">
                    <th className="px-[18px] py-4 text-left text-xs font-extrabold text-muted">
                      <span className="sr-only-label">Feature</span>
                    </th>
                    <th className="px-3 py-4 text-left font-bold">{compare.columns[0]}</th>
                    <th className="bg-coral-50 px-3 py-4 text-left font-extrabold text-brand">{compare.columns[1]}</th>
                    <th className="px-3 py-4 text-left font-bold">{compare.columns[2]}</th>
                  </tr>
                </thead>
                <tbody>
                  {compare.rows.map(([k, a, b, c]) => (
                    <tr key={k} className="border-t border-sand-line">
                      <th scope="row" className="px-[18px] py-3.5 text-left font-bold">
                        {k}
                      </th>
                      <td className="px-3 py-3.5 text-muted">{a}</td>
                      <td className="bg-coral-25 px-3 py-3.5 font-bold">{b}</td>
                      <td className="px-3 py-3.5 text-muted">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="m-0 border-t border-sand-line px-[18px] py-3 text-xs text-subtle">{compare.note}</p>
          </div>
        </div>
      </section>

      {/* 7 WHO WE HELP */}
      <section className="sec" id="who">
        <div className="wrap">
          <div className="mb-9 text-center">
            <p className="eyebrow">Who we help</p>
            <h2 className="h2">
              Built for UK hosts <em>at every stage</em>
            </h2>
          </div>
          <WhoTabs />
        </div>
      </section>

      {/* 8 RESULTS */}
      <section className="sec border-t border-sand-line bg-cream" id="results">
        <div className="wrap">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Results</p>
              <h2 className="h2 m-0">
                What hosts get from <em>working with us</em>
              </h2>
            </div>
            <SmartLink href={routes.whoWeHelp} className="link-brand">
              See who we help →
            </SmartLink>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {cases.map((c) => (
              <figure key={c.tag} className="card m-0 flex flex-col gap-4 p-7">
                <span className="self-start rounded-full bg-sand-200 px-2.5 py-[5px] text-xs font-bold text-body">{c.tag}</span>
                <p className="font-serif m-0 text-[40px] leading-none text-brand">{c.big}</p>
                <p className="m-0 text-sm font-bold">{c.what}</p>
                <blockquote className="m-0 flex-1 text-[15px] leading-[1.6] text-body">“{c.q}”</blockquote>
                <figcaption className="m-0 border-t border-sand-line pt-3.5 text-[13px] font-bold text-muted">{c.who}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-[18px] mb-0 text-[13px] text-subtle">
            Placeholders: replace with real results and quotes shared with permission.
          </p>
        </div>
      </section>

      {/* 9 AI SEARCH */}
      <section className="py-[72px]">
        <div className="wrap">
          <div className="grid grid-cols-1 items-center gap-10 rounded-[28px] bg-violet-50 p-7 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:p-12">
            <div>
              <span className="mb-4 inline-block rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-violet">
                {aiSearch.badge}
              </span>
              <h2 className="h2 md:text-[42px]">
                {aiSearch.title} <em className="text-violet">{aiSearch.titleEm}</em>
              </h2>
              <p className="lead mb-6">{aiSearch.lead}</p>
              <div className="flex flex-wrap gap-3">
                <SmartLink href={anchors.tool("ai-readiness-listing-scorer")} className="btn btn-violet">
                  Check my AI readiness
                </SmartLink>
                <SmartLink href={anchors.service("listing")} className="btn btn-outline">
                  About listing optimisation
                </SmartLink>
              </div>
              <p className="mt-4 mb-0 text-xs text-subtle">{aiSearch.source}</p>
            </div>
            <div className="rounded-[20px] bg-white p-[22px] shadow-[0_20px_40px_rgba(91,63,160,0.12)]">
              <div className="mb-4 flex items-center gap-2.5 rounded-full border border-violet-100 px-4 py-3.5 text-[15px] text-ink-soft">
                <SearchIcon color="#5B3FA0" />
                {aiSearch.query}
              </div>
              <div className="grid gap-2">
                {aiSearch.facts.map((f) => (
                  <div key={f.t} className="flex justify-between gap-3 rounded-xl bg-violet-25 px-3.5 py-3 text-sm">
                    <span className="font-semibold">{f.t}</span>
                    <span className={cn("font-extrabold", f.good ? "text-green" : "text-brand")}>{f.s}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 mb-0 text-xs text-subtle">{aiSearch.note}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10 FREE TOOLS */}
      <section className="sec border-t border-sand-line md:pt-20" id="free">
        <div className="wrap">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Free tools and guides</p>
              <h2 className="h2 m-0">
                Free help for UK hosts, <em>with or without us</em>
              </h2>
            </div>
            <SmartLink href={routes.freeTools} className="btn btn-outline">
              See all {brand.stats.freeToolsCount} free tools
            </SmartLink>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {freebies.map((f) => (
              <SmartLink
                key={f.t}
                href={f.href}
                className="card flex items-start gap-4 p-[22px] text-ink no-underline transition-shadow hover:text-ink hover:shadow-[0_10px_28px_rgba(20,33,43,0.08)]"
              >
                <span className="flex size-[46px] flex-none items-center justify-center rounded-[14px] bg-sand">
                  <Icon name={f.icon} color="#14212B" />
                </span>
                <span className="flex-1">
                  <span className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-base font-extrabold">{f.t}</span>
                    <span className="rounded-full bg-green-50 px-2 py-[3px] text-[11px] font-extrabold text-green">{f.tag}</span>
                  </span>
                  <span className="block text-sm leading-[1.5] text-muted">{f.s}</span>
                </span>
              </SmartLink>
            ))}
          </div>
        </div>
      </section>

      {/* 11 PROMISES */}
      <section className="sec bg-sand">
        <div className="wrap">
          <div className="mb-11 text-center">
            <p className="eyebrow">Our promises</p>
            <h2 className="h2">
              What you can count on, <em>and what we’ll never do</em>
            </h2>
          </div>
          <div className="card overflow-hidden">
            <div className="grid grid-cols-1 border-b border-sand-line bg-cream md:grid-cols-2">
              <p className="m-0 px-7 py-[18px] text-[13px] font-extrabold tracking-[1px] text-green uppercase">We always</p>
              <p className="m-0 hidden border-l border-sand-line px-7 py-[18px] text-[13px] font-extrabold tracking-[1px] text-brand uppercase md:block">
                We never
              </p>
            </div>
            {promises.map(([y, n], i) => (
              <div
                key={y}
                className={cn("grid grid-cols-1 md:grid-cols-2", i < promises.length - 1 && "border-b border-sand-line")}
              >
                <div className="flex items-start gap-3 px-7 py-[18px]">
                  <Tick size={20} className="mt-px" />
                  <span className="text-[15px] leading-normal font-semibold">{y}</span>
                </div>
                <div className="flex items-start gap-3 px-7 py-[18px] md:border-l md:border-sand-line">
                  <Cross size={20} className="mt-px" />
                  <span className="text-[15px] leading-normal text-body">
                    <span className="sr-only-label">We never: </span>
                    {n}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12 PRICING */}
      <section className="sec" id="pricing">
        <div className="wrap">
          <div className="mb-11 text-center">
            <p className="eyebrow">Simple pricing</p>
            <h2 className="h2">
              Clear monthly packages, <em>no surprises</em>
            </h2>
            <p className="lead mx-auto">A simple monthly fee, not a commission on your bookings. Start with a free audit.</p>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
            {priceCards.map((p) => (
              <div
                key={p.t}
                className={cn(
                  "flex flex-col rounded-[22px] border-[1.5px] p-8",
                  p.popular ? "border-ink bg-ink text-white" : "border-sand-line bg-white text-ink",
                )}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif m-0 text-[34px] font-normal">{p.t}</h3>
                  {p.popular && (
                    <span className="rounded-full bg-coral px-2.5 py-[5px] text-xs font-extrabold text-ink">Most hosts start here</span>
                  )}
                </div>
                <p className="m-0 mb-5 text-sm leading-[1.55] opacity-80">{p.who}</p>
                <p className="m-0 mb-[22px]">
                  <span className="text-sm opacity-80">From </span>
                  <span className="text-[32px] font-extrabold tracking-[-1px]">{showPrice(prices[p.key])}</span>
                  <span className="text-sm opacity-80"> {p.unit}</span>
                </p>
                <ul className="m-0 mb-[26px] grid flex-1 list-none gap-2.5 p-0">
                  {p.inc.map((i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm font-semibold">
                      <span className="size-1.5 flex-none rounded-full bg-coral" />
                      {i}
                    </li>
                  ))}
                </ul>
                <SmartLink href={p.href} className={cn("btn w-full", p.popular ? "btn-coral" : "btn-outline")}>
                  {p.cta}
                </SmartLink>
              </div>
            ))}
          </div>
          <p className="mt-6 mb-0 text-center text-[15px] text-body">
            If we’re not the right fit, we’ll tell you, and you keep the audit.{" "}
            <SmartLink href={routes.pricing} className="link-brand">
              See full pricing →
            </SmartLink>
          </p>
        </div>
      </section>

      {/* 13 FAQ */}
      <section className="sec border-t border-sand-line bg-cream">
        <div className="wrap grid grid-cols-1 items-start gap-14 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="h2">
              Questions hosts ask about <em>Airbnb VAs</em>
            </h2>
            <p className="lead mb-[22px]">Can’t see yours? Ask us on a free 20-minute call.</p>
            <SmartLink href={brand.links.bookCall} className="btn btn-outline">
              Book a call
            </SmartLink>
          </div>
          <Faq items={faq} variant="home" />
        </div>
      </section>

      {/* 14 FINAL CTA */}
      <section className="bg-coral py-16 md:py-24">
        <div className="wrap text-center">
          <h2 className="font-serif mx-auto mb-4 max-w-[820px] text-[40px] leading-[1.02] font-normal tracking-[-1px] text-ink md:text-[60px]">
            {finalCta.title}
          </h2>
          <p className="mx-auto mb-[30px] max-w-[560px] text-[17px] leading-[1.6] text-ink">{finalCta.text}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <SmartLink href={brand.links.freeAudit} className="btn btn-ink">
              Get a free listing audit
            </SmartLink>
            <SmartLink href={brand.links.bookCall} className="btn btn-white">
              Book a 20-minute call
            </SmartLink>
          </div>
          <p className="mt-[22px] mb-0 text-sm font-semibold text-ink">{finalCta.footnote}</p>
        </div>
      </section>
    </>
  );
}
