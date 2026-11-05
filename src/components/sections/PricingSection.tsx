'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Minus,
  Sparkles,
  Zap,
  Users,
  Building,
  ArrowRight,
  ShieldCheck,
  Clock,
  MessageSquare,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react'
import clsx from 'clsx'
import { Reveal } from '@/components/motion/Reveal'
import { Magnetic } from '@/components/motion/Magnetic'
import { ExpertModal } from '@/components/MultiStepExpertForm/ExpertModal'

// ─── 3 Packages Data ──────────────────────────────────────────────────────────

type Tier = {
  id: string
  name: string
  tagline: string
  price: string
  period: string
  badge?: string
  targetUnits: string
  description: string
  featured: boolean
  features: string[]
  btnText: string
}

const tiers: Tier[] = [
  {
    id: 'shared',
    name: 'Shared Team',
    tagline: 'Core operations for growing hosts',
    price: '£499',
    period: '/ month',
    badge: 'Starter Host',
    targetUnits: '1 – 3 Units',
    description:
      'A pooled team of UK-trained operations specialists managing round-the-clock guest messaging and turnover schedules.',
    featured: false,
    features: [
      '24/7 Guest messaging & reservation inquiries',
      'Sub-15 minute average response SLA',
      'Cleaner scheduling & turnover dispatch',
      'Calendar sync across Airbnb & Booking.com',
      'Automated check-in instructions & guest vetting',
    ],
    btnText: 'Choose Shared Team',
  },
  {
    id: 'dedicated-va',
    name: 'Dedicated VA',
    tagline: 'Your full-time, dedicated UK STR operator',
    price: '£999',
    period: '/ month',
    badge: '⭐ MOST POPULAR • HIGHEST ROI',
    targetUnits: '3 – 8 Units',
    description:
      'An elite short-term rental virtual assistant assigned exclusively to your business, immersed in your brand voice and SOPs.',
    featured: true,
    features: [
      '1 Dedicated full-time STR specialist (exclusive)',
      'Direct WhatsApp & Slack host channel',
      'Trained on your bespoke brand voice & SOPs',
      'Dynamic pricing optimization & competitor tracking',
      'Direct booking vetting & damage deposit handling',
    ],
    btnText: 'Hire Dedicated VA',
  },
  {
    id: 'dedicated-team',
    name: 'Dedicated Team',
    tagline: 'Multi-shift pod for rapid scaling',
    price: '£1,899',
    period: '/ month',
    badge: 'Scale Portfolio',
    targetUnits: '8 – 20+ Units',
    description:
      'A multi-shift operational pod with a dedicated team lead delivering continuous day, evening, and weekend coverage.',
    featured: false,
    features: [
      '2 Dedicated operators + 1 Senior Team Lead',
      'Seamless multi-shift 24/7/365 coverage',
      'Full multi-channel PMS distribution & smart locks',
      'Commission-free direct booking engine setup',
      'Bi-weekly strategic revenue & growth reviews',
    ],
    btnText: 'Scale Dedicated Team',
  },
]

// ─── Comparison Matrix Data ───────────────────────────────────────────────────

type FeatureRow = {
  name: string
  tooltip?: string
  shared: string | boolean
  dedicatedVa: string | boolean
  dedicatedTeam: string | boolean
  custom: string | boolean
}

type FeatureCategory = {
  category: string
  rows: FeatureRow[]
}

