import Link from "next/link";
import { InfoBadge } from "@/components/tools/Badges";
import { EventCalendarTool } from "@/components/tools/events/EventCalendarTool";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { routes } from "@/config/navigation";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { toolPath as levyPath } from "@/content/tools/visitorLevyId";
import type { PageSeo } from "@/lib/seo";
import { formatMedium } from "@/lib/tools/dates";
import type { City, PublicData } from "@/lib/tools/events";
import { cityLinks, faqFor, hero, howItWorks, limits, related } from "./content";

/** The whole page below the header, shared by the main page and the city pages. */
export function EventCalendarPage({ seo, data, today, city }: { seo: PageSeo; data: PublicData; today: string; city?: City }) {
  const covered = data.cities.filter((c) => c.covered);
  const relatedTools = related.ids.map(toolById).filter((t) => !!t);
  const levy = city && (city.nation === "scotland" || city.nation === "wales");
  return (
    <>
      {/* 1. HERO */}
      <section className="border-b border-line bg-white">
        <div className="wrap pt-10 pb-10 md:pt-12">
          <Breadcrumbs seo={seo} separator="›" />
          <h1 className="m-0 mt-5 mb-4 max-w-[900px] text-[34px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[52px]">
            {city ? (
              <>
                Events coming up in <span className="text-brand">{city.name}</span> for short-let hosts
              </>
            ) : (
              <>
                What events are coming <span className="text-brand">near my property?</span>
              </>
            )}
          </h1>
          <p className="m-0 max-w-[800px] text-[17px] leading-[1.65] text-ink-copy md:text-lg">{city ? (city.intro ?? hero.cityAnswer(city.name)) : hero.shortAnswer}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <InfoBadge dot="#F0595A">Get more bookings</InfoBadge>
            {data.lastReviewed && <InfoBadge dot="#2E8B57">Events last reviewed {formatMedium(data.lastReviewed)}</InfoBadge>}
            <InfoBadge dot="#14212B">
              {covered.length} {covered.length === 1 ? "city" : "cities"} covered
            </InfoBadge>
          </div>
          <p className="m-0 mt-4 flex items-center gap-2 text-sm font-semibold text-ink-copy">
            <span aria-hidden="true">🔒</span>
            {hero.privacy}
          </p>
          {levy && (
            <p className="m-0 mt-4">
              <Link href={levyPath} className="font-bold text-brand" data-levy-link>
                Check the visitor levy for these dates →
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* 2–11. THE TOOL */}
      <section className="pt-8 pb-14 md:pt-10">
        <div className="wrap">
          <EventCalendarTool data={data} today={today} initialCity={city?.slug} />
        </div>
      </section>

      {/* 12. HOW IT WORKS + 13. LIMITS */}
      <section className="scroll-mt-4 border-y border-line bg-white" id="how-it-works">
        <div className="wrap sec">
          <h2 className="h2 mb-6">How it works</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {howItWorks(data.settings).map((s) => (
              <div key={s.id} className="rounded-[18px] border border-line p-5" data-how={s.id}>
                <h3 className="m-0 mb-2 text-lg font-extrabold text-ink">{s.title}</h3>
                <p className="m-0 text-[15px] leading-[1.65] whitespace-pre-line text-ink-copy">{s.text}</p>
              </div>
            ))}
          </div>
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

      {/* 14. FAQ + covered cities */}
      <section className="sec">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2 mb-5">Questions about the event calendar</h2>
          <Faq items={faqFor(data.cities, data.settings)} variant="tools" />
          {covered.length > 0 && (
            <nav aria-labelledby="cities-h" className="mt-8">
              <h2 id="cities-h" className="m-0 mb-3 text-lg font-extrabold">
                Cities covered
              </h2>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0" data-city-links>
                {cityLinks(data.cities).map((c) => (
                  <li key={c.href}>
                    <Link href={c.href} aria-current={city && c.href.endsWith(`/${city.slug}`) ? "page" : undefined} className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-bold text-ink no-underline hover:border-ink hover:text-ink aria-[current=page]:border-ink aria-[current=page]:bg-sand">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      {/* 15. RELATED TOOLS */}
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
        </div>
      </section>
    </>
  );
}
