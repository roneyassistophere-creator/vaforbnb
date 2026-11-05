'use client'

import { motion } from 'motion/react'

import { Reveal } from '@/components/motion/Reveal'
import { headingOnDark } from '@/utilities/typography'

const stack = [
  { cat: 'OTA Channels', items: ['Airbnb', 'Booking.com', 'VRBO', 'Expedia', 'Google Vacation Rentals'] },
  { cat: 'PMS Systems', items: ['Hostaway', 'Guesty', 'Hospitable', 'Uplisting', 'Beds24'] },
  { cat: 'Pricing & Data', items: ['PriceLabs', 'Wheelhouse', 'Beyond', 'AirDNA'] },
  { cat: 'Ops & Smart Tech', items: ['Minut', 'Operto', 'Turno / TurnoverBnB', 'Breezeway', 'Keycafe'] },
  { cat: 'Direct Booking', items: ['Next.js', 'Payload CMS', 'Stripe', 'Google Analytics 4'] },
]

export function ToolsSection() {
  return (
    <section className="border-t border-b border-border bg-muted py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <Reveal className="mb-20">
          <h2 className={headingOnDark}>Our Arsenal.</h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-5 md:gap-8">
          {stack.map((category) => (
            <div key={category.cat} className="flex flex-col">
              <h3 className="mb-6 border-b border-border pb-4 font-mono text-xs text-primary uppercase tracking-widest">
                {category.cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((tool) => (
                  <motion.div
                    key={tool}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: 'var(--brand-coral-bright)',
                      color: '#ffffff',
                      borderColor: 'var(--brand-coral-bright)',
                    }}
                    className="cursor-default rounded-full border border-border px-4 py-2 font-mono text-xs text-muted-foreground transition-colors md:text-sm"
                  >
                    {tool}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
