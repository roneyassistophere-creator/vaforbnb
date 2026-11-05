'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Play } from 'lucide-react'

import { SmartLink } from '@/components/SmartLink'
import { Magnetic } from '@/components/motion/Magnetic'
import { LogoMark } from '@/components/Logo/Logo'
import { ExpertModal } from '@/components/MultiStepExpertForm/ExpertModal'

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const blobRef = useRef<HTMLDivElement>(null)
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false)

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96])
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!blobRef.current) return
      blobRef.current.style.transform = `translate(${e.clientX - 400}px, ${e.clientY - 400}px)`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-background pt-24 pb-8 sm:pt-28 sm:pb-10 md:pt-28 md:pb-12"
    >
      <div
        ref={blobRef}
        className="pointer-events-none absolute top-0 left-0 z-0 h-200 w-200 rounded-full bg-brand-coral-bright/8 blur-[130px] transition-transform duration-1000 ease-out"
      />
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 z-0 bg-size-[60px_60px] opacity-40"
      />
      <div className="grain absolute inset-0 z-1 opacity-20" />

      {/* Container aligned with the header: w-[86%] md:w-[73vw] */}
      <motion.div
        style={{ opacity, scale, y }}
        className="relative z-10 mx-auto flex w-[86%] flex-col md:w-[73vw]"
      >
        {/* Top: Headline and single-line description */}
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.1rem,3.6vw,3.6rem)] font-medium tracking-[-0.03em] leading-[1.1] text-foreground"
          >
            <span className="block sm:whitespace-nowrap">Spend Less Time Managing.</span>
            <span className="block mt-1 sm:mt-1.5 text-primary">
              More Time Growing.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 mb-6 sm:mb-8 text-base font-light leading-relaxed text-muted-foreground sm:text-lg md:text-xl whitespace-normal md:whitespace-nowrap"
          >
            Your Shared or Dedicated{' '}
            <span className="relative inline-block font-semibold text-foreground">
              short-term rental team
              <svg
                viewBox="0 0 280 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute -bottom-2 sm:-bottom-2.5 left-0 h-[10px] w-full text-primary sm:h-[12px]"
                preserveAspectRatio="none"
              >
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.65, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  d="M3 12C50 4 140 3 205 7C235 9 262 10.5 277 8"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>{' '}
            without the full-time cost.
          </motion.p>
        </div>

        {/* Middle: Landscape Studio Video Frame */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full"
        >
          {/* Subtle ambient coral glow behind the landscape player */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-5 sm:-inset-7 -z-10 rounded-[3rem] bg-brand-coral-bright/12 blur-2xl sm:blur-3xl"
          />

          {/* Landscape Studio Frame */}
          <div
            style={{ maxWidth: 'min(860px, calc(46vh * 16 / 9))' }}
            className="relative aspect-video w-full mx-auto overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-border/80 bg-slate-950 shadow-2xl shadow-slate-900/10"
          >
            <video
              src="/assets/assist-bnb-video.webm"
              autoPlay
              muted
              loop
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            >
              <source src="/assets/assist-bnb-video.webm" type="video/webm" />
              <source src="/assets/ASSIST%20BNB%20VIDEO.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>

            {/* White branding rectangle badge in top-right to cover video watermark */}
            <div
              aria-label="Assist BNB"
              className="pointer-events-none absolute top-5 right-3 sm:top-6 sm:right-5 z-20 flex items-center gap-2 rounded-lg bg-white px-3.5 py-1.5 sm:px-4 sm:py-2 shadow-md border border-slate-200/90 select-none"
            >
              <LogoMark size={20} className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="flex items-baseline gap-1 font-display text-xs sm:text-sm tracking-wider uppercase leading-none">
                <span className="font-extrabold text-slate-950">ASSIST</span>
                <span className="font-light text-slate-700">BNB</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bottom: CTA Buttons moved below the video */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5"
        >
          <Magnetic>
            <button
              type="button"
              onClick={() => setIsExpertModalOpen(true)}
              data-cursor="hover"
              className="rounded-full bg-primary px-8 py-3.5 sm:px-9 sm:py-4 font-display text-sm sm:text-base font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(255,56,92,0.35)] active:scale-[0.98]"
            >
              Talk to an Expert
            </button>
          </Magnetic>
          <Magnetic>
            <SmartLink
              href="/#process"
              data-cursor="hover"
              className="group inline-flex items-center gap-2.5 sm:gap-3 rounded-full border border-border/90 bg-card/80 px-6 py-3.5 sm:px-8 sm:py-4 backdrop-blur-xs font-display text-sm sm:text-base font-semibold text-foreground shadow-xs transition-all duration-200 hover:border-primary/50 hover:bg-card hover:shadow-md hover:shadow-primary/10 active:scale-[0.98]"
            >
              <span className="relative flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs transition-transform duration-300 group-hover:scale-110">
                <span className="absolute -inset-0.5 rounded-full bg-primary/30 animate-ping group-hover:animate-none opacity-60" />
                <Play size={11} className="relative ml-0.5 fill-current" />
              </span>
              <span>Watch How It Works</span>
            </SmartLink>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* Down arrow indicator */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 z-20 -translate-x-1/2 text-muted-foreground/30"
      >
        <ChevronDown size={22} />
      </motion.div>

      {/* Interactive Multi-Step Form Modal */}
      <ExpertModal
        isOpen={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
      />
    </section>
  )
}
