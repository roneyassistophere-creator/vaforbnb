import Link from 'next/link'
import {
  BarChart2,
  Globe,
  LayoutGrid,
  MessageSquare,
  PenLine,
  Settings,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import { Reveal } from '@/components/motion/Reveal'
import { eyebrowOnDark } from '@/utilities/typography'

const services = [
  {
    number: '01',
    slug: 'guest-communication-vetting',
    icon: MessageSquare,
    title: 'Guest Comms & Vetting',
    desc: '24/7 guest messaging, identity screening, check-in guides, and dispute handling in minutes.',
    tags: ['24/7 Inbox', 'Guest Vetting', 'Check-In Guides'],
    span: 'md:col-span-2',
    accent: false,
  },
  {
    number: '02',
    slug: 'cleaning-turnover',
    icon: Sparkles,
    title: 'Cleaning & Turnover',
    desc: 'Automated cleaner dispatch, linen management, and photo inspection verification.',
    tags: ['Cleaner Dispatch', 'Linen Tracking', 'Inspections'],
    span: 'md:col-span-1',
    accent: false,
  },
  {
    number: '03',
    slug: 'listing-creation-seo',
    icon: PenLine,
    title: 'Listing SEO & Media',
    desc: 'High-converting listing copy, keyword optimisation, and professional photography direction.',
    tags: ['Copywriting', 'Airbnb SEO', 'Visuals'],
    span: 'md:col-span-1',
    accent: true,
  },
  {
    number: '04',
    slug: 'direct-booking-engine',
    icon: Globe,
    title: 'Direct Booking Engine',
    desc: 'Your own branded booking website with instant card payments and zero platform commissions.',
    tags: ['Custom Website', 'Stripe Payments', 'Zero Commission'],
    span: 'md:col-span-2',
    accent: true,
  },
  {
    number: '05',
    slug: 'dynamic-pricing',
    icon: TrendingUp,
    title: 'Dynamic Pricing',
    desc: 'Data-driven revenue management adjusting for local seasonality, demand spikes, and events.',
    tags: ['PriceLabs', 'RevPAR', 'Event Surge'],
    span: 'md:col-span-1',
    accent: false,
  },
  {
    number: '06',
    slug: 'multi-platform-sync',
    icon: LayoutGrid,
    title: 'Multi-Platform Sync',
    desc: 'Simultaneous distribution across Airbnb, Booking.com, VRBO, and Google Vacation Rentals.',
    tags: ['Hostaway', 'Guesty', 'Calendar Sync'],
    span: 'md:col-span-1',
    accent: false,
  },
  {
    number: '07',
    slug: 'systems-building-automation',
    icon: Settings,
    title: 'Systems & Automation',
    desc: 'End-to-end SOPs, smart lock code generation, automated cleaner notifications, and guest message sequencing.',
    tags: ['SOPs', 'Smart Locks', 'Message Sequencing', 'PMS Automation'],
    span: 'md:col-span-3',
    accent: false,
  },
  {
    number: '08',
    slug: 'finance-performance',
    icon: BarChart2,
    title: 'Finance & Reporting',
    desc: 'Transparent monthly P&L statements, occupancy tracking, and actionable revenue recommendations.',
    tags: ['Monthly P&L', 'Occupancy Analytics', 'Tax-Ready'],
    span: 'md:col-span-1',
    accent: true,
  },
]

export function ServicesBento() {
  return (
    <section id="services" className="relative bg-background pt-10 pb-20 sm:pt-12 sm:pb-24 md:pt-14 md:pb-28">
      <div id="solutions" className="pointer-events-none absolute -top-12" />
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <Reveal delay={0.1}>
          <p className={`mb-3 ${eyebrowOnDark}`}>Our Capabilities</p>
          <h2 className="mb-10 sm:mb-12 md:mb-14 font-extrabold text-3xl leading-[1.1] tracking-tight text-primary sm:text-4xl lg:text-5xl">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
        </Reveal>

        <div className="grid auto-rows-[minmax(280px,auto)] grid-cols-1 gap-4 md:grid-cols-4">
          {services.map(({ number, slug, icon: Icon, title, desc, tags, span, accent }, i) => (
            <Reveal key={number} delay={i * 0.05} className={span}>
              <Link
                href={`/services/${slug}`}
                data-cursor="hover"
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-sm border p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md ${
                  accent
                    ? 'border-primary/40 bg-primary/12 hover:border-primary/70 hover:bg-primary/20'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-secondary'
                }`}
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10 mb-8">
                  <div className="mb-8 flex w-full items-start justify-between">
                    <span className="font-mono text-sm font-bold text-primary">{number}</span>
                    <Icon
                      className={`transition-all duration-300 group-hover:scale-110 group-hover:text-primary ${
                        accent ? 'text-primary' : 'text-foreground/60'
                      }`}
                      size={28}
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3
                    className={`mb-3 font-display font-semibold text-foreground ${
                      span === 'md:col-span-2' || span === 'md:col-span-3' ? 'text-3xl lg:text-4xl' : 'mt-4 text-2xl'
                    }`}
                  >
                    {title}
                  </h3>
                  <p className="max-w-sm text-base leading-relaxed text-foreground/70">{desc}</p>
                </div>

                <div className="relative z-10 mt-auto flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full border px-3 py-1.5 font-mono text-[10px] md:text-xs ${
                        accent
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : 'border-border bg-foreground/5 text-foreground/70'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="absolute right-8 bottom-8 flex translate-x-4 items-center gap-2 font-mono text-sm text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  <span className="hidden sm:inline">Explore Service</span> &rarr;
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
