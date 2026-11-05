import type { Variants } from 'motion/react'

// Shared ease curve + variants for any new motion.* component, standardized
// on the ease already used by Reveal.tsx/SplitHeading.tsx so new sections
// move at the same "speed" as the ones being reused as-is next to them.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_OUT } },
}

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE_OUT } },
}

export const staggerContainer = (stagger = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
})
