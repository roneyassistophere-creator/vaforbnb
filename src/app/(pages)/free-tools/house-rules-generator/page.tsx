import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { InfoBadge } from "@/components/tools/Badges";
import { RulesLastCheckedBadge } from "@/components/tools/RulesLastChecked";
import { HouseRulesSection } from "@/components/tools/house-rules/HouseRulesSection";
import { HouseRulesResultProvider, KitBadge, NextStepCard, WhatThisMeans } from "@/components/tools/house-rules/ResultContext";
import { routes } from "@/config/navigation";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { copy } from "@/content/tools/houseRules";
import { formatDate } from "@/lib/tools/figures";
import { changelog, faq, hero, howItWorks, limits, nextStep, related } from "./content";
import { seo } from "./seo";

export default function HouseRulesPage() {
  const relatedTools = related.ids.map(toolById).filter((t) => !!t);

  return (
    <HouseRulesResultProvider>
      {/* 1. HERO */}
      <section className="border-b border-line bg-white">
        <div className="wrap pt-10 pb-10 md:pt-12">
          <Breadcrumbs seo={seo} separator="›" />
          <h1 className="m-0 mt-5 mb-4 max-w-[860px] text-[34px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[52px]">{hero.title}</h1>
          <p className="m-0 max-w-[780px] text-[17px] leading-[1.65] text-ink-copy md:text-lg">{hero.shortAnswer}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <RulesLastCheckedBadge />
            <InfoBadge dot="#14212B">{hero.badges[0]}</InfoBadge>
            <InfoBadge dot="#F0595A">{hero.badges[1]}</InfoBadge>
            <KitBadge label={hero.kitBadge} />
          </div>
          <p className="m-0 mt-4 flex items-center gap-2 text-sm font-semibold text-ink-copy">
            <span aria-hidden="true">🔒</span>
            {copy.privacy}
          </p>
        </div>
      </section>

      {/* 2. THE TOOL */}
      <section className="pt-8 pb-14 md:pt-10">
        <div className="wrap">
          <HouseRulesSection />
        </div>
      </section>

      {/* 3. WHAT THIS MEANS + 4. NEXT STEP */}
      <section className="pb-14">
        <div className="wrap grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="rounded-[20px] border border-line bg-white p-6 md:p-8">
            <h2 className="h2">What this means</h2>
            <WhatThisMeans
              className="m-0 text-base leading-[1.7] text-ink-copy"
              fallback="Your rules always include what’s required: assistance dogs welcome and no parties. Copy the listing version into your platform, then set the matching settings."
            />
          </div>
          <NextStepCard regular={nextStep} />
        </div>
      </section>

      {/* 5. HOW IT WORKS + 6. LIMITS */}
      <section className="border-y border-line bg-white">
        <div className="wrap sec">
          <h2 className="h2 mb-2">How it works</h2>
          <p className="m-0 mb-6 max-w-[760px] text-[15px] leading-[1.65] text-ink-copy">
            Every sentence comes from our stored wording, in the tone you choose. Some rules are always included, and a fair-rules checker reads anything you write yourself.
          </p>
          <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((h) => (
              <li key={h.title} className="rounded-[16px] border border-line p-5">
                <h3 className="m-0 mb-1.5 text-[16px] font-extrabold">{h.title}</h3>
                <p className="m-0 mb-2 text-sm leading-[1.6] text-ink-copy">{h.text}</p>
                <p className="m-0 text-[13px] text-muted">
                  Source: {h.source} ·{" "}
                  <Link href={h.href} className="font-bold text-brand">
                    Rules Hub →
                  </Link>
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <h2 className="h2 mb-4">{limits.title}</h2>
              <p className="m-0 text-[15px] leading-[1.65] text-ink-copy">{limits.text}</p>
            </div>
            <p className="m-0 self-start rounded-[14px] bg-amber-25 px-[18px] py-4 text-sm leading-[1.6] font-semibold text-ink-copy">{limits.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="sec">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2 mb-5">Questions about house rules</h2>
          <Faq items={faq} variant="tools" />
        </div>
      </section>

      {/* 8. RELATED TOOLS + 9. CHANGELOG */}
      <section className="pb-[96px] md:pb-[72px]">
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
            <Link
              href={routes.freeTools}
              className="flex min-h-[150px] flex-col justify-center gap-2 rounded-[18px] border border-dashed border-line-strong p-5 text-ink no-underline hover:border-ink hover:text-ink"
            >
              <span className="text-[17px] font-extrabold">All free tools →</span>
              <span className="text-sm text-body">Rules, bookings, numbers and time savers.</span>
            </Link>
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
    </HouseRulesResultProvider>
  );
}
