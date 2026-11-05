'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Reveal } from '@/components/motion/Reveal'
import { Play, X } from 'lucide-react'

const steps = [
  {
    step: '01',
    phase: 'Discovery',
    title: 'Discovery & Audit',
    tagline: 'A short call, total clarity',
    desc: 'We review your listings, occupancy trends, cleaning friction, and where revenue is slipping through the cracks.',
    duration: 'Day 0',
    videoDuration: '1:15 min',
    videoTitle: 'Listing & Portfolio Audit Demo',
  },
  {
    step: '02',
    phase: 'Integration',
    title: 'PMS & Channel Sync',
    tagline: 'Unified operations hub',
    desc: 'We connect your channels (Airbnb, Booking.com, VRBO) into a centralized PMS, sync smart locks, and set message routing.',
    duration: 'Week 1',
    videoDuration: '2:30 min',
    videoTitle: 'Multi-Channel PMS Setup Demo',
  },
  {
    step: '03',
    phase: 'Systems',
    title: 'Playbooks & SOPs',
    tagline: 'Turnover & guest standards',
    desc: 'Documenting custom check-in guides, cleaner photo checklists, contractor emergency contacts, and guest vetting criteria.',
    duration: 'Week 2',
    videoDuration: '1:45 min',
    videoTitle: 'Automated Guest SOPs & Guides',
  },
  {
    step: '04',
    phase: 'Go-Live',
    title: '24/7 Operations Go-Live',
    tagline: 'Live, responsive, seamless',
    desc: 'Our backend team assumes 24/7 guest communications, automated check-in monitoring, and cleaner coordination.',
    duration: 'Week 3-4',
    videoDuration: '3:10 min',
    videoTitle: 'Live 24/7 Guest Care Walkthrough',
  },
  {
    step: '05',
    phase: 'Expansion',
    title: 'Scale & Compound',
    tagline: 'Direct bookings & portfolio growth',
    desc: 'Launch your commission-free direct booking engine, review monthly P&L statements, and add new units with zero extra stress.',
    duration: 'Ongoing',
    videoDuration: '2:00 min',
    videoTitle: 'Direct Booking Engine & Scale',
  },
]

