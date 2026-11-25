import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import { reviewedBy } from "@/components/service/ServiceBlocks";
import { Anatomy, FaqIndex, LibraryFolders, OptionsFlow, SopViewer, TrainingPlan, VaChangeSim } from "./_components/Interactive";
import {
  access,
  benefits,
  folders,
  honest,
  priceRows,
  related,
  sidebarCta,
  sidebarToc,
  who,
} from "./content";
import { seo } from "./seo";
import { ServiceTocLayout } from "@/components/service/ServiceToc";

/* Warm "binder" style: cream page, white paper cards, DM Serif Display headings. */
const W = "mx-auto box-border max-w-[1200px] px-4 md:px-7";
const sec = "py-16 md:py-24";
const two = "grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-14";
const paper = "rounded-[4px_14px_14px_14px] bg-white shadow-[0_1px_0_#E2DCD0,0_24px_60px_rgba(20,33,43,0.10)]";
const btn = "btn min-h-[52px] rounded-[10px]";
const btnOutline = "btn min-h-[52px] rounded-[10px] border-[1.5px] border-ink bg-transparent text-ink hover:bg-ink hover:text-white";

function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 mb-3 text-xs font-extrabold tracking-[1.4px] text-brand uppercase", className)}>{children}</p>;
}

function H2({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("m-0 mb-4 font-dmserif text-4xl leading-[1.05] font-normal tracking-[-1px] md:text-[52px]", className)}>{children}</h2>
  );
}

function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 max-w-[680px] text-lg leading-[1.65] text-body", className)}>{children}</p>;
}

