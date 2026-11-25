import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import { reviewedBy } from "@/components/service/ServiceBlocks";
import { ReplySimulator, StaySelector, Stars } from "./_components/Interactive";
import {
  anatomy,
  anatomyReply,
  canGo,
  cantGo,
  catchEarly,
  facts,
  faq,
  gatingRules,
  honest,
  included,
  loop,
  never,
  owned,
  packageCta,
  process,
  proof,
  sidebarCta,
  sidebarToc,
  sources,
  wall,
} from "./content";
import { seo } from "./seo";
import { ServiceTocLayout } from "@/components/service/ServiceToc";

const W = "mx-auto box-border max-w-[1160px] px-4 md:px-7";
const sec = "py-16 md:py-24";
const two = "grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-14";
const pillBtn = "btn min-h-[52px] rounded-full px-[26px]";
const pillOutline = "btn min-h-[52px] rounded-full border-[1.5px] border-ink bg-transparent px-[26px] text-ink hover:bg-ink hover:text-white";

function Ey({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 mb-3.5 text-[13px] font-extrabold text-brand", className)}>{children}</p>;
}

function H2({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("m-0 mb-4 text-[32px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[44px]", className)}>{children}</h2>;
}

function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 max-w-[700px] text-lg leading-[1.65] text-body", className)}>{children}</p>;
}

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill="#F0595A" />
    </svg>
  );
}

