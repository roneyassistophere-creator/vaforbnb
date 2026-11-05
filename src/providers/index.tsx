'use client'

import { MotionConfig } from 'motion/react'
import React from 'react'

import { CustomCursor } from '@/components/motion/CustomCursor'
import { ScrollProgressBar } from '@/components/motion/ScrollProgressBar'
import { ScrollToTop } from '@/components/ScrollToTop'
import { SmoothScroll } from './SmoothScroll'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  // reducedMotion="user" makes every motion.* component in the app respect
  // the OS-level prefers-reduced-motion setting automatically. This does NOT
  // cover plain-CSS animations (Marquee) or structural/layout effects
  // (CustomCursor, the pinned-scroll sections) — those gate themselves.
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <SmoothScroll>
          <CustomCursor />
          <ScrollProgressBar />
          <ScrollToTop />
          {children}
        </SmoothScroll>
      </MotionConfig>
    </ThemeProvider>
  )
}
