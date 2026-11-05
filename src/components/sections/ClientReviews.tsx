'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'

const reviews = [
  {
    src: '/assets/REVIEWS/1-01.webp',
    alt: 'Assist BNB Host WhatsApp Review 01 - Upsells and Guest Check-in Care',
  },
  {
    src: '/assets/REVIEWS/1-02.webp',
    alt: 'Assist BNB Host WhatsApp Review 02 - Direct £2,500/month Bookings & Lead Negotiation',
  },
  {
    src: '/assets/REVIEWS/1-03.webp',
    alt: 'Assist BNB Host WhatsApp Review 03 - Operational Support and Host Praise',
  },
  {
    src: '/assets/REVIEWS/1-04.webp',
    alt: 'Assist BNB Host WhatsApp Review 04 - Host Operations & Proactive Communication',
  },
  {
    src: '/assets/REVIEWS/1-05.webp',
    alt: 'Assist BNB Host WhatsApp Review 05 - Rapid Problem Solving & Dedicated Virtual Assistance',
  },
  {
    src: '/assets/REVIEWS/1-06.webp',
    alt: 'Assist BNB Host WhatsApp Review 06 - 5-Star Reviews & Host Appreciation',
  },
  {
    src: '/assets/REVIEWS/1-07.webp',
    alt: 'Assist BNB Host WhatsApp Review 07 - Client Feedback & Clean Turnover Coordination',
  },
  {
    src: '/assets/REVIEWS/1-08.webp',
    alt: 'Assist BNB Host WhatsApp Review 08 - Continuous Guest Support & Revenue Growth',
  },
  {
    src: '/assets/REVIEWS/1-09.webp',
    alt: 'Assist BNB Host WhatsApp Review 09 - Host Communication & Booking Expansion',
  },
  {
    src: '/assets/REVIEWS/1-10.webp',
    alt: 'Assist BNB Host WhatsApp Review 10 - Smooth Daily Coordination & Host Peace of Mind',
  },
  {
    src: '/assets/REVIEWS/1-11.webp',
    alt: 'Assist BNB Host WhatsApp Review 11 - Direct Client Message & Trust in Assist BNB',
  },
  {
    src: '/assets/REVIEWS/1-12.webp',
    alt: 'Assist BNB Host WhatsApp Review 12 - Dedicated Support & Host Praise',
  },
]

export function ClientReviews() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleClose = useCallback(() => {
    setSelectedIndex(null)
  }, [])

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (selectedIndex === null) return
      setSelectedIndex((selectedIndex - 1 + reviews.length) % reviews.length)
    },
    [selectedIndex],
  )

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (selectedIndex === null) return
      setSelectedIndex((selectedIndex + 1) % reviews.length)
    },
    [selectedIndex],
  )

  useEffect(() => {
    if (selectedIndex === null) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + reviews.length) % reviews.length))
      }
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % reviews.length))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedIndex, handleClose])

  return (
    <section id="reviews" className="relative overflow-hidden bg-background pt-6 pb-10 sm:pt-8 sm:pb-12 md:pt-10 md:pb-14">
      <div data-reviews-content>
        {/* Header aligned to grid */}
        <div className="mx-auto mb-5 w-[86%] sm:mb-7 md:w-[73vw]">
          <div className="max-w-2xl">
            <Reveal>
              <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                Direct Host Feedback
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                Our Hosts Happiness<span className="text-primary">.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Unfiltered WhatsApp messages and day-to-day feedback from our UK host partners.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Full-bleed marquee scroller */}
        <div className="relative w-full overflow-hidden py-3">
        {/* Soft edge fade masks */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-20 bg-linear-to-r from-background to-transparent sm:w-36 md:w-48" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-20 bg-linear-to-l from-background to-transparent sm:w-36 md:w-48" />

        <div
          className="flex w-max items-center gap-6 pr-6 hover:[animation-play-state:paused]"
          style={{
            animation: 'marquee 50s linear infinite',
          }}
        >
          {/* Render twice for an infinite, seamless loop */}
          {[...reviews, ...reviews].map((review, i) => {
            const originalIndex = i % reviews.length
            return (
              <div
                key={i}
                data-cursor="hover"
                onClick={() => setSelectedIndex(originalIndex)}
                className="group relative flex w-[265px] shrink-0 sm:w-[295px] md:w-[330px] cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card p-1.5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Left Vertical Spine / Extension */}
                <div className="relative flex w-10 sm:w-11 md:w-12 shrink-0 flex-col items-center justify-between overflow-hidden rounded-l-xl border-r border-border/60 bg-muted/30 py-4.5 select-none transition-colors duration-300 group-hover:bg-muted/50">
                  {/* Top Index Number */}
                  <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider text-muted-foreground/60 transition-colors group-hover:text-primary">
                    #{String(originalIndex + 1).padStart(2, '0')}
                  </span>

                  {/* Vertical "CLICK TO READ" text */}
                  <div
                    className="my-auto flex items-center justify-center font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50 transition-colors duration-300 group-hover:text-foreground/90"
                    style={{
                      writingMode: 'vertical-rl',
                    }}
                  >
                    CLICK TO READ
                  </div>

                  {/* Bottom Verified indicator */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                    <span className="font-mono text-[8px] font-medium uppercase tracking-widest text-muted-foreground/45">
                      LIVE
                    </span>
                  </div>
                </div>

                {/* Right Image Container */}
                <div className="relative flex-1 aspect-[1044/1584] overflow-hidden rounded-r-xl bg-slate-100 dark:bg-slate-900">
                  <img
                    src={review.src}
                    alt={review.alt}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  {/* "Click to read" badge - visible without any dark overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:border-primary/50 group-hover:shadow-primary/10">
                      <ZoomIn className="h-3.5 w-3.5 text-primary" />
                      Click to read
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>

      {/* Lightbox Modal for detailed reading */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all animate-in fade-in"
          onClick={handleClose}
        >
          <div
            className="relative flex max-h-[92vh] max-w-[90vw] flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-hidden"
              aria-label="Close review"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left navigation */}
            <button
              onClick={handlePrev}
              className="absolute -left-14 top-1/2 -translate-y-1/2 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-hidden"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Right navigation */}
            <button
              onClick={handleNext}
              className="absolute -right-14 top-1/2 -translate-y-1/2 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-hidden"
              aria-label="Next review"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Modal Card with left spine and image */}
            <div className="relative flex max-h-[82vh] overflow-hidden rounded-2xl border border-white/20 bg-background shadow-2xl">
              {/* Left Spine in modal */}
              <div className="relative flex w-12 sm:w-14 shrink-0 flex-col items-center justify-between border-r border-border/60 bg-muted/40 py-6 select-none">
                <span className="font-mono text-xs font-bold text-primary">
                  #{String(selectedIndex + 1).padStart(2, '0')}
                </span>
                <div
                  className="my-auto font-mono text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  CLICK TO READ
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                    LIVE
                  </span>
                </div>
              </div>

              {/* Modal Screenshot */}
              <div className="relative aspect-[1044/1584] max-h-[82vh] overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={reviews[selectedIndex].src}
                  alt={reviews[selectedIndex].alt}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>

            {/* Counter */}
            <p className="mt-3 font-mono text-xs font-medium text-white/70">
              Verified Host Review {selectedIndex + 1} of {reviews.length}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
