import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { FloatingOrb } from '@/components/motion/FloatingOrb'
import { Magnetic } from '@/components/motion/Magnetic'
import { Reveal } from '@/components/motion/Reveal'
import { TiltCard } from '@/components/motion/TiltCard'
import { eyebrow, heading, lede } from '@/utilities/typography'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'

export const dynamic = 'force-static'
export const revalidate = 3600

const title = `Careers | ${siteConfig.name}`
const description = `Join the ${siteConfig.name} team. We are always looking for passionate people who care about modern hospitality and operational excellence.`
const url = `${siteConfig.url}/careers`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: 'website' },
}

const whyJoin = [
  { title: 'Remote-first', body: 'Work from wherever you are productive. We value accountability and clear communication over physical presence.' },
  { title: 'High-Impact Work', body: 'Your support directly impacts real travelers, real property owners, and real businesses every single day.' },
  { title: 'Growth & Training', body: 'We provide thorough training in the leading hospitality tech stacks (Hostaway, Guesty, PriceLabs, Minut).' },
  { title: 'Competitive Remuneration', body: 'Salaries benchmarked against market rates plus performance and review bonuses.' },
  { title: 'Collaborative Culture', body: 'A supportive team of operators who help each other troubleshoot problems and share knowledge.' },
  { title: 'Flexible Shifts', body: 'Structured coverage windows that allow for predictable work-life balance and schedule flexibility.' },
]

const openRoles = [
  {
    title: 'Guest Experience Specialist',
    type: 'Full-time / Part-time · Remote',
    description:
      'Manage guest inquiries, check-in instructions, and rapid issue resolution across high-end UK listings. Fluent written English and empathy required.',
  },
  {
    title: 'Turnover & Logistics Coordinator',
    type: 'Full-time · Remote',
    description:
      'Liaise with local cleaning teams, review photo inspection checklists, schedule linen deliveries, and coordinate emergency maintenance contractors.',
  },
  {
    title: 'Revenue & Listing Strategist',
    type: 'Full-time · Remote',
    description:
      'Analyze local booking demand, calibrate dynamic pricing software, optimize listing SEO on Airbnb and Booking.com, and advise hosts on revenue maximization.',
  },
]

export default function CareersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: title,
              description,
              url,
              type: 'WebPage',
            }),
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Careers', href: '/careers' },
            ]),
          ]),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-28 pb-20 text-center sm:pt-36 sm:pb-28">
        <FloatingOrb
          duration={18}
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-coral-soft blur-3xl sm:h-96 sm:w-96"
        />
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <p className={`mb-6 ${eyebrow}`}>Work With Us</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Build the future of <span className="text-primary">short-term rentals.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className={lede}>
              Join an ambitious team redefining hospitality operations. We are looking for operators,
              communicators, and problem-solvers who care about the guest experience.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Why join */}
      <section className="border-t border-border bg-muted py-24 sm:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Reveal>
              <p className={`mb-4 ${eyebrow}`}>Culture &amp; Benefits</p>
              <h2 className={heading}>Why build your career at Assist BNB.</h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyJoin.map(({ title, body }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <TiltCard className="h-full rounded-xl border border-border bg-card p-8">
                  <h3 className="mb-3 font-display text-xl font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <Reveal>
              <p className={`mb-4 ${eyebrow}`}>Current Opportunities</p>
              <h2 className={heading}>Open Positions</h2>
            </Reveal>
          </div>

          <div className="flex flex-col gap-6">
            {openRoles.map(({ title, type, description }, i) => (
              <Reveal key={title} delay={i * 0.1}>
                <div className="group rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary/40">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="font-display text-2xl font-semibold">{title}</h3>
                      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-primary">
                        {type}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                    <Magnetic>
                      <Link
                        href={`/contact?role=${encodeURIComponent(title)}`}
                        className="inline-block shrink-0 rounded-full border border-border bg-secondary px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        Apply Now &rarr;
                      </Link>
                    </Magnetic>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
