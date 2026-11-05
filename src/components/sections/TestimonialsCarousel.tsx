'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Magnetic } from '@/components/motion/Magnetic'

const testimonials = [
  {
    quote:
      'Assist BNB completely freed my weekends. Cleaners turn up on time, guest inquiries are handled in minutes, and our occupancy is holding at 88%.',
    author: 'Property Operator',
    company: 'London Portfolio',
  },
  {
    quote:
      'Moving our 6 serviced apartments over to Assist BNB was the best decision we made. Direct bookings are up 35% and guest reviews are consistently 5 stars.',
    author: 'Host & Co-Founder',
    company: 'Manchester Stays',
  },
  {
    quote:
      'They do not just reply to messages — they handle contractor emergencies, cleaner schedules, and security deposit disputes seamlessly.',
    author: 'STR Owner',
    company: 'Birmingham Apartments',
  },
  {
    quote:
      'The dynamic pricing alone paid for their monthly fee three times over in our first month. We were drastically underpricing peak weekends.',
    author: 'Director',
    company: 'Cotswolds Retreats',
  },
  {
    quote:
      'A true operations partner. We scaled from 2 to 10 properties in six months without having to hire a single internal staff member.',
    author: 'Managing Director',
    company: 'Urban Living Group',
  },
]

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000)
    return () => clearInterval(id)
  }, [reducedMotion])

  const current = testimonials[index]
  const goTo = (i: number) => setIndex((i + testimonials.length) % testimonials.length)

  return (
    <section className="relative overflow-hidden bg-background py-32">
      <div className="relative mx-auto flex min-h-100 max-w-5xl flex-col justify-center px-6 md:px-12">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-4 -translate-y-12 font-display text-[15rem] leading-none text-primary/10 select-none md:text-[25rem]"
        >
          &ldquo;
        </span>

        <div className="relative z-10 mx-auto w-full text-center md:w-4/5" data-cursor="text">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <h3 className="mb-12 font-display text-3xl leading-tight text-foreground md:text-5xl lg:text-6xl">
                &ldquo;{current.quote}&rdquo;
              </h3>
              <p className="font-display text-lg font-medium text-primary">{current.author}</p>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {current.company}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-16 flex items-center justify-center gap-8">
            <Magnetic>
              <button
                onClick={() => goTo(index - 1)}
                aria-label="Previous testimonial"
                data-cursor="hover"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <ChevronLeft size={20} />
              </button>
            </Magnetic>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  data-cursor="hover"
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-8 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground'
                  }`}
                />
              ))}
            </div>

            <Magnetic>
              <button
                onClick={() => goTo(index + 1)}
                aria-label="Next testimonial"
                data-cursor="hover"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <ChevronRight size={20} />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  )
}
