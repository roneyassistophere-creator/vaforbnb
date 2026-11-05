'use client'

import React from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { eyebrowOnDark } from '@/utilities/typography'

export function Philosophy() {
  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      <div className="grain absolute inset-0 opacity-20" />

      <div className="relative mx-auto w-[86%] md:w-[73vw]">
        <div className="relative border border-border px-5 py-10 sm:px-9 sm:py-12 md:px-12 md:py-14">
          {/* Corner brackets */}
          <span className="absolute -left-px -top-px h-3.5 w-3.5 border-l-2 border-t-2 border-primary" />
          <span className="absolute -right-px -top-px h-3.5 w-3.5 border-r-2 border-t-2 border-primary" />
          <span className="absolute -bottom-px -left-px h-3.5 w-3.5 border-l-2 border-b-2 border-primary" />
          <span className="absolute -bottom-px -right-px h-3.5 w-3.5 border-r-2 border-b-2 border-primary" />

          <Reveal>
            <div className="mb-8 flex items-start justify-between gap-6">
              <p className={eyebrowOnDark}>Our Philosophy</p>
              <p className="hidden font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase sm:block">
                STR Operations &amp; Growth Partner
              </p>
            </div>

            <h2 className="font-display text-[clamp(2rem,3.4vw,4.25rem)] leading-[1.08] font-extrabold tracking-[-0.02em]">
              <span className="block lg:whitespace-nowrap">
                <span className="mr-1 text-foreground/30">&ldquo;</span>
                <span className="text-foreground">Get your time back,</span>{' '}
                <span className="inline-block rounded-xs bg-brand-coral-tint px-2.5 py-0.5 text-brand-coral-deep sm:px-3 sm:py-1">
                  Scale like top 1%
                </span>
              </span>
              <span className="block mt-1 font-serif text-[0.88em] font-normal italic">
                <span className="text-foreground">engineered to compound</span>
                <span className="text-primary">.</span>
                <span className="ml-1.5 font-display not-italic text-foreground/30">&rdquo;</span>
              </span>
            </h2>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
