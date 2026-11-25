import { brand } from "@/config/brand";
import { anchors, routes } from "@/config/navigation";
import { prices, showPrice, singleServicePrices } from "@/config/pricing";
import { cn } from "@/lib/cn";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { Dash, Tick } from "@/components/ui/Marks";
import { SmartLink } from "@/components/ui/SmartLink";
import { CommissionCompare } from "./_components/CommissionCompare";
import { Estimator } from "./_components/Estimator";
import { excluded, faq, hero, included, packageCards, singles, vatNote } from "./content";
import { seo } from "./seo";


const PILL: Record<string, string> = {
  Run: "bg-ink text-white",
  Grow: "bg-coral-50 text-brand",
  Build: "bg-sand text-ink",
};

export default function PricingPage() {
  return (
    <>
      {/* HERO */}
      <section className="pt-14 pb-10 text-center md:pt-[72px]">
        <div className="wrap">
          <Breadcrumbs seo={seo} className="mb-6" />
          <h1 className="font-jakarta mx-auto mb-[18px] max-w-[820px] text-[40px] leading-[1.06] font-extrabold tracking-[-2px] md:text-[54px]">
            {hero.titleStart} <span className="text-brand">{hero.titleAccent}</span>
          </h1>
          <p className="lead mx-auto mb-[26px] max-w-[680px] text-[17px]">{hero.lead}</p>
          <ul className="m-0 flex list-none flex-wrap justify-center gap-5 p-0 text-sm font-semibold text-body">
            {hero.trust.map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <Tick />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="pt-6 pb-[88px]" id="packages">
        <div className="wrap">
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
            {packageCards.map((p) => (
              <div
                key={p.t}
                className={cn(
                  "relative flex flex-col rounded-[22px] border p-8",
                  p.popular ? "border-ink bg-ink text-white shadow-[0_24px_50px_rgba(20,33,43,0.18)]" : "border-linen bg-white text-ink",
                )}
              >
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-jakarta m-0 text-[26px] font-extrabold tracking-[-0.8px]">{p.t}</h2>
                  {p.popular && (
                    <span className="rounded-full bg-coral px-2.5 py-1.5 text-xs font-extrabold text-ink">Most hosts start here</span>
                  )}
                </div>
                <p className={cn("m-0 mb-[22px] text-sm leading-[1.55]", p.popular ? "text-mist" : "text-muted")}>{p.who}</p>
                <p className="m-0 mb-1">
                  <span className={cn("text-sm", p.popular ? "text-mist" : "text-muted")}>From </span>
                  <span className="font-jakarta text-[42px] font-extrabold tracking-[-1.5px]">{showPrice(prices[p.priceKey])}</span>
                </p>
                <p className={cn("m-0 mb-6 text-[13px]", p.popular ? "text-mist" : "text-muted")}>{p.unit}</p>
                <SmartLink href={p.href} className={cn("btn mb-6 w-full", p.popular ? "btn-coral" : "btn-outline")}>
                  {p.cta}
                </SmartLink>
                <p className={cn("m-0 mb-3 text-xs font-extrabold tracking-[1px] uppercase", p.popular ? "text-mist" : "text-muted")}>
                  What’s included
                </p>
                <ul className="m-0 grid list-none gap-[11px] p-0">
                  {p.inc.map((i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-[1.45] font-semibold">
                      <Tick className="mt-px" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-[18px] mb-0 text-center text-[13px] text-subtle">{vatNote}</p>
        </div>
      </section>

      {/* ESTIMATOR */}
      <section className="sec border-y border-linen bg-white" id="estimate">
        <div className="wrap">
          <div className="mb-10 text-center">
            <p className="eyebrow">Estimate your cost</p>
            <h2 className="h2">Build your monthly estimate</h2>
            <p className="lead mx-auto max-w-[560px]">
              Choose how many properties and what you need. You’ll get a final quote after a free call.
            </p>
          </div>
          <Estimator />
        </div>
      </section>

      {/* FEE VS COMMISSION */}
      <section className="sec">
        <div className="wrap grid grid-cols-1 items-center gap-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <p className="eyebrow">Monthly fee vs commission</p>
            <h2 className="h2">See the difference on your own numbers</h2>
            <p className="lead mb-4">
              Many full management companies charge a percentage of your booking income. We charge a fixed monthly fee,
              so when you earn more, you keep more.
            </p>
            <p className="m-0 text-[13px] text-subtle">
              Enter the commission rate you’ve been quoted. Full management usually includes on-site work we don’t do,
              so compare like for like.
            </p>
          </div>
          <CommissionCompare />
        </div>
      </section>

      {/* SINGLE SERVICES */}
      <section className="sec border-t border-linen bg-white">
        <div className="wrap">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Single services</p>
              <h2 className="h2 m-0">Just need one thing?</h2>
            </div>
            <SmartLink href={routes.services} className="btn btn-outline">
              See all services
            </SmartLink>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-cream">
                  {["Service", "Package", "Billing"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3.5 text-left text-xs font-extrabold tracking-[1px] text-muted uppercase first:px-5"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-right text-xs font-extrabold tracking-[1px] text-muted uppercase">From</th>
                </tr>
              </thead>
              <tbody>
                {singles.map((r) => (
                  <tr key={r.t} className="border-t border-linen-row">
                    <td className="px-5 py-3.5">
                      <SmartLink href={anchors.service(r.serviceId)} className="font-extrabold text-ink no-underline hover:text-brand">
                        {r.t}
                      </SmartLink>
                      <span className="mt-0.5 block text-[13px] text-muted">{r.s}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-extrabold", PILL[r.p])}>{r.p}</span>
                    </td>
                    <td className="px-3 py-3.5 text-body">{r.b}</td>
                    <td className="px-5 py-3.5 text-right font-extrabold">{showPrice(singleServicePrices[r.serviceId] ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* INCLUDED / NOT */}
      <section className="sec">
        <div className="wrap">
          <div className="mb-10 text-center">
            <p className="eyebrow">No surprises</p>
            <h2 className="h2">What’s included, and what you pay for separately</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="card p-[30px]">
              <h3 className="font-jakarta m-0 mb-[18px] text-xl font-extrabold text-green">Included in every plan</h3>
              <ul className="m-0 grid list-none gap-[13px] p-0">
                {included.map((x) => (
                  <li key={x} className="flex items-start gap-3 text-[15px] leading-normal font-semibold">
                    <Tick className="mt-0.5" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-[30px]">
              <h3 className="font-jakarta m-0 mb-[18px] text-xl font-extrabold text-body">Paid by you, directly</h3>
              <ul className="m-0 grid list-none gap-[13px] p-0">
                {excluded.map((x) => (
                  <li key={x} className="flex items-start gap-3 text-[15px] leading-normal text-body">
                    <Dash className="mt-0.5" />
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-[18px] mb-0 text-[13px] text-subtle">We never add a mark-up to your cleaner or trade invoices [confirm].</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec border-t border-linen bg-white">
        <div className="wrap grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div>
            <p className="eyebrow">Pricing FAQ</p>
            <h2 className="h2">Questions about cost</h2>
            <p className="lead mb-5">Still unsure? We’ll talk it through on a free call.</p>
            <SmartLink href={brand.links.bookCall} className="btn btn-outline">
              Book a 20-minute call
            </SmartLink>
          </div>
          <Faq items={faq} variant="pricing" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-[88px]">
        <div className="wrap">
          <div className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-coral p-7 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] md:p-12">
            <div>
              <h2 className="font-jakarta m-0 mb-2.5 text-[30px] leading-[1.12] font-extrabold tracking-[-1.2px] text-ink md:text-4xl">
                Start with a free audit. Decide after.
              </h2>
              <p className="m-0 text-base leading-[1.6] text-ink">
                We’ll review your listing and tell you what we’d fix first. If we’re not the right fit, we’ll say so, and
                you keep the audit.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <SmartLink href={brand.links.freeAudit} className="btn btn-ink">
                Get a free listing audit
              </SmartLink>
              <SmartLink href={brand.links.bookCall} className="btn btn-white">
                Book a 20-minute call
              </SmartLink>
              {isLive(toolById("short-let-profit-calculator")) && (
                <SmartLink href={toolLink(toolById("short-let-profit-calculator")!)} className="text-center text-sm font-bold text-ink underline underline-offset-2" data-profit-link>
                  Or work out your real profit first (free tool) →
                </SmartLink>
              )}
              {isLive(toolById("ai-readiness-listing-scorer")) && (
                <SmartLink href={toolLink(toolById("ai-readiness-listing-scorer")!)} className="text-center text-sm font-bold text-ink underline underline-offset-2" data-scorer-link>
                  Or check your AI readiness yourself (free tool) →
                </SmartLink>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
