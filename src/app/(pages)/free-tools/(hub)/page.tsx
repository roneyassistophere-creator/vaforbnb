import { brand } from "@/config/brand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { Icon } from "@/components/ui/Icon";
import { MailtoForm } from "@/components/ui/MailtoForm";
import { SmartLink } from "@/components/ui/SmartLink";
import Link from "next/link";
import { TrackedLink } from "@/components/tools/TrackedLink";
import { ComplianceCheckerSection } from "@/components/tools/compliance-checker/ComplianceCheckerSection";
import { toolPath as compliancePath } from "@/content/tools/complianceChecker";
import { isToolLive } from "@/content/tools/catalog";
import { ToolsBrowser } from "./_components/ToolsBrowser";
import { faq, featuredAi, kits, trust } from "./content";
import { seo } from "./seo";

export default function FreeToolsPage() {
  return (
    <>
      <ToolsBrowser breadcrumbs={<Breadcrumbs seo={seo} separator="›" />}>
        {/* KITS */}
        <section className="sec pb-10 md:pb-10">
          <div className="wrap">
            <div className="mb-[22px]">
              <p className="eyebrow">Starter kits</p>
              <h2 className="h2 m-0">Not sure where to start? Follow a kit.</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {kits.map((k) => (
                <div key={k.tag} className="flex flex-col rounded-[20px] border border-line bg-white p-6">
                  <span className="pill self-start" style={{ background: k.tint, color: k.fg }}>
                    {k.tag}
                  </span>
                  <h3 className="m-0 mt-3.5 mb-1.5 text-xl font-extrabold tracking-[-0.4px]">{k.t}</h3>
                  <p className="m-0 mb-[18px] text-sm leading-[1.55] text-body">{k.d}</p>
                  <ol className="m-0 mb-5 grid flex-1 list-none gap-2 p-0">
                    {k.steps.map((s, i) => (
                      <li key={s} className="flex items-center gap-2.5 text-sm font-semibold">
                        <span className="flex size-[22px] flex-none items-center justify-center rounded-full border-[1.5px] border-line-strong text-[11px] font-extrabold text-body">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                  {k.toolSlug && k.href.startsWith("/") ? (
                    <TrackedLink href={k.href} event="kit_started" toolSlug={k.toolSlug} className="btn btn-outline w-full">
                      Start the kit →
                    </TrackedLink>
                  ) : (
                    <SmartLink href={k.href} className="btn btn-outline w-full">
                      Start the kit →
                    </SmartLink>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED TOOL: COMPLIANCE CHECKER (the live tool, embedded) */}
        <section className="pt-10 pb-[72px]" id="compliance-checker" aria-labelledby="featured-tool">
          <div className="wrap">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="pill bg-steel-50 text-ink">Featured tool · Stay legal</span>
                <h2 id="featured-tool" className="h2 m-0 mt-3">
                  Which short-let rules apply to your property?
                </h2>
                <p className="lead m-0 mt-1.5">Six quick questions, then your checklist of UK rules, each with its official source.</p>
              </div>
              <Link href={compliancePath} className="btn btn-outline">
                Open the full checker →
              </Link>
            </div>
            <ComplianceCheckerSection />
            {isToolLive(featuredAi.slug) && (
              <div className="mt-6 grid grid-cols-1 items-center gap-5 rounded-[22px] bg-violet-50 p-6 md:grid-cols-[minmax(0,1.4fr)_auto] md:p-8" data-featured-ai>
                <div>
                  <span className="pill bg-white font-extrabold text-violet">Featured tool · {featuredAi.tag}</span>
                  <h2 className="h2 m-0 mt-3">{featuredAi.title}</h2>
                  <p className="lead m-0 mt-1.5">{featuredAi.text}</p>
                </div>
                <TrackedLink href={featuredAi.href} event="next_step_clicked" toolSlug={featuredAi.slug} className="btn btn-violet">
                  {featuredAi.cta} →
                </TrackedLink>
              </div>
            )}
          </div>
        </section>
      </ToolsBrowser>

      {/* TRUST */}
      <section className="border-y border-line bg-white">
        <div className="wrap sec">
          <p className="eyebrow">Why trust these tools</p>
          <h2 className="h2 mb-7">Built carefully, checked monthly</h2>
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {trust.map((t) => (
              <div key={t.h} className="rounded-[18px] bg-cloud-2 p-[22px]">
                <Icon name={t.icon} size={26} color="#14212B" />
                <h3 className="m-0 mt-3.5 mb-1.5 text-base font-extrabold">{t.h}</h3>
                <p className="m-0 text-sm leading-[1.55] text-body">{t.t}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 mb-0 rounded-[14px] bg-amber-25 px-[18px] py-4 text-sm leading-[1.6] text-ink-copy">
            <strong className="text-ink">Honest note:</strong> these tools give general information to help you plan. They
            aren’t legal, tax or financial advice. For decisions about your property, check with your council, an
            accountant or a solicitor.
          </p>
        </div>
      </section>

      {/* SUGGEST + UPDATES */}
      <section className="sec">
        <div className="wrap grid grid-cols-1 gap-4 md:grid-cols-2">
          <MailtoForm
            ariaLabel="Suggest a tool"
            subject="Free tool suggestion"
            className="flex flex-col gap-3.5 rounded-[20px] border border-line bg-white p-7"
            heading={<p className="m-0 text-xl font-extrabold">What tool would save you time?</p>}
            fields={[
              { name: "idea", label: "Describe the tool or the problem", type: "textarea", required: true },
              { name: "email", label: "Email (optional)", type: "email" },
            ]}
            submitLabel="Send suggestion"
          />
          <MailtoForm
            ariaLabel="Get updates"
            subject="Subscribe: new tools and rule changes"
            className="flex flex-col gap-3.5 rounded-[20px] border border-coral-100 bg-coral-50 p-7"
            heading={
              <>
                <p className="m-0 text-xl font-extrabold">Get told when we add a tool or a rule changes</p>
                <p className="m-0 text-sm leading-[1.6] text-body">One short email when something changes for UK hosts. No spam.</p>
              </>
            }
            fields={[{ name: "email", label: "Email", type: "email", required: true }]}
            consent={`Email me new tools, rule changes and occasional updates from ${brand.name}. Unsubscribe any time.`}
            submitLabel="Get updates"
            submitClassName="btn btn-coral self-start"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-[72px]">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2 mb-5">Questions about the tools</h2>
          <Faq items={faq} variant="tools" />
        </div>
      </section>

      {/* NEXT STEP */}
      <section className="bg-coral">
        <div className="wrap grid grid-cols-1 items-center gap-8 py-14 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <h2 className="h2 mb-2">Want us to do the work for you?</h2>
            <p className="m-0 text-base leading-[1.6] text-ink">
              Our team runs guest communication, pricing, listings, cleaning coordination and more for UK hosts,{" "}
              {brand.hours.sentenceShort}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 md:justify-end">
            <SmartLink href={brand.links.freeAudit} className="btn btn-ink">
              Get a free listing audit
            </SmartLink>
            <SmartLink href={brand.links.bookCall} className="btn btn-white">
              Book a 20-minute call
            </SmartLink>
          </div>
        </div>
      </section>
    </>
  );
}
