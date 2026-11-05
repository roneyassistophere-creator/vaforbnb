'use client'

import { motion } from 'motion/react'
import { BadgeCheck, LayoutTemplate, TrendingUp, Zap } from 'lucide-react'

const NODES = [
  { icon: Zap, label: 'Fast Performance', angle: -45 },
  { icon: LayoutTemplate, label: 'Clean Design', angle: 45 },
  { icon: TrendingUp, label: 'Built to Convert', angle: 135 },
  { icon: BadgeCheck, label: 'SEO Optimised', angle: 225 },
]

const RADIUS = 116
const DURATION = 36

// A slow-orbiting ring of feature icons around a central core — the icons
// counter-rotate against the ring so they always stay upright.
export function OrbitVisual() {
  return (
    <div className="relative mx-auto flex h-80 w-80 max-w-full items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-dashed border-brand-green/25" />

      <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-ink-900 text-center shadow-xl shadow-black/10">
        <span className="text-base font-extrabold text-white">SEO</span>
        <span className="text-[9px] font-medium uppercase tracking-widest text-white/60">
          &amp; Websites
        </span>
      </div>

      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: DURATION, repeat: Infinity, ease: 'linear' }}
      >
        {NODES.map(({ icon: Icon, label, angle }) => {
          const rad = (angle * Math.PI) / 180
          const x = RADIUS * Math.cos(rad)
          const y = RADIUS * Math.sin(rad)
          return (
            <div
              key={label}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              <motion.div
                className="flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
                animate={{ rotate: -360 }}
                transition={{ duration: DURATION, repeat: Infinity, ease: 'linear' }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background shadow-md shadow-black/10">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <span className="w-16 text-center text-[10px] font-medium text-foreground">
                  {label}
                </span>
              </motion.div>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