function StepCard({
  step,
  index,
  totalSteps,
  onPlayVideo,
}: {
  step: (typeof steps)[number]
  index: number
  totalSteps: number
  onPlayVideo: (step: (typeof steps)[number]) => void
}) {
  return (
    <div className="group relative flex w-[85vw] sm:w-[410px] md:w-[450px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-5 sm:p-6 md:p-7 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
      {/* Top Details */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary">
              {step.step}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/70">
              Phase {index + 1}
            </span>
          </div>

          <span className="rounded-full border border-border/70 bg-muted/40 px-3 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
            {step.duration}
          </span>
        </div>

        {/* Titles & Tagline */}
        <h3 className="mb-1.5 font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          {step.title}
        </h3>
        <p className="mb-2 font-serif text-sm italic text-brand-coral-deep dark:text-brand-coral-bright sm:text-base">
          &ldquo;{step.tagline}&rdquo;
        </p>
        <p className="mb-5 text-xs leading-relaxed text-muted-foreground sm:text-sm line-clamp-2">
          {step.desc}
        </p>
      </div>

      {/* Video Demo Card Below Step Description */}
      <div
        onClick={() => onPlayVideo(step)}
        className="group/video relative aspect-video w-full cursor-pointer overflow-hidden rounded-xl border border-border/70 bg-zinc-950 shadow-inner transition-all duration-300 hover:border-primary/60 hover:shadow-md"
      >
        <video
          src="/assets/assist-bnb-video.webm"
          muted
          loop
          playsInline
          autoPlay
          className="h-full w-full object-cover opacity-75 transition-all duration-500 group-hover/video:opacity-95 group-hover/video:scale-[1.03]"
        />

        {/* Video Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] font-medium tracking-wider text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            DEMO VIDEO
          </span>
          <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-white/80 backdrop-blur-md">
            {step.videoDuration}
          </span>
        </div>

        {/* Center Play Icon with Hover Pulse */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg backdrop-blur-xs transition-transform duration-300 group-hover/video:scale-110 group-hover/video:bg-primary">
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </div>
        </div>

        {/* Bottom Video Title */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          <p className="truncate font-mono text-xs font-semibold text-white/90">
            {step.videoTitle}
          </p>
          <span className="font-mono text-[10px] uppercase text-primary font-medium tracking-wider">
            Watch
          </span>
        </div>
      </div>

      {/* Bottom Progress Footprint */}
      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? 'w-6 bg-primary'
                  : i < index
                    ? 'w-1.5 bg-primary/40'
                    : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Step {index + 1} of {totalSteps}
        </span>
      </div>
    </div>
  )
}

export function ProcessTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [maxScroll, setMaxScroll] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<(typeof steps)[number] | null>(null)

  const handleCloseVideo = useCallback(() => {
    setSelectedVideo(null)
  }, [])

  useEffect(() => {
    if (!selectedVideo) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseVideo()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedVideo, handleCloseVideo])

  useEffect(() => {
    const calculateMaxScroll = () => {
      if (trackRef.current) {
        const scrollWidth = trackRef.current.scrollWidth
        const clientWidth = window.innerWidth
        setMaxScroll(Math.max(0, scrollWidth - clientWidth))
      }
    }

    const timeout = setTimeout(calculateMaxScroll, 100)
    window.addEventListener('resize', calculateMaxScroll)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', calculateMaxScroll)
    }
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const x = useTransform(scrollYProgress, [0, 1], [0, -maxScroll])

  return (
    <section
      id="process"
      ref={containerRef}
      className="relative bg-background"
      style={{ height: '320vh' }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-between overflow-hidden pt-20 pb-8 sm:pt-24 sm:pb-10 md:pt-24 md:pb-12">
        {/* Headings positioned high above for ample vertical room */}
        <div className="mx-auto w-[86%] shrink-0 md:w-[73vw]">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Reveal>
                <p className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                  Our Process of Work
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="font-display text-3xl font-extrabold tracking-[-0.01em] text-foreground sm:text-4xl md:text-5xl">
                  From Chaos to Complete Autopilot<span className="text-primary">.</span>
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                A battle-tested 5-step roadmap with real operational demos to eliminate host fatigue and scale UK revenue.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Spacious Horizontal Cards Track */}
        <div className="relative my-auto w-full overflow-hidden py-4 sm:py-6">
          {/* Soft Edge Fade Masks */}
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16 bg-linear-to-r from-background to-transparent sm:w-28 md:w-36" />
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 bg-linear-to-l from-background to-transparent sm:w-28 md:w-36" />

          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex items-stretch gap-6 pl-[7vw] sm:gap-8 md:pl-[13.5vw]"
          >
            {steps.map((step, index) => (
              <StepCard
                key={step.title}
                step={step}
                index={index}
                totalSteps={steps.length}
                onPlayVideo={(s) => setSelectedVideo(s)}
              />
            ))}

            {/* End Spacer so Step 05 rests in full view with generous right padding */}
            <div className="w-[7vw] shrink-0 md:w-[13.5vw]" />
          </motion.div>
        </div>

        {/* Bottom Interactive Progress Bar */}
        <div className="mx-auto w-[86%] shrink-0 md:w-[73vw]">
          <div className="flex items-center justify-between gap-6">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border/60">
              <motion.div
                className="h-full rounded-full bg-primary"
                style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
              />
            </div>
            <span className="hidden font-mono text-xs font-semibold text-muted-foreground sm:inline-block">
              Scroll down to explore all 5 steps
            </span>
          </div>
        </div>
      </div>

      {/* Video Modal Player when a demo video card is clicked */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in"
          onClick={handleCloseVideo}
        >
          <div
            className="relative flex w-full max-w-4xl flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex w-full items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 font-mono text-xs font-bold text-primary">
                  {selectedVideo.step}
                </span>
                <div>
                  <h4 className="font-display text-base font-bold text-white">
                    {selectedVideo.videoTitle}
                  </h4>
                  <p className="font-mono text-xs text-white/60">
                    Phase: {selectedVideo.phase} • {selectedVideo.duration}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseVideo}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-hidden"
                aria-label="Close video"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <video
                src="/assets/assist-bnb-video.webm"
                controls
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
