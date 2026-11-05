'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  /** Reveal along the x-axis instead of y — for left/right split sections. */
  x?: number
}

// Scroll-triggered fade + slide, used to bring sections in as they enter view.
export function Reveal({ children, className, delay = 0, y = 28, x = 0 }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
