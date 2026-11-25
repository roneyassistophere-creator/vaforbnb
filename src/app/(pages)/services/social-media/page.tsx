import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { anchors } from "@/config/navigation";
import { prices, showPrice } from "@/config/pricing";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import { reviewedBy } from "@/components/service/ServiceBlocks";
import { FaqBoxes, FitPicker, Funnel, Phone, Pillars, PlatformPicker, RulesQuiz, SampleMonth } from "./_components/Interactive";
import {
  highlights,
  honest,
  profileGrid,
  proof,
  related,
  sidebarCta,
  sidebarToc,
  stories,
  weDo,
  why,
  youDo,
} from "./content";
import { seo } from "./seo";
import { ServiceTocLayout } from "@/components/service/ServiceToc";

const W = "mx-auto box-border max-w-[1200px] px-4 md:px-7";
const sec = "py-16 md:py-[100px]";
const two = "grid grid-cols-1 items-center gap-9 md:grid-cols-2 md:gap-14";
const btn = "btn min-h-[52px] rounded-2xl border-2 border-ink px-[26px] font-extrabold shadow-[4px_4px_0_#14212B]";

function Sticker({ children, className, coral }: { children: ReactNode; className?: string; coral?: boolean }) {
  return (
    <span
      className={cn(
        "mb-[18px] inline-block -rotate-2 rounded-full px-3.5 py-[7px] text-[13px] font-extrabold",
        coral ? "bg-coral text-ink" : "bg-ink text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}

function H2({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("m-0 mb-4 font-bricolage text-[38px] leading-none font-extrabold tracking-[-2px] md:text-[54px]", className)}>{children}</h2>
  );
}

function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 max-w-[680px] text-lg leading-[1.65] text-body", className)}>{children}</p>;
}

export default function SocialMediaPage() {
  return (
    <>
      {/* HERO */}
      <section className="overflow-hidden bg-coral-50">
        <div className={cn(W, two, "pt-[72px] pb-10")}>
          <div>
            <Breadcrumbs seo={seo} separator="›" className="mb-[18px] text-body" />
            <Sticker coral className="border-2 border-ink">For hosts building a brand</Sticker>
            <h1 className="m-0 mb-[22px] font-bricolage text-[52px] leading-[0.95] font-extrabold tracking-[-3px] md:text-[76px]">
              From a listing to a{" "}
              <span className="inline-block -rotate-[1.5deg] rounded-2xl bg-ink px-3.5 text-white">brand</span> guests
              remember.
            </h1>
            <p className="m-0 mb-[30px] max-w-[560px] text-lg leading-[1.7] text-ink-prose">
              Social media helps guests discover you outside the OTAs, trust you before they book, and come back to book{" "}
              <strong>direct</strong>. You share the moments. We plan, write, post, and reply to messages, {brand.hours.label}.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <a href="#price" className={cn(btn, "bg-coral text-ink hover:bg-coral-hover hover:text-ink")}>
                Book a 20-minute call
              </a>
              <a href="#month" className={cn(btn, "bg-white text-ink hover:bg-sand hover:text-ink")}>
                See a sample content plan
              </a>
            </div>
          </div>
          <div className="relative flex min-h-[640px] justify-center">
            <div className="absolute top-[70px] left-0 hidden -rotate-6 rounded-[18px] border-2 border-ink bg-white px-3.5 py-3 text-[13px] font-extrabold shadow-[4px_4px_0_#14212B] lg:block">
              +1 new property in [area]
            </div>
            <div className="absolute top-[300px] right-0 hidden max-w-[190px] rotate-[5deg] rounded-[18px] bg-ink px-3.5 py-3 text-[13px] leading-[1.4] font-extrabold text-white lg:block">
              “Is the 2-bed free in March for 3 weeks? It’s for my team.”
            </div>
            <Phone>
              <div className="flex items-center gap-3 px-4 pt-[18px] pb-2.5" aria-hidden="true">
                <div className="flex size-[62px] items-center justify-center rounded-full border-[3px] border-white bg-coral font-extrabold text-ink shadow-[0_0_0_2px_#F0595A]">
                  [B]
                </div>
                <div className="grid flex-1 grid-cols-3 text-center text-[11px] text-body">
                  {["posts", "followers", "following"].map((l) => (
                    <span key={l}>
                      <strong className="block text-[15px] text-ink">[X]</strong>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-4 pb-2.5">
                <p className="m-0 text-[13px] font-extrabold">[Your Brand] Stays</p>
                <p className="m-0 mt-0.5 text-xs leading-[1.45] text-body">
                  Serviced apartments in [City] · Long stays &amp; contractors welcome
                  <br />
                  <span className="font-bold text-[#1A3D8F]">yourbrand.co.uk/book</span>
                </p>
              </div>
              <div className="flex gap-2.5 px-4 pt-1 pb-3" aria-hidden="true">
                {highlights.map((h) => (
                  <div key={h.t} className="text-center text-[10px] font-bold">
                    <div className="mb-1 size-[50px] rounded-full border-2 border-line-6" style={{ background: h.c }} />
                    {h.t}
                  </div>
                ))}
              </div>
              <div className="grid flex-1 grid-cols-3 gap-0.5" aria-hidden="true">
                {profileGrid.map((g) => (
                  <div key={g.t} className="flex items-end p-1.5 text-[9px] font-extrabold" style={{ background: g.c, color: g.f }}>
                    {g.t}
                  </div>
                ))}
              </div>
            </Phone>
          </div>
        </div>
        <div className={cn(W, "pb-12")}>
          <nav aria-label="On this page" className="flex gap-[18px] overflow-x-auto px-1 py-2">
            {stories.map((s) => (
              <a key={s.h} href={s.h} className="flex-none text-center text-[13px] font-extrabold text-ink no-underline hover:text-ink">
                <span className="mx-auto mb-1.5 box-border flex size-[72px] rounded-full bg-coral p-[3px]">
                  <span className="flex flex-1 items-center justify-center rounded-full border-[3px] border-coral-50 bg-white font-bricolage text-[22px]">
                    {s.n}
                  </span>
                </span>
                {s.t}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <ServiceTocLayout items={sidebarToc} cta={sidebarCta}>
        {/* FIT */}
        <section className={sec} id="fit">
          <div className={W}>
            <Sticker>Honest fit</Sticker>
            <H2>Is social media right for you?</H2>
            <Lead>It works best for hosts who want to build a business, not just fill a calendar. Pick the one that sounds like you.</Lead>
            <FitPicker />
            <p className="m-0 mt-[18px] text-[15px] leading-[1.6] text-body">
              <strong className="text-ink">The key:</strong> social media needs somewhere to send people. No direct booking
              website yet? <SmartLink href={anchors.service("website")}>Start there</SmartLink>, or we’ll send enquiries to
              your inbox while you build one.
            </p>
          </div>
        </section>

        {/* WHY */}
        <section className={cn(sec, "bg-ink text-white")} id="why">
          <div className={W}>
            <Sticker coral>Why it matters</Sticker>
            <H2 className="max-w-[760px] text-white">On an OTA you’re one of thousands. On your profile, it’s all you.</H2>
            <div className="mt-11 grid grid-cols-1 gap-4 md:grid-cols-3">
              {why.map((y) => (
                <div key={y.h} className="rounded-3xl p-[26px]" style={{ background: y.bg, color: y.fg, transform: `rotate(${y.r})` }}>
                  <p className="m-0 mb-2.5 font-bricolage text-2xl leading-[1.15] font-extrabold">{y.h}</p>
                  <p className="m-0 text-[15px] leading-[1.55] opacity-90">{y.t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FUNNEL */}
        <section className={sec} id="funnel">
          <div className={W}>
            <Funnel
              heading={
                <>
                  <Sticker>Follower → booking</Sticker>
                  <H2>
                    It’s not about likes. It’s about <span className="text-brand">enquiries.</span>
                  </H2>
                  <Lead>
                    Tap through the six steps. Most agencies stop at posting. As an operations team, we also reply to
                    messages and turn enquiries into bookings.
                  </Lead>
                </>
              }
            />
          </div>
        </section>

        {/* PILLARS */}
        <section className={cn(sec, "bg-sand")} id="pillars">
          <div className={W}>
            <Sticker>What we post</Sticker>
            <H2>Five content pillars</H2>
            <Lead>A steady mix keeps your profile useful, real and growing.</Lead>
            <Pillars />
          </div>
        </section>

        {/* SAMPLE MONTH */}
        <section className={sec} id="month">
          <div className={W}>
            <Sticker>Sample month</Sticker>
            <H2>12 posts, one plan.</H2>
            <Lead>An example only. Your plan is built around your properties, area and guests. Filter by pillar.</Lead>
            <SampleMonth />
          </div>
        </section>

        {/* PLATFORMS */}
        <section className={cn(sec, "bg-coral-50")} id="platforms">
          <div className={W}>
            <Sticker>Platforms</Sticker>
            <H2>Who do you want to reach?</H2>
            <Lead>We don’t need you everywhere. We start with the two or three platforms that match your guests, and do them well.</Lead>
            <PlatformPicker />
          </div>
        </section>

        {/* WE DO / YOU DO */}
        <section className={sec} id="split">
          <div className={W}>
            <div className="mx-auto mb-11 max-w-[760px] text-center">
              <Sticker>The split</Sticker>
              <H2>You share the moments. We do the rest.</H2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-3xl border-2 border-ink bg-sand p-[26px] shadow-[6px_6px_0_#14212B]">
                <p className="m-0 mb-[18px] font-bricolage text-2xl font-extrabold">You (or your cleaners)</p>
                <div className="grid gap-2.5">
                  {youDo.map((y) => (
                    <div key={y} className="max-w-[90%] self-start rounded-[18px_18px_18px_4px] border-2 border-ink bg-white px-4 py-3 text-[15px] leading-[1.45]">
                      {y}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border-2 border-ink bg-ink p-[26px] text-white shadow-[6px_6px_0_#14212B]">
                <p className="m-0 mb-[18px] font-bricolage text-2xl font-extrabold">{brand.name}</p>
                <div className="grid justify-items-end gap-2.5">
                  {weDo.map((y) => (
                    <div key={y} className="max-w-[90%] rounded-[18px_18px_4px_18px] bg-coral px-4 py-3 text-[15px] leading-[1.45] font-semibold text-ink">
                      {y}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-[22px] rounded-[22px] border-2 border-dashed border-coral bg-coral-50 px-[26px] py-[22px] text-base leading-[1.6]">
              <strong>Easy content tip:</strong> ask your cleaner for a 15-second clip of the finished room at every turnover.
              One clip a week is enough for a steady stream of “ready for you” posts.
            </div>
          </div>
        </section>

        {/* RULES */}
        <section className={cn(sec, "bg-sand")} id="rules">
          <div className={W}>
            <Sticker>Safe, legal, honest</Sticker>
            <H2>Post it, or don’t?</H2>
            <Lead>Tap each card to see our rule. We check every post against these before it goes out.</Lead>
            <RulesQuiz />
            <p className="m-0 mt-4 text-[13px] leading-normal text-muted">
              Sources: CMA price transparency guidance (DMCC Act 2024) · ASA and CMA influencer guidance · ICO UK GDPR
              guidance · Airbnb off-platform policy (2799).
            </p>
          </div>
        </section>

        {/* EXPECTATIONS */}
        <section id="expectations" className={sec}>
          <div className={cn(W, two)}>
            <div>
              <Sticker>Honest expectations</Sticker>
              <H2>We measure enquiries, not likes.</H2>
              <Lead>Tracked links show how many visits and enquiries came from social. That’s the number in your monthly report.</Lead>
            </div>
            <div className="grid gap-3">
              {honest.map((h, i) => (
                <div key={h.b} className="flex items-start gap-4 rounded-3xl border-2 border-ink bg-white px-[22px] py-[18px] shadow-[4px_4px_0_#14212B]">
                  <span className="font-bricolage text-[26px] leading-none font-extrabold text-coral">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <strong className="text-base">{h.b}</strong> <span className="text-[15px] text-body">{h.t}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROOF + PRICE */}
        <section className={cn(sec, "bg-ink text-white")} id="price">
          <div className={cn(W, two, "items-start")}>
            <div>
              <Sticker coral>Real results</Sticker>
              <H2 className="text-white">Proof, with permission.</H2>
              <Lead className="text-mist">Real client profiles, link clicks and direct enquiries from social. Real data only.</Lead>
              <div className="mt-7 grid gap-3">
                {proof.map((p) => (
                  <div key={p.c} className="rounded-[20px] bg-night-field px-[22px] py-5">
                    <p className="m-0 mb-1 text-base font-extrabold">{p.c}</p>
                    <p className="m-0 mb-3 text-[13px] text-faint">{p.pl}</p>
                    <div className="flex flex-wrap gap-[22px] text-sm">
                      <span>
                        <span className="text-faint">Before</span> <strong>{p.b}</strong>
                      </span>
                      <span>
                        <span className="text-[#8FD3AE]">After</span> <strong>{p.a}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border-2 border-white bg-coral p-7 text-ink shadow-[8px_8px_0_#FFFFFF] md:p-9">
              <p className="m-0 mb-2 text-xs font-extrabold tracking-[1px]">PART OF THE GROW PACKAGE</p>
              <p className="m-0 mb-1 font-bricolage text-[22px] font-extrabold">Social media for short lets</p>
              <p className="m-0 mb-3.5 font-bricolage text-[58px] font-extrabold tracking-[-2px]">
                {showPrice(prices.socialMonthly)}
                <span className="text-lg tracking-normal">/month</span>
              </p>
              <p className="m-0 mb-[22px] text-[15px] leading-[1.6]">
                [X] platforms and [X] posts a month, including replies to comments and DMs, {brand.hours.short}. Alongside
                direct booking websites and SEO.
              </p>
              <div className="grid gap-3">
                <SmartLink href={brand.links.bookCall} className={cn(btn, "bg-white text-ink hover:bg-sand hover:text-ink")}>
                  Book a 20-minute call
                </SmartLink>
                <a href="#month" className={cn(btn, "bg-ink text-white hover:bg-ink-hover hover:text-white")}>
                  See a sample content plan
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={sec} id="faq">
          <div className={cn(W, "max-w-[900px]")}>
            <Sticker>FAQ</Sticker>
            <H2>Questions hosts ask</H2>
            <FaqBoxes />
            <div className="mt-9 flex flex-wrap gap-2">
              <span className="mr-1.5 self-center text-[13px] font-extrabold text-body">Related:</span>
              {related.map((r) => (
                <SmartLink
                  key={r.label}
                  href={r.href}
                  className="rounded-full border-2 border-ink px-4 py-2 text-sm font-extrabold text-ink no-underline hover:bg-ink hover:text-white"
                >
                  {r.label}
                </SmartLink>
              ))}
            </div>
            <p className="m-0 mt-7 text-[13px] leading-[1.7] text-muted">
              {reviewedBy("November 2026")} Not affiliated with Meta, TikTok, LinkedIn, YouTube, Airbnb or any platform named
              on this page.
            </p>
          </div>
        </section>
      </ServiceTocLayout>
    </>
  );
}
