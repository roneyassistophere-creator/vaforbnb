import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { MailtoForm } from "@/components/ui/MailtoForm";
import { SmartLink } from "@/components/ui/SmartLink";
import { DetailsFaq, reviewedBy } from "@/components/service/ServiceBlocks";
import { CompareToggle, PhotoStandard } from "./_components/Toggles";
import {
  backup,
  cases,
  docLines,
  facts,
  fair,
  faq,
  honest,
  log,
  missed,
  packageCta,
  proof,
  quad,
  sidebarCta,
  sidebarToc,
  sources,
  status,
  steps,
  stock,
  stockCats,
  track,
} from "./content";
import { seo } from "./seo";
import { ServiceTocLayout } from "@/components/service/ServiceToc";

/* Page-local building blocks: rounded white panels on a grey-blue background. */

function Panel({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("mx-1.5 mb-1.5 overflow-hidden rounded-[22px] bg-white md:mx-3 md:mb-3 md:rounded-[32px]", className)}>
      {children}
    </section>
  );
}

function Inner({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto box-border max-w-[1140px] px-5 py-[60px] md:px-8 md:py-[88px]", className)}>{children}</div>;
}

function Tag({ children, light = false, className }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <p
      className={cn(
        "m-0 mb-5 inline-block rounded-lg border-[1.5px] px-2.5 py-1.5 text-xs font-extrabold tracking-[1.2px] uppercase",
        light ? "border-current" : "border-ink text-ink",
        className,
      )}
    >
      {children}
    </p>
  );
}

function H2({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("m-0 mb-4 text-[32px] leading-[1.08] font-extrabold tracking-[-1.6px] md:text-[44px]", className)}>{children}</h2>
  );
}

