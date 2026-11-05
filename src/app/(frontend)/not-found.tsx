import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { FloatingOrb } from '@/components/motion/FloatingOrb'
import { Magnetic } from '@/components/motion/Magnetic'
import { Reveal } from '@/components/motion/Reveal'

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-background px-4 text-center grain">
      <FloatingOrb
        duration={20}
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-96 w-96 rounded-full bg-brand-coral-bright/15 blur-3xl"
      />
      <Reveal>
        <p className="mb-4 font-display text-9xl font-semibold text-stroke sm:text-[12rem]">
          404
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mb-10 max-w-sm text-base text-muted-foreground">
          This page couldn&apos;t be found. It may have moved, or the link might be out of date.
        </p>
      </Reveal>
      <Reveal delay={0.2}>
        <Magnetic className="inline-block">
          <Button asChild size="lg" className="glow-accent" data-cursor="hover">
            <Link href="/">Go home</Link>
          </Button>
        </Magnetic>
      </Reveal>
    </div>
  )
}
