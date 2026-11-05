'use client'

import { motion, useMotionValue, useSpring } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'

// Wraps a button/link so it drifts slightly toward the cursor within its
// bounds, then springs back on leave — a subtle "magnetic" hover cue.
export function Magnetic({
  children,
  strength = 0.4,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness: 200, damping: 14, mass: 0.4 }
  const springX = useSpring(x, spring)
  const springY = useSpring(y, spring)

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * strength)
    y.set((e.clientY - rect.top - rect.height / 2) * strength)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  )
}
