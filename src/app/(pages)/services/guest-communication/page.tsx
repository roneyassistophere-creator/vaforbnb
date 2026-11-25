import { brand } from "@/config/brand";
import { isToolLive, toolBySlug } from "@/content/tools/catalog";
import { toolSlug as registerSlug } from "@/content/tools/guestRegisterId";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { MailtoForm } from "@/components/ui/MailtoForm";
import { SmartLink } from "@/components/ui/SmartLink";
import {
  FaqGrid,
  Kicker,
  PackageCta,
  ProofGrid,
  RelatedLinks,
  reviewedBy,
  SectionHead,
} from "@/components/service/ServiceBlocks";
import { HardMoments } from "./_components/HardMoments";
import {
  channels,
  compare,
  faq,
  glance,
  hero,
  inbox,
  journey,
  packageCta,
  proof,
  related,
  rules,
  sidebarCta,
  sidebarToc,
  sources,
  speed,
  steps,
} from "./content";
import { seo } from "./seo";
import { ServiceTocLayout } from "@/components/service/ServiceToc";

const HOURS = Array.from({ length: 24 }, (_, i) => i >= 8 && i < 20);

function Highlight({ children, n }: { children: React.ReactNode; n: string }) {
  return (
    <>
      <span className="rounded bg-coral-50 px-1 py-0.5">{children}</span>{" "}
      <sup className="text-[11px] font-extrabold text-brand">{n}</sup>
    </>
  );
}

