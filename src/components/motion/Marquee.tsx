'use client'

import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

type Props = {
  items: ReactNode[]
  direction?: 'forward' | 'reverse'
  /** Loop duration in seconds — lower is faster. */
  speed?: number
  pauseOnHover?: boolean
  className?: string
  itemClassName?: string
}

// Seamless horizontal loop: the track is rendered twice back-to-back and the
// animate-marquee keyframe (globals.css) translates exactly -50%, so the
// second copy lines up under the first with no visible seam. Plain CSS
// animation rather than Motion, so it needs its own explicit
// prefers-reduced-motion handling — MotionConfig's reducedMotion="user"
// doesn't reach outside motion.* components.
export function Marquee({
  items,
  direction = 'forward',
  speed = 32,
  pauseOnHover = true,
  className,
  itemClassName,
}: Props) {
  return (
    <div
      className={cn(
        'group relative flex w-full overflow-hidden',
        '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className,
      )}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1 || undefined}
          className={cn(
            'flex shrink-0 items-center gap-12 pr-12',
            direction === 'forward' ? 'animate-marquee' : 'animate-marquee-reverse',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            'motion-reduce:animate-none',
          )}
          style={{ animationDuration: `${speed}s` }}
        >
          {items.map((item, i) => (
            <div key={i} className={cn('shrink-0', itemClassName)}>
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
