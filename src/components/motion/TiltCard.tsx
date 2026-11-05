'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** Max tilt in degrees. */
  strength?: number
  /** Lift the card toward the viewer on hover, in px. */
  lift?: number
}

// Wraps children in a card that tilts toward the cursor — the pointer position
// drives spring-smoothed rotateX/rotateY, giving a light 3D, glass-like feel
// without any WebGL/3D-model dependency.
export function TiltCard({ children, className, strength = 10, lift = 0 }: Props) {
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const spring = { stiffness: 300, damping: 30, mass: 0.6 }
  const rotateX = useSpring(useTransform(py, [0, 1], [strength, -strength]), spring)
  const rotateY = useSpring(useTransform(px, [0, 1], [-strength, strength]), spring)
  const z = useSpring(0, spring)

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }

  function handlePointerEnter() {
    z.set(lift)
  }

  function handlePointerLeave() {
    px.set(0.5)
    py.set(0.5)
    z.set(0)
  }

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, z, transformPerspective: 1000, transformStyle: 'preserve-3d' }}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </motion.div>
  )
}
