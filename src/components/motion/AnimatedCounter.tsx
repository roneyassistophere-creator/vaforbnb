'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  end: number
  prefix?: string
  suffix?: string
  decimals?: number
  /** Count-up duration in seconds. */
  duration?: number
  className?: string
}

// Hand-rolled count-up using motion/react's own useInView + animate — no
// react-countup/react-intersection-observer needed, both are already covered
// by what's installed. Renders the final value immediately under reduced
// motion instead of counting up.
export function AnimatedCounter({
  end,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reducedMotion = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return

    if (reducedMotion) {
      setValue(end)
      return
    }

    const controls = animate(0, end, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setValue,
    })
    return () => controls.stop()
  }, [inView, end, duration, reducedMotion])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  )
}