const comparisonData: FeatureCategory[] = [
  {
    category: 'Team & Staff Allocation',
    rows: [
      {
        name: 'Staff Allocation',
        shared: 'Shared Operator Pool',
        dedicatedVa: '1 Dedicated VA (Exclusive)',
        dedicatedTeam: '2 Operators + Team Lead',
        custom: 'Custom Pod (5+ Staff)',
      },
      {
        name: 'Dedicated Account Manager',
        shared: 'Shared Queue',
        dedicatedVa: 'Dedicated Lead',
        dedicatedTeam: 'Senior Operations Lead',
        custom: 'Executive Director',
      },
      {
        name: 'Direct Host Channel',
        shared: 'Ticket / Email',
        dedicatedVa: 'Private WhatsApp & Slack',
        dedicatedTeam: 'Private Slack & WhatsApp',
        custom: 'VIP Hotline & Slack',
      },
      {
        name: 'Brand Voice & SOP Customization',
        shared: 'Standard Playbook',
        dedicatedVa: 'Full Bespoke Playbook',
        dedicatedTeam: 'Full Bespoke Playbook',
        custom: 'Tailored Enterprise SOPs',
      },
    ],
  },
  {
    category: 'Guest Experience & Operations',
    rows: [
      {
        name: '24/7 Guest Messaging',
        shared: true,
        dedicatedVa: true,
        dedicatedTeam: true,
        custom: true,
      },
      {
        name: 'Average Response Time',
        shared: '< 15 mins',
        dedicatedVa: '< 8 mins',
        dedicatedTeam: '< 5 mins (Instant)',
        custom: 'Guaranteed SLA (< 3m)',
      },
      {
        name: 'Turnover & Cleaner Scheduling',
        shared: true,
        dedicatedVa: true,
        dedicatedTeam: true,
        custom: true,
      },
      {
        name: 'Guest Vetting & ID Screening',
        shared: 'Standard',
        dedicatedVa: 'Advanced Fraud Checks',
        dedicatedTeam: 'Advanced Fraud Checks',
        custom: 'Custom Background Protocol',
      },
      {
        name: 'Smart Lock Code Automation',
        shared: true,
        dedicatedVa: true,
        dedicatedTeam: true,
        custom: true,
      },
      {
        name: 'Out-of-Hours Maintenance Escalation',
        shared: 'Standard Protocol',
        dedicatedVa: 'Direct Contractor Liaison',
        dedicatedTeam: 'Dedicated Dispatch Lead',
        custom: '24/7 Emergency Dispatch',
      },
    ],
  },
  {
    category: 'Revenue, Channels & Marketing',
    rows: [
      {
        name: 'Dynamic Pricing Management',
        shared: false,
        dedicatedVa: true,
        dedicatedTeam: true,
        custom: 'Custom Revenue Strategy',
      },
      {
        name: 'Direct Booking Engine Setup',
        shared: false,
        dedicatedVa: true,
        dedicatedTeam: true,
        custom: 'Custom Domain & Stripe',
      },
      {
        name: 'OTA Distribution (Airbnb, Booking.com, VRBO)',
        shared: 'Up to 2 Channels',
        dedicatedVa: 'Unlimited Channels',
        dedicatedTeam: 'Unlimited Channels',
        custom: 'Global Distribution & GDS',
      },
      {
        name: 'Review Dispute & Superhost Protection',
        shared: 'Standard',
        dedicatedVa: 'Proactive Defense',
        dedicatedTeam: 'Proactive Defense',
        custom: 'Dedicated Escalation Agent',
      },
    ],
  },
  {
    category: 'Analytics & Strategy Reviews',
    rows: [
      {
        name: 'P&L & Performance Reporting',
        shared: 'Monthly Statement',
        dedicatedVa: 'Weekly Revenue Report',
        dedicatedTeam: 'Weekly + Live Dashboard',
        custom: 'Custom BI Analytics',
      },
      {
        name: 'Strategy & Growth Reviews',
        shared: 'Quarterly',
        dedicatedVa: 'Monthly 1-on-1 Call',
        dedicatedTeam: 'Bi-Weekly Strategy Call',
        custom: 'Weekly Executive Briefing',
      },
    ],
  },
]

