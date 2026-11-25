import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { InfoBadge } from "@/components/tools/Badges";
import { RulesLastCheckedBadge } from "@/components/tools/RulesLastChecked";
import { SourceLink } from "@/components/tools/SourceLink";
import { TrackedLink } from "@/components/tools/TrackedLink";
import { BusinessRatesSection } from "@/components/tools/business-rates/BusinessRatesSection";
import { BusinessRatesResultProvider, WhatThisMeans } from "@/components/tools/business-rates/ResultContext";
import { toolSlug } from "@/content/tools/businessRates";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { getFigures } from "@/lib/server/figures";
import { fillTemplate, formatDate } from "@/lib/tools/figures";
import { buildFaq, changelog, hero, howItWorks, limits, nextStep, premiumText, related } from "./content";
import { seo } from "./seo";

export default async function BusinessRatesPage() {
  const figures = await getFigures();
  const fill = (s: string) => fillTemplate(s, figures, { premiumText: premiumText(figures) });
  const source = (key: string) => ({ title: figures[key]?.sourceTitle ?? "", url: figures[key]?.sourceUrl ?? null });
  const relatedTools = related.ids.map(toolById).filter((t) => !!t);

  return (
    <BusinessRatesResultProvider>
      {/* 1. HERO */}
      <section className="border-b border-line bg-white">
        <div className="wrap pt-10 pb-10 md:pt-12">
          <Breadcrumbs seo={seo} separator="›" />
          <h1 className="m-0 mt-5 mb-4 max-w-[860px] text-[34px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[52px]">{hero.title}</h1>
          <p className="m-0 max-w-[780px] text-[17px] leading-[1.65] text-ink-copy md:text-lg">{hero.shortAnswer}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <RulesLastCheckedBadge />
            {hero.nations.map((n) => (
              <InfoBadge key={n}>{n}</InfoBadge>
            ))}
            <InfoBadge dot="#14212B">{hero.job}</InfoBadge>
          </div>
        </div>
      </section>

      {/* 2. THE TOOL (inputs + live result) */}
      <section className="pt-8 pb-14 md:pt-10" id="checker">
        <div className="wrap">
          <BusinessRatesSection />
        </div>
      </section>

      {/* 3. WHAT THIS MEANS + 4. NEXT STEP */}
      <section className="pb-14">
        <div className="wrap grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="rounded-[20px] border border-line bg-white p-6 md:p-8">
            <h2 className="h2">What this means</h2>
            <WhatThisMeans className="m-0 text-base leading-[1.7] text-ink-copy" />
          </div>
          <div className="flex flex-col rounded-[20px] bg-coral-50 p-6 md:p-8">
            <p className="eyebrow">{nextStep.eyebrow}</p>
            <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold tracking-[-0.5px]">{nextStep.title}</h2>
            <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-ink-copy">{nextStep.text}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <TrackedLink href={nextStep.href} event="next_step_clicked" toolSlug={toolSlug} className="btn btn-ink">
                {nextStep.cta} →
              </TrackedLink>
              <Link href={nextStep.secondary.href} className="text-sm font-bold text-brand">
                {nextStep.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="border-y border-line bg-white">
        <div className="wrap sec">
          <h2 className="h2 mb-2">{howItWorks.title}</h2>
          <p className="lead m-0 mb-7 max-w-[760px]">{howItWorks.intro}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {howItWorks.nations.map((n) => (
              <article key={n.key} className="flex flex-col rounded-[18px] bg-cloud-2 p-6">
                <h3 className="m-0 mb-2 text-lg font-extrabold">{n.name}</h3>
                <p className="m-0 mb-4 flex-1 text-[15px] leading-[1.65] text-ink-copy">{fill(n.text)}</p>
                <SourceLink source={source(n.sourceKey)} />
                <Link href={n.rulesHub} className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-brand no-underline hover:underline">
                  Details in the Rules Hub →
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-[18px] border border-line p-6">
            <h3 className="m-0 mb-2 text-lg font-extrabold">{howItWorks.premium.name}</h3>
            <p className="m-0 mb-3 text-[15px] leading-[1.65] text-ink-copy">{fill(howItWorks.premium.text)}</p>
            <ul className="m-0 grid list-none gap-1 p-0">
              {howItWorks.premium.sourceKeys.map((k) => (
                <li key={k}>
                  <SourceLink source={source(k)} />
                </li>
              ))}
            </ul>
            <Link href={howItWorks.premium.rulesHub} className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-brand no-underline hover:underline">
              Second-home premiums in the Rules Hub →
            </Link>
          </div>
          <p className="m-0 mt-4 text-sm leading-[1.6] text-body">{howItWorks.note}</p>
        </div>
      </section>

      {/* 6. LIMITS */}
      <section className="sec pb-0">
        <div className="wrap max-w-[860px]">
          <h2 className="h2 mb-3">{limits.title}</h2>
          <p className="m-0 mb-4 text-[15px] leading-[1.65] text-ink-copy">{limits.text}</p>
          <p className="m-0 rounded-[14px] bg-amber-25 px-[18px] py-4 text-sm leading-[1.6] font-semibold text-ink-copy">{limits.disclaimer}</p>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="sec">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2 mb-5">Questions about holiday let business rates</h2>
          <Faq items={buildFaq(figures)} variant="tools" />
        </div>
      </section>

      {/* 8. RELATED TOOLS + 9. CHANGELOG */}
      <section className="pb-[72px]">
        <div className="wrap">
          <h2 className="h2 mb-5">{related.title}</h2>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {relatedTools.map((t) => (
              <Link
                key={t.id}
                href={toolLink(t)}
                className="flex min-h-[150px] flex-col gap-2 rounded-[18px] border border-line bg-white p-5 text-ink no-underline hover:border-ink hover:text-ink"
              >
                <span className={`pill self-start ${isLive(t) ? "bg-green-100 text-green" : "bg-fog text-muted"}`}>{isLive(t) ? "Free" : "Coming soon"}</span>
                <span className="text-[17px] font-extrabold">{t.name}</span>
                <span className="text-sm text-body">{t.q}</span>
              </Link>
            ))}
          </div>

          <div className="mt-10 max-w-[860px]">
            <h2 className="m-0 mb-3 text-lg font-extrabold">Changelog</h2>
            <ul className="m-0 grid list-none gap-2 p-0">
              {changelog.map((c) => (
                <li key={c.date + c.note} className="flex flex-wrap gap-x-3 text-sm leading-[1.6] text-ink-copy">
                  <time dateTime={c.date} className="font-bold text-ink">
                    {formatDate(c.date)}
                  </time>
                  <span>{c.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </BusinessRatesResultProvider>
  );
}
