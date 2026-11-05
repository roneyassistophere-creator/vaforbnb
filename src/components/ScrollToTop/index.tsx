'use client'

import { ArrowUp } from 'lucide-react'
import { useLenis } from 'lenis/react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import React, { useState } from 'react'

// Appears bottom-right once the visitor is a screenful or so down the page —
// the conventional, out-of-the-way spot.
export function ScrollToTop() {
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(false)
  const lenis = useLenis()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setVisible(y > 700)
  })

  // Jumps straight to the top instead of animating the ride up — same reason
  // as the nav's #anchor jumps (see SmoothScroll): an animated scroll from
  // deep in the page would scrub backwards through StorySection's and
  // ProcessTimeline's pinned card carousels on the way past, which looks
  // glitchy rather than smooth.
  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Scroll back to top"
          title="Back to top"
          data-cursor="hover"
          onClick={toTop}
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="scroll-top-btn fixed right-6 bottom-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/25 transition-colors hover:bg-primary/90 md:right-8 md:bottom-8"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