export function PricingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const handleSelectTier = () => {
    setIsModalOpen(true)
  }

  return (
    <section id="pricing" className="relative overflow-hidden bg-background pt-6 pb-12 sm:pt-8 sm:pb-14 md:pt-10 md:pb-16">
      {/* Ambient background glow behind featured tier */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-coral-bright/8 blur-[140px]"
      />

      <div className="mx-auto w-[86%] md:w-[73vw]">
        {/* Primary Pricing Block (Header + 3 Flat Monthly Tiers) */}
        <div data-pricing-primary>
          {/* Section Header */}
          <div className="mb-4 text-center sm:mb-6">
            <Reveal>
              <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                Transparent Investment
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-3xl">
                Simple, Flat Monthly Plans<span className="text-primary">.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-muted-foreground sm:text-xs">
                No percentage commissions on your nightly revenue. Choose a dedicated or shared operations model built to scale your UK short-term rental portfolio.
              </p>
            </Reveal>
          </div>

          {/* 3 Main Pricing Cards Grid - Compact & Screen-Fitting */}
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-3.5 xl:gap-4.5">
            {tiers.map((tier, idx) => {
              const isDedicatedVa = tier.id === 'dedicated-va'

              return (
                <Reveal key={tier.id} delay={idx * 0.1} className="flex">
                  <div
                    data-cursor="hover"
                    className={clsx(
                      'group relative flex w-full flex-col justify-between rounded-2xl p-4 sm:p-4.5 md:p-5 transition-all duration-300',
                      isDedicatedVa
                        ? 'z-10 border-2 border-primary/80 bg-card shadow-xl shadow-primary/10 ring-1 ring-primary/25 lg:-translate-y-1.5 lg:scale-[1.01]'
                        : 'border border-border bg-card/60 hover:border-primary/40 hover:bg-card hover:shadow-lg',
                    )}
                  >
                    {/* Dedicated VA Spotlight Banner */}
                    {isDedicatedVa && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-brand-coral-bright to-brand-coral px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white shadow-md shadow-primary/30">
                          <Sparkles size={10} className="animate-pulse" />
                          {tier.badge}
                        </span>
                      </div>
                    )}

                    {/* Card Header */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-block rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground/80">
                          {tier.targetUnits}
                        </span>
                        {!isDedicatedVa && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {tier.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                        {tier.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {tier.tagline}
                      </p>

                      {/* Price display */}
                      <div className="mt-2.5 flex items-baseline gap-1.5 border-b border-border pb-2.5">
                        <span className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                          {tier.price}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {tier.period}
                        </span>
                        <span className="ml-auto rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          £0 Commission
                        </span>
                      </div>

                      {/* Features list */}
                      <p className="mt-2.5 mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground/80">
                        What&apos;s included:
                      </p>
                      <ul className="space-y-1.5">
                        {tier.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-1.5 text-xs leading-snug text-foreground/85">
                            <span
                              className={clsx(
                                'mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full',
                                isDedicatedVa
                                  ? 'bg-primary text-white'
                                  : 'bg-primary/10 text-primary',
                              )}
                            >
                              <Check size={8} strokeWidth={2.8} />
                            </span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card Action Button */}
                    <div className="mt-4 pt-1">
                      <Magnetic>
                        <button
                          type="button"
                          onClick={handleSelectTier}
                          data-cursor="hover"
                          className={clsx(
                            'w-full rounded-full py-2 sm:py-2.5 text-center font-display text-xs font-semibold transition-all duration-200 active:scale-[0.98]',
                            isDedicatedVa
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255,56,92,0.4)]'
                              : 'border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
                          )}
                        >
                          {tier.btnText}
                        </button>
                      </Magnetic>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* ─── Custom Service Option Card (Below the 3 tiers) ──────────────── */}
        <Reveal delay={0.2} className="mt-10 sm:mt-12">
          <div
            data-cursor="hover"
            className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-card via-card to-card/60 p-8 sm:p-10 shadow-lg"
          >
            {/* Ambient accent line on top edge */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-primary/60 to-transparent" />

            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Building size={13} />
                  <span>Custom & Enterprise Operations</span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Need a Bespoke Multi-City Setup?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Managing 15+ serviced apartments, boutique aparthotels, or need dedicated night-shift coverage and on-ground team management? We architect tailor-made operations pods with customized SLAs.
                </p>

                {/* Capability tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    'Custom Shift Schedules',
                    'Dedicated Account Director',
                    'Direct PMS/ERP API Sync',
                    'On-Ground Vendor Liaison',
                    'Guaranteed Response SLA',
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-border bg-foreground/5 px-2.5 py-1 text-xs font-medium text-foreground/80"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <Magnetic>
                  <button
                    type="button"
                    onClick={handleSelectTier}
                    data-cursor="hover"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 font-display text-sm font-semibold text-background shadow-md transition hover:bg-foreground/90 active:scale-[0.98]"
                  >
                    Request Custom Proposal <ArrowRight size={15} />
                  </button>
                </Magnetic>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ─── Toggle Button for Feature Comparison Table ───────────────────── */}
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={() => setShowComparison((prev) => !prev)}
            data-cursor="hover"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-display text-xs sm:text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          >
            <SlidersHorizontal size={15} />
            <span>{showComparison ? 'Hide Feature Comparison Table' : 'Compare All Plan Features in Detail'}</span>
          </button>
        </div>

        {/* ─── Detailed Feature Comparison Table ───────────────────────────── */}
        {showComparison && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-5 px-6 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground w-2/5">
                      Operational Features
                    </th>
                    <th className="py-5 px-4 font-display text-sm font-bold text-foreground text-center w-1/5">
                      Shared Team
                      <span className="block font-mono text-xs font-normal text-muted-foreground mt-0.5">£499/mo</span>
                    </th>
                    <th className="py-5 px-4 font-display text-sm font-bold text-primary text-center bg-primary/5 border-x border-primary/20 w-1/5">
                      <span className="inline-block rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-mono font-bold mb-1">
                        RECOMMENDED
                      </span>
                      Dedicated VA
                      <span className="block font-mono text-xs font-normal text-foreground/80 mt-0.5">£999/mo</span>
                    </th>
                    <th className="py-5 px-4 font-display text-sm font-bold text-foreground text-center w-1/5">
                      Dedicated Team
                      <span className="block font-mono text-xs font-normal text-muted-foreground mt-0.5">£1,899/mo</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((cat, cIdx) => (
                    <React.Fragment key={cat.category}>
                      {/* Category Header Row */}
                      <tr className="border-t border-b border-border/70 bg-muted/20">
                        <td
                          colSpan={4}
                          className="py-3 px-6 font-mono text-xs font-bold uppercase tracking-wider text-primary"
                        >
                          {cat.category}
                        </td>
                      </tr>

                      {/* Individual Rows */}
                      {cat.rows.map((row, rIdx) => (
                        <tr
                          key={row.name}
                          className="border-b border-border/40 hover:bg-muted/10 transition-colors"
                        >
                          <td className="py-4 px-6 text-xs sm:text-sm font-medium text-foreground">
                            {row.name}
                          </td>

                          {/* Shared Team */}
                          <td className="py-4 px-4 text-center text-xs sm:text-sm text-muted-foreground">
                            {typeof row.shared === 'boolean' ? (
                              row.shared ? (
                                <Check size={16} className="mx-auto text-primary" />
                              ) : (
                                <Minus size={16} className="mx-auto text-muted-foreground/40" />
                              )
                            ) : (
                              row.shared
                            )}
                          </td>

                          {/* Dedicated VA (Highlighted Column) */}
                          <td className="py-4 px-4 text-center text-xs sm:text-sm font-semibold text-foreground bg-primary/5 border-x border-primary/20">
                            {typeof row.dedicatedVa === 'boolean' ? (
                              row.dedicatedVa ? (
                                <Check size={16} className="mx-auto text-primary" strokeWidth={2.5} />
                              ) : (
                                <Minus size={16} className="mx-auto text-muted-foreground/40" />
                              )
                            ) : (
                              row.dedicatedVa
                            )}
                          </td>

                          {/* Dedicated Team */}
                          <td className="py-4 px-4 text-center text-xs sm:text-sm text-muted-foreground">
                            {typeof row.dedicatedTeam === 'boolean' ? (
                              row.dedicatedTeam ? (
                                <Check size={16} className="mx-auto text-primary" />
                              ) : (
                                <Minus size={16} className="mx-auto text-muted-foreground/40" />
                              )
                            ) : (
                              row.dedicatedTeam
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom table CTA bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border bg-muted/10 p-6">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                All plans include zero commission fees, monthly contracts, and a 14-day operational satisfaction guarantee.
              </p>
              <button
                type="button"
                onClick={handleSelectTier}
                className="rounded-full bg-primary px-6 py-2.5 font-display text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Schedule Onboarding Call
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Multi-step Form Modal */}
      <ExpertModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  )
}
