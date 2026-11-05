'use client'

import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'

type CursorState = 'default' | 'hover' | 'text' | 'view'

const LABEL: Record<CursorState, string | null> = {
  default: null,
  hover: null,
  text: null,
  view: 'VIEW',
}

// Replaces the native pointer with a dot + trailing ring that morphs based on
// the nearest ancestor's data-cursor attribute ("hover" | "text" | "view").
// Only ever mounts its listeners when the device actually has a fine pointer
// AND the visitor hasn't asked for reduced motion — nexus-studio's own
// reference implementation hides the native cursor unconditionally and
// globally (`* { cursor: none !important }`), which breaks touch devices and
// ignores prefers-reduced-motion entirely. This gates both, and toggles a
// class rather than touching every element directly.
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [state, setState] = useState<CursorState>('default')

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const dotSpring = useSpring(x, { stiffness: 500, damping: 40 })
  const dotSpringY = useSpring(y, { stiffness: 500, damping: 40 })
  const ringSpring = useSpring(x, { stiffness: 150, damping: 25 })
  const ringSpringY = useSpring(y, { stiffness: 150, damping: 25 })

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const evaluate = () => setEnabled(fine.matches && !reduced.matches)
    evaluate()
    fine.addEventListener('change', evaluate)
    reduced.addEventListener('change', evaluate)
    return () => {
      fine.removeEventListener('change', evaluate)
      reduced.removeEventListener('change', evaluate)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove('cursor-active')
      return
    }
    document.documentElement.classList.add('cursor-active')

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element)?.closest?.('[data-cursor]')
      const next = target?.getAttribute('data-cursor') as CursorState | null
      setState(next && next in LABEL ? next : 'default')
    }
    const onOut = (e: PointerEvent) => {
      const leavingCursorEl = (e.target as Element)?.closest?.('[data-cursor]')
      if (leavingCursorEl) setState('default')
    }

    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    return () => {
      document.documentElement.classList.remove('cursor-active')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const dotSize = state === 'hover' || state === 'view' ? 52 : state === 'text' ? 6 : 14
  const ringSize = state === 'hover' || state === 'view' ? 68 : state === 'text' ? 26 : 42

  return (
    <>
      {/* Brand Coral cursor center dot */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[999] flex items-center justify-center rounded-full bg-primary shadow-[0_0_14px_rgba(255,56,92,0.6)]"
        style={{
          x: dotSpring,
          y: dotSpringY,
          width: dotSize,
          height: state === 'text' ? 24 : dotSize,
          translateX: '-50%',
          translateY: '-50%',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      >
        {LABEL[state] && (
          <span className="text-[10px] font-bold tracking-wider text-white">
            {LABEL[state]}
          </span>
        )}
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[998] rounded-full border border-primary/50"
        style={{
          x: ringSpring,
          y: ringSpringY,
          width: ringSize,
          height: ringSize,
          translateX: '-50%',
          translateY: '-50%',
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 25 }}
      />
    </>
  )
}