const duo = "grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12";

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CleaningCoordinationPage() {
  return (
    <div className="bg-[#EDF1F4] pt-1.5 pb-px md:pt-3">
      {/* HERO */}
      <Panel>
        <Inner className={cn(duo, "items-center md:pt-[72px]")}>
          <div>
            <Breadcrumbs seo={seo} className="mb-[18px]" />
            <h1 className="m-0 mb-6 text-[44px] leading-[1.02] font-extrabold tracking-[-2.4px] md:text-[60px]">
              Every turnover scheduled, chased and <span className="rounded-[10px] bg-coral-50 px-2">proven</span>.
            </h1>
            <p className="m-0 mb-8 text-lg leading-[1.7] text-ink-copy">
              We don’t just forward your calendar to the cleaner. Our team schedules, confirms, reminds and follows up,
              then collects <strong className="text-ink">timestamped before and after photos and videos</strong> of
              every clean. If a guest says the oven wasn’t clean, you have the evidence in minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <SmartLink href={brand.links.bookCall} className="btn btn-coral min-h-[52px] rounded-2xl">
                Book a 20-minute call
              </SmartLink>
              <a href="#checklist" className="btn btn-outline min-h-[52px] rounded-2xl border-[1.5px] border-[#D5DADF]">
                Get the free checklist
              </a>
            </div>
          </div>
          <div className="grid gap-2.5 rounded-[28px] bg-[#EDF1F4] p-[22px]">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1.5 pt-1 pb-2">
              <span className="text-[15px] font-extrabold">Flat 2 · Turnover today</span>
              <span className="text-[13px] font-bold text-body">Check-out 11:00 → Check-in 15:00</span>
            </div>
            {status.map((s) => (
              <div key={s.t} className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-white px-4 py-3.5">
                <span className={cn("flex size-[34px] items-center justify-center rounded-[10px]", s.done ? "bg-green-100" : "bg-coral-50")}>
                  <CheckIcon color={s.done ? "#1F6B45" : "#B8383A"} />
                </span>
                <span className="text-[15px] font-bold">
                  {s.t}
                  <span className="block text-[13px] font-medium text-muted">{s.d}</span>
                </span>
                <span className="text-[13px] font-bold text-body">{s.time}</span>
              </div>
            ))}
            <p className="m-0 mx-1.5 mt-1 text-xs text-muted">Illustration with example times.</p>
          </div>
        </Inner>
      </Panel>

      <ServiceTocLayout items={sidebarToc} cta={sidebarCta}>
        {/* COMPARE */}
        <Panel id="compare">
          <Inner>
            <CompareToggle
              heading={
                <div>
                  <Tag>The difference</Tag>
                  <H2 className="m-0 max-w-[620px]">Forwarding a schedule isn’t coordination</H2>
                </div>
              }
            />
          </Inner>
        </Panel>

        {/* FACTS */}
        <Panel id="facts" className="bg-ink text-white">
          <Inner>
            <Tag light>Why it matters</Tag>
            <H2 className="mb-10 max-w-[760px] text-white">Turnovers decide your reviews, and your claims</H2>
            {facts.map((f) => (
              <div key={f.n} className="grid grid-cols-1 items-baseline gap-x-10 gap-y-3 border-t border-night-4 py-7 md:grid-cols-3">
                <span className="text-[64px] leading-none font-extrabold tracking-[-3px] text-coral-200">{f.n}</span>
                <span className="text-lg leading-normal font-semibold">{f.t}</span>
                <span className="text-[15px] leading-normal text-mist">
                  {f.m}
                  <span className="mt-1.5 block text-xs text-faint">{f.s}</span>
                </span>
              </div>
            ))}
          </Inner>
        </Panel>

        {/* TURNOVER TRACK */}
        <Panel id="turnover">
          <Inner>
            <Tag>How we run every turnover</Tag>
            <H2 className="mb-11">From booking to “ready for check-in”</H2>
            <ol className="m-0 grid list-none grid-cols-1 p-0 sm:grid-cols-2 md:grid-cols-5">
              {track.map((t) => (
                <li key={t.w} className="pr-[18px] pb-7">
                  <div className="mb-4 flex items-center">
                    <span
                      className={cn("size-4 flex-none rounded-full shadow-[0_0_0_5px_#FDECEC]", t.hot ? "bg-coral" : "bg-ink")}
                    />
                    <span className="h-0.5 flex-1 bg-line" />
                  </div>
                  <p className="m-0 mb-1.5 text-xs font-extrabold tracking-[1px] text-brand uppercase">{t.w}</p>
                  <p className="m-0 text-[15px] leading-normal text-ink-hover">{t.t}</p>
                </li>
              ))}
            </ol>
          </Inner>
        </Panel>

        {/* PHOTO STANDARD */}
        <Panel id="photo-standard" className="bg-sand">
          <Inner>
            <PhotoStandard />
          </Inner>
        </Panel>

        {/* EVIDENCE SCENARIOS */}
        <Panel id="evidence">
          <Inner>
            <Tag>How the evidence protects you</Tag>
            <H2 className="mb-10">When something goes wrong, you’re not guessing</H2>
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
              {cases.map((c) => (
                <div key={c.if} className="overflow-hidden rounded-[22px] border-[1.5px] border-line">
                  <div className="flex items-baseline gap-3 bg-[#F6F8FA] px-[22px] py-[18px]">
                    <span className="text-xs font-extrabold tracking-[1px] text-brand-deep">IF</span>
                    <span className="text-base leading-[1.4] font-extrabold">{c.if}</span>
                  </div>
                  <div className="grid gap-2.5 px-[22px] py-[18px]">
                    <p className="m-0 text-[15px] leading-[1.55]">
                      <span className="mr-2 text-xs font-extrabold tracking-[1px]">WE</span>
                      {c.we}
                    </p>
                    <p className="m-0 text-sm leading-[1.55] font-semibold text-green">{c.why}</p>
                  </div>
                </div>
              ))}
              <div className="flex flex-col justify-center rounded-[22px] bg-coral-50 p-6">
                <p className="m-0 mb-2 text-base font-extrabold">Honest note</p>
                <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">
                  Evidence supports your case; it doesn’t guarantee an outcome. Airbnb reviews each refund request and
                  damage claim and decides.
                </p>
              </div>
            </div>
          </Inner>
        </Panel>

        {/* SPOT CHECK */}
        <Panel id="spot-checks" className="bg-ink text-white">
          <Inner className={cn(duo, "items-center")}>
            <div>
              <Tag light className="text-coral-200">
                Host tip
              </Tag>
              <H2 className="text-white">Random video spot checks</H2>
              <p className="m-0 mb-[26px] max-w-[680px] text-lg leading-[1.65] text-mist">
                On a cleaning day, your VA video calls the cleaner at a random moment and asks to see one random spot:
                behind the toilet, under a bed, inside the oven door, the top of a wardrobe. Two minutes shows whether the
                clean is thorough, not just tidy.
              </p>
              <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2">
                {fair.map((f) => (
                  <li key={f} className="rounded-[14px] bg-night-field px-4 py-3.5 text-sm leading-normal text-[#E4E9ED]">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="box-border w-full max-w-[420px] justify-self-center rounded-[28px] bg-ink-deep p-[18px]" aria-hidden="true">
              <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-[20px] bg-night-2">
                <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#3A4B58]" />
                <div className="absolute bottom-[20%] left-[18%] h-[28%] w-[34%] rounded-[40%_40%_12px_12px] bg-[#E9EDF0]" />
                <div className="absolute bottom-[46%] left-[24%] h-[18%] w-[22%] rounded-lg bg-[#DDE3E8]" />
                <span className="absolute top-3.5 left-3.5 rounded-full bg-coral px-[9px] py-[5px] text-xs font-extrabold text-ink">
                  Live · 02:14
                </span>
                <div className="absolute top-3.5 right-3.5 flex h-24 w-[74px] items-center justify-center rounded-xl bg-body text-xs font-extrabold text-white">
                  VA
                </div>
                <div className="relative m-4 rounded-[14px] bg-white/95 px-3.5 py-3 text-sm leading-[1.4] font-bold text-ink">
                  “Could you show me behind the toilet, please?”
                </div>
              </div>
              <div className="mt-3.5 flex justify-center gap-3.5">
                <span className="size-11 rounded-full bg-ink-hover" />
                <span className="size-11 rounded-full bg-coral" />
                <span className="size-11 rounded-full bg-ink-hover" />
              </div>
              <p className="m-0 mt-2.5 text-center text-xs text-faint">Illustration</p>
            </div>
          </Inner>
        </Panel>

        {/* RESTOCKING */}
        <Panel id="restocking">
          <Inner className={duo}>
            <div>
              <Tag>Restocking and basic inventory</Tag>
              <H2>No empty coffee jar on the first morning</H2>
              <p className="m-0 mb-6 max-w-[680px] text-lg leading-[1.65] text-body">
                Your cleaner reports what’s low at every turnover, with a photo. You set a minimum for each item; when
                something drops below it, we arrange the restock your way: preferred supplier, a delivery order, or the
                cleaner buys it and we log the receipt.
              </p>
              <div className="rounded-[18px] bg-sand px-5 py-[18px] text-[15px] leading-[1.6] text-ink-copy">
                <strong className="text-ink">Airbnb’s own tip:</strong> keep spare sets of sheets and towels for same-day
                turnovers, and choose towels that dry quickly.
              </div>
              <p className="m-0 mt-[18px] text-[13px] leading-normal text-muted">
                Source: Airbnb Resource Centre, How to put Airbnb’s 5-step cleaning process into practice.
              </p>
            </div>
            <div className="rounded-3xl bg-[#F6F8FA] p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[15px] font-extrabold">Flat 2 · supplies after today’s clean</span>
                <span className="text-xs font-bold text-muted">Example</span>
              </div>
              {stock.map((s) => (
                <div key={s.n} className="grid grid-cols-[120px_minmax(0,1fr)_64px] items-center gap-3 py-[9px] md:grid-cols-[140px_minmax(0,1fr)_70px]">
                  <span className="text-sm font-bold">{s.n}</span>
                  <div className="h-2.5 overflow-hidden rounded-[5px] bg-[#E2E6EA]">
                    <div className={cn("h-2.5 rounded-[5px]", s.low ? "bg-coral" : "bg-ink")} style={{ width: s.w }} />
                  </div>
                  <span className={cn("text-right text-xs font-extrabold", s.low ? "text-brand" : "text-green")}>{s.st}</span>
                </div>
              ))}
              <div className="mt-[18px] grid grid-cols-2 gap-2 md:grid-cols-3">
                {stockCats.map((c) => (
                  <span key={c.h} className="rounded-xl bg-white px-3 py-2.5 text-[13px] leading-[1.45] text-ink-copy">
                    <strong className="block text-ink">{c.h}</strong>
                    {c.t}
                  </span>
                ))}
              </div>
            </div>
          </Inner>
        </Panel>

        {/* BACKUP */}
        <Panel id="backup" className="bg-coral-50">
          <Inner className={cn(duo, "items-center")}>
            <div>
              <Tag>Same-day turnovers and backup cleaners</Tag>
              <H2>11am out, 3pm in. No room for a missed clean.</H2>
              {backup.map((b) => (
                <p key={b.h} className="m-0 mb-3 text-base leading-[1.55] text-ink-copy">
                  <strong className="text-ink">{b.h}</strong> {b.t}
                </p>
              ))}
            </div>
            <div className="rounded-3xl bg-white p-[26px]">
              <p className="m-0 mb-[18px] text-[13px] font-extrabold tracking-[1px] text-muted">WHEN A CLEANER CANCELS · EXAMPLE</p>
              <ol className="relative m-0 list-none py-0 pr-0 pl-[26px]">
                <div className="absolute top-1.5 bottom-1.5 left-1.5 w-0.5 bg-[#F0D3D3]" aria-hidden="true" />
                {log.map((l) => (
                  <li key={l.t} className="relative pb-[18px]">
                    <span className="absolute top-[3px] -left-[26px] size-3.5 rounded-full" style={{ background: l.c }} />
                    <p className="m-0 mb-0.5 text-[13px] font-extrabold text-brand">{l.t}</p>
                    <p className="m-0 text-[15px] leading-normal">{l.d}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Inner>
        </Panel>

        {/* FAIR FOR EVERYONE */}
        <Panel id="fair">
          <Inner>
            <div className="mx-auto mb-11 max-w-[720px] text-center">
              <Tag>Fair for everyone</Tag>
              <H2>A smooth turnover shouldn’t create a new problem for anyone</H2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              {quad.map((q) => (
                <div
                  key={q.h}
                  className="flex min-h-[200px] flex-col justify-between gap-5 rounded-3xl p-7"
                  style={{ background: q.bg, color: q.fg }}
                >
                  <span className="text-[30px] font-extrabold tracking-[-1px]">{q.h}</span>
                  <span className="text-[15px] leading-[1.55]">{q.t}</span>
                </div>
              ))}
            </div>
          </Inner>
        </Panel>

        {/* STANDARD + CHECKLIST */}
        <Panel id="checklist" className="bg-sand">
          <Inner className={cn(duo, "items-center")}>
            <div>
              <Tag>The standard we check against</Tag>
              <H2>The spots that get missed, and that we look for</H2>
              <ul className="m-0 mb-5 grid list-none gap-2 p-0">
                {missed.map((m) => (
                  <li key={m} className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-3 text-[15px]">
                    <span className="flex size-5 flex-none items-center justify-center rounded-md border-2 border-ink">
                      <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#B8383A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {m}
                  </li>
                ))}
              </ul>
              <p className="m-0 text-[15px] leading-[1.6] text-ink-copy">
                Airbnb also suggests a deep clean every two or three months. We schedule it and remind you when it’s due.
              </p>
            </div>
            <div className="rounded-[28px] bg-ink p-6 text-white md:p-8">
              <div className="mb-6 -rotate-2 rounded-2xl bg-white p-5 text-ink shadow-[0_16px_40px_rgba(0,0,0,0.3)]" aria-hidden="true">
                <p className="m-0 mb-3 text-[13px] font-extrabold tracking-[1px] text-brand">TURNOVER CLEANING CHECKLIST</p>
                {docLines.map((d) => (
                  <div key={d} className="flex items-center gap-2.5 border-b border-line-4 py-1.5 text-[13px] last:border-b-0">
                    <span className="size-3.5 flex-none rounded border-[1.5px] border-ink" />
                    {d}
                  </div>
                ))}
              </div>
              <h3 className="m-0 mb-2 text-[26px] font-extrabold tracking-[-0.6px]">The checklist our cleaners work from, free</h3>
              <p className="m-0 mb-5 text-[15px] leading-[1.6] text-mist">
                Room by room, with often-missed spots, the photo list and a printable page to tick on the day.
              </p>
              <MailtoForm
                ariaLabel="Get the checklist"
                subject="Send me the turnover cleaning checklist"
                className="grid gap-2.5"
                labelClassName="grid gap-1.5 text-[13px] font-bold text-[#E4E9ED]"
                fieldClassName="field rounded-xl border-none"
                fields={[{ name: "email", label: "Email", type: "email", required: true }]}
                submitLabel="Send me the checklist"
                submitClassName="btn btn-coral w-full"
              />
            </div>
          </Inner>
        </Panel>

        {/* MAINTENANCE STRIP */}
        <Panel id="maintenance">
          <Inner className="flex flex-wrap items-center gap-6 py-12 md:py-12">
            <span className="flex size-16 flex-none items-center justify-center rounded-[18px] bg-[#EDF1F4]">
              <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"
                  fill="none"
                  stroke="#14212B"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="flex-[1_1_480px]">
              <h2 className="m-0 mb-1.5 text-[22px] font-extrabold">Maintenance issues spotted at turnover</h2>
              <p className="m-0 text-[15px] leading-[1.6] text-body">
                A dripping tap, a broken blind, a stubborn stain: the cleaner reports it with a photo, and we pass it to
                you or your maintenance contact with a suggested fix, before the next guest notices.
              </p>
            </div>
          </Inner>
        </Panel>

        {/* PROCESS + HONEST */}
        <Panel id="process">
          <Inner className={duo}>
            <div>
              <Tag>How it works</Tag>
              <H2 className="mb-7">Up and running in five steps</H2>
              <ol className="m-0 list-none p-0">
                {steps.map((s) => (
                  <li key={s.n} className="flex items-start gap-4 border-t border-line-4 py-4">
                    <span className="flex h-8 min-w-[52px] flex-none items-center justify-center rounded-full bg-ink text-[13px] font-extrabold text-white">
                      {s.n}
                    </span>
                    <span>
                      <strong className="mb-[3px] block text-base">{s.h}</strong>
                      <span className="text-[15px] leading-[1.55] text-body">{s.t}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl bg-[#F6F8FA] p-[30px]">
              <Tag className="mb-[18px]">What to expect, honestly</Tag>
              {honest.map((h) => (
                <div key={h.b} className="border-b border-line py-3.5 last:border-b-0">
                  <p className="m-0 mb-1 text-base font-extrabold">{h.b}</p>
                  <p className="m-0 text-sm leading-[1.55] text-body">{h.t}</p>
                </div>
              ))}
            </div>
          </Inner>
        </Panel>

        {/* PROOF */}
        <Panel id="proof">
          <Inner>
            <Tag>Proof</Tag>
            <H2 className="mb-8">Turnover numbers, with screenshots</H2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              {proof.map((p) => (
                <div key={p.k} className="rounded-[22px] bg-[#EDF1F4] p-[26px]">
                  <div className="mb-2 text-[40px] font-extrabold tracking-[-1.5px]">{p.v}</div>
                  <p className="m-0 mb-3 text-[15px] leading-[1.45] font-bold">{p.k}</p>
                  <p className="m-0 text-[13px] text-muted">{p.e}</p>
                </div>
              ))}
            </div>
            <p className="m-0 mt-[18px] text-[13px] leading-normal text-muted">
              Real client data only, with permission. No guest belongings shown in photo examples.
            </p>
          </Inner>
        </Panel>

        {/* RUN PACKAGE */}
        <Panel id="call" className="bg-coral">
          <Inner className="flex flex-wrap items-center justify-between gap-7 py-16 md:py-16">
            <div className="flex-[1_1_520px] text-ink">
              <p className="m-0 mb-2.5 text-[13px] font-extrabold tracking-[1.4px]">INCLUDED IN THE RUN PACKAGE</p>
              <h2 className="m-0 mb-2.5 text-[30px] leading-[1.1] font-extrabold tracking-[-1.2px] md:text-4xl">{packageCta.title}</h2>
              <p className="m-0 text-base leading-[1.6] font-medium">{packageCta.text}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <SmartLink href={brand.links.bookCall} className="btn btn-ink min-h-[52px] rounded-2xl">
                Book a 20-minute call
              </SmartLink>
              <a href="#checklist" className="btn btn-white min-h-[52px] rounded-2xl">
                Free checklist
              </a>
            </div>
          </Inner>
        </Panel>

        {/* FAQ */}
        <Panel id="faq">
          <Inner>
            <div className="mb-10 text-center">
              <Tag>FAQ</Tag>
              <H2>Cleaning questions hosts ask</H2>
            </div>
            <DetailsFaq items={faq} />
            <p className="m-0 mt-10 text-center text-[13px] leading-[1.7] text-muted">
              <strong className="text-ink-copy">Sources:</strong> {sources} {reviewedBy("November 2026")}
            </p>
          </Inner>
        </Panel>
      </ServiceTocLayout>
    </div>
  );
}
