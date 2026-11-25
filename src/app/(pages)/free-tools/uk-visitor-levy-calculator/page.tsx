import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { InfoBadge } from "@/components/tools/Badges";
import { TrackedLink } from "@/components/tools/TrackedLink";
import { LevyResultProvider, WhatThisMeans } from "@/components/tools/visitor-levy/ResultContext";
import { VisitorLevySection } from "@/components/tools/visitor-levy/VisitorLevySection";
import { routes } from "@/config/navigation";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { copy, toolSlug } from "@/content/tools/visitorLevy";
import { getFigures } from "@/lib/server/figures";
import { formatDate } from "@/lib/tools/figures";
import { formatPence, listAreas, nationNames, rateText } from "@/lib/tools/visitor-levy";
import { buildFaq, changelog, hero, limits, nextStep, related, rulesHub } from "./content";
import { seo } from "./seo";

export default async function VisitorLevyPage() {
  const figures = await getFigures();
  const areas = listAreas(figures);
  const checked = typeof figures.rulesLastChecked?.value === "string" ? formatDate(figures.rulesLastChecked.value) : "";
  const relatedTools = related.ids.map(toolById).filter((t) => !!t);

  return (
    <LevyResultProvider>
      {/* 1. HERO */}
      <section className="border-b border-line bg-white">
        <div className="wrap pt-10 pb-10 md:pt-12">
          <Breadcrumbs seo={seo} separator="›" />
          <h1 className="m-0 mt-5 mb-4 max-w-[860px] text-[34px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[52px]">{hero.title}</h1>
          <p className="m-0 max-w-[780px] text-[17px] leading-[1.65] text-ink-copy md:text-lg">{hero.shortAnswer}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <InfoBadge dot="#2E8B57">Rates last checked {checked}</InfoBadge>
            <InfoBadge dot="#14212B">{hero.badges[0]}</InfoBadge>
            <InfoBadge dot="#14212B">{hero.badges[1]}</InfoBadge>
            <InfoBadge dot="#F0595A">{hero.badges[2]}</InfoBadge>
          </div>
          <p className="m-0 mt-4 flex items-center gap-2 text-sm font-semibold text-ink-copy">
            <span aria-hidden="true">🔒</span>
            {copy.privacy}
          </p>
        </div>
      </section>

      {/* 2–4. AREA STRIP, CALCULATOR, LEVY LOG */}
      <section className="pt-8 pb-14 md:pt-10">
        <div className="wrap">
          <VisitorLevySection />
        </div>
      </section>

      {/* 5. WHAT THIS MEANS + 6. NEXT STEP */}
      <section className="pb-14">
        <div className="wrap grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="rounded-[20px] border border-line bg-white p-6 md:p-8">
            <h2 className="h2">What this means</h2>
            <WhatThisMeans
              className="m-0 text-base leading-[1.7] text-ink-copy"
              fallback="Each area sets its own rate, night cap and start date. Pick an area and enter the stay to see the levy to add to the guest’s total."
            />
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

      {/* 7. HOW IT WORKS + 8. LIMITS */}
      <section className="border-y border-line bg-white">
        <div className="wrap sec">
          <h2 className="h2 mb-3">How it works</h2>
          <p className="m-0 mb-5 max-w-[820px] text-[15px] leading-[1.65] text-ink-copy">
            Each night is charged by its own date, so nights before an area’s start date aren’t charged. Percentage levies use the price excluding VAT and are worked out in pence, rounded to the nearest penny at the end. Per-person levies are nights × guests × the rate.
          </p>
          <div className="overflow-x-auto rounded-[16px] border border-line" role="region" aria-label="Visitor levy areas table" tabIndex={0}>
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <caption className="sr-only-label">Visitor levy areas, rates and start dates</caption>
              <thead>
                <tr className="bg-cloud">
                  {["Area", "Type", "Rate", "Night cap", "Starts", "Exemptions noted", "Official source"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 text-xs font-extrabold tracking-[0.6px] text-muted uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {areas.map((a) => (
                  <tr key={a.id} className="border-t border-line align-top">
                    <th scope="row" className="px-4 py-3 font-extrabold text-ink">
                      {a.name}
                      <span className="block text-[12px] font-semibold text-muted">{nationNames[a.nation]}</span>
                    </th>
                    <td className="px-4 py-3 text-ink-copy">{a.type === "percent" ? "% of accommodation cost (ex VAT)" : "Per person per night"}</td>
                    <td className="px-4 py-3 font-bold whitespace-nowrap text-ink">
                      {rateText(a)}
                      {a.lowerRate !== null && <span className="block font-semibold text-ink-copy">{formatPence(a.lowerRate)} hostels and campsites</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-copy">{a.nightCap ? `First ${a.nightCap} nights` : a.maxNightsCharged ? `First ${a.maxNightsCharged} nights` : "None"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-copy">{formatDate(a.start)}</td>
                    <td className="px-4 py-3 text-ink-copy">{a.exemptBookedPaidBefore ? `Booked and paid before ${formatDate(a.exemptBookedPaidBefore)}` : "See the council’s page"}</td>
                    <td className="px-4 py-3">
                      {a.url ? (
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="font-bold text-brand underline underline-offset-2">
                          {a.sourceTitle}
                          <span className="sr-only-label"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        a.sourceTitle
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="m-0 mt-3 text-[13px] text-muted">
            Fees such as cleaning aren’t included unless the area’s guidance says they count. VAT is removed at {String(figures["vat.standardRate"]?.value ?? "")}%.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <h2 className="h2 mb-4">{limits.title}</h2>
              <p className="m-0 mb-4 text-[15px] leading-[1.65] text-ink-copy">{limits.text}</p>
              <p className="m-0 flex flex-wrap gap-x-5 text-sm">
                <Link href={rulesHub.levy} className="inline-flex min-h-11 items-center font-bold text-brand">
                  Visitor levies in the Rules Hub →
                </Link>
                <Link href={rulesHub.pricing} className="inline-flex min-h-11 items-center font-bold text-brand">
                  Showing the full price →
                </Link>
              </p>
            </div>
            <p className="m-0 self-start rounded-[14px] bg-amber-25 px-[18px] py-4 text-sm leading-[1.6] font-semibold text-ink-copy">{limits.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="sec">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2 mb-5">Questions about visitor levies</h2>
          <Faq items={buildFaq(figures)} variant="tools" />
        </div>
      </section>

      {/* 10. RELATED TOOLS + 11. CHANGELOG */}
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
    </LevyResultProvider>
  );
}
