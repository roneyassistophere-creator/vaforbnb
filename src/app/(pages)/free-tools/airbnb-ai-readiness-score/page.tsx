import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { InfoBadge } from "@/components/tools/Badges";
import { AiReadinessSection } from "@/components/tools/ai-readiness/AiReadinessSection";
import { AiReadinessResultProvider, KitBadge, NextStepCard, WhatThisMeans } from "@/components/tools/ai-readiness/ResultContext";
import { routes } from "@/config/navigation";
import { copy } from "@/content/tools/aiReadiness";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { getFigures } from "@/lib/server/figures";
import { readContent } from "@/lib/tools/ai-readiness";
import { formatDate } from "@/lib/tools/figures";
import { changelogNotes, faq, hero, howItWorks, keyPoints, limits, listingAiHref, nextStep, related, whatThisMeansFallback } from "./content";
import { seo } from "./seo";

/** Stored model (version, points, source), read on the server so it's in the page's HTML. */
async function model() {
  const figures = await getFigures();
  return { ...readContent(figures), checked: figures["aiReadiness.model"]?.lastChecked ?? "" };
}

async function LastUpdatedBadge() {
  const m = await model();
  return <InfoBadge dot="#2E8B57">Last updated {formatDate(m.model.versionDate)}</InfoBadge>;
}