export default function ReviewManagementPage() {
  return (
    <>
      {/* HERO + REVIEW WALL */}
      <section className="overflow-hidden bg-[#FBF4EF]">
        <div className={cn(W, "pt-14 pb-[88px]")}>
          <div className="mx-auto mb-14 max-w-[860px] text-center">
            <div className="mb-[18px] flex justify-center">
              <Breadcrumbs seo={seo} />
            </div>
            <h1 className="m-0 mb-6 text-[44px] leading-[1.02] font-extrabold tracking-[-2.6px] md:text-[64px]">
              You’re not replying to one guest. You’re replying to the next hundred.
            </h1>
            <p className="mx-auto mb-[30px] max-w-[720px] text-lg leading-[1.7] text-ink-copy">
              Reviews are your reputation and your ranking. We manage them by hand: every reply written in your voice,
              criticism answered without arguing, review requests timed to how the stay really went, and every complaint
              turned into a fix.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#audit" className={cn(pillBtn, "btn-coral")}>
                Get a free review audit
              </a>
              <a href="#call" className={pillOutline}>
                Book a 20-minute call
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
            {wall.map((r) => (
              <figure key={r.t} className={cn("m-0 rounded-[18px] bg-white p-5 shadow-[0_10px_30px_rgba(20,33,43,0.08)]", r.offset)}>
                <div className="mb-2.5 flex items-center justify-between">
                  <Stars n={r.stars} />
                  <span className="text-xs font-bold text-muted">{r.who}</span>
                </div>
                <blockquote className="m-0 text-[15px] leading-[1.55]">“{r.t}”</blockquote>
                {r.reply && (
                  <div className="mt-3.5 rounded-xl bg-fog p-3.5">
                    <p className="m-0 mb-1.5 text-xs font-extrabold text-ink">Response from your host</p>
                    <p className="m-0 text-sm leading-[1.55] text-ink-copy">{r.reply}</p>
                  </div>
                )}
              </figure>
            ))}
          </div>
          <p className="m-0 mt-[18px] text-center text-xs text-muted">Illustrative reviews. Replace with real, anonymised examples.</p>
        </div>
      </section>

      <ServiceTocLayout items={sidebarToc} cta={sidebarCta}>
        {/* WHY */}
        <section id="why" className={sec}>
          <div className={W}>
            <div className={cn(two, "mb-12 items-end")}>
              <div>
                <Ey>Why reviews deserve a human</Ey>
                <H2 className="m-0">Your rating decides where you rank, and who clicks</H2>
              </div>
              <Lead>
                Airbnb and Booking.com reward well-reviewed listings. A slow slide in ratings costs bookings quietly, long
                before you notice.
              </Lead>
            </div>
            <div className="grid grid-cols-1 border-t-2 border-ink sm:grid-cols-2 md:grid-cols-4">
              {facts.map((f) => (
                <div key={f.n} className="pt-7 pr-6">
                  <p className="m-0 mb-3 text-[44px] leading-none font-extrabold tracking-[-1.6px] text-coral">{f.n}</p>
                  <p className="m-0 mb-2.5 text-base leading-normal font-bold">{f.t}</p>
                  <p className="m-0 text-xs text-muted">{f.s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REPLY SIMULATOR */}
        <section id="simulator" className="bg-ink text-white">
          <div className={cn(W, sec)}>
            <ReplySimulator />
            <p className="m-0 mt-3.5 text-center text-xs text-faint">Illustrative example.</p>
          </div>
        </section>

        {/* ANATOMY */}
        <section id="anatomy" className={sec}>
          <div className={cn(W, two, "items-center")}>
            <div>
              <Ey>The anatomy of a good reply</Ey>
              <H2>Four steps, every time</H2>
              <ol className="m-0 list-none p-0">
                {anatomy.map((s, i) => (
                  <li key={s.h} className="flex items-start gap-4 border-t border-line py-4">
                    <span
                      className="flex size-10 flex-none items-center justify-center rounded-xl font-extrabold"
                      style={{ background: s.bg }}
                    >
                      {i + 1}
                    </span>
                    <span>
                      <strong className="mb-[3px] block text-[17px]">{s.h}</strong>
                      <span className="text-[15px] leading-[1.55] text-body">{s.t}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-[26px] bg-[#FBF4EF] p-6 md:p-8">
              <p className="m-0 mb-3.5 text-[13px] font-extrabold text-muted">A reply, colour-coded by step</p>
              <p className="m-0 text-[19px] leading-loose text-ink">
                {anatomyReply.map((t, i) => (
                  <span key={t}>
                    <span className="rounded-md px-1.5 py-[3px] [box-decoration-break:clone]" style={{ background: anatomy[i].bg }}>
                      {t}
                    </span>{" "}
                  </span>
                ))}
              </p>
              <div className="mt-6 rounded-2xl bg-ink px-5 py-[18px] text-[15px] leading-[1.6] text-white">
                <strong className="text-coral-200">Our rule:</strong> never reply in anger, never in the same hour a painful
                review lands. We check the facts with you and your cleaner, then publish a reply you’re comfortable with.
              </div>
            </div>
          </div>
        </section>

        {/* STAY OUTCOME */}
        <section id="outcome" className="bg-sand">
          <div className={cn(W, sec)}>
            <StaySelector
              heading={
                <>
                  <Ey>Why we don’t automate review requests</Ey>
                  <H2>A cheerful template after a bad stay is an invitation to a 2-star review</H2>
                  <Lead className="mb-6">Our team reads the whole stay before saying anything. Pick how the stay went:</Lead>
                </>
              }
            />
          </div>
        </section>

        {/* CATCH BEFORE + LOOP */}
        <section id="prevent" className={sec}>
          <div className={W}>
            <Ey>Catch problems before the review</Ey>
            <H2 className="mb-9">The best bad review is the one that never gets written</H2>
            <div className="mb-[72px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-4">
              {catchEarly.map((c) => (
                <div key={c.h} className="rounded-[20px] border-[1.5px] border-line p-[22px]">
                  <p className="m-0 mb-2 text-[13px] font-extrabold text-brand uppercase">{c.when}</p>
                  <p className="m-0 mb-1.5 text-[17px] font-extrabold">{c.h}</p>
                  <p className="m-0 text-sm leading-[1.55] text-body">{c.t}</p>
                </div>
              ))}
            </div>
            <div className={two}>
              <div>
                <Ey>Turning reviews into a better listing</Ey>
                <H2>Every review is free advice</H2>
                <Lead>Each month we track your category ratings and recurring comments, and pass them to the person who can fix them.</Lead>
              </div>
              <div className="grid gap-2">
                {loop.map((l) => (
                  <div
                    key={l.cat}
                    className="grid grid-cols-[100px_22px_minmax(0,1fr)] items-center gap-2.5 rounded-[14px] bg-sand px-4 py-3.5 md:grid-cols-[130px_28px_minmax(0,1fr)]"
                  >
                    <span className="text-sm font-extrabold">{l.cat}</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="#B8383A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm leading-[1.45]">
                      <strong>{l.to}:</strong> {l.fix}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* REMOVAL */}
        <section id="removal" className="bg-fog">
          <div className={cn(W, sec)}>
            <div className="mx-auto mb-10 max-w-[720px] text-center">
              <Ey>When a review breaks the rules</Ey>
              <H2>What Airbnb will and won’t remove</H2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-[22px] bg-white p-7">
                <p className="m-0 mb-4 text-[13px] font-extrabold tracking-[1px] text-green">MAY BE REMOVED</p>
                {canGo.map((c) => (
                  <div key={c.h} className="border-t border-line-4 py-3">
                    <p className="m-0 mb-[3px] text-base font-extrabold">{c.h}</p>
                    <p className="m-0 text-sm leading-normal text-body">{c.t}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-[22px] bg-white p-7">
                <p className="m-0 mb-4 text-[13px] font-extrabold tracking-[1px] text-brand">WON’T BE REMOVED</p>
                {cantGo.map((c) => (
                  <div key={c} className="border-t border-line-4 py-3">
                    <p className="m-0 text-base font-bold">{c}</p>
                  </div>
                ))}
                <p className="m-0 mt-[18px] text-[15px] leading-[1.6] text-ink-copy">
                  When a review clearly breaks the rules, we prepare a calm, evidence-backed request: messages, photos,
                  timestamps. When it doesn’t, we write the best possible public reply.
                </p>
              </div>
            </div>
            <p className="m-0 mt-4 text-center text-[13px] leading-normal text-muted">Source: Airbnb Help, Reviews policy (article 2673).</p>
          </div>
        </section>

        {/* BEYOND OTAs */}
        <section id="beyond" className={sec}>
          <div className={W}>
            <div className={cn(two, "mb-10 items-end")}>
              <div>
                <Ey>Reviews beyond the booking platforms</Ey>
                <H2 className="m-0">Build a reputation you own</H2>
              </div>
              <Lead>
                Airbnb and Booking.com reviews belong to those platforms. Reviews on Google, Trustpilot and your website
                support your brand and your direct bookings.
              </Lead>
            </div>
            <div className="mb-7 grid grid-cols-1 gap-3.5 md:grid-cols-3">
              {owned.map((o) => (
                <div
                  key={o.h}
                  className="flex min-h-40 flex-col justify-between gap-4 rounded-[20px] p-6"
                  style={{ background: o.bg, color: o.fg }}
                >
                  <span className="text-[22px] font-extrabold">{o.h}</span>
                  <span className="text-sm leading-[1.55]">{o.t}</span>
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-3xl border-2 border-coral">
              <div className="flex flex-wrap items-center gap-3.5 bg-coral-50 px-7 py-[22px]">
                <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3l10 18H2L12 3z" fill="none" stroke="#B8383A" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 10v5M12 18v.5" stroke="#B8383A" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-xl font-extrabold">Where many hosts get it wrong: inviting only happy guests</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3">
                {gatingRules.map((r) => (
                  <div key={r.who} className="border-b border-[#F6D2D2] px-7 py-6 md:border-r md:border-b-0">
                    <p className="m-0 mb-2.5 text-[13px] font-extrabold text-brand uppercase">{r.who}</p>
                    <p className="m-0 text-base leading-[1.55] font-semibold">“{r.q}”</p>
                  </div>
                ))}
              </div>
              <div className="bg-ink px-7 py-[22px] text-base leading-[1.6] text-white">
                <strong className="text-coral-200">So we invite every guest the same way,</strong> with a neutral request for
                honest feedback, and never offer discounts or gifts for reviews. Because we fix problems during the stay,
                most guests are happy anyway.
              </div>
            </div>
            <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
              Sources: Google contributed content guidelines (via Search Engine Land); Trustpilot Guidelines for Businesses;
              CMA fake reviews guidance (CMA208, April 2025).
            </p>
          </div>
        </section>

        {/* NEVER DO */}
        <section id="never" className="bg-ink text-white">
          <div className={cn(W, sec, two, "items-center")}>
            <div>
              <Ey className="text-coral-200">What we never do</Ey>
              <H2 className="text-white">Shortcuts that cost you more than they save</H2>
              <Lead className="text-mist">
                Airbnb’s reviews policy bans incentives and pressure. UK law bans fake reviews (Digital Markets, Competition
                and Consumers Act 2024, with CMA guidance).
              </Lead>
            </div>
            <ul className="m-0 grid list-none gap-2 p-0">
              {never.map((n) => (
                <li key={n} className="flex items-center gap-3.5 rounded-[14px] bg-night-field px-[18px] py-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#F0595A" strokeWidth="2" />
                    <path d="M5 19L19 5" stroke="#F0595A" strokeWidth="2" />
                  </svg>
                  <span className="text-base font-semibold">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* GUEST REVIEWS + INCLUDED */}
        <section id="guest-reviews" className={sec}>
          <div className={cn(W, two)}>
            <div>
              <Ey>Reviewing your guests</Ey>
              <H2>Fair, factual, never retaliatory</H2>
              <Lead className="mb-6">
                Host reviews of guests help other hosts and encourage good behaviour. We write one for every guest in your
                name, and flag any stay where an honest note about house rules is needed.
              </Lead>
              <div className="rounded-[18px] bg-sand p-5">
                <p className="m-0 mb-2 text-[13px] font-extrabold text-muted">Example host review of a guest</p>
                <p className="m-0 text-base leading-[1.6]">
                  “Sam and family were lovely guests: great communication, followed the house rules and left the flat tidy.
                  Welcome back any time.”
                </p>
              </div>
            </div>
            <div>
              <Ey>What’s included</Ey>
              <ul className="m-0 list-none p-0">
                {included.map((i) => (
                  <li key={i.h} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 border-t border-line py-3.5">
                    <StarIcon />
                    <span>
                      <strong className="mb-0.5 block text-base">{i.h}</strong>
                      <span className="text-sm leading-normal text-body">{i.t}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* PROCESS + HONEST + PROOF */}
        <section id="audit" className="bg-[#FBF4EF]">
          <div className={cn(W, sec)}>
            <div className="mx-auto mb-11 max-w-[720px] text-center">
              <Ey>How it works</Ey>
              <H2>Starts with a free review audit</H2>
            </div>
            <ol className="m-0 mb-12 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 md:grid-cols-5">
              {process.map((p) => (
                <li key={p.n} className="relative rounded-[20px] bg-white p-[22px]">
                  <span className="text-[44px] leading-none font-extrabold tracking-[-2px] text-coral">{p.n}</span>
                  <p className="m-0 mt-3 mb-1.5 text-base font-extrabold">{p.h}</p>
                  <p className="m-0 text-sm leading-[1.55] text-body">{p.t}</p>
                </li>
              ))}
            </ol>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-[22px] bg-white p-7">
                <Ey className="text-ink">What to expect, honestly</Ey>
                {honest.map((h) => (
                  <p key={h.b} className="m-0 mb-3 text-[15px] leading-[1.55] text-ink-copy">
                    <strong className="text-ink">{h.b}</strong> {h.t}
                  </p>
                ))}
              </div>
              <div className="rounded-[22px] border-2 border-dashed border-[#D8C9BE] p-7">
                <Ey className="text-ink">Proof</Ey>
                {proof.map((p) => (
                  <div key={p.k} className="flex justify-between gap-3 border-b border-[#EADDD3] py-3 text-[15px]">
                    <span>{p.k}</span>
                    <strong>{p.v}</strong>
                  </div>
                ))}
                <p className="m-0 mt-3.5 text-[13px] text-muted">
                  Real, anonymised examples only: rating trends, a difficult review and our reply, category ratings over
                  time.
                </p>
              </div>
            </div>
            <div className="mt-10 text-center">
              <SmartLink href={brand.links.freeAudit} className={cn(pillBtn, "btn-coral")}>
                Request my free review audit
              </SmartLink>
            </div>
          </div>
        </section>

        {/* RUN */}
        <section id="call" className="bg-coral">
          <div className={cn(W, "py-16 text-center")}>
            <p className="m-0 mb-2.5 text-[13px] font-extrabold tracking-[1.4px] text-ink">INCLUDED IN THE RUN PACKAGE</p>
            <h2 className="mx-auto mb-3 max-w-[760px] text-[32px] leading-[1.1] font-extrabold tracking-[-1.4px] text-ink md:text-[40px]">
              {packageCta.title}
            </h2>
            <p className="mx-auto mb-[26px] max-w-[620px] text-base leading-[1.6] font-medium text-ink">{packageCta.text}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <SmartLink href={brand.links.bookCall} className={cn(pillBtn, "btn-ink")}>
                Book a 20-minute call
              </SmartLink>
              <a href="#audit" className={pillOutline}>
                Get a free review audit
              </a>
            </div>
          </div>
        </section>

        {/* FAQ as chat */}
        <section id="faq" className={sec}>
          <div className={cn(W, "max-w-[860px]")}>
            <div className="mb-10 text-center">
              <Ey>FAQ</Ey>
              <H2>Questions hosts ask about reviews</H2>
            </div>
            <div className="grid gap-[18px]">
              {faq.map((q) => (
                <div key={q.q} className="grid gap-2">
                  <div className="max-w-[80%] justify-self-start rounded-[20px_20px_20px_6px] bg-fog px-[18px] py-3.5">
                    <h3 className="m-0 text-base leading-[1.4] font-extrabold">{q.q}</h3>
                  </div>
                  <div className="max-w-[80%] justify-self-end rounded-[20px_20px_6px_20px] bg-ink px-[18px] py-3.5 text-white">
                    <p className="m-0 text-[15px] leading-[1.6]">{q.a}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="m-0 mt-10 text-center text-[13px] leading-[1.7] text-muted">
              <strong className="text-ink-copy">Sources:</strong> {sources} {reviewedBy("November 2026")}
            </p>
          </div>
        </section>
      </ServiceTocLayout>
    </>
  );
}
