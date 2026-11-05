'use client'

import React from 'react'
import { Reveal } from '@/components/motion/Reveal'

const bookingProofs = [
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-01.webp',
    alt: 'Direct booking payout proof 01',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-02.webp',
    alt: 'Direct booking payout proof 02',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-03.webp',
    alt: 'Direct booking payout proof 03',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-04.webp',
    alt: 'Direct booking payout proof 04',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-05.webp',
    alt: 'Direct booking payout proof 05',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-06.webp',
    alt: 'Direct booking payout proof 06',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-07.webp',
    alt: 'Direct booking payout proof 07',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-08.webp',
    alt: 'Direct booking payout proof 08',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-09.webp',
    alt: 'Direct booking payout proof 09',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-10.webp',
    alt: 'Direct booking payout proof 10',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-11.webp',
    alt: 'Direct booking payout proof 11',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-12.webp',
    alt: 'Direct booking payout proof 12',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-13.webp',
    alt: 'Direct booking payout proof 13',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-14.webp',
    alt: 'Direct booking payout proof 14',
  },
  {
    src: '/assets/direct-booking-payments/PROOF%20FORMAT-15.webp',
    alt: 'Direct booking payout proof 15',
  },
]

export function ConvertedDirectBookings() {
  return (
    <section id="conversions" className="relative overflow-hidden bg-background pt-6 pb-10 sm:pt-8 sm:pb-12 md:pt-10 md:pb-14">
      <div data-conversions-content>
        {/* Header aligned to grid */}
        <div className="mx-auto mb-5 w-[86%] sm:mb-7 md:w-[73vw]">
          <div className="max-w-2xl">
            <Reveal>
              <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                Direct Booking Engine
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                Converted Direct Bookings<span className="text-primary">.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Live payouts and direct guest reservation receipts processed across our UK host partner
                portfolios — with £0 platform commissions.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Full-bleed right-to-left marquee scroller */}
        <div className="relative w-full overflow-hidden py-3">
          {/* Soft edge fade masks */}
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-20 bg-linear-to-r from-background to-transparent sm:w-36 md:w-48" />
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-20 bg-linear-to-l from-background to-transparent sm:w-36 md:w-48" />

          <div
            className="flex w-max items-center gap-6 pr-6 hover:[animation-play-state:paused]"
            style={{
              animation: 'marquee 55s linear infinite',
            }}
          >
            {/* Render twice for an infinite, seamless loop */}
            {[...bookingProofs, ...bookingProofs].map((proof, i) => (
              <div
                key={i}
                data-cursor="hover"
                className="group relative w-[185px] shrink-0 sm:w-[205px] md:w-[225px] aspect-[502/1087] overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl"
              >
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={proof.src}
                    alt={proof.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
