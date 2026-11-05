'use client'

import { SmartLink } from '@/components/SmartLink'
import { Reveal } from '@/components/motion/Reveal'

const chapters = [
  {
    num: '01',
    title: 'We started as property hosts ourselves.',
    p1: 'Late night lockouts, last-minute cancellations, and cleaners calling in sick 30 minutes before check-in. We lived the hosting chaos first-hand.',
    p2: "We loved property, but running an STR business shouldn't mean being handcuffed to your phone 24 hours a day, 7 days a week.",
  },
  {
    num: '02',
    title: 'Great properties. Endless operational headaches.',
    p1: 'More units meant more complexity: guest inquiries getting missed while at work, pricing sitting on autopilot, and OTA platforms pocketing huge commissions.',
    p2: 'That friction is the exact reason Assist BNB exists in its current form.',
  },
  {
    num: '03',
    title: 'So we built the ultimate STR operations engine.',
    p1: 'A structured backend team: 24/7 guest communications answered in minutes, cleaner dispatch, dynamic pricing, and commission-free direct booking engines.',
    p2: 'You own the asset and keep the profits. We run the day-to-day operations that keep your listings booked and reviews at 5 stars.',
    cta: { label: 'Explore our services', href: '/#services' },
  },
]

function Art01() {
  return (
    <div className="pointer-events-none relative flex aspect-square w-full items-center justify-center md:aspect-4/3">
      <div className="absolute h-56 w-56 animate-pulse-slow rounded-full bg-brand-coral-bright opacity-40 mix-blend-difference blur-2xl md:h-64 md:w-64" />
      <div className="absolute h-32 w-32 rotate-45 transform rounded-tr-full rounded-bl-full bg-brand-coral-deep mix-blend-overlay md:h-40 md:w-40" />
      <div className="clip-diagonal absolute h-40 w-40 rounded-sm bg-ink-600 md:h-48 md:w-48" />
      <div className="bg-grid absolute inset-0 border border-border bg-size-[40px_40px]" />
    </div>
  )
}

function Art02() {
  return (
    <div className="group pointer-events-none relative flex aspect-square w-full items-center justify-center md:aspect-4/3">
      <div className="mx-4 h-3/4 w-1 bg-foreground/20" />
      <div className="mx-4 h-1/2 w-16 bg-brand-coral-bright/80 transition-transform group-hover:scale-y-110" />
      <div className="mx-4 h-2/3 w-1 bg-foreground/20" />
      <div className="mx-4 h-1/4 w-1 bg-foreground/10" />
      <div className="absolute top-1/4 right-1/4 mx-4 h-8 w-8 animate-bounce rounded-full bg-brand-coral-deep" />
    </div>
  )
}

function Art03() {
  return (
    <div className="pointer-events-none relative flex aspect-square w-full items-center justify-center md:aspect-4/3">
      <div className="absolute h-56 w-56 animate-pulse-slow rounded-full bg-brand-coral-bright opacity-30 mix-blend-difference blur-2xl md:h-64 md:w-64" />
      <div className="relative flex h-36 w-52 items-end gap-3 md:h-44 md:w-64">
        <div className="h-1/3 w-full rounded-t-sm bg-foreground/15" />
        <div className="h-1/2 w-full rounded-t-sm bg-foreground/25" />
        <div className="h-3/4 w-full rounded-t-sm bg-brand-coral-deep" />
        <div className="h-full w-full rounded-t-sm bg-brand-coral-bright" />
      </div>
      <div className="absolute top-1/5 right-1/4 h-3 w-3 animate-bounce rounded-full bg-brand-coral-bright" />
      <div className="bg-grid absolute inset-0 border border-border bg-size-[40px_40px]" />
    </div>
  )
}

function ChapterCard({ chapter, index }: { chapter: (typeof chapters)[number]; index: number }) {
  const isReversed = index === 1

  return (
    <div className="relative mb-24 last:mb-0 md:mb-48">
      <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-20">
        <Reveal
          x={isReversed ? 40 : -40}
          className={`relative z-10 ${isReversed ? 'md:order-2' : 'md:order-1'}`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -left-6 font-display text-[11rem] leading-none font-bold text-foreground/5 select-none md:-top-20 md:-left-12 md:text-[16rem]"
          >
            {chapter.num}
          </div>

          <div className="relative z-10 pt-14 md:pt-16">
            <h3 className="relative mb-8 max-w-2xl font-display text-4xl leading-tight font-medium tracking-tight md:text-5xl lg:text-6xl">
              {chapter.title}
            </h3>

            <div className="flex max-w-2xl flex-col gap-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>{chapter.p1}</p>
              <p>{chapter.p2}</p>
            </div>

            {chapter.cta && (
              <div className="mt-8">
                <SmartLink
                  href={chapter.cta.href}
                  data-cursor="hover"
                  className="group inline-flex items-center gap-2 border-b border-primary pb-1 font-mono text-sm text-foreground transition-colors hover:text-primary"
                >
                  {chapter.cta.label}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </SmartLink>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal
          x={isReversed ? -40 : 40}
          delay={0.1}
          className={`relative ${isReversed ? 'md:order-1' : 'md:order-2'}`}
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-12 shadow-sm">
            {index === 0 && <Art01 />}
            {index === 1 && <Art02 />}
            {index === 2 && <Art03 />}
          </div>
        </Reveal>
      </div>
    </div>
  )
}

export function StorySection() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-muted/40 py-24 sm:py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-20 max-w-3xl md:mb-28">
          <Reveal>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">Our Story</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              We know the struggle, <br />
              <span className="text-muted-foreground">because we lived it first-hand.</span>
            </h2>
          </Reveal>
        </div>

        <div>
          {chapters.map((chapter, index) => (
            <ChapterCard key={chapter.num} chapter={chapter} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
