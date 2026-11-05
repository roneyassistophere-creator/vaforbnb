import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Reveal } from '@/components/motion/Reveal'
import { eyebrowOnDark, headingOnDark } from '@/utilities/typography'
import { jsonLdScript, servicePageSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'

const services = [
  {
    slug: 'guest-communication-vetting',
    number: '01',
    title: 'Guest Communication & Vetting',
    description: '24/7 guest messaging, identity screening, and five-star hospitality support.',
    intro:
      'Fast, thoughtful communication makes the difference between a 4-star review and a 5-star Superhost rating. Our dedicated operations team handles all guest messages in minutes, pre-screens guests to prevent unauthorized parties, and manages check-in guidance around the clock.',
    deliverables: [
      '24/7 inbox management across all booking channels',
      'Guest identity verification & risk screening',
      'Automated check-in & check-out instructions',
      'Dispute handling & resolution center mediation',
    ],
    outcome: 'Peace of mind, sub-15-minute response metrics, and protected property condition.',
  },
  {
    slug: 'cleaning-turnover',
    number: '02',
    title: 'Cleaning & Turnover Coordination',
    description: 'Flawless turnovers with automated scheduling and photo inspection checklists.',
    intro:
      'Nothing derails a short-term rental faster than a cleaner no-show or a missed dirty towel. We synchronize your booking calendar directly with turnover workflows, dispatching cleaners automatically and requiring photo checklists before guest check-in.',
    deliverables: [
      'Automated cleaner scheduling synced to live checkouts',
      'Detailed photo-inspection verification checklists',
      'Linen, laundry, and toiletries replenishment alerts',
      'Rapid maintenance dispatch for broken fixtures',
    ],
    outcome: 'Spotless properties, zero missed turnovers, and glowing cleanliness ratings.',
  },
  {
    slug: 'listing-creation-seo',
    number: '03',
    title: 'Listing Creation & Optimisation',
    description: 'High-converting listing copy, visual staging advice, and algorithmic ranking.',
    intro:
      'Most listings underperform because their titles fail to hook searchers and their photos are ordered incorrectly. We rewrite your listing to appeal to both the platform search algorithm and discerning guests looking for an exceptional stay.',
    deliverables: [
      'SEO-optimized listing title and description',
      'Photo curation and strategic gallery ordering',
      'Amenity audit and feature highlighting',
      'Competitive neighborhood benchmarking',
    ],
    outcome: 'Higher search placement on Airbnb and Booking.com with increased booking conversion.',
  },
  {
    slug: 'direct-booking-engine',
    number: '04',
    title: 'Direct Booking Engine',
    description: 'Commission-free booking websites with integrated Stripe payment processing.',
    intro:
      'Stop surrendering 15% to 20% of your gross rental income to Airbnb and Booking.com. We build beautiful, lightning-fast direct booking websites that accept credit cards, collect security deposits, and sync with your central calendar in real time.',
    deliverables: [
      'Custom-branded Next.js booking website',
      'Stripe payments & automated security deposit holds',
      'Real-time two-way iCal / PMS calendar synchronisation',
      'Guest email capture and repeat-booking loyalty funnels',
    ],
    outcome: 'Direct repeat guests, zero platform commission fees, and full control over your brand.',
  },
  {
    slug: 'dynamic-pricing',
    number: '05',
    title: 'Dynamic Pricing & Revenue Management',
    description: 'Data-backed rates adjusting for seasonality, local demand spikes, and events.',
    intro:
      'Flat rates leave tens of thousands of pounds on the table every year. We implement intelligent dynamic pricing rules that capitalize on local stadium concerts, conferences, bank holidays, and school breaks while preserving high occupancy during mid-week troughs.',
    deliverables: [
      'PriceLabs / Wheelhouse integration & algorithm calibration',
      'Custom minimum stay and orphan night gap rules',
      'Local event tracking and surge pricing activation',
      'Continuous RevPAR and ADR performance monitoring',
    ],
    outcome: 'Significantly higher revenue per available night and maximized seasonal margins.',
  },
  {
    slug: 'multi-platform-sync',
    number: '06',
    title: 'Multi-Platform Distribution',
    description: 'Simultaneous visibility across Airbnb, Booking.com, VRBO, and Google Vacation Rentals.',
    intro:
      'Relying on a single platform creates dangerous business risk. We list your properties across all major travel channels while preventing double-bookings through centralized channel management.',
    deliverables: [
      'Channel manager setup and centralized calendar routing',
      'Syncing with Booking.com, VRBO, Expedia, and Google',
      'Unified message inbox across all platforms',
      'Cross-platform rate parity and cancellation policy rules',
    ],
    outcome: 'Broader guest reach, higher overall occupancy, and immunity to single-platform algorithm changes.',
  },
  {
    slug: 'systems-building-automation',
    number: '07',
    title: 'Systems Building & Automation',
    description: 'End-to-end SOPs, smart lock automations, and operational infrastructure.',
    intro:
      'A scalable property business is built on repeatable systems, not late-night firefighting. We build the operational SOPs, smart hardware integrations, and messaging automations that allow you to scale past 10 properties with zero chaos.',
    deliverables: [
      'Smart lock auto-code generation for every check-in',
      'Minut noise and occupancy monitoring integration',
      'Comprehensive digital house manual and guidebook creation',
      'Emergency contractor escalation workflows',
    ],
    outcome: 'A self-operating property business that runs reliably without depending on your constant presence.',
  },
  {
    slug: 'finance-performance',
    number: '08',
    title: 'Finance & Performance Reporting',
    description: 'Clear monthly P&L statements, occupancy tracking, and strategic scaling advice.',
    intro:
      'You cannot optimize what you do not measure. Every month we deliver crystal-clear financial and operational performance reports breaking down revenue by channel, average daily rate, cleaning costs, and ROI.',
    deliverables: [
      'Monthly revenue and expense statements by property',
      'Channel performance and direct booking ratio tracking',
      'Quarterly portfolio optimization and rate strategy reviews',
      'Tax-ready summaries and contractor payout records',
    ],
    outcome: 'Total financial transparency and data-backed guidance to expand your property portfolio.',
  },
] as const

type Service = (typeof services)[number]

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = services.find((item) => item.slug === slug)
  if (!service) return {}

  return {
    title: `${service.title} | ${siteConfig.name}`,
    description: service.description,
    alternates: { canonical: `${siteConfig.url}/services/${slug}` },
    openGraph: {
      title: `${service.title} | ${siteConfig.name}`,
      description: service.description,
      url: `${siteConfig.url}/services/${slug}`,
      type: 'website',
    },
  }
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params
  const service = services.find((item) => item.slug === slug)
  if (!service) notFound()

  const currentIndex = services.findIndex((item) => item.slug === slug)
  const nextService = services[(currentIndex + 1) % services.length]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            servicePageSchema({
              name: service.title,
              description: service.description,
              url: `${siteConfig.url}/services/${service.slug}`,
              providerName: siteConfig.name,
              siteUrl: siteConfig.url,
            }),
          ),
        }}
      />

      <article className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-slate-50/80 py-24 text-foreground sm:py-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-coral-bright/10 blur-[120px]"
          />
          <div className="mx-auto max-w-5xl px-6 md:px-12">
            <Reveal>
              <div className="mb-6 flex items-center gap-3">
                <span className="font-mono text-xs font-bold tracking-widest text-primary uppercase">
                  Service {service.number}
                </span>
                <span className="text-border">/</span>
                <Link
                  href="/#services"
                  className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  All Capabilities
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="mb-6 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                {service.title}
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {service.description}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Core content */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-6 md:px-12">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-3 lg:gap-20">
              {/* Main narrative */}
              <div className="lg:col-span-2">
                <Reveal>
                  <h2 className="mb-6 font-display text-2xl font-semibold sm:text-3xl">How It Works</h2>
                  <p className="mb-10 text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {service.intro}
                  </p>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="rounded-xl border border-border bg-card p-8">
                    <h3 className="mb-3 font-display text-xl font-semibold">The Outcome</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">{service.outcome}</p>
                  </div>
                </Reveal>

                <Reveal delay={0.2} className="mt-12">
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href="/contact"
                      className="rounded-full bg-primary px-8 py-4 font-display text-base font-medium text-primary-foreground transition-all hover:shadow-[0_0_30px_rgba(255,56,92,0.35)]"
                    >
                      Book an Operations Call
                    </Link>
                    <Link
                      href="/#services"
                      className="rounded-full border border-border px-8 py-4 font-display text-base font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                      View All Services
                    </Link>
                  </div>
                </Reveal>
              </div>

              {/* Deliverables sidebar */}
              <div>
                <Reveal delay={0.15}>
                  <div className="sticky top-28 rounded-xl border border-border bg-card p-6 sm:p-8">
                    <p className="mb-6 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                      What is Included
                    </p>
                    <ul className="flex flex-col gap-4">
                      {service.deliverables.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* Next service footer */}
        <section className="border-t border-border bg-muted py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center md:px-12">
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">Next Service</p>
              <h3 className="mt-1 font-display text-2xl font-semibold">{nextService.title}</h3>
            </div>
            <Link
              href={`/services/${nextService.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
            >
              Explore {nextService.number} &rarr;
            </Link>
          </div>
        </section>
      </article>
    </>
  )
}