export default function SystemisePage() {
  return (
    <div className="bg-sand">
      {/* HERO */}
      <section>
        <div className={cn(W, "pt-16 pb-[88px]")}>
          <div className={cn(two, "mb-14 items-center")}>
            <div>
              <Breadcrumbs seo={seo} separator="›" className="mb-[18px]" />
              <h1 className="m-0 mb-[22px] font-dmserif text-5xl leading-none font-normal tracking-[-1.5px] md:text-[70px]">
                Your business, written down. <em className="text-brand">Your VA, trained by it.</em>
              </h1>
            </div>
            <div>
              <p className="m-0 mb-[26px] text-lg leading-[1.7] text-ink-prose">
                Get <strong>the same SOPs we use to train our own VAs</strong>, ready-made or tailored to the way you run
                your properties. Share them with your in-house VA, your current VA or a new hire.{" "}
                <strong>SOPs are your fundamentals:</strong> when a VA changes, your systems stay.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#library" className={cn(btn, "btn-coral")}>
                  See the SOP library
                </a>
                <a href="#price" className={btnOutline}>
                  Book a 20-minute call
                </a>
              </div>
            </div>
          </div>
          <SopViewer />
          <p className="m-0 mt-3.5 text-center text-[13px] text-muted">
            Sample pages for illustration. Your tailored SOPs use your properties, tools and rules.
          </p>
        </div>
      </section>

      <ServiceTocLayout items={sidebarToc} cta={sidebarCta}>
        {/* VA CHANGE SIMULATOR */}
        <section id="va-change" className={cn(sec, "bg-ink text-white")}>
          <div className={W}>
            <div className={cn(two, "mb-10 items-end")}>
              <div>
                <Label className="text-coral-200">Why SOPs are your fundamentals</Label>
                <H2 className="text-white">What happens when your VA changes?</H2>
              </div>
              <Lead className="text-mist">
                Without SOPs, everything lives in your head, and every new VA starts from zero. With SOPs, the knowledge
                stays with your business. Switch to see the difference over a year.
              </Lead>
            </div>
            <VaChangeSim />
            <p className="m-0 mt-4 text-[13px] leading-normal text-faint">
              Illustration, not data. Training time depends on the person and your business.
            </p>
          </div>
        </section>

        {/* WHO + BENEFITS */}
        <section id="who" className={sec}>
          <div className={W}>
            <Label>Who it’s for</Label>
            <H2>Built for hosts who work with a VA</H2>
            <div className="mt-9 grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-4">
              {who.map((w) => (
                <div key={w.k}>
                  <span
                    className="-mb-px inline-flex items-center gap-2 rounded-t-[10px] py-2 pr-3.5 pl-3 text-xs font-extrabold tracking-[1.2px] uppercase"
                    style={{ background: w.c, color: w.f }}
                  >
                    {w.k}
                  </span>
                  <div className={cn(paper, "box-border min-h-[170px] p-[22px]")}>
                    <p className="m-0 mb-2.5 font-dmserif text-[23px] leading-[1.15]">{w.h}</p>
                    <p className="m-0 text-sm leading-[1.55] text-body">{w.t}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-14 grid grid-cols-1 border-t border-[#D9D2C4] md:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.h} className="border-b border-[#D9D2C4] py-6 pr-6">
                  <p className="m-0 mb-1.5 text-[17px] font-extrabold">{b.h}</p>
                  <p className="m-0 text-[15px] leading-[1.55] text-body">{b.t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LIBRARY */}
        <section className={cn(sec, "bg-[#EFE9DE]")} id="library">
          <div className={W}>
            <div className={cn(two, "mb-9 items-end")}>
              <div>
                <Label>The SOP library</Label>
                <H2>[X] SOPs across {folders.length} areas</H2>
              </div>
              <Lead>Built from how our own team runs short lets every day. Open a folder to see what’s inside.</Lead>
            </div>
            <LibraryFolders />
          </div>
        </section>

        {/* ANATOMY */}
        <section id="anatomy" className={sec}>
          <div className={W}>
            <Anatomy
              heading={
                <>
                  <Label>Anatomy of an SOP</Label>
                  <H2>Eight parts, every time.</H2>
                  <Lead>Same structure on every page, so your VA always knows where to look. Tap a part.</Lead>
                </>
              }
            />
          </div>
        </section>

        {/* OPTIONS */}
        <section id="options" className={cn(sec, "bg-white")}>
          <div className={W}>
            <div className="mx-auto mb-10 max-w-[760px] text-center">
              <Label>Every business is different</Label>
              <H2>Ready-made, tailored or built from scratch</H2>
              <Lead className="mx-auto">Not every host runs their properties the same way, so we don’t force you into ours.</Lead>
            </div>
            <OptionsFlow />
          </div>
        </section>

        {/* TRAINING PLAN */}
        <section id="training" className={sec}>
          <div className={W}>
            <TrainingPlan
              heading={
                <>
                  <Label>Training a VA with SOPs</Label>
                  <H2>A 4-week plan, from reading to running.</H2>
                  <Lead>Drag through the weeks to see how responsibility moves from you to your VA.</Lead>
                </>
              }
            />
          </div>
        </section>

        {/* ACCESS */}
        <section id="access" className={cn(sec, "bg-white")}>
          <div className={W}>
            <div className={cn(two, "mb-9 items-end")}>
              <div>
                <Label>Access, passwords and guest data</Label>
                <H2>Systemise safely.</H2>
              </div>
              <Lead>Every SOP set includes access rules and an offboarding checklist.</Lead>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-4">
              {access.map((a) => (
                <div key={a.h} className="rounded-[18px] bg-sand p-[22px]">
                  <div className="mb-3.5 flex gap-2">
                    <span className="rounded-full bg-coral-50 px-2.5 py-[5px] text-xs font-extrabold text-brand line-through">{a.no}</span>
                  </div>
                  <p className="m-0 mb-2 text-[17px] leading-[1.3] font-extrabold">{a.h}</p>
                  <p className="m-0 text-sm leading-[1.55] text-body">{a.t}</p>
                </div>
              ))}
            </div>
            <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
              Sources: Airbnb Help Centre, What co-hosts can do (article 1534) · ICO, Contracts between controllers and
              processors (UK GDPR Article 28).
            </p>
            <div className="mt-12 grid grid-cols-1 gap-3.5 md:grid-cols-3">
              {honest.map((h) => (
                <div key={h.b} className="border-t-[3px] border-ink pt-4">
                  <p className="m-0 mb-1.5 text-[17px] font-extrabold">{h.b}</p>
                  <p className="m-0 text-sm leading-[1.55] text-body">{h.t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICE */}
        <section className={sec} id="price">
          <div className={W}>
            <div className={cn(paper, "grid grid-cols-1 items-center gap-10 p-7 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:p-11")}>
              <div>
                <Label>Part of the Build package</Label>
                <H2 className="md:text-[44px]">Stop training from scratch. Start with a system.</H2>
                <p className="m-0 mb-6 text-base leading-[1.6] text-body">
                  Optional VA handover session and SOP update plan available. [Proof: add a real host who trained a new VA
                  with your SOPs, with permission.]
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="#library" className={cn(btn, "btn-coral")}>
                    See the SOP library
                  </a>
                  <SmartLink href={brand.links.bookCall} className={cn(btn, "btn-ink")}>
                    Book a 20-minute call
                  </SmartLink>
                </div>
              </div>
              <div className="grid gap-2.5">
                {priceRows.map((p) => (
                  <div
                    key={p.t}
                    className={cn("flex items-center justify-between gap-3 rounded-xl px-5 py-[18px]", p.dark ? "bg-ink text-white" : "bg-sand text-ink")}
                  >
                    <span className="text-base font-extrabold">{p.t}</span>
                    <span className="text-lg font-extrabold">{p.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={cn(sec, "bg-[#EFE9DE]")}>
          <div className={cn(W, "max-w-[920px]")}>
            <Label>Index</Label>
            <H2>Frequently asked questions</H2>
            <FaqIndex />
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="mr-1.5 self-center text-[13px] font-extrabold text-body">Related:</span>
              {related.map((r) => (
                <SmartLink
                  key={r.label}
                  href={r.href}
                  className="rounded-lg bg-white px-3.5 py-[9px] text-sm font-bold text-ink no-underline hover:text-brand"
                >
                  {r.label}
                </SmartLink>
              ))}
            </div>
            <p className="m-0 mt-6 text-[13px] text-muted">{reviewedBy("November 2026")}</p>
          </div>
        </section>
      </ServiceTocLayout>
    </div>
  );
}
