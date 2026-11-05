import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { CheckCircle2, Clock, HeartHandshake, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/Reveal'
import { TiltCard } from '@/components/motion/TiltCard'
import { Magnetic } from '@/components/motion/Magnetic'
import { FloatingOrb } from '@/components/motion/FloatingOrb'
import { StorySection } from '@/components/sections/StorySection'
import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import { eyebrow, heading, lede } from '@/utilities/typography'
import siteConfig from '@/config/site'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('about').catch(() => null)
  return generatePageMeta({ slug: 'about', seoDoc, fallbackTitle: 'About Us' })
}

const values = [
  {
    icon: CheckCircle2,
    title: 'Flawless Reliability',
    body: 'Guests never wait outside. Cleaners never miss a turnover. Every detail verified before check-in.',
  },
  {
    icon: HeartHandshake,
    title: 'Hospitality Heart',
    body: 'Courteous, rapid, 24/7 guest care that turns first-time visitors into repeat direct bookers.',
  },
  {
    icon: ShieldCheck,
    title: 'Total Transparency',
    body: 'Flat monthly fees, £0 commission, real-time calendar access, and straightforward reporting.',
  },
  {
    icon: Clock,
    title: 'Owner Freedom',
    body: 'You make the strategic portfolio choices. We take the midnight lockbox calls off your shoulders.',
  },
  {
    icon: TrendingUp,
    title: 'Data-Driven Revenue',
    body: 'Dynamic rate algorithms that surge on local events and defend occupancy in slower seasons.',
  },
  {
    icon: Sparkles,
    title: 'Continuous Craft',
    body: 'Constant testing of listing copy, photo sequences, and direct booking conversion loops.',
  },
]

export default async function AboutPage() {
  const seoDoc = await getPageSEO('about').catch(() => null)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? `About Us`,
              description:
                seoDoc?.meta?.description ??
                `Learn more about ${siteConfig.name} — who we are, our hosting philosophy, and how we help STR operators scale.`,
              url: `${siteConfig.url}/about`,
              type: 'AboutPage',
            }),
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'About', href: '/about' },
            ]),
          ]),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-28 pb-24 text-center sm:pt-36 sm:pb-32">
        <FloatingOrb
          duration={18}
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-coral-soft blur-3xl sm:h-96 sm:w-96"
        />

        <div className="mx-auto max-w-2xl">
          <Reveal>
            <p className={`mb-6 ${eyebrow}`}>Who We Are</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              A team dedicated to <span className="text-primary">your peace of mind.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className={lede}>
              We are short-term rental operators and operations specialists based in the UK. We handle
              guest communications, cleaners, and direct booking tech so you can scale your portfolio
              without the midnight burnout.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 01, 02, 03 Our Story */}
      <StorySection />

      {/* Values */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Reveal>
              <p className={`mb-4 ${eyebrow}`}>Our Standards</p>
              <h2 className={heading}>What guides our operations.</h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <TiltCard className="h-full rounded-xl border border-border bg-card p-8">
                  <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={24} />
                  </span>
                  <h3 className="mb-3 font-display text-xl font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-muted py-24 text-center">
        <div className="container mx-auto max-w-2xl">
          <Reveal>
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to free your weekends?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Schedule a 15-minute discovery call to discuss your properties, current pain points, and
              how we can take operations off your hands.
            </p>
            <Magnetic>
              <Button asChild size="lg" data-cursor="hover" className="rounded-full px-8 py-6 text-base">
                <Link href="/contact">Book a Discovery Call</Link>
              </Button>
            </Magnetic>
          </Reveal>
        </div>
      </section>
    </>
  )
}
