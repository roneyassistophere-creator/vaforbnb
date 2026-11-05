import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import { Reveal } from '@/components/motion/Reveal'

const stats = [
  { end: 50, suffix: '+', label: 'Properties Supported' },
  { end: 100, suffix: '%', label: 'Inbox Response Rate' },
  { end: 7, suffix: '-Day', label: 'Operational Coverage' },
  { prefix: '£', end: 0, suffix: '', label: 'Direct Booking Commission' },
  { end: 94, suffix: '%', label: 'Cleaner Attendance Reliability' },
  { prefix: '<', end: 15, suffix: 'm', label: 'Typical Guest Reply Time' },
]

export function TrustSignals() {
  return (
    <section className="relative z-10 w-full border-y border-border bg-slate-50/80 py-24 text-foreground md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-2 gap-12 whitespace-nowrap md:grid-cols-3 md:gap-y-20">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1} className="flex flex-col items-start xl:items-center">
              <div className="font-display text-6xl font-bold tracking-tighter tabular-nums text-foreground md:text-8xl">
                <AnimatedCounter end={stat.end} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="mt-2 text-wrap font-mono text-xs font-semibold tracking-widest uppercase text-muted-foreground md:mt-4 md:text-sm">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
        <p className="mt-16 text-center text-xs text-muted-foreground">
          Real operations figures from our active UK host and serviced accommodation portfolio.
        </p>
      </div>
    </section>
  )
}
