'use client'

import type { LenisOptions } from 'lenis'
import { ReactLenis } from 'lenis/react'
import React from 'react'

// Site-wide smooth (inertia) scrolling. Lenis drives the real scroll position
// so scroll-linked animations (Hero parallax, ProcessTimeline pin, the progress
// bar) stay in sync. `respectReducedMotion` defaults to true, so it disables
// itself for visitors who ask for reduced motion.
const options: LenisOptions = {
  lerp: 0.09,
  smoothWheel: true,
  // Lenis's own #anchor click handling is off — same-page section links go
  // through <SmartLink> (src/components/SmartLink), which owns the smooth
  // scroll-to-section animation, URL sync, and the "next/link intercepts the
  // click" fix. Leaving `anchors` on here would fire a second, competing
  // scroll on the same click.
  anchors: false,
  // Drop inertia when a link starts a route change.
  stopInertiaOnNavigate: true,
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  )
}
