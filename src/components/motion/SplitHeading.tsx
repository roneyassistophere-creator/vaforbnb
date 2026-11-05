'use client'

import { motion } from 'motion/react'
import clsx from 'clsx'

type Word = { text: string; accent?: boolean }

// Staggers a heading in word-by-word with a slight 3D flip-up, for a
// punchier reveal than a single fade/slide block. Defaults to h2 (its
// original usage, section headers below the page's one h1) — pass as="h1"
// for a hero headline so the page keeps a single, correct h1.
export function SplitHeading({
  words,
  className,
  delay = 0,
  as = 'h2',
}: {
  words: Word[]
  className?: string
  delay?: number
  as?: 'h1' | 'h2'
}) {
  const MotionTag = as === 'h1' ? motion.h1 : motion.h2

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          className={clsx('inline-block', w.accent && 'text-primary')}
          style={{ transformPerspective: 500, marginRight: '0.28em' }}
          variants={{
            hidden: { opacity: 0, y: 24, rotateX: -60 },
            visible: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              transition: { duration: 0.55, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {w.text}
        </motion.span>
      ))}
    </MotionTag>
  )
}
