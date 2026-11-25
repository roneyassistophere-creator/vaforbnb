import Link from "next/link";
import { InfoBadge } from "@/components/tools/Badges";
import { KitBadge, ProfitProvider } from "@/components/tools/profit/ProfitContext";
import { ProfitSection } from "@/components/tools/profit/ProfitSection";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { routes } from "@/config/navigation";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { getFigures } from "@/lib/server/figures";
import { formatDate } from "@/lib/tools/figures";
import { readContent } from "@/lib/tools/profit";
import { faqFor, hero, howItWorks, limits, related, rulesLinks } from "./content";
import { seo } from "./seo";

/** Stored figures, read on the server so How it works, the FAQ and the dates are in the page's HTML. */
async function load() {
  const figures = await getFigures();
  return { figures, c: readContent(figures) };
}

async function CheckedBadge() {
  const { c } = await load();
  return <InfoBadge dot="#2E8B57">Figures last checked {c.lastChecked ? formatDate(c.lastChecked) : ""}</InfoBadge>;
}

async function HowItWorks() {
  const { c, figures } = await load();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {howItWorks(c, figures).map((s) => (
        <div key={s.id} className="grid content-start gap-2 rounded-[18px] border border-line p-5" data-how={s.id}>
          <h3 className="m-0 text-lg font-extrabold text-ink">{s.title}</h3>
          <p className="m-0 text-[15px] leading-[1.65] text-ink-copy">{s.text}</p>
          {s.assumption && (
            <p className="m-0 text-sm leading-[1.55] text-ink-copy">
              <span className="mr-1.5 rounded-md bg-amber-50 px-1.5 py-[2px] text-[11px] font-extrabold tracking-[0.6px] text-amber">ASSUMPTION</span>
              {s.assumption}
            </p>
          )}
          {s.sources && s.sources.some((x) => x.title) && (
            <p className="m-0 text-[13px] text-muted">
              Sources:{" "}
              {s.sources
                .filter((x) => x.title)
                .map((x, i) => (
                  <span key={x.title}>
                    {i > 0 && "; "}
                    {x.url ? (
                      <a href={x.url} target="_blank" rel="noopener noreferrer" className="font-bold text-brand">
                        {x.title}
                      </a>
                    ) : (
                      x.title
                    )}
                  </span>
                ))}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

async function FaqSection() {
  const { c } = await load();
  return <Faq items={faqFor(c)} variant="tools" />;
}

async function Changelog() {
  const { c } = await load();
  return (
    <p className="m-0 text-sm leading-[1.6] text-ink-copy" data-model-version>
      <time dateTime={c.model.versionDate} className="font-bold text-ink">
        {formatDate(c.model.versionDate)}
      </time>{" "}
      · Model v{c.model.version}: Quick and Detailed modes, cash flow after mortgage capital, break-even, minimum rate, target solver, sensitivity, tax estimate (current and from April 2027), Rent a Room, VAT and Making Tax Digital notices.
    </p>
  );
}

export default function ProfitPage() {
  const relatedTools = related.ids.map(toolById).filter((t) => !!t);
  return (
    <ProfitProvider>
      {/* 1. HERO */}
      <section className="border-b border-line bg-white">
        <div className="wrap pt-10 pb-10 md:pt-12">
          <Breadcrumbs seo={seo} separator="›" />
          <h1 className="m-0 mt-5 mb-4 max-w-[900px] text-[34px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[52px]">
            Am I actually making money from my <span className="text-brand">short let?</span>
          </h1>
          <p className="m-0 max-w-[820px] text-[17px] leading-[1.65] text-ink-copy md:text-lg">{hero.shortAnswer}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <InfoBadge dot="#1F6B45">Know my numbers</InfoBadge>
            <InfoBadge dot="#14212B">All UK</InfoBadge>
            <CheckedBadge />
            <KitBadge />
          </div>
          <p className="m-0 mt-4 flex items-center gap-2 text-sm font-semibold text-ink-copy">
            <span aria-hidden="true">🔒</span>
            {hero.privacy}
          </p>
        </div>
      </section>

      {/* 2–7. THE TOOL, RESULTS, INSIGHTS, WHAT THIS MEANS, NEXT STEP */}
      <section className="pt-8 pb-14 md:pt-10">
        <div className="wrap">
          <ProfitSection />
        </div>
      </section>

      {/* 8. HOW IT WORKS + 9. LIMITS */}
      <section className="scroll-mt-4 border-y border-line bg-white" id="how-it-works">
        <div className="wrap sec">
          <h2 className="h2 mb-2">How it works</h2>
          <p className="m-0 mb-6 max-w-[760px] text-[15px] leading-[1.65] text-ink-copy">Every figure is worked out from what you enter, at full precision, and rounded only for display. Here’s each formula in plain English.</p>
          <HowItWorks />
          <p className="m-0 mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="font-bold text-ink">UK rules hub:</span>
            {rulesLinks.map((l) => (
              <Link key={l.href} href={l.href} className="font-bold text-brand">
                {l.label}
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
              {limits.disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="sec">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2 mb-5">Questions about short-let profit</h2>
          <FaqSection />
        </div>
      </section>

      {/* 11. RELATED TOOLS + 12. CHANGELOG */}
      <section className="pb-[110px] md:pb-[72px]">
        <div className="wrap">
          <h2 className="h2 mb-5">{related.title}</h2>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-4">
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
    </ProfitProvider>
  );
}