export default function GuestCommunicationPage() {
  return (
    <>
      {/* HERO + INBOX */}
      <section className="overflow-hidden bg-white">
        <div className="wrap pt-10 text-center md:pt-[72px]">
          <div className="mb-8 flex justify-center">
            <Breadcrumbs seo={seo} />
          </div>
          <Kicker>{hero.kicker}</Kicker>
          <h1 className="mx-auto mb-6 max-w-[900px] text-[42px] leading-[1.04] font-extrabold tracking-[-2.4px] md:text-[62px]">
            {hero.title}
          </h1>
          <p className="mx-auto mb-8 max-w-[760px] text-[19px] leading-[1.65] text-ink-copy">
            Our team replies to your guests on Airbnb, Booking.com, Vrbo, WhatsApp and email, written as you. General
            questions in <strong className="text-ink">under 5 minutes</strong>; questions that need research in{" "}
            <strong className="text-ink">10 to 15 minutes</strong>.
          </p>
          <div className="mb-16 flex flex-wrap justify-center gap-3">
            <SmartLink href={brand.links.bookCall} className="btn btn-ink">
              {hero.primary}
            </SmartLink>
            <a href="#templates" className="btn btn-outline border-[1.5px] border-[#D5DADF]">
              {hero.secondary}
            </a>
          </div>

          <div className="mx-auto box-border max-w-[980px] rounded-t-[28px] bg-sand px-4 pt-4 md:px-7 md:pt-7">
            <div className="flex min-h-[380px] overflow-hidden rounded-t-[18px] bg-white text-left">
              <div className="hidden w-[260px] flex-none border-r border-line-4 py-[18px] md:block">
                <p className="mx-[18px] mt-0 mb-3 text-xs font-extrabold tracking-[1px] text-muted">INBOX · ALL CHANNELS</p>
                {inbox.map((m) => (
                  <div key={m.n} className={cn("flex items-center gap-2.5 px-[18px] py-3", m.active ? "bg-[#FDF3F3]" : "bg-white")}>
                    <span className="flex size-9 flex-none items-center justify-center rounded-full bg-[#E9EDF0] text-[13px] font-extrabold">
                      {m.i}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between text-sm font-bold">
                        {m.n}
                        <span className="text-[11px] font-bold text-muted">{m.ch}</span>
                      </span>
                      <span className="block truncate text-[13px] text-muted">{m.p}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 py-[22px] md:px-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-4 pb-3.5">
                  <span className="text-[15px] font-extrabold">Sarah · Canal-view flat · 3 nights</span>
                  <span className="rounded-full bg-green-100 px-2.5 py-[5px] text-xs font-bold text-green">Replied in 3 min</span>
                </div>
                <Bubble side="guest" time="14:02">
                  Hi! What’s the nearest station, and how do we get there from the flat?
                </Bubble>
                <Bubble side="team" time="14:05 · Reservations Team">
                  Hi Sarah, great question! The nearest station is [Station], a [X]-minute walk. Turn left out of the
                  front door, then right onto [Street]. Here’s the route: [map link]
                </Bubble>
                <Bubble side="guest" time="14:06">
                  Perfect, thank you so much!
                </Bubble>
              </div>
            </div>
          </div>
          <p className="mt-2.5 mb-0 text-xs text-muted">Illustration. Replace with a real anonymised chat screenshot.</p>
        </div>
      </section>

      <ServiceTocLayout items={sidebarToc} cta={sidebarCta}>
        {/* AT A GLANCE */}
        <section id="glance" className="bg-ink text-white">
          <div className="wrap grid grid-cols-1 items-start gap-8 py-[72px] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] md:gap-12">
            <div>
              <h2 className="m-0 mb-3 text-[32px] font-extrabold tracking-[-1px]">At a glance</h2>
              <p className="m-0 text-base leading-[1.6] text-mist">Exactly what you get. No 24/7 claims, no vague promises.</p>
            </div>
            <dl className="m-0 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {glance.map((g) => (
                <div key={g.k} className="border-t border-night-4 py-4">
                  <dt className="mb-1.5 text-xs font-extrabold tracking-[1px] text-coral-200 uppercase">{g.k}</dt>
                  <dd className="m-0 text-base leading-normal text-white">{g.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* WHY: bento */}
        <section id="why" className="sec">
          <div className="wrap">
            <SectionHead
              kicker="Why it matters"
              title="Fast replies feed your ranking, your reviews and your rates"
              lead="What the platforms and guests say, with sources."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="flex min-h-[340px] flex-col justify-between gap-7 rounded-[22px] bg-ink p-9 text-white md:col-span-2 md:row-span-2">
                <span className="text-[13px] font-bold text-coral-200">Vrbo Built to Stay Report, July 2026</span>
                <div>
                  <div className="text-[80px] leading-[0.9] font-extrabold tracking-[-5px] md:text-[104px]">79%</div>
                  <p className="m-0 mt-[18px] max-w-[420px] text-xl leading-[1.45] font-semibold">
                    of travellers name a host who responds quickly when something goes wrong as a top quality signal.
                  </p>
                </div>
              </div>
              <Stat big="56%" className="bg-coral text-ink" textCls="font-semibold">
                expect a reply within an hour if something goes wrong during their stay.
              </Stat>
              <Stat big="81%" className="bg-sand">
                would pay more for stronger trust signals, like timely communication.
              </Stat>
              <Stat big="90%" className="border-[1.5px] border-line">
                response rate needed for Airbnb Superhost, within 24 hours, over 365 days.
              </Stat>
              <Stat big="24h" className="border-[1.5px] border-line">
                After this, Vrbo counts it as “no response”; requests may auto-decline.
              </Stat>
              <div className="flex flex-wrap items-center gap-6 rounded-[22px] bg-coral-50 p-7 md:col-span-2">
                <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
                  <path d="M4 5h16v11H9l-5 4V5z" fill="none" stroke="#14212B" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M8 10h8M8 13h5" stroke="#B8383A" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <p className="m-0 flex-[1_1_260px] text-base leading-[1.55] text-ink-hover">
                  <strong className="text-ink">Airbnb ranks on responsiveness.</strong> It lists “your response times to
                  inquiries” among its search factors, and Communication is one of six category ratings on your listing.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-6 rounded-[22px] bg-[#F5F6F7] p-7 md:col-span-2">
                <div className="text-[40px] font-extrabold tracking-[-1.5px]">12h</div>
                <p className="m-0 flex-[1_1_260px] text-[15px] leading-[1.55] text-ink-copy">
                  Vrbo recommends replying within 12 hours, with an 85%+ response rate.
                </p>
              </div>
            </div>
            <p className="mt-[18px] mb-0 text-[13px] leading-normal text-muted">
              Sources: Vrbo Built to Stay Report (July 2026); Hostfully, Airbnb Superhost criteria (2026); Vrbo Help,
              responsiveness metrics; Airbnb, How search works.
            </p>
          </div>
        </section>

        {/* MEASURE: 24h bar */}
        <section id="measure" className="sec bg-sand">
          <div className="wrap">
            <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <Kicker className="bg-white">How Airbnb measures you</Kicker>
                <h2 className="h2">Two numbers, measured differently</h2>
                <p className="lead">
                  A host with a full-time job can keep a 100% response rate and still show “responds within a few hours”.
                  We reply in minutes during the day, so your response time stays fast as well as your rate.
                </p>
              </div>
              <div className="grid gap-4">
                {[
                  { h: "Response rate", t: "Share of new enquiries and booking requests answered within 24 hours, over the past 365 days.", hurt: "missing the 24-hour window, even once." },
                  { h: "Response time", t: "How quickly you typically reply, shown to guests on your listing.", hurt: "replies left for the evening or next day." },
                ].map((c) => (
                  <div key={c.h} className="rounded-[18px] bg-white p-[26px]">
                    <h3 className="m-0 mb-2 text-[19px] font-extrabold">{c.h}</h3>
                    <p className="m-0 mb-2.5 text-[15px] leading-[1.55] text-ink-copy">{c.t}</p>
                    <p className="m-0 text-sm font-bold text-brand-deep">Hurt by: {c.hurt}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-14 rounded-[20px] bg-white px-5 pt-7 pb-[22px] md:px-7">
              <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
                <span className="text-base font-extrabold">Your guests’ day, covered</span>
                <span className="flex flex-wrap gap-[18px] text-[13px] font-semibold text-ink-copy">
                  <span className="flex items-center gap-1.5">
                    <span className="size-3.5 rounded bg-coral" />
                    Our team live, 8am–8pm
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3.5 rounded bg-[#CBD3D9]" />
                    Scheduled messages and guidebook
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-[3px]" aria-hidden="true">
                {HOURS.map((live, i) => (
                  <div key={i} className={cn("h-11 rounded-[5px]", live ? "bg-coral" : "bg-[#CBD3D9]")} />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs font-bold text-muted">
                <span>00:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>20:00</span>
                <span>24:00</span>
              </div>
              <p className="m-0 mt-4 text-sm leading-[1.55] text-ink-copy">
                Messages after 8pm are answered first thing the next working morning. Your guidebook gives guests 999 and
                the gas emergency line at any hour.
              </p>
            </div>
          </div>
        </section>

        {/* JOURNEY */}
        <section id="journey" className="sec">
          <div className="wrap grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] md:gap-12">
            <div>
              <Kicker>The guest journey</Kicker>
              <h2 className="h2">Every stage, handled</h2>
              <p className="lead mb-6">We run the whole conversation, so guests always know what’s next.</p>
              <p className="m-0 rounded-[14px] bg-sand px-5 py-[18px] text-[15px] leading-[1.6] text-ink-copy">
                Every message is written as you and signed off:{" "}
                <strong className="text-ink">“Warm regards, Reservations Team, [Your Company Name]”</strong>.
              </p>
            </div>
            <ol className="relative m-0 list-none p-0">
              <div className="absolute top-7 bottom-7 left-[21px] w-0.5 bg-[#F0D3D3] md:left-[27px]" aria-hidden="true" />
              {journey.map((j, i) => (
                <li
                  key={j.h}
                  className="relative grid grid-cols-[44px_minmax(0,1fr)] items-start gap-5 pb-7 md:grid-cols-[56px_minmax(0,1fr)_auto]"
                >
                  <span className="box-border flex size-11 items-center justify-center rounded-full border-2 border-coral bg-white text-lg font-extrabold md:size-14">
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="m-0 mb-1.5 text-[19px] font-extrabold">{j.h}</h3>
                    <p className="m-0 text-[15px] leading-[1.55] text-body">{j.t}</p>
                  </div>
                  <span className="col-start-2 mt-2 justify-self-start rounded-full bg-[#F5F6F7] px-3 py-[7px] text-[13px] font-bold whitespace-nowrap md:col-start-auto">
                    {j.when}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* STANDARDS */}
        <section id="standards" className="sec border-y border-line-4 bg-[#FAFAFB]">
          <div className="wrap">
            <SectionHead
              kicker="Our response standards"
              title="Exactly how fast, by type of message"
              lead="During our hours: 8am to 8pm UK time, Monday to Saturday."
            />
            <div className="grid gap-3.5">
              {speed.map((s) => (
                <div
                  key={s.h}
                  className="grid grid-cols-1 items-center gap-x-8 gap-y-4 rounded-[18px] border border-line bg-white px-7 py-6 md:grid-cols-2"
                >
                  <div>
                    <h3 className="m-0 mb-1.5 text-lg font-extrabold">{s.h}</h3>
                    <p className="m-0 text-sm leading-normal text-body">{s.ex}</p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <span className="text-xl font-extrabold">{s.time}</span>
                      <span className="text-right text-[13px] text-muted">{s.note}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-[5px] bg-fog-2">
                      <div className="h-2.5 rounded-[5px]" style={{ background: s.c, width: s.w }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RESEARCH */}
        <section id="research" className="sec">
          <div className="wrap">
            <SectionHead
              kicker="Behind a 10-minute reply"
              title="How we answer a question that needs research"
              lead="A guest asks: “What’s the nearest station, and how do we get there?”"
            />
            <ol className="m-0 mb-12 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 md:grid-cols-5">
              {steps.map((s, i) => (
                <li
                  key={s.h}
                  className={cn(
                    "rounded-[18px] p-[22px]",
                    s.tone === "dark" ? "bg-ink text-white" : s.tone === "soft" ? "bg-coral-50" : "bg-[#F5F6F7]",
                  )}
                >
                  <div className="mb-3.5 flex items-center gap-2.5">
                    <span className="text-[13px] font-extrabold opacity-80">STEP {i + 1}</span>
                    <span className="h-[1.5px] flex-1 bg-current opacity-25" />
                  </div>
                  <h3 className="m-0 mb-2 text-lg font-extrabold">{s.h}</h3>
                  <p className="m-0 text-sm leading-[1.55]">{s.t}</p>
                </li>
              ))}
            </ol>
            <div className="mx-auto max-w-[640px] rounded-3xl bg-sand p-7">
              <p className="m-0 mb-3.5 text-xs font-extrabold tracking-[1px] text-muted">THE REPLY THE GUEST GETS</p>
              <div className="rounded-[18px_18px_18px_6px] bg-white px-[22px] py-5 text-[15px] leading-[1.7]">
                <p className="m-0 mb-2.5">Hi Sarah,</p>
                <p className="m-0 mb-2.5">
                  Great question! The nearest station is [Station Name], about a [X]-minute walk. Turn left out of the
                  front door, then right onto [Street]. Here’s the route on Google Maps: [link]
                </p>
                <p className="m-0 mb-2.5">If you’d rather not walk, the number [X] bus stops just outside and takes about [X] minutes.</p>
                <p className="m-0 mb-2.5">Have a lovely evening!</p>
                <p className="m-0">
                  Warm regards,
                  <br />
                  Reservations Team, [Your Company Name]
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CHANNELS */}
        <section id="channels" className="bg-ink text-white">
          <div className="wrap sec grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
            <div>
              <h2 className="h2 text-white">Every channel, one consistent voice</h2>
              <p className="lead text-mist">
                One tone, one sign-off and one set of facts, so a guest booking direct gets the same experience as an
                Airbnb guest.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[18px] bg-night-4 sm:grid-cols-2">
              {channels.map((c) => (
                <div key={c.n} className="bg-ink p-[22px]">
                  <h3 className="m-0 mb-1.5 text-[17px] font-extrabold text-white">{c.n}</h3>
                  <p className="m-0 text-sm leading-normal text-mist">{c.t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TEMPLATES */}
        <section id="templates" className="bg-coral text-ink">
          <div className="wrap grid grid-cols-1 items-center gap-8 py-[72px] md:grid-cols-2 md:gap-12">
            <div>
              <p className="m-0 mb-3 text-[13px] font-extrabold tracking-[1.4px]">FREE DOWNLOAD</p>
              <h2 className="m-0 mb-3.5 text-[32px] leading-[1.1] font-extrabold tracking-[-1.4px] md:text-[40px]">
                The 10 messages our team uses, free
              </h2>
              <p className="m-0 text-[17px] leading-[1.6] font-medium">
                Booking confirmation, two pre-arrival messages, check-in (with address, Google Maps and what3words),
                first-morning check, check-out, review request, plus 3 bonus replies. Editable Word file.
              </p>
            </div>
            <div className="rounded-[20px] bg-white p-7">
              <MailtoForm
                ariaLabel="Download the message templates"
                subject="Send me the guest message templates"
                className="grid gap-3.5"
                fieldClassName="field rounded-[10px]"
                fields={[
                  { name: "name", label: "First name", type: "text" },
                  { name: "email", label: "Email", type: "email", required: true },
                ]}
                submitLabel="Send me the templates"
                submitClassName="btn btn-ink w-full"
              />
              <SmartLink
                href={related[0].href}
                className="mt-3.5 block text-center text-sm font-bold text-ink"
              >
                Or try the free guest message generator
              </SmartLink>
              {isToolLive(registerSlug) && (
                <SmartLink href={toolBySlug(registerSlug)!.href!} className="mt-1 block text-center text-sm font-bold text-ink">
                  Keep your guest register with the free builder
                </SmartLink>
              )}
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section id="proof" className="sec">
          <div className="wrap">
            <SectionHead
              kicker="Proof"
              title="Our response numbers, with screenshots"
              lead="Real client accounts, shared with permission, updated every quarter."
            />
            <ProofGrid items={proof} />
          </div>
        </section>

        {/* HARD MOMENTS */}
        <section id="hard-moments" className="sec bg-sand">
          <div className="wrap">
            <HardMoments />
          </div>
        </section>

        {/* GREAT MESSAGE */}
        <section id="great-message" className="sec">
          <div className="wrap">
            <SectionHead kicker="Free to use" title="What makes a great guest message" lead="The rules our team follows on every reply." />
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
              <div className="rounded-3xl bg-[#F5F6F7] p-6 md:p-8">
                <div className="rounded-[18px] bg-white p-6 text-base leading-[1.7]">
                  <p className="m-0 mb-2.5">
                    <Highlight n="1">Hi Tom,</Highlight>
                  </p>
                  <p className="m-0 mb-2.5">
                    <Highlight n="2">I hope the drive down went well!</Highlight>
                  </p>
                  <p className="m-0 mb-2.5">
                    <Highlight n="3">Yes, there’s free parking for one car</Highlight> in bay{" "}
                    <Highlight n="4">14, behind the building</Highlight>. Here’s a photo of the entrance: [link]
                  </p>
                  <p className="m-0">
                    <Highlight n="5">
                      Warm regards,
                      <br />
                      Reservations Team, [Your Company Name]
                    </Highlight>
                  </p>
                </div>
              </div>
              <ol className="m-0 grid list-none gap-1 p-0">
                {rules.map((r, i) => (
                  <li key={i} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 border-b border-line-4 py-3">
                    <span className="text-[15px] font-extrabold text-brand">{r.n}</span>
                    <span className="text-[15px] leading-[1.55] text-ink-copy">
                      <strong className="text-ink">{r.b}</strong> {r.t}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section id="comparison" className="sec border-t border-line-4 bg-[#FAFAFB]">
          <div className="wrap">
            <SectionHead title="Doing it yourself vs. a VA team vs. a management company" />
            <div className="overflow-x-auto rounded-[20px] border border-line bg-white">
              <table className="w-full min-w-[760px] border-collapse text-[15px] leading-normal">
                <thead>
                  <tr className="border-b border-line">
                    <th className="w-[22%] px-5 py-[18px]">
                      <span className="sr-only-label">Compare</span>
                    </th>
                    <th className="px-5 py-[18px] text-left text-sm text-muted">{compare.cols[0]}</th>
                    <th className="bg-ink px-5 py-[18px] text-left text-[15px] text-white">{compare.cols[1]}</th>
                    <th className="px-5 py-[18px] text-left text-sm text-muted">{compare.cols[2]}</th>
                  </tr>
                </thead>
                <tbody>
                  {compare.rows.map((r) => (
                    <tr key={r.k} className="border-b border-line last:border-b-0">
                      <th scope="row" className="px-5 py-[18px] text-left align-top font-extrabold">
                        {r.k}
                      </th>
                      <td className="px-5 py-[18px] align-top text-body">{r.diy}</td>
                      <td className="bg-[#FDF3F3] px-5 py-[18px] align-top font-bold">{r.va}</td>
                      <td className="px-5 py-[18px] align-top text-body">{r.mc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <PackageCta title={packageCta.title} text={packageCta.text} />

        {/* FAQ */}
        <section id="faq" className="sec">
          <div className="wrap">
            <SectionHead kicker="FAQ" title="Questions hosts ask about guest messaging" />
            <FaqGrid items={faq} />
          </div>
        </section>

        <RelatedLinks
          items={related}
          sources={
            <p className="m-0">
              <strong className="text-ink-copy">Sources:</strong> {sources} {reviewedBy("November 2026")}
            </p>
          }
        />
      </ServiceTocLayout>
    </>
  );
}

function Bubble({ side, time, children }: { side: "guest" | "team"; time: string; children: React.ReactNode }) {
  const team = side === "team";
  return (
    <div
      className={cn(
        "max-w-[78%] px-4 py-3 text-[15px] leading-normal",
        team ? "self-end rounded-[16px_16px_4px_16px] bg-ink text-white" : "self-start rounded-[16px_16px_16px_4px] bg-fog-2",
      )}
    >
      {children}
      <span className={cn("mt-1.5 block text-[11px]", team ? "text-[#AEB9C2]" : "text-muted")}>{time}</span>
    </div>
  );
}

function Stat({
  big,
  className,
  textCls,
  children,
}: {
  big: string;
  className?: string;
  textCls?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-[22px] p-7", className)}>
      <div className="text-[52px] leading-none font-extrabold tracking-[-2px]">{big}</div>
      <p className={cn("m-0 mt-3 text-[15px] leading-normal", textCls ?? "text-ink-copy")}>{children}</p>
    </div>
  );
}
