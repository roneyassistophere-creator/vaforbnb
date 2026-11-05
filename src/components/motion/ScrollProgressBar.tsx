'use client'

import { motion, useScroll } from 'motion/react'

// Fixed 2px bar tracking whole-page scroll progress, fed straight from
// scrollYProgress — cheap and inert under reduced motion since it reflects
// position rather than animating spontaneously.
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[200] h-[2px] w-full origin-left bg-primary"
      style={{ scaleX: scrollYProgress }}
    />
  )
}
