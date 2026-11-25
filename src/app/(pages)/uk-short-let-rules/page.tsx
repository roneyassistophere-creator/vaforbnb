import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { MailtoForm } from "@/components/ui/MailtoForm";
import { SmartLink } from "@/components/ui/SmartLink";
import { ComplianceChecklist } from "./_components/ComplianceChecklist";
import { RulesExplorer } from "./_components/RulesExplorer";
import { SourcesList } from "./_components/SourcesList";
import { changelog, faq, heroNations, heroSummary, myths, quickGrid, timeline } from "./content";
import { seo } from "./seo";

const NATION_COLS = ["England", "Scotland", "Wales", "N. Ireland"];

export default function UkRulesPage() {
  return (
    <>
      {/* HERO */}
      <section>
        <div className="wrap pt-14 pb-14 md:pt-16">
          <Breadcrumbs seo={seo} separator="›" className="mb-6" />
          <div className="grid grid-cols-1 items-end gap-14 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div>
              <p className="font-mono mb-5 inline-flex items-center gap-2 rounded-full bg-green-25 px-3 py-1.5 text-xs font-semibold text-green">
                <span className="size-[7px] rounded-full bg-green-dot" />
                Rules last checked: {brand.content.rulesLastChecked}
              </p>
              <h1 className="m-0 mb-[22px] text-[40px] leading-[1.04] font-extrabold tracking-[-2.2px] md:text-[56px]">
                UK short-let rules, in one place.
              </h1>
              <p className="m-0 text-lg leading-[1.7] text-ink-copy">
                {heroSummary.map((part, i) => (typeof part === "string" ? part : <strong key={i}>{part.b}</strong>))}
              </p>
            </div>
            <div className="grid gap-2.5">
              <p className="eyebrow mb-1">Where is your property?</p>
              <div className="flex flex-wrap gap-2">
                {heroNations.map((n) => (
                  <a
                    key={n.key}
                    href={`#nation-${n.key}`}
                    className="inline-flex min-h-[44px] items-center rounded-[10px] border border-line-6 px-4 text-sm font-bold text-ink no-underline hover:border-ink hover:text-ink"
                  >
                    {n.t}
                  </a>
                ))}
              </div>
              <p className="m-0 mt-2.5 rounded-[10px] bg-cream-2 px-4 py-3.5 text-[13px] leading-[1.6] text-muted">
                General information, checked against official sources. Not legal or tax advice. Councils can add their
                own conditions, so check with your council, a solicitor or an accountant before making decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="sec border-t border-line-3" id="changing">
        <div className="wrap grid grid-cols-1 gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <p className="eyebrow">What’s changing</p>
            <h2 className="h2">2026–2028 timeline</h2>
            <p className="lead text-[15px]">The dates hosts need to plan for. Updated whenever a date is confirmed.</p>
          </div>
          <ol className="m-0 list-none p-0">
            {timeline.map((t) => (
              <li
                key={t.d + t.t}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-[18px] gap-y-1 border-b border-line-3 py-3.5 md:grid-cols-[150px_minmax(0,1fr)_auto]"
              >
                <span className={cn("font-mono col-span-2 text-[13px] font-semibold md:col-span-1", t.live ? "text-green" : "text-brand")}>
                  {t.live ? `${t.d} · live` : t.d}
                </span>
                <span className="text-[15px] leading-normal">{t.t}</span>
                <span className="badge-mono bg-fog-2 text-ink-copy">{t.w}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* QUICK CHECK */}
      <section className="sec border-t border-line-3 bg-cream-2">
        <div className="wrap">
          <p className="eyebrow">Quick check</p>
          <h2 className="h2">The big rules by nation</h2>
          <div className="mt-7 overflow-x-auto rounded-[14px] border border-line-3 bg-white">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line-3 text-xs font-bold text-muted">
                  <th className="w-[28%] px-[18px] py-3.5 text-left font-bold">Rule</th>
                  {NATION_COLS.map((c) => (
                    <th key={c} className="px-[18px] py-3.5 text-left font-bold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quickGrid.map((r) => (
                  <tr key={r.k} className="border-b border-fog-2 last:border-b-0">
                    <th scope="row" className="px-[18px] py-3.5 text-left font-bold">
                      {r.k}
                    </th>
                    {r.v.map((c, i) => (
                      <td
                        key={i}
                        className={cn(
                          "px-[18px] py-3.5 leading-[1.45]",
                          c.tone === "yes" ? "text-green" : c.tone === "alert" ? "text-brand" : "text-ink",
                        )}
                      >
                        {c.t}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 mb-0 text-[13px] text-muted">Northern Ireland fire and gas duties follow NI fire and gas safety law.</p>
        </div>
      </section>

      {/* RULES */}
      <section className="sec border-t border-line-3" id="rules">
        <div className="wrap">
          <RulesExplorer />
        </div>
      </section>

      {/* MYTHS */}
      <section className="sec border-t border-line-3 bg-cream-2">
        <div className="wrap">
          <p className="eyebrow">Myth check</p>
          <h2 className="h2">What hosts hear, and the truth</h2>
          <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-2">
            {myths.map((m) => (
              <div key={m.h} className="rounded-xl border border-line-3 bg-white px-[22px] py-5">
                <p className="m-0 mb-2 text-[15px] text-muted line-through decoration-coral">
                  <span className="sr-only-label">Myth: </span>
                  {m.h}
                </p>
                <p className="m-0 text-[15px] leading-[1.55] font-semibold">
                  <span className="sr-only-label">Truth: </span>
                  {m.t}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHECKLIST */}
      <section className="sec border-t border-line-3" id="checklist">
        <div className="wrap">
          <ComplianceChecklist />
        </div>
      </section>

      {/* HELP + ALERTS */}
      <section className="sec bg-ink text-white" id="alerts">
        <div className="wrap grid grid-cols-1 items-center gap-14 md:grid-cols-2">
          <div>
            <p className="eyebrow text-faint">Stay up to date</p>
            <h2 className="h2 text-white">Get told when a rule changes.</h2>
            <p className="m-0 text-base leading-[1.65] text-mist">One short email when something changes for UK hosts. No spam.</p>
            <MailtoForm
              ariaLabel="Rule change alerts"
              subject="Subscribe: UK short-let rule alerts"
              className="mt-6 flex flex-wrap items-end gap-2"
              labelClassName="flex-[1_1_240px]"
              hideLabels
              fieldClassName="field rounded-[10px] border-night-field-line bg-night-field text-white placeholder:text-faint"
              fields={[{ name: "email", label: "Email address", type: "email", required: true, placeholder: "you@example.com" }]}
              submitLabel="Get alerts"
              submitClassName="btn btn-coral"
            />
          </div>
          <div className="border-night-4 md:border-l md:pl-10">
            <p className="m-0 mb-3.5 text-[17px] font-extrabold">How {brand.name} helps</p>
            <p className="m-0 mb-[22px] text-[15px] leading-[1.7] text-mist">
              We don’t give legal advice, but our team keeps compliance on track day to day: certificate renewal dates,
              guest details at check-in, gas and electrical checks with your trades, letting-day records for business
              rates, and prices that show all fees. {brand.hours.label}.
            </p>
            <SmartLink href={brand.links.bookCall} className="btn btn-white">
              Book a 20-minute call
            </SmartLink>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2">Frequently asked questions</h2>
          <Faq items={faq} variant="rules" />
        </div>
      </section>

      {/* CHANGELOG + SOURCES */}
      <section className="sec border-t border-line-3 bg-cream-2">
        <div className="wrap grid grid-cols-1 gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div>
            <p className="eyebrow">Changelog</p>
            {changelog.map((c) => (
              <div key={c.d} className="border-b border-sand-rule py-3.5">
                <p className="font-mono m-0 mb-1 text-xs font-semibold text-muted">{c.d}</p>
                <p className="m-0 text-sm leading-[1.55]">{c.t}</p>
              </div>
            ))}
            <p className="mt-5 mb-0 text-[13px] leading-[1.6] text-muted">
              Reviewed by {brand.team.founder.name}, {brand.team.founder.role}, {brand.name}. Rules re-checked every month.
            </p>
          </div>
          <SourcesList />
        </div>
      </section>
    </>
  );
}
