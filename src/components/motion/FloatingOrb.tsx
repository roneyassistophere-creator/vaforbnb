'use client'

import { motion } from 'motion/react'

// Ambient, slow-drifting blurred blob used behind hero/CTA type for depth.
export function FloatingOrb({
  className,
  duration = 16,
}: {
  className?: string
  duration?: number
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      animate={{ y: [0, -28, 0], x: [0, 18, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
