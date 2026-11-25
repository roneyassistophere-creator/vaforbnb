import Link from "next/link";
import { brand } from "@/config/brand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { SmartLink } from "@/components/ui/SmartLink";
import { InfoBadge } from "@/components/tools/Badges";
import { TrackedLink } from "@/components/tools/TrackedLink";
import { ComplianceCheckerSection, RulesLastCheckedBadge } from "@/components/tools/compliance-checker/ComplianceCheckerSection";
import { ComplianceResultProvider, WhatThisMeans } from "@/components/tools/compliance-checker/ResultContext";
import { RelatedForResult } from "@/components/tools/compliance-checker/RelatedForResult";
import { toolSlug } from "@/content/tools/complianceChecker";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { faq, hero, howItWorks, limits, nextStep, related, rulesHubCta } from "./content";
import { seo } from "./seo";

export default function ComplianceCheckerPage() {
  return (
    <ComplianceResultProvider>
      {/* 1. HERO */}
      <section className="border-b border-line bg-white">
        <div className="wrap pt-10 pb-10 md:pt-12">
          <Breadcrumbs seo={seo} separator="›" />
          <h1 className="m-0 mt-5 mb-4 max-w-[860px] text-[34px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[52px]">{hero.title}</h1>
          <p className="m-0 max-w-[780px] text-[17px] leading-[1.65] text-ink-copy md:text-lg">{hero.shortAnswer}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <RulesLastCheckedBadge />
            <InfoBadge dot="#F0595A">{hero.kitBadge}</InfoBadge>
          </div>
        </div>
      </section>

      {/* 2–3. THE TOOL (questions, live tally, results) */}
      <section className="pt-8 pb-14 md:pt-10" id="checker">
        <div className="wrap">
          <ComplianceCheckerSection />
        </div>
      </section>

      {/* 4. WHAT THIS MEANS + 5. NEXT STEP */}
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
            <TrackedLink href={nextStep.href} event="next_step_clicked" toolSlug={toolSlug} className="btn btn-ink self-start">
              {nextStep.cta} →
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS + 7. LIMITS */}
      <section className="border-y border-line bg-white">
        <div className="wrap sec grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h2 className="h2 mb-4">{howItWorks.title}</h2>
            <ul className="m-0 grid list-none gap-3 p-0">
              {howItWorks.points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-[1.65] text-ink-copy">
                  <span aria-hidden="true" className="mt-[9px] size-2 flex-none rounded-full bg-coral" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="h2 mb-4">{limits.title}</h2>
            <p className="m-0 mb-4 text-[15px] leading-[1.65] text-ink-copy">{limits.text}</p>
            <p className="m-0 rounded-[14px] bg-amber-25 px-[18px] py-4 text-sm leading-[1.6] font-semibold text-ink-copy">{limits.disclaimer}</p>
            <p className="m-0 mt-5 text-[15px] leading-[1.6] text-ink-copy">
              {rulesHubCta.text}{" "}
              <Link href={rulesHubCta.href} className="font-bold text-brand">
                {rulesHubCta.label} →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="sec">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2 mb-5">Questions about UK short-let rules</h2>
          <Faq items={faq} variant="tools" />
        </div>
      </section>

      {/* 9. RELATED TOOLS + AUDIT */}
      <section className="pb-[72px]">
        <div className="wrap">
          <h2 className="h2 mb-5">{related.title}</h2>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            <RelatedForResult />
            {[...related.whenLive.map(toolById).filter((t) => isLive(t)), ...related.ids.map(toolById)]
              .filter((t) => !!t)
              .map((t) => (
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
            <div className="flex min-h-[150px] flex-col gap-2 rounded-[18px] bg-ink p-5 text-white">
              <span className="text-[17px] font-extrabold">Want us to check your listing too?</span>
              <span className="flex-1 text-sm text-mist">Our team reviews your listing, pricing and guest messages for free.</span>
              <SmartLink href={brand.links.freeAudit} className="btn btn-coral self-start">
                Get a free listing audit
              </SmartLink>
            </div>
          </div>
        </div>
      </section>
    </ComplianceResultProvider>
  );
}
