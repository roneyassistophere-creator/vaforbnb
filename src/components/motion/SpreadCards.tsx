'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import clsx from 'clsx'

type CardDef = {
  label: string
  accent: string
}

const CARDS: CardDef[] = [
  { label: 'Booking Site', accent: 'bg-primary' },
  { label: 'Ecommerce', accent: 'bg-ink-900' },
  { label: 'Dashboard', accent: 'bg-brand-coral-bright' },
]

const STACK = [
  { x: 0, y: 0, rotate: -7 },
  { x: 0, y: 22, rotate: 3 },
  { x: 0, y: 44, rotate: -1 },
]

const SPREAD = [
  { x: -104, y: 4, rotate: -9 },
  { x: 0, y: -14, rotate: 0 },
  { x: 104, y: 4, rotate: 9 },
]

function WebsiteCardFace({ accent, label }: { accent: string; label: string }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl shadow-black/10">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        <span className="ml-auto text-[9px] font-medium text-muted-foreground">{label}</span>
      </div>
      <div className={clsx('flex flex-1 flex-col justify-center gap-2 px-4 py-5', accent)}>
        <div className="h-2 w-2/3 rounded-full bg-white/80" />
        <div className="h-2 w-1/2 rounded-full bg-white/50" />
        <div className="mt-2 h-5 w-14 rounded-full bg-white/90" />
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        <div className="h-6 rounded-md bg-muted" />
        <div className="h-6 rounded-md bg-muted" />
        <div className="h-6 rounded-md bg-muted" />
      </div>
    </div>
  )
}

// A stack of abstract "website" cards that pop open into a spread fan on
// hover, so every card can be seen fully instead of just the top one.
export function SpreadCards() {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative mx-auto h-64 w-full max-w-xs sm:h-72"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="group"
      aria-label="Example site layouts we build — hover to spread them out"
    >
      {CARDS.map((card, i) => {
        const target = hovered ? SPREAD[i] : STACK[i]
        return (
          <motion.div
            key={card.label}
            className="absolute inset-x-6 top-0 h-48 sm:h-56"
            style={{ zIndex: CARDS.length - i }}
            animate={{
              x: target.x,
              y: target.y,
              rotate: target.rotate,
              scale: hovered ? 1.03 : 1,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <WebsiteCardFace accent={card.accent} label={card.label} />
          </motion.div>
        )
      })}
    </div>
  )
}
