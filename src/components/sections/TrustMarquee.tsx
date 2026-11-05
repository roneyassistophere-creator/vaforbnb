import { Marquee } from '@/components/motion/Marquee'

const row1 = ['Guest Communication', 'Cleaning Coordination', 'Direct Booking Engine', 'Listing Optimisation']
const row2 = ['Guest Vetting', 'Dynamic Pricing', 'Systems Building', 'Multi-Platform Sync']

const itemClass =
  'font-display text-4xl md:text-5xl font-semibold text-white transition-colors duration-300 hover:text-brand-coral-bright'

export function TrustMarquee() {
  return (
    <section className="group relative overflow-hidden bg-brand-coral-deep py-24 pb-32">
      <div className="relative z-10 mx-auto mb-16 max-w-7xl px-6">
        <p className="text-center font-mono text-xs uppercase tracking-widest text-white/70">
          What we manage, end to end
        </p>
      </div>

      <div className="flex flex-col gap-12 transition-all sm:group-hover:[&>div>div]:paused">
        <Marquee
          items={row1.map((item) => (
            <span key={item} data-cursor="hover" className={itemClass}>
              {item}
            </span>
          ))}
          direction="forward"
          speed={25}
          pauseOnHover={false}
        />
        <Marquee
          items={row2.map((item) => (
            <span key={item} data-cursor="hover" className={itemClass}>
              {item}
            </span>
          ))}
          direction="reverse"
          speed={25}
          pauseOnHover={false}
        />
      </div>

      <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-32 bg-linear-to-r from-brand-coral-deep to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-32 bg-linear-to-l from-brand-coral-deep to-transparent" />
    </section>
  )
}
