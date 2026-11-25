import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { InfoBadge } from "@/components/tools/Badges";
import { RulesLastCheckedBadge } from "@/components/tools/RulesLastChecked";
import { SourceLink } from "@/components/tools/SourceLink";
import { TrackedLink } from "@/components/tools/TrackedLink";
import { GuestRegisterSection } from "@/components/tools/guest-register/GuestRegisterSection";
import { RegisterResultProvider, WhatThisMeans } from "@/components/tools/guest-register/ResultContext";
import { routes } from "@/config/navigation";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { toolSlug } from "@/content/tools/guestRegister";
import { getFigures } from "@/lib/server/figures";
import { formatDate, numberFigure } from "@/lib/tools/figures";
import { buildFaq, changelog, hero, howItWorks, limits, links, nextStep, related, shortAnswer } from "./content";
import { seo } from "./seo";

export default async function GuestRegisterPage() {
  const figures = await getFigures();
  const age = numberFigure(figures, "guestRegister.minAge");
  const months = numberFigure(figures, "guestRegister.retentionMonths");
  const law = figures["guestRegister.minAge"];
  const relatedTools = related.ids.map(toolById).filter((t) => !!t);

  return (
    <RegisterResultProvider>
      {/* 1. HERO */}
      <section className="border-b border-line bg-white">
        <div className="wrap pt-10 pb-10 md:pt-12">
          <Breadcrumbs seo={seo} separator="›" />
          <h1 className="m-0 mt-5 mb-4 max-w-[860px] text-[34px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[52px]">{hero.title}</h1>
          <p className="m-0 max-w-[780px] text-[17px] leading-[1.65] text-ink-copy md:text-lg">{shortAnswer(figures)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <RulesLastCheckedBadge />
            <InfoBadge dot="#14212B">{hero.badges[0]}</InfoBadge>
            <InfoBadge dot="#F0595A">{hero.badges[1]}</InfoBadge>
          </div>
        </div>
      </section>

      {/* 2. WHAT TO RECORD */}
      <section className="pt-8 md:pt-10">
        <div className="wrap">
          <div className="rounded-[20px] border border-line bg-white p-5 md:p-7">
            <h2 className="m-0 mb-4 text-xl font-extrabold md:text-2xl">What to record</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[16px] bg-green-100 p-5">
                <h3 className="m-0 mb-3 text-[15px] font-extrabold text-green">All guests aged {age}+</h3>
                <ul className="m-0 grid list-none gap-2 p-0 text-[15px] font-semibold text-ink">
                  {["Full name", "Nationality", "Date of arrival"].map((x) => (
                    <li key={x} className="flex gap-2">
                      <span aria-hidden="true" className="text-green">
                        ✓
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[16px] bg-amber-25 p-5">
                <h3 className="m-0 mb-3 text-[15px] font-extrabold text-[#6B4A00]">Also, if not British, Irish or Commonwealth</h3>
                <ul className="m-0 grid list-none gap-2 p-0 text-[15px] font-semibold text-ink">
                  {["Passport or ID number", "Place of issue", "Next destination, and its address if known"].map((x) => (
                    <li key={x} className="flex gap-2">
                      <span aria-hidden="true" className="text-[#6B4A00]">
                        +
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="m-0 mt-4 text-[15px] font-bold text-ink">Keep records for at least {months} months. Police can ask to see them.</p>
          </div>
        </div>
      </section>

      {/* 3–4. THE TOOL + YOUR REGISTER */}
      <section className="pt-6 pb-14">
        <div className="wrap">
          <GuestRegisterSection />
        </div>
      </section>

      {/* 5. WHAT THIS MEANS + 6. NEXT STEP */}
      <section className="pb-14">
        <div className="wrap grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="rounded-[20px] border border-line bg-white p-6 md:p-8">
            <h2 className="h2">What this means</h2>
            <WhatThisMeans className="m-0 text-base leading-[1.7] text-ink-copy" fallback="Record each booking’s adult guests at check-in. It takes about a minute per guest." />
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
        <div className="wrap sec grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <h2 className="h2 mb-4">How it works</h2>
            <ul className="m-0 grid list-none gap-3 p-0">
              {howItWorks(figures).map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-[1.65] text-ink-copy">
                  <span aria-hidden="true" className="mt-[9px] size-2 flex-none rounded-full bg-coral" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            {law && <SourceLink className="mt-4 block" source={{ title: law.sourceTitle, url: law.sourceUrl }} />}
            <p className="m-0 mt-2 flex flex-wrap gap-x-5 text-sm">
              <Link href={links.rulesHub} className="inline-flex min-h-11 items-center font-bold text-brand">
                Guest records in the Rules Hub →
              </Link>
              <a href={links.ico} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-bold text-brand">
                ICO guidance for small businesses →<span className="sr-only-label"> (opens in a new tab)</span>
              </a>
            </p>
          </div>
          <div>
            <h2 className="h2 mb-4">{limits.title}</h2>
            <p className="m-0 mb-4 text-[15px] leading-[1.65] text-ink-copy">{limits.text}</p>
            <p className="m-0 rounded-[14px] bg-amber-25 px-[18px] py-4 text-sm leading-[1.6] font-semibold text-ink-copy">
              {limits.disclaimer}{" "}
              <Link href={links.rightToRent} className="font-bold text-brand">
                Tenancies and longer stays →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="sec">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2 mb-5">Questions about guest registers</h2>
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
    </RegisterResultProvider>
  );
}
