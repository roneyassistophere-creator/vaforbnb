import Link from "next/link";
import { rules as hubRules } from "@/app/(pages)/uk-short-let-rules/content";
import { InfoBadge } from "@/components/tools/Badges";
import { SvlProvider } from "@/components/tools/short-vs-long/Context";
import { Outcome } from "@/components/tools/short-vs-long/Outcome";
import { SvlSection } from "@/components/tools/short-vs-long/SvlSection";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { routes } from "@/config/navigation";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { copy } from "@/content/tools/shortVsLongCopy";
import { getFigures } from "@/lib/server/figures";
import { formatDate, pickFigures } from "@/lib/tools/figures";
import { figureKeys, readContent } from "@/lib/tools/short-vs-long";
import { faq, hero, howItWorks, limits, related } from "./content";
import { seo } from "./seo";

async function load() {
  const figures = await getFigures();
  return { figures, c: readContent(figures) };
}

async function RulesBadge() {
  const { c } = await load();
  return <InfoBadge dot="#2E8B57">Rules last checked {c.rulesLastChecked ? formatDate(c.rulesLastChecked) : ""}</InfoBadge>;
}

/** "Other things to weigh": stored cards; regulatory lines come from the UK Rules Hub entries. */
async function Weigh() {
  const { c } = await load();
  return (
    <section aria-labelledby="weigh-h" className="grid gap-4" data-weigh>
      <h2 id="weigh-h" className="h2 m-0">
        Other things to weigh
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {c.weigh.map((w) => {
          const tool = w.tool ? toolById(w.tool) : undefined;
          const lines = (w.rules ?? []).map((a) => hubRules.find((r) => r.anchor === a)).filter((r): r is (typeof hubRules)[number] => !!r);
          return (
            <article key={w.id} className="grid content-start gap-2 rounded-[18px] border border-line bg-white p-5" data-weigh-card={w.id}>
              <h3 className="m-0 text-lg font-extrabold">{w.title}</h3>
              <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">{w.text}</p>
              {lines.length > 0 && (
                <ul className="m-0 grid list-none gap-1.5 p-0 text-sm leading-[1.5]">
                  {lines.map((r) => (
                    <li key={r.anchor}>
                      <Link href={`/uk-short-let-rules#${r.anchor}`} className="font-bold text-brand">
                        {r.where}
                      </Link>{" "}
                      <span className="text-muted">({r.status})</span>: {r.q}
                    </li>
                  ))}
                </ul>
              )}
              {lines.length > 0 && <p className="m-0 text-[12px] text-muted">From the UK Rules Hub, last checked {c.rulesLastChecked ? formatDate(c.rulesLastChecked) : ""}.</p>}
              {tool && (
                <Link href={toolLink(tool)} className="text-sm font-bold text-brand">
                  {w.linkLabel} →
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

async function OutcomeSection() {
  const { figures } = await load();
  return <Outcome figures={pickFigures(figures, figureKeys)} />;
}

async function HowItWorks() {
  const { c } = await load();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {howItWorks(c).map((s) => (
        <div key={s.id} className="grid content-start gap-2 rounded-[18px] border border-line p-5" data-how={s.id}>
          <h3 className="m-0 text-lg font-extrabold">{s.title}</h3>
          <p className="m-0 text-[15px] leading-[1.65] text-ink-copy">{s.text}</p>
          {s.assumption && (
            <p className="m-0 text-sm leading-[1.55] text-ink-copy">
              <span className="mr-1.5 rounded-md bg-amber-50 px-1.5 py-[2px] text-[11px] font-extrabold tracking-[0.6px] text-amber">ASSUMPTION</span>
              {s.assumption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

async function Changelog() {
  const { c } = await load();
  return (
    <p className="m-0 text-sm leading-[1.6] text-ink-copy" data-model-version>
      <time dateTime={c.model.versionDate} className="font-bold text-ink">
        {formatDate(c.model.versionDate)}
      </time>{" "}
      · Version {c.model.version}: like-for-like monthly comparison, break-even rent, 5-year view with switching costs and growth, profit per hour, after-tax estimate.
    </p>
  );
}

export default function SvlPage() {
  const relatedTools = related.ids.map(toolById).filter((t) => !!t);
  return (
    <SvlProvider>
      <section className="border-b border-line bg-white">
        <div className="wrap pt-10 pb-10 md:pt-12">
          <Breadcrumbs seo={seo} separator="›" />
          <h1 className="m-0 mt-5 mb-4 max-w-[900px] text-[34px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[52px]">
            Would long-letting pay me more than <span className="text-brand">short-letting?</span>
          </h1>
          <p className="m-0 max-w-[820px] text-[17px] leading-[1.65] text-ink-copy md:text-lg">{hero.shortAnswer}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <InfoBadge dot="#1F6B45">Know my numbers</InfoBadge>
            <InfoBadge dot="#14212B">All UK</InfoBadge>
            <RulesBadge />
          </div>
          <p className="m-0 mt-4 flex items-center gap-2 text-sm font-semibold text-ink-copy">
            <span aria-hidden="true">🔒</span>
            {hero.privacy}
          </p>
        </div>
      </section>

      <section className="pt-8 pb-14 md:pt-10">
        <div className="wrap grid gap-10">
          <SvlSection />
          <Weigh />
          <OutcomeSection />
        </div>
      </section>

      <section className="scroll-mt-4 border-y border-line bg-white" id="how-it-works">
        <div className="wrap sec">
          <h2 className="h2 mb-6">How it works</h2>
          <HowItWorks />
          <p className="m-0 mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="font-bold">UK Rules Hub:</span>
            {[
              ["renters-rights-act", "Renters’ Rights Act"],
              ["london-90-nights", "London 90-night rule"],
              ["property-income-tax", "Property income tax"],
              ["fhl-abolished", "Furnished holiday lets abolished"],
            ].map(([a, l]) => (
              <Link key={a} href={`/uk-short-let-rules#${a}`} className="font-bold text-brand">
                {l}
              </Link>
            ))}
          </p>
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
              {copy.disclaimer}
            </p>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2 mb-5">Questions about short lets vs long lets</h2>
          <Faq items={faq} variant="tools" />
        </div>
      </section>

      <section className="pb-[110px] md:pb-[72px]">
        <div className="wrap">
          <h2 className="h2 mb-5">{related.title}</h2>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-4">
            {relatedTools.map((t) => (
              <Link key={t.id} href={toolLink(t)} className="flex min-h-[150px] flex-col gap-2 rounded-[18px] border border-line bg-white p-5 text-ink no-underline hover:border-ink hover:text-ink" data-related={t.id}>
                <span className={`pill self-start ${isLive(t) ? "bg-green-100 text-green" : "bg-fog text-muted"}`}>{isLive(t) ? "Free" : "Coming soon"}</span>
                <span className="text-[17px] font-extrabold">{t.name}</span>
                <span className="text-sm text-body">{t.q}</span>
              </Link>
            ))}
            <Link href={routes.freeTools} className="flex min-h-[150px] flex-col justify-center gap-2 rounded-[18px] border border-dashed border-line-strong p-5 text-ink no-underline hover:border-ink hover:text-ink">
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
    </SvlProvider>
  );
}
