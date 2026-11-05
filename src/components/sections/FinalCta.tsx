'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

import { Magnetic } from '@/components/motion/Magnetic'

export function FinalCta() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background py-32">
      <div className="absolute inset-0 z-0 bg-linear-to-br from-muted via-background to-background opacity-60" />
      <div className="grain absolute inset-0 z-0 opacity-30 mix-blend-overlay" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[80vw] max-h-200 w-[80vw] max-w-200 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[50px]"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 50%, color-mix(in oklch, var(--brand-coral-bright) 8%, transparent), transparent)',
        }}
      />

      <motion.div
        animate={{ y: [0, -100, 0], x: [0, 50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 left-[10%] z-0 h-[40vw] max-h-150 w-[40vw] max-w-150 rounded-full bg-brand-coral-bright opacity-[0.02] blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 100, 0], x: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-40 right-[10%] z-0 h-[50vw] max-h-200 w-[50vw] max-w-200 rounded-full bg-brand-coral-deep opacity-[0.02] blur-3xl"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 font-mono text-xs text-muted-foreground uppercase tracking-widest"
        >
          Ready to scale your STR business?
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          data-cursor="hover"
          className="mb-12 flex flex-col font-display text-7xl leading-[0.85] tracking-tighter md:text-[8rem] lg:text-[10rem]"
        >
          <span className="text-foreground">Let&apos;s make</span>
          <span className="text-stroke" style={{ ['--stroke-color' as string]: 'var(--brand-coral-bright)' }}>
            it happen.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          data-cursor="text"
          className="mb-16 max-w-xl text-lg text-muted-foreground md:text-xl"
        >
          Whether you operate 2 properties or 20, let&apos;s build an operational backend that gives
          you your freedom back and elevates your revenue.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col items-center gap-6 sm:flex-row"
        >
          <Magnetic>
            <Link
              href="/contact"
              data-cursor="hover"
              className="rounded-full bg-primary px-10 py-5 font-display text-lg font-medium text-primary-foreground transition-all hover:shadow-[0_0_30px_rgba(255,56,92,0.35)]"
            >
              Book a Discovery Call
            </Link>
          </Magnetic>

          <Link
            href="/#services"
            data-cursor="hover"
            className="rounded-full border border-border px-10 py-5 font-display text-lg font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
          >
            Explore Services
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
