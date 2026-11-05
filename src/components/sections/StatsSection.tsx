'use client'

import React from 'react'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import { Reveal } from '@/components/motion/Reveal'

const stats = [
  {
    end: 260,
    suffix: '+',
    label: 'Total Properties Managed',
    description: 'Trusted by independent operators and portfolio owners across the UK.',
  },
  {
    end: 180,
    suffix: '+',
    label: 'Active Properties',
    description: 'Under active 24/7 guest communications, turnover, and revenue care.',
  },
  {
    end: 8,
    suffix: '+',
    label: 'Years of Hosting Experience',
    description: 'Proven hospitality systems, battle-tested playbooks, and 5-star standards.',
  },
]

export function StatsSection() {
  return (
    <section className="relative flex min-h-[540px] flex-col justify-center overflow-hidden bg-background py-24 sm:py-28 md:py-36 lg:py-40">
      {/* Background: Behind Numbers Team Image framed to show faces at top and bodies/chairs at bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
      >
        <img
          src="/assets/NUMBERS%20BEHIND.webp"
          alt=""
          className="h-full w-full object-cover object-[center_12%] opacity-90"
        />
        {/* Soft edge fades with deeper feathering to blend seamlessly into the background */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-20 sm:h-28 md:h-36 bg-linear-to-b from-background via-background/50 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-20 sm:h-28 md:h-36 bg-linear-to-t from-background via-background/50 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-background/15" />
      </div>

      <div className="relative z-10 mx-auto w-[86%] md:w-[73vw] max-w-5xl">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1}>
              <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-card/75 p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:bg-card/90 hover:shadow-lg sm:rounded-2xl sm:p-6 md:p-7">
                {/* Ambient glow in corner */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100"
                />

                <div className="relative z-10">
                  <div className="font-display text-3xl font-extrabold tracking-tight tabular-nums text-foreground sm:text-4xl md:text-5xl">
                    <AnimatedCounter end={stat.end} className="text-foreground" />
                    <span className="text-primary font-bold">{stat.suffix}</span>
                  </div>

                  <h3 className="mt-2.5 font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {stat.label}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px] sm:mt-1.5">
                    {stat.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Below the cards: The Team Behind The Numbers */}
        <Reveal delay={0.35}>
          <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col items-center justify-center text-center">
            <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              The Team Behind The Numbers<span className="text-primary">.</span>
            </h3>
            <p className="mt-2 max-w-xl text-sm sm:text-base font-light text-muted-foreground leading-relaxed">
              Real hospitality specialists, 24/7 guest concierges, and revenue minds —{' '}
              <span className="font-serif italic text-foreground">the human engine powering your short-term rental growth.</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
