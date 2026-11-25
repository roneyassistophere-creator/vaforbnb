import Link from "next/link";
import { InfoBadge } from "@/components/tools/Badges";
import { TitleCheckerResultProvider, KitBadge, NextStepCard, WhatThisMeans } from "@/components/tools/title-checker/ResultContext";
import { TitleCheckerSection } from "@/components/tools/title-checker/TitleCheckerSection";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { routes } from "@/config/navigation";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { getFigures } from "@/lib/server/figures";
import { formatDate } from "@/lib/tools/figures";
import { readContent } from "@/lib/tools/title-checker";
import { changelogNotes, faqFor, hero, howItWorks, howItWorksRows, limits, nextStep, related, shortAnswer, whatThisMeansFallback } from "./content";
import { seo } from "./seo";

/** Stored rules, read on the server so the limit, checks and sources are in the page's HTML. */
async function content() {
  return readContent(await getFigures());
}

async function ShortAnswer() {
  const c = await content();
  return <p className="m-0 max-w-[800px] text-[17px] leading-[1.65] text-ink-copy md:text-lg">{shortAnswer(c.limit)}</p>;
}

async function LastUpdatedBadge() {
  const c = await content();
  return <InfoBadge dot="#2E8B57">Last updated {formatDate(c.rules.versionDate)}</InfoBadge>;
}

const KIND = { fix: { label: "Fix", bg: "#FDECEC", fg: "#B8383A" }, tip: { label: "Tip", bg: "#FFF2CC", fg: "#6B4A00" } };

async function HowItWorksTable() {
  const c = await content();
  const rows = howItWorksRows(c);
  return (
    <>
      <div className="overflow-x-auto rounded-[16px] border border-line">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <caption className="sr-only-label">The 12 title checks, what each looks for, and its source</caption>
          <thead className="bg-cloud-2 text-[12px] tracking-[0.6px] text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-extrabold">Check</th>
              <th className="px-4 py-3 font-extrabold">Type</th>
              <th className="px-4 py-3 font-extrabold">What it looks for</th>
              <th className="px-4 py-3 font-extrabold">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, n) => (
              <tr key={r.id} className="border-t border-line align-top" data-how-row={r.id}>
                <th scope="row" className="px-4 py-3 font-extrabold text-ink">
                  {n + 1}. {r.name}
                </th>
                <td className="px-4 py-3">
                  <span className="rounded-md px-2 py-[3px] text-[12px] font-extrabold uppercase" style={{ background: KIND[r.kind].bg, color: KIND[r.kind].fg }}>
                    {KIND[r.kind].label}
                  </span>
                </td>
                <td className="px-4 py-3 leading-[1.55] text-ink-copy">{r.looksFor}</td>
                <td className="px-4 py-3 leading-[1.55] text-ink-copy">
                  {r.source.url ? (
                    <a href={r.source.url} className="font-bold text-brand" rel="noopener" target="_blank">
                      {r.source.title}
                    </a>
                  ) : (
                    r.source.title
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="m-0 mt-3 text-[13px] text-muted">
        Verdict: <strong className="text-ink">Needs fixes</strong> if any Fix check fails · <strong className="text-ink">Good</strong> with no fixes but at least one tip · <strong className="text-ink">Strong</strong> when every check passes. Rules v{c.rules.version}.
      </p>
      <p className="m-0 mt-3 text-[13px] text-muted">
        Source:{" "}
        <a href={c.source.url} className="font-bold text-brand" rel="noopener" target="_blank">
          {c.source.title}
        </a>{" "}
        ({formatDate(c.source.date)}).
      </p>
    </>
  );
}

async function FaqSection() {
  const c = await content();
  return <Faq items={faqFor(c.limit)} variant="tools" />;
}

async function Changelog() {
  const c = await content();
  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      <li className="flex flex-wrap gap-x-3 text-sm leading-[1.6] text-ink-copy" data-rules-version>
        <time dateTime={c.rules.versionDate} className="font-bold text-ink">
          {formatDate(c.rules.versionDate)}
        </time>
        <span>Rules v{c.rules.version}</span>
      </li>
      {changelogNotes.map((n) => (
        <li key={n.date + n.note} className="flex flex-wrap gap-x-3 text-sm leading-[1.6] text-ink-copy">
          <time dateTime={n.date} className="font-bold text-ink">
            {formatDate(n.date)}
          </time>
          <span>{n.note}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TitleCheckerPage() {
  const relatedTools = related.ids.map(toolById).filter((t) => !!t);

  return (
    <TitleCheckerResultProvider>
      {/* 1. HERO */}
      <section className="border-b border-line bg-white">
        <div className="wrap pt-10 pb-10 md:pt-12">
          <Breadcrumbs seo={seo} separator="›" />
          <h1 className="m-0 mt-5 mb-4 max-w-[900px] text-[34px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[52px]">
            Is my Airbnb title <span className="text-brand">good enough?</span>
          </h1>
          <ShortAnswer />
          <div className="mt-5 flex flex-wrap gap-2">
            <InfoBadge dot="#F0595A">{hero.badges[0]}</InfoBadge>
            <InfoBadge dot="#14212B">{hero.badges[1]}</InfoBadge>
            <LastUpdatedBadge />
            <KitBadge label={hero.kitBadge} />
          </div>
          <p className="m-0 mt-4 flex items-center gap-2 text-sm font-semibold text-ink-copy">
            <span aria-hidden="true">🔒</span>
            {hero.privacy}
          </p>
        </div>
      </section>

      {/* 2–4. THE TOOL, SEARCH CARD PREVIEW AND RESULTS */}
      <section className="pt-8 pb-14 md:pt-10">
        <div className="wrap">
          <TitleCheckerSection />
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
              <ul className="m-0 grid list-disc gap-2 pl-5 text-[15px] leading-[1.65] text-ink-copy">
                {limits.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <p className="m-0 self-start rounded-[14px] bg-amber-25 px-[18px] py-4 text-sm leading-[1.6] font-semibold text-ink-copy" data-disclaimer>
              {limits.disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="sec">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2 mb-5">Questions about Airbnb titles</h2>
          <FaqSection />
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
                data-related={t.id}
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
    </TitleCheckerResultProvider>
  );
}