async function HowItWorksTable() {
  const { model: M, source } = await model();
  return (
    <>
      <div className="overflow-x-auto rounded-[16px] border border-line">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <caption className="sr-only-label">The eight checks and their points</caption>
          <thead className="bg-cloud-2 text-[12px] tracking-[0.6px] text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-extrabold">Check</th>
              <th className="px-4 py-3 font-extrabold">What it looks for</th>
              <th className="px-4 py-3 text-right font-extrabold">Points</th>
            </tr>
          </thead>
          <tbody>
            {M.checks.map((c) => (
              <tr key={c.id} className="border-t border-line align-top">
                <th scope="row" className="px-4 py-3 font-extrabold whitespace-nowrap text-ink">
                  {c.id}. {c.name}
                </th>
                <td className="px-4 py-3 leading-[1.55] text-ink-copy">{howItWorks.checks[c.id]}</td>
                <td className="px-4 py-3 text-right font-extrabold tabular-nums">{c.max}</td>
              </tr>
            ))}
            <tr className="border-t border-line bg-cloud-2">
              <th scope="row" className="px-4 py-3 font-extrabold" colSpan={2}>
                Total
              </th>
              <td className="px-4 py-3 text-right font-extrabold tabular-nums">{M.checks.reduce((s, c) => s + c.max, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="m-0 mt-3 text-[13px] text-muted">
        Bands:{" "}
        {M.bands
          .map((b, n) => {
            const next = M.bands[n + 1];
            return `${b.min}–${next ? next.min - 1 : 100} ${b.label}`;
          })
          .join(" · ")}
        . Scoring model v{M.version}.
      </p>
      <p className="m-0 mt-5 rounded-[14px] bg-violet-50 px-[18px] py-4 text-sm leading-[1.6] text-ink-copy">
        <strong className="text-violet">Honest note:</strong> {howItWorks.honest}
      </p>
      <p className="m-0 mt-3 text-[13px] text-muted">
        Source:{" "}
        <a href={source.url} className="font-bold text-brand" rel="noopener" target="_blank">
          {source.title}
        </a>{" "}
        ({formatDate(source.date)}). ·{" "}
        <Link href={listingAiHref} className="font-bold text-brand">
          What AI search changes →
        </Link>
      </p>
    </>
  );
}

async function Changelog() {
  const { model: M } = await model();
  const v = new Date(`${M.versionDate}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      <li className="flex flex-wrap gap-x-3 text-sm leading-[1.6] text-ink-copy" data-model-version>
        <time dateTime={M.versionDate} className="font-bold text-ink">
          {formatDate(M.versionDate)}
        </time>
        <span>
          Scoring v{M.version}, {v}
        </span>
      </li>
      {changelogNotes.map((c) => (
        <li key={c.date + c.note} className="flex flex-wrap gap-x-3 text-sm leading-[1.6] text-ink-copy">
          <time dateTime={c.date} className="font-bold text-ink">
            {formatDate(c.date)}
          </time>
          <span>{c.note}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AiReadinessPage() {
  const relatedTools = related.ids.map(toolById).filter((t) => !!t);

  return (
    <AiReadinessResultProvider>
      {/* 1. HERO */}
      <section className="border-b border-line bg-white">
        <div className="wrap pt-10 pb-10 md:pt-12">
          <Breadcrumbs seo={seo} separator="›" />
          <h1 className="m-0 mt-5 mb-4 max-w-[900px] text-[34px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[52px]">
            Is my listing ready for <span className="text-violet">Airbnb’s AI search?</span>
          </h1>
          <p className="m-0 max-w-[800px] text-[17px] leading-[1.65] text-ink-copy md:text-lg">{hero.shortAnswer}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <InfoBadge dot="#5B3FA0">{hero.badges[0]}</InfoBadge>
            <InfoBadge dot="#F0595A">{hero.badges[1]}</InfoBadge>
            <InfoBadge dot="#14212B">{hero.badges[2]}</InfoBadge>
            <LastUpdatedBadge />
            <KitBadge label={hero.kitBadge} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="#how-it-works" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-50 px-4 text-sm font-bold text-violet no-underline hover:text-violet-deep">
              <span aria-hidden="true">ⓘ</span>
              {hero.honest}
            </a>
            <p className="m-0 flex items-center gap-2 text-sm font-semibold text-ink-copy">
              <span aria-hidden="true">🔒</span>
              {copy.privacy}
            </p>
          </div>
        </div>
      </section>

      {/* 2. KEY POINTS */}
      <section className="pt-8 md:pt-10">
        <div className="wrap">
          <div className="rounded-[20px] bg-violet-50 p-6 md:p-7">
            <h2 className="m-0 mb-3 text-[13px] font-extrabold tracking-[1.2px] text-violet uppercase">Key points</h2>
            <ul className="m-0 grid list-none gap-2.5 p-0 md:grid-cols-2">
              {keyPoints.map((k) => (
                <li key={k} className="flex gap-2.5 text-[15px] leading-[1.55] font-semibold text-ink">
                  <span aria-hidden="true" className="mt-[7px] size-2 flex-none rounded-full bg-violet" />
                  {k}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3–4. THE TOOL AND RESULTS */}
      <section className="pt-8 pb-14 md:pt-10">
        <div className="wrap">
          <AiReadinessSection />
        </div>
      </section>

      {/* 5. WHAT THIS MEANS + 6. NEXT STEP */}
      <section className="pb-14">
        <div className="wrap grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="rounded-[20px] border border-line bg-white p-6 md:p-8">
            <h2 className="h2">What this means</h2>
            <WhatThisMeans className="m-0 text-base leading-[1.7] text-ink-copy" fallback={whatThisMeansFallback} />
          </div>
          <NextStepCard regular={nextStep} />
        </div>
      </section>

      {/* 7. HOW IT WORKS + 8. LIMITS */}
      <section className="scroll-mt-4 border-y border-line bg-white" id="how-it-works">
        <div className="wrap sec">
          <h2 className="h2 mb-2">How it works</h2>
          <p className="m-0 mb-6 max-w-[760px] text-[15px] leading-[1.65] text-ink-copy">{howItWorks.intro}</p>
          <HowItWorksTable />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <h2 className="h2 mb-4">{limits.title}</h2>
              <p className="m-0 text-[15px] leading-[1.65] text-ink-copy">{limits.text}</p>
            </div>
            <p className="m-0 self-start rounded-[14px] bg-amber-25 px-[18px] py-4 text-sm leading-[1.6] font-semibold text-ink-copy">{limits.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="sec">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2 mb-5">Questions about AI search and your listing</h2>
          <Faq items={faq} variant="tools" />
        </div>
      </section>

      {/* 10. RELATED TOOLS + 11. CHANGELOG */}
      <section className="pb-[110px] md:pb-[72px]">
        <div className="wrap">
          <h2 className="h2 mb-5">{related.title}</h2>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-4">
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
            <Changelog />
          </div>
        </div>
      </section>
    </AiReadinessResultProvider>
  );
}
